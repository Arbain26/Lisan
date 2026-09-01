# Website Resmi Organisasi LISAN

Platform web resmi organisasi **LISAN** yang dibangun menggunakan arsitektur modern **Fullstack JavaScript** (React.js + Vite pada sisi frontend dan Node.js + Express.js + MySQL pada sisi backend). Website ini dilengkapi dengan halaman publik informatif serta Content Management System (CMS) Panel Admin terpadu untuk mengelola seluruh data organisasi secara dinamis.

---

## 🚀 Fitur Utama

### 🌐 1. Halaman Publik
- **Beranda Interaktif**: Hero slider dinamis, ringkasan statistik organisasi, program kerja unggulan, dokumentasi kegiatan, dan berita terkini.
- **Profil Organisasi Dinamis**:
  - **Tentang LISAN**: Profil umum dan identitas organisasi.
  - **Sejarah**: Narasi perjalanan dan tonggak sejarah berdirinya organisasi.
  - **Visi & Misi**: Poin-poin arah gerak dan tujuan organisasi.
  - **Nilai Organisasi**: Prinsip-prinsip dasar yang menjadi pedoman gerak.
- **Struktur Organisasi Berjenjang**:
  - **Pengurus Inti**: Tampilan hierarki pimpinan (Ketua Umum di posisi puncak tengah, didampingi Bendahara Umum dan Sekretaris Umum di barisan bawahnya).
  - **Departemen & Divisi**: Pembedaan tegas antara **Koordinator Departemen** (berdiri di tengah) dan barisan **Anggota Departemen**.
  - **Pop-up Detail Profil Pengurus**: Setiap kartu pengurus dapat diklik untuk melihat informasi lengkap (foto resolusi tinggi, asal kampus/institusi, biografi/motto, email, Instagram, dan LinkedIn).
- **Departemen & Program Kerja (Matrix Proker)**:
  - Matriks kalender tahunan jadwal program kerja bulanan dari setiap departemen.
- **Koordinator Wilayah (Korwil)**:
  - Daftar jejaring koordinator wilayah dan kampus-kampus mitra yang tersebar di berbagai daerah.
- **Lingkar Donor**:
  - Informasi program sosial donor darah serta formulir pendaftaran relawan donor aktif.
- **Media & Berita**:
  - Publikasi artikel, rilis berita resmi, dan galeri dokumentasi foto/video kegiatan.
- **Kontak**:
  - Formulir pengiriman pesan langsung yang terhubung ke database admin.

---

### 🛠️ 2. Panel Admin (CMS / Admin Dashboard)
- **Dashboard Statistik**: Metrik analitik jumlah pengurus, kader, relawan donor, pesan masuk, dan departemen.
- **Kelola Profil (`/admin/profil`)**: Pengaturan teks Tentang LISAN, Sejarah, Visi-Misi, dan Nilai Organisasi secara mandiri tanpa coding.
- **Kelola Struktur Pengurus (`/admin/struktur`)**:
  - Manajemen data pengurus (Pengurus Inti maupun Departemen).
  - Pilihan cepat preset jabatan (Ketua, Bendahara, Sekretaris, Koordinator, Anggota).
  - Pengaturan urutan tampil (*sort index*).
  - Kelola detail profil (Asal Kampus, Bio, Email, Instagram, LinkedIn, dan foto resmi).
- **Kelola Departemen & Proker (`/admin/proker`)**:
  - Manajemen divisi/departemen organisasi.
  - Import dan sinkronisasi matriks jadwal proker otomatis dari file Excel.
  - Tambah, edit, dan tandai status terlaksana kegiatan per bulan.
- **Kelola Kader (`/admin/kader`)**:
  - Pendataan anggota/kader berdasarkan tahun dan angkatan kaderisasi.
  - Fitur import massal data kader dari file Excel.
- **Kelola Koordinator Wilayah (`/admin/korwil`)**:
  - Manajemen data daerah korwil, koordinator penanggung jawab, daftar kampus, dan status keaktifan.
- **Kelola Berita, Artikel & Galeri**:
  - CRUD berita kegiatan, artikel opini, dan upload foto/video galeri.
- **Kelola Relawan Donor & Pesan**:
  - Monitoring pendaftar relawan donor darah dan kotak masuk pesan dari publik.
- **Pengaturan Visibilitas Menu Navbar (`/admin/pengaturan`)**:
  - Sakelar switch aktif/nonaktif untuk memunculkan atau menyembunyikan menu navbar tertentu di halaman publik secara *real-time*.

---

## 💻 Struktur Teknologi (Tech Stack)

| Bagian | Teknologi |
|---|---|
| **Frontend** | React 19, Vite, TailwindCSS, Framer Motion, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, MySQL2 (Connection Pool), Multer (File Upload), JWT, Bcrypt |
| **Database** | MySQL 8.x / MariaDB |
| **Peralatan Dev** | Laragon / XAMPP, Postman, Git |

