"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import Image from 'next/image';
import bgDesktop from '@/Government equipment schemes/img/1(1).png';
import bgMobile from '@/Agriculture officer dashboard/img/3.png';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Calendar, MapPin, Filter, CloudRain, Wheat, RefreshCw } from 'lucide-react';
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
  const { t } = useLanguage();

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
    <div className="relative min-h-screen w-full flex overflow-hidden font-sans text-[#1A1A1A] bg-[#F2F2EF]">
      {/* Background Images with White Transparent Blur Overlay */}
      <div className="fixed inset-0 z-0 hidden md:block">
        <Image
          src={bgDesktop}
          alt="Dashboard Desktop Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/55 to-white/85 backdrop-blur-[3px]" />
      </div>
      <div className="fixed inset-0 z-0 block md:hidden">
        <Image
          src={bgMobile}
          alt="Dashboard Mobile Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/55 to-white/85 backdrop-blur-[3px]" />
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} activeKey="analytics" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 overflow-y-auto max-h-screen">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Header Banner - White Frosted Glass */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 md:p-8 shadow-xl text-[#1A1A1A]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#1A1A1A] text-[#CFE362] uppercase tracking-wider shadow-sm">
                  {t('analytics', 'Distress Analytics')}
                </span>
                <span className="text-slate-600 text-xs font-bold bg-white/80 px-2.5 py-0.5 rounded-full border border-black/5">
                  {t('mayurbhanj_district', 'Mayurbhanj Jurisdiction')}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                {t('distress_intelligence_engine', 'Agricultural Distress Intelligence Engine')}
              </h1>
              <p className="text-slate-700 text-sm font-medium mt-1">
                {t('analytics_subtitle', 'Answering four critical signals: Where is distress? How is it changing? Why is it happening? Who needs intervention?')}
              </p>
            </div>

            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1A1A1A] hover:bg-black text-[#CFE362] text-xs font-bold shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
              title="Reset all filters to defaults"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('reset_filters', 'Reset Filters')}</span>
            </button>
          </div>

          {/* ═══════ GLOBAL FILTERS - White Frosted Glass ═══════ */}
          <div className="flex flex-wrap items-center gap-3 p-4 md:p-5 glass bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-xl text-[#1A1A1A]">
            {/* District (Locked) */}
            <div className="flex items-center gap-2 bg-white/90 border border-black/10 rounded-2xl px-3.5 py-2 min-w-[150px] shadow-2xs">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span className="text-slate-900 text-sm font-bold">{t('mayurbhanj', 'Mayurbhanj')}</span>
              <span className="text-slate-400 text-xs ml-auto" title="Jurisdiction locked to authenticated officer">🔒</span>
            </div>

            {/* Block Filter */}
            <div className="flex items-center gap-2 bg-white/90 border border-black/10 rounded-2xl px-3 py-2 min-w-[140px] shadow-2xs">
              <MapPin className="w-4 h-4 text-slate-500" />
              <select
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                className="bg-transparent border-none text-slate-900 text-sm font-bold outline-none w-full cursor-pointer appearance-none"
              >
                <option value="ALL" className="bg-white text-slate-900">{t('all_blocks', 'All Blocks')}</option>
                <option value="Baripada" className="bg-white text-slate-900">Baripada</option>
                <option value="Betnoti" className="bg-white text-slate-900">Betnoti</option>
                <option value="Badasahi" className="bg-white text-slate-900">Badasahi</option>
                <option value="Kuliana" className="bg-white text-slate-900">Kuliana</option>
                <option value="Udala" className="bg-white text-slate-900">Udala</option>
                <option value="Karanjia" className="bg-white text-slate-900">Karanjia</option>
                <option value="Rairangpur" className="bg-white text-slate-900">Rairangpur</option>
                <option value="Jashipur" className="bg-white text-slate-900">Jashipur</option>
              </select>
            </div>

            {/* Crop Filter */}
            <div className="flex items-center gap-2 bg-white/90 border border-black/10 rounded-2xl px-3 py-2 min-w-[130px] shadow-2xs">
              <Wheat className="w-4 h-4 text-slate-500" />
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="bg-transparent border-none text-slate-900 text-sm font-bold outline-none w-full cursor-pointer appearance-none"
              >
                <option value="ALL" className="bg-white text-slate-900">{t('all_crops', 'All Crops')}</option>
                <option value="Paddy" className="bg-white text-slate-900">{t('paddy', 'Paddy')}</option>
                <option value="Groundnut" className="bg-white text-slate-900">{t('groundnut', 'Groundnut')}</option>
                <option value="Mustard" className="bg-white text-slate-900">{t('mustard', 'Mustard')}</option>
                <option value="Maize" className="bg-white text-slate-900">{t('maize', 'Maize')}</option>
                <option value="Vegetables" className="bg-white text-slate-900">{t('vegetables', 'Vegetables')}</option>
                <option value="Wheat" className="bg-white text-slate-900">{t('wheat', 'Wheat')}</option>
              </select>
            </div>

            {/* Risk Level Filter */}
            <div className="flex items-center gap-2 bg-white/90 border border-black/10 rounded-2xl px-3 py-2 min-w-[130px] shadow-2xs">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="bg-transparent border-none text-slate-900 text-sm font-bold outline-none w-full cursor-pointer appearance-none"
              >
                <option value="ALL" className="bg-white text-slate-900">{t('all_risk_levels', 'All Risk Levels')}</option>
                <option value="high" className="bg-white text-slate-900">{t('high_risk_farmers', 'High Risk (>70)')}</option>
                <option value="moderate" className="bg-white text-slate-900">{t('medium_risk_farmers', 'Moderate (31–70)')}</option>
                <option value="low" className="bg-white text-slate-900">{t('low_risk_farmers', 'Low Risk (≤30)')}</option>
              </select>
            </div>

            {/* Risk Factor Filter */}
            <div className="flex items-center gap-2 bg-white/90 border border-black/10 rounded-2xl px-3 py-2 min-w-[140px] shadow-2xs">
              <CloudRain className="w-4 h-4 text-slate-500" />
              <select
                value={riskFactor}
                onChange={(e) => setRiskFactor(e.target.value)}
                className="bg-transparent border-none text-slate-900 text-sm font-bold outline-none w-full cursor-pointer appearance-none"
              >
                <option value="ALL" className="bg-white text-slate-900">{t('all_risk_factors', 'All Risk Factors')}</option>
                <option value="weather" className="bg-white text-slate-900">{t('weather_rainfall', 'Weather / Rainfall')}</option>
                <option value="market" className="bg-white text-slate-900">{t('market_prices', 'Market Prices')}</option>
                <option value="loan" className="bg-white text-slate-900">{t('loan_proximity', 'Loan Proximity')}</option>
              </select>
            </div>

            {/* Time Range */}
            <div className="flex items-center gap-2 bg-white/90 border border-black/10 rounded-2xl px-3 py-2 min-w-[130px] ml-auto shadow-2xs">
              <Calendar className="w-4 h-4 text-slate-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent border-none text-slate-900 text-sm font-bold outline-none w-full cursor-pointer appearance-none"
              >
                <option value="7d" className="bg-white text-slate-900">{t('last_7_days', 'Last 7 Days')}</option>
                <option value="15d" className="bg-white text-slate-900">{t('last_15_days', 'Last 15 Days')}</option>
                <option value="30d" className="bg-white text-slate-900">{t('last_30_days', 'Last 30 Days')}</option>
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
