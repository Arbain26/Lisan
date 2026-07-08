const pool = require('../../config/db');

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
