const fs = require('fs');
const path = require('path');

// Key UI strings replacement map
const replacements = [
  // Common Headings & Actions
  { regex: />\s*Crop Health\s*</g, replace: '>{t("crop_health", "Crop Health")}<' },
  { regex: />\s*NDVI Index\s*</g, replace: '>{t("ndvi_status", "NDVI Index")}<' },
  { regex: />\s*Soil Moisture\s*</g, replace: '>{t("soil_moisture", "Soil Moisture")}<' },
  { regex: />\s*Soil Temperature\s*</g, replace: '>{t("soil_temp", "Soil Temperature")}<' },
  { regex: />\s*Soil Temp\s*</g, replace: '>{t("soil_temp", "Soil Temperature")}<' },
  { regex: />\s*Crop Stage\s*</g, replace: '>{t("crop_stage", "Crop Stage")}<' },
  { regex: />\s*Current Stage\s*</g, replace: '>{t("crop_stage", "Crop Stage")}<' },
  { regex: />\s*Daily Farm Tasks\s*</g, replace: '>{t("daily_tasks", "Daily Farm Tasks")}<' },
  { regex: />\s*Farm Tasks\s*</g, replace: '>{t("daily_tasks", "Daily Farm Tasks")}<' },
  { regex: />\s*Tasks Completed\s*</g, replace: '>{t("tasks_completed", "Tasks Completed")}<' },
  { regex: />\s*Harvest Forecast\s*</g, replace: '>{t("harvest_forecast", "Harvest Forecast")}<' },
  { regex: />\s*Weather Telemetry\s*</g, replace: '>{t("weather_telemetry", "Weather Telemetry")}<' },
  { regex: />\s*Contributing Risk Factors\s*</g, replace: '>{t("risk_factors", "Contributing Risk Factors")}<' },
  { regex: />\s*Real-time weighted parameters\s*</g, replace: '>{t("realtime_telemetry", "Real-time weighted parameters")}<' },
  { regex: />\s*Synced with AWS RDS\s*</g, replace: '>{t("synced_with_database", "Synced with AWS RDS")}<' },
  { regex: />\s*Key Stress Drivers\s*</g, replace: '>{t("key_stress_drivers", "Key Stress Drivers")}<' },
  { regex: />\s*KEY STRESS DRIVERS\s*</g, replace: '>{t("key_stress_drivers", "KEY STRESS DRIVERS")}<' },
  { regex: />\s*AI Agronomic Reasoning\s*</g, replace: '>{t("ai_reasoning", "AI Agronomic Reasoning")}<' },
  { regex: />\s*Gemini AI Agronomist\s*</g, replace: '>{t("ai_agronomist", "Gemini AI Agronomist")}<' },
  { regex: />\s*View Recommended Actions & Interventions\s*</g, replace: '>{t("view_recommended_actions", "View Recommended Actions & Interventions")}<' },
  { regex: />\s*Live APMC Mandi Prices & Price Volatility\s*</g, replace: '>{t("mandi_prices_title", "Live APMC Mandi Prices & Price Volatility")}<' },
  { regex: />\s*Mandi Net Realization\s*</g, replace: '>{t("mandi_prices_title", "Mandi Net Realization")}<' },
  { regex: />\s*Highest Price\s*</g, replace: '>{t("max_price", "Highest Price")}<' },
  { regex: />\s*Modal Price\s*</g, replace: '>{t("modal_price", "Modal Price")}<' },
  { regex: />\s*Central & State Government Schemes Hub\s*</g, replace: '>{t("govt_schemes_hub", "Central & State Government Schemes Hub")}<' },
  { regex: />\s*Custom Hiring Center \(CHC\) Machinery Rentals\s*</g, replace: '>{t("chc_equipment_rental", "Custom Hiring Center (CHC) Machinery Rentals")}<' },
  { regex: />\s*Kisan Credit Card \(KCC\) Loans\s*</g, replace: '>{t("kisan_credit_card", "Kisan Credit Card (KCC) Loans")}<' },
  { regex: />\s*PMFBY Crop Insurance & Claim Settlement\s*</g, replace: '>{t("pmfby_insurance", "PMFBY Crop Insurance & Claim Settlement")}<' },
  { regex: />\s*Farmer Profile & Land Parcel Dossier\s*</g, replace: '>{t("farmer_dossier", "Farmer Profile & Land Parcel Dossier")}<' },
  { regex: />\s*Multi-Channel Alert & Notification Center\s*</g, replace: '>{t("notification_center", "Multi-Channel Alert & Notification Center")}<' },
  { regex: />\s*Agricultural Distress Command Center\s*</g, replace: '>{t("distress_command", "Agricultural Distress Command Center")}<' },
  { regex: />\s*Total Farmers Monitored\s*</g, replace: '>{t("total_farmers_monitored", "Total Farmers Monitored")}<' },
  { regex: />\s*High Risk Farmers \(>70 Score\)\s*</g, replace: '>{t("high_risk_farmers", "High Risk Farmers (>70 Score)")}<' },
  { regex: />\s*Medium Risk Farmers \(31-70\)\s*</g, replace: '>{t("medium_risk_farmers", "Medium Risk Farmers (31-70)")}<' },
  { regex: />\s*Low Risk Farmers \(<=30\)\s*</g, replace: '>{t("low_risk_farmers", "Low Risk Farmers (<=30)")}<' },
  { regex: />\s*Block-Level Distress Heatmap\s*</g, replace: '>{t("distress_heatmap", "Block-Level Distress Heatmap")}<' },
  { regex: />\s*Multi-Hazard Combined Matrix\s*</g, replace: '>{t("combined_risk", "Multi-Hazard Combined Matrix")}<' },
  { regex: />\s*Priority Action Interventions\s*</g, replace: '>{t("priority_interventions", "Priority Action Interventions")}<' },
  { regex: />\s*High-Risk Farmer Triage Directory\s*</g, replace: '>{t("triage_directory", "High-Risk Farmer Triage Directory")}<' },
];

