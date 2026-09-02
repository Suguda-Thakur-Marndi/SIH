import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/**
 * API endpoint to check whether a farmer with a given name exists in the database.
 * If the farmer exists, an alert notification is inserted into the `notifications`
 * table and a success response is returned.
 *
 * Expected request:
 *   GET /api/farmer/check-name?name=Sai
 *   (or POST with JSON body `{ "name": "Sai" }`)
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const name = (url.searchParams.get('name') || '').trim();
  if (!name) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: 'Query parameter "name" is required.' } },
      { status: 400 }
    );
  }
  const connection = await pool.getConnection();
  try {
    // Search for exact name (case‑insensitive) in the farmers table
    const [rows]: any = await connection.query(
      `SELECT id, name FROM farmers WHERE LOWER(name) = LOWER(?) LIMIT 1;`,
      [name]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ found: false }, { status: 200 });
    }
    const farmer = rows[0];
    // Insert an alert notification for the found farmer
    const notifId = `NTF_${Date.now().toString().slice(-8)}`;
    await connection.query(
      `INSERT INTO notifications (id, user_id, farmer_id, type, priority, title, message, action_label, action_url)
       VALUES (?, ?, ?, 'alert', 'high', 'Farmer Found', CONCAT('Farmer ', ?, ' is registered in the system.'), 'View Profile', '/farmer/', ?);`,
      [notifId, farmer.id, farmer.id, farmer.name, farmer.id]
    );
    return NextResponse.json({ found: true, farmerId: farmer.id, notificationId: notifId }, { status: 200 });
  } catch (err: any) {
    console.error('[Check Name Route Error]:', err);
    return NextResponse.json(
      { error: { code: 'server_error', message: err.message || 'Internal server error.' } },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// Allow POST with JSON body as an alternative entry point
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body?.name || '').trim();
    if (!name) {
      return NextResponse.json(
        { error: { code: 'validation_error', message: '"name" is required in request body.' } },
        { status: 400 }
      );
    }
    // Re‑use the GET logic by delegating to an internal helper
    return await GET(new NextRequest(`${req.url.split('?')[0]}?name=${encodeURIComponent(name)}`));
  } catch (e: any) {
    console.error('[Check Name POST Error]:', e);
    return NextResponse.json(
      { error: { code: 'server_error', message: e.message || 'Invalid JSON body.' } },
      { status: 500 }
    );
  }
}
