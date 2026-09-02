"use client";

import React from "react";
import { CropMarketInfo, Market, ComputedMarketMetrics } from "../types";
import { formatCurrency } from "../marketService";

import { useLanguage } from '@/lib/language-context';
interface NetRealizationCalculatorProps {
  currentCrop: CropMarketInfo;
  bestMarket: Market | null;
  lowestMarket: Market | null;
  quantityQtl: number;
  onQuantityChange: (qtl: number) => void;
  marketsWithMetrics: { market: Market; metrics: ComputedMarketMetrics }[];
}

export const NetRealizationCalculator: React.FC<NetRealizationCalculatorProps> = ({
  currentCrop: _currentCrop,
  bestMarket,
  lowestMarket: _lowestMarket,
  quantityQtl,
  onQuantityChange,
  marketsWithMetrics,
}) => {
  const { t } = useLanguage();
  if (!bestMarket) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/85 backdrop-blur-xl border border-emerald-800/15 p-4 sm:p-7 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 sm:pb-5 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-1.5">
              <span>💰</span> {t('batch_profit_estimator', 'Batch Profit Estimator')}{' '}</h2>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-300">
              Interactive
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
            Calculate your total in-hand revenue for {quantityQtl} quintals.
          </p>
        </div>

        {/* Quick Quantity Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-bold text-zinc-500 shrink-0">Presets:</span>
          {[25, 50, 100, 150].map((preset) => (
            <button
              key={preset}
              onClick={() => onQuantityChange(preset)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                quantityQtl === preset
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
              }`}
            >
              {preset} Qtl
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Slider & Quantity Control */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center">
        {/* Quantity Selector Slider */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="harvest-qty-slider" className="text-xs font-bold uppercase tracking-wider text-zinc-700">
              {t('harvest_quantity', 'Harvest Quantity:')}
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="harvest-qty-input"
                type="number"
                min={1}
                max={1000}
                value={quantityQtl}
                onChange={(e) => onQuantityChange(Math.max(1, Number(e.target.value) || 1))}
                className="w-16 sm:w-20 px-2 py-1 rounded-lg bg-white border border-zinc-300 text-right font-black text-emerald-950 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-xs font-bold text-zinc-500">Qtl</span>
            </div>
          </div>

          <input
            id="harvest-qty-slider"
            type="range"
            min={10}
            max={300}
            step={5}
            value={quantityQtl}
            onChange={(e) => onQuantityChange(Number(e.target.value))}
            className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />

          <div className="flex justify-between text-[10px] sm:text-[11px] text-zinc-500 font-semibold">
            <span>10 Qtl</span>
            <span>100 Qtl (Standard)</span>
            <span>300+ Qtl</span>
          </div>

          {/* Explanation Callout */}
          <div className="p-3 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-950 text-xs flex items-start gap-2">
            <span className="text-sm shrink-0">💡</span>
            <div className="leading-snug">
              <span className="font-bold">{t('golden_rule', 'Golden Rule:')}{' '}</span> Compare total in-hand cash after freight, not just headline mandi bids.
            </div>
          </div>
        </div>

        {/* Calculated Revenue Breakdown for Recommended Market */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {/* Gross Total */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-zinc-200 text-center shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              {t('gross_mandi_revenue', 'Gross Mandi Revenue')}
            </span>
            <span className="text-lg sm:text-2xl font-extrabold text-zinc-900 block my-0.5">
              {formatCurrency(bestMarket.pricePerQuintal * quantityQtl)}
            </span>
            <span className="text-[10px] text-zinc-500">
              @{formatCurrency(bestMarket.pricePerQuintal)} × {quantityQtl} Qtl
            </span>
          </div>

          {/* Transport Total */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50/80 border border-amber-200 text-center shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              {t('total_freight_cost', 'Total Freight Cost')}
            </span>
            <span className="text-lg sm:text-2xl font-extrabold text-amber-700 block my-0.5">
              −{formatCurrency(bestMarket.transportCostPerQuintal * quantityQtl)}
            </span>
            <span className="text-[10px] text-amber-800/80">
              @{formatCurrency(bestMarket.transportCostPerQuintal)} × {quantityQtl} Qtl
            </span>
          </div>

          {/* Net Profit in Hand */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white text-center shadow-md">
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">
              {t('inhand_net_cash', 'In-Hand Net Cash')}
            </span>
            <span className="text-xl sm:text-2xl font-black text-white block my-0.5">
              {formatCurrency((bestMarket.pricePerQuintal - bestMarket.transportCostPerQuintal) * quantityQtl)}
            </span>
            <span className="text-[10px] text-emerald-200 font-semibold truncate block">
              At {bestMarket.name}
            </span>
          </div>
        </div>
      </div>

      {/* Comparison Grid for this quantity */}
      <div className="mt-4 sm:mt-6 pt-3.5 sm:pt-5 border-t border-zinc-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2.5">
          In-Hand Cash Comparison ({quantityQtl} Quintals):
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {marketsWithMetrics.map(({ market, metrics }) => (
            <div
              key={market.id}
              className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
                metrics.isBest
                  ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400"
                  : "bg-zinc-50 border-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="font-bold text-zinc-800 truncate text-[11px] sm:text-xs">
                  {market.name}
                </span>
                {metrics.isBest && <span className="text-[10px]">🏆</span>}
              </div>
              <div className="text-sm sm:text-base font-black text-zinc-900">
                {formatCurrency(metrics.netRealization * quantityQtl)}
              </div>
              <div className="text-[10px] text-zinc-500 flex justify-between mt-0.5">
                <span>{formatCurrency(metrics.netRealization)}/qtl</span>
                <span className="text-zinc-400">~{market.distanceKm}km</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
