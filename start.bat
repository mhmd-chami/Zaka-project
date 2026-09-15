@echo off
title ZakaPay - Expo Dev Server
cd /d "%~dp0"
echo.
echo  ========================================
echo   ZakaPay - Starting Expo...
echo  ========================================
echo.
echo  1. Phone and PC must be on the SAME Wi-Fi
echo  2. Wait for "Waiting on http://localhost:8081"
echo  3. Open Expo Go and scan assets\expo-qr.png
echo     OR enter URL: exp://192.168.1.6:8081
echo.
call npx expo start --lan --port 8081
pause
