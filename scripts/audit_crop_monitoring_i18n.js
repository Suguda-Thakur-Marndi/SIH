const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'Crop Monitoring page');
function getFiles(d) {
  let res = [];
  for (const f of fs.readdirSync(d)) {
    const full = path.join(d, f);
    if (fs.statSync(full).isDirectory()) res.push(...getFiles(full));
    else if (full.endsWith('.tsx') || full.endsWith('.ts')) res.push(full);
  }
  return res;
}

const files = getFiles(dir);
const tCalls = [];
const tPattern = /t\(\s*['"]([^'"]+)['"]\s*(?:,\s*['"]([^'"]*)['"])?/g;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = tPattern.exec(content)) !== null) {
    tCalls.push({ key: match[1], fallback: match[2] || '', file: path.relative(path.join(__dirname, '..'), file) });
  }
});

console.log('Total t() call instances:', tCalls.length);

const transDir = path.join(__dirname, '..', 'lib', 'translations');
const langs = ['en', 'hi', 'or', 'bn', 'te', 'ta', 'mr', 'gu', 'pa', 'kn', 'ml', 'as', 'ur', 'ne'];
const dicts = {};
langs.forEach(l => {
  const c = fs.readFileSync(path.join(transDir, l + '.ts'), 'utf8');
  const m = c.match(/export const \w+: Record<string, string> = ({[\s\S]*});/);
  if (m) {
    dicts[l] = JSON.parse(m[1]);
  } else {
    console.error('Could not parse ' + l);
  }
});

const uniqueKeys = new Map();
tCalls.forEach(item => {
  if (!uniqueKeys.has(item.key)) {
    uniqueKeys.set(item.key, item);
  }
});

console.log('Total unique keys in Crop Monitoring:', uniqueKeys.size);

let missing = {};
langs.forEach(l => missing[l] = []);

for (const [key, item] of uniqueKeys.entries()) {
  langs.forEach(l => {
    if (!dicts[l] || !dicts[l][key]) {
      missing[l].push({ key, fallback: item.fallback, file: item.file });
    }
  });
}

langs.forEach(l => {
  console.log(`Lang ${l}: missing ${missing[l].length} keys`);
});

if (missing['hi'].length > 0) {
  console.log('\nMissing keys in Hindi (and fallback text):');
  missing['hi'].forEach(m => console.log(`  - "${m.key}": "${m.fallback}" (in ${m.file})`));
}
