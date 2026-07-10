const pool = require('../../config/db');
const XLSX = require('xlsx');
const { logError } = require('../utils/logger');

// Helper to map month and date to actual calendar date
function getScheduleDate(tahunKepengurusan, bulanStr, tanggalStr) {
  const months = {
    'agustus': { idx: 7, isGanjil: true },
    'september': { idx: 8, isGanjil: true },
    'oktober': { idx: 9, isGanjil: true },
    'november': { idx: 10, isGanjil: true },
    'desember': { idx: 11, isGanjil: true },
    'januari': { idx: 0, isGanjil: false },
    'februari': { idx: 1, isGanjil: false },
    'maret': { idx: 2, isGanjil: false },
    'april': { idx: 3, isGanjil: false },
    'mei': { idx: 4, isGanjil: false },
    'juni': { idx: 5, isGanjil: false },
    'juli': { idx: 6, isGanjil: false }
  };

  const key = bulanStr.trim().toLowerCase();
  const mInfo = months[key];
  if (!mInfo) return null;

  let startYear = 2025;
  let endYear = 2026;
  
  if (tahunKepengurusan && tahunKepengurusan.includes('/')) {
    const parts = tahunKepengurusan.split('/');
    startYear = parseInt(parts[0]) || 2025;
    endYear = parseInt(parts[1]) || (startYear + 1);
  } else if (tahunKepengurusan) {
    const y = parseInt(tahunKepengurusan);
    if (!isNaN(y)) {
      startYear = y - 1;
      endYear = y;
    }
  }

  const year = mInfo.isGanjil ? startYear : endYear;
  const numMatch = tanggalStr.toString().match(/\d+/);
  const dateNum = numMatch ? parseInt(numMatch[0]) : 1;

  return new Date(year, mInfo.idx, dateNum);
}

// Recalculates progress, status, and alerts for a specific proker or all
async function evaluateProker(prokerId, connection = pool) {
  // Fetch proker info
  const [prokers] = await connection.query('SELECT * FROM proker WHERE id = ?', [prokerId]);
  if (prokers.length === 0) return;
  const proker = prokers[0];

  // Fetch schedules
  const [schedules] = await connection.query('SELECT * FROM proker_schedule WHERE proker_id = ?', [prokerId]);
  
  const currentDate = new Date();
  
  // Calculate stats
  let total = schedules.length;
  let completed = schedules.filter(s => s.status === 'Terlaksana').length;
  let progress = total > 0 ? (completed / total) * 100 : 0.0;

  let hasDelayed = false;
  let hasNotStartedPastSchedule = false;
  let lastScheduleDate = null;
  let firstScheduleDate = null;
  let pastTargetCount = 0;

  for (const s of schedules) {
    const sDate = getScheduleDate(proker.tahun_kepengurusan, s.bulan, s.tanggal);
    if (sDate) {
      if (!lastScheduleDate || sDate > lastScheduleDate) lastScheduleDate = sDate;
      if (!firstScheduleDate || sDate < firstScheduleDate) firstScheduleDate = sDate;

      if (sDate <= currentDate) {
        pastTargetCount++;
        if (s.status === 'Tidak Terlaksana') {
          hasDelayed = true;
        }
        if (s.status === 'Belum Mulai') {
          hasNotStartedPastSchedule = true;
        }
      }
    }
  }

  let status = 'Sedang Berjalan';
  
  if (progress === 100) {
    status = 'Selesai';
  } else if (progress === 0 && (!firstScheduleDate || firstScheduleDate > currentDate)) {
    status = 'Belum Mulai';
  } else {
    // Check if overdue
    if (hasDelayed || hasNotStartedPastSchedule || (lastScheduleDate && lastScheduleDate <= currentDate && progress < 100)) {
      status = 'Terlambat';
    }
  }

  // Update proker in DB
  await connection.query('UPDATE proker SET progres = ?, status = ? WHERE id = ?', [progress, status, prokerId]);

  // Evaluate alerts/notifications
  const alertsToCreate = [];

  // Check condition 1: Belum mulai padahal jadwal sudah berjalan
  if (progress === 0 && firstScheduleDate && firstScheduleDate <= currentDate) {
    alertsToCreate.push({
      type: 'belum_mulai',
      message: `Program kerja "${proker.kegiatan}" belum dimulai padahal jadwal pelaksanaannya sudah dimulai sejak bulan ${firstScheduleDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}.`
    });
  }

  // Check condition 2: Progress tertinggal dari target pada Matriks Kerja
  if (completed < pastTargetCount && progress < 100) {
    alertsToCreate.push({
      type: 'tertinggal',
      message: `Progres program kerja "${proker.kegiatan}" (${progress.toFixed(0)}%) tertinggal dari target Matriks Kerja (harusnya terlaksana ${pastTargetCount} dari ${total} kegiatan, baru terlaksana ${completed}).`
    });
  }

  // Check condition 3: Batas waktu hampir habis tetapi progres masih rendah
  if (lastScheduleDate && progress < 50) {
    const daysToLastSchedule = (lastScheduleDate - currentDate) / (1000 * 60 * 60 * 24);
    if (daysToLastSchedule >= 0 && daysToLastSchedule <= 30) {
      alertsToCreate.push({
        type: 'hampir_habis',
        message: `Tenggat waktu program kerja "${proker.kegiatan}" hampir habis (kurang dari 30 hari lagi) tetapi progres masih rendah (${progress.toFixed(0)}%).`
      });
    }
  }

  // Check condition 4: Program kerja melewati tenggat waktu dan belum selesai
  if (lastScheduleDate && lastScheduleDate <= currentDate && progress < 100) {
    alertsToCreate.push({
      type: 'terlambat',
      message: `Program kerja "${proker.kegiatan}" telah melewati tenggat waktu (${lastScheduleDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}) namun belum selesai.`
    });
  }

  // Handle DB operations for notifications
  // Fetch existing unread notifications
  const [existingNotifs] = await connection.query('SELECT id, type FROM proker_notifications WHERE proker_id = ? AND is_read = 0', [prokerId]);

  // For each alert we detected: insert if not exists
  for (const alert of alertsToCreate) {
    const found = existingNotifs.find(n => n.type === alert.type);
    if (!found) {
      await connection.query('INSERT INTO proker_notifications (proker_id, type, message) VALUES (?, ?, ?)', [prokerId, alert.type, alert.message]);
    }
  }

  // Resolve notifications that no longer apply
  for (const notif of existingNotifs) {
    const remains = alertsToCreate.find(a => a.type === notif.type);
    if (!remains) {
      // Mark as read or delete
      await connection.query('UPDATE proker_notifications SET is_read = 1 WHERE id = ?', [notif.id]);
    }
  }
}

