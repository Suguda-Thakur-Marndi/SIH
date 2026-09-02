import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { processSmsAlert } from '@/lib/notifications/service';
import { getRiskPriority } from '@/lib/notifications/rules';
import { calculateFarmerTrend } from '@/lib/trend-calculator';

/**
 * POST /api/risk/check-all
 * Scheduled job to evaluate distress risk across monitored farmers.
 * Detects both:
 *  1. Threshold crossings (LOW/MODERATE → HIGH/CRITICAL)
 *  2. Rising trends (≥ 15-point increase over 7 days, regardless of band)
 */
export async function POST(req: NextRequest) {
  // 1. Authorization check
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev_cron_secret';

  if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Fetch farmers who need risk checking
    const [farmers]: any = await connection.query(`
      SELECT id, user_id, language 
      FROM farmer_profiles
    `);

    let alertsSent = 0;
    let trendAlertsSent = 0;

    for (const farmer of farmers) {
      // Fetch the latest 2 scores for threshold-crossing detection
      const [scores]: any = await connection.query(`
        SELECT overall_score, ai_explanation, rainfall_risk, market_risk, loan_risk
        FROM risk_scores 
        WHERE farmer_id = ? 
        ORDER BY calculated_at DESC 
        LIMIT 2
      `, [farmer.user_id]);

      // Fetch the score from ~7 days ago for trend detection
      const [scores7dAgo]: any = await connection.query(`
        SELECT score AS overall_score, rainfall_risk, market_risk, loan_risk
        FROM risk_scores 
        WHERE farmer_id = ? 
          AND created_at <= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY created_at DESC 
        LIMIT 1
      `, [farmer.user_id]);

      if (scores.length > 0) {
        const currentScore = scores[0].overall_score;
        const previousScore = scores.length > 1 ? scores[1].overall_score : 0;

        const currentPriority = getRiskPriority(currentScore);
        const previousPriority = getRiskPriority(previousScore);

        // --- Existing: Threshold crossing detection ---
        // Only send if we escalated into HIGH or CRITICAL from a lower band
        if (
          (currentPriority === 'HIGH' && previousPriority !== 'HIGH' && previousPriority !== 'CRITICAL') ||
          (currentPriority === 'CRITICAL' && previousPriority !== 'CRITICAL')
        ) {

          // Parse reasons from DB if possible, otherwise use a default
          let reasons = ['Severe distress indicators detected'];
          if (scores[0].ai_explanation) {
             try {
               const expl = JSON.parse(scores[0].ai_explanation);
               if (expl && expl.factors) reasons = expl.factors;
             } catch {
               reasons = [scores[0].ai_explanation.substring(0, 50)];
             }
          }

          // Dispatch Alert
          const result = await processSmsAlert({
            farmerId: farmer.user_id, // Primary key in most joins
            type: 'DISTRESS',
            priority: currentPriority,
            score: currentScore,
            reasons,
            language: farmer.language || 'en',
            channel: 'SMS'
          });

          if (result) {
            alertsSent++;
          }
        }

        // --- New: Velocity-based rising trend detection ---
        const score7dAgo = scores7dAgo.length > 0 ? scores7dAgo[0].overall_score : null;

        const signalDeltas = (scores7dAgo.length > 0 && scores[0].rainfall_risk != null) ? {
          rainfall_delta: (scores[0].rainfall_risk || 0) - (scores7dAgo[0].rainfall_risk || 0),
          market_delta: (scores[0].market_risk || 0) - (scores7dAgo[0].market_risk || 0),
          loan_delta: (scores[0].loan_risk || 0) - (scores7dAgo[0].loan_risk || 0),
        } : undefined;

        const trend = calculateFarmerTrend(currentScore, score7dAgo, signalDeltas);

        if (trend.trending_up) {
          // Only send rising-trend alert if we didn't already send a threshold alert
          const alreadyAlerted = (
            (currentPriority === 'HIGH' && previousPriority !== 'HIGH' && previousPriority !== 'CRITICAL') ||
            (currentPriority === 'CRITICAL' && previousPriority !== 'CRITICAL')
          );

          if (!alreadyAlerted) {
            const trendReasons = [
              `Risk score rose ${trend.trend_delta_7d} points in 7 days`,
              `Primary driver: ${trend.primary_signal_change}`,
            ];

            const trendResult = await processSmsAlert({
              farmerId: farmer.user_id,
              type: 'RISING_TREND',
              priority: 'WARNING',
              score: currentScore,
              reasons: trendReasons,
              language: farmer.language || 'en',
              channel: 'SMS'
            });

            if (trendResult) {
              trendAlertsSent++;
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, alertsSent, trendAlertsSent });
  } catch (error: any) {
    console.error('Cron risk check error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}


