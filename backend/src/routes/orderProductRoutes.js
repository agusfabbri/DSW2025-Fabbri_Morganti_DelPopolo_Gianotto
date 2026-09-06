const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderProductController');
const authenticate = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

// Crear relación
router.post('/', authenticate, isAdmin, controller.create);

// Obtener todas las relaciones
router.get('/', authenticate, isAdmin, controller.getAll);

// Obtener una relación por IDs
router.get('/:orderId/:productId', authenticate, isAdmin, controller.getById);

// Actualizar cantidad y/o precio
router.put('/:orderId/:productId', authenticate, isAdmin, controller.update);

// Eliminar
router.delete('/:orderId/:productId', authenticate, isAdmin, controller.remove);

module.exports = router;

