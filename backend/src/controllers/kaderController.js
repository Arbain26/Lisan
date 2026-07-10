const pool = require('../../config/db');
const { logError } = require('../../src/utils/logger'); // Wait! In controllers, let's verify if logError is in src/utils/logger or utils/logger.
// Wait! Let's write a safe logError block or check if ../../src/utils/logger exists.
// Let's use console.error or logError from '../utils/logger' (since prokerController uses logError which was imported).
// Let's check how logger is imported in prokerController:
// In prokerController, it does: const { logError } = require('../utils/logger');
// So from controllers, it's: const { logError } = require('../utils/logger');

const { logError } = require('../utils/logger');

// 1. Get All Kader (with search and angkatan filter)
exports.getAllKader = async (req, res) => {
  const { search, angkatan, status } = req.query;
  
  try {
    let query = 'SELECT * FROM kader WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (nama LIKE ? OR nim LIKE ? OR jurusan LIKE ?)';
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    if (angkatan) {
      query += ' AND angkatan = ?';
      params.push(angkatan);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY angkatan DESC, nama ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    logError('getAllKader', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 2. Create Kader
exports.createKader = async (req, res) => {
  const { nama, nim, angkatan, jurusan, no_hp, status } = req.body;

  if (!nama || !angkatan) {
    return res.status(400).json({ message: 'Nama dan Angkatan wajib diisi' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO kader (nama, nim, angkatan, jurusan, no_hp, status) VALUES (?, ?, ?, ?, ?, ?)',
      [nama, nim || null, angkatan, jurusan || null, no_hp || null, status || 'Aktif']
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
  const { nama, nim, angkatan, jurusan, no_hp, status } = req.body;

  if (!nama || !angkatan) {
    return res.status(400).json({ message: 'Nama dan Angkatan wajib diisi' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE kader SET nama = ?, nim = ?, angkatan = ?, jurusan = ?, no_hp = ?, status = ? WHERE id = ?',
      [nama, nim || null, angkatan, jurusan || null, no_hp || null, status || 'Aktif', id]
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
