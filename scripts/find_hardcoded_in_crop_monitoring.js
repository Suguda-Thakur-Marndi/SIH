const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const compDir = path.join(rootDir, 'Crop Monitoring page');

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

// Check JSX text nodes outside {}
tsxFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(rootDir, file);
  console.log(`\n=== Scanning ${rel} ===`);
  
  // Find lines with raw text in JSX (e.g. >Some text< or placeholders or titles)
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Look for JSX tags containing English letters
    const matchTag = line.match(/>([^<>{}]*[a-zA-Z]{3,}[^<>{}]*)</);
    if (matchTag && !line.includes('//') && !line.includes('import ') && !line.includes('style=')) {
      const text = matchTag[1].trim();
      if (text && !text.startsWith('&') && !text.includes('className') && !text.includes('console.')) {
        console.log(`  L${idx + 1}: [Text] "${text}"`);
      }
    }
    // Look for placeholders
    const matchPlh = line.match(/placeholder=["']([^"']+)["']/);
    if (matchPlh && !line.includes('t(')) {
      console.log(`  L${idx + 1}: [Placeholder] "${matchPlh[1]}"`);
    }
    // Look for titles
    const matchTitle = line.match(/title=["']([^"']+)["']/);
    if (matchTitle && !line.includes('t(')) {
      console.log(`  L${idx + 1}: [Title] "${matchTitle[1]}"`);
    }
  });
});
