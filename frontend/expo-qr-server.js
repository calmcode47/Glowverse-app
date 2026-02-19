// Simple Expo development server simulator
const http = require('http');
const qrcode = require('qrcode-terminal');

const LOCAL_IP = '192.168.1.7';
const PORT = 19000; // Standard Expo development port

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
  console.log(`🚀 Expo development server running on http://${LOCAL_IP}:${PORT}`);
  console.log(`📱 Expo Go QR Code Generator`);
  console.log(`=====================================`);
  
  // Generate QR code for Expo Go app
  const expoUrl = `exp://${LOCAL_IP}:${PORT}`;
  console.log(`📲 Scan this QR code with Expo Go app:`);
  console.log(`URL: ${expoUrl}`);
  
  qrcode.generate(expoUrl, {
    small: false
  });
  
  console.log(`\n📝 Instructions:`);
  console.log(`1. Download Expo Go app from App Store (iOS) or Play Store (Android)`);
  console.log(`2. Open Expo Go app`);
  console.log(`3. Tap "Scan QR Code"`);
  console.log(`4. Point your camera at the QR code above`);
  console.log(`5. The app will load automatically!`);
  console.log(`\n🌐 Alternative: You can also manually enter this URL in Expo Go:`);
  console.log(`   ${expoUrl}`);
});