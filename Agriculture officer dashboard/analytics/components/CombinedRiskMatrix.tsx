"use client";

import React from 'react';
import { Layers, CloudRain, TrendingDown, CreditCard, AlertTriangle } from 'lucide-react';

interface CombinedData {
  weatherOnly: number;
  marketOnly: number;
  loanOnly: number;
  weatherAndMarket: number;
  weatherAndLoan: number;
  marketAndLoan: number;
  allThree: number;
}

interface Props {
  data: CombinedData | null;
  loading: boolean;
}

export function CombinedRiskMatrix({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="glass bg-white/80 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-xl animate-pulse" role="status" aria-busy="true" aria-label="Loading combined risk matrix">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-slate-900/10" />
          <div className="h-6 w-48 rounded bg-slate-900/10" />
        </div>
        <div className="h-4 w-72 rounded bg-slate-900/10 mb-5" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="bg-white/60 border border-white/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-900/10" />
                <div className="h-4 w-20 rounded bg-slate-900/10" />
              </div>
              <div className="h-8 w-12 rounded bg-slate-900/10" />
            </div>
          ))}
        </div>
        <span className="sr-only">Loading combined risk matrix</span>
      </div>
    );
  }

  const total = data.weatherOnly + data.marketOnly + data.loanOnly
    + data.weatherAndMarket + data.weatherAndLoan + data.marketAndLoan + data.allThree;

  const rows = [
    {
      label: 'Weather Only',
      icons: [CloudRain],
      count: data.weatherOnly,
      isAllThree: false,
    },
    {
      label: 'Market Only',
      icons: [TrendingDown],
      count: data.marketOnly,
      isAllThree: false,
    },
    {
      label: 'Loan Only',
      icons: [CreditCard],
      count: data.loanOnly,
      isAllThree: false,
    },
    {
      label: 'Weather + Market',
      icons: [CloudRain, TrendingDown],
      count: data.weatherAndMarket,
      isAllThree: false,
    },
    {
      label: 'Weather + Loan',
      icons: [CloudRain, CreditCard],
      count: data.weatherAndLoan,
      isAllThree: false,
    },
    {
      label: 'Market + Loan',
      icons: [TrendingDown, CreditCard],
      count: data.marketAndLoan,
      isAllThree: false,
    },
    {
      label: 'All Three Distress Signals',
      icons: [CloudRain, TrendingDown, CreditCard],
      count: data.allThree,
      isAllThree: true,
    },
  ];

  return (
    <div className="glass bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-xl text-[#1A1A1A]">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-purple-100 text-purple-800 border border-purple-200">
          <Layers className="w-4 h-4" />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Multi-Hazard Combined Risk Matrix</h3>
      </div>
      <p className="text-slate-600 text-xs font-medium mb-5">Single, double, and triple-signal compound vulnerability breakdown</p>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-100/80 border-b border-black/10 text-slate-600 text-xs font-bold uppercase tracking-wider">
              <th className="p-3.5 rounded-l-xl">Signal Combination</th>
              <th className="p-3.5 text-center">Farmers</th>
              <th className="p-3.5 text-center">Share</th>
              <th className="p-3.5 rounded-r-xl">Distribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {rows.map((row, idx) => {
              const percent = total > 0 ? Math.round((row.count / total) * 100) : 0;
              const rowClass = row.isAllThree
                ? 'bg-red-50/90 border border-red-500/30'
                : 'hover:bg-white/80';

              return (
                <tr key={idx} className={`${rowClass} transition-colors`}>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1">
                        {row.icons.map((Icon, i) => (
                          <Icon key={i} className={`w-4 h-4 ${row.isAllThree ? 'text-red-700' : 'text-slate-500'}`} />
                        ))}
                      </div>
                      <span className={`text-sm ${row.isAllThree ? 'text-red-900 font-black' : 'text-slate-800 font-bold'}`}>
                        {row.label}
                      </span>
                      {row.isAllThree && (
                        <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white shadow-2xs">
                          Priority 1
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`text-lg font-black ${row.isAllThree ? 'text-red-700' : 'text-slate-900'}`}>
                      {row.count}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="text-slate-600 text-xs font-bold">{percent}%</span>
                  </td>
                  <td className="p-3.5">
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden max-w-[180px] p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${row.isAllThree ? 'bg-red-600' : 'bg-emerald-600'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {total === 0 && (
        <div className="flex items-center justify-center h-24 mt-4">
          <p className="text-slate-400 text-xs font-semibold">No combined risk data available</p>
        </div>
      )}

      {data.allThree > 0 && (
        <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-500/30 flex items-center gap-3 text-red-950 text-xs font-bold">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>
            <strong>{data.allThree} farmer{data.allThree > 1 ? 's' : ''}</strong> are experiencing all three risk signals simultaneously (Rainfall Deficit + APMC Crash + Loan Repayment Due) — assigned highest triage dispatch level.
          </span>
        </div>
      )}
    </div>
  );
}
