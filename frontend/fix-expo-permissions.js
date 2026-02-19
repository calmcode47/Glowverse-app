// Create all required Expo directories
const fs = require('fs');
const path = require('path');

const expoDir = 'C:\\Users\\jnoor\\.expo';
const dirsToCreate = [
  'schema-cache',
  'codesigning',
  'codesigning/YOUR_PROJECT_ID',
  'codesigning/glowverse',
  'codesigning/com.glowverse.app'
];

console.log('🛠️ Creating required Expo directories...');

try {
  // Create main .expo directory
  if (!fs.existsSync(expoDir)) {
    fs.mkdirSync(expoDir, { recursive: true });
    console.log('✅ Created .expo directory');
  }

  // Create subdirectories
  dirsToCreate.forEach(dir => {
    const fullPath = path.join(expoDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created ${dir}`);
    }
  });

  console.log('🎉 All Expo directories created successfully!');
  console.log('🚀 Now you can scan the QR code without permission errors!');
} catch (error) {
  console.error('❌ Error creating directories:', error.message);
}