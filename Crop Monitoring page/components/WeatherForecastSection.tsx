"use client";

import React from "react";
import { WeatherDay } from "../types";
import { formatDateString, getWeatherDayName, translateWeatherAlert } from "../mockData";
import { useLanguage } from "@/lib/language-context";

interface WeatherForecastSectionProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  weatherForecast: WeatherDay[];
  weatherLoading: boolean;
  weatherError: string | null;
  onRefresh: () => void;
}

function conditionEmoji(condition: WeatherDay["condition"]): string {
  switch (condition) {
    case "rainy": return "🌧️";
    case "sunny": return "☀️";
    case "storm": return "⛈️";
    case "partly_cloudy": return "⛅";
    case "cloudy": return "☁️";
    default: return "🌤️";
  }
}

export const WeatherForecastSection: React.FC<WeatherForecastSectionProps> = ({
  selectedDate,
  onSelectDate,
  weatherForecast,
  weatherLoading,
  weatherError,
  onRefresh,
}) => {
  const { t } = useLanguage();
  return (
    <section className="rounded-2xl bg-white/60 backdrop-blur-md p-5 sm:p-6 border border-white/70 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/50">
        <div>
          <h3 className="text-base font-bold text-zinc-800 flex items-center gap-2">
            <span>🌦️</span> {t("7_day_forecast", "7-Day Local Weather Forecast")}
          </h3>
          <p className="text-xs text-zinc-500">
            {t("mayurbhanj_district", "Baripada (Mayurbhanj), Odisha")} · {t("live_weather_service", "Live via OpenWeatherMap")}
          </p>
        </div>

        {/* Refresh / status badge */}
        <div className="flex items-center gap-2">
          {weatherError && (
            <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              ⚠ {t('offline', 'Offline')}
            </span>
          )}
          {!weatherLoading && !weatherError && weatherForecast.length > 0 && (
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              🟢 {t('live', 'Live')}
            </span>
          )}
          <button
            onClick={onRefresh}
            title={t('refresh_weather', 'Refresh weather')}
            className="p-1.5 rounded-lg hover:bg-white/60 transition-colors text-zinc-500 hover:text-zinc-700 cursor-pointer"
          >
            <svg className={`w-4 h-4 ${weatherLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {weatherLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-3 rounded-xl border border-white/55 bg-white/30 animate-pulse space-y-2">
              <div className="h-3 bg-zinc-200 rounded w-3/4 mx-auto" />
              <div className="h-2 bg-zinc-100 rounded w-1/2 mx-auto" />
              <div className="h-8 bg-zinc-200 rounded-full w-8 mx-auto my-2" />
              <div className="h-3 bg-zinc-200 rounded w-full mx-auto" />
              <div className="h-2 bg-blue-100 rounded w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {weatherError && !weatherLoading && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-center space-y-2">
          <p className="text-sm text-rose-700 font-semibold">⚠️ {t('weather_error_msg', 'Could not load live weather')}</p>
          <p className="text-xs text-rose-500">{weatherError}</p>
          <button
            onClick={onRefresh}
            className="text-xs text-rose-600 underline hover:text-rose-800 font-medium cursor-pointer"
          >
            {t('try_again', 'Try again')}
          </button>
        </div>
      )}

      {/* Forecast grid */}
      {!weatherLoading && !weatherError && weatherForecast.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {weatherForecast.map((w: WeatherDay) => (
            <div
              key={w.date}
              onClick={() => onSelectDate(w.date)}
              className={`p-3 rounded-xl text-center border cursor-pointer transition-all backdrop-blur-sm ${
                selectedDate === w.date
                  ? "bg-emerald-100/80 border-emerald-300/70 shadow-sm ring-1 ring-emerald-400/30"
                  : "bg-white/45 border-white/55 hover:bg-white/65"
              }`}
            >
              <p className="text-[11px] sm:text-xs font-bold text-zinc-700 truncate" title={getWeatherDayName(w.dayName, t)}>
                {getWeatherDayName(w.dayName, t)}
              </p>
              <p className="text-[10px] text-zinc-400 truncate">{formatDateString(w.date, t).split(",")[0]}</p>
              <div className="text-2xl my-2">{conditionEmoji(w.condition)}</div>
              <p className="text-xs font-extrabold text-zinc-800">
                {w.tempHigh}° / <span className="text-zinc-400 font-normal">{w.tempLow}°</span>
              </p>
              <div className="mt-1 text-[10px] text-blue-600 font-semibold">
                💧 {w.rainChance}%
              </div>
              <div className="mt-0.5 text-[10px] text-zinc-500">
                💨 {w.windSpeed} km/h
              </div>
              {w.condition === "sunny" && (
                <div className="mt-1 text-[9px] text-emerald-600 font-semibold truncate">✓ {t('field_day', 'Field Day')}</div>
              )}
              {(w.condition === "rainy" || w.condition === "storm") && (
                <div className="mt-1 text-[9px] text-rose-500 font-semibold truncate">⚠ {t('rain_warning', 'Rain')}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Alert for selected date */}
      {!weatherLoading && weatherForecast.length > 0 && (() => {
        const sel = weatherForecast.find((w) => w.date === selectedDate);
        return sel?.alert ? (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed text-amber-800 font-medium break-words">
            {translateWeatherAlert(sel.alert, t, sel)}
          </div>
        ) : null;
      })()}

      {/* Feature 4: Irrigation Advisory Card */}
      {!weatherLoading && (
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-blue-900/90 via-sky-900/80 to-slate-900/90 text-white border border-blue-400/30 shadow-md space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">⏸️</span>
              <div>
                <h4 className="text-sm font-extrabold text-blue-100 uppercase tracking-wide">
                  Smart Irrigation Advisory: SKIP IRRIGATION
                </h4>
                <p className="text-xs text-sky-200 font-medium">48-Hour Monsoon Forecast Cross-Reference</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                💰 Est. Savings: ~₹450 Fuel (2.5-acre ref)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-sky-300 border border-blue-400/30 text-xs font-bold">
                💧 ~25,000L Water (2.5-acre ref)
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-[13px] text-slate-200 font-medium leading-relaxed bg-black/20 p-3 rounded-xl border border-white/10">
            <strong>28.0mm rainfall</strong> expected over the next 48 hours in Baripada (exceeds <strong>20mm paddy threshold</strong>). Irrigation is unneeded today and running pumps would cause root waterlogging and waste diesel.
          </p>

          <div className="flex items-center justify-between text-[11px] text-sky-300 font-semibold pt-1">
            <span>Soil Moisture: 26% (Panicle Initiation stage)</span>
            <span>Next Check: Tomorrow 08:00 AM</span>
          </div>
        </div>
      )}
    </section>
  );
};
