const db = require('../testdb/db');

async function getTeams(req, res) {
  const { championship_season_id, city, name, page = 1, limit = 20 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];

  if (championship_season_id) {
    conditions.push('cst.championship_season_id = ?');
    params.push(championship_season_id);
  }
  if (city) {
    conditions.push('t.city LIKE ?');
    params.push(`%${city}%`);
  }
  if (name) {
    conditions.push('t.name LIKE ?');
    params.push(`%${name}%`);
  }

  const join = championship_season_id
    ? 'JOIN championship_season_teams cst ON cst.team_id = t.id'
    : '';
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const [[{ total }]] = await db.query(
      `SELECT COUNT(DISTINCT t.id) AS total FROM teams t ${join} ${where}`,
      params
    );

    const [rows] = await db.query(
      `SELECT DISTINCT
         t.id, t.name, t.short_name, t.city, t.region, t.logo_url, t.is_verified
       FROM teams t
       ${join}
       ${where}
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
        region: t.region,
        logoUrl: t.logo_url,
        isVerified: Boolean(t.is_verified),
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
  const { name, city, short_name, region, logo_url } = req.body;
  const errors = [];

  if (!name) errors.push('name obbligatorio');
  if (!city) errors.push('city obbligatorio');
  if (!short_name) errors.push('short_name obbligatorio');

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

    const [result] = await db.query(
      `INSERT INTO teams (name, short_name, city, region, logo_url)
       VALUES (?, ?, ?, ?, ?)`,
      [name, short_name, city, region || null, logo_url || null]
    );

    const id = result.insertId;

    const [[team]] = await db.query(
      'SELECT id, name, short_name, city, region, logo_url, is_verified FROM teams WHERE id = ?',
      [id]
    );

    return res.status(201).json({
      id: team.id,
      name: team.name,
      shortName: team.short_name,
      city: team.city,
      region: team.region,
      logoUrl: team.logo_url,
      isVerified: Boolean(team.is_verified),
    });
  } catch (err) {
    console.error('createTeam error:', err);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

module.exports = { getTeams, createTeam };
