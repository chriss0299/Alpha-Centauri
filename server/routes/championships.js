const express = require('express');
const router = express.Router();
const championshipController = require('../controllers/championshipController');
const authMiddleware = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

// Lista campionati (pubblica)
router.get('/', championshipController.getChampionships);

// Crea campionato (solo Admin/Editor)
router.post('/', authMiddleware.requireRole(['super_admin', 'editor']), rateLimiter.write, championshipController.createChampionship);

module.exports = router;
