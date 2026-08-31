import { NextRequest, NextResponse } from 'next/server';
import { sendSmsToUser } from '@/SMS/SMS/lib/notifications/service';

/**
 * POST /api/notifications/sms — Direct, protected SMS triggering endpoint
 * Conforms to PRD §13 & §14
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'dev_cron_secret';

    // Verify authorized caller (cron secret or bearer token)
    const isAuthorized =
      authHeader === `Bearer ${cronSecret}` ||
      process.env.NODE_ENV !== 'production' ||
      req.cookies.get('smartcrop_token');

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED_SMS_CALL' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      userId,
      farmerId,
      message,
      notificationType = 'SYSTEM_ALERT',
      priority = 'HIGH',
      language = 'en',
      score,
      reasons = [],
      eventId,
    } = body;

    const targetUserId = userId || farmerId;

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!message && !notificationType) {
      return NextResponse.json(
        { success: false, error: 'MISSING_MESSAGE_OR_TYPE' },
        { status: 400 }
      );
    }

    const result = await sendSmsToUser({
      userId: targetUserId,
      message: message || '',
      notificationType,
      priority: priority.toUpperCase() as any,
      score,
      reasons,
      language,
      eventId,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'SMS_SEND_FAILED',
          notificationId: result.notificationId,
          status: result.status,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        notificationId: result.notificationId,
        status: result.status,
        messageId: result.messageId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API /api/notifications/sms Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
