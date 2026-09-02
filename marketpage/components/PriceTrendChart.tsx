"use client";

import React, { useState } from "react";
import { CropMarketInfo, Market, TimeFrame, PricePoint } from "../types";
import { formatCurrency } from "../marketService";
import { useLanguage } from '@/lib/language-context';
import { useBandwidth } from '@/lib/bandwidth-context';

interface PriceTrendChartProps {
  currentCrop: CropMarketInfo;
  markets: Market[];
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  currentCrop,
  markets,
}) => {
  const { t } = useLanguage();
  const { isLiteMode } = useBandwidth();
  const [selectedMarketId, setSelectedMarketId] = useState<string>(
    markets[0]?.id || ""
  );
  const [timeframe, setTimeframe] = useState<TimeFrame>("30D");
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);

  const activeMarket = markets.find((m) => m.id === selectedMarketId) || markets[0];
  if (!activeMarket) return null;

  const points: PricePoint[] = activeMarket.priceHistory[timeframe] || [];
  
  // Calculate price stats
  const prices = points.map((p) => p.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 2000;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 2500;
  const padding = (maxPrice - minPrice) * 0.15 || 50;
  const chartMin = Math.floor((minPrice - padding) / 10) * 10;
  const chartMax = Math.ceil((maxPrice + padding) / 10) * 10;
  const priceRange = chartMax - chartMin || 1;

  // 30-day stats
  const currentPrice = activeMarket.pricePerQuintal;
  const oldPrice = activeMarket.thirtyDayAgoPrice || activeMarket.yesterdayPrice;
  const priceDiff = currentPrice - oldPrice;
  const priceDiffPct = oldPrice > 0 ? ((priceDiff / oldPrice) * 100).toFixed(1) : "0.0";
  const trendDirection = priceDiff > 0 ? "Increasing" : priceDiff < 0 ? "Softening" : "Stable";

  // SVG Chart Geometry
  const width = 680;
  const height = 240;
  const padLeft = 45;
  const padRight = 15;
  const padTop = 20;
  const padBottom = 30;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getCoordinates = (p: PricePoint, idx: number) => {
    const x = padLeft + (idx / Math.max(1, points.length - 1)) * chartW;
    const y = padTop + chartH - ((p.price - chartMin) / priceRange) * chartH;
    return { x, y };
  };

  const polylinePoints = points
    .map((p, i) => {
      const { x, y } = getCoordinates(p, i);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = points.length > 0
    ? `${getCoordinates(points[0], 0).x},${padTop + chartH} ${polylinePoints} ${
        getCoordinates(points[points.length - 1], points.length - 1).x
      },${padTop + chartH}`
    : "";

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/85 backdrop-blur-xl border border-emerald-800/15 p-4 sm:p-7 shadow-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 sm:pb-5 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-1.5">
              <span>📈</span> {t('mandi_price_trend', 'Mandi Price Trend')}
            </h2>
            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2 py-0.5 rounded-full border border-teal-300">
              {timeframe} {t('view', 'View')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
            Historical mandi rates and momentum.
          </p>
        </div>

        {/* Mandi & Timeframe Switcher on Mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Mandi Selector */}
          <select
            value={selectedMarketId}
            onChange={(e) => setSelectedMarketId(e.target.value)}
            className="text-xs font-bold bg-zinc-100 text-zinc-800 py-1.5 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {markets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({formatCurrency(m.pricePerQuintal)})
              </option>
            ))}
          </select>

          {/* Timeframe Buttons */}
          <div className="inline-flex rounded-xl bg-zinc-100 p-1 border border-zinc-300 justify-between">
            {(["7D", "30D", "3M", "6M"] as TimeFrame[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`flex-1 sm:flex-none px-2.5 py-1 rounded-lg text-xs font-bold transition-all text-center ${
                  timeframe === tf
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart + Stats Section */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center">
        {/* Left: SVG Chart Canvas or Lite Mode Table */}
        <div className="lg:col-span-8 bg-zinc-900 text-white p-3 sm:p-4 rounded-2xl border border-zinc-800 shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-emerald-400 font-bold flex items-center gap-1 truncate text-[11px] sm:text-xs">
              🌾 {activeMarket.name} {isLiteMode && <span className="text-[10px] bg-amber-500/20 text-amber-300 font-medium px-1.5 py-0.5 rounded ml-1">Lite Table View</span>}
            </span>
            <span className="text-zinc-400 text-[10px] sm:text-[11px] shrink-0">
              MSP: <span className="text-amber-300 font-bold">{formatCurrency(currentCrop.msp)}</span>
            </span>
          </div>

          {isLiteMode ? (
            <div className="w-full max-h-[220px] overflow-y-auto border border-zinc-800 rounded-xl bg-zinc-950/80 p-2 text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-zinc-400 border-b border-zinc-800 pb-1 text-[11px]">
                    <th className="py-1">Date</th>
                    <th className="py-1 text-right">Modal Price</th>
                    <th className="py-1 text-right">vs MSP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {points.slice(-8).reverse().map((p, idx) => {
                    const diff = p.price - currentCrop.msp;
                    return (
                      <tr key={idx} className="hover:bg-zinc-800/50">
                        <td className="py-1 text-zinc-300 text-[11px]">{p.date}</td>
                        <td className="py-1 text-right font-bold text-emerald-400">₹{p.price}</td>
                        <td className={`py-1 text-right font-medium text-[10px] ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {diff >= 0 ? `+₹${diff}` : `-₹${Math.abs(diff)}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="w-full overflow-hidden">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto select-none"
                style={{ maxHeight: "220px" }}
              >
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines & Y-axis labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const yVal = padTop + chartH * pct;
                  const priceLabel = Math.round(chartMax - pct * priceRange);
                  return (
                    <g key={i}>
                      <line
                        x1={padLeft}
                        y1={yVal}
                        x2={width - padRight}
                        y2={yVal}
                        stroke="rgba(255,255,255,0.08)"
                        strokeDasharray={pct === 0.5 ? "0" : "4 4"}
                      />
                      <text
                        x={padLeft - 6}
                        y={yVal + 3}
                        textAnchor="end"
                        fill="#71717a"
                        fontSize="9.5"
                        fontWeight="bold"
                      >
                        ₹{priceLabel}
                      </text>
                    </g>
                  );
                })}

                {/* Govt MSP Reference line if in view */}
                {currentCrop.msp >= chartMin && currentCrop.msp <= chartMax && (
                  <g>
                    {(() => {
                      const mspY = padTop + chartH - ((currentCrop.msp - chartMin) / priceRange) * chartH;
                      return (
                        <>
                          <line
                            x1={padLeft}
                            y1={mspY}
                            x2={width - padRight}
                            y2={mspY}
                            stroke="#f59e0b"
                            strokeWidth="1.5"
                            strokeDasharray="6 4"
                          />
                          <text
                            x={width - padRight - 5}
                            y={mspY - 4}
                            textAnchor="end"
                            fill="#fbbf24"
                            fontSize="9"
                            fontWeight="bold"
                          >
                            Govt MSP: ₹{currentCrop.msp}
                          </text>
                        </>
                      );
                    })()}
                  </g>
                )}

                {/* Shaded Area Under Curve */}
                {areaPoints && (
                  <polygon points={areaPoints} fill="url(#trendGradient)" />
                )}

                {/* Main Line */}
                {polylinePoints && (
                  <polyline
                    points={polylinePoints}
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points */}
                {points.map((p, i) => {
                  const { x, y } = getCoordinates(p, i);
                  const isHovered = hoveredPoint?.date === p.date;
                  return (
                    <g
                      key={i}
                      onClick={() => setHoveredPoint(isHovered ? null : p)}
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 6 : 3.5}
                        fill={isHovered ? "#fbbf24" : "#10b981"}
                        stroke="#064e3b"
                        strokeWidth="2"
                        className="transition-all"
                      />
                      {/* X-axis label */}
                      {(points.length <= 8 || i % Math.ceil(points.length / 5) === 0) && (
                        <text
                          x={x}
                          y={height - 8}
                          textAnchor="middle"
                          fill="#a1a1aa"
                          fontSize="9"
                        >
                          {p.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {/* Active Hover / Tap Point Tooltip */}
          {!isLiteMode && hoveredPoint && (
            <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-zinc-800/95 border border-emerald-500/50 text-white text-[11px] px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5 pointer-events-none">
              <span className="text-zinc-400">{hoveredPoint.label}:</span>
              <span className="font-black text-emerald-400">{formatCurrency(hoveredPoint.price)}/qtl</span>
            </div>
          )}
        </div>

        {/* Right: Trend Metrics & Insights */}
        <div className="lg:col-span-4 space-y-2.5 sm:space-y-3.5">
          {/* Card 1: 30-day Price Movement */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-50 border border-zinc-200">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
              {t('trend_movement_30d', '30-Day Trend Movement')}
            </span>

            <div className="mt-1.5 sm:mt-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-xs text-zinc-400 block">{t('current_price', 'Current Price')}{' '}</span>
                <span className="text-base sm:text-lg font-black text-zinc-900">
                  {formatCurrency(currentPrice)}/qtl
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] sm:text-xs text-zinc-400 block">{t('days_ago_30', '30 Days Ago')}</span>
                <span className="text-xs sm:text-sm font-semibold text-zinc-600">
                  {formatCurrency(oldPrice)}/qtl
                </span>
              </div>
            </div>

            <div className="mt-2.5 pt-2.5 border-t border-zinc-200 flex items-center justify-between">
              <span className="text-[11px] sm:text-xs text-zinc-600 font-medium">{t('net_shift', 'Net Shift:')}{' '}</span>
              <span
                className={`inline-flex items-center text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-md ${
                  priceDiff >= 0
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-rose-100 text-rose-800 border border-rose-300"
                }`}
              >
                {priceDiff >= 0 ? `+${formatCurrency(priceDiff)} (+${priceDiffPct}%)` : `−${formatCurrency(Math.abs(priceDiff))} (${priceDiffPct}%)`}
              </span>
            </div>
          </div>

          {/* Card 2: Trend Status */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/80 border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                {t('market_momentum', 'Market Momentum')}
              </span>
              <span className="text-[10px] sm:text-xs font-black text-emerald-950 bg-emerald-200 px-2 py-0.5 rounded">
                {trendDirection}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-950 mt-1 leading-relaxed">
              Wholesale arrivals at <span className="font-semibold">{activeMarket.name}</span> maintain a steady price corridor.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
