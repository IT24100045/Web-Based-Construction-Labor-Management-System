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
    const allPayments = await query('SELECT id FROM payments');
    let maxNum = 0;
    for (const row of allPayments) {
      const match = (row.id || '').match(/^PAY-\d{4}-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    const newId = `PAY-${year}-${String(maxNum + 1).padStart(3, '0')}`;

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

// DELETE /api/payments/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await query('SELECT id FROM payments WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Soft delete: set amount to 0 and prepend [Deleted] to notes
    await query("UPDATE payments SET amount = 0, notes = CONCAT('[Deleted] ', COALESCE(notes, '')) WHERE id = ?", [id]);
    res.json({ message: `Payment ${id} marked as deleted successfully`, id, status: 'Deleted' });
  } catch (err) {
    console.error('Error deleting payment:', err);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

module.exports = router;
