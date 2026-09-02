import React from 'react';
import { TrendingUp, CloudRain, Droplets, DollarSign, Bug, AlertTriangle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface Factor {
  key?: string;
  name: string;
  nameKey?: string;
  score: number;
  max: number;
  level: string;
  detail: string;
  detailKey?: string;
}

export interface Trend7d {
  direction: string;
  delta: number;
  trendingUp: boolean;
  primaryDriver: string;
}

export interface YieldImpact {
  projectedLossPct: number;
  expectedYieldQuintals: number;
  riskAdjustedYieldQuintals: number;
  estimatedRevenueLossInr: number;
  primaryCause: string;
}

interface RiskFactorsSectionProps {
  factors: Factor[];
  trend7d?: Trend7d;
  yieldImpact?: YieldImpact;
}

export default function RiskFactorsSection({ factors, trend7d, yieldImpact }: RiskFactorsSectionProps) {
  const { t } = useLanguage();

  const getIcon = (name: string) => {
    if (name.includes('Weather')) return <CloudRain className="w-4 h-4 text-emerald-700" />;
    if (name.includes('Soil')) return <Droplets className="w-4 h-4 text-emerald-700" />;
    if (name.includes('Market')) return <TrendingUp className="w-4 h-4 text-emerald-700" />;
    if (name.includes('Credit')) return <DollarSign className="w-4 h-4 text-emerald-700" />;
    return <Bug className="w-4 h-4 text-emerald-700" />;
  };

  return (
    <div className="bg-white/45 backdrop-blur-2xl rounded-[32px] border border-white/80 p-6 md:p-7 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.12)] space-y-6">
      
      {/* Velocity Trend Warning Banner */}
      {trend7d?.trendingUp && (
        <div className="p-4 rounded-2xl bg-amber-500/10 backdrop-blur-md border border-amber-500/30 text-amber-950 shadow-sm flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-900 shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-amber-950 uppercase tracking-wide">
                ⚠️ Rising Distress Warning
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                +{trend7d.delta} pts in 7d
              </span>
            </div>
            <p className="text-xs text-amber-900 font-medium mt-1 leading-relaxed">
              Distress score increased significantly over the past week. Primary Driver: <strong className="font-bold underline text-amber-950">{trend7d.primaryDriver}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Yield Impact Estimator Card (Feature #3 integration) */}
      {yieldImpact && (
        <div className="p-5 rounded-2xl bg-linear-to-br from-rose-500/10 via-amber-500/5 to-transparent border border-rose-500/20 text-slate-900 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-700" />
              </div>
              <span className="text-sm font-extrabold text-slate-900">Projected Yield Impact</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-xs">
              −{yieldImpact.projectedLossPct}% Loss
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-white/70 p-2.5 rounded-xl border border-white/80">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Expected Yield</p>
              <p className="text-sm font-black text-slate-800">{yieldImpact.expectedYieldQuintals} qtl</p>
            </div>
            <div className="bg-white/70 p-2.5 rounded-xl border border-white/80">
              <p className="text-[10px] font-bold text-rose-600 uppercase">Adjusted Yield</p>
              <p className="text-sm font-black text-rose-700">{yieldImpact.riskAdjustedYieldQuintals} qtl</p>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-white/70 p-2.5 rounded-xl border border-white/80">
              <p className="text-[10px] font-bold text-amber-600 uppercase">Est. Revenue Loss</p>
              <p className="text-sm font-black text-amber-700">₹{yieldImpact.estimatedRevenueLossInr.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            Primary driver of yield reduction: <strong className="text-slate-900">{yieldImpact.primaryCause}</strong>
          </p>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-emerald-950/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-700/10 text-emerald-900 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {t('risk_factors', 'Contributing Risk Factors')}
            </h2>
            <p className="text-xs text-slate-600 font-medium">{t('realtime_telemetry', 'Real-time weighted parameters')}</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/90 text-emerald-900 shadow-sm">
          {t('synced_with_database', 'Synced with AWS RDS')}
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

          const factorName = factor.nameKey ? t(factor.nameKey, factor.name) : factor.name;
          const factorDetail = factor.detailKey ? t(factor.detailKey, factor.detail) : factor.detail;

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
                  <span className="text-sm font-bold text-slate-900">{factorName}</span>
                </div>
                <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold border ${badgeColor}`}>
                  {t('risk_percentage', '{value}% Risk', { value: factor.score })}
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
                {factorDetail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}


