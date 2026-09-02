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
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-emerald-900 text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-1.5 rounded-xl bg-white/10">🤖</span>
          <div>
            <h3 className="font-bold text-sm">{t('ai_agronomist_specialist', 'AI Agronomist Specialist')}</h3>
            <p className="text-[11px] text-emerald-200">{t('realtime_advisory_for', 'Real-time advisory for')} {getCropName(currentCrop, t)}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-300 hover:text-white p-1">
          ✕
        </button>
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-700/80 flex flex-wrap gap-1.5">
        <button
          onClick={() => handleSend("What is the optimal nitrogen dosage for current vegetative stage?")}
          className="text-[11px] font-medium bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-600 hover:border-emerald-500 cursor-pointer"
        >
          🧪 {t('prompt_nitrogen', 'Nitrogen Dosage')}
        </button>
        <button
          onClick={() => handleSend("How should I prepare for tomorrow's rain forecast?")}
          className="text-[11px] font-medium bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-600 hover:border-emerald-500 cursor-pointer"
        >
          🌧️ {t('prompt_rain', 'Rain Prep')}
        </button>
        <button
          onClick={() => handleSend("How to identify leaf folder & stem borer symptoms?")}
          className="text-[11px] font-medium bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-600 hover:border-emerald-500 cursor-pointer"
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
                  ? "bg-emerald-600 text-white rounded-br-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-bl-xs"
              }`}
            >
              <p className="whitespace-pre-line">{item.message}</p>
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 px-1">{item.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Chat Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3.5 border-t border-zinc-100 dark:border-zinc-800 flex gap-2"
      >
        <input
          type="text"
          placeholder={t('ask_crop_placeholder', 'Ask anything about this crop...')}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
        >
          {t('send_btn', 'Send')}
        </button>
      </form>
    </div>
  );
};
