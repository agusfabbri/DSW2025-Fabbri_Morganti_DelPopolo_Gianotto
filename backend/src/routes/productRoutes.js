const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

const authenticate = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const validateParamId = require('../middlewares/validateParamId');
const validateProduct = require('../middlewares/validateProduct');
const validateQueryIds = require('../middlewares/validateQueryIds');
const { validateParam } = require('../middlewares/validateParamId');


// RUTAS PÚBLICAS

router.get('/top-selling', productController.getTopSellingProducts);
router.get('/', productController.getAllProducts);
router.get('/category/:categoryId', validateParam('categoryId'), productController.getProductsByCategory);

// ❗ ESTA debe ir antes que "/:id"
router.get('/by-ids', validateQueryIds, productController.getProductsByIds);

router.get('/:id', validateParamId, productController.getProductById);


// RUTAS SOLO ADMIN

// Nueva ruta: obtener TODOS los productos (activos e inactivos)
router.get('/admin/all', authenticate, isAdmin, productController.getAllProductsAdmin);

router.post('/', authenticate, isAdmin, validateProduct, productController.createProduct);
router.put('/:id', authenticate, isAdmin, validateParamId, validateProduct, productController.updateProduct);

// Desactivar producto (ya no se elimina)
router.put('/:id/disable', authenticate, isAdmin, validateParamId, productController.deleteProduct);

// Activar producto
router.put('/:id/enable', authenticate, isAdmin, validateParamId, productController.activateProduct);


module.exports = router;
