const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const dbName = process.env.DB_NAME || 'db_lisan';

  console.log(`Creating database ${dbName} if not exists...`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.query(`USE \`${dbName}\``);

  console.log('Creating users table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(100) NOT NULL,
      \`email\` varchar(100) NOT NULL,
      \`password\` varchar(255) NOT NULL,
      \`role\` enum('Admin','Editor') DEFAULT 'Admin',
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`email\` (\`email\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Creating relawan table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`relawan\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`nama\` varchar(150) NOT NULL,
      \`instansi\` varchar(150) NOT NULL,
      \`daerah\` varchar(100) NOT NULL,
      \`golongan_darah\` varchar(10) NOT NULL,
      \`no_hp\` varchar(20) NOT NULL,
      \`keterangan\` text,
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Creating hero_slides table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`hero_slides\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`image_url\` varchar(255) NOT NULL,
      \`title\` varchar(150) NOT NULL,
      \`highlight\` varchar(100) NOT NULL,
      \`sub\` text NOT NULL,
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Creating berita table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`berita\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`title\` varchar(255) NOT NULL,
      \`category\` varchar(100) NOT NULL,
      \`excerpt\` text,
      \`content\` text,
      \`image_url\` varchar(255) DEFAULT NULL,
      \`status\` enum('Draft','Published') DEFAULT 'Draft',
      \`author\` varchar(100) DEFAULT NULL,
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Creating program table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`program\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) NOT NULL,
      \`description\` text,
      \`category\` varchar(100) NOT NULL,
      \`status\` varchar(50) DEFAULT 'Terjadwal',
      \`participant_count\` int(11) DEFAULT 0,
      \`icon\` varchar(100) DEFAULT NULL,
      \`color_theme\` varchar(50) DEFAULT NULL,
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Creating galeri table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`galeri\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`title\` varchar(255) NOT NULL,
      \`image_url\` varchar(255) NOT NULL,
      \`grid_span\` varchar(50) DEFAULT NULL,
      \`date_taken\` timestamp DEFAULT current_timestamp(),
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Creating pesan table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`pesan\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(150) NOT NULL,
      \`email\` varchar(150) NOT NULL,
      \`subject\` varchar(255) DEFAULT NULL,
      \`message\` text NOT NULL,
      \`is_read\` tinyint(1) DEFAULT 0,
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Creating donor table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`donor\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(150) NOT NULL,
      \`blood_type\` varchar(10) NOT NULL,
      \`phone\` varchar(20) NOT NULL,
      \`last_donation\` date DEFAULT NULL,
      \`status\` varchar(50) DEFAULT 'Bisa Donor',
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Creating departemen table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`departemen\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`nama\` varchar(150) NOT NULL,
      \`icon\` varchar(100) NOT NULL,
      \`color_theme\` varchar(100) NOT NULL,
      \`deskripsi\` text NOT NULL,
      \`program_unggulan\` text NOT NULL,
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Creating pengurus table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`pengurus\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`nama\` varchar(150) NOT NULL,
      \`jabatan\` varchar(150) NOT NULL,
      \`departemen_id\` int(11) DEFAULT NULL,
      \`foto_url\` varchar(255) DEFAULT NULL,
      \`urutan\` int(11) DEFAULT 0,
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`),
      KEY \`departemen_id\` (\`departemen_id\`),
      CONSTRAINT \`fk_pengurus_departemen\` FOREIGN KEY (\`departemen_id\`) REFERENCES \`departemen\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Creating pengaturan table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`pengaturan\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`nama_organisasi\` varchar(255) NOT NULL,
      \`email\` varchar(150) NOT NULL,
      \`telepon\` varchar(50) NOT NULL,
      \`alamat\` text NOT NULL,
      \`instagram\` varchar(255) DEFAULT NULL,
      \`facebook\` varchar(255) DEFAULT NULL,
      \`youtube\` varchar(255) DEFAULT NULL,
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Creating proker table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`proker\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`kode\` varchar(50) NOT NULL,
      \`kegiatan\` varchar(255) NOT NULL,
      \`penanggung_jawab\` varchar(255) NOT NULL,
      \`tahun_kepengurusan\` varchar(50) NOT NULL,
      \`progres\` decimal(5,2) DEFAULT 0.00,
      \`status\` enum('Belum Mulai','Sedang Berjalan','Selesai','Terlambat') DEFAULT 'Belum Mulai',
      \`keterangan_terlaksana\` text,
      \`keterangan_tidak_terlaksana\` text,
      \`created_at\` timestamp DEFAULT current_timestamp(),
      \`updated_at\` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`kode_tahun\` (\`kode\`, \`tahun_kepengurusan\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Creating proker_schedule table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`proker_schedule\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`proker_id\` int(11) NOT NULL,
      \`bulan\` varchar(20) NOT NULL,
      \`tanggal\` varchar(50) NOT NULL,
      \`status\` enum('Belum Mulai','Terlaksana','Tidak Terlaksana') DEFAULT 'Belum Mulai',
      \`updated_at\` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (\`id\`),
      KEY \`proker_id\` (\`proker_id\`),
      CONSTRAINT \`fk_setup_schedule_proker\` FOREIGN KEY (\`proker_id\`) REFERENCES \`proker\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Creating proker_notifications table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`proker_notifications\` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `proker_id` int(11) NOT NULL,
      `type` varchar(50) NOT NULL,
      `message` text NOT NULL,
      `is_read` tinyint(1) DEFAULT 0,
      `created_at` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (`id`),
      KEY `proker_id` (`proker_id`),
      CONSTRAINT `fk_setup_notifications_proker` FOREIGN KEY (`proker_id`) REFERENCES `proker` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('Creating proker_files table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`proker_files\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`filename\` varchar(255) NOT NULL,
      \`original_name\` varchar(255) NOT NULL,
      \`file_path\` varchar(255) NOT NULL,
      \`file_size\` int(11) NOT NULL,
      \`uploaded_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);


  // Insert default admin
  const [users] = await connection.query('SELECT COUNT(*) as count FROM users WHERE email = ? OR email = ?', ['admin@lisan.id', 'admin@lisan']);
  if (users[0].count === 0) {
    console.log('Inserting default admin...');
    await connection.query(`
      INSERT INTO users (name, email, password, role) VALUES 
      ('Admin Utama', 'admin@lisan.id', '$2b$10$Hj5Col471JDvmKenecRdW.WgXChZRoRP9ZvnKZd5aMj638m5GF5C.', 'Admin')
    `);
  }

  // Insert default hero slides
  const [slides] = await connection.query('SELECT COUNT(*) as count FROM hero_slides');
  if (slides[0].count === 0) {
    console.log('Inserting default hero slides...');
    await connection.query(`
      INSERT INTO hero_slides (image_url, title, highlight, sub) VALUES 
      ('https://images.unsplash.com/photo-1529119368496-2dfda6ec2804?w=1920&q=85', 'Lingkar Mahasiswa Islam', 'untuk Perubahan', 'Membangun generasi intelektual, progresif, dan Islami untuk masa depan Indonesia yang lebih baik.'),
      ('https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1920&q=85', 'Bergerak Bersama,', 'Membawa Perubahan', 'Organisasi mahasiswa Islam yang berdedikasi untuk kemajuan sosial, intelektual, dan spiritual.'),
      ('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=85', 'Pemimpin Masa Depan', 'Lahir di Sini', 'Bergabunglah dengan mahasiswa berdedikasi yang membentuk perubahan nyata di masyarakat.')
    `);
  }

  // Insert default departments
  const [depts] = await connection.query('SELECT COUNT(*) as count FROM departemen');
  if (depts[0].count === 0) {
    console.log('Inserting default departments...');
    const defaultDepts = [
      [
        'Departemen Kaderisasi',
        'Users',
        'bg-emerald-50 text-emerald-600',
        'Merancang dan melaksanakan alur pembinaan anggota, mulai dari rekrutmen hingga pelatihan kepemimpinan tingkat lanjut. Ujung tombak penjaga kualitas sumber daya manusia LISAN.',
        JSON.stringify(['Latihan Kepemimpinan Dasar', 'Upgrading Pengurus', 'Mentoring Rutin'])
      ],
      [
        'Departemen Kajian & Keilmuan',
        'BookOpen',
        'bg-blue-50 text-blue-600',
        'Mewadahi diskusi intelektual, literasi, dan riset strategis. Bertanggung jawab memberikan pencerahan akademik dan spiritual bagi seluruh anggota LISAN.',
        JSON.stringify(['Diskusi Publik', 'Bedah Buku', 'Kajian Keislaman Kontemporer'])
      ],
      [
        'Departemen Sosial Masyarakat',
        'HeartHandshake',
        'bg-red-50 text-red-600',
        'Jembatan penghubung antara LISAN dan masyarakat luas. Mengelola berbagai kegiatan kemanusiaan dan tanggap bencana di wilayah Sidenreng Rappang.',
        JSON.stringify(['Lingkar Donor Darah', 'Bakti Sosial', 'LISAN Tanggap Bencana'])
      ],
      [
        'Departemen Media & Komunikasi',
        'Megaphone',
        'bg-amber-50 text-amber-600',
        'Mengelola arus informasi, publikasi kegiatan, dan membangun citra positif organisasi melalui berbagai platform media sosial dan website.',
        JSON.stringify(['Pelatihan Jurnalistik', 'Manajemen Konten Digital', 'Press Release'])
      ],
      [
        'Departemen Kewirausahaan',
        'Laptop',
        'bg-purple-50 text-purple-600',
        'Membangun kemandirian finansial organisasi sekaligus melatih jiwa wirausaha para anggota melalui berbagai unit usaha kreatif.',
        JSON.stringify(['LISAN Merchandise', 'Pelatihan Bisnis Digital', 'Bazaar Mahasiswa'])
      ]
    ];

    for (const dept of defaultDepts) {
      await connection.query(
        'INSERT INTO departemen (nama, icon, color_theme, deskripsi, program_unggulan) VALUES (?, ?, ?, ?, ?)',
        dept
      );
    }
  }

  // Insert default website settings
  const [settings] = await connection.query('SELECT COUNT(*) as count FROM pengaturan');
  if (settings[0].count === 0) {
    console.log('Inserting default website settings...');
    await connection.query(`
      INSERT INTO pengaturan (id, nama_organisasi, email, telepon, alamat, instagram, facebook, youtube) VALUES 
      (1, 'Lingkar Mahasiswa Islam untuk Perubahan (LISAN)', 'info@lisan.id', '+62 819-3317-2687', 'Jl. Jenderal Sudirman No. 123, Kabupaten Sidenreng Rappang, Sulawesi Selatan', 'https://instagram.com/lisan.id', 'https://facebook.com/lisan.id', 'https://youtube.com/@lisan.id')
    `);
  }

  console.log('Database and all tables setup completed successfully!');
  await connection.end();
  process.exit(0);
}

run().catch(err => {
  console.error('Error running DB setup:', err);
  process.exit(1);
});
