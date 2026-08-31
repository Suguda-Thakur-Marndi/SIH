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
      <div className="w-full h-72 bg-white/5 border border-white/10 rounded-2xl animate-pulse"></div>
    );
  }

  const getIcon = (name: string) => {
    if (name.includes('Weather')) return <CloudRain className="w-5 h-5 text-blue-400" />;
    if (name.includes('Market')) return <TrendingDown className="w-5 h-5 text-orange-400" />;
    if (name.includes('Loan')) return <CreditCard className="w-5 h-5 text-purple-400" />;
    return null;
  };

  const getColor = (name: string) => {
    if (name.includes('Weather')) return 'bg-blue-500';
    if (name.includes('Market')) return 'bg-orange-500';
    if (name.includes('Loan')) return 'bg-purple-500';
    return 'bg-gray-500';
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md h-full">
      <h3 className="text-xl font-bold text-white mb-1">Distress Drivers</h3>
      <p className="text-white/60 text-sm mb-6">Primary factors causing high-risk status</p>
      
      <div className="space-y-6">
        {data.map((factor, idx) => {
          const barColor = getColor(factor.name);
          return (
            <div key={idx}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-white">
                  {getIcon(factor.name)}
                  <span className="font-medium">{factor.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold block">{factor.percent}%</span>
                  <span className="text-white/40 text-xs">{factor.value.toLocaleString()} farmers</span>
                </div>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
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
          <p className="text-white/40">No distress data available</p>
        </div>
      )}
    </div>
  );
}
