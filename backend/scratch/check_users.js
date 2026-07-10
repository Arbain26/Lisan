require('dotenv').config();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function checkUsers() {
  try {
    const [rows] = await pool.query("SELECT id, name, email, password, role FROM users");
    console.log("=== Registered Users ===");
    for (const user of rows) {
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Password Hash: ${user.password}`);
      
      // Test common passwords
      const commonPasswords = ['123456', 'admin123', 'admin', 'rahasia123'];
      for (const pass of commonPasswords) {
        const isMatch = await bcrypt.compare(pass, user.password);
        if (isMatch) {
          console.log(`  -> Match found for password: "${pass}"`);
        }
      }
      console.log("------------------------");
    }
  } catch (error) {
    console.error("Error checking users:", error);
  } finally {
    process.exit(0);
  }
}

checkUsers();
