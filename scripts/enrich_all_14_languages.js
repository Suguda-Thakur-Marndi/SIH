const fs = require('fs');
const path = require('path');

const LANG_DIR = path.join(__dirname, '..', 'lib', 'translations');

// Read English master dictionary as baseline
const enContent = fs.readFileSync(path.join(LANG_DIR, 'en.ts'), 'utf8');
const hiContent = fs.readFileSync(path.join(LANG_DIR, 'hi.ts'), 'utf8');
const teContent = fs.readFileSync(path.join(LANG_DIR, 'te.ts'), 'utf8');

// Parse keys from hi and te
function extractDict(content) {
  const dict = {};
  const regex = /['"]([^'"]+)['"]\s*:\s*['"]([^'"]*)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    dict[match[1]] = match[2];
  }
  return dict;
}

const enDict = extractDict(enContent);
const hiDict = extractDict(hiContent);
const teDict = extractDict(teContent);

const files = fs.readdirSync(LANG_DIR).filter(f => f.endsWith('.ts') && f !== 'types.ts' && f !== 'index.ts');

files.forEach(file => {
  const filePath = path.join(LANG_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let langDict = extractDict(content);
  let updatedCount = 0;

  // If a key is missing or equal to English in an Indic language, use the closest high-quality regional translation (or Hindi as Indic fallback)
  Object.keys(enDict).forEach(key => {
    const isIndic = file !== 'en.ts';
    const currentVal = langDict[key];
    const enVal = enDict[key];

    if (isIndic && (!currentVal || currentVal === enVal)) {
      const fallbackVal = hiDict[key] || teDict[key] || enVal;
      if (fallbackVal && fallbackVal !== enVal) {
        const escaped = fallbackVal.replace(/'/g, "\\'");
        const keyRegex = new RegExp(`(['"]${key}['"]\\s*:\\s*)(['"][^'"]*['"])`, 'g');
        if (keyRegex.test(content)) {
          content = content.replace(keyRegex, `$1'${escaped}'`);
          updatedCount++;
        } else {
          const insertPoint = content.lastIndexOf('};');
          if (insertPoint !== -1) {
            content = content.slice(0, insertPoint) + `  '${key}': '${escaped}',\n` + content.slice(insertPoint);
            updatedCount++;
          }
        }
      }
    }
  });

  if (updatedCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Enhanced ${file}: ${updatedCount} keys localized with Indic fallback`);
  }
});
