"use client";

import React from "react";
import { useLanguage } from "@/lib/language-context";
import { CropMarketInfo, Market } from "../types";
import { calculateNetRealization, findBestMarket, formatCurrency } from "../marketService";

interface MarketSummaryCardsProps {
  currentCrop: CropMarketInfo;
  markets: Market[];
  onOpenMarket: (market: Market) => void;
}

export const MarketSummaryCards: React.FC<MarketSummaryCardsProps> = ({
  currentCrop,
  markets,
  onOpenMarket,
}) => {
  const { t } = useLanguage();

  // Compute highest gross price
  const highestPriceMarket = markets.length > 0
    ? markets.reduce((max, m) => (m.pricePerQuintal > max.pricePerQuintal ? m : max), markets[0])
    : null;

  // Compute best net realization
  const bestNetMarket = findBestMarket(markets);
  const bestNetRealization = bestNetMarket
    ? calculateNetRealization(bestNetMarket.pricePerQuintal, bestNetMarket.transportCostPerQuintal)
    : 0;

  // Average distance
  const avgDistance = markets.length > 0
    ? Math.round(markets.reduce((acc, m) => acc + m.distanceKm, 0) / markets.length)
    : 0;

  // Calculate highest price gain %
  const highestPriceGainPct = highestPriceMarket && highestPriceMarket.thirtyDayAgoPrice > 0
    ? Number((((highestPriceMarket.pricePerQuintal - highestPriceMarket.thirtyDayAgoPrice) / highestPriceMarket.thirtyDayAgoPrice) * 100).toFixed(1))
    : 4.2;

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* 1. Highest Nearby Price */}
      <div className="relative overflow-hidden rounded-2xl bg-white/85 backdrop-blur-xl border border-emerald-800/15 p-3.5 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider truncate">
              {t("max_price", "Highest Price")}
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 text-xs sm:text-sm font-bold shrink-0">
              📈
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1 sm:gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {highestPriceMarket ? formatCurrency(highestPriceMarket.pricePerQuintal) : "—"}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-zinc-500">/qtl</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] sm:text-xs pt-1 border-t border-zinc-100">
          <span className="text-zinc-600 font-medium truncate max-w-[80px] sm:max-w-[140px]">
            {highestPriceMarket?.name || "Mandi"}
          </span>
          <span className={`inline-flex items-center font-bold px-1.5 sm:px-2 py-0.2 rounded ${
            highestPriceGainPct >= 0
              ? "bg-emerald-100 text-emerald-800"
              : "bg-rose-100 text-rose-800"
          }`}>
            {highestPriceGainPct >= 0 ? "↑" : "↓"} {Math.abs(highestPriceGainPct)}%
          </span>
        </div>
      </div>

      {/* 2. Best Net Realization */}
      <div
        onClick={() => bestNetMarket && onOpenMarket(bestNetMarket)}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-white p-3.5 sm:p-5 shadow-md hover:shadow-lg transition-all cursor-pointer ring-2 ring-emerald-400/50 flex flex-col justify-between group active:scale-[0.98]"
      >
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1 truncate">
              <span>🏆</span> {t('best_net', 'Best Net')}
            </span>
            <span className="text-[9px] sm:text-xs bg-emerald-500/40 text-emerald-100 px-1.5 sm:px-2 py-0.2 rounded-full border border-emerald-400/40 font-bold shrink-0">
              {t('top_pick', 'Top Pick')}
            </span>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1 sm:gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              {formatCurrency(bestNetRealization)}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-200">/qtl net</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] sm:text-xs text-emerald-200 pt-1 border-t border-white/10">
          <span className="font-semibold text-white truncate max-w-[85px] sm:max-w-none">
            📍 {bestNetMarket?.name || "Bhadrak"}
          </span>
          <span className="text-emerald-300 font-bold group-hover:translate-x-0.5 transition-transform">
            Details →
          </span>
        </div>
      </div>

      {/* 3. Official MSP */}
      <div className="relative overflow-hidden rounded-2xl bg-white/85 backdrop-blur-xl border border-emerald-800/15 p-3.5 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider truncate">
              {t('govt_msp_label', 'Govt. MSP')}
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 text-xs sm:text-sm font-bold shrink-0">
              ⚖️
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1 sm:gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {formatCurrency(currentCrop.msp)}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-zinc-500">/qtl</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] sm:text-xs pt-1 border-t border-zinc-100">
          <span className="text-zinc-600 font-medium truncate max-w-[90px]">
            {currentCrop.name.split(" ")[0]}
          </span>
          <span className="text-emerald-700 bg-emerald-50 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
            2026-27
          </span>
        </div>
      </div>

      {/* 4. Nearby Markets Count */}
      <div className="relative overflow-hidden rounded-2xl bg-white/85 backdrop-blur-xl border border-emerald-800/15 p-3.5 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider truncate">
              {t('mandis', 'Mandis')}
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 text-xs sm:text-sm font-bold shrink-0">
              🏪
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1 sm:gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {markets.length}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-zinc-500">{t('yards', 'Yards')}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] sm:text-xs text-zinc-600 pt-1 border-t border-zinc-100">
          <span>{t('avg_distance', 'Avg: ~{distance} km', { distance: avgDistance })}</span>
          <span className="font-semibold text-teal-700">{t('radius_250km', 'Radius 250km')}</span>
        </div>
      </div>
    </section>
  );
};
