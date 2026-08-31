import { NotificationEvent } from './types';
import { buildMessage } from './templates';
import { sendSms } from './sms';
import { hasRecentEquivalentAlert } from './rules';
import { pool } from '@/lib/db';

export async function processSmsAlert(event: NotificationEvent) {
  if (event.channel !== 'SMS') return;
  
  // 1. Deduplication / Cooldown
  const alreadySent = await hasRecentEquivalentAlert(event.farmerId, event.type, event.priority);
  if (alreadySent) {
    console.log(`[SMS Service] Skipping ${event.priority} alert for ${event.farmerId} (cooldown active).`);
    return null;
  }
  
  // 2. Message Generation
  const message = buildMessage(
    event.priority as any, 
    event.type, 
    event.score, 
    event.reasons, 
    event.language
  );
  
  // 3. Create DB Row (status = PENDING)
  const ts = Date.now();
  const rand = Math.floor(100 + Math.random() * 900);
  const id = `NTF_${ts}_${rand}`;
  
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Fetch phone number
    const [farmerRows]: any = await connection.query(
      'SELECT phone FROM farmer_profiles WHERE user_id = ? OR id = ? LIMIT 1',
      [event.farmerId, event.farmerId]
    );
    
    let phone = farmerRows[0]?.phone;
    if (!phone) {
      const [userRows]: any = await connection.query(
        'SELECT phone FROM users WHERE id = ? LIMIT 1',
        [event.farmerId]
      );
      phone = userRows[0]?.phone;
    }

    if (!phone) {
      throw new Error(`No phone number found for farmer ${event.farmerId}`);
    }

    const category = event.type === 'DISTRESS' ? 'ALERT' : event.type;
    
    await connection.query(
      `INSERT INTO notifications (
        id, user_id, farmer_id, type, category, priority, title, message, 
        language, channel, status, risk_score, reason, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'SMS', 'PENDING', ?, ?, NOW())`,
      [
        id, 
        event.farmerId, // user_id
        event.farmerId, // farmer_id
        event.type,
        category,
        event.priority, 
        `${event.type} Alert`, 
        message,
        event.language,
        event.score || null,
        event.reasons.join(', ')
      ]
    );
    
    // 4. Send SMS
    const result = await sendSms(phone, message, id);
    
    // 5. Update DB Row
    const status = result.success ? 'SENT' : 'FAILED';
    await connection.query(
      `UPDATE notifications SET 
        status = ?, 
        provider_message_id = ?, 
        last_error = ?,
        ${result.success ? 'sent_at = NOW()' : 'failed_at = NOW()'}
       WHERE id = ?`,
      [status, result.messageId || null, result.error || null, id]
    );

    return { id, status, messageId: result.messageId };
  } catch (error: any) {
    console.error('[SMS Service] Failed to process SMS alert:', error);
    
    if (connection) {
       await connection.query(
        `UPDATE notifications SET status = 'FAILED', last_error = ?, failed_at = NOW() WHERE id = ?`,
        [error.message || 'Unknown error', id]
      ).catch(() => {});
    }
    return null;
  } finally {
    if (connection) connection.release();
  }
}
