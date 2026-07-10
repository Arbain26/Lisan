const pool = require('../../config/db');
const { logError } = require('../utils/logger');

// 1. Get All Kader (with search, angkatan, and tahun filter)
exports.getAllKader = async (req, res) => {
  const { search, angkatan, tahun } = req.query;
  
  try {
    let query = 'SELECT * FROM kader WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (nama LIKE ? OR institusi LIKE ? OR angkatan LIKE ? OR tahun LIKE ?)';
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild, searchWild);
    }

    if (angkatan) {
      query += ' AND angkatan = ?';
      params.push(angkatan);
    }

    if (tahun) {
      query += ' AND tahun = ?';
      params.push(tahun);
    }

    query += ' ORDER BY tahun DESC, angkatan ASC, nama ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    logError('getAllKader', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 2. Create Kader
exports.createKader = async (req, res) => {
  const { nama, institusi, angkatan, tahun } = req.body;

  if (!nama || !institusi || !angkatan || !tahun) {
    return res.status(400).json({ message: 'Semua kolom (Nama, Institusi, Angkatan, Tahun) wajib diisi' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO kader (nama, institusi, angkatan, tahun) VALUES (?, ?, ?, ?)',
      [nama, institusi, angkatan, tahun]
    );

    const [newKader] = await pool.query('SELECT * FROM kader WHERE id = ?', [result.insertId]);

    res.status(201).json({
      message: 'Kader berhasil ditambahkan',
      kader: newKader[0]
    });
  } catch (error) {
    logError('createKader', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 3. Update Kader
exports.updateKader = async (req, res) => {
  const { id } = req.params;
  const { nama, institusi, angkatan, tahun } = req.body;

  if (!nama || !institusi || !angkatan || !tahun) {
    return res.status(400).json({ message: 'Semua kolom (Nama, Institusi, Angkatan, Tahun) wajib diisi' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE kader SET nama = ?, institusi = ?, angkatan = ?, tahun = ? WHERE id = ?',
      [nama, institusi, angkatan, tahun, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kader tidak ditemukan' });
    }

    const [updatedKader] = await pool.query('SELECT * FROM kader WHERE id = ?', [id]);

    res.json({
      message: 'Kader berhasil diperbarui',
      kader: updatedKader[0]
    });
  } catch (error) {
    logError('updateKader', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 4. Delete Kader
exports.deleteKader = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM kader WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kader tidak ditemukan' });
    }

    res.json({ message: 'Kader berhasil dihapus' });
  } catch (error) {
    logError('deleteKader', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
