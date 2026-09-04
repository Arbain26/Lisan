const pool = require('./config/db');

async function addUniqueConstraint() {
  try {
    // Drop constraint if it already exists (to avoid error on re-run)
    await pool.query(`ALTER TABLE kader DROP INDEX IF EXISTS uq_kader_nama_angkatan`).catch(() => {});

    // Add UNIQUE constraint on (nama, angkatan)
    await pool.query(`
      ALTER TABLE kader
      ADD CONSTRAINT uq_kader_nama_angkatan UNIQUE (nama, angkatan)
    `);
    console.log('✅ UNIQUE constraint on (nama, angkatan) added successfully.');
  } catch (err) {
    if (err.code === 'ER_DUP_KEYNAME') {
      console.log('ℹ️  Constraint already exists, skipping.');
    } else {
      throw err;
    }
  }
  process.exit(0);
}

addUniqueConstraint().catch(e => { console.error('Failed:', e.message); process.exit(1); });
