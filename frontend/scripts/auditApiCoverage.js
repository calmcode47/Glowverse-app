const fs = require('fs');
const path = require('path');
const axios = require('axios');

function readAllFiles(dir, exts = ['.ts', '.tsx', '.js', '.jsx']) {
  const out = [];
  const entries = fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...readAllFiles(p, exts));
    else if (exts.includes(path.extname(e.name))) out.push(p);
  }
  return out;
}

async function loadOpenAPISpec(url) {
  const res = await axios.get(url, { timeout: 20000 });
  return res.data;
}

function extractEndpoints(spec) {
  const endpoints = [];
  const paths = spec.paths || {};
  for (const [p, methods] of Object.entries(paths)) {
    for (const m of Object.keys(methods)) {
      endpoints.push({ method: m.toUpperCase(), path: p, implemented: false });
    }
  }
  return endpoints;
}

function scanImplementation(endpoints, roots) {
  const files = roots.flatMap((r) => readAllFiles(r));
  for (const file of files) {
    let content = '';
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {}
    for (const ep of endpoints) {
      if (content.includes(ep.path)) ep.implemented = true;
    }
  }
  return endpoints;
}

async function main() {
  const url = 'https://api.glowverse.com/api/openapi.json';
  const spec = await loadOpenAPISpec(url);
  const endpoints = extractEndpoints(spec);
  const scanned = scanImplementation(endpoints, [
    path.join(__dirname, '..', 'src', 'services', 'api'),
    path.join(__dirname, '..', 'src', 'services', 'api', 'validated'),
  ]);
  const total = scanned.length;
  const implemented = scanned.filter((e) => e.implemented).length;
  console.log(`API Coverage: ${implemented}/${total} (${total ? Math.round((implemented / total) * 100) : 0}%)`);
  const missing = scanned.filter((e) => !e.implemented);
  if (missing.length) {
    console.log('Missing implementations:');
    for (const m of missing) console.log(`${m.method} ${m.path}`);
    process.exit(1);
  }
  console.log('All endpoints implemented');
}

main().catch((e) => {
  console.error(e.message || String(e));
  process.exit(1);
});

