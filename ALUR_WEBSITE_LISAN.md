# Dokumentasi Alur & Arsitektur Sistem Website LISAN
**Lingkar Mahasiswa Islam untuk Perubahan (LISAN) - Kabupaten Sidenreng Rappang**

Dokumen ini menjelaskan arsitektur teknis **Fullstack JavaScript**, alur kerja (*user flow*), struktur data, hak akses, serta proses bisnis yang ada di dalam website LISAN, baik untuk pengunjung publik maupun administrator.

---

## 1. Arsitektur Teknis Fullstack JavaScript (Client-Server)

Sistem LISAN dibangun 100% menggunakan ekosistem **Modern JavaScript**:

```mermaid
graph LR
    subgraph Frontend [Client Tier - React 19]
        UI[React Components & Pages]
        State[AuthContext & Custom Hooks]
        AxiosClient[Axios Instance / Interceptor]
        UI --> State --> AxiosClient
    end

    subgraph Backend [Server Tier - Node.js Express]
        Router[Express Routers]
        AuthMW[Auth Middleware - JWT]
        Controllers[Controller Layer]
        Services[Service Layer - Proker & Excel]
        Helpers[Response & Error Helpers]
        
        Router --> AuthMW --> Controllers --> Services
        Controllers -.-> Helpers
    end

    subgraph Storage [Data Tier - MySQL 8]
        DB[(db_lisan)]
        Disk[Uploads Storage]
    end

    AxiosClient -->|HTTP / JSON REST API| Router
    Services -->|mysql2 connection pool| DB
    Controllers -->|Multer File I/O| Disk
```

---

## 2. Diagram Alur Utama (System Flow Overview)

```mermaid
flowchart TD
    User([Pengunjung / Pengguna]) --> Landing[Akses Website Utama]
    
    Landing --> PublicFlow{Pilihan Navigasi}
    
    %% Alur Publik
    PublicFlow -->|Tentang Kami| Profile[Profil: Sejarah, Visi Misi, Nilai Organisasi]
    PublicFlow -->|Struktur| OrgStructure[Struktur Pengurus & Departemen & Korwil]
    PublicFlow -->|Kegiatan| Programs[Program Kerja & Matriks Jadwal Proker]
    PublicFlow -->|Publikasi| Media[Berita, Artikel & Galeri Dokumentasi]
    PublicFlow -->|Partisipasi| Action[Donor Darah, Pendaftaran Relawan & Kontak Kami]
    
    %% Alur Admin
    Landing -->|Halaman Khusus| Login[/admin atau /login]
    Login --> AuthCheck{Autentikasi JWT}
    AuthCheck -->|Gagal| LoginError[Tampilkan Pesan Error]
    LoginError --> Login
    AuthCheck -->|Berhasil| Dashboard[Admin Dashboard Overview]
    
    Dashboard --> AdminMgmt{Menu Manajemen}
    AdminMgmt --> ManageNews[Manajemen Berita & Artikel]
    AdminMgmt --> ManageProker[Manajemen Proker & Unggah Excel Matriks]
    AdminMgmt --> ManageGallery[Manajemen Foto Galeri]
    AdminMgmt --> ManageRelawan[Data Relawan & Donor Darah]
    AdminMgmt --> ManageKader[Database Kader Organisasi]
    AdminMgmt --> ManageInbox[Kotak Masuk Pesan & Aspirasi]
    AdminMgmt --> ManageSettings[Pengaturan Hero & Kontak Website]
```

---

## 2. Alur Pengunjung Publik (Public User Journey)

### 2.1. Beranda (Landing Page)
1. **Hero Carousel**: Menampilkan slide banner utama dengan pesan visi perubahan dan tombol Call-to-Action (CTA) "Bergabung Bersama Kami" dan "Jelajahi Program".
2. **Statistik Organisasi**: Ringkasan jumlah kader, departemen, program terlaksana, dan wilayah cabang.
3. **Sorotan Program & Berita Terkini**: Menampilkan 3-4 program unggulan dan artikel terbaru dari database.
4. **Matriks Proker Terbuka**: Pengunjung dapat melihat timeline pelaksanaan program kerja tahun kepengurusan aktif secara transparan.

### 2.2. Profil & Struktur Organisasi
```mermaid
graph LR
    NavProfil[Menu Profil] --> Sejarah[Sejarah Berdiri]
    NavProfil --> VisiMisi[Visi, Misi & Tujuan]
    NavProfil --> Nilai[Nilai-Nilai Dasar Organisasi]
    
    NavStruktur[Menu Struktur] --> PH[Pengurus Harian Inti]
    NavStruktur --> Dept[Daftar Departemen & Program Kerja]
    NavStruktur --> Korwil[Koordinator Wilayah Kampus & Daerah]
```

### 2.3. Partisipasi & Interaksi Masyarakat
- **Pendaftaran Relawan**: Formulir publik untuk masyarakat/mahasiswa yang ingin bergabung dalam kegiatan sosial dan kemanusiaan.
- **Donor Darah**: Pendataan calon pendonor darah untuk kegiatan rutin LISAN Tanggap Kemanusiaan.
- **Form Kontak / Aspirasi**: Pengunjung dapat mengirimkan pertanyaan, saran, atau kerjasama kemitraan yang langsung masuk ke panel admin.

