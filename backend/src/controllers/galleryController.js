const pool = require('../../config/db');
const { uploadToStorage, deleteFromStorage } = require('../services/supabaseStorage');

exports.getAllGallery = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM galeri ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createGallery = async (req, res) => {
  try {
    const { title, grid_span } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'File gambar wajib dipilih' });
    }

    // Upload buffer to Supabase Storage
    const image_url = await uploadToStorage(req.file, 'gallery');

    const [result] = await pool.query(
      'INSERT INTO galeri (title, image_url, grid_span, date_taken) VALUES (?, ?, ?, NOW())',
      [title, image_url, grid_span || '']
    );

    res.status(201).json({ id: result.insertId, image_url, message: 'Foto galeri berhasil diunggah' });
  } catch (error) {
    console.error('Error uploading gallery:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.deleteGallery = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find existing image to delete from storage
    const [rows] = await pool.query('SELECT image_url FROM galeri WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Foto tidak ditemukan' });
    }

    const imageUrl = rows[0].image_url;

    const [result] = await pool.query('DELETE FROM galeri WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Foto tidak ditemukan' });
    }

    // Delete from Supabase / local storage asynchronously
    deleteFromStorage(imageUrl).catch(err => console.error('Failed to delete storage file:', err));

    res.json({ message: 'Foto galeri berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting gallery:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
