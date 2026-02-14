const fs = require('fs');
const path = require('path');

const dirs = [
  'assets/store/ios/iphone-6.7',
  'assets/store/ios/iphone-6.5',
  'assets/store/ios/iphone-5.5',
  'assets/store/ios/ipad-12.9',
  'assets/store/android/phone',
  'assets/store/android/tablet-7',
  'assets/store/android/tablet-10',
  'assets/store/android/feature'
];

for (const d of dirs) {
  const full = path.join(__dirname, '..', d);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
    console.log('Created', d);
  }
}
console.log('Screenshot directories ready');

