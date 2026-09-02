const fs = require('fs');
const path = require('path');

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

const filesWithoutUseLanguage = [];
const allComponents = [];

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        scan(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      allComponents.push(fullPath);
      if (!content.includes('useLanguage') && !content.includes('useTranslations')) {
        filesWithoutUseLanguage.push(fullPath);
      }
    }
  }
}

for (const dir of SRC_DIRS) {
  scan(dir);
}

console.log(`Total TSX components found: ${allComponents.length}`);
console.log(`TSX components NOT using useLanguage(): ${filesWithoutUseLanguage.length}\n`);

console.log('List of components missing useLanguage():');
for (const f of filesWithoutUseLanguage) {
  console.log(' - ' + path.relative(path.join(__dirname, '..'), f));
}
