# EnterpriseFlow AI - Master Stop Script
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       EnterpriseFlow AI - Stopping Services      " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$ports = @(8000, 5173)
$stoppedAny = $false

foreach ($p in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($conns) {
        foreach ($c in $conns) {
            Write-Host "Stopping service on port $p (Process ID: $($c.OwningProcess))..." -ForegroundColor Yellow
            Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
            $stoppedAny = $true
        }
    }
}

if (-not $stoppedAny) {
    Write-Host "No active EnterpriseFlow AI processes found on ports 8000 or 5173." -ForegroundColor Gray
} else {
    Write-Host "All EnterpriseFlow AI backend and frontend processes terminated cleanly." -ForegroundColor Green
}

