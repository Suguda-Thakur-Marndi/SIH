import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { processSmsAlert } from '@/lib/notifications/service';

/**
 * POST /api/disaster/check — Process regional disaster warnings & trigger immediate SMS alerts
 * PRD §13 & §15
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev_cron_secret';

  if (
    authHeader !== `Bearer ${cronSecret}` &&
    process.env.NODE_ENV === 'production' &&
    !req.cookies.get('smartcrop_token')
  ) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let connection;
  try {
    const body = await req.json();
    const {
      district,
      state,
      disasterType = 'CYCLONE',
      severity = 'HIGH',
      description,
      eventId = `DIS_${Date.now()}`,
    } = body;

    if (!district && !state) {
      return NextResponse.json(
        { success: false, error: 'District or state is required' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Query farmers in the affected region
    let query = `
      SELECT id, user_id, phone, language, district, state 
      FROM farmer_profiles 
      WHERE 1=1
    `;
    const queryParams: any[] = [];

    if (district) {
      query += ` AND (LOWER(district) = LOWER(?) OR LOWER(location) LIKE LOWER(?))`;
      queryParams.push(district, `%${district}%`);
    } else if (state) {
      query += ` AND LOWER(state) = LOWER(?)`;
      queryParams.push(state);
    }

    const [farmers]: any = await connection.query(query, queryParams);

    let alertsDispatched = 0;
    const warningReason = description || `${disasterType} warning issued for ${district || state}`;

    for (const farmer of farmers) {
      const farmerUserId = farmer.user_id || farmer.id;

      const result = await processSmsAlert({
        farmerId: farmerUserId,
        type: 'DISASTER',
        priority: (severity.toUpperCase() === 'CRITICAL' ? 'CRITICAL' : 'HIGH') as any,
        reasons: [warningReason],
        language: farmer.language || 'en',
        channel: 'SMS',
        eventId,
      });

      if (result && result.success) {
        alertsDispatched++;
      }
    }

    return NextResponse.json({
      success: true,
      affectedFarmersCount: farmers.length,
      alertsDispatched,
      eventId,
    });
  } catch (error: any) {
    console.error('[Disaster Alert Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
