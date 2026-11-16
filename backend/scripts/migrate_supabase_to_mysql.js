const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

async function migrateSupabaseToMySQL() {
  const supabaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

  if (!supabaseUrl || supabaseUrl.includes('[PASSWORD_ANDA]') || supabaseUrl.includes('[YOUR-PASSWORD]')) {
    console.error('\n❌ ERROR: DATABASE_URL Supabase di backend/.env belum diisi!');
    console.log('Silakan masukkan Connection URI Supabase Anda ke backend/.env pada DATABASE_URL=...');
    process.exit(1);
  }

  console.log('================================================================');
  console.log('  MEMULAI MIGRASI DATA DARI SUPABASE (POSTGRESQL) KE MYSQL LOKAL');
  console.log('================================================================');

  // 1. Hubungkan ke Supabase (Source)
  console.log('\n[1/3] Menghubungkan ke Supabase PostgreSQL...');
  let cleanUrl = supabaseUrl.trim().replace(/:\/\/([^:]+):\[([^\]]+)\]@/, '://$1:$2@');

  const pgPool = new Pool({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    await pgPool.query('SELECT 1');
    console.log('      ✓ Berhasil terhubung ke Supabase!');
  } catch (err) {
    console.error('\n❌ GAGAL terhubung ke Supabase:');
    console.error('  ', err.message);
    if (err.message.includes('tenant') || err.message.includes('ENOTFOUND')) {
      console.log('\n💡 CATATAN SUPABASE:');
      console.log('   Project Supabase Anda kemungkinan sedang di-PAUSE (tertunda) oleh Supabase.');
      console.log('   Buka https://supabase.com/dashboard dan klik tombol "Restore Project" untuk mengaktifkannya kembali.');
    }
    process.exit(1);
  }

  // 2. Hubungkan ke MySQL Lokal (Destination)
  console.log('\n[2/3] Menghubungkan ke MySQL Lokal...');
  const mysqlConn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_lisan',
  });
  console.log('      ✓ Berhasil terhubung ke MySQL (db_lisan)!');

  // Helper untuk migrasi tabel dari Supabase ke MySQL
  const copyTable = async (tableName, columns, options = {}) => {
    try {
      // Cek apakah tabel ada di Supabase
      const checkTable = await pgPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = $1
        );
      `, [tableName]);

      if (!checkTable.rows[0].exists) {
        console.log(`- ${tableName.padEnd(22)}: (Tabel tidak ada di Supabase, dilewati)`);
        return;
      }

      const res = await pgPool.query(`SELECT * FROM "${tableName}" ORDER BY id ASC`);
      const rows = res.rows || [];

      if (rows.length === 0) {
        console.log(`- ${tableName.padEnd(22)}: 0 baris di Supabase (dilewati)`);
        return;
      }

      console.log(`- ${tableName.padEnd(22)}: Mentransfer ${rows.length} baris ke MySQL...`);

      for (const row of rows) {
        const colNames = [];
        const placeholders = [];
        const values = [];

        for (const col of columns) {
          if (row[col] !== undefined) {
            colNames.push(`\`${col}\``);
            placeholders.push('?');
            let val = row[col];

            // Konversi JSON objek/array ke string untuk MySQL JSON
            if (options.jsonCols && options.jsonCols.includes(col) && typeof val === 'object' && val !== null) {
              val = JSON.stringify(val);
            }

            values.push(val);
          }
        }

        const query = `
          INSERT INTO \`${tableName}\` (${colNames.join(', ')})
          VALUES (${placeholders.join(', ')})
          ON DUPLICATE KEY UPDATE id = id
        `;

        await mysqlConn.query(query, values);
      }

      console.log(`  ✓ ${tableName.padEnd(20)}: Selesai disalin ke MySQL!`);
    } catch (err) {
      console.error(`  ✗ Gagal menyalin tabel ${tableName}:`, err.message);
    }
  };

  console.log('\n[3/3] Mentransfer Seluruh Data Tabel...');

  // Urutan migrasi mempertimbangkan Foreign Key
  await copyTable('users', ['id', 'name', 'email', 'password', 'role', 'created_at']);
  await copyTable('pengaturan', [
    'id', 'nama_organisasi', 'email', 'telepon', 'alamat', 'instagram', 'facebook', 'youtube',
    'tentang_organisasi', 'sejarah', 'visi', 'misi', 'nilai_organisasi', 'menu_visibility', 'created_at'
  ], { jsonCols: ['misi', 'nilai_organisasi', 'menu_visibility'] });
  await copyTable('departemen', ['id', 'nama', 'icon', 'color_theme', 'deskripsi', 'program_unggulan', 'created_at'], { jsonCols: ['program_unggulan'] });
  await copyTable('pengurus', ['id', 'nama', 'jabatan', 'departemen_id', 'foto_url', 'bio', 'email', 'instagram', 'linkedin', 'kampus', 'urutan', 'created_at']);
  await copyTable('program', ['id', 'name', 'description', 'category', 'status', 'participant_count', 'icon', 'color_theme', 'created_at']);
  await copyTable('proker', ['id', 'kode', 'kegiatan', 'penanggung_jawab', 'tahun_kepengurusan', 'progres', 'status', 'keterangan_terlaksana', 'keterangan_tidak_terlaksana', 'created_at', 'updated_at']);
  await copyTable('proker_schedule', ['id', 'proker_id', 'bulan', 'tanggal', 'status', 'keterangan', 'foto_url', 'updated_at']);
  await copyTable('proker_notifications', ['id', 'proker_id', 'type', 'message', 'is_read', 'created_at']);
  await copyTable('proker_files', ['id', 'filename', 'original_name', 'file_path', 'file_size', 'uploaded_at']);
  await copyTable('hero_slides', ['id', 'image_url', 'title', 'highlight', 'sub', 'created_at']);

  // Pastikan kolom baru di tabel kader MySQL sudah ada
  try {
    await mysqlConn.query('ALTER TABLE `kader` MODIFY `institusi` VARCHAR(150) NULL, MODIFY `tahun` VARCHAR(10) NULL');
    const [cols] = await mysqlConn.query('SHOW COLUMNS FROM `kader`');
    const colNames = cols.map(c => c.Field);
    if (!colNames.includes('kampus')) await mysqlConn.query('ALTER TABLE `kader` ADD COLUMN `kampus` VARCHAR(150) NULL');
    if (!colNames.includes('alamat')) await mysqlConn.query('ALTER TABLE `kader` ADD COLUMN `alamat` VARCHAR(255) NULL');
    if (!colNames.includes('jenjang_kaderisasi')) await mysqlConn.query('ALTER TABLE `kader` ADD COLUMN `jenjang_kaderisasi` VARCHAR(100) NULL');
    if (!colNames.includes('semester')) await mysqlConn.query('ALTER TABLE `kader` ADD COLUMN `semester` VARCHAR(20) NULL');
    if (!colNames.includes('status')) await mysqlConn.query('ALTER TABLE `kader` ADD COLUMN `status` VARCHAR(50) NULL');
  } catch (err) {
    console.error('Altering kader columns:', err.message);
  }

  await copyTable('kader', ['id', 'nama', 'angkatan', 'kampus', 'alamat', 'jenjang_kaderisasi', 'semester', 'status', 'created_at']);
  await copyTable('relawan', ['id', 'nama', 'instansi', 'daerah', 'golongan_darah', 'no_hp', 'keterangan', 'created_at']);
  await copyTable('donor', ['id', 'name', 'blood_type', 'phone', 'last_donation', 'status', 'created_at']);
  await copyTable('pesan', ['id', 'name', 'email', 'subject', 'message', 'is_read', 'created_at']);
  await copyTable('berita', ['id', 'title', 'category', 'excerpt', 'content', 'image_url', 'status', 'author', 'created_at']);
  await copyTable('galeri', ['id', 'title', 'image_url', 'grid_span', 'date_taken', 'created_at']);
  await copyTable('korwil', ['id', 'name', 'kampus', 'anggota', 'urutan', 'is_active', 'created_at']);

  console.log('\n================================================================');
  console.log('  🎉 SELURUH DATA SUPABASE BERHASIL DIPINDAHKAN KE MYSQL LOKAL!  ');
  console.log('================================================================');

  await pgPool.end();
  await mysqlConn.end();
  process.exit(0);
}

migrateSupabaseToMySQL().catch(err => {
  console.error('\n❌ Terjadi kesalahan fatal:', err);
  process.exit(1);
});

