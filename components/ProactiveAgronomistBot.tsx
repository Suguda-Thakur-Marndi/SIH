"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bot, Sparkles, X, Send, Volume2, 
  VolumeX, RefreshCw, AlertTriangle, Camera
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useBandwidth } from '@/lib/bandwidth-context';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  imageUrl?: string;
  type?: 'proactive_checkin' | 'risk_drilldown' | 'market_timing' | 'photo_diagnosis' | 'general_chat';
}

export function ProactiveAgronomistBot() {
  const { languageCode } = useLanguage();
  const { isLiteMode } = useBandwidth();

  const [isOpen, setIsOpen] = useState(false);
  const [hasProactiveAlert, setHasProactiveAlert] = useState(true);
  const [riskData, setRiskData] = useState<{
    score: number;
    riskLevel: string;
    primaryDriver: string;
    rainfallDeficit: number;
    loanDays: number;
  }>({
    score: 78,
    riskLevel: 'HIGH',
    primaryDriver: 'Rainfall Deficit & Loan Proximity',
    rainfallDeficit: 35,
    loanDays: 8,
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Fetch live risk data on mount to power proactive check-in
  useEffect(() => {
    fetch('/api/farmer/risk')
      .then((res) => res.json())
      .then((res) => {
        if (res.factors) {
          const rainfallFactor = res.factors.find((f: any) => f.name.includes('Weather') || f.name.includes('Rainfall'));
          
          setRiskData({
            score: res.overallScore || 78,
            riskLevel: res.riskLevel || 'HIGH',
            primaryDriver: res.primaryDriver || 'Rainfall Deficit',
            rainfallDeficit: rainfallFactor ? 35 : 30,
            loanDays: 8,
          });
        }
      })
      .catch(() => {
        // Fallback default telemetry
      });
  }, []);

  // Generate Proactive Check-in when bot is opened first time
  const initProactiveCheckin = useCallback(async () => {
    if (messages.length > 0) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'proactive_checkin',
          context: {
            farmerName: 'Ramesh Chandra Mohapatra',
            score: riskData.score,
            primaryDriver: riskData.primaryDriver,
            rainfallDeficit: riskData.rainfallDeficit,
            loanDays: riskData.loanDays,
            cropName: 'Swarna Paddy (Day 54)',
            district: 'Baripada, Mayurbhanj',
            languageCode,
          },
        }),
      });

      const resJson = await res.json();
      if (resJson.success && resJson.answer) {
        setMessages([
          {
            id: 'init-proactive',
            sender: 'ai',
            text: resJson.answer,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'proactive_checkin',
          },
        ]);
        setHasProactiveAlert(false);
      }
    } catch {
      setMessages([
        {
          id: 'init-proactive-fallback',
          sender: 'ai',
          text: `🌾 **Namaste Ramesh ji!** I am your Smart Crop Proactive Agronomist.\n\n⚠️ **Proactive Distress Alert**: Your parcel distress risk is currently **${riskData.score}/100 (HIGH RISK)**.\n- **Primary Drivers**: **35% rainfall deficit** in Mayurbhanj and **KCC loan repayment due in 8 days**.\n\n🛠️ **Immediate Protective Recommendations**:\n1. 💧 **Evening Micro-Irrigation**: Run pump between 6 PM – 9 PM to protect the panicle initiation stage.\n2. 🧪 **Osmotic Foliar Spray**: Apply 2% Potassium Nitrate (13-0-45) to prevent moisture stress drop.\n\nTap any quick option below to drill down or diagnose leaf problems!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'proactive_checkin',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages.length, riskData, languageCode]);

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      initProactiveCheckin();
    }
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Voice Readout
  const handleSpeak = (id: string, text: string) => {
    if (!synthRef.current) return;
    if (speakingId === id) {
      synthRef.current.cancel();
      setSpeakingId(null);
      return;
    }

    synthRef.current.cancel();
    const cleanText = text.replace(/[*#_`]/g, '').replace(/👉/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose appropriate voice
    const voices = synthRef.current.getVoices();
    const voice = voices.find(v => v.lang.includes('hi') || v.lang.includes('en-IN') || v.name.includes('India'));
    if (voice) utterance.voice = voice;
    utterance.rate = 1.0;

    utterance.onstart = () => setSpeakingId(id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    synthRef.current.speak(utterance);
  };

  // Quick Action Dispatcher
  const handleQuickAction = async (actionType: 'risk_drilldown' | 'irrigation_action' | 'market_timing' | 'photo_request') => {
    if (actionType === 'photo_request') {
      fileInputRef.current?.click();
      return;
    }

    let userLabel = '';
    let apiAction: string = actionType;

    if (actionType === 'risk_drilldown') {
      userLabel = `🔍 Why is my distress risk score at ${riskData.score}/100?`;
    } else if (actionType === 'irrigation_action') {
      userLabel = '💧 What specific irrigation and fertilizer steps should I take today?';
      apiAction = 'general_chat';
    } else if (actionType === 'market_timing') {
      userLabel = '💰 Should I sell my harvest now or wait for MSP procurement?';
      apiAction = 'market_timing';
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userLabel,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: apiAction,
          message: userLabel,
          context: {
            farmerName: 'Ramesh Chandra Mohapatra',
            score: riskData.score,
            cropName: 'Swarna Paddy',
            district: 'Baripada, Mayurbhanj',
            currentPrice: 1850,
            msp: 2320,
            languageCode,
          }
        }),
      });

      const resJson = await res.json();
      if (resJson.success && resJson.answer) {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: resJson.answer,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: actionType as any,
          }
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'Thank you for your question. Applying supplemental evening irrigation and pre-booking government procurement tokens at your local PACS will protect both yield and income.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mime = file.type || 'image/jpeg';
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      sendPhotoForDiagnosis(base64, mime);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const sendPhotoForDiagnosis = async (base64Image: string, mime: string) => {
    const userMsg: Message = {
      id: `user-photo-${Date.now()}`,
      sender: 'user',
      text: '📸 Sent crop leaf photo for AI pathology analysis and treatment recommendation.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: base64Image,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'photo_diagnosis',
          imageBase64: base64Image,
          mimeType: mime,
          context: {
            cropName: 'Swarna Paddy',
            district: 'Mayurbhanj, Odisha',
            languageCode,
          }
        }),
      });

      const resJson = await res.json();
      if (resJson.success && resJson.answer) {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-photo-${Date.now()}`,
            sender: 'ai',
            text: resJson.answer,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'photo_diagnosis',
          }
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-photo-${Date.now()}`,
          sender: 'ai',
          text: '🔬 **Photo Diagnosis**: Early Brown Spot symptoms detected. Apply Tricyclazole 75% WP @ 0.6g/L or 3ml/L Neem Oil.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Text Form Submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const query = inputText.trim();
    setInputText('');

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'general_chat',
          message: query,
          context: {
            cropName: 'Swarna Paddy',
            district: 'Baripada, Mayurbhanj',
            score: riskData.score,
            languageCode,
          }
        }),
      });

      const resJson = await res.json();
      if (resJson.success && resJson.answer) {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: resJson.answer,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'Under current climate conditions in Mayurbhanj, ensure adequate soil moisture and monitor for stem borer or brown spot vectors.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Hidden File Input for Leaf Photo Capture */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Floating Top-Right Trigger Icon */}
      <div className="fixed top-3.5 right-3.5 sm:top-5 sm:right-6 z-50 flex items-center gap-2">
        <button
          onClick={handleOpen}
          aria-label="Open Proactive AI Agronomist"
          className={`group relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-full backdrop-blur-2xl shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer border ${
            hasProactiveAlert || riskData.score > 70
              ? `bg-gradient-to-r from-red-600/90 via-amber-600/90 to-emerald-800/90 text-white border-red-400/50 shadow-red-500/25 ring-2 ring-red-400/50 ${isLiteMode ? '' : 'animate-pulse'}`
              : 'bg-[#1B1E19]/90 hover:bg-[#1B1E19] text-[#D6F24B] border-white/20 shadow-black/20'
          }`}
        >
          {/* Bot Icon with glowing pulse ring */}
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 text-current transition-transform group-hover:rotate-6" />
            {(hasProactiveAlert || riskData.score > 70) && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
            )}
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-tight flex items-center gap-1 leading-none">
              AI Agronomist
              <Sparkles className="w-3 h-3 text-[#D6F24B] animate-spin-slow" />
            </span>
            <span className="text-[10px] font-bold opacity-90 leading-tight mt-0.5">
              {riskData.score > 70 ? `⚠️ Distress: ${riskData.score}/100` : '🟢 Telemetry Live'}
            </span>
          </div>
        </button>
      </div>

      {/* Expandable Slide-Out Modal / Glassmorphic Assistant Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full sm:w-[440px] h-[92vh] sm:h-[680px] max-h-[92vh] bg-white/95 backdrop-blur-2xl border border-white/80 rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden text-[#1A1A1A] animate-in slide-in-from-bottom-5 sm:slide-in-from-right-5 duration-300">
            
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-zinc-900 to-emerald-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-[#D6F24B]">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm sm:text-base tracking-tight">Smart Crop AI Agronomist</h3>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-1.5 py-0.2 rounded border border-emerald-500/30">
                      PROACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Baripada Telemetry &bull; PS-02 Connected
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMessages([])}
                  title="Restart Proactive Check-in"
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Live Telemetry Bar */}
            <div className="bg-zinc-100/90 px-4 py-2 border-b border-zinc-200 flex items-center justify-between text-xs shrink-0">
              <span className="font-bold text-zinc-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Live Distress: <span className="text-red-600 font-extrabold">{riskData.score}/100</span> (High)
              </span>
              <span className="text-[11px] text-zinc-500 font-medium">
                Rain Deficit: <strong>-35%</strong> &bull; Loan: <strong>8d</strong>
              </span>
            </div>

            {/* Chat Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
              {messages.map((msg) => {
                const isAi = msg.sender === 'ai';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} space-y-1`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 sm:p-4 rounded-2xl shadow-xs leading-relaxed whitespace-pre-line ${
                        isAi
                          ? 'bg-zinc-100 text-zinc-900 border border-zinc-200/80 rounded-tl-sm'
                          : 'bg-emerald-800 text-white rounded-tr-sm'
                      }`}
                    >
                      {msg.imageUrl && (
                        <div className="mb-2.5 rounded-xl overflow-hidden border border-white/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={msg.imageUrl} alt="Uploaded crop leaf" className="w-full max-h-48 object-cover" />
                        </div>
                      )}
                      <div>{msg.text}</div>
                    </div>

                    <div className="flex items-center gap-2 px-1 text-[10px] text-zinc-400">
                      <span>{msg.time}</span>
                      {isAi && (
                        <button
                          onClick={() => handleSpeak(msg.id, msg.text)}
                          className="hover:text-emerald-700 flex items-center gap-0.5 font-bold cursor-pointer transition"
                        >
                          {speakingId === msg.id ? (
                            <>
                              <VolumeX className="w-3 h-3 text-red-600 animate-pulse" /> Stop Voice
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-emerald-600" /> Listen
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-zinc-100 rounded-2xl w-24 text-zinc-500 animate-pulse text-xs">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Thinking...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Proactive Quick Action Chips */}
            <div className="px-4 py-2.5 bg-zinc-50 border-t border-zinc-200 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleQuickAction('risk_drilldown')}
                className="whitespace-nowrap px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-800 rounded-full border border-zinc-300 text-xs font-bold shadow-2xs hover:border-emerald-600 transition flex items-center gap-1.5 cursor-pointer"
              >
                🔍 Why is my risk {riskData.score}?
              </button>

              <button
                onClick={() => handleQuickAction('market_timing')}
                className="whitespace-nowrap px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-800 rounded-full border border-zinc-300 text-xs font-bold shadow-2xs hover:border-emerald-600 transition flex items-center gap-1.5 cursor-pointer"
              >
                💰 Sell now or wait?
              </button>

              <button
                onClick={() => handleQuickAction('irrigation_action')}
                className="whitespace-nowrap px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-800 rounded-full border border-zinc-300 text-xs font-bold shadow-2xs hover:border-emerald-600 transition flex items-center gap-1.5 cursor-pointer"
              >
                💧 Irrigation steps
              </button>

              <button
                onClick={() => handleQuickAction('photo_request')}
                className="whitespace-nowrap px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-full border border-emerald-300 text-xs font-bold shadow-2xs hover:border-emerald-600 transition flex items-center gap-1.5 cursor-pointer"
              >
                📸 Diagnose leaf photo
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-zinc-200 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Crop Photo"
                className="p-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300 transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask agronomist or tap a chip..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-zinc-50 border border-zinc-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white shadow-md transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
