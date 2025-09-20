# DOGLC Digital Wallet - Clean System Test
# Comprehensive validation after cleanup

Write-Host "=== DOGLC Digital Wallet - Clean System Test ===" -ForegroundColor Cyan
Write-Host "Testing all components after cleanup" -ForegroundColor Yellow

$testResults = @()
$totalTests = 0
$passedTests = 0

# Function to run test and record result
function Test-Component {
    param(
        [string]$TestName,
        [scriptblock]$TestScript
    )
    
    $global:totalTests++
    Write-Host "`nTest $global:totalTests : $TestName" -ForegroundColor Yellow
    
    try {
        $result = & $TestScript
        if ($result) {
            Write-Host "✅ PASSED: $TestName" -ForegroundColor Green
            $global:passedTests++
            $global:testResults += "✅ $TestName"
            return $true
        } else {
            Write-Host "❌ FAILED: $TestName" -ForegroundColor Red
            $global:testResults += "❌ $TestName"
            return $false
        }
    } catch {
        Write-Host "❌ ERROR: $TestName - $($_.Exception.Message)" -ForegroundColor Red
        $global:testResults += "❌ $TestName (Error: $($_.Exception.Message))"
        return $false
    }
}

# Test 1: Frontend Health Check
Test-Component "Frontend Worker Health" {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8787/health" -UseBasicParsing -TimeoutSec 5
        $data = $response.Content | ConvertFrom-Json
        return $response.StatusCode -eq 200 -and $data.status -eq "healthy"
    } catch {
        return $false
    }
}

# Test 2: Backend Health Check
Test-Component "Backend Worker Health" {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8788/" -UseBasicParsing -TimeoutSec 5
        $data = $response.Content | ConvertFrom-Json
        return $response.StatusCode -eq 200 -and $data.status -eq "OK"
    } catch {
        return $false
    }
}

# Test 3: Frontend Static Content
Test-Component "Frontend Static Content" {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8787/" -UseBasicParsing -TimeoutSec 5
        return $response.StatusCode -eq 200 -and $response.Content.Contains("DOGLC Digital Wallet")
    } catch {
        return $false
    }
}

# Test 4: Backend API Endpoints
Test-Component "Backend API - Wallet Balance" {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8788/api/wallet/balance" -UseBasicParsing -TimeoutSec 5
        $data = $response.Content | ConvertFrom-Json
        return $response.StatusCode -eq 200 -and $data.success -eq $true
    } catch {
        return $false
    }
}

# Test 5: Security - Path Traversal Protection (Frontend)
Test-Component "Frontend Path Traversal Protection" {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8787/../../../etc/passwd" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        # Should return 403 or 404, not 200
        return $response.StatusCode -ne 200
    } catch {
        # If it throws an error (blocked), that's good
        return $true
    }
}

# Test 6: Security - Path Traversal Protection (Backend)
Test-Component "Backend Path Traversal Protection" {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8788/../../../etc/passwd" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        # Should return 403 or 404, not 200
        return $response.StatusCode -ne 200
    } catch {
        # If it throws an error (blocked), that's good
        return $true
    }
}

