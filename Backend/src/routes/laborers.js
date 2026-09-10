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

const NIC_REGEX = /^([0-9]{9}[vVxX]|[0-9]{12}|EMP-[0-9]{3,6})$/i;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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

    const trimmedName = (name || '').trim();
    const trimmedNic = (nic || '').trim().toUpperCase();
    const trimmedPhone = (phone || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedEmergency = (emergencyContact || '').trim();
    const parsedRate = parseFloat(hourlyRate);

    // Validation rules
    if (!trimmedName || trimmedName.length < 3) {
      return res.status(400).json({ error: 'Full name is required and must be at least 3 characters long.' });
    }

    if (!trimmedNic || !NIC_REGEX.test(trimmedNic)) {
      return res.status(400).json({ error: 'Valid NIC (9 digits + V/X, 12 digits) or EMP-XXX is required.' });
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

    // Check duplicate NIC
    const [existingNicRows] = await query('SELECT id, name FROM laborers WHERE UPPER(nic) = ? LIMIT 1', [trimmedNic]);
    if (existingNicRows && existingNicRows.length > 0) {
      return res.status(409).json({
        error: `A laborer with NIC "${trimmedNic}" is already registered (${existingNicRows[0].name}).`
      });
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
      trimmedName,
      trimmedNic,
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

    const trimmedName = name !== undefined ? name.trim() : existing.name;
    const trimmedNic = nic !== undefined ? nic.trim().toUpperCase() : existing.nic;
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

    if (nic !== undefined && (!trimmedNic || !NIC_REGEX.test(trimmedNic))) {
      return res.status(400).json({ error: 'Valid NIC (9 digits + V/X, 12 digits) or EMP-XXX is required.' });
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

    // Check duplicate NIC against other laborers
    if (nic !== undefined && trimmedNic !== existing.nic) {
      const [duplicate] = await query('SELECT id, name FROM laborers WHERE UPPER(nic) = ? AND id != ? LIMIT 1', [
        trimmedNic,
        id
      ]);
      if (duplicate && duplicate.length > 0) {
        return res.status(409).json({
          error: `Another laborer with NIC "${trimmedNic}" already exists (${duplicate[0].name}).`
        });
      }
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
