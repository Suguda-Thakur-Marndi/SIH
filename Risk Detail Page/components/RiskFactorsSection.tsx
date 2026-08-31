import React from 'react';
import { TrendingUp, CloudRain, Droplets, DollarSign, Bug } from 'lucide-react';

interface Factor {
  name: string;
  score: number;
  max: number;
  level: string;
  detail: string;
}

interface RiskFactorsSectionProps {
  factors: Factor[];
}

export default function RiskFactorsSection({ factors }: RiskFactorsSectionProps) {
  const getIcon = (name: string) => {
    if (name.includes('Weather')) return <CloudRain className="w-4 h-4 text-emerald-700" />;
    if (name.includes('Soil')) return <Droplets className="w-4 h-4 text-emerald-700" />;
    if (name.includes('Market')) return <TrendingUp className="w-4 h-4 text-emerald-700" />;
    if (name.includes('Credit')) return <DollarSign className="w-4 h-4 text-emerald-700" />;
    return <Bug className="w-4 h-4 text-emerald-700" />;
  };

  return (
    <div className="bg-white/45 backdrop-blur-2xl rounded-[32px] border border-white/80 p-6 md:p-7 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.12)] space-y-6">
      <div className="flex items-center justify-between border-b border-emerald-950/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-700/10 text-emerald-900 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Contributing Risk Factors
            </h2>
            <p className="text-xs text-slate-600 font-medium">Real-time weighted parameters</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/90 text-emerald-900 shadow-sm">
          Synced with AWS RDS
        </span>
      </div>

      <div className="space-y-4">
        {factors.map((factor, idx) => {
          const isHigh = factor.score >= 60;
          const isMed = factor.score >= 40 && factor.score < 60;
          const barColor = isHigh 
            ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
            : isMed 
            ? 'bg-gradient-to-r from-emerald-500 to-amber-500' 
            : 'bg-gradient-to-r from-teal-400 to-emerald-500';
          
          const badgeColor = isHigh 
            ? 'bg-rose-500/15 text-rose-900 border-rose-300' 
            : isMed 
            ? 'bg-amber-500/15 text-amber-900 border-amber-300' 
            : 'bg-emerald-500/15 text-emerald-900 border-emerald-300';

          return (
            <div 
              key={idx} 
              className="p-4.5 rounded-2xl bg-white/60 hover:bg-white/85 backdrop-blur-xl border border-white/90 shadow-sm transition-all transform hover:-translate-y-0.5 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-600/10 border border-emerald-500/20">
                    {getIcon(factor.name)}
                  </div>
                  <span className="text-sm font-bold text-slate-900">{factor.name}</span>
                </div>
                <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold border ${badgeColor}`}>
                  {factor.score}% Risk
                </span>
              </div>
              
              {/* Progress Bar with glowing gradient */}
              <div className="w-full h-2.5 bg-slate-200/60 rounded-full overflow-hidden p-0.5 border border-white/60">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 shadow-sm ${barColor}`} 
                  style={{ width: `${factor.score}%` }}
                />
              </div>

              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {factor.detail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
