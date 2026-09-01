@echo off
title Menjalankan Website LISAN
echo ========================================================
echo   MEMULAI WEBSITE LISAN (Lingkar Mahasiswa Islam)
echo ========================================================
echo.

set PATH=E:\p\laragon\bin\nodejs\node-v22;E:\p\laragon\bin\git\cmd;%PATH%

echo [1/3] Memastikan Database MySQL aktif...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo       Database MySQL sedang berjalan.
) else (
    echo       Menjalankan MySQL dari Laragon...
    start /B "" "E:\p\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqld.exe" --console
    timeout /t 3 /nobreak >nul
)

echo [2/3] Menjalankan Backend Server (Port 5000)...
start "LISAN Backend API (Port 5000)" cmd /k "cd backend && node server.js"

timeout /t 2 /nobreak >nul

echo [3/3] Menjalankan Frontend Web (Vite React Port 5173)...
start "LISAN Frontend (Port 5173)" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo ========================================================
echo   Website siap dibuka di browser!
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:5000/api
echo ========================================================
start http://localhost:5173
pause
