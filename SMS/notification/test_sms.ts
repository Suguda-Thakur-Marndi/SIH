import { buildMessage } from './lib/notifications/templates';
import { sendSms } from './lib/notifications/sms';
import { getRiskPriority } from './lib/notifications/rules';

async function mockSmsTest() {
  console.log('--- Starting Mock SMS Notification Test ---');
  
  // 1. Mock Data Setup (as requested by user)
  const testPhone = '8004252399';
  const distressScore = 92; // High enough to trigger a CRITICAL distress SMS
  const priority = getRiskPriority(distressScore); // Expected: CRITICAL
  
  const reasons = [
    'Prolonged dry spell over the past 14 days',
    'Predicted 45% rainfall deficit',
    'High vulnerability for current crop stage'
  ];
  
  console.log(`Farmer Phone: ${testPhone}`);
  console.log(`Calculated Distress Score: ${distressScore}/100`);
  console.log(`Evaluated Priority: ${priority}`);
  console.log(`Risk Factors: \n  - ${reasons.join('\n  - ')}`);
  
  // 2. Generate SMS Content
  const messageContent = buildMessage(
    priority,
    'DISTRESS',
    distressScore,
    reasons,
    'en' // English
  );
  
  console.log('\n--- Generated SMS Message ---');
  console.log(messageContent);
  console.log('-----------------------------\n');
  
  // 3. Send SMS via Adapter (using MOCK provider configured in .env.local)
  const result = await sendSms(testPhone, messageContent, 'MOCK_TEST_001');
  
  if (result.success) {
    console.log('✅ SMS successfully queued/sent!');
    console.log(`Message ID: ${result.messageId}`);
  } else {
    console.error('❌ Failed to send SMS:', result.error);
  }
}

// Ensure .env is loaded if running directly via ts-node, but we'll mock it for safety
process.env.SMS_PROVIDER = 'mock'; // explicitly force mock for local test

mockSmsTest().catch(console.error);
