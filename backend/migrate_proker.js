const pool = require('./config/db');

async function migrate() {
  console.log('Starting migration for Program Kerja (Proker) tables...');

  // 1. Create proker table
  console.log('Creating proker table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`proker\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`kode\` varchar(50) NOT NULL,
      \`kegiatan\` varchar(255) NOT NULL,
      \`penanggung_jawab\` varchar(255) NOT NULL,
      \`tahun_kepengurusan\` varchar(50) NOT NULL,
      \`progres\` decimal(5,2) DEFAULT 0.00,
      \`status\` enum('Belum Mulai','Sedang Berjalan','Selesai','Terlambat') DEFAULT 'Belum Mulai',
      \`keterangan_terlaksana\` text,
      \`keterangan_tidak_terlaksana\` text,
      \`created_at\` timestamp DEFAULT current_timestamp(),
      \`updated_at\` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`kode_tahun\` (\`kode\`, \`tahun_kepengurusan\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 2. Create proker_schedule table
  console.log('Creating proker_schedule table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`proker_schedule\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`proker_id\` int(11) NOT NULL,
      \`bulan\` varchar(20) NOT NULL,
      \`tanggal\` varchar(50) NOT NULL,
      \`status\` enum('Belum Mulai','Terlaksana','Tidak Terlaksana') DEFAULT 'Belum Mulai',
      \`keterangan\` text,
      \`foto_url\` varchar(255),
      \`updated_at\` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (\`id\`),
      KEY \`proker_id\` (\`proker_id\`),
      CONSTRAINT \`fk_schedule_proker\` FOREIGN KEY (\`proker_id\`) REFERENCES \`proker\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 3. Create proker_notifications table
  console.log('Creating proker_notifications table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`proker_notifications\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`proker_id\` int(11) NOT NULL,
      \`type\` varchar(50) NOT NULL,
      \`message\` text NOT NULL,
      \`is_read\` tinyint(1) DEFAULT 0,
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`),
      KEY \`proker_id\` (\`proker_id\`),
      CONSTRAINT \`fk_notifications_proker\` FOREIGN KEY (\`proker_id\`) REFERENCES \`proker\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Migration completed successfully!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
