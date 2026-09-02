/**
 * SmartCrop — Automated Location -> Live Data -> AI Prediction -> SMS Orchestrator
 *
 * Implements the 7-step pipeline described in AUTOMATED_LOCATION_TO_SMS_PIPELINE.md:
 *  1. Load farmer + active crop + loan details from DB
 *  2. Resolve lat/lon (stored farmer coords -> farms table -> OpenWeatherMap geocoding fallback)
 *  3. Fetch live signals in parallel: OpenWeatherMap / Agromonitoring / Agmarknet
 *  4. Persist raw signals to weather_observations & mandi_prices
 *  5. Score (computeDistressScore) + trend (calculateFarmerTrend) + cause-to-action (mapCauseToAction) + AI advisory (callNimText)
 *  6. Persist to risk_scores and ai_recommendations
 *  7. If HIGH or CRITICAL -> emit notification & dispatch SMS via Fast2SMS (with MSG91 fallback)
 */

import { query } from '@/lib/db';
import { computeDistressScore, type DistressSignalsInput, type ComputedDistressScore } from '@/lib/distress-scorer';
import { calculateFarmerTrend, type TrendResult } from '@/lib/trend-calculator';
import { mapCauseToAction, type RemediationAction } from '@/lib/cause-to-action-mapper';
import { callNimText } from '@/lib/nvidia-nim';
import { processSmsAlert } from '@/lib/notifications/service';

// Types

export interface FarmerRow {
  id: string;
  name: string;
  phone: string;
  district: string;
  village: string;
  state: string;
  language: string;
  latitude: number | null;
  longitude: number | null;
  sms_alerts_enabled: number;
}

export interface CropRow {
  id: string;
  name: string;
  variety: string | null;
  stage: string | null;
  farmer_id: string;
}

export interface LoanRow {
  loan_amount?: number;
  loan_due_date: string | null;
}

export interface WeatherSignal {
  temp: number;
  humidity: number;
  rainfall: number;
  forecastRainfall: number;
  rainfallDeficitPct: number;
}

export interface SoilSignal {
  moisture: number | null;
  t0: number | null;
  t10: number | null;
}

export interface MandiSignal {
  modalPrice: number;
  minPrice: number;
  msp: number;
}

export interface PipelineResult {
  farmerId: string;
  farmerName?: string;
  phone?: string;
  skipped?: boolean;
  reason?: string;
  band?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  score?: number;
  trend?: string;
  primaryDriver?: string;
  actionSummary?: string;
  aiExplanation?: string;
  notificationId?: string;
  smsQueued?: boolean;
  error?: string;
}

// Main Pipeline Orchestrator

