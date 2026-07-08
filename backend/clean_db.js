require('dotenv').config();
const pool = require('./config/db');

async function clean() {
  await pool.query("DELETE FROM relawan WHERE nama = '' OR nama IS NULL");
  console.log('Cleaned empty rows');
  process.exit(0);
}

clean();