---

## 3. Alur Autentikasi & Keamanan (Security Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin Pengguna
    participant Frontend as React / Web Client
    participant AuthContext as Auth State / Context
    participant Backend as Backend Server (API)
    participant DB as MySQL Database

    Admin->>Frontend: Masukkan Email & Password
    Frontend->>Backend: POST /api/auth/login
    Backend->>DB: Query User berdasarkan Email
    DB-->>Backend: Kembalikan Data User & Hash Password
    Backend->>Backend: Verifikasi bcrypt.compare()
    alt Password Salah
        Backend-->>Frontend: 401 Unauthorized ("Invalid credentials")
        Frontend-->>Admin: Notifikasi Gagal Login
    else Password Benar
        Backend->>Backend: Generate JWT Token (payload: id, role, email)
        Backend-->>Frontend: 200 OK (Token + Data Profil User)
        Frontend->>AuthContext: Simpan Token di localStorage
        Frontend->>Frontend: Redirect ke /admin/dashboard
    end
```

---

## 4. Alur Khusus: Manajemen Program Kerja (Proker Matrix & Excel Engine)

Fitur paling kompleks dalam website LISAN adalah pengelolaan Program Kerja dengan matriks kalender dan impor berkas Excel.

```mermaid
flowchart TD
    StartExcel[Admin Menyiapkan File Excel Proker] --> UploadReq[Unggah ke /api/proker/upload]
    UploadReq --> Parser[XLSX Parser Membaca Baris & Kolom]
    Parser --> ValidateFormat{Validasi Kolom & Format}
    ValidateFormat -->|Tidak Sesuai| Reject[Tolak File & Berikan Pesan Error]
    ValidateFormat -->|Sesuai| SaveDB[Simpan ke Tabel proker & proker_schedule]
    
    SaveDB --> Evaluate[Sistem Menghitung Progres Otomatis]
    Evaluate --> CheckDates{Periksa Tanggal vs Hari Ini}
    CheckDates -->|Jadwal Terlewat & Belum Terlaksana| MarkDelayed[Status: Terlambat / Alert Notifikasi]
    CheckDates -->|Selesai Semua| MarkComplete[Status: Selesai / Progres 100%]
    CheckDates -->|Sedang Berlangsung| MarkOngoing[Status: Sedang Berjalan]
    
    MarkDelayed --> DashboardAlert[Tampil di Notifikasi Dashboard Admin]
    MarkComplete --> DashboardAlert
    MarkOngoing --> DashboardAlert
```

---

## 5. Struktur Database (Entity Relationship Overview)

```mermaid
erDiagram
    USERS ||--o{ BERITA : "menulis"
    DEPARTEMEN ||--o{ PENGURUS : "menaungi"
    PROKER ||--|{ PROKER_SCHEDULE : "memiliki jadwal"
    PROKER ||--o{ PROKER_NOTIFICATIONS : "menghasilkan notifikasi"
    
    USERS {
        int id PK
        string name
        string email
        string password
        string role
    }

    BERITA {
        int id PK
        string title
        string category
        text excerpt
        text content
        string image_url
        string status
        string author
        timestamp created_at
    }

    DEPARTEMEN {
        int id PK
        string nama
        string icon
        string color_theme
        text deskripsi
        text program_unggulan
    }

    PENGURUS {
        int id PK
        string nama
        string jabatan
        int departemen_id FK
        string foto_url
        int urutan
    }

    PROKER {
        int id PK
        string kode
        string kegiatan
        string penanggung_jawab
        string tahun_kepengurusan
        decimal progres
        enum status
    }

    PROKER_SCHEDULE {
        int id PK
        int proker_id FK
        string bulan
        string tanggal
        enum status
        text keterangan
        string foto_url
    }

    RELAWAN {
        int id PK
        string nama
        string instansi
        string daerah
        string golongan_darah
        string no_hp
    }

    PESAN {
        int id PK
        string name
        string email
        string subject
        text message
        boolean is_read
    }
```

---

## 6. Hak Akses & Peran Pengguna (Role-Based Access Control)

| Modul Fitur | Pengunjung Publik | Editor | Administrator Utama |
| :--- | :---: | :---: | :---: |
| Membaca Berita, Profil, Struktur, Galeri | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Mengirim Pesan / Mendaftar Relawan | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Melihat Matriks Timeline Proker Publik | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Membuat & Mengedit Berita / Galeri | :x: | :white_check_mark: | :white_check_mark: |
| Unggah File Excel Proker & Ubah Jadwal | :x: | :white_check_mark: | :white_check_mark: |
| Manajemen Data Kader & Relawan | :x: | :white_check_mark: | :white_check_mark: |
| Pengaturan Akun Admin & Hero Slides | :x: | :x: | :white_check_mark: |
| Mengubah Pengaturan Kontak Organisasi | :x: | :x: | :white_check_mark: |
