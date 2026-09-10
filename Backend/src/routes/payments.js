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

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Payment amount must be a positive number greater than 0' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (date > todayStr) {
      return res.status(400).json({ error: 'Payment disbursement date cannot be in the future' });
    }

    // Verify laborer exists
    const [laborer] = await query('SELECT id FROM laborers WHERE id = ? LIMIT 1', [laborerId]);
    if (!laborer) {
      return res.status(404).json({ error: 'Selected laborer profile not found' });
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
      numAmount,
      date,
      method,
      reference.trim(),
      approvedBy.trim(),
      (notes || '').trim()
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
