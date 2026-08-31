'use client';

import React from 'react';
import { Sprout } from 'lucide-react';

interface LogoProps {
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ showTagline = false }: LogoProps) {
  return (
    <div className="flex flex-col items-center text-center select-none mb-1">
      {/* Clean Brand Mark */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
          <Sprout className="w-4 h-4" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
          Smart Crop
        </span>
      </div>

      {showTagline && (
        <p className="text-xs text-slate-500 font-normal">
          Agricultural Intelligence Platform
        </p>
      )}
    </div>
  );
}

