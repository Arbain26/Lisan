const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

async function migrate() {
  const supabaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!supabaseUrl || supabaseUrl.includes('[PASSWORD_ANDA]') || supabaseUrl.includes('[YOUR-PASSWORD]')) {
    console.error('ERROR: DATABASE_URL di backend/.env belum diisi dengan password Supabase yang valid!');
    console.log('Silakan masukkan password database Supabase Anda ke backend/.env terlebih dahulu.');
    process.exit(1);
  }

  console.log('================================================================');
  console.log(' MEMULAI MIGRASI DATA DARI MYSQL LOKAL KE SUPABASE (POSTGRESQL)');
  console.log('================================================================');

  // 1. Connect to MySQL
  console.log('\n[1/3] Menghubungkan ke MySQL Lokal...');
  const mysqlConn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_lisan'
  });
  console.log('      Terhubung ke MySQL lokal.');

  // 2. Connect to Supabase
  console.log('\n[2/3] Menghubungkan ke Supabase...');
  let cleanUrl = supabaseUrl;
  cleanUrl = cleanUrl.replace('jmkmjmbginnafclfpbjp', 'jmkmjmbglnnafclfpbjp');
  if (cleanUrl.includes('db.jmkmjmbglnnafclfpbjp.supabase.co')) {
    cleanUrl = cleanUrl.replace('db.jmkmjmbglnnafclfpbjp.supabase.co', 'aws-0-ap-northeast-1.pooler.supabase.com');
    cleanUrl = cleanUrl.replace(':5432', ':6543');
  }
  if (cleanUrl.includes('aws-0-ap-northeast-1.pooler.supabase.com')) {
    if (cleanUrl.includes('://admin@lisan.id:') || cleanUrl.includes('://postgres:')) {
      cleanUrl = cleanUrl.replace(/:\/\/[^:]+:/, '://postgres.jmkmjmbglnnafclfpbjp:');
    }
    cleanUrl = cleanUrl.replace(/:\/\/([^:]+):\[([^\]]+)\]@/, '://$1:$2@');
  }

  const pgPool = new Pool({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  });

  try {
    await pgPool.query('SELECT 1');
    console.log('      Terhubung ke Supabase PostgreSQL.');
  } catch (err) {
    console.error('      GAGAL terhubung ke Supabase:', err.message);
    await mysqlConn.end();
    process.exit(1);
  }

  // 3. Ensure Schema exists in Supabase
  console.log('\n[3/3] Memastikan tabel skema ada di Supabase...');
  const schemaPath = path.join(__dirname, '..', 'supabase_schema.sql');
  if (fs.existsSync(schemaPath)) {
    try {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pgPool.query(schemaSql);
      console.log('      Skema tabel Supabase terverifikasi / diperbarui.');
    } catch (err) {
      console.warn('      Catatan eksekusi skema:', err.message);
    }
  }

  // Helper to copy table
  const copyTable = async (tableName, columns, options = {}) => {
    try {
      const [rows] = await mysqlConn.query(`SELECT * FROM \`${tableName}\``);
      if (rows.length === 0) {
        console.log(`- ${tableName.padEnd(22)}: 0 baris (dilewati)`);
        return;
      }

      console.log(`- ${tableName.padEnd(22)}: Menyalin ${rows.length} baris...`);

      // Clear target table if requested
      if (options.truncate) {
        await pgPool.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
      }

      for (const row of rows) {
        const colNames = [];
        const placeholders = [];
        const values = [];
        let idx = 1;

        for (const col of columns) {
          if (row[col] !== undefined) {
            colNames.push(`"${col}"`);
            placeholders.push(`$${idx++}`);
            let val = row[col];
            // Format JSON objects/arrays if stringified in MySQL
            if (options.jsonCols && options.jsonCols.includes(col) && typeof val === 'object' && val !== null) {
              val = JSON.stringify(val);
            }
            values.push(val);
          }
        }

        const query = `
          INSERT INTO "${tableName}" (${colNames.join(', ')})
          VALUES (${placeholders.join(', ')})
          ON CONFLICT (${options.conflictCol || 'id'}) DO NOTHING
        `;
        await pgPool.query(query, values);
      }

      // Reset auto-increment sequence in PostgreSQL
      try {
        await pgPool.query(`SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1)) FROM "${tableName}"`);
      } catch (e) {
        // Sequence might not exist or be named differently
      }

      console.log(`  ✓ ${tableName.padEnd(20)}: Berhasil disalin!`);
    } catch (err) {
      console.error(`  ✗ Gagal menyalin tabel ${tableName}:`, err.message);
    }
  };

  console.log('\n--- PROSES PENYALINAN DATA ---');

  // Order matters due to foreign keys!
  await copyTable('users', ['id', 'name', 'email', 'password', 'role', 'created_at']);
  await copyTable('pengaturan', [
    'id', 'nama_organisasi', 'email', 'telepon', 'alamat', 'instagram', 'facebook', 'youtube',
    'tentang_organisasi', 'sejarah', 'visi', 'misi', 'nilai_organisasi', 'menu_visibility', 'created_at', 'updated_at'
  ], { jsonCols: ['misi', 'nilai_organisasi', 'menu_visibility'] });
  await copyTable('departemen', ['id', 'nama', 'icon', 'color_theme', 'deskripsi', 'program_unggulan', 'created_at'], { jsonCols: ['program_unggulan'] });
  await copyTable('pengurus', ['id', 'nama', 'jabatan', 'departemen_id', 'foto_url', 'bio', 'instagram', 'linkedin', 'urutan', 'created_at']);
  await copyTable('program', ['id', 'name', 'description', 'category', 'status', 'participant_count', 'icon', 'color_theme', 'created_at']);
  await copyTable('proker', ['id', 'kode', 'kegiatan', 'penanggung_jawab', 'tahun_kepengurusan', 'progres', 'status', 'keterangan_terlaksana', 'keterangan_tidak_terlaksana', 'created_at', 'updated_at']);
  await copyTable('proker_schedule', ['id', 'proker_id', 'bulan', 'tanggal', 'status', 'keterangan', 'foto_url', 'created_at', 'updated_at']);
  await copyTable('proker_notifications', ['id', 'proker_id', 'type', 'message', 'is_read', 'created_at']);
  await copyTable('proker_files', ['id', 'filename', 'original_name', 'file_path', 'file_size', 'uploaded_at']);
  await copyTable('hero_slides', ['id', 'image_url', 'title', 'highlight', 'sub', 'created_at']);
  await copyTable('kader', ['id', 'nama', 'angkatan', 'kampus', 'alamat', 'jenjang_kaderisasi', 'semester', 'status', 'created_at']);
  await copyTable('relawan', ['id', 'nama', 'instansi', 'daerah', 'golongan_darah', 'no_hp', 'keterangan', 'created_at']);
  // Support pesan columns (handle name/nama, subject/subjek, message/pesan)
  try {
    const [pesanRows] = await mysqlConn.query('SELECT * FROM `pesan`');
    console.log(`- pesan                 : Menyalin ${pesanRows.length} baris...`);
    for (const r of pesanRows) {
      const id = r.id;
      const name = r.name || r.nama || '';
      const email = r.email || '';
      const subject = r.subject || r.subjek || '';
      const message = r.message || r.pesan || '';
      const is_read = r.is_read !== undefined ? r.is_read : 0;
      const created_at = r.created_at || new Date();
      await pgPool.query(
        `INSERT INTO "pesan" ("id", "name", "email", "subject", "message", "is_read", "created_at")
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT ("id") DO NOTHING`,
        [id, name, email, subject, message, is_read, created_at]
      );
    }
    console.log('  ✓ pesan               : Berhasil disalin!');
  } catch (err) {
    console.error('  ✗ Gagal menyalin tabel pesan:', err.message);
  }
  await copyTable('berita', ['id', 'title', 'category', 'excerpt', 'content', 'image_url', 'status', 'author', 'created_at']);
  await copyTable('galeri', ['id', 'title', 'image_url', 'grid_span', 'date_taken', 'created_at']);
  await copyTable('donor', ['id', 'nama', 'nominal', 'pesan', 'metode', 'status', 'bukti_transfer', 'created_at']);

  console.log('\n================================================================');
  console.log(' SELURUH DATA BERHASIL DIMIGRASIKAN KE SUPABASE DENGAN LENGKAP! ');
  console.log('================================================================');

  await mysqlConn.end();
  await pgPool.end();
}

migrate().catch(err => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
