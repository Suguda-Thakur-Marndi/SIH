/**
 * SmartCrop — Trend Calculator (Shared Utility)
 *
 * Reusable velocity-based trend logic for:
 *  - Feature #1: Individual farmer early-warning (threshold ≥ 15 points / 7 days)
 *  - Feature #2: Block-level distress forecasting (threshold ≥ 3 points / window)
 *
 * Centralised here so both features share the same math and don't diverge.
 */

export type TrendDirection = 'rising' | 'stable' | 'falling';

export interface TrendResult {
  trend_direction: TrendDirection;
  trend_delta_7d: number;        // positive = worsening, negative = improving
  trending_up: boolean;          // true when delta ≥ risingThreshold
  primary_signal_change: string; // which of the 3 signals drove the biggest move
}

export interface BlockTrendDirection {
  trend_direction: 'worsening' | 'stable' | 'improving';
  trend_delta: number;
}

/**
 * Calculate the trend for an individual farmer's risk score.
 *
 * @param currentScore   The farmer's latest overall distress score (0–100)
 * @param score7dAgo     The farmer's score ~7 days ago (0–100), or null if unavailable
 * @param signalDeltas   Optional per-signal changes to identify the primary driver
 * @param risingThreshold Minimum positive delta to flag as "rising" (default 15)
 */
export function calculateFarmerTrend(
  currentScore: number,
  score7dAgo: number | null,
  signalDeltas?: {
    rainfall_delta: number;
    market_delta: number;
    loan_delta: number;
  },
  risingThreshold = 15
): TrendResult {
  if (score7dAgo === null || score7dAgo === undefined) {
    return {
      trend_direction: 'stable',
      trend_delta_7d: 0,
      trending_up: false,
      primary_signal_change: 'Insufficient history',
    };
  }

  const delta = currentScore - score7dAgo;

  let trend_direction: TrendDirection = 'stable';
  if (delta >= risingThreshold) {
    trend_direction = 'rising';
  } else if (delta <= -risingThreshold) {
    trend_direction = 'falling';
  }

  // Identify primary signal driver
  let primary_signal_change = 'Multi-Signal Compound';
  if (signalDeltas) {
    const { rainfall_delta, market_delta, loan_delta } = signalDeltas;
    const absRainfall = Math.abs(rainfall_delta);
    const absMarket = Math.abs(market_delta);
    const absLoan = Math.abs(loan_delta);

    if (absRainfall >= absMarket && absRainfall >= absLoan && absRainfall > 0) {
      primary_signal_change = 'Rainfall Deficit';
    } else if (absMarket >= absRainfall && absMarket >= absLoan && absMarket > 0) {
      primary_signal_change = 'Market Price Crash';
    } else if (absLoan >= absRainfall && absLoan >= absMarket && absLoan > 0) {
      primary_signal_change = 'Loan Repayment Due';
    }
  }

  return {
    trend_direction,
    trend_delta_7d: delta,
    trending_up: delta >= risingThreshold,
    primary_signal_change,
  };
}

/**
 * Calculate the trend for a block-level aggregate score.
 * Uses a smaller noise threshold (±3 points) since block averages move less.
 *
 * @param currentWindowAvg  Average distress score for the current window
 * @param previousWindowAvg Average distress score for the preceding window
 * @param noiseThreshold    Minimum delta to count as non-stable (default 3)
 */
export function calculateBlockTrend(
  currentWindowAvg: number,
  previousWindowAvg: number | null,
  noiseThreshold = 3
): BlockTrendDirection {
  if (previousWindowAvg === null || previousWindowAvg === undefined) {
    return { trend_direction: 'stable', trend_delta: 0 };
  }

  const delta = currentWindowAvg - previousWindowAvg;

  if (delta >= noiseThreshold) {
    return { trend_direction: 'worsening', trend_delta: Math.round(delta * 10) / 10 };
  } else if (delta <= -noiseThreshold) {
    return { trend_direction: 'improving', trend_delta: Math.round(delta * 10) / 10 };
  }

  return { trend_direction: 'stable', trend_delta: Math.round(delta * 10) / 10 };
}
