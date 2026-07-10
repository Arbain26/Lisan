const pool = require('../config/db');

async function check() {
  const [rows] = await pool.query('SELECT id, kode, kegiatan, penanggung_jawab, tahun_kepengurusan FROM proker ORDER BY id');
  console.log(`--- Total Prokers in DB: ${rows.length} ---`);
  rows.forEach(r => {
    console.log(`ID: ${r.id} | KODE: ${r.kode} | KEGIATAN: "${r.kegiatan}" | PJ: "${r.penanggung_jawab}" | TAHUN: ${r.tahun_kepengurusan}`);
  });
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
