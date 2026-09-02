"use client";

import React, { useState } from "react";
import { Market, ComputedMarketMetrics, MarketFilterState, SortField } from "../types";
import { formatCurrency } from "../marketService";

import { useLanguage } from '@/lib/language-context';
interface NearbyMandisTableProps {
  marketsWithMetrics: { market: Market; metrics: ComputedMarketMetrics }[];
  filters: MarketFilterState;
  onFilterChange: (filters: MarketFilterState) => void;
  onOpenMarket: (market: Market) => void;
  onResetFilters: () => void;
}

export const NearbyMandisTable: React.FC<NearbyMandisTableProps> = ({
  marketsWithMetrics,
  filters,
  onFilterChange,
  onOpenMarket,
  onResetFilters,
}) => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const handleSort = (field: SortField) => {
    if (filters.sortField === field) {
      onFilterChange({
        ...filters,
        sortDirection: filters.sortDirection === "asc" ? "desc" : "asc",
      });
    } else {
      onFilterChange({
        ...filters,
        sortField: field,
        sortDirection: field === "distanceKm" || field === "transportCostPerQuintal" ? "asc" : "desc",
      });
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (filters.sortField !== field) {
      return <span className="text-zinc-400 opacity-40 ml-1 text-xs">↕</span>;
    }
    return (
      <span className="text-emerald-700 font-black ml-1 text-xs">
        {filters.sortDirection === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/85 backdrop-blur-xl border border-emerald-800/15 p-4 sm:p-7 shadow-xs">
      {/* Title & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 sm:pb-5 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-1.5">
              <span>🏪</span> {t('nearby_mandis', 'Nearby Mandis')}{' '}</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-300">
              {marketsWithMetrics.length} Mandis
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
            {t('ranked_by_net_realization', 'Ranked by Net Realization (Mandi Price − Freight).')}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Mobile Sort Dropdown */}
          <div className="sm:hidden flex items-center gap-1 bg-zinc-100 px-2.5 py-1.5 rounded-xl border border-zinc-300 text-xs">
            <span className="text-zinc-500 font-bold">{t('sort_label', 'Sort')}:</span>
            <select
              value={filters.sortField}
              onChange={(e) => handleSort(e.target.value as SortField)}
              className="bg-transparent font-bold text-emerald-900 focus:outline-none"
            >
              <option value="netRealization">{t('net_realization', 'Net Realization')}</option>
              <option value="pricePerQuintal">{t('gross_price', 'Gross Price')}{' '}</option>
              <option value="distanceKm">{t('nearest_first', 'Nearest First')}{' '}</option>
              <option value="transportCostPerQuintal">{t('lowest_freight', 'Lowest Freight')}{' '}</option>
            </select>
          </div>

          <div className="inline-flex rounded-xl bg-zinc-100 p-1 border border-zinc-300/80">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "cards"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              🗂️ {t('cards_view', 'Cards')}
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              📊 {t('table_view', 'Table')}
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-3 sm:mt-4 space-y-2.5">
        {/* Search Input */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder={t('search_mandi', 'Search mandi, district or state...')}
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-zinc-900 placeholder:text-zinc-400"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: "" })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Scrollable Filter Chips for Mobile Touch */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {/* Radius Chips */}
          {[
            { label: t('all_radii', 'All Radii'), val: 500 },
            { label: "≤ 50 km", val: 50 },
            { label: "≤ 100 km", val: 100 },
            { label: "≤ 150 km", val: 150 },
            { label: "≤ 250 km", val: 250 },
          ].map((chip) => (
            <button
              key={chip.val}
              onClick={() => onFilterChange({ ...filters, maxDistanceKm: chip.val })}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all shrink-0 ${
                filters.maxDistanceKm === chip.val
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
              }`}
            >
              {chip.label}
            </button>
          ))}

          {/* e-NAM Toggle Chip */}
          <button
            onClick={() => onFilterChange({ ...filters, onlyEnam: !filters.onlyEnam })}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-1 ${
              filters.onlyEnam
                ? "bg-emerald-800 text-white shadow-xs"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
            }`}
          >
            <span>⚡ {t('enam_only', 'e-NAM Only')}</span>
          </button>

          {/* Above MSP Toggle Chip */}
          <button
            onClick={() => onFilterChange({ ...filters, onlyAboveMsp: !filters.onlyAboveMsp })}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-1 ${
              filters.onlyAboveMsp
                ? "bg-emerald-800 text-white shadow-xs"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
            }`}
          >
            <span>⚖️ {t('above_msp', 'Above MSP')}</span>
          </button>
        </div>
      </div>

      {/* Empty Filter State */}
      {marketsWithMetrics.length === 0 ? (
        <div className="my-6 text-center py-8 px-4 bg-zinc-50/80 rounded-2xl border border-dashed border-zinc-300">
          <div className="text-3xl mb-1.5">🔍</div>
          <h3 className="text-sm font-bold text-zinc-800">{t('no_mandis_match', 'No mandis match your active filters')}</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-0.5">
            {t('expand_radius_or_reset', 'Try expanding radius to 500 km or resetting filters.')}
          </p>
          <button
            onClick={onResetFilters}
            className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            {t('reset_all_filters', 'Reset All Filters')}
          </button>
        </div>
      ) : (
        <>
          {/* ── Mobile-First Cards View ── */}
          <div
            className={`mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 ${
              viewMode === "cards" ? "block" : "block md:hidden"
            }`}
          >
            {marketsWithMetrics.map(({ market, metrics }) => (
              <div
                key={market.id}
                onClick={() => onOpenMarket(market)}
                className={`relative rounded-2xl p-4 border transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-[0.98] ${
                  metrics.isBest
                    ? "bg-gradient-to-b from-emerald-50 via-white to-white border-emerald-400 ring-2 ring-emerald-500/20"
                    : "bg-white/95 border-zinc-200"
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                          metrics.isBest
                            ? "bg-amber-400 text-zinc-950"
                            : "bg-zinc-200 text-zinc-800"
                        }`}
                      >
                        #{metrics.rank}
                      </span>
                      <h3 className="font-extrabold text-zinc-900 text-sm sm:text-base truncate">
                        {market.name}
                      </h3>
                    </div>
                    <span className="text-[11px] text-zinc-500 block mt-0.5 truncate">
                      📍 {market.district}, {market.state} • ~{market.distanceKm} km
                    </span>
                  </div>

                  {metrics.isBest && (
                    <span className="shrink-0 bg-amber-400 text-zinc-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      🏆 BEST
                    </span>
                  )}
                </div>

                {/* Price Breakdown in Card */}
                <div className="mt-3 grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">{t('mandi_price', 'Mandi Price:')}{' '}</span>
                    <span className="font-extrabold text-zinc-900 text-sm">
                      {formatCurrency(market.pricePerQuintal)}
                    </span>
                    <span className="text-[10px] text-zinc-400 ml-0.5">/qtl</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">{t('est_freight', 'Est. Freight:')}{' '}</span>
                    <span className="font-bold text-amber-700 text-sm">
                      −{formatCurrency(market.transportCostPerQuintal)}
                    </span>
                    <span className="text-[10px] text-zinc-400 ml-0.5">/qtl</span>
                  </div>
                </div>

                {/* Net Realization Hero Highlight */}
                <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">
                      {t('net_inhand_realization', 'Net In-Hand Realization')}
                    </span>
                    <span className="text-lg sm:text-xl font-black text-emerald-950">
                      {formatCurrency(metrics.netRealization)}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold ml-1">/qtl net</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      metrics.isAboveMsp
                        ? "bg-emerald-200/90 text-emerald-950"
                        : "bg-rose-200/90 text-rose-950"
                    }`}
                  >
                    {metrics.mspDifference >= 0
                      ? `+₹${metrics.mspDifference} MSP`
                      : `−₹${Math.abs(metrics.mspDifference)} MSP`}
                  </span>
                </div>

                {/* Card Action Button */}
                <div className="mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMarket(market);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{t('view_mandi_details_facilities', 'View Mandi Details & Facilities')}{' '}</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop Table View ── */}
          <div className={`mt-5 overflow-x-auto ${viewMode === "table" ? "hidden md:block" : "hidden"}`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-[11px] font-black uppercase tracking-wider text-zinc-500 bg-zinc-100/60">
                  <th className="py-3 px-3.5 rounded-l-xl">{t('rank_mandi', 'Rank & Mandi')}{' '}</th>
                  <th
                    onClick={() => handleSort("distanceKm")}
                    className="py-3 px-3 cursor-pointer hover:text-emerald-800 select-none"
                  >
                    {t('market_distance', 'Distance')} {renderSortIndicator("distanceKm")}
                  </th>
                  <th
                    onClick={() => handleSort("pricePerQuintal")}
                    className="py-3 px-3 text-right cursor-pointer hover:text-emerald-800 select-none"
                  >
                    {t('mandi_price', 'Mandi Price')} {renderSortIndicator("pricePerQuintal")}
                  </th>
                  <th
                    onClick={() => handleSort("transportCostPerQuintal")}
                    className="py-3 px-3 text-right cursor-pointer hover:text-emerald-800 select-none"
                  >
                    {t('transport_cost', 'Transport')} {renderSortIndicator("transportCostPerQuintal")}
                  </th>
                  <th
                    onClick={() => handleSort("netRealization")}
                    className="py-3 px-4 text-right cursor-pointer hover:text-emerald-800 select-none bg-emerald-50/70"
                  >
                    {t('net_realization', 'Net Realization')} {renderSortIndicator("netRealization")}
                  </th>
                  <th className="py-3 px-3 text-center">{t('vs_govt_msp', 'vs Govt MSP')}</th>
                  <th className="py-3 px-3.5 text-right rounded-r-xl">{t('action', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 text-sm">
                {marketsWithMetrics.map(({ market, metrics }) => (
                  <tr
                    key={market.id}
                    className={`hover:bg-emerald-50/40 transition-colors group ${
                      metrics.isBest ? "bg-emerald-50/60 font-semibold" : ""
                    }`}
                  >
                    {/* Mandi Name & Rank */}
                    <td className="py-3.5 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                            metrics.isBest
                              ? "bg-amber-400 text-zinc-950 shadow-xs"
                              : metrics.rank === 2
                              ? "bg-zinc-200 text-zinc-800"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          #{metrics.rank}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-zinc-900 group-hover:text-emerald-800">
                              {market.name}
                            </span>
                            {metrics.isBest && (
                              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.2 rounded border border-amber-300">
                                🏆 BEST
                              </span>
                            )}
                            {market.isEnamEnabled && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                                e-NAM
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-zinc-500 font-normal">
                            {market.district}, {market.state}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Distance */}
                    <td className="py-3.5 px-3 text-zinc-700">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-zinc-400">🚗</span>
                        <span className="font-medium">~{market.distanceKm} km</span>
                      </div>
                    </td>

                    {/* Mandi Price */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="font-extrabold text-zinc-900 text-sm">
                        {formatCurrency(market.pricePerQuintal)}
                      </div>
                      <span className="text-[11px] text-zinc-400 font-normal">/qtl</span>
                    </td>

                    {/* Transport Cost */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="font-semibold text-amber-700 text-sm">
                        −{formatCurrency(market.transportCostPerQuintal)}
                      </div>
                      <span className="text-[11px] text-zinc-400 font-normal">/qtl transit</span>
                    </td>

                    {/* Net Realization */}
                    <td className="py-3.5 px-4 text-right bg-emerald-50/50">
                      <div className="font-black text-emerald-900 text-base">
                        {formatCurrency(metrics.netRealization)}
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700">
                        {metrics.isBest ? "Highest Profit" : `/qtl in-hand`}
                      </span>
                    </td>

                    {/* MSP Difference */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${
                          metrics.isAboveMsp
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-rose-100 text-rose-800 border border-rose-300"
                        }`}
                      >
                        {metrics.mspDifference >= 0
                          ? `+₹${metrics.mspDifference} Above`
                          : `-₹${Math.abs(metrics.mspDifference)} Below`}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3.5 text-right">
                      <button
                        onClick={() => onOpenMarket(market)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <span>Details</span>
                        <span>→</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};
