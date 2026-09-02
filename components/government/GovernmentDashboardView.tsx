"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, Tractor, FileText, ArrowLeft, ExternalLink, LogOut
} from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/language-context';
import { smartCropAuth } from '@/lib/smartcrop-auth';

export default function GovernmentDashboardView() {
  const { t } = useLanguage();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/government/dashboard')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
      })
      .catch(console.error);
  }, []);

  const handleSignOut = async () => {
    try {
      await smartCropAuth.signOut();
    } catch {}
    router.push('/authentication');
  };

  return (
    <div className="min-h-screen bg-[#F2F2EF] text-[#1A1A1A] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 relative z-[999] overflow-visible">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-black/10 shadow-sm text-sm font-medium hover:bg-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('dashboard', 'Farmer Portal')}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSelector variant="light" />
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1A1A1A] text-[#CFE362] flex items-center gap-1.5 shadow-sm">
              <Building2 className="w-3.5 h-3.5" />
              State Agriculture Department
            </span>
            <button
              onClick={handleSignOut}
              title="Sign Out to Authentication"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold shadow-sm transition hover:scale-105 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="bg-[#1A1A1A] text-white rounded-[28px] p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#CFE362] uppercase tracking-wider">Department of Agriculture & Farmers&apos; Empowerment</span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Government Administration & CHC Hub</h1>
              <p className="text-neutral-300 text-xs md:text-sm max-w-2xl">
                Real-time governance dashboard for Custom Hiring Centers (CHC), agricultural machinery allocation, scheme disbursement, and farmer service requests across Mayurbhanj district.
              </p>
            </div>

            {/* Metric counters */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 text-center">
                <div className="text-2xl font-bold text-[#CFE362]">18,450</div>
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Registered Farmers</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 text-center">
                <div className="text-2xl font-bold text-white">₹24.8 Cr</div>
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Subsidy Disbursed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment & CHC Hub Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-[28px] p-6 border border-black/5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Tractor className="w-5 h-5 text-neutral-700" />
                Custom Hiring Center (CHC) Equipment Allocation
              </h2>
              <p className="text-xs text-neutral-500">Live inventory across 28 block hiring hubs</p>
            </div>
            <Link
              href="/schemes"
              className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-neutral-900 text-white hover:bg-black transition flex items-center gap-1"
            >
              <span>View Schemes & Subsidies</span>
              <ExternalLink className="w-3 h-3 text-[#CFE362]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {data?.equipmentInventory?.map((eq: any) => (
              <div key={eq.id} className="p-4 rounded-2xl bg-white/90 border border-black/5 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">{eq.category}</span>
                  <span className="text-xs font-bold text-emerald-700">{eq.availableUnits} Available</span>
                </div>
                <h3 className="text-sm font-bold text-neutral-900">{eq.name}</h3>
                <div className="text-xs text-neutral-500 font-medium">Daily Rate: {eq.dailyRate}</div>
                <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#1A1A1A] h-full rounded-full" 
                    style={{ width: `${Math.round((eq.availableUnits / eq.totalUnits) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Government Schemes & Utilization */}
        <div className="bg-white/80 backdrop-blur-md rounded-[28px] p-6 border border-black/5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-neutral-700" />
              State & Central Scheme Performance
            </h2>
            <Link
              href="/schemes"
              className="text-xs font-semibold text-neutral-600 hover:text-black transition"
            >
              View All Schemes &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {data?.schemesSummary?.map((sch: any) => (
              <div key={sch.id} className="p-4 rounded-2xl bg-white/90 border border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-neutral-900">{sch.name}</h3>
                  <div className="text-xs text-neutral-500 font-medium">Beneficiaries: {sch.beneficiaries} farmers enrolled</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs font-bold text-neutral-900">{sch.fundUtilizedPct}% Utilized</div>
                    <div className="text-[10px] text-neutral-400 font-medium">Budget allocation</div>
                  </div>
                  <div className="w-24 bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full" 
                      style={{ width: `${sch.fundUtilizedPct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
