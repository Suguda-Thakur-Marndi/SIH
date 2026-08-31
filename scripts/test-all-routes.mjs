import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'smartcrop_super_secure_jwt_secret_key_2026';

// Simple signed JWT generator for automated route testing
function createTestToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

const adminToken = createTestToken({ id: 'adm_01', role: 'administrator', name: 'Test Administrator' });
const farmerToken = createTestToken({ id: 'frm_01', role: 'farmer', name: 'Test Farmer' });

const FRONTEND_ROUTES = [
  // Public / Discovery
  { path: '/', expected: [200, 307, 308], name: 'Root Home Redirect' },
  { path: '/authentication', expected: [200], name: 'Authentication Portal' },
  { path: '/onboarding', expected: [200], name: 'Farmer Onboarding' },
  { path: '/market', expected: [200], name: 'Mandi Market Rates' },
  { path: '/schemes', expected: [200], name: 'Government Schemes' },
  { path: '/full-crop-guide', expected: [200], name: 'Full Crop Guide' },
  { path: '/alternative-crop', expected: [200], name: 'Alternative Crops' },
  { path: '/ai-chat', expected: [200], name: 'AI Agronomist Chat' },
  { path: '/unauthorized', expected: [200], name: 'Unauthorized Notice' },

  // Farmer Portal
  { path: '/dashboard', expected: [200], name: 'Farmer Dashboard' },
  { path: '/crop-monitoring', expected: [200], name: 'Crop Monitoring' },
  { path: '/crop-details', expected: [200], name: 'Crop Details & Calendar' },
  { path: '/risk-details', expected: [200], name: 'Risk Diagnostics' },
  { path: '/recommended-actions', expected: [200], name: 'Recommended Actions' },
  { path: '/equipment', expected: [200], name: 'Equipment Marketplace' },
  { path: '/financial-support', expected: [200], name: 'Financial Support (KCC)' },
  { path: '/financial-support/detail', expected: [200], name: 'Loan Application Form' },
  { path: '/financial-support/acknowledgement', expected: [200], name: 'Application Receipt' },
  { path: '/insurance', expected: [200], name: 'Crop Insurance (PMFBY)' },
  { path: '/farmer-profile', expected: [200], name: 'Farmer Profile' },
  { path: '/notifications', expected: [200], name: 'Notifications Center' },

  // Administrator / Officer Portal
  { path: '/admin', expected: [200, 307, 308], name: 'Admin Route Connector' },
  { path: '/admin/dashboard', expected: [200], name: 'District Distress Map' },
  { path: '/agriculture-officer-dashboard', expected: [200], name: 'Agriculture Officer Dashboard' },
  { path: '/officer-dashboard', expected: [200], name: 'Officer Dashboard Alias' },
  { path: '/officer-dashboard/farmers', expected: [200], name: 'High-Risk Farmers Directory' },
  { path: '/officer-dashboard/map', expected: [200], name: 'Officer Distress Map' },

  // Bank Partner Portal
  { path: '/bank', expected: [200, 307, 308], name: 'Bank Route Connector' },
  { path: '/bank-portal', expected: [200], name: 'Bank Partner Portal' },
  { path: '/bank-portal/dashboard', expected: [200], name: 'Bank Dashboard' },
  { path: '/bank-portal/facilities', expected: [200], name: 'Credit Facilities List' },
  { path: '/bank-portal/facilities/add', expected: [200], name: 'Add Facility Wizard' },
  { path: '/bank-portal/register', expected: [200], name: 'Bank Registration' },
  { path: '/bank-insurance/dashboard', expected: [200], name: 'Bank & Insurance Underwriting' },

  // Government Hub
  { path: '/government', expected: [200, 307, 308], name: 'Government Connector' },
  { path: '/government/dashboard', expected: [200], name: 'Government CHC Hub' },
];

const API_ROUTES = [
  { path: '/api/translate', method: 'POST', body: { text: 'Hello', targetLanguage: 'hi' }, name: 'Sarvam AI Translate API' },
  { path: '/api/sarvam', method: 'POST', body: { action: 'translate', text: 'Hello', targetLanguage: 'od-IN' }, name: 'Sarvam Gateway' },
  { path: '/api/officer/farmers', method: 'GET', token: adminToken, name: 'Officer Farmers & Distress API' },
  { path: '/api/officer/dashboard', method: 'GET', token: adminToken, name: 'Officer Dashboard Stats' },
  { path: '/api/farmer/dashboard', method: 'GET', token: farmerToken, name: 'Farmer Dashboard Telemetry' },
  { path: '/api/farmer/risk', method: 'GET', token: farmerToken, name: 'Farmer Risk Assessment' },
  { path: '/api/farmer/recommendations', method: 'GET', token: farmerToken, name: 'Farmer Recommendations' },
  { path: '/api/equipment', method: 'GET', token: farmerToken, name: 'Equipment Catalog API' },
  { path: '/api/facilities', method: 'GET', token: farmerToken, name: 'Financial Facilities API' },
  { path: '/api/notifications', method: 'GET', token: farmerToken, name: 'Notifications API' },
];

async function checkRoute(route) {
  const url = `${BASE_URL}${route.path}`;
  const method = route.method || 'GET';

  try {
    const startTime = Date.now();
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'SmartCrop-RouteChecker/1.0',
    };

    if (route.token) {
      headers['Authorization'] = `Bearer ${route.token}`;
      headers['Cookie'] = `smartcrop_token=${route.token}`;
    }

    const options = { method, headers };
    if (route.body) {
      options.body = JSON.stringify(route.body);
    }

    const res = await fetch(url, options);
    const duration = Date.now() - startTime;

    const isOk = route.expected ? route.expected.includes(res.status) : (res.status >= 200 && res.status < 400);

    return {
      name: route.name,
      path: route.path,
      method,
      status: res.status,
      duration: `${duration}ms`,
      passed: isOk,
    };
  } catch (err) {
    return {
      name: route.name,
      path: route.path,
      method,
      status: 'ERR',
      duration: '-',
      passed: false,
      error: err.message,
    };
  }
}

async function run() {
  console.log('===============================================================');
  console.log('🌱 SmartCrop — Full Application Route & API Verification Suite');
  console.log(`Target Base URL: ${BASE_URL}`);
  console.log('===============================================================\n');

  console.log('📡 Testing Frontend Pages (36 Total)...');
  const pageResults = [];
  for (const r of FRONTEND_ROUTES) {
    const result = await checkRoute(r);
    pageResults.push(result);
    const icon = result.passed ? '✅' : '❌';
    console.log(`  ${icon} [${result.status}] ${result.method.padEnd(4)} ${result.path.padEnd(35)} -> ${result.name} (${result.duration})`);
  }

  console.log('\n⚡ Testing Backend REST API Endpoints (10 Total)...');
  const apiResults = [];
  for (const r of API_ROUTES) {
    const result = await checkRoute(r);
    apiResults.push(result);
    const icon = result.passed ? '✅' : '❌';
    console.log(`  ${icon} [${result.status}] ${result.method.padEnd(4)} ${result.path.padEnd(35)} -> ${result.name} (${result.duration})`);
  }

  const allResults = [...pageResults, ...apiResults];
  const passed = allResults.filter(r => r.passed).length;
  const total = allResults.length;

  console.log('\n===============================================================');
  console.log(`🎯 Summary: ${passed}/${total} Routes Passed Successfully (${Math.round((passed / total) * 100)}%)`);
  console.log('===============================================================');
}

run();

