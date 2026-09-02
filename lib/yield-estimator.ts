/**
 * SmartCrop — Yield-Loss Estimator Utility
 *
 * Feature #3: Structured Yield-Loss Estimator
 * Replaces unstructured string explanations with structured quantitative estimations
 * for yield loss %, expected vs risk-adjusted yield in quintals, and revenue loss in INR.
 */

export interface YieldEstimateInput {
  crop?: string;                   // default 'Paddy (Rice)'
  landSizeAcres?: number;          // default 2.5
  baselineYieldPerAcre?: number;   // default 15 quintals/acre
  mspPricePerQuintal?: number;     // default ₹2,320/qtl
  rainfallDeficitPct: number;      // 0–100 % deficit
  priceCrashPct: number;           // 0–100 % drop below MSP
  soilMoistureScore?: number;      // 0–100 (where 100 = critical depletion)
  pestRiskScore?: number;          // 0–100
}

export interface YieldEstimateResult {
  projectedLossPct: number;            // 0–85%
  expectedYieldQuintals: number;       // Baseline expected harvest
  riskAdjustedYieldQuintals: number;   // Estimated actual harvest
  estimatedRevenueLossInr: number;     // ₹ loss at MSP
  primaryCause: string;                // Driver responsible for the majority of loss
  breakdown: {
    weatherLossContribution: number;
    marketLossContribution: number;
    soilPestLossContribution: number;
  };
}

/**
 * Calculate structured yield impact from agronomic & market inputs.
 */
export function estimateYieldLoss(input: YieldEstimateInput): YieldEstimateResult {
  const {
    landSizeAcres = 2.5,
    baselineYieldPerAcre = 15,
    mspPricePerQuintal = 2320,
    rainfallDeficitPct,
    priceCrashPct,
    soilMoistureScore = 64,
    pestRiskScore = 22,
  } = input;

  // Expected baseline yield
  const expectedYieldQuintals = Math.round(landSizeAcres * baselineYieldPerAcre * 10) / 10;

  // Agronomic loss components
  // 1. Rainfall deficit impact (0.45 weight) - e.g. 35% deficit -> 15.75% yield loss
  const weatherLoss = Math.min(50, (rainfallDeficitPct / 100) * 45);

  // 2. Soil moisture & pest stress (0.30 weight)
  const soilPestLoss = Math.min(25, (soilMoistureScore / 100) * 20 + (pestRiskScore / 100) * 10);

  // 3. Price crash impact on financial realization (0.25 weight)
  const marketLoss = Math.min(25, (priceCrashPct / 100) * 25);

  // Total projected yield loss (capped at 85%)
  const rawLossPct = weatherLoss + soilPestLoss + marketLoss;
  const projectedLossPct = Math.min(85, Math.max(0, Math.round(rawLossPct * 10) / 10));

  // Risk-adjusted yield in quintals
  const riskAdjustedYieldQuintals = Math.max(0, Math.round(expectedYieldQuintals * (1 - projectedLossPct / 100) * 10) / 10);

  // Estimated revenue loss in INR
  const lostQuintals = expectedYieldQuintals - riskAdjustedYieldQuintals;
  const estimatedRevenueLossInr = Math.round(lostQuintals * mspPricePerQuintal);

  // Determine primary cause
  let primaryCause = 'Rainfall Deficit';
  if (marketLoss >= weatherLoss && marketLoss >= soilPestLoss) {
    primaryCause = 'Mandi Price Crash';
  } else if (soilPestLoss >= weatherLoss && soilPestLoss >= marketLoss) {
    primaryCause = 'Soil Moisture Depletion';
  }

  return {
    projectedLossPct,
    expectedYieldQuintals,
    riskAdjustedYieldQuintals,
    estimatedRevenueLossInr,
    primaryCause,
    breakdown: {
      weatherLossContribution: Math.round(weatherLoss * 10) / 10,
      marketLossContribution: Math.round(marketLoss * 10) / 10,
      soilPestLossContribution: Math.round(soilPestLoss * 10) / 10,
    },
  };
}
