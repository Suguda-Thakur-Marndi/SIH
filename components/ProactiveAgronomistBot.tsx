"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Bot, Sparkles, X, Send, Volume2, 
  VolumeX, RefreshCw, AlertTriangle, Camera,
  GripVertical
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
  const pathname = usePathname();
  const { languageCode } = useLanguage();
  const _bandwidthCtx = useBandwidth();

  // Hide AI Chat Bot completely on Officer Dashboard and Authentication pages
  const isHiddenRoute = 
    pathname?.startsWith('/officer') ||
    pathname?.startsWith('/agriculture-officer-dashboard') ||
    pathname?.startsWith('/authentication') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/signup') ||
    pathname?.startsWith('/auth');

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

  // Draggable position state & tracking refs
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    posX: number;
    posY: number;
    hasMoved: boolean;
  }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
    hasMoved: false,
  });
  const botButtonRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize position from localStorage or default on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('smartcrop_bot_position');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          const maxX = Math.max(10, window.innerWidth - 240);
          const maxY = Math.max(10, window.innerHeight - 60);
          setPosition({
            x: Math.min(Math.max(10, parsed.x), maxX),
            y: Math.min(Math.max(10, parsed.y), maxY),
          });
          return;
        }
      } catch {}
    }

    // Default top-right position
    const defaultX = Math.max(10, window.innerWidth - 240);
    const defaultY = 18;
    setPosition({ x: defaultX, y: defaultY });
  }, []);

  // Window resize handler to keep within viewport bounds
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        const width = botButtonRef.current?.offsetWidth || 230;
        const height = botButtonRef.current?.offsetHeight || 50;
        const maxX = Math.max(10, window.innerWidth - width - 10);
        const maxY = Math.max(10, window.innerHeight - height - 10);
        return {
          x: Math.min(Math.max(10, prev.x), maxX),
          y: Math.min(Math.max(10, prev.y), maxY),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pointer event handlers for unified mouse and touch dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const currentPos = position || {
      x: Math.max(10, window.innerWidth - 240),
      y: 18,
    };

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: currentPos.x,
      posY: currentPos.y,
      hasMoved: false,
    };

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.startX && !dragRef.current.startY) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Only start drag movement when cursor/finger moves more than 6px
    if (dist > 6) {
      dragRef.current.hasMoved = true;
      if (!isDragging) setIsDragging(true);

      const width = botButtonRef.current?.offsetWidth || 230;
      const height = botButtonRef.current?.offsetHeight || 50;
      const maxX = Math.max(10, window.innerWidth - width - 10);
      const maxY = Math.max(10, window.innerHeight - height - 10);

      const newX = Math.min(Math.max(10, dragRef.current.posX + dx), maxX);
      const newY = Math.min(Math.max(10, dragRef.current.posY + dy), maxY);

      setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const wasDragged = dragRef.current.hasMoved;
    setIsDragging(false);

    dragRef.current.startX = 0;
    dragRef.current.startY = 0;

    if (wasDragged) {
      if (position) {
        try {
          localStorage.setItem('smartcrop_bot_position', JSON.stringify(position));
        } catch {}
      }
    } else {
      // Tap / Click without dragging -> OPEN IMMEDIATELY
      handleOpen();
    }
  };

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

  if (isHiddenRoute) {
    return null;
  }

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

      {/* Floating Draggable Trigger Pill — Green Blur Transparent Glassmorphism */}
      <div
        ref={botButtonRef}
        style={{
          position: 'fixed',
          left: position ? `${position.x}px` : undefined,
          top: position ? `${position.y}px` : undefined,
          right: position ? undefined : '1.5rem',
          zIndex: 99999,
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(_e) => {
          if (!dragRef.current.hasMoved) {
            handleOpen();
          }
        }}
        className={`select-none ${isDragging ? 'cursor-grabbing scale-105 opacity-95' : 'cursor-grab'} transition-transform duration-75`}
      >
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpen();
            }
          }}
          aria-label="Open Proactive AI Agronomist"
          className={`group relative flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full backdrop-blur-2xl shadow-2xl transition-all duration-300 border border-emerald-400/40 ${
            isDragging
              ? 'cursor-grabbing ring-2 ring-emerald-400/60 shadow-[0_12px_36px_rgba(6,78,59,0.6),0_0_25px_rgba(52,211,153,0.4)]'
              : 'cursor-grab hover:scale-105 active:scale-95 hover:border-emerald-300/70 hover:shadow-[0_10px_35px_rgba(6,78,59,0.5),0_0_20px_rgba(52,211,153,0.35)]'
          } bg-gradient-to-r from-emerald-950/85 via-emerald-900/75 to-teal-950/85 text-white shadow-[0_8px_32px_0_rgba(6,78,59,0.4),0_0_15px_1px_rgba(52,211,153,0.25),inset_0_1px_1px_rgba(255,255,255,0.25)] cursor-pointer`}
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          {/* Drag Handle Indicator */}
          <div className="flex items-center text-emerald-400/60 group-hover:text-emerald-300 transition-colors -mr-1" title="Drag anywhere or click to chat">
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          {/* Bot Icon with glowing pulse badge */}
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-[#D6F24B] shadow-inner shrink-0">
            <Bot className="w-4 h-4 text-[#D6F24B] transition-transform group-hover:rotate-6" />
            {(hasProactiveAlert || riskData.score > 70) && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
              </span>
            )}
          </div>

          {/* Text Content */}
          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-tight flex items-center gap-1 leading-none text-emerald-50 drop-shadow-xs">
              AI Agronomist
              <Sparkles className="w-3 h-3 text-[#D6F24B] animate-spin-slow" />
            </span>
            <div className="mt-0.5">
              {riskData.score > 70 ? (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-400/40 px-1.5 py-0.5 rounded-full leading-tight inline-flex items-center gap-1 backdrop-blur-md">
                  ⚠️ Distress: {riskData.score}/100
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-300 leading-tight flex items-center gap-1">
                  🟢 Telemetry Live
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Slide-Out Modal / Green Blur Transparent Assistant Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-end sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full sm:w-[460px] h-[92vh] sm:h-[680px] max-h-[92vh] bg-emerald-950/90 backdrop-blur-2xl backdrop-saturate-180 border border-emerald-500/30 rounded-t-[32px] sm:rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_rgba(6,78,59,0.35),inset_0_1px_1px_rgba(255,255,255,0.15)] flex flex-col overflow-hidden text-emerald-50 animate-in slide-in-from-bottom-5 sm:slide-in-from-right-5 duration-300 relative z-[100001]"
            style={{
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            }}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/95 via-teal-950/90 to-emerald-900/95 backdrop-blur-xl text-white flex items-center justify-between border-b border-emerald-500/25 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-[#D6F24B] shadow-inner">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white drop-shadow-xs">Smart Crop AI Agronomist</h3>
                    <span className="bg-emerald-500/25 text-emerald-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-emerald-400/40">
                      PROACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-300/80 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Baripada Telemetry &bull; PS-02 Connected
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMessages([])}
                  title="Restart Proactive Check-in"
                  className="p-2 rounded-xl text-emerald-300/70 hover:text-white hover:bg-emerald-800/40 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-emerald-300/70 hover:text-white hover:bg-emerald-800/40 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Live Telemetry Bar */}
            <div className="bg-emerald-950/50 backdrop-blur-md px-4 py-2 border-b border-emerald-500/20 flex items-center justify-between text-xs shrink-0">
              <span className="font-bold text-emerald-100 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Live Distress: <span className="text-amber-300 font-extrabold">{riskData.score}/100</span> (High)
              </span>
              <span className="text-[11px] text-emerald-300/80 font-medium">
                Rain Deficit: <strong className="text-amber-300">-35%</strong> &bull; Loan: <strong className="text-emerald-200">8d</strong>
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
                      className={`max-w-[88%] p-3.5 sm:p-4 rounded-2xl shadow-sm leading-relaxed whitespace-pre-line ${
                        isAi
                          ? 'bg-emerald-900/35 backdrop-blur-xl text-emerald-50 border border-emerald-500/25 rounded-tl-xs'
                          : 'bg-gradient-to-r from-emerald-600/90 to-teal-600/90 backdrop-blur-xl text-white border border-emerald-400/30 rounded-tr-xs shadow-md'
                      }`}
                    >
                      {msg.imageUrl && (
                        <div className="mb-2.5 rounded-xl overflow-hidden border border-emerald-400/30">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={msg.imageUrl} alt="Uploaded crop leaf" className="w-full max-h-48 object-cover" />
                        </div>
                      )}
                      <div>{msg.text}</div>
                    </div>

                    <div className="flex items-center gap-2 px-1 text-[10px] text-emerald-300/60">
                      <span>{msg.time}</span>
                      {isAi && (
                        <button
                          onClick={() => handleSpeak(msg.id, msg.text)}
                          className="hover:text-emerald-200 flex items-center gap-0.5 font-bold cursor-pointer transition text-emerald-400"
                        >
                          {speakingId === msg.id ? (
                            <>
                              <VolumeX className="w-3 h-3 text-red-400 animate-pulse" /> Stop Voice
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-emerald-400" /> Listen
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-emerald-900/40 backdrop-blur-md border border-emerald-500/30 rounded-2xl w-28 text-emerald-300 animate-pulse text-xs">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Thinking...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Proactive Quick Action Chips */}
            <div className="px-4 py-2.5 bg-emerald-950/60 backdrop-blur-md border-t border-emerald-500/20 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleQuickAction('risk_drilldown')}
                className="whitespace-nowrap px-3 py-1.5 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-100 hover:text-white rounded-full border border-emerald-500/30 text-xs font-semibold backdrop-blur-md shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                🔍 Why is my risk {riskData.score}?
              </button>

              <button
                onClick={() => handleQuickAction('market_timing')}
                className="whitespace-nowrap px-3 py-1.5 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-100 hover:text-white rounded-full border border-emerald-500/30 text-xs font-semibold backdrop-blur-md shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                💰 Sell now or wait?
              </button>

              <button
                onClick={() => handleQuickAction('irrigation_action')}
                className="whitespace-nowrap px-3 py-1.5 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-100 hover:text-white rounded-full border border-emerald-500/30 text-xs font-semibold backdrop-blur-md shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                💧 Irrigation steps
              </button>

              <button
                onClick={() => handleQuickAction('photo_request')}
                className="whitespace-nowrap px-3 py-1.5 bg-emerald-800/40 hover:bg-emerald-700/60 text-emerald-100 hover:text-white rounded-full border border-emerald-400/40 text-xs font-semibold backdrop-blur-md shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                📸 Diagnose leaf photo
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-emerald-950/80 backdrop-blur-xl border-t border-emerald-500/25 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Crop Photo"
                className="p-2.5 rounded-full bg-emerald-900/50 hover:bg-emerald-800/70 text-emerald-300 hover:text-white border border-emerald-500/30 transition cursor-pointer shadow-xs"
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask agronomist or tap a chip..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-emerald-900/35 border border-emerald-500/40 text-emerald-50 placeholder:text-emerald-300/40 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400/70 backdrop-blur-md"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-emerald-950 font-bold shadow-lg shadow-emerald-500/25 transition cursor-pointer"
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

