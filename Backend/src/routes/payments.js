const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET /api/payments
router.get('/', async (req, res) => {
  try {
    const { laborerId } = req.query;
    let sql = `
      SELECT 
        id,
        laborer_id AS laborerId,
        amount,
        date,
        method,
        reference,
        approved_by AS approvedBy,
        notes
      FROM payments
      WHERE 1=1
    `;
    const params = [];

    if (laborerId) {
      sql += ' AND laborer_id = ?';
      params.push(laborerId);
    }

    sql += ' ORDER BY date DESC, created_at DESC';

    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// POST /api/payments
router.post('/', async (req, res) => {
  try {
    const {
      laborerId,
      amount,
      date = new Date().toISOString().split('T')[0],
      method = 'Bank Transfer',
      reference,
      approvedBy,
      notes = ''
    } = req.body;

    if (!laborerId || !amount || !reference || !approvedBy) {
      return res.status(400).json({ error: 'Laborer, Amount, Reference, and Authorizer are required' });
    }

    // Generate unique ID e.g. PAY-2026-001
    const year = new Date().getFullYear();
    const [countResult] = await query('SELECT COUNT(*) as cnt FROM payments');
    const newId = `PAY-${year}-${String(countResult.cnt + 1).padStart(3, '0')}`;

    await query(`
      INSERT INTO payments (
        id, laborer_id, amount, date, method, reference, approved_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newId,
      laborerId,
      parseFloat(amount) || 0.00,
      date,
      method,
      reference,
      approvedBy,
      notes
    ]);

    const [created] = await query(`
      SELECT 
        id,
        laborer_id AS laborerId,
        amount,
        date,
        method,
        reference,
        approved_by AS approvedBy,
        notes
      FROM payments WHERE id = ?
    `, [newId]);

    res.status(201).json(created);
  } catch (err) {
    console.error('Error recording payment:', err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

module.exports = router;
