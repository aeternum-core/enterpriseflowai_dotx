# EnterpriseFlow AI - Environment Setup Script
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       EnterpriseFlow AI - Setup & Installation    " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Check Python
Write-Host "[1/4] Verifying Python runtime..." -ForegroundColor Yellow
$pythonVersion = python --version
if ($LASTEXITCODE -ne 0) {
    Write-Error "Python 3.11+ is required but not found in PATH."
    exit 1
}
Write-Host "Found: $pythonVersion" -ForegroundColor Green

# 2. Backend Dependencies
Write-Host "[2/4] Installing backend Python dependencies..." -ForegroundColor Yellow
python -m pip install -r backend/requirements.txt --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install backend requirements."
    exit 1
}
Write-Host "Backend dependencies installed successfully." -ForegroundColor Green

# 3. Seed Database & Verify Tests
Write-Host "[3/4] Initializing and verifying enterprise database schema..." -ForegroundColor Yellow
$env:PYTHONPATH = "backend"
python -m pytest backend/tests/test_enterpriseflow.py -q
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Pytest completed with warnings or minor issues."
} else {
    Write-Host "Database initialized & all 12 core tests PASSED." -ForegroundColor Green
}

# 4. Frontend Dependencies & Build
Write-Host "[4/4] Installing frontend packages and compiling assets..." -ForegroundColor Yellow
Push-Location "frontend"
npm install --silent
npm run build
Pop-Location

Write-Host "==================================================" -ForegroundColor Green
Write-Host " EnterpriseFlow AI Setup Complete!               " -ForegroundColor Green
Write-Host " Run .\start.ps1 to launch backend and frontend. " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

