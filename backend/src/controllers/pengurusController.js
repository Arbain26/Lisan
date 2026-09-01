const pool = require('../../config/db');
const fs = require('fs');
const path = require('path');

exports.getAllPengurus = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, d.nama as nama_departemen 
      FROM pengurus p 
      LEFT JOIN departemen d ON p.departemen_id = d.id 
      ORDER BY p.urutan ASC, p.id ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching pengurus:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getPengurusById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM pengurus WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pengurus tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching pengurus by id:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createPengurus = async (req, res) => {
  try {
    const { nama, jabatan, departemen_id, urutan, bio, email, instagram, linkedin, kampus } = req.body;

    if (!nama || !jabatan) {
      return res.status(400).json({ message: 'Nama dan jabatan wajib diisi' });
    }

    let foto_url = null;
    if (req.file) {
      foto_url = `/uploads/pengurus/${req.file.filename}`;
    }

    // Convert empty or 'null' departemen_id to actual null
    const deptId = (!departemen_id || departemen_id === 'null' || departemen_id === '') ? null : parseInt(departemen_id, 10);
    const orderIndex = urutan ? parseInt(urutan, 10) : 0;

    const [result] = await pool.query(
      'INSERT INTO pengurus (nama, jabatan, departemen_id, foto_url, urutan, bio, email, instagram, linkedin, kampus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nama, jabatan, deptId, foto_url, orderIndex, bio || null, email || null, instagram || null, linkedin || null, kampus || null]
    );

    res.status(201).json({ id: result.insertId, message: 'Pengurus berhasil ditambahkan' });
  } catch (error) {
    console.error('Error creating pengurus:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updatePengurus = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, jabatan, departemen_id, urutan, bio, email, instagram, linkedin, kampus } = req.body;

    if (!nama || !jabatan) {
      return res.status(400).json({ message: 'Nama dan jabatan wajib diisi' });
    }

    // Convert empty or 'null' departemen_id to actual null
    const deptId = (!departemen_id || departemen_id === 'null' || departemen_id === '') ? null : parseInt(departemen_id, 10);
    const orderIndex = urutan ? parseInt(urutan, 10) : 0;

    let query = 'UPDATE pengurus SET nama = ?, jabatan = ?, departemen_id = ?, urutan = ?, bio = ?, email = ?, instagram = ?, linkedin = ?, kampus = ?';
    const params = [nama, jabatan, deptId, orderIndex, bio || null, email || null, instagram || null, linkedin || null, kampus || null];

    if (req.file) {
      const foto_url = `/uploads/pengurus/${req.file.filename}`;
      query += ', foto_url = ?';
      params.push(foto_url);

      // Attempt to delete old photo
      const [[oldPengurus]] = await pool.query('SELECT foto_url FROM pengurus WHERE id = ?', [id]);
      if (oldPengurus && oldPengurus.foto_url && oldPengurus.foto_url.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '../../../', oldPengurus.foto_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pengurus tidak ditemukan' });
    }

    res.json({ message: 'Pengurus berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating pengurus:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deletePengurus = async (req, res) => {
  try {
    const { id } = req.params;

    const [[pengurus]] = await pool.query('SELECT foto_url FROM pengurus WHERE id = ?', [id]);
    if (pengurus && pengurus.foto_url && pengurus.foto_url.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../../../', pengurus.foto_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const [result] = await pool.query('DELETE FROM pengurus WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pengurus tidak ditemukan' });
    }

    res.json({ message: 'Pengurus berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting pengurus:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
