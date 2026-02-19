// Start Expo in LAN mode (no tunnel needed)
const { spawn } = require('child_process');

console.log('🚀 Starting REAL Expo development server in LAN mode...');
console.log('📱 This will show the actual QR code for Expo Go');
console.log('📡 Using local network connection (no tunnel required)');

// Use LAN mode instead of tunnel to avoid ngrok installation issues
const expoProcess = spawn('cmd', ['/c', 'echo Y | npx expo start --lan --reset-cache'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

expoProcess.on('error', (error) => {
  console.error('Error starting Expo:', error);
});

expoProcess.on('close', (code) => {
  console.log(`Expo process exited with code ${code}`);
});