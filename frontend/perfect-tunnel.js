// Perfect tunnel setup for working QR code
const { spawn } = require('child_process');

console.log('🎯 PERFECT TUNNEL SETUP - Working QR Code for Friends!');
console.log('📱 Your friends will scan the QR code and access your app!');
console.log('🌐 This creates a public tunnel URL that works anywhere!');
console.log('');

// Auto-accept everything and start tunnel with proper configuration
const tunnelProcess = spawn('cmd', ['/c', 'echo Y && echo 8086 | npx expo start --tunnel --reset-cache --clear'], {
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
  console.log('📋 LOOK FOR THESE IN THE OUTPUT ABOVE:');
  console.log('• QR Code (scan with Expo Go)');
  console.log('• exp:// URL (for manual entry)');
  console.log('• https:// URL (for web browsers)');
  console.log('');
  console.log('📱 SHARING INSTRUCTIONS:');
  console.log('1. 📲 Friends download Expo Go app');
  console.log('2. 📷 They scan the QR code OR');
  console.log('3. 📝 They enter the exp:// URL manually');
  console.log('4. 🚀 Your Glowverse app loads for them!');
  console.log('');
});