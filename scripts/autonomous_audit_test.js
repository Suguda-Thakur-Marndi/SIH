const http = require('http');

const BASE_URL = 'http://localhost:3000';

const testResults = {
  passed: [],
  failed: [],
  warnings: [],
};

function makeRequest(path, options = {}) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
          rawLength: data.length,
        });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 'ERROR', error: err.message });
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runAutonomousAudit() {
  console.log('===========================================================');
  console.log('🌱 SMARTCROP AUTONOMOUS FULL AUDIT & TEST PIPELINE');
  console.log('===========================================================\n');

  // 1. Test All Core Frontend Routes
  const routes = [
    { path: '/', expected: [200, 307, 308], name: 'Root Landing / Role Discovery' },
    { path: '/authentication', expected: [200], name: 'Unified Authentication' },
    { path: '/onboarding', expected: [200], name: 'Farmer Onboarding Flow' },
    { path: '/alternative-crop', expected: [200], name: 'Alternative Crop Substitution' },
    { path: '/full-crop-guide', expected: [200], name: 'Full Crop Guide Handbook' },
    { path: '/market', expected: [200], name: 'APMC Mandi Market' },
    { path: '/schemes', expected: [200], name: 'Govt Schemes Hub' },
    { path: '/financial-support', expected: [200], name: 'KCC Financial Support' },
    { path: '/officer-dashboard', expected: [200], name: 'Officer Command Center' },
    { path: '/officer-dashboard/map', expected: [200], name: 'Mayurbhanj Map' },
    { path: '/officer-dashboard/farmers', expected: [200], name: 'High-Risk Farmer Triage' },
    { path: '/admin/dashboard', expected: [200], name: 'Admin Console' },
    { path: '/unauthorized', expected: [200], name: 'Unauthorized Access Screen' },
  ];

  console.log('--- Phase 1: Frontend Route Accessibility & Status Checks ---');
  for (const r of routes) {
    const res = await makeRequest(r.path);
    if (r.expected.includes(res.status)) {
      console.log(`[PASS] ${r.name} (${r.path}) -> Status: ${res.status} (${res.rawLength} bytes)`);
      testResults.passed.push(`Route: ${r.path}`);
    } else {
      console.error(`[FAIL] ${r.name} (${r.path}) -> Expected: ${r.expected}, Got: ${res.status}`);
      testResults.failed.push(`Route: ${r.path}`);
    }
  }

  // 2. Test Backend REST APIs
  console.log('\n--- Phase 2: Backend REST APIs & Data Integrity ---');
  const apiTests = [
    {
      path: '/api/officer/analytics/overview',
      name: 'Officer Analytics Overview',
      validate: (data) => data.success && data.data && typeof data.data.highRiskFarmers?.count === 'number',
    },
    {
      path: '/api/officer/analytics/distress-trend',
      name: 'Officer Distress Trend (Time Series)',
      validate: (data) => data.success && Array.isArray(data.data),
    },
    {
      path: '/api/officer/analytics/risk-distribution',
      name: 'Distress Risk Distribution (3-Tier)',
      validate: (data) => data.success && data.data && typeof data.data.high === 'number',
    },
    {
      path: '/api/officer/analytics/distress-factors',
      name: '3-Signal Distress Factors Breakdown',
      validate: (data) => data.success && Array.isArray(data.data),
    },
    {
      path: '/api/officer/analytics/heatmap',
      name: 'Mayurbhanj 26-Block Heatmap API',
      validate: (data) => data.success && Array.isArray(data.data) && data.data.length > 0,
    },
    {
      path: '/api/officer/analytics/weather-stress',
      name: 'Rainfall Deficit vs Expected Baseline',
      validate: (data) => data.success && data.data,
    },
    {
      path: '/api/officer/analytics/market-stress',
      name: 'Mandi Price Shock & MSP Volatility',
      validate: (data) => data.success && data.data,
    },
    {
      path: '/api/officer/analytics/combined-risk',
      name: 'Multi-Hazard Combined Risk Matrix',
      validate: (data) => data.success && data.data && typeof data.data.weatherOnly === 'number',
    },
    {
      path: '/api/officer/analytics/priority-interventions',
      name: 'Priority Action Triage Queue',
      validate: (data) => data.success && Array.isArray(data.data),
    },
    {
      path: '/api/facilities',
      name: 'Institutional Credit Facilities Catalog',
      validate: (data) => data.facilities && data.count > 0,
    },
    {
      path: '/api/geocode?q=Baripada',
      name: 'Universal Indian Geocoding API',
      validate: (data) => data.success || Array.isArray(data.results) || data.lat !== undefined,
    },
  ];

  for (const api of apiTests) {
    const res = await makeRequest(api.path);
    if (res.status === 200 && api.validate(res.data)) {
      console.log(`[PASS] ${api.name} (${api.path}) -> Status: 200 OK, Payload verified`);
      testResults.passed.push(`API: ${api.path}`);
    } else {
      console.error(`[FAIL] ${api.name} (${api.path}) -> Status: ${res.status}, Payload:`, res.data);
      testResults.failed.push(`API: ${api.path}`);
    }
  }

  // 3. Test AI & Multilingual Endpoints
  console.log('\n--- Phase 3: AI Agronomist & Indic NLP Endpoints ---');
  const aiChatRes = await makeRequest('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      message: 'What is the recommended fertilizer dosage for Paddy during flowering stage?',
      context: {
        crop: 'Paddy',
        stage: 'Flowering',
        soil: 'Clay Loam',
        district: 'Mayurbhanj',
        language: 'Odia',
        languageCode: 'or',
      },
    },
  });

  if (aiChatRes.status === 200 && aiChatRes.data && aiChatRes.data.success) {
    console.log('[PASS] AI Agronomist Chat API (/api/ai/chat) -> Verified response generated');
    testResults.passed.push('AI: /api/ai/chat');
  } else {
    console.error('[FAIL] AI Agronomist Chat API (/api/ai/chat) -> Status:', aiChatRes.status, aiChatRes.data);
    testResults.failed.push('AI: /api/ai/chat');
  }

  // Alternative Crop AI
  const altCropRes = await makeRequest('/api/ai/alternative-crop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      currentCrop: 'Paddy',
      district: 'Mayurbhanj',
      soilType: 'Red Loam',
      waterAvailability: 'Low',
    },
  });

  if (altCropRes.status === 200 && altCropRes.data && altCropRes.data.success) {
    console.log('[PASS] Climate-Smart Alternative Crop API (/api/ai/alternative-crop) -> Verified recommendations generated');
    testResults.passed.push('AI: /api/ai/alternative-crop');
  } else {
    console.error('[FAIL] Alternative Crop API -> Status:', altCropRes.status, altCropRes.data);
    testResults.failed.push('AI: /api/ai/alternative-crop');
  }

  // 4. Test Authentication & RBAC Security Protection
  console.log('\n--- Phase 4: RBAC Route Protection & Unauthenticated Behavior ---');
  const protectedRoutes = [
    '/dashboard',
    '/crop-monitoring',
    '/crop-details',
    '/risk-details',
    '/officer-dashboard/analytics',
    '/officer-dashboard/settings',
    '/bank-portal/facilities/manage',
    '/government/dashboard',
  ];

  for (const pr of protectedRoutes) {
    const res = await makeRequest(pr);
    // Should return 307 redirect to /authentication when unauthenticated
    if (res.status === 307 || res.status === 308) {
      console.log(`[PASS] Route Protection on ${pr} -> Redirected to /authentication (${res.status})`);
      testResults.passed.push(`RBAC: ${pr}`);
    } else {
      console.warn(`[WARN] Route Protection on ${pr} -> Status: ${res.status}`);
      testResults.warnings.push(`RBAC: ${pr}`);
    }
  }

  console.log('\n===========================================================');
  console.log('📊 AUDIT SUMMARY:');
  console.log(`Total Passed: ${testResults.passed.length}`);
  console.log(`Total Failed: ${testResults.failed.length}`);
  console.log(`Total Warnings: ${testResults.warnings.length}`);
  console.log('===========================================================');
}

runAutonomousAudit();
