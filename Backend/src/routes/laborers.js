const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET /api/laborers
router.get('/', async (req, res) => {
  try {
    const rows = await query(`
      SELECT 
        id,
        name,
        nic,
        phone,
        email,
        address,
        emergency_contact AS emergencyContact,
        role,
        skill_level AS skillLevel,
        hourly_rate AS hourlyRate,
        status,
        assigned_site_id AS assignedSiteId,
        join_date AS joinDate
      FROM laborers
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching laborers:', err);
    res.status(500).json({ error: 'Failed to fetch laborers' });
  }
});

// POST /api/laborers
router.post('/', async (req, res) => {
  try {
    const {
      name,
      nic,
      phone = '',
      email = '',
      address = '',
      emergencyContact = '',
      role,
      skillLevel = '',
      hourlyRate = 1200,
      status = 'Active',
      assignedSiteId = null,
      joinDate = new Date().toISOString().split('T')[0]
    } = req.body;

    if (!name || !nic || !role) {
      return res.status(400).json({ error: 'Name, NIC, and Job Role are required' });
    }

    // Generate unique ID e.g. LAB-101
    const [countResult] = await query('SELECT COUNT(*) as cnt FROM laborers');
    const newId = `LAB-${String(countResult.cnt + 101).padStart(3, '0')}`;

    await query(`
      INSERT INTO laborers (
        id, name, nic, phone, email, address, emergency_contact,
        role, skill_level, hourly_rate, status, assigned_site_id, join_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newId,
      name,
      nic,
      phone,
      email,
      address,
      emergencyContact,
      role,
      skillLevel,
      parseFloat(hourlyRate) || 1200.00,
      status,
      assignedSiteId || null,
      joinDate
    ]);

    const [created] = await query(`
      SELECT 
        id, name, nic, phone, email, address,
        emergency_contact AS emergencyContact,
        role, skill_level AS skillLevel,
        hourly_rate AS hourlyRate,
        status, assigned_site_id AS assignedSiteId,
        join_date AS joinDate
      FROM laborers WHERE id = ?
    `, [newId]);

    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating laborer:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A laborer with this NIC number already exists' });
    }
    res.status(500).json({ error: 'Failed to create laborer' });
  }
});

// PUT /api/laborers/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      nic,
      phone,
      email,
      address,
      emergencyContact,
      role,
      skillLevel,
      hourlyRate,
      status,
      assignedSiteId,
      joinDate
    } = req.body;

    const [existing] = await query('SELECT * FROM laborers WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Laborer not found' });
    }

    await query(`
      UPDATE laborers SET
        name = COALESCE(?, name),
        nic = COALESCE(?, nic),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        address = COALESCE(?, address),
        emergency_contact = COALESCE(?, emergency_contact),
        role = COALESCE(?, role),
        skill_level = COALESCE(?, skill_level),
        hourly_rate = COALESCE(?, hourly_rate),
        status = COALESCE(?, status),
        assigned_site_id = ?,
        join_date = COALESCE(?, join_date)
      WHERE id = ?
    `, [
      name !== undefined ? name : null,
      nic !== undefined ? nic : null,
      phone !== undefined ? phone : null,
      email !== undefined ? email : null,
      address !== undefined ? address : null,
      emergencyContact !== undefined ? emergencyContact : null,
      role !== undefined ? role : null,
      skillLevel !== undefined ? skillLevel : null,
      hourlyRate !== undefined ? parseFloat(hourlyRate) : null,
      status !== undefined ? status : null,
      assignedSiteId !== undefined ? (assignedSiteId || null) : existing.assigned_site_id,
      joinDate !== undefined ? joinDate : null,
      id
    ]);

    const [updated] = await query(`
      SELECT 
        id, name, nic, phone, email, address,
        emergency_contact AS emergencyContact,
        role, skill_level AS skillLevel,
        hourly_rate AS hourlyRate,
        status, assigned_site_id AS assignedSiteId,
        join_date AS joinDate
      FROM laborers WHERE id = ?
    `, [id]);

    res.json(updated);
  } catch (err) {
    console.error('Error updating laborer:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Another laborer with this NIC number already exists' });
    }
    res.status(500).json({ error: 'Failed to update laborer' });
  }
});

// DELETE /api/laborers/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await query('SELECT id, name FROM laborers WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Laborer not found' });
    }

    // Delete related attendance and payments
    await query('DELETE FROM attendance WHERE laborer_id = ?', [id]);
    await query('DELETE FROM payments WHERE laborer_id = ?', [id]);
    await query('DELETE FROM laborers WHERE id = ?', [id]);

    res.json({ message: `Laborer ${id} deleted successfully`, id });
  } catch (err) {
    console.error('Error deleting laborer:', err);
    res.status(500).json({ error: 'Failed to delete laborer' });
  }
});

module.exports = router;
