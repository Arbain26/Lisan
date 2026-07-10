const pool = require('./config/db');

async function migrate() {
  console.log('Starting migration for proker_files table...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`proker_files\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`filename\` varchar(255) NOT NULL,
      \`original_name\` varchar(255) NOT NULL,
      \`file_path\` varchar(255) NOT NULL,
      \`file_size\` int(11) NOT NULL,
      \`uploaded_at\` timestamp DEFAULT current_timestamp(),
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
