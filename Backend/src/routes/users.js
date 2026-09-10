const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Valid operational roles for J A L Enterprises
const VALID_ROLES = ['admin', 'project_manager', 'site_supervisor', 'hr_manager', 'payroll_officer'];

// GET /api/users - List all users (excluding passwords)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        username,
        email,
        name,
        role,
        title,
        status,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// POST /api/users - Admin creates new user account
router.post('/', async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
      role = 'site_supervisor',
      title = '',
      status = 'Active'
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ error: 'Password must contain both letters and numbers' });
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Allowed roles: ${VALID_ROLES.join(', ')}` });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check unique username
    const [existingUsername] = await pool.query(
      'SELECT id FROM users WHERE username = ? LIMIT 1',
      [cleanUsername]
    );
    if (existingUsername && existingUsername.length > 0) {
      return res.status(400).json({ error: `Username "${cleanUsername}" is already in use` });
    }

    // Check unique email
    const [existingEmail] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );
    if (existingEmail && existingEmail.length > 0) {
      return res.status(400).json({ error: `Email "${cleanEmail}" is already registered` });
    }

    // Generate user ID
    const newId = `USR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    await pool.query(`
      INSERT INTO users (
        id, username, email, password, name, role, title, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newId,
      cleanUsername,
      cleanEmail,
      password,
      name.trim(),
      role,
      title.trim() || getDefaultTitleForRole(role),
      status
    ]);

    const [createdRows] = await pool.query(`
      SELECT id, username, email, name, role, title, status, created_at, updated_at
      FROM users
      WHERE id = ?
    `, [newId]);

    res.status(201).json(createdRows[0]);
  } catch (err) {
    console.error('Error creating user account:', err);
    res.status(500).json({ error: 'Failed to create user account' });
  }
});

// PUT /api/users/:id - Update user account
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, title, status, password } = req.body;

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const current = existing[0];
    const updatedName = name !== undefined ? name.trim() : current.name;
    const updatedEmail = email !== undefined ? email.trim().toLowerCase() : current.email;
    const updatedRole = role !== undefined ? role : current.role;
    const updatedTitle = title !== undefined ? title.trim() : current.title;
    const updatedStatus = status !== undefined ? status : current.status;
    const updatedPassword = (password && password.trim()) ? password.trim() : current.password;

    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // If email is changing, check uniqueness
    if (email && updatedEmail !== current.email) {
      const [duplicate] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1',
        [updatedEmail, id]
      );
      if (duplicate && duplicate.length > 0) {
        return res.status(400).json({ error: `Email "${updatedEmail}" is already taken` });
      }
    }

    await pool.query(`
      UPDATE users SET
        name = ?,
        email = ?,
        role = ?,
        title = ?,
        status = ?,
        password = ?
      WHERE id = ?
    `, [
      updatedName,
      updatedEmail,
      updatedRole,
      updatedTitle,
      updatedStatus,
      updatedPassword,
      id
    ]);

    const [updatedRows] = await pool.query(`
      SELECT id, username, email, name, role, title, status, created_at, updated_at
      FROM users
      WHERE id = ?
    `, [id]);

    res.json(updatedRows[0]);
  } catch (err) {
    console.error('Error updating user account:', err);
    res.status(500).json({ error: 'Failed to update user account' });
  }
});

// DELETE /api/users/:id - Delete user account
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const targetUser = userRows[0];

    // Prevent deleting the primary admin demo account
    if (targetUser.username === 'admin') {
      return res.status(400).json({ error: 'Cannot delete the primary System Administrator account.' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: `User "${targetUser.username}" removed successfully.` });
  } catch (err) {
    console.error('Error deleting user account:', err);
    res.status(500).json({ error: 'Failed to delete user account' });
  }
});

// PUT /api/users/:id/change-password - Change user password
router.put('/:id/change-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const user = userRows[0];

    // Verify current password if current user has an existing password in database
    if (user.password && currentPassword && user.password !== currentPassword.trim()) {
      return res.status(400).json({ error: 'Current password does not match our records' });
    }

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword.trim(), id]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing user password:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

function getDefaultTitleForRole(role) {
  switch (role) {
    case 'admin':
      return 'System Administrator';
    case 'project_manager':
      return 'Project Manager';
    case 'site_supervisor':
      return 'Site Supervisor';
    case 'hr_manager':
      return 'HR & Workforce Officer';
    case 'payroll_officer':
      return 'Payroll & Accounts Officer';
    default:
      return 'Operations Officer';
  }
}

module.exports = router;
