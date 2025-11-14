const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

const authenticate = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');


// RUTAS PÚBLICAS

router.get('/top-selling', productController.getTopSellingProducts);
router.get('/', productController.getAllProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);

// ❗ ESTA debe ir antes que "/:id"
router.get('/by-ids', productController.getProductsByIds);

router.get('/:id', productController.getProductById);


// RUTAS SOLO ADMIN

// Nueva ruta: obtener TODOS los productos (activos e inactivos)
router.get('/admin/all', authenticate, isAdmin, productController.getAllProductsAdmin);

router.post('/', authenticate, isAdmin, productController.createProduct);
router.put('/:id', authenticate, isAdmin, productController.updateProduct);

// Desactivar producto (ya no se elimina)
router.put('/:id/disable', authenticate, isAdmin, productController.deleteProduct);

// Activar producto
router.put('/:id/enable', authenticate, isAdmin, productController.activateProduct);


module.exports = router;
