// Start Expo in offline mode to avoid permission issues
const { spawn } = require('child_process');

console.log('🚀 Starting REAL Expo development server in OFFLINE mode...');
console.log('📱 This will show the actual QR code for Expo Go');
console.log('🔒 Avoiding permission issues by running offline');

// Use offline mode to avoid ngrok and permission issues
const expoProcess = spawn('cmd', ['/c', 'echo Y | npx expo start --offline --reset-cache'], {
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