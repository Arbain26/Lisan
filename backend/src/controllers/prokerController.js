const pool = require('../../config/db');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { logError } = require('../utils/logger');
const { getScheduleDate } = require('../utils/dateHelper');
const { evaluateProker, evaluateAllProkers } = require('../services/prokerService');
const { generateTemplateWorkbook } = require('../services/excelParserService');
const { uploadToStorage } = require('../services/supabaseStorage');

// 1. Download Template
exports.getTemplate = async (req, res) => {
  try {
    const buf = generateTemplateWorkbook();

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
    const workbook = req.file.buffer ? XLSX.read(req.file.buffer, { type: 'buffer' }) : XLSX.readFile(req.file.path);
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
        const val = cell.toString().trim().toUpperCase().replace(/[^A-Z]/g, '');
        return val.includes('KEGIATAN') || val.includes('PROGRAM') || val.includes('PROKER');
      });
      const pIdx = row.findIndex(cell => {
        if (!cell) return false;
        const val = cell.toString().trim().toUpperCase().replace(/[^A-Z]/g, '');
        return val.includes('PENANGGUNG') || val.includes('PJ') || val.includes('PIC') || val.includes('KOORDINATOR');
      });
      
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

      const kegiatan = row[kegiatanIdx]?.toString().trim().replace(/\s+/g, ' ');
      const pj = row[pjIdx]?.toString().trim().replace(/\s+/g, ' ');
      
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
      const seenScheds = new Set();
      monthsOrder.forEach(month => {
        const mIdx = monthColMap[month];
        if (mIdx !== undefined && row[mIdx]) {
          const val = row[mIdx].toString().trim();
          if (val) {
            const parts = val.split(/[,;\n]+/).map(p => p.trim()).filter(Boolean);
            parts.forEach(part => {
              const schedKey = `${month.toLowerCase()}_${part.toLowerCase()}`;
              if (!seenScheds.has(schedKey)) {
                seenScheds.add(schedKey);
                schedules.push({
                  bulan: month,
                  tanggal: part
                });
              }
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
      // 1. Check if Proker exists by Kode or Kegiatan Name in this year (using TRIM to ignore spacing differences)
      let prokerId = null;
      let [existing] = await connection.query(
        'SELECT id FROM proker WHERE TRIM(kode) = TRIM(?) AND tahun_kepengurusan = ?',
        [data.kode, tahun_kepengurusan]
      );

      if (existing.length === 0) {
        // Fallback search by Kegiatan name (using TRIM to ignore spacing differences)
        [existing] = await connection.query(
          'SELECT id, kode FROM proker WHERE TRIM(kegiatan) = TRIM(?) AND tahun_kepengurusan = ?',
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
            'INSERT INTO proker_schedule (proker_id, bulan, tanggal, status) VALUES (?, ?, ?, ?)',
            [prokerId, newSched.bulan, newSched.tanggal, 'Belum Mulai']
          );
          keepIds.push(insSched.insertId);
        }
      }

      // Delete any schedules not in the Excel row
      if (existingSchedules.length > 0) {
        const deleteIds = existingSchedules.filter(s => !keepIds.includes(s.id)).map(s => s.id);
        if (deleteIds.length > 0) {
          const placeholders = deleteIds.map(() => '?').join(', ');
          await connection.query(`DELETE FROM proker_schedule WHERE id IN (${placeholders})`, deleteIds);
        }
      }

      // 3. Evaluate this specific proker's progress and status
      await evaluateProker(prokerId, connection);
    }

    // Record file upload history in database
    const savedName = req.file.filename || req.file.originalname;
    await connection.query(
      'INSERT INTO proker_files (filename, original_name, file_path, file_size) VALUES (?, ?, ?, ?)',
      [savedName, req.file.originalname, `/uploads/proker/${savedName}`, req.file.size]
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
  const { status, keterangan } = req.body;

  if (!['Belum Mulai', 'Terlaksana', 'Tidak Terlaksana'].includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid' });
  }

  try {
    let foto_url = null;
    if (req.file) {
      foto_url = await uploadToStorage(req.file, 'proker');
    }

    let query = 'UPDATE proker_schedule SET status = ?';
    const params = [status];

    if (keterangan !== undefined) {
      query += ', keterangan = ?';
      params.push(keterangan);
    }

    if (foto_url !== null) {
      query += ', foto_url = ?';
      params.push(foto_url);
    } else if (status === 'Belum Mulai' || status === 'Tidak Terlaksana') {
      // Clear proof if status is reverted
      query += ', keterangan = NULL, foto_url = NULL';
    }

    query += ' WHERE id = ? AND proker_id = ?';
    params.push(scheduleId, id);

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Agenda tidak ditemukan' });
    }

    // Re-evaluate proker stats and notifications
    await evaluateProker(id);

    // Fetch updated proker and schedule
    const [[proker]] = await pool.query('SELECT * FROM proker WHERE id = ?', [id]);
    const [schedules] = await pool.query('SELECT * FROM proker_schedule WHERE proker_id = ?', [id]);
    const evalResult = await calculateColorAndHealth(proker, schedules);

    const [[updatedSched]] = await pool.query('SELECT * FROM proker_schedule WHERE id = ?', [scheduleId]);

    res.json({
      message: 'Status agenda berhasil diperbarui',
      progres: proker.progres,
      status: proker.status,
      indicator: evalResult.indicator,
      schedule: updatedSched
    });
  } catch (error) {
    logError('updateScheduleStatus', error);
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

// 8b. Download original uploaded Excel file
exports.downloadUploadedFile = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM proker_files WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'File tidak ditemukan di database' });
    }
    const file = rows[0];
    const filePath = path.join(__dirname, '..', '..', 'uploads', 'proker', file.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File fisik tidak ditemukan di server' });
    }
    res.download(filePath, file.original_name);
  } catch (error) {
    logError('downloadUploadedFile', error);
    res.status(500).json({ message: 'Gagal mengunduh file' });
  }
};

