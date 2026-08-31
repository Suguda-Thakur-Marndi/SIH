'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  stageTag?: string;
}

interface CropAiChatbotProps {
  currentCropName?: string;
  currentCropId?: string;
  currentStageName?: string;
  className?: string;
}

export default function CropAiChatbot({
  currentCropName = 'Paddy / Alternative Crops',
  currentCropId = 'paddy',
  currentStageName = 'Active Cultivation',
  className = '',
}: CropAiChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [voiceLang] = useState<'en-IN' | 'hi-IN' | 'or-IN'>('en-IN');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `🌾 **Namaste! I am your AI Agronomist & Krishi Voice Assistant.**\n\nI am currently monitoring **${currentCropName}** in **Mayurbhanj, Odisha**.\n\n🎤 **Voice is Enabled!**\n- Tap the **Microphone** to speak your question.\n- Tap **Listen 🔊** on any response to hear voice advisory.\n\nHow can I help your farm today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSpeakMessage = useCallback((msgId: string, text: string) => {
    if (!synthRef.current) return;
    if (speakingMessageId === msgId) {
      synthRef.current.cancel();
      setSpeakingMessageId(null);
      return;
    }
    synthRef.current.cancel();

    // Clean markdown formatting before speaking
    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/👉/g, '')
      .replace(/🥜|🌾|🌱|💧|🧪|🛡️|💰/g, '');

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
    utterance.pitch = 1.0;

    utterance.onstart = () => setSpeakingMessageId(msgId);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    synthRef.current.speak(utterance);
  }, [speakingMessageId]);

  const handleSend = useCallback(async (queryText?: string) => {
    const text = (queryText || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            cropName: currentCropName,
            cropId: currentCropId,
            stage: currentStageName,
            district: 'Mayurbhanj, Odisha',
          },
        }),
      }).catch(() => null);

      let aiReply = '';
      if (res && res.ok) {
        const data = await res.json();
        if (data.answer) {
          aiReply = data.answer;
        }
      }

      if (!aiReply) {
        const lower = text.toLowerCase();
        if (lower.includes('groundnut') || lower.includes('ବାଦାମ')) {
          aiReply = `🥜 **Groundnut Cultivation Advisory for Mayurbhanj:**\n\n1. **Gypsum Application**: At 45 DAS (pegging stage), apply 100 kg/acre Gypsum around root zone. This prevents hollow pods and boosts oil content.\n2. **Water Economy**: Requires 58% less water than Paddy. Give 4 critical light irrigations (Flowering, Pegging, Podding).\n3. **Tikka Leaf Spot**: If dark brown spots with yellow halos appear on leaves, spray Hexaconazole 5% EC @ 2ml/L.\n4. **Net Profit**: Average ₹42,500/acre at ₹6,780/Qtl MSP.`;
        } else if (lower.includes('paddy') || lower.includes('ଧାନ')) {
          aiReply = `🌾 **Paddy Management Protocol:**\n\n1. **AWD Irrigation**: Keep 2-3 cm shallow water during tillering, but avoid continuous deep submergence to foster strong root anchoring.\n2. **Stem Borer Protection**: Install 4 pheromone traps per acre. If dead hearts exceed 5%, spray Chlorantraniliprole 18.5% SC @ 60ml/acre.\n3. **Nitrogen Top-Dressing**: Apply 15 kg Urea + 5 kg Zinc Sulphate at 15-20 DAT.`;
        } else if (lower.includes('mustard') || lower.includes('ସୋରିଷ')) {
          aiReply = `🌼 **Mustard Cultivation Advice:**\n\n1. **Sulphur Need**: Apply 10 kg elemental Sulphur during land prep to boost seed oil concentration.\n2. **Thinning**: Thin seedlings at 15 DAS to maintain 10 cm spacing.\n3. **Aphid Control**: If greenish aphids appear on flower clusters, spray Thiamethoxam 25 WG @ 0.4g/L in late afternoon.`;
        } else {
          aiReply = `🌱 **Agronomic Advisory for ${currentCropName}:**\n\nBased on current conditions in Mayurbhanj, ensure regular field scouting, inspect soil moisture before irrigating, and keep drainage bunds intact.`;
        }
      }

      const aiMsgId = `ai-${Date.now()}`;
      const aiMessage: ChatMessage = {
        id: aiMsgId,
        sender: 'ai',
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (autoSpeak) {
        setTimeout(() => handleSpeakMessage(aiMsgId, aiReply), 200);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `🌱 Recommended action for **${currentCropName}**: Ensure balanced soil moisture and maintain proper crop spacing.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, currentCropName, currentCropId, currentStageName, autoSpeak, handleSpeakMessage]);

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
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = voiceLang;

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
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
  }, [voiceLang, handleSend]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isOpen]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome-1') {
        return [
          {
            id: 'welcome-updated',
            sender: 'ai',
            text: `🌱 **Namaste! AI Voice Agronomist is ready for ${currentCropName}.**\n\nAsk me about stage-by-stage farming, pest protection, or the activity calendar for **${currentCropName}**!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      return prev;
    });
  }, [currentCropName]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
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
        recognitionRef.current.lang = voiceLang;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const quickPrompts = [
    { label: '🥜 Why switch to Groundnut?', query: 'Why is Groundnut a profitable alternative to Paddy in Odisha?' },
    { label: '🧪 Gypsum dosage', query: 'What is the correct Gypsum dose and timing for Groundnut?' },
    { label: '🐛 Pest scouting', query: 'How to control stem borer and leaf folder pests?' },
    { label: '💧 Water saving tips', query: 'How does Alternate Wetting & Drying (AWD) save water?' },
  ];

  return (
    <>
      {/* Floating Chatbot Launcher Button */}
      {!isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white px-4 py-3.5 rounded-2xl shadow-xl shadow-emerald-700/30 border border-emerald-400/40 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                🤖
              </span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-emerald-700 rounded-full animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-emerald-700 rounded-full"></span>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-black tracking-wide flex items-center gap-1.5">
                AI Voice Agronomist
                <span className="bg-amber-400/90 text-amber-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-md">
                  Voice 🔊
                </span>
              </div>
              <div className="text-[11px] text-emerald-100 font-medium truncate max-w-[150px]">
                Speak or Ask on {currentCropName}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Interactive Chat Window Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[440px] max-h-[85vh] h-[660px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-xl border border-white/20">
                🤖
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm tracking-tight">AI Voice Agronomist</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <p className="text-[11px] text-emerald-200 font-medium truncate max-w-[180px]">
                  {currentCropName} · Mayurbhanj
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Auto Speak Toggle */}
              <button
                onClick={() => {
                  setAutoSpeak(!autoSpeak);
                  if (synthRef.current && synthRef.current.speaking) {
                    synthRef.current.cancel();
                  }
                }}
                title={autoSpeak ? 'Auto Voice Readout is ON' : 'Auto Voice Readout is OFF'}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  autoSpeak
                    ? 'bg-amber-400 text-amber-950 shadow-xs'
                    : 'bg-white/10 text-emerald-200 hover:text-white'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">{autoSpeak ? 'Voice ON' : 'Voice OFF'}</span>
              </button>

              <button
                onClick={() =>
                  setMessages([
                    {
                      id: `reset-${Date.now()}`,
                      sender: 'ai',
                      text: `🌱 Chat reset. How can I assist with your **${currentCropName}** crops today?`,
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                title="Reset Chat"
                className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-all text-xs"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (synthRef.current) synthRef.current.cancel();
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                className="shrink-0 text-[11px] font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-700 hover:border-emerald-400 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600 shadow-2xs transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Active Speaking Waveform Banner */}
          {speakingMessageId && (
            <div className="bg-amber-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>Reading agronomy advice aloud... (ଭଏସ୍ ବାଜୁଛି)</span>
              </div>
              <button
                onClick={() => {
                  if (synthRef.current) synthRef.current.cancel();
                  setSpeakingMessageId(null);
                }}
                className="text-[11px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-md"
              >
                Stop ⏹️
              </button>
            </div>
          )}

          {/* Active Microphone Listening Banner */}
          {isListening && (
            <div className="bg-red-500 text-white px-4 py-2.5 text-xs font-black flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 animate-ping" />
                <span>Listening to your voice... Speak now! (କୁହନ୍ତୁ)</span>
              </div>
              <button
                onClick={toggleSpeechRecognition}
                className="text-[11px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-md"
              >
                Done
              </button>
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900 dark:to-slate-900/90">
            {messages.map((m) => {
              const isAi = m.sender === 'ai';
              const isSpeaking = speakingMessageId === m.id;

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-start gap-2 max-w-[90%]">
                    {isAi && (
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                        🌾
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isAi
                          ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-xs'
                          : 'bg-emerald-600 text-white rounded-tr-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line break-words font-medium">{m.text}</div>
                    </div>
                  </div>

                  {/* Metadata and Speaker Action */}
                  <div className="flex items-center gap-2 mt-1 px-2 text-[10px] text-slate-400">
                    <span>{m.time}</span>
                    {isAi && (
                      <button
                        onClick={() => handleSpeakMessage(m.id, m.text)}
                        className={`inline-flex items-center gap-1 font-bold transition-all px-2 py-0.5 rounded-md ${
                          isSpeaking
                            ? 'bg-amber-100 text-amber-900 font-extrabold ring-1 ring-amber-300'
                            : 'hover:bg-slate-100 text-slate-600 hover:text-emerald-700'
                        }`}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{isSpeaking ? 'Pause Audio' : 'Listen 🔊'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs p-2 bg-emerald-50/80 rounded-xl border border-emerald-100 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                <span className="font-semibold text-emerald-800">
                  AI Agronomist is analyzing farming protocols...
                </span>
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
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            {/* Speech-to-Text Voice Input Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              title={isListening ? 'Stop listening' : 'Voice Input (Click to speak)'}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
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
              placeholder={isListening ? 'Listening to voice... speak now!' : `Speak or ask about ${currentCropName}...`}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
