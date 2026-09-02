"use client";

import React from "react";
import { CropMarketInfo, Market, ComputedMarketMetrics } from "../types";
import { formatCurrency } from "../marketService";

import { useLanguage } from '@/lib/language-context';
interface PriceComparisonChartProps {
  currentCrop: CropMarketInfo;
  marketsWithMetrics: { market: Market; metrics: ComputedMarketMetrics }[];
  onOpenMarket: (market: Market) => void;
}

export const PriceComparisonChart: React.FC<PriceComparisonChartProps> = ({
  currentCrop,
  marketsWithMetrics,
  onOpenMarket,
}) => {
  const { t } = useLanguage();
  if (!marketsWithMetrics.length) return null;

  const maxPrice = Math.max(
    ...marketsWithMetrics.map((m) => m.market.pricePerQuintal),
    currentCrop.msp
  );

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/85 backdrop-blur-xl border border-emerald-800/15 p-4 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 sm:pb-5 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-1.5">
              <span>📊</span> {t('gross_price_vs_inhand_net', 'Gross Price vs In-Hand Net')}{' '}</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-300">
              Benchmark
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
            Visual comparison of take-home cash across markets.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] sm:text-xs font-bold text-zinc-600">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-zinc-400"></span>
            <span>{t('gross_price', 'Gross Price')}{' '}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span>
            <span>{t('net_inhand', 'Net In-Hand')}{' '}</span>
          </div>
        </div>
      </div>

      {/* Bar Chart rows */}
      <div className="mt-4 sm:mt-6 space-y-3">
        {marketsWithMetrics.map(({ market, metrics }) => {
          const grossWidthPct = Math.min(100, (market.pricePerQuintal / (maxPrice * 1.05)) * 100);
          const netWidthPct = Math.min(100, (metrics.netRealization / (maxPrice * 1.05)) * 100);

          return (
            <div
              key={market.id}
              onClick={() => onOpenMarket(market)}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer hover:shadow-md active:scale-[0.99] ${
                metrics.isBest
                  ? "bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400"
                  : "bg-zinc-50/80 border-zinc-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-extrabold text-zinc-900 text-xs sm:text-sm">{market.name}</span>
                  {metrics.isBest && (
                    <span className="bg-amber-400 text-zinc-950 text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded shadow-xs">
                      🏆 BEST
                    </span>
                  )}
                  <span className="text-[10px] sm:text-xs text-zinc-500 font-medium">
                    (~{market.distanceKm} km)
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-bold justify-between sm:justify-end">
                  <span className="text-zinc-500">
                    Gross: <span className="text-zinc-800">{formatCurrency(market.pricePerQuintal)}</span>
                  </span>
                  <span className="text-amber-700">
                    Freight: −{formatCurrency(market.transportCostPerQuintal)}
                  </span>
                  <span className="text-emerald-950 font-black text-xs sm:text-sm bg-emerald-100 sm:bg-transparent px-1.5 py-0.5 rounded sm:px-0 sm:py-0">
                    Net: {formatCurrency(metrics.netRealization)}/qtl
                  </span>
                </div>
              </div>

              {/* Visual Bars Container */}
              <div className="space-y-1 pt-0.5">
                {/* Gross Price Bar */}
                <div className="h-3 sm:h-3.5 bg-zinc-200 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-zinc-400/80 rounded-full transition-all duration-500"
                    style={{ width: `${grossWidthPct}%` }}
                  />
                </div>

                {/* Net Realization Bar */}
                <div className="h-3.5 sm:h-4 bg-zinc-200 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-[9px] sm:text-[10px] font-black text-white ${
                      metrics.isBest ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "bg-emerald-700"
                    }`}
                    style={{ width: `${netWidthPct}%` }}
                  >
                    {metrics.isBest ? "★ TOP" : ""}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