const TARGET_DIRS = [
  path.join(__dirname, '..', 'app'),
  path.join(__dirname, '..', 'components'),
  path.join(__dirname, '..', 'Risk Detail Page'),
  path.join(__dirname, '..', 'Agriculture officer dashboard'),
  path.join(__dirname, '..', 'Alternative crop'),
  path.join(__dirname, '..', 'Bank Portal'),
  path.join(__dirname, '..', 'Crop Details'),
  path.join(__dirname, '..', 'Crop Monitoring page'),
  path.join(__dirname, '..', 'Equipment page Dashboard'),
  path.join(__dirname, '..', 'farmer profile'),
  path.join(__dirname, '..', 'Financial Support'),
  path.join(__dirname, '..', 'Full crop guide'),
  path.join(__dirname, '..', 'Government equipment schemes'),
  path.join(__dirname, '..', 'insurance'),
  path.join(__dirname, '..', 'marketpage'),
  path.join(__dirname, '..', 'notification page'),
];

let modifiedCount = 0;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  let hasReplacements = false;
  for (const r of replacements) {
    if (r.regex.test(content)) {
      content = content.replace(r.regex, r.replace);
      hasReplacements = true;
    }
  }

  if (hasReplacements) {
    // Check if useLanguage is imported
    if (!content.includes('useLanguage')) {
      // Add import at top
      if (content.includes('import React')) {
        content = content.replace(/(import React[^;]*;)/, '$1\nimport { useLanguage } from "@/lib/language-context";');
      } else {
        content = 'import { useLanguage } from "@/lib/language-context";\n' + content;
      }
    }

    // Check if const { t } = useLanguage() is inside component
    if (!content.includes('useLanguage()') && !content.includes('useLanguage ()')) {
      // Insert after export default function or export const Component =
      const fnMatch = content.match(/(export\s+(?:default\s+)?(?:function|const)\s+[a-zA-Z0-9_]+\s*(?:=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>|\([^)]*\))\s*\{)/);
      if (fnMatch) {
        content = content.replace(fnMatch[0], `${fnMatch[0]}\n  const { t } = useLanguage();`);
      }
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Localized: ${path.relative(path.join(__dirname, '..'), filePath)}`);
      modifiedCount++;
    }
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        walk(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

for (const dir of TARGET_DIRS) {
  walk(dir);
}

console.log(`\nLocalization complete! Updated ${modifiedCount} components.`);
