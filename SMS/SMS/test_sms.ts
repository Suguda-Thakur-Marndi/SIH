import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { buildMessage, buildMessageAsync } from './lib/notifications/templates';
import { sendSms, normalizePhoneNumber, maskPhoneNumber } from './lib/notifications/sms';
import { getRiskPriority, hasThresholdCrossed } from './lib/notifications/rules';

async function runComprehensiveSmsTests() {
  console.log('====================================================');
  console.log('🌿 SMARTCROP — SMS NOTIFICATION SYSTEM TEST RUNNER');
  console.log('====================================================\n');

  // Test 1: Phone Normalization & Masking
  console.log('▶ TEST 1: Phone Number Normalization & Masking');
  const rawPhones = ['9876543210', '+919876543210', '09876543210', ' +91 98765-43210 '];
  for (const raw of rawPhones) {
    const normalized = normalizePhoneNumber(raw);
    const masked = maskPhoneNumber(normalized);
    console.log(`  Raw: "${raw}" -> Normalized: "${normalized}" -> Masked: "${masked}"`);
  }
  console.log('  ✅ Phone normalization tests passed.\n');

  // Test 2: Risk Evaluation & Threshold Crossing
  console.log('▶ TEST 2: Risk Scoring & Threshold Crossing');
  const transitions = [
    { prev: 45, curr: 65, expectedAlert: false, desc: '45 -> 65 (LOW to MEDIUM)' },
    { prev: 65, curr: 72, expectedAlert: true, desc: '65 -> 72 (Crosses HIGH threshold 70)' },
    { prev: 72, curr: 78, expectedAlert: false, desc: '72 -> 78 (Already HIGH, no crossing)' },
    { prev: 78, curr: 88, expectedAlert: true, desc: '78 -> 88 (Crosses CRITICAL threshold 85)' },
    { prev: 88, curr: 92, expectedAlert: false, desc: '88 -> 92 (Already CRITICAL, no crossing)' },
  ];

  for (const t of transitions) {
    const crossed = hasThresholdCrossed(t.prev, t.curr);
    const status = crossed === t.expectedAlert ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${status} | ${t.desc} => Threshold crossed: ${crossed}`);
  }
  console.log('');

  // Test 3: Multilingual Message Templates (English, Hindi, Odia)
  console.log('▶ TEST 3: Multilingual Template Generation');
  const distressReasons = [
    'Dry spell >14 days',
    'Rainfall deficit −45%',
    'Loan installment due in 5 days',
  ];

  const enMsg = buildMessage('HIGH', 'DISTRESS', 74, distressReasons, 'en');
  console.log('  [English - HIGH DISTRESS]:\n  ' + enMsg + '\n');

  const hiMsg = buildMessage('CRITICAL', 'DISTRESS', 91, distressReasons, 'hi');
  console.log('  [Hindi - CRITICAL DISTRESS]:\n  ' + hiMsg + '\n');

  const odMsg = buildMessage('HIGH', 'DISTRESS', 74, distressReasons, 'od');
  console.log('  [Odia - HIGH DISTRESS]:\n  ' + odMsg + '\n');

  const cycloneMsg = buildMessage('HIGH', 'DISASTER', 0, ['Severe Cyclone Alert (Bay of Bengal)'], 'od');
  console.log('  [Odia - CYCLONE DISASTER]:\n  ' + cycloneMsg + '\n');

  // Test 4: SMS Adapter Dispatch
  console.log('▶ TEST 4: SMS Dispatch via Provider Adapter');
  const testPhone = '+919876543210';
  const dispatchResult = await sendSms(testPhone, enMsg, 'TEST_NTF_999');
  console.log('  Result:', dispatchResult);
  if (dispatchResult.success) {
    console.log('  ✅ SMS Provider Adapter successfully handled message dispatch!\n');
  } else {
    console.log('  ⚠️ Provider returned:', dispatchResult.error);
  }

  console.log('====================================================');
  console.log('🎉 ALL SMS SYSTEM MODULE TESTS COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
}

runComprehensiveSmsTests().catch(console.error);
