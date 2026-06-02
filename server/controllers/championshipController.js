const db = require('../testdb/db');

const VALID_LEVELS = [
  'serie_a_elite', 'serie_a', 'serie_b', 'serie_c',
  'under_18', 'under_16', 'under_14', 'under_12', 'under_10', 'under_8', 'under_6',
  'regional', 'other',
];

async function getChampionships(req, res) {
  const { level, region, page = 1, limit = 20 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];

  if (level) {
    if (!VALID_LEVELS.includes(level)) {
      return res.status(422).json({ errors: [`level non valido. Valori ammessi: ${VALID_LEVELS.join(', ')}`] });
    }
    conditions.push('level = ?');
    params.push(level);
  }
  if (region) {
    conditions.push('region LIKE ?');
    params.push(`%${region}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM championships ${where}`,
      params
    );

    const [rows] = await db.query(
      `SELECT id, name, short_name, level, region
       FROM championships
       ${where}
       ORDER BY level ASC, name ASC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    return res.status(200).json({
      data: rows.map((c) => ({
        id: c.id,
        name: c.name,
        shortName: c.short_name,
        level: c.level,
        region: c.region,
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
  const { name, short_name, level, region } = req.body;
  const errors = [];

  if (!name) errors.push('name obbligatorio');
  if (!level) errors.push('level obbligatorio');
  else if (!VALID_LEVELS.includes(level)) {
    errors.push(`level non valido. Valori ammessi: ${VALID_LEVELS.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }

  try {
    const [[existing]] = await db.query(
      'SELECT id FROM championships WHERE name = ? AND level = ?',
      [name, level]
    );

    if (existing) {
      return res.status(409).json({ error: 'Campionato già esistente con questo nome e livello' });
    }

    const [result] = await db.query(
      `INSERT INTO championships (name, short_name, level, region)
       VALUES (?, ?, ?, ?)`,
      [name, short_name || null, level, region || null]
    );

    const id = result.insertId;

    const [[championship]] = await db.query(
      'SELECT id, name, short_name, level, region FROM championships WHERE id = ?',
      [id]
    );

    return res.status(201).json({
      id: championship.id,
      name: championship.name,
      shortName: championship.short_name,
      level: championship.level,
      region: championship.region,
    });
  } catch (err) {
    console.error('createChampionship error:', err);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

module.exports = { getChampionships, createChampionship };
