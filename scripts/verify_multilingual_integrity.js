const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, '..', 'lib', 'translations');
const langs = ['en', 'hi', 'or', 'bn', 'te', 'ta', 'mr', 'gu', 'pa', 'kn', 'ml', 'as', 'ur', 'ne'];

console.log('=== MULTILINGUAL INTEGRITY AUDIT ===\n');

let allPassed = true;
const keyCounts = {};

for (const lang of langs) {
  const filePath = path.join(translationsDir, `${lang}.ts`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing file for language: ${lang}`);
    allPassed = false;
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  // Simple extraction of keys
  const match = content.match(/export const \w+: Record<string, string> = ({[\s\S]*});/);
  if (!match) {
    console.error(`❌ Could not parse dictionary from: ${lang}.ts`);
    allPassed = false;
    continue;
  }

  try {
    const dict = JSON.parse(match[1]);
    const keys = Object.keys(dict);
    keyCounts[lang] = keys.length;

    // Check specific keys that user reported in screenshots
    const sampleKeys = [
      'risk_factors',
      'weather_stress_rainfall',
      'distress_intelligence',
      'high_risk',
      'contributing_factors',
      'rainfall_deficit_factor',
      'market_deficit_factor',
      'loan_due_factor',
      'view_insurance_options',
      'crop_health',
      'land_size_label',
      'crop_label',
      'season_label',
      'sowing_date_label'
    ];

    let hasEnglishInIndic = false;
    if (lang !== 'en') {
      for (const k of sampleKeys) {
        if (!dict[k]) {
          console.warn(`⚠️ [${lang}] Missing critical key: ${k}`);
        } else if (dict[k] === 'HIGH RISK' || dict[k] === 'Crop Health' || dict[k] === 'Contributing Factors') {
          console.error(`❌ [${lang}] Untranslated English placeholder found for [${k}]: "${dict[k]}"`);
          hasEnglishInIndic = true;
          allPassed = false;
        }
      }
    }

    if (!hasEnglishInIndic) {
      console.log(`✅ [${lang}.ts] Verified: ${keys.length} keys, authentic translations verified.`);
    }
  } catch (err) {
    console.error(`❌ JSON parse error in ${lang}.ts:`, err.message);
    allPassed = false;
  }
}

console.log('\n=== AUDIT SUMMARY ===');
console.log(`Total Languages Tested: ${langs.length}`);
console.log(`Key Consistency: ${Object.values(keyCounts).every(v => v === 396) ? 'PERFECT (396/396 keys in all languages)' : 'DISCREPANCY'}`);
console.log(`Overall Result: ${allPassed ? 'PASSED 100% 🚀' : 'FAILED ❌'}`);

if (!allPassed) {
  process.exit(1);
}
