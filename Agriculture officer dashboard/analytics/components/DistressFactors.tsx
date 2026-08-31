"use client";

import React from 'react';
import { CloudRain, TrendingDown, CreditCard } from 'lucide-react';

interface FactorData {
  name: string;
  value: number;
  percent: number;
}

interface Props {
  data: FactorData[] | null;
  loading: boolean;
}

export function DistressFactors({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="w-full h-72 glass bg-white/70 border border-white/80 rounded-3xl animate-pulse"></div>
    );
  }

  const getIcon = (name: string) => {
    if (name.includes('Weather')) return <CloudRain className="w-5 h-5 text-blue-600" />;
    if (name.includes('Market')) return <TrendingDown className="w-5 h-5 text-amber-600" />;
    if (name.includes('Loan')) return <CreditCard className="w-5 h-5 text-purple-600" />;
    return null;
  };

  const getColor = (name: string) => {
    if (name.includes('Weather')) return 'bg-blue-500';
    if (name.includes('Market')) return 'bg-amber-500';
    if (name.includes('Loan')) return 'bg-purple-500';
    return 'bg-slate-500';
  };

  return (
    <div className="glass bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-xl h-full text-[#1A1A1A]">
      <h3 className="text-xl font-black text-slate-900 tracking-tight mb-0.5">Distress Drivers</h3>
      <p className="text-slate-600 text-xs font-medium mb-6">Primary factors causing high-risk status</p>
      
      <div className="space-y-6">
        {data.map((factor, idx) => {
          const barColor = getColor(factor.name);
          return (
            <div key={idx}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  {getIcon(factor.name)}
                  <span className="font-bold text-sm">{factor.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-900 font-black block text-sm">{factor.percent}%</span>
                  <span className="text-slate-500 text-xs font-medium">{factor.value.toLocaleString()} farmers</span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-slate-200/80 rounded-full overflow-hidden p-0.5">
                <div 
                  className={"h-full rounded-full transition-all duration-1000 " + barColor}
                  style={{ width: factor.percent + "%" }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {data.length === 0 && (
        <div className="flex items-center justify-center h-40">
          <p className="text-slate-400 text-xs font-semibold">No distress data available</p>
        </div>
      )}
    </div>
  );
}
