const validateCreateOrder = (req, res, next) => {
  const { items, totalAmount } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'El pedido debe tener al menos un producto.' });
  }

  for (const item of items) {
    if (!item.productId || isNaN(Number(item.productId))) {
      return res.status(400).json({ message: 'Cada item debe tener un productId numérico.' });
    }

    if (!item.quantity || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
      return res.status(400).json({ message: 'Cada item debe tener una quantity entera mayor a 0.' });
    }
  }

  if (totalAmount === undefined || isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
    return res.status(400).json({ message: 'El totalAmount es requerido y debe ser mayor a 0.' });
  }
  
  next();
};

module.exports = validateCreateOrder;
