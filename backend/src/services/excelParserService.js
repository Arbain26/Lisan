const XLSX = require('xlsx');

/**
 * Excel Parser Service for Proker Spreadsheets
 */

exports.generateTemplateWorkbook = () => {
  const headers = [
    [
      'No', 'Kode', 'Program Kerja / Kegiatan', 'Penanggung Jawab', 
      'Bulan Perencanaan', '', '', '', '', '', '', '', '', '', '', '', 
      'Keterangan Terlaksana', 'Keterangan Tidak Terlaksana'
    ],
    [
      '', '', '', '', 
      'Semester Ganjil', '', '', '', '', '', 
      'Semester Genap', '', '', '', '', '', 
      '', ''
    ],
    [
      '', '', '', '', 
      'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari',
      'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
      '', ''
    ]
  ];
  
  const sampleData = [
    [1, 'PRK-001', 'Yasinan dan kultum', 'Silfia', '', '4, 11, 18, 25', '2, 9, 16, 23, 30', '6, 13, 20, 27', '4, 11, 18, 25', '1, 8, 15, 22, 29', '5, 12, 19, 26', '5, 12, 19, 26', '2, 9, 16, 23, 30', '7, 14, 21, 28', '4, 11, 18, 25', '2, 9, 16, 23, 30', 'Yasinan terlaksana rutin setiap malam Jumat.', ''],
    [2, 'PRK-002', 'Kelas belajar mengaji', 'Aryuni Juminarni S.M & Resky Wahyu Irwanto', '', '5, 19', '3, 17', '7, 21', '5, 19', '2, 16', '6, 20', '6, 20', '3, 17', '8, 22', '5, 19', '3, 17', '', ''],
    [3, 'PRK-003', 'TOT (Training of Trainer)', 'Arsyidsyah Anwar', '', '', '22-23 Lis', '', '', '', '', '', '', '', '', '', 'Training of Trainer sukses dilaksanakan.', '']
  ];

  const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleData]);

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } },  // No
    { s: { r: 0, c: 1 }, e: { r: 2, c: 1 } },  // Kode
    { s: { r: 0, c: 2 }, e: { r: 2, c: 2 } },  // Program Kerja
    { s: { r: 0, c: 3 }, e: { r: 2, c: 3 } },  // Penanggung Jawab
    { s: { r: 0, c: 4 }, e: { r: 0, c: 15 } }, // Bulan Perencanaan
    { s: { r: 1, c: 4 }, e: { r: 1, c: 9 } },  // Semester Ganjil (Agustus - Januari)
    { s: { r: 1, c: 10 }, e: { r: 1, c: 15 } },// Semester Genap (Februari - Juli)
    { s: { r: 0, c: 16 }, e: { r: 2, c: 16 } }, // Keterangan Terlaksana
    { s: { r: 0, c: 17 }, e: { r: 2, c: 17 } }  // Keterangan Tidak Terlaksana
  ];

  ws['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 38 },
    { wch: 35 },
    { wch: 15 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
    { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
    { wch: 38 },
    { wch: 38 }
  ];

  ws['!rows'] = [
    { hpt: 26 },
    { hpt: 22 },
    { hpt: 22 },
    { hpt: 22 },
    { hpt: 22 },
    { hpt: 22 }
  ];

  const wb = XLSX.utils.book_new();
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
