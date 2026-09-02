import { NextRequest, NextResponse } from 'next/server';
import { speechToText, textToSpeech, translateText } from '@/lib/sarvam';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local-client';
    const rateCheck = checkRateLimit(`sarvam-${ip}`, { limit: 40, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded for voice/translation services.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || body.action || 'tts';

    // 1. Speech to Text (STT)
    if (mode === 'stt' || mode === 'speech-to-text') {
      const { audioBase64, languageCode = 'od-IN', model = 'saaras:v2' } = body;
      if (!audioBase64) {
        return NextResponse.json({ success: false, error: 'Missing audioBase64 for STT' }, { status: 400 });
      }

      const result = await speechToText({
        audioBase64,
        languageCode,
        model,
      });

      return NextResponse.json(result);
    }

    // 2. Text to Speech (TTS)
    if (mode === 'tts' || mode === 'text-to-speech') {
      const { text, targetLanguage = 'hi-IN', speaker = 'priya', model = 'bulbul:v3' } = body;
      if (!text) {
        return NextResponse.json({ success: false, error: 'Missing text for TTS' }, { status: 400 });
      }

      const result = await textToSpeech({
        text,
        targetLanguageCode: targetLanguage,
        speaker,
        model,
      });

      return NextResponse.json(result);
    }

    // 3. Indic Translation
    if (mode === 'translate') {
      const { text, input, sourceLanguage = 'en-IN', targetLanguage = 'od-IN', model = 'mayura:v1' } = body;
      const inputText = text || input;
      if (!inputText) {
        return NextResponse.json({ success: false, error: 'Missing text to translate' }, { status: 400 });
      }

      const result = await translateText({
        input: inputText,
        sourceLanguageCode: sourceLanguage,
        targetLanguageCode: targetLanguage,
        model,
      });

      return NextResponse.json(result);
    }

    // 4. Identify / Heartbeat
    if (mode === 'identify') {
      const { text } = body;
      return NextResponse.json({ success: true, language_code: 'en-IN', text });
    }

    return NextResponse.json({ success: false, error: `Unsupported mode/action: ${mode}` }, { status: 400 });
  } catch (error: any) {
    console.error('Sarvam API Route Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
