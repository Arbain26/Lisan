const pool = require('../../config/db');
const { uploadToStorage, deleteFromStorage } = require('../services/supabaseStorage');

exports.getHeroes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM hero_slides ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching heroes:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createHero = async (req, res) => {
  try {
    const { title, highlight, sub } = req.body;
    let image_url = '';
    
    if (req.file) {
      image_url = await uploadToStorage(req.file, 'hero');
    }

    const [result] = await pool.query(
      'INSERT INTO hero_slides (image_url, title, highlight, sub) VALUES (?, ?, ?, ?)',
      [image_url, title, highlight, sub]
    );

    res.status(201).json({ id: result.insertId, image_url, title, highlight, sub, message: 'Slide berhasil dibuat' });
  } catch (error) {
    console.error('Error creating hero:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.updateHero = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, highlight, sub } = req.body;
    
    let query = 'UPDATE hero_slides SET title = ?, highlight = ?, sub = ?';
    const params = [title, highlight, sub];

    if (req.file) {
      // Delete old image from storage
      const [[oldSlide]] = await pool.query('SELECT image_url FROM hero_slides WHERE id = ?', [id]);
      if (oldSlide && oldSlide.image_url) {
        deleteFromStorage(oldSlide.image_url).catch(err => console.warn(err));
      }

      const image_url = await uploadToStorage(req.file, 'hero');
      query += ', image_url = ?';
      params.push(image_url);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.query(query, params);
    res.json({ message: 'Slide berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating hero:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.deleteHero = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [[slide]] = await pool.query('SELECT image_url FROM hero_slides WHERE id = ?', [id]);
    if (slide && slide.image_url) {
      deleteFromStorage(slide.image_url).catch(err => console.warn(err));
    }

    await pool.query('DELETE FROM hero_slides WHERE id = ?', [id]);
    res.json({ message: 'Slide berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting hero:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
