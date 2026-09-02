'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Sprout,
} from 'lucide-react';
import { CROPS_GUIDE_DATA } from '@/lib/cropGuideData';
import AIChatSkeleton from '@/components/skeletons/AIChatSkeleton';
import { useBandwidth } from '@/lib/bandwidth-context';
import { DataSaverToggle } from '@/components/DataSaverToggle';

import { useLanguage } from '@/lib/language-context';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

function AiChatPageContent() {
  const searchParams = useSearchParams();
  const cropParam = searchParams.get('crop')?.toLowerCase() || 'paddy';
  const { isLiteMode } = useBandwidth();
  const { language } = useLanguage();

  const [selectedCropKey, setSelectedCropKey] = useState<string>(
    CROPS_GUIDE_DATA[cropParam] ? cropParam : 'paddy'
  );
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(!isLiteMode);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (isLiteMode) {
      setAutoSpeak(false);
    }
  }, [isLiteMode]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const activeCrop = CROPS_GUIDE_DATA[selectedCropKey] || CROPS_GUIDE_DATA.paddy;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: `🌾 **Namaste! I am your Smart Crop AI Voice Agronomist.**\n\nI am powered by **NVIDIA NIM AI (Llama 3.1 70B)** and configured for **${activeCrop.name}** in **Mayurbhanj, Odisha**.\n\n🎤 **Voice is Live!**\n- Tap the **Microphone** below to speak your question.\n- All answers are automatically read aloud via **Sarvam AI Voice Synthesis**.\n- Ask about DAP/Gypsum dosage, stem borer defense, or water savings!\n\nHow can I assist your farm today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSpeak = useCallback(async (id: string, text: string) => {
    // 1. If currently speaking this message, stop it
    if (speakingMessageId === id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setSpeakingMessageId(null);
      return;
    }

    // Stop any ongoing audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    setSpeakingMessageId(id);

    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/👉/g, '')
      .replace(/🥜|🌾|🌱|💧|🧪|🛡️|💰|🤖|⚠️/g, '')
      .slice(0, 450); // Keep TTS payload compact and fast

    // 2. Primary: Try Sarvam AI Neural Indic TTS via /api/sarvam
    if (!isLiteMode) {
      try {
        const ttsRes = await fetch('/api/sarvam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'tts',
            text: cleanText,
            targetLanguage: language || 'od-IN',
          }),
        });

        if (ttsRes.ok) {
          const ttsData = await ttsRes.json();
          const base64Audio = ttsData.audioBase64 || ttsData.audios?.[0];
          if (base64Audio) {
            const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
            audioPlayerRef.current = audio;
            audio.onended = () => {
              setSpeakingMessageId(null);
              audioPlayerRef.current = null;
            };
            audio.onerror = () => {
              setSpeakingMessageId(null);
              audioPlayerRef.current = null;
            };
            await audio.play();
            return;
          }
        }
      } catch (sarvamErr) {
        console.warn('[Sarvam AI TTS playback failed, falling back to Web Speech]:', sarvamErr);
      }
    }

    // 3. Fallback: Browser Web SpeechSynthesis
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = synthRef.current.getVoices();
      const indianVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().includes('en-in') ||
          v.lang.toLowerCase().includes('hi-in') ||
          v.name.toLowerCase().includes('india')
      );
      if (indianVoice) utterance.voice = indianVoice;
      utterance.lang = indianVoice?.lang || 'en-IN';
      utterance.rate = 1.0;

      utterance.onstart = () => setSpeakingMessageId(id);
      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = () => setSpeakingMessageId(null);
      synthRef.current.speak(utterance);
    } else {
      setSpeakingMessageId(null);
    }
  }, [speakingMessageId, language, isLiteMode]);

  const handleSend = useCallback(async (queryOverride?: string) => {
    const query = (queryOverride || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          context: {
            cropName: activeCrop.name,
            cropId: activeCrop.id,
            district: 'Mayurbhanj, Odisha',
            language: language,
            languageCode: language,
          },
        }),
      }).catch(() => null);

      let aiReply = '';
      if (res && res.ok) {
        const data = await res.json();
        if (data.answer) aiReply = data.answer;
      }

      if (!aiReply) {
        const lower = query.toLowerCase();
        if (lower.includes('groundnut') || lower.includes('ବାଦାମ')) {
          aiReply = `🥜 **Groundnut Cultivation Protocol:**\n\n1. **Gypsum Importance**: Apply 100 kg/acre Gypsum at 45 DAS (pegging stage). This prevents empty pods and boosts kernel oil.\n2. **Water Requirement**: 58% lower water than Paddy. Irrigate at Flowering, Pegging, and Podding.\n3. **Tikka Disease**: Spray Hexaconazole 5% EC @ 2ml/L on leaf spots.\n4. **Net Profit**: ₹42,500/acre at ₹6,780/Qtl MSP.`;
        } else if (lower.includes('paddy') || lower.includes('ଧାନ')) {
          aiReply = `🌾 **Paddy Management Protocol:**\n\n1. **AWD Irrigation**: Alternate wetting and drying saves up to 30% water and strengthens tillers.\n2. **Stem Borer**: Install 4 pheromone traps/acre. Spray Chlorantraniliprole 18.5% SC @ 60ml/acre for dead hearts.\n3. **Top Dressing**: 15kg Urea + 5kg Zinc Sulphate at 15-20 DAT.`;
        } else {
          aiReply = `🌱 **Agronomic Advice for ${activeCrop.name}:**\n\nEnsure proper row spacing, timely nutrient application, and regular scouting for insect pests. Irrigate during evening hours to minimize evaporation.`;
        }
      }

      const aiMsgId = `ai-${Date.now()}`;
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        sender: 'ai',
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (autoSpeak) {
        setTimeout(() => handleSpeak(aiMsgId, aiReply), 200);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `🌱 Recommended practice for **${activeCrop.name}**: Maintain optimal soil moisture, apply balanced NPK, and scout regularly for pests.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, activeCrop.name, activeCrop.id, autoSpeak, handleSpeak, language]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'en-IN';
        recognitionRef.current.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
          if (transcript.trim().length > 3) {
            handleSend(transcript);
          }
        };
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, [handleSend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        if (synthRef.current && synthRef.current.speaking) {
          synthRef.current.cancel();
        }
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const sampleQuestions = [
    { label: '🥜 Why switch to Groundnut?', query: 'Why is Groundnut more profitable than Paddy in Mayurbhanj?' },
    { label: '🧪 Gypsum dosage & timing', query: 'What is the correct dosage and timing of Gypsum for Groundnut?' },
    { label: '🐛 Yellow stem borer in Paddy', query: 'How to control yellow stem borer dead hearts in Paddy?' },
    { label: '💧 Water saving AWD method', query: 'Explain how Alternate Wetting and Drying (AWD) works in rice.' },
    { label: '🌼 Mustard Aphid remedy', query: 'What is the chemical spray dosage for mustard aphids?' },
    { label: '💰 Mandi MSP rates', query: 'What are the current MSP procurement rates for Paddy and Groundnut in Odisha?' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/40 to-lime-50 text-slate-900 p-3 sm:p-6 md:p-8 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full space-y-4 flex-1 flex flex-col">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-800 bg-white/90 hover:bg-white px-3.5 py-2 rounded-xl shadow-xs border border-emerald-200 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/full-crop-guide"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 px-3.5 py-2 rounded-xl border border-teal-200 transition-all"
            >
              <Sprout className="w-3.5 h-3.5 text-teal-600" />
              Full Crop Guide
            </Link>
            <Link
              href="/alternative-crop"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 rounded-xl border border-amber-200 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Alternative Crops
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* 2G Data Saver Mode Toggle */}
            <DataSaverToggle />

            <button
              onClick={() => {
                setAutoSpeak(!autoSpeak);
                if (synthRef.current && synthRef.current.speaking) {
                  synthRef.current.cancel();
                }
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                autoSpeak
                  ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs font-extrabold'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{autoSpeak ? 'Auto Voice ON 🔊' : 'Voice Muted 🔇'}</span>
            </button>

            <span className="text-xs font-extrabold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full border border-emerald-300">
              🤖 NVIDIA AI
            </span>
          </div>
        </div>

        {/* Header Banner & Crop Switcher */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/80 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center text-2xl shadow-md shadow-emerald-700/20">
                🤖
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  Smart Crop AI Voice Agronomist
                </h1>
                <p className="text-xs text-slate-600">
                  Speak directly or ask farming questions in English &amp; Odia with NVIDIA AI.
                </p>
              </div>
            </div>

            {/* Active Crop Selector Pill */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-400 mr-1">Context:</span>
              {Object.values(CROPS_GUIDE_DATA).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCropKey(c.id)}
                  className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    c.id === selectedCropKey
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {c.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q.query)}
              className="shrink-0 text-xs font-bold bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-700 hover:border-emerald-400 px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs transition-all"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Speaking Waveform Banner */}
        {speakingMessageId && (
          <div className="bg-amber-500 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md animate-pulse">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>Speaking agricultural advice aloud... (ଭଏସ୍ ବାଜୁଛି)</span>
            </div>
            <button
              onClick={() => {
                if (synthRef.current) synthRef.current.cancel();
                setSpeakingMessageId(null);
              }}
              className="text-[11px] bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg"
            >
              Stop Voice ⏹️
            </button>
          </div>
        )}

        {/* Mic Active Listening Banner */}
        {isListening && (
          <div className="bg-red-500 text-white px-4 py-3 rounded-2xl text-xs font-black flex items-center justify-between shadow-lg shadow-red-500/30 animate-pulse">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 animate-ping" />
              <span>Listening to your voice... Speak now! (ଆପଣଙ୍କ ପ୍ରଶ୍ନ କୁହନ୍ତୁ)</span>
            </div>
            <button
              onClick={toggleMic}
              className="text-[11px] bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg"
            >
              Done / Send
            </button>
          </div>
        )}

        {/* Main Chat Conversation Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-white/80 shadow-md flex-1 flex flex-col justify-between min-h-[420px] max-h-[55vh] overflow-hidden">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((m) => {
              const isAi = m.sender === 'ai';
              const isSpeaking = speakingMessageId === m.id;

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-start gap-3 max-w-[92%] sm:max-w-[85%]">
                    {isAi && (
                      <div className="w-8 h-8 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-sm shrink-0 shadow-2xs mt-0.5">
                        🌾
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isAi
                          ? 'bg-slate-50 text-slate-900 border border-slate-200/90 rounded-tl-xs'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-tr-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line break-words font-medium">{m.text}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1 px-3 text-[10px] text-slate-400">
                    <span>{m.time}</span>
                    {isAi && (
                      <button
                        onClick={() => handleSpeak(m.id, m.text)}
                        className={`inline-flex items-center gap-1 font-bold transition-all px-2 py-0.5 rounded-md ${
                          isSpeaking
                            ? 'bg-amber-100 text-amber-900 font-extrabold ring-1 ring-amber-300'
                            : 'hover:bg-slate-100 text-slate-600 hover:text-emerald-700'
                        }`}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{isSpeaking ? 'Pause' : 'Listen in Audio 🔊'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-3 max-w-[85%] animate-pulse" role="status" aria-busy="true" aria-label="AI analyzing">
                <div className="p-2 rounded-2xl bg-emerald-600 text-white shrink-0 shadow-xs">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="flex-1 space-y-2 p-4 rounded-3xl bg-slate-50 border border-slate-200/90 rounded-tl-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                    <span>AI Agronomist is analyzing agricultural protocols...</span>
                  </div>
                  <div className="h-3.5 w-3/4 rounded bg-slate-300"></div>
                  <div className="h-3.5 w-full rounded bg-slate-200"></div>
                  <div className="h-3.5 w-4/5 rounded bg-slate-200"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="pt-4 border-t border-slate-200 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleMic}
              title={isListening ? 'Stop mic' : 'Click to speak (Voice input)'}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white border-red-600 animate-bounce shadow-lg shadow-red-500/30'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'Listening to your voice... speak now!' : `Speak or type your question about ${activeCrop.name}...`}
              className="flex-1 bg-slate-100 text-slate-900 text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md transition-all cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AiChatPage() {
  return (
    <Suspense fallback={<AIChatSkeleton />}>
      <AiChatPageContent />
    </Suspense>
  );
}
