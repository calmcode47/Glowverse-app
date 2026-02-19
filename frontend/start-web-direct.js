// Direct web mode start
const { spawn } = require('child_process');

console.log('🚀 Starting Expo in WEB MODE for easier testing...');
console.log('🌐 This will open in your browser - no QR code needed!');
console.log('📱 For mobile testing, we\'ll provide alternative methods');

// Start directly in web mode
const expoProcess = spawn('cmd', ['/c', 'echo Y | npx expo start --web --reset-cache'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

expoProcess.on('error', (error) => {
  console.error('Error starting Expo web:', error);
});

expoProcess.on('close', (code) => {
  console.log(`Expo web process exited with code ${code}`);
});