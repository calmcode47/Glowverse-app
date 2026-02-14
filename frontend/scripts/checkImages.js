const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const checks = [
  { file: 'assets/icon.png', width: 1024, height: 1024 },
  { file: 'assets/adaptive-icon.png', width: 1024, height: 1024, note: 'Expo resizes for Android adaptive, source should be square' },
  { file: 'assets/splash-icon.png', width: 2048, height: 2048 },
  { file: 'assets/splash-icon-dark.png', width: 2048, height: 2048 },
];

async function dim(p) {
  const meta = await sharp(p).metadata();
  return { width: meta.width, height: meta.height, hasAlpha: meta.hasAlpha };
}

async function main() {
  let failed = false;
  for (const c of checks) {
    const full = path.join(__dirname, '..', c.file);
    if (!fs.existsSync(full)) {
      console.error(`❌ Missing: ${c.file}`);
      failed = true;
      continue;
    }
    const { width, height, hasAlpha } = await dim(full);
    if (width !== c.width || height !== c.height) {
      console.error(`❌ ${c.file} size ${width}x${height}, expected ${c.width}x${c.height}`);
      failed = true;
    }
    if (c.file.includes('icon.png') && hasAlpha) {
      console.error(`❌ ${c.file} must not contain alpha/transparency for App Store`);
      failed = true;
    }
  }
  if (failed) {
    process.exit(1);
  }
  console.log('✅ All asset dimensions OK');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
