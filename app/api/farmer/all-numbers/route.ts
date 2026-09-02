import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/**
 * GET /api/farmer/all-numbers
 * Returns an array of all mobile numbers (phone) stored for farmers.
 */
export async function GET(_req: NextRequest) {
  const connection = await pool.getConnection();
  try {
    const [rows]: any = await connection.query(
      `SELECT phone FROM farmers WHERE phone IS NOT NULL;`
    );
    const numbers = rows.map((r: any) => r.phone);
    return NextResponse.json({ numbers }, { status: 200 });
  } catch (err: any) {
    console.error('[All Numbers Route Error]:', err);
    return NextResponse.json(
      { error: { code: 'server_error', message: err.message || 'Unable to fetch numbers.' } },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
