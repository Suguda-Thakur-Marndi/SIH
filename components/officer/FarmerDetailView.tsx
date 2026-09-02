"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, ShieldAlert, Sparkles, Send, Droplets, CheckCircle2, RefreshCw
} from 'lucide-react';

export default function FarmerDetailView({ farmerId }: { farmerId: string }) {
  const [data, setData] = useState<any>(null);
  const [interventionNote, setInterventionNote] = useState('');
  const [interventionType, setInterventionType] = useState('FIELD_VISIT');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/officer/farmers/${farmerId}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
      })
      .catch(console.error);
  }, [farmerId]);

  const handleDispatchIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/officer/farmers/${farmerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: interventionType, notes: interventionNote })
      });
      const resJson = await res.json();
      if (resJson.success) {
        setSuccessMsg('Intervention order issued and dispatched to district database.');
        setInterventionNote('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunPipeline = async () => {
    setRunningPipeline(true);
    setPipelineResult(null);
    try {
      const res = await fetch('/api/automation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId }),
      });
      const resJson = await res.json();
      if (resJson.success && resJson.result) {
        setPipelineResult(resJson.result);
        // Refresh local data view
        setData((prev: any) => ({
          ...prev,
          riskProfile: {
            ...prev.riskProfile,
            overallScore: resJson.result.score ?? prev.riskProfile.overallScore,
          },
        }));
      } else {
        setPipelineResult({ error: resJson.error || 'Pipeline run failed' });
      }
    } catch (err: any) {
      setPipelineResult({ error: err.message });
    } finally {
      setRunningPipeline(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F2F2EF] p-8 flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-500 font-medium">Loading farmer risk dossier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2EF] text-[#1A1A1A] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link 
            href="/officer-dashboard/farmers" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-black/10 shadow-sm text-sm font-medium hover:bg-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Farmer Queue
          </Link>
          <span className="text-xs font-semibold px-3 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full">
            Critical Triage Case
          </span>
        </div>

        {/* Farmer Hero Profile Card */}
        <div className="bg-[#1A1A1A] text-white rounded-[28px] p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-2">
              <span className="text-xs font-bold text-[#CFE362] uppercase tracking-wider">Farmer Dossier &bull; {data.id}</span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{data.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-300">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-neutral-400" />{data.village}, {data.district}</span>
                <span>&bull;</span>
                <span>{data.phone}</span>
                <span>&bull;</span>
                <span>Landholding: {data.landArea}</span>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunPipeline}
                  disabled={runningPipeline}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#CFE362] text-xs font-semibold border border-white/10 transition disabled:opacity-50"
                  title="Pull live location, weather, soil, mandi price and run AI SMS pipeline"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${runningPipeline ? 'animate-spin' : ''}`} />
                  <span>{runningPipeline ? 'Running 7-Step Pipeline...' : 'Re-run Live Telemetry Pipeline'}</span>
                </button>

                {pipelineResult && (
                  <span
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-lg ${
                      pipelineResult.error
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {pipelineResult.error
                      ? `Error: ${pipelineResult.error}`
                      : `Updated: Score ${pipelineResult.score}/100 (${pipelineResult.band})${
                          pipelineResult.smsQueued ? ' • SMS Dispatched' : ''
                        }`}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Calculated Distress Risk</span>
              <div className="text-4xl md:text-5xl font-black text-red-400 tracking-tight">
                {data.riskProfile.overallScore}<span className="text-lg text-neutral-400 font-normal">/100</span>
              </div>
              <span className="text-xs font-bold text-red-300 mt-1">HIGH RISK TIER</span>
            </div>
          </div>
        </div>

        {/* Crop & Agronomic Diagnostics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Crop Profile */}
          <div className="bg-white/80 backdrop-blur-md rounded-[24px] p-6 border border-black/5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-neutral-700" />
              Active Crop & Soil Parameters
            </h2>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl">
                <div className="text-neutral-500 font-medium">Crop & Variety</div>
                <div className="font-bold text-neutral-900 text-sm mt-0.5">{data.crop.name}</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl">
                <div className="text-neutral-500 font-medium">Lifecycle Stage</div>
                <div className="font-bold text-neutral-900 text-sm mt-0.5">{data.crop.currentStage}</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl">
                <div className="text-neutral-500 font-medium">Soil Classification</div>
                <div className="font-bold text-neutral-900 text-sm mt-0.5">{data.soilType}</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl">
                <div className="text-neutral-500 font-medium">Vegetation Index (NDVI)</div>
                <div className="font-bold text-red-600 text-sm mt-0.5">{data.crop.ndviScore} (Sub-optimal)</div>
              </div>
            </div>

            <p className="text-xs text-neutral-600 bg-red-50 p-3 rounded-xl border border-red-200">
              <strong className="text-red-900">Distress Analysis:</strong> {data.riskProfile.distressReason}
            </p>
          </div>

          {/* Financial & Institutional Linkages */}
          <div className="bg-white/80 backdrop-blur-md rounded-[24px] p-6 border border-black/5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-neutral-700" />
              Institutional & Financial Linkages
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl">
                <span className="text-neutral-500 font-medium">Kisan Credit Card (KCC) Loan</span>
                <span className="font-bold text-neutral-900">{data.financialStatus.kccLoan}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl">
                <span className="text-neutral-500 font-medium">PMFBY Insurance Verification</span>
                <span className="font-bold text-emerald-700">{data.financialStatus.pmfbyStatus}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl">
                <span className="text-neutral-500 font-medium">Prior Subsidies Availed</span>
                <span className="font-bold text-neutral-800">{data.financialStatus.subsidyAvailed}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Dispatch Officer Intervention Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-[28px] p-6 md:p-8 border border-black/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neutral-900" />
            <h2 className="text-lg font-bold text-neutral-900">
              Dispatch Officer Action & Advisory
            </h2>
          </div>
          <p className="text-xs text-neutral-600">
            Select the direct intervention protocol to dispatch to the farmer&apos;s phone, schedule an on-site field inspection, or fast-track emergency subsidy relief.
          </p>

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleDispatchIntervention} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Intervention Protocol
                </label>
                <select
                  value={interventionType}
                  onChange={(e) => setInterventionType(e.target.value)}
                  className="w-full p-2.5 text-xs font-semibold bg-neutral-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
                >
                  <option value="FIELD_VISIT">Assign Extension Officer Field Visit</option>
                  <option value="VOICE_CALL">Schedule Direct Officer Tele-Advisory</option>
                  <option value="SUBSIDY_FAST_TRACK">Fast-Track Solar Pump / Micro-Irrigation Subsidy</option>
                  <option value="EMERGENCY_PEST_KIT">Dispatch Emergency Pest / Disease Amendment Kit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Target Dispatch Date
                </label>
                <input 
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full p-2.5 text-xs bg-neutral-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Advisory Directives & Agronomic Notes
              </label>
              <textarea
                rows={3}
                placeholder="Enter specific instructions for the farmer or field officer team..."
                value={interventionNote}
                onChange={(e) => setInterventionNote(e.target.value)}
                className="w-full p-3 text-xs bg-neutral-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-md transition"
            >
              <Send className="w-3.5 h-3.5 text-[#CFE362]" />
              <span>{submitting ? 'Dispatching...' : 'Dispatch Intervention Order'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
