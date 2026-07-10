const pool = require('./config/db');

async function migrate() {
  console.log('Creating kader table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`kader\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`nama\` varchar(150) NOT NULL,
      \`nim\` varchar(50) DEFAULT NULL,
      \`angkatan\` varchar(10) NOT NULL,
      \`jurusan\` varchar(100) DEFAULT NULL,
      \`no_hp\` varchar(20) DEFAULT NULL,
      \`status\` enum('Aktif', 'Alumni', 'Pasif') DEFAULT 'Aktif',
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Migration completed successfully!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
