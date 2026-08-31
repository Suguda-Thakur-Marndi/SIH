import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'smartcrop_super_secure_jwt_secret_key_2026';

function createTestToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

const adminToken = createTestToken({ id: 'adm_01', role: 'administrator', name: 'Test Administrator' });
const officerToken = createTestToken({ id: 'usr_admin_demo_1', role: 'officer', name: 'Dr. Anil Verma' });
const farmerToken = createTestToken({ id: 'frm_01', role: 'farmer', name: 'Ramesh Kumar Patel' });
const bankToken = createTestToken({ id: 'bnk_01', role: 'bank_partner', name: 'SBI Agri Branch' });

const FRONTEND_PAGES = [
  { path: '/', expected: [200, 307, 308], name: 'Root Home' },
  { path: '/authentication', expected: [200], name: 'Authentication Portal' },
  { path: '/onboarding', expected: [200], name: 'Farmer Onboarding' },
  { path: '/dashboard', expected: [200], name: 'Farmer Dashboard' },
  { path: '/crop-monitoring', expected: [200], name: 'Crop Monitoring' },
  { path: '/crop-details', expected: [200], name: 'Crop Details' },
  { path: '/risk-details', expected: [200], name: 'Risk Diagnostics' },
  { path: '/recommended-actions', expected: [200], name: 'Recommended Actions' },
  { path: '/alternative-crop', expected: [200], name: 'Alternative Crops' },
  { path: '/full-crop-guide', expected: [200], name: 'Full Crop Guide' },
  { path: '/market', expected: [200], name: 'Mandi Market Rates' },
  { path: '/schemes', expected: [200], name: 'Government Schemes' },
  { path: '/equipment', expected: [200], name: 'Equipment Marketplace' },
  { path: '/financial-support', expected: [200], name: 'Financial Support (KCC)' },
  { path: '/financial-support/detail', expected: [200], name: 'Facility Application' },
  { path: '/financial-support/acknowledgement', expected: [200], name: 'Loan Receipt' },
  { path: '/insurance', expected: [200], name: 'Crop Insurance (PMFBY)' },
  { path: '/farmer-profile', expected: [200], name: 'Farmer Profile' },
  { path: '/notifications', expected: [200], name: 'Notifications Center' },
  { path: '/ai-chat', expected: [200], name: 'AI Agronomist Chat' },

  // Officer / Admin Portal
  { path: '/officer-dashboard', expected: [200], name: 'Officer Dashboard' },
  { path: '/officer-dashboard/analytics', expected: [200], name: 'Officer Distress Analytics' },
  { path: '/officer-dashboard/map', expected: [200], name: 'Spatial Distress Map' },
  { path: '/officer-dashboard/farmers', expected: [200], name: 'High-Risk Farmers Directory' },
  { path: '/officer-dashboard/interventions', expected: [200], name: 'Intervention History' },
  { path: '/officer-dashboard/settings', expected: [200], name: 'Officer Settings' },

  // Bank Portal
  { path: '/bank-portal', expected: [200], name: 'Bank Portal Landing' },
  { path: '/bank-portal/dashboard', expected: [200], name: 'Bank Dashboard' },
  { path: '/bank-portal/facilities', expected: [200], name: 'Credit Facilities' },
  { path: '/bank-portal/facilities/add', expected: [200], name: 'Add Facility' },
  { path: '/bank-insurance/dashboard', expected: [200], name: 'Bank & Insurance Underwriting' },

  // Government CHC Hub
  { path: '/government/dashboard', expected: [200], name: 'Government CHC Hub' },
];

const AI_API_TESTS = [
  {
    path: '/api/ai/chat',
    method: 'POST',
    body: { message: 'How do I protect my paddy crop from dry spell?', context: { cropName: 'Paddy', district: 'Mayurbhanj' } },
    name: 'AI Agronomist Chatbot'
  },
  {
    path: '/api/ai/alternative-crop',
    method: 'POST',
    body: { currentCrop: 'Paddy', soilType: 'Red Loam', waterAvailability: 'Low', district: 'Mayurbhanj' },
    name: 'AI Alternative Crop Engine'
  },
  {
    path: '/api/ai/risk-explanation',
    method: 'POST',
    body: { cropName: 'Paddy (Swarna)', riskScore: 78, weatherRisk: 65, marketRisk: 40, soilMoisture: '22%' },
    name: 'AI Risk Diagnostics Explanation'
  },
  {
    path: '/api/translate',
    method: 'POST',
    body: { text: 'Welcome to Smart Crop AI Advisory', targetLanguage: 'hi', sourceLanguage: 'en' },
    name: 'Sarvam / Neural Translation API'
  },
  {
    path: '/api/sarvam',
    method: 'POST',
    body: { action: 'translate', text: 'Farmer Distress Alert', targetLanguage: 'od-IN' },
    name: 'Sarvam AI Gateway'
  }
];

