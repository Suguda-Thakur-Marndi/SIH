/**
 * SmartCrop — Sarvam AI Speech-to-Text (STT), Text-to-Speech (TTS), and Indic Translation
 * Integrates Sarvam AI REST API for 14 major Indic languages.
 */

const SARVAM_API_KEY =
  process.env.SARVAM_API_KEY ||
  process.env.NEXT_PUBLIC_SARVAM_API_KEY ||
  '';

/**
 * Mapping from short codes to Sarvam AI BCP-47 language codes
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
};

export interface STTOptions {
  audioBase64?: string;
  audioBlob?: Blob | Buffer;
  mimeType?: string;
  languageCode?: string;
  model?: string;
}

export interface STTResult {
  success: boolean;
  transcript: string;
  language_code: string;
  error?: string;
}

export interface TTSOptions {
  text: string;
  targetLanguageCode?: string;
  speaker?: string;
  model?: string;
}

export interface TTSResult {
  success: boolean;
  audioBase64?: string;
  audios: string[];
  error?: string;
}

export interface TranslateOptions {
  input: string;
  sourceLanguageCode?: string;
  targetLanguageCode: string;
  model?: string;
}

export interface TranslateResult {
  success: boolean;
  translatedText: string;
  error?: string;
}

/**
 * 1. Speech-to-Text (STT)
 * Transcribes spoken audio into native Indic text.
 */
export async function speechToText({
  audioBase64,
  languageCode = 'od-IN',
  model = 'saaras:v2',
}: STTOptions): Promise<STTResult> {
  const targetCode = SARVAM_LANGUAGE_MAP[languageCode] || languageCode;

  if (!SARVAM_API_KEY) {
    return {
      success: false,
      transcript: '',
      language_code: targetCode,
      error: 'Sarvam API key is not configured',
    };
  }

  if (!audioBase64) {
    return {
      success: false,
      transcript: '',
      language_code: targetCode,
      error: 'No audio data provided for transcription',
    };
  }

  try {
    const cleanBase64 = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;
    const buffer = Buffer.from(cleanBase64, 'base64');
    const blob = new Blob([buffer], { type: 'audio/wav' });

    const formData = new FormData();
    formData.append('file', blob, 'recording.wav');
    formData.append('language_code', targetCode);
    formData.append('model', model);

    const res = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Sarvam STT returned HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return {
      success: true,
      transcript: data.transcript || '',
      language_code: data.language_code || targetCode,
    };
  } catch (error: any) {
    console.error('[Sarvam STT Error]:', error);
    return {
      success: false,
      transcript: '',
      language_code: targetCode,
      error: error.message || 'Speech recognition failed',
    };
  }
}

/**
 * 2. Text-to-Speech (TTS)
 * Synthesizes native spoken audio for Indic languages.
 */
export async function textToSpeech({
  text,
  targetLanguageCode = 'hi-IN',
  speaker = 'priya',
  model = 'bulbul:v3',
}: TTSOptions): Promise<TTSResult> {
  const targetCode = SARVAM_LANGUAGE_MAP[targetLanguageCode] || targetLanguageCode;

  if (!SARVAM_API_KEY) {
    return {
      success: false,
      audios: [],
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
    const audios: string[] = data.audios || [];
    return {
      success: true,
      audioBase64: audios[0] || '',
      audios,
    };
  } catch (error: any) {
    console.error('[Sarvam TTS Error]:', error);
    return {
      success: false,
      audios: [],
      error: error.message || 'Text-to-speech synthesis failed',
    };
  }
}

/**
 * 3. Neural Indic Translation
 */
export async function translateText({
  input,
  sourceLanguageCode = 'en-IN',
  targetLanguageCode,
  model = 'mayura:v1',
}: TranslateOptions): Promise<TranslateResult> {
  const sourceCode = SARVAM_LANGUAGE_MAP[sourceLanguageCode] || sourceLanguageCode;
  const targetCode = SARVAM_LANGUAGE_MAP[targetLanguageCode] || targetLanguageCode;

  if (!SARVAM_API_KEY) {
    return {
      success: false,
      translatedText: input,
      error: 'Sarvam API key is not configured',
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
      throw new Error(`Sarvam Translation returned HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return {
      success: true,
      translatedText: data.translated_text || data.translation || input,
    };
  } catch (error: any) {
    console.error('[Sarvam Translation Error]:', error);
    return {
      success: false,
      translatedText: input,
      error: error.message || 'Translation failed',
    };
  }
}
