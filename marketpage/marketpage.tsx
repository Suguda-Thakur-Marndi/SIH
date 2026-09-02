"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import bgLaptop from "./Image/Bg Laptop.png";
import bgPhone from "./Image/Bg phone.png";

import { CropMarketInfo, Market, MarketFilterState } from "./types";
import { REGISTERED_CROPS_MARKET } from "./mockData";
import {
  fetchMarketsByCropId,
  filterAndSortMarkets,
  findBestMarket,
} from "./marketService";

import { MarketHeader } from "./components/MarketHeader";
import { MarketSummaryCards } from "./components/MarketSummaryCards";
import { BestMarketRecommendation } from "./components/BestMarketRecommendation";
import { NearbyMandisTable } from "./components/NearbyMandisTable";
import { NetRealizationCalculator } from "./components/NetRealizationCalculator";
import { PriceTrendChart } from "./components/PriceTrendChart";
import { PriceComparisonChart } from "./components/PriceComparisonChart";
import { TransportSection } from "./components/TransportSection";
import { MSPComparisonSection } from "./components/MSPComparisonSection";
import { MarketDetailsModal } from "./components/MarketDetailsModal";
import { CompareMarketsModal } from "./components/CompareMarketsModal";
import { MarketLoadingSkeleton, MarketErrorState } from "./components/MarketStateViews";

