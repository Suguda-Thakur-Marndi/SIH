"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, Search, Filter, AlertTriangle, MapPin, 
  ChevronRight, RefreshCw
} from 'lucide-react';

function HighRiskFarmersContent() {
  const searchParams = useSearchParams();
  const initialRisk = searchParams.get('risk') || searchParams.get('riskLevel') || 'all';
  const initialBlock = searchParams.get('block') || '';
  const initialQuery = searchParams.get('q') || '';

  const [farmers, setFarmers] = useState<any[]>([]);
  const [search, setSearch] = useState(initialBlock || initialQuery);
  const [filterRisk, setFilterRisk] = useState(initialRisk);
  const [loading, setLoading] = useState(true);
  const [recheckingId, setRecheckingId] = useState<string | null>(null);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});

  const handleRecheckFarmer = async (farmerId: string) => {
    setRecheckingId(farmerId);
    try {
      const res = await fetch('/api/automation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        const r = data.result;
        const msg = `Score: ${r.score}/100 (${r.band})${r.smsQueued ? ' • SMS Queued' : ''}`;
        setStatusMap((prev) => ({ ...prev, [farmerId]: msg }));
        // Update score in local farmers state
        setFarmers((prev) =>
          prev.map((f) =>
            f.id === farmerId || f.farmerId === farmerId
              ? { ...f, riskScore: r.score, riskLevel: r.band }
              : f
          )
        );
      } else {
        setStatusMap((prev) => ({ ...prev, [farmerId]: data.error || 'Check completed' }));
      }
    } catch (err: any) {
      setStatusMap((prev) => ({ ...prev, [farmerId]: `Error: ${err.message}` }));
    } finally {
      setRecheckingId(null);
    }
  };

  useEffect(() => {
    fetch('/api/officer/farmers')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFarmers(data.data || data.farmers || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredFarmers = farmers.filter((f) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.farmerId && f.farmerId.toLowerCase().includes(q)) ||
      (f.id && f.id.toLowerCase().includes(q)) ||
      (f.village && f.village.toLowerCase().includes(q)) ||
      (f.block && f.block.toLowerCase().includes(q)) ||
      (f.crop && f.crop.toLowerCase().includes(q)) ||
      (f.primaryReason && f.primaryReason.toLowerCase().includes(q));

    const matchesFilter =
      filterRisk === 'all' ? true : f.riskLevel?.toLowerCase() === filterRisk.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#F2F2EF] text-[#1A1A1A] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link 
            href="/officer-dashboard" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-black/10 shadow-sm text-sm font-medium hover:bg-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Command Center
          </Link>
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#1A1A1A] text-[#CFE362]">
            Agriculture Officer Triage System
          </span>
        </div>

        {/* Header Header */}
        <div className="bg-[#1A1A1A] text-white rounded-[28px] p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                High-Risk Farmer Triage
              </span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                District Distress Directory & Action Queue
              </h1>
              <p className="text-neutral-300 text-sm mt-1 max-w-2xl">
                Real-time monitoring of smallholder farmers experiencing severe agronomic, climate, or price distress across Mayurbhanj district blocks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-center">
                <div className="text-2xl font-bold text-red-400">38</div>
                <div className="text-[10px] uppercase text-neutral-400 font-semibold">Critical Risk</div>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-center">
                <div className="text-2xl font-bold text-amber-400">164</div>
                <div className="text-[10px] uppercase text-neutral-400 font-semibold">Moderate Risk</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-black/5 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by farmer name, village, block or crop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-neutral-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk Only (&gt;70)</option>
              <option value="medium">Medium Risk (40-70)</option>
              <option value="low">Low Risk (&lt;40)</option>
            </select>
          </div>
        </div>

        {/* Farmer Triage Cards / Table */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-8 text-center bg-white/70 rounded-[22px] text-neutral-500 font-medium animate-pulse">
              Loading high-risk farmer telemetry...
            </div>
          ) : filteredFarmers.map((farmer) => {
            const isHigh = farmer.riskLevel === 'HIGH';
            return (
              <div 
                key={farmer.id}
                className="bg-white/85 backdrop-blur-md rounded-[22px] p-5 border border-black/5 hover:border-black/20 hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Farmer identity & location */}
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow-sm ${
                    isHigh ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {farmer.riskScore}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-neutral-900">{farmer.name}</h3>
                      <span className="text-xs text-neutral-400 font-medium">({farmer.id})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        {farmer.village}
                      </span>
                      <span>&bull;</span>
                      <span className="font-medium text-neutral-900">{farmer.crop} ({farmer.landArea})</span>
                      <span>&bull;</span>
                      <span>{farmer.phone}</span>
                    </div>

                    {/* Stress tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {farmer.riskFactors?.map((rf: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700">
                          {rf}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-neutral-900">{farmer.insuranceStatus}</div>
                    <div className="text-[11px] text-neutral-500">{farmer.loanStatus}</div>
                  </div>

                  {statusMap[farmer.id] && (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {statusMap[farmer.id]}
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRecheckFarmer(farmer.farmerId || farmer.id)}
                      disabled={recheckingId === (farmer.farmerId || farmer.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold border border-black/10 shadow-sm transition disabled:opacity-50"
                      title="Run live location -> weather/soil/mandi -> AI pipeline"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 text-neutral-600 ${
                          recheckingId === (farmer.farmerId || farmer.id) ? 'animate-spin text-emerald-600' : ''
                        }`}
                      />
                      <span>
                        {recheckingId === (farmer.farmerId || farmer.id) ? 'Checking...' : 'Re-check'}
                      </span>
                    </button>

                    <Link
                      href={`/officer-dashboard/farmers/${farmer.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition"
                    >
                      <span>View & Intervene</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#CFE362]" />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default function HighRiskFarmersView() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F2F2EF] p-8 flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-3 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto" />
      </div>
    }>
      <HighRiskFarmersContent />
    </Suspense>
  );
}
