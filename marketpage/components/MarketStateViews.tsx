"use client";

import React from "react";
import { useLanguage } from '@/lib/language-context';

export const MarketLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/60 border border-zinc-200 p-5 space-y-3">
            <div className="h-4 w-24 bg-zinc-300 rounded" />
            <div className="h-8 w-32 bg-zinc-400 rounded" />
            <div className="h-3 w-20 bg-zinc-300 rounded" />
          </div>
        ))}
      </div>

      {/* Hero Recommendation Skeleton */}
      <div className="h-64 rounded-3xl bg-zinc-900/60 border border-zinc-800 p-8 space-y-4">
        <div className="h-6 w-48 bg-zinc-700 rounded-full" />
        <div className="h-10 w-72 bg-zinc-600 rounded" />
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="h-16 bg-zinc-800 rounded-xl" />
          <div className="h-16 bg-zinc-800 rounded-xl" />
          <div className="h-16 bg-zinc-800 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="h-80 rounded-3xl bg-white/60 border border-zinc-200 p-6 space-y-4">
        <div className="h-6 w-40 bg-zinc-300 rounded" />
        <div className="h-10 w-full bg-zinc-200 rounded-xl" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-full bg-zinc-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

interface MarketErrorStateProps {
  onRetry: () => void;
  errorMessage?: string;
}

export const MarketErrorState: React.FC<MarketErrorStateProps> = ({
  onRetry,
  errorMessage = "Unable to load real-time market rates from AGMARKNET / e-NAM server.",
}) => {
  const { t } = useLanguage();
  return (
    <div className="my-10 p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-rose-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl mx-auto font-bold">
        ⚠️
      </div>
      <h3 className="text-lg font-black text-zinc-900">{t('mandi_connection_unavailable', 'Mandi Connection Unavailable')}</h3>
      <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
        {errorMessage} {t('please_check_network_or_retry', 'Please check your network connection or retry the live data fetch.')}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-colors"
      >
        <span>{t('retry_live_rates', '🔄 Retry Live Rates')}</span>
      </button>
    </div>
  );
};
