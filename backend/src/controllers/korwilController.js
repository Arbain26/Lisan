const pool = require('../../config/db');

// GET all active Korwil (Public)
exports.getAllKorwil = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM korwil WHERE is_active = 1 ORDER BY urutan ASC, id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching korwil:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET all Korwil including inactive (Admin)
exports.getAllKorwilAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM korwil ORDER BY urutan ASC, id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching korwil admin:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// CREATE new Korwil
exports.createKorwil = async (req, res) => {
  try {
    const { name, kampus, anggota, urutan, is_active } = req.body;

    if (!name || !kampus || !anggota) {
      return res.status(400).json({ message: 'Nama wilayah, kampus/lingkup, dan jumlah kader wajib diisi' });
    }

    const [result] = await pool.query(
      'INSERT INTO korwil (name, kampus, anggota, urutan, is_active) VALUES (?, ?, ?, ?, ?)',
      [name, kampus, anggota, urutan || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1]
    );

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Koordinator Wilayah berhasil ditambahkan' 
    });
  } catch (error) {
    console.error('Error creating korwil:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// UPDATE Korwil
exports.updateKorwil = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, kampus, anggota, urutan, is_active } = req.body;

    if (!name || !kampus || !anggota) {
      return res.status(400).json({ message: 'Nama wilayah, kampus/lingkup, dan jumlah kader wajib diisi' });
    }

    await pool.query(
      'UPDATE korwil SET name = ?, kampus = ?, anggota = ?, urutan = ?, is_active = ? WHERE id = ?',
      [name, kampus, anggota, urutan || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1, id]
    );

    res.json({ message: 'Koordinator Wilayah berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating korwil:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// DELETE Korwil
exports.deleteKorwil = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM korwil WHERE id = ?', [id]);
    res.json({ message: 'Koordinator Wilayah berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting korwil:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
