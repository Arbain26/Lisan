const pool = require('../../config/db');

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
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM berita WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createNews = async (req, res) => {
  try {
    const { title, category, excerpt, content, status } = req.body;
    const author = req.user.name; // from auth middleware
    let image_url = null;

    if (req.file) {
      image_url = `/uploads/news/${req.file.filename}`;
    }

    const [result] = await pool.query(
      'INSERT INTO berita (title, category, excerpt, content, image_url, status, author) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, category, excerpt, content, image_url, status || 'Draft', author]
    );

    res.status(201).json({ id: result.insertId, message: 'News created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const { title, category, excerpt, content, status } = req.body;
    let image_url = null;
    let query = 'UPDATE berita SET title = ?, category = ?, excerpt = ?, content = ?, status = ?';
    const params = [title, category, excerpt, content, status];

    if (req.file) {
      image_url = `/uploads/news/${req.file.filename}`;
      query += ', image_url = ?';
      params.push(image_url);
    }

    query += ' WHERE id = ?';
    params.push(req.params.id);

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json({ message: 'News updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM berita WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
