'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sprout, Droplets, Layers, CheckCircle2, BookOpen } from 'lucide-react';
import bgImage from '../farmer profile/image/BG_2.png';
import CropDetailsCalendar from './CropDetailsCalendar';

interface CalendarTask {
  task: string;
  dueInDays: number;
}

interface CropCalendar {
  completed: string[];
  today: { task: string; description?: string };
  upcoming: CalendarTask[];
}

interface CropInfo {
  id: string;
  name: string;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  idealSoil: string;
  soilPh: string;
  tempRange: string;
  waterRequirement: string;
  seedRate: string;
  sowingDepth: string;
  spacing: string;
  fertilizerDose: {
    nitrogen: string;
    phosphorus: string;
    potassium: string;
    zinc: string;
  };
  criticalIrrigationStages: string[];
  keyPests: string[];
  calendar: CropCalendar;
}

const CROPS_CATALOG: CropInfo[] = [
  {
    id: 'paddy',
    name: 'Paddy / Rice (Oryza sativa)',
    season: 'Kharif',
    idealSoil: 'Clayey loam to heavy clay with high water holding capacity',
    soilPh: '5.5 – 6.8',
    tempRange: '22°C – 32°C',
    waterRequirement: '1200 – 1400 mm',
    seedRate: '15 – 20 kg / acre (Transplanting)',
    sowingDepth: '2 – 3 cm',
    spacing: '20 cm × 15 cm',
    fertilizerDose: {
      nitrogen: '40 kg N / acre',
      phosphorus: '20 kg P2O5 / acre',
      potassium: '20 kg K2O / acre',
      zinc: '10 kg ZnSO4 / acre',
    },
    criticalIrrigationStages: [
      'Transplanting stage',
      'Tillering stage (20-25 DAT)',
      'Panicle initiation (45-50 DAT)',
      'Grain filling stage',
    ],
    keyPests: ['Yellow Stem Borer', 'Brown Plant Hopper (BPH)', 'Bacterial Leaf Blight', 'Blast disease'],
    calendar: {
      completed: ['Land preparation', 'Sowing'],
      today: {
        task: 'Soil moisture inspection',
        description: 'Check root-zone moisture levels across all plots — ensure adequate field capacity.',
      },
      upcoming: [
        { task: 'Fertilizer application', dueInDays: 5 },
        { task: 'Weed management', dueInDays: 9 },
        { task: 'Disease monitoring', dueInDays: 15 },
        { task: 'Panicle initiation irrigation', dueInDays: 22 },
      ],
    },
  },
  {
    id: 'mustard',
    name: 'Mustard (Brassica juncea)',
    season: 'Rabi',
    idealSoil: 'Sandy loam to alluvial rich soil with good internal drainage',
    soilPh: '6.0 – 7.5',
    tempRange: '15°C – 25°C',
    waterRequirement: '250 – 350 mm',
    seedRate: '1.5 – 2.0 kg / acre',
    sowingDepth: '3 – 4 cm',
    spacing: '30 cm × 10 cm',
    fertilizerDose: {
      nitrogen: '25 kg N / acre',
      phosphorus: '15 kg P2O5 / acre',
      potassium: '10 kg K2O / acre',
      zinc: '5 kg Sulphur / acre',
    },
    criticalIrrigationStages: ['Flowering initiation (30-35 DAS)', 'Pod development (55-65 DAS)'],
    keyPests: ['Mustard Aphid', 'White Rust', 'Alternaria Blight', 'Painted Bug'],
    calendar: {
      completed: ['Land preparation', 'Sowing', 'First irrigation'],
      today: {
        task: 'Aphid scouting',
        description: 'Inspect leaves for aphid colonies — apply treatment if density exceeds 50 per plant.',
      },
      upcoming: [
        { task: 'Flowering irrigation', dueInDays: 5 },
        { task: 'Fungicide spray (Alternaria)', dueInDays: 10 },
        { task: 'Pod development irrigation', dueInDays: 18 },
        { task: 'Harvest readiness check', dueInDays: 30 },
      ],
    },
  },
  {
    id: 'maize',
    name: 'Maize / Corn (Zea mays)',
    season: 'Kharif',
    idealSoil: 'Well-drained deep fertile loamy soil rich in organic matter',
    soilPh: '6.5 – 7.5',
    tempRange: '20°C – 30°C',
    waterRequirement: '500 – 600 mm',
    seedRate: '8 – 10 kg / acre',
    sowingDepth: '4 – 5 cm',
    spacing: '60 cm × 20 cm',
    fertilizerDose: {
      nitrogen: '48 kg N / acre',
      phosphorus: '24 kg P2O5 / acre',
      potassium: '24 kg K2O / acre',
      zinc: '10 kg ZnSO4 / acre',
    },
    criticalIrrigationStages: [
      'Knee-high vegetative stage (30-35 DAS)',
      'Tasseling & Silking stage (50-60 DAS)',
      'Grain filling stage (75-80 DAS)',
    ],
    keyPests: ['Fall Armyworm (FAW)', 'Stem Borer', 'Turcicum Leaf Blight'],
    calendar: {
      completed: ['Land preparation', 'Basal fertilizer application', 'Sowing'],
      today: {
        task: 'Soil moisture inspection',
        description: 'Ensure field capacity moisture at knee-high stage for optimal root development.',
      },
      upcoming: [
        { task: 'FAW scouting & spray', dueInDays: 5 },
        { task: 'Top dressing (Nitrogen)', dueInDays: 9 },
        { task: 'Tasseling irrigation', dueInDays: 15 },
        { task: 'Grain filling irrigation', dueInDays: 25 },
      ],
    },
  },
];

