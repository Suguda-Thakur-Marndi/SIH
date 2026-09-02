const fs = require('fs');
const path = require('path');

const TRANSLATIONS_DIR = path.join(__dirname, '..', 'lib', 'translations');
const SRC_DIRS = [
  path.join(__dirname, '..', 'app'),
  path.join(__dirname, '..', 'components'),
  path.join(__dirname, '..', 'Risk Detail Page'),
  path.join(__dirname, '..', 'Agriculture officer dashboard'),
  path.join(__dirname, '..', 'Alternative crop'),
  path.join(__dirname, '..', 'Bank Portal'),
  path.join(__dirname, '..', 'Crop Details'),
  path.join(__dirname, '..', 'Crop Monitoring page'),
  path.join(__dirname, '..', 'Equipment page Dashboard'),
  path.join(__dirname, '..', 'farmer profile'),
  path.join(__dirname, '..', 'Financial Support'),
  path.join(__dirname, '..', 'Full crop guide'),
  path.join(__dirname, '..', 'Government equipment schemes'),
  path.join(__dirname, '..', 'insurance'),
  path.join(__dirname, '..', 'marketpage'),
  path.join(__dirname, '..', 'notification page'),
];

// Load dictionaries
const languages = ['en', 'hi', 'or', 'bn', 'te', 'ta', 'mr', 'gu', 'pa', 'kn', 'ml', 'as', 'ur', 'ne'];
const dictionaries = {};

for (const lang of languages) {
  const filePath = path.join(TRANSLATIONS_DIR, `${lang}.ts`);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Extract key-value pairs
    const dict = {};
    const regex = /^\s*([a-zA-Z0-9_]+)\s*:\s*['"`]([\s\S]*?)['"`],?$/gm;
    let match;
    while ((match = regex.exec(content)) !== null) {
      dict[match[1]] = match[2];
    }
    dictionaries[lang] = dict;
  }
}

// Find all t('key', ...) calls in source files
const usedKeys = new Map();

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        scanDir(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const tRegex = /\bt\(\s*['"`]([a-zA-Z0-9_]+)['"`](?:\s*,\s*['"`]([\s\S]*?)['"`])?/g;
      let m;
      while ((m = tRegex.exec(content)) !== null) {
        const key = m[1];
        const fallback = m[2] || '';
        if (!usedKeys.has(key)) {
          usedKeys.set(key, { fallback, files: [fullPath] });
        } else {
          usedKeys.get(key).files.push(fullPath);
        }
      }
    }
  }
}

for (const srcDir of SRC_DIRS) {
  scanDir(srcDir);
}

console.log(`\nFound ${usedKeys.size} unique translation keys used in codebase.\n`);

const missingReport = {};

for (const lang of languages) {
  const dict = dictionaries[lang] || {};
  const missing = [];
  for (const [key, info] of usedKeys.entries()) {
    if (!dict[key]) {
      missing.push({ key, fallback: info.fallback, files: info.files });
    }
  }
  missingReport[lang] = missing;
  console.log(`Language [${lang}]: ${missing.length} missing keys out of ${usedKeys.size} used keys in codebase.`);
}

console.log('\nSample missing keys:');
const sampleMissing = missingReport['te'].slice(0, 30);
for (const item of sampleMissing) {
  console.log(` - ${item.key}: "${item.fallback}" (in ${item.files.map(f => path.basename(f)).join(', ')})`);
}