const BACKEND_API_TESTS = [
  // Officer Analytics
  { path: '/api/officer/analytics/overview', method: 'GET', token: officerToken, name: 'Analytics Overview KPIs' },
  { path: '/api/officer/analytics/distress-trend', method: 'GET', token: officerToken, name: 'Analytics Distress Trend' },
  { path: '/api/officer/analytics/risk-distribution', method: 'GET', token: officerToken, name: 'Analytics Risk Distribution' },
  { path: '/api/officer/analytics/distress-factors', method: 'GET', token: officerToken, name: 'Analytics Distress Factors' },
  { path: '/api/officer/analytics/heatmap', method: 'GET', token: officerToken, name: 'Analytics Spatial Heatmap' },
  { path: '/api/officer/analytics/weather-stress', method: 'GET', token: officerToken, name: 'Analytics Weather Stress' },
  { path: '/api/officer/analytics/market-stress', method: 'GET', token: officerToken, name: 'Analytics Market Stress' },
  { path: '/api/officer/analytics/combined-risk', method: 'GET', token: officerToken, name: 'Analytics Combined Risk' },
  { path: '/api/officer/analytics/priority-interventions', method: 'GET', token: officerToken, name: 'Analytics Priority Interventions' },
  
  // Officer Management
  { path: '/api/officer/farmers', method: 'GET', token: officerToken, name: 'Officer Farmers List' },
  { path: '/api/officer/dashboard', method: 'GET', token: officerToken, name: 'Officer Dashboard Metrics' },
  { path: '/api/officer/settings', method: 'GET', token: officerToken, name: 'Officer Settings Retrieval' },

  // Farmer Portal Telemetry
  { path: '/api/farmer/dashboard', method: 'GET', token: farmerToken, name: 'Farmer Dashboard Telemetry' },
  { path: '/api/farmer/risk', method: 'GET', token: farmerToken, name: 'Farmer Risk Assessment' },
  { path: '/api/farmer/recommendations', method: 'GET', token: farmerToken, name: 'Farmer Recommendations' },
  { path: '/api/farmer/FARMER-001', method: 'GET', token: farmerToken, name: 'Farmer Profile Dossier' },
  { path: '/api/equipment', method: 'GET', token: farmerToken, name: 'Equipment Marketplace Catalog' },
  { path: '/api/facilities', method: 'GET', token: farmerToken, name: 'Financial Credit Facilities' },
  { path: '/api/notifications', method: 'GET', token: farmerToken, name: 'Notifications API' },
];

async function runTest(test) {
  const url = `${BASE_URL}${test.path}`;
  const method = test.method || 'GET';

  try {
    const startTime = Date.now();
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'SmartCrop-Verifier/2.0',
    };

    if (test.token) {
      headers['Authorization'] = `Bearer ${test.token}`;
      headers['Cookie'] = `smartcrop_token=${test.token}`;
    }

    const options = { method, headers };
    if (test.body) {
      options.body = JSON.stringify(test.body);
    }

    const res = await fetch(url, options);
    const duration = Date.now() - startTime;
    const isOk = test.expected ? test.expected.includes(res.status) : (res.status >= 200 && res.status < 400);

    let details = '';
    if (test.method === 'POST') {
      const data = await res.json().catch(() => ({}));
      if (data.answer) details = `(AI response: ${data.answer.slice(0, 45)}...)`;
      else if (data.translatedText) details = `(Translated: "${data.translatedText}")`;
      else if (data.data) details = `(Generated ${Object.keys(data.data).length} AI keys)`;
    }

    return {
      name: test.name,
      path: test.path,
      method,
      status: res.status,
      duration: `${duration}ms`,
      passed: isOk,
      details,
    };
  } catch (err) {
    return {
      name: test.name,
      path: test.path,
      method,
      status: 'ERR',
      duration: '-',
      passed: false,
      error: err.message,
    };
  }
}

async function main() {
  console.log('========================================================================');
  console.log('🌾 SmartCrop — Automated Full-Stack End-to-End Verification Suite');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('========================================================================\n');

  console.log('📱 1. Testing Frontend UI/UX Pages (32 Routes)...');
  let passedPages = 0;
  for (const page of FRONTEND_PAGES) {
    const r = await runTest(page);
    if (r.passed) passedPages++;
    const mark = r.passed ? '✅' : '❌';
    console.log(`  ${mark} [${r.status}] ${r.method.padEnd(4)} ${r.path.padEnd(38)} -> ${r.name} (${r.duration})`);
  }

  console.log('\n🤖 2. Testing AI Agronomist, Chatbot & Translation Engines (5 Endpoints)...');
  let passedAI = 0;
  for (const ai of AI_API_TESTS) {
    const r = await runTest(ai);
    if (r.passed) passedAI++;
    const mark = r.passed ? '✅' : '❌';
    console.log(`  ${mark} [${r.status}] ${r.method.padEnd(4)} ${r.path.padEnd(38)} -> ${r.name} (${r.duration}) ${r.details || ''}`);
  }

  console.log('\n⚡ 3. Testing Backend REST APIs & Telemetry Analytics (19 Endpoints)...');
  let passedAPIs = 0;
  for (const api of BACKEND_API_TESTS) {
    const r = await runTest(api);
    if (r.passed) passedAPIs++;
    const mark = r.passed ? '✅' : '❌';
    console.log(`  ${mark} [${r.status}] ${r.method.padEnd(4)} ${r.path.padEnd(38)} -> ${r.name} (${r.duration})`);
  }

  const totalTests = FRONTEND_PAGES.length + AI_API_TESTS.length + BACKEND_API_TESTS.length;
  const totalPassed = passedPages + passedAI + passedAPIs;

  console.log('\n========================================================================');
  console.log(`🎉 Final Results: ${totalPassed}/${totalTests} Passed (${Math.round((totalPassed / totalTests) * 100)}%)`);
  console.log(`  • Frontend Pages: ${passedPages}/${FRONTEND_PAGES.length}`);
  console.log(`  • AI & Chatbot Engines: ${passedAI}/${AI_API_TESTS.length}`);
  console.log(`  • Backend APIs & Analytics: ${passedAPIs}/${BACKEND_API_TESTS.length}`);
  console.log('========================================================================');
}

main();
