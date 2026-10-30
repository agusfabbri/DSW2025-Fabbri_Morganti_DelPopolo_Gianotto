const validateProduct = (req, res, next) => {
  const { name, price, stock, categoryId } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'El nombre del producto es requerido.' });
  }

  if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ error: 'El precio es requerido y debe ser un número mayor o igual a 0.' });
  }

  if (stock === undefined || stock === null || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
    return res.status(400).json({ error: 'El stock es requerido y debe ser un entero mayor o igual a 0.' });
  }

  if (!categoryId || isNaN(Number(categoryId))) {
    return res.status(400).json({ error: 'La categoría es requerida.' });
  }

  next();
};

module.exports = validateProduct;
