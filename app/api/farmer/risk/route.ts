import { NextResponse } from 'next/server';
import { computeDistressScore } from '@/lib/distress-scorer';
import { calculateFarmerTrend } from '@/lib/trend-calculator';
import { estimateYieldLoss } from '@/lib/yield-estimator';

export async function GET() {
  // 1. Ingest telemetry inputs for Baripada / Mayurbhanj
  const calculated = computeDistressScore({
    actualRainfallMm: 62.4,
    expectedRainfallMm: 96.0, // 35% seasonal rainfall deficit
    currentMandiPrice: 1850,
    govtMspPrice: 2320, // 20.2% price drop below MSP
    loanDueDateStr: '2026-09-08', // Due in 7 days (farmer self-declared)
  });

  const history = [
    { date: 'Aug 14', score: 35 },
    { date: 'Aug 17', score: 42 },
    { date: 'Aug 20', score: 58 },
    { date: 'Aug 23', score: 69 },
    { date: 'Aug 26', score: 75 },
    { date: 'Today', score: calculated.score },
  ];

  // Score 7 days ago (Aug 23 = 69)
  const score7dAgo = 58; // Aug 20 was 7 days ago relative to Aug 27, or 58 vs current 76 -> delta +18
  const trendResult = calculateFarmerTrend(calculated.score, score7dAgo, {
    rainfall_delta: 25,
    market_delta: 15,
    loan_delta: 10,
  });

  // Calculate structured yield loss estimation
  const yieldImpact = estimateYieldLoss({
    crop: 'Paddy (Rice)',
    landSizeAcres: 2.5,
    baselineYieldPerAcre: 15,
    mspPricePerQuintal: 2320,
    rainfallDeficitPct: calculated.breakdown.rainfallDeficitPct,
    priceCrashPct: calculated.breakdown.priceCrashPct,
    soilMoistureScore: 64,
    pestRiskScore: 22,
  });

  const riskData = {
    farmerId: 'FRM-7821',
    overallScore: calculated.score,
    riskLevel: calculated.riskLevel,
    calculatedAt: new Date().toISOString(),
    formula: 'Score = 0.40 * RainfallRisk + 0.35 * MarketRisk + 0.25 * LoanRisk',
    signals: calculated.signals,
    primaryDriver: calculated.primaryDriver,
    trend_7d: {
      direction: trendResult.trend_direction,
      delta: trendResult.trend_delta_7d,
      trendingUp: trendResult.trending_up,
      primaryDriver: trendResult.primary_signal_change,
    },
    yieldImpact,
    factors: [
      {
        name: 'Weather Stress (Rainfall Deficit)',
        score: calculated.signals.rainfall_risk,
        max: 100,
        level: calculated.signals.rainfall_risk > 70 ? 'HIGH' : calculated.signals.rainfall_risk > 30 ? 'MEDIUM' : 'LOW',
        trend: 'increasing',
        detail: `${calculated.breakdown.rainfallDeficitPct}% deficit vs 14-day expected monsoon rainfall.`,
      },
      {
        name: 'Market Price Crash vs MSP',
        score: calculated.signals.market_risk,
        max: 100,
        level: calculated.signals.market_risk > 70 ? 'HIGH' : calculated.signals.market_risk > 30 ? 'MEDIUM' : 'LOW',
        trend: 'increasing',
        detail: `Local mandi price (₹1,850/qtl) is ${calculated.breakdown.priceCrashPct}% below Govt MSP (₹2,320/qtl).`,
      },
      {
        name: 'Loan Due Date Proximity',
        score: calculated.signals.loan_risk,
        max: 100,
        level: calculated.signals.loan_risk > 70 ? 'HIGH' : calculated.signals.loan_risk > 30 ? 'MEDIUM' : 'LOW',
        trend: 'critical',
        detail: `Self-declared crop loan due in ${calculated.breakdown.daysUntilLoanDue} days.`,
      },
      {
        name: 'Soil Moisture Depletion',
        score: 64,
        max: 100,
        level: 'HIGH',
        trend: 'increasing',
        detail: 'Soil moisture dropped to 26% across top 15cm root-zone.',
      },
      {
        name: 'Pest & Disease Vector',
        score: 22,
        max: 100,
        level: 'LOW',
        trend: 'decreasing',
        detail: 'Brown plant hopper vector below economic threshold.',
      },
    ],
    history,
  };

  return NextResponse.json({ success: true, data: riskData });
}

