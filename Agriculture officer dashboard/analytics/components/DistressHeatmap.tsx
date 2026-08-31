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
}

interface Props {
  data: BlockData[] | null;
  loading: boolean;
}

export function DistressHeatmap({ data, loading }: Props) {
  const router = useRouter();
  const [selectedBlock, setSelectedBlock] = useState<BlockData | null>(null);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-5">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-0.5">Distress Heatmap & Block Grid</h3>
          <p className="text-slate-600 text-xs font-medium">Block-level severity breakdown &bull; Click a block to inspect triage</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-600" /> Critical (&gt;70)</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High (51-70)</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate (31-50)</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Low (≤30)</div>
        </div>
      </div>

      {/* Block Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {data.map((block) => {
          const severity = getSeverityColor(block.avgScore);
          return (
            <button
              key={block.block}
              onClick={() => setSelectedBlock(block)}
              className={`relative p-4 rounded-2xl border ${severity.border} ${severity.bg} ${severity.glow} hover:scale-[1.03] transition-all duration-200 cursor-pointer text-left group shadow-xs`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin className={`w-3.5 h-3.5 ${severity.text}`} />
                <span className={`text-xs font-black ${severity.text}`}>{block.block || 'Unknown'}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">{block.avgScore}</span>
                <span className="text-[10px] text-slate-500 font-bold">/100</span>
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
                <p className="text-xs text-slate-600 font-medium">Mayurbhanj District &bull; Telemetry Summary</p>
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
              <div className="bg-white/80 p-3 rounded-2xl border border-black/5 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-500 uppercase">High Risk</p>
                <p className="text-2xl font-black text-red-700">{selectedBlock.highRiskCount}</p>
              </div>
              <div className="bg-white/80 p-3 rounded-2xl border border-black/5 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Monitored</p>
                <p className="text-2xl font-black text-slate-900">{selectedBlock.totalFarmers}</p>
              </div>
            </div>

            <div className="p-3 bg-neutral-100/80 rounded-2xl border border-black/5 flex items-center gap-2 text-xs font-bold text-slate-800">
              {getFactorIcon(selectedBlock.primaryFactor)}
              <span>Primary Stress Factor: {selectedBlock.primaryFactor}</span>
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
