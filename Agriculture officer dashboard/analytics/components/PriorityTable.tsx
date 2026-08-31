"use client";

import React, { useState } from 'react';
import { Phone, MessageSquare, UserPlus, AlertCircle, CalendarClock, Eye, X, CheckCircle2, Loader2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
}

interface Props {
  data: Farmer[] | null;
  loading: boolean;
}

export function PriorityTable({ data, loading }: Props) {
  const router = useRouter();

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
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-0.5">Priority Interventions Queue</h3>
          <p className="text-slate-600 text-xs font-medium">Top high-risk farmers requiring immediate agronomic or financial outreach</p>
        </div>
        <button
          onClick={() => router.push('/officer-dashboard/farmers')}
          className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300/80 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          View All Farmers Directory ↗
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-100/80 border-b border-black/10 text-slate-600 text-xs font-bold uppercase tracking-wider">
              <th className="p-4">Farmer Dossier</th>
              <th className="p-4">Location & Crop</th>
              <th className="p-4">Primary Distress Driver</th>
              <th className="p-4 text-center">Loan Due</th>
              <th className="p-4 text-center">Distress Score</th>
              <th className="p-4 text-right">Quick Triage Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 text-xs font-semibold">
                  No priority interventions flagged for this time range.
                </td>
              </tr>
            ) : (
              data.map((farmer, idx) => (
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
                        <p className="text-slate-900 font-extrabold text-sm">{farmer.name}</p>
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
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-red-500 text-red-700 font-black text-sm bg-red-50 shadow-sm">
                      {farmer.distressScore}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => setCallModalFarmer(farmer)}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer shadow-2xs" 
                        title="Call Farmer"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenSms(farmer)}
                        className="p-2 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer shadow-2xs" 
                        title="Send SMS Advisory"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenAssign(farmer)}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Assign</span>
                      </button>
                      <button
                        onClick={() => router.push(`/officer-dashboard/farmers?q=${encodeURIComponent(farmer.name.split(" ")[0])}`)}
                        className="p-2 rounded-xl bg-neutral-100 text-slate-700 hover:bg-neutral-200 border border-black/10 transition-colors cursor-pointer shadow-2xs" 
                        title="View Details Dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
              <div className="flex justify-between"><span className="text-slate-500 font-semibold">Location:</span><span className="text-slate-900 font-bold">{callModalFarmer.block}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-semibold">Crop:</span><span className="text-emerald-800 font-bold">{callModalFarmer.crop}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-semibold">Distress Score:</span><span className="text-red-700 font-black">{callModalFarmer.distressScore}/100</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-semibold">Main Stress:</span><span className="text-slate-800 font-bold">{callModalFarmer.primaryFactor}</span></div>
            </div>

            <div className="flex gap-2">
              <a
                href={`tel:${callModalFarmer.phone.replace(/\s+/g, '')}`}
                onClick={() => {
                  showToast(`Calling ${callModalFarmer.name}...`);
                  setCallModalFarmer(null);
                }}
                className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl text-center flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>
              <button
                onClick={() => setCallModalFarmer(null)}
                className="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-2xl transition-colors border border-black/10"
              >
                Cancel
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
                  <h4 className="font-black text-base text-slate-900">SMS Distress Advisory</h4>
                  <p className="text-slate-500 text-xs font-semibold">Recipient: {smsModalFarmer.name} ({smsModalFarmer.phone})</p>
                </div>
              </div>
              <button onClick={() => setSmsModalFarmer(null)} className="p-1.5 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-slate-600 text-xs font-bold mb-1.5">Advisory Message Content</label>
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
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleSendSms}
                className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Send SMS</span>
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
                  <h4 className="font-black text-base text-slate-900">Assign Officer Intervention</h4>
                  <p className="text-slate-500 text-xs font-semibold">{assignModalFarmer.name} &bull; {assignModalFarmer.block}</p>
                </div>
              </div>
              <button onClick={() => setAssignModalFarmer(null)} className="p-1.5 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Intervention Protocol</label>
                <select
                  value={interventionType}
                  onChange={(e) => setInterventionType(e.target.value)}
                  className="w-full bg-neutral-50 border border-black/10 rounded-2xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                >
                  <option value="Field Visit">Field Inspection & Ground Survey</option>
                  <option value="Emergency Advisory">Emergency Advisory Dispatch</option>
                  <option value="Loan Restructuring">Loan Restructuring Support</option>
                  <option value="Irrigation Tanker Support">Emergency Irrigation Quota</option>
                  <option value="Insurance Fast-Track">PMFBY Insurance Fast-Track</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Officer Notes & Directives</label>
                <textarea
                  value={interventionNotes}
                  onChange={(e) => setInterventionNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-50 border border-black/10 rounded-2xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="Enter details for the field worker / officer log..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAssignModalFarmer(null)}
                className="py-2 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-2xl transition-colors border border-black/10"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleAssignIntervention}
                className="py-2 px-5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Confirm Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
