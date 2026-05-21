const crypto = require('crypto');
const db = require('../testdb/db');

async function getChampionships(req, res) {
  const { season, category, page = 1, limit = 20 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];

  if (season) {
    conditions.push('season = ?');
    params.push(season);
  }
  if (category) {
    conditions.push('category LIKE ?');
    params.push(`%${category}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM championships ${where}`,
      params
    );

    const [rows] = await db.query(
      `SELECT id, name, season, category, region, description
       FROM championships
       ${where}
       ORDER BY season DESC, name ASC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    return res.status(200).json({
      data: rows.map((c) => ({
        id: c.id,
        name: c.name,
        season: c.season,
        category: c.category,
        region: c.region,
        description: c.description,
      })),
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (err) {
    console.error('getChampionships error:', err);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

async function createChampionship(req, res) {
  const { name, season, category, region, description } = req.body;
  const created_by = req.user.id;
  const errors = [];

  if (!name) errors.push('name obbligatorio');
  if (!season) errors.push('season obbligatorio');
  if (!category) errors.push('category obbligatorio');

  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }

  try {
    const [[existing]] = await db.query(
      'SELECT id FROM championships WHERE name = ? AND season = ?',
      [name, season]
    );

    if (existing) {
      return res.status(409).json({ error: 'Campionato già esistente con questo nome e stagione' });
    }

    const id = crypto.randomUUID();
    const now = new Date();

    await db.query(
      `INSERT INTO championships (id, name, season, category, region, description, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, season, category, region || null, description || null, created_by, now]
    );

    const [[championship]] = await db.query(
      'SELECT id, name, season, category, region, description, created_by, created_at FROM championships WHERE id = ?',
      [id]
    );

    return res.status(201).json({
      id: championship.id,
      name: championship.name,
      season: championship.season,
      category: championship.category,
      region: championship.region,
      description: championship.description,
      createdBy: championship.created_by,
      createdAt: championship.created_at,
    });
  } catch (err) {
    console.error('createChampionship error:', err);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

module.exports = { getChampionships, createChampionship };
