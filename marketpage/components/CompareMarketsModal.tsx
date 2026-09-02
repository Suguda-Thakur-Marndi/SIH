"use client";

import React from "react";
import { CropMarketInfo, Market, ComputedMarketMetrics } from "../types";
import { formatCurrency } from "../marketService";

import { useLanguage } from '@/lib/language-context';
interface CompareMarketsModalProps {
  currentCrop: CropMarketInfo;
  marketsWithMetrics: { market: Market; metrics: ComputedMarketMetrics }[];
  quantityQtl: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectMarket: (market: Market) => void;
}

export const CompareMarketsModal: React.FC<CompareMarketsModalProps> = ({
  currentCrop,
  marketsWithMetrics,
  quantityQtl,
  isOpen,
  onClose,
  onSelectMarket,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const sorted = [...marketsWithMetrics].sort(
    (a, b) => b.metrics.netRealization - a.metrics.netRealization
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto bg-zinc-950/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-t-3xl sm:rounded-3xl bg-white text-zinc-900 shadow-2xl border border-emerald-800/20 overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Swipe Grab Bar */}
        <div className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-zinc-950 text-white p-4 sm:p-6 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5">
              <span>{currentCrop.icon} {currentCrop.name}</span>
              <span>•</span>
              <span>MSP {formatCurrency(currentCrop.msp)}/qtl</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight">
              {t('all_regional_mandis_matrix', 'All Regional Mandis Matrix')}
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-300 mt-0.5">
              Ranked by Net Realization for {quantityQtl} Qtl batch.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Content Table / Cards with smooth scroll */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1">
          {/* Mobile Card List for phones */}
          <div className="sm:hidden space-y-2.5">
            {sorted.map(({ market, metrics }, index) => {
              const totalNet = metrics.netRealization * quantityQtl;

              return (
                <div
                  key={market.id}
                  onClick={() => {
                    onClose();
                    onSelectMarket(market);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    metrics.isBest
                      ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400"
                      : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                          index === 0
                            ? "bg-amber-400 text-zinc-950 shadow-xs"
                            : "bg-zinc-200 text-zinc-800"
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <span className="font-extrabold text-zinc-900 text-sm">{market.name}</span>
                    </div>

                    {index === 0 && (
                      <span className="bg-amber-400 text-zinc-950 text-[9px] font-black px-1.5 py-0.2 rounded">
                        🏆 BEST
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-xs flex justify-between items-center text-zinc-600">
                    <span>Mandi: <strong>{formatCurrency(market.pricePerQuintal)}</strong></span>
                    <span>Freight: <strong className="text-amber-700">−{formatCurrency(market.transportCostPerQuintal)}</strong></span>
                    <span className="font-black text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded">
                      Net: {formatCurrency(metrics.netRealization)}/qtl
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-zinc-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">~{market.distanceKm} km ({market.district})</span>
                    <span className="font-bold text-zinc-900">Total Net: {formatCurrency(totalNet)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View for >= sm */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-zinc-200 text-[11px] font-black uppercase tracking-wider text-zinc-500 bg-zinc-50">
                  <th className="py-3 px-3 rounded-l-xl">Rank</th>
                  <th className="py-3 px-3">{t('mandi_yard', 'Mandi Yard')}{' '}</th>
                  <th className="py-3 px-3">Distance</th>
                  <th className="py-3 px-3 text-right">{t('gross_price', 'Gross Price')}{' '}</th>
                  <th className="py-3 px-3 text-right">Freight</th>
                  <th className="py-3 px-4 text-right bg-emerald-50 font-black text-emerald-950">
                    {t('net_realization', 'Net Realization')}
                  </th>
                  <th className="py-3 px-3 text-right">Total Net ({quantityQtl} Qtl)</th>
                  <th className="py-3 px-3 text-center">vs MSP</th>
                  <th className="py-3 px-3 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-sm">
                {sorted.map(({ market, metrics }, index) => {
                  const totalNet = metrics.netRealization * quantityQtl;

                  return (
                    <tr
                      key={market.id}
                      className={`hover:bg-emerald-50/40 transition-colors ${
                        metrics.isBest ? "bg-emerald-50/70 font-semibold" : ""
                      }`}
                    >
                      <td className="py-3.5 px-3">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                            index === 0
                              ? "bg-amber-400 text-zinc-950 shadow-xs"
                              : "bg-zinc-200 text-zinc-800"
                          }`}
                        >
                          #{index + 1}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-extrabold text-zinc-900 flex items-center gap-1.5">
                          <span>{market.name}</span>
                          {index === 0 && (
                            <span className="bg-amber-400 text-zinc-950 text-[10px] font-black px-1.5 py-0.2 rounded">
                              🏆 BEST
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-500 font-normal">
                          {market.district}, {market.state}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-xs text-zinc-600">
                        ~{market.distanceKm} km
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold text-zinc-800">
                        {formatCurrency(market.pricePerQuintal)}
                      </td>

                      <td className="py-3.5 px-3 text-right font-semibold text-amber-700">
                        −{formatCurrency(market.transportCostPerQuintal)}
                      </td>

                      <td className="py-3.5 px-4 text-right bg-emerald-50/80">
                        <div className="font-black text-emerald-950 text-sm">
                          {formatCurrency(metrics.netRealization)}/qtl
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-black text-zinc-900">
                        {formatCurrency(totalNet)}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            metrics.isAboveMsp
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {metrics.mspDifference >= 0
                            ? `+₹${metrics.mspDifference}`
                            : `−₹${Math.abs(metrics.mspDifference)}`}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => {
                            onClose();
                            onSelectMarket(market);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-zinc-100 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-600 shrink-0">
          <span className="truncate mr-2">* Calculated via (Mandi Price − Freight).</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold transition-colors shrink-0 text-xs"
          >
            {t("close", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
};
