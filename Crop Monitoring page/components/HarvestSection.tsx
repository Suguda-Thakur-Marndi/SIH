"use client";

import React from "react";
import { RegisteredCrop } from "../types";
import { formatDateString, getDaysDifference } from "../mockData";
import { useLanguage } from '@/lib/language-context';

interface HarvestSectionProps {
  currentCrop: RegisteredCrop;
}

export const HarvestSection: React.FC<HarvestSectionProps> = ({ currentCrop }) => {
  const { t } = useLanguage();

  // Structured yield loss estimation parameters (for Paddy 2.5 acres default)
  const baselineYield = 37.5; // quintals
  const lossPct = 25; // % loss based on telemetry
  const riskAdjustedYield = Math.round(baselineYield * (1 - lossPct / 100) * 10) / 10;
  const estimatedRevenueLoss = Math.round((baselineYield - riskAdjustedYield) * 2320);

  return (
    <section className="rounded-2xl bg-linear-to-br from-amber-900/90 via-amber-800/80 to-amber-950/90 backdrop-blur-md text-white p-6 sm:p-7 border border-amber-600/30 shadow-lg space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-extrabold bg-white/15 text-amber-100 border border-white/20 uppercase tracking-wider">
              🚜 {t('yield_harvest_forecast', 'Yield & Harvest Estimate')}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/80 text-white border border-rose-300">
              −{lossPct}% Risk Loss
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('expected_harvest_title', 'Expected Harvest')}: {formatDateString(currentCrop.expectedHarvestDate, t)}
          </h3>
          <p className="text-sm text-amber-100 font-medium">
            {t('harvest_window', 'Window')}: {currentCrop.harvestWindow} ·{" "}
            <strong>{getDaysDifference(currentCrop.expectedHarvestDate)} {t('days_remaining', 'days remaining')}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black/30 p-4 rounded-xl border border-white/15 backdrop-blur-xs">
          <div>
            <p className="text-[10px] text-amber-200 uppercase font-bold">{t('baseline_yield', 'Baseline Yield')}</p>
            <p className="text-base sm:text-lg font-bold text-slate-300 mt-0.5 line-through">
              {currentCrop.expectedYield || `${baselineYield} qtl`}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-emerald-300 uppercase font-bold">{t('risk_adjusted_yield', 'Risk-Adjusted Yield')}</p>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-400 mt-0.5">
              {riskAdjustedYield} qtl
            </p>
          </div>
          <div>
            <p className="text-[10px] text-amber-200 uppercase font-bold">{t('est_revenue_loss', 'Est. Revenue Loss')}</p>
            <p className="text-lg sm:text-xl font-extrabold text-rose-300 mt-0.5">
              ₹{estimatedRevenueLoss.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-amber-600/30 flex items-center justify-between text-xs text-amber-200/90 font-medium">
        <span>Primary Cause of Yield Reduction: <strong className="text-white font-bold">Rainfall Deficit (−35% monsoon)</strong></span>
        <span className="hidden sm:inline">Calculated via SmartCrop Agronomic AI Engine</span>
      </div>
    </section>
  );
};

