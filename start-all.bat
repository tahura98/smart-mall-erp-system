@echo off
title Smart Mall - Service Launcher
cd /D "%~dp0"

echo ========================================================
echo   SMART MALL COMMERCIAL SYSTEM - ONE-CLICK LAUNCHER
echo ========================================================
echo.

:: 1. Add XAMPP PHP and MySQL to session PATH
set PATH=D:\Xampp\php;D:\Xampp\mysql\bin;%PATH%

:: 2. Check and install frontend packages if missing
if not exist "frontend\node_modules\" (
    echo [1/3] Installing frontend dependencies (npm install)...
    cd frontend
    call npm install
    cd ..
    echo Frontend dependencies installed.
    echo.
) else (
    echo [1/3] Frontend dependencies verified.
)

:: 3. Start Laravel Backend in a separate window
echo [2/3] Starting Laravel API Backend on http://localhost:8000 ...
start "Smart Mall - Laravel Backend (Port 8000)" cmd /k "title Laravel Backend && set PATH=D:\Xampp\php;D:\Xampp\mysql\bin;%PATH% && cd /D "%~dp0backend" && php artisan serve --port=8000"

:: 4. Start React Frontend in a separate window
echo [3/3] Starting React + Vite Frontend on http://localhost:5173 ...
start "Smart Mall - React Frontend (Port 5173)" cmd /k "title React Frontend && cd /D "%~dp0frontend" && npm run dev"

:: 5. Wait 3 seconds and open in default browser
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================================
echo   ALL SERVICES STARTED!
echo   - Backend:  http://localhost:8000
echo   - Frontend: http://localhost:5173
echo ========================================================
pause

