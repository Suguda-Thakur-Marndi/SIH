'use client';

import React, { useState } from 'react';

interface VoiceButtonProps {
  textToRead: string;
  language?: string;
  className?: string;
  label?: string;
}

const mapStateToLanguage = (state: string): { code: string, voiceLang: string, labelName: string } => {
  const s = state.toLowerCase();
  if (s.includes('odisha') || s.includes('orissa')) return { code: 'or', voiceLang: 'or-IN', labelName: 'Odia' };
  if (s.includes('maharashtra')) return { code: 'mr', voiceLang: 'mr-IN', labelName: 'Marathi' };
  if (s.includes('gujarat')) return { code: 'gu', voiceLang: 'gu-IN', labelName: 'Gujarati' };
  if (s.includes('west bengal')) return { code: 'bn', voiceLang: 'bn-IN', labelName: 'Bengali' };
  if (s.includes('punjab')) return { code: 'pa', voiceLang: 'pa-IN', labelName: 'Punjabi' };
  if (s.includes('karnataka')) return { code: 'kn', voiceLang: 'kn-IN', labelName: 'Kannada' };
  if (s.includes('tamil nadu')) return { code: 'ta', voiceLang: 'ta-IN', labelName: 'Tamil' };
  if (s.includes('kerala')) return { code: 'ml', voiceLang: 'ml-IN', labelName: 'Malayalam' };
  if (s.includes('andhra') || s.includes('telangana')) return { code: 'te', voiceLang: 'te-IN', labelName: 'Telugu' };
  if (s.includes('assam')) return { code: 'as', voiceLang: 'as-IN', labelName: 'Assamese' };
  return { code: 'hi', voiceLang: 'hi-IN', labelName: 'Hindi' };
};

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  textToRead,
  language = 'or-IN',
  className = '',
  label: initialLabel = 'Listen in Odia (ଶୁଣନ୍ତୁ)',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicLabel, setDynamicLabel] = useState(initialLabel);
  const [cachedTranslation, setCachedTranslation] = useState<{ text: string, voiceLang: string } | null>(null);

  // We can try to get the user's general location (without high accuracy) silently if permission was already granted,
  // but it's safer to just get it on click.

  const handleToggle = async () => {
    if (isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    // If we already translated it, just speak
    if (cachedTranslation) {
      speak(cachedTranslation.text, cachedTranslation.voiceLang);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Get location
      let stateName = 'Odisha'; // default fallback
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        const { latitude, longitude } = position.coords;
        // 2. Reverse geocode to get state
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          stateName = geoData.principalSubdivision || geoData.city || 'Odisha';
        }
      } catch (e) {
        console.warn('Geolocation failed or denied. Falling back to default region.', e);
      }

      // 3. Map state to language
      const langConfig = mapStateToLanguage(stateName);
      setDynamicLabel(`Listen in ${langConfig.labelName}`);

      // 4. Translate text
      const translateRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToRead, targetLanguage: langConfig.code })
      });

      let finalAudioText = textToRead;
      if (translateRes.ok) {
        const data = await translateRes.json();
        if (data.translatedText) {
          finalAudioText = data.translatedText;
        }
      }

      setCachedTranslation({ text: finalAudioText, voiceLang: langConfig.voiceLang });
      setIsLoading(false);
      
      // 5. Speak
      speak(finalAudioText, langConfig.voiceLang);

    } catch (e) {
      console.error('Failed to translate and speak', e);
      setIsLoading(false);
      // Fallback to original text
      speak(textToRead, language);
    }
  };

  const speak = (text: string, voiceLang: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceLang;
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 4000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold backdrop-blur-md transition-all duration-200 cursor-pointer min-h-[44px] shadow-sm ${
        isPlaying || isLoading
          ? 'bg-[#CFE362] text-[#1A1A1A] border border-[#b8ce4e] shadow-md'
          : 'bg-white/80 hover:bg-white text-[#1A1A1A] border border-gray-200 hover:border-gray-300'
      } ${className}`}
    >
      {isLoading ? (
        <div className="w-3 h-3 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin"></div>
      ) : isPlaying ? (
        <div className="flex items-center gap-1">
          <span className="w-1 h-3 bg-[#1A1A1A] animate-bounce rounded-full" />
          <span className="w-1 h-4 bg-[#1A1A1A] animate-bounce delay-75 rounded-full" />
          <span className="w-1 h-2 bg-[#1A1A1A] animate-bounce delay-150 rounded-full" />
        </div>
      ) : (
        <span className="text-base">🔊</span>
      )}
      <span>
        {isLoading 
          ? 'Translating...' 
          : isPlaying 
            ? 'Playing Narration...' 
            : dynamicLabel}
      </span>
    </button>
  );
};

export default VoiceButton;
