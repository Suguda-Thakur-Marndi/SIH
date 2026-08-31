"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Users, AlertTriangle, Shield, ChevronRight } from 'lucide-react';

interface Props {
  data: { high: number; moderate: number; low: number } | null;
  loading: boolean;
}

export function RiskDistribution({ data, loading }: Props) {
  const router = useRouter();

  if (loading || !data) {
    return (
      <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md animate-pulse" role="status" aria-busy="true" aria-label="Loading risk distribution">
        <div className="space-y-1 mb-4">
          <div className="h-6 w-36 rounded bg-white/10" />
          <div className="h-4 w-48 rounded bg-white/10" />
        </div>
        <div className="space-y-4">
          {['bg-red-500/20', 'bg-amber-500/20', 'bg-emerald-500/20'].map((color, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-white/10" />
                <div className="h-4 w-12 rounded bg-white/10" />
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${65 - i * 20}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="h-10 w-full rounded-xl bg-white/5 mt-4" />
        <span className="sr-only">Loading risk distribution</span>
      </div>
    );
  }

  const total = data.high + data.moderate + data.low;

  const bands = [
    {
      label: 'High Risk',
      sublabel: 'Score > 70',
      count: data.high,
      percent: total > 0 ? Math.round((data.high / total) * 100) : 0,
      color: 'bg-red-500',
      textColor: 'text-red-400',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/10',
      hoverBg: 'hover:bg-red-500/20',
      icon: AlertTriangle,
      riskLevel: 'high',
    },
    {
      label: 'Moderate Risk',
      sublabel: 'Score 31–70',
      count: data.moderate,
      percent: total > 0 ? Math.round((data.moderate / total) * 100) : 0,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgColor: 'bg-amber-500/10',
      hoverBg: 'hover:bg-amber-500/20',
      icon: Shield,
      riskLevel: 'moderate',
    },
    {
      label: 'Low Risk',
      sublabel: 'Score ≤ 30',
      count: data.low,
      percent: total > 0 ? Math.round((data.low / total) * 100) : 0,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-500/10',
      hoverBg: 'hover:bg-emerald-500/20',
      icon: Users,
      riskLevel: 'low',
    },
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Risk Distribution</h3>
          <p className="text-white/60 text-sm">Click a band to view farmers in that risk tier</p>
        </div>
        <div className="text-white/40 text-sm font-medium">
          {total.toLocaleString()} total farmers
        </div>
      </div>

      {/* Stacked Bar */}
      {total > 0 && (
        <div className="flex h-3 rounded-full overflow-hidden mb-6 gap-0.5">
          {bands.map((b) => (
            <div
              key={b.riskLevel}
              className={`${b.color} transition-all duration-700`}
              style={{ width: `${b.percent}%` }}
            />
          ))}
        </div>
      )}

      {/* Band Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {bands.map((band) => {
          const Icon = band.icon;
          return (
            <button
              key={band.riskLevel}
              onClick={() => router.push(`/officer-dashboard/farmers?riskLevel=${band.riskLevel}`)}
              className={`flex items-center justify-between p-4 rounded-xl border ${band.borderColor} ${band.bgColor} ${band.hoverBg} transition-all duration-200 cursor-pointer group text-left w-full`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${band.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${band.textColor}`} />
                </div>
                <div>
                  <p className={`font-bold text-lg ${band.textColor}`}>{band.count.toLocaleString()}</p>
                  <p className="text-white/50 text-xs">{band.label} · {band.sublabel}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
            </button>
          );
        })}
      </div>

      {total === 0 && (
        <div className="flex items-center justify-center h-24">
          <p className="text-white/40">No risk data available for this period</p>
        </div>
      )}
    </div>
  );
}
