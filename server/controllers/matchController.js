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

const VALID_STATUSES = ['PROGRAMMATA', 'IN_CORSO', 'TERMINATA', 'CERTIFICATA'];

async function getMatches(req, res) {
  const { status, league_id, date, page = 1, limit = 20 } = req.query;

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(422).json({ errors: [`status non valido. Valori ammessi: ${VALID_STATUSES.join(', ')}`] });
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('m.status = ?');
    params.push(status);
  }
  if (league_id) {
    conditions.push('m.league_id = ?');
    params.push(league_id);
  }
  if (date) {
    conditions.push('DATE(m.scheduled_at) = ?');
    params.push(date);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM matches m ${where}`,
      params
    );

    const [rows] = await db.query(
      `SELECT
         m.id, m.status, m.scheduled_at, m.venue,
         ht.id AS home_id, ht.name AS home_name,
         at.id AS away_id, at.name AS away_name,
         c.id AS championship_id, c.name AS championship_name
       FROM matches m
       JOIN teams ht ON ht.id = m.home_team_id
       JOIN teams at ON at.id = m.away_team_id
       JOIN championships c ON c.id = m.league_id
       ${where}
       ORDER BY m.scheduled_at ASC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    return res.status(200).json({
      data: rows.map((m) => ({
        id: m.id,
        status: m.status,
        homeTeam: { id: m.home_id, name: m.home_name },
        awayTeam: { id: m.away_id, name: m.away_name },
        league: { id: m.championship_id, name: m.championship_name },
        scheduledAt: m.scheduled_at,
        venue: m.venue,
      })),
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (err) {
    console.error('getMatches error:', err);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

async function getMatchById(req, res) {
  const { matchId } = req.params;

  try {
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
      [matchId]
    );

    if (!match) {
      return res.status(404).json({ error: 'Partita non trovata' });
    }

    return res.status(200).json({
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
    console.error('getMatchById error:', err);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

const VALID_TRANSITIONS = {
  PROGRAMMATA: 'IN_CORSO',
  IN_CORSO: 'TERMINATA',
  TERMINATA: 'CERTIFICATA',
};

async function updateMatchStatus(req, res) {
  const { matchId } = req.params;
  const { new_status } = req.body;
  const updated_by = req.user.userId;

  if (!new_status) {
    return res.status(422).json({ errors: ['new_status obbligatorio'] });
  }

  try {
    const [[match]] = await db.query(
      'SELECT id, status, started_at FROM matches WHERE id = ?',
      [matchId]
    );

    if (!match) {
      return res.status(404).json({ error: 'Partita non trovata' });
    }

    if (match.status === new_status) {
      return res.status(422).json({ errors: [`La partita è già in stato ${new_status}`] });
    }

    const expectedNext = VALID_TRANSITIONS[match.status];
    if (!expectedNext || expectedNext !== new_status) {
      return res.status(422).json({
        errors: [`Transizione non valida: ${match.status} → ${new_status}. Transizione attesa: ${match.status} → ${expectedNext || 'nessuna'}`],
      });
    }

    const now = new Date();
    const updates = { status: new_status, updated_at: now };

    if (new_status === 'IN_CORSO') {
      updates.started_at = now;
    }

    await db.query(
      'UPDATE matches SET status = ?, updated_at = ?' + (new_status === 'IN_CORSO' ? ', started_at = ?' : '') + ' WHERE id = ?',
      new_status === 'IN_CORSO'
        ? [new_status, now, now, matchId]
        : [new_status, now, matchId]
    );

    if (new_status === 'CERTIFICATA') {
      await db.query(
        `INSERT INTO match_status_logs (match_id, from_status, to_status, changed_by, changed_at)
         VALUES (?, ?, ?, ?, ?)`,
        [matchId, match.status, new_status, updated_by, now]
      );
    }

    return res.status(200).json({
      id: matchId,
      status: new_status,
      startedAt: new_status === 'IN_CORSO' ? now : match.started_at,
      updatedBy: updated_by,
      updatedAt: now,
    });
  } catch (err) {
    console.error('updateMatchStatus error:', err);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

const VALID_EVENT_TYPES = [
  'meta', 'trasformazione', 'calcio_punizione', 'drop_goal', 'meta_punizione',
  'cartellino_giallo', 'cartellino_rosso', 'penalty_concesso',
  'inizio_primo_tempo', 'fine_primo_tempo', 'inizio_secondo_tempo',
  'fine_partita', 'sostituzione', 'infortunio',
];

async function addMatchEvent(req, res) {
  const { matchId } = req.params;
  const { event_type, minute, team_id, player_id, description } = req.body;
  const created_by = req.user.userId;
  const errors = [];

  if (!event_type) errors.push('event_type obbligatorio');
  else if (!VALID_EVENT_TYPES.includes(event_type)) errors.push(`event_type non valido. Valori ammessi: ${VALID_EVENT_TYPES.join(', ')}`);
  if (minute === undefined || minute === null) errors.push('minute obbligatorio');
  else if (!Number.isInteger(Number(minute)) || Number(minute) < 1) errors.push('minute deve essere un intero ≥ 1');
  if (!team_id) errors.push('team_id obbligatorio');

  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }

  try {
    const [[match]] = await db.query(
      'SELECT id, status, started_at FROM matches WHERE id = ?',
      [matchId]
    );

    if (!match) {
      return res.status(404).json({ error: 'Partita non trovata' });
    }

    if (match.status !== 'IN_CORSO') {
      return res.status(422).json({ errors: ['Gli eventi possono essere inseriti solo su partite IN_CORSO'] });
    }

    const elapsedSeconds = (Date.now() - new Date(match.started_at).getTime()) / 1000;
    if (elapsedSeconds < 60) {
      return res.status(422).json({ errors: ['Regola del minuto 1: attendere 60 secondi dall\'inizio prima di inserire eventi'] });
    }

    const id = crypto.randomUUID();
    const now = new Date();

    await db.query(
      `INSERT INTO match_events (id, match_id, event_type, minute, team_id, player_id, description, reliability, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'community', ?, ?)`,
      [id, matchId, event_type, Number(minute), team_id, player_id || null, description || null, created_by, now]
    );

    return res.status(201).json({
      id,
      matchId,
      eventType: event_type,
      minute: Number(minute),
      teamId: team_id,
      playerId: player_id || null,
      description: description || null,
      reliability: 'community',
      createdBy: created_by,
      createdAt: now,
    });
  } catch (err) {
    console.error('addMatchEvent error:', err);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

const VALID_RELIABILITY = ['community', 'confermato', 'verificato', 'certificato'];

async function getMatchEvents(req, res) {
  const { matchId } = req.params;
  const { event_type, reliability, page = 1, limit = 50 } = req.query;

  if (reliability && !VALID_RELIABILITY.includes(reliability)) {
    return res.status(422).json({ errors: [`reliability non valido. Valori ammessi: ${VALID_RELIABILITY.join(', ')}`] });
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
  const offset = (pageNum - 1) * limitNum;

  try {
    const [[match]] = await db.query('SELECT id FROM matches WHERE id = ?', [matchId]);
    if (!match) {
      return res.status(404).json({ error: 'Partita non trovata' });
    }

    const conditions = ['me.match_id = ?'];
    const params = [matchId];

    if (event_type) {
      conditions.push('me.event_type = ?');
      params.push(event_type);
    }
    if (reliability) {
      conditions.push('me.reliability = ?');
      params.push(reliability);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM match_events me ${where}`,
      params
    );

    const [rows] = await db.query(
      `SELECT
         me.id, me.event_type, me.minute, me.player_id, me.description,
         me.reliability, me.created_by, me.created_at,
         t.id AS team_id, t.name AS team_name
       FROM match_events me
       JOIN teams t ON t.id = me.team_id
       ${where}
       ORDER BY me.minute ASC, me.created_at ASC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    return res.status(200).json({
      data: rows.map((e) => ({
        id: e.id,
        eventType: e.event_type,
        minute: e.minute,
        team: { id: e.team_id, name: e.team_name },
        playerId: e.player_id,
        description: e.description,
        reliability: e.reliability,
        createdBy: e.created_by,
        createdAt: e.created_at,
      })),
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (err) {
    console.error('getMatchEvents error:', err);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

const CONFIRMABLE_STATUSES = ['IN_CORSO', 'TERMINATA'];
const CONSENSUS_THRESHOLD = 3;

async function confirmEvent(req, res) {
  const { matchId, eventId } = req.params;
  const user_id = req.user.userId;

  try {
    const [[match]] = await db.query('SELECT id, status FROM matches WHERE id = ?', [matchId]);
    if (!match) {
      return res.status(404).json({ error: 'Partita non trovata' });
    }

    if (!CONFIRMABLE_STATUSES.includes(match.status)) {
      return res.status(422).json({ errors: [`Le conferme sono possibili solo su partite IN_CORSO o TERMINATA`] });
    }

    const [[event]] = await db.query(
      'SELECT id, match_id, created_by, reliability FROM match_events WHERE id = ? AND match_id = ?',
      [eventId, matchId]
    );
    if (!event) {
      return res.status(404).json({ error: 'Evento non trovato' });
    }

    if (String(event.created_by) === String(user_id)) {
      return res.status(403).json({ error: 'Non puoi confermare un evento che hai inserito tu stesso' });
    }

    const [[existing]] = await db.query(
      'SELECT id FROM event_confirmations WHERE event_id = ? AND user_id = ?',
      [eventId, user_id]
    );
    if (existing) {
      return res.status(409).json({ error: 'Hai già confermato questo evento' });
    }

    await db.query(
      'INSERT INTO event_confirmations (event_id, user_id, confirmed_at) VALUES (?, ?, NOW())',
      [eventId, user_id]
    );

    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM event_confirmations WHERE event_id = ?',
      [eventId]
    );

    let reliability = event.reliability;
    if (total >= CONSENSUS_THRESHOLD && reliability === 'community') {
      reliability = 'confermato';
      await db.query(
        "UPDATE match_events SET reliability = 'confermato' WHERE id = ?",
        [eventId]
      );
    }

    return res.status(200).json({
      eventId,
      confirmations: total,
      reliability,
    });
  } catch (err) {
    console.error('confirmEvent error:', err);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

module.exports = {
  validateCreateMatch,
  createMatch,
  getMatches,
  getMatchById,
  updateMatchStatus,
  getMatchEvents,
  addMatchEvent,
  confirmEvent,
};
