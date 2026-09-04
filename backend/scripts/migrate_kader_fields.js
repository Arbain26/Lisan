const pool = require('./config/db');

async function migrate() {
  console.log('Migrating kader table to new schema...');

  // Drop old table
  await pool.query('DROP TABLE IF EXISTS `kader`');

  // Create with new schema matching the spreadsheet structure
  await pool.query(`
    CREATE TABLE \`kader\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`nama\` varchar(150) NOT NULL,
      \`angkatan\` varchar(50) NOT NULL,
      \`kampus\` varchar(150) NOT NULL,
      \`alamat\` varchar(255) DEFAULT NULL,
      \`jenjang_kaderisasi\` varchar(100) DEFAULT NULL,
      \`semester\` varchar(20) DEFAULT NULL,
      \`status\` varchar(50) DEFAULT NULL,
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uq_kader_nama_angkatan\` (\`nama\`, \`angkatan\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Insert seed data from spreadsheet (LIS 5 - UNISAN)
  const kaderData = [
    ['MUHAMMAD KHAIRUL A', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
    ['YUDISTIRA MUDASSIR', 'LIS 5', 'UNISAN', '', 'LOGIKA', 'III', ''],
    ['BILLI', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
    ['MUH. NUR YASIN', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
    ['ALDY RUSLI', 'LIS 5', 'UNISAN', '', 'LOGIKA', 'III', ''],
    ['WINDA', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
    ['DARA TIARA RATILQA', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
    ['GHINA GINAYAH', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
    ['SALWA SALSABILA', 'LIS 5', 'UNISAN', '', 'LOGIKA', 'III', ''],
    ['NUR INDAH SARI', 'LIS 5', 'UNISAN', '', 'PENDALAMAN', 'III', ''],
    ['DIAN NAZLAH KHAIRANI', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
    ['NURUL HAPIPAH', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
    ['ANANDA ELSA', 'LIS 5', 'UNISAN', '', 'PENDALAMAN', 'VII', ''],
    ['RAFLY DWI PUTRA', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
  ];

  for (const row of kaderData) {
    await pool.query(
      'INSERT INTO kader (nama, angkatan, kampus, alamat, jenjang_kaderisasi, semester, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      row
    );
  }

  console.log(`Migration completed! Inserted ${kaderData.length} kader records.`);
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
