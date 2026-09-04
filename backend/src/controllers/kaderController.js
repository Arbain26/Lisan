const pool = require('../../config/db');
const { logError } = require('../utils/logger');

// 1. Get All Kader (with search, angkatan, and jenjang filter)
exports.getAllKader = async (req, res) => {
  const { search, angkatan, jenjang } = req.query;

  try {
    let query = 'SELECT * FROM kader WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (nama LIKE ? OR kampus LIKE ? OR angkatan LIKE ? OR jenjang_kaderisasi LIKE ?)';
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild, searchWild);
    }
    if (angkatan) { query += ' AND angkatan = ?'; params.push(angkatan); }
    if (jenjang)  { query += ' AND jenjang_kaderisasi = ?'; params.push(jenjang); }

    query += ' ORDER BY angkatan ASC, nama ASC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    logError('getAllKader', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 2. Create Single Kader (check duplicate before insert)
exports.createKader = async (req, res) => {
  const { nama, angkatan, kampus, alamat, jenjang_kaderisasi, semester, status } = req.body;

  if (!nama || !angkatan || !kampus) {
    return res.status(400).json({ message: 'Kolom Nama, Angkatan, dan Kampus wajib diisi' });
  }

  try {
    // Check for duplicate (same nama + angkatan)
    const [existing] = await pool.query(
      'SELECT id FROM kader WHERE LOWER(TRIM(nama)) = LOWER(TRIM(?)) AND LOWER(TRIM(angkatan)) = LOWER(TRIM(?))',
      [nama, angkatan]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: `Kader "${nama}" dari angkatan "${angkatan}" sudah ada dalam database.` });
    }

    const [result] = await pool.query(
      'INSERT INTO kader (nama, angkatan, kampus, alamat, jenjang_kaderisasi, semester, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nama, angkatan, kampus, alamat || null, jenjang_kaderisasi || null, semester || null, status || null]
    );

    const [newKader] = await pool.query('SELECT * FROM kader WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Kader berhasil ditambahkan', kader: newKader[0] });
  } catch (error) {
    logError('createKader', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 3. Bulk Import Kader (dedup-safe, returns detail report)
exports.bulkImportKader = async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Tidak ada data yang dikirim.' });
  }

  const inserted = [];
  const skipped  = [];

  for (const item of items) {
    const nama     = String(item.nama || '').trim();
    const angkatan = String(item.angkatan || '').trim();
    const kampus   = String(item.kampus || '').trim();

    if (!nama) { skipped.push({ nama: '(kosong)', reason: 'Nama kosong' }); continue; }

    try {
      // Skip if combination already exists in DB
      const [existing] = await pool.query(
        'SELECT id FROM kader WHERE LOWER(TRIM(nama)) = LOWER(TRIM(?)) AND LOWER(TRIM(angkatan)) = LOWER(TRIM(?))',
        [nama, angkatan]
      );

      if (existing.length > 0) {
        skipped.push({ nama, angkatan, reason: 'Sudah ada di database' });
        continue;
      }

      await pool.query(
        'INSERT INTO kader (nama, angkatan, kampus, alamat, jenjang_kaderisasi, semester, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          nama,
          angkatan,
          kampus || null,
          String(item.alamat || '').trim() || null,
          String(item.jenjang_kaderisasi || '').trim().toUpperCase() || null,
          String(item.semester || '').trim() || null,
          String(item.status || '').trim() || null,
        ]
      );
      inserted.push({ nama, angkatan });
    } catch (error) {
      skipped.push({ nama, angkatan, reason: 'Error: ' + error.message });
    }
  }

  res.status(200).json({
    message: `Import selesai: ${inserted.length} berhasil, ${skipped.length} dilewati.`,
    inserted: inserted.length,
    skipped: skipped.length,
    skippedDetails: skipped,
  });
};

// 4. Update Kader
exports.updateKader = async (req, res) => {
  const { id } = req.params;
  const { nama, angkatan, kampus, alamat, jenjang_kaderisasi, semester, status } = req.body;

  if (!nama || !angkatan || !kampus) {
    return res.status(400).json({ message: 'Kolom Nama, Angkatan, dan Kampus wajib diisi' });
  }

  try {
    // Check duplicate for other records
    const [existing] = await pool.query(
      'SELECT id FROM kader WHERE LOWER(TRIM(nama)) = LOWER(TRIM(?)) AND LOWER(TRIM(angkatan)) = LOWER(TRIM(?)) AND id != ?',
      [nama, angkatan, id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: `Kader "${nama}" dari angkatan "${angkatan}" sudah ada.` });
    }

    const [result] = await pool.query(
      'UPDATE kader SET nama = ?, angkatan = ?, kampus = ?, alamat = ?, jenjang_kaderisasi = ?, semester = ?, status = ? WHERE id = ?',
      [nama, angkatan, kampus, alamat || null, jenjang_kaderisasi || null, semester || null, status || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kader tidak ditemukan' });
    }

    const [updatedKader] = await pool.query('SELECT * FROM kader WHERE id = ?', [id]);
    res.json({ message: 'Kader berhasil diperbarui', kader: updatedKader[0] });
  } catch (error) {
    logError('updateKader', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 5. Delete Kader
exports.deleteKader = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM kader WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kader tidak ditemukan' });
    }
    res.json({ message: 'Kader berhasil dihapus' });
  } catch (error) {
    logError('deleteKader', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
