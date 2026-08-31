"use client";

import React, { useState, useCallback } from 'react';
import { CloudRain, TrendingDown, CreditCard, ChevronDown, ChevronUp, Loader2, Users, MapPin, Wheat } from 'lucide-react';

interface FactorData {
  name: string;
  value: number;
  percent: number;
}

interface FactorDetail {
  farmersAffected: number;
  avgDeviation: number;
  mostAffectedCrop: string;
  mostAffectedBlock: string;
  farmers: { id: string; name: string; block: string; score: number; factorScore: number; crop: string }[];
}

interface Props {
  data: FactorData[] | null;
  loading: boolean;
  timeRange: string;
  block: string;
}

const FACTOR_MAP: Record<string, string> = {
  'Weather / Rainfall': 'weather',
  'Market Prices': 'market',
  'Loan Proximity': 'loan',
};

export function DistressFactorsExpanded({ data, loading, timeRange, block }: Props) {
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<Record<string, FactorDetail>>({});
  const [detailLoading, setDetailLoading] = useState<Record<string, boolean>>({});

  const fetchDetail = useCallback(async (factorName: string) => {
    const factorKey = FACTOR_MAP[factorName];
    if (!factorKey || detailData[factorKey]) return;

    setDetailLoading((prev) => ({ ...prev, [factorKey]: true }));
    try {
      const params = new URLSearchParams({ timeRange, block });
      const res = await fetch(`/api/officer/analytics/distress-factors/${factorKey}?${params}`);
      const json = await res.json();
      if (json.success) {
        setDetailData((prev) => ({ ...prev, [factorKey]: json.data }));
      }
    } catch (err) {
      console.error('Failed to fetch factor detail', err);
    } finally {
      setDetailLoading((prev) => ({ ...prev, [factorKey]: false }));
    }
  }, [timeRange, block, detailData]);

  const toggleExpand = (factorName: string) => {
    if (expandedFactor === factorName) {
      setExpandedFactor(null);
    } else {
      setExpandedFactor(factorName);
      fetchDetail(factorName);
    }
  };

  if (loading || !data) {
    return (
      <div className="glass bg-white/80 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-xl animate-pulse" role="status" aria-busy="true" aria-label="Loading distress factors">
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-1.5">
            <div className="h-6 w-48 rounded bg-slate-900/10" />
            <div className="h-4 w-64 rounded bg-slate-900/10" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { color: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { color: 'bg-orange-500/10', border: 'border-orange-500/20' },
            { color: 'bg-purple-500/10', border: 'border-purple-500/20' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} border ${s.border} rounded-2xl p-4 space-y-3`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900/10" />
                <div className="h-5 w-28 rounded bg-slate-900/10" />
              </div>
              <div className="h-8 w-16 rounded bg-slate-900/10" />
              <div className="h-2 w-full bg-slate-900/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-slate-900/10" style={{ width: `${55 - i * 12}%` }} />
              </div>
              <div className="h-8 w-full rounded-xl bg-slate-900/5" />
            </div>
          ))}
        </div>
        <span className="sr-only">Loading distress factors</span>
      </div>
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

  const getAccent = (name: string) => {
    if (name.includes('Weather')) return 'border-blue-500/30 bg-blue-50/70';
    if (name.includes('Market')) return 'border-amber-500/30 bg-amber-50/70';
    if (name.includes('Loan')) return 'border-purple-500/30 bg-purple-50/70';
    return 'border-black/10 bg-white/70';
  };

  return (
    <div className="glass bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-xl h-full text-[#1A1A1A]">
      <h3 className="text-xl font-black text-slate-900 tracking-tight mb-0.5">Distress Factor Breakdown</h3>
      <p className="text-slate-600 text-xs font-medium mb-6">Click any factor card to expand affected farmers and agronomic telemetry</p>

      <div className="space-y-4">
        {data.map((factor, idx) => {
          const barColor = getColor(factor.name);
          const factorKey = FACTOR_MAP[factor.name];
          const isExpanded = expandedFactor === factor.name;
          const detail = factorKey ? detailData[factorKey] : null;
          const isDetailLoading = factorKey ? detailLoading[factorKey] : false;

          return (
            <div key={idx} className="glass bg-white/70 hover:bg-white/90 border border-black/5 rounded-2xl p-4 transition-all shadow-2xs">
              {/* Factor Bar — Clickable */}
              <button
                onClick={() => toggleExpand(factor.name)}
                className="w-full text-left group cursor-pointer"
              >
                <div className="flex justify-between items-center mb-2.5">
                  <div className="flex items-center gap-2.5 text-slate-900 font-bold">
                    <div className="p-1.5 rounded-lg bg-white border border-black/5 shadow-2xs">
                      {getIcon(factor.name)}
                    </div>
                    <span className="text-sm font-extrabold">{factor.name}</span>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-slate-500" />
                      : <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                    }
                  </div>
                  <div className="text-right">
                    <span className="text-slate-900 font-black text-base block">{factor.percent}%</span>
                    <span className="text-slate-500 text-xs font-semibold">{factor.value.toLocaleString()} farmers affected</span>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-slate-200/80 rounded-full overflow-hidden p-0.5">
                  <div
                    className={"h-full rounded-full transition-all duration-1000 " + barColor}
                    style={{ width: factor.percent + "%" }}
                  ></div>
                </div>
              </button>

              {/* Expandable Detail Panel */}
              {isExpanded && (
                <div className={`mt-4 p-4 rounded-2xl border ${getAccent(factor.name)} backdrop-blur-md transition-all duration-300`}>
                  {isDetailLoading ? (
                    <div className="flex items-center justify-center py-6 gap-2 text-slate-600">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                      <span className="text-xs font-bold">Loading factor details...</span>
                    </div>
                  ) : detail ? (
                    <div className="space-y-4">
                      {/* Stats Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center bg-white/80 p-2.5 rounded-xl border border-black/5">
                          <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] font-bold mb-0.5">
                            <Users className="w-3.5 h-3.5" /> Total Affected
                          </div>
                          <p className="text-slate-900 font-black text-lg">{detail.farmersAffected}</p>
                        </div>
                        <div className="text-center bg-white/80 p-2.5 rounded-xl border border-black/5">
                          <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] font-bold mb-0.5">
                            <TrendingDown className="w-3.5 h-3.5" /> Avg Stress
                          </div>
                          <p className="text-slate-900 font-black text-lg">{detail.avgDeviation}</p>
                        </div>
                        <div className="text-center bg-white/80 p-2.5 rounded-xl border border-black/5">
                          <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] font-bold mb-0.5">
                            <Wheat className="w-3.5 h-3.5" /> Vulnerable Crop
                          </div>
                          <p className="text-emerald-900 font-extrabold text-xs mt-1">{detail.mostAffectedCrop}</p>
                        </div>
                        <div className="text-center bg-white/80 p-2.5 rounded-xl border border-black/5">
                          <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] font-bold mb-0.5">
                            <MapPin className="w-3.5 h-3.5" /> Priority Block
                          </div>
                          <p className="text-slate-900 font-extrabold text-xs mt-1">{detail.mostAffectedBlock}</p>
                        </div>
                      </div>

                      {/* Farmer List */}
                      {detail.farmers.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-black/10">
                          <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">High-Priority Farmers Under This Factor</p>
                          {detail.farmers.map((f, i) => (
                            <div key={i} className="flex items-center justify-between py-2 px-3 bg-white/80 rounded-xl border border-black/5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#CFE362] text-xs font-bold">
                                  {f.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-slate-900 text-xs font-bold">{f.name}</p>
                                  <p className="text-slate-500 text-[10px] font-semibold">{f.block} &bull; {f.crop}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className="text-slate-600 text-xs font-semibold">Factor: {f.factorScore}%</span>
                                <span className="text-red-700 font-black text-xs bg-red-100 px-2 py-0.5 rounded-md">{f.score}/100</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs text-center py-4">No detail telemetry available</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {data.length === 0 && (
        <div className="flex items-center justify-center h-40">
          <p className="text-slate-400 text-xs font-semibold">No distress factors recorded</p>
        </div>
      )}
    </div>
  );
}
