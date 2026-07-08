const pool = require('./config/db');

async function setupRelawanTable() {
  try {
    console.log('Dropping relawan table if exists...');
    await pool.query('DROP TABLE IF EXISTS \`relawan\`');

    console.log('Creating relawan table if not exists...');
    const query = `
      CREATE TABLE IF NOT EXISTS \`relawan\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`nama\` varchar(150) NOT NULL,
        \`instansi\` varchar(150) NOT NULL,
        \`daerah\` varchar(100) NOT NULL,
        \`golongan_darah\` varchar(10) NOT NULL,
        \`no_hp\` varchar(20) NOT NULL,
        \`created_at\` timestamp DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await pool.query(query);
    console.log('Table \`relawan\` created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  }
}

setupRelawanTable();
