// Install ngrok and start tunnel
const { spawn } = require('child_process');

console.log('🌐 Installing ngrok for tunnel access...');
console.log('👥 This will create a public URL for your friends!');

// First install ngrok globally
console.log('📦 Installing @expo/ngrok...');
const installProcess = spawn('cmd', ['/c', 'npm install -g @expo/ngrok@^4.1.0'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

installProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Ngrok installed! Starting tunnel...');
    
    // Now start the tunnel
    const tunnelProcess = spawn('cmd', ['/c', 'npx expo start --tunnel --reset-cache'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });

    tunnelProcess.on('error', (error) => {
      console.error('❌ Error starting tunnel:', error);
    });
  } else {
    console.log('⚠️ Ngrok install failed, trying alternative...');
    // Try without global install
    const altTunnelProcess = spawn('cmd', ['/c', 'npx expo start --tunnel --reset-cache'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });
  }
});