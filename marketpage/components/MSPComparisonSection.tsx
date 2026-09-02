"use client";

import React from "react";
import { CropMarketInfo, Market, ComputedMarketMetrics } from "../types";
import { formatCurrency } from "../marketService";

import { useLanguage } from '@/lib/language-context';
interface MSPComparisonSectionProps {
  currentCrop: CropMarketInfo;
  marketsWithMetrics: { market: Market; metrics: ComputedMarketMetrics }[];
}

export const MSPComparisonSection: React.FC<MSPComparisonSectionProps> = ({
  currentCrop,
  marketsWithMetrics,
}) => {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/85 backdrop-blur-xl border border-emerald-800/15 p-4 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 sm:pb-5 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-1.5">
              <span>⚖️</span> {t('govt_msp_benchmark', 'Govt MSP Benchmark')}{' '}</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-300">
              {t('msp_202627', 'MSP 2026-27')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
            Official benchmark for <span className="font-semibold text-zinc-900">{currentCrop.name}</span>:{" "}
            <span className="font-black text-emerald-800">{formatCurrency(currentCrop.msp)}/qtl</span>.
          </p>
        </div>
      </div>

      {/* Critical Insight Alert Banner */}
      <div className="mt-3.5 sm:mt-5 p-3.5 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm flex items-start gap-2.5">
        <span className="text-base sm:text-xl shrink-0">⚠️</span>
        <div className="leading-snug">
          <span className="font-extrabold block text-amber-900">
            {t('farmer_note_on_net_vs_msp', 'Farmer Note on Net vs MSP:')}
          </span>
          A mandi gross price above MSP does not guarantee net profit above MSP if freight exceeds the premium. Always look at the <strong className="text-emerald-900 underline">{t('net_realization', 'Net Realization')}</strong>.
        </div>
      </div>

      {/* Grid of Mandis comparing Gross vs Net vs MSP */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {marketsWithMetrics.map(({ market, metrics }) => {
          const grossDiff = market.pricePerQuintal - currentCrop.msp;
          const netDiff = metrics.netRealization - currentCrop.msp;

          return (
            <div
              key={market.id}
              className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
                metrics.isBest
                  ? "bg-emerald-50/80 border-emerald-300 shadow-sm"
                  : "bg-zinc-50 border-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 gap-2">
                <span className="font-extrabold text-zinc-900 text-xs sm:text-sm truncate">{market.name}</span>
                <span
                  className={`text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded shrink-0 ${
                    metrics.isAboveMsp
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {metrics.isAboveMsp ? `✓ ${t('above_msp', 'Above MSP')}` : `⚠ ${t('below_msp', 'Below MSP')}`}
                </span>
              </div>

              <div className="mt-2.5 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-[11px]">{t('mandi_price', 'Mandi Price:')}{' '}</span>
                  <span className="font-bold text-zinc-900">{formatCurrency(market.pricePerQuintal)}/qtl</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-[11px]">{t('govt_msp', 'Govt MSP:')}{' '}</span>
                  <span className="font-semibold text-zinc-700">{formatCurrency(currentCrop.msp)}/qtl</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-[11px]">{t('gross_vs_msp', 'Gross vs MSP:')}{' '}</span>
                  <span className={`font-bold ${grossDiff >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    {grossDiff >= 0 ? `+${formatCurrency(grossDiff)}` : `−${formatCurrency(Math.abs(grossDiff))}`}/qtl
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-200 flex justify-between items-center">
                  <span className="font-bold text-zinc-800 text-[11px]">{t('net_vs_msp', 'Net vs MSP:')}{' '}</span>
                  <span
                    className={`font-black text-[11px] px-2 py-0.5 rounded ${
                      netDiff >= 0
                        ? "bg-emerald-200 text-emerald-950"
                        : "bg-amber-200 text-amber-950"
                    }`}
                  >
                    {netDiff >= 0 ? `+${formatCurrency(netDiff)} Above` : `−${formatCurrency(Math.abs(netDiff))} Below`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
