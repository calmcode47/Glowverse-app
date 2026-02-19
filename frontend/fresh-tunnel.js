// Fresh tunnel setup with auto-accept
const { spawn } = require('child_process');

console.log('🌐 FRESH TUNNEL SETUP - Friends can access your app!');
console.log('👥 This will create a public URL that works anywhere!');
console.log('📱 Auto-accepting all prompts...');

// Auto-accept everything and start tunnel
const tunnelProcess = spawn('cmd', ['/c', 'echo Y | echo 8084 | npx expo start --tunnel --reset-cache'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

tunnelProcess.on('error', (error) => {
  console.error('❌ Error starting tunnel:', error);
});

tunnelProcess.on('close', (code) => {
  console.log(`Tunnel process exited with code ${code}`);
});