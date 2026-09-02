"use client";

import React from "react";
import { useLanguage } from "@/lib/language-context";
import { RegisteredCrop } from "../types";
import { SoilData } from "../soilService";

interface CropStateMetricsProps {
  currentCrop: RegisteredCrop;
  soilData: SoilData | null;
  soilLoading: boolean;
}

// Shared glass card class
const glass =
  "rounded-2xl bg-white/60 backdrop-blur-md p-4 border border-white/70 shadow-sm hover:bg-white/75 transition-all group";

/** Small skeleton shimmer for loading state */
function Skeleton({ w = "w-16" }: { w?: string }) {
  return <div className={`h-8 ${w} bg-zinc-200/80 rounded-lg animate-pulse`} />;
}

export const CropStateMetrics: React.FC<CropStateMetricsProps> = ({
  currentCrop,
  soilData,
  soilLoading,
}) => {
  const { t } = useLanguage();
  const totalTasksCount = currentCrop.activities.length;
  const completedTasksCount = currentCrop.activities.filter((a) => a.status === "completed").length;
  const taskProgressPercent =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // ── Live API data only (no mock fallbacks) ─────────────────────────────
  const soilMoistureVal      = soilData?.soilMoistureRoot    ?? null;
  const soilMoistureStatus   = soilData?.soilMoistureStatus  ?? null;
  const soilTempVal          = soilData?.soilTempC           ?? null;
  const soilMoistureSurface  = soilData?.soilMoistureSurface ?? null;

  // Ambee enriched data
  const uvIndex       = soilData?.uvIndex        ?? null;
  const precipitation = soilData?.precipitation  ?? null;
  const apparentTemp  = soilData?.apparentTempC  ?? null;
  const summary       = soilData?.summary        ?? "";
  const updatedAt     = soilData?.updatedAt      ?? null;

  // Moisture color
  const moistureColor =
    soilMoistureStatus === "Low"     ? "text-amber-600"
    : soilMoistureStatus === "High"  ? "text-blue-700"
    : soilMoistureStatus === "Optimal" ? "text-emerald-600"
    : soilMoistureStatus === null    ? "text-zinc-400"
    : "text-blue-600";

  // UV Risk label
  function uvRisk(uv: number) {
    if (uv <= 2)  return { label: "Low",      color: "text-green-600" };
    if (uv <= 5)  return { label: "Moderate",  color: "text-yellow-600" };
    if (uv <= 7)  return { label: "High",      color: "text-orange-600" };
    if (uv <= 10) return { label: "Very High", color: "text-red-600" };
    return { label: "Extreme", color: "text-purple-700" };
  }

  return (
    <section className="space-y-3">
      {/* Source badge row */}
      {updatedAt && (
        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
          <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-600 font-semibold px-2 py-0.5 rounded-full">
            🛰️ NASA POWER
          </span>
          <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-600 font-semibold px-2 py-0.5 rounded-full">
            🌐 Ambee Weather
          </span>
          <span className="ml-auto">{t("last_updated", "Last updated")}: {updatedAt} IST</span>
        </div>
      )}

      {/* Main metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">

        {/* Crop Health */}
        <div className={glass}>
          <div className="flex items-center justify-between text-green-700/70 text-xs">
            <span className="font-semibold">{t("crop_health", "Crop Health")}</span>
            <span className="text-base group-hover:scale-110 transition-transform">💚</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
              {currentCrop.healthScore}%
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-full">
              {t(currentCrop.healthStatus.toLowerCase(), currentCrop.healthStatus)}
            </span>
          </div>
          <div className="w-full bg-emerald-100/60 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${currentCrop.healthScore}%` }}
            />
          </div>
        </div>

        {/* Soil Moisture — live NASA POWER */}
        <div className={glass}>
          <div className="flex items-center justify-between text-blue-700/70 text-xs">
            <span className="font-semibold">{t("soil_moisture", "Soil Moisture")}</span>
            <span className="text-base group-hover:scale-110 transition-transform">💧</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            {soilLoading ? (
              <Skeleton />
            ) : soilMoistureVal !== null ? (
              <>
                <span className={`text-2xl sm:text-3xl font-extrabold ${moistureColor}`}>
                  {soilMoistureVal}%
                </span>
                <span className={`text-xs font-semibold bg-blue-100/80 px-1.5 py-0.5 rounded-full ${moistureColor}`}>
                  {soilMoistureStatus ? t(String(soilMoistureStatus).toLowerCase(), soilMoistureStatus) : ''}
                </span>
              </>
            ) : (
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-300">—</span>
            )}
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">
            {soilMoistureSurface !== null && soilMoistureVal !== null
              ? `${t("surface", "Surface")} ${soilMoistureSurface}% · ${t("root", "Root")} ${soilMoistureVal}%`
              : soilMoistureVal !== null
              ? `${t("root_zone", "Root Zone")} (NASA POWER)`
              : t("waiting_nasa", "Waiting for NASA POWER data…")}
          </p>
        </div>

        {/* Soil Temp — live NASA POWER */}
        <div className={glass}>
          <div className="flex items-center justify-between text-amber-700/70 text-xs">
            <span className="font-semibold">{t("soil_temp", "Soil Temperature")}</span>
            <span className="text-base group-hover:scale-110 transition-transform">🌡️</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {soilLoading ? (
              <Skeleton />
            ) : soilTempVal !== null ? (
              <>
                <span className="text-2xl sm:text-3xl font-extrabold text-zinc-800">
                  {soilTempVal}°C
                </span>
              </>
            ) : (
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-300">—</span>
            )}
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">
            {soilData?.soilTempStatus ? t(soilData.soilTempStatus.toLowerCase().replace(/[^a-z0-9]/g, '_'), soilData.soilTempStatus) : t("waiting_temp", "Waiting for soil temp…")}
          </p>
        </div>

        {/* UV Index — live Ambee */}
        <div className={glass}>
          <div className="flex items-center justify-between text-orange-700/70 text-xs">
            <span className="font-semibold">{t("uv_index", "UV Index")}</span>
            <span className="text-base group-hover:scale-110 transition-transform">☀️</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            {soilLoading ? (
              <Skeleton w="w-10" />
            ) : (
              <>
                <span className="text-2xl sm:text-3xl font-extrabold text-orange-600">
                  {uvIndex ?? "—"}
                </span>
                {uvIndex !== null && (
                  <span className={`text-xs font-semibold ${uvRisk(uvIndex).color}`}>
                    {t(uvRisk(uvIndex).label.toLowerCase().replace(' ', '_'), uvRisk(uvIndex).label)}
                  </span>
                )}
              </>
            )}
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">
            {precipitation !== null ? `${t("rainfall", "Rainfall")}: ${precipitation} mm/${t("day", "day")}` : t("todays_uv", "Today's UV")}
          </p>
        </div>

        {/* Pest / Risk */}
        <div className={glass}>
          <div className="flex items-center justify-between text-green-700/70 text-xs">
            <span className="font-semibold">{t("pest_risk", "Pest / Risk")}</span>
            <span className="text-base group-hover:scale-110 transition-transform">🛡️</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
              {currentCrop.riskScore}
            </span>
            <span className="text-xs text-zinc-500">/ 100</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-2 font-medium">
            🟢 {t(currentCrop.riskLevel.toLowerCase(), currentCrop.riskLevel)} {t("risk", "Risk")}
          </p>
        </div>

        {/* Task Progress */}
        <div className={glass}>
          <div className="flex items-center justify-between text-purple-700/70 text-xs">
            <span className="font-semibold">{t("daily_tasks", "Daily Tasks")}</span>
            <span className="text-base group-hover:scale-110 transition-transform">📋</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-700">
              {completedTasksCount}
            </span>
            <span className="text-xs text-zinc-500">/ {totalTasksCount}</span>
          </div>
          <div className="w-full bg-purple-100/60 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full"
              style={{ width: `${taskProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ambee AI summary banner */}
      {!soilLoading && summary && (
        <div className="rounded-xl bg-sky-50/80 border border-sky-200/70 backdrop-blur-sm px-4 py-2.5 flex items-start gap-2.5">
          <span className="text-lg shrink-0">🌐</span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
              {t("ambee_field_summary", "Ambee Field Condition Summary")}
            </span>
            <p className="text-xs text-sky-800 mt-0.5 leading-relaxed">{summary}</p>
            {apparentTemp !== null && (
              <p className="text-[10px] text-sky-600 mt-1">
                {t("feels_like", "Feels like")} {apparentTemp}°C · {t("wind_gust", "Wind Gust")} {soilData?.windGust?.toFixed(1)} m/s
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
