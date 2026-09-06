const validateReview = (req, res, next) => {
  const { productId, rating } = req.body;

  if (!productId || isNaN(Number(productId))) {
    return res.status(400).json({ error: 'productId es requerido y debe ser un número.' });
  }

  if (rating === undefined || rating === null) {
    return res.status(400).json({ error: 'rating es requerido.' });
  }

  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    return res.status(400).json({ error: 'rating debe ser un entero entre 1 y 5.' });
  }

  next();
};

module.exports = validateReview;
