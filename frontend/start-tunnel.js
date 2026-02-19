// Start Expo with tunnel for external access
const { spawn } = require('child_process');

console.log('🌐 STARTING EXPO WITH TUNNEL FOR EXTERNAL ACCESS!');
console.log('👥 Your friends will be able to access your app!');
console.log('📱 This will generate a public URL that works anywhere!');

const expoProcess = spawn('cmd', ['/c', 'echo Y | npx expo start --tunnel --reset-cache'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

expoProcess.on('error', (error) => {
  console.error('❌ Error starting tunnel:', error);
});

expoProcess.on('close', (code) => {
  console.log(`Tunnel process exited with code ${code}`);
});