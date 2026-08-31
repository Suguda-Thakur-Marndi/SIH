import React from 'react';
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton';

/**
 * Authentication page skeleton.
 * Matches the glass-card login layout on the botanical background.
 */
export default function AuthenticationSkeleton() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center lg:justify-start p-4 lg:py-6 lg:pl-28 xl:pl-36 overflow-x-hidden font-sans">
      {/* Background placeholder */}
      <div className="fixed inset-0 z-0 bg-[#0c2017]">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-emerald-950/45 to-transparent" />
      </div>

      {/* Glass card skeleton */}
      <div className="relative z-10 w-full max-w-md sm:max-w-[440px] my-auto">
        <SkeletonGroup
          label="Loading authentication page"
          className="relative rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-slate-950/30 p-6 sm:p-7 space-y-4"
        >
          {/* Logo + Language row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full bg-emerald-900" />
              <Skeleton className="h-5 w-24 rounded bg-slate-700" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg bg-slate-600" />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <Skeleton className="h-6 w-32 mx-auto rounded bg-slate-700" />
            <Skeleton className="h-3 w-48 mx-auto rounded bg-slate-500" />
          </div>

          {/* Google button */}
          <Skeleton className="h-10 w-full rounded-xl bg-slate-500" />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-px flex-1 bg-slate-400" />
            <Skeleton className="h-3 w-6 rounded bg-slate-400" />
            <Skeleton className="h-px flex-1 bg-slate-400" />
          </div>

          {/* Method switcher */}
          <Skeleton className="h-9 w-full rounded-lg bg-slate-400" />

          {/* Form fields */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24 rounded bg-slate-500" />
              <Skeleton className="h-10 w-full rounded-xl bg-slate-400" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16 rounded bg-slate-500" />
                <Skeleton className="h-3 w-12 rounded bg-slate-500" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl bg-slate-400" />
            </div>
          </div>

          {/* Submit button */}
          <Skeleton className="h-10 w-full rounded-xl bg-emerald-800" />

          {/* Demo shortcuts */}
          <div className="flex justify-between pt-2">
            <Skeleton className="h-3 w-24 rounded bg-slate-400" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-12 rounded bg-slate-500" />
              <Skeleton className="h-3 w-12 rounded bg-slate-500" />
              <Skeleton className="h-3 w-10 rounded bg-slate-500" />
            </div>
          </div>

          {/* Footer link */}
          <Skeleton className="h-3 w-48 mx-auto rounded bg-slate-400" />
        </SkeletonGroup>

        {/* Footer */}
        <div className="mt-3 text-center">
          <Skeleton className="h-3 w-44 mx-auto rounded bg-white/20" />
        </div>
      </div>
    </main>
  );
}
