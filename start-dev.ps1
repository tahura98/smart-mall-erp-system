# Smart Mall Full-Stack PowerShell Launcher for VS Code Integrated Terminal
$ErrorActionPreference = "Stop"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  SMART MALL - VS CODE FULL-STACK LAUNCHER" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Ensure XAMPP PHP and MySQL are in PATH
$env:PATH = "D:\Xampp\php;D:\Xampp\mysql\bin;" + $env:PATH

$projectRoot = $PSScriptRoot

# 2. Check frontend dependencies
if (-not (Test-Path "$projectRoot\frontend\node_modules")) {
    Write-Host "`n[1/3] Installing frontend dependencies (npm install)..." -ForegroundColor Yellow
    Set-Location "$projectRoot\frontend"
    npm install
    Set-Location $projectRoot
}

# 3. Start Laravel Backend in background or separate process
Write-Host "`n[2/3] Launching Laravel Backend (http://localhost:8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH='D:\Xampp\php;D:\Xampp\mysql\bin;'+`$env:PATH; cd '$projectRoot\backend'; php artisan serve --port=8000"

# 4. Start React Frontend
Write-Host "`n[3/3] Launching React Dev Server (http://localhost:5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; npm run dev"

# 5. Launch browser
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host "`nAll servers initiated! Open in browser: http://localhost:5173" -ForegroundColor Cyan
