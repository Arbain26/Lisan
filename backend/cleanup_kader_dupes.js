const pool = require('./config/db');

async function cleanup() {
  // Delete duplicates: keep only the LOWEST id for each nama+angkatan pair
  const [result] = await pool.query(`
    DELETE k1 FROM kader k1
    INNER JOIN kader k2
    WHERE k1.id > k2.id
      AND LOWER(TRIM(k1.nama)) = LOWER(TRIM(k2.nama))
      AND LOWER(TRIM(k1.angkatan)) = LOWER(TRIM(k2.angkatan))
  `);
  console.log('Deleted', result.affectedRows, 'duplicate rows');

  const [rows] = await pool.query('SELECT COUNT(*) as total, angkatan FROM kader GROUP BY angkatan ORDER BY angkatan');
  console.log('Remaining data per angkatan:');
  rows.forEach(r => console.log(' -', r.angkatan, ':', r.total, 'kader'));

  const [total] = await pool.query('SELECT COUNT(*) as c FROM kader');
  console.log('Total kader now:', total[0].c);
  process.exit(0);
}

cleanup().catch(e => { console.error(e.message); process.exit(1); });