import { useLanguage } from '@/lib/language-context';
export default function MarketPage() {
  const { t } = useLanguage();
  // ── 1. State ─────────────────────────────────────────────────────────────
  const [crops] = useState<CropMarketInfo[]>(REGISTERED_CROPS_MARKET);
  const [selectedCropId, setSelectedCropId] = useState<string>(REGISTERED_CROPS_MARKET[0].id);
  const [quantityQtl, setQuantityQtl] = useState<number>(REGISTERED_CROPS_MARKET[0].defaultQuantityQtl);

  const [rawMarkets, setRawMarkets] = useState<Market[]>([]);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(true);
  const [apiSource, setApiSource] = useState<string>("Data.gov.in (Agmarknet Live Mandi Network)");
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>("Today, 10:30 AM (IST)");

  // Filters & Sorting
  const [filters, setFilters] = useState<MarketFilterState>({
    searchQuery: "",
    maxDistanceKm: 500,
    onlyEnam: false,
    onlyAboveMsp: false,
    sortField: "netRealization",
    sortDirection: "desc",
  });

  // Modals
  const [activeMarketModal, setActiveMarketModal] = useState<Market | null>(null);
  const [isCompareAllOpen, setIsCompareAllOpen] = useState<boolean>(false);

  // Active section tab for quick jump
  const [activeTab, setActiveTab] = useState<"all" | "mandis" | "calculator" | "trends" | "logistics">("all");

  // ── 2. Current Crop ──────────────────────────────────────────────────────
  const currentCrop = useMemo(() => {
    return crops.find((c) => c.id === selectedCropId) || crops[0];
  }, [crops, selectedCropId]);

  // Sync quantity when crop changes
  const handleSelectCrop = (cropId: string) => {
    setSelectedCropId(cropId);
    const newCrop = crops.find((c) => c.id === cropId);
    if (newCrop) {
      setQuantityQtl(newCrop.defaultQuantityQtl);
    }
  };

  // ── 3. Data Loading ──────────────────────────────────────────────────────
  const loadMarketData = async (cropId: string, isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const response = await fetchMarketsByCropId(cropId);
      setRawMarkets(response.markets);
      setIsLiveApi(response.isLiveApi);
      setApiSource(response.source);
      setTotalRecords(response.totalRecords);
      setLastUpdatedTime(`Arrival Date: ${response.lastArrivalDate} (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} IST)`);
    } catch {
      setError("Failed to retrieve real-time mandi prices.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMarketData(selectedCropId);
  }, [selectedCropId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadMarketData(selectedCropId, true);
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      maxDistanceKm: 500,
      onlyEnam: false,
      onlyAboveMsp: false,
      sortField: "netRealization",
      sortDirection: "desc",
    });
  };

  // ── 4. Computed Data & Rankings ──────────────────────────────────────────
  const bestMarket = useMemo(() => findBestMarket(rawMarkets), [rawMarkets]);

  const lowestMarket = useMemo(() => {
    if (!rawMarkets || rawMarkets.length === 0) return null;
    return rawMarkets.reduce((low, cur) => {
      const lowNet = low.pricePerQuintal - low.transportCostPerQuintal;
      const curNet = cur.pricePerQuintal - cur.transportCostPerQuintal;
      return curNet < lowNet ? cur : low;
    }, rawMarkets[0]);
  }, [rawMarkets]);

  const marketsWithMetrics = useMemo(() => {
    return filterAndSortMarkets(rawMarkets, filters, quantityQtl);
  }, [rawMarkets, filters, quantityQtl]);

  return (
    <div
      className="relative min-h-screen font-sans pb-24 sm:pb-20 selection:bg-emerald-500 selection:text-white"
      style={{ color: "#1a2e1a" }}
    >
      {/* ── Fixed Background Layers (Responsive: Phone / Laptop from marketpage/Image) ── */}
      <div className="fixed inset-0 -z-20 block md:hidden bg-cover bg-bottom bg-no-repeat overflow-hidden pointer-events-none" aria-hidden="true">
        <Image
          src={bgPhone}
          alt="Market Phone Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom"
        />
      </div>

      <div className="fixed inset-0 -z-20 hidden md:block bg-cover bg-center bg-no-repeat overflow-hidden pointer-events-none" aria-hidden="true">
        <Image
          src={bgLaptop}
          alt="Market Desktop Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Semi-transparent agrarian tint for crisp readability */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ background: "rgba(240, 248, 235, 0.84)", backdropFilter: "blur(4px)" }}
        aria-hidden="true"
      />

      {/* ── Sticky Top Header ── */}
      <MarketHeader
        crops={crops}
        selectedCropId={selectedCropId}
        onSelectCrop={handleSelectCrop}
        lastUpdatedTime={lastUpdatedTime}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenCompareAll={() => setIsCompareAllOpen(true)}
        isLiveApi={isLiveApi}
        apiSource={apiSource}
        totalRecords={totalRecords}
      />

      {/* ── Main Container (Mobile Padding Optimized) ── */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 space-y-4 sm:space-y-6">
        {/* Quick Nav Filter Tabs for Mobile & Desktop Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-0.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full sm:w-auto">
            {[
              { id: "all", label: t("all_insights", "🌟 All Insights") },
              { id: "mandis", label: t("nearby_mandis", "🏪 Nearby Mandis") },
              { id: "calculator", label: t("profit_estimator", "💰 Profit Estimator") },
              { id: "trends", label: t("price_trends", "📈 Price Trends") },
              { id: "logistics", label: t("logistics", "🚚 Logistics") },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  activeTab === tab.id
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "bg-white/85 text-zinc-700 hover:bg-white border border-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] sm:text-xs text-zinc-600 font-medium flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
            <span>{t('registered_plot', 'Registered Plot:')}{' '}</span>
            <span className="font-bold text-zinc-900 bg-white/85 px-2 py-0.5 rounded-md border border-zinc-300 truncate max-w-[200px] sm:max-w-none">
              Plot #4, Baripada, Mayurbhanj
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && <MarketLoadingSkeleton />}

        {/* Error State */}
        {!loading && error && (
          <MarketErrorState onRetry={() => loadMarketData(selectedCropId)} errorMessage={error} />
        )}

        {/* Main Content when loaded */}
        {!loading && !error && (
          <>
            {/* 1. Market Summary KPI Cards (2x2 Compact Grid on Mobile) */}
            <MarketSummaryCards
              currentCrop={currentCrop}
              markets={rawMarkets}
              onOpenMarket={(m) => setActiveMarketModal(m)}
            />

            {/* 2. Best Market Recommendation Hero */}
            {(activeTab === "all" || activeTab === "mandis") && (
              <BestMarketRecommendation
                currentCrop={currentCrop}
                bestMarket={bestMarket}
                lowestMarket={lowestMarket}
                quantityQtl={quantityQtl}
                onOpenMarket={(m) => setActiveMarketModal(m)}
                onOpenCompareAll={() => setIsCompareAllOpen(true)}
              />
            )}

            {/* 3. Nearby Mandis Table & Mobile Cards */}
            {(activeTab === "all" || activeTab === "mandis") && (
              <NearbyMandisTable
                marketsWithMetrics={marketsWithMetrics}
                filters={filters}
                onFilterChange={(f) => setFilters(f)}
                onOpenMarket={(m) => setActiveMarketModal(m)}
                onResetFilters={handleResetFilters}
              />
            )}

            {/* 4. Batch Net Realization & Profit Estimator */}
            {(activeTab === "all" || activeTab === "calculator") && (
              <NetRealizationCalculator
                currentCrop={currentCrop}
                bestMarket={bestMarket}
                lowestMarket={lowestMarket}
                quantityQtl={quantityQtl}
                onQuantityChange={(q) => setQuantityQtl(q)}
                marketsWithMetrics={marketsWithMetrics}
              />
            )}

            {/* 5. Gross Price vs Net Realization Comparison Bars */}
            {activeTab === "all" && (
              <PriceComparisonChart
                currentCrop={currentCrop}
                marketsWithMetrics={marketsWithMetrics}
                onOpenMarket={(m) => setActiveMarketModal(m)}
              />
            )}

            {/* 6. Price Trend Historical Chart */}
            {(activeTab === "all" || activeTab === "trends") && (
              <PriceTrendChart
                currentCrop={currentCrop}
                markets={rawMarkets}
              />
            )}

            {/* 7. Logistics & Transport Section */}
            {(activeTab === "all" || activeTab === "logistics") && (
              <TransportSection
                markets={rawMarkets}
                quantityQtl={quantityQtl}
              />
            )}

            {/* 8. Government MSP Benchmark Comparison */}
            {activeTab === "all" && (
              <MSPComparisonSection
                currentCrop={currentCrop}
                marketsWithMetrics={marketsWithMetrics}
              />
            )}
          </>
        )}
      </main>

      {/* ── Mobile Quick Action Bottom Navigation Bar ── */}
      <div className="fixed bottom-3 left-3 right-3 sm:hidden z-30 bg-zinc-900/95 backdrop-blur-xl text-white rounded-2xl p-1.5 shadow-2xl border border-zinc-700/80 flex items-center justify-around text-[10px] font-bold">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-1.5 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
            activeTab === "all" ? "bg-emerald-700 text-white shadow-xs" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <span className="text-sm">🌟</span>
          <span>{t("overview", "Overview")}</span>
        </button>
        <button
          onClick={() => setActiveTab("mandis")}
          className={`flex-1 py-1.5 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
            activeTab === "mandis" ? "bg-emerald-700 text-white shadow-xs" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <span className="text-sm">🏪</span>
          <span>{t("mandis", "Mandis")}</span>
        </button>
        <button
          onClick={() => setActiveTab("calculator")}
          className={`flex-1 py-1.5 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
            activeTab === "calculator" ? "bg-emerald-700 text-white shadow-xs" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <span className="text-sm">💰</span>
          <span>{t("calculator", "Calculator")}</span>
        </button>
        <button
          onClick={() => setIsCompareAllOpen(true)}
          className="flex-1 py-1.5 rounded-xl flex flex-col items-center gap-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs"
        >
          <span className="text-sm">⚖️</span>
          <span>Compare</span>
        </button>
      </div>

      {/* ── Modals ── */}
      {/* Mandi Details Modal */}
      <MarketDetailsModal
        market={activeMarketModal}
        currentCrop={currentCrop}
        quantityQtl={quantityQtl}
        isOpen={Boolean(activeMarketModal)}
        onClose={() => setActiveMarketModal(null)}
      />

      {/* Compare All Markets Side-by-Side Modal */}
      <CompareMarketsModal
        currentCrop={currentCrop}
        marketsWithMetrics={marketsWithMetrics}
        quantityQtl={quantityQtl}
        isOpen={isCompareAllOpen}
        onClose={() => setIsCompareAllOpen(false)}
        onSelectMarket={(m) => setActiveMarketModal(m)}
      />
    </div>
  );
}
