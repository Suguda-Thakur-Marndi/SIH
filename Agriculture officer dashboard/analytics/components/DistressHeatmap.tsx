"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, AlertTriangle, Shield, Users, X, ExternalLink, CloudRain, TrendingDown, CreditCard } from 'lucide-react';

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
      <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md animate-pulse" role="status" aria-busy="true" aria-label="Loading distress heatmap">
        <div className="space-y-1 mb-5">
          <div className="h-6 w-40 rounded bg-white/10" />
          <div className="h-4 w-56 rounded bg-white/10" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <div className="h-4 w-20 rounded bg-white/10" />
              <div className="h-8 w-12 rounded bg-white/10" />
              <div className="h-3 w-24 rounded bg-white/10" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-4">
          <div className="h-3 w-8 rounded bg-white/10" />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-4 w-8 rounded bg-white/10" />
            ))}
          </div>
          <div className="h-3 w-8 rounded bg-white/10" />
        </div>
        <span className="sr-only">Loading distress heatmap</span>
      </div>
    );
  }

  const getSeverityColor = (score: number) => {
    if (score > 70) return { bg: 'bg-red-500/30', border: 'border-red-500/50', text: 'text-red-300', glow: 'shadow-[0_0_12px_rgba(239,68,68,0.2)]' };
    if (score > 50) return { bg: 'bg-orange-500/25', border: 'border-orange-500/40', text: 'text-orange-300', glow: '' };
    if (score > 30) return { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-300', glow: '' };
    return { bg: 'bg-emerald-500/15', border: 'border-emerald-500/25', text: 'text-emerald-300', glow: '' };
  };

  const getFactorIcon = (factor: string) => {
    if (factor.includes('Weather')) return <CloudRain className="w-3.5 h-3.5" />;
    if (factor.includes('Market')) return <TrendingDown className="w-3.5 h-3.5" />;
    if (factor.includes('Loan')) return <CreditCard className="w-3.5 h-3.5" />;
    return <AlertTriangle className="w-3.5 h-3.5" />;
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Distress Heatmap</h3>
          <p className="text-white/60 text-sm">Block-level severity breakdown · Click a block for details</p>
        </div>
        {/* Legend */}
        <div className="hidden md:flex items-center gap-3 text-xs text-white/50">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500/40" /> Critical</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-500/30" /> High</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-500/25" /> Moderate</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500/20" /> Low</div>
        </div>
      </div>

      {/* Block Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {data.map((block) => {
          const severity = getSeverityColor(block.avgScore);
          return (
            <button
              key={block.block}
              onClick={() => setSelectedBlock(block)}
              className={`relative p-4 rounded-xl border ${severity.border} ${severity.bg} ${severity.glow} hover:scale-[1.03] transition-all duration-200 cursor-pointer text-left group`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin className={`w-3.5 h-3.5 ${severity.text}`} />
                <span className={`text-sm font-semibold ${severity.text}`}>{block.block || 'Unknown'}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{block.avgScore}</span>
                <span className="text-white/40 text-xs">avg</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-white/50">
                <span className="flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  {block.highRiskCount}
                </span>
                <span className="flex items-center gap-0.5">
                  <Shield className="w-3 h-3 text-amber-400" />
                  {block.moderateRiskCount}
                </span>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-3.5 h-3.5 text-white/40" />
              </div>
            </button>
          );
        })}
      </div>

      {data.length === 0 && (
        <div className="flex items-center justify-center h-32">
          <p className="text-white/40">No block data available for this period</p>
        </div>
      )}

      {/* Block Detail Slide-out */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedBlock(null)}>
          <div
            className="relative bg-gray-900/95 border border-white/15 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedBlock(null)}
              className="absolute top-4 right-4 p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h4 className="text-lg font-bold text-white">{selectedBlock.block} Block</h4>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-white/50 text-xs mb-1">Avg Score</p>
                <p className="text-white text-2xl font-bold">{selectedBlock.avgScore}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-white/50 text-xs mb-1">Total Farmers</p>
                <p className="text-white text-2xl font-bold">{selectedBlock.totalFarmers}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                <p className="text-red-400/70 text-xs mb-1">High Risk</p>
                <p className="text-red-400 text-2xl font-bold">{selectedBlock.highRiskCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-amber-400/70 text-xs mb-1">Moderate Risk</p>
                <p className="text-amber-400 text-2xl font-bold">{selectedBlock.moderateRiskCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-white/60 text-sm">
                {getFactorIcon(selectedBlock.primaryFactor)}
                <span>Primary Factor:</span>
              </div>
              <span className="text-white font-medium text-sm">{selectedBlock.primaryFactor}</span>
            </div>

            <button
              onClick={() => {
                setSelectedBlock(null);
                router.push(`/officer-dashboard/farmers?block=${encodeURIComponent(selectedBlock.block)}`);
              }}
              className="w-full py-3 px-4 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium text-sm hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              View Farmers in {selectedBlock.block}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
