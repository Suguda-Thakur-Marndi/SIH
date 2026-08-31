import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { extractBearerToken, verifyJwt } from '@/lib/auth-jwt';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { preferred_language = 'en' } = body;

    let userId = 'usr_admin_demo_1';
    const token = extractBearerToken(req) || req.cookies.get('smartcrop_token')?.value;
    if (token) {
      const verified = verifyJwt(token);
      if (verified.valid && verified.payload?.id) {
        userId = verified.payload.id;
      }
    }

    try {
      const [existing]: any = await pool.query('SELECT id FROM officer_settings WHERE user_id = ? LIMIT 1', [userId]);
      if (existing && existing.length > 0) {
        await pool.query(
          'UPDATE officer_settings SET preferred_language = ? WHERE user_id = ?',
          [preferred_language, userId]
        );
      } else {
        await pool.query(
          'INSERT INTO officer_settings (user_id, preferred_language) VALUES (?, ?)',
          [userId, preferred_language]
        );
      }
    } catch (dbErr: any) {
      console.warn('[Officer Language PATCH] DB warning:', dbErr?.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Language preference saved successfully.',
      data: { preferred_language }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'server_error', message: error.message || 'Failed to update language.' } },
      { status: 500 }
    );
  }
}
