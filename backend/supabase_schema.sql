-- ==============================================================================
-- SKEMA DATABASE LISAN UNTUK SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Petunjuk Penggunaan:
-- 1. Buka dashboard project Supabase Anda di https://supabase.com
-- 2. Masuk ke menu "SQL Editor" di bilah samping kiri.
-- 3. Klik "New query", tempel (paste) seluruh isi file ini, lalu klik "Run".
-- ==============================================================================

-- 1. Trigger Helper untuk Auto-Update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================================================================
-- 2. TABEL PENGGUNA & AUTENTIKASI (users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 3. TABEL HERO SLIDES (hero_slides)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS hero_slides (
    id SERIAL PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    title VARCHAR(150) NOT NULL,
    highlight VARCHAR(100) NOT NULL,
    sub TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 4. TABEL BERITA & ARTIKEL (berita)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS berita (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    excerpt TEXT,
    content TEXT,
    image_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Draft',
    author VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_berita_status ON berita(status);
CREATE INDEX IF NOT EXISTS idx_berita_category ON berita(category);

-- ==============================================================================
-- 5. TABEL GALERI FOTO (galeri)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS galeri (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    grid_span VARCHAR(50) DEFAULT NULL,
    date_taken TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 6. TABEL PROGRAM KERJA UTAMA (program)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS program (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Terjadwal',
    participant_count INT DEFAULT 0,
    icon VARCHAR(100),
    color_theme VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 7. TABEL PROKER & MATRIKS (proker, proker_schedule, proker_notifications, proker_files)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS proker (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(50) NOT NULL,
    kegiatan VARCHAR(255) NOT NULL,
    penanggung_jawab VARCHAR(255) NOT NULL,
    tahun_kepengurusan VARCHAR(50) NOT NULL,
    progres NUMERIC(5,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Belum Mulai',
    keterangan_terlaksana TEXT,
    keterangan_tidak_terlaksana TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_proker_kode_tahun UNIQUE (kode, tahun_kepengurusan)
);
CREATE INDEX IF NOT EXISTS idx_proker_tahun ON proker(tahun_kepengurusan);

DROP TRIGGER IF EXISTS trg_proker_updated_at ON proker;
CREATE TRIGGER trg_proker_updated_at
    BEFORE UPDATE ON proker
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS proker_schedule (
    id SERIAL PRIMARY KEY,
    proker_id INT NOT NULL REFERENCES proker(id) ON DELETE CASCADE,
    bulan VARCHAR(20) NOT NULL,
    tanggal VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Belum Mulai',
    keterangan TEXT,
    foto_url VARCHAR(255),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_proker_sched_id ON proker_schedule(proker_id);

DROP TRIGGER IF EXISTS trg_proker_sched_updated_at ON proker_schedule;
CREATE TRIGGER trg_proker_sched_updated_at
    BEFORE UPDATE ON proker_schedule
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS proker_notifications (
    id SERIAL PRIMARY KEY,
    proker_id INT NOT NULL REFERENCES proker(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read SMALLINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_proker_notif_read ON proker_notifications(is_read);

CREATE TABLE IF NOT EXISTS proker_files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 8. TABEL RELAWAN & DONOR DARAH (relawan, donor)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS relawan (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    instansi VARCHAR(150) NOT NULL,
    daerah VARCHAR(100) NOT NULL,
    golongan_darah VARCHAR(10) NOT NULL,
    no_hp VARCHAR(20) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donor (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    blood_type VARCHAR(10) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    last_donation DATE DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'Bisa Donor',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 9. TABEL DEPARTEMEN & PENGURUS (departemen, pengurus)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS departemen (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    color_theme VARCHAR(100) NOT NULL,
    deskripsi TEXT NOT NULL,
    program_unggulan TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pengurus (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    jabatan VARCHAR(150) NOT NULL,
    departemen_id INT REFERENCES departemen(id) ON DELETE SET NULL,
    foto_url VARCHAR(255),
    urutan INT DEFAULT 0,
    bio TEXT,
    email VARCHAR(100),
    instagram VARCHAR(100),
    linkedin VARCHAR(100),
    kampus VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pengurus_dept ON pengurus(departemen_id);

-- ==============================================================================
-- 10. TABEL PENGATURAN WEBSITE & PROFIL ORGANISASI (pengaturan)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS pengaturan (
    id SERIAL PRIMARY KEY,
    nama_organisasi VARCHAR(255) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telepon VARCHAR(50) NOT NULL,
    alamat TEXT NOT NULL,
    instagram VARCHAR(255),
    facebook VARCHAR(255),
    youtube VARCHAR(255),
    tentang_organisasi TEXT,
    sejarah TEXT,
    visi TEXT,
    misi JSONB,
    nilai_organisasi JSONB,
    menu_visibility JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 11. TABEL KOTAK PESAN (pesan)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS pesan (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read SMALLINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pesan_read ON pesan(is_read);

-- ==============================================================================
-- 12. TABEL KADER (kader)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS kader (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    institusi VARCHAR(150) NOT NULL,
    angkatan VARCHAR(50) NOT NULL,
    tahun VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_kader_tahun ON kader(tahun);

-- ==============================================================================
-- 13. TABEL KOORDINATOR WILAYAH (korwil)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS korwil (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    kampus TEXT NOT NULL,
    anggota VARCHAR(100) NOT NULL,
    urutan INT DEFAULT 0,
    is_active SMALLINT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_korwil_active ON korwil(is_active);

-- ==============================================================================
-- 14. SEED DATA AWAL (DEFAULT VALUES)
-- ==============================================================================

-- Admin Default (admin@lisan.id / password: password123)
INSERT INTO users (name, email, password, role)
SELECT 'Admin Utama', 'admin@lisan.id', '$2b$10$y8dboD11ijbI0IEcehbo8OX2NkYgdHqNUmwUCmBSiRZpky.FhROl2', 'Admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@lisan.id');

-- Hero Slides Default
INSERT INTO hero_slides (image_url, title, highlight, sub)
SELECT 'https://images.unsplash.com/photo-1529119368496-2dfda6ec2804?w=1920&q=85', 'Pemimpin Masa Depan', 'Lahir di Sini', 'Bergabunglah dengan mahasiswa berdedikasi yang membentuk perubahan nyata di masyarakat.'
WHERE NOT EXISTS (SELECT 1 FROM hero_slides);

INSERT INTO hero_slides (image_url, title, highlight, sub)
SELECT 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1920&q=85', 'Pemimpin Masa Depan', 'Lahir di Sini', 'Bergabunglah dengan mahasiswa berdedikasi yang membentuk perubahan nyata di masyarakat.'
WHERE (SELECT COUNT(*) FROM hero_slides) = 1;

INSERT INTO hero_slides (image_url, title, highlight, sub)
SELECT 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=85', 'Pemimpin Masa Depan', 'Lahir di Sini', 'Bergabunglah dengan mahasiswa berdedikasi yang membentuk perubahan nyata di masyarakat.'
WHERE (SELECT COUNT(*) FROM hero_slides) = 2;

-- Departemen Default
INSERT INTO departemen (nama, icon, color_theme, deskripsi, program_unggulan)
SELECT 
    'Keperempuanan',
    'Award',
    'bg-rose-50 text-rose-600 border-rose-100',
    'Wadah pemberdayaan, penguatan kapasitas, advokasi, serta pengembangan potensi kader mahasiswi Islam dalam ranah sosial dan keorganisasian.',
    '["Kajian Isu Keperempuanan", "Sekolah Pemberdayaan Perempuan", "Bina Karakter Muslimah Tangguh"]'
WHERE NOT EXISTS (SELECT 1 FROM departemen WHERE nama = 'Keperempuanan');

INSERT INTO departemen (nama, icon, color_theme, deskripsi, program_unggulan)
SELECT 
    'Media Informasi dan Komunikasi',
    'Megaphone',
    'bg-amber-50 text-amber-600 border-amber-100',
    'Mengelola arus informasi, publikasi kegiatan, produksi konten kreatif, dan membangun citra positif organisasi melalui platform digital dan jejaring komunikasi.',
    '["Manajemen Media Digital & Website", "Pelatihan Jurnalistik & Desain Grafis", "Produksi Konten Edukasi & Syiar"]'
WHERE NOT EXISTS (SELECT 1 FROM departemen WHERE nama = 'Media Informasi dan Komunikasi');

INSERT INTO departemen (nama, icon, color_theme, deskripsi, program_unggulan)
SELECT 
    'Lingkar Donor Darah Sidrap',
    'HeartHandshake',
    'bg-red-50 text-red-600 border-red-100',
    'Pusat koordinasi aksi kemanusiaan donor darah, penyediaan basis data pendonor sukarela, serta respons cepat tanggap darurat kebutuhan darah bagi masyarakat Sidenreng Rappang.',
    '["Aksi Donor Darah Rutin", "Layanan Darurat Kebutuhan Darah", "Perekrutan & Database Relawan Donor"]'
WHERE NOT EXISTS (SELECT 1 FROM departemen WHERE nama = 'Lingkar Donor Darah Sidrap');

INSERT INTO departemen (nama, icon, color_theme, deskripsi, program_unggulan)
SELECT 
    'Pengkaderan',
    'Users',
    'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Merancang dan mengawal alur pembinaan anggota, mulai dari proses rekrutmen hingga pelatihan kepemimpinan kader sebagai jantung regenerasi organisasi LISAN.',
    '["Latihan Kader & Kepemimpinan", "Upgrading Kapasitas Pengurus", "Mentoring & Pendampingan Kader Baru"]'
WHERE NOT EXISTS (SELECT 1 FROM departemen WHERE nama = 'Pengkaderan');

INSERT INTO departemen (nama, icon, color_theme, deskripsi, program_unggulan)
SELECT 
    'Advokasi dan Pengorganisasian Sosial',
    'Shield',
    'bg-blue-50 text-blue-600 border-blue-100',
    'Mewadahi pendampingan aspirasi, pembelaan hak-hak masyarakat, analisis kebijakan publik, serta pengorganisasian gerakan kepedulian sosial kemasyarakatan.',
    '["Advokasi Kebijakan Publik & Sosial", "Kajian Kritis & Riset Kebijakan", "Pengorganisasian Gerakan Komunitas"]'
WHERE NOT EXISTS (SELECT 1 FROM departemen WHERE nama = 'Advokasi dan Pengorganisasian Sosial');

-- Pengaturan Awal Default
INSERT INTO pengaturan (
    id, nama_organisasi, email, telepon, alamat, instagram, facebook, youtube,
    tentang_organisasi, sejarah, visi, misi, nilai_organisasi, menu_visibility
)
VALUES (
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
    '[
        "Menyelenggarakan pembinaan karakter Islami yang berkelanjutan bagi mahasiswa.",
        "Membangun kapasitas kepemimpinan dan manajerial kader melalui pelatihan terstruktur.",
        "Berperan aktif dalam memberikan solusi terhadap isu-isu sosial kemasyarakatan.",
        "Memperluas jaringan kerja sama dengan berbagai instansi dan elemen masyarakat.",
        "Menjadikan organisasi sebagai wadah inovasi dan pengembangan potensi pemuda."
    ]'::jsonb,
    '[
        {"id": 1, "title": "Integritas & Moralitas", "desc": "Menjunjung tinggi kejujuran, etika, dan nilai-nilai akhlakul karimah dalam setiap tindakan.", "icon": "Shield"},
        {"id": 2, "title": "Progresif & Intelektual", "desc": "Berpikir kritis, haus akan ilmu pengetahuan, dan terus melakukan pembaruan positif.", "icon": "Sparkles"},
        {"id": 3, "title": "Kepedulian Sosial", "desc": "Peka terhadap persoalan masyarakat dan aktif memberikan kontribusi nyata.", "icon": "Heart"},
        {"id": 4, "title": "Kolaboratif", "desc": "Membangun sinergi dan kebersamaan untuk mencapai tujuan bersama yang lebih besar.", "icon": "Users"}
    ]'::jsonb,
    '{
        "beranda": true,
        "profil": true,
        "profil_about": true,
        "profil_sejarah": true,
        "profil_visi_misi": true,
        "profil_nilai": true,
        "organisasi": true,
        "org_structure": true,
        "org_departemen": true,
        "org_korwil": true,
        "program": true,
        "program_kajian": true,
        "program_sosial": true,
        "program_leadership": true,
        "media": true,
        "media_news": true,
        "media_gallery": true,
        "donor": true,
        "contact": true
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Reset Sequence ID agar sinkron dengan data seed
SELECT setval(pg_get_serial_sequence('pengaturan', 'id'), coalesce(max(id), 1)) FROM pengaturan;
SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('hero_slides', 'id'), coalesce(max(id), 1)) FROM hero_slides;
SELECT setval(pg_get_serial_sequence('departemen', 'id'), coalesce(max(id), 1)) FROM departemen;
