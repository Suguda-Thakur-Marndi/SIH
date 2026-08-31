import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { processSmsAlert } from '@/lib/notifications/service';
import { getRiskPriority } from '@/lib/notifications/rules';

/**
 * POST /api/risk/check-all
 * Scheduled job to evaluate distress risk across monitored farmers.
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

    for (const farmer of farmers) {
      // In a real app, we'd invoke the AI risk engine here to calculate a new score.
      // For this MVP, we fetch the latest scores to detect if a threshold was crossed.

      const [scores]: any = await connection.query(`
        SELECT overall_score, ai_explanation 
        FROM risk_scores 
        WHERE farmer_id = ? 
        ORDER BY calculated_at DESC 
        LIMIT 2
      `, [farmer.user_id]);

      if (scores.length > 0) {
        const currentScore = scores[0].overall_score;
        const previousScore = scores.length > 1 ? scores[1].overall_score : 0;

        const currentPriority = getRiskPriority(currentScore);
        const previousPriority = getRiskPriority(previousScore);

        // Threshold crossing detection: 
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
      }
    }

    return NextResponse.json({ success: true, alertsSent });
  } catch (error: any) {
    console.error('Cron risk check error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
