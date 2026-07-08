const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const { protect } = require('../middleware/authMiddleware');

// === DONOR ROUTES ===
router.get('/donors', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM donor ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/donors', protect, async (req, res) => {
  try {
    const { name, blood_type, phone, last_donation, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO donor (name, blood_type, phone, last_donation, status) VALUES (?, ?, ?, ?, ?)',
      [name, blood_type, phone, last_donation, status || 'Bisa Donor']
    );
    res.status(201).json({ id: result.insertId, message: 'Donor added' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.delete('/donors/:id', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM donor WHERE id = ?', [req.params.id]);
    res.json({ message: 'Donor deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// === VOLUNTEER ROUTES ===
router.get('/volunteers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM relawan ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/volunteers', protect, async (req, res) => {
  try {
    const { name, email, phone, division, status, join_date } = req.body;
    const [result] = await pool.query(
      'INSERT INTO relawan (name, email, phone, division, status, join_date) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, division, status || 'Aktif', join_date]
    );
    res.status(201).json({ id: result.insertId, message: 'Volunteer added' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

router.delete('/volunteers/:id', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM relawan WHERE id = ?', [req.params.id]);
    res.json({ message: 'Volunteer deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
