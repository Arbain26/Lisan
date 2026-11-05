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

exports.getAllMessages = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pesan ORDER BY created_at DESC');
    
    const formattedRows = rows.map(row => {
      // Format date to: 24 Apr 2026
      const dateObj = new Date(row.created_at);
      const day = dateObj.getDate().toString().padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const month = months[dateObj.getMonth()];
      const year = dateObj.getFullYear();
      const dateStr = `${day} ${month} ${year}`;

      return {
        id: row.id,
        name: row.name,
        email: row.email,
        subject: row.subject,
        message: row.message,
        isRead: Boolean(row.is_read),
        date: dateStr
      };
    });

    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getBloodNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM pesan 
       WHERE is_read = 0 
       AND (LOWER(subject) LIKE '%butuh darah%' OR message LIKE '%--- PERMOHONAN BUTUH DARAH ---%') 
       ORDER BY created_at DESC`
    );

    res.json({
      count: rows.length,
      requests: rows.map(parseBloodRequest)
    });
  } catch (error) {
    console.error('Error fetching blood notifications:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Nama, email, dan pesan wajib diisi' });
    }

    const [result] = await pool.query(
      'INSERT INTO pesan (name, email, subject, message, is_read) VALUES (?, ?, ?, ?, 0)',
      [name, email, subject || 'Tanpa Subjek', message]
    );

    res.status(201).json({ id: result.insertId, message: 'Pesan berhasil dikirim' });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    // We only update read status in the admin panel
    const isReadVal = isRead ? 1 : 0;

    const [result] = await pool.query(
      'UPDATE pesan SET is_read = ? WHERE id = ?',
      [isReadVal, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pesan tidak ditemukan' });
    }

    res.json({ message: 'Status pesan berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM pesan WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pesan tidak ditemukan' });
    }

    res.json({ message: 'Pesan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
