const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../testdb/db');

const REFRESH_TOKEN_EXPIRY_DAYS = 30;

function generateRefreshToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function storeRefreshToken(userId, token) {
  const hash = hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await pool.execute(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [userId, hash, expiresAt]
  );
}

async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if (rows.length > 0) {
      return res.status(409).json({ error: 'Email o username già in uso' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    const userId = result.insertId;
    const accessToken = jwt.sign(
      { userId, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = generateRefreshToken();
    await storeRefreshToken(userId, refreshToken);

    return res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: userId,
        username,
        email,
        role: 'user',
        level: 0,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const [rows] = await pool.execute(
      'SELECT id, username, email, password_hash, role, level FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = generateRefreshToken();
    await storeRefreshToken(user.id, refreshToken);

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        level: user.level,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

async function refresh(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { refreshToken } = req.body;

  try {
    const tokenHash = hashToken(refreshToken);

    const [rows] = await pool.execute(
      'SELECT id, user_id, expires_at FROM refresh_tokens WHERE token_hash = ?',
      [tokenHash]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Refresh token non valido' });
    }

    const record = rows[0];
    if (new Date(record.expires_at) < new Date()) {
      await pool.execute('DELETE FROM refresh_tokens WHERE id = ?', [record.id]);
      return res.status(401).json({ error: 'Refresh token scaduto' });
    }

    // Rotazione: cancella il vecchio, emette il nuovo
    await pool.execute('DELETE FROM refresh_tokens WHERE id = ?', [record.id]);

    const [userRows] = await pool.execute(
      'SELECT id, role FROM users WHERE id = ?',
      [record.user_id]
    );

    if (userRows.length === 0) {
      return res.status(401).json({ error: 'Refresh token non valido' });
    }

    const { id: userId, role } = userRows[0];

    const newAccessToken = jwt.sign(
      { userId, role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = generateRefreshToken();
    await storeRefreshToken(userId, newRefreshToken);

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

module.exports = { register, login, refresh };
