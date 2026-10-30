const validateCheckoutItems = (req, res, next) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Debes enviar items válidos.' });
  }

  for (const item of items) {
    if (!item.productId || isNaN(Number(item.productId))) {
      return res.status(400).json({ error: 'Cada item debe tener un productId numérico.' });
    }

    if (!item.quantity || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
      return res.status(400).json({ error: 'Cada item debe tener una quantity entera mayor a 0.' });
    }

    if (!item.title || typeof item.title !== 'string' || item.title.trim().length === 0) {
      return res.status(400).json({ error: 'Cada item debe tener un title válido.' });
    }

    if (item.unit_price === undefined || isNaN(Number(item.unit_price)) || Number(item.unit_price) <= 0) {
      return res.status(400).json({ error: 'Cada item debe tener un unit_price numérico mayor a 0.' });
    }
  }

  next();
};

module.exports = validateCheckoutItems;
