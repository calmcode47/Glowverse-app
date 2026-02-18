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

# 2. Open Required Firewall Ports (Requires Admin)
$ports = @(
    @{ Name = "Glowverse Expo Metro (8081)"; Port = 8081; Desc = "Expo Metro bundler (JS)" },
    @{ Name = "Glowverse Expo Dev Server (19000)"; Port = 19000; Desc = "Expo dev server (manifest)" },
    @{ Name = "Glowverse Expo Web (19001)"; Port = 19001; Desc = "Expo web dev server" },
    @{ Name = "Glowverse Expo DevTools (19002)"; Port = 19002; Desc = "Expo DevTools UI" }
)

foreach ($p in $ports) {
    $existing = Get-NetFirewallRule -DisplayName $p.Name -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "[*] Updating firewall rule: $($p.Name)" -ForegroundColor Yellow
        Remove-NetFirewallRule -DisplayName $p.Name -ErrorAction SilentlyContinue
    } else {
        Write-Host "[*] Creating firewall rule: $($p.Name)" -ForegroundColor Yellow
    }
    try {
        New-NetFirewallRule -DisplayName $p.Name `
                            -Direction Inbound `
                            -LocalPort $p.Port `
                            -Protocol TCP `
                            -Action Allow `
                            -Profile Any `
                            -Description $p.Desc `
                            -ErrorAction Stop | Out-Null
        Write-Host "[+] Allowed TCP $($p.Port) ($($p.Desc))." -ForegroundColor Green
    } catch {
        Write-Host "[-] Failed to add rule for port $($p.Port)." -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    -> Please run this script as Administrator." -ForegroundColor Yellow
    }
}

# 3. Clean and Start
Write-Host "[*] Clearing Metro Cache..." -ForegroundColor Yellow
Write-Host "Starting Expo..." -ForegroundColor Cyan

# 4. Clean cache and start in LAN mode (optional)
Write-Host "[*] Starting Expo in LAN mode..." -ForegroundColor Cyan
npm run start:lan -- --reset-cache
