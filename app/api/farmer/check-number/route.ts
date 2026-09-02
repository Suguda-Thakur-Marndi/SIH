import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/**
 * API endpoint to verify whether a given mobile number is stored in the
 * AWS RDS `farmers` table.
 *
 * GET /api/farmer/check-number?phone=9876543210
 * POST { "phone": "9876543210" }
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const phone = (url.searchParams.get('phone') || '').trim();
  if (!phone) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: 'Query parameter "phone" is required.' } },
      { status: 400 }
    );
  }
  const connection = await pool.getConnection();
  try {
    const [rows]: any = await connection.query(
      `SELECT id FROM farmers WHERE phone = ? LIMIT 1;`,
      [phone]
    );
    const found = rows && rows.length > 0;
    return NextResponse.json({ found }, { status: 200 });
  } catch (err: any) {
    console.error('[Check Number Route Error]:', err);
    return NextResponse.json(
      { error: { code: 'server_error', message: err.message || 'Internal server error.' } },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// POST version – allows JSON body { "phone": "..." }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = (body?.phone || '').trim();
    if (!phone) {
      return NextResponse.json(
        { error: { code: 'validation_error', message: '"phone" field is required in request body.' } },
        { status: 400 }
      );
    }
    // Re‑use GET logic by delegating to a new request object
    return await GET(new NextRequest(`${req.url.split('?')[0]}?phone=${encodeURIComponent(phone)}`));
  } catch (e: any) {
    console.error('[Check Number POST Error]:', e);
    return NextResponse.json(
      { error: { code: 'server_error', message: e.message || 'Invalid JSON body.' } },
      { status: 500 }
    );
  }
}