---

## 📂 Struktur Direktori Proyek

```plaintext
Lisan-main/
├── backend/                         # Backend REST API (Node.js + Express)
│   ├── config/
│   │   └── db.js                    # Konfigurasi koneksi MySQL Pool
│   ├── scripts/                     # Skrip database & migrasi SQL
│   │   ├── admin_setup.sql          # Skema inisialisasi tabel dasar
│   │   ├── migrate_profile_korwil.js# Migrasi profil & korwil
│   │   └── migrate_pengurus_profile.js# Migrasi detail profil pengurus
│   ├── src/
│   │   ├── controllers/             # Logic controller per fitur (pengurus, proker, auth, dll.)
│   │   ├── middleware/              # JWT auth middleware & Multer upload
│   │   ├── routes/                  # REST API endpoints routing
│   │   ├── services/                # Parser Excel & layanan kalkulasi
│   │   └── utils/                   # Helper response, date, dan logger
│   ├── uploads/                     # Direktori penyimpanan media & foto pengurus
│   └── server.js                    # Entry point Express backend server
│
├── public/                          # Aset statis frontend (favicon, logo, icons)
├── src/                             # Kode sumber frontend (React + Vite)
│   ├── assets/                      # Asset gambar lokal
│   ├── components/
│   │   ├── auth/                    # ProtectedRoute guard
│   │   ├── layout/                  # Navbar, Footer, AdminLayout, Layout publik
│   │   ├── sections/                # Komponen section beranda (Hero, About, Proker, dll.)
│   │   └── ui/                      # Modal, Skeleton, ToastProvider, PageHeader
│   ├── constants/                   # Data konfigurasi menu navLinks dan program
│   ├── context/                     # AuthContext (state session admin)
│   ├── hooks/                       # Custom hooks (useCRUD, useFetch)
│   ├── pages/                       # Halaman aplikasi
│   │   ├── admin/                   # Halaman CMS Admin (Dashboard, Profil, Struktur, Proker, dll.)
│   │   ├── auth/                    # Halaman login admin
│   │   └── public/                  # Halaman publik (Home, About, Sejarah, Struktur, Korwil, dll.)
│   ├── services/                    # Axios API client & mediaUrl resolver
│   ├── App.jsx                      # Router deklarasi aplikasi
│   ├── index.css                    # TailwindCSS base styling
│   └── main.jsx                     # Entry point React
│
├── jalankan-website.bat             # Skrip 1-klik untuk menyalakan frontend & backend
├── push-ke-github.bat               # Skrip 1-klik untuk melakukan git push
├── package.json                     # Konfigurasi dependensi frontend
└── README.md                        # Dokumentasi resmi proyek
```

---

## ⚡ Panduan Instalasi & Menjalankan Proyek

### 1. Prasyarat Sistem
- **Node.js**: Versi 18 atau lebih baru.
- **MySQL Database**: Berjalan di Laragon, XAMPP, atau MySQL standalone (port default `3306`).

---

### 2. Konfigurasi Database
1. Buat database baru di MySQL dengan nama:
   ```sql
   CREATE DATABASE lisan_db;
   ```
2. Jalankan skrip setup database:
   ```bash
   cd backend
   node scripts/setup_db.js
   node scripts/migrate_profile_korwil.js
   node scripts/migrate_pengurus_profile.js
   ```

---

### 3. Konfigurasi Environment File
Buat file `backend/.env` (atau gunakan template dari `backend/.env.example`):
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=lisan_db
JWT_SECRET=lisan_secret_key_jwt_2025
```

---

### 4. Instalasi Dependensi
Jalankan instalasi dependensi untuk frontend dan backend:

```bash
# 1. Dependensi Frontend (di root folder)
npm install

# 2. Dependensi Backend
cd backend
npm install
cd ..
```

---

### 5. Menjalankan Website

#### Cara Cepat (1-Klik):
Cukup klik ganda (*double-click*) file:
📄 **`jalankan-website.bat`**  
*(Skrip ini otomatis menyalakan Backend API di port `5000` dan Frontend di port `5173`).*

#### Cara Manual:
Buka dua terminal terpisah:
```bash
# Terminal 1: Menjalankan Backend
cd backend
npm run dev

# Terminal 2: Menjalankan Frontend
npm run dev
```

Akses website melalui browser:
- 🌐 **Halaman Publik**: `http://localhost:5173`
- 🔒 **Panel Admin**: `http://localhost:5173/admin`
- 🔌 **Backend REST API**: `http://localhost:5000`

---

## 🔐 Akun Default Admin
Gunakan kredensial berikut untuk masuk ke panel admin pertama kali:
- **Username / Email**: `admin@lisan.or.id` (atau `admin`)
- **Password**: `admin123`

---

## 📄 Lisensi
Hak Cipta &copy; 2026 **Organisasi LISAN**. Seluruh hak cipta dilindungi undang-undang.
