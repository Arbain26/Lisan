/**
 * Date & Calendar helper for Academic / Period calendar (e.g. 2025/2026)
 */

const MONTHS_MAP = {
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

function getScheduleDate(tahunKepengurusan, bulanStr, tanggalStr) {
  if (!bulanStr) return null;
  const key = bulanStr.toString().trim().toLowerCase();
  const mInfo = MONTHS_MAP[key];
  if (!mInfo) return null;

  let startYear = 2025;
  let endYear = 2026;

  if (tahunKepengurusan && tahunKepengurusan.includes('/')) {
    const parts = tahunKepengurusan.split('/');
    startYear = parseInt(parts[0], 10) || 2025;
    endYear = parseInt(parts[1], 10) || (startYear + 1);
  } else if (tahunKepengurusan) {
    const y = parseInt(tahunKepengurusan, 10);
    if (!isNaN(y)) {
      startYear = y - 1;
      endYear = y;
    }
  }

  const year = mInfo.isGanjil ? startYear : endYear;
  const numMatch = (tanggalStr || '').toString().match(/\d+/);
  const dateNum = numMatch ? parseInt(numMatch[0], 10) : 1;

  return new Date(year, mInfo.idx, dateNum);
}

module.exports = {
  MONTHS_MAP,
  getScheduleDate,
};
