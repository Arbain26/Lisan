# 🚀 Panduan Lengkap CI/CD GitHub Actions ke VPS Sumopod & Standar Keamanan Git

> **Proyek:** LISAN (Full-Stack Monorepo: Frontend React Vite & Backend Express.js)  
> **Platform Target:** VPS Linux (Sumopod)  
> **Otomatisasi:** GitHub Actions via SSH (`appleboy/ssh-action`) & PM2 Process Manager  

Dokumen ini adalah panduan operasional langkah-demi-langkah untuk mengatur otomatisasi *deployment* (CI/CD) ke VPS Sumopod dan memastikan seluruh file sensitif/rahasia aman dan **tidak pernah terunggah ke repositori publik/GitHub**.

---

## 📑 Daftar Isi
1. [Arsitektur Alur Otomatisasi (CI/CD Flow)](#1-arsitektur-alur-otomatisasi-cicd-flow)
2. [Langkah 1: Buat SSH Key Khusus di Terminal VPS](#langkah-1-buat-ssh-key-khusus-di-terminal-vps)
3. [Langkah 2: Daftarkan Kredensial ke GitHub Secrets](#langkah-2-daftarkan-kredensial-ke-github-secrets)
4. [Langkah 3: Daftarkan Deploy Key (Khusus Repositori Private)](#langkah-3-daftarkan-deploy-key-khusus-repositori-private)
5. [Langkah 4: Konfigurasi Workflow GitHub Actions](#langkah-4-konfigurasi-workflow-github-actions)
6. [Langkah 5: Standar Keamanan & Proteksi File Sensitif (.gitignore)](#langkah-5-standar-keamanan--proteksi-file-sensitif-gitignore)
7. [Langkah 6: Alur Push ke GitHub & Verifikasi Deployment](#langkah-6-alur-push-ke-github--verifikasi-deployment)
8. [Troubleshooting & Solusi Error Umum](#troubleshooting--solusi-error-umum)

---

## 1. Arsitektur Alur Otomatisasi (CI/CD Flow)

```mermaid
flowchart LR
    A["Developer Komputer Lokal"] -- "git push origin main" --> B["GitHub Repository"]
    B -- "Memicu Workflow" --> C["GitHub Actions Runner"]
    C -- "SSH Encrypted" --> D["VPS Sumopod (/var/www/lisan)"]
    D --> E["1. git reset --hard origin/main"]
    D --> F["2. Frontend: npm install & build"]
    D --> G["3. Backend: cd backend & npm install"]
    D --> H["4. pm2 restart lisan-backend"]
    H --> I["✅ Web Live Otomatis Terupdate"]
```

---

## Langkah 1: Buat SSH Key Khusus di Terminal VPS

Agar GitHub Actions dapat masuk ke VPS tanpa password interaktif, buat pasangan SSH Key khusus *deployment* langsung di dalam VPS Sumopod:

1. **Buka terminal dan login ke VPS Anda via SSH:**
   ```bash
   ssh root@IP_VPS_ANDA
   ```

2. **Generate SSH Key baru (ed25519) tanpa passphrase:**
   ```bash
   ssh-keygen -t ed25519 -C "github-actions-lisan" -f ~/.ssh/github_actions_key -N ""
   ```
   *(Perintah ini menghasilkan `github_actions_key` sebagai Private Key dan `github_actions_key.pub` sebagai Public Key).*

3. **Daftarkan Public Key ke daftar kunci yang diizinkan (`authorized_keys`):**
   ```bash
   cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   chmod 700 ~/.ssh
   ```

4. **Tampilkan dan salin Private Key:**
   ```bash
   cat ~/.ssh/github_actions_key
   ```
   > ⚠️ **PERHATIAN:** Salin seluruh teks yang muncul, mulai dari baris:  
   > `-----BEGIN OPENSSH PRIVATE KEY-----`  
   > sampai dengan baris:  
   > `-----END OPENSSH PRIVATE KEY-----`.  
   > Simpan sementara di notepad/clipboard. Jangan ada spasi atau karakter yang tertinggal.

---

## Langkah 2: Daftarkan Kredensial ke GitHub Secrets

Data rahasia seperti IP VPS, username, port, dan SSH Private Key **dilarang keras** ditulis langsung di dalam kode workflow. Gunakan fitur **GitHub Secrets**:

1. Buka repositori proyek Anda di GitHub melalui browser.
2. Masuk ke tab **Settings** (di pojok kanan atas repositori).
3. Di bilah menu sebelah kiri, buka **Secrets and variables** &rarr; klik **Actions**.
4. Klik tombol hijau **New repository secret** dan tambahkan **4 secret** berikut:

| Nama Secret | Deskripsi / Contoh Nilai (Value) |
| :--- | :--- |
| `VPS_HOST` | IP Address VPS Sumopod Anda (contoh: `103.123.45.67`) |
| `VPS_USERNAME` | Username SSH VPS Anda (biasanya `root`) |
| `VPS_PORT` | Port SSH VPS Anda (default `22` atau nomor port custom) |
| `VPS_SSH_KEY` | Tempelkan seluruh isi **Private Key** yang disalin dari Langkah 1 |

---

## Langkah 3: Daftarkan Deploy Key (Khusus Repositori Private)

*Jika repositori Anda berstatus **Public**, Anda dapat melewati langkah ini.*  
Jika repositori Anda **Private**, VPS membutuhkan izin resmi dari GitHub untuk melakukan `git pull`.

1. **Di terminal VPS, tampilkan Public Key:**
   ```bash
   cat ~/.ssh/github_actions_key.pub
   ```
2. Salin seluruh teks string tersebut.
3. Di GitHub, buka menu **Settings** repositori &rarr; klik **Deploy keys** &rarr; klik tombol **Add deploy key**.
4. Beri judul (misal: `VPS Sumopod Lisan`), tempelkan *Public Key* di kolom **Key**, lalu klik **Add key**.
5. **Pastikan remote Git di VPS menggunakan URL SSH:**
   Masuk ke folder proyek di VPS dan ubah remote URL ke format SSH:
   ```bash
   cd /var/www/lisan
   git remote set-url origin git@github.com:USERNAME/REPO-LISAN.git
   ```
6. Uji coba koneksi git satu kali secara manual di VPS:
   ```bash
   git pull origin main
   ```

---

## Langkah 4: Konfigurasi Workflow GitHub Actions

File workflow otomatisasi telah dibuat pada file [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) dengan konfigurasi yang disesuaikan untuk struktur LISAN:

```yaml
name: Auto Deploy LISAN ke VPS Sumopod

on:
  push:
    branches:
      - main

jobs:
  deploy:
    name: 🚀 Deploy ke VPS Sumopod
    runs-on: ubuntu-latest

    steps:
      - name: Eksekusi Remote Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT }}
          script: |
            # 1. Load NVM agar npm, node, dan pm2 dikenali di SSH non-interaktif
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

            # 2. Masuk ke direktori proyek LISAN di VPS
            PROJECT_PATH="/var/www/lisan"

            if [ ! -d "$PROJECT_PATH" ]; then
              echo "❌ Error: Direktori $PROJECT_PATH tidak ditemukan di VPS."
              exit 1
            fi

            cd "$PROJECT_PATH"

            # 3. Sinkronisasi kode dari branch main (Clean pull)
            echo "⬇️ Menarik kode terbaru dari GitHub..."
            git fetch --all
            git reset --hard origin/main

            # 4. Instal dependensi & build Frontend React (Vite)
            echo "📦 Build Frontend Vite..."
            npm install
            npm run build

            # 5. Instal dependensi Backend & Restart Process PM2
            echo "⚙️ Memperbarui Backend Express & me-restart PM2..."
            cd backend
            npm install
            pm2 restart lisan-backend || pm2 start server.js --name lisan-backend

            echo "=========================================================="
            echo "🎉 Auto-deploy LISAN ke VPS Sumopod berhasil diselesaikan!"
            echo "=========================================================="
```

---

## Langkah 5: Standar Keamanan & Proteksi File Sensitif (.gitignore)

Keamanan kode adalah prioritas nomor satu. Informasi seperti *kredensial database, JWT Secret, file media upload, dan private key* **TIDAK BOLEH** ter-push ke GitHub.

### 1. File yang Telah Diblokir Otomatis di `.gitignore`
File [`.gitignore`](.gitignore) proyek ini telah diamankan secara ketat:

```gitignore
# Environment Variables & Secrets (SANGAT PENTING)
.env
.env.*
!.env.example
backend/.env
backend/.env.*
!backend/.env.example
*.env

# SSH Keys, Sertifikat, & Private Tokens
*.pem
*.key
*.pub
id_rsa*
id_ed25519*
*.pfx
*.p12

# Database Dumps / Backups
*.sql.gz
*.sql.tar.gz
*.dump
*.backup
backup.sql
dump.sql

# Uploads & Temporary Media Files
backend/uploads/*
!backend/uploads/.gitkeep
public/uploads/*
backend/scratch/

# Dependensi & Build
node_modules/
backend/node_modules/
dist/
dist-ssr/
```

### 2. Standar Operasional Sebelum Melakukan Commit
Sebelum menjalankan perintah `git commit`, biasakan melakukan 2 langkah verifikasi berikut:

#### A. Verifikasi Status File
```bash
git status
```
> 🔍 **Periksa Output:** Pastikan **TIDAK ADA** file `.env`, `backend/.env`, atau file berekstensi `.key`/`.pem` yang tercantum di daftar perubahan (*Changes to be committed* atau *Untracked files*).

#### B. Uji Apakah File Benar-Benar Diabaikan oleh Git
```bash
git check-ignore -v .env backend/.env
```
*Jika terminal mengembalikan baris aturan dari `.gitignore`, artinya file tersebut 100% aman dan tidak akan pernah ter-push.*

### 3. Penyelamatan Darurat (Jika File Sensitif Sempat Ter-track)
Jika di masa lalu ada file sensitif yang tidak sengaja ter-track oleh Git:
```bash
# Hapus file dari index pemantauan Git tanpa menghapus file fisik di laptop Anda:
git rm --cached .env backend/.env

# Commit pembaruan penghapusan pelacakan tersebut:
git commit -m "security: untrack sensitive env files"
```

---

## Langkah 6: Alur Push ke GitHub & Verifikasi Deployment

Setelah konfigurasi di atas selesai, Anda dapat mengunggah file workflow dan pembaruan kode ke repositori GitHub:

```bash
# 1. Masukkan file workflow dan gitignore ke staging
git add .github/workflows/deploy.yml .gitignore

# 2. Lakukan commit dengan pesan terstruktur
git commit -m "ci: setup auto deploy github actions to sumopod vps"

# 3. Push ke branch main
git push origin main
```

### Cara Memantau Status Deployment:
1. Buka repositori GitHub Anda di browser.
2. Klik tab **Actions** di bilah navigasi atas.
3. Anda akan melihat alur kerja **"Auto Deploy LISAN ke VPS Sumopod"** sedang berjalan.
4. Klik workflow tersebut untuk melihat log terminal VPS secara *real-time*.
5. Jika indikator berubah menjadi **Centang Hijau (✅)**, aplikasi LISAN di VPS Sumopod Anda telah otomatis berhasil diperbarui dan berjalan lancar!

---

## Troubleshooting & Solusi Error Umum

### 1. Error: `pm2: command not found` atau `npm: command not found`
* **Penyebab:** Sesi SSH non-interaktif dari GitHub Actions tidak menjalankan skrip `.bashrc` tempat *Node Version Manager (NVM)* terdaftar.
* **Solusi:** Pastikan 2 baris pemuat NVM tetap ada di awal skrip workflow:
  ```bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  ```

### 2. Error: `Permission denied (publickey)`
* **Penyebab:** Kunci SSH yang dimasukkan ke `VPS_SSH_KEY` tidak cocok dengan yang ada di VPS.
* **Solusi:**
  1. Pastikan isi `~/.ssh/github_actions_key.pub` sudah masuk ke `~/.ssh/authorized_keys` di VPS.
  2. Pastikan permission folder SSH di VPS sudah benar: `chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys`.
  3. Pastikan seluruh teks Private Key tersalin utuh ke secret `VPS_SSH_KEY` di GitHub.

### 3. Error: `git pull` gagal karena ada bentrok file di VPS
* **Penyebab:** Ada file di VPS yang sempat diedit secara manual sehingga Git menolak menimpa file tersebut.
* **Solusi:** Di dalam workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), kita sudah menggunakan:
  ```bash
  git fetch --all
  git reset --hard origin/main
  ```
  Perintah ini memaksa VPS 100% sinkron dengan commit terbaru GitHub, sementara file lokal penting seperti `.env` dan `backend/.env` yang terdaftar di `.gitignore` **tetap aman dan tidak akan terhapus**.

---

*Dokumen ini diperbarui untuk standar deployment infrastruktur LISAN — 2026.*
