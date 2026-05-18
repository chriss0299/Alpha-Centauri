const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const rateLimiter = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');

router.post(
  '/register',
  rateLimiter.write,
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username: 3-30 caratteri alfanumerici o underscore'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email non valida'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password: minimo 8 caratteri'),
  ],
  authController.register
);

module.exports = router;
