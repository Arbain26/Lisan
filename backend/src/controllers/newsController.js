const pool = require('../../config/db');
const { uploadToStorage, deleteFromStorage } = require('../services/supabaseStorage');

exports.getAllNews = async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM berita';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM berita WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Berita tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching news by id:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createNews = async (req, res) => {
  try {
    const { title, category, excerpt, content, status } = req.body;
    const author = req.user?.name || 'Admin';
    let image_url = null;

    if (req.file) {
      image_url = await uploadToStorage(req.file, 'news');
    }

    const [result] = await pool.query(
      'INSERT INTO berita (title, category, excerpt, content, image_url, status, author) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, category, excerpt, content, image_url, status || 'Draft', author]
    );

    res.status(201).json({ id: result.insertId, image_url, message: 'Berita berhasil dibuat' });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, excerpt, content, status } = req.body;
    let query = 'UPDATE berita SET title = ?, category = ?, excerpt = ?, content = ?, status = ?';
    const params = [title, category, excerpt, content, status];

    if (req.file) {
      // Find old image to delete from storage
      const [oldRows] = await pool.query('SELECT image_url FROM berita WHERE id = ?', [id]);
      if (oldRows.length > 0 && oldRows[0].image_url) {
        deleteFromStorage(oldRows[0].image_url).catch(err => console.warn(err));
      }

      const image_url = await uploadToStorage(req.file, 'news');
      query += ', image_url = ?';
      params.push(image_url);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Berita tidak ditemukan' });
    }

    res.json({ message: 'Berita berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const [oldRows] = await pool.query('SELECT image_url FROM berita WHERE id = ?', [id]);
    if (oldRows.length > 0 && oldRows[0].image_url) {
      deleteFromStorage(oldRows[0].image_url).catch(err => console.warn(err));
    }

    const [result] = await pool.query('DELETE FROM berita WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Berita tidak ditemukan' });
    }

    res.json({ message: 'Berita berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
