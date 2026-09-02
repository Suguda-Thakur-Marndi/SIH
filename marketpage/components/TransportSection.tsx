"use client";

import React from "react";
import { Market } from "../types";
import { TRANSPORT_MODES } from "../mockData";
import { formatCurrency } from "../marketService";

import { useLanguage } from '@/lib/language-context';
interface TransportSectionProps {
  markets: Market[];
  quantityQtl: number;
}

export const TransportSection: React.FC<TransportSectionProps> = ({
  markets,
  quantityQtl,
}) => {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/85 backdrop-blur-xl border border-emerald-800/15 p-4 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 sm:pb-5 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-1.5">
              <span>🚚</span> {t('logistics_estimated_freight', 'Logistics & Estimated Freight')}{' '}</h2>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-300">
              Freight
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
            {t('distancebased_freight_from_your_plot_bar', 'Distance-based freight from your plot (Baripada Block) to regional mandis.')}
          </p>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left: Transport Comparison Table */}
        <div className="lg:col-span-6 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
            {t('mandi_freight_breakdown', 'Mandi Freight Breakdown')}
          </h3>
          <div className="divide-y divide-zinc-200/80 rounded-xl sm:rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden">
            {markets.map((m) => {
              const totalCost = m.transportCostPerQuintal * quantityQtl;
              return (
                <div
                  key={m.id}
                  className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-zinc-100/70 transition-colors gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white flex items-center justify-center text-xs sm:text-sm shadow-xs border border-zinc-200 shrink-0">
                      📍
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-zinc-900 text-xs sm:text-sm block truncate">{m.name}</span>
                      <span className="text-[10px] sm:text-xs text-zinc-500 truncate block">
                        ~{m.distanceKm} km from farm
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-black text-amber-800 text-xs sm:text-sm">
                      {formatCurrency(m.transportCostPerQuintal)}/qtl
                    </div>
                    <span className="text-[10px] text-zinc-500 block">
                      {formatCurrency(totalCost)} ({quantityQtl} Qtl)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Available Transport Vehicle Options */}
        <div className="lg:col-span-6 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
            {t('recommended_freight_vehicles', 'Recommended Freight Vehicles')}
          </h3>
          <div className="grid grid-cols-1 gap-2.5">
            {TRANSPORT_MODES.map((veh, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-200 flex items-start gap-2.5 hover:border-emerald-300 transition-colors"
              >
                <div className="text-xl sm:text-2xl p-1.5 sm:p-2 rounded-xl bg-white shadow-xs border border-zinc-200 shrink-0">
                  {veh.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-zinc-900 text-xs sm:text-sm truncate">{veh.type}</h4>
                    <span className="text-[10px] sm:text-xs font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                      {veh.costPerKm}
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs text-zinc-600 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span>
                      <strong className="text-zinc-700">Cap:</strong> {veh.capacityQtl}
                    </span>
                    <span>•</span>
                    <span className="truncate">
                      {veh.bestFor}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] sm:text-[11px] text-zinc-500 font-medium">
                    ⚡ {veh.availability}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
