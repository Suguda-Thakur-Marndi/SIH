import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/**
 * POST /api/notifications/webhook — SMS Provider delivery-status callback.
 */
export async function POST(req: NextRequest) {
  let connection;
  try {
    const body = await req.json();
    
    // Parse provider-specific payload
    // MSG91: { request_id: "...", status: "2" (delivered) }
    // Twilio: { MessageSid: "...", MessageStatus: "delivered" }
    
    const messageId = body.MessageSid || body.request_id || body.message_id || body.id;
    const rawStatus = body.MessageStatus || body.status;

    if (!messageId || !rawStatus) {
       return NextResponse.json({ success: true, message: 'Missing fields ignored' });
    }

    let status = 'SENT';
    const sRawStatus = String(rawStatus).toLowerCase();
    
    if (sRawStatus === 'delivered' || sRawStatus === '2') {
      status = 'DELIVERED';
    } else if (sRawStatus === 'failed' || sRawStatus === 'undelivered' || sRawStatus === '9') {
      status = 'FAILED';
    }

    connection = await pool.getConnection();

    if (status === 'DELIVERED') {
      await connection.query(
        `UPDATE notifications SET status = 'DELIVERED', delivered_at = NOW() WHERE provider_message_id = ?`,
        [messageId]
      );
    } else if (status === 'FAILED') {
      await connection.query(
        `UPDATE notifications SET status = 'FAILED', failed_at = NOW(), last_error = ? WHERE provider_message_id = ?`,
        [body.error || body.errCode || 'Webhook reported failure', messageId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
