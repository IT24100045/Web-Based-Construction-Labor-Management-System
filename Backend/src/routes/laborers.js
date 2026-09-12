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

// GET /api/laborers/next-id
router.get('/next-id', async (req, res) => {
  try {
    const allLaborers = await query('SELECT id FROM laborers');
    let maxNum = 0;
    for (const row of allLaborers) {
      const match = (row.id || '').match(/^EMP-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    const nextId = `EMP-${String(maxNum + 1).padStart(3, '0')}`;
    res.json({ nextId });
  } catch (err) {
    console.error('Error getting next laborer ID:', err);
    res.status(500).json({ error: 'Failed to get next ID' });
  }
});

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// POST /api/laborers
router.post('/', async (req, res) => {
  try {
    const {
      name,
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

    const trimmedName = (name || '').trim();
    const trimmedPhone = (phone || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedEmergency = (emergencyContact || '').trim();
    const parsedRate = parseFloat(hourlyRate);

    // Validation rules
    if (!trimmedName || trimmedName.length < 3) {
      return res.status(400).json({ error: 'Full name is required and must be at least 3 characters long.' });
    }

    const phoneDigits = trimmedPhone.replace(/[^0-9]/g, '');
    if (!trimmedPhone || phoneDigits.length < 9 || phoneDigits.length > 12) {
      return res.status(400).json({ error: 'Contact phone number must contain between 9 and 12 digits.' });
    }

    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Invalid email address format.' });
    }

    if (!role || !role.trim()) {
      return res.status(400).json({ error: 'Job role / trade is required.' });
    }

    if (isNaN(parsedRate) || parsedRate < 200 || parsedRate > 50000) {
      return res.status(400).json({ error: 'Hourly wage rate must be a valid number between Rs. 200 and Rs. 50,000.' });
    }

    if (!trimmedEmergency || trimmedEmergency.length < 5) {
      return res.status(400).json({ error: 'Emergency contact details are required for occupational safety compliance.' });
    }

    // Auto-generate unique EMP-XXX ID (e.g. EMP-001, EMP-002...)
    const allLaborers = await query('SELECT id FROM laborers');
    let maxNum = 0;
    for (const row of allLaborers) {
      const match = (row.id || '').match(/^EMP-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    const newId = `EMP-${String(maxNum + 1).padStart(3, '0')}`;

    await query(`
      INSERT INTO laborers (
        id, name, nic, phone, email, address, emergency_contact,
        role, skill_level, hourly_rate, status, assigned_site_id, join_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newId,
      trimmedName,
      newId, // Store EMP ID in nic column for backwards compatibility
      trimmedPhone,
      trimmedEmail,
      (address || '').trim(),
      trimmedEmergency,
      role.trim(),
      skillLevel.trim(),
      parsedRate || 1200.00,
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

    const trimmedName = name !== undefined ? name.trim() : existing.name;
    const trimmedNic = nic !== undefined ? (nic ? nic.trim().toUpperCase() : existing.id) : existing.nic;
    const trimmedPhone = phone !== undefined ? phone.trim() : existing.phone;
    const trimmedEmail = email !== undefined ? email.trim().toLowerCase() : existing.email;
    const trimmedAddress = address !== undefined ? address.trim() : existing.address;
    const trimmedEmergency = emergencyContact !== undefined ? emergencyContact.trim() : existing.emergency_contact;
    const updatedRole = role !== undefined ? role.trim() : existing.role;
    const updatedSkill = skillLevel !== undefined ? skillLevel.trim() : existing.skill_level;
    const updatedStatus = status !== undefined ? status : existing.status;
    const parsedRate = hourlyRate !== undefined ? parseFloat(hourlyRate) : existing.hourly_rate;

    // Validation checks on updated fields
    if (name !== undefined && (!trimmedName || trimmedName.length < 3)) {
      return res.status(400).json({ error: 'Full name must be at least 3 characters long.' });
    }

    if (phone !== undefined) {
      const phoneDigits = trimmedPhone.replace(/[^0-9]/g, '');
      if (!trimmedPhone || phoneDigits.length < 9 || phoneDigits.length > 12) {
        return res.status(400).json({ error: 'Contact phone number must contain between 9 and 12 digits.' });
      }
    }

    if (email !== undefined && trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Invalid email address format.' });
    }

    if (hourlyRate !== undefined && (isNaN(parsedRate) || parsedRate < 200 || parsedRate > 50000)) {
      return res.status(400).json({ error: 'Hourly wage rate must be between Rs. 200 and Rs. 50,000.' });
    }

    if (emergencyContact !== undefined && (!trimmedEmergency || trimmedEmergency.length < 5)) {
      return res.status(400).json({ error: 'Emergency contact details are required for safety compliance.' });
    }

    await query(`
      UPDATE laborers SET
        name = ?,
        nic = ?,
        phone = ?,
        email = ?,
        address = ?,
        emergency_contact = ?,
        role = ?,
        skill_level = ?,
        hourly_rate = ?,
        status = ?,
        assigned_site_id = ?,
        join_date = COALESCE(?, join_date)
      WHERE id = ?
    `, [
      trimmedName,
      trimmedNic,
      trimmedPhone,
      trimmedEmail,
      trimmedAddress,
      trimmedEmergency,
      updatedRole,
      updatedSkill,
      parsedRate,
      updatedStatus,
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
