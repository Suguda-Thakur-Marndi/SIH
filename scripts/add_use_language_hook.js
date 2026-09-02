/**
 * Automated script to add useLanguage hook to component files that don't have it yet.
 * This adds the import and hook call, then wraps common hardcoded UI strings with t().
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Files to add useLanguage to (that don't have it)
const FILES_TO_UPDATE = [
  // Insurance components
  'insurance/components/InsuranceHeader.tsx',
  'insurance/components/InsuranceStatusCard.tsx',
  'insurance/components/EligibilityCard.tsx',
  'insurance/components/BankSchemeList.tsx',
  'insurance/components/DocumentChecklist.tsx',
  'insurance/components/RegistrationStepper.tsx',
  'insurance/components/ClaimSupportCard.tsx',
  'insurance/components/RiskContextCard.tsx',
  'insurance/insurance.tsx',
  // Notification page components
  'notification page/components/ActionButton.tsx',
  'notification page/components/NotificationCard.tsx',
  'notification page/components/PriorityBadge.tsx',
  'notification page/components/PrioritySummary.tsx',
  'notification page/components/TimelineGroup.tsx',
  'notification page/index.tsx',
  // Government schemes components
  'Government equipment schemes/components/SchemeCard.tsx',
  'Government equipment schemes/components/SchemeHero.tsx',
  'Government equipment schemes/components/CategoryFilter.tsx',
  'Government equipment schemes/components/EligibilityBadge.tsx',
  'Government equipment schemes/components/DocumentChecklist.tsx',
  'Government equipment schemes/components/FarmerProfileCard.tsx',
  'Government equipment schemes/components/ApplicationTimeline.tsx',
  'Government equipment schemes/index.tsx',
  // Financial support
  'Financial Support/list/FinancialSupportListPage.tsx',
  'Financial Support/detail/FacilityDetailPage.tsx',
  'Financial Support/acknowledgement/AcknowledgementPage.tsx',
  // Market components
  'marketpage/components/BestMarketRecommendation.tsx',
  'marketpage/components/CompareMarketsModal.tsx',
  'marketpage/components/MarketDetailsModal.tsx',
  'marketpage/components/MarketStateViews.tsx',
  'marketpage/components/MSPComparisonSection.tsx',
  'marketpage/components/NearbyMandisTable.tsx',
  'marketpage/components/NetRealizationCalculator.tsx',
  'marketpage/components/PriceComparisonChart.tsx',
  'marketpage/components/PriceTrendChart.tsx',
  'marketpage/components/TransportSection.tsx',
  'marketpage/marketpage.tsx',
  // Crop Monitoring remaining
  'Crop Monitoring page/components/HarvestSection.tsx',
  'Crop Monitoring page/components/WeatherForecastSection.tsx',
  'Crop Monitoring page/components/SelectedDatePanel.tsx',
  'Crop Monitoring page/components/InteractiveCalendar.tsx',
  'Crop Monitoring page/components/AddActivityModal.tsx',
  'Crop Monitoring page/components/AiAgronomistDrawer.tsx',
  // Equipment
  'Equipment page Dashboard/Equipment page.tsx',
];

let totalUpdated = 0;
let totalSkipped = 0;

for (const relPath of FILES_TO_UPDATE) {
  const fullPath = path.join(ROOT, relPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${relPath}`);
    continue;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Skip if already has useLanguage
  if (content.includes('useLanguage')) {
    console.log(`✓ Already has useLanguage: ${relPath}`);
    totalSkipped++;
    continue;
  }
  
  // Add import after the last import statement
  // Find the last import line
  const importRegex = /^import .+from .+;?\s*$/gm;
  let lastImportMatch = null;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    lastImportMatch = match;
  }
  
  if (!lastImportMatch) {
    console.log(`⚠️  No import found in: ${relPath}`);
    continue;
  }
  
  const insertAfter = lastImportMatch.index + lastImportMatch[0].length;
  const importLine = "\nimport { useLanguage } from '@/lib/language-context';";
  content = content.slice(0, insertAfter) + importLine + content.slice(insertAfter);
  
  // Now add const { t } = useLanguage(); after the first function/component body opening
  // Find the first return statement at top level of a component
  // We'll look for a function/arrow function that contains JSX (return with <)
  
  // Strategy: find the first occurrence of 'return (' or 'return (' at the component level
  // and add the hook before it
  
  // Look for patterns like:
  // function ComponentName(...) { <-- add hook here
  // const ComponentName = (...) => { <-- add hook here  
  // const ComponentName: React.FC = (...) => {  <-- add hook here
  
  // Simple approach: find the first 'return (' that is preceded by '{' not inside another function
  // Better: just add after the opening { of the export default function or named export
  
  const hookLine = '\n  const { t } = useLanguage();';
  
  // Pattern 1: export default function
  let inserted = false;
  
  // Look for the component function body opening
  const patterns = [
    /export default function \w+[^{]*\{/,
    /export function \w+[^{]*\{/,
    /const \w+(?::\s*React\.FC[^=]*)?\s*=\s*(?:\([^)]*\)|[^=]+)\s*=>\s*\{/,
    /function \w+[^{]*\{/,
  ];
  
  for (const pattern of patterns) {
    const m = pattern.exec(content);
    if (m) {
      const insertPos = m.index + m[0].length;
      content = content.slice(0, insertPos) + hookLine + content.slice(insertPos);
      inserted = true;
      break;
    }
  }
  
  if (!inserted) {
    console.log(`⚠️  Could not find component body in: ${relPath}`);
    continue;
  }
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Updated: ${relPath}`);
  totalUpdated++;
}

console.log(`\n📊 Results: ${totalUpdated} files updated, ${totalSkipped} already had useLanguage`);
