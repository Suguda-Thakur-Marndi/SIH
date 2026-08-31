import React from 'react';
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton';

/**
 * Officer Map page skeleton.
 * Matches the layout with sidebar, header, and large map container
 * with controls and legend placeholders.
 */
export default function MapSkeleton() {
  return (
    <div className="relative min-h-screen font-sans text-[#1A1A1A]">
      {/* Background placeholder */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-gray-100 via-white to-gray-100">
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[3px]" />
      </div>

      {/* Layout */}
      <SkeletonGroup
        label="Loading district distress map"
        className="relative z-10 flex flex-col md:flex-row min-h-screen p-3 md:p-5 gap-4"
      >
        {/* Sidebar skeleton */}
        <div className="hidden md:flex w-[72px] flex-col items-center py-6 gap-6 bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-lg">
          <Skeleton className="w-10 h-10 rounded-xl bg-[#1A1A1A]" />
          <div className="space-y-4 mt-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="w-10 h-10 rounded-xl bg-[#1A1A1A]" />
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-sm">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl bg-[#1A1A1A] md:hidden" />
              <Skeleton className="h-5 w-44 rounded bg-[#1A1A1A]" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full bg-[#1A1A1A]" />
              <Skeleton className="h-9 w-9 rounded-full bg-[#1A1A1A]" />
            </div>
          </div>

          {/* Map container skeleton */}
          <div className="w-full h-[650px] bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/60 relative overflow-hidden">
            {/* Map placeholder with subtle grid */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            {/* Top controls bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-40 rounded-xl bg-[#1A1A1A]" />
                <Skeleton className="h-10 w-32 rounded-xl bg-[#1A1A1A]" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-lg bg-[#1A1A1A]" />
                <Skeleton className="h-9 w-9 rounded-lg bg-[#1A1A1A]" />
              </div>
            </div>

            {/* Layer toggles (left side) */}
            <div className="absolute top-20 left-4 space-y-2 z-10">
              {['Overall Distress', 'Weather Stress', 'Market Volatility', 'Loan Overdue'].map((_, i) => (
                <Skeleton key={i} className="h-9 w-36 rounded-xl bg-[#1A1A1A]" />
              ))}
            </div>

            {/* Legend (bottom right) */}
            <div className="absolute bottom-4 right-4 bg-white/90 rounded-xl p-3 space-y-2 z-10 border border-gray-200">
              <Skeleton className="h-4 w-16 rounded bg-[#1A1A1A]" />
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <Skeleton className="h-3 w-6 rounded bg-[#1A1A1A]" />
                    <Skeleton className="h-2 w-8 rounded bg-[#1A1A1A]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Zoom controls (bottom left) */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-1 z-10">
              <Skeleton className="h-8 w-8 rounded-lg bg-[#1A1A1A]" />
              <Skeleton className="h-8 w-8 rounded-lg bg-[#1A1A1A]" />
            </div>

            {/* Center loading indicator */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full bg-[#1A1A1A]" />
              <Skeleton className="h-4 w-48 rounded bg-[#1A1A1A]" />
            </div>
          </div>
        </div>
      </SkeletonGroup>
    </div>
  );
}
