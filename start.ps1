# EnterpriseFlow AI - Master Start Script
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "        EnterpriseFlow AI - Launching Platform    " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Terminate any previous instance on ports 8000 and 5173
$ports = @(8000, 5173)
foreach ($p in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($conns) {
        foreach ($c in $conns) {
            Write-Host "Reclaiming port $p from process ID $($c.OwningProcess)..." -ForegroundColor Yellow
            Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}

# 2. Start FastAPI Backend
Write-Host "Starting FastAPI Backend Engine on http://127.0.0.1:8000..." -ForegroundColor Cyan
$backendProc = Start-Process -FilePath "python" -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000" -WorkingDirectory "$PSScriptRoot\backend" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 3

# Verify backend health
try {
    $res = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method Get -TimeoutSec 5
    Write-Host "Backend Status: $($res.status) ($($res.platform))" -ForegroundColor Green
} catch {
    Write-Warning "Backend is starting up..."
}

# 3. Start React/Vite Frontend
Write-Host "Starting EnterpriseFlow AI UI on http://127.0.0.1:5173..." -ForegroundColor Cyan
$frontendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory "$PSScriptRoot\frontend" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 3

Write-Host "==================================================" -ForegroundColor Green
Write-Host " EnterpriseFlow AI is LIVE!                       " -ForegroundColor Green
Write-Host "                                                  " -ForegroundColor Green
Write-Host "  * UI Portal:       http://127.0.0.1:5173       " -ForegroundColor White
Write-Host "  * API Docs:        http://127.0.0.1:8000/docs  " -ForegroundColor White
Write-Host "  * Health Check:    http://127.0.0.1:8000/health" -ForegroundColor White
Write-Host "                                                  " -ForegroundColor Green
Write-Host " Run .\stop.ps1 to cleanly stop both services.    " -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Green
