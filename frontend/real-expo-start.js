// Start Expo with automatic port selection
const { spawn } = require('child_process');

console.log('🚀 Starting REAL Expo development server...');
console.log('📱 This will show the actual QR code for Expo Go');

// Create a child process that automatically responds to prompts
const expoProcess = spawn('cmd', ['/c', 'echo Y | npx expo start --tunnel --reset-cache'], {
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