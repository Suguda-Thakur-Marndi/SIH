import React from 'react';
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton';

/**
 * Farmer Dashboard skeleton.
 * Matches the glassmorphism hero layout with stat cards and farm telemetry.
 */
export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen font-sans text-[#1B1E19]">
      {/* Background placeholder */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#f4fcdc] via-[#f7f8f4] to-[#f8dac0]" />

      {/* Nav Header Skeleton */}
      <SkeletonGroup
        label="Loading navigation"
        className="fixed top-0 left-0 right-0 z-[999] w-full flex justify-center"
      >
        <nav
          className="relative w-full pt-4 pb-6 px-6 md:px-12"
          style={{
            borderRadius: '0 0 50% 50% / 0 0 36px 36px',
            background: 'linear-gradient(105deg, rgba(206, 235, 150, 0.92) 0%, rgba(247, 248, 244, 0.96) 48%, rgba(248, 218, 192, 0.92) 100%)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-8 h-8 rounded-full bg-[#1B1E19]" />
              <Skeleton className="h-5 w-24 rounded bg-[#1B1E19]" />
            </div>
            {/* Nav links */}
            <div className="flex items-center gap-4 bg-white/70 p-2 px-5 rounded-full border border-black/6">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="w-11 h-11 rounded-full bg-[#1B1E19]" />
              ))}
            </div>
            {/* Action icons */}
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="w-11 h-11 rounded-full bg-[#1B1E19]" />
              ))}
            </div>
          </div>
        </nav>
      </SkeletonGroup>

      {/* Hero Section Skeleton */}
      <SkeletonGroup
        label="Loading dashboard hero"
        className="relative z-10 min-h-screen flex flex-col justify-center items-center px-6 md:px-12 max-w-7xl mx-auto pt-24 pb-16 text-center"
      >
        <div className="max-w-3xl w-full flex flex-col items-center">
          <Skeleton className="h-14 w-[420px] max-w-full rounded-xl bg-[#1B1E19] mb-3" />
          <Skeleton className="h-12 w-[360px] max-w-full rounded-xl bg-[#1B1E19] mb-6" />
          <Skeleton className="h-5 w-[320px] max-w-full rounded bg-[#1B1E19] mb-10" />
          <div className="flex gap-4 flex-wrap justify-center">
            <Skeleton className="h-14 w-44 rounded-full bg-[#1B1E19]" />
            <Skeleton className="h-14 w-48 rounded-full bg-black/10" />
            <Skeleton className="h-14 w-52 rounded-full bg-black/10" />
          </div>
        </div>
      </SkeletonGroup>

      {/* Quick Insights 2x2 Grid Skeleton */}
      <SkeletonGroup
        label="Loading farm stats"
        className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-14 lg:gap-20 w-fit mx-auto">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-full sm:w-80 md:w-90 lg:w-105 rounded-4xl p-8 lg:p-10 space-y-6"
              style={{
                background: 'linear-gradient(135deg, rgba(244, 252, 220, 0.75) 0%, rgba(255, 255, 255, 0.65) 50%, rgba(230, 248, 180, 0.60) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.85)',
              }}
            >
              <div className="flex items-center gap-4 border-b border-black/6 pb-5">
                <Skeleton className="h-14 w-14 rounded-2xl bg-[#1B1E19]" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-28 rounded bg-[#1B1E19]" />
                  <Skeleton className="h-3 w-20 rounded bg-[#1B1E19]" />
                </div>
              </div>
              <Skeleton className="h-16 w-24 rounded bg-[#1B1E19]" />
              <Skeleton className="h-4 w-36 rounded bg-[#1B1E19]" />
            </div>
          ))}
        </div>
      </SkeletonGroup>

      {/* Farm Dashboard Grid Skeleton */}
      <SkeletonGroup
        label="Loading farm telemetry"
        className="relative z-20 py-24 px-6 md:px-12 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
          {/* Left column */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Farm overview card */}
            <div
              className="rounded-[28px] p-6 space-y-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(244,252,230,0.60) 100%)',
                border: '1px solid rgba(255,255,255,0.85)',
              }}
            >
              <div className="flex items-center gap-3.5 mb-6">
                <Skeleton className="w-13 h-13 rounded-full bg-[#1B1E19]" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 rounded bg-[#1B1E19]" />
                  <Skeleton className="h-3 w-40 rounded bg-[#1B1E19]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-black/4 p-2.5 rounded-xl border border-black/6 space-y-2">
                    <Skeleton className="h-3 w-16 rounded bg-[#1B1E19]" />
                    <Skeleton className="h-4 w-20 rounded bg-[#1B1E19]" />
                  </div>
                ))}
              </div>
            </div>
            {/* Crop health card */}
            <div
              className="rounded-[28px] p-6 space-y-5"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(242,252,232,0.60) 100%)',
                border: '1px solid rgba(255,255,255,0.85)',
              }}
            >
              <Skeleton className="h-6 w-32 rounded bg-[#1B1E19]" />
              <div className="rounded-2xl p-4 border border-[#D6F24B]/40 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24 rounded bg-[#1B1E19]" />
                  <Skeleton className="h-4 w-28 rounded bg-[#1B1E19]" />
                </div>
                <Skeleton className="h-16 w-full rounded bg-[#1B1E19]" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-2.5 w-full rounded-full bg-[#1B1E19]" />
                <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-amber-400/30">
                  <Skeleton className="h-11 w-11 rounded-xl bg-[#1B1E19]" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32 rounded bg-[#1B1E19]" />
                    <Skeleton className="h-3 w-40 rounded bg-[#1B1E19]" />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24 rounded bg-[#1B1E19]" />
                  <Skeleton className="h-6 w-20 rounded-full bg-[#D6F24B]" />
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Distress Risk */}
          <div
            className="md:col-span-8 rounded-4xl p-8 space-y-8"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,244,236,0.65) 45%, rgba(246,252,235,0.65) 100%)',
              border: '1px solid rgba(255,255,255,0.9)',
            }}
          >
            <div className="flex justify-between items-start">
              <Skeleton className="h-8 w-64 rounded bg-[#1B1E19]" />
              <Skeleton className="h-7 w-24 rounded-full bg-red-500/15" />
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 flex flex-col items-center justify-center">
                <Skeleton className="w-70 h-70 rounded-full bg-[#1B1E19]" />
              </div>
              <div className="flex-1 space-y-4">
                <Skeleton className="h-3 w-36 rounded bg-[#1B1E19]" />
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center bg-black/3 border border-black/6 px-4 py-3.5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-xl bg-[#1B1E19]" />
                      <Skeleton className="h-4 w-28 rounded bg-[#1B1E19]" />
                    </div>
                    <Skeleton className="h-4 w-16 rounded bg-[#1B1E19]" />
                  </div>
                ))}
                <Skeleton className="h-14 w-full rounded-full bg-[#D6F24B]" />
              </div>
            </div>
          </div>
        </div>

        {/* Recommended actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="rounded-3xl p-6 flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(238,252,218,0.65) 100%)',
                border: '1px solid rgba(255,255,255,0.85)',
              }}
            >
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-2xl bg-[#1B1E19]" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded bg-[#1B1E19]" />
                  <Skeleton className="h-3 w-44 rounded bg-[#1B1E19]" />
                </div>
              </div>
              <Skeleton className="h-5 w-5 rounded bg-black/10" />
            </div>
          ))}
        </div>
      </SkeletonGroup>
    </div>
  );
}
