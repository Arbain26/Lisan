const pool = require('../../config/db');

// GET all website settings including profile content and navbar visibility
exports.getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pengaturan WHERE id = 1');
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pengaturan tidak ditemukan' });
    }
    const settings = rows[0];

    // Safely parse JSON columns if they come as string
    if (settings.misi && typeof settings.misi === 'string') {
      try { settings.misi = JSON.parse(settings.misi); } catch (e) { settings.misi = []; }
    }
    if (settings.nilai_organisasi && typeof settings.nilai_organisasi === 'string') {
      try { settings.nilai_organisasi = JSON.parse(settings.nilai_organisasi); } catch (e) { settings.nilai_organisasi = []; }
    }
    if (settings.menu_visibility && typeof settings.menu_visibility === 'string') {
      try { settings.menu_visibility = JSON.parse(settings.menu_visibility); } catch (e) { settings.menu_visibility = {}; }
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching website settings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// UPDATE general contact & organization settings
exports.updateSettings = async (req, res) => {
  try {
    const { nama_organisasi, email, telepon, alamat, instagram, facebook, youtube } = req.body;

    if (!nama_organisasi || !email || !telepon || !alamat) {
      return res.status(400).json({ message: 'Nama organisasi, email, nomor telepon, dan alamat wajib diisi' });
    }

    await pool.query(
      'UPDATE pengaturan SET nama_organisasi = ?, email = ?, telepon = ?, alamat = ?, instagram = ?, facebook = ?, youtube = ? WHERE id = 1',
      [nama_organisasi, email, telepon, alamat, instagram || '', facebook || '', youtube || '']
    );

    res.json({ message: 'Pengaturan kontak website berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating website settings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// UPDATE Profile Narrations (Tentang, Sejarah, Visi, Misi, Nilai Organisasi)
exports.updateProfile = async (req, res) => {
  try {
    const { tentang_organisasi, sejarah, visi, misi, nilai_organisasi } = req.body;

    const misiJson = Array.isArray(misi) ? JSON.stringify(misi) : (misi || '[]');
    const nilaiJson = Array.isArray(nilai_organisasi) ? JSON.stringify(nilai_organisasi) : (nilai_organisasi || '[]');

    await pool.query(
      `UPDATE pengaturan SET 
        tentang_organisasi = ?, 
        sejarah = ?, 
        visi = ?, 
        misi = ?, 
        nilai_organisasi = ? 
      WHERE id = 1`,
      [tentang_organisasi || '', sejarah || '', visi || '', misiJson, nilaiJson]
    );

    res.json({ message: 'Konten profil organisasi berhasil disimpan!' });
  } catch (error) {
    console.error('Error updating profile content:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// UPDATE Navbar Menu Visibility Toggles (Aktif / Nonaktif)
exports.updateMenuVisibility = async (req, res) => {
  try {
    const { menu_visibility } = req.body;

    if (!menu_visibility) {
      return res.status(400).json({ message: 'Data visibilitas menu wajib diberikan' });
    }

    const visibilityJson = typeof menu_visibility === 'object' 
      ? JSON.stringify(menu_visibility) 
      : menu_visibility;

    await pool.query('UPDATE pengaturan SET menu_visibility = ? WHERE id = 1', [visibilityJson]);

    res.json({ message: 'Visibilitas menu navbar berhasil diperbarui!', menu_visibility });
  } catch (error) {
    console.error('Error updating menu visibility:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
