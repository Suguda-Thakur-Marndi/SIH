import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { pool } from '../lib/db';
import { sendSms, normalizePhoneNumber, maskPhoneNumber, isValidPhoneNumber } from '../lib/notifications/sms';

interface FarmerInfo {
  farmer_id: string;
  name: string;
  phone: string;
  village: string;
  district: string;
  language: string;
  crop_name: string;
  crop_stage: string;
  score: number;
  weather_risk: number;
  market_risk: number;
  loan_risk: number;
}

/**
 * Builds localized distress status message for the farmer
 */
function buildFarmerStatusSms(farmer: FarmerInfo): string {
  const lang = (farmer.language || 'en').toLowerCase().substring(0, 2);
  const crop = farmer.crop_name || 'Paddy';
  const stage = farmer.crop_stage || 'Vegetative';
  const score = farmer.score || 88;
  const name = farmer.name || 'Farmer';

  // Identify main issue
  let issue = 'Weather dry spell (Rainfall deficit)';
  let advice = 'Apply 35mm protective irrigation in evening';

  if (farmer.market_risk > farmer.weather_risk && farmer.market_risk > farmer.loan_risk) {
    issue = 'Mandi wholesale price drop below MSP';
    advice = 'Pre-book e-NWR warehouse storage space';
  } else if (farmer.loan_risk > farmer.weather_risk) {
    issue = 'KCC loan repayment due soon';
    advice = 'Check govt interest subvention scheme';
  }

  if (lang === 'or' || lang === 'od') {
    return (
      `[SmartCrop ଚେତାବନୀ] ପ୍ରିୟ ${name}, ଆପଣଙ୍କ ${crop} ଫସଲରେ ବିପଦ ସ୍ତର ${score}/100 ଅଛି। ` +
      `ମୁଖ୍ୟ ସମସ୍ୟା: ବର୍ଷା ଅଭାବ। ପରାମର୍ଶ: ୪୮ ଘଣ୍ଟା ମଧ୍ୟରେ ସିଞ୍ଚନ କରନ୍ତୁ। SmartCrop ଆପ୍ ଦେଖନ୍ତୁ।`
    );
  } else if (lang === 'hi') {
    return (
      `[SmartCrop चेतावनी] प्रिय ${name}, आपकी ${crop} फसल (${stage}) में संकट स्कोर ${score}/100 है। ` +
      `मुख्य समस्या: ${issue}। सलाह: ${advice}। SmartCrop ऐप देखें।`
    );
  } else {
    return (
      `[SmartCrop Alert] Dear ${name}, your ${crop} (${stage}) distress index is ${score}/100. ` +
      `Issue: ${issue}. Action: ${advice}. Details in SmartCrop app.`
    );
  }
}

