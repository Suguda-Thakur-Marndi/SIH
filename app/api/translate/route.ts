import { NextRequest, NextResponse } from 'next/server';
import { translateText } from '@/lib/sarvam';
import { callNimText } from '@/lib/nvidia-nim';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local-client';
    const rateCheck = checkRateLimit(`translate-${ip}`, { limit: 50, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for translation' },
        { status: 429 }
      );
    }

    const { text, targetLanguage, sourceLanguage = 'en' } = await req.json();

    if (!text || !targetLanguage) {
      return NextResponse.json({ error: 'Missing text or targetLanguage' }, { status: 400 });
    }

    if (targetLanguage === 'en' && sourceLanguage === 'en') {
      return NextResponse.json({ translatedText: text, engine: 'identity' });
    }

    // 1. Primary: Sarvam AI Indic Neural Translation (Gold Standard for Indian languages)
    try {
      const sarvamRes = await translateText({
        input: text,
        sourceLanguageCode: sourceLanguage,
        targetLanguageCode: targetLanguage,
      });

      if (sarvamRes.success && sarvamRes.translatedText && sarvamRes.translatedText !== text) {
        return NextResponse.json({
          translatedText: sarvamRes.translatedText,
          engine: 'sarvamai',
        });
      }
    } catch (sErr) {
      console.warn('[Sarvam AI Translation failed, trying NIM fallback]:', sErr);
    }

    // 2. Secondary: NVIDIA NIM Llama 3.1 70B Translation Fallback
    try {
      const nimPrompt = `Translate the following agricultural text into target language code "${targetLanguage}".
Text: "${text}"
Output ONLY the translated text, with no explanations or quote marks.`;

      const nimTranslated = await callNimText({
        systemPrompt: 'You are an accurate multilingual translator for Indian languages. Output ONLY the raw translation.',
        userPrompt: nimPrompt,
        responseJson: false,
        temperature: 0.1,
      });

      if (nimTranslated && nimTranslated.trim().length > 0) {
        return NextResponse.json({
          translatedText: nimTranslated.trim(),
          engine: 'nvidia-nim',
        });
      }
    } catch (nimErr) {
      console.warn('[NVIDIA NIM Translation fallback failed]:', nimErr);
    }

    // 3. Tertiary Web Fallback
    try {
      const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLanguage)}&tl=${encodeURIComponent(targetLanguage)}&dt=t&q=${encodeURIComponent(text)}`;
      const gRes = await fetch(gUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      });
      if (gRes.ok) {
        const gData = await gRes.json();
        if (Array.isArray(gData) && Array.isArray(gData[0])) {
          const translated = gData[0].map((item: any) => item[0]).join('');
          if (translated && !translated.toLowerCase().includes('error')) {
            return NextResponse.json({ translatedText: translated, engine: 'google' });
          }
        }
      }
    } catch (gErr) {
      console.warn('[Google Translate Fallback failed]:', gErr);
    }

    // Default: return original text
    return NextResponse.json({ translatedText: text, engine: 'fallback-original' });
  } catch (error: any) {
    console.error('Translation route error:', error);
    return NextResponse.json({ translatedText: '', error: error.message }, { status: 500 });
  }
}
