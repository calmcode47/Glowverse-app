// Fresh start - clean Expo server that works!
const { spawn } = require('child_process');

console.log('🔄 FRESH START - Getting Expo working properly...');
console.log('📱 This will give you working connection for Android!');

// Start with clean configuration
const expoProcess = spawn('cmd', ['/c', 'npx expo start --web --offline --clear'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

expoProcess.on('error', (error) => {
  console.error('❌ Error starting Expo:', error);
});

expoProcess.on('close', (code) => {
  console.log(`Expo process exited with code ${code}`);
});