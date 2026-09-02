/**
 * ai_distress_agent.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * AI-Driven Automated SMS Dispatcher:
 * 1. Connects to MySQL Database.
 * 2. Fetches registered farmers and their registered phone numbers.
 * 3. Evaluates distress score for each farmer.
 * 4. If overall_score >= 85 (CRITICAL):
 *    - Sends farm distress data to Gemini AI API.
 *    - Gemini AI formulates a tailored, concise SMS alert explaining the specific
 *      problem (weather, disease, soil, market).
 *    - Dispatches AI-generated SMS via Fast2SMS directly to the registered DB number.
 *    - Logs dispatch to MySQL `notifications` table.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import dotenv from 'dotenv';
import path from 'path';

let currentDir = process.cwd();
try {
  if (typeof __dirname !== 'undefined') {
    currentDir = __dirname;
  }
} catch (e) {}

const envPaths = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '../../.env.local'),
  path.resolve(currentDir, '../../.env.local'),
  path.resolve(currentDir, '../../../.env.local'),
];
for (const p of envPaths) {
  const result = dotenv.config({ path: p });
  if (!result.error) break;
}

import { pool } from '../../lib/db';
import { sendSms } from './lib/notifications/sms';

let callGeminiApiFn: any = null;
async function getGeminiApi() {
  if (callGeminiApiFn) return callGeminiApiFn;
  try {
    const gemini = await import('../../lib/gemini').catch(() => null);
    callGeminiApiFn = gemini?.callGeminiApi;
  } catch (e) {
    // Standalone fallback
  }
  return callGeminiApiFn;
}

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
 * Uses Gemini AI to formulate the SMS message based on the farm's specific problems.
 */
async function generateAiSmsContent(record: FarmerDistressRecord): Promise<string> {
  const callGeminiApi = await getGeminiApi();
  if (!callGeminiApi) {
    return `SmartCrop Notice: Farm distress index level is ${record.overall_score} of 100. Please check your SmartCrop app for advisory.`;
  }

  const systemPrompt = `You are the SmartCrop AI Notification Engine. Your job is to draft a very concise SMS alert (max 160 characters) for a farmer experiencing high farm distress.
Rules:
1. Start with "SmartCrop Notice:"
2. Mention the overall distress score.
3. Identify the primary problem based on the provided risk scores (e.g. if weather risk is highest, mention drought/weather. If pest risk is highest, mention disease/pest. If market risk is highest, mention market/mandi prices).
4. Do NOT use words like "CRITICAL ALERT", "loan overdue", "urgent action needed", or spammy keywords (to avoid SMS spam filters).
5. End by telling them to check the SmartCrop app.
6. Keep it under 160 characters. Return ONLY the raw SMS text, no markdown.`;

  const userPrompt = `
Farmer: ${record.farmer_name}
Crop: ${record.crop_name || 'N/A'}
Overall Distress Score: ${record.overall_score}/100
Weather Risk: ${record.weather_risk}
Disease/Pest Risk: ${record.pest_risk}
Soil Moisture Risk: ${record.soil_risk}
Market Risk: ${record.market_risk}
`;

  try {
    const aiMessage = await callGeminiApi({
      systemPrompt,
      userPrompt,
      responseJson: false,
    });
    
    // Clean up response if needed
    let cleaned = aiMessage.trim().replace(/^"|"$/g, '');
    if (!cleaned) throw new Error("Empty AI response");
    return cleaned;
  } catch (error) {
    console.error(`   ⚠️ AI Generation Failed, using fallback. Error:`, error);
    return `SmartCrop Notice: Farm distress index level is ${record.overall_score} of 100. High risk detected. Please check your SmartCrop mobile application for details.`;
  }
}

/**
 * Main worker function: Checks DB for registered farmers with distress >= 85 and dispatches AI SMS
 */
