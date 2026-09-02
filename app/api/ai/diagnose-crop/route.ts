import { NextRequest, NextResponse } from 'next/server';
import { generatePhotoDiagnosisResponse } from '@/lib/nvidia-nim';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local-client';
    const rateCheck = checkRateLimit(`diagnose-${ip}`, { limit: 20, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded for image diagnosis. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { imageBase64, mimeType = 'image/jpeg', cropName = 'Paddy (Swarna)', symptoms = '', language = 'English', languageCode = 'en' } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'Image data (base64) is required for crop diagnosis.' },
        { status: 400 }
      );
    }

    const diagnosis = await generatePhotoDiagnosisResponse({
      imageBase64,
      mimeType,
      cropName,
      symptoms,
      language,
      languageCode,
    });

    return NextResponse.json({
      success: true,
      data: {
        diagnosis,
        cropName,
        diagnosedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[Crop Diagnosis API Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process crop diagnosis image.' },
      { status: 500 }
    );
  }
}
