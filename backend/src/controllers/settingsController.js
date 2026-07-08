const pool = require('../../config/db');

exports.getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pengaturan WHERE id = 1');
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pengaturan tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching website settings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { nama_organisasi, email, telepon, alamat, instagram, facebook, youtube } = req.body;

    if (!nama_organisasi || !email || !telepon || !alamat) {
      return res.status(400).json({ message: 'Nama organisasi, email, nomor telepon, dan alamat wajib diisi' });
    }

    const [result] = await pool.query(
      'UPDATE pengaturan SET nama_organisasi = ?, email = ?, telepon = ?, alamat = ?, instagram = ?, facebook = ?, youtube = ? WHERE id = 1',
      [nama_organisasi, email, telepon, alamat, instagram || '', facebook || '', youtube || '']
    );

    if (result.affectedRows === 0) {
      // In case id = 1 is deleted or somehow missing, insert it
      await pool.query(
        'INSERT INTO pengaturan (id, nama_organisasi, email, telepon, alamat, instagram, facebook, youtube) VALUES (1, ?, ?, ?, ?, ?, ?, ?)',
        [nama_organisasi, email, telepon, alamat, instagram || '', facebook || '', youtube || '']
      );
    }

    res.json({ message: 'Pengaturan website berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating website settings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
