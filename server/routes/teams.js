const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

// Lista squadre (pubblica)
router.get('/', teamController.getTeams);

// Crea squadra (utenti autenticati)
router.post('/', authMiddleware.requireAuth, rateLimiter.write, teamController.createTeam);

module.exports = router;
