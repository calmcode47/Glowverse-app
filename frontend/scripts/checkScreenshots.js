const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iosSets = [
  { name: 'iphone-6.7', dir: 'assets/store/ios/iphone-6.7', width: 1290, height: 2796, min: 5 },
  { name: 'iphone-6.5', dir: 'assets/store/ios/iphone-6.5', width: 1284, height: 2778, min: 5 },
  { name: 'iphone-5.5', dir: 'assets/store/ios/iphone-5.5', width: 1242, height: 2208, min: 5 },
  { name: 'ipad-12.9', dir: 'assets/store/ios/ipad-12.9', width: 2048, height: 2732, min: 5 },
];

const androidSets = [
  { name: 'phone', dir: 'assets/store/android/phone', width: 1080, height: 1920, min: 2 },
  { name: 'tablet-7', dir: 'assets/store/android/tablet-7', width: 1200, height: 1920, min: 2 },
  { name: 'tablet-10', dir: 'assets/store/android/tablet-10', width: 1600, height: 2560, min: 2 },
  { name: 'feature-graphic', dir: 'assets/store/android/feature', width: 1024, height: 500, min: 1, exact: true },
];

async function validateDir(dir, width, height, min) {
  if (!fs.existsSync(dir)) return { missing: true, count: 0, wrong: [] };
  const files = fs.readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f));
  const wrong = [];
  for (const f of files) {
    const full = path.join(dir, f);
    const meta = await sharp(full).metadata();
    if (meta.width !== width || meta.height !== height) {
      wrong.push({ file: f, size: `${meta.width}x${meta.height}` });
    }
  }
  return { missing: false, count: files.length, wrong, min };
}

async function main() {
  let failed = false;
  for (const set of [...iosSets, ...androidSets]) {
    const dir = path.join(__dirname, '..', set.dir);
    const r = await validateDir(dir, set.width, set.height, set.min);
    if (r.missing) {
      console.error(`❌ Missing directory: ${set.dir}`);
      failed = true;
      continue;
    }
    if (r.count < set.min) {
      console.error(`❌ ${set.dir} has ${r.count} screenshots, need at least ${set.min}`);
      failed = true;
    }
    if (r.wrong.length) {
      for (const w of r.wrong) {
        console.error(`❌ ${set.dir}/${w.file} is ${w.size}, expected ${set.width}x${set.height}`);
      }
      failed = true;
    }
    if (!failed) {
      console.log(`✅ ${set.dir} OK (${r.count})`);
    }
  }
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

