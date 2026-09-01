const pool = require('../config/db');

async function migrateProfileAndKorwil() {
  console.log('--- Memulai Migrasi Profil, Korwil, dan Visibilitas Navbar ---');

  const connection = await pool.getConnection();
  try {
    // 1. Tambah kolom baru di tabel pengaturan jika belum ada
    const [columns] = await connection.query(`SHOW COLUMNS FROM pengaturan`);
    const colNames = columns.map(c => c.Field);

    const colsToAdd = [
      { name: 'tentang_organisasi', type: 'TEXT' },
      { name: 'sejarah', type: 'LONGTEXT' },
      { name: 'visi', type: 'TEXT' },
      { name: 'misi', type: 'JSON' },
      { name: 'nilai_organisasi', type: 'JSON' },
      { name: 'menu_visibility', type: 'JSON' }
    ];

    for (const col of colsToAdd) {
      if (!colNames.includes(col.name)) {
        console.log(`Menambahkan kolom ${col.name} ke tabel pengaturan...`);
        await connection.query(`ALTER TABLE pengaturan ADD COLUMN ${col.name} ${col.type} DEFAULT NULL`);
      }
    }

    // 2. Buat tabel korwil jika belum ada
    console.log('Membuat tabel korwil jika belum ada...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS korwil (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        kampus TEXT NOT NULL,
        anggota VARCHAR(100) NOT NULL,
        urutan INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Seed data awal profil jika belum ada di pengaturan id = 1
    const [settings] = await connection.query('SELECT * FROM pengaturan WHERE id = 1');
    if (settings.length > 0) {
      const s = settings[0];
      const defaultMisi = JSON.stringify([
        "Menyelenggarakan pembinaan karakter Islami yang berkelanjutan bagi mahasiswa.",
        "Membangun kapasitas kepemimpinan dan manajerial kader melalui pelatihan terstruktur.",
        "Berperan aktif dalam memberikan solusi terhadap isu-isu sosial kemasyarakatan.",
        "Memperluas jaringan kerja sama dengan berbagai instansi dan elemen masyarakat.",
        "Menjadikan organisasi sebagai wadah inovasi dan pengembangan potensi pemuda."
      ]);

      const defaultNilai = JSON.stringify([
        {
          id: 1,
          title: "Integritas & Moralitas",
          desc: "Menjunjung tinggi kejujuran, etika, dan nilai-nilai akhlakul karimah dalam setiap tindakan dan pemikiran.",
          icon: "Shield"
        },
        {
          id: 2,
          title: "Intelektualitas & Keilmuan",
          desc: "Mengedepankan pemikiran kritis, budaya literasi, dan pencarian kebenaran berbasis ilmu pengetahuan yang sahih.",
          icon: "BookOpen"
        },
        {
          id: 3,
          title: "Solidaritas & Ukhuwah",
          desc: "Mempererat tali persaudaraan sesama anggota dan saling mendukung dalam kebaikan serta perjuangan bersama.",
          icon: "HeartHandshake"
        },
        {
          id: 4,
          title: "Inovatif & Progresif",
          desc: "Berani menghadirkan gagasan baru yang membawa dampak positif dan relevan bagi kemajuan zaman.",
          icon: "Lightbulb"
        },
        {
          id: 5,
          title: "Keadilan Sosial",
          desc: "Berpihak pada kemaslahatan umat dan memperjuangkan keadilan bagi seluruh lapisan masyarakat.",
          icon: "Scale"
        }
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
        donor: true,
        media: true,
        media_news: true,
        media_gallery: true,
        contact: true
      });

      const defaultTentang = "Lingkar Mahasiswa Islam untuk Perubahan (LISAN) adalah organisasi pergerakan mahasiswa independen yang berpusat di Kabupaten Sidenreng Rappang, Sulawesi Selatan. LISAN berkomitmen mencetak pemimpin masa depan yang berintegritas, kritis, dan berakar pada nilai-nilai keislaman.";

      const defaultSejarah = "Berawal dari kepedulian mendalam terhadap dinamika mahasiswa dan pemuda di Kabupaten Sidenreng Rappang, sekelompok mahasiswa Muslim berkumpul untuk menyatukan visi dalam sebuah pergerakan intelektual dan spiritual.\n\nLingkar Mahasiswa Islam untuk Perubahan (LISAN) didirikan dengan semangat untuk memberikan kontribusi nyata bagi masyarakat. Di tengah arus modernisasi yang bergerak cepat, LISAN hadir sebagai wadah pembinaan yang fokus pada pengembangan karakter, integritas, dan kapasitas kepemimpinan mahasiswa berlandaskan nilai-nilai Islam.\n\nPada masa-masa awalnya, organisasi ini bermula dari kelompok-kelompok kajian kecil (halaqah) di kampus-kampus lokal. Diskusi-diskusi intensif mengenai peran mahasiswa sebagai Agent of Change dan Iron Stock mendorong para pendiri untuk melembagakan gerakan ini agar dapat memberikan dampak yang lebih luas dan terstruktur.";

      const defaultVisi = "Menjadi organisasi mahasiswa Islam terdepan yang melahirkan kader berkarakter Qur'ani, berwawasan luas, dan menjadi motor penggerak perubahan positif bagi masyarakat.";

      await connection.query(`
        UPDATE pengaturan SET 
          tentang_organisasi = COALESCE(tentang_organisasi, ?),
          sejarah = COALESCE(sejarah, ?),
          visi = COALESCE(visi, ?),
          misi = COALESCE(misi, ?),
          nilai_organisasi = COALESCE(nilai_organisasi, ?),
          menu_visibility = COALESCE(menu_visibility, ?)
        WHERE id = 1
      `, [defaultTentang, defaultSejarah, defaultVisi, defaultMisi, defaultNilai, defaultMenuVisibility]);
      console.log('Default data profil dan menu visibility berhasil diset!');
    }

    // 4. Seed data awal Korwil jika kosong
    const [korwils] = await connection.query('SELECT COUNT(*) as count FROM korwil');
    if (korwils[0].count === 0) {
      console.log('Memasukkan data awal Koordinator Wilayah...');
      const defaultKorwils = [
        ['Koordinator Wilayah Pangkajene', 'Mewadahi mahasiswa dari kampus-kampus di area Pangkajene dan sekitarnya.', '120+ Kader Aktif', 1, 1],
        ['Koordinator Wilayah Rappang', 'Basis pergerakan utama untuk institusi pendidikan tinggi di wilayah utara Sidrap.', '85+ Kader Aktif', 2, 1],
        ['Koordinator Wilayah Makassar', 'Wadah silaturahmi dan pembinaan bagi mahasiswa asal Sidrap yang menempuh pendidikan di Kota Makassar.', '200+ Kader Aktif', 3, 1],
        ['Koordinator Wilayah Parepare', 'Mengoordinasikan kegiatan dan kajian bagi kader LISAN yang tersebar di wilayah Parepare.', '90+ Kader Aktif', 4, 1]
      ];

      for (const k of defaultKorwils) {
        await connection.query('INSERT INTO korwil (name, kampus, anggota, urutan, is_active) VALUES (?, ?, ?, ?, ?)', k);
      }
      console.log('Data default Korwil berhasil dimasukkan!');
    }

    console.log('--- Migrasi Profil dan Korwil Berhasil! ---');
  } catch (err) {
    console.error('Error saat migrasi:', err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrateProfileAndKorwil();
