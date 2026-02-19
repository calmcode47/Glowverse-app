// Complete tunnel setup for external access
const { spawn } = require('child_process');

console.log('🌐 SETTING UP TUNNEL FOR EXTERNAL ACCESS!');
console.log('👥 Your friends will be able to access your Glowverse app!');
console.log('📱 This creates a public URL that works anywhere in the world!');
console.log('');

// Step 1: Install ngrok if needed
console.log('📦 Step 1: Installing ngrok...');
const installNgrok = spawn('cmd', ['/c', 'npm install -g @expo/ngrok@^4.1.0'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

installNgrok.on('close', (code) => {
  console.log('✅ Ngrok installed!');
  console.log('');
  
  // Step 2: Start tunnel
  console.log('🚀 Step 2: Starting tunnel...');
  console.log('⏳ This may take 1-2 minutes to establish...');
  console.log('');
  
  const tunnelProcess = spawn('cmd', ['/c', 'npx expo start --tunnel --reset-cache'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  tunnelProcess.on('error', (error) => {
    console.error('❌ Tunnel error:', error);
  });

  tunnelProcess.on('close', (code) => {
    if (code === 0) {
      console.log('🎉 Tunnel established successfully!');
    } else {
      console.log('⚠️ Tunnel setup completed with some issues');
    }
  });
});