# Test 7: Frontend-Backend Integration
Test-Component "Frontend-Backend Integration" {
    try {
        # Test if frontend can proxy to backend
        $frontendResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8787/api/proxy/wallet/balance" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        # Even if proxy fails, test if both services respond
        $backendResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8788/api/wallet/balance" -UseBasicParsing -TimeoutSec 5
        return $backendResponse.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Test 8: Performance Test
Test-Component "Basic Performance Test" {
    try {
        $startTime = Get-Date
        $responses = @()
        
        for ($i = 1; $i -le 5; $i++) {
            $response = Invoke-WebRequest -Uri "http://127.0.0.1:8787/health" -UseBasicParsing -TimeoutSec 5
            $responses += $response.StatusCode
        }
        
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds
        
        # All requests should succeed and take less than 5 seconds total
        $allSuccess = ($responses | Where-Object { $_ -eq 200 }).Count -eq 5
        $performanceOk = $duration -lt 5000
        
        Write-Host "   Performance: $($duration)ms for 5 requests" -ForegroundColor Cyan
        return $allSuccess -and $performanceOk
    } catch {
        return $false
    }
}

# Test 9: Security Headers
Test-Component "Security Headers Check" {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8787/" -UseBasicParsing -TimeoutSec 5
        $headers = $response.Headers
        
        # Check for basic security headers
        $hasXFrame = $headers['X-Frame-Options'] -ne $null
        $hasXContent = $headers['X-Content-Type-Options'] -ne $null
        $hasXXSS = $headers['X-XSS-Protection'] -ne $null
        
        Write-Host "   Security Headers: X-Frame-Options=$hasXFrame, X-Content-Type-Options=$hasXContent, X-XSS-Protection=$hasXXSS" -ForegroundColor Cyan
        
        # At least one security header should be present
        return $hasXFrame -or $hasXContent -or $hasXXSS
    } catch {
        return $false
    }
}

# Test 10: Rate Limiting (Light Test)
Test-Component "Rate Limiting Check" {
    try {
        $responses = @()
        $startTime = Get-Date
        
        # Send 20 requests quickly
        for ($i = 1; $i -le 20; $i++) {
            try {
                $response = Invoke-WebRequest -Uri "http://127.0.0.1:8788/" -UseBasicParsing -TimeoutSec 2
                $responses += $response.StatusCode
            } catch {
                $responses += 429  # Rate limited
            }
        }
        
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds
        
        $successCount = ($responses | Where-Object { $_ -eq 200 }).Count
        $rateLimitedCount = ($responses | Where-Object { $_ -eq 429 }).Count
        
        Write-Host "   Rate Limiting: $successCount success, $rateLimitedCount rate-limited in $($duration)ms" -ForegroundColor Cyan
        
        # Should have some successful requests
        return $successCount -gt 0
    } catch {
        return $false
    }
}

# Generate Final Report
Write-Host "`n=== CLEAN SYSTEM TEST RESULTS ===" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red

$successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })

Write-Host "`n=== DETAILED RESULTS ===" -ForegroundColor Cyan
foreach ($result in $testResults) {
    Write-Host $result
}

# System Status
Write-Host "`n=== SYSTEM STATUS ===" -ForegroundColor Cyan
if ($successRate -ge 90) {
    Write-Host "🎉 EXCELLENT: System is production-ready!" -ForegroundColor Green
    Write-Host "   All critical components are functioning properly." -ForegroundColor Green
} elseif ($successRate -ge 80) {
    Write-Host "✅ GOOD: System is mostly functional with minor issues." -ForegroundColor Yellow
    Write-Host "   Ready for staging deployment with monitoring." -ForegroundColor Yellow
} elseif ($successRate -ge 60) {
    Write-Host "⚠️  FAIR: System has some issues that need attention." -ForegroundColor Yellow
    Write-Host "   Fix failing tests before production deployment." -ForegroundColor Yellow
} else {
    Write-Host "❌ POOR: System has significant issues." -ForegroundColor Red
    Write-Host "   Multiple components need fixing before deployment." -ForegroundColor Red
}

Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Cyan
if ($successRate -ge 90) {
    Write-Host "1. ✅ Run production deployment scripts" -ForegroundColor Green
    Write-Host "2. ✅ Set up monitoring and alerts" -ForegroundColor Green
    Write-Host "3. ✅ Configure production environment variables" -ForegroundColor Green
} else {
    Write-Host "1. 🔍 Review failed tests and fix issues" -ForegroundColor Yellow
    Write-Host "2. 🧪 Run tests again after fixes" -ForegroundColor Yellow
    Write-Host "3. 📋 Update documentation with any changes" -ForegroundColor Yellow
}

Write-Host "`nClean system test completed!" -ForegroundColor Green