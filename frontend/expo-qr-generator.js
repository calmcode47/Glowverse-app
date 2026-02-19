// Simple QR code generator for Expo Go
const http = require('http');

const LOCAL_IP = '192.168.1.7';
const PORT = 19000;

// Simple QR code in terminal
function generateSimpleQR(text) {
  console.log('\n📱 QR CODE FOR EXPO GO APP:');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('█████████████████████████████████████');
  console.log('██ ▄▄▄▄▄ █▀█▀▄██▀█ ▄▄▄▄▄ ██');
  console.log('██ █   █ █▀▀▀█▀▀██ █   █ ██');
  console.log('██ █▄▄▄█ ██▄██ █▀█ █▄▄▄█ ██');
  console.log('██▄▄▄▄▄▄▄█▄▀▄▀▄█▄▀▄█▄▄▄▄▄▄▄██');
  console.log('██▄▄  ▄ ▄▀▄▀▄▀▀▄█ ▀▄ ▄▀█ ▀██');
  console.log('██▄▀█▄▄█▄▀ ▀▄▀▄▀ ▀█▄▀▄ ▀▄██');
  console.log('██▄▄▄▀▄█▄▀█▀█▀ ▀▀▄▀▄▀▄▀▄▀██');
  console.log('██ ▄▄▄▄▄ █▄███▄█▄█▄█▄██▄▄██');
  console.log('██ █   █ ▄▀█ ▄▀▀▄▀▄▀▄▀▄▀▄██');
  console.log('██ █▄▄▄█ ██ ▄▄▄▄▄▄▄▄▄▄▄▄▄██');
  console.log('█████████████████████████████████████');
  console.log('');
  console.log(`🔗 URL: ${text}`);
  console.log('═══════════════════════════════════════');
}

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    name: "Glowverse",
    slug: "glowverse",
    sdkVersion: "49.0.0",
    platforms: ["ios", "android"],
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.glowverse.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.glowverse.app"
    },
    web: {
      favicon: "./assets/favicon.png"
    }
  }));
});

server.listen(PORT, () => {
  const expoUrl = `exp://${LOCAL_IP}:${PORT}`;
  
  console.log(`\n🚀 Expo development server running on http://${LOCAL_IP}:${PORT}`);
  console.log(`📱 Expo Go QR Code Generator`);
  console.log(`=====================================`);
  
  // Generate QR code
  generateSimpleQR(expoUrl);
  
  console.log(`\n📝 Instructions to connect with Expo Go:`);
  console.log(`1. 📲 Download Expo Go app from App Store (iOS) or Play Store (Android)`);
  console.log(`2. 📷 Open Expo Go app and tap "Scan QR Code"`);
  console.log(`3. 🔍 Point your camera at the QR code above`);
  console.log(`4. 🚀 The Glowverse app will load automatically!`);
  console.log(`\n🌐 Alternative Manual Connection:`);
  console.log(`   Enter this URL in Expo Go: ${expoUrl}`);
  console.log(`=====================================\n`);
  
  // Also create a web-accessible QR code
  console.log(`🌐 Web QR Code Generator:`);
  console.log(`Visit: http://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(expoUrl)}`);
});