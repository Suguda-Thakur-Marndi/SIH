import { pool } from '@/lib/db';
import { Priority } from './types';

// Cooldown windows in hours
const COOLDOWN_HOURS: Record<Priority, number> = {
  LOW: 0,
  MEDIUM: 0,
  HIGH: 24,
  CRITICAL: 12
};

/**
 * Checks if a recent equivalent alert has been sent within the cooldown period.
 */
export async function hasRecentEquivalentAlert(
  farmerId: string,
  type: string,
  priority: Priority
): Promise<boolean> {
  const cooldownHours = COOLDOWN_HOURS[priority];
  if (cooldownHours === 0) return false; // Immediate send for NO cooldown. DISASTER uses deduplication differently or bypasses.

  let connection;
  try {
    connection = await pool.getConnection();
    
    // Check if there is an SMS alert sent within the cooldown window
    const [rows]: any = await connection.query(
      `SELECT id FROM notifications 
       WHERE farmer_id = ? 
         AND type = ? 
         AND priority = ? 
         AND channel = 'SMS'
         AND status IN ('PENDING', 'SENT', 'DELIVERED')
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
       LIMIT 1`,
      [farmerId, type, priority, cooldownHours]
    );

    return rows.length > 0;
  } catch (error) {
    console.error('[Rules] Error checking recent alerts:', error);
    // On error, default to false to ensure alerts aren't silently dropped
    return false;
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Determines the priority based on risk score.
 */
export function getRiskPriority(score: number): Priority {
  if (score >= 85) return 'CRITICAL';
  if (score >= 70) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  return 'LOW';
}
