const Stripe = require("stripe");
const { sequelize, Order, Product, OrderProduct } = require("../models");
require("dotenv").config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });


exports.createStripeCheckout = async (req, res) => {
  try {
    const { items = [] } = req.body;
    const userId = req.user?.id || req.body.userId || null;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Debes enviar items válidos" });
    }

    // Validar que cada item tenga productId válido
    for (const it of items) {
      if (!Number.isInteger(it.productId) || it.productId <= 0) {
        return res.status(400).json({ error: "Cada item debe incluir productId válido" });
      }
    }

    // Line items para Stripe (USD)
    const line_items = items.map((it) => {
      const amount = Number(it.unit_price);
      const qty = Number(it.quantity) || 1;
      if (!isFinite(amount) || amount <= 0) {
        throw new Error(`unit_price inválido para item: ${JSON.stringify(it)}`);
      }
      return {
        price_data: {
          currency: "usd",
          product_data: { name: it.title || "Producto" },
          unit_amount: Math.round(amount * 100), // centavos
        },
        quantity: qty,
      };
    });

    
    const compact = items.map((i) => ({
      productId: Number(i.productId),
      quantity: Number(i.quantity) || 1,
    }));

    const origin = process.env.FRONTEND_ORIGIN || "http://localhost:4200";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${origin}/compra-finalizada?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        userId: String(userId ?? ""),
        orderItems: JSON.stringify(compact), // [{productId, quantity}]
      },
    });

    return res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error(" Error creando sesión de Stripe:", err);
    res.status(500).json({ error: "No se pudo crear la sesión de pago" });
  }
};


exports.confirmStripeCheckout = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "Falta sessionId" });

    // 1) Recuperar sesión en Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      await t.rollback();
      return res.status(400).json({ error: "Pago no completado" });
    }

    // 2) Items desde metadata
    const userIdMeta = session.metadata?.userId ?? null;
    let itemsMeta = [];
    try {
      itemsMeta = JSON.parse(session.metadata?.orderItems || "[]"); // [{productId, quantity}]
    } catch {
      itemsMeta = [];
    }
    if (!Array.isArray(itemsMeta) || itemsMeta.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: "No hay items para la orden" });
    }

    // 3) Traer productos y validar que existan
    const productIds = itemsMeta.map((i) => Number(i.productId)).filter(Boolean);
    const products = await Product.findAll({ where: { id: productIds }, transaction: t });
    const foundIds = new Set(products.map((p) => Number(p.id)));
    const missing = productIds.filter((id) => !foundIds.has(id));
    if (missing.length) {
      await t.rollback();
      return res.status(400).json({ error: `Productos inexistentes: ${missing.join(", ")}` });
    }

    // 4) Calcular total y preparar líneas
    let totalAmount = 0;
    const orderLines = itemsMeta.map((i) => {
      const p = products.find((px) => Number(px.id) === Number(i.productId));
      const unit = Number(p.price);
      const qty = Number(i.quantity) || 1;
      totalAmount += unit * qty;
      return {
        productId: Number(i.productId),
        quantity: qty,
        price_at_purchase: unit,
      };
    });

    // 5) Crear orden
    const order = await Order.create(
      {
        userId: userIdMeta ? Number(userIdMeta) : null,
        totalAmount,
        status: "pendiente",
      },
      { transaction: t }
    );

    // 6) Crear renglones en order_products
    await Promise.all(
      orderLines.map((l) =>
        OrderProduct.create(
          {
            orderId: order.id,
            productId: l.productId,
            quantity: l.quantity,
            price_at_purchase: l.price_at_purchase,
          },
          { transaction: t }
        )
      )
    );

    await t.commit();
    return res.json({ ok: true, orderId: order.id });
  } catch (err) {
    await t.rollback();
    console.error(" Error confirmando pago:", err);
    res.status(500).json({ error: "No se pudo confirmar el pago" });
  }
};
