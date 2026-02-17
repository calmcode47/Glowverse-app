# Windows Fix Script for Expo/React Native
# Run this as Administrator if Firewall rules need updating

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "     Glowverse Windows Fix Tool" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Get Local IP
$ipObj = Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "*Wi-Fi*","*Ethernet*" | Sort-Object -Property InterfaceMetric | Select-Object -First 1
if ($ipObj) {
    $localIP = $ipObj.IPAddress
    Write-Host "[+] Detected Local IP: $localIP" -ForegroundColor Green
    
    # Set Environment Variable for current session
    $env:REACT_NATIVE_PACKAGER_HOSTNAME = $localIP
    Write-Host "[+] Set REACT_NATIVE_PACKAGER_HOSTNAME = $localIP" -ForegroundColor Green
} else {
    Write-Host "[-] Could not auto-detect Wi-Fi/Ethernet IP. Using default." -ForegroundColor Yellow
}

# 2. Add Firewall Rule (Requires Admin)
$ruleName = "Node.js Expo Bundler (8081)"
$ruleExists = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue

if (-not $ruleExists) {
    Write-Host "[*] Attempting to add Firewall Rule for Port 8081..." -ForegroundColor Yellow
    try {
        New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow -ErrorAction Stop
        Write-Host "[+] Firewall Rule Added Successfully." -ForegroundColor Green
    } catch {
        Write-Host "[-] Failed to add Firewall rule. Run as Administrator to fix automatically." -ForegroundColor Red
        Write-Host "    Or manually allow port 8081 in Windows Defender Firewall." -ForegroundColor Gray
    }
} else {
    Write-Host "[+] Firewall Rule for Port 8081 already exists." -ForegroundColor Green
}

# 3. Clean and Start
Write-Host "[*] Clearing Metro Cache..." -ForegroundColor Yellow
Write-Host "Starting Expo..." -ForegroundColor Cyan

# Clean cache and start
npm start -- --reset-cache