export async function runAiDistressAgent() {
  console.log('\n====================================================');
  console.log('🤖 SMARTCROP — AI-DRIVEN DB FARMER DISTRESS SMS AGENT');
  console.log('====================================================\n');

  let connection;
  let sentCount = 0;
  let checkedCount = 0;

  try {
    console.log('📡 Connecting to MySQL database to fetch registered farmers...');

    const fetchDbPromise = (async () => {
      const conn = await pool.getConnection();
      try {
        const [farmers]: any = await conn.query(`
          SELECT 
            fp.id AS farmer_id,
            fp.name AS farmer_name,
            fp.phone AS phone,
            fp.village AS village,
            rs.overall_score,
            rs.weather_risk,
            rs.pest_risk,
            rs.soil_risk,
            rs.market_risk,
            c.name AS crop_name
          FROM farmer_profiles fp
          LEFT JOIN (
            SELECT farmer_id, overall_score, weather_risk, pest_risk, soil_risk, market_risk,
                   ROW_NUMBER() OVER (PARTITION BY farmer_id ORDER BY calculated_at DESC) as rn
            FROM risk_scores
          ) rs ON fp.id = rs.farmer_id AND rs.rn = 1
          LEFT JOIN crops c ON fp.id = c.farmer_id AND c.status = 'ACTIVE'
        `);
        
        // Fetch Agriculture Officers
        const [officers]: any = await conn.query(`
          SELECT id, name, phone 
          FROM users 
          WHERE role = 'administrator' AND account_status = 'active' AND phone IS NOT NULL
        `);

        return { farmers, officers };
      } finally {
        conn.release();
      }
    })();

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
    const dbResult: any = await Promise.race([fetchDbPromise, timeoutPromise]);

    if (!dbResult || !dbResult.farmers || dbResult.farmers.length === 0) {
      console.log('❌ Error: Could not load registered farmers from Database. (Connection timeout or empty table)');
      console.log('Stopping agent to prevent sending mock SMS.');
      process.exit(1);
    }

    const dbRows = dbResult.farmers;
    const adminOfficers = dbResult.officers || [];
    
    checkedCount = dbRows.length;
    console.log(`✅ Connected to MySQL DB successfully.`);
    console.log(`   Found ${checkedCount} registered farmer profile(s).`);
    console.log(`   Found ${adminOfficers.length} registered Agriculture Officer(s).\n`);

    for (const farmer of dbRows) {
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
        console.log(`   🧠 Calling Gemini AI to analyze problem and draft SMS...`);
        
        const smsMessage = await generateAiSmsContent(farmer);
        console.log(`   💬 AI Formulated SMS Body:\n   "${smsMessage}"`);

        console.log(`   ⏳ Dispatching SMS to registered number (+91 ${phone})...`);

        const notificationId = `NTF_AI_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // Dispatch SMS via Fast2SMS provider to Farmer
        const result = await sendSms(phone, smsMessage, notificationId);

        if (result.success) {
          sentCount++;
          console.log(`   ✅ SUCCESS! SMS Sent to Farmer +91${phone}. Request ID: ${result.messageId}\n`);

          // Log in DB notifications table
          try {
            await pool.query(
              `INSERT INTO notifications (
                id, user_id, farmer_id, type, category, priority, title, message, 
                channel, status, risk_score, provider, provider_message_id, sent_at, created_at
              ) VALUES (?, ?, ?, 'DISTRESS', 'ALERT', 'CRITICAL', 'AI Farm Distress Alert', ?, 'SMS', 'SENT', ?, 'FAST2SMS', ?, NOW(), NOW())`,
              [notificationId, farmer.farmer_id, farmer.farmer_id, smsMessage, score, result.messageId || null]
            );
          } catch (dbErr: any) {}
        } else {
          console.error(`   ❌ Failed to send SMS to Farmer: ${result.error}\n`);
        }

        // Broadast to Agriculture Officers
        if (adminOfficers.length > 0) {
          console.log(`   🚨 Escalating to ${adminOfficers.length} Agriculture Officer(s)...`);
          
          // Formulate specific Officer SMS
          // Example: "SmartCrop Officer Alert: Farmer Ramesh in Baripada reported critical distress (Score 88). Issue: Weather risk (Drought). Contact: +91 9876543210"
          
          // Identify the primary issue from the AI message or score logic
          let issueCategory = "Farm Distress";
          if (farmer.weather_risk > farmer.pest_risk && farmer.weather_risk > farmer.market_risk) issueCategory = "Weather/Drought";
          else if (farmer.pest_risk > farmer.weather_risk && farmer.pest_risk > farmer.market_risk) issueCategory = "Pest/Disease";
          else if (farmer.market_risk > farmer.weather_risk && farmer.market_risk > farmer.pest_risk) issueCategory = "Market Volatility";
          
          const officerSmsMessage = `SmartCrop Officer Alert: Farmer ${farmer.farmer_name} in ${farmer.village || 'your district'} has critical distress (Score ${score}). Issue: ${issueCategory}. Contact: +91${phone}`;

          for (const officer of adminOfficers) {
            console.log(`      -> Sending alert to Officer ${officer.name} (+91${officer.phone})`);
            const offResult = await sendSms(officer.phone, officerSmsMessage, `NTF_OFF_${Date.now()}`);
            if (offResult.success) {
              sentCount++;
              console.log(`         ✅ Officer Alert Sent! Request ID: ${offResult.messageId}`);
            } else {
              console.error(`         ❌ Failed to send Officer Alert: ${offResult.error}`);
            }
          }
          console.log(""); // Spacing
        }
      } else {
        console.log(`   ℹ️  Distress level (${score}) is below 85 threshold. No SMS needed.\n`);
      }
    }

    console.log('====================================================');
    console.log(`🎉 AI DB DISTRESS CHECK COMPLETE | Checked: ${checkedCount} | SMS Sent: ${sentCount}`);
    console.log('====================================================\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error executing AI distress check:', error.message || error);
    process.exit(1);
  }
}

// Execute
runAiDistressAgent().catch(console.error);
