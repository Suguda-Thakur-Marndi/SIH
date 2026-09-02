 "use client";

import React from "react";
import { CropMarketInfo } from "../types";
import { useLanguage } from "@/lib/language-context";

interface MarketHeaderProps {
  crops: CropMarketInfo[];
  selectedCropId: string;
  onSelectCrop: (cropId: string) => void;
  lastUpdatedTime: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenCompareAll: () => void;
  isLiveApi?: boolean;
  apiSource?: string;
  totalRecords?: number;
}

export const MarketHeader: React.FC<MarketHeaderProps> = ({
  crops,
  selectedCropId,
  onSelectCrop,
  lastUpdatedTime: _lastUpdatedTime,
  onRefresh,
  isRefreshing,
  onOpenCompareAll,
  isLiveApi = true,
  apiSource: _apiSource,
  totalRecords = 0,
}) => {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-emerald-900/10 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">
        {/* Top Row on Mobile: Brand, Title & Quick Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 flex items-center justify-center text-white text-lg sm:text-2xl shadow-md shrink-0 ring-2 ring-emerald-500/20">
              🏛️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300/60">
                  {t('smart_farm_os', 'Smart Farm OS')}
                </span>
                {isLiveApi ? (
                  <span className="text-[10px] sm:text-xs text-emerald-800 bg-emerald-100/90 font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-emerald-300 truncate max-w-[190px] sm:max-w-none">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
                    {t('live_feed', 'Live Feed')} ({totalRecords} {t('mandis', 'mandis')})
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-xs text-amber-800 bg-amber-100 font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    {t('benchmark_mode', 'Benchmark Mode')}
                  </span>
                )}
              </div>
              <h1 className="text-base sm:text-2xl font-extrabold tracking-tight text-zinc-900 truncate mt-0.5">
                {t('mandi_prices_title', 'Mandi Net Realization')}
              </h1>
            </div>
          </div>

          {/* Quick Action Icons on Mobile */}
          <div className="flex items-center gap-1.5 md:hidden shrink-0">
            <button
              onClick={onOpenCompareAll}
              className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
              title={t('compare_all_markets_tooltip', 'Compare all nearby markets side-by-side')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 shadow-xs disabled:opacity-50"
              title={t('refresh_mandi_rates', 'Refresh Mandi Rates')}
            >
              <svg
                className={`w-4 h-4 text-emerald-700 ${isRefreshing ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Second Row / Desktop Controls: Crop Selector & Desktop Action Buttons */}
        <div className="flex items-center justify-between sm:justify-end flex-wrap gap-2">
          {/* Crop Selector (Full Width on Mobile) */}
          <div className="relative w-full sm:w-auto flex-1 sm:flex-initial">
            <label htmlFor="market-crop-select" className="sr-only">
              {t('select_current_crop', 'Select Current Crop')}
            </label>
            <div className="flex items-center justify-between sm:justify-start bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-xs sm:text-sm font-semibold rounded-xl pl-3 pr-2 py-2 sm:py-2.5 border border-zinc-700 shadow-sm transition-colors cursor-pointer group">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-zinc-400 text-[10px] sm:text-xs uppercase tracking-wider font-bold shrink-0">
                  {t('crop_label', 'Crop')}:
                </span>
                <select
                  id="market-crop-select"
                  value={selectedCropId}
                  onChange={(e) => onSelectCrop(e.target.value)}
                  className="appearance-none bg-transparent text-emerald-300 font-bold focus:outline-none cursor-pointer pr-6 py-0.5 truncate text-xs sm:text-sm"
                >
                  {crops.map((c) => (
                    <option key={c.id} value={c.id} className="bg-zinc-900 text-zinc-100 font-normal">
                      {c.icon} {c.name} ({c.variety})
                    </option>
                  ))}
                </select>
              </div>
              <div className="pointer-events-none absolute right-2.5 flex items-center text-zinc-400 group-hover:text-emerald-400 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Desktop Only Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenCompareAll}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
              title={t('compare_all_markets_tooltip', 'Compare all nearby markets side-by-side')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>{t('compare_all', 'Compare All')}</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300/80 shadow-xs transition-colors disabled:opacity-50"
              title={t('refresh_mandi_rates', 'Refresh Mandi Rates')}
            >
              <svg
                className={`w-4 h-4 text-emerald-700 ${isRefreshing ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
