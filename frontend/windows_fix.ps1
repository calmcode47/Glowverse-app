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

# Check if rule exists
$existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue

if ($existingRule) {
    Write-Host "[*] Updating existing firewall rule..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
} else {
    Write-Host "[*] Creating new firewall rule..." -ForegroundColor Yellow
}

try {
    # Create a new rule allowing Inbound traffic on TCP 8081 for ALL profiles
    New-NetFirewallRule -DisplayName $ruleName `
                        -Direction Inbound `
                        -LocalPort 8081 `
                        -Protocol TCP `
                        -Action Allow `
                        -Profile Any `
                        -Description "Allows incoming connections for Expo Go on port 8081" `
                        -ErrorAction Stop

    Write-Host "[+] Firewall Rule Successfully Applied (Port 8081, All Profiles)." -ForegroundColor Green
} catch {
    Write-Host "[-] Failed to add Firewall rule." -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    -> Please run this script as Administrator." -ForegroundColor Yellow
}

# 3. Clean and Start
Write-Host "[*] Clearing Metro Cache..." -ForegroundColor Yellow
Write-Host "Starting Expo..." -ForegroundColor Cyan

# Clean cache and start
npm start -- --reset-cache
