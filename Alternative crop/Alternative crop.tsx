'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Sparkles,
  Droplets,
  IndianRupee,
  Sprout,
  ArrowRight,
  Clock,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { CROPS_GUIDE_DATA, CropFullGuide } from '@/lib/cropGuideData';
import CropAudioPlayer from '@/components/CropAudioPlayer';
import CropAiChatbot from '@/components/CropAiChatbot';
import { useLanguage } from '@/lib/language-context';

import bgLaptop from './Image/Bg Laptop.png';
import bgPhone from './Image/Bg phone.png';

export default function AlternativeCrop() {
  const { t, language, languageCode } = useLanguage();
  const alternativeCropKeys = ['groundnut', 'mustard', 'blackgram'];
  const [selectedCropId, setSelectedCropId] = useState<string>('groundnut');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchAiRecommendations() {
      setIsAiLoading(true);
      try {
        const res = await fetch('/api/ai/alternative-crop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentCrop: 'Paddy (Swarna MTU 7029)',
            soilType: 'Red Loamy Soil',
            waterAvailability: 'Low-Medium (Canal Deficit)',
            district: 'Mayurbhanj, Odisha',
            language: language,
            languageCode: languageCode,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data?.recommendations?.[0]?.reasoning) {
            setAiInsight(json.data.recommendations[0].reasoning);
          }
        }
      } catch (err) {
        console.warn('[Alternative Crop AI fetch failed]:', err);
      } finally {
        setIsAiLoading(false);
      }
    }
    fetchAiRecommendations();
  }, [language, languageCode]);

  const selectedCrop: CropFullGuide =
    CROPS_GUIDE_DATA[selectedCropId] || CROPS_GUIDE_DATA.groundnut;

  return (
    <div className="relative min-h-screen text-slate-900 selection:bg-emerald-500 selection:text-white p-3 sm:p-6 md:p-8">
      {/* ========================================================================= */}
      {/* RESPONSIVE DYNAMIC BACKGROUND (Laptop vs Phone) */}
      {/* ========================================================================= */}
      {/* Mobile Screen BG (< md) */}
      <div className="fixed inset-0 -z-20 md:hidden pointer-events-none overflow-hidden">
        <Image
          src={bgPhone}
          alt="Alternative Crop Background Phone"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/30 to-slate-900/30 backdrop-blur-[2px]" />
      </div>

      {/* Laptop & Desktop Screen BG (>= md) */}
      <div className="fixed inset-0 -z-20 hidden md:block pointer-events-none overflow-hidden">
        <Image
          src={bgLaptop}
          alt="Alternative Crop Background Laptop"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-slate-950/25 backdrop-blur-[1px]" />
      </div>

      {/* Subtle Ambient Glow */}
      <div className="fixed inset-0 -z-10 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

      {/* ========================================================================= */}
      {/* MAIN CONTENT CONTAINER */}
      {/* ========================================================================= */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 bg-white/80 hover:bg-white/95 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md border border-white/80 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
              {t('back', 'Dashboard')}
            </Link>
            <Link
              href="/full-crop-guide"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-teal-900 bg-teal-50/85 hover:bg-teal-100/95 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-teal-200/80 shadow-sm transition-all duration-200"
            >
              <BookOpen className="w-4 h-4 text-teal-600" />
              {t('agronomic_guide', 'Paddy & Crop Master Guide')}
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-black px-3.5 py-1.5 bg-white/85 text-emerald-900 backdrop-blur-xl rounded-full border border-white shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            📍 Mayurbhanj Agro-Climatic Advisory
          </div>
        </div>

        {/* Hero Glass Banner */}
        <div className="relative overflow-hidden bg-white/75 hover:bg-white/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/80 shadow-xl shadow-slate-900/5 transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/80 text-emerald-800 rounded-lg text-xs font-black uppercase tracking-wider mb-3 border border-emerald-200/60">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              {t('alternative_crop_advisory', 'AI Climate-Resilience & Net Margin Advisory')}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {t('alternative_crops', 'Climate-Smart Alternative Crop Recommendations')}
            </h1>
            <p className="text-slate-700 text-xs sm:text-sm md:text-base mt-2.5 max-w-3xl leading-relaxed font-medium">
              Mitigate rainfall deficit, enrich soil nitrogen, and boost your household profits by transitioning to resilient alternative crops with verified agronomic workflows.
            </p>

            {isAiLoading ? (
              <div className="mt-4 p-3 bg-white/50 border border-white/80 rounded-2xl flex items-center gap-2 text-xs text-slate-600 font-bold backdrop-blur-sm">
                <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span>Synthesizing live NVIDIA NIM crop recommendations...</span>
              </div>
            ) : aiInsight ? (
              <div className="mt-4 p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-950 font-bold backdrop-blur-sm animate-in fade-in duration-300">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-emerald-900 block mb-0.5">🤖 NVIDIA NIM Agronomic Rationale:</span>
                  <span>{aiInsight}</span>
                </div>
              </div>
            ) : null}

            {/* Workflow Pipeline Graphic */}
            <div className="mt-6 p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 shadow-inner flex items-center justify-between overflow-x-auto gap-2 text-xs font-extrabold text-slate-700 no-scrollbar">
              <div className="flex items-center gap-2 shrink-0 text-emerald-800">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs font-black">1</span>
                Recommended Crop
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex items-center gap-2 shrink-0 text-teal-800">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs shadow-xs font-black">2</span>
                Why Suitable
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex items-center gap-2 shrink-0 text-cyan-800">
                <span className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs shadow-xs font-black">3</span>
                How to Grow It
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex items-center gap-2 shrink-0 text-amber-800">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs shadow-xs font-black">4</span>
                Farming Calendar
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Crop Selection Cards */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Top Ranked Alternative Crops
              </h2>
              <span className="text-[11px] font-bold text-slate-600 bg-white/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/70">
                3 Best Matches
              </span>
            </div>

            {alternativeCropKeys.map((cropId) => {
              const crop = CROPS_GUIDE_DATA[cropId];
              const isSelected = crop.id === selectedCropId;

              return (
                <div
                  key={crop.id}
                  onClick={() => setSelectedCropId(crop.id)}
                  className={`relative overflow-hidden p-4 rounded-3xl cursor-pointer transition-all duration-300 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600/95 to-teal-700/95 text-white shadow-xl shadow-emerald-700/25 border-emerald-400/80 scale-[1.02]'
                      : 'bg-white/75 hover:bg-white/90 text-slate-800 border-white/80 backdrop-blur-xl shadow-md hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-black text-base tracking-tight">{crop.name}</h3>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full backdrop-blur-md ${
                        isSelected ? 'bg-white/25 text-white border border-white/30' : 'bg-emerald-100/90 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      {crop.suitabilityScore}% Match
                    </span>
                  </div>

                  <p className={`text-xs ${isSelected ? 'text-emerald-100' : 'text-slate-600'} italic mb-3 font-medium`}>
                    {crop.scientificName}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className={`p-2 rounded-2xl ${isSelected ? 'bg-white/15 backdrop-blur-sm' : 'bg-slate-50/80 border border-slate-100'}`}>
                      <div className={isSelected ? 'text-emerald-200 text-[10px]' : 'text-slate-500 text-[10px] font-bold uppercase'}>Water Saved</div>
                      <div className="font-black text-xs sm:text-sm mt-0.5">+{crop.waterSavingPct}%</div>
                    </div>
                    <div className={`p-2 rounded-2xl ${isSelected ? 'bg-white/15 backdrop-blur-sm' : 'bg-slate-50/80 border border-slate-100'}`}>
                      <div className={isSelected ? 'text-emerald-200 text-[10px]' : 'text-slate-500 text-[10px] font-bold uppercase'}>Duration</div>
                      <div className="font-black text-xs sm:text-sm mt-0.5">{crop.durationDays.split(' ')[0]}d</div>
                    </div>
                    <div className={`p-2 rounded-2xl ${isSelected ? 'bg-white/15 backdrop-blur-sm' : 'bg-slate-50/80 border border-slate-100'}`}>
                      <div className={isSelected ? 'text-emerald-200 text-[10px]' : 'text-slate-500 text-[10px] font-bold uppercase'}>Net Profit</div>
                      <div className="font-black text-xs sm:text-sm mt-0.5">{crop.netMarginPerAcre}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick Paddy Comparison Card (White Glass) */}
            <div className="p-4 bg-amber-50/85 backdrop-blur-xl rounded-3xl border border-amber-200/90 shadow-md text-xs space-y-2">
              <div className="font-black text-amber-950 flex items-center gap-1.5">
                <span className="text-base">🌾</span> Compared to Conventional Paddy:
              </div>
              <p className="text-amber-950 font-medium leading-relaxed">
                Paddy requires ~1,400mm water with ₹24,500 net profit. Switching to <strong className="font-bold text-amber-900">{selectedCrop.name}</strong> saves <strong className="font-bold text-emerald-800">{selectedCrop.waterSavingPct}% water</strong> and yields <strong className="font-bold text-emerald-800">{selectedCrop.netMarginPerAcre}</strong> net margin per acre.
              </p>
            </div>
          </div>

          {/* Right Column: Complete 4-Step Structured Narrative */}
          <div className="lg:col-span-8 space-y-6">
            {/* STEP 1: CROP SUITABILITY HERO (White Glass Container) */}
            <div className="bg-white/80 hover:bg-white/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/90 shadow-xl shadow-slate-900/5 space-y-6 transition-all duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-black tracking-widest uppercase bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Step 1 · Recommended Alternative
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                    {selectedCrop.name} is Suitable
                  </h2>
                  <p className="text-xs font-bold text-emerald-700 italic mt-0.5">
                    {selectedCrop.nameOdia} · {selectedCrop.scientificName}
                  </p>
                </div>

                <div className="text-left sm:text-right bg-emerald-50/80 backdrop-blur-md p-3 rounded-2xl border border-emerald-200/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Projected Net Margin</span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-700">
                    {selectedCrop.netMarginPerAcre} <span className="text-xs text-slate-500 font-semibold">/ acre</span>
                  </div>
                </div>
              </div>

              {/* Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/70 backdrop-blur-md border border-white p-3.5 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    Water Saved
                  </div>
                  <div className="font-black text-sm sm:text-base text-slate-900">+{selectedCrop.waterSavingPct}%</div>
                  <span className="text-[10px] text-slate-500 font-medium">vs conventional paddy</span>
                </div>
                <div className="bg-white/70 backdrop-blur-md border border-white p-3.5 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-1">
                    <Clock className="w-3.5 h-3.5 text-purple-500" />
                    Duration
                  </div>
                  <div className="font-black text-sm sm:text-base text-slate-900">{selectedCrop.durationDays}</div>
                  <span className="text-[10px] text-slate-500 font-medium">fast harvest cycle</span>
                </div>
                <div className="bg-white/70 backdrop-blur-md border border-white p-3.5 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-1">
                    <Sprout className="w-3.5 h-3.5 text-emerald-500" />
                    Expected Yield
                  </div>
                  <div className="font-black text-sm sm:text-base text-slate-900">{selectedCrop.expectedYield.split('/')[0]}</div>
                  <span className="text-[10px] text-slate-500 font-medium">per standard acre</span>
                </div>
                <div className="bg-white/70 backdrop-blur-md border border-white p-3.5 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-1">
                    <IndianRupee className="w-3.5 h-3.5 text-amber-500" />
                    Mandi Price
                  </div>
                  <div className="font-black text-sm sm:text-base text-slate-900">{selectedCrop.avgPricePerQtl}</div>
                  <span className="text-[10px] text-slate-500 font-medium">guaranteed MSP/mandi</span>
                </div>
              </div>

              {/* STEP 2: HERE'S WHY (Frosted Glass Cards) */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-black shadow-xs">2</span>
                  <h3 className="font-black text-sm uppercase tracking-wider text-teal-950">
                    Here&apos;s Why It Is Suitable for Your Farm:
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCrop.whySuitable.points.map((pt, idx) => (
                    <div key={idx} className="p-4 bg-emerald-50/70 backdrop-blur-md rounded-2xl border border-emerald-200/80 shadow-xs space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{pt.icon}</span>
                        <h4 className="font-black text-xs sm:text-sm text-emerald-950">{pt.title}</h4>
                      </div>
                      <p className="text-xs text-emerald-900 font-medium leading-relaxed">{pt.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Odia Audio Narration Bar */}
                <div className="rounded-2xl overflow-hidden border border-white/90 shadow-sm">
                  <CropAudioPlayer
                    title={`Listen to Why ${selectedCrop.name} is Suitable in Odia 🔊`}
                    odiaText={`${selectedCrop.nameOdia}। ${selectedCrop.whySuitable.odiaExplanation} ଏହା ଧାନ ତୁଳନାରେ ${selectedCrop.waterSavingPct}% କମ୍ ପାଣି ନିଏ ଏବଂ ଏକର ପ୍ରତି ${selectedCrop.netMarginPerAcre} ଲାଭ ଦିଏ।`}
                    englishText={`Why grow ${selectedCrop.name}: ${selectedCrop.whySuitable.description} Net margin is ${selectedCrop.netMarginPerAcre} per acre.`}
                  />
                </div>
              </div>

              {/* STEP 3: HERE'S HOW TO GROW IT */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-black shadow-xs">3</span>
                  <h3 className="font-black text-sm uppercase tracking-wider text-cyan-950">
                    Here&apos;s How to Grow It (Agronomic Key Specs):
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-xs">
                    <div className="text-slate-500 font-bold uppercase text-[10px]">Seed Rate &amp; Depth</div>
                    <div className="font-black text-slate-800 text-xs sm:text-sm mt-1">{selectedCrop.howToGrowSummary.seedRate}</div>
                  </div>
                  <div className="p-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-xs">
                    <div className="text-slate-500 font-bold uppercase text-[10px]">Row Spacing</div>
                    <div className="font-black text-slate-800 text-xs sm:text-sm mt-1">{selectedCrop.howToGrowSummary.spacing}</div>
                  </div>
                  <div className="p-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-xs">
                    <div className="text-slate-500 font-bold uppercase text-[10px]">Critical Nutrients</div>
                    <div className="font-black text-slate-800 text-xs sm:text-sm mt-1">{selectedCrop.howToGrowSummary.fertilizerDose}</div>
                  </div>
                </div>

                {/* 3 Quick Stage Previews */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedCrop.stages.slice(0, 3).map((st) => (
                    <div key={st.stageNumber} className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white shadow-xs">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 mb-1">
                        <span>{st.icon}</span>
                        <span>Stage {st.stageNumber}: {st.stageName.split('(')[0]}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium line-clamp-2 leading-relaxed">{st.keyGoal}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* STEP 4: HERE'S YOUR ACTIVITY CALENDAR */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-black shadow-xs">4</span>
                  <h3 className="font-black text-sm uppercase tracking-wider text-amber-950">
                    Here&apos;s Your Activity Calendar Preview:
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {selectedCrop.calendar.slice(0, 4).map((cal, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white flex items-start justify-between gap-3 text-xs shadow-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="font-black text-emerald-900 bg-emerald-100/90 px-2.5 py-1 rounded-lg shrink-0 border border-emerald-200">
                          Week {cal.week}
                        </span>
                        <div>
                          <div className="font-black text-slate-900 text-xs sm:text-sm">{cal.title}</div>
                          <div className="text-slate-600 font-medium mt-0.5 leading-relaxed">{cal.activity}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-500 bg-slate-100/90 px-2.5 py-1 rounded-lg shrink-0 border border-slate-200">
                        {cal.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct 1-Click Action to Full Crop Guide & Calendar */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/full-crop-guide?crop=${selectedCrop.id}`}
                  className="flex-1 text-center bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-emerald-700/25 transition-all text-xs sm:text-sm flex items-center justify-center gap-2.5"
                >
                  <span>Open Full Cultivation Guide &amp; 7-Stage Calendar for {selectedCrop.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/market"
                  className="text-center bg-white/80 hover:bg-white text-slate-900 font-bold py-4 px-6 rounded-2xl border border-white shadow-md hover:shadow-lg backdrop-blur-xl transition-all text-xs sm:text-sm"
                >
                  Live APMC Mandi Rates
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Agronomist Chatbot */}
      <CropAiChatbot
        currentCropName={selectedCrop.name}
        currentCropId={selectedCrop.id}
        currentStageName="Recommended Switch Advisory"
      />
    </div>
  );
}
