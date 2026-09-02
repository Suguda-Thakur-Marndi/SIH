import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { pool } from '../../lib/db';
import { sendSms } from './lib/notifications/sms';

async function checkAndSendToOfficer() {
  console.log('\n====================================================');
  console.log('🔍 SMARTCROP — CHECKING OFFICER REGISTRATION IN DB');
  console.log('====================================================\n');

  try {
    const conn = await pool.getConnection();
    try {
      console.log('📡 Connecting to MySQL database...');

      // Search by name for Shubham Prakash in users table
      const [rows]: any = await conn.query(`
        SELECT u.id, u.name, u.email, u.role, f.phone
        FROM users u
        LEFT JOIN farmers f ON (u.profile_id = f.id OR u.id = f.id)
        WHERE u.name LIKE '%Shubham%' OR u.name LIKE '%Prakash%'
        LIMIT 5
      `);

      if (!rows || rows.length === 0) {
        console.log('❌ No user found with name "Shubham Prakash" in the database.');
        console.log('   Please double-check the registration was completed successfully.');
        process.exit(0);
      }

      console.log(`✅ Found ${rows.length} matching user(s) in DB:\n`);
      for (const user of rows) {
        console.log(`   👤 Name:   ${user.name}`);
        console.log(`   📱 Phone:  ${user.phone || 'NOT REGISTERED'}`);
        console.log(`   📧 Email:  ${user.email}`);
        console.log(`   🎖️  Role:   ${user.role}`);
        console.log(`   ✅ Status: ${user.account_status}`);
        console.log('');

        if (!user.phone) {
          console.log('   ⚠️  No phone number registered. Cannot send SMS.');
          continue;
        }

        // Send welcome/registration confirmation SMS
        const smsBody = `SmartCrop: Welcome ${user.name}! You have been registered as an Agriculture Officer on SmartCrop. You will receive farm distress alerts for farmers in your district.`;

        console.log(`   📲 Sending confirmation SMS to +91${user.phone}...`);
        const result = await sendSms(user.phone, smsBody, `NTF_OFFICER_REG_${Date.now()}`);

        if (result.success) {
          console.log(`   ✅ SMS SENT SUCCESSFULLY to +91${user.phone}! Request ID: ${result.messageId}`);
        } else {
          console.error(`   ❌ Failed to send SMS: ${result.error}`);
        }
      }
    } finally {
      conn.release();
    }

    console.log('\n====================================================');
    console.log('✅ DB Check Complete');
    console.log('====================================================\n');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Database connection error:', err.message || err);
    process.exit(1);
  }
}

checkAndSendToOfficer();
