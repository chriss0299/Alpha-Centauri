const crypto = require('crypto');
const db = require('../testdb/db');

async function getTeams(req, res) {
  const { league_id, city, name, page = 1, limit = 20 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];

  if (league_id) {
    conditions.push('lt.league_id = ?');
    params.push(league_id);
  }
  if (city) {
    conditions.push('t.city LIKE ?');
    params.push(`%${city}%`);
  }
  if (name) {
    conditions.push('t.name LIKE ?');
    params.push(`%${name}%`);
  }

  const join = league_id ? 'JOIN league_teams lt ON lt.team_id = t.id' : 'LEFT JOIN league_teams lt ON lt.team_id = t.id';
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const [[{ total }]] = await db.query(
      `SELECT COUNT(DISTINCT t.id) AS total FROM teams t ${join} ${where}`,
      params
    );

    const [rows] = await db.query(
      `SELECT
         t.id, t.name, t.short_name, t.city, t.verified,
         c.id AS league_id, c.name AS league_name
       FROM teams t
       ${join}
       LEFT JOIN championships c ON c.id = lt.league_id
       ${where}
       GROUP BY t.id
       ORDER BY t.name ASC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    return res.status(200).json({
      data: rows.map((t) => ({
        id: t.id,
        name: t.name,
        shortName: t.short_name,
        city: t.city,
        league: t.league_id ? { id: t.league_id, name: t.league_name } : null,
        verified: Boolean(t.verified),
      })),
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (err) {
    console.error('getTeams error:', err);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

async function createTeam(req, res) {
  const { name, city, short_name, league_id, website } = req.body;
  const created_by = req.user.id;
  const errors = [];

  if (!name) errors.push('name obbligatorio');
  if (!city) errors.push('city obbligatorio');

  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }

  try {
    const [[existing]] = await db.query(
      'SELECT id FROM teams WHERE name = ? AND city = ?',
      [name, city]
    );

    if (existing) {
      return res.status(409).json({ error: 'Squadra già esistente con questo nome e città' });
    }

    const id = crypto.randomUUID();
    const now = new Date();

    await db.query(
      `INSERT INTO teams (id, name, short_name, city, website, verified, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, false, ?, ?)`,
      [id, name, short_name || null, city, website || null, created_by, now]
    );

    if (league_id) {
      await db.query(
        'INSERT INTO league_teams (league_id, team_id) VALUES (?, ?)',
        [league_id, id]
      );
    }

    const [[team]] = await db.query(
      `SELECT
         t.id, t.name, t.short_name, t.city, t.website, t.verified, t.created_by, t.created_at,
         c.id AS league_id, c.name AS league_name
       FROM teams t
       LEFT JOIN league_teams lt ON lt.team_id = t.id
       LEFT JOIN championships c ON c.id = lt.league_id
       WHERE t.id = ?`,
      [id]
    );

    return res.status(201).json({
      id: team.id,
      name: team.name,
      shortName: team.short_name,
      city: team.city,
      website: team.website,
      league: team.league_id ? { id: team.league_id, name: team.league_name } : null,
      verified: Boolean(team.verified),
      createdBy: team.created_by,
      createdAt: team.created_at,
    });
  } catch (err) {
    console.error('createTeam error:', err);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

module.exports = { getTeams, createTeam };
