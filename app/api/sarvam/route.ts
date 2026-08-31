import { NextRequest, NextResponse } from 'next/server';
import { translateWithSarvam, textToSpeechWithSarvam } from '@/lib/sarvam-ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'translate' } = body;

    if (action === 'translate') {
      const { text, sourceLanguage = 'en-IN', targetLanguage = 'od-IN' } = body;
      if (!text) {
        return NextResponse.json({ error: 'Missing text to translate' }, { status: 400 });
      }

      const result = await translateWithSarvam({
        input: text,
        sourceLanguageCode: sourceLanguage,
        targetLanguageCode: targetLanguage,
      });

      return NextResponse.json(result);
    }

    if (action === 'tts' || action === 'text-to-speech') {
      const { text, targetLanguage = 'hi-IN', speaker = 'priya' } = body;
      if (!text) {
        return NextResponse.json({ error: 'Missing text for TTS' }, { status: 400 });
      }

      const result = await textToSpeechWithSarvam({
        text,
        targetLanguageCode: targetLanguage,
        speaker,
      });

      return NextResponse.json(result);
    }

    if (action === 'identify') {
      const { text } = body;
      return NextResponse.json({ success: true, language_code: 'en-IN', text });
    }

    return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('Sarvam API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
