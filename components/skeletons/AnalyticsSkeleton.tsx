import React from 'react';
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton';

/**
 * Officer Analytics page skeleton.
 * Matches the dark-themed dashboard with all 10 analytics sections.
 * Each section gets a structural skeleton resembling the final layout.
 */
export default function AnalyticsSkeleton() {
  return (
    <div className="relative min-h-screen w-full flex overflow-hidden font-sans text-white bg-black">
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95" />

      {/* Sidebar skeleton */}
      <div className="hidden md:flex w-[72px] flex-col items-center py-6 gap-6 z-10">
        <Skeleton className="w-10 h-10 rounded-xl bg-white" />
        <div className="space-y-4 mt-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="w-10 h-10 rounded-xl bg-white" />
          ))}
        </div>
      </div>

      {/* Main content */}
      <SkeletonGroup
        label="Loading analytics dashboard"
        className="flex-1 flex flex-col min-w-0 z-10 overflow-y-auto max-h-screen"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:px-8">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl bg-white md:hidden" />
            <Skeleton className="h-5 w-40 rounded bg-white" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full bg-white" />
            <Skeleton className="h-9 w-9 rounded-full bg-white" />
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Header Banner */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-32 rounded-full bg-[#CFE362]" />
                  <Skeleton className="h-4 w-36 rounded bg-white" />
                </div>
                <Skeleton className="h-8 w-96 max-w-full rounded bg-white" />
                <Skeleton className="h-4 w-[480px] max-w-full rounded bg-white" />
              </div>
              <Skeleton className="h-9 w-28 rounded-xl bg-white" />
            </div>
          </div>

          {/* §1: Global Filters */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-md">
            {[150, 140, 130, 130, 140, 130].map((w, i) => (
              <Skeleton key={i} className="h-10 rounded-xl bg-white" style={{ minWidth: w }} />
            ))}
          </div>

          {/* §2: KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { bg: 'bg-red-500/20', border: 'border-red-500/30' },
              { bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
              { bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
              { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            ].map((kpi, i) => (
              <div key={i} className={`rounded-2xl p-5 border backdrop-blur-md bg-black/40 ${kpi.border}`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28 rounded bg-white" />
                    <Skeleton className="h-9 w-20 rounded bg-white" />
                    {i === 0 && <Skeleton className="h-4 w-32 rounded bg-white" />}
                  </div>
                  <Skeleton className={`w-12 h-12 rounded-full ${kpi.bg}`} />
                </div>
              </div>
            ))}
          </div>

          {/* §3 + §4: Distress Trend + Risk Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Distress Trend */}
            <div className="lg:col-span-2 bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="space-y-1">
                  <Skeleton className="h-6 w-36 rounded bg-white" />
                  <Skeleton className="h-4 w-56 rounded bg-white" />
                </div>
                <Skeleton className="h-8 w-48 rounded-full bg-blue-500/10" />
              </div>
              {/* Chart area */}
              <div className="w-full h-72 rounded-xl relative overflow-hidden">
                <Skeleton className="absolute inset-0 rounded-xl bg-white" />
                {/* Axis lines */}
                <div className="absolute bottom-0 left-8 right-4 h-px bg-white/10" />
                <div className="absolute top-4 bottom-0 left-8 w-px bg-white/10" />
              </div>
            </div>
            {/* Risk Distribution */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
              <Skeleton className="h-6 w-36 rounded bg-white" />
              <Skeleton className="h-4 w-48 rounded bg-white" />
              <div className="space-y-4 pt-2">
                {['bg-red-500', 'bg-amber-500', 'bg-emerald-500'].map((color, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20 rounded bg-white" />
                      <Skeleton className="h-4 w-12 rounded bg-white" />
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                      <Skeleton className={`h-full rounded-full ${color}`} style={{ width: `${70 - i * 20}%`, opacity: 0.3 }} />
                    </div>
                  </div>
                ))}
              </div>
              <Skeleton className="h-10 w-full rounded-xl bg-white" />
            </div>
          </div>

          {/* §5: Distress Factors */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-6 w-48 rounded bg-white" />
                <Skeleton className="h-4 w-64 rounded bg-white" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl bg-white" />
                    <Skeleton className="h-5 w-28 rounded bg-white" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded bg-white" />
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <Skeleton className="h-full rounded-full bg-white" style={{ width: `${60 - i * 10}%` }} />
                  </div>
                  <Skeleton className="h-8 w-full rounded-lg bg-white" />
                </div>
              ))}
            </div>
          </div>

          {/* §6: Heatmap */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-6 w-40 rounded bg-white" />
              <Skeleton className="h-4 w-56 rounded bg-white" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                  <Skeleton className="h-4 w-20 rounded bg-white" />
                  <Skeleton className="h-8 w-12 rounded bg-white" />
                  <Skeleton className="h-3 w-24 rounded bg-white" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-3 w-8 rounded bg-white" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-4 w-8 rounded bg-white" />
                ))}
              </div>
              <Skeleton className="h-3 w-8 rounded bg-white" />
            </div>
          </div>

          {/* §7 + §8: Weather + Market Stress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(panel => (
              <div key={panel} className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded bg-white" />
                    <Skeleton className="h-6 w-36 rounded bg-white" />
                  </div>
                  <Skeleton className="h-4 w-48 rounded bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 space-y-2">
                      <Skeleton className="h-3 w-20 rounded bg-white" />
                      <Skeleton className="h-6 w-14 rounded bg-white" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-48 w-full rounded-xl bg-white" />
              </div>
            ))}
          </div>

          {/* §9: Combined Risk Matrix */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded bg-white" />
              <Skeleton className="h-6 w-48 rounded bg-white" />
            </div>
            <Skeleton className="h-4 w-72 rounded bg-white" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded bg-white" />
                    <Skeleton className="h-4 w-20 rounded bg-white" />
                  </div>
                  <Skeleton className="h-8 w-12 rounded bg-white" />
                </div>
              ))}
            </div>
          </div>

          {/* §10: Priority Table */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-6 w-48 rounded bg-white" />
                <Skeleton className="h-4 w-64 rounded bg-white" />
              </div>
              <Skeleton className="h-9 w-28 rounded-xl bg-white" />
            </div>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-7 gap-4 px-4 py-3 bg-white/5 rounded-xl">
              {['w-20', 'w-24', 'w-16', 'w-16', 'w-20', 'w-16', 'w-24'].map((w, i) => (
                <Skeleton key={i} className={`h-4 ${w} rounded bg-white`} />
              ))}
            </div>
            {/* Table rows */}
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-7 gap-4 px-4 py-4 bg-white/[0.02] rounded-xl border border-white/5">
                <Skeleton className="h-4 w-28 rounded bg-white" />
                <Skeleton className="h-4 w-20 rounded bg-white" />
                <Skeleton className="h-4 w-14 rounded bg-white" />
                <Skeleton className="h-6 w-12 rounded-full bg-red-500/20" />
                <Skeleton className="h-4 w-20 rounded bg-white" />
                <Skeleton className="h-4 w-20 rounded bg-white" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg bg-white" />
                  <Skeleton className="h-8 w-8 rounded-lg bg-white" />
                  <Skeleton className="h-8 w-8 rounded-lg bg-white" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </SkeletonGroup>
    </div>
  );
}
