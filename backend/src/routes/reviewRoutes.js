const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authenticate = require('../middlewares/authMiddleware');
const isReviewOwner = require('../middlewares/isReviewOwner');
const validateReview = require('../middlewares/validateReview');
const validateParamId = require('../middlewares/validateParamId');
const { validateParam } = require('../middlewares/validateParamId');

// Crear reseña (usuario autenticado)
router.post('/', authenticate, validateReview, reviewController.createReview);

// Actualizar reseña (dueño o admin)
router.put('/:id', authenticate, validateParamId, isReviewOwner, reviewController.updateReview);

// Borrar reseña (dueño o admin)
router.delete('/:id', authenticate, validateParamId, isReviewOwner, reviewController.deleteReview);

// Obtener reseñas (público)
router.get('/product/:productId', validateParam('productId'), reviewController.getReviewsByProduct);
router.get('/:id', validateParamId, reviewController.getReviewById);


module.exports = router;
