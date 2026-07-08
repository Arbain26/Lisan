const pool = require('../../config/db');
const fs = require('fs');
const path = require('path');

exports.getHeroes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM hero_slides ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createHero = async (req, res) => {
  try {
    const { title, highlight, sub } = req.body;
    let image_url = '';
    
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    const [result] = await pool.query(
      'INSERT INTO hero_slides (image_url, title, highlight, sub) VALUES (?, ?, ?, ?)',
      [image_url, title, highlight, sub]
    );

    res.status(201).json({ id: result.insertId, image_url, title, highlight, sub });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateHero = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, highlight, sub } = req.body;
    
    let query = 'UPDATE hero_slides SET title = ?, highlight = ?, sub = ?';
    const params = [title, highlight, sub];

    if (req.file) {
      const image_url = `/uploads/${req.file.filename}`;
      query += ', image_url = ?';
      params.push(image_url);

      // Attempt to delete old image
      const [[oldSlide]] = await pool.query('SELECT image_url FROM hero_slides WHERE id = ?', [id]);
      if (oldSlide && oldSlide.image_url && oldSlide.image_url.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '../../../', oldSlide.image_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.query(query, params);
    res.json({ message: 'Slide updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteHero = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [[slide]] = await pool.query('SELECT image_url FROM hero_slides WHERE id = ?', [id]);
    if (slide && slide.image_url && slide.image_url.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../../../', slide.image_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await pool.query('DELETE FROM hero_slides WHERE id = ?', [id]);
    res.json({ message: 'Slide deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
