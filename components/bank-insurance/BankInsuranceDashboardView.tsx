"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  FileText, 
  Plus, 
  LogOut
} from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/language-context';
import { smartCropAuth } from '@/lib/smartcrop-auth';

export default function BankInsuranceDashboardView() {
  const { t } = useLanguage();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/bank-insurance/dashboard')
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
    <div className="relative min-h-screen text-[#1A1A1A] p-4 md:p-8 font-sans selection:bg-emerald-500 selection:text-white">
      {/* ── Fixed background layer from Crop Monitoring ── */}
      <div
        className="fixed inset-0 -z-20 block md:hidden bg-cover bg-bottom bg-no-repeat"
        style={{ backgroundImage: "url('/bg-phone.png')" }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 -z-20 hidden md:block bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg-laptop.png')" }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 -z-10"
        style={{ background: "rgba(240, 248, 235, 0.84)", backdropFilter: "blur(4px)" }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between relative z-[999] overflow-visible">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-black/10 shadow-sm text-sm font-medium hover:bg-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('farmer_profile', 'Farmer Portal')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSelector variant="glass" />
            <Link
              href="/bank-portal/facilities/add"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1A1A1A] text-[#CFE362] text-xs font-bold shadow-sm hover:bg-black transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('create_facility', 'Add Credit Facility')}</span>
            </Link>
            <button
              onClick={handleSignOut}
              title="Sign Out to Authentication"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold shadow-sm transition hover:scale-105 cursor-pointer"
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
              <span className="text-xs font-bold text-[#CFE362] uppercase tracking-wider">Institutional Banking & Insurance Console</span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Agricultural Credit & PMFBY Portfolio</h1>
              <p className="text-neutral-300 text-xs md:text-sm max-w-2xl">
                Comprehensive portfolio oversight for Kisan Credit Card (KCC) loans, interest subvention tracking, localized distress risk exposure, and PMFBY crop insurance claim management.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 text-center">
                <div className="text-2xl font-bold text-[#CFE362]">₹42.6 Cr</div>
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Total Disbursed</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 text-center">
                <div className="text-2xl font-bold text-emerald-400">1.8%</div>
                <div className="text-[10px] text-neutral-400 uppercase font-semibold">Portfolio NPA Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Exposure & Insurance Coverage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-[24px] bg-white/80 backdrop-blur-md border border-black/5 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Active KCC Borrowers</span>
            <div className="text-3xl font-bold text-neutral-900">8,940</div>
            <p className="text-xs text-neutral-600">Active smallholder credit lines across Mayurbhanj branches</p>
          </div>

          <div className="p-6 rounded-[24px] bg-white/80 backdrop-blur-md border border-black/5 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Insured Crop Land</span>
            <div className="text-3xl font-bold text-neutral-900">34,200 <span className="text-base font-normal text-neutral-500">Acres</span></div>
            <p className="text-xs text-emerald-700 font-medium">92% coverage under PMFBY Kharif season</p>
          </div>

          <div className="p-6 rounded-[24px] bg-white/80 backdrop-blur-md border border-black/5 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">High Risk Distress Exposure</span>
            <div className="text-3xl font-bold text-red-600">4,800 <span className="text-base font-normal text-neutral-500">Acres</span></div>
            <p className="text-xs text-neutral-600">Estimated potential dry-spell claim exposure: ₹3.4 Cr</p>
          </div>

        </div>

        {/* Recent Applications Table */}
        <div className="bg-white/80 backdrop-blur-md rounded-[28px] p-6 border border-black/5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-neutral-700" />
              Recent Loan & Insurance Applications
            </h2>
            <Link
              href="/bank-portal/facilities"
              className="text-xs font-semibold text-neutral-600 hover:text-black transition"
            >
              Manage Credit Facilities &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentApplications?.map((app: any) => (
              <div key={app.id} className="p-4 rounded-2xl bg-white/90 border border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-900">{app.farmer}</span>
                    <span className="text-xs text-neutral-400 font-medium">({app.id})</span>
                  </div>
                  <div className="text-xs text-neutral-600 font-medium">{app.type}</div>
                </div>

                <div className="flex items-center gap-4 justify-between md:justify-end">
                  <span className="text-sm font-bold text-neutral-900">{app.amount}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    app.status === 'Approved' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
