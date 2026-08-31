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
      <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md animate-pulse" role="status" aria-busy="true" aria-label="Loading combined risk matrix">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-white/10" />
          <div className="h-6 w-48 rounded bg-white/10" />
        </div>
        <div className="h-4 w-72 rounded bg-white/10 mb-5" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white/10" />
                <div className="h-4 w-20 rounded bg-white/10" />
              </div>
              <div className="h-8 w-12 rounded bg-white/10" />
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
      label: 'All Three Signals',
      icons: [CloudRain, TrendingDown, CreditCard],
      count: data.allThree,
      isAllThree: true,
    },
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-1">
        <Layers className="w-5 h-5 text-purple-400" />
        <h3 className="text-xl font-bold text-white">Combined Risk Analysis</h3>
      </div>
      <p className="text-white/60 text-sm mb-5">Signal combination breakdown among high-risk farmers</p>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-white/60 text-sm">
              <th className="p-3 font-medium">Signal Combination</th>
              <th className="p-3 font-medium text-center">Farmers</th>
              <th className="p-3 font-medium text-center">Share</th>
              <th className="p-3 font-medium">Distribution</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const percent = total > 0 ? Math.round((row.count / total) * 100) : 0;
              const rowClass = row.isAllThree
                ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                : 'border-b border-white/5 hover:bg-white/5';

              return (
                <tr key={idx} className={`${rowClass} transition-colors`}>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {row.icons.map((Icon, i) => (
                          <Icon key={i} className={`w-4 h-4 ${row.isAllThree ? 'text-red-400' : 'text-white/50'}`} />
                        ))}
                      </div>
                      <span className={`font-medium text-sm ${row.isAllThree ? 'text-red-300 font-bold' : 'text-white'}`}>
                        {row.label}
                      </span>
                      {row.isAllThree && (
                        <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                          Priority
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-lg font-bold ${row.isAllThree ? 'text-red-400' : 'text-white'}`}>
                      {row.count}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-white/60 text-sm">{percent}%</span>
                  </td>
                  <td className="p-3">
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden max-w-[180px]">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${row.isAllThree ? 'bg-red-500' : 'bg-blue-500/60'}`}
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
          <p className="text-white/40">No combined risk data available</p>
        </div>
      )}

      {data.allThree > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-red-950/30 border border-red-500/30 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">
            <strong>{data.allThree} farmer{data.allThree > 1 ? 's' : ''}</strong> facing all three risk signals simultaneously — highest priority for intervention.
          </p>
        </div>
      )}
    </div>
  );
}
