/**
 * Batch text replacement script - converts hardcoded English strings to t() calls
 * across all pages that don't have translation support.
 * 
 * Targets common UI strings that appear in button labels, headings, and status text.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Common replacement patterns - order matters! More specific first
// Format: [searchRegex, replacement]
// We only replace VISIBLE text strings, not CSS classes or code logic
const REPLACEMENT_PATTERNS = [
  // Back navigation
  [/>Back to Dashboard</, ">{t('back', 'Back to Dashboard')}<"],
  [/>Back</, ">{t('back', 'Back')}<"],
  // Status words
  [/>Completed</, ">{t('completed', 'Completed')}<"],
  [/>Active</, ">{t('active', 'Active')}<"],
  [/>Upcoming</, ">{t('upcoming', 'Upcoming')}<"],
  [/>Pending</, ">{t('pending', 'Pending')}<"],
  [/>Available</, ">{t('available', 'Available')}<"],
  [/>Booked</, ">{t('booked', 'Booked')}<"],
  [/>Under Maintenance</, ">{t('maintenance', 'Under Maintenance')}<"],
  [/>High</, ">{t('high', 'High')}<"],
  [/>Medium</, ">{t('medium', 'Medium')}<"],
  [/>Low</, ">{t('low', 'Low')}<"],
  [/>Eligible</, ">{t('eligible', 'Eligible')}<"],
  [/>Not Eligible</, ">{t('not_eligible', 'Not Eligible')}<"],
  [/>Enrolled</, ">{t('enrolled', 'Enrolled')}<"],
  [/>Not Enrolled</, ">{t('not_enrolled', 'Not Enrolled')}<"],
  // Button labels
  [/>Book Now</, ">{t('book_now', 'Book Now')}<"],
  [/>Apply Now</, ">{t('apply_now', 'Apply Now')}<"],
  [/>View Details</, ">{t('view_details_btn', 'View Details')}<"],
  [/>Compare All</, ">{t('compare_all', 'Compare All')}<"],
  [/>Try Again</, ">{t('try_again', 'Try Again')}<"],
  [/>Mark All Read</, ">{t('mark_all_read', 'Mark All Read')}<"],
  [/>Download</, ">{t('download_form', 'Download')}<"],
  [/>Upload</, ">{t('upload_btn', 'Upload')}<"],
  [/>Save</, ">{t('update_btn', 'Save')}<"],
  [/>Submit</, ">{t('done_btn', 'Submit')}<"],
  [/>Continue</, ">{t('continue_btn', 'Continue')}<"],
  [/>Done</, ">{t('done_btn', 'Done')}<"],
  [/>Dismiss</, ">{t('dismiss_notification', 'Dismiss')}<"],
  // Common labels
  [/>Loading\.\.\.<\//, ">{t('loading_data', 'Loading...')}</"],
  [/>No data available</, ">{t('no_data', 'No data available')}<"],
  [/>Today<\//, ">{t('today_label', 'Today')}</"],
  [/>Yesterday<\//, ">{t('yesterday_label', 'Yesterday')}<"],
  [/>High Priority</, ">{t('priority_high', 'High Priority')}<"],
  [/>Medium Priority</, ">{t('priority_medium', 'Medium Priority')}<"],
  [/>Low Priority</, ">{t('priority_low', 'Low Priority')}<"],
  // Insurance
  [/>Crop Insurance</, ">{t('crop_insurance', 'Crop Insurance')}<"],
  [/>PMFBY</, ">{t('pmfby_scheme', 'PMFBY')}<"],
  [/>Insurance Status</, ">{t('insurance_status', 'Insurance Status')}<"],
  [/>File Claim</, ">{t('file_claim', 'File Claim')}<"],
  [/>Claim Status</, ">{t('claim_status', 'Claim Status')}<"],
  [/>Premium Amount</, ">{t('premium_amount', 'Premium Amount')}<"],
  [/>Sum Insured</, ">{t('sum_insured', 'Sum Insured')}<"],
  // Market
  [/>Net Realization</, ">{t('net_realization', 'Net Realization')}<"],
  [/>Transport Cost</, ">{t('transport_cost', 'Transport Cost')}<"],
  [/>Market Fee</, ">{t('market_fee', 'Market Fee')}<"],
  [/>Profit Margin</, ">{t('profit_margin', 'Profit Margin')}<"],
  [/>Modal Price</, ">{t('modal_price', 'Modal Price')}<"],
  [/>Min Price</, ">{t('min_price', 'Min Price')}<"],
  [/>Max Price</, ">{t('max_price', 'Max Price')}<"],
  [/>Arrivals<\//, ">{t('arrivals', 'Arrivals')}</"],
  [/>Price Trend</, ">{t('price_trend', 'Price Trend')}<"],
  [/>MSP Comparison</, ">{t('msp_comparison', 'MSP Comparison')}<"],
  [/>Nearby Mandis</, ">{t('nearby_mandis', 'Nearby Mandis')}<"],
  // Equipment
  [/>Book Equipment</, ">{t('book_equipment', 'Book Equipment')}<"],
  [/>per day</, ">{t('per_day', 'per day')}<"],
  [/>per hour</, ">{t('per_hour', 'per hour')}<"],
  // Government schemes
  [/>Government Schemes</, ">{t('govt_schemes_title', 'Government Schemes')}<"],
  [/>All Categories</, ">{t('all_categories', 'All Categories')}<"],
  [/>Apply for Scheme</, ">{t('apply_scheme', 'Apply for Scheme')}<"],
  // Notifications  
  [/>Notifications<\/h/, ">{t('notifications_title', 'Notifications')}</h"],
  [/>All Notifications</, ">{t('all_notifications', 'All Notifications')}<"],
  [/>Action Required</, ">{t('action_required', 'Action Required')}<"],
  // Financial support
  [/>Financial Support<\//, ">{t('financial_support_title', 'Financial Support')}</"],
  [/>Loan Amount</, ">{t('loan_amount', 'Loan Amount')}<"],
  [/>Interest Rate</, ">{t('interest_rate', 'Interest Rate')}<"],
  [/>Apply for Loan</, ">{t('apply_loan', 'Apply for Loan')}<"],
];

// Files to process
const TARGET_FILES = [
  'insurance/insurance.tsx',
  'insurance/components/InsuranceStatusCard.tsx',
  'insurance/components/EligibilityCard.tsx',
  'insurance/components/BankSchemeList.tsx',
  'insurance/components/DocumentChecklist.tsx',
  'insurance/components/RegistrationStepper.tsx',
  'insurance/components/ClaimSupportCard.tsx',
  'insurance/components/RiskContextCard.tsx',
  'insurance/components/SchemeDetails.tsx',
  'notification page/index.tsx',
  'notification page/components/NotificationCard.tsx',
  'notification page/components/PrioritySummary.tsx',
  'notification page/components/TimelineGroup.tsx',
  'notification page/components/ActionButton.tsx',
  'Government equipment schemes/index.tsx',
  'Government equipment schemes/components/SchemeCard.tsx',
  'Government equipment schemes/components/SchemeHero.tsx',
  'Government equipment schemes/components/EligibilityBadge.tsx',
  'Government equipment schemes/components/DocumentChecklist.tsx',
  'Government equipment schemes/components/FarmerProfileCard.tsx',
  'Government equipment schemes/components/ApplicationTimeline.tsx',
  'Financial Support/list/FinancialSupportListPage.tsx',
  'Financial Support/detail/FacilityDetailPage.tsx',
  'Financial Support/acknowledgement/AcknowledgementPage.tsx',
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
  'Equipment page Dashboard/Equipment page.tsx',
  'Crop Monitoring page/components/HarvestSection.tsx',
  'Crop Monitoring page/components/WeatherForecastSection.tsx',
  'Crop Monitoring page/components/SelectedDatePanel.tsx',
  'Crop Monitoring page/components/InteractiveCalendar.tsx',
  'Crop Monitoring page/components/AddActivityModal.tsx',
];

let totalReplacements = 0;

for (const relPath of TARGET_FILES) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) continue;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let fileReplacements = 0;
  
  for (const [pattern, replacement] of REPLACEMENT_PATTERNS) {
    const original = content;
    content = content.replace(pattern, replacement);
    if (content !== original) fileReplacements++;
  }
  
  if (fileReplacements > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${relPath}: ${fileReplacements} replacements`);
    totalReplacements += fileReplacements;
  }
}

console.log(`\n✅ Total replacements: ${totalReplacements}`);
