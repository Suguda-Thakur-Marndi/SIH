const fs = require('fs');
const path = require('path');

const transDir = path.join(__dirname, '..', '..', '..', '..', 'OneDrive', 'Documents', 'SIH', 'lib', 'translations');
// Better path using relative to process.cwd():
const rootDir = process.cwd();
const compDir = path.join(rootDir, 'Crop Monitoring page');
const transPath = path.join(rootDir, 'lib', 'translations');

const langs = ['en', 'hi', 'or', 'bn', 'te', 'ta', 'mr', 'gu', 'pa', 'kn', 'ml', 'as', 'ur', 'ne'];
const dicts = {};
langs.forEach(l => {
  const file = path.join(transPath, `${l}.ts`);
  const content = fs.readFileSync(file, 'utf8');
  // Match the object after `export const ... = `
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    try {
      dicts[l] = JSON.parse(content.substring(start, end + 1));
    } catch (e) {
      console.error('Failed to parse JSON for ' + l + ': ' + e.message);
    }
  }
});

console.log('Dictionaries loaded:');
langs.forEach(l => {
  console.log(`  ${l}: ${Object.keys(dicts[l] || {}).length} keys`);
});

// Scan all tsx files in Crop Monitoring page
function getTsxFiles(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item);
    if (fs.statSync(p).isDirectory()) {
      files = files.concat(getTsxFiles(p));
    } else if (p.endsWith('.tsx')) {
      files.push(p);
    }
  }
  return files;
}

const tsxFiles = getTsxFiles(compDir);
console.log(`\nFound ${tsxFiles.length} TSX files in Crop Monitoring:`);
tsxFiles.forEach(f => console.log(' - ' + path.relative(rootDir, f)));

// Check t() calls in these files
const tCalls = [];
const tRegex = /\bt\(\s*['"`]([a-zA-Z0-9_\- ]+)['"`]\s*(?:,\s*['"`]([\s\S]*?)['"`])?/g;

tsxFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = tRegex.exec(content)) !== null) {
    tCalls.push({
      key: m[1],
      fallback: m[2] || '',
      file: path.relative(rootDir, f)
    });
  }
});

console.log(`\nTotal t() calls found: ${tCalls.length}`);
const uniqueKeys = new Map();
tCalls.forEach(tc => {
  if (!uniqueKeys.has(tc.key)) uniqueKeys.set(tc.key, tc);
});
console.log(`Total unique keys used: ${uniqueKeys.size}`);

// Check which of these unique keys are missing in which languages
const missingByLang = {};
langs.forEach(l => (missingByLang[l] = []));

for (const [key, info] of uniqueKeys.entries()) {
  langs.forEach(l => {
    if (!dicts[l] || !dicts[l][key]) {
      missingByLang[l].push({ key, fallback: info.fallback, file: info.file });
    }
  });
}

console.log('\nMissing keys count per language:');
langs.forEach(l => {
  console.log(`  ${l}: ${missingByLang[l].length} missing`);
});

console.log('\nMissing in English (and fallback):');
missingByLang['en'].forEach(m => console.log(`  "${m.key}": "${m.fallback}" (${m.file})`));

console.log('\nMissing in Hindi (and fallback):');
missingByLang['hi'].forEach(m => console.log(`  "${m.key}": "${m.fallback}" (${m.file})`));
