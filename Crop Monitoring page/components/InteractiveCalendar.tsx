"use client";

import React, { useMemo } from "react";
import { RegisteredCrop, WeatherDay, Activity } from "../types";
import { getActivityTypeBadge, getActivityTitle } from "../mockData";
import { useLanguage } from "@/lib/language-context";

interface InteractiveCalendarProps {
  currentCrop: RegisteredCrop;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  currentMonthDate: Date;
  onChangeMonth: (newDate: Date) => void;
  filterType: string;
  onFilterChange: (newFilter: string) => void;
  weatherForecast: WeatherDay[];
}

export const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  currentCrop,
  selectedDate,
  onSelectDate,
  currentMonthDate,
  onChangeMonth,
  filterType,
  onFilterChange,
  weatherForecast,
}) => {
  const { t } = useLanguage();
  const todayIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const todayStr = `${todayIST.getFullYear()}-${String(todayIST.getMonth() + 1).padStart(2, "0")}-${String(todayIST.getDate()).padStart(2, "0")}`;

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthKeys = [
    "month_january", "month_february", "month_march", "month_april", "month_may", "month_june",
    "month_july", "month_august", "month_september", "month_october", "month_november", "month_december"
  ];
  const defaultMonthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const filteredActivities = useMemo(() => {
    if (filterType === "all") return currentCrop.activities;
    return currentCrop.activities.filter((act) => act.type === filterType);
  }, [currentCrop.activities, filterType]);

  const activitiesByDate = useMemo(() => {
    const map: Record<string, Activity[]> = {};
    filteredActivities.forEach((act) => {
      if (!map[act.date]) map[act.date] = [];
      map[act.date].push(act);
    });
    return map;
  }, [filteredActivities]);

  const handlePrevMonth = () => onChangeMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => onChangeMonth(new Date(year, month + 1, 1));
  const handleTodayMonth = () => {
    onChangeMonth(new Date(2026, 7, 1));
    onSelectDate("2026-08-25");
  };

  return (
    <div className="rounded-2xl bg-white/60 backdrop-blur-md p-5 sm:p-6 border border-white/70 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/50">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-zinc-800">
            {t(monthKeys[month], defaultMonthNames[month])} {year}
          </h3>
          <button
            onClick={handleTodayMonth}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-200/80 transition-colors"
          >
            {t('today', 'Today')}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => onFilterChange(e.target.value)}
            className="text-xs font-medium bg-white/70 text-zinc-700 rounded-lg px-2.5 py-1.5 border border-white/60 focus:outline-none focus:ring-1 focus:ring-emerald-400 backdrop-blur-sm cursor-pointer"
          >
            <option value="all">{t('all_events', 'All Events')}</option>
            <option value="irrigation">{t('event_irrigation', '💧 Irrigation')}</option>
            <option value="fertilizer">{t('event_fertilizer', '🧪 Fertilizers')}</option>
            <option value="inspection">{t('event_inspection', '🔍 Field Scouting')}</option>
            <option value="pest_control">{t('event_pest_control', '🛡️ Pest Protection')}</option>
            <option value="stage_change">{t('event_stage_change', '🌱 Stage Changes')}</option>
          </select>

          <div className="flex items-center gap-1 bg-white/60 rounded-lg p-0.5 border border-white/60 backdrop-blur-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-md hover:bg-white/80 text-zinc-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-md hover:bg-white/80 text-zinc-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 text-center text-xs font-bold text-zinc-400 py-3 border-b border-white/40">
        <span>{t('day_sun', 'SUN')}</span>
        <span>{t('day_mon', 'MON')}</span>
        <span>{t('day_tue', 'TUE')}</span>
        <span>{t('day_wed', 'WED')}</span>
        <span>{t('day_thu', 'THU')}</span>
        <span>{t('day_fri', 'FRI')}</span>
        <span>{t('day_sat', 'SAT')}</span>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-2">
        {/* Previous-month filler */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div
            key={`prev-${i}`}
            className="min-h-[72px] sm:min-h-[88px] p-1.5 rounded-xl bg-white/20 text-zinc-300 text-xs select-none border border-transparent"
          >
            <span className="font-semibold">{daysInPrevMonth - firstDayIndex + i + 1}</span>
          </div>
        ))}

        {/* Current-month days */}
        {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === todayStr;
          const dayActivities = activitiesByDate[dateStr] || [];
          const isSowingDay = dateStr === currentCrop.sowingDate;
          const isHarvestDay = dateStr === currentCrop.expectedHarvestDate;
          const hasRain = weatherForecast.some((w) => w.date === dateStr && (w.condition === "rainy" || w.condition === "storm"));

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`group min-h-[72px] sm:min-h-[88px] p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer border flex flex-col justify-between ${
                isSelected
                  ? "bg-emerald-100/80 border-emerald-400/70 shadow-sm ring-2 ring-emerald-300/30 backdrop-blur-sm"
                  : isToday
                  ? "bg-blue-100/70 border-blue-300/60 backdrop-blur-sm"
                  : "bg-white/40 border-white/50 hover:bg-white/65 hover:border-emerald-200/60 backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs sm:text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday
                      ? "bg-blue-500 text-white"
                      : isSelected
                      ? "bg-emerald-500 text-white"
                      : "text-zinc-700 group-hover:text-emerald-700"
                  }`}
                >
                  {dayNum}
                </span>
                <div className="flex items-center gap-0.5">
                  {hasRain && <span className="text-[10px]" title={t('rain_forecast', 'Rain forecast')}>🌧️</span>}
                  {isSowingDay && <span className="text-[10px]" title={t('sowing_date', 'Sowing Date')}>🌱</span>}
                  {isHarvestDay && <span className="text-[10px]" title={t('expected_harvest', 'Expected Harvest')}>🚜</span>}
                </div>
              </div>

              <div className="space-y-1 my-1 overflow-hidden">
                {dayActivities.slice(0, 2).map((act) => {
                  const badge = getActivityTypeBadge(act.type, t);
                  return (
                    <div
                      key={act.id}
                      className={`text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded truncate border bg-white/70 ${badge.bg} ${
                        act.status === "completed" ? "line-through opacity-60" : ""
                      }`}
                    >
                      <span className="mr-0.5">{badge.icon}</span>
                      <span>{getActivityTitle(act, t)}</span>
                    </div>
                  );
                })}
                {dayActivities.length > 2 && (
                  <div className="text-[9px] font-bold text-zinc-500 px-1">
                    +{dayActivities.length - 2} {t('more', 'more')}
                  </div>
                )}
              </div>

              {dayActivities.length > 0 && (
                <div className="flex items-center gap-1 mt-auto">
                  {dayActivities.slice(0, 3).map((act, idx) => (
                    <span key={idx} className={`w-1.5 h-1.5 rounded-full ${getActivityTypeBadge(act.type, t).dot}`} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-white/40 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> {t('irrigation', 'Irrigation')}</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> {t('fertilizer', 'Fertilizer')}</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> {t('inspection', 'Inspection')}</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> {t('pest_control', 'Pest Control')}</span>
        </div>
        <span className="text-[11px] text-zinc-400">{t('click_date_view_tasks', 'Click any date to view tasks')}</span>
      </div>
    </div>
  );
};
