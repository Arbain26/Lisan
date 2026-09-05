# 🌟 Website Resmi Organisasi LISAN
### *Lingkar Mahasiswa Islam untuk Perubahan — Kab. Sidenreng Rappang*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Serverless%20Ready-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

Portal web resmi organisasi **LISAN** (Lingkar Mahasiswa Islam untuk Perubahan) yang dibangun dengan arsitektur modern **Fullstack JavaScript** (*Decoupled Client-Server*). Website ini dirancang untuk menyajikan transparansi kegiatan, publikasi informasi, pendaftaran relawan & donor darah, serta dilengkapi sistem manajemen konten mandiri (**CMS Admin Dashboard**) untuk mengelola seluruh data organisasi secara dinamis tanpa perlu menyentuh kode program.

---

## 📑 Daftar Isi
- [Fitur Utama](#-fitur-utama)
  - [1. Halaman Publik](#1-halaman-publik-portal)
  - [2. Panel Admin (CMS)](#2-panel-admin-cms--dashboard)
- [Teknologi & Arsitektur](#-teknologi--arsitektur-tech-stack)
- [Struktur Direktori](#-struktur-direktori-proyek)
- [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan-lokal)
  - [1. Prasyarat Sistem](#1-prasyarat-sistem)
  - [2. Konfigurasi Environment (.env)](#2-konfigurasi-environment-env)
  - [3. Setup Database MySQL](#3-setup-database-mysql)
  - [4. Instalasi Dependensi](#4-instalasi-dependensi)
  - [5. Menjalankan Website](#5-menjalankan-website)
- [Kredensial Default Admin](#-kredensial-default-admin)
- [Panduan Deployment (Supabase & Vercel)](#-panduan-deployment-supabase--vercel)
- [Referensi Endpoint REST API](#-referensi-endpoint-rest-api)
- [Format Unggah File Excel](#-format-unggah-file-excel-proker--kader)
- [Troubleshooting & Solusi](#-troubleshooting--solusi-kendala-umum)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

### 🌐 1. Halaman Publik (Portal)
- **Beranda Interaktif**:
  - Hero slider carousel dinamis dengan kontrol navigasi & animasi halus.
  - Statistik cepat (*quick metrics*): jumlah kader, departemen, proker terlaksana, dan wilayah cabang.
  - Kartu sorotan program unggulan, cuplikan berita terbaru, dan dokumentasi galeri foto.
- **Profil Organisasi Lengkap**:
  - **Tentang LISAN (`/about`)**: Profil umum, filosofi, dan identitas pergerakan organisasi.
  - **Sejarah (`/sejarah`)**: Narasi kronologis sejarah berdirinya organisasi.
  - **Visi & Misi (`/visi-misi`)**: Poin-poin visi masa depan dan misi strategis organisasi.
  - **Nilai Organisasi (`/nilai-organisasi`)**: Nilai-nilai dasar dan prinsip perjuangan kader.
- **Struktur Organisasi Hierarkis (`/structure`)**:
  - Bagan kepengurusan terstruktur rapi: **Pengurus Inti** (Ketua Umum di puncak tengah, didampingi Sekretaris Umum dan Bendahara Umum) serta barisan **Departemen & Divisi**.
  - **Modal Pop-Up Detail Profil Pengurus**: Klik pada kartu pengurus untuk menampilkan foto beresolusi tinggi, asal kampus/institusi, bio/motto, email, akun Instagram, dan LinkedIn.
- **Departemen & Program Kerja (`/departemen` & `/programs`)**:
  - Profil rinci setiap departemen beserta program kerja unggulannya.
  - **Matriks Kalender Proker Tahunan**: Jadwal program kerja per bulan (Semester Ganjil & Genap) dengan indikator visual status kegiatan (Belum Mulai, Terlaksana, dsb.).
- **Jejaring Koordinator Wilayah (`/koordinator-wilayah`)**:
  - Direktori koordinator wilayah (Korwil) serta daftar kampus-kampus mitra binaan di berbagai daerah.
- **Lingkar Donor Darah (`/donor`)**:
  - Informasi aksi kemanusiaan donor darah dan formulir pendaftaran calon pendonor darah aktif.
- **Media & Berita (`/news` & `/news/:id`)**:
  - Berita resmi organisasi, opini kader, pencarian artikel, filter kategori, dan halaman baca artikel lengkap.
- **Galeri Dokumentasi (`/gallery`)**:
  - Galeri foto dan video dokumentasi kegiatan LISAN dengan lightbox viewer.
- **Kontak & Pengaduan (`/contact`)**:
  - Informasi kontak resmi, alamat sekretariat, tautan media sosial, serta formulir pengiriman pesan/aspirasi langsung ke database admin.
- **Gabung Relawan / Kader (`/join`)**:
  - Formulir registrasi bagi simpatisan atau calon kader yang ingin bergabung dalam pergerakan.

---

### 🛠️ 2. Panel Admin (CMS / Dashboard)
Akses melalui `/login` atau `/admin`:
- **Dashboard Analitik (`/admin/dashboard`)**:
  - Ringkasan statistik real-time: total pengurus, kader, relawan donor, pesan belum dibaca, departemen, dan program kerja aktif.
- **Kelola Profil Organisasi (`/admin/profil`)**:
  - Editor dinamis untuk memperbarui konten *Tentang Organisasi*, *Sejarah*, *Visi*, *Misi*, dan *Nilai Organisasi* secara instan tanpa menyentuh kode.
- **Kelola Struktur Pengurus (`/admin/struktur`)**:
  - Tambah, ubah, dan hapus pengurus inti maupun departemen.
  - Pengaturan urutan prioritas tampil (*sort index*).
  - Unggah foto resmi pengurus dan pengisian media sosial / kontak profesional.
- **Kelola Program Kerja & Matriks Excel (`/admin/proker`)**:
  - Manajemen data program kerja dan penanggung jawab.
  - **Fitur Import Excel**: Unggah spreadsheet jadwal program tahunan langsung ke sistem.
  - Pembaruan status pelaksanaan kegiatan bulanan secara visual.
- **Kelola Database Kader (`/admin/kader`)**:
  - Direktori data kader lengkap (Nama, Angkatan, Kampus, Alamat, Jenjang Kaderisasi, Semester, Status).
  - **Import Massal Excel**: Dilengkapi deteksi anti-duplikasi otomatis berbasis nama dan angkatan.
  - Pencarian dan filter multi-kolom yang responsif.
- **Kelola Koordinator Wilayah (`/admin/korwil`)**:
  - Manajemen data daerah korwil, koordinator penanggung jawab, daftar kampus mitra, serta sakelar keaktifan wilayah.
- **Kelola Berita & Artikel (`/admin/berita` & `/admin/artikel`)**:
  - CRUD artikel/berita dengan status *Draft* atau *Published*, pemilihan kategori, dan cover image.
- **Kelola Galeri Dokumentasi (`/admin/galeri`)**:
  - Unggah foto kegiatan, judul, deskripsi, dan kategorisasi album dokumentasi.
- **Kelola Relawan & Donor Darah (`/admin/relawan` & `/admin/donor`)**:
  - Pantau dan kelola database relawan kemanusiaan serta relawan donor darah yang mendaftar via web.
- **Kotak Masuk Pesan (`/admin/pesan`)**:
  - Baca pesan/aspirasi masyarakat, tandai sudah dibaca (*read/unread*), dan hapus pesan usang.
- **Kelola Hero Slides (`/admin/hero`)**:
  - Atur gambar, judul, teks highlight, dan subjudul pada banner utama di beranda.
- **Pengaturan & Visibilitas Menu Navbar (`/admin/pengaturan`)**:
  - Konfigurasi identitas organisasi (nama, email, nomor kontak, alamat kantor, akun media sosial).
  - **Sakelar Visibilitas Menu Navbar**: Nyalakan atau matikan menu tertentu (misal: Sembunyikan *Donor Darah* atau *Korwil*) di navbar publik secara *real-time*.

---

## 💻 Teknologi & Arsitektur (Tech Stack)

| Lapisan | Teknologi | Deskripsi & Kegunaan |
|---|---|---|
| **Frontend Framework** | React 19 + Vite 8 | Single Page Application (SPA) cepat, modular, dan modern |
| **Styling & UI** | Tailwind CSS v4, Lucide React, Framer Motion | Desain antarmuka responsif, transisi halaman animasi, dan icon set modern |
| **State & Networking** | React Context API, React Router 7, Axios | Manajemen auth token (JWT) & request interceptor HTTP |
| **Backend Framework** | Node.js + Express.js v5 | RESTful API serverless-ready dengan arsitektur controller/service |
| **Database Engine** | **Dual Database**: MySQL 8.x & Supabase (PostgreSQL) | Fleksibel: MySQL untuk offline dev, Supabase Connection Pooler untuk produksi |
| **File Storage** | Multer (Local disk) & Supabase Storage (Cloud) | Penyimpanan gambar lokal atau bucket cloud otomatis saat di-hosting |
| **Auth & Keamanan** | JWT (JSON Web Token), Bcrypt.js, CORS | Otentikasi aman stateless dan hashing password terenkripsi |
| **Spreadsheet Engine**| SheetJS (xlsx) | Pemrosesan dan validasi berkas Microsoft Excel (.xlsx/.xls) |
| **Deployment Platform**| Vercel Serverless (`/api`) | Dukungan deployment monorepo frontend + backend serverless dalam 1 repositori |

---

## 📂 Struktur Direktori Proyek

```plaintext
Lisan/
├── api/                             # Serverless handler untuk deployment di Vercel
│   └── index.js                     # Jembatan export Express app ke Vercel Serverless Function
│
├── backend/                         # Backend REST API (Node.js + Express)
│   ├── config/
│   │   └── db.js                    # Dual Connection Adapter (MySQL Pool / Supabase Pooler)
│   ├── scripts/                     # Skrip otomatisasi & migrasi database
│   │   ├── admin_setup.sql          # Inisialisasi SQL akun admin default
│   │   ├── create_user.js           # CLI generator akun pengguna / admin baru
│   │   ├── migrate_mysql_to_supabase.js # Pemindah data massal dari MySQL lokal ke Supabase
│   │   ├── migrate_kader_fields.js  # Pembaruan skema & data tabel kader
│   │   ├── migrate_pengurus_profile.js # Penambahan kolom profil medsos pengurus
│   │   ├── migrate_profile_korwil.js# Penambahan kolom profil organisasi & tabel korwil
│   │   ├── setup_db.js              # Inisialisasi database db_lisan + seluruh tabel & seed data
│   │   └── test_db_connection.js    # Penguji koneksi database aktif
│   ├── src/
│   │   ├── controllers/             # Logic controller (auth, proker, kader, berita, dll.)
│   │   ├── middleware/              # JWT auth guard, Multer file upload, Central Error Handler
│   │   ├── routes/                  # Definisi endpoint REST API Express
│   │   ├── services/                # Excel parser & pemroses matriks proker
│   │   └── utils/                   # Logger dan fungsi utilitas
│   ├── uploads/                     # Folder penyimpanan berkas media lokal
│   ├── supabase_schema.sql          # Skema PostgreSQL lengkap untuk Supabase SQL Editor
│   ├── .env.example                 # Panduan variabel environment backend
│   └── server.js                    # Entry point aplikasi Express backend
│
├── public/                          # Aset statis publik (favicon, logo, icons)
├── src/                             # Kode sumber frontend (React + Vite)
│   ├── assets/                      # Asset gambar lokal & ilustrasi
│   ├── components/
│   │   ├── auth/                    # Komponen ProtectedRoute (Auth Guard)
│   │   ├── layout/                  # Navbar, Footer, AdminLayout, Public Layout
│   │   ├── sections/                # Sub-komponen Beranda (Hero, About, Proker, dll.)
│   │   └── ui/                      # Modal pop-up, Skeleton loader, ToastProvider
│   ├── constants/                   # Data konfigurasi menu navigasi
│   ├── context/                     # AuthContext (state session login admin & token)
│   ├── hooks/                       # Custom hooks (useFetch, useCRUD)
│   ├── pages/                       # Halaman aplikasi
│   │   ├── admin/                   # 15 Halaman Panel Admin (Dashboard, Proker, Kader, dll.)
│   │   ├── auth/                    # Halaman Login Admin (/login)
│   │   ├── public/                  # Halaman publik organisasi (About, Structure, Korwil, dll.)
│   │   └── index.jsx                # Re-export seluruh halaman publik
│   ├── services/                    # Axios API client & resolver URL foto/media
│   ├── App.jsx                      # Router deklarasi aplikasi (React Router 7)
│   ├── index.css                    # Tailwind CSS base styling & custom styles
│   └── main.jsx                     # Entry point React frontend
│
├── .env.example                     # Panduan variabel environment frontend
├── ALUR_WEBSITE_LISAN.md            # Dokumentasi arsitektur sistem & diagram alur kerja
├── jalankan-website.bat             # Skrip otomatis 1-klik untuk menyalakan MySQL, backend, & frontend
├── push-ke-github.bat               # Skrip 1-klik untuk git push ke repositori GitHub
├── vercel.json                      # Konfigurasi routing rewrite Vercel (SPA + API)
├── package.json                     # Konfigurasi dependensi frontend
└── README.md                        # Dokumentasi resmi proyek LISAN
```

---

## ⚡ Panduan Instalasi & Menjalankan (Lokal)

### 1. Prasyarat Sistem
- **Node.js**: Versi **18.x** atau **20.x+** ([Unduh Node.js](https://nodejs.org/)).
- **Git**: Untuk manajemen versi source code.
- **MySQL Database**: Berjalan di **Laragon**, **XAMPP**, atau MySQL Standalone (Port default `3306`).

---

### 2. Konfigurasi Environment (`.env`)

#### A. Backend Environment (`backend/.env`)
Salin file `backend/.env.example` menjadi `backend/.env`:
```bash
cp backend/.env.example backend/.env
```
Isi konfigurasi untuk database MySQL lokal:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MySQL Lokal Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_lisan

# Keamanan JWT
JWT_SECRET=lisan_super_secret_jwt_key_2026_change_in_production
```

> [!NOTE]
> Jika Anda ingin menggunakan **Supabase**, cukup isi `DATABASE_URL` (Connection Pooler Supabase) di file `backend/.env`. Sistem akan otomatis beralih ke mode PostgreSQL Supabase tanpa perlu mengubah kode!

#### B. Frontend Environment (`.env`)
Salin file `.env.example` di root proyek menjadi `.env`:
```bash
cp .env.example .env
```
Pastikan mengarah ke Backend API lokal:
```env
VITE_API_BASE=http://localhost:5000/api
```

---

### 3. Setup Database MySQL
Pastikan service MySQL Anda (Laragon/XAMPP) sudah menyala. Jalankan skrip setup database:
```bash
cd backend
node scripts/setup_db.js
```
Skrip di atas akan:
1. Membuat database `db_lisan` secara otomatis jika belum ada.
2. Membangun seluruh tabel yang diperlukan (*users*, *kader*, *proker*, *departemen*, *berita*, *pengurus*, dll.).
3. Mengisi data awal (*seed data*), termasuk akun admin default, departemen, slider hero, dan daftar kader perdana.

Jika Anda memperbarui fitur profil dan korwil, Anda juga dapat menjalankan:
```bash
node scripts/migrate_profile_korwil.js
node scripts/migrate_pengurus_profile.js
cd ..
```

---

### 4. Instalasi Dependensi
Jalankan instalasi dependensi untuk frontend (root) dan backend:

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

#### Opsi A: Cara Cepat (1-Klik untuk Windows)
Cukup klik ganda (*double click*) file:
📄 **`jalankan-website.bat`**  
Skrip ini akan secara otomatis:
- Memeriksa dan menyalakan MySQL Laragon jika belum aktif.
- Menjalankan Backend API di port `5000`.
- Menjalankan Frontend Vite di port `5173`.
- Membuka browser langsung ke `http://localhost:5173`.

#### Opsi B: Cara Manual via Terminal
Buka 2 jendela terminal terpisah:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Backend berjalan di: http://localhost:5000
```

**Terminal 2 (Frontend React):**
```bash
npm run dev
# Frontend berjalan di: http://localhost:5173
```

Akses website melalui browser:
- 🌐 **Halaman Publik**: `http://localhost:5173`
- 🔒 **Panel Admin**: `http://localhost:5173/login` atau `http://localhost:5173/admin`
- 🔌 **Backend REST API**: `http://localhost:5000/api`
- 🩺 **Health Check API**: `http://localhost:5000/api/health`

---

## 🔐 Kredensial Default Admin

Setelah menjalankan `setup_db.js`, Anda dapat langsung login ke panel admin menggunakan:

| Parameter | Kredensial |
|---|---|
| **URL Login** | `http://localhost:5173/login` |
| **Email / Username** | `admin@lisan.id` *(atau `admin@lisan`)* |
| **Password Default** | `123456` |
| **Peran (Role)** | `Admin` |

> [!TIP]
> **Membuat Akun Admin / Editor Baru via CLI:**  
> Anda dapat membuat admin atau editor baru kapan saja dengan perintah:
> ```bash
> cd backend
> node scripts/create_user.js "Nama Lengkap" "email@lisan.id" "password_baru" "Admin"
> ```

---

## ☁️ Panduan Deployment (Supabase & Vercel)

Aplikasi ini telah dirancang *cloud-native* dan dapat dideploy secara gratis menggunakan **Supabase** (Database & Storage) dan **Vercel** (Fullstack Frontend + Serverless Backend).

### Langkah 1: Setup Supabase Database
1. Buat project baru di [Supabase](https://supabase.com/).
2. Buka menu **SQL Editor** pada dashboard Supabase.
3. Buka file [`backend/supabase_schema.sql`](file:///d:/projek/Lisan/backend/supabase_schema.sql), salin seluruh kodenya, tempel (*paste*) ke SQL Editor Supabase, lalu klik **Run**.
4. *(Opsional)* Jika ingin memindahkan seluruh data dari MySQL lokal Anda ke Supabase, masukkan password Supabase ke `backend/.env` pada variabel `DATABASE_URL`, lalu jalankan:
   ```bash
   cd backend
   node scripts/migrate_mysql_to_supabase.js
   ```

### Langkah 2: Setup Supabase Storage (Untuk Upload Foto)
1. Buka menu **Storage** di dashboard Supabase.
2. Buat bucket baru bernama `lisan-media`.
3. Centang opsi **Public Bucket** agar gambar profil dan berita dapat diakses secara publik.

### Langkah 3: Deploy ke Vercel
1. Hubungkan repositori GitHub Anda ([`Arbain26/Lisan`](https://github.com/Arbain26/Lisan.git)) ke Vercel.
2. Pada pengaturan **Environment Variables** di Vercel Project Settings, tambahkan:
   - `DATABASE_URL`: URI Connection Pooling Supabase (Port `6543`).
   - `JWT_SECRET`: Kunci rahasia JWT Anda.
   - `SUPABASE_URL`: URL Project Supabase Anda.
   - `SUPABASE_KEY`: Kunci API Supabase (`service_role` atau `anon`).
   - `SUPABASE_STORAGE_BUCKET`: `lisan-media`
   - `VITE_API_BASE`: `/api`
3. Klik **Deploy**. File [`vercel.json`](file:///d:/projek/Lisan/vercel.json) dan [`api/index.js`](file:///d:/projek/Lisan/api/index.js) akan otomatis menangani perutean antarmuka web dan serverless Express API.

---

## 📡 Referensi Endpoint REST API

Berikut adalah ringkasan rute utama API backend (`/api`):

| Method | Endpoint | Hak Akses | Deskripsi & Fungsi |
|---|---|---|---|
| `POST` | `/api/auth/login` | Publik | Autentikasi admin, mengembalikan token JWT |
| `GET` | `/api/auth/me` | Admin | Memvalidasi token & mengembalikan profil user aktif |
| `GET` | `/api/health` | Publik | Diagnostik status koneksi server & database |
| `GET` | `/api/dashboard/stats` | Admin | Statistik agregat untuk dashboard CMS |
| `GET` | `/api/hero` | Publik | Mengambil daftar banner slider beranda |
| `POST`/`PUT`/`DELETE`| `/api/hero` | Admin | Kelola banner hero slider beranda |
| `GET` | `/api/settings` | Publik | Mengambil identitas organisasi, profil, & menu navbar |
| `PUT` | `/api/settings` | Admin | Memperbarui kontak, profil, & visibilitas navbar |
| `GET` | `/api/pengurus` | Publik | Mengambil daftar struktur pengurus organisasi |
| `POST`/`PUT`/`DELETE`| `/api/pengurus` | Admin | Kelola data pengurus, foto, dan profil medsos |
| `GET` | `/api/departemen` | Publik | Mengambil daftar divisi departemen & proker unggulan |
| `POST`/`PUT`/`DELETE`| `/api/departemen` | Admin | Kelola data divisi departemen |
| `GET` | `/api/proker` | Publik | Mengambil daftar program kerja tahunan |
| `POST` | `/api/proker/upload-schedule` | Admin | Unggah & parse matriks jadwal proker dari file Excel |
| `GET` | `/api/kader` | Admin | Mengambil database kader (mendukung search & filter) |
| `POST` | `/api/kader/import` | Admin | Import massal data kader dari file Excel (anti-duplikat) |
| `GET` | `/api/korwil` | Publik | Mengambil daftar koordinator wilayah & kampus mitra |
| `GET` | `/api/news` | Publik | Mengambil daftar artikel dan berita kegiatan |
| `POST`/`PUT`/`DELETE`| `/api/news` | Admin | Kelola publikasi berita (draft/published, cover photo) |
| `GET` | `/api/gallery` | Publik | Mengambil galeri dokumentasi foto/video |
| `POST` | `/api/relawan` | Publik | Pendaftaran formulir relawan kegiatan sosial |
| `POST` | `/api/community/donor`| Publik | Pendaftaran formulir relawan donor darah |
| `POST` | `/api/pesan` | Publik | Mengirim pesan atau saran dari form kontak publik |
| `GET`/`PUT`/`DELETE` | `/api/pesan` | Admin | Mengelola kotak masuk pesan & penanda status baca |

---

## 📊 Format Unggah File Excel (Proker & Kader)

CMS LISAN mendukung pengisian data secara cepat menggunakan berkas Microsoft Excel:

### 1. File Matriks Jadwal Proker (`/admin/proker`)
Sistem membaca format matriks kalender proker tahunan. Struktur kolom yang didukung:
- **Kolom 1**: `No`
- **Kolom 2**: `Kode` (Contoh: `PRK-001`)
- **Kolom 3**: `Program Kerja / Kegiatan`
- **Kolom 4**: `Penanggung Jawab`
- **Kolom 5 - 16**: Bulan Perencanaan (Agustus s.d. Juli / Semester Ganjil & Genap)
- **Kolom 17**: `Keterangan Terlaksana`
- **Kolom 18**: `Keterangan Tidak Terlaksana`

### 2. File Database Kader (`/admin/kader`)
Format spreadsheet sederhana yang memuat data kader:
- **Nama** *(Wajib)*: Nama lengkap kader.
- **Angkatan** *(Wajib)*: Contoh `LIS 5`.
- **Kampus** *(Wajib)*: Contoh `UNISAN`.
- **Alamat**: Alamat domisili.
- **Jenjang Kaderisasi**: Contoh `PAKET FILSAFAT`, `LOGIKA`, `PENDALAMAN`.
- **Semester**: Semester aktif perkuliahan (Contoh: `III`, `V`).
- **Status**: Status keaktifan kader.

---

## 🛠️ Troubleshooting & Solusi Kendala Umum

<details>
<summary><b>1. Error: ECONNREFUSED saat menyalakan backend</b></summary>
Database MySQL belum berjalan. Pastikan MySQL di Laragon atau XAMPP sudah dinyalakan pada port <code>3306</code>, dan pastikan file <code>backend/.env</code> memiliki nama database yang sesuai (default: <code>db_lisan</code>).
</details>

<details>
<summary><b>2. Gagal login dengan pesan "Invalid credentials"</b></summary>
Pastikan Anda memasukkan email <code>admin@lisan.id</code> dan password <code>123456</code>. Jika lupa password atau akun terhapus, buat akun baru melalui terminal:
<pre><code>cd backend && node scripts/create_user.js "Admin Utama" "admin@lisan.id" "123456" "Admin"</code></pre>
</details>

<details>
<summary><b>3. Foto yang diunggah tidak muncul di browser</b></summary>
Pada mode lokal, berkas disimpan di folder <code>backend/uploads</code>. Pastikan server backend sedang aktif di port <code>5000</code> karena file disajikan sebagai aset statis via <code>http://localhost:5000/uploads/...</code>. Pada deployment Vercel/Cloud, pastikan variabel <code>SUPABASE_URL</code> dan <code>SUPABASE_KEY</code> sudah terisi dengan benar.
</details>

<details>
<summary><b>4. Port 5000 atau Port 5173 sudah digunakan aplikasi lain</b></summary>
Anda dapat mengubah port backend melalui variabel <code>PORT=5001</code> di <code>backend/.env</code>, lalu sesuaikan <code>VITE_API_BASE=http://localhost:5001/api</code> pada file <code>.env</code> di root folder.
</details>

---

## 🤝 Kontribusi & Pembaruan
Untuk memperbarui repositori GitHub dengan seluruh perubahan terbaru, gunakan skrip otomatis yang telah disediakan:
```bash
push-ke-github.bat
```
Atau melalui perintah git manual:
```bash
git add .
git commit -m "feat: pembaruan fitur website lisan"
git push origin main
```

---

## 📄 Lisensi
Hak Cipta &copy; 2026 **Organisasi LISAN** (Lingkar Mahasiswa Islam untuk Perubahan).  
Seluruh hak cipta dilindungi undang-undang.
