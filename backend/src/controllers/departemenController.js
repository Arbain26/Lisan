const pool = require('../../config/db');

exports.getAllDepartemen = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM departemen ORDER BY id ASC');
    
    const parsedRows = rows.map(row => {
      let program_unggulan = [];
      try {
        program_unggulan = JSON.parse(row.program_unggulan || '[]');
      } catch (e) {
        program_unggulan = row.program_unggulan ? row.program_unggulan.split(',').map(p => p.trim()) : [];
      }
      return { ...row, program_unggulan };
    });

    res.json(parsedRows);
  } catch (error) {
    console.error('Error fetching departemen:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getDepartemenById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM departemen WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Departemen tidak ditemukan' });
    }
    
    const row = rows[0];
    let program_unggulan = [];
    try {
      program_unggulan = JSON.parse(row.program_unggulan || '[]');
    } catch (e) {
      program_unggulan = row.program_unggulan ? row.program_unggulan.split(',').map(p => p.trim()) : [];
    }

    res.json({ ...row, program_unggulan });
  } catch (error) {
    console.error('Error fetching departemen by id:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createDepartemen = async (req, res) => {
  try {
    const { nama, icon, color_theme, deskripsi, program_unggulan } = req.body;

    if (!nama || !icon || !color_theme || !deskripsi) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const programsStr = Array.isArray(program_unggulan) 
      ? JSON.stringify(program_unggulan) 
      : JSON.stringify(program_unggulan ? program_unggulan.split(',').map(p => p.trim()) : []);

    const [result] = await pool.query(
      'INSERT INTO departemen (nama, icon, color_theme, deskripsi, program_unggulan) VALUES (?, ?, ?, ?, ?)',
      [nama, icon, color_theme, deskripsi, programsStr]
    );

    res.status(201).json({ id: result.insertId, message: 'Departemen berhasil ditambahkan' });
  } catch (error) {
    console.error('Error creating departemen:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateDepartemen = async (req, res) => {
  try {
    const { nama, icon, color_theme, deskripsi, program_unggulan } = req.body;
    const { id } = req.params;

    if (!nama || !icon || !color_theme || !deskripsi) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const programsStr = Array.isArray(program_unggulan) 
      ? JSON.stringify(program_unggulan) 
      : JSON.stringify(program_unggulan ? program_unggulan.split(',').map(p => p.trim()) : []);

    const [result] = await pool.query(
      'UPDATE departemen SET nama = ?, icon = ?, color_theme = ?, deskripsi = ?, program_unggulan = ? WHERE id = ?',
      [nama, icon, color_theme, deskripsi, programsStr, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Departemen tidak ditemukan' });
    }

    res.json({ message: 'Departemen berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating departemen:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteDepartemen = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM departemen WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Departemen tidak ditemukan' });
    }

    res.json({ message: 'Departemen berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting departemen:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
