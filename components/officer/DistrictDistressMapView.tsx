'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import bgDesktop from '@/Crop Monitoring page/Image/Bg Laptop.png';
import bgMobile from '@/Crop Monitoring page/Image/Bg phone.png';
import dynamic from 'next/dynamic';
import Sidebar from '@/Agriculture officer dashboard/components/Sidebar';
import Header from '@/Agriculture officer dashboard/components/Header';

// Dynamically import map component to disable SSR and guarantee client WebGL rendering
const DistrictDistressMap = dynamic(() => import('./DistrictDistressMap'), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading Spatial District Distress Map"
      className="w-full h-[650px] bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/60 relative overflow-hidden animate-pulse shadow-xl"
    >
      {/* Map grid background pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Top Search & Filter Bar Skeleton */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="h-11 w-full rounded-2xl bg-slate-900/10 backdrop-blur-md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-11 w-28 rounded-2xl bg-slate-900/10 backdrop-blur-md" />
          <div className="h-11 w-11 rounded-2xl bg-slate-900/10 backdrop-blur-md" />
        </div>
      </div>

      {/* Layer Toggles Left Skeleton */}
      <div className="absolute top-20 left-4 space-y-2 z-10 hidden sm:block">
        {['Overall Distress', 'Weather Stress', 'Market Volatility', 'Loan Overdue'].map((_, i) => (
          <div key={i} className="h-9 w-40 rounded-xl bg-slate-900/10 backdrop-blur-md" />
        ))}
      </div>

      {/* Center Spinner & Status */}
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 z-10">
        <div className="w-12 h-12 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin shadow-lg" />
        <p className="text-sm font-bold text-slate-800 bg-white/70 px-4 py-1.5 rounded-full border border-white/80 shadow-xs">
          Loading Spatial District Distress Map & Layers...
        </p>
      </div>

      {/* Legend Bottom Right Skeleton */}
      <div className="absolute bottom-4 right-4 bg-white/90 rounded-2xl p-3.5 space-y-2 z-10 border border-slate-200 shadow-md">
        <div className="h-3 w-20 rounded bg-slate-900/15" />
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-3 w-7 rounded bg-slate-900/10" />
              <div className="h-1.5 w-7 rounded-full bg-slate-900/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Zoom Controls Bottom Left Skeleton */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 z-10">
        <div className="h-9 w-9 rounded-xl bg-slate-900/10 backdrop-blur-md" />
        <div className="h-9 w-9 rounded-xl bg-slate-900/10 backdrop-blur-md" />
      </div>
      <span className="sr-only">Loading Spatial District Distress Map</span>
    </div>
  ),
});

export default function DistrictDistressMapView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="relative min-h-screen font-sans text-[#1A1A1A]">
      {/* 1. Full-page fixed background image from Crop Monitoring page/Image */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Desktop / Laptop Background */}
        <div className="hidden md:block absolute inset-0">
          <Image
            src={bgDesktop}
            alt="District Distress Map Background Desktop"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        {/* Mobile Background */}
        <div className="block md:hidden absolute inset-0">
          <Image
            src={bgMobile}
            alt="District Distress Map Background Mobile"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        {/* White Blur Transparent Overlay */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[3px]" />
      </div>

      {/* 2. Main Page Layout */}
      <div className="relative z-10 flex flex-col md:flex-row min-h-screen p-3 md:p-5 gap-4">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} activeKey="distress_map" />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <Header onToggleSidebar={toggleSidebar} />

          <main className="flex-1 overflow-auto space-y-4 pr-1">
            <DistrictDistressMap initialDistrict="Mayurbhanj" />
          </main>
        </div>
      </div>
    </div>
  );
}
