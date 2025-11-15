const Stripe = require("stripe");
const { sequelize, Order, Product, OrderProduct } = require("../models");
require("dotenv").config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });


// ====================================================================
// 1) CREAR SESIÓN DE STRIPE — VALIDACIÓN DE PRODUCTOS + STOCK
// ====================================================================
exports.createStripeCheckout = async (req, res) => {
  try {
    const { items = [] } = req.body;
    const userId = req.user?.id || req.body.userId || null;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Debes enviar items válidos" });
    }

    // Obtener productos de la BD
    const productIds = items.map(i => Number(i.productId));
    const productosDB = await Product.findAll({ where: { id: productIds } });

    // Validaciones por producto
    for (const item of items) {
      const prod = productosDB.find(p => p.id === item.productId);

      if (!prod) {
        return res.status(400).json({ error: `Producto con ID ${item.productId} no existe.` });
      }

      if (!prod.active) {
        return res.status(400).json({
          error: `El producto "${prod.name}" fue desactivado y no puede comprarse.`
        });
      }

      if (prod.stock < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para "${prod.name}". Stock actual: ${prod.stock}`
        });
      }
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

    const origin = process.env.FRONTEND_ORIGIN || "http://localhost:4200";

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

    const productIds = itemsMeta.map(i => Number(i.productId));
    const products = await Product.findAll({ where: { id: productIds }, transaction: t });

    const foundIds = new Set(products.map(p => Number(p.id)));
    const missing = productIds.filter(id => !foundIds.has(id));
    if (missing.length) {
      await t.rollback();
      return res.status(400).json({ error: `Productos inexistentes: ${missing.join(", ")}` });
    }

    // Validaciones
    for (const item of itemsMeta) {
      const prod = products.find(p => Number(p.id) === Number(item.productId));

      if (!prod.active) {
        await t.rollback();
        return res.status(400).json({ error: `El producto "${prod.name}" fue desactivado.` });
      }

      if (prod.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ error: `"${prod.name}" no tiene suficiente stock.` });
      }
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
