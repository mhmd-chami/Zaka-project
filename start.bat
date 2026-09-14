@echo off
title SafeRoute - Expo Dev Server
cd /d "%~dp0"
echo.
echo  ========================================
echo   SafeRoute - Starting Expo...
echo  ========================================
echo.
echo  1. Wait for the QR code to appear below
echo  2. Open Expo Go on your phone
echo  3. Scan the QR code
echo.
call npm start
pause
