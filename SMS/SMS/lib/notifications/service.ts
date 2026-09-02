import { NotificationEvent, SendSmsInput, SendSmsResult } from './types';
import { buildMessageAsync } from './templates';
import { sendSms } from './sms';
import { hasRecentEquivalentAlert } from './rules';
import { pool } from '@/lib/db';

/**
 * Main handler to process an event-driven SMS alert (Distress, Disaster, Weather, etc.)
 */
export async function processSmsAlert(event: NotificationEvent): Promise<SendSmsResult | null> {
  if (event.channel !== 'SMS') return null;

  // 1. Deduplication / Cooldown Check
  const alreadySent = await hasRecentEquivalentAlert(
    event.farmerId,
    event.type,
    event.priority,
    event.eventId
  );

  if (alreadySent) {
    console.log(
      `[SMS Service] Skipping ${event.priority} alert for farmer ${event.farmerId} (active cooldown or event duplicate).`
    );
    return null;
  }

  // 2. Fetch Farmer Profile & Preferences from DB
  let connection;
  const ts = Date.now();
  const rand = Math.floor(100 + Math.random() * 900);
  const notificationId = `NTF_${ts}_${rand}`;

  try {
    connection = await pool.getConnection();

    // Query farmer_profiles first
    const [farmerRows]: any = await connection.query(
      `SELECT phone, language, sms_enabled, full_name, name 
       FROM farmer_profiles 
       WHERE user_id = ? OR id = ? 
       LIMIT 1`,
      [event.farmerId, event.farmerId]
    );

    let phone = farmerRows[0]?.phone;
    let language = event.language || farmerRows[0]?.language || 'en';
    const smsEnabled = farmerRows[0]?.sms_enabled;

    // Fallback to farmers table if needed
    if (!phone) {
      const [farmerTableRows]: any = await connection.query(
        `SELECT phone, language, sms_alerts_enabled, name 
         FROM farmers 
         WHERE id = ? OR phone = ?
         LIMIT 1`,
        [event.farmerId, event.farmerId]
      );
      phone = farmerTableRows[0]?.phone;
      if (!language && farmerTableRows[0]?.language) language = farmerTableRows[0].language;
    }

    if (!phone) {
      console.warn(`[SMS Service] No phone number found in DB for farmer ID: ${event.farmerId}`);
      return {
        success: false,
        status: 'FAILED',
        error: 'PHONE_NUMBER_NOT_FOUND',
      };
    }

    // Check opt-out (critical distress and disaster alerts override optional marketing, but check flag for normal alerts)
    if (smsEnabled === false || smsEnabled === 0) {
      if (event.priority !== 'CRITICAL' && event.type !== 'DISASTER') {
        console.log(`[SMS Service] Farmer ${event.farmerId} has SMS notifications disabled.`);
        return {
          success: false,
          status: 'FAILED',
          error: 'SMS_NOT_ENABLED',
        };
      }
    }

    // 3. Message Generation (Localized)
    const reasons = event.reasons || [];
    const message =
      event.customMessage ||
      (await buildMessageAsync(
        event.priority,
        event.type,
        event.score || 0,
        reasons,
        language,
        event.metadata || {}
      ));

    const category = event.type === 'DISTRESS' ? 'ALERT' : event.type;
    const title = event.title || `${event.type} Alert`;

    // 4. Create DB Row (status = PENDING)
    await connection.query(
      `INSERT INTO notifications (
        id, user_id, farmer_id, type, category, priority, title, message, 
        language, channel, status, risk_score, reason, correlation_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'SMS', 'PENDING', ?, ?, ?, NOW())`,
      [
        notificationId,
        event.farmerId,
        event.farmerId,
        event.type,
        category,
        event.priority,
        title,
        message,
        language,
        event.score || null,
        reasons.join(', ') || null,
        event.eventId || null,
      ]
    );

    // 5. Send SMS via Provider Adapter
    const result = await sendSms(phone, message, notificationId);

    // 6. Update DB Row status
    const finalStatus = result.success ? 'SENT' : 'FAILED';
    await connection.query(
      `UPDATE notifications SET 
        status = ?, 
        provider_message_id = ?, 
        last_error = ?,
        ${result.success ? 'sent_at = NOW()' : 'failed_at = NOW()'}
       WHERE id = ?`,
      [finalStatus, result.messageId || null, result.error || null, notificationId]
    );

    return {
      success: result.success,
      notificationId,
      status: finalStatus,
      messageId: result.messageId,
      error: result.error,
    };
  } catch (error: any) {
    console.error('[SMS Service] Exception in processSmsAlert:', error);

    if (connection && notificationId) {
      await connection
        .query(
          `UPDATE notifications SET status = 'FAILED', last_error = ?, failed_at = NOW() WHERE id = ?`,
          [error.message || 'Unknown processing error', notificationId]
        )
        .catch(() => {});
    }

    return {
      success: false,
      notificationId,
      status: 'FAILED',
      error: error.message || 'Processing error',
    };
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Reusable backend function matching PRD §11:
 * sendSmsToUser(userId, message, notificationType)
 */
export async function sendSmsToUser(input: SendSmsInput): Promise<SendSmsResult> {
  const {
    userId,
    message,
    notificationType,
    priority = 'HIGH',
    score,
    reasons = [],
    language,
    eventId,
  } = input;

  return (
    (await processSmsAlert({
      farmerId: userId,
      type: notificationType,
      priority,
      score,
      reasons,
      language: language || 'en',
      channel: 'SMS',
      customMessage: message,
      eventId,
    })) || {
      success: false,
      status: 'FAILED',
      error: 'ALERT_COOLDOWN_ACTIVE',
    }
  );
}
