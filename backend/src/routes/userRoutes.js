const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middlewares/authMiddleware');

const isAdmin = require('../middlewares/isAdmin');
const isOwnerOrAdmin = require('../middlewares/isOwnerOrAdmin');
const validateParamId = require('../middlewares/validateParamId');
const validateRegister = require('../middlewares/validateRegister');
const validateLogin = require('../middlewares/validateLogin');
const validateUpdateUser = require('../middlewares/validateUpdateUser');
const verifyRecaptcha = require('../middlewares/verifyRecaptcha');

// Registro y login (público)
router.post('/register', validateRegister, userController.registerUser);
router.post('/login', validateLogin, verifyRecaptcha, userController.loginUser);

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, validateUpdateUser, userController.updateProfile);

// Perfil usuario (dueño o admin)
router.put('/:id', authenticate, validateParamId, isOwnerOrAdmin, validateUpdateUser, userController.updateUser);
router.delete('/:id', authenticate, validateParamId, isOwnerOrAdmin, userController.deleteUser);

// Obtener usuarios (solo admin)
router.get('/', authenticate, isAdmin, userController.getAllUsers);
router.get('/:id', authenticate, validateParamId, isAdmin, userController.getUserById);



module.exports = router;








module.exports = router;
