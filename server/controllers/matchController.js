const crypto = require('crypto');
const db = require('../testdb/db');

async function validateCreateMatch(req, res, next) {
  const { home_team_id, away_team_id, league_id, scheduled_at } = req.body;
  const errors = [];

  if (!home_team_id) errors.push('home_team_id obbligatorio');
  if (!away_team_id) errors.push('away_team_id obbligatorio');
  if (!league_id) errors.push('league_id obbligatorio');
  if (!scheduled_at) errors.push('scheduled_at obbligatorio');

  if (home_team_id && away_team_id && home_team_id === away_team_id) {
    errors.push('home_team_id e away_team_id non possono essere uguali');
  }

  if (scheduled_at) {
    const date = new Date(scheduled_at);
    if (isNaN(date.getTime()) || date <= new Date()) {
      errors.push('scheduled_at deve essere una data ISO 8601 futura');
    }
  }

  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }

  next();
}

async function createMatch(req, res) {
  const { home_team_id, away_team_id, league_id, scheduled_at, venue } = req.body;
  const created_by = req.user.id;

  try {
    const [teamsInLeague] = await db.query(
      `SELECT t.id
       FROM teams t
       JOIN league_teams lt ON lt.team_id = t.id
       WHERE t.id IN (?, ?) AND lt.league_id = ?`,
      [home_team_id, away_team_id, league_id]
    );

    if (teamsInLeague.length < 2) {
      return res.status(422).json({
        errors: ['Una o entrambe le squadre non appartengono al campionato specificato'],
      });
    }

    const id = crypto.randomUUID();
    const now = new Date();

    await db.query(
      `INSERT INTO matches (id, home_team_id, away_team_id, league_id, scheduled_at, venue, status, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'PROGRAMMATA', ?, ?)`,
      [id, home_team_id, away_team_id, league_id, new Date(scheduled_at), venue || null, created_by, now]
    );

    const [[match]] = await db.query(
      `SELECT
         m.id, m.status, m.scheduled_at, m.venue, m.created_by, m.created_at,
         ht.id AS home_id, ht.name AS home_name,
         at.id AS away_id, at.name AS away_name,
         c.id AS championship_id, c.name AS championship_name
       FROM matches m
       JOIN teams ht ON ht.id = m.home_team_id
       JOIN teams at ON at.id = m.away_team_id
       JOIN championships c ON c.id = m.league_id
       WHERE m.id = ?`,
      [id]
    );

    return res.status(201).json({
      id: match.id,
      status: match.status,
      homeTeam: { id: match.home_id, name: match.home_name },
      awayTeam: { id: match.away_id, name: match.away_name },
      league: { id: match.championship_id, name: match.championship_name },
      scheduledAt: match.scheduled_at,
      venue: match.venue,
      createdBy: match.created_by,
      createdAt: match.created_at,
    });
  } catch (err) {
    console.error('createMatch error:', err);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

function getMatches(req, res) {
  res.status(501).json({ error: 'Not implemented' });
}

function getMatchById(req, res) {
  res.status(501).json({ error: 'Not implemented' });
}

function updateMatchStatus(req, res) {
  res.status(501).json({ error: 'Not implemented' });
}

function addMatchEvent(req, res) {
  res.status(501).json({ error: 'Not implemented' });
}

function confirmEvent(req, res) {
  res.status(501).json({ error: 'Not implemented' });
}

module.exports = {
  validateCreateMatch,
  createMatch,
  getMatches,
  getMatchById,
  updateMatchStatus,
  addMatchEvent,
  confirmEvent,
};
