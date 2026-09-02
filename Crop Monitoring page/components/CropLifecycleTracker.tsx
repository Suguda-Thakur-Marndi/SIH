"use client";

import React from "react";
import { RegisteredCrop } from "../types";
import { formatDateString } from "../mockData";
import { useLanguage } from "@/lib/language-context";

interface CropLifecycleTrackerProps {
  currentCrop: RegisteredCrop;
  onSelectDate: (dateStr: string) => void;
}

export const CropLifecycleTracker: React.FC<CropLifecycleTrackerProps> = ({
  currentCrop,
  onSelectDate,
}) => {
  const { t } = useLanguage();
  return (
    <section className="rounded-2xl bg-white/55 backdrop-blur-md p-5 sm:p-6 border border-white/70 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-white/50">
        <div>
          <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
            <span>🌱</span> {t('crop_lifecycle_progression', 'Crop Lifecycle Progression')}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500">
            {t('full_physiological_dev', 'Full physiological development — germination to harvest')}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> {t('completed', 'Completed')}
          </span>
          <span className="flex items-center gap-1.5 text-teal-700">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse inline-block" /> {t('active', 'Active')}
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 inline-block" /> {t('upcoming', 'Upcoming')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        {currentCrop.stages.map((stg, index) => {
          const isCompleted = stg.status === "completed";
          const isCurrent = stg.status === "current";
          return (
            <div
              key={stg.id}
              onClick={() => onSelectDate(stg.startDate)}
              className={`cursor-pointer relative p-4 rounded-xl transition-all border flex flex-col justify-between backdrop-blur-sm ${
                isCurrent
                  ? "bg-teal-50/70 border-teal-400/60 shadow-md ring-2 ring-teal-300/30"
                  : isCompleted
                  ? "bg-emerald-50/60 border-emerald-300/50 hover:bg-emerald-50/80"
                  : "bg-white/40 border-white/60 hover:bg-white/55 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  {t('stage', 'Stage')} 0{index + 1}
                </span>
                {isCompleted && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
                {isCurrent && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-teal-500 text-white uppercase tracking-wider animate-pulse">
                    {t('current', 'CURRENT')}
                  </span>
                )}
                {!isCompleted && !isCurrent && (
                  <span className="w-4 h-4 rounded-full border-2 border-zinc-300" />
                )}
              </div>

              <div>
                <div className="text-2xl mb-1">{stg.icon}</div>
                <h4 className="font-bold text-sm text-zinc-800 leading-tight">
                  {t(stg.name.toLowerCase().replace(/[^a-z0-9]/g, '_'), stg.name)}
                </h4>
                <p className="text-[11px] text-zinc-500 mt-1">
                  {formatDateString(stg.startDate, t)} – {formatDateString(stg.endDate, t)}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/40 text-[11px] space-y-1">
                <p className="text-zinc-600 truncate">
                  <strong className="text-zinc-700">{t('focus', 'Focus')}:</strong> {stg.nutrientFocus}
                </p>
                <p className="text-zinc-500 truncate">
                  <strong>{t('water', 'Water')}:</strong> {stg.waterRequirement}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
