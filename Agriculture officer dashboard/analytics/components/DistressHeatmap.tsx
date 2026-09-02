"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, AlertTriangle, X, ExternalLink, CloudRain, TrendingDown, CreditCard } from 'lucide-react';

interface BlockData {
  block: string;
  totalFarmers: number;
  avgScore: number;
  highRiskCount: number;
  moderateRiskCount: number;
  primaryFactor: string;
  trendDirection?: 'worsening' | 'stable' | 'improving';
  trendDelta?: number;
  predicted7dScore?: number;
}

interface Props {
  data: BlockData[] | null;
  loading: boolean;
}

export function DistressHeatmap({ data, loading }: Props) {
  const router = useRouter();
  const [selectedBlock, setSelectedBlock] = useState<BlockData | null>(null);
  const [viewForecast, setViewForecast] = useState(false);

  if (loading || !data) {
    return (
      <div className="glass bg-white/80 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-xl animate-pulse" role="status" aria-busy="true" aria-label="Loading distress heatmap">
        <div className="space-y-1.5 mb-5">
          <div className="h-6 w-40 rounded bg-slate-900/10" />
          <div className="h-4 w-56 rounded bg-slate-900/10" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white/60 border border-white/80 rounded-2xl p-4 space-y-2">
              <div className="h-4 w-20 rounded bg-slate-900/10" />
              <div className="h-8 w-12 rounded bg-slate-900/10" />
              <div className="h-3 w-24 rounded bg-slate-900/10" />
            </div>
          ))}
        </div>
        <span className="sr-only">Loading distress heatmap</span>
      </div>
    );
  }

  const getSeverityColor = (score: number) => {
    if (score > 70) return { bg: 'bg-red-500/15', border: 'border-red-500/40', text: 'text-red-700', badge: 'bg-red-600 text-white', glow: 'shadow-[0_8px_25px_-5px_rgba(239,68,68,0.2)]' };
    if (score > 50) return { bg: 'bg-orange-500/15', border: 'border-orange-500/35', text: 'text-orange-800', badge: 'bg-orange-500 text-white', glow: '' };
    if (score > 30) return { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-800', badge: 'bg-amber-500 text-white', glow: '' };
    return { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-800', badge: 'bg-emerald-600 text-white', glow: '' };
  };

  const getFactorIcon = (factor: string) => {
    if (factor.includes('Weather')) return <CloudRain className="w-3.5 h-3.5" />;
    if (factor.includes('Market')) return <TrendingDown className="w-3.5 h-3.5" />;
    if (factor.includes('Loan')) return <CreditCard className="w-3.5 h-3.5" />;
    return <AlertTriangle className="w-3.5 h-3.5" />;
  };

  return (
    <div className="glass bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-xl relative text-[#1A1A1A]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-0.5">Distress Heatmap & Block Grid</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-black uppercase">
              Predictive Velocity AI
            </span>
          </div>
          <p className="text-slate-600 text-xs font-medium">Block-level severity breakdown &bull; Window-over-window velocity forecasting</p>
        </div>

        {/* Forecast View Toggle & Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setViewForecast(!viewForecast)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border shadow-2xs cursor-pointer flex items-center gap-1.5 ${
              viewForecast 
                ? 'bg-purple-700 text-white border-purple-800' 
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
            }`}
          >
            <span>🔮</span>
            <span>{viewForecast ? '7-Day Projected Mode' : 'Switch to 7d Projected'}</span>
          </button>

          <div className="hidden lg:flex items-center gap-2.5 text-xs font-bold text-slate-600 border-l border-slate-300 pl-3">
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-600" /> Critical (&gt;70)</div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High (51-70)</div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Mod (31-50)</div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Low (≤30)</div>
          </div>
        </div>
      </div>

      {/* Block Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {data.map((block) => {
          const displayScore = viewForecast && block.predicted7dScore !== undefined ? block.predicted7dScore : block.avgScore;
          const severity = getSeverityColor(displayScore);

          const isWorsening = block.trendDirection === 'worsening' || (block.trendDelta && block.trendDelta > 0);
          const isImproving = block.trendDirection === 'improving' || (block.trendDelta && block.trendDelta < 0);
          const deltaText = block.trendDelta ? (block.trendDelta > 0 ? `+${block.trendDelta}` : `${block.trendDelta}`) : '0';

          return (
            <button
              key={block.block}
              onClick={() => setSelectedBlock(block)}
              className={`relative p-4 rounded-2xl border ${severity.border} ${severity.bg} ${severity.glow} hover:scale-[1.03] transition-all duration-200 cursor-pointer text-left group shadow-xs`}
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className={`w-3.5 h-3.5 ${severity.text} shrink-0`} />
                  <span className={`text-xs font-black truncate ${severity.text}`}>{block.block || 'Unknown'}</span>
                </div>

                {/* Trend Velocity Badge */}
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border shrink-0 ${
                  isWorsening 
                    ? 'bg-rose-100 text-rose-800 border-rose-300' 
                    : isImproving 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  {isWorsening ? `▲ ${deltaText}` : isImproving ? `▼ ${deltaText}` : `▶ 0`}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">{displayScore}</span>
                  <span className="text-[10px] text-slate-500 font-bold">/100</span>
                </div>

                {viewForecast && (
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-purple-200 text-purple-900 rounded" title="Projected if current 7-day trend velocity continues">
                    Projected (if trend continues)
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5 text-[10px] text-slate-600 font-semibold">
                <span>{block.totalFarmers} farmers</span>
                {block.highRiskCount > 0 && (
                  <span className="text-red-700 font-extrabold">{block.highRiskCount} critical</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Block Detail Modal */}
      {selectedBlock && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass bg-white/95 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xl font-black text-slate-900">{selectedBlock.block} Block</h4>
                <p className="text-xs text-slate-600 font-medium">Mayurbhanj District &bull; Telemetry & Projection Summary</p>
              </div>
              <button
                onClick={() => setSelectedBlock(null)}
                className="p-1 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-white/80 p-3 rounded-2xl border border-black/5 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Avg Score</p>
                <p className="text-2xl font-black text-slate-900">{selectedBlock.avgScore}</p>
              </div>
              <div className="bg-white/80 p-3 rounded-2xl border border-purple-200 bg-purple-50/50 shadow-2xs">
                <p className="text-[10px] font-bold text-purple-700 uppercase" title="7-day projection if trend continues">7d Projected (if trend continues)</p>
                <p className="text-2xl font-black text-purple-900">{selectedBlock.predicted7dScore ?? selectedBlock.avgScore}</p>
              </div>
              <div className="bg-white/80 p-3 rounded-2xl border border-black/5 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-500 uppercase">High Risk</p>
                <p className="text-2xl font-black text-red-700">{selectedBlock.highRiskCount}</p>
              </div>
            </div>

            <div className="p-3 bg-neutral-100/80 rounded-2xl border border-black/5 flex items-center justify-between text-xs font-bold text-slate-800">
              <div className="flex items-center gap-2">
                {getFactorIcon(selectedBlock.primaryFactor)}
                <span>Stress Driver: {selectedBlock.primaryFactor}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                selectedBlock.trendDirection === 'worsening' 
                  ? 'bg-rose-100 text-rose-800' 
                  : selectedBlock.trendDirection === 'improving' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {selectedBlock.trendDirection?.toUpperCase() || 'STABLE'}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const bName = selectedBlock.block;
                  setSelectedBlock(null);
                  router.push(`/officer-dashboard/farmers?block=${encodeURIComponent(bName)}`);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-[#1A1A1A] hover:bg-black text-[#CFE362] text-xs font-bold transition shadow-md"
              >
                Inspect Farmers in Block
              </button>
              <button
                onClick={() => {
                  setSelectedBlock(null);
                  router.push('/officer-dashboard/map');
                }}
                className="py-2.5 px-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold border border-black/10 transition flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Map ↗</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
