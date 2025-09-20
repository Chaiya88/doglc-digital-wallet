# PowerShell script to start frontend worker and test it
Write-Host "Starting DOGLC Frontend Worker..." -ForegroundColor Green

# Start frontend worker in background
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\chaiy\doglc-digital-wallet\workers\frontend"
    npx wrangler dev --config wrangler-simple.toml --port 8787 --local
}

Write-Host "Waiting for frontend worker to start..." -ForegroundColor Yellow
Start-Sleep 5

# Test if frontend is running
try {
    $healthResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8787/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "Frontend Health Check: SUCCESS" -ForegroundColor Green
    Write-Host "Response: $($healthResponse.Content)" -ForegroundColor Cyan
    
    # Test main page
    $mainResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8787/" -UseBasicParsing -TimeoutSec 5
    Write-Host "Frontend Main Page: SUCCESS" -ForegroundColor Green
    Write-Host "Status Code: $($mainResponse.StatusCode)" -ForegroundColor Cyan
    
    # Test path traversal protection
    try {
        $pathTraversalResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8787/../../../etc/passwd" -UseBasicParsing -TimeoutSec 5
        Write-Host "Path Traversal Protection: FAILED (Status: $($pathTraversalResponse.StatusCode))" -ForegroundColor Red
    } catch {
        Write-Host "Path Traversal Protection: SUCCESS (Blocked)" -ForegroundColor Green
    }
    
} catch {
    Write-Host "Frontend Test Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Keep the job running for 30 seconds for manual testing
Write-Host "Frontend worker will run for 30 seconds for manual testing..." -ForegroundColor Yellow
Write-Host "Access frontend at: http://127.0.0.1:8787" -ForegroundColor Cyan
Start-Sleep 30

# Stop the job
Stop-Job $frontendJob
Remove-Job $frontendJob
Write-Host "Frontend worker stopped." -ForegroundColor Yellow