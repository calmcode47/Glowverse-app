// Generate working QR code for Android
const qrcode = require('qrcode-terminal');

const LOCAL_IP = '192.168.1.7';
const PORT = '8082';
const EXPO_URL = `exp://${LOCAL_IP}:${PORT}`;

console.log('\n🎯 WORKING CONNECTION FOR ANDROID:');
console.log('═══════════════════════════════════════');
console.log('');
console.log('📱 ANDROID INSTRUCTIONS:');
console.log('1. 📲 Open Expo Go app on your Android phone');
console.log('2. 📝 Tap "Enter URL manually" at the bottom');
console.log('3. 🔗 Enter this EXACT URL:');
console.log(`   ${EXPO_URL}`);
console.log('4. 🚀 Tap "Connect" - your app will load!');
console.log('');
console.log('🌐 ALTERNATIVE - WEB BROWSER:');
console.log(`   Open: http://localhost:${PORT}`);
console.log('');
console.log('📋 TROUBLESHOOTING:');
console.log('• 📶 Ensure phone & computer are on SAME WiFi');
console.log('• 🔥 Disable VPN if you have one');
console.log('• 📱 Try restarting Expo Go app');
console.log('• 💻 Try entering URL multiple times if first fails');
console.log('');
console.log('🎯 WORKING URL FOR EXPO GO:');
console.log(`   ${EXPO_URL}`);
console.log('═══════════════════════════════════════\n');

// Generate QR code for the working URL
console.log('📱 QR CODE FOR ANDROID (scan with Expo Go):');
qrcode.generate(EXPO_URL, {
  small: false
});

console.log('\n✅ This QR code should work! If not, use the manual URL above.');