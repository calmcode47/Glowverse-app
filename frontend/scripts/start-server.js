const os = require('os');
const { spawn } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
};

function log(color, message) {
    console.log(`${color}${message}${colors.reset}`);
}

function getLocalIP() {
    const ifs = os.networkInterfaces();
    const candidates = [];

    for (const name of Object.keys(ifs)) {
        for (const net of ifs[name] || []) {
            // Skip internal (127.0.0.1) and non-IPv4
            if (net.family === 'IPv4' && !net.internal) {
                const lowerName = name.toLowerCase();

                // Detailed Scoring System
                let score = 0;

                // 1. High Priority: Wi-Fi and Ethernet
                if (lowerName.includes('wi-fi') || lowerName.includes('wlan')) score += 100;
                else if (lowerName.includes('eth') || lowerName.includes('en0')) score += 90;

                // 2. Penalize Virtual/VPN Adapters
                if (lowerName.includes('vethernet')) score -= 50; // Hyper-V
                if (lowerName.includes('wsl')) score -= 50;       // WSL
                if (lowerName.includes('virtual')) score -= 40;   // VirtualBox/VMware
                if (lowerName.includes('vpn') || lowerName.includes('tun') || lowerName.includes('tap')) score -= 60;

                // 3. Prefer private IP ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
                if (net.address.startsWith('192.168.')) score += 20;
                else if (net.address.startsWith('10.')) score += 10;
                else if (net.address.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) score += 10;

                candidates.push({ name, address: net.address, score });
            }
        }
    }

    // Sort by score (descending)
    candidates.sort((a, b) => b.score - a.score);

    if (candidates.length > 0) {
        // Log all candidates for debugging
        if (process.env.DEBUG_IP) {
            console.log(colors.yellow, "\n[?] Discovered Network Interfaces:");
            candidates.forEach(c => console.log(`    - ${c.name}: ${c.address} (Score: ${c.score})`));
        }
        return candidates[0].address;
    }
    return '127.0.0.1';
}

const args = process.argv.slice(2);
const isTunnel = args.includes('--tunnel');
const isLan = args.includes('--lan');
const isOffline = args.includes('--offline');
const isResetHelp = args.includes('--reset-cache');
const isWindows = process.platform === 'win32';

log(colors.cyan, "==========================================");
log(colors.cyan, "     Glowverse Unified Start Script");
log(colors.cyan, "==========================================");

const localIP = getLocalIP();
log(colors.green, `[+] Detected Best Local IP: ${localIP}`);

// Set hostname env var
process.env.REACT_NATIVE_PACKAGER_HOSTNAME = localIP;

// Construct Expo command
let expoArgs = ['start'];
if (isTunnel) expoArgs.push('--tunnel');
if (isLan && !isOffline) expoArgs.push('--lan');
if (isOffline) expoArgs.push('--offline');
if (isResetHelp) expoArgs.push('--reset-cache');

if (isWindows && !isTunnel && !isLan && !isOffline) {
    expoArgs.push('--tunnel');
    log(colors.yellow, "[*] Windows detected: defaulting to --tunnel for device connectivity");
}

// Always clear cache on start to prevent bundling issues
if (!isResetHelp) {
    expoArgs.push('--reset-cache');
    log(colors.yellow, "[*] Auto-enabling --reset-cache to fix bundling issues");
}

const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

log(colors.cyan, `[+] Starting Expo on ${localIP}...`);
log(colors.cyan, `[>] Command: ${cmd} expo ${expoArgs.join(' ')}`);

const expoProcess = spawn(cmd, ['expo', ...expoArgs], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, REACT_NATIVE_PACKAGER_HOSTNAME: localIP }
});

expoProcess.on('close', (code) => {
    if (code !== 0) {
        log(colors.red, `[-] Expo process exited with code ${code}`);
    }
});
