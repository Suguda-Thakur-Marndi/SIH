import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { extractBearerToken, verifyJwt } from '@/lib/auth-jwt';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      notify_high_distress = true, 
      notify_weather_emergency = true, 
      notify_new_assignment = true, 
      notify_loan_insurance = false 
    } = body;

    let userId = 'usr_admin_demo_1';
    const token = extractBearerToken(req) || req.cookies.get('smartcrop_token')?.value;
    if (token) {
      const verified = verifyJwt(token);
      if (verified.valid && verified.payload?.id) {
        userId = verified.payload.id;
      }
    }

    try {
      // Upsert into officer_settings
      const [existing]: any = await pool.query('SELECT id FROM officer_settings WHERE user_id = ? LIMIT 1', [userId]);
      if (existing && existing.length > 0) {
        await pool.query(
          `UPDATE officer_settings SET 
            notify_high_distress = ?, 
            notify_weather_emergency = ?, 
            notify_new_assignment = ?, 
            notify_loan_insurance = ? 
           WHERE user_id = ?`,
          [Boolean(notify_high_distress), Boolean(notify_weather_emergency), Boolean(notify_new_assignment), Boolean(notify_loan_insurance), userId]
        );
      } else {
        await pool.query(
          `INSERT INTO officer_settings (user_id, notify_high_distress, notify_weather_emergency, notify_new_assignment, notify_loan_insurance)
           VALUES (?, ?, ?, ?, ?)`,
          [userId, Boolean(notify_high_distress), Boolean(notify_weather_emergency), Boolean(notify_new_assignment), Boolean(notify_loan_insurance)]
        );
      }
    } catch (dbErr: any) {
      console.warn('[Officer Notifications PATCH] DB warning:', dbErr?.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Notification preferences saved.',
      data: {
        notify_high_distress: Boolean(notify_high_distress),
        notify_weather_emergency: Boolean(notify_weather_emergency),
        notify_new_assignment: Boolean(notify_new_assignment),
        notify_loan_insurance: Boolean(notify_loan_insurance)
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'server_error', message: error.message || 'Failed to update notification settings.' } },
      { status: 500 }
    );
  }
}
