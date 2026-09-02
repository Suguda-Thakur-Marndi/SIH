import { NextRequest, NextResponse } from 'next/server';
import { generateAlternativeCropRecommendations } from '@/lib/nvidia-nim';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local-client';
    const rateCheck = checkRateLimit(`alt-crop-${ip}`, { limit: 30, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const context = {
      currentCrop: body.currentCrop || 'Paddy (Paddy Field 2)',
      soilType: body.soilType || 'Red Loamy Soil',
      waterAvailability: body.waterAvailability || 'Low-Medium (Canal Deficit)',
      district: body.district || 'Mayurbhanj, Odisha',
      language: body.language || 'English',
      languageCode: body.languageCode || 'en',
    };

    const recommendations = await generateAlternativeCropRecommendations(context);
    return NextResponse.json({ success: true, data: recommendations });
  } catch (err: any) {
    console.error('[Alternative Crop API Error]:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal AI Error' }, { status: 500 });
  }
}
