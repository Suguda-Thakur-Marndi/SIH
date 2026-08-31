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
      <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md animate-pulse" role="status" aria-busy="true" aria-label="Loading distress factors">
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-1">
            <div className="h-6 w-48 rounded bg-white/10" />
            <div className="h-4 w-64 rounded bg-white/10" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { color: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { color: 'bg-orange-500/10', border: 'border-orange-500/20' },
            { color: 'bg-purple-500/10', border: 'border-purple-500/20' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} border ${s.border} rounded-xl p-4 space-y-3`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10" />
                <div className="h-5 w-28 rounded bg-white/10" />
              </div>
              <div className="h-8 w-16 rounded bg-white/10" />
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-white/10" style={{ width: `${55 - i * 12}%` }} />
              </div>
              <div className="h-8 w-full rounded-lg bg-white/5" />
            </div>
          ))}
        </div>
        <span className="sr-only">Loading distress factors</span>
      </div>
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

  const getAccent = (name: string) => {
    if (name.includes('Weather')) return 'border-blue-500/30 bg-blue-500/5';
    if (name.includes('Market')) return 'border-orange-500/30 bg-orange-500/5';
    if (name.includes('Loan')) return 'border-purple-500/30 bg-purple-500/5';
    return 'border-white/10 bg-white/5';
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md h-full">
      <h3 className="text-xl font-bold text-white mb-1">Distress Factor Analysis</h3>
      <p className="text-white/60 text-sm mb-6">Click a factor to see affected farmers and details</p>

      <div className="space-y-4">
        {data.map((factor, idx) => {
          const barColor = getColor(factor.name);
          const factorKey = FACTOR_MAP[factor.name];
          const isExpanded = expandedFactor === factor.name;
          const detail = factorKey ? detailData[factorKey] : null;
          const isDetailLoading = factorKey ? detailLoading[factorKey] : false;

          return (
            <div key={idx}>
              {/* Factor Bar — Clickable */}
              <button
                onClick={() => toggleExpand(factor.name)}
                className="w-full text-left group"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-white">
                    {getIcon(factor.name)}
                    <span className="font-medium">{factor.name}</span>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-white/40" />
                      : <ChevronDown className="w-4 h-4 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    }
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
              </button>

              {/* Expandable Detail Panel */}
              {isExpanded && (
                <div className={`mt-3 p-4 rounded-xl border ${getAccent(factor.name)} transition-all duration-300`}>
                  {isDetailLoading ? (
                    <div className="flex items-center justify-center py-6 gap-2 text-white/50">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Loading details...</span>
                    </div>
                  ) : detail ? (
                    <div className="space-y-4">
                      {/* Stats Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-white/50 text-xs mb-1">
                            <Users className="w-3 h-3" /> Affected
                          </div>
                          <p className="text-white font-bold text-lg">{detail.farmersAffected}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-white/50 text-xs mb-1">
                            <TrendingDown className="w-3 h-3" /> Avg Score
                          </div>
                          <p className="text-white font-bold text-lg">{detail.avgDeviation}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-white/50 text-xs mb-1">
                            <Wheat className="w-3 h-3" /> Top Crop
                          </div>
                          <p className="text-white font-bold text-sm">{detail.mostAffectedCrop}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-white/50 text-xs mb-1">
                            <MapPin className="w-3 h-3" /> Top Block
                          </div>
                          <p className="text-white font-bold text-sm">{detail.mostAffectedBlock}</p>
                        </div>
                      </div>

                      {/* Farmer List */}
                      {detail.farmers.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-white/10">
                          <p className="text-white/50 text-xs font-medium uppercase tracking-wider">Most Affected Farmers</p>
                          {detail.farmers.map((f, i) => (
                            <div key={i} className="flex items-center justify-between py-1.5">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 text-xs font-bold">
                                  {f.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-white text-sm font-medium">{f.name}</p>
                                  <p className="text-white/40 text-xs">{f.block} · {f.crop}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-white/50 text-xs">Factor: {f.factorScore}</span>
                                <span className="text-red-400 font-bold text-sm">{f.score}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-white/40 text-sm text-center py-4">No detail data available</p>
                  )}
                </div>
              )}
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
