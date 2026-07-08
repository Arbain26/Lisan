const pool = require('../../config/db');

exports.getAllGallery = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM galeri ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createGallery = async (req, res) => {
  try {
    const { title, grid_span } = req.body;
    let image_url = null;

    if (req.file) {
      image_url = `/uploads/gallery/${req.file.filename}`;
    } else {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO galeri (title, image_url, grid_span, date_taken) VALUES (?, ?, ?, NOW())',
      [title, image_url, grid_span || '']
    );

    res.status(201).json({ id: result.insertId, message: 'Gallery image uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteGallery = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM galeri WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
