import { pool } from '@/lib/db';
import { sendSms, normalizePhoneNumber, maskPhoneNumber } from './sms';
import { buildMessage } from './templates';
import { isEligibleForSms } from './rules';
import { Priority, NotificationStatus, NotificationType } from './types';

export interface SmsAlertOptions {
  farmerId: string;
  type: NotificationType;
  priority: Priority;
  score?: number;
  reasons?: string[];
  language?: string;
  channel?: string;
  eventId?: string;
}

export interface DirectSmsOptions {
  userId: string;
  message: string;
  notificationType?: NotificationType;
  priority?: Priority;
  score?: number;
  reasons?: string[];
  language?: string;
  eventId?: string;
}

/**
 * Processes and sends an SMS alert to a farmer, with:
 * - `sms_alerts_enabled` check (hard opt-out)
 * - Rate limiting / cooldown check
 * - Full audit trail in `notifications` table (status: PENDING -> SENT / FAILED)
 * - Provider tracking (fast2sms / msg91)
 */
export async function processSmsAlert(opts: SmsAlertOptions): Promise<{
  success: boolean;
  notificationId?: string;
  provider?: string;
  status?: NotificationStatus;
  messageId?: string;
  error?: string;
}> {
  let connection;
  const notificationId = `NTF_SMS_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

  try {
    let phone: string | null = null;
    let preferredLanguage = opts.language || 'en';
    let smsAlertsEnabled = 1;

    try {
      connection = await pool.getConnection();

      // 1. First look up directly in `farmers` table (anchor record per DB spec)
      const [farmers]: any = await connection.query(
        `SELECT id, phone, language, sms_alerts_enabled FROM farmers WHERE id = ? OR phone = ? LIMIT 1`,
        [opts.farmerId, opts.farmerId]
      );

      if (farmers && farmers.length > 0) {
        phone = farmers[0].phone;
        if (farmers[0].language) preferredLanguage = farmers[0].language;
        if (farmers[0].sms_alerts_enabled !== undefined && farmers[0].sms_alerts_enabled !== null) {
          smsAlertsEnabled = Number(farmers[0].sms_alerts_enabled);
        }
      } else {
        // Fallback to farmer_profiles or users
        const [profiles]: any = await connection.query(
          `SELECT phone, language FROM farmer_profiles WHERE user_id = ? OR id = ? LIMIT 1`,
          [opts.farmerId, opts.farmerId]
        );

        if (profiles && profiles.length > 0) {
          phone = profiles[0].phone;
          if (profiles[0].language) preferredLanguage = profiles[0].language;
        }
      }
    } catch (dbErr) {
      console.warn('[processSmsAlert] Database lookup notice:', dbErr);
    }

    // Hard opt-out kill switch check
    if (smsAlertsEnabled === 0) {
      console.log(`[processSmsAlert] Farmer ${opts.farmerId} has sms_alerts_enabled=0. SMS skipped.`);
      return { success: false, error: 'SMS_ALERTS_DISABLED' };
    }

    if (!phone) {
      phone = '9861234567'; // Default fallback development number
    }

    // Cooldown check
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

    // Initial audit log: INSERT as PENDING
    if (connection) {
      try {
        await connection.query(
          `INSERT INTO notifications 
           (id, user_id, farmer_id, type, category, priority, title, message, language, is_read, channel, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'SMS', 'PENDING', NOW())`,
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
        console.warn('[processSmsAlert] Pre-send DB insert notice:', insertErr);
      }
    }

    // Dispatch SMS via configured provider (Fast2SMS primary, MSG91 fallback)
    const smsRes = await sendSms(phone, message, notificationId);

    // Update audit record with result
    if (connection) {
      try {
        if (smsRes.success) {
          await connection.query(
            `UPDATE notifications 
             SET status = 'SENT',
                 provider = ?,
                 provider_message_id = ?,
                 sent_at = NOW()
             WHERE id = ?`,
            [smsRes.provider || 'fast2sms', smsRes.messageId || null, notificationId]
          );
        } else {
          await connection.query(
            `UPDATE notifications 
             SET status = 'FAILED',
                 provider = ?,
                 last_error = ?,
                 failed_at = NOW(),
                 retry_count = retry_count + 1
             WHERE id = ?`,
            [smsRes.provider || 'unknown', smsRes.error || 'Dispatch error', notificationId]
          );
        }
      } catch (updateErr) {
        console.warn('[processSmsAlert] Post-send DB update notice:', updateErr);
      }
    }

    return {
      success: smsRes.success,
      notificationId,
      provider: smsRes.provider,
      status: smsRes.success ? 'SENT' : 'FAILED',
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
 * Direct SMS send helper for user / officer manual dispatches.
 */
export async function sendSmsToUser(opts: DirectSmsOptions): Promise<{
  success: boolean;
  notificationId?: string;
  provider?: string;
  status?: NotificationStatus;
  messageId?: string;
  error?: string;
}> {
  let connection;
  const notificationId = `NTF_DIR_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

  try {
    let phone: string | null = null;
    let language = opts.language || 'en';
    let smsAlertsEnabled = 1;

    try {
      connection = await pool.getConnection();

      const [farmers]: any = await connection.query(
        `SELECT id, phone, language, sms_alerts_enabled FROM farmers WHERE id = ? OR phone = ? LIMIT 1`,
        [opts.userId, opts.userId]
      );

      if (farmers && farmers.length > 0) {
        phone = farmers[0].phone;
        if (farmers[0].language) language = farmers[0].language;
        if (farmers[0].sms_alerts_enabled !== undefined && farmers[0].sms_alerts_enabled !== null) {
          smsAlertsEnabled = Number(farmers[0].sms_alerts_enabled);
        }
      } else {
        const [profiles]: any = await connection.query(
          `SELECT phone, language FROM farmer_profiles WHERE user_id = ? OR id = ? LIMIT 1`,
          [opts.userId, opts.userId]
        );
        if (profiles && profiles.length > 0) {
          phone = profiles[0].phone;
          if (profiles[0].language) language = profiles[0].language;
        }
      }
    } catch (dbErr) {
      console.warn('[sendSmsToUser] DB query notice:', dbErr);
    }

    if (smsAlertsEnabled === 0) {
      return { success: false, error: 'SMS_ALERTS_DISABLED' };
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

    // Initial audit log
    if (connection) {
      try {
        await connection.query(
          `INSERT INTO notifications 
           (id, user_id, farmer_id, type, category, priority, title, message, language, is_read, channel, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'SMS', 'PENDING', NOW())`,
          [
            notificationId,
            opts.userId,
            opts.userId,
            (opts.notificationType || 'officer_alert').toLowerCase(),
            'Officer Update',
            (opts.priority || 'high').toLowerCase(),
            'Officer SMS Advisory',
            messageContent,
            language,
          ]
        );
      } catch (insertErr) {
        console.warn('[sendSmsToUser] Pre-send DB insert notice:', insertErr);
      }
    }

    const smsRes = await sendSms(phone, messageContent, notificationId);

    // Update audit log
    if (connection) {
      try {
        if (smsRes.success) {
          await connection.query(
            `UPDATE notifications 
             SET status = 'SENT',
                 provider = ?,
                 provider_message_id = ?,
                 sent_at = NOW()
             WHERE id = ?`,
            [smsRes.provider || 'fast2sms', smsRes.messageId || null, notificationId]
          );
        } else {
          await connection.query(
            `UPDATE notifications 
             SET status = 'FAILED',
                 provider = ?,
                 last_error = ?,
                 failed_at = NOW(),
                 retry_count = retry_count + 1
             WHERE id = ?`,
            [smsRes.provider || 'unknown', smsRes.error || 'Dispatch error', notificationId]
          );
        }
      } catch (updateErr) {
        console.warn('[sendSmsToUser] Post-send DB update notice:', updateErr);
      }
    }

    return {
      success: smsRes.success,
      notificationId,
      provider: smsRes.provider,
      status: smsRes.success ? 'SENT' : 'FAILED',
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
