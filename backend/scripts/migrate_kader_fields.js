const pool = require('./config/db');

async function migrate() {
  console.log('Re-structuring kader table to use: nama, institusi, angkatan, and tahun...');
  
  // Drop old table to clean up unused columns
  await pool.query('DROP TABLE IF EXISTS `kader`');
  
  await pool.query(`
    CREATE TABLE \`kader\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`nama\` varchar(150) NOT NULL,
      \`institusi\` varchar(150) NOT NULL,
      \`angkatan\` varchar(50) NOT NULL,
      \`tahun\` varchar(10) NOT NULL,
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
