Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Glowverse Project Setup Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Backend
Write-Host "[1/2] Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location "backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error installing backend dependencies!"
    exit $LASTEXITCODE
}
Write-Host "Backend dependencies installed successfully." -ForegroundColor Green
Write-Host ""

# Frontend
Write-Host "[2/2] Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location "..\frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error installing frontend dependencies!"
    exit $LASTEXITCODE
}
Write-Host "Frontend dependencies installed successfully." -ForegroundColor Green
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Setup Complete! You can now run the project." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
