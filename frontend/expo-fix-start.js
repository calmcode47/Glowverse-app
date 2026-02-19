// Use the built-in fix mode to avoid permission issues
const { spawn } = require('child_process');

console.log('🚀 Starting Expo with built-in fix mode...');
console.log('📱 This will show the clean QR code for Expo Go');
console.log('🔧 Using --offline to avoid permission issues');

// Use the existing fix mode from the package.json
const expoProcess = spawn('cmd', ['/c', 'echo Y | npm run start:fix'], {
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