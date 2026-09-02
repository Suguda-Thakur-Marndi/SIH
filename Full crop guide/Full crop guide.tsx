'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Sprout,
  Calendar,
  Droplets,
  ShieldAlert,
  Award,
  Sparkles,
  Info,
  Leaf,
} from 'lucide-react';
import { CROPS_GUIDE_DATA, CropFullGuide, CultivationStage } from '@/lib/cropGuideData';
import CropAudioPlayer from '@/components/CropAudioPlayer';
import CropAiChatbot from '@/components/CropAiChatbot';
import { useLanguage } from '@/lib/language-context';

function FullCropGuideContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const cropParam = searchParams.get('crop')?.toLowerCase() || 'paddy';

  const [selectedCropId, setSelectedCropId] = useState<string>(
    CROPS_GUIDE_DATA[cropParam] ? cropParam : 'paddy'
  );
  const [activeTab, setActiveTab] = useState<'lifecycle' | 'calendar' | 'suitability'>('lifecycle');
  const [activeStageNumber, setActiveStageNumber] = useState<number>(1);
  const [calendarFilter, setCalendarFilter] = useState<string>('all');

  useEffect(() => {
    if (cropParam && CROPS_GUIDE_DATA[cropParam]) {
      setSelectedCropId(cropParam);
    }
  }, [cropParam]);

  const currentCrop: CropFullGuide = CROPS_GUIDE_DATA[selectedCropId] || CROPS_GUIDE_DATA.paddy;
  const currentStage: CultivationStage =
    currentCrop.stages.find((s) => s.stageNumber === activeStageNumber) || currentCrop.stages[0];

  const availableCrops = Object.values(CROPS_GUIDE_DATA);

  const filteredCalendar = currentCrop.calendar.filter((item) => {
    if (calendarFilter === 'all') return true;
    return item.category.toLowerCase().includes(calendarFilter.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/40 to-lime-50 text-slate-900 p-3 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-800 bg-white/90 hover:bg-white px-3.5 py-2 rounded-xl shadow-xs border border-emerald-200 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('back', 'Dashboard')}
            </Link>
            <Link
              href="/alternative-crop"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 px-3.5 py-2 rounded-xl border border-teal-200 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              {t('alternative_crops', 'Alternative Crops')}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full border border-emerald-300">
              📍 Mayurbhanj Agro-Advisory
            </span>
          </div>
        </div>

        {/* Multi-Crop Selector Switcher */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-white/80 shadow-md">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600" /> Select Cultivation Master Guide:
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Switch between Main Paddy &amp; High-Yield Alternative Crops
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {availableCrops.map((c) => {
              const isSelected = c.id === selectedCropId;
              const isAlternative = c.id !== 'paddy';

              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCropId(c.id);
                    setActiveStageNumber(1);
                  }}
                  className={`p-3 rounded-xl text-left transition-all border cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-700 shadow-md scale-[1.01]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {isAlternative && (
                    <span
                      className={`absolute top-1.5 right-1.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-amber-400 text-amber-950' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      +{c.waterSavingPct}% Water Saved
                    </span>
                  )}
                  <div className={`text-[11px] font-bold ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {c.category} · {c.durationDays.split(' ')[0]}d
                  </div>
                  <div className="font-extrabold text-sm truncate mt-0.5">{c.name}</div>
                  <div className={`text-[10px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {c.variety}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Crop Header Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/80 shadow-md relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-emerald-100 text-emerald-900 rounded-lg">
                  {currentCrop.category} Cultivation Protocol
                </span>
                <span className="text-xs font-bold text-slate-500 italic">
                  {currentCrop.scientificName}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {currentCrop.suitabilityScore}% Climate Match
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                {currentCrop.name}
              </h1>
              <p className="text-emerald-800 font-bold text-sm sm:text-base">
                {currentCrop.nameOdia}
              </p>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Step-by-step agronomist playbook covering all 7 stages from land tillage and sowing to water scheduling, balanced nutrition, weed suppression, pest scouting, and Mandi harvest.
              </p>
            </div>

            {/* Quick Metrics Badge */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="text-center p-2 bg-white rounded-xl shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Yield</div>
                <div className="text-sm font-extrabold text-emerald-700">{currentCrop.expectedYield.split('/')[0]}</div>
              </div>
              <div className="text-center p-2 bg-white rounded-xl shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Net Margin</div>
                <div className="text-sm font-extrabold text-emerald-700">{currentCrop.netMarginPerAcre}</div>
              </div>
              <div className="text-center p-2 bg-white rounded-xl shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Mandi Price</div>
                <div className="text-xs font-bold text-slate-800">{currentCrop.avgPricePerQtl}</div>
              </div>
              <div className="text-center p-2 bg-white rounded-xl shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Duration</div>
                <div className="text-xs font-bold text-slate-800">{currentCrop.durationDays}</div>
              </div>
            </div>
          </div>

          {/* Audio Advisory Bar - Listen in Odia */}
          <div className="mt-6">
            <CropAudioPlayer
              title={`Listen to ${currentCrop.name} Advisory in Odia 🔊`}
              odiaText={`${currentCrop.nameOdia}। ${currentCrop.overviewOdia} ${currentCrop.whySuitable.odiaExplanation}`}
              englishText={`Comprehensive agronomy guide for ${currentCrop.name}. ${currentCrop.whySuitable.description} Net profit expected is ${currentCrop.netMarginPerAcre} per acre.`}
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 mt-6 pt-2 gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('lifecycle')}
              className={`pb-3 px-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'lifecycle'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sprout className="w-4 h-4" />
              7-Stage Cultivation Guide
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`pb-3 px-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Farming Activity Calendar
            </button>
            <button
              onClick={() => setActiveTab('suitability')}
              className={`pb-3 px-4 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'suitability'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              Suitability &amp; Agronomic Specs
            </button>
          </div>
        </div>

        {/* TAB 1: 7-STAGE CULTIVATION GUIDE */}
        {activeTab === 'lifecycle' && (
          <div className="space-y-6">
            {/* 7-Stage Horizontal Stepper */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/80 shadow-md">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  7-Stage End-to-End Cultivation Stepper:
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Stage {currentStage.stageNumber} of {currentCrop.stages.length} Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {currentCrop.stages.map((stage) => {
                  const isActive = stage.stageNumber === activeStageNumber;

                  return (
                    <button
                      key={stage.stageNumber}
                      onClick={() => setActiveStageNumber(stage.stageNumber)}
                      className={`p-2.5 sm:p-3 rounded-xl text-left transition-all border cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-[1.02]'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{stage.icon}</span>
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {stage.stageNumber}
                        </span>
                      </div>
                      <div className={`text-[10px] font-bold mt-1.5 truncate ${isActive ? 'text-emerald-200' : 'text-slate-400'}`}>
                        {stage.timing.replace('When: ', '')}
                      </div>
                      <div className="font-bold text-xs truncate mt-0.5 leading-snug">
                        {stage.stageName.split('&')[0].split('/')[0]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Stage Detailed View */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/80 shadow-md space-y-6">
              {/* Stage Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentStage.icon}</span>
                    <span className="text-xs font-black text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2.5 py-0.5 rounded-md">
                      Stage {currentStage.stageNumber}: {currentStage.timing}
                    </span>
                    <span className="text-xs font-bold text-slate-500">({currentStage.daysSpan})</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {currentStage.stageName}
                  </h2>
                  <p className="text-sm font-bold text-emerald-800 mt-0.5">
                    {currentStage.stageNameOdia}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 italic">
                    🎯 Key Goal: {currentStage.keyGoal}
                  </p>
                </div>

                {/* Next / Previous Stepper Navigation */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    disabled={activeStageNumber === 1}
                    onClick={() => setActiveStageNumber((s) => Math.max(1, s - 1))}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ← Previous
                  </button>
                  <button
                    disabled={activeStageNumber === currentCrop.stages.length}
                    onClick={() => setActiveStageNumber((s) => Math.min(currentCrop.stages.length, s + 1))}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                  >
                    Next Stage →
                  </button>
                </div>
              </div>

              {/* Stage Odia Audio Bar */}
              <CropAudioPlayer
                compact
                title={`Listen to Stage ${currentStage.stageNumber} in Odia 🔊`}
                odiaText={`${currentStage.stageNameOdia}। ${currentStage.odiaSummary} ${currentStage.tasksOdia.join('। ')}`}
                englishText={`Stage ${currentStage.stageNumber}: ${currentStage.stageName}. ${currentStage.keyGoal}. Activities: ${currentStage.tasks.join('. ')}`}
              />

              {/* Action Checklist */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Mandatory Field Tasks (କାର୍ଯ୍ୟସୂଚୀ)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentStage.tasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white transition-all space-y-1"
                    >
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm font-semibold text-slate-900">
                          {task}
                        </span>
                      </div>
                      {currentStage.tasksOdia[idx] && (
                        <p className="text-[11px] font-medium text-emerald-900 pl-6">
                          👉 {currentStage.tasksOdia[idx]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Agronomic Pillars: Water, Nutrients, Weeds, Disease */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {/* 1. Irrigation */}
                <div className="bg-blue-50/90 border border-blue-200 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-black text-blue-900 uppercase">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    3️⃣ Irrigation Rule
                  </div>
                  <p className="text-xs text-blue-950 font-medium leading-relaxed">
                    {currentStage.irrigationRule}
                  </p>
                </div>

                {/* 2. Nutrients */}
                <div className="bg-emerald-50/90 border border-emerald-200 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase">
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    4️⃣ Nutrient Schedule
                  </div>
                  <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                    {currentStage.nutritionAdvisory}
                  </p>
                </div>

                {/* 3. Weed Management */}
                <div className="bg-purple-50/90 border border-purple-200 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-black text-purple-900 uppercase">
                    <Leaf className="w-4 h-4 text-purple-600" />
                    5️⃣ Weed Management
                  </div>
                  <p className="text-xs text-purple-950 font-medium leading-relaxed">
                    {currentStage.weedManagement || 'Keep field free of competing grasses and sedges.'}
                  </p>
                </div>

                {/* 4. Plant Protection */}
                <div className="bg-amber-50/90 border border-amber-200 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    6️⃣ Pest &amp; Disease Defense
                  </div>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    {currentStage.diseaseProtection}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FARMING ACTIVITY CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/80 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {currentCrop.name} Weekly Farming Activity Calendar
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Chronological week-by-week field operations and alert milestones.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['all', 'Land Prep', 'Sowing', 'Irrigation', 'Nutrient', 'Weeding', 'Pest Scouting', 'Harvest'].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setCalendarFilter(cat)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        calendarFilter === cat
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {cat === 'all' ? 'All Tasks' : cat}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Timeline Task List */}
            <div className="relative border-l-2 border-emerald-200 ml-4 sm:ml-6 space-y-6 py-2">
              {filteredCalendar.map((item, idx) => {
                const isHighCrit = item.criticality === 'High';

                return (
                  <div key={idx} className="relative pl-6 sm:pl-8 group">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all ${
                        isHighCrit ? 'bg-red-500 ring-4 ring-red-100' : 'bg-emerald-600'
                      }`}
                    />

                    <div className="bg-slate-50 hover:bg-white p-4 rounded-2xl border border-slate-200 transition-all shadow-2xs hover:shadow-sm">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                            Week {item.week}
                          </span>
                          <span className="text-xs font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
                            {item.category}
                          </span>
                          {isHighCrit && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                              ⚡ High Priority
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-900 mt-1">{item.title}</h4>
                      <p className="text-xs font-bold text-emerald-800">{item.titleOdia}</p>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">{item.activity}</p>
                      <p className="text-[11px] text-emerald-950 font-medium mt-0.5">
                        👉 {item.activityOdia}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SUITABILITY & AGRONOMIC SPECS */}
        {activeTab === 'suitability' && (
          <div className="space-y-6">
            {/* Why Suitable Deep-Dive */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/80 shadow-md space-y-6">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-emerald-600" />
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {currentCrop.whySuitable.title}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">{currentCrop.whySuitable.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentCrop.whySuitable.points.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <div className="text-2xl">{p.icon}</div>
                    <h4 className="font-extrabold text-sm text-emerald-950">{p.title}</h4>
                    <p className="text-xs text-emerald-900 leading-relaxed font-medium">{p.desc}</p>
                  </div>
                ))}
              </div>

              {/* Odia Explanation Banner */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                <span className="text-xl">📢</span>
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-amber-900 tracking-wider">
                    ଓଡ଼ିଆରେ ବିବରଣୀ (Why Suitable in Odia):
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-amber-950 mt-1 leading-relaxed">
                    {currentCrop.whySuitable.odiaExplanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Agronomic Technical Parameter Specifications */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/80 shadow-md space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-600" /> Key Agronomic Quick Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Optimal Soil Type</div>
                  <div className="font-bold text-slate-900 mt-0.5">{currentCrop.howToGrowSummary.soilType}</div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Recommended Seed Rate</div>
                  <div className="font-bold text-slate-900 mt-0.5">{currentCrop.howToGrowSummary.seedRate}</div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Row-to-Plant Spacing</div>
                  <div className="font-bold text-slate-900 mt-0.5">{currentCrop.howToGrowSummary.spacing}</div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Sowing Window</div>
                  <div className="font-bold text-slate-900 mt-0.5">{currentCrop.howToGrowSummary.sowingWindow}</div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">NPK Fertilizer Ratio</div>
                  <div className="font-bold text-slate-900 mt-0.5">{currentCrop.howToGrowSummary.fertilizerDose}</div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Irrigation Requirement</div>
                  <div className="font-bold text-slate-900 mt-0.5">{currentCrop.howToGrowSummary.irrigationFreq}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating AI Agronomist Chatbot */}
      <CropAiChatbot
        currentCropName={currentCrop.name}
        currentCropId={currentCrop.id}
        currentStageName={currentStage.stageName}
      />
    </div>
  );
}

export default function FullCropGuide() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-bold text-emerald-800">Loading Agronomy Guide...</div>}>
      <FullCropGuideContent />
    </Suspense>
  );
}
