const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticate = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const canAccessOrder = require('../middlewares/canAccessOrder');
const validateCreateOrder = require('../middlewares/validateCreateOrder');
const validateUpdateOrder = require('../middlewares/validateUpdateOrder');
const validateParamId = require('../middlewares/validateParamId');


// Productos mas vendidos
router.get('/productos-mas-vendidos', orderController.getTopSellingProducts);



// Obtener todos los pedidos (solo admin)
router.get('/',authenticate, isAdmin, orderController.getAllOrders);

// Obtener pedidos del usuario 
router.get('/my-orders', authenticate, orderController.getUserOrders);

// Obtener pedido por ID (usuario dueño o admin)
router.get('/:id', authenticate, validateParamId, canAccessOrder, orderController.getOrderById);

// Crear pedido (usuario autenticado)
router.post('/', authenticate, validateCreateOrder, orderController.createOrder);

// Actualizar estado del pedido (solo admin)
router.put('/:id', authenticate, validateParamId, isAdmin, validateUpdateOrder, orderController.updateOrder);

// Borrar pedido (solo admin)
router.delete('/:id', authenticate, validateParamId, isAdmin, orderController.deleteOrder);




module.exports = router;
