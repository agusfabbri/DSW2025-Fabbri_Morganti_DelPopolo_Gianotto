const express = require("express");
const router = express.Router();
const {
  createStripeCheckout,
  confirmStripeCheckout,
} = require("../controllers/checkoutController");

const authenticate = require("../middlewares/authMiddleware");
const validateCheckoutItems = require("../middlewares/validateCheckoutItems");

// Crear sesión de pago (Stripe)
router.post("/", authenticate, validateCheckoutItems, createStripeCheckout);

// Confirmar pago y crear la orden en BD
router.post("/confirm", authenticate, confirmStripeCheckout);

module.exports = router;

