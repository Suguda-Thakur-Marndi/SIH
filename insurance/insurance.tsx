"use client";

import React, { useState } from "react";
import { InsuranceBackground } from "./components/InsuranceBackground";
import { InsuranceHeader } from "./components/InsuranceHeader";
import { RegistrationStepper } from "./components/RegistrationStepper";
import { BankSchemeList } from "./components/BankSchemeList";
import { SchemeDetails } from "./components/SchemeDetails";
import { mockFarmer, mockRisk, initialDocuments, mockApplication, mockBankSchemes } from "./data/mockInsurance";
import { DocumentChecklist } from "./components/DocumentChecklist";
import { FarmerProfile, InsuranceState, DocumentItem, BankScheme } from "./types/insurance";

/**
 * Smart Crop Insurance Portal — Wise.com Design Architecture (Bright Light Theme)
 * Features a 50/50 Dual Stage Split in a luminous, clean, airy aesthetic:
 * - Left Stage: Bold Brand Narrative, Live Distress Telemetry (81/100), Ground Truth & Trust Pillars
 * - Right Stage: The Interactive Conversion & Subsidy Calculation Widget (Light Wise-style)
 * 100% Transparent 4K background (BG_3.png) with crystal-clear white frosted glass surfaces.
 */
export default function InsurancePage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<InsuranceState>("NOT_REGISTERED");
  const [farmer, setFarmer] = useState<FarmerProfile>(mockFarmer);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [activeView, setActiveView] = useState<"dashboard" | "stepper" | "schemes" | "schemeDetails">("dashboard");
  const [selectedScheme, setSelectedScheme] = useState<BankScheme | null>(null);
  const [schemes, setSchemes] = useState<BankScheme[]>(mockBankSchemes);
  const [isEditingParcel, setIsEditingParcel] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showLossReported, setShowLossReported] = useState(false);

  React.useEffect(() => {
    // Use mock data for development – no API calls
    setFarmer(mockFarmer);
    setSchemes(mockBankSchemes);
    setLoading(false);
  }, []);

  return (
    loading ? (
      <div className="relative min-h-screen font-sans text-gray-900 overflow-hidden">
        {/* Skeleton Background — matches real page gradient */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-white to-indigo-50" />
        <div className="fixed inset-0 -z-10 bg-white/30" />

        {/* Skeleton Header */}
        <header className="w-full sticky top-0 z-30 px-3 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto rounded-2xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-md px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
            {/* Left: back + icon + title */}
            <div className="flex items-center gap-3">
              <div className="w-20 h-8 rounded-xl bg-gray-200 animate-pulse" />
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-200 animate-pulse flex-shrink-0" />
                <div className="space-y-1.5">
                  <div className="w-28 h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="w-44 h-3 bg-gray-100 rounded animate-pulse hidden sm:block" />
                </div>
              </div>
            </div>
            {/* Right: TTS button */}
            <div className="w-24 h-8 rounded-xl bg-gray-200 animate-pulse" />
          </div>
        </header>

        {/* Skeleton Main */}
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

            {/* LEFT STAGE Skeleton */}
            <div className="lg:col-span-6 space-y-8">
              {/* Tag row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="w-28 h-7 rounded-full bg-emerald-100 animate-pulse" />
                <div className="w-40 h-7 rounded-full bg-gray-100 animate-pulse" />
              </div>

              {/* Headline */}
              <div className="space-y-3">
                <div className="w-full h-10 bg-gray-200 rounded-2xl animate-pulse" />
                <div className="w-5/6 h-10 bg-gray-200 rounded-2xl animate-pulse" />
                <div className="w-full h-5 bg-gray-100 rounded animate-pulse" />
                <div className="w-4/5 h-5 bg-gray-100 rounded animate-pulse" />
              </div>

              {/* Telemetry Card */}
              <div className="rounded-3xl bg-white/90 border border-white p-6 sm:p-7 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200/80">
                  <div className="w-40 h-5 bg-gray-200 rounded animate-pulse" />
                  <div className="w-32 h-7 rounded-full bg-rose-100 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="w-16 h-4 bg-rose-100 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="w-full h-4 bg-gray-100 rounded animate-pulse" />
              </div>

              {/* Trust pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 rounded-2xl bg-white/90 border border-white shadow-sm space-y-2">
                    <div className="w-20 h-5 bg-emerald-100 rounded animate-pulse" />
                    <div className="w-full h-3 bg-gray-100 rounded animate-pulse" />
                    <div className="w-3/4 h-3 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT STAGE Skeleton */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-white/95 border border-white p-7 sm:p-9 shadow-2xl space-y-6">
                {/* Widget header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200/90">
                  <div className="space-y-1.5">
                    <div className="w-36 h-3 bg-gray-100 rounded animate-pulse" />
                    <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="w-28 h-8 rounded-full bg-amber-100 animate-pulse" />
                </div>

                {/* Pre-filled farm profile */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-36 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-20 h-4 bg-emerald-100 rounded animate-pulse" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-7 rounded-lg bg-white border border-gray-200 animate-pulse" style={{ width: `${60 + i * 12}px` }} />
                    ))}
                  </div>
                </div>

                {/* Financial subsidy box */}
                <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="w-48 h-4 bg-emerald-100 rounded animate-pulse" />
                    <div className="w-20 h-5 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="w-52 h-4 bg-emerald-100 rounded animate-pulse" />
                    <div className="w-16 h-4 bg-emerald-200 rounded animate-pulse" />
                  </div>
                  <div className="pt-3 border-t border-emerald-200 flex justify-between items-center">
                    <div className="space-y-1.5">
                      <div className="w-36 h-4 bg-emerald-100 rounded animate-pulse" />
                      <div className="w-44 h-3 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="w-20 h-9 bg-amber-100 rounded animate-pulse" />
                  </div>
                </div>

                {/* Document checklist skeleton */}
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-5 h-5 rounded bg-gray-200 animate-pulse flex-shrink-0" />
                      <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="w-12 h-4 bg-gray-100 rounded animate-pulse" />
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <div className="pt-2">
                  <div className="w-full h-14 rounded-2xl bg-emerald-200 animate-pulse" />
                </div>

                {/* Bottom triggers */}
                <div className="pt-3 border-t border-gray-200 flex items-center justify-between gap-3">
                  <div className="w-36 h-4 bg-rose-100 rounded animate-pulse" />
                  <div className="w-28 h-4 bg-gray-100 rounded animate-pulse" />
                </div>

                {/* Claim support box */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                  <div className="w-full h-3 bg-gray-100 rounded animate-pulse" />
                  <div className="w-4/5 h-3 bg-gray-100 rounded animate-pulse" />
                  <div className="w-32 h-4 bg-emerald-100 rounded animate-pulse" />
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    ) : (
      <div className="relative min-h-screen font-sans selection:bg-emerald-600 selection:text-white text-gray-900 pb-16">
        {/* 4K Transparent Bright Background (BG_3.png / BG_2.png) */}
        <InsuranceBackground />

      {/* Foreground Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Header Navigation */}
        <InsuranceHeader
          onBack={activeView !== "dashboard" ? () => setActiveView("dashboard") : undefined}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-12">
          {activeView === "stepper" && (
            /* Registration Stepper & Status Timeline per PRD §9 & §11 */
            <div className="max-w-4xl mx-auto">
              <RegistrationStepper
                farmer={farmer}
                documents={documents}
                application={mockApplication}
                onComplete={() => setStatus("APPLICATION_PENDING")}
                onCancel={() => setActiveView("dashboard")}
              />
            </div>
          )}

          {activeView === "schemes" && (
            <div className="max-w-6xl w-full mx-auto">
              <BankSchemeList
                schemes={schemes}
                onSelectScheme={(scheme) => {
                  setSelectedScheme(scheme);
                  setActiveView("schemeDetails");
                }}
                onBack={() => setActiveView("dashboard")}
              />
            </div>
          )}

          {activeView === "schemeDetails" && selectedScheme && (
            <div className="max-w-4xl mx-auto">
              <SchemeDetails
                scheme={selectedScheme}
                onApply={() => setActiveView("stepper")}
                onBack={() => setActiveView("schemes")}
              />
            </div>
          )}

          {activeView === "dashboard" && (
            /* Wise.com 50/50 Dual Stage Split Grid (Light Theme) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              {/* ========================================================= */}
              {/* LEFT STAGE: The "Why" — Telemetry, Risk & Ground Truth    */}
              {/* ========================================================= */}
              <div className="lg:col-span-6 space-y-8 text-gray-900">
                {/* Government & Scheme Tag */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-emerald-950 font-extrabold text-xs tracking-wider uppercase border border-emerald-300 shadow-xs">
                    🌾 PMFBY Scheme
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-white/90 text-gray-800 font-bold text-xs border border-gray-200 shadow-xs">
                    📍 {farmer.village}, {farmer.district}, {farmer.state}
                  </span>
                </div>

                {/* Big Impactful Wise-style Headline */}
                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 tracking-tight leading-[1.15]">
                    Protect your <span className="text-emerald-700">Paddy crop</span> when distress strikes.
                  </h1>
                  <p className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed max-w-xl">
                    Smart crop monitoring detected high risk in your area. Check eligibility and register for subsidized government insurance in minutes.
                  </p>
                </div>

                {/* Live Distress Telemetry Radar Card */}
                <div className="rounded-3xl bg-white/90 backdrop-blur-2xl border border-white p-6 sm:p-7 shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🚨</span>
                      <span className="text-xs uppercase font-black tracking-wider text-gray-600">
                        DISTRESS TELEMETRY RADAR
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-950 text-xs font-black">
                      <span className="animate-pulse">🔴</span>
                      <span>{mockRisk.score} / 100 HIGH RISK</span>
                    </div>
                  </div>

                  {/* 3 Ground Truth Meters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {mockRisk.factors.map((factor) => (
                      <div
                        key={factor.id}
                        className="p-3.5 rounded-2xl bg-gray-50/90 border border-gray-200/90 flex flex-col justify-between gap-1 shadow-xs"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                          <span>{factor.icon}</span>
                          <span className="truncate">{factor.label}</span>
                        </div>
                        <div className="text-xs text-rose-700 font-extrabold">{factor.value}</div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed pt-1">
                    🌧️ Continuous dry spell over Mayurbhanj root zone triggers PMFBY mid-season assistance rules.
                  </p>
                </div>

                {/* 3 Trust Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                  <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white shadow-sm">
                    <div className="text-emerald-800 font-black text-sm">₹6,250 Subsidy</div>
                    <p className="text-gray-600 mt-1 leading-snug">80%+ co-shared by Central &amp; State Govts</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white shadow-sm">
                    <div className="text-emerald-800 font-black text-sm">Direct DBT</div>
                    <p className="text-gray-600 mt-1 leading-snug">Claims sent to your Aadhaar bank account</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white shadow-sm">
                    <div className="text-emerald-800 font-black text-sm">Helpline 14447</div>
                    <p className="text-gray-600 mt-1 leading-snug">24×7 localized crop loss reporting</p>
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* RIGHT STAGE: The Wise-Style Interactive Conversion Widget */}
              {/* ========================================================= */}
              <div className="lg:col-span-6">
                <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-white p-7 sm:p-9 shadow-2xl space-y-6 select-none">
                  {/* Widget Header: Status & Farmer */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200/90">
                    <div>
                      <span className="text-xs uppercase font-extrabold tracking-wider text-gray-500">
                        INSURANCE ELIGIBILITY &amp; PREMIUM
                      </span>
                      <h2 className="text-xl font-black text-gray-950 mt-0.5">
                        {farmer.name} — {farmer.crop}
                      </h2>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black">
                      <span>⚠️</span>
                      <span>{status === "NOT_REGISTERED" ? "NOT REGISTERED" : status}</span>
                    </div>
                  </div>

                  {/* Parcel Details Strip with eligibility pre-fill checkmarks — PRD §27 */}
                  <div className="p-4 rounded-2xl bg-gray-50/90 border border-gray-200/90 space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700">Pre-Filled Farm Profile</span>
                      <button
                        onClick={() => setIsEditingParcel(!isEditingParcel)}
                        className="text-xs font-extrabold text-emerald-800 hover:underline flex items-center gap-1"
                      >
                        {isEditingParcel ? "✓ Save" : "✏ Edit Details"}
                      </button>
                    </div>

                    {isEditingParcel ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {[
                          { field: "name", label: "Full Name", type: "text" },
                          { field: "fatherName", label: "Father's Name", type: "text" },
                          { field: "mobile", label: "Mobile Number", type: "tel" },
                          { field: "village", label: "Village", type: "text" },
                          { field: "district", label: "District", type: "text" },
                          { field: "state", label: "State", type: "text" },
                          { field: "crop", label: "Crop", type: "text" },
                          { field: "area", label: "Land Area", type: "text" },
                          { field: "season", label: "Season", type: "text" },
                          { field: "sumInsured", label: "Sum Insured", type: "text" },
                        ].map(({ field, label, type }) => (
                          <div key={field}>
                            <label className="text-[11px] text-gray-500 font-bold uppercase tracking-wide block mb-1">{label}</label>
                            <input
                              type={type}
                              value={(farmer as any)[field] ?? ""}
                              onChange={(e) => setFarmer({ ...farmer, [field]: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                            />
                          </div>
                        ))}
                        <div className="sm:col-span-2 flex items-center gap-3 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={farmer.aadhaarLinked}
                              onChange={(e) => setFarmer({ ...farmer, aadhaarLinked: e.target.checked })}
                              className="w-4 h-4 accent-emerald-600"
                            />
                            <span className="text-xs font-semibold text-gray-700">Aadhaar Linked</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={farmer.kccHolder}
                              onChange={(e) => setFarmer({ ...farmer, kccHolder: e.target.checked })}
                              className="w-4 h-4 accent-emerald-600"
                            />
                            <span className="text-xs font-semibold text-gray-700">KCC Holder</span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                            <span className="text-emerald-600 font-black">&#10003;</span>
                            We already have this information
                          </span>
                          <span className="font-bold text-gray-800">State: {farmer.state}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-extrabold text-gray-900 text-xs">&#10003; State: {farmer.state}</span>
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-extrabold text-gray-900 text-xs">&#10003; {farmer.crop}</span>
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-extrabold text-gray-900 text-xs">&#10003; {farmer.area}</span>
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-extrabold text-gray-900 text-xs">&#10003; {farmer.district}</span>
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-extrabold text-gray-900 text-xs">&#10003; {farmer.season}</span>
                          {farmer.mobile && <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-extrabold text-gray-900 text-xs">&#10003; {farmer.mobile}</span>}
                          {farmer.village && <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-extrabold text-gray-900 text-xs">&#10003; {farmer.village}</span>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Financial Subsidy Calculation Box (Clean Light-Themed Wise Fee Breakdown) */}
                  <div className="p-5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-200/90 space-y-3 shadow-xs">
                    <div className="flex justify-between items-center text-xs text-gray-600 font-medium">
                      <span>Maximum Sum Insured (Total Cover)</span>
                      <span className="text-sm font-extrabold text-gray-900">{farmer.sumInsured}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-emerald-800 font-medium">
                      <span>Government Co-Subsidy (Central + State 83%)</span>
                      <span className="font-extrabold text-emerald-700">- ₹6,250</span>
                    </div>

                    <div className="pt-3 border-t border-emerald-200 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-950 block">
                          Total Farmer Share (2%)
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">Only amount payable by farmer</span>
                      </div>
                      <div className="text-2xl font-black text-amber-700 font-mono">
                        {farmer.farmerPremium}
                      </div>
                    </div>
                  </div>

                  {/* Attached Documents Mini-Checklist — fully editable */}
                  <DocumentChecklist documents={documents} setDocuments={setDocuments} />

                  {/* Single Big Primary Action CTA (Wise style) */}
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveView("schemes")}
                      className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base sm:text-lg tracking-wide transition-all active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <span>BROWSE &amp; APPLY FOR INSURANCE</span>
                      <span>→</span>
                    </button>
                  </div>

                  {/* Quick Bottom Triggers: Emergency Loss & Guidelines — PRD §37, §38 */}
                  <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {showLossReported ? (
                      <span className="text-emerald-800 font-bold">&#10003; Loss Intimation Docket Logged (14447)</span>
                    ) : (
                      <button
                        onClick={() => setShowLossReported(true)}
                        className="text-rose-700 font-extrabold hover:underline flex items-center gap-1"
                      >
                        <span>🚨 Report Crop Loss (72h)</span>
                      </button>
                    )}

                    <button
                      onClick={() => setShowRulesModal(!showRulesModal)}
                      className="text-gray-600 font-bold hover:text-gray-900 hover:underline"
                    >
                      {showRulesModal ? "Hide PMFBY Rules ▲" : "View PMFBY Rules ↗"}
                    </button>
                  </div>

                  {/* Expanded Guidelines Pane — PRD §38 */}
                  {showRulesModal && (
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 space-y-2 leading-relaxed">
                      <div className="font-bold text-gray-900 mb-1">ABOUT CROP INSURANCE</div>
                      <p className="text-gray-600 leading-relaxed">Crop insurance can provide financial protection against eligible crop losses under the applicable scheme. Coverage, eligibility and claim rules depend on the relevant scheme and official guidelines.</p>
                      <div className="pt-2 border-t border-gray-200 font-bold text-gray-900">Official PMFBY Coverage Rules:</div>
                      <p>&bull; <strong>Prevented Sowing:</strong> Up to 25% on-account claim if rainfall prevents planting.</p>
                      <p>&bull; <strong>Standing Crop:</strong> Drought &amp; dry spell yield relief based on CCE assessment.</p>
                      <p>&bull; <strong>Post-Harvest:</strong> Up to 14 days coverage for cut-and-spread crops in field.</p>
                      <a href="https://pmfby.gov.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline mt-1">
                        View Official Information ↗
                      </a>
                    </div>
                  )}

                  {/* Claim Support section — PRD §37 */}
                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 text-xs text-gray-600 space-y-1.5">
                    <div className="font-extrabold text-gray-800 uppercase tracking-wider text-[11px]">Claim Support</div>
                    <p>No active claims.</p>
                    <p className="leading-relaxed">If an insured crop experiences an eligible loss, claim information will appear here.</p>
                    <button className="text-emerald-700 font-bold hover:underline mt-1">Learn About Claims ↗</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      </div>
    )
  );
}
