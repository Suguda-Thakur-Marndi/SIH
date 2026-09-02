"use client";

import React from 'react';
import { Users, AlertTriangle, Activity, CheckCircle, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface OverviewData {
  highRiskFarmers: { count: number; delta: number; deltaPercent: number };
  moderateRiskFarmers: { count: number };
  activeDistressAlerts: { count: number };
  pendingInterventions: { count: number };
}

export function KPICards({ data, loading }: { data: OverviewData | null, loading: boolean }) {
  const { t } = useLanguage();

  if (loading || !data) {
    const skeletonColors = [
      { bg: 'bg-red-500/20', border: 'border-red-500/30' },
      { bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
      { bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
      { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
    ];
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8" role="status" aria-busy="true" aria-label="Loading KPI cards">
        {skeletonColors.map((s, i) => (
          <div key={i} className={`relative overflow-hidden rounded-3xl p-6 border border-white/80 glass bg-white/70 backdrop-blur-2xl shadow-lg animate-pulse`}>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-slate-900/10" />
                <div className="h-9 w-20 rounded bg-slate-900/10" />
                {i === 0 && <div className="h-4 w-32 rounded bg-slate-900/10 mt-2" />}
              </div>
              <div className={`w-13 h-13 rounded-2xl ${s.bg}`} />
            </div>
          </div>
        ))}
        <span className="sr-only">Loading KPI cards</span>
      </div>
    );
  }

  const kpis = [
    {
      title: t('high_risk_farmers', 'High-Risk Farmers'),
      value: data.highRiskFarmers.count,
      icon: AlertTriangle,
      color: "text-red-700",
      bg: "bg-red-500/15",
      border: "border-red-500/40",
      glow: "shadow-[0_15px_35px_-5px_rgba(239,68,68,0.25)]",
      trend: data.highRiskFarmers.delta,
      trendPercent: data.highRiskFarmers.deltaPercent,
      isFocus: true,
    },
    {
      title: t('medium_risk_farmers', 'Moderate Risk'),
      value: data.moderateRiskFarmers.count,
      icon: Activity,
      color: "text-amber-800",
      bg: "bg-amber-500/15",
      border: "border-amber-500/30",
      glow: "shadow-[0_15px_35px_-5px_rgba(245,158,11,0.15)]",
      trend: 0,
      trendPercent: 0,
      isFocus: false,
    },
    {
      title: t('live_distress_alerts', 'Active Distress Alerts'),
      value: data.activeDistressAlerts.count,
      icon: Users,
      color: "text-blue-800",
      bg: "bg-blue-500/15",
      border: "border-blue-500/30",
      glow: "shadow-[0_15px_35px_-5px_rgba(59,130,246,0.15)]",
      trend: 0,
      trendPercent: 0,
      isFocus: false,
    },
    {
      title: t('priority_interventions', 'Pending Interventions'),
      value: data.pendingInterventions.count,
      icon: CheckCircle,
      color: "text-emerald-800",
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/30",
      glow: "shadow-[0_15px_35px_-5px_rgba(16,185,129,0.15)]",
      trend: 0,
      trendPercent: 0,
      isFocus: false,
    }
  ];


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {kpis.map((kpi, idx) => {
        const containerClass = [
          "relative overflow-hidden rounded-3xl p-6 border glass backdrop-blur-2xl transition-all duration-300 transform hover:-translate-y-1.5",
          kpi.isFocus
            ? `bg-white/90 ${kpi.border} ${kpi.glow}`
            : `bg-white/80 hover:bg-white/95 border-white/80 shadow-lg hover:shadow-xl`
        ].join(" ");

        const trendClass = [
          "flex items-center gap-1 mt-2 text-xs font-bold",
          kpi.trend > 0 ? "text-red-700" : kpi.trend < 0 ? "text-emerald-700" : "text-slate-500"
        ].join(" ");

        const iconBgClass = "w-13 h-13 rounded-2xl flex items-center justify-center border border-white/80 shadow-sm " + kpi.bg;
        const iconColorClass = "w-6 h-6 " + kpi.color;
        const IconComponent = kpi.icon;

        return (
          <div key={idx} className={containerClass}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-1">{kpi.title}</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">{kpi.value.toLocaleString()}</h3>
                
                {kpi.isFocus && (
                  <div className={trendClass}>
                    {kpi.trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : kpi.trend < 0 ? <ArrowDownRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    <span>
                      {Math.abs(kpi.trend)} ({Math.abs(kpi.trendPercent)}%)
                    </span>
                    <span className="text-slate-500 font-medium ml-0.5">vs last period</span>
                  </div>
                )}
              </div>
              
              <div className={iconBgClass}>
                <IconComponent className={iconColorClass} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
