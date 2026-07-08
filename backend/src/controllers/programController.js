const pool = require('../../config/db');

exports.getAllPrograms = async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM program';
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

exports.createProgram = async (req, res) => {
  try {
    const { name, description, category, status, participant_count, icon, color_theme } = req.body;

    const [result] = await pool.query(
      'INSERT INTO program (name, description, category, status, participant_count, icon, color_theme) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, category, status || 'Terjadwal', participant_count || 0, icon, color_theme]
    );

    res.status(201).json({ id: result.insertId, message: 'Program created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    const { name, description, category, status, participant_count, icon, color_theme } = req.body;

    const [result] = await pool.query(
      'UPDATE program SET name = ?, description = ?, category = ?, status = ?, participant_count = ?, icon = ?, color_theme = ? WHERE id = ?',
      [name, description, category, status, participant_count, icon, color_theme, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Program not found' });
    }

    res.json({ message: 'Program updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM program WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Program not found' });
    }

    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
