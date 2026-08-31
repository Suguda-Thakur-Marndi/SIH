export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'WARNING' | 'INFO';

/**
 * Maps a numeric distress/risk score (0-100) to a standard priority tier.
 */
export function getRiskPriority(score: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

/**
 * Determines whether an SMS alert can be sent based on cooldown rules.
 */
export function isEligibleForSms(priority: string, lastSentTimestamp?: Date | string | null): boolean {
  if (!lastSentTimestamp) return true;

  const lastSent = new Date(lastSentTimestamp).getTime();
  const now = Date.now();
  const elapsedHours = (now - lastSent) / (1000 * 60 * 60);

  const upperPriority = priority.toUpperCase();

  // Critical alerts have a 2-hour cooldown
  if (upperPriority === 'CRITICAL') {
    return elapsedHours >= 2;
  }

  // High alerts have a 6-hour cooldown
  if (upperPriority === 'HIGH') {
    return elapsedHours >= 6;
  }

  // Medium / Info alerts have a 24-hour cooldown
  return elapsedHours >= 24;
}
