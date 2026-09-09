const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET /api/sites
router.get('/', async (req, res) => {
  try {
    const rows = await query(`
      SELECT 
        id,
        name,
        code,
        location,
        type,
        client,
        start_date AS startDate,
        end_date AS endDate,
        budget,
        manager,
        status,
        description
      FROM sites
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching sites:', err);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

// POST /api/sites
router.post('/', async (req, res) => {
  try {
    const {
      name,
      code,
      location = '',
      type = 'Commercial',
      client = '',
      startDate = null,
      endDate = null,
      budget = 0,
      manager = '',
      status = 'Active',
      description = ''
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Site name is required' });
    }

    const siteCode = code ? code.trim() : `PRJ-${Math.floor(100 + Math.random() * 900)}-${new Date().getFullYear()}`;

    // Generate unique ID e.g. SITE-01
    const [countResult] = await query('SELECT COUNT(*) as cnt FROM sites');
    const newId = `SITE-${String(countResult.cnt + 1).padStart(2, '0')}`;

    await query(`
      INSERT INTO sites (
        id, name, code, location, type, client,
        start_date, end_date, budget, manager, status, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newId,
      name,
      siteCode,
      location,
      type,
      client,
      startDate || null,
      endDate || null,
      parseFloat(budget) || 0.00,
      manager,
      status,
      description
    ]);

    const [created] = await query(`
      SELECT 
        id, name, code, location, type, client,
        start_date AS startDate, end_date AS endDate,
        budget, manager, status, description
      FROM sites WHERE id = ?
    `, [newId]);

    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating site:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A site with this Project Code already exists' });
    }
    res.status(500).json({ error: 'Failed to create site' });
  }
});

// PUT /api/sites/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      location,
      type,
      client,
      startDate,
      endDate,
      budget,
      manager,
      status,
      description
    } = req.body;

    const [existing] = await query('SELECT * FROM sites WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Site not found' });
    }

    await query(`
      UPDATE sites SET
        name = COALESCE(?, name),
        code = COALESCE(?, code),
        location = COALESCE(?, location),
        type = COALESCE(?, type),
        client = COALESCE(?, client),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        budget = COALESCE(?, budget),
        manager = COALESCE(?, manager),
        status = COALESCE(?, status),
        description = COALESCE(?, description)
      WHERE id = ?
    `, [
      name !== undefined ? name : null,
      code !== undefined ? code : null,
      location !== undefined ? location : null,
      type !== undefined ? type : null,
      client !== undefined ? client : null,
      startDate !== undefined ? startDate : null,
      endDate !== undefined ? endDate : null,
      budget !== undefined ? parseFloat(budget) : null,
      manager !== undefined ? manager : null,
      status !== undefined ? status : null,
      description !== undefined ? description : null,
      id
    ]);

    const [updated] = await query(`
      SELECT 
        id, name, code, location, type, client,
        start_date AS startDate, end_date AS endDate,
        budget, manager, status, description
      FROM sites WHERE id = ?
    `, [id]);

    res.json(updated);
  } catch (err) {
    console.error('Error updating site:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Another site with this Project Code already exists' });
    }
    res.status(500).json({ error: 'Failed to update site' });
  }
});

// DELETE /api/sites/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await query('SELECT id FROM sites WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Unassign laborers from this site
    await query('UPDATE laborers SET assigned_site_id = NULL WHERE assigned_site_id = ?', [id]);
    // Delete site
    await query('DELETE FROM sites WHERE id = ?', [id]);

    res.json({ message: `Site ${id} deleted successfully`, id });
  } catch (err) {
    console.error('Error deleting site:', err);
    res.status(500).json({ error: 'Failed to delete site' });
  }
});

// POST /api/sites/:id/allocate
router.post('/:id/allocate', async (req, res) => {
  try {
    const { id } = req.params;
    const { laborerIds = [] } = req.body;

    const [site] = await query('SELECT id, name FROM sites WHERE id = ?', [id]);
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // 1. Unassign any laborer currently assigned to this site who is NOT in laborerIds
    if (laborerIds.length > 0) {
      const placeholders = laborerIds.map(() => '?').join(',');
      await query(
        `UPDATE laborers SET assigned_site_id = NULL WHERE assigned_site_id = ? AND id NOT IN (${placeholders})`,
        [id, ...laborerIds]
      );
      // 2. Assign the selected laborerIds to this site
      await query(
        `UPDATE laborers SET assigned_site_id = ? WHERE id IN (${placeholders})`,
        [id, ...laborerIds]
      );
    } else {
      // Clear all allocations for this site
      await query('UPDATE laborers SET assigned_site_id = NULL WHERE assigned_site_id = ?', [id]);
    }

    // Return updated laborers
    const updatedLaborers = await query(`
      SELECT 
        id, name, nic, phone, email, address,
        emergency_contact AS emergencyContact,
        role, skill_level AS skillLevel,
        hourly_rate AS hourlyRate,
        status, assigned_site_id AS assignedSiteId,
        join_date AS joinDate
      FROM laborers
      ORDER BY created_at DESC
    `);

    res.json({ message: 'Site allocations updated successfully', siteId: id, laborers: updatedLaborers });
  } catch (err) {
    console.error('Error allocating laborers to site:', err);
    res.status(500).json({ error: 'Failed to allocate laborers to site' });
  }
});

module.exports = router;
