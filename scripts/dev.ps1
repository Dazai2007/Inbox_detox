# Start Backend (FastAPI) and Frontend (Vite) for local development
# Usage: Right-click > Run with PowerShell, or from terminal: ./scripts/dev.ps1

$ErrorActionPreference = 'Stop'

# Start backend in a new PowerShell window
echo "Starting backend (FastAPI) on http://127.0.0.1:8000 ..."
Start-Process -FilePath "powershell" -ArgumentList "-NoProfile","-Command","python -m uvicorn app.main:app --host 127.0.0.1 --port 8000" -WindowStyle Normal

Start-Sleep -Seconds 1

# Start frontend in a new PowerShell window
echo "Starting frontend (Vite) on http://localhost:5173 ..."
$frontendPath = Join-Path $PSScriptRoot "..\frontend"
Start-Process -FilePath "powershell" -WorkingDirectory $frontendPath -ArgumentList "-NoProfile","-Command","npm run dev -- --host" -WindowStyle Normal

Write-Host "\nReady:"
Write-Host "  Backend:  http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Green
