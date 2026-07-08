require('dotenv').config();
const pool = require('./config/db');

async function check() {
  const [rows] = await pool.query("SELECT * FROM relawan");
  console.log(rows);
  process.exit(0);
}

check();
