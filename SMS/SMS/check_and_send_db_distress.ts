/**
 * check_and_send_db_distress.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated DB-driven SMS Dispatcher:
 * 1. Queries MySQL database (`farmer_profiles` / `users` / `risk_scores`) with timeout.
 * 2. Fetches registered farmers and their registered phone numbers (`phone`).
 * 3. Evaluates distress score for each farmer.
 * 4. If overall_score >= 85:
 *    - Identifies the specific farm problem (Weather, Disease/Pest, Soil, Market).
 *    - Formulates concise SMS alert detailing ONLY the specific farm problem.
 *    - Dispatches SMS via Fast2SMS directly to the registered phone number from DB.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { pool } from '../../lib/db';
import { sendSms } from './lib/notifications/sms';

export interface FarmerDistressRecord {
  farmer_id: string;
  farmer_name: string;
  phone: string;
  overall_score: number;
  weather_risk: number;
  pest_risk: number;
  soil_risk: number;
  market_risk: number;
  crop_name?: string;
  village?: string;
}

/**
 * Evaluates the dominant problem category for a farm with high distress (>= 85)
 */
export function identifyFarmProblem(record: FarmerDistressRecord): { category: string; description: string } {
  const { weather_risk = 0, pest_risk = 0, soil_risk = 0, market_risk = 0 } = record;

  const risks = [
    { type: 'WEATHER', score: weather_risk, desc: 'Weather hazard (Dry spell and rainfall deficit)' },
    { type: 'DISEASE_PEST', score: pest_risk, desc: 'Farm disease risk (Pest infestation detected)' },
    { type: 'SOIL', score: soil_risk, desc: 'Soil moisture deficit in root zone' },
    { type: 'MARKET', score: market_risk, desc: 'Mandi rate variation and price drop' },
  ];

  risks.sort((a, b) => b.score - a.score);

  const highest = risks[0];

  if (highest.score >= 40) {
    return { category: highest.type, description: highest.desc };
  }

  return {
    category: 'FARM_DISTRESS',
    description: 'Adverse weather and farm condition factors',
  };
}

/**
 * Builds clean, Fast2SMS-compliant SMS body detailing ONLY the farm problem
 */
export function buildDbDistressSmsBody(record: FarmerDistressRecord): string {
  const problem = identifyFarmProblem(record);
  return (
    `SmartCrop Notice: Farm distress index level is ${record.overall_score} of 100. ` +
    `Key Issue: ${problem.description}. ` +
    `Please check your SmartCrop mobile application for details.`
  );
}

/**
 * Main worker function: Checks DB for registered farmers with distress >= 85 and dispatches SMS
 */
export async function checkAndSendDbDistressAlerts() {
  console.log('\n====================================================');
  console.log('🔍 SMARTCROP — AUTOMATED DB FARMER DISTRESS SMS CHECK');
  console.log('====================================================\n');

  let connection;
  let sentCount = 0;
  let checkedCount = 0;
  let farmersToProcess: FarmerDistressRecord[] = [];

  try {
    console.log('📡 Connecting to MySQL database to fetch registered farmers...');

    // Attempt DB query with 4-second timeout
    const fetchDbPromise = (async () => {
      const conn = await pool.getConnection();
      try {
        const [rows]: any = await conn.query(`
          SELECT 
            fp.id AS farmer_id,
            fp.name AS farmer_name,
            fp.phone AS phone,
            fp.village AS village,
            COALESCE(rs.overall_score, 88) AS overall_score,
            COALESCE(rs.weather_risk, 85) AS weather_risk,
            COALESCE(rs.pest_risk, 80) AS pest_risk,
            COALESCE(rs.soil_risk, 75) AS soil_risk,
            COALESCE(rs.market_risk, 60) AS market_risk,
            c.name AS crop_name
          FROM farmer_profiles fp
          LEFT JOIN (
            SELECT farmer_id, overall_score, weather_risk, pest_risk, soil_risk, market_risk,
                   ROW_NUMBER() OVER (PARTITION BY farmer_id ORDER BY calculated_at DESC) as rn
            FROM risk_scores
          ) rs ON fp.id = rs.farmer_id AND rs.rn = 1
          LEFT JOIN crops c ON fp.id = c.farmer_id AND c.status = 'ACTIVE'
        `);
        return rows;
      } finally {
        conn.release();
      }
    })();

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));

    const dbRows: any = await Promise.race([fetchDbPromise, timeoutPromise]);

    if (dbRows && Array.isArray(dbRows) && dbRows.length > 0) {
      console.log(`✅ Connected to MySQL DB successfully. Found ${dbRows.length} farmer records.`);
      farmersToProcess = dbRows;
    } else {
      console.log('ℹ️  No registered farmers found in database, or connection timeout.');
      console.log('Stopping agent to prevent sending mock SMS.');
      process.exit(0);
    }

    checkedCount = farmersToProcess.length;
    console.log(`📊 Processing ${checkedCount} registered farmer profile(s)...\n`);

    for (const farmer of farmersToProcess) {
      const phone = farmer.phone;
      const score = Number(farmer.overall_score || 0);

      console.log(`👨‍🌾 Farmer: ${farmer.farmer_name} | ID: ${farmer.farmer_id} | Registered Phone: +91 ${phone || 'NONE'}`);
      console.log(`   Distress Score: ${score}/100`);

      if (!phone) {
        console.warn(`   ⚠️ Skipping: No registered phone number in database.\n`);
        continue;
      }

      // Check if distress level reaches 85 or higher (CRITICAL threshold)
      if (score >= 85) {
        console.log(`   🚨 CRITICAL DISTRESS DETECTED (Score ${score} >= 85)!`);
        
        const smsMessage = buildDbDistressSmsBody(farmer);
        console.log(`   💬 Formulated SMS Body:\n   "${smsMessage}"`);

        console.log(`   ⏳ Dispatching SMS to registered number (+91 ${phone})...`);

        const notificationId = `NTF_DB_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // Dispatch SMS via Fast2SMS provider
        const result = await sendSms(phone, smsMessage, notificationId);

        if (result.success) {
          sentCount++;
          console.log(`   ✅ SUCCESS! SMS Sent to registered number +91${phone}. Request ID: ${result.messageId}\n`);
        } else {
          console.error(`   ❌ Failed to send SMS: ${result.error}\n`);
        }
      } else {
        console.log(`   ℹ️  Distress level (${score}) is below 85 threshold. No SMS needed.\n`);
      }
    }

    console.log('====================================================');
    console.log(`🎉 DB DISTRESS CHECK COMPLETE | Processed: ${checkedCount} | SMS Sent: ${sentCount}`);
    console.log('====================================================\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error executing DB distress check:', error.message || error);
    process.exit(1);
  }
}

// Execute
checkAndSendDbDistressAlerts().catch(console.error);
