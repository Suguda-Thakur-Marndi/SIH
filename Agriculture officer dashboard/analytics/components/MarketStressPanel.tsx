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
      <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md animate-pulse" role="status" aria-busy="true" aria-label="Loading market stress data">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-white/10" />
              <div className="h-6 w-36 rounded bg-white/10" />
            </div>
            <div className="h-4 w-56 rounded bg-white/10" />
          </div>
          <div className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <div className="h-4 w-40 rounded bg-white/10" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10" />
                <div className="space-y-1">
                  <div className="h-4 w-20 rounded bg-white/10" />
                  <div className="h-3 w-28 rounded bg-white/10" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-6 w-16 rounded bg-white/10" />
                <div className="h-4 w-20 rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
        <span className="sr-only">Loading market stress data</span>
      </div>
    );
  }

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-5 h-5 text-orange-400" />
            <h3 className="text-xl font-bold text-white">Market Stress Analytics</h3>
          </div>
          <p className="text-white/60 text-sm">Crop price changes and their impact on farmer risk</p>
        </div>
        {insight && (
          <div className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full shrink-0">
            <p className="text-orange-400 text-sm font-medium">{insight}</p>
          </div>
        )}
      </div>

      {data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white/60 text-sm">
                <th className="p-3 font-medium">Crop</th>
                <th className="p-3 font-medium text-center">Price Change</th>
                <th className="p-3 font-medium text-center">At-Risk Farmers</th>
                <th className="p-3 font-medium text-center">Dual Stress</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <span className="text-white font-medium">{row.crop}</span>
                  </td>
                  <td className="p-3 text-center">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-bold ${
                      row.priceChangePercent < -10
                        ? 'bg-red-500/15 text-red-400'
                        : row.priceChangePercent < 0
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                    }`}>
                      {row.priceChangePercent < 0 && <ArrowDown className="w-3 h-3" />}
                      {row.priceChangePercent}%
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-white font-bold">{row.atRiskFarmerCount}</span>
                  </td>
                  <td className="p-3 text-center">
                    {row.dualStressCount > 0 ? (
                      <div className="inline-flex items-center gap-1 text-red-400 text-sm">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="font-bold">{row.dualStressCount}</span>
                      </div>
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32">
          <p className="text-white/40">No market stress data available for this period</p>
        </div>
      )}
    </div>
  );
}
