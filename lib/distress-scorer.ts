/**
 * SmartCrop — Transparent 3-Signal Distress-Risk Scorer (PS-02 Compliant)
 *
 * Implements the PS-02 formula combining 3 independent signals:
 *  1. Erratic Rainfall Risk (deviation from seasonal normal/forecast)
 *  2. Price Crash Risk (mandi price decline vs. Govt MSP benchmark)
 *  3. Loan Due-Date Proximity (days remaining to farmer-declared repayment)
 *
 * Final Score (0 - 100) = (0.40 * rainfall_risk) + (0.35 * market_risk) + (0.25 * loan_risk)
 *
 * Risk Bands:
 *  - HIGH / CRITICAL: Score > 70 (Immediate extension officer alert)
 *  - MODERATE: Score 31 - 70 (Advisory & preventive interventions)
 *  - LOW: Score <= 30 (Normal seasonal monitoring)
 */

export interface DistressSignalsInput {
  actualRainfallMm: number;
  expectedRainfallMm: number;
  currentMandiPrice: number;
  govtMspPrice: number;
  loanDueDateStr?: string | null; // e.g. "2026-09-15" (farmer self-declared)
}

export interface ComputedDistressScore {
  score: number; // 0 - 100
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  signals: {
    rainfall_risk: number; // 0 - 100
    market_risk: number; // 0 - 100
    loan_risk: number; // 0 - 100
  };
  weights: {
    rainfall: number; // 0.40
    market: number; // 0.35
    loan: number; // 0.25
  };
  breakdown: {
    rainfallDeficitPct: number;
    priceCrashPct: number;
    daysUntilLoanDue: number | null;
  };
  primaryDriver: 'Rainfall Deficit' | 'Market Price Crash' | 'Loan Repayment Due' | 'Multi-Signal Compound';
}

export function computeDistressScore(input: DistressSignalsInput): ComputedDistressScore {
  const {
    actualRainfallMm,
    expectedRainfallMm,
    currentMandiPrice,
    govtMspPrice,
    loanDueDateStr,
  } = input;

  // Signal 1: Erratic Rainfall / Deficit Deviation
  // Measures % deviation of actual/forecast rainfall below expected seasonal normal
  const rainfallDeficitPct = expectedRainfallMm > 0
    ? Math.max(0, Math.min(100, Math.round(((expectedRainfallMm - actualRainfallMm) / expectedRainfallMm) * 100)))
    : 0;

  // Scale deficit % to 0-100 risk score
  let rainfall_risk = 0;
  if (rainfallDeficitPct >= 50) {
    rainfall_risk = Math.min(100, 75 + Math.round((rainfallDeficitPct - 50) * 0.5));
  } else if (rainfallDeficitPct >= 20) {
    rainfall_risk = 40 + Math.round((rainfallDeficitPct - 20) * 1.15);
  } else {
    rainfall_risk = Math.round(rainfallDeficitPct * 2.0);
  }

  // Signal 2: Price Crash / Market Decline vs MSP
  // Measures % decline of market price below Government MSP
  const priceCrashPct = govtMspPrice > 0
    ? Math.max(0, Math.min(100, Math.round(((govtMspPrice - currentMandiPrice) / govtMspPrice) * 100)))
    : 0;

  let market_risk = 0;
  if (priceCrashPct >= 25) {
    market_risk = Math.min(100, 70 + Math.round((priceCrashPct - 25) * 1.2));
  } else if (priceCrashPct >= 10) {
    market_risk = 40 + Math.round((priceCrashPct - 10) * 2.0);
  } else {
    market_risk = Math.round(priceCrashPct * 4.0);
  }

  // Signal 3: Loan Due-Date Proximity (Farmer Self-Declared)
  let daysUntilLoanDue: number | null = null;
  let loan_risk = 10; // baseline low risk

  if (loanDueDateStr) {
    const dueDate = new Date(loanDueDateStr);
    const today = new Date();
    const diffMs = dueDate.getTime() - today.getTime();
    daysUntilLoanDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysUntilLoanDue <= 0) {
      loan_risk = 95; // Overdue
    } else if (daysUntilLoanDue <= 7) {
      loan_risk = 90; // Due within a week
    } else if (daysUntilLoanDue <= 15) {
      loan_risk = 75; // Due within fortnight
    } else if (daysUntilLoanDue <= 30) {
      loan_risk = 55; // Due within a month
    } else if (daysUntilLoanDue <= 60) {
      loan_risk = 35;
    } else {
      loan_risk = 15;
    }
  }

  // Transparent Weighted Rule Formula
  const W_RAINFALL = 0.40;
  const W_MARKET = 0.35;
  const W_LOAN = 0.25;

  const rawScore = (W_RAINFALL * rainfall_risk) + (W_MARKET * market_risk) + (W_LOAN * loan_risk);
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Risk Level Classification
  let riskLevel: ComputedDistressScore['riskLevel'] = 'LOW';
  if (score > 85) riskLevel = 'CRITICAL';
  else if (score > 70) riskLevel = 'HIGH';
  else if (score > 30) riskLevel = 'MODERATE';
  else riskLevel = 'LOW';

  // Primary Driver Identification
  let primaryDriver: ComputedDistressScore['primaryDriver'] = 'Multi-Signal Compound';
  if (rainfall_risk >= 70 && market_risk < 50 && loan_risk < 50) {
    primaryDriver = 'Rainfall Deficit';
  } else if (market_risk >= 70 && rainfall_risk < 50 && loan_risk < 50) {
    primaryDriver = 'Market Price Crash';
  } else if (loan_risk >= 75 && rainfall_risk < 50 && market_risk < 50) {
    primaryDriver = 'Loan Repayment Due';
  }

  return {
    score,
    riskLevel,
    signals: {
      rainfall_risk,
      market_risk,
      loan_risk,
    },
    weights: {
      rainfall: W_RAINFALL,
      market: W_MARKET,
      loan: W_LOAN,
    },
    breakdown: {
      rainfallDeficitPct,
      priceCrashPct,
      daysUntilLoanDue,
    },
    primaryDriver,
  };
}
