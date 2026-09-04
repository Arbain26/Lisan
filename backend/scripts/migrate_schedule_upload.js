const pool = require('./config/db');

async function migrate() {
  console.log('Altering proker_schedule table to add keterangan and foto_url columns...');

  // MySQL 8.0+ supports ALTER TABLE with ADD COLUMN IF NOT EXISTS.
  // For older MySQL, we can check if columns exist first or just wrap in try/catch to ignore duplicate column error.
  try {
    await pool.query(`
      ALTER TABLE \`proker_schedule\`
      ADD COLUMN \`keterangan\` text DEFAULT NULL,
      ADD COLUMN \`foto_url\` varchar(255) DEFAULT NULL;
    `);
    console.log('Columns added successfully.');
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Columns already exist. Skipping.');
    } else {
      throw err;
    }
  }

  console.log('Migration completed successfully!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