export default function CropDetails() {
  const [selectedCrop, setSelectedCrop] = useState<CropInfo>(CROPS_CATALOG[0]);
  const [loading, setLoading] = useState(true);
  React.useEffect(() => {
    // Simulate data/background load
    setLoading(false);
  }, []);
  const cal = selectedCrop.calendar;

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-white/60 relative">
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-emerald-50 to-white opacity-50" />
        {/* Header skeleton */}
        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
          </div>
          {/* Header card */}
          <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 md:p-8 animate-pulse" style={{ height: '120px' }} />
          {/* Tabs skeleton */}
          <div className="flex flex-wrap gap-2 mt-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          {/* Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 animate-pulse" style={{ height: '200px' }} />
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 animate-pulse" style={{ height: '200px' }} />
          </div>
          {/* Calendar skeleton */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 animate-pulse" style={{ height: '300px' }} />
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen text-slate-900 p-4 md:p-8 relative">
      {/* Background Image Layer */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${bgImage.src}')` }}
        />
        {/* White Blurry Overlay */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
      </div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">

        {/* Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-white/80 hover:bg-white px-4 py-2 rounded-xl shadow-xs border border-emerald-200/60 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-100/90 text-emerald-800 rounded-full border border-emerald-300">
            🌾 Agronomic Knowledge Base
          </span>
        </div>

        {/* Header Card */}
        <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/80 shadow-md">
          <div className="flex items-center gap-3 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Standard Agronomy Parameters &amp; Schedules
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Crop Details &amp; Cultivation Specifications
          </h1>
          <p className="text-slate-600 text-sm md:text-base mt-2 max-w-3xl leading-relaxed">
            Essential agronomic parameters, soil requirements, recommended fertilizer dosages (NPK+Zn), and critical irrigation windows.
          </p>

          {/* Crop Selector Tabs */}
          <div className="flex flex-wrap gap-2 mt-6">
            {CROPS_CATALOG.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCrop(c)}
                className={`py-2 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${selectedCrop.id === c.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
              >
                {c.name.split('(')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Main 2-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Soil & Climate Requirements */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/80 shadow-md space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-emerald-600" />
              Soil &amp; Climate Requirements
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Ideal Soil Type', value: selectedCrop.idealSoil, cls: 'font-semibold text-slate-800 text-right max-w-xs' },
                { label: 'Soil pH Range', value: selectedCrop.soilPh, cls: 'font-bold text-emerald-700' },
                { label: 'Optimal Temperature', value: selectedCrop.tempRange, cls: 'font-semibold text-slate-800' },
                { label: 'Total Water Need', value: selectedCrop.waterRequirement, cls: 'font-semibold text-blue-700' },
                { label: 'Sowing Depth & Spacing', value: `${selectedCrop.sowingDepth} · ${selectedCrop.spacing}`, cls: 'font-semibold text-slate-800' },
                { label: 'Recommended Seed Rate', value: selectedCrop.seedRate, cls: 'font-semibold text-slate-800' },
              ].map((row, i, arr) => (
                <div key={i} className={`flex justify-between py-1.5 ${i < arr.length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <span className="text-slate-500 font-medium">{row.label}</span>
                  <span className={row.cls}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fertilizer Dose */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/80 shadow-md space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sprout className="w-5 h-5 text-emerald-600" />
              Recommended Fertilizer Dose (Per Acre)
            </h3>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-emerald-50 border border-emerald-200/70 p-3 rounded-xl">
                <span className="text-xs text-emerald-800 font-semibold uppercase">Nitrogen (N)</span>
                <div className="text-lg font-black text-emerald-900 mt-1">{selectedCrop.fertilizerDose.nitrogen}</div>
              </div>
              <div className="bg-teal-50 border border-teal-200/70 p-3 rounded-xl">
                <span className="text-xs text-teal-800 font-semibold uppercase">Phosphorus (P2O5)</span>
                <div className="text-lg font-black text-teal-900 mt-1">{selectedCrop.fertilizerDose.phosphorus}</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200/70 p-3 rounded-xl">
                <span className="text-xs text-indigo-800 font-semibold uppercase">Potassium (K2O)</span>
                <div className="text-lg font-black text-indigo-900 mt-1">{selectedCrop.fertilizerDose.potassium}</div>
              </div>
              <div className="bg-amber-50 border border-amber-200/70 p-3 rounded-xl">
                <span className="text-xs text-amber-800 font-semibold uppercase">Micronutrient (Zn/S)</span>
                <div className="text-lg font-black text-amber-900 mt-1">{selectedCrop.fertilizerDose.zinc}</div>
              </div>
            </div>
            <div className="pt-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                Critical Irrigation Stages
              </h4>
              <div className="space-y-1.5 text-xs text-slate-700">
                {selectedCrop.criticalIrrigationStages.map((stage, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{stage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* FARMING CALENDAR — Full Width, Large & Prominent       */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-md overflow-hidden p-12">
          <CropDetailsCalendar cropId={selectedCrop.id} />
        </div>

      </div>
    </div>
  );
}
