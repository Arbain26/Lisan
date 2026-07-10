const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '..', 'uploads', 'proker', 'Matrix-kerja-LISAN-2025-2026-1783697148555-101142011.xlsx');

try {
  console.log('Reading file:', filePath);
  const workbook = XLSX.readFile(filePath);
  console.log('Workbook Sheet Names:', workbook.SheetNames);

  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    const tempRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`\n--- SHEET: "${name}" (rows: ${tempRows.length}) ---`);
    for (let i = 0; i < Math.min(tempRows.length, 5); i++) {
      console.log(`  Row ${i}:`, tempRows[i]);
    }
  }

  // Find the sheet that contains the proker data
  let worksheet = null;
  let sheetName = '';
  let rows = [];

  if (!worksheet) {
    sheetName = workbook.SheetNames[0];
    worksheet = workbook.Sheets[sheetName];
    rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  }

  console.log('Selected Sheet:', sheetName);
  console.log('Total rows:', rows.length);

  // Print first 5 rows
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    console.log(`Row ${i}:`, rows[i]);
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

  console.log('Scanner Results:', {
    headerRowIdx,
    kegiatanIdx,
    pjIdx
  });

  if (headerRowIdx === -1) {
    console.error('Error: Format file tidak sesuai. Pastikan file Excel berisi kolom "KEGIATAN" dan "PENANGGUNG JAWAB".');
    process.exit(1);
  }

  // Scan for other columns
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

  console.log('Other Columns:', {
    kodeIdx,
    remarksTerlaksanaIdx,
    remarksTidakTerlaksanaIdx
  });

  // Scan for Month Columns
  const monthsOrder = ['Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli'];
  const monthColMap = {};

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

  console.log('Months Mapping:', monthColMap);

  const validationErrors = [];
  const prokerData = [];

  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const isHeaderRow = row[kegiatanIdx]?.toString().trim().toUpperCase() === 'KEGIATAN' || 
                        row.some(cell => cell && monthsOrder.includes(cell.toString().trim()));
    if (isHeaderRow) continue;

    const kegiatan = row[kegiatanIdx]?.toString().trim();
    const pj = row[pjIdx]?.toString().trim();
    
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

  console.log('Successfully Parsed items count:', prokerData.length);
  if (prokerData.length > 0) {
    console.log('Sample parsed item:', prokerData[0]);
  }
  
  if (validationErrors.length > 0) {
    console.error('Validation Errors:', validationErrors);
  }

} catch (err) {
  console.error('Fatal parsing error:', err);
}
