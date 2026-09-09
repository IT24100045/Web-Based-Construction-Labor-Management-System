const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { identifier, username, email, password } = req.body;
    const loginId = (identifier || username || email || '').trim();

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required' });
    }

    const [rows] = await pool.query(
      `SELECT id, username, email, password, name, role, title, status, created_at
       FROM users 
       WHERE (username = ? OR email = ?) 
       LIMIT 1`,
      [loginId, loginId]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }

    const user = rows[0];

    if (user.status && user.status !== 'Active') {
      return res.status(403).json({ error: 'Account is currently inactive or suspended. Contact Admin.' });
    }

    // Verify password
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }

    // Omit sensitive password from response
    const { password: _p, ...safeUser } = user;

    res.json({
      message: 'Login successful',
      user: safeUser
    });
  } catch (err) {
    console.error('[Auth Error]:', err);
    res.status(500).json({ error: 'Authentication failed due to server error' });
  }
});

module.exports = router;
