import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { runFarmerPipeline } from '@/lib/automation/orchestrator';

/**
 * POST /api/risk/check-all
 * Scheduled job to evaluate distress risk across monitored farmers.
 * Delegates to the unified 7-step orchestrator pipeline (AUTOMATED_LOCATION_TO_SMS_PIPELINE.md).
 */
export async function POST(req: NextRequest) {
  // 1. Authorization check
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev_cron_secret';
  const customKey = req.headers.get('x-automation-key') || '';
  const automationSecret = process.env.AUTOMATION_SECRET;

  const isAuthorized =
    authHeader === `Bearer ${cronSecret}` ||
    (automationSecret && customKey === automationSecret) ||
    process.env.NODE_ENV !== 'production';

  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Fetch farmers who need risk checking
    const [farmers]: any = await connection.query(`
      SELECT id as farmer_id 
      FROM farmers 
      WHERE COALESCE(sms_alerts_enabled, 1) = 1
    `).catch(async () => {
      return pool.query(`SELECT COALESCE(user_id, id) as farmer_id FROM farmer_profiles`);
    });

    const results = [];
    let alertsSent = 0;

    for (const farmer of farmers || []) {
      const fid = farmer.farmer_id || farmer.id;
      try {
        const pipeResult = await runFarmerPipeline(fid);
        results.push(pipeResult);
        if (pipeResult.smsQueued) alertsSent++;
      } catch (pipeErr: any) {
        console.error(`[check-all] Pipeline error for farmer ${fid}:`, pipeErr.message);
        results.push({ farmerId: fid, error: pipeErr.message });
      }
    }

    return NextResponse.json({
      success: true,
      totalChecked: results.length,
      alertsSent,
      results,
    });
  } catch (error: any) {
    console.error('Cron risk check error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
