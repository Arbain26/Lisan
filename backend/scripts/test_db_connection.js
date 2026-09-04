const pool = require('../config/db');

async function testConnection() {
  console.log('================================================================');
  console.log('       PENGUJIAN KONEKSI DATABASE WEBSITE LISAN');
  console.log('================================================================');
  
  if (pool.isSupabase) {
    console.log('Mode Aktif : SUPABASE (PostgreSQL Cloud)');
  } else {
    console.log('Mode Aktif : MYSQL LOKAL (Fallback)');
  }

  try {
    const [rows] = await pool.query('SELECT 1 as connected');
    if (rows && rows.length > 0) {
      console.log('Status     : [BERHASIL TERHUBUNG] Database merespons dengan baik!');
    }

    if (pool.isSupabase) {
      const [tableRows] = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name ASC;
      `);
      console.log(`\nJumlah tabel terdeteksi di Supabase: ${tableRows.length}`);
      if (tableRows.length > 0) {
        console.log('Tabel yang tersedia:');
        tableRows.forEach(t => console.log(` - ${t.table_name}`));
      } else {
        console.log('\n[CATATAN]: Belum ada tabel di Supabase.');
        console.log('Silakan jalankan file "backend/supabase_schema.sql" di SQL Editor Supabase Anda.');
      }
    } else {
      const [tableRows] = await pool.query('SHOW TABLES');
      console.log(`\nJumlah tabel terdeteksi di MySQL: ${tableRows.length}`);
    }

    console.log('================================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n[GAGAL TERHUBUNG]: Terjadi kesalahan saat menghubungi database:');
    console.error(error.message);
    console.log('================================================================');
    process.exit(1);
  }
}

testConnection();
