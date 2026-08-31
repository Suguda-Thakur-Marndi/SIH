"use client";

import React from 'react';
import { TrendingDown, ArrowDown, AlertTriangle } from 'lucide-react';

interface CropStress {
  crop: string;
  priceChangePercent: number;
  atRiskFarmerCount: number;
  dualStressCount: number;
}

interface Props {
  data: CropStress[] | null;
  insight: string;
  loading: boolean;
}

export function MarketStressPanel({ data, insight, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="glass bg-white/80 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-xl animate-pulse" role="status" aria-busy="true" aria-label="Loading market stress data">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-slate-900/10" />
              <div className="h-6 w-36 rounded bg-slate-900/10" />
            </div>
            <div className="h-4 w-56 rounded bg-slate-900/10" />
          </div>
          <div className="px-3.5 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <div className="h-4 w-40 rounded bg-slate-900/10" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/60 border border-white/80 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900/10" />
                <div className="space-y-1">
                  <div className="h-4 w-20 rounded bg-slate-900/10" />
                  <div className="h-3 w-28 rounded bg-slate-900/10" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-6 w-16 rounded bg-slate-900/10" />
                <div className="h-4 w-20 rounded bg-slate-900/10" />
              </div>
            </div>
          ))}
        </div>
        <span className="sr-only">Loading market stress data</span>
      </div>
    );
  }

  return (
    <div className="glass bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-xl text-[#1A1A1A]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
              <TrendingDown className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Market & Mandi Price Stress</h3>
          </div>
          <p className="text-slate-600 text-xs font-medium">Commodity wholesale price drops and income impact</p>
        </div>
        {insight && (
          <div className="px-3.5 py-1.5 bg-amber-500/15 border border-amber-500/25 rounded-full shrink-0">
            <p className="text-amber-900 text-xs font-bold">{insight}</p>
          </div>
        )}
      </div>

      {data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-100/80 border-b border-black/10 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="p-3.5 rounded-l-xl">Monitored Crop</th>
                <th className="p-3.5 text-center">APMC Price Trend</th>
                <th className="p-3.5 text-center">At-Risk Farmers</th>
                <th className="p-3.5 text-center rounded-r-xl">Dual Stress (Weather + Price)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/80 transition-colors">
                  <td className="p-3.5">
                    <span className="text-slate-900 font-extrabold text-sm">{row.crop}</span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                      row.priceChangePercent < -10
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : row.priceChangePercent < 0
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {row.priceChangePercent < 0 && <ArrowDown className="w-3 h-3" />}
                      {row.priceChangePercent}%
                    </div>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="text-slate-900 font-bold text-sm">{row.atRiskFarmerCount.toLocaleString()}</span>
                  </td>
                  <td className="p-3.5 text-center">
                    {row.dualStressCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-200">
                        <AlertTriangle className="w-3 h-3" />
                        {row.dualStressCount} farmers
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs font-semibold">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center h-36">
          <p className="text-slate-400 text-xs font-semibold">No significant market volatility detected</p>
        </div>
      )}
    </div>
  );
}
