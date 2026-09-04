@echo off
title Push ke GitHub LISAN
cd /d "%~dp0"
set "PATH=E:\p\laragon\bin\git\cmd;%PATH%"

echo ========================================================
echo   Mendorong (Push) Seluruh Perubahan ke GitHub
echo   Repositori: https://github.com/Arbain26/Lisan.git
echo ========================================================
echo.

git push -u origin main

echo.
echo ========================================================
if %ERRORLEVEL% equ 0 (
    echo [BERHASIL] Seluruh commit berhasil terunggah ke GitHub!
) else (
    echo [GAGAL] Silakan periksa koneksi atau otorisasi login GitHub Anda.
)
echo ========================================================
pause