async function sendDistressSmsToAll() {
  console.log('\n' + '='.repeat(65));
  console.log('🌾 SMARTCROP — SEND DISTRESS STATUS SMS TO ALL REGISTERED NUMBERS');
  console.log('='.repeat(65) + '\n');

  let conn;
  try {
    console.log('📡 Connecting to AWS RDS MySQL database...');
    conn = await pool.getConnection();
    console.log('✅ Connected to database: sih\n');

    // Fetch all farmers with latest distress score and crop information
    const [farmers]: any = await conn.query(`
      SELECT 
        COALESCE(f.id, fp.id, u.id) AS farmer_id,
        COALESCE(f.name, fp.name, u.name, 'Farmer') AS name,
        COALESCE(f.phone, fp.phone, '9876543210') AS phone,
        COALESCE(f.village, fp.village, 'Baripada') AS village,
        COALESCE(f.district, fp.district, 'Mayurbhanj') AS district,
        COALESCE(f.language, fp.language, 'en') AS language,
        COALESCE(c.name, 'Rice / Paddy') AS crop_name,
        COALESCE(c.stage, 'Vegetative Stage') AS crop_stage,
        COALESCE(rs.score, 88) AS score,
        COALESCE(rs.rainfall_risk, 85) AS weather_risk,
        COALESCE(rs.market_risk, 60) AS market_risk,
        COALESCE(rs.loan_risk, 45) AS loan_risk,
        COALESCE(f.sms_alerts_enabled, 1) AS sms_alerts_enabled
      FROM farmers f
      LEFT JOIN farmer_profiles fp ON f.id = fp.id OR f.id = fp.user_id
      LEFT JOIN users u ON f.id = u.id OR f.id = u.profile_id
      LEFT JOIN (
        SELECT farmer_id, score, rainfall_risk, market_risk, loan_risk,
               ROW_NUMBER() OVER (PARTITION BY farmer_id ORDER BY created_at DESC) as rn
        FROM risk_scores
      ) rs ON f.id = rs.farmer_id AND rs.rn = 1
      LEFT JOIN crops c ON f.id = c.farmer_id
      GROUP BY COALESCE(f.phone, fp.phone), COALESCE(f.id, fp.id)
    `);

    if (!farmers || farmers.length === 0) {
      console.log('ℹ️ No farmer records found in database.');
      return;
    }

    console.log(`📋 Found ${farmers.length} registered farmer record(s) in database.\n`);

    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < farmers.length; i++) {
      const f: FarmerInfo & { sms_alerts_enabled?: number } = farmers[i];
      const rawPhone = f.phone;
      const cleanPhone = normalizePhoneNumber(rawPhone);
      const masked = maskPhoneNumber(cleanPhone);

      console.log(`[${i + 1}/${farmers.length}] 👨‍🌾 ${f.name} (ID: ${f.farmer_id})`);
      console.log(`      📱 Phone: ${rawPhone} -> Normalized: +91 ${masked}`);
      console.log(`      🌱 Crop: ${f.crop_name} (${f.crop_stage}) | Village: ${f.village}`);
      console.log(`      ⚠️  Distress Score: ${f.score}/100 (Weather: ${f.weather_risk}%, Market: ${f.market_risk}%, Loan: ${f.loan_risk}%)`);

      if (f.sms_alerts_enabled === 0) {
        console.log(`      ⏭️  Skipped: Farmer has disabled SMS notifications (sms_alerts_enabled = 0)\n`);
        skippedCount++;
        continue;
      }

      if (!isValidPhoneNumber(cleanPhone)) {
        console.warn(`      ❌ Skipped: Invalid phone number format '${rawPhone}' (requires 10-digit Indian mobile)\n`);
        failedCount++;
        continue;
      }

      const smsBody = buildFarmerStatusSms(f);
      console.log(`      💬 SMS Body (${smsBody.length} chars): "${smsBody}"`);

      const notificationId = `NTF_DISTRESS_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

      // Insert PENDING notification in database audit ledger
      try {
        await conn.query(
          `INSERT INTO notifications 
           (id, user_id, farmer_id, type, category, priority, title, message, language, is_read, channel, status, created_at)
           VALUES (?, ?, ?, 'DISTRESS_ALERT', 'Risk Alert', 'critical', 'Farmer Distress Status', ?, ?, 0, 'SMS', 'PENDING', NOW())`,
          [notificationId, f.farmer_id, f.farmer_id, smsBody, f.language || 'en']
        );
      } catch (dbInsertErr: any) {
        console.warn(`      [Notice] DB audit log insert:`, dbInsertErr.message);
      }

      // Dispatch SMS
      console.log(`      🚀 Dispatching SMS...`);
      const result = await sendSms(cleanPhone, smsBody, notificationId);

      if (result.success) {
        sentCount++;
        console.log(`      ✅ SMS Sent successfully! Provider: ${result.provider || 'Fast2SMS'} | MsgID: ${result.messageId}\n`);

        // Update notification audit status
        try {
          await conn.query(
            `UPDATE notifications 
             SET status = 'SENT', provider = ?, provider_message_id = ?, sent_at = NOW()
             WHERE id = ?`,
            [result.provider || 'fast2sms', result.messageId || null, notificationId]
          );
        } catch {}
      } else {
        failedCount++;
        console.log(`      ⚠️  SMS Dispatch status: ${result.error || 'Failed'}\n`);

        // Update notification failure
        try {
          await conn.query(
            `UPDATE notifications 
             SET status = 'FAILED', provider = ?, last_error = ?, failed_at = NOW(), retry_count = retry_count + 1
             WHERE id = ?`,
            [result.provider || 'unknown', result.error || 'Dispatch failure', notificationId]
          );
        } catch {}
      }
    }

    console.log('='.repeat(65));
    console.log(`🎉 COMPLETED DISTRESS SMS BROADCAST`);
    console.log(`   • Total Farmers Evaluated: ${farmers.length}`);
    console.log(`   • SMS Successfully Dispatched: ${sentCount}`);
    console.log(`   • Skipped / Failed: ${failedCount + skippedCount}`);
    console.log('='.repeat(65) + '\n');

  } catch (err: any) {
    console.error('❌ Fatal error running distress broadcast:', err);
  } finally {
    if (conn) conn.release();
    process.exit(0);
  }
}

sendDistressSmsToAll();
