const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assets = [
  { file: 'assets/icon.png', maxKB: 100, type: 'png' },
  { file: 'assets/adaptive-icon.png', maxKB: 150, type: 'png' },
  { file: 'assets/splash-icon.png', maxKB: 500, type: 'png' },
];

async function optimizePng(file, maxKB) {
  const full = path.join(__dirname, '..', file);
  if (!fs.existsSync(full)) {
    console.warn(`Skipping missing file: ${file}`);
    return;
  }
  const buf = fs.readFileSync(full);
  let quality = 90;
  let best = buf;
  for (let i = 0; i < 5; i++) {
    const out = await sharp(buf).png({ quality, compressionLevel: 9, palette: true }).toBuffer();
    best = out;
    const kb = Math.round(out.length / 1024);
    if (kb <= maxKB) break;
    quality -= 10;
  }
  if (best.length < buf.length) {
    fs.writeFileSync(full, best);
  }
  const finalKB = Math.round(fs.statSync(full).size / 1024);
  console.log(`Optimized ${file} → ${finalKB}KB (limit ${maxKB}KB)`);
  if (finalKB > maxKB) {
    console.warn(`⚠️ ${file} still exceeds target size. Consider simplifying artwork.`);
  }
}

async function main() {
  for (const a of assets) {
    if (a.type === 'png') await optimizePng(a.file, a.maxKB);
  }
  console.log('✅ Asset optimization complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

