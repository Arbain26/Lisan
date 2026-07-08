const pool = require('../../config/db');

exports.getAllRelawan = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM relawan ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getRelawanById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM relawan WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Relawan tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createRelawan = async (req, res) => {
  try {
    const { nama, instansi, daerah, golongan_darah, no_hp, keterangan } = req.body;
    
    if (!nama || !instansi || !daerah || !golongan_darah || !no_hp) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    const [result] = await pool.query(
      'INSERT INTO relawan (nama, instansi, daerah, golongan_darah, no_hp, keterangan) VALUES (?, ?, ?, ?, ?, ?)',
      [nama, instansi, daerah, golongan_darah, no_hp, keterangan || '-']
    );

    res.status(201).json({ id: result.insertId, message: 'Data relawan berhasil ditambahkan' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateRelawan = async (req, res) => {
  try {
    const { nama, instansi, daerah, golongan_darah, no_hp, keterangan } = req.body;
    
    if (!nama || !instansi || !daerah || !golongan_darah || !no_hp) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    const [result] = await pool.query(
      'UPDATE relawan SET nama = ?, instansi = ?, daerah = ?, golongan_darah = ?, no_hp = ?, keterangan = ? WHERE id = ?',
      [nama, instansi, daerah, golongan_darah, no_hp, keterangan || '-', req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Relawan tidak ditemukan' });
    }

    res.json({ message: 'Data relawan berhasil diperbarui' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteRelawan = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM relawan WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Relawan tidak ditemukan' });
    }

    res.json({ message: 'Data relawan berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.importRelawanBulk = async (req, res) => {
  try {
    const data = req.body; // Expecting an array of objects
    
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'Data tidak valid atau kosong' });
    }

    // Get all existing names to prevent duplicates
    const [existingRows] = await pool.query('SELECT nama FROM relawan');
    const existingNames = new Set(existingRows.map(row => row.nama.toLowerCase().trim()));

    // Filter out duplicates
    const newData = data.filter(item => {
      if (!item.nama) return false;
      return !existingNames.has(item.nama.toLowerCase().trim());
    });

    if (newData.length === 0) {
      return res.status(200).json({ message: '0 data di-import (Semua data sudah ada / duplikat)' });
    }

    // Prepare values for bulk insert
    const values = newData.map(item => [
      item.nama,
      item.instansi || item.kelas || '-',
      item.daerah,
      item.golongan_darah,
      item.no_hp,
      item.keterangan || '-'
    ]);

    const [result] = await pool.query(
      'INSERT INTO relawan (nama, instansi, daerah, golongan_darah, no_hp, keterangan) VALUES ?',
      [values]
    );

    res.status(201).json({ message: `${result.affectedRows} data berhasil di-import` });
  } catch (error) {
    console.error('Error importing bulk relawan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat meng-import data' });
  }
};

exports.deleteAllRelawan = async (req, res) => {
  try {
    await pool.query('TRUNCATE TABLE relawan');
    res.json({ message: 'Seluruh data relawan berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
