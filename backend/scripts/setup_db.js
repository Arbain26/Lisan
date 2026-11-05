const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

async function run() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'db_lisan';

  console.log(`Menghubungkan ke MySQL di ${host} (user: ${user})...`);
  const connection = await mysql.createConnection({
    host,
    user,
    password,
  });

  console.log(`Membuat database \`${dbName}\` jika belum ada...`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.query(`USE \`${dbName}\``);

  console.log('1. Membuat tabel users...');
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

  console.log('2. Membuat tabel hero_slides...');
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

  console.log('3. Membuat tabel berita...');
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

  console.log('4. Membuat tabel galeri...');
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

  console.log('5. Membuat tabel program...');
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

  console.log('6. Membuat tabel departemen...');
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

  console.log('7. Membuat tabel pengurus...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`pengurus\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`nama\` varchar(150) NOT NULL,
      \`jabatan\` varchar(150) NOT NULL,
      \`departemen_id\` int(11) DEFAULT NULL,
      \`foto_url\` varchar(255) DEFAULT NULL,
      \`urutan\` int(11) DEFAULT 0,
      \`bio\` text DEFAULT NULL,
      \`email\` varchar(100) DEFAULT NULL,
      \`instagram\` varchar(100) DEFAULT NULL,
      \`linkedin\` varchar(100) DEFAULT NULL,
      \`kampus\` varchar(150) DEFAULT NULL,
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`),
      KEY \`departemen_id\` (\`departemen_id\`),
      CONSTRAINT \`fk_pengurus_departemen\` FOREIGN KEY (\`departemen_id\`) REFERENCES \`departemen\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('8. Membuat tabel pengaturan...');
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
      \`tentang_organisasi\` text DEFAULT NULL,
      \`sejarah\` longtext DEFAULT NULL,
      \`visi\` text DEFAULT NULL,
      \`misi\` json DEFAULT NULL,
      \`nilai_organisasi\` json DEFAULT NULL,
      \`menu_visibility\` json DEFAULT NULL,
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('9. Membuat tabel korwil...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`korwil\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(150) NOT NULL,
      \`kampus\` text NOT NULL,
      \`anggota\` varchar(100) NOT NULL,
      \`urutan\` int(11) DEFAULT 0,
      \`is_active\` tinyint(1) DEFAULT 1,
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('10. Membuat tabel relawan & donor...');
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

  console.log('11. Membuat tabel pesan...');
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

  console.log('13. Membuat tabel proker & matriks...');
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

  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`proker_schedule\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`proker_id\` int(11) NOT NULL,
      \`bulan\` varchar(20) NOT NULL,
      \`tanggal\` varchar(50) NOT NULL,
      \`status\` enum('Belum Mulai','Terlaksana','Tidak Terlaksana') DEFAULT 'Belum Mulai',
      \`keterangan\` text DEFAULT NULL,
      \`foto_url\` varchar(255) DEFAULT NULL,
      \`updated_at\` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (\`id\`),
      KEY \`proker_id\` (\`proker_id\`),
      CONSTRAINT \`fk_setup_schedule_proker\` FOREIGN KEY (\`proker_id\`) REFERENCES \`proker\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`proker_notifications\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`proker_id\` int(11) NOT NULL,
      \`type\` varchar(50) NOT NULL,
      \`message\` text NOT NULL,
      \`is_read\` tinyint(1) DEFAULT 0,
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`),
      KEY \`proker_id\` (\`proker_id\`),
      CONSTRAINT \`fk_setup_notifications_proker\` FOREIGN KEY (\`proker_id\`) REFERENCES \`proker\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

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

  console.log('Creating kader table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`kader\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`nama\` varchar(150) NOT NULL,
      \`angkatan\` varchar(50) NOT NULL,
      \`kampus\` varchar(150) NOT NULL,
      \`alamat\` varchar(255) DEFAULT NULL,
      \`jenjang_kaderisasi\` varchar(100) DEFAULT NULL,
      \`semester\` varchar(20) DEFAULT NULL,
      \`status\` varchar(50) DEFAULT NULL,
      \`created_at\` timestamp DEFAULT current_timestamp(),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uq_kader_nama_angkatan\` (\`nama\`, \`angkatan\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Insert default kader data (LIS 5 - UNISAN)
  const [kaderRows] = await connection.query('SELECT COUNT(*) as count FROM kader');
  if (kaderRows[0].count === 0) {
    console.log('Inserting default kader data...');
    const defaultKader = [
      ['MUHAMMAD KHAIRUL A', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
      ['YUDISTIRA MUDASSIR', 'LIS 5', 'UNISAN', '', 'LOGIKA', 'III', ''],
      ['BILLI', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
      ['MUH. NUR YASIN', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
      ['ALDY RUSLI', 'LIS 5', 'UNISAN', '', 'LOGIKA', 'III', ''],
      ['WINDA', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
      ['DARA TIARA RATILQA', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
      ['GHINA GINAYAH', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
      ['SALWA SALSABILA', 'LIS 5', 'UNISAN', '', 'LOGIKA', 'III', ''],
      ['NUR INDAH SARI', 'LIS 5', 'UNISAN', '', 'PENDALAMAN', 'III', ''],
      ['DIAN NAZLAH KHAIRANI', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
      ['NURUL HAPIPAH', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
      ['ANANDA ELSA', 'LIS 5', 'UNISAN', '', 'PENDALAMAN', 'VII', ''],
      ['RAFLY DWI PUTRA', 'LIS 5', 'UNISAN', '', 'PAKET FILSAFAT', 'III', ''],
    ];
    for (const kader of defaultKader) {
      await connection.query(
        'INSERT INTO kader (nama, angkatan, kampus, alamat, jenjang_kaderisasi, semester, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        kader
      );
    }
  }

  // ==============================================================================
  // SEED DATA
  // ==============================================================================
  console.log('Menyiapkan data awal (seeds)...');

  // Admin Default
  const [users] = await connection.query('SELECT COUNT(*) as count FROM users WHERE email = ? OR email = ?', ['admin@lisan.id', 'admin@lisan']);
  if (users[0].count === 0) {
    console.log(' - Memasukkan admin default (admin@lisan.id / password: password123)...');
    await connection.query(`
      INSERT INTO users (name, email, password, role) VALUES 
      ('Admin Utama', 'admin@lisan.id', '$2b$10$y8dboD11ijbI0IEcehbo8OX2NkYgdHqNUmwUCmBSiRZpky.FhROl2', 'Admin')
    `);
  }

  // Hero Slides
  const [slides] = await connection.query('SELECT COUNT(*) as count FROM hero_slides');
  if (slides[0].count === 0) {
    console.log(' - Memasukkan hero slides default...');
    await connection.query(`
      INSERT INTO hero_slides (image_url, title, highlight, sub) VALUES 
      ('https://images.unsplash.com/photo-1529119368496-2dfda6ec2804?w=1920&q=85', 'Lingkar Mahasiswa Islam', 'untuk Perubahan', 'Membangun generasi intelektual, progresif, dan Islami untuk masa depan Indonesia yang lebih baik.'),
      ('https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1920&q=85', 'Bergerak Bersama,', 'Membawa Perubahan', 'Organisasi mahasiswa Islam yang berdedikasi untuk kemajuan sosial, intelektual, dan spiritual.'),
      ('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=85', 'Pemimpin Masa Depan', 'Lahir di Sini', 'Bergabunglah dengan mahasiswa berdedikasi yang membentuk perubahan nyata di masyarakat.')
    `);
  }

  // 5 Departemen Resmi LISAN
  const [depts] = await connection.query('SELECT COUNT(*) as count FROM departemen');
  if (depts[0].count === 0) {
    console.log(' - Memasukkan 5 departemen resmi...');
    const officialDepts = [
      [
        'Keperempuanan',
        'Award',
        'bg-rose-50 text-rose-600 border-rose-100',
        'Wadah pemberdayaan, penguatan kapasitas, advokasi, serta pengembangan potensi kader mahasiswi Islam dalam ranah sosial dan keorganisasian.',
        JSON.stringify(['Kajian Isu Keperempuanan', 'Sekolah Pemberdayaan Perempuan', 'Bina Karakter Muslimah Tangguh'])
      ],
      [
        'Media Informasi dan Komunikasi',
        'Megaphone',
        'bg-amber-50 text-amber-600 border-amber-100',
        'Mengelola arus informasi, publikasi kegiatan, produksi konten kreatif, dan membangun citra positif organisasi melalui platform digital dan jejaring komunikasi.',
        JSON.stringify(['Manajemen Media Digital & Website', 'Pelatihan Jurnalistik & Desain Grafis', 'Produksi Konten Edukasi & Syiar'])
      ],
      [
        'Lingkar Donor Darah Sidrap',
        'HeartHandshake',
        'bg-red-50 text-red-600 border-red-100',
        'Pusat koordinasi aksi kemanusiaan donor darah, penyediaan basis data pendonor sukarela, serta respons cepat tanggap darurat kebutuhan darah bagi masyarakat Sidenreng Rappang.',
        JSON.stringify(['Aksi Donor Darah Rutin', 'Layanan Darurat Kebutuhan Darah', 'Perekrutan & Database Relawan Donor'])
      ],
      [
        'Pengkaderan',
        'Users',
        'bg-emerald-50 text-emerald-600 border-emerald-100',
        'Merancang dan mengawal alur pembinaan anggota, mulai dari proses rekrutmen hingga pelatihan kepemimpinan kader sebagai jantung regenerasi organisasi LISAN.',
        JSON.stringify(['Latihan Kader & Kepemimpinan', 'Upgrading Kapasitas Pengurus', 'Mentoring & Pendampingan Kader Baru'])
      ],
      [
        'Advokasi dan Pengorganisasian Sosial',
        'Shield',
        'bg-blue-50 text-blue-600 border-blue-100',
        'Mewadahi pendampingan aspirasi, pembelaan hak-hak masyarakat, analisis kebijakan publik, serta pengorganisasian gerakan kepedulian sosial kemasyarakatan.',
        JSON.stringify(['Advokasi Kebijakan Publik & Sosial', 'Kajian Kritis & Riset Kebijakan', 'Pengorganisasian Gerakan Komunitas'])
      ]
    ];

    for (const d of officialDepts) {
      await connection.query(
        'INSERT INTO departemen (nama, icon, color_theme, deskripsi, program_unggulan) VALUES (?, ?, ?, ?, ?)',
        d
      );
    }
  }

  // Pengaturan Profil & Website
  const [settings] = await connection.query('SELECT COUNT(*) as count FROM pengaturan WHERE id = 1');
  if (settings[0].count === 0) {
    console.log(' - Memasukkan pengaturan profil & organisasi...');
    const defaultMisi = JSON.stringify([
      "Menyelenggarakan pembinaan karakter Islami yang berkelanjutan bagi mahasiswa.",
      "Membangun kapasitas kepemimpinan dan manajerial kader melalui pelatihan terstruktur.",
      "Berperan aktif dalam memberikan solusi terhadap isu-isu sosial kemasyarakatan.",
      "Memperluas jaringan kerja sama dengan berbagai instansi dan elemen masyarakat.",
      "Menjadikan organisasi sebagai wadah inovasi dan pengembangan potensi pemuda."
    ]);

    const defaultNilai = JSON.stringify([
      { id: 1, title: "Integritas & Moralitas", desc: "Menjunjung tinggi kejujuran, etika, dan nilai-nilai akhlakul karimah dalam setiap tindakan.", icon: "Shield" },
      { id: 2, title: "Progresif & Intelektual", desc: "Berpikir kritis, haus akan ilmu pengetahuan, dan terus melakukan pembaruan positif.", icon: "Sparkles" },
      { id: 3, title: "Kepedulian Sosial", desc: "Peka terhadap persoalan masyarakat dan aktif memberikan kontribusi nyata.", icon: "Heart" },
      { id: 4, title: "Kolaboratif", desc: "Membangun sinergi dan kebersamaan untuk mencapai tujuan bersama yang lebih besar.", icon: "Users" }
    ]);

    const defaultMenuVisibility = JSON.stringify({
      beranda: true,
      profil: true,
      profil_about: true,
      profil_sejarah: true,
      profil_visi_misi: true,
      profil_nilai: true,
      organisasi: true,
      org_structure: true,
      org_departemen: true,
      org_korwil: true,
      program: true,
      program_kajian: true,
      program_sosial: true,
      program_leadership: true,
      media: true,
      media_news: true,
      media_gallery: true,
      donor: true,
      contact: true
    });

    await connection.query(`
      INSERT INTO pengaturan (
        id, nama_organisasi, email, telepon, alamat, instagram, facebook, youtube,
        tentang_organisasi, sejarah, visi, misi, nilai_organisasi, menu_visibility
      ) VALUES (
        1,
        'Lingkar Mahasiswa Islam untuk Perubahan (LISAN)',
        'info@lisan.id',
        '+62 819-3317-2687',
        'Jl. Jenderal Sudirman No. 123, Kabupaten Sidenreng Rappang, Sulawesi Selatan',
        'https://instagram.com/lisan.id',
        'https://facebook.com/lisan.id',
        'https://youtube.com/@lisan.id',
        'Lingkar Mahasiswa Islam untuk Perubahan (LISAN) didirikan sebagai wadah pergerakan dan pemberdayaan mahasiswa berbasis nilai-nilai keislaman, keilmuan, dan kepedulian sosial.',
        'LISAN berawal dari semangat kebersamaan mahasiswa lintas kampus di Sidenreng Rappang yang melihat perlunya wadah kolaboratif pembinaan intelektual dan pengabdian masyarakat nyata.',
        'Terwujudnya generasi mahasiswa Islam yang berakhlak mulia, unggul secara intelektual, dan berkontribusi nyata bagi kemajuan umat dan bangsa.',
        ?,
        ?,
        ?
      )
    `, [defaultMisi, defaultNilai, defaultMenuVisibility]);
  }

  // Koordinator Wilayah (Korwil)
  const [korwils] = await connection.query('SELECT COUNT(*) as count FROM korwil');
  if (korwils[0].count === 0) {
    console.log(' - Memasukkan data awal Korwil...');
    const defaultKorwils = [
      ['Koordinator Wilayah Pangkajene', 'Mewadahi mahasiswa dari kampus-kampus di area Pangkajene dan sekitarnya.', '120+ Kader Aktif', 1, 1],
      ['Koordinator Wilayah Rappang', 'Basis pergerakan utama untuk institusi pendidikan tinggi di wilayah utara Sidrap.', '85+ Kader Aktif', 2, 1],
      ['Koordinator Wilayah Makassar', 'Wadah silaturahmi dan pembinaan bagi mahasiswa asal Sidrap yang menempuh pendidikan di Kota Makassar.', '200+ Kader Aktif', 3, 1],
      ['Koordinator Wilayah Parepare', 'Mengoordinasikan kegiatan dan kajian bagi kader LISAN yang tersebar di wilayah Parepare.', '90+ Kader Aktif', 4, 1]
    ];

    for (const k of defaultKorwils) {
      await connection.query('INSERT INTO korwil (name, kampus, anggota, urutan, is_active) VALUES (?, ?, ?, ?, ?)', k);
    }
  }

  console.log('\n================================================================');
  console.log('  [BERHASIL] Database db_lisan dan 14 tabel siap digunakan!');
  console.log('================================================================');
  await connection.end();
  process.exit(0);
}

run().catch(err => {
  console.error('\n[GAGAL SETUP]:', err.message);
  process.exit(1);
});
