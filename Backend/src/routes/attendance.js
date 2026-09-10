const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET /api/attendance
router.get('/', async (req, res) => {
  try {
    const { date, siteId, laborerId } = req.query;
    let sql = `
      SELECT 
        id,
        laborer_id AS laborerId,
        site_id AS siteId,
        date,
        status,
        regular_hours AS regularHours,
        overtime_hours AS overtimeHours,
        ot_reason AS otReason,
        supervisor_notes AS supervisorNotes
      FROM attendance
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }
    if (siteId) {
      sql += ' AND site_id = ?';
      params.push(siteId);
    }
    if (laborerId) {
      sql += ' AND laborer_id = ?';
      params.push(laborerId);
    }

    sql += ' ORDER BY date DESC, created_at DESC';

    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// POST /api/attendance (Single or Batch attendance upsert)
router.post('/', async (req, res) => {
  try {
    const records = Array.isArray(req.body) ? req.body : [req.body];

    if (records.length === 0) {
      return res.status(400).json({ error: 'No attendance records provided' });
    }

    const savedRecords = [];

    for (const rec of records) {
      const {
        id,
        laborerId,
        siteId,
        date,
        status = 'Present',
        regularHours = 8,
        overtimeHours = 0,
        otReason = '',
        supervisorNotes = ''
      } = rec;

      let effectiveSiteId = siteId;
      if (!effectiveSiteId && laborerId) {
        const [labRow] = await query('SELECT assigned_site_id FROM laborers WHERE id = ?', [laborerId]);
        if (labRow && labRow.assigned_site_id) {
          effectiveSiteId = labRow.assigned_site_id;
        }
      }
      if (!effectiveSiteId) {
        const [defaultSite] = await query('SELECT id FROM sites LIMIT 1');
        if (defaultSite && defaultSite.id) {
          effectiveSiteId = defaultSite.id;
        }
      }

      if (!laborerId || !effectiveSiteId || !date) {
        continue;
      }

      const recordId = id || `ATT-${date.replace(/-/g, '')}-${laborerId.replace(/[^a-zA-Z0-9]/g, '')}`;

      await query(`
        INSERT INTO attendance (
          id, laborer_id, site_id, date, status,
          regular_hours, overtime_hours, ot_reason, supervisor_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          site_id = VALUES(site_id),
          status = VALUES(status),
          regular_hours = VALUES(regular_hours),
          overtime_hours = VALUES(overtime_hours),
          ot_reason = VALUES(ot_reason),
          supervisor_notes = VALUES(supervisor_notes)
      `, [
        recordId,
        laborerId,
        effectiveSiteId,
        date,
        status,
        parseFloat(regularHours) || 0,
        parseFloat(overtimeHours) || 0,
        otReason || '',
        supervisorNotes || ''
      ]);

      const [saved] = await query(`
        SELECT 
          id,
          laborer_id AS laborerId,
          site_id AS siteId,
          date,
          status,
          regular_hours AS regularHours,
          overtime_hours AS overtimeHours,
          ot_reason AS otReason,
          supervisor_notes AS supervisorNotes
        FROM attendance 
        WHERE laborer_id = ? AND date = ?
      `, [laborerId, date]);

      if (saved) savedRecords.push(saved);
    }

    if (savedRecords.length === 0) {
      return res.status(400).json({ error: 'No valid attendance records could be saved. Please verify laborer and site selection.' });
    }

    res.status(201).json(savedRecords);
  } catch (err) {
    console.error('Error recording attendance:', err);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

// PUT /api/attendance/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      regularHours,
      overtimeHours,
      otReason,
      supervisorNotes
    } = req.body;

    const [existing] = await query('SELECT * FROM attendance WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    const validStatuses = ['Present', 'Half-Day', 'Absent', 'Leave'];
    const effStatus = status !== undefined ? status : existing.status;
    if (!validStatuses.includes(effStatus)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    let reg = regularHours !== undefined ? parseFloat(regularHours) : parseFloat(existing.regular_hours);
    let ot = overtimeHours !== undefined ? parseFloat(overtimeHours) : parseFloat(existing.overtime_hours);

    if (effStatus === 'Absent' || effStatus === 'Leave') {
      reg = 0;
      ot = 0;
    } else {
      if (isNaN(reg) || reg < 0 || reg > 16) {
        return res.status(400).json({ error: 'Regular hours must be between 0 and 16' });
      }
      if (isNaN(ot) || ot < 0 || ot > 12) {
        return res.status(400).json({ error: 'Overtime hours must be between 0 and 12' });
      }
      if (reg + ot > 18) {
        return res.status(400).json({ error: 'Combined daily shift cannot exceed 18 hours' });
      }
    }

    await query(`
      UPDATE attendance SET
        status = ?,
        regular_hours = ?,
        overtime_hours = ?,
        ot_reason = COALESCE(?, ot_reason),
        supervisor_notes = COALESCE(?, supervisor_notes)
      WHERE id = ?
    `, [
      effStatus,
      reg,
      ot,
      otReason !== undefined ? (otReason || '').trim() : null,
      supervisorNotes !== undefined ? (supervisorNotes || '').trim() : null,
      id
    ]);

    const [updated] = await query(`
      SELECT 
        id,
        laborer_id AS laborerId,
        site_id AS siteId,
        date,
        status,
        regular_hours AS regularHours,
        overtime_hours AS overtimeHours,
        ot_reason AS otReason,
        supervisor_notes AS supervisorNotes
      FROM attendance WHERE id = ?
    `, [id]);

    res.json(updated);
  } catch (err) {
    console.error('Error updating attendance record:', err);
    res.status(500).json({ error: 'Failed to update attendance record' });
  }
});

// DELETE /api/attendance/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await query('SELECT id FROM attendance WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    await query('DELETE FROM attendance WHERE id = ?', [id]);
    res.json({ message: `Attendance record ${id} deleted successfully`, id });
  } catch (err) {
    console.error('Error deleting attendance record:', err);
    res.status(500).json({ error: 'Failed to delete attendance record' });
  }
});

module.exports = router;
