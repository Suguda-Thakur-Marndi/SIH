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
      <div className="glass bg-white/80 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-xl animate-pulse" role="status" aria-busy="true" aria-label="Loading risk distribution">
        <div className="space-y-1.5 mb-4">
          <div className="h-6 w-36 rounded bg-slate-900/10" />
          <div className="h-4 w-48 rounded bg-slate-900/10" />
        </div>
        <div className="space-y-4">
          {['bg-red-500/20', 'bg-amber-500/20', 'bg-emerald-500/20'].map((color, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-slate-900/10" />
                <div className="h-4 w-12 rounded bg-slate-900/10" />
              </div>
              <div className="h-3 w-full bg-slate-900/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${65 - i * 20}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="h-10 w-full rounded-2xl bg-slate-900/5 mt-4" />
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
      color: 'bg-red-600',
      textColor: 'text-red-700',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-50/80',
      hoverBg: 'hover:bg-red-100/90',
      icon: AlertTriangle,
      riskLevel: 'high',
    },
    {
      label: 'Moderate Risk',
      sublabel: 'Score 31–70',
      count: data.moderate,
      percent: total > 0 ? Math.round((data.moderate / total) * 100) : 0,
      color: 'bg-amber-500',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-500/30',
      bgColor: 'bg-amber-50/80',
      hoverBg: 'hover:bg-amber-100/90',
      icon: Shield,
      riskLevel: 'moderate',
    },
    {
      label: 'Low Risk',
      sublabel: 'Score ≤ 30',
      count: data.low,
      percent: total > 0 ? Math.round((data.low / total) * 100) : 0,
      color: 'bg-emerald-600',
      textColor: 'text-emerald-800',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-50/80',
      hoverBg: 'hover:bg-emerald-100/90',
      icon: Users,
      riskLevel: 'low',
    },
  ];

  return (
    <div className="glass bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-xl text-[#1A1A1A]">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-0.5">Risk Distribution</h3>
          <p className="text-slate-600 text-xs font-medium">Click a risk tier to filter farmers</p>
        </div>
        <div className="text-slate-500 text-xs font-bold bg-white/90 px-3 py-1 rounded-full border border-black/5">
          {total.toLocaleString()} monitored farmers
        </div>
      </div>

      {/* Stacked Progress Bar */}
      {total > 0 && (
        <div className="flex h-3 rounded-full overflow-hidden mb-6 gap-1 p-0.5 bg-slate-900/5">
          {bands.map((b) => (
            <div
              key={b.riskLevel}
              className={`${b.color} rounded-full transition-all duration-700`}
              style={{ width: `${b.percent}%` }}
              title={`${b.label}: ${b.percent}%`}
            />
          ))}
        </div>
      )}

      {/* Risk Band Cards */}
      <div className="space-y-3">
        {bands.map((band) => {
          const Icon = band.icon;
          return (
            <button
              key={band.riskLevel}
              onClick={() => router.push(`/officer-dashboard/farmers?risk=${band.riskLevel.toUpperCase()}`)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border ${band.borderColor} ${band.bgColor} ${band.hoverBg} transition-all duration-200 cursor-pointer group text-left w-full shadow-2xs hover:-translate-y-0.5`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center shadow-xs">
                  <Icon className={`w-5 h-5 ${band.textColor}`} />
                </div>
                <div>
                  <p className={`font-black text-lg ${band.textColor}`}>{band.count.toLocaleString()} <span className="text-xs font-semibold text-slate-500">({band.percent}%)</span></p>
                  <p className="text-slate-600 text-[11px] font-bold">{band.label} &bull; {band.sublabel}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
            </button>
          );
        })}
      </div>

      {total === 0 && (
        <div className="flex items-center justify-center h-24">
          <p className="text-slate-400 text-xs font-semibold">No risk data available for this period</p>
        </div>
      )}
    </div>
  );
}
