const db = require('../testdb/db');

function isMinorWithoutConsent(user) {
  if (!user.date_of_birth) return false;
  const age = (Date.now() - new Date(user.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return age < 18 && !user.parental_consent;
}

function isOwnerOrAdmin(req, userId) {
  return req.user && (String(req.user.userId) === String(userId) || req.user.role === 'super_admin');
}

async function getUserById(req, res) {
  const { id } = req.params;

  try {
    const [[user]] = await db.query(
      `SELECT id, username, email, role, level, date_of_birth, parental_consent, created_at
       FROM users WHERE id = ?`,
      [id]
    );

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    const privileged = isOwnerOrAdmin(req, id);

    const profile = {
      id: user.id,
      username: user.username,
      role: user.role,
      level: user.level,
      createdAt: user.created_at,
    };

    if (privileged) {
      profile.email = user.email;
    }

    if (!isMinorWithoutConsent(user)) {
      // full_name esposed only when not a minor without consent — field added when available
    }

    return res.status(200).json(profile);
  } catch (err) {
    console.error('getUserById error:', err);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

async function updateUser(req, res) {
  const { id } = req.params;
  const { username, email } = req.body;

  if (!username && !email) {
    return res.status(422).json({ errors: ['Almeno un campo tra username ed email è obbligatorio'] });
  }

  if (!isOwnerOrAdmin(req, id)) {
    return res.status(403).json({ error: 'Permessi insufficienti' });
  }

  try {
    const [[user]] = await db.query('SELECT id FROM users WHERE id = ?', [id]);

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    if (username) {
      const [[conflict]] = await db.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, id]
      );
      if (conflict) {
        return res.status(409).json({ error: 'Username già in uso' });
      }
    }

    if (email) {
      const [[conflict]] = await db.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      if (conflict) {
        return res.status(409).json({ error: 'Email già in uso' });
      }
    }

    const fields = [];
    const params = [];
    if (username) { fields.push('username = ?'); params.push(username); }
    if (email) { fields.push('email = ?'); params.push(email); }
    params.push(id);

    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

    const [[updated]] = await db.query(
      'SELECT id, username, email, role, level, created_at FROM users WHERE id = ?',
      [id]
    );

    return res.status(200).json({
      id: updated.id,
      username: updated.username,
      email: updated.email,
      role: updated.role,
      level: updated.level,
      createdAt: updated.created_at,
    });
  } catch (err) {
    console.error('updateUser error:', err);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

module.exports = { getUserById, updateUser };
