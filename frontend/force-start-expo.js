// Force start Expo with tunnel and auto-accept port changes
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Expo development server with QR code...');
console.log('📱 This will generate a real QR code for Expo Go app');

const startServer = spawn('node', ['scripts/start-server.js', '--tunnel'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

startServer.on('error', (error) => {
  console.error('Error starting server:', error);
});

startServer.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});