import React from 'react';
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton';

/**
 * Market page route-level skeleton.
 * Combines a header skeleton with the existing MarketLoadingSkeleton content structure.
 */
export default function MarketSkeleton() {
  return (
    <div className="relative min-h-screen font-sans pb-24 sm:pb-20" style={{ color: '#1a2e1a' }}>
      {/* Background placeholder */}
      <div className="fixed inset-0 -z-10" style={{ background: 'rgba(240, 248, 235, 0.84)' }} />

      <SkeletonGroup
        label="Loading market intelligence"
        className="space-y-4"
      >
        {/* Sticky Header skeleton */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-zinc-200 px-3 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-3">
              {/* Left: Back + Title */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-xl bg-zinc-800" />
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-52 rounded bg-zinc-800" />
                  <Skeleton className="h-3 w-36 rounded bg-zinc-600" />
                </div>
              </div>
              {/* Right: Controls */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-28 rounded-xl bg-zinc-600" />
                <Skeleton className="h-9 w-9 rounded-xl bg-zinc-600" />
                <Skeleton className="h-9 w-24 rounded-xl bg-zinc-600" />
              </div>
            </div>
            {/* Crop selector pills */}
            <div className="flex items-center gap-2 mt-3 overflow-hidden">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-9 w-24 rounded-xl bg-zinc-600 shrink-0" />
              ))}
            </div>
          </div>
        </div>

        {/* Main content skeleton */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 space-y-4 sm:space-y-6">
          {/* Quick nav tabs */}
          <div className="flex items-center gap-1.5 overflow-hidden py-0.5">
            {['🌟 All Insights', '🏪 Nearby Mandis', '💰 Profit Estimator', '📈 Price Trends', '🚚 Logistics'].map((label, i) => (
              <Skeleton key={i} className="h-8 rounded-xl bg-zinc-600 shrink-0" style={{ width: `${90 + i * 10}px` }} />
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 rounded-2xl bg-white/60 border border-zinc-200 p-5 space-y-3">
                <Skeleton className="h-4 w-24 rounded bg-zinc-700" />
                <Skeleton className="h-8 w-32 rounded bg-zinc-800" />
                <Skeleton className="h-3 w-20 rounded bg-zinc-600" />
              </div>
            ))}
          </div>

          {/* Hero Recommendation */}
          <div className="h-64 rounded-3xl bg-zinc-900/60 border border-zinc-800 p-8 space-y-4">
            <Skeleton className="h-6 w-48 rounded-full bg-zinc-700" />
            <Skeleton className="h-10 w-72 rounded bg-zinc-600" />
            <div className="grid grid-cols-3 gap-4 pt-4">
              <Skeleton className="h-16 rounded-xl bg-zinc-800" />
              <Skeleton className="h-16 rounded-xl bg-zinc-800" />
              <Skeleton className="h-16 rounded-xl bg-zinc-800" />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-3xl bg-white/60 border border-zinc-200 p-6 space-y-4">
            <Skeleton className="h-6 w-40 rounded bg-zinc-700" />
            <Skeleton className="h-10 w-full rounded-xl bg-zinc-500" />
            <div className="space-y-2 pt-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-14 w-full rounded-xl bg-zinc-400" />
              ))}
            </div>
          </div>

          {/* Calculator + Chart sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-white/60 border border-zinc-200 p-6 space-y-4">
              <Skeleton className="h-6 w-44 rounded bg-zinc-700" />
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-xl bg-zinc-400" />
                <Skeleton className="h-10 w-full rounded-xl bg-zinc-400" />
                <Skeleton className="h-10 w-full rounded-xl bg-zinc-400" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl bg-emerald-700" />
              <Skeleton className="h-20 w-full rounded-xl bg-zinc-300" />
            </div>
            <div className="rounded-3xl bg-white/60 border border-zinc-200 p-6 space-y-4">
              <Skeleton className="h-6 w-36 rounded bg-zinc-700" />
              <Skeleton className="h-64 w-full rounded-xl bg-zinc-400" />
            </div>
          </div>
        </main>
      </SkeletonGroup>
    </div>
  );
}
