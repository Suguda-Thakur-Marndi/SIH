const fs = require('fs');
const path = require('path');

const transDir = path.join(process.cwd(), 'lib', 'translations');
const langs = ['en', 'hi', 'or', 'bn', 'te', 'ta', 'mr', 'gu', 'pa', 'kn', 'ml', 'as', 'ur', 'ne'];

for (const lang of langs) {
  const filePath = path.join(transDir, `${lang}.ts`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix missing comma after act_cri_stage_irrigation line
  content = content.replace(
    /("act_cri_stage_irrigation":\s*"[^"]*")\s*\n\s*("notes_placeholder")/g,
    '$1,\n  $2'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed comma in ${lang}.ts`);
}