export async function runFarmerPipeline(farmerId: string): Promise<PipelineResult> {
  console.log(`[Orchestrator] Starting 7-step pipeline for farmer: ${farmerId}`);

  // Step 0: Load farmer profile
  const farmers = await query<FarmerRow[]>(
    `SELECT f.id, f.name, f.phone, f.district, f.village, f.state, f.language,
            fm.latitude, fm.longitude, COALESCE(f.sms_alerts_enabled, 1) as sms_alerts_enabled
     FROM farmers f
     LEFT JOIN farms fm ON f.id = fm.farmer_id
     WHERE f.id = ? OR f.phone = ?
     LIMIT 1`,
    [farmerId, farmerId]
  ).catch(async () => {
    // Fallback: check farmer_profiles table
    return query<FarmerRow[]>(
      `SELECT id, name, phone, district, village, state, language,
              NULL as latitude, NULL as longitude, 1 as sms_alerts_enabled
       FROM farmer_profiles WHERE user_id = ? OR id = ? LIMIT 1`,
      [farmerId, farmerId]
    );
  });

  const farmer = farmers[0];
  if (!farmer) {
    throw new Error(`Farmer ${farmerId} not found in database`);
  }

  // Hard opt-out kill switch check
  if (farmer.sms_alerts_enabled === 0) {
    console.log(`[Orchestrator] Farmer ${farmer.name} has sms_alerts_enabled=0. Pipeline skipped.`);
    return {
      farmerId: farmer.id,
      farmerName: farmer.name,
      skipped: true,
      reason: 'sms_alerts_enabled = 0',
    };
  }

  // Load active crop
  const crops = await query<CropRow[]>(
    `SELECT id, name, stage, farmer_id FROM crops WHERE farmer_id = ? ORDER BY sowing_date DESC LIMIT 1`,
    [farmer.id]
  ).catch(() => [] as CropRow[]);
  const crop = crops[0] ?? null;

  // Load loan record / due date
  const loans = await query<LoanRow[]>(
    `SELECT loan_amount, loan_due_date FROM loans WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1`,
    [farmer.id]
  ).catch(async () => {
    return query<LoanRow[]>(
      `SELECT loan_amount, loan_due_date FROM farmer_profiles WHERE id = ? OR user_id = ? LIMIT 1`,
      [farmer.id, farmer.id]
    );
  });
  const loanDueDateStr = loans[0]?.loan_due_date ?? null;

  // Step 1: Resolve coordinates
  const { lat, lon } = await resolveCoordinates(farmer);
  console.log(`[Orchestrator] Resolved coordinates for ${farmer.name}: lat=${lat}, lon=${lon}`);

  // Step 2: Fetch all live signals in parallel
  console.log(`[Orchestrator] Fetching live signals for ${farmer.name} (${farmer.village}, ${farmer.district})...`);
  const [weather, _soil, mandi] = await Promise.all([
    fetchWeather(lat, lon).catch((err: Error) => {
      console.warn('[Orchestrator] Weather fetch failed, using fallback:', err.message);
      return defaultWeather();
    }),
    fetchSoil(lat, lon).catch(() => defaultSoil()),
    crop ? fetchMandiPrice(crop.name, farmer.district).catch(() => null) : Promise.resolve(null),
  ]);

  // Step 3: Persist raw signals
  await persistWeather(farmer.id, farmer.district, weather).catch((err: Error) =>
    console.warn('[Orchestrator] Could not persist weather_observations:', err.message)
  );
  if (mandi && crop) {
    await persistMandi(crop.id, farmer.district, mandi).catch((err: Error) =>
      console.warn('[Orchestrator] Could not persist mandi_prices:', err.message)
    );
  }

  // Step 4: Scoring + Trend + Cause-to-Action
  const SEASONAL_BASELINE_MM = 45;
  const signals: DistressSignalsInput = {
    actualRainfallMm: weather.forecastRainfall,
    expectedRainfallMm: SEASONAL_BASELINE_MM,
    currentMandiPrice: mandi?.modalPrice ?? 1850,
    govtMspPrice: mandi?.msp ?? 2183,
    loanDueDateStr,
  };
  const distress: ComputedDistressScore = computeDistressScore(signals);

  // Velocity-based trend calculation (7-day delta)
  const history = await query<{ score: number; rainfall_risk: number; market_risk: number; loan_risk: number }[]>(
    `SELECT score, rainfall_risk, market_risk, loan_risk
     FROM risk_scores
     WHERE farmer_id = ? AND calculated_at <= DATE_SUB(NOW(), INTERVAL 7 DAY)
     ORDER BY calculated_at DESC LIMIT 1`,
    [farmer.id]
  ).catch(() => []);
  const prev = history[0] ?? null;

  const trend: TrendResult = calculateFarmerTrend(
    distress.score,
    prev?.score ?? null,
    prev
      ? {
          rainfall_delta: distress.signals.rainfall_risk - prev.rainfall_risk,
          market_delta: distress.signals.market_risk - prev.market_risk,
          loan_delta: distress.signals.loan_risk - prev.loan_risk,
        }
      : undefined
  );

  // Cause-to-Action remediation mapping
  const action: RemediationAction = mapCauseToAction(distress);

  // AI explanation via NVIDIA NIM (Llama 3.1 70B) in farmer's language
  const aiExplanation = await generateAiExplanation({
    farmer,
    crop,
    distress,
    trend: trend.trend_direction,
    action,
    weather,
    mandi,
    loanDueDateStr,
  });

  // Step 5: Persist computed risk score and recommendations
  const riskId = `RSK_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
  await query(
    `INSERT INTO risk_scores
       (id, farmer_id, crop_id, score, rainfall_risk, market_risk, loan_risk, reasons, ai_explanation, calculated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      riskId,
      farmer.id,
      crop?.id ?? null,
      distress.score,
      distress.signals.rainfall_risk,
      distress.signals.market_risk,
      distress.signals.loan_risk,
      JSON.stringify({
        primaryDriver: distress.primaryDriver,
        isDominant: action.isDominant,
        summary: action.summary,
      }),
      aiExplanation,
    ]
  ).catch((err: Error) => console.warn('[Orchestrator] Could not persist risk_scores:', err.message));

  // Persist structured recommendation into ai_recommendations table
  const recId = `REC_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
  await query(
    `INSERT INTO ai_recommendations
       (id, farmer_id, category, priority, title, description, action_type, is_completed, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, NOW())`,
    [
      recId,
      farmer.id,
      action.primaryDriver,
      action.priority,
      `Advisory: ${action.summary}`,
      aiExplanation,
      action.immediateAction,
    ]
  ).catch((err: Error) => console.warn('[Orchestrator] Could not persist ai_recommendations:', err.message));

  // Step 6 & 7: Threshold check -> emit notification -> dispatch SMS
  const band = classifyBand(distress.score);
  console.log(
    `[Orchestrator] ${farmer.name} -> Score: ${distress.score}/100 | Band: ${band} | Trend: ${trend.trend_direction} | Driver: ${action.primaryDriver}`
  );

  if (band === 'HIGH' || band === 'CRITICAL') {
    const priority = band === 'CRITICAL' ? 'critical' : 'warning';
    let notificationId = `NTF_AUTO_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    let smsSent = false;

    // Try HTTP emit endpoint first if APP_URL is configured
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
    if (appUrl) {
      try {
        const emitRes = await fetch(`${appUrl}/api/notifications/emit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmerId: farmer.id,
            category: 'Risk',
            priority,
            title: `SmartCrop Distress Alert - Score ${distress.score}/100`,
            message: aiExplanation,
            language: farmer.language || 'en',
            channel: 'SMS',
            score: distress.score,
            reasons: [action.summary],
            sourceFeature: 'automated_pipeline',
            sourceEntityId: riskId,
          }),
        });

        if (emitRes.ok) {
          const emitData = await emitRes.json();
          notificationId =
            emitData?.data?.notificationId ?? emitData?.data?.id ?? notificationId;
          smsSent = true;
          console.log(`[Orchestrator] HTTP emit succeeded: ${notificationId}`);
        }
      } catch (httpErr: any) {
        console.warn('[Orchestrator] HTTP emit attempt failed, falling back to direct service call:', httpErr.message);
      }
    }

    // Direct in-process fallback if HTTP emit was not used or failed
    if (!smsSent) {
      try {
        const directRes = await processSmsAlert({
          farmerId: farmer.id,
          type: 'DISTRESS_ALERT',
          priority: band === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
          score: distress.score,
          reasons: [action.summary],
          language: farmer.language || 'en',
          channel: 'SMS',
        });
        if (directRes.notificationId) {
          notificationId = directRes.notificationId;
        }
        smsSent = directRes.success;
        console.log(`[Orchestrator] Direct processSmsAlert completed: success=${smsSent}, id=${notificationId}`);
      } catch (directErr: any) {
        console.error('[Orchestrator] Direct processSmsAlert error:', directErr.message);
      }
    }

    return {
      farmerId: farmer.id,
      farmerName: farmer.name,
      phone: farmer.phone,
      band,
      score: distress.score,
      trend: trend.trend_direction,
      primaryDriver: action.primaryDriver,
      actionSummary: action.summary,
      aiExplanation,
      notificationId,
      smsQueued: smsSent,
    };
  }

  return {
    farmerId: farmer.id,
    farmerName: farmer.name,
    phone: farmer.phone,
    band,
    score: distress.score,
    trend: trend.trend_direction,
    primaryDriver: action.primaryDriver,
    actionSummary: action.summary,
    aiExplanation,
    smsQueued: false,
  };
}

// ---------------- Helper Functions ----------------

/**
 * Resolves geolocation coordinates:
 *  1. Checks farmer.latitude & farmer.longitude
 *  2. Checks farms table
 *  3. Falls back to OpenWeatherMap Geocoding API
 *  4. Falls back to Mayurbhanj district headquarters (Baripada)
 */
async function resolveCoordinates(farmer: FarmerRow): Promise<{ lat: number; lon: number }> {
  if (farmer.latitude && farmer.longitude) {
    return { lat: Number(farmer.latitude), lon: Number(farmer.longitude) };
  }

  // Check `farms` table for this farmer
  try {
    const farms = await query<{ latitude: number | null; longitude: number | null }[]>(
      `SELECT latitude, longitude FROM farms WHERE farmer_id = ? AND latitude IS NOT NULL LIMIT 1`,
      [farmer.id]
    );
    if (farms[0]?.latitude && farms[0]?.longitude) {
      return { lat: Number(farms[0].latitude), lon: Number(farms[0].longitude) };
    }
  } catch (farmErr: any) {
    console.warn('[Orchestrator] Farms table coord lookup notice:', farmErr.message);
  }

  // Fallback: Geocode via OpenWeatherMap Direct Geocoding API
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (apiKey) {
    const locString = [farmer.village, farmer.district, farmer.state, 'IN']
      .filter(Boolean)
      .join(',');
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locString)}&limit=1&appid=${apiKey}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (res.ok) {
        const hits: Array<{ lat: number; lon: number }> = await res.json();
        if (hits?.length > 0) {
          return { lat: hits[0].lat, lon: hits[0].lon };
        }
      }
    } catch (geoErr: any) {
      console.warn(`[Orchestrator] Geocoding lookup failed for "${locString}":`, geoErr.message);
    }
  }

  // Safe default: Baripada, Mayurbhanj district (21.9324° N, 86.7351° E)
  console.log('[Orchestrator] Using Mayurbhanj baseline coordinates (21.9324, 86.7351)');
  return { lat: 21.9324, lon: 86.7351 };
}

/**
 * Pulls current weather and 48-hour rainfall forecast from OpenWeatherMap API.
 */
async function fetchWeather(lat: number, lon: number): Promise<WeatherSignal> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!apiKey) return defaultWeather();

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
    { signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) throw new Error(`OpenWeatherMap HTTP ${res.status}`);

  const data = await res.json();
  const next48h = (data.list as any[]).slice(0, 16); // 16 intervals * 3h = 48h
  const forecastRainfall = next48h.reduce((sum: number, p: any) => sum + (p.rain?.['3h'] ?? 0), 0);
  const current = data.list[0];
  const SEASONAL_BASELINE_MM = 45;

  return {
    temp: current.main.temp,
    humidity: current.main.humidity,
    rainfall: current.rain?.['3h'] ?? 0,
    forecastRainfall,
    rainfallDeficitPct: Math.max(0, ((SEASONAL_BASELINE_MM - forecastRainfall) / SEASONAL_BASELINE_MM) * 100),
  };
}

/**
 * Pulls soil moisture and temperature from Agromonitoring API.
 */
async function fetchSoil(lat: number, lon: number): Promise<SoilSignal> {
  const apiKey = process.env.NEXT_PUBLIC_SOIL_API;
  if (!apiKey) return defaultSoil();

  const res = await fetch(
    `https://api.agromonitoring.com/agro/1.0/soil?lat=${lat}&lon=${lon}&appid=${apiKey}`,
    { signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) return defaultSoil();

  const data = await res.json();
  return { moisture: data.moisture ?? null, t0: data.t0 ?? null, t10: data.t10 ?? null };
}

/**
 * Pulls real-time APMC Mandi modal price for the specified crop & district from Data.gov.in.
 */
async function fetchMandiPrice(cropName: string, district: string): Promise<MandiSignal | null> {
  const apiKey = process.env.NEXT_PUBLIC_MANDI_PRICE;
  if (!apiKey) return null;

  const url =
    `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070` +
    `?api-key=${apiKey}&filters[district]=${encodeURIComponent(district)}` +
    `&filters[commodity]=${encodeURIComponent(cropName)}&format=json&limit=1`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;

  const data = await res.json();
  const row = data.records?.[0];
  if (!row) return null;

  return {
    modalPrice: Number(row.modal_price),
    minPrice: Number(row.min_price),
    msp: Number(row.msp ?? row.modal_price),
  };
}

/**
 * Persists raw weather observations into weather_observations table.
 */
async function persistWeather(farmerId: string, district: string, w: WeatherSignal) {
  const obsId = `OBS_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
  await query(
    `INSERT INTO weather_observations 
       (id, farmer_id, district, temperature, rainfall, forecast_rainfall, humidity, recorded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [obsId, farmerId, district, w.temp, w.rainfall, w.forecastRainfall, w.humidity]
  );
}

/**
 * Persists mandi price observations into mandi_prices table.
 */
async function persistMandi(cropId: string, district: string, m: MandiSignal) {
  const mandiId = `MND_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
  await query(
    `INSERT INTO mandi_prices
       (id, crop_name, market_name, district, modal_price, min_price, msp, recorded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [mandiId, cropId, `${district} APMC Mandi`, district, m.modalPrice, m.minPrice, m.msp]
  );
}

const LANG_LABELS: Record<string, string> = {
  hi: 'Hindi',
  te: 'Telugu',
  bn: 'Bengali',
  ta: 'Tamil',
  ur: 'Urdu',
  or: 'Odia',
  en: 'English',
};

/**
 * Generates an SMS-ready plain-language advisory using NVIDIA NIM (Llama 3.1 70B Instruct).
 */
async function generateAiExplanation(ctx: {
  farmer: FarmerRow;
  crop: CropRow | null;
  distress: ComputedDistressScore;
  trend: string;
  action: RemediationAction;
  weather: WeatherSignal;
  mandi: MandiSignal | null;
  loanDueDateStr: string | null;
}): Promise<string> {
  const langName = LANG_LABELS[ctx.farmer.language] || 'English';
  const cropInfo = ctx.crop
    ? `${ctx.crop.name} (${ctx.crop.stage ?? 'Vegetative'})`
    : 'Paddy';

  try {
    const aiText = await callNimText({
      systemPrompt:
        `You are an agricultural extension officer writing a concise SMS advisory for an Indian farmer. ` +
        `Write ONLY in ${langName} (language code: ${ctx.farmer.language}). ` +
        `Keep it under 140 characters. Be concrete, actionable, no jargon, no emojis, no markdown.`,
      userPrompt:
        `Farmer: ${ctx.farmer.name}. Village: ${ctx.farmer.village}, ${ctx.farmer.district}. ` +
        `Crop: ${cropInfo}. Distress score: ${ctx.distress.score}/100 (${ctx.distress.riskLevel}). ` +
        `Primary driver: ${ctx.action.primaryDriver}. Action: ${ctx.action.summary}. ` +
        `Forecast rain: ${ctx.weather.forecastRainfall.toFixed(1)}mm. ` +
        `${ctx.mandi ? `Mandi: Rs${ctx.mandi.modalPrice}/qtl vs MSP Rs${ctx.mandi.msp}/qtl.` : ''} ` +
        `${ctx.loanDueDateStr ? `Loan due: ${ctx.loanDueDateStr}.` : ''}`,
      responseJson: false,
      temperature: 0.3,
      maxTokens: 150,
    });

    if (aiText && aiText.trim().length > 0) {
      return aiText.trim().slice(0, 160);
    }
  } catch (err: any) {
    console.warn('[Orchestrator] NIM call failed, using template fallback:', err.message);
  }

  // Multilingual template fallback
  const lang = ctx.farmer.language || 'en';
  if (lang === 'hi') {
    return `[SmartCrop] ${ctx.farmer.name}: sankat score ${ctx.distress.score}/100. ${ctx.action.summary}`;
  }
  if (lang === 'or') {
    return `[SmartCrop] ${ctx.farmer.name}: sankata score ${ctx.distress.score}/100. ${ctx.action.summary}`;
  }
  return `[SmartCrop] ${ctx.farmer.name}: Distress score ${ctx.distress.score}/100. ${ctx.action.summary}`;
}

function classifyBand(score: number): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
  if (score >= 86) return 'CRITICAL';
  if (score >= 71) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
}

function defaultWeather(): WeatherSignal {
  return { temp: 28, humidity: 70, rainfall: 0, forecastRainfall: 0, rainfallDeficitPct: 100 };
}

function defaultSoil(): SoilSignal {
  return { moisture: null, t0: null, t10: null };
}
