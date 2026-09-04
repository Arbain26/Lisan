const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Cara Penggunaan:');
  console.log('node create_user.js "<Nama>" "<Email>" "<Password>" "<Role (Admin/Editor)>"');
  console.log('Contoh:');
  console.log('node create_user.js "Ahmad Yani" "ahmad@lisan.id" "rahasia123" "Admin"');
  process.exit(1);
}

const [name, email, password, roleInput] = args;
const role = roleInput || 'Admin';

if (role !== 'Admin' && role !== 'Editor') {
  console.error('Error: Role harus "Admin" atau "Editor"');
  process.exit(1);
}

async function createUser() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'db_lisan'
    });

    console.log(`Mengecek apakah email ${email} sudah terdaftar...`);
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.error(`Error: Email ${email} sudah terdaftar.`);
      await connection.end();
      process.exit(1);
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Memasukkan user baru ke database...');
    await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    console.log(`\nUser baru berhasil dibuat!`);
    console.log(`Nama: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Role: ${role}`);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    process.exit(1);
  }
}

createUser();
