// Pure JS implementation to mock the SMS output for demonstration purposes

const testPhone = '8004252399';
const distressScore = 95; // CRITICAL
const priority = 'CRITICAL';
const reasons = [
  'Severe prolonged dry spell',
  'High rainfall deviation detected',
  'Critical crop stage vulnerability'
];
const language = 'en';

function buildMockMessage() {
  const alertHeader = `🚨 SMART CROP DISTRESS ALERT 🚨`;

  let body = '';
  body += `URGENT: Critical distress conditions detected for your farm.\n`;
  body += `Risk Score: ${distressScore}/100\n`;
  body += `Factors:\n`;
  reasons.forEach(r => { body += `- ${r}\n`; });
  body += `\nPlease check the Smart Crop app immediately for intervention guidelines and PMFBY insurance claims.`;

  return `${alertHeader}\n\n${body}`;
}

const message = buildMockMessage();

console.log('--- SMS DISPATCH INITIATED ---');
console.log(`To: +91${testPhone}`);
console.log(`Priority: ${priority} | Lang: ${language}`);
console.log(`Provider: MSG91 (Mock)`);
console.log(`Status: PENDING -> SENT`);
console.log('\n--- MESSAGE CONTENT ---');
console.log(message);
console.log('-----------------------------\n');
console.log('✅ SMS processing completed successfully.');
