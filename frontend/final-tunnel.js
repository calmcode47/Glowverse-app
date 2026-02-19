// Final tunnel setup - auto-accept everything
const { spawn } = require('child_process');

console.log('🌐 FINAL TUNNEL SETUP - Auto-accepting everything!');
console.log('👥 Your friends will get a public URL to access your app!');
console.log('📱 This creates a tunnel that works anywhere!');
console.log('');

// Auto-accept port selection and ngrok installation
const tunnelProcess = spawn('cmd', ['/c', 'echo Y && echo 8085 | npx expo start --tunnel --reset-cache'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

tunnelProcess.on('error', (error) => {
  console.error('❌ Tunnel error:', error);
});

tunnelProcess.on('close', (code) => {
  console.log('');
  console.log('🎯 TUNNEL SETUP COMPLETED!');
  console.log('');
  console.log('📋 WHAT TO LOOK FOR:');
  console.log('• Look for a URL like: https://abc123.ngrok.io');
  console.log('• Or: exp://abc123.ngrok.io:80');
  console.log('• This is your PUBLIC URL - share it with friends!');
  console.log('');
  console.log('📱 SHARING INSTRUCTIONS:');
  console.log('1. Copy the ngrok URL from above');
  console.log('2. Send it to your friends');
  console.log('3. They can open it in Expo Go or browser');
  console.log('4. Your Glowverse app will load for them!');
  console.log('');
});