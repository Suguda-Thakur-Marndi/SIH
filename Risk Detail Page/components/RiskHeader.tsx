import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import { DataSaverToggle } from '@/components/DataSaverToggle';
import { useLanguage } from '@/lib/language-context';

interface RiskHeaderProps {
  overallScore: number;
  cropName?: string;
}

export default function RiskHeader({ overallScore, cropName = 'Paddy (Swarna MTU 7029)' }: RiskHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex items-center justify-between relative z-[999] overflow-visible">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 hover:bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] text-sm font-semibold text-emerald-950 hover:text-emerald-900 transition-all transform hover:-translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-700" />
          <span>{t('back', 'Back to Dashboard')}</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <DataSaverToggle />
          <LanguageSelector variant="glass" />
          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/70 backdrop-blur-xl text-emerald-900 border border-emerald-500/30 shadow-sm hidden sm:flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-600 -ml-3.5"></span>
            {t('live_status', 'Live Field Telemetry: Active')}
          </span>
        </div>
      </div>

      {/* Hero Glassmorphic Card */}
      <div className="relative rounded-[32px] p-6 md:p-8 bg-white/45 backdrop-blur-2xl border border-white/80 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] overflow-hidden transition-all">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-lime-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/10 backdrop-blur-md border border-emerald-600/20 text-xs font-bold tracking-wider text-emerald-950 uppercase">
              <ShieldAlert className="w-4 h-4 text-emerald-700" />
              <span>{t('distress_intelligence', 'Crop Distress Risk Intelligence')}</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t('risk_breakdown', 'Farm Distress Risk Breakdown')}
            </h1>
            
            <p className="text-slate-700 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
              {t('hero_subtitle', 'AI-powered crop monitoring, distress risk scoring, and personalized farming guidance.')} (<span className="text-emerald-800 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300/60">{cropName}</span>)
            </p>
          </div>

          {/* Distress Index Badge */}
          <div className="flex flex-col items-center justify-center p-6 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/90 shadow-lg text-center transform hover:scale-[1.02] transition-transform">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
              {t('distress_score', 'Overall Distress Index')}
            </span>
            <div className="text-5xl md:text-6xl font-black text-emerald-900 tracking-tight flex items-baseline">
              {overallScore}
              <span className="text-2xl text-slate-500 font-semibold ml-1">/100</span>
            </div>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-900 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              {t('critical_distress', 'HIGH DISTRESS LEVEL')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
