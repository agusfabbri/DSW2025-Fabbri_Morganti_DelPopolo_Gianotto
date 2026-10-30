const Review = require('../models/review');

const isReviewOwner = async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }

    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tenés permiso para modificar esta reseña.' });
    }

    next();
  } catch (err) {
    console.error('Error en middleware isReviewOwner:', err);
    res.status(500).json({ error: 'Error al validar acceso a la reseña' });
  }
};

module.exports = isReviewOwner;