// 9. Add Manual Schedule Date
exports.addScheduleDate = async (req, res) => {
  const { id } = req.params;
  const { bulan, tanggal } = req.body;

  if (!bulan || !tanggal) {
    return res.status(400).json({ message: 'Bulan dan tanggal wajib diisi' });
  }

  try {
    // Check if the proker exists
    const [[prokerExists]] = await pool.query('SELECT id FROM proker WHERE id = ?', [id]);
    if (!prokerExists) {
      return res.status(404).json({ message: 'Program kerja tidak ditemukan' });
    }

    // Insert schedule
    const [result] = await pool.query(
      'INSERT INTO proker_schedule (proker_id, bulan, tanggal, status) VALUES (?, ?, ?, ?)',
      [id, bulan, tanggal, 'Belum Mulai']
    );

    const newId = result.insertId;

    // Re-evaluate proker stats and notifications
    await evaluateProker(id);

    // Fetch updated proker and schedule
    const [[proker]] = await pool.query('SELECT * FROM proker WHERE id = ?', [id]);
    const [schedules] = await pool.query('SELECT * FROM proker_schedule WHERE proker_id = ?', [id]);
    const evalResult = await calculateColorAndHealth(proker, schedules);
    const [[newSched]] = await pool.query('SELECT * FROM proker_schedule WHERE id = ?', [newId]);

    res.json({
      message: 'Jadwal berhasil ditambahkan',
      progres: proker.progres,
      status: proker.status,
      indicator: evalResult.indicator,
      schedule: newSched
    });
  } catch (error) {
    logError('addScheduleDate', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 10. Edit Manual Schedule Date (Reschedule)
exports.editScheduleDate = async (req, res) => {
  const { id, scheduleId } = req.params;
  const { tanggal } = req.body;

  if (!tanggal) {
    return res.status(400).json({ message: 'Tanggal wajib diisi' });
  }

  try {
    // Update schedule date
    const [result] = await pool.query(
      'UPDATE proker_schedule SET tanggal = ? WHERE id = ? AND proker_id = ?',
      [tanggal, scheduleId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    }

    // Re-evaluate proker stats
    await evaluateProker(id);

    // Fetch updated proker and schedule
    const [[proker]] = await pool.query('SELECT * FROM proker WHERE id = ?', [id]);
    const [schedules] = await pool.query('SELECT * FROM proker_schedule WHERE proker_id = ?', [id]);
    const evalResult = await calculateColorAndHealth(proker, schedules);
    const [[updatedSched]] = await pool.query('SELECT * FROM proker_schedule WHERE id = ?', [scheduleId]);

    res.json({
      message: 'Jadwal berhasil diubah',
      progres: proker.progres,
      status: proker.status,
      indicator: evalResult.indicator,
      schedule: updatedSched
    });
  } catch (error) {
    logError('editScheduleDate', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 11. Delete Manual Schedule Date
exports.deleteScheduleDate = async (req, res) => {
  const { id, scheduleId } = req.params;

  try {
    // Delete schedule
    const [result] = await pool.query(
      'DELETE FROM proker_schedule WHERE id = ? AND proker_id = ?',
      [scheduleId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    }

    // Re-evaluate proker stats and notifications
    await evaluateProker(id);

    // Fetch updated proker and schedules
    const [[proker]] = await pool.query('SELECT * FROM proker WHERE id = ?', [id]);
    const [schedules] = await pool.query('SELECT * FROM proker_schedule WHERE proker_id = ?', [id]);
    
    // In case no schedules left
    let indicator = 'green';
    if (schedules.length > 0) {
      const evalResult = await calculateColorAndHealth(proker, schedules);
      indicator = evalResult.indicator;
    } else {
      // Set to 0% and Belum Mulai if no schedules
      await pool.query('UPDATE proker SET progres = 0, status = ? WHERE id = ?', ['Belum Mulai', id]);
      proker.progres = 0;
      proker.status = "Belum Mulai";
    }

    res.json({
      message: 'Jadwal berhasil dihapus',
      progres: proker.progres,
      status: proker.status,
      indicator: indicator,
      deletedScheduleId: parseInt(scheduleId)
    });
  } catch (error) {
    logError('deleteScheduleDate', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
