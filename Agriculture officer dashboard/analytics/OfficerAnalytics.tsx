"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import bgDesktop from '@/Government equipment schemes/img/1(1).png';
import bgMobile from '@/Agriculture officer dashboard/img/3.png';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Calendar, MapPin, Filter, CloudRain, TrendingDown, CreditCard, Wheat, RefreshCw, BarChart2, ShieldAlert } from 'lucide-react';
import { KPICards } from './components/KPICards';
import { DistressTrendChart } from './components/DistressTrendChart';
import { DistressFactorsExpanded } from './components/DistressFactorsExpanded';
import { RiskDistribution } from './components/RiskDistribution';
import { DistressHeatmap } from './components/DistressHeatmap';
import { WeatherStressPanel } from './components/WeatherStressPanel';
import { MarketStressPanel } from './components/MarketStressPanel';
import { CombinedRiskMatrix } from './components/CombinedRiskMatrix';
import { PriorityTable } from './components/PriorityTable';

/* ------------------------------------------------------------------ */
/*  Independent section-level fetching                                 */
/* ------------------------------------------------------------------ */

function useSectionFetch<T>(url: string, deps: any[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) {
          setData(json.data ?? json);
        } else {
          setError(json.error?.message || 'Unknown error');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

export function OfficerAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ---- Global Filters ---- */
  const [timeRange, setTimeRange] = useState('7d');
  const [block, setBlock] = useState('ALL');
  const [crop, setCrop] = useState('ALL');
  const [riskLevel, setRiskLevel] = useState('ALL');
  const [riskFactor, setRiskFactor] = useState('ALL');

  const params = new URLSearchParams({ timeRange, block, crop, riskLevel, riskFactor }).toString();

  /* ---- Section 1: Overview KPIs ---- */
  const overview = useSectionFetch<any>(`/api/officer/analytics/overview?${params}`, [params]);

  /* ---- Section 2: Distress Trend ---- */
  const [trendPayload, setTrendPayload] = useState<{ data: any; insight: string }>({ data: null, insight: '' });
  const [trendLoading, setTrendLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setTrendLoading(true);

    fetch(`/api/officer/analytics/distress-trend?${params}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        setTrendPayload({ data: json.data || null, insight: json.insight || '' });
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setTrendLoading(false); });

    return () => { cancelled = true; };
  }, [params]);

  /* ---- Section 3: Risk Distribution ---- */
  const riskDist = useSectionFetch<any>(`/api/officer/analytics/risk-distribution?${params}`, [params]);

  /* ---- Section 4: Distress Factors ---- */
  const factors = useSectionFetch<any>(`/api/officer/analytics/distress-factors?${params}`, [params]);

  /* ---- Section 5: Heatmap ---- */
  const heatmap = useSectionFetch<any>(`/api/officer/analytics/heatmap?${params}`, [params]);

  /* ---- Section 6: Weather Stress ---- */
  const weather = useSectionFetch<any>(`/api/officer/analytics/weather-stress?${params}`, [params]);

  /* ---- Section 7: Market Stress ---- */
  const [marketPayload, setMarketPayload] = useState<{ data: any; insight: string }>({ data: null, insight: '' });
  const [marketLoading, setMarketLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setMarketLoading(true);

    fetch(`/api/officer/analytics/market-stress?${params}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        setMarketPayload({ data: json.data || null, insight: json.insight || '' });
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setMarketLoading(false); });

    return () => { cancelled = true; };
  }, [params]);

  /* ---- Section 8: Combined Risk ---- */
  const combined = useSectionFetch<any>(`/api/officer/analytics/combined-risk?${params}`, [params]);

  /* ---- Section 9: Priority Interventions ---- */
  const priority = useSectionFetch<any>(`/api/officer/analytics/priority-interventions?limit=6&${params}`, [params]);

  const resetFilters = () => {
    setTimeRange('7d');
    setBlock('ALL');
    setCrop('ALL');
    setRiskLevel('ALL');
    setRiskFactor('ALL');
  };

  return (
    <div className="relative min-h-screen w-full flex overflow-hidden font-sans text-white bg-black">
      {/* Background Images */}
      <div className="fixed inset-0 z-0 hidden md:block">
        <Image
          src={bgDesktop}
          alt="Dashboard Desktop Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-65"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 backdrop-blur-[2px]" />
      </div>
      <div className="fixed inset-0 z-0 block md:hidden">
        <Image
          src={bgMobile}
          alt="Dashboard Mobile Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-65"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 backdrop-blur-[2px]" />
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} activeKey="analytics" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 overflow-y-auto max-h-screen">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#CFE362] text-black uppercase tracking-wider">
                  Distress Analytics
                </span>
                <span className="text-white/50 text-xs font-medium">Mayurbhanj Jurisdiction</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Agricultural Distress Intelligence Engine
              </h1>
              <p className="text-white/60 text-sm mt-1">
                Answering four critical signals: <em>Where is distress? How is it changing? Why is it happening? Who needs intervention?</em>
              </p>
            </div>

            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer shrink-0"
              title="Reset all filters to defaults"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

          {/* ═══════ GLOBAL FILTERS ═══════ */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-md">
            {/* District (Locked) */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 min-w-[150px]">
              <MapPin className="w-4 h-4 text-[#CFE362]" />
              <span className="text-white text-sm font-semibold">Mayurbhanj</span>
              <span className="text-white/40 text-xs ml-auto" title="Jurisdiction locked to authenticated officer">🔒</span>
            </div>

            {/* Block Filter */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 min-w-[140px]">
              <MapPin className="w-4 h-4 text-white/50" />
              <select
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                className="bg-transparent border-none text-white text-sm outline-none w-full cursor-pointer appearance-none"
              >
                <option value="ALL" className="bg-gray-900">All Blocks</option>
                <option value="Baripada" className="bg-gray-900">Baripada</option>
                <option value="Betnoti" className="bg-gray-900">Betnoti</option>
                <option value="Badasahi" className="bg-gray-900">Badasahi</option>
                <option value="Kuliana" className="bg-gray-900">Kuliana</option>
                <option value="Udala" className="bg-gray-900">Udala</option>
                <option value="Karanjia" className="bg-gray-900">Karanjia</option>
                <option value="Rairangpur" className="bg-gray-900">Rairangpur</option>
                <option value="Jashipur" className="bg-gray-900">Jashipur</option>
              </select>
            </div>

            {/* Crop Filter */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 min-w-[130px]">
              <Wheat className="w-4 h-4 text-white/50" />
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="bg-transparent border-none text-white text-sm outline-none w-full cursor-pointer appearance-none"
              >
                <option value="ALL" className="bg-gray-900">All Crops</option>
                <option value="Paddy" className="bg-gray-900">Paddy</option>
                <option value="Groundnut" className="bg-gray-900">Groundnut</option>
                <option value="Mustard" className="bg-gray-900">Mustard</option>
                <option value="Maize" className="bg-gray-900">Maize</option>
                <option value="Vegetables" className="bg-gray-900">Vegetables</option>
                <option value="Wheat" className="bg-gray-900">Wheat</option>
              </select>
            </div>

            {/* Risk Level Filter */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 min-w-[130px]">
              <Filter className="w-4 h-4 text-white/50" />
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="bg-transparent border-none text-white text-sm outline-none w-full cursor-pointer appearance-none"
              >
                <option value="ALL" className="bg-gray-900">All Risk Levels</option>
                <option value="high" className="bg-gray-900">High Risk (&gt;70)</option>
                <option value="moderate" className="bg-gray-900">Moderate (31–70)</option>
                <option value="low" className="bg-gray-900">Low Risk (≤30)</option>
              </select>
            </div>

            {/* Risk Factor Filter */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 min-w-[140px]">
              <CloudRain className="w-4 h-4 text-white/50" />
              <select
                value={riskFactor}
                onChange={(e) => setRiskFactor(e.target.value)}
                className="bg-transparent border-none text-white text-sm outline-none w-full cursor-pointer appearance-none"
              >
                <option value="ALL" className="bg-gray-900">All Risk Factors</option>
                <option value="weather" className="bg-gray-900">Weather / Rainfall</option>
                <option value="market" className="bg-gray-900">Market Prices</option>
                <option value="loan" className="bg-gray-900">Loan Proximity</option>
              </select>
            </div>

            {/* Time Range */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 min-w-[130px] ml-auto">
              <Calendar className="w-4 h-4 text-white/50" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent border-none text-white text-sm outline-none w-full cursor-pointer appearance-none"
              >
                <option value="7d" className="bg-gray-900">Last 7 Days</option>
                <option value="15d" className="bg-gray-900">Last 15 Days</option>
                <option value="30d" className="bg-gray-900">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* ═══════ §2: KPI CARDS ═══════ */}
          <KPICards data={overview.data} loading={overview.loading} />

          {/* ═══════ §3: DISTRESS TREND + §4: RISK DISTRIBUTION ═══════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DistressTrendChart data={trendPayload.data} insight={trendPayload.insight} loading={trendLoading} />
            </div>
            <div>
              <RiskDistribution data={riskDist.data} loading={riskDist.loading} />
            </div>
          </div>

          {/* ═══════ §5: DISTRESS FACTOR ANALYSIS ═══════ */}
          <DistressFactorsExpanded data={factors.data} loading={factors.loading} timeRange={timeRange} block={block} />

          {/* ═══════ §6: DISTRESS HEATMAP ═══════ */}
          <DistressHeatmap data={heatmap.data} loading={heatmap.loading} />

          {/* ═══════ §7 + §8: WEATHER + MARKET STRESS ═══════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeatherStressPanel data={weather.data} loading={weather.loading} />
            <MarketStressPanel data={marketPayload.data} insight={marketPayload.insight} loading={marketLoading} />
          </div>

          {/* ═══════ §9: COMBINED RISK ANALYSIS ═══════ */}
          <CombinedRiskMatrix data={combined.data} loading={combined.loading} />

          {/* ═══════ §10: PRIORITY INTERVENTION TABLE ═══════ */}
          <PriorityTable data={priority.data} loading={priority.loading} />
        </main>
      </div>
    </div>
  );
}
