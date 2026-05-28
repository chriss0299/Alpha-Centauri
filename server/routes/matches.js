const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const authMiddleware = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

// Recupera lista partite (pubblica)
router.get('/', matchController.getMatches);

// Dettaglio singola partita
router.get('/:matchId', matchController.getMatchById);

// Crea partita (solo Admin/Editor)
router.post('/', authMiddleware.requireRole(['super_admin', 'editor']), matchController.validateCreateMatch, matchController.createMatch);

// Aggiorna stato partita (PROGRAMMATA → IN_CORSO → TERMINATA → CERTIFICATA)
router.patch('/:matchId/status', authMiddleware.requireRole(['admin', 'editor', 'arbitro']), matchController.updateMatchStatus);

// Lista eventi feed (pubblica)
router.get('/:matchId/events', matchController.getMatchEvents);

// Aggiunge evento live (utenti autenticati, dopo il minuto 1)
router.post('/:matchId/events', authMiddleware.requireAuth, rateLimiter.write, matchController.addMatchEvent);

// Conferma evento community (contribuisce al consensus ≥3)
router.post('/:matchId/events/:eventId/confirm', authMiddleware.requireAuth, rateLimiter.write, matchController.confirmEvent);

module.exports = router;
