/**
 * Fix broken translation files from auto_wrap_jsx_text.js:
 *  1. Missing comma before auto-generated keys (line ending with " instead of ",)
 *  2. Multi-line strings (unterminated string literals)
 */
const fs = require('fs');
const path = require('path');

const LANG_DIR = path.join(__dirname, '..', 'lib', 'translations');
const langFiles = fs.readdirSync(LANG_DIR).filter(f => f.endsWith('.ts') && f !== 'index.ts');

for (const langFile of langFiles) {
  const langPath = path.join(LANG_DIR, langFile);
  let content = fs.readFileSync(langPath, 'utf8');
  let fixes = 0;
  
  // Fix 1: Missing comma before new auto-generated keys
  // Pattern: line ending with "value"\n  'key' (missing comma)
  content = content.replace(/("[^"]*")\s*\n(\s*')/g, (match, val, next) => {
    if (!val.endsWith('",')) {
      fixes++;
      return val + ',\n' + next;
    }
    return match;
  });
  
  // Fix 2: Multi-line strings — find unterminated string values
  // Pattern: 'key': 'value\r\n     continuation',
  const lines = content.split('\n');
  const fixedLines = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Check if line has an opening ' after : but no closing '
    const kvMatch = line.match(/^(\s*'[^']+': ')(.*)$/);
    if (kvMatch && !line.match(/^(\s*'[^']+': ')([^']*)',?\s*$/)) {
      // This line opens a value string but doesn't close it
      // Concat with next lines until we find the closing
      let fullValue = lines[i];
      let j = i + 1;
      while (j < lines.length) {
        fullValue += ' ' + lines[j].trim();
        if (lines[j].includes("',")) {
          break;
        }
        j++;
      }
      // Now collapse it into a single line
      const collapsed = fullValue.replace(/\r/g, '').replace(/\s+/g, ' ');
      fixedLines.push(collapsed);
      fixes++;
      i = j + 1;
      continue;
    }
    fixedLines.push(line);
    i++;
  }
  
  content = fixedLines.join('\n');
  
  // Fix 3: Ensure no duplicate commas
  content = content.replace(/,,/g, ',');
  
  if (fixes > 0) {
    fs.writeFileSync(langPath, content, 'utf8');
    console.log(`✅ ${langFile}: ${fixes} fixes applied`);
  } else {
    console.log(`— ${langFile}: no fixes needed`);
  }
}

console.log('\n✅ All translation files fixed.');
