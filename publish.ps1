# CityWatch Smart Publish Script
# This script starts the project and ngrok, then automatically syncs URLs.

Write-Host "`n[CityWatch] Starting Backend and Frontend..." -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/c run_project.bat" -WorkingDirectory (Get-Location)

# Wait for services to start appearing
Write-Host "[CityWatch] Waiting for services to initialize (10s)..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Start Ngrok
Write-Host "[CityWatch] Launching Ngrok tunnels..." -ForegroundColor Cyan
Start-Process ngrok -ArgumentList "start --all --config .\ngrok.yml"

# Wait for ngrok to generate URLs
Write-Host "[CityWatch] Waiting for Ngrok to generate URLs..." -ForegroundColor Gray
Start-Sleep -Seconds 5

try {
    $tunnels = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels"
    $backendUrl = $tunnels.tunnels | Where-Object { $_.name -eq "backend" } | Select-Object -First 1 | Select-Object -ExpandProperty public_url
    $frontendUrl = $tunnels.tunnels | Where-Object { $_.name -eq "frontend" } | Select-Object -First 1 | Select-Object -ExpandProperty public_url

    if ($backendUrl) {
        Write-Host "[CityWatch] Backend public URL detected: $backendUrl" -ForegroundColor Green
        
        $envPath = "frontend\.env"
        if (Test-Path $envPath) {
            $content = Get-Content $envPath
            $found = $false
            $newContent = $content | ForEach-Object {
                if ($_ -match "^VITE_API_URL=") {
                    $found = $true
                    "VITE_API_URL=$backendUrl/api"
                } else {
                    $_
                }
            }
            if (-not $found) {
                $newContent += "VITE_API_URL=$backendUrl/api"
            }
            $newContent | Set-Content $envPath
            Write-Host "[CityWatch] Auto-updated frontend/.env with the new API URL." -ForegroundColor Yellow
            Write-Host "[CityWatch] Note: You might need to restart the Frontend window for changes to take effect." -ForegroundColor DarkYellow
        }
    }

    if ($frontendUrl) {
        Write-Host "`n====================================================" -ForegroundColor Cyan
        Write-Host "   PROJECT PUBLISHED SUCCESSFULLY" -ForegroundColor Green
        Write-Host "   Frontend URL: $frontendUrl" -ForegroundColor White -BackgroundColor DarkGreen
        Write-Host "   Backend URL:  $backendUrl" -ForegroundColor Gray
        Write-Host "====================================================`n" -ForegroundColor Cyan
    }
} catch {
    Write-Host "[CityWatch] Error: Could not connect to Ngrok API. Is Ngrok running?" -ForegroundColor Red
}

Write-Host "Press any key to exit this script (tunnels will stay open)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
