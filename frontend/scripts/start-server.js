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
                // Prioritize likely physical interfaces
                const lowerName = name.toLowerCase();
                let priority = 0;

                if (lowerName.includes('wi-fi') || lowerName.includes('wlan')) priority = 10;
                else if (lowerName.includes('eth')) priority = 9;
                else if (lowerName.includes('en0')) priority = 8;
                else if (lowerName.includes('wsl') || lowerName.includes('vEthernet')) priority = 1; // Lower priority for virtual adapters

                candidates.push({ name, address: net.address, priority });
            }
        }
    }

    // Sort by priority (descending)
    candidates.sort((a, b) => b.priority - a.priority);

    if (candidates.length > 0) {
        return candidates[0].address;
    }
    return '127.0.0.1';
}

const args = process.argv.slice(2);
const isTunnel = args.includes('--tunnel');
const isLan = args.includes('--lan');
const isResetHelp = args.includes('--reset-cache');

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
if (isLan) expoArgs.push('--lan');
if (isResetHelp) expoArgs.push('--reset-cache');

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
