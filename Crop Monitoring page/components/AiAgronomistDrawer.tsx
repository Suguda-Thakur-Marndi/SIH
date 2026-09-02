"use client";

import React, { useState } from "react";
import { RegisteredCrop } from "../types";
import { formatDateString, getDaysDifference, getCropName } from "../mockData";
import { useLanguage } from '@/lib/language-context';

interface AiAgronomistDrawerProps {
  currentCrop: RegisteredCrop;
  isOpen: boolean;
  onClose: () => void;
  prefilledPrompt?: string;
}

interface ChatMessage {
  sender: "user" | "ai";
  message: string;
  timestamp: string;
}

export const AiAgronomistDrawer: React.FC<AiAgronomistDrawerProps> = ({
  currentCrop,
  isOpen,
  onClose,
  prefilledPrompt
}) => {
  const { t } = useLanguage();
  const [question, setQuestion] = useState(prefilledPrompt || "");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: "ai",
      message: `🌱 Namaste Suguda! I am your AI Agronomist for Mayurbhanj district. I am monitoring your ${currentCrop.name} (${currentCrop.variety}) currently in the ${currentCrop.currentStage} stage. How can I assist with your farm schedule today?`,
      timestamp: "09:00 AM"
    }
  ]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || question).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      sender: "user",
      message: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setQuestion("");

    // Simulate scientifically verified Agronomic AI answer
    setTimeout(() => {
      let reply = "";
      const lower = query.toLowerCase();
      if (lower.includes("urea") || lower.includes("nitrogen") || lower.includes("fertilizer")) {
        reply = `🌾 For your **${currentCrop.name}** at Day ${currentCrop.currentStageDays} (${currentCrop.currentStage} stage), the recommended top dressing is 30–35 kg Neem-Coated Urea per acre. **Note:** Rain is forecasted for tomorrow (Aug 26); apply after rainfall and once excess standing water drains to avoid nitrogen runoff.`;
      } else if (
        lower.includes("pest") ||
        lower.includes("disease") ||
        lower.includes("leaf") ||
        lower.includes("borer")
      ) {
        reply = `🛡️ Current scouting for **${currentCrop.currentStage} Stage**: Check for yellow stem borer 'dead hearts' and leaf folder folding. If leaf damage exceeds 10%, install pheromone lure traps or spray Chlorantraniliprole 18.5% SC @ 60ml/acre in 150L water.`;
      } else if (lower.includes("water") || lower.includes("irrigation") || lower.includes("moisture")) {
        reply = `💧 Your current soil moisture is **${currentCrop.soilMoisture}% (${currentCrop.soilMoistureStatus})**. In tillering stage, maintain 2-3 cm shallow water. No irrigation is needed today due to high humidity and rain expected within 24-48 hours.`;
      } else if (lower.includes("harvest") || lower.includes("yield")) {
        reply = `🚜 Expected harvest for your plot is **${formatDateString(
          currentCrop.expectedHarvestDate
        )}** (~${getDaysDifference(currentCrop.expectedHarvestDate)} days remaining). Projected yield is **${
          currentCrop.expectedYield
        }** based on current optimal NDVI index (${currentCrop.ndviIndex}).`;
      } else {
        reply = `🌿 Verified Agronomic Advisory for **${currentCrop.name}** (${currentCrop.location}): Crop is progressing well in the **${currentCrop.currentStage}** phase. Soil pH is optimal at ${currentCrop.soilPh}. Continue regular weekly field inspection and monitor bund drainage.`;
      }

      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          message: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }, 600);
  };

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-emerald-950/85 backdrop-blur-2xl backdrop-saturate-180 shadow-2xl border-l border-emerald-500/30 flex flex-col text-emerald-50"
      style={{
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      }}
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-emerald-500/25 flex items-center justify-between bg-gradient-to-r from-emerald-950/95 via-teal-950/90 to-emerald-900/95 backdrop-blur-xl text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30">🤖</span>
          <div>
            <h3 className="font-bold text-sm text-white drop-shadow-xs">{t('ai_agronomist_specialist', 'AI Agronomist Specialist')}</h3>
            <p className="text-[11px] text-emerald-300/80">{t('realtime_advisory_for', 'Real-time advisory for')} {getCropName(currentCrop, t)}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-emerald-300/70 hover:text-white hover:bg-emerald-800/40 p-1.5 rounded-lg transition">
          ✕
        </button>
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="p-3 bg-emerald-950/50 backdrop-blur-md border-b border-emerald-500/20 flex flex-wrap gap-1.5">
        <button
          onClick={() => handleSend("What is the optimal nitrogen dosage for current vegetative stage?")}
          className="text-[11px] font-medium bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-100 hover:text-white px-2.5 py-1 rounded-full border border-emerald-500/30 hover:border-emerald-400 cursor-pointer backdrop-blur-md transition-all shadow-xs"
        >
          🧪 {t('prompt_nitrogen', 'Nitrogen Dosage')}
        </button>
        <button
          onClick={() => handleSend("How should I prepare for tomorrow's rain forecast?")}
          className="text-[11px] font-medium bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-100 hover:text-white px-2.5 py-1 rounded-full border border-emerald-500/30 hover:border-emerald-400 cursor-pointer backdrop-blur-md transition-all shadow-xs"
        >
          🌧️ {t('prompt_rain', 'Rain Prep')}
        </button>
        <button
          onClick={() => handleSend("How to identify leaf folder & stem borer symptoms?")}
          className="text-[11px] font-medium bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-100 hover:text-white px-2.5 py-1 rounded-full border border-emerald-500/30 hover:border-emerald-400 cursor-pointer backdrop-blur-md transition-all shadow-xs"
        >
          🛡️ {t('prompt_pest', 'Pest Scouting')}
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {chatHistory.map((item, index) => (
          <div
            key={index}
            className={`flex flex-col ${item.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                item.sender === "user"
                  ? "bg-gradient-to-r from-emerald-600/90 to-teal-600/90 backdrop-blur-xl text-white border border-emerald-400/40 rounded-br-xs shadow-md"
                  : "bg-emerald-900/35 backdrop-blur-xl text-emerald-50 border border-emerald-500/25 rounded-bl-xs shadow-sm"
              }`}
            >
              <p className="whitespace-pre-line">{item.message}</p>
            </div>
            <span className="text-[10px] text-emerald-300/60 mt-1 px-1">{item.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Chat Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3.5 border-t border-emerald-500/25 bg-emerald-950/80 backdrop-blur-xl flex gap-2"
      >
        <input
          type="text"
          placeholder={t('ask_crop_placeholder', 'Ask anything about this crop...')}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 bg-emerald-900/35 border border-emerald-500/40 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-emerald-50 placeholder:text-emerald-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 backdrop-blur-md"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 cursor-pointer transition"
        >
          {t('send_btn', 'Send')}
        </button>
      </form>
    </div>
  );
};
