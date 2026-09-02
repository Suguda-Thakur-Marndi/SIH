import { Priority } from './types';

let poolInstance: any = null;
async function getDbPool() {
  if (poolInstance) return poolInstance;
  try {
    const dbModule = await import('../../../../lib/db').catch(() => null);
    poolInstance = dbModule?.pool;
  } catch (e) {
    // Standalone mode
  }
  return poolInstance;
}

// Cooldown windows in hours per PRD §7
export const COOLDOWN_HOURS: Record<Priority, number> = {
  LOW: 0,
  MEDIUM: 0,
  HIGH: 24,
  CRITICAL: 12,
};

/**
 * Determines the priority level based on distress score (0-100).
 */
export function getRiskPriority(score: number): Priority {
  if (score >= 85) return 'CRITICAL';
  if (score >= 70) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  return 'LOW';
}

/**
 * Checks whether a score change represents an escalation crossing
 * that warrants sending an SMS alert.
 */
export function hasThresholdCrossed(previousScore: number, currentScore: number): boolean {
  const prevPriority = getRiskPriority(previousScore);
  const currPriority = getRiskPriority(currentScore);

  // Cross into HIGH from below 70
  if (currPriority === 'HIGH' && (prevPriority === 'LOW' || prevPriority === 'MEDIUM')) {
    return true;
  }

  // Cross into CRITICAL from below 85
  if (currPriority === 'CRITICAL' && prevPriority !== 'CRITICAL') {
    return true;
  }

  return false;
}

/**
 * Checks if a recent equivalent alert has been sent within the cooldown period.
 */
export async function hasRecentEquivalentAlert(
  farmerId: string,
  type: string,
  priority: Priority,
  eventId?: string
): Promise<boolean> {
  const pool = await getDbPool();
  if (!pool) return false;

  // If eventId provided (e.g. disaster or weather event), check exact event deduplication
  if (eventId) {
    let connection;
    try {
      connection = await pool.getConnection();
      const [rows]: any = await connection.query(
        `SELECT id FROM notifications 
         WHERE (farmer_id = ? OR user_id = ?)
           AND correlation_id = ?
           AND channel = 'SMS'
           AND status IN ('PENDING', 'SENT', 'DELIVERED')
         LIMIT 1`,
        [farmerId, farmerId, eventId]
      );
      if (rows.length > 0) return true;
    } catch (err) {
      console.error('[Rules] Error checking event deduplication:', err);
    } finally {
      if (connection) connection.release();
    }
  }

  const cooldownHours = COOLDOWN_HOURS[priority] || 0;
  if (cooldownHours === 0) return false;

  let connection;
  try {
    connection = await pool.getConnection();

    // Check if an SMS alert was sent within the active cooldown window
    const [rows]: any = await connection.query(
      `SELECT id FROM notifications 
       WHERE (farmer_id = ? OR user_id = ?)
         AND type = ? 
         AND priority = ? 
         AND channel = 'SMS'
         AND status IN ('PENDING', 'SENT', 'DELIVERED')
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
       LIMIT 1`,
      [farmerId, farmerId, type, priority, cooldownHours]
    );

    return rows.length > 0;
  } catch (error) {
    console.error('[Rules] Error checking recent alerts cooldown:', error);
    // Return false on error to avoid silently dropping critical alerts
    return false;
  } finally {
    if (connection) connection.release();
  }
}
