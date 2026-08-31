import React from 'react';
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton';

/**
 * AI Chat page skeleton.
 * Matches the chat interface layout: nav, header banner, suggestion chips,
 * conversation container with initial message, and input bar.
 */
export default function AIChatSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/40 to-lime-50 text-slate-900 p-3 sm:p-6 md:p-8 flex flex-col justify-between">
      <SkeletonGroup
        label="Loading AI Agronomist Chat"
        className="max-w-5xl mx-auto w-full space-y-4 flex-1 flex flex-col"
      >
        {/* Navigation Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-xl bg-emerald-800" />
            <Skeleton className="h-9 w-32 rounded-xl bg-teal-700" />
            <Skeleton className="h-9 w-36 rounded-xl bg-amber-700" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-36 rounded-xl bg-amber-600" />
            <Skeleton className="h-7 w-24 rounded-full bg-emerald-700" />
          </div>
        </div>

        {/* Header Banner */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/80 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Skeleton className="w-12 h-12 rounded-2xl bg-emerald-700" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-72 rounded bg-slate-700" />
                <Skeleton className="h-3 w-80 rounded bg-slate-500" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3 w-14 rounded bg-slate-400" />
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-8 w-16 rounded-xl bg-slate-500" />
              ))}
            </div>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex gap-2 overflow-hidden pb-1">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="shrink-0 h-9 rounded-2xl bg-slate-600" style={{ width: `${80 + i * 20}px` }} />
          ))}
        </div>

        {/* Chat Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-white/80 shadow-md flex-1 flex flex-col justify-between min-h-[420px] max-h-[55vh]">
          {/* Initial AI message skeleton */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 max-w-[85%]">
              <Skeleton className="w-8 h-8 rounded-2xl bg-emerald-600 shrink-0" />
              <div className="flex-1 space-y-3 p-4 rounded-3xl bg-slate-50 border border-slate-200/90 rounded-tl-xs">
                <Skeleton className="h-4 w-3/4 rounded bg-slate-600" />
                <Skeleton className="h-4 w-full rounded bg-slate-500" />
                <Skeleton className="h-4 w-5/6 rounded bg-slate-500" />
                <div className="pt-2 space-y-2">
                  <Skeleton className="h-3 w-2/3 rounded bg-slate-400" />
                  <Skeleton className="h-3 w-3/4 rounded bg-slate-400" />
                  <Skeleton className="h-3 w-1/2 rounded bg-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Input bar skeleton */}
          <div className="pt-4 border-t border-slate-200 flex items-center gap-2">
            <Skeleton className="p-3.5 w-12 h-12 rounded-2xl bg-emerald-700" />
            <Skeleton className="flex-1 h-12 rounded-2xl bg-slate-400" />
            <Skeleton className="w-12 h-12 rounded-2xl bg-emerald-700" />
          </div>
        </div>
      </SkeletonGroup>
    </div>
  );
}
