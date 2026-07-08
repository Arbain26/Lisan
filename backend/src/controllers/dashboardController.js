const pool = require('../../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ total_berita }]] = await pool.query('SELECT COUNT(*) AS total_berita FROM berita');
    const [[{ total_program }]] = await pool.query('SELECT COUNT(*) AS total_program FROM program');
    const [[{ total_galeri }]] = await pool.query('SELECT COUNT(*) AS total_galeri FROM galeri');
    const [[{ total_relawan }]] = await pool.query('SELECT COUNT(*) AS total_relawan FROM relawan');
    const [[{ total_pesan }]] = await pool.query('SELECT COUNT(*) AS total_pesan FROM pesan');

    res.json({
      berita: total_berita,
      program: total_program,
      galeri: total_galeri,
      relawan: total_relawan,
      pesan: total_pesan
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
