const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'lib/translations') return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(process.cwd());
let totalFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Pattern: t('key', 'multi-line string with literal newlines')
  content = content.replace(/t\(\s*('([^'\\]|\\.)*')\s*,\s*'([\s\S]*?)'\s*\)/g, (match, key, _, val) => {
    if (val.includes('\n') || val.includes('\r')) {
      const cleanVal = val.replace(/[\r\n\s]+/g, ' ').trim().replace(/'/g, "\\'");
      return `t(${key}, '${cleanVal}')`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    totalFixed++;
    console.log(`Cleaned multi-line t() in: ${path.relative(process.cwd(), file)}`);
  }
});

console.log(`Total files cleaned: ${totalFixed}`);
