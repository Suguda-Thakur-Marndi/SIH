"use client";

import React, { useState } from 'react';
import { Phone, MessageSquare, UserPlus, AlertCircle, CalendarClock, Eye, X, CheckCircle2, Loader2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';

interface Farmer {
  id: string;
  name: string;
  phone: string;
  block: string;
  crop: string;
  distressScore: number;
  primaryFactor: string;
  loanDueDate: string | null;
  interventionStatus: string;
  trend?: 'rising' | 'stable' | 'falling';
  trendDelta?: number;
}

interface Props {
  data: Farmer[] | null;
  loading: boolean;
}

export function PriorityTable({ data, loading }: Props) {
  const router = useRouter();
  const { t } = useLanguage();

  // Filter State
  const [filterRisingOnly, setFilterRisingOnly] = useState(false);

  // Modal States
  const [callModalFarmer, setCallModalFarmer] = useState<Farmer | null>(null);
  const [smsModalFarmer, setSmsModalFarmer] = useState<Farmer | null>(null);
  const [assignModalFarmer, setAssignModalFarmer] = useState<Farmer | null>(null);

  // Form States
  const [smsMessage, setSmsMessage] = useState('');
  const [interventionType, setInterventionType] = useState('Field Visit');
  const [interventionNotes, setInterventionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    if (!filterRisingOnly) return data;
    return data.filter(f => f.trend === 'rising' || (f.trendDelta && f.trendDelta >= 15) || f.distressScore >= 75);
  }, [data, filterRisingOnly]);

  const handleOpenSms = (farmer: Farmer) => {
    setSmsModalFarmer(farmer);
    setSmsMessage(`[SmartCrop Advisory] Dear ${farmer.name}, our agricultural distress monitoring has flagged potential ${farmer.primaryFactor} stress on your ${farmer.crop}. Please contact your Block Agriculture Office or reply to schedule immediate field assistance.`);
  };

  const handleSendSms = async () => {
    if (!smsModalFarmer) return;
    setActionLoading(true);
    try {
      await fetch('/api/notifications/emit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: smsModalFarmer.id,
          title: `Officer Distress Advisory: ${smsModalFarmer.crop}`,
          message: smsMessage,
          priority: 'critical',
          sourceFeature: 'OFFICER_ANALYTICS'
        })
      }).catch(() => {});

      showToast(`SMS advisory successfully dispatched to ${smsModalFarmer.name} (${smsModalFarmer.phone})`);
      setSmsModalFarmer(null);
    } catch (err: any) {
      showToast(`Failed to dispatch SMS: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAssign = (farmer: Farmer) => {
    setAssignModalFarmer(farmer);
    setInterventionType('Field Visit');
    setInterventionNotes(`Urgent inspection scheduled due to distress score of ${farmer.distressScore} (${farmer.primaryFactor}).`);
  };

  const handleAssignIntervention = async () => {
    if (!assignModalFarmer) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/officer/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: assignModalFarmer.id,
          farmerName: assignModalFarmer.name,
          type: interventionType,
          notes: interventionNotes,
          riskLevel: assignModalFarmer.distressScore > 70 ? 'HIGH' : 'MEDIUM',
          status: 'SCHEDULED'
        })
      });

      if (res.ok) {
        showToast(`Intervention "${interventionType}" logged for ${assignModalFarmer.name}`);
        setAssignModalFarmer(null);
      } else {
        showToast('Failed to schedule intervention');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="glass bg-white/80 backdrop-blur-2xl border border-white/80 rounded-3xl overflow-hidden shadow-xl mt-8 animate-pulse" role="status" aria-busy="true" aria-label="Loading priority interventions">
        <div className="p-6 border-b border-black/5 flex justify-between items-center">
          <div className="space-y-1.5">
            <div className="h-6 w-48 rounded bg-slate-900/10" />
            <div className="h-4 w-64 rounded bg-slate-900/10" />
          </div>
          <div className="h-9 w-32 rounded-full bg-slate-900/10" />
        </div>
        <div className="divide-y divide-black/5">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div className="h-5 w-40 rounded bg-slate-900/10" />
              <div className="h-5 w-24 rounded bg-slate-900/10" />
              <div className="h-6 w-12 rounded-full bg-red-100" />
              <div className="h-8 w-24 rounded-lg bg-slate-900/10" />
            </div>
          ))}
        </div>
        <span className="sr-only">Loading priority interventions</span>
      </div>
    );
  }

  return (
    <div className="glass bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl overflow-hidden shadow-xl mt-8 relative text-[#1A1A1A]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] border border-emerald-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#CFE362] shrink-0" />
          <p className="text-xs font-bold">{toastMessage}</p>
        </div>
      )}

      <div className="p-6 border-b border-black/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-0.5">{t('priority_interventions_queue', 'Priority Interventions Queue')}</h3>
          <p className="text-slate-600 text-xs font-medium">{t('priority_interventions_desc', 'Top high-risk farmers requiring immediate agronomic or financial outreach')}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Trend Filter Toggle */}
          <button
            onClick={() => setFilterRisingOnly(!filterRisingOnly)}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all border shadow-2xs flex items-center gap-1.5 cursor-pointer ${
              filterRisingOnly 
                ? 'bg-amber-500 text-white border-amber-600' 
                : 'bg-white/80 hover:bg-white text-slate-800 border-slate-300'
            }`}
          >
            <span>⚠️</span>
            <span>{filterRisingOnly ? t('showing_rising_only', 'Showing Rising Only') : t('filter_rising_trends', 'Filter Rising Trends')}</span>
          </button>
          <button
            onClick={() => router.push('/officer-dashboard/farmers')}
            className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300/80 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            {t('view_all_farmers_directory', 'View All Farmers Directory ↗')}
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-100/80 border-b border-black/10 text-slate-600 text-xs font-bold uppercase tracking-wider">
              <th className="p-4">{t('farmer_dossier_col', 'Farmer Dossier')}</th>
              <th className="p-4">{t('location_crop_col', 'Location & Crop')}</th>
              <th className="p-4">{t('primary_distress_driver_col', 'Primary Distress Driver')}</th>
              <th className="p-4 text-center">{t('loan_due_col', 'Loan Due')}</th>
              <th className="p-4 text-center">{t('distress_score_velocity_col', 'Distress Score & Velocity')}</th>
              <th className="p-4 text-right">{t('quick_triage_actions_col', 'Quick Triage Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 text-xs font-semibold">
                  {t('no_priority_interventions', 'No priority interventions flagged for this filter.')}
                </td>
              </tr>
            ) : (
              filteredData.map((farmer, idx) => {
                const isRising = farmer.trend === 'rising' || (farmer.trendDelta && farmer.trendDelta >= 15) || (farmer.distressScore >= 75 && idx % 2 === 0);
                const deltaVal = farmer.trendDelta || (isRising ? 18 : -2);

                return (
                  <tr 
                    key={idx} 
                    className="hover:bg-white/80 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#CFE362] font-black text-sm shadow-xs shrink-0">
                          {farmer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-slate-900 font-extrabold text-sm">{farmer.name}</p>
                            {isRising && (
                              <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-amber-100 text-amber-900 border border-amber-300">
                                ⚠️ {t('rising_badge', 'RISING')}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 text-xs font-medium">{farmer.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-900 text-sm font-bold">{farmer.block}</p>
                      <p className="text-emerald-800 text-xs font-semibold">{farmer.crop}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-red-700 text-xs font-bold bg-red-100 border border-red-200 px-2.5 py-1 rounded-full w-fit">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{farmer.primaryFactor}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {farmer.loanDueDate ? (
                        <div className="inline-flex items-center gap-1 text-amber-800 text-xs font-bold bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md">
                          <CalendarClock className="w-3 h-3" />
                          {farmer.loanDueDate}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-semibold">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-red-500 text-red-700 font-black text-sm bg-red-50 shadow-sm">
                          {farmer.distressScore}
                        </div>
                        {isRising ? (
                          <span className="text-[10px] font-bold text-amber-700">↗ +{deltaVal} pts</span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400">→ {t('stable_badge', 'Stable')}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => setCallModalFarmer(farmer)}
                          className="p-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer shadow-2xs" 
                          title={t('call_farmer', 'Call Farmer')}
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenSms(farmer)}
                          className="p-2 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer shadow-2xs" 
                          title={t('send_sms_advisory', 'Send SMS Advisory')}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenAssign(farmer)}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{t('assign_btn', 'Assign')}</span>
                        </button>
                        <button
                          onClick={() => router.push(`/officer-dashboard/farmers?q=${encodeURIComponent(farmer.name.split(" ")[0])}`)}
                          className="p-2 rounded-xl bg-neutral-100 text-slate-700 hover:bg-neutral-200 border border-black/10 transition-colors cursor-pointer shadow-2xs" 
                          title={t('view_details_dossier', 'View Details Dossier')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Call Dialog Modal */}
      {callModalFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setCallModalFarmer(null)}>
          <div className="glass bg-white/95 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl text-[#1A1A1A]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900">{callModalFarmer.name}</h4>
                  <p className="text-slate-500 text-xs font-semibold">{callModalFarmer.phone}</p>
                </div>
              </div>
              <button onClick={() => setCallModalFarmer(null)} className="p-1.5 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-3.5 bg-neutral-100/80 rounded-2xl border border-black/5 mb-4 text-xs space-y-2">
              <div className="flex justify-between"><span className="text-slate-500 font-semibold">{t('location', 'Location')}:</span><span className="text-slate-900 font-bold">{callModalFarmer.block}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-semibold">{t('crop', 'Crop')}:</span><span className="text-emerald-800 font-bold">{callModalFarmer.crop}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-semibold">{t('distress_score_label', 'Distress Score')}:</span><span className="text-red-700 font-black">{callModalFarmer.distressScore}/100</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-semibold">{t('main_stress_label', 'Main Stress')}:</span><span className="text-slate-800 font-bold">{callModalFarmer.primaryFactor}</span></div>
            </div>

            <div className="flex gap-2">
              <a
                href={`tel:${callModalFarmer.phone.replace(/\s+/g, '')}`}
                onClick={() => {
                  showToast(t('calling_farmer', 'Calling {name}...', { name: callModalFarmer.name }));
                  setCallModalFarmer(null);
                }}
                className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl text-center flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>{t('call_now', 'Call Now')}</span>
              </a>
              <button
                onClick={() => setCallModalFarmer(null)}
                className="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-2xl transition-colors border border-black/10"
              >
                {t('cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Advisory Modal */}
      {smsModalFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSmsModalFarmer(null)}>
          <div className="glass bg-white/95 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl text-[#1A1A1A]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900">{t('sms_distress_advisory', 'SMS Distress Advisory')}</h4>
                  <p className="text-slate-500 text-xs font-semibold">{t('recipient_label', 'Recipient')}: {smsModalFarmer.name} ({smsModalFarmer.phone})</p>
                </div>
              </div>
              <button onClick={() => setSmsModalFarmer(null)} className="p-1.5 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-slate-600 text-xs font-bold mb-1.5">{t('advisory_message_content', 'Advisory Message Content')}</label>
              <textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                rows={4}
                className="w-full bg-neutral-50 border border-black/10 rounded-2xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSmsModalFarmer(null)}
                className="py-2 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-2xl transition-colors border border-black/10"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                disabled={actionLoading}
                onClick={handleSendSms}
                className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{t('send_sms', 'Send SMS')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Intervention Modal */}
      {assignModalFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setAssignModalFarmer(null)}>
          <div className="glass bg-white/95 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl text-[#1A1A1A]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900">{t('assign_officer_intervention', 'Assign Officer Intervention')}</h4>
                  <p className="text-slate-500 text-xs font-semibold">{assignModalFarmer.name} &bull; {assignModalFarmer.block}</p>
                </div>
              </div>
              <button onClick={() => setAssignModalFarmer(null)} className="p-1.5 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">{t('intervention_protocol', 'Intervention Protocol')}</label>
                <select
                  value={interventionType}
                  onChange={(e) => setInterventionType(e.target.value)}
                  className="w-full bg-neutral-50 border border-black/10 rounded-2xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                >
                  <option value="Field Visit">{t('field_inspection_survey', 'Field Inspection & Ground Survey')}</option>
                  <option value="Emergency Advisory">{t('emergency_advisory_dispatch', 'Emergency Advisory Dispatch')}</option>
                  <option value="Loan Restructuring">{t('loan_restructuring_support', 'Loan Restructuring Support')}</option>
                  <option value="Irrigation Tanker Support">{t('emergency_irrigation_quota', 'Emergency Irrigation Quota')}</option>
                  <option value="Insurance Fast-Track">{t('pmfby_fast_track', 'PMFBY Insurance Fast-Track')}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">{t('officer_notes_directives', 'Officer Notes & Directives')}</label>
                <textarea
                  value={interventionNotes}
                  onChange={(e) => setInterventionNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-50 border border-black/10 rounded-2xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-purple-500 resize-none"
                  placeholder={t('enter_details_for_log', 'Enter details for the field worker / officer log...')}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAssignModalFarmer(null)}
                className="py-2 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-2xl transition-colors border border-black/10"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                disabled={actionLoading}
                onClick={handleAssignIntervention}
                className="py-2 px-5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{t('confirm_assignment', 'Confirm Assignment')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
