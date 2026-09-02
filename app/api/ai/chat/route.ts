import { NextRequest, NextResponse } from 'next/server';
import { 
  generateAIChatResponse,
  generateProactiveGreeting,
  generateRiskDrilldownResponse,
  generateMarketTimingResponse,
  generatePhotoDiagnosisResponse
} from '@/lib/nvidia-nim';
import { checkRateLimit } from '@/lib/rate-limiter';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local-client';
    const rateCheck = checkRateLimit(`chat-${ip}`, { limit: 40, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please wait a moment before sending another query.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, message, imageBase64, mimeType } = body;
    const context = body.context || {};

    // If farmerId is passed, try to fetch real DB farm context if available
    if (context.farmerId && !context.cropName) {
      try {
        const cropRes: any = await query(
          `SELECT c.name, c.stage, fm.area as area_acres 
           FROM crops c 
           LEFT JOIN farms fm ON c.farmer_id = fm.farmer_id 
           WHERE c.farmer_id = ? 
           ORDER BY c.sowing_date DESC 
           LIMIT 1`,
          [context.farmerId]
        );
        if (cropRes && cropRes.length > 0) {
          context.cropName = cropRes[0].name;
          context.stage = cropRes[0].stage;
          context.areaAcres = cropRes[0].area_acres;
        }
      } catch {
        // Fallback to client-provided context
      }
    }

    // 1. Proactive Check-in Greeting
    if (action === 'proactive_checkin') {
      const answer = await generateProactiveGreeting(context);
      return NextResponse.json({ success: true, answer, type: 'proactive_checkin' });
    }

    // 2. "Why am I at risk?" Conversational Drilldown
    if (action === 'risk_drilldown') {
      const answer = await generateRiskDrilldownResponse(context);
      return NextResponse.json({ success: true, answer, type: 'risk_drilldown' });
    }

    // 3. "Should I sell now or wait?" Market Timing
    if (action === 'market_timing') {
      const answer = await generateMarketTimingResponse(context);
      return NextResponse.json({ success: true, answer, type: 'market_timing' });
    }

    // 4. Photo-Based Crop Diagnosis
    if (action === 'photo_diagnosis' || imageBase64) {
      if (!imageBase64) {
        return NextResponse.json({ success: false, error: 'Image data is required for diagnosis' }, { status: 400 });
      }
      const answer = await generatePhotoDiagnosisResponse({
        imageBase64,
        mimeType: mimeType || 'image/jpeg',
        cropName: context?.cropName || 'Swarna Paddy',
        symptoms: message || 'Leaf spots and chlorosis',
        language: context?.language || 'English',
        languageCode: context?.languageCode || 'en',
      });
      return NextResponse.json({ success: true, answer, type: 'photo_diagnosis' });
    }

    // 5. General Conversational Chat
    const queryText = message || 'What fertilizer should I apply for yellowing leaves?';
    const answer = await generateAIChatResponse(queryText, context);
    return NextResponse.json({ success: true, answer, type: 'general_chat' });
  } catch (err: any) {
    console.error('[AI Chat Route Error]:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal AI Error' }, { status: 500 });
  }
}

