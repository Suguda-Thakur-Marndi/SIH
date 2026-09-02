/**
 * Automated JSX text wrapper — scans TSX files for hardcoded English text
 * and wraps them with t('key', 'fallback') calls.
 * 
 * Strategy:
 *  1. Find text nodes between > and </ (complete text children)
 *  2. Skip already-wrapped text, pure whitespace, emojis, numbers, CSS classes
 *  3. Generate snake_case keys from the text
 *  4. Replace inline
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Files to process
const TARGET_FILES = [
  // Insurance
  'insurance/insurance.tsx',
  'insurance/components/InsuranceStatusCard.tsx',
  'insurance/components/EligibilityCard.tsx',
  'insurance/components/BankSchemeList.tsx',
  'insurance/components/DocumentChecklist.tsx',
  'insurance/components/RegistrationStepper.tsx',
  'insurance/components/ClaimSupportCard.tsx',
  'insurance/components/RiskContextCard.tsx',
  'insurance/components/SchemeDetails.tsx',
  // Market
  'marketpage/marketpage.tsx',
  'marketpage/components/BestMarketRecommendation.tsx',
  'marketpage/components/CompareMarketsModal.tsx',
  'marketpage/components/MarketDetailsModal.tsx',
  'marketpage/components/MarketStateViews.tsx',
  'marketpage/components/MSPComparisonSection.tsx',
  'marketpage/components/NearbyMandisTable.tsx',
  'marketpage/components/NetRealizationCalculator.tsx',
  'marketpage/components/PriceTrendChart.tsx',
  'marketpage/components/TransportSection.tsx',
  'marketpage/components/PriceComparisonChart.tsx',
  // Crop Monitoring
  'Crop Monitoring page/components/CropLifecycleTracker.tsx',
  'Crop Monitoring page/components/DailyActivitySection.tsx',
  'Crop Monitoring page/components/HarvestSection.tsx',
  'Crop Monitoring page/components/WeatherForecastSection.tsx',
  'Crop Monitoring page/components/SelectedDatePanel.tsx',
  'Crop Monitoring page/components/InteractiveCalendar.tsx',
  'Crop Monitoring page/components/AddActivityModal.tsx',
  'Crop Monitoring page/components/AiAgronomistDrawer.tsx',
  // Notification
  'notification page/index.tsx',
  'notification page/components/NotificationCard.tsx',
  'notification page/components/PrioritySummary.tsx',
  'notification page/components/TimelineGroup.tsx',
  'notification page/components/ActionButton.tsx',
  'notification page/components/PriorityBadge.tsx',
  // Government schemes
  'Government equipment schemes/index.tsx',
  'Government equipment schemes/components/SchemeCard.tsx',
  'Government equipment schemes/components/SchemeHero.tsx',
  'Government equipment schemes/components/EligibilityBadge.tsx',
  'Government equipment schemes/components/DocumentChecklist.tsx',
  'Government equipment schemes/components/FarmerProfileCard.tsx',
  'Government equipment schemes/components/ApplicationTimeline.tsx',
  // Financial Support
  'Financial Support/list/FinancialSupportListPage.tsx',
  'Financial Support/detail/FacilityDetailPage.tsx',
  'Financial Support/acknowledgement/AcknowledgementPage.tsx',
  // Equipment
  'Equipment page Dashboard/Equipment page.tsx',
];

// Generate a snake_case key from text
function textToKey(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 40);
}

// Check if text should be skipped
function shouldSkip(text) {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (trimmed.length < 3) return true;
  // Pure numbers/symbols/emoji
  if (/^[\d\s.,;:!?%₹$€×+\-—–·•\/\\(){}[\]|@#&*=<>'"`~^]+$/.test(trimmed)) return true;
  // Already has t( call
  if (trimmed.includes('{t(')) return true;
  if (trimmed.includes("t('")) return true;
  // Pure emoji
  if (/^[\p{Emoji}\s]+$/u.test(trimmed)) return true;
  // Variable/code patterns
  if (/^\{.*\}$/.test(trimmed)) return true;
  // Purely className or attribute looking
  if (/^[a-z][a-zA-Z]*$/.test(trimmed)) return true;
  // HTML entities
  if (trimmed === '&amp;' || trimmed === '&apos;' || trimmed === '&quot;') return true;
  // Just a date format
  if (/^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/.test(trimmed)) return true;
  
  // Must contain at least one English letter
  if (!/[a-zA-Z]/.test(trimmed)) return true;
  
  return false;
}

// All new translation keys we'll need to add
const newKeys = {};
let totalReplacements = 0;
let totalFiles = 0;

for (const relPath of TARGET_FILES) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Not found: ${relPath}`);
    continue;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if file has useLanguage
  if (!content.includes('useLanguage')) {
    console.log(`⚠️  No useLanguage hook: ${relPath}`);
    continue;
  }
  
  let fileReplacements = 0;
  const original = content;
  
  // Pattern 1: Text between > and </ (direct text children in JSX)
  // Match: >Some visible text</
  // But NOT inside className, href, or other attributes
  // The regex matches text after > that contains English letters and before </
  content = content.replace(
    />([ \t]*)((?:[A-Z][a-zA-Z\s'''\-&.,;:!?%₹$()\/—–]+){2,})([ \t]*)<\//g,
    (match, leadingWs, text, trailingWs) => {
      if (shouldSkip(text)) return match;
      // Don't replace if inside a className or attribute value
      const key = textToKey(text);
      if (!key || key.length < 3) return match;
      newKeys[key] = text.trim();
      fileReplacements++;
      return `>${leadingWs}{t('${key}', '${text.replace(/'/g, "\\'")}')}{' '}${trailingWs}</`;
    }
  );
  
  // Pattern 2: Text between > and newline and then </ on the next line
  // e.g.:
  //   >
  //     Some text here
  //   </h3>
  content = content.replace(
    />\s*\n(\s*)((?:[A-Z][a-zA-Z0-9\s'''\-&.,;:!?%₹$()\/—–]+){2,})\s*\n(\s*)<\//g,
    (match, indent, text, closingIndent) => {
      if (shouldSkip(text.trim())) return match;
      const key = textToKey(text.trim());
      if (!key || key.length < 3) return match;
      newKeys[key] = text.trim();
      fileReplacements++;
      return `>\n${indent}{t('${key}', '${text.trim().replace(/'/g, "\\'")}')}\n${closingIndent}</`;
    }
  );
  
  // Pattern 3: Standalone text strings in JSX like: <span>Back</span>
  // Shorter words that are important UI labels
  const shortLabels = [
    'Back', 'Submit', 'Cancel', 'Save', 'Edit', 'Delete', 'Close',
    'Apply', 'Search', 'Filter', 'Reset', 'Done', 'Next', 'Previous',
    'Loading', 'Error', 'Success', 'Warning', 'Info', 'Status',
    'Name', 'Email', 'Phone', 'Address', 'Date', 'Time', 'Amount',
    'Total', 'Price', 'Cost', 'Fee', 'Tax', 'Discount', 'Balance',
    'Yes', 'No', 'OK', 'Confirm', 'Deny', 'Reject', 'Approve',
    'Upload', 'Download', 'Share', 'Print', 'Export', 'Import',
    'All', 'None', 'More', 'Less', 'View', 'Hide', 'Show',
    'Eligible', 'Enrolled', 'Pending', 'Active', 'Completed', 'Expired',
    'Risk', 'Weather', 'Crop', 'Market', 'Insurance', 'Government',
    'Today', 'Yesterday', 'Tomorrow', 'Weekly', 'Monthly', 'Yearly',
    'Submitted', 'Ready', 'Required', 'Optional', 'Verified', 'Attached',
  ];
  
  for (const label of shortLabels) {
    const regex = new RegExp(`>(\\s*)${label}(\\s*)<\\/`, 'g');
    const key = label.toLowerCase();
    content = content.replace(regex, (match, ws1, ws2) => {
      if (match.includes("{t(")) return match;
      newKeys[key] = label;
      fileReplacements++;
      return `>${ws1}{t('${key}', '${label}')}${ws2}</`;
    });
  }
  
  if (fileReplacements > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${relPath}: ${fileReplacements} text nodes wrapped`);
    totalReplacements += fileReplacements;
    totalFiles++;
  } else {
    console.log(`— ${relPath}: no unwrapped text found`);
  }
}

console.log(`\n📊 Summary: ${totalReplacements} replacements across ${totalFiles} files`);
console.log(`📝 ${Object.keys(newKeys).length} unique translation keys generated`);

// Now add all new keys to translation files
const LANG_DIR = path.join(ROOT, 'lib', 'translations');
const langFiles = fs.readdirSync(LANG_DIR).filter(f => f.endsWith('.ts'));

for (const langFile of langFiles) {
  const langPath = path.join(LANG_DIR, langFile);
  let langContent = fs.readFileSync(langPath, 'utf8');
  
  let added = 0;
  for (const [key, value] of Object.entries(newKeys)) {
    // Check if key already exists
    if (langContent.includes(`'${key}'`) || langContent.includes(`"${key}"`)) continue;
    
    // Find the last line before the closing }; and add the key
    const insertPoint = langContent.lastIndexOf('};');
    if (insertPoint === -1) continue;
    
    // For English, use the original text. For other languages, also use original (Google Translate or manual translation needed later)
    const escapedValue = value.replace(/'/g, "\\'");
    langContent = langContent.slice(0, insertPoint) + `  '${key}': '${escapedValue}',\n` + langContent.slice(insertPoint);
    added++;
  }
  
  if (added > 0) {
    fs.writeFileSync(langPath, langContent, 'utf8');
    console.log(`  📖 ${langFile}: ${added} new keys added`);
  }
}

console.log('\n✅ Done! All text nodes wrapped and translation keys added.');
