const pool = require('../config/db');

async function migratePengurusProfile() {
  try {
    console.log('Starting migration for pengurus profile fields...');

    const [cols] = await pool.query('SHOW COLUMNS FROM pengurus');
    const existingCols = cols.map(c => c.Field);

    if (!existingCols.includes('bio')) {
      await pool.query('ALTER TABLE pengurus ADD COLUMN bio TEXT NULL AFTER urutan');
      console.log('Added column: bio');
    }

    if (!existingCols.includes('email')) {
      await pool.query('ALTER TABLE pengurus ADD COLUMN email VARCHAR(100) NULL AFTER bio');
      console.log('Added column: email');
    }

    if (!existingCols.includes('instagram')) {
      await pool.query('ALTER TABLE pengurus ADD COLUMN instagram VARCHAR(100) NULL AFTER email');
      console.log('Added column: instagram');
    }

    if (!existingCols.includes('linkedin')) {
      await pool.query('ALTER TABLE pengurus ADD COLUMN linkedin VARCHAR(100) NULL AFTER instagram');
      console.log('Added column: linkedin');
    }

    if (!existingCols.includes('kampus')) {
      await pool.query('ALTER TABLE pengurus ADD COLUMN kampus VARCHAR(150) NULL AFTER linkedin');
      console.log('Added column: kampus');
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migratePengurusProfile();
