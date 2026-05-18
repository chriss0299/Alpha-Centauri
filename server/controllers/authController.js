const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../testdb/db');

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

    const token = jwt.sign(
      { userId: result.insertId, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: result.insertId,
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

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
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

module.exports = { register, login };
