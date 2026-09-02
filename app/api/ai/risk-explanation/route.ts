import { NextRequest, NextResponse } from 'next/server';
import { generateRiskExplanation } from '@/lib/nvidia-nim';
import { checkRateLimit } from '@/lib/rate-limiter';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local-client';
    const rateCheck = checkRateLimit(`risk-expl-${ip}`, { limit: 30, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const context = {
      cropName: body.cropName || body.crop || 'Paddy (Swarna)',
      riskScore: body.riskScore ?? body.overall_score ?? 78,
      weatherRisk: body.weatherRisk ?? body.rainfall_risk ?? 68,
      marketRisk: body.marketRisk ?? body.market_risk ?? 42,
      loanRisk: body.loanRisk ?? body.loan_risk ?? 15,
      soilMoisture: body.soilMoisture || '24% (Deficit)',
      district: body.district || 'Mayurbhanj, Odisha',
      language: body.language || 'English',
      languageCode: body.languageCode || 'en',
    };

    const explanation = await generateRiskExplanation(context);

    // If farmerId or riskScoreId is passed, persist explanation to risk_scores table
    const farmerId = body.farmerId || body.farmer_id;
    if (farmerId && explanation?.ai_explanation) {
      try {
        await query(
          'UPDATE risk_scores SET ai_explanation = ? WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1',
          [explanation.ai_explanation, farmerId]
        );
      } catch {
        // Non-fatal if DB is offline or mock mode
      }
    }

    return NextResponse.json({ success: true, data: explanation });
  } catch (err: any) {
    console.error('[Risk Explanation API Error]:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal AI Error' }, { status: 500 });
  }
}

