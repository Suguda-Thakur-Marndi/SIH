/**
 * SmartCrop — Irrigation Advisor Utility
 *
 * Feature #4: Irrigation Recommendation System
 * Dynamically cross-references 48-hour rainfall forecasts against soil moisture
 * and crop stage to advise farmers whether to irrigate or skip.
 *
 * Prevents over-irrigation, saves fuel/electricity costs, and reduces root waterlogging.
 */

export interface IrrigationInput {
  forecast48hMm: number;              // Cumulative forecasted rainfall in next 48 hours
  soilMoisturePct?: number;           // Current soil moisture % (default 26%)
  cropStage?: string;                 // e.g. 'Flowering', 'Vegetative'
  skipThresholdMm?: number;           // Default 20mm for Paddy in Odisha
  pumpCostPerEventInr?: number;       // Default ₹450 (diesel pump / electricity estimate for 2.5-acre reference)
}

export type IrrigationAction = 'SKIP' | 'IRRIGATE' | 'MONITOR';

export interface IrrigationAdvisoryResult {
  action: IrrigationAction;
  title: string;
  reason: string;
  rainfallForecast48hMm: number;
  thresholdMm: number;
  estimatedSavingsInr: number;        // ₹ saved by skipping unneeded irrigation (2.5-acre reference)
  waterSavedLiters: number;           // Liters saved (2.5-acre reference)
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Generate actionable irrigation recommendation.
 */
export function generateIrrigationAdvisory(input: IrrigationInput): IrrigationAdvisoryResult {
  const {
    forecast48hMm,
    soilMoisturePct = 26,
    cropStage = 'Flowering',
    skipThresholdMm = 20,
    pumpCostPerEventInr = 450,
  } = input;

  if (forecast48hMm >= skipThresholdMm) {
    return {
      action: 'SKIP',
      title: '⏸️ Skip Scheduled Irrigation',
      reason: `${forecast48hMm}mm rainfall expected over the next 48 hours (exceeds ${skipThresholdMm}mm threshold). Irrigating now risks root waterlogging and wastes pump fuel.`,
      rainfallForecast48hMm: forecast48hMm,
      thresholdMm: skipThresholdMm,
      estimatedSavingsInr: pumpCostPerEventInr,
      waterSavedLiters: 25000, // ~25,000L saved per 2.5-acre reference skip
      urgency: 'HIGH',
    };
  }

  if (soilMoisturePct < 30 && forecast48hMm < 10) {
    return {
      action: 'IRRIGATE',
      title: '🚰 Irrigate Crop Today',
      reason: `Soil moisture at critical level (${soilMoisturePct}%). Only ${forecast48hMm}mm rain forecasted in 48h. Crop is in moisture-sensitive ${cropStage} stage.`,
      rainfallForecast48hMm: forecast48hMm,
      thresholdMm: skipThresholdMm,
      estimatedSavingsInr: 0,
      waterSavedLiters: 0,
      urgency: 'HIGH',
    };
  }

  return {
    action: 'MONITOR',
    title: '👁️ Monitor Soil Moisture',
    reason: `Soil moisture is moderate (${soilMoisturePct}%) with ${forecast48hMm}mm light rain expected. Re-evaluate moisture level in 24 hours.`,
    rainfallForecast48hMm: forecast48hMm,
    thresholdMm: skipThresholdMm,
    estimatedSavingsInr: 0,
    waterSavedLiters: 0,
    urgency: 'LOW',
  };
}
