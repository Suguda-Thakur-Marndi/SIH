"use client";

import React from "react";
import { Market, CropMarketInfo } from "../types";
import { calculateNetRealization, formatCurrency, formatNumber } from "../marketService";

import { useLanguage } from '@/lib/language-context';
interface MarketDetailsModalProps {
  market: Market | null;
  currentCrop: CropMarketInfo;
  quantityQtl: number;
  isOpen: boolean;
  onClose: () => void;
}

export const MarketDetailsModal: React.FC<MarketDetailsModalProps> = ({
  market,
  currentCrop: _currentCrop,
  quantityQtl,
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  if (!isOpen || !market) return null;

  const netRealization = calculateNetRealization(market.pricePerQuintal, market.transportCostPerQuintal);
  const totalRevenue = market.pricePerQuintal * quantityQtl;
  const totalTransport = market.transportCostPerQuintal * quantityQtl;
  const totalNet = totalRevenue - totalTransport;
  const mspDiff = market.pricePerQuintal - market.msp;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto bg-zinc-950/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-t-3xl sm:rounded-3xl bg-white text-zinc-900 shadow-2xl border border-emerald-800/20 overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Swipe Grab Bar */}
        <div className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-emerald-950 via-teal-950 to-zinc-950 text-white p-4 sm:p-6 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-colors"
          >
            ✕
          </button>

          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-emerald-300 mb-1 flex-wrap">
            <span>📍 {market.district}, {market.state}</span>
            <span>•</span>
            <span>~{market.distanceKm} km from plot</span>
            {market.isEnamEnabled && (
              <span className="bg-emerald-500/25 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-400/30">
                e-NAM Verified
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-snug pr-8">
            {market.name}
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-300 mt-0.5 truncate">
            {market.address}
          </p>

          {/* Quick Metrics Bar in Header */}
          <div className="mt-3.5 sm:mt-5 grid grid-cols-4 gap-1.5 sm:gap-2.5 pt-3 border-t border-white/15 text-center">
            <div className="bg-white/10 rounded-lg sm:rounded-xl p-1.5 sm:p-2.5">
              <span className="text-[9px] sm:text-[10px] text-zinc-300 block font-bold uppercase truncate">Gross</span>
              <span className="text-sm sm:text-lg font-black text-white">{formatCurrency(market.pricePerQuintal)}</span>
              <span className="text-[9px] sm:text-[10px] text-zinc-300 block">/qtl</span>
            </div>
            <div className="bg-white/10 rounded-lg sm:rounded-xl p-1.5 sm:p-2.5">
              <span className="text-[9px] sm:text-[10px] text-amber-300 block font-bold uppercase truncate">Freight</span>
              <span className="text-sm sm:text-lg font-black text-amber-300">−{formatCurrency(market.transportCostPerQuintal)}</span>
              <span className="text-[9px] sm:text-[10px] text-zinc-300 block">/qtl</span>
            </div>
            <div className="bg-emerald-500/30 rounded-lg sm:rounded-xl p-1.5 sm:p-2.5 border border-emerald-400/40">
              <span className="text-[9px] sm:text-[10px] text-emerald-200 block font-bold uppercase truncate">Net</span>
              <span className="text-sm sm:text-lg font-black text-emerald-200">{formatCurrency(netRealization)}</span>
              <span className="text-[9px] sm:text-[10px] text-emerald-300 font-bold block">/qtl</span>
            </div>
            <div className="bg-white/10 rounded-lg sm:rounded-xl p-1.5 sm:p-2.5">
              <span className="text-[9px] sm:text-[10px] text-zinc-300 block font-bold uppercase truncate">vs MSP</span>
              <span className={`text-sm sm:text-lg font-black ${mspDiff >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                {mspDiff >= 0 ? `+₹${mspDiff}` : `−₹${Math.abs(mspDiff)}`}
              </span>
              <span className="text-[9px] sm:text-[10px] text-zinc-300 block">₹{market.msp}</span>
            </div>
          </div>
        </div>

        {/* Modal Body with smooth touch scroll */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Total Harvest Batch Summary */}
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                Net In-Hand for {quantityQtl} Quintals:
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-950 mt-0.5">
                {formatCurrency(totalNet)}
              </div>
            </div>

            <div className="text-[11px] sm:text-xs text-emerald-900 space-y-0.5 sm:text-right">
              <div>Gross Revenue: {formatCurrency(totalRevenue)}</div>
              <div className="text-amber-800 font-semibold">Freight Cost: −{formatCurrency(totalTransport)}</div>
            </div>
          </div>

          {/* Operational Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h3 className="font-extrabold text-zinc-900 uppercase tracking-wider text-[10px] sm:text-[11px]">
                {t('trading_operational_hours', 'Trading & Operational Hours')}
              </h3>
              <div className="flex justify-between">
                <span className="text-zinc-500">{t('auction_timings', 'Auction Timings:')}{' '}</span>
                <span className="font-bold text-zinc-800">{market.tradingHours}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">{t('daily_arrival', 'Daily Arrival:')}{' '}</span>
                <span className="font-bold text-zinc-800">{formatNumber(market.dailyArrivalQtl)} Qtl/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">{t('accepted_grades', 'Accepted Grades:')}{' '}</span>
                <span className="font-bold text-zinc-800 truncate max-w-[150px]">{market.gradeAccepted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">{t('payment_clearance', 'Payment Clearance:')}{' '}</span>
                <span className="font-bold text-emerald-700">{market.paymentTerms}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h3 className="font-extrabold text-zinc-900 uppercase tracking-wider text-[10px] sm:text-[11px]">
                {t('mandi_contacts_rating', 'Mandi Contacts & Rating')}
              </h3>
              <div className="flex justify-between">
                <span className="text-zinc-500">{t('officer_incharge', 'Officer / Incharge:')}{' '}</span>
                <span className="font-bold text-zinc-800 truncate max-w-[150px]">{market.contactPerson}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Phone:</span>
                <a
                  href={`tel:${market.contactPhone}`}
                  className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs"
                >
                  {market.contactPhone}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">{t('farmer_rating', 'Farmer Rating:')}{' '}</span>
                <span className="font-bold text-zinc-800">
                  ⭐ {market.rating} / 5.0 ({market.reviewCount})
                </span>
              </div>
            </div>
          </div>

          {/* Mandi Amenities & Facilities */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-700 mb-2">
              {t('mandi_facilities', 'Mandi Facilities:')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {market.facilities.map((fac, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                    fac.available
                      ? "bg-white border-zinc-200 text-zinc-800"
                      : "bg-zinc-50 border-zinc-200/60 text-zinc-400 opacity-60"
                  }`}
                >
                  <span className="text-base shrink-0">{fac.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span className="truncate">{fac.name}</span>
                      {fac.available && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded shrink-0">
                          {t('active', 'Active')}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">{fac.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Action Bar on Mobile */}
        <div className="p-3 sm:p-4 bg-zinc-100 border-t border-zinc-200 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={onClose}
            className="hidden sm:inline-block px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-800 text-xs font-bold border border-zinc-300 transition-colors"
          >
            {t("back", "← Back")}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`tel:${market.contactPhone}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors"
            >
              <span>{t("call_mandi", "📞 Call Mandi")}</span>
            </a>
            <button
              onClick={() => alert(t("directions_to_mandi", `Directions to ${market.name} (~${market.distanceKm} km from Plot): Route via NH-16 active. Est travel time ~${Math.round(market.distanceKm / 40)} hours.`))}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <span>{t("navigation_button", "🗺️ Navigation")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
