const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Profilo utente (pubblico, auth opzionale per dati extra)
router.get('/:id', userController.getUserById);

// Aggiorna profilo (solo proprietario o admin)
router.patch('/:id', authMiddleware.requireAuth, userController.updateUser);

module.exports = router;