// Evaluates all Prokers
async function evaluateAllProkers() {
  const [prokers] = await pool.query('SELECT id FROM proker');
  for (const p of prokers) {
    await evaluateProker(p.id);
  }
}

// 1. Download Template
exports.getTemplate = async (req, res) => {
  try {
    const headers = [
      'KODE', 'KEGIATAN', 'PENANGGUNG JAWAB', 
      'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari',
      'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
      'Keterangan Terlaksana', 'Keterangan Tidak Terlaksana'
    ];
    
    // Default sample data
    const data = [
      headers,
      ['PRK-001', 'Yasinan dan kultum', 'Silfia', '', '4, 11, 18, 25', '2, 9, 16, 23, 30', '6, 13, 20, 27', '4, 11, 18, 25', '1, 8, 15, 22, 29', '5, 12, 19, 26', '5, 12, 19, 26', '2, 9, 16, 23, 30', '7, 14, 21, 28', '4, 11, 18, 25', '2, 9, 16, 23, 30', 'Yasinan terlaksana rutin setiap malam Jumat.', ''],
      ['PRK-002', 'Kelas belajar mengaji', 'Aryuni Juminarni S.M & Resky Wahyu Irwanto', '', '5, 19', '3, 17', '7, 21', '5, 19', '2, 16', '6, 20', '6, 20', '3, 17', '8, 22', '5, 19', '3, 17', '', ''],
      ['PRK-003', 'TOT', 'Arsyidsyah Anwar', '', '', '22-23 Lis', '', '', '', '', '', '', '', '', '', 'Training of Trainer sukses dilaksanakan.', '']
    ];

    const wb = XLSX.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    const wscols = [
      { wch: 10 }, // KODE
      { wch: 30 }, // KEGIATAN
      { wch: 40 }, // PENANGGUNG JAWAB
      { wch: 12 }, // Agustus
      { wch: 15 }, // September
      { wch: 15 }, // Oktober
      { wch: 15 }, // November
      { wch: 15 }, // Desember
      { wch: 15 }, // Januari
      { wch: 15 }, // Februari
      { wch: 15 }, // Maret
      { wch: 15 }, // April
      { wch: 15 }, // Mei
      { wch: 15 }, // Juni
      { wch: 15 }, // Juli
      { wch: 30 }, // Terlaksana
      { wch: 30 }  // Tidak Terlaksana
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, 'Template Proker');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=template_proker.xlsx');
    res.send(buf);
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ message: 'Gagal mendownload template' });
  }
};

