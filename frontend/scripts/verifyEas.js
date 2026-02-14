const fs = require('fs');
const path = require('path');

function verify() {
  const p = path.join(__dirname, '..', 'app.json');
  const raw = fs.readFileSync(p, 'utf8');
  const json = JSON.parse(raw);
  const id = json?.expo?.extra?.eas?.projectId;
  if (!id || id === 'YOUR_PROJECT_ID') {
    console.error('❌ EAS projectId is not set. Update expo.extra.eas.projectId in app.json.');
    process.exit(1);
  }
  console.log(`✅ EAS projectId set: ${id}`);
}

verify();

