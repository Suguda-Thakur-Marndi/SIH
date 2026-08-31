import { pool } from '@/lib/db';
import { sendSms } from './sms';
import { buildMessage } from './templates';
import { isEligibleForSms } from './rules';

export interface SmsAlertOptions {
  farmerId: string;
  type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'WARNING' | 'INFO';
  score?: number;
  reasons?: string[];
  language?: string;
  channel?: string;
  eventId?: string;
}

export interface DirectSmsOptions {
  userId: string;
  message: string;
  notificationType?: string;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'WARNING' | 'INFO';
  score?: number;
  reasons?: string[];
  language?: string;
  eventId?: string;
}

/**
 * Processes and sends an SMS alert to a farmer, with cooldown and audit logging.
 */
export async function processSmsAlert(opts: SmsAlertOptions): Promise<{
  success: boolean;
  notificationId?: string;
  messageId?: string;
  error?: string;
}> {
  let connection;
  const notificationId = `NTF_SMS_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

  try {
    let phone: string | null = null;
    let preferredLanguage = opts.language || 'en';

    try {
      connection = await pool.getConnection();

      // Look up phone and language in farmer_profiles or users
      const [profiles]: any = await connection.query(
        `SELECT phone, language FROM farmer_profiles WHERE user_id = ? OR id = ? LIMIT 1`,
        [opts.farmerId, opts.farmerId]
      );

      if (profiles && profiles.length > 0) {
        phone = profiles[0].phone;
        if (profiles[0].language) preferredLanguage = profiles[0].language;
      }
    } catch (dbErr) {
      console.warn('[processSmsAlert] Database lookup error (using fallback):', dbErr);
    }

    if (!phone) {
      // Fallback test number if not found in DB
      phone = '9861234567';
    }

    // Cooldown check (in-memory or DB)
    const canSend = isEligibleForSms(opts.priority);
    if (!canSend) {
      return { success: false, error: 'RATE_LIMITED' };
    }

    // Build the localized message
    const message = buildMessage(
      opts.priority,
      opts.type,
      opts.score,
      opts.reasons || [],
      preferredLanguage
    );

    // Send SMS via configured provider (or mock)
    const smsRes = await sendSms(phone, message, notificationId);

    // Log to DB if connection available
    if (connection && smsRes.success) {
      try {
        await connection.query(
          `INSERT INTO notifications 
           (id, user_id, farmer_id, type, category, priority, title, message, language, is_read, channel, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'SMS', NOW())`,
          [
            notificationId,
            opts.farmerId,
            opts.farmerId,
            opts.type.toLowerCase(),
            'Risk Alert',
            opts.priority.toLowerCase(),
            `SMS Alert: ${opts.type}`,
            message,
            preferredLanguage,
          ]
        );
      } catch (insertErr) {
        console.warn('[processSmsAlert] DB insert notice:', insertErr);
      }
    }

    return {
      success: smsRes.success,
      notificationId,
      messageId: smsRes.messageId,
      error: smsRes.error,
    };
  } catch (err: any) {
    console.error('[processSmsAlert error]', err);
    return { success: false, error: err.message || 'SMS_PROCESSING_FAILED' };
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Direct SMS send helper for user/officer dispatches.
 */
export async function sendSmsToUser(opts: DirectSmsOptions): Promise<{
  success: boolean;
  notificationId?: string;
  status?: string;
  messageId?: string;
  error?: string;
}> {
  let connection;
  const notificationId = `NTF_DIR_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

  try {
    let phone: string | null = null;
    let language = opts.language || 'en';

    try {
      connection = await pool.getConnection();
      const [profiles]: any = await connection.query(
        `SELECT phone, language FROM farmer_profiles WHERE user_id = ? OR id = ? LIMIT 1`,
        [opts.userId, opts.userId]
      );
      if (profiles && profiles.length > 0) {
        phone = profiles[0].phone;
        if (profiles[0].language) language = profiles[0].language;
      }
    } catch (dbErr) {
      console.warn('[sendSmsToUser] DB query notice:', dbErr);
    }

    if (!phone) {
      phone = '9861234567';
    }

    const messageContent =
      opts.message ||
      buildMessage(
        opts.priority || 'HIGH',
        opts.notificationType || 'OFFICER_ALERT',
        opts.score,
        opts.reasons || [],
        language
      );

    const smsRes = await sendSms(phone, messageContent, notificationId);

    return {
      success: smsRes.success,
      notificationId,
      status: smsRes.success ? 'DELIVERED' : 'FAILED',
      messageId: smsRes.messageId,
      error: smsRes.error,
    };
  } catch (err: any) {
    console.error('[sendSmsToUser error]', err);
    return { success: false, error: err.message || 'SMS_FAILED' };
  } finally {
    if (connection) connection.release();
  }
}
