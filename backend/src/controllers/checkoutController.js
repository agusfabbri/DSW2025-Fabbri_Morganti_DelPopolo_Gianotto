const Stripe = require("stripe");
const { sequelize, Order, Product, OrderProduct } = require("../models");
const { validateOrderProducts } = require("../services/orderService");
require("dotenv").config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });


// ====================================================================
// 1) CREAR SESIÓN DE STRIPE — VALIDACIÓN DE PRODUCTOS + STOCK
// ====================================================================
exports.createStripeCheckout = async (req, res) => {
  try {
    const { items = [] } = req.body;
    const userId = req.user?.id || req.body.userId || null;

    let productosDB;
    try {
      productosDB = await validateOrderProducts(items);
    } catch (err) {
      return res.status(err.status || 400).json({ error: err.message });
    }

    // Line items Stripe
    const line_items = items.map(it => ({
      price_data: {
        currency: "usd",
        product_data: { name: it.title || "Producto" },
        unit_amount: Math.round(Number(it.unit_price) * 100),
      },
      quantity: Number(it.quantity),
    }));

    const compact = items.map(i => ({
      productId: Number(i.productId),
      quantity: Number(i.quantity),
    }));

    const originRaw = process.env.FRONTEND_ORIGIN || "http://localhost:4200";
    let origin = originRaw;
    // Detectar valores inválidos que podrían venir de una configuración como '*' o cadenas con encoding
    if (originRaw === '*' || originRaw.includes('*') || originRaw.includes('%')) {
      console.warn('WARN: FRONTEND_ORIGIN está configurado como "*" o contiene caracteres inválidos. Usando fallback http://localhost:4200. Por favor, configura FRONTEND_ORIGIN correctamente en producción.');
      origin = 'http://localhost:4200';
    } else {
      // Asegurar que origin incluya el esquema (http:// o https://) requerido por Stripe
      if (!/^https?:\/\//i.test(origin)) {
        origin = `https://${origin}`;
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${origin}/compra-finalizada?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        userId: userId ? String(userId) : "null",
        orderItems: JSON.stringify(compact),
      },
    });

    return res.json({ url: session.url, sessionId: session.id });

  } catch (err) {
    console.error(" Error creando sesión de Stripe:", err);
    res.status(500).json({ error: "No se pudo crear la sesión de pago" });
  }
};



// ====================================================================
// 2) CONFIRMAR PAGO — VERSION ARREGLADA CON userId SEGURO
// ====================================================================
exports.confirmStripeCheckout = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "Falta sessionId" });

    // Obtener sesión Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verificar pago correcto
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
    if (paymentIntent.status !== "succeeded") {
      await t.rollback();
      return res.status(400).json({ error: "Pago aún no procesado por Stripe" });
    }

    // Obtener items desde metadata
    let itemsMeta = [];
    try {
      itemsMeta = JSON.parse(session.metadata?.orderItems || "[]");
    } catch {}

    if (!Array.isArray(itemsMeta) || itemsMeta.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: "No hay items para la orden" });
    }

    let products;
    try {
      products = await validateOrderProducts(itemsMeta, t);
    } catch (err) {
      await t.rollback();
      return res.status(err.status || 400).json({ error: err.message });
    }

    // Calcular total
    let totalAmount = 0;
    const orderLines = itemsMeta.map(i => {
      const p = products.find(px => Number(px.id) === Number(i.productId));
      const unit = Number(p.price);
      const qty = Number(i.quantity);

      totalAmount += unit * qty;

      return {
        productId: p.id,
        quantity: qty,
        price_at_purchase: unit,
      };
    });

    // ==============================================
    // FIX DE userId (ANTES SE PONÍA 0 Y ROMPÍA TODO)
    // ==============================================
    let userId = session.metadata?.userId;

    if (!userId || userId === "null" || userId === "undefined" || userId.trim() === "") {
      userId = null;
    } else {
      userId = Number(userId);
      if (isNaN(userId)) userId = null;
    }

    // Crear orden
    const order = await Order.create(
      {
        userId, // <--- AHORA NUNCA ES 0
        totalAmount,
        status: "pendiente",
      },
      { transaction: t }
    );

    // Crear OrderProduct
    for (const l of orderLines) {
      await OrderProduct.create(
        {
          orderId: order.id,
          productId: l.productId,
          quantity: l.quantity,
          price_at_purchase: l.price_at_purchase,
        },
        { transaction: t }
      );
    }

    // Restar stock
    for (const item of itemsMeta) {
      const prod = products.find(p => Number(p.id) === Number(item.productId));
      await prod.update(
        { stock: prod.stock - item.quantity },
        { transaction: t }
      );
    }

    await t.commit();
    return res.json({ ok: true, orderId: order.id });

  } catch (err) {
    await t.rollback();
    console.error(" Error confirmando pago:", err);
    res.status(500).json({ error: "No se pudo confirmar el pago" });
  }
};
