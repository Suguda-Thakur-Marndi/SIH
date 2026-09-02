"use client";

import React from "react";
import { useLanguage } from "@/lib/language-context";
import LanguageSelector from "@/components/LanguageSelector";
import { RegisteredCrop } from "../types";
import { formatDateString, getDaysDifference, getCropName, getCropType } from "../mockData";

interface CropHeaderProps {
  crops: RegisteredCrop[];
  selectedCropId: string;
  onSelectCrop: (cropId: string) => void;
  liveWeatherAlerts: string[];
  onOpenAiDrawer: () => void;
  onOpenAddModal: () => void;
}

export const CropHeader: React.FC<CropHeaderProps> = ({
  crops,
  selectedCropId,
  onSelectCrop,
  liveWeatherAlerts,
  onOpenAiDrawer,
  onOpenAddModal
}) => {
  const { t } = useLanguage();
  const currentCrop = crops.find((c) => c.id === selectedCropId) || crops[0];

  return (
    <>
      {/* Sticky Top Header Nav */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/50 px-4 sm:px-6 lg:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Brand & Module Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#10b981] flex items-center justify-center text-white text-xl shadow-md">
              🌱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#10b981] bg-[#10b981]/20 px-2 py-0.5 rounded-md border border-[#10b981]/30">
                  {t("smart_farm_os", "Smart Farm OS")}
                </span>
                <span className="text-xs text-zinc-400">{t("mayurbhanj_cluster", "Mayurbhanj Cluster #04")}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black flex items-center gap-2">
                {t("crop_lifecycle", "Crop Lifecycle")} & {t("dynamic_calendar", "Dynamic Calendar")}
              </h1>
            </div>
          </div>

          {/* Crop Switcher & Action Controls */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Language Selector in Header */}
            <div className="shrink-0">
              <LanguageSelector variant="compact" />
            </div>

            {/* Crop Selector Dropdown */}
            <div className="relative">
              <label htmlFor="crop-select" className="sr-only">{t("select_registered_crop", "Select Registered Crop")}</label>
              <select
                id="crop-select"
                value={selectedCropId}
                onChange={(e) => onSelectCrop(e.target.value)}
                className="appearance-none bg-[#27272a] hover:bg-[#3f3f46] text-zinc-100 text-sm font-medium rounded-xl px-4 py-2.5 pr-9 border border-zinc-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors"
              >
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.icon} {getCropName(crop, t)} — {crop.landArea} ({crop.variety})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Quick Action: Ask AI Agronomist */}
            <button
              onClick={onOpenAiDrawer}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-semibold shadow-sm transition-all"
            >
              <span>🤖</span>
              <span>{t("ai_agronomist", "NVIDIA AI Agronomist")}</span>
            </button>

            {/* Quick Action: Add Farm Task */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] text-zinc-200 text-sm font-medium border border-zinc-700 shadow-xs transition-colors"
            >
              <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{t("schedule_task", "Schedule Task")}</span>
            </button>

            {/* Print / Export */}
            <button
              onClick={() => window.print()}
              title={t("print_calendar", "Print Calendar Schedule")}
              className="p-2.5 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] text-zinc-300 border border-zinc-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Crop Identity Banner — Glassmorphism */}
      <section className="relative overflow-hidden rounded-2xl text-white p-6 sm:p-7 shadow-2xl"
        style={{
          background: "rgba(6, 78, 59, 0.18)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(52, 211, 153, 0.18)",
          boxShadow: "0 8px 32px 0 rgba(6,78,59,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Decorative glowing orbs */}
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="text-3xl sm:text-4xl p-2.5 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.10)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
              >
                {currentCrop.icon}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                    {getCropName(currentCrop, t)}
                  </h2>
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-200"
                    style={{
                      background: "rgba(52,211,153,0.15)",
                      border: "1px solid rgba(52,211,153,0.30)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                  >
                    🟢 {t(currentCrop.healthStatus.toLowerCase(), currentCrop.healthStatus)} {t("status", "Status")}
                  </span>
                </div>
                <p className="text-sm text-emerald-200/80 font-medium mt-0.5">
                  {t("variety", "Variety")}: {currentCrop.variety} • {getCropType(currentCrop.cropType, t)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm text-zinc-200/80">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400">📍</span>
                <span>{currentCrop.location}, {currentCrop.district}, {currentCrop.state}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400">📐</span>
                <span className="font-semibold text-white">{currentCrop.landArea}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400">🗓️</span>
                <span>{t("sown", "Sown")}: <strong className="text-white">{formatDateString(currentCrop.sowingDate, t)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400">🚜</span>
                <span>{t("target_harvest", "Target Harvest")}: <strong className="text-emerald-300">{formatDateString(currentCrop.expectedHarvestDate, t)}</strong></span>
              </div>
            </div>
          </div>

          {/* Stats grid — glass cards */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl"
            style={{
              background: "rgba(0,0,0,0.20)",
              backdropFilter: "blur(16px) saturate(160%)",
              WebkitBackdropFilter: "blur(16px) saturate(160%)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="text-center p-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <p className="text-[10px] text-emerald-300/70 uppercase tracking-widest font-semibold">{t("crop_stage", "Crop Stage")}</p>
              <p className="text-sm sm:text-base font-bold text-emerald-300 flex items-center justify-center gap-1 mt-1">
                🌿 {t(currentCrop.currentStage.toLowerCase(), currentCrop.currentStage)}
              </p>
            </div>
            <div
              className="text-center p-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <p className="text-[10px] text-emerald-300/70 uppercase tracking-widest font-semibold">{t("days_since_sowing", "Days Since Sowing")}</p>
              <p className="text-sm sm:text-base font-bold text-white mt-1">
                {currentCrop.currentStageDays} / {currentCrop.totalCycleDays}{" "}
                <span className="text-xs font-normal text-zinc-400">{t("days", "days")}</span>
              </p>
            </div>
            <div
              className="text-center p-3 rounded-xl col-span-2 sm:col-span-1"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <p className="text-[10px] text-amber-300/70 uppercase tracking-widest font-semibold">{t("days_to_harvest", "Days to Harvest")}</p>
              <p className="text-sm sm:text-base font-bold text-amber-300 mt-1">
                {getDaysDifference(currentCrop.expectedHarvestDate)}{" "}
                <span className="text-xs font-normal text-zinc-400">{t("days_left", "days left")}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Weather Alert Banner — driven by live OWM forecast */}
      {liveWeatherAlerts && liveWeatherAlerts.length > 0 && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-4 flex items-start gap-3.5 shadow-xs">
          <span className="text-2xl shrink-0">🌦️</span>
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              {t("active_weather_advisory", "Active Weather & Field Advisory")}
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                {t("realtime_alert", "Real-time Alert")}
              </span>
            </h4>
            <ul className="text-xs sm:text-sm text-amber-800 dark:text-amber-300/90 list-disc list-inside space-y-0.5">
              {liveWeatherAlerts.map((alert, idx) => (
                <li key={idx}>{alert}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};
