"use client";

import React, { useMemo } from "react";
import { RegisteredCrop } from "../types";
import { formatDateString, getActivityTypeBadge, getActivityTitle } from "../mockData";
import { useLanguage } from "@/lib/language-context";

interface DailyActivitySectionProps {
  currentCrop: RegisteredCrop;
  onToggleActivity: (activityId: string) => void;
  onSelectDate: (date: string) => void;
}

export const DailyActivitySection: React.FC<DailyActivitySectionProps> = ({
  currentCrop,
  onToggleActivity,
  onSelectDate,
}) => {
  const { t } = useLanguage();
  const todaysActivities = useMemo(
    () => currentCrop.activities.filter((act) => act.date === "2026-08-25"),
    [currentCrop.activities]
  );

  const upcomingActivities = useMemo(
    () =>
      currentCrop.activities
        .filter((act) => act.date >= "2026-08-26" && act.status !== "completed")
        .sort((a, b) => a.date.localeCompare(b.date)),
    [currentCrop.activities]
  );

  const glassCard = "rounded-2xl bg-white/60 backdrop-blur-md p-5 sm:p-6 border border-white/70 shadow-sm space-y-4";

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Today's Activities */}
      <div className={glassCard}>
        <div className="flex items-center justify-between pb-3 border-b border-white/50">
          <div>
            <h3 className="text-base font-bold text-zinc-800 flex items-center gap-2">
              <span>⚡</span> {t('today_action_checklist', "Today's Action Checklist")}
            </h3>
            <p className="text-xs text-zinc-500">{formatDateString("2026-08-25", t)} — {t('immediate_field_attention', 'immediate field attention')}</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-700 border border-emerald-200/50">
            {todaysActivities.filter((a) => a.status === "completed").length}/{todaysActivities.length} {t('done_btn', 'Done')}
          </span>
        </div>

        {todaysActivities.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4 text-center">{t('no_tasks_today', 'No tasks today.')}</p>
        ) : (
          <div className="space-y-3">
            {todaysActivities.map((act) => {
              const badge = getActivityTypeBadge(act.type, t);
              const isDone = act.status === "completed";
              return (
                <div
                  key={act.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 backdrop-blur-sm ${
                    isDone
                      ? "bg-emerald-50/60 border-emerald-200/50"
                      : "bg-white/55 border-white/60 shadow-xs"
                  }`}
                >
                  <button
                    onClick={() => onToggleActivity(act.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center text-xs shrink-0 transition-colors ${
                      isDone
                        ? "bg-emerald-500 border-emerald-500 text-white font-bold"
                        : "border-zinc-300 hover:border-emerald-400 bg-white/70"
                    }`}
                  >
                    {isDone && "✓"}
                  </button>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className={`text-sm font-bold ${isDone ? "line-through text-zinc-400" : "text-zinc-800"}`}>
                        {getActivityTitle(act, t)}
                      </h5>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-white/70 ${badge.bg}`}>
                        {act.time}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600">{act.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Activities */}
      <div className={glassCard}>
        <div className="flex items-center justify-between pb-3 border-b border-white/50">
          <div>
            <h3 className="text-base font-bold text-zinc-800 flex items-center gap-2">
              <span>⏳</span> {t('upcoming_activities', 'Upcoming Activities')}
            </h3>
            <p className="text-xs text-zinc-500">{t('next_interventions', 'Next critical interventions')}</p>
          </div>
          <span className="text-xs text-zinc-400 font-medium">{t('chronological', 'Chronological')}</span>
        </div>

        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {upcomingActivities.slice(0, 5).map((act) => {
            const badge = getActivityTypeBadge(act.type, t);
            return (
              <div
                key={act.id}
                onClick={() => onSelectDate(act.date)}
                className="p-3 rounded-xl bg-white/50 hover:bg-white/70 border border-white/60 cursor-pointer transition-all flex items-center justify-between gap-3 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/80 border border-white/60 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">
                      {formatDateString(act.date, t).split(" ")[0]}
                    </span>
                    <span className="text-sm font-extrabold text-emerald-600">
                      {formatDateString(act.date, t).split(" ")[1]?.replace(",", "") || ""}
                    </span>
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-zinc-800">{getActivityTitle(act, t)}</h5>
                    <p className="text-[11px] text-zinc-500 line-clamp-1">{act.description}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 bg-white/70 ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
