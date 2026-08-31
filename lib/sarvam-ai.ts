const SARVAM_API_KEY =
  process.env.SARVAM_API_KEY ||
  process.env.NEXT_PUBLIC_SARVAM_API_KEY ||
  'sk_cp3z4img_VFPPoSzUXLUZj1hE1WbH8o0O';

/**
 * Mapping from short codes to Sarvam AI language codes (BCP-47)
 */
export const SARVAM_LANGUAGE_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  or: 'od-IN',
  od: 'od-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  as: 'as-IN',
  ur: 'ur-IN',
  ne: 'ne-IN',
  sa: 'sa-IN',
  mai: 'mai-IN',
  sd: 'sd-IN',
  ks: 'ks-IN',
  kok: 'kok-IN',
  mni: 'mni-IN',
  brx: 'brx-IN',
  doi: 'doi-IN',
  sat: 'sat-IN',
};

export interface TranslateOptions {
  input: string;
  sourceLanguageCode?: string;
  targetLanguageCode: string;
  model?: string;
}

/**
 * Translate text using Sarvam AI Indic REST API (Supports all 22 Official Scheduled Indian Languages)
 */
export async function translateWithSarvam({
  input,
  sourceLanguageCode = 'en-IN',
  targetLanguageCode,
  model = 'mayura:v1',
}: TranslateOptions) {
  const sourceCode = SARVAM_LANGUAGE_MAP[sourceLanguageCode] || sourceLanguageCode;
  const targetCode = SARVAM_LANGUAGE_MAP[targetLanguageCode] || targetLanguageCode;

  if (!SARVAM_API_KEY) {
    return {
      success: false,
      error: 'Sarvam API key is not configured',
      translatedText: input,
    };
  }

  try {
    const res = await fetch('https://api.sarvam.ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY,
      },
      body: JSON.stringify({
        input,
        source_language_code: sourceCode,
        target_language_code: targetCode,
        model,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Sarvam API returned HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return {
      success: true,
      translatedText: data.translated_text || data.translation || input,
      raw: data,
    };
  } catch (error: any) {
    console.error('Sarvam AI Translation Error:', error);
    return {
      success: false,
      error: error.message || 'Sarvam AI translation error',
      translatedText: input,
    };
  }
}

/**
 * Generate Voice Audio (Text to Speech) using Sarvam AI REST API
 */
export async function textToSpeechWithSarvam({
  text,
  targetLanguageCode = 'hi-IN',
  speaker = 'priya',
  model = 'bulbul:v3',
}: {
  text: string;
  targetLanguageCode?: string;
  speaker?: string;
  model?: string;
}) {
  const targetCode = SARVAM_LANGUAGE_MAP[targetLanguageCode] || targetLanguageCode;

  if (!SARVAM_API_KEY) {
    return {
      success: false,
      error: 'Sarvam API key is not configured',
    };
  }

  try {
    const res = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY,
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: targetCode,
        speaker,
        model,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Sarvam TTS returned HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return {
      success: true,
      audios: data.audios || [],
      raw: data,
    };
  } catch (error: any) {
    console.error('Sarvam AI TTS Error:', error);
    return {
      success: false,
      error: error.message || 'Sarvam AI TTS error',
    };
  }
}

