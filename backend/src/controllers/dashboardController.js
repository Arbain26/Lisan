const pool = require('../../config/db');

// Helper to parse blood request details
const parseBloodRequest = (msg) => {
  const lines = (msg.message || '').split('\n');
  const details = {
    bloodType: 'O',
    patientName: '-',
    quantity: '-',
    hospital: '-',
    patientAddress: '-',
    reason: '-',
    phone: ''
  };
  
  lines.forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join(':').trim();
      if (key === 'Golongan Darah') details.bloodType = val;
      else if (key === 'Nama Pasien') details.patientName = val;
      else if (key === 'Jumlah yang Dibutuhkan') details.quantity = val;
      else if (key === 'Tempat Perawatan') details.hospital = val;
      else if (key === 'Alamat Pasien') details.patientAddress = val;
      else if (key === 'Keperluan') details.reason = val;
      else if (key === 'Kontak Pemohon') details.phone = val;
    }
  });

  return {
    id: msg.id,
    name: msg.name,
    email: msg.email,
    subject: msg.subject,
    message: msg.message,
    createdAt: msg.created_at,
    ...details
  };
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ total_berita }]] = await pool.query('SELECT COUNT(*) AS total_berita FROM berita');
    const [[{ total_program }]] = await pool.query('SELECT COUNT(*) AS total_program FROM program');
    const [[{ total_galeri }]] = await pool.query('SELECT COUNT(*) AS total_galeri FROM galeri');
    const [[{ total_relawan }]] = await pool.query('SELECT COUNT(*) AS total_relawan FROM relawan');
    const [[{ total_pesan }]] = await pool.query('SELECT COUNT(*) AS total_pesan FROM pesan');
    const [[{ total_proker }]] = await pool.query('SELECT COUNT(*) AS total_proker FROM proker');

    // Fetch unread blood requests exclusively
    const [unreadBloodRequests] = await pool.query(
      `SELECT * FROM pesan 
       WHERE is_read = 0 
       AND (LOWER(subject) LIKE '%butuh darah%' OR message LIKE '%--- PERMOHONAN BUTUH DARAH ---%') 
       ORDER BY created_at DESC`
    );

    res.json({
      berita: total_berita,
      program: total_program,
      galeri: total_galeri,
      relawan: total_relawan,
      pesan: total_pesan,
      proker: total_proker,
      urgentBloodRequests: unreadBloodRequests.map(parseBloodRequest),
      urgentBloodCount: unreadBloodRequests.length
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
