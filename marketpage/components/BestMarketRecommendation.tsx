"use client";

import React from "react";
import { useLanguage } from "@/lib/language-context";
import { CropMarketInfo, Market } from "../types";
import { calculateNetRealization, formatCurrency } from "../marketService";

interface BestMarketRecommendationProps {
  currentCrop: CropMarketInfo;
  bestMarket: Market | null;
  lowestMarket: Market | null;
  quantityQtl: number;
  onOpenMarket: (market: Market) => void;
  onOpenCompareAll: () => void;
}

export const BestMarketRecommendation: React.FC<BestMarketRecommendationProps> = ({
  currentCrop,
  bestMarket,
  lowestMarket,
  quantityQtl,
  onOpenMarket,
  onOpenCompareAll,
}) => {
  const { t } = useLanguage();
  if (!bestMarket) return null;

  const bestNet = calculateNetRealization(bestMarket.pricePerQuintal, bestMarket.transportCostPerQuintal);
  const lowestNet = lowestMarket
    ? calculateNetRealization(lowestMarket.pricePerQuintal, lowestMarket.transportCostPerQuintal)
    : bestNet;
  
  const profitDifferencePerQtl = bestNet - lowestNet;
  const totalExtraProfit = profitDifferencePerQtl * quantityQtl;

  const mspDiff = bestMarket.pricePerQuintal - bestMarket.msp;
  const netVsMspDiff = bestNet - bestMarket.msp;

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-950 to-zinc-950 text-white p-4 sm:p-8 shadow-xl border border-emerald-500/30">
      {/* Background glowing gradients */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-5 border-b border-white/10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-amber-400 text-zinc-950 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-sm">
              <span>🏆</span> {t('best_market_for_your_crop', 'Best Market For Your Crop')}
            </span>
            <span className="text-[10px] sm:text-xs text-emerald-300/90 font-medium hidden xs:inline">
              {t('max_takehome_cash', 'Max Take-Home Cash')}
            </span>
          </div>

          <span className="text-[10px] sm:text-xs text-zinc-400 font-medium">
            {bestMarket.updatedAt}
          </span>
        </div>

        {/* Core Recommendation Grid */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center">
          {/* Left Column: Mandi Title & Key Metrics */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-400 text-xs font-semibold mb-1 flex-wrap">
                <span>📍 {bestMarket.district}, {bestMarket.state}</span>
                <span>•</span>
                <span>~{bestMarket.distanceKm} km from plot</span>
                {bestMarket.isEnamEnabled && (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-400/30">
                    e-NAM
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {bestMarket.name}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                Highest net profit destination for <span className="text-white font-semibold">{currentCrop.name}</span> after freight deductions.
              </p>
            </div>

            {/* Visual Formula Callout */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/10 grid grid-cols-3 gap-2 items-center text-center">
              {/* Gross Price */}
              <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5">
                <span className="block text-[9px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider truncate">
                  {t('mandi_price_label', 'Mandi Price')}
                </span>
                <span className="block text-base sm:text-2xl font-black text-white mt-0.5">
                  {formatCurrency(bestMarket.pricePerQuintal)}
                </span>
                <span className="text-[9px] sm:text-[10px] text-zinc-400">/qtl</span>
              </div>

              {/* Minus Sign */}
              <div className="flex flex-col items-center justify-center text-amber-400 font-black text-lg sm:text-xl">
                <span className="text-[9px] sm:text-xs font-semibold text-zinc-400 uppercase">
                  Minus
                </span>
                <span>−</span>
              </div>

              {/* Estimated Transport */}
              <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5">
                <span className="block text-[9px] sm:text-[11px] font-bold text-amber-300 uppercase tracking-wider truncate">
                  {t('est_freight', 'Est. Freight')}
                </span>
                <span className="block text-base sm:text-2xl font-black text-amber-300 mt-0.5">
                  {formatCurrency(bestMarket.transportCostPerQuintal)}
                </span>
                <span className="text-[9px] sm:text-[10px] text-zinc-400">/qtl</span>
              </div>
            </div>

            {/* Extra Profit Highlight */}
            {lowestMarket && profitDifferencePerQtl > 0 && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm">
                <span className="text-lg sm:text-xl shrink-0">💰</span>
                <div>
                  <span className="font-bold text-emerald-100">
                    +₹{profitDifferencePerQtl}/qtl higher profit
                  </span>{" "}
                  vs {lowestMarket.name}.
                  {totalExtraProfit > 0 && (
                    <span className="block text-emerald-300 font-semibold mt-0.5 text-[11px] sm:text-xs">
                      (+{formatCurrency(totalExtraProfit)} extra on your {quantityQtl} Qtl batch)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Net Realization Hero Box */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="relative rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-4 sm:p-7 shadow-xl border border-emerald-400/40 text-center">
              <span className="inline-block text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-950 bg-emerald-200 px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs mb-1 sm:mb-2">
                {t('estimated_net_realization', 'Estimated Net Realization')}
              </span>

              <div className="flex items-baseline justify-center gap-1 my-1 sm:my-2">
                <span className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                  {formatCurrency(bestNet)}
                </span>
                <span className="text-xs sm:text-sm font-bold text-emerald-100">/quintal</span>
              </div>

              <p className="text-[11px] sm:text-xs text-emerald-100 font-medium">
                Actual cash in hand per quintal after transport
              </p>

              <div className="mt-3 pt-3 border-t border-emerald-400/30 grid grid-cols-2 gap-2 text-left text-[11px] sm:text-xs">
                <div>
                  <span className="text-emerald-200 block text-[10px]">{t('gross_vs_msp_label', 'Gross vs MSP:')}</span>
                  <span className={`font-extrabold ${mspDiff >= 0 ? "text-emerald-100" : "text-amber-200"}`}>
                    {mspDiff >= 0 ? `+₹${mspDiff} Above` : `−₹${Math.abs(mspDiff)} Below`}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-200 block text-[10px]">{t('net_vs_msp_label', 'Net vs MSP:')}</span>
                  <span className={`font-extrabold ${netVsMspDiff >= 0 ? "text-emerald-100" : "text-amber-200"}`}>
                    {netVsMspDiff >= 0 ? `+₹${netVsMspDiff}` : `−₹${Math.abs(netVsMspDiff)}`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => onOpenMarket(bestMarket)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all border border-zinc-800"
                >
                  <span>{t('view_mandi_details', 'View Mandi Details')}</span>
                  <span>→</span>
                </button>
                <button
                  onClick={onOpenCompareAll}
                  className="w-full inline-flex items-center justify-center gap-1 py-2.5 sm:py-3 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm backdrop-blur-sm transition-all border border-white/25 active:scale-95"
                >
                  <span>{t('compare_all', 'Compare All')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
