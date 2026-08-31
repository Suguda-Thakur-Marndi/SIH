"use client";

import React from "react";
import Link from "next/link";

interface InsuranceHeaderProps {
  onBack?: () => void;
}

export const InsuranceHeader: React.FC<InsuranceHeaderProps> = ({ onBack }) => {
  return (
    <header className="w-full sticky top-0 z-30 px-3 sm:px-6 py-3 transition-all select-none">
      <div className="max-w-7xl mx-auto rounded-2xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-md px-4 sm:px-6 py-3.5 flex items-center gap-3 text-gray-900">
        {onBack ? (
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl bg-gray-100/90 hover:bg-gray-200/90 text-gray-700 text-xs font-semibold tracking-wide transition active:scale-95 flex items-center gap-1 border border-gray-200"
          >
            <span>←</span>
            <span>Back</span>
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-xl bg-gray-100/90 hover:bg-gray-200/90 text-gray-700 text-xs font-semibold tracking-wide transition active:scale-95 flex items-center gap-1 border border-gray-200"
          >
            <span>←</span>
            <span>Back</span>
          </Link>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-sm flex-shrink-0">
            🛡️
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-emerald-950 tracking-tight leading-tight">
              Crop Insurance
            </h1>
            <p className="text-[11px] text-emerald-800/80 hidden sm:block">
              Protecting your crop against distress‑related loss
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
