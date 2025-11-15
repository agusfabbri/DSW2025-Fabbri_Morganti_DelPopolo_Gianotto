const express = require("express");
const router = express.Router();
const {
  createStripeCheckout,
  confirmStripeCheckout,
} = require("../controllers/checkoutController");

const authenticate = require("../middlewares/authMiddleware");

// Crear sesión de pago (Stripe)
router.post("/", authenticate, createStripeCheckout);

// Confirmar pago y crear la orden en BD
router.post("/confirm", authenticate, confirmStripeCheckout);

module.exports = router;
