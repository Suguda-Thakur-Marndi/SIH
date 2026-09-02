"use client";

import React from "react";
import { RegisteredCrop, WeatherDay } from "../types";
import { formatDateString, getActivityTypeBadge, getActivityTitle, translateWeatherAlert } from "../mockData";
import { useLanguage } from "@/lib/language-context";

function conditionEmoji(condition: WeatherDay["condition"]): string {
  switch (condition) {
    case "rainy":         return "🌧️";
    case "sunny":         return "☀️";
    case "storm":         return "⛈️";
    case "partly_cloudy": return "⛅";
    case "cloudy":        return "☁️";
    default:              return "🌤️";
  }
}

interface SelectedDatePanelProps {
  currentCrop: RegisteredCrop;
  selectedDate: string;
  weatherForecast: WeatherDay[];
  onToggleActivity: (activityId: string) => void;
  onOpenAddModalForDate: (dateStr: string) => void;
  onOpenAiWithPrompt: (prompt: string) => void;
}

export const SelectedDatePanel: React.FC<SelectedDatePanelProps> = ({
  currentCrop,
  selectedDate,
  weatherForecast,
  onToggleActivity,
  onOpenAddModalForDate,
  onOpenAiWithPrompt,
}) => {
  const { t } = useLanguage();
  const selectedDateActivities = currentCrop.activities.filter((act) => act.date === selectedDate);
  const selectedDateWeather: WeatherDay | undefined =
    weatherForecast.find((w) => w.date === selectedDate) || weatherForecast[0];

  return (
    <div className="rounded-2xl bg-white/60 backdrop-blur-md p-5 sm:p-6 border border-white/70 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/50">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            {t('selected_calendar_day', 'Selected Calendar Day')}
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold text-zinc-800">
            📅 {formatDateString(selectedDate, t)}
          </h3>
        </div>
        <button
          onClick={() => onOpenAddModalForDate(selectedDate)}
          className="px-2.5 py-1.5 rounded-lg bg-emerald-100/80 text-emerald-700 hover:bg-emerald-200/80 text-xs font-semibold border border-emerald-200/60 transition-colors"
        >
          + {t('add_task', 'Add Task')}
        </button>
      </div>

      {/* Weather snapshot — live OWM data */}
      {selectedDateWeather ? (
        <div className="rounded-xl bg-white/50 backdrop-blur-sm p-3.5 border border-white/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{conditionEmoji(selectedDateWeather.condition)}</span>
            <div>
              <p className="text-xs font-bold text-zinc-700 capitalize">
                {selectedDateWeather.condition === "rainy"
                  ? t("weather_rainy", "Rainy")
                  : selectedDateWeather.condition === "sunny"
                  ? t("weather_sunny", "Sunny")
                  : selectedDateWeather.condition === "storm"
                  ? t("weather_storm", "Thunderstorm")
                  : selectedDateWeather.condition === "partly_cloudy"
                  ? t("weather_partly_cloudy", "Partly Cloudy")
                  : t("weather_cloudy", "Cloudy")} &nbsp;{selectedDateWeather.tempHigh}°C / {selectedDateWeather.tempLow}°C
              </p>
              <p className="text-[11px] text-zinc-500">
                💧 {selectedDateWeather.rainChance}% {t('rain', 'rain')} · 💦 {selectedDateWeather.humidity}% {t('humidity', 'humidity')} · 💨 {selectedDateWeather.windSpeed} km/h
              </p>
              {selectedDateWeather.alert && (
                <p className="text-[10px] text-amber-700 font-medium mt-0.5">
                  {translateWeatherAlert(selectedDateWeather.alert, t, selectedDateWeather)}
                </p>
              )}
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/70 text-zinc-700 border border-white/60">
            🌿 {t(currentCrop.currentStage.toLowerCase(), currentCrop.currentStage)}
          </span>
        </div>
      ) : (
        <div className="rounded-xl bg-white/30 p-3 border border-white/40 text-center text-xs text-zinc-400">
          {t('weather_loading', 'Weather data loading…')}
        </div>
      )}

      {/* Activities */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-zinc-700 flex items-center gap-1.5">
          <span>📋</span> {t('scheduled_activities', 'Scheduled Activities')} ({selectedDateActivities.length})
        </h4>

        {selectedDateActivities.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-white/60 bg-white/30 text-center space-y-2">
            <span className="text-2xl">🌱</span>
            <p className="text-xs text-zinc-500">{t('no_tasks_scheduled', 'No tasks scheduled for this day.')}</p>
            <button
              onClick={() => onOpenAddModalForDate(selectedDate)}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              + {t('schedule_custom_task', 'Schedule custom field task')}
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {selectedDateActivities.map((act) => {
              const badge = getActivityTypeBadge(act.type, t);
              const isDone = act.status === "completed";
              return (
                <div
                  key={act.id}
                  className={`p-3.5 rounded-xl border transition-all backdrop-blur-sm ${
                    isDone
                      ? "bg-emerald-50/60 border-emerald-200/50"
                      : "bg-white/55 border-white/60 shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleActivity(act.id)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center text-xs transition-colors shrink-0 ${
                        isDone
                          ? "bg-emerald-500 border-emerald-500 text-white font-bold"
                          : "border-zinc-300 hover:border-emerald-400 bg-white/70"
                      }`}
                      title={isDone ? t('mark_incomplete', 'Mark Incomplete') : t('mark_complete', 'Mark Complete')}
                    >
                      {isDone && "✓"}
                    </button>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <h5 className={`text-sm font-bold ${isDone ? "line-through text-zinc-400" : "text-zinc-800"}`}>
                          {getActivityTitle(act, t)}
                        </h5>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-white/70 ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600">{act.description}</p>
                      {act.dosage && (
                        <p className="text-[11px] text-emerald-700 font-medium">
                          {t('dosage', 'Dosage')}: {act.dosage}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                        <span>{act.time}</span>
                        {isDone && (
                          <span className="text-emerald-600 font-semibold">
                            ✓ {t('completed', 'Completed')} {act.completedAt}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Advisory */}
      <div className="rounded-xl bg-emerald-900/75 backdrop-blur-md text-white p-4 border border-emerald-700/40 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              {t('agronomist_guidance', 'Agronomist Guidance')}
            </h5>
          </div>
          <button
            onClick={() =>
              onOpenAiWithPrompt(
                `What are the key farm advisories for ${currentCrop.name} in the ${currentCrop.currentStage} stage?`
              )
            }
            className="text-[11px] font-semibold text-emerald-300 underline hover:text-white"
          >
            {t('ask_assistant', 'Ask Assistant')} →
          </button>
        </div>
        <p className="text-xs text-zinc-200 leading-relaxed">
          {t('tillering_water_advice', 'During tillering, maintain 3cm water depth. If rain exceeds 20mm, drain surplus standing water immediately to avoid root asphyxiation.')}
        </p>
      </div>
    </div>
  );
};
