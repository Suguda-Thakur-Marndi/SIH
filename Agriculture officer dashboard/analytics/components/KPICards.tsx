"use client";

import React from 'react';
import { Users, AlertTriangle, Activity, CheckCircle, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface OverviewData {
  highRiskFarmers: { count: number; delta: number; deltaPercent: number };
  moderateRiskFarmers: { count: number };
  activeDistressAlerts: { count: number };
  pendingInterventions: { count: number };
}

export function KPICards({ data, loading }: { data: OverviewData | null, loading: boolean }) {
  if (loading || !data) {
    const skeletonColors = [
      { bg: 'bg-red-500/20', border: 'border-red-500/30', accent: 'bg-red-950/40' },
      { bg: 'bg-amber-500/10', border: 'border-amber-500/20', accent: 'bg-black/40' },
      { bg: 'bg-blue-500/10', border: 'border-blue-500/20', accent: 'bg-black/40' },
      { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', accent: 'bg-black/40' },
    ];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" role="status" aria-busy="true" aria-label="Loading KPI cards">
        {skeletonColors.map((s, i) => (
          <div key={i} className={`relative overflow-hidden rounded-2xl p-5 border backdrop-blur-md ${i === 0 ? s.accent : 'bg-black/40'} ${s.border} animate-pulse`}>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-white/10" />
                <div className="h-9 w-20 rounded bg-white/10" />
                {i === 0 && <div className="h-4 w-32 rounded bg-white/10 mt-2" />}
              </div>
              <div className={`w-12 h-12 rounded-full ${s.bg}`} />
            </div>
          </div>
        ))}
        <span className="sr-only">Loading KPI cards</span>
      </div>
    );
  }

  const kpis = [
    {
      title: "High-Risk Farmers",
      value: data.highRiskFarmers.count,
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-500/20",
      border: "border-red-500/30",
      trend: data.highRiskFarmers.delta,
      trendPercent: data.highRiskFarmers.deltaPercent,
      isFocus: true,
    },
    {
      title: "Moderate Risk",
      value: data.moderateRiskFarmers.count,
      icon: Activity,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      trend: 0,
      trendPercent: 0,
      isFocus: false,
    },
    {
      title: "Active Alerts",
      value: data.activeDistressAlerts.count,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      trend: 0,
      trendPercent: 0,
      isFocus: false,
    },
    {
      title: "Pending Interventions",
      value: data.pendingInterventions.count,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      trend: 0,
      trendPercent: 0,
      isFocus: false,
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi, idx) => {
        const containerClass = [
          "relative overflow-hidden rounded-2xl p-5 border backdrop-blur-md transition-all duration-300 hover:-translate-y-1",
          kpi.isFocus
            ? "bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            : "bg-black/40 border-white/10 hover:bg-black/60"
        ].join(" ");

        const trendClass = [
          "flex items-center gap-1 mt-2 text-sm",
          kpi.trend > 0 ? "text-red-400" : kpi.trend < 0 ? "text-emerald-400" : "text-white/40"
        ].join(" ");

        const iconBgClass = "w-12 h-12 rounded-full flex items-center justify-center " + kpi.bg;
        const iconColorClass = "w-6 h-6 " + kpi.color;
        const IconComponent = kpi.icon;

        return (
          <div key={idx} className={containerClass}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/60 text-sm font-medium mb-1">{kpi.title}</p>
                <h3 className="text-3xl font-bold text-white">{kpi.value.toLocaleString()}</h3>
                
                {kpi.isFocus && (
                  <div className={trendClass}>
                    {kpi.trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : kpi.trend < 0 ? <ArrowDownRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    <span>
                      {Math.abs(kpi.trend)} ({Math.abs(kpi.trendPercent)}%)
                    </span>
                    <span className="text-white/40 ml-1">vs last period</span>
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