// 2. Upload Excel
exports.uploadProker = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File Excel tidak ditemukan' });
  }

  const { tahun_kepengurusan } = req.body;
  if (!tahun_kepengurusan) {
    return res.status(400).json({ message: 'Tahun Kepengurusan wajib ditentukan' });
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const workbook = XLSX.readFile(req.file.path);
    let worksheet = null;
    let sheetName = '';
    let rows = [];

    // Find the sheet that contains the proker data
    for (const name of workbook.SheetNames) {
      const sheet = workbook.Sheets[name];
      const tempRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      let hasKegiatan = false;
      for (let i = 0; i < Math.min(tempRows.length, 20); i++) {
        if (tempRows[i] && tempRows[i].some(cell => {
          if (!cell) return false;
          const val = cell.toString().trim().toUpperCase().replace(/\s+/g, '');
          return val === 'KEGIATAN' || val === 'PROGRAMKERJA' || val === 'PROKER';
        })) {
          hasKegiatan = true;
          break;
        }
      }
      
      if (hasKegiatan) {
        worksheet = sheet;
        sheetName = name;
        rows = tempRows;
        break;
      }
    }

    if (!worksheet) {
      sheetName = workbook.SheetNames[0];
      worksheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    }

    if (rows.length < 2) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'File Excel tidak memiliki baris data' });
    }

    // 1. Smart Scanner to find the header row containing KEGIATAN/PROGRAM KERJA and PENANGGUNG JAWAB
    let headerRowIdx = -1;
    let kegiatanIdx = -1;
    let pjIdx = -1;
    let kodeIdx = -1;
    let remarksTerlaksanaIdx = -1;
    let remarksTidakTerlaksanaIdx = -1;

    for (let i = 0; i < Math.min(rows.length, 15); i++) {
      const row = rows[i];
      if (!row) continue;
      
      const kIdx = row.findIndex(cell => {
        if (!cell) return false;
        const val = cell.toString().trim().toUpperCase().replace(/\s+/g, '');
        return val === 'KEGIATAN' || val === 'PROGRAMKERJA' || val === 'PROKER';
      });
      const pIdx = row.findIndex(cell => cell && cell.toString().trim().toUpperCase().replace(/\s+/g, '') === 'PENANGGUNGJAWAB');
      
      if (kIdx !== -1 && pIdx !== -1) {
        headerRowIdx = i;
        kegiatanIdx = kIdx;
        pjIdx = pIdx;
        break;
      }
    }

    if (headerRowIdx === -1) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ 
        message: 'Format file tidak sesuai. Pastikan file Excel berisi kolom "KEGIATAN" (atau "Program Kerja") dan "PENANGGUNG JAWAB".' 
      });
    }

    // 2. Scan for KODE and Keterangan columns in header area (rows headerRowIdx to headerRowIdx + 2)
    for (let r = headerRowIdx; r <= Math.min(headerRowIdx + 2, rows.length - 1); r++) {
      const row = rows[r];
      if (!row) continue;
      
      if (kodeIdx === -1) {
        kodeIdx = row.findIndex(cell => cell && cell.toString().trim().toUpperCase() === 'KODE');
      }
      
      for (let c = 0; c < row.length; c++) {
        const cellVal = row[c]?.toString().trim().toLowerCase().replace(/\s+/g, '');
        if (remarksTerlaksanaIdx === -1 && (cellVal === 'terlaksana' || cellVal === 'keteranganterlaksana')) {
          remarksTerlaksanaIdx = c;
        }
        if (remarksTidakTerlaksanaIdx === -1 && (cellVal === 'tidakterlaksana' || cellVal === 'keterangantidakterlaksana')) {
          remarksTidakTerlaksanaIdx = c;
        }
      }
    }

    // 3. Scan for Month Columns in the header area (rows headerRowIdx to headerRowIdx + 3)
    const monthsOrder = ['Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli'];
    const monthColMap = {}; // monthName -> colIndex

    for (const month of monthsOrder) {
      let foundColIdx = -1;
      for (let r = headerRowIdx; r <= Math.min(headerRowIdx + 3, rows.length - 1); r++) {
        const row = rows[r];
        if (!row) continue;
        const idx = row.findIndex(cell => cell && cell.toString().trim().toLowerCase() === month.toLowerCase());
        if (idx !== -1) {
          foundColIdx = idx;
          break;
        }
      }
      if (foundColIdx !== -1) {
        monthColMap[month] = foundColIdx;
      }
    }

    const validationErrors = [];
    const prokerData = [];

    // 4. Parse rows & validate data (starting from the row after the header areas)
    for (let i = headerRowIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      // Skip row if it matches any header text (e.g. is the month header row itself)
      const isHeaderRow = row[kegiatanIdx]?.toString().trim().toUpperCase() === 'KEGIATAN' || 
                          row.some(cell => cell && monthsOrder.includes(cell.toString().trim()));
      if (isHeaderRow) continue;

      const kegiatan = row[kegiatanIdx]?.toString().trim();
      const pj = row[pjIdx]?.toString().trim();
      
      // If kegiatan and pj are both empty, we treat it as an empty row and skip
      if (!kegiatan && !pj) continue;

      if (!kegiatan) {
        validationErrors.push(`Baris ${i + 1}: Nama kegiatan wajib diisi.`);
        continue;
      }
      if (!pj) {
        validationErrors.push(`Baris ${i + 1}: Penanggung jawab wajib diisi.`);
        continue;
      }

      const rawKode = kodeIdx !== -1 ? row[kodeIdx]?.toString().trim() : null;
      const remarksTerlaksana = remarksTerlaksanaIdx !== -1 ? row[remarksTerlaksanaIdx]?.toString().trim() : '';
      const remarksTidakTerlaksana = remarksTidakTerlaksanaIdx !== -1 ? row[remarksTidakTerlaksanaIdx]?.toString().trim() : '';

      // Parse schedule dates using the column mapping we discovered
      const schedules = [];
      monthsOrder.forEach(month => {
        const mIdx = monthColMap[month];
        if (mIdx !== undefined && row[mIdx]) {
          const val = row[mIdx].toString().trim();
          if (val) {
            const parts = val.split(/[,;\n]+/).map(p => p.trim()).filter(Boolean);
            parts.forEach(part => {
              schedules.push({
                bulan: month,
                tanggal: part
              });
            });
          }
        }
      });

      prokerData.push({
        rawLine: i + 1,
        kode: rawKode || `PRK-${Date.now().toString().slice(-6)}-${i}`,
        kegiatan,
        pj,
        remarksTerlaksana,
        remarksTidakTerlaksana,
        schedules
      });
    }

    if (validationErrors.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'Validasi data gagal', errors: validationErrors });
    }

    // Process DB changes
    for (const data of prokerData) {
      // 1. Check if Proker exists by Kode or Kegiatan Name in this year
      let prokerId = null;
      let [existing] = await connection.query(
        'SELECT id FROM proker WHERE kode = ? AND tahun_kepengurusan = ?',
        [data.kode, tahun_kepengurusan]
      );

      if (existing.length === 0) {
        // Fallback search by Kegiatan name
        [existing] = await connection.query(
          'SELECT id, kode FROM proker WHERE kegiatan = ? AND tahun_kepengurusan = ?',
          [data.kegiatan, tahun_kepengurusan]
        );
      }

      if (existing.length > 0) {
        prokerId = existing[0].id;
        // Update basic info
        await connection.query(
          `UPDATE proker SET kegiatan = ?, penanggung_jawab = ?, keterangan_terlaksana = ?, keterangan_tidak_terlaksana = ? 
           WHERE id = ?`,
          [data.kegiatan, data.pj, data.remarksTerlaksana, data.remarksTidakTerlaksana, prokerId]
        );
      } else {
        // Insert new proker
        const [insertRes] = await connection.query(
          `INSERT INTO proker (kode, kegiatan, penanggung_jawab, tahun_kepengurusan, keterangan_terlaksana, keterangan_tidak_terlaksana)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [data.kode, data.kegiatan, data.pj, tahun_kepengurusan, data.remarksTerlaksana, data.remarksTidakTerlaksana]
        );
        prokerId = insertRes.insertId;
      }

      // 2. Fetch existing schedule items
      const [existingSchedules] = await connection.query(
        'SELECT id, bulan, tanggal, status FROM proker_schedule WHERE proker_id = ?',
        [prokerId]
      );

      // Build key maps for comparison
      const existingMap = new Map();
      existingSchedules.forEach(s => {
        const key = `${s.bulan.toLowerCase()}_${s.tanggal.toLowerCase().trim()}`;
        existingMap.set(key, s);
      });

      // Track ids we want to keep
      const keepIds = [];

      for (const newSched of data.schedules) {
        const key = `${newSched.bulan.toLowerCase()}_${newSched.tanggal.toLowerCase().trim()}`;
        if (existingMap.has(key)) {
          const matched = existingMap.get(key);
          keepIds.push(matched.id);
        } else {
          // Insert new schedule item
          const [insSched] = await connection.query(
            'INSERT INTO proker_schedule (proker_id, bulan, tanggal, status) VALUES (?, ?, ?, "Belum Mulai")',
            [prokerId, newSched.bulan, newSched.tanggal]
          );
          keepIds.push(insSched.insertId);
        }
      }

      // Delete any schedules not in the Excel row
      if (existingSchedules.length > 0) {
        const deleteIds = existingSchedules.filter(s => !keepIds.includes(s.id)).map(s => s.id);
        if (deleteIds.length > 0) {
          await connection.query('DELETE FROM proker_schedule WHERE id IN (?)', [deleteIds]);
        }
      }

      // 3. Evaluate this specific proker's progress and status
      await evaluateProker(prokerId, connection);
    }

    // Record file upload history in database
    await connection.query(
      'INSERT INTO proker_files (filename, original_name, file_path, file_size) VALUES (?, ?, ?, ?)',
      [req.file.filename, req.file.originalname, `/uploads/proker/${req.file.filename}`, req.file.size]
    );

    await connection.commit();
    connection.release();

    res.json({ message: `Berhasil mengunggah ${prokerData.length} Program Kerja.` });
  } catch (error) {
    await connection.rollback();
    connection.release();
    logError('uploadProker', error);
    res.status(500).json({ 
      message: 'Gagal memproses file Excel', 
      error: error.message 
    });
  }
};

// 3. Get all Prokers
exports.getAllProker = async (req, res) => {
  try {
    const { status, tahun } = req.query;
    let query = 'SELECT * FROM proker';
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (tahun) {
      conditions.push('tahun_kepengurusan = ?');
      params.push(tahun);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);

    // Fetch schedules for each proker
    const prokers = [];
    for (const r of rows) {
      const [schedules] = await pool.query('SELECT * FROM proker_schedule WHERE proker_id = ?', [r.id]);
      
      // Calculate color indicator dynamically
      const evaluation = await calculateColorAndHealth(r, schedules);

      prokers.push({
        ...r,
        schedules,
        indicator: evaluation.indicator,
        pastTargetCount: evaluation.pastTargetCount,
        shouldBeCompletedCount: evaluation.shouldBeCompletedCount
      });
    }

    res.json(prokers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Helper for quick color & progress evaluation
async function calculateColorAndHealth(proker, schedules) {
  if (schedules.length === 0) {
    return { indicator: 'green', pastTargetCount: 0, shouldBeCompletedCount: 0 };
  }

  const currentDate = new Date();
  let pastTargetCount = 0;
  let hasDelayed = false;
  let hasNotStartedPastSchedule = false;
  let firstScheduleDate = null;
  let lastScheduleDate = null;
  const total = schedules.length;
  const completed = schedules.filter(s => s.status === 'Terlaksana').length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  for (const s of schedules) {
    const sDate = getScheduleDate(proker.tahun_kepengurusan, s.bulan, s.tanggal);
    if (sDate) {
      if (!firstScheduleDate || sDate < firstScheduleDate) firstScheduleDate = sDate;
      if (!lastScheduleDate || sDate > lastScheduleDate) lastScheduleDate = sDate;

      if (sDate <= currentDate) {
        pastTargetCount++;
        if (s.status === 'Tidak Terlaksana') {
          hasDelayed = true;
        }
        if (s.status === 'Belum Mulai') {
          hasNotStartedPastSchedule = true;
        }
      }
    }
  }

  let indicator = 'green';
  if (progress === 100) {
    indicator = 'green';
  } else if (hasDelayed || hasNotStartedPastSchedule || (lastScheduleDate && lastScheduleDate <= currentDate && progress < 100)) {
    indicator = 'red'; // Overdue / Missed targets
  } else {
    // Yellow cases
    const daysToLastSchedule = lastScheduleDate ? (lastScheduleDate - currentDate) / (1000 * 60 * 60 * 24) : null;
    if (progress < 100 && firstScheduleDate && firstScheduleDate <= currentDate && progress === 0) {
      indicator = 'yellow';
    } else if (completed < pastTargetCount) {
      indicator = 'yellow';
    } else if (daysToLastSchedule !== null && daysToLastSchedule >= 0 && daysToLastSchedule <= 30 && progress < 50) {
      indicator = 'yellow';
    }
  }

  return {
    indicator,
    pastTargetCount,
    shouldBeCompletedCount: pastTargetCount
  };
}

// 4. Update Schedule Event
exports.updateScheduleStatus = async (req, res) => {
  const { id, scheduleId } = req.params;
  const { status } = req.body;

  if (!['Belum Mulai', 'Terlaksana', 'Tidak Terlaksana'].includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE proker_schedule SET status = ? WHERE id = ? AND proker_id = ?',
      [status, scheduleId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Agenda tidak ditemukan' });
    }

    // Re-evaluate proker stats and notifications
    await evaluateProker(id);

    // Fetch updated proker and schedule
    const [[proker]] = await pool.query('SELECT * FROM proker WHERE id = ?', [id]);
    const [schedules] = await pool.query('SELECT * FROM proker_schedule WHERE proker_id = ?', [id]);
    const evalResult = await calculateColorAndHealth(proker, schedules);

    res.json({
      message: 'Status agenda berhasil diperbarui',
      progres: proker.progres,
      status: proker.status,
      indicator: evalResult.indicator
    });
  } catch (error) {
    console.error('Error updating schedule status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 5. Get Notifications
exports.getNotifications = async (req, res) => {
  try {
    // Run evaluation first to ensure latest warnings are generated
    await evaluateAllProkers();

    const [rows] = await pool.query(`
      SELECT n.*, p.kegiatan, p.penanggung_jawab 
      FROM proker_notifications n 
      JOIN proker p ON n.proker_id = p.id 
      WHERE n.is_read = 0 
      ORDER BY n.created_at DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching warnings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 6. Mark Notification as Read
exports.readNotification = async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE proker_notifications SET is_read = 1 WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
    }
    res.json({ message: 'Notifikasi berhasil dibaca' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 7. Get Proker Dashboard metrics & chart data
exports.getProkerDashboard = async (req, res) => {
  try {
    // Run evaluation first to ensure accuracy
    await evaluateAllProkers();

    const { tahun } = req.query;
    let query = 'SELECT * FROM proker';
    const params = [];
    if (tahun) {
      query += ' WHERE tahun_kepengurusan = ?';
      params.push(tahun);
    }

    const [rows] = await pool.query(query, params);

    let total = rows.length;
    let completed = 0;
    let running = 0;
    let delayed = 0;
    let notStarted = 0;

    const monthlyTargetMap = {};
    const monthlyActualMap = {};

    const monthsOrder = ['Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli'];
    monthsOrder.forEach(m => {
      monthlyTargetMap[m] = 0;
      monthlyActualMap[m] = 0;
    });

    for (const r of rows) {
      const [schedules] = await pool.query('SELECT * FROM proker_schedule WHERE proker_id = ?', [r.id]);
      const evalRes = await calculateColorAndHealth(r, schedules);
      
      if (r.status === 'Selesai') {
        completed++;
      } else if (r.status === 'Belum Mulai') {
        notStarted++;
      } else if (r.status === 'Terlambat') {
        delayed++;
      } else {
        running++;
      }

      // Add to monthly data
      schedules.forEach(s => {
        if (monthlyTargetMap[s.bulan] !== undefined) {
          monthlyTargetMap[s.bulan]++;
          if (s.status === 'Terlaksana') {
            monthlyActualMap[s.bulan]++;
          }
        }
      });
    }

    // Format chart data
    const chartData = monthsOrder.map(m => ({
      name: m,
      target: monthlyTargetMap[m],
      realisasi: monthlyActualMap[m]
    }));

    res.json({
      stats: {
        total,
        completed,
        running,
        delayed,
        notStarted
      },
      chartData
    });
  } catch (error) {
    logError('getProkerDashboard', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 8. Get list of uploaded Excel files
exports.getUploadedFiles = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM proker_files ORDER BY uploaded_at DESC');
    res.json(rows);
  } catch (error) {
    logError('getUploadedFiles', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
