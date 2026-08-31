'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

interface CropAudioPlayerProps {
  odiaText: string;
  englishText: string;
  title?: string;
  className?: string;
  compact?: boolean;
}

export default function CropAudioPlayer({
  odiaText,
  englishText,
  title = 'Listen in Odia (ଓଡ଼ିଆରେ ଶୁଣନ୍ତୁ)',
  className = '',
  compact = false,
}: CropAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [lang, setLang] = useState<'odia' | 'english'>('odia');
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      setHasSpeechSupport(false);
    }

    return () => {
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const stopAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
  };

  const playAudio = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const textToSpeak = lang === 'odia' ? odiaText : englishText;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // Detect best matching voice (Hindi/Odia/Indian English)
    const voices = synthRef.current.getVoices();
    if (lang === 'odia') {
      const odiaVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().includes('or') ||
          v.lang.toLowerCase().includes('od') ||
          v.lang.toLowerCase().includes('hi') ||
          v.name.toLowerCase().includes('india')
      );
      if (odiaVoice) utterance.voice = odiaVoice;
      utterance.lang = odiaVoice?.lang || 'hi-IN';
    } else {
      const enVoice = voices.find(
        (v) => v.lang.toLowerCase().includes('en-in') || v.lang.toLowerCase().includes('en')
      );
      if (enVoice) utterance.voice = enVoice;
      utterance.lang = enVoice?.lang || 'en-IN';
    }

    utterance.rate = playbackRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    synthRef.current.speak(utterance);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (isPlaying) {
      stopAudio();
      setTimeout(playAudio, 100);
    }
  };

  const handleLangToggle = (newLang: 'odia' | 'english') => {
    setLang(newLang);
    if (isPlaying) {
      stopAudio();
    }
  };

  if (!hasSpeechSupport) {
    return null;
  }

  if (compact) {
    return (
      <button
        onClick={togglePlay}
        title="Listen to advisory audio"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
          isPlaying
            ? 'bg-amber-500 text-white animate-pulse shadow-amber-300'
            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
        } ${className}`}
      >
        <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-bounce' : ''}`} />
        <span>{isPlaying ? 'ବାଜୁଛି 🔊 (Playing)' : 'Listen in Odia 🔊'}</span>
      </button>
    );
  }

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border transition-all shadow-sm ${
        isPlaying
          ? 'bg-gradient-to-r from-amber-50 via-orange-50/50 to-emerald-50 border-amber-300 shadow-md ring-2 ring-amber-400/30'
          : 'bg-white/90 backdrop-blur-md border-emerald-200/80'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Title & Animation */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isPlaying ? (
              <Volume2 className="w-5 h-5 animate-pulse" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900">{title}</h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                <Sparkles className="w-2.5 h-2.5" /> AI Odia Voice
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
              {lang === 'odia' ? odiaText : englishText}
            </p>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Toggle */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => handleLangToggle('odia')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                lang === 'odia' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ଓଡ଼ିଆ (Odia)
            </button>
            <button
              onClick={() => handleLangToggle('english')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                lang === 'english' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>

          {/* Speed Selector */}
          <select
            value={playbackRate}
            onChange={(e) => handleRateChange(parseFloat(e.target.value))}
            className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
          >
            <option value="0.8">0.8x</option>
            <option value="1.0">1.0x</option>
            <option value="1.2">1.2x</option>
          </select>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Listen 🔊</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Waveform Indicator when playing */}
      {isPlaying && (
        <div className="mt-3 pt-3 border-t border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="w-1 h-3 bg-amber-500 rounded-full animate-bounce"></span>
            <span className="w-1 h-5 bg-amber-600 rounded-full animate-bounce [animation-delay:0.15s]"></span>
            <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
            <span className="w-1 h-6 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.45s]"></span>
            <span className="w-1 h-3 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="text-xs font-bold text-amber-900 ml-2">
              ଓଡ଼ିଆ ସ୍ୱରରେ ବର୍ଣ୍ଣନା କରାଯାଉଛି (Playing audio advisory...)
            </span>
          </div>
          <button
            onClick={() => {
              stopAudio();
              playAudio();
            }}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Replay
          </button>
        </div>
      )}
    </div>
  );
}
