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
    <div className="w-full h-[650px] glass bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/60 flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-bold text-[#1A1A1A]">Loading Spatial District Distress Map...</p>
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
