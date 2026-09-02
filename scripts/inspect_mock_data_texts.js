const fs = require('fs');
const path = require('path');

const mockFile = path.join(process.cwd(), 'Crop Monitoring page', 'mockData.ts');
const content = fs.readFileSync(mockFile, 'utf8');

const titles = new Set();
const descriptions = new Set();
const nutrients = new Set();
const waters = new Set();

const titleMatches = content.matchAll(/title:\s*["']([^"']+)["']/g);
for (const m of titleMatches) titles.add(m[1]);

const descMatches = content.matchAll(/description:\s*["']([^"']+)["']/g);
for (const m of descMatches) descriptions.add(m[1]);

const nutMatches = content.matchAll(/nutrientFocus:\s*["']([^"']+)["']/g);
for (const m of nutMatches) nutrients.add(m[1]);

const waterMatches = content.matchAll(/waterRequirement:\s*["']([^"']+)["']/g);
for (const m of waterMatches) waters.add(m[1]);

console.log('Unique Activity Titles:', Array.from(titles));
console.log('\nUnique Stage Nutrient Focus:', Array.from(nutrients));
console.log('\nUnique Stage Water Req:', Array.from(waters));
console.log(`\nTotal Activity Descriptions: ${descriptions.size}`);
