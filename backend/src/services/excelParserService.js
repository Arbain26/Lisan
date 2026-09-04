const XLSX = require('xlsx');

/**
 * Excel Parser Service for Proker Spreadsheets
 */

exports.generateTemplateWorkbook = () => {
  const headers = [
    'KODE', 'KEGIATAN', 'PENANGGUNG JAWAB', 
    'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari',
    'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
    'Keterangan Terlaksana', 'Keterangan Tidak Terlaksana'
  ];
  
  const data = [
    headers,
    ['PRK-001', 'Yasinan dan kultum', 'Silfia', '', '4, 11, 18, 25', '2, 9, 16, 23, 30', '6, 13, 20, 27', '4, 11, 18, 25', '1, 8, 15, 22, 29', '5, 12, 19, 26', '5, 12, 19, 26', '2, 9, 16, 23, 30', '7, 14, 21, 28', '4, 11, 18, 25', '2, 9, 16, 23, 30', 'Yasinan terlaksana rutin setiap malam Jumat.', ''],
    ['PRK-002', 'Kelas belajar mengaji', 'Aryuni Juminarni S.M & Resky Wahyu Irwanto', '', '5, 19', '3, 17', '7, 21', '5, 19', '2, 16', '6, 20', '6, 20', '3, 17', '8, 22', '5, 19', '3, 17', '', ''],
    ['PRK-003', 'TOT', 'Arsyidsyah Anwar', '', '', '22-23 Lis', '', '', '', '', '', '', '', '', '', 'Training of Trainer sukses dilaksanakan.', '']
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  ws['!cols'] = [
    { wch: 10 }, { wch: 30 }, { wch: 40 },
    { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 30 }, { wch: 30 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Template Proker');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

exports.parseProkerWorkbook = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  let targetSheet = null;
  let detectedSheetName = '';

  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    const testRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const isProkerSheet = testRows.some(row => 
      Array.isArray(row) && row.some(cell => 
        cell && typeof cell === 'string' && (
          cell.toLowerCase().includes('kegiatan') || 
          cell.toLowerCase().includes('proker') || 
          cell.toLowerCase().includes('program')
        )
      )
    );
    if (isProkerSheet) {
      targetSheet = sheet;
      detectedSheetName = name;
      break;
    }
  }

  if (!targetSheet && workbook.SheetNames.length > 0) {
    detectedSheetName = workbook.SheetNames[0];
    targetSheet = workbook.Sheets[detectedSheetName];
  }

  const rawRows = XLSX.utils.sheet_to_json(targetSheet, { header: 1, defval: '' });
  return {
    rawRows,
    sheetName: detectedSheetName,
  };
};
