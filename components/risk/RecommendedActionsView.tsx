"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CheckCircle2, Circle, Clock, Sparkles, 
  ShieldCheck, PhoneCall, ExternalLink
} from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/language-context';

export default function RecommendedActionsView() {
  const { t } = useLanguage();
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/farmer/recommendations')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setActions(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleComplete = (id: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, isCompleted: !a.isCompleted } : a));
  };

  const completedCount = actions.filter(a => a.isCompleted).length;
  const progressPct = actions.length ? Math.round((completedCount / actions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F2F2EF] text-[#1A1A1A] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link 
            href="/risk-details" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-black/10 shadow-sm text-sm font-medium hover:bg-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back', 'Back to Risk Details')}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSelector variant="light" />
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1A1A1A] text-[#CFE362] flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              {t('ai_agronomist', 'NVIDIA AI Agronomist')}
            </span>
          </div>
        </div>

        {/* Hero Progress Header */}
        <div className="bg-[#1A1A1A] text-white rounded-[28px] p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#CFE362] uppercase tracking-wider">{t('actionable_directives', 'Actionable Farm Directives')}</span>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                  {t('recommendations', 'Recommended Interventions & Mitigation Plan')}
                </h1>
                <p className="text-neutral-300 text-sm mt-1 max-w-2xl">
                  {t('recommended_actions_subtitle', 'Prescriptive field operations to de-escalate crop distress')}
                </p>
              </div>

              {/* Progress Ring / Bar */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 min-w-[200px] space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-300">{t('tasks_completed', 'Tasks Completed')}</span>
                  <span className="text-[#CFE362] font-bold">{completedCount} / {actions.length} ({progressPct}%)</span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#CFE362] transition-all duration-500 rounded-full" 
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Directives List */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center bg-white/70 rounded-[24px] text-neutral-500 font-medium animate-pulse">
              {t('loading', 'Loading recommended actionable protocols...')}
            </div>
          ) : actions.map((act) => {
            const isHigh = act.priority === 'HIGH';
            return (
              <div 
                key={act.id} 
                className={`p-6 rounded-[24px] transition border shadow-sm ${
                  act.isCompleted 
                    ? 'bg-neutral-100/80 border-neutral-200 opacity-70' 
                    : 'bg-white/85 backdrop-blur-md border-black/5 hover:border-black/15'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3.5 flex-1">
                    <button 
                      onClick={() => toggleComplete(act.id)}
                      className="mt-1 text-neutral-400 hover:text-black transition shrink-0"
                    >
                      {act.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          isHigh 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {isHigh ? t('high', 'High') : t('medium', 'Medium')} {t('priority', 'Priority')}
                        </span>
                        <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                          {act.category}
                        </span>
                        <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {act.timeframe}
                        </span>
                      </div>

                      <h3 className={`text-base font-bold ${act.isCompleted ? 'line-through text-neutral-500' : 'text-neutral-900'}`}>
                        {t(act.titleKey || act.title, act.title)}
                      </h3>

                      <p className="text-xs md:text-sm text-neutral-600 leading-relaxed">
                        {t(act.descriptionKey || act.description, act.description)}
                      </p>

                      <div className="pt-1 flex items-center gap-2 text-xs font-medium text-emerald-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{t('expected_impact', 'Expected Impact')}: {t(act.impactKey || act.impact, act.impact)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Link */}
                  {act.actionUrl && !act.isCompleted && (
                    <Link
                      href={act.actionUrl}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold shrink-0 shadow-sm transition"
                    >
                      <span>{t('execute_portal', 'Execute in Portal')}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#CFE362]" />
                    </Link>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Support Banner */}
        <div className="p-6 rounded-[24px] bg-gradient-to-r from-emerald-900 to-neutral-900 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base font-bold flex items-center justify-center md:justify-start gap-2">
              <PhoneCall className="w-4 h-4 text-[#CFE362]" />
              {t('contact_officer_banner', 'Need Assistance with these Interventions?')}
            </h4>
            <p className="text-xs text-neutral-300">
              {t('hero_subtitle', 'AI-powered crop monitoring, distress risk scoring, and personalized farming guidance.')}
            </p>
          </div>
          <Link
            href="/officer-dashboard"
            className="px-5 py-2.5 rounded-full bg-[#CFE362] hover:bg-[#b8cc4b] text-neutral-950 text-xs font-bold shrink-0 transition"
          >
            {t('officer_portal', 'Contact Officer & Advisory')}
          </Link>
        </div>

      </div>
    </div>
  );
}
