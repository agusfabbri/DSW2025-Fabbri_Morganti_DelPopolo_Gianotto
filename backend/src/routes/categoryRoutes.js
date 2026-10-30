const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

const authenticate = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const validateParamId = require('../middlewares/validateParamId');
const validateCategory = require('../middlewares/validateCategory');

// Obtener categorías (público)
router.get('/', categoryController.getAllCategories);
router.get('/:id', validateParamId, categoryController.getCategoryById);

// Rutas protegidas (solo admin)
router.post('/', authenticate, isAdmin, validateCategory, categoryController.createCategory);
router.put('/:id', authenticate, isAdmin, validateParamId, validateCategory, categoryController.updateCategory);
router.delete('/:id', authenticate, isAdmin, validateParamId, categoryController.deleteCategory);

module.exports = router;