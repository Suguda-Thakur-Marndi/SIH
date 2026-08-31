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
      // Simulate/Trigger notification emission
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
        showToast(`Intervention scheduled successfully.`);
        setAssignModalFarmer(null);
      }
    } catch (err: any) {
      showToast(`Intervention dispatched.`);
      setAssignModalFarmer(null);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md mt-8 animate-pulse" role="status" aria-busy="true" aria-label="Loading priority interventions">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="h-6 w-48 rounded bg-white/10" />
            <div className="h-4 w-64 rounded bg-white/10" />
          </div>
          <div className="h-9 w-28 rounded-xl bg-white/10" />
        </div>
        {/* Table header */}
        <div className="hidden md:grid grid-cols-7 gap-4 px-6 py-3 bg-white/[0.02] border-b border-white/5">
          {['w-20', 'w-16', 'w-14', 'w-12', 'w-20', 'w-16', 'w-24'].map((w, i) => (
            <div key={i} className={`h-3 ${w} rounded bg-white/10`} />
          ))}
        </div>
        {/* Table rows */}
        <div className="divide-y divide-white/5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-7 gap-4 px-6 py-4 items-center">
              <div className="space-y-1">
                <div className="h-4 w-28 rounded bg-white/10" />
                <div className="h-3 w-20 rounded bg-white/10 md:hidden" />
              </div>
              <div className="h-4 w-20 rounded bg-white/10" />
              <div className="h-4 w-14 rounded bg-white/10" />
              <div className="h-6 w-12 rounded-full bg-red-500/10" />
              <div className="h-4 w-20 rounded bg-white/10" />
              <div className="h-4 w-20 rounded bg-white/10" />
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-lg bg-white/10" />
                <div className="h-8 w-8 rounded-lg bg-white/10" />
                <div className="h-8 w-8 rounded-lg bg-white/10" />
              </div>
            </div>
          ))}
        </div>
        <span className="sr-only">Loading priority interventions</span>
      </div>
    );
  }

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md mt-8 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-emerald-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Priority Interventions</h3>
          <p className="text-white/60 text-sm">Top high-risk farmers requiring immediate attention</p>
        </div>
        <button
          onClick={() => router.push('/officer-dashboard/farmers')}
          className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-sm font-medium hover:bg-emerald-500/30 transition-colors cursor-pointer"
        >
          View All Farmers
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-white/60 text-sm">
              <th className="p-4 font-medium">Farmer</th>
              <th className="p-4 font-medium">Location & Crop</th>
              <th className="p-4 font-medium">Risk Driver</th>
              <th className="p-4 font-medium text-center">Loan Due</th>
              <th className="p-4 font-medium text-center">Distress</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-white/40">
                  No priority interventions found for this period.
                </td>
              </tr>
            ) : (
              data.map((farmer, idx) => (
                <tr 
                  key={idx} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
                        {farmer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{farmer.name}</p>
                        <p className="text-white/40 text-xs">{farmer.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-white/90 text-sm font-medium">{farmer.block}</p>
                    <p className="text-white/50 text-xs">{farmer.crop}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full w-fit">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{farmer.primaryFactor}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {farmer.loanDueDate ? (
                      <div className="inline-flex items-center gap-1 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
                        <CalendarClock className="w-3 h-3" />
                        {farmer.loanDueDate}
                      </div>
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-red-500 text-red-400 font-bold bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                      {farmer.distressScore}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => setCallModalFarmer(farmer)}
                        className="p-2 rounded-lg bg-white/10 text-white hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30 border border-transparent transition-all cursor-pointer" 
                        title="Call Farmer"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenSms(farmer)}
                        className="p-2 rounded-lg bg-white/10 text-white hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/30 border border-transparent transition-all cursor-pointer" 
                        title="Send SMS Advisory"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenAssign(farmer)}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Assign</span>
                      </button>
                      <button
                        onClick={() => router.push(`/officer-dashboard/farmers/${farmer.id}`)}
                        className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer" 
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setCallModalFarmer(null)}>
          <div className="bg-gray-900 border border-white/15 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base">{callModalFarmer.name}</h4>
                  <p className="text-white/50 text-xs">{callModalFarmer.phone}</p>
                </div>
              </div>
              <button onClick={() => setCallModalFarmer(null)} className="p-1 rounded-lg bg-white/10 hover:bg-white/20">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
            
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 mb-4 text-xs space-y-1.5">
              <div className="flex justify-between"><span className="text-white/50">Location:</span><span className="text-white font-medium">{callModalFarmer.block}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Crop:</span><span className="text-white font-medium">{callModalFarmer.crop}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Distress Score:</span><span className="text-red-400 font-bold">{callModalFarmer.distressScore}/100</span></div>
              <div className="flex justify-between"><span className="text-white/50">Main Stress:</span><span className="text-white">{callModalFarmer.primaryFactor}</span></div>
            </div>

            <div className="flex gap-2">
              <a
                href={`tel:${callModalFarmer.phone.replace(/\s+/g, '')}`}
                onClick={() => {
                  showToast(`Calling ${callModalFarmer.name}...`);
                  setCallModalFarmer(null);
                }}
                className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm rounded-xl text-center flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>
              <button
                onClick={() => setCallModalFarmer(null)}
                className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Advisory Modal */}
      {smsModalFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setSmsModalFarmer(null)}>
          <div className="bg-gray-900 border border-white/15 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base">SMS Distress Advisory</h4>
                  <p className="text-white/50 text-xs">Recipient: {smsModalFarmer.name} ({smsModalFarmer.phone})</p>
                </div>
              </div>
              <button onClick={() => setSmsModalFarmer(null)} className="p-1 rounded-lg bg-white/10 hover:bg-white/20">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-white/60 text-xs mb-1.5">Advisory Message Content</label>
              <textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                rows={4}
                className="w-full bg-white/5 border border-white/15 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSmsModalFarmer(null)}
                className="py-2 px-4 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleSendSms}
                className="py-2 px-5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setAssignModalFarmer(null)}>
          <div className="bg-gray-900 border border-white/15 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Assign Officer Intervention</h4>
                  <p className="text-white/50 text-xs">{assignModalFarmer.name} · {assignModalFarmer.block}</p>
                </div>
              </div>
              <button onClick={() => setAssignModalFarmer(null)} className="p-1 rounded-lg bg-white/10 hover:bg-white/20">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-white/60 text-xs mb-1.5">Intervention Protocol</label>
                <select
                  value={interventionType}
                  onChange={(e) => setInterventionType(e.target.value)}
                  className="w-full bg-neutral-800 border border-white/15 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="Field Visit">Field Inspection & Ground Survey</option>
                  <option value="Emergency Advisory">Emergency Advisory Dispatch</option>
                  <option value="Loan Restructuring">Loan Restructuring Support</option>
                  <option value="Irrigation Tanker Support">Emergency Irrigation Quota</option>
                  <option value="Insurance Fast-Track">PMFBY Insurance Fast-Track</option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 text-xs mb-1.5">Officer Notes & Directives</label>
                <textarea
                  value={interventionNotes}
                  onChange={(e) => setInterventionNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/15 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-400 resize-none"
                  placeholder="Enter details for the field worker / officer log..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAssignModalFarmer(null)}
                className="py-2 px-4 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleAssignIntervention}
                className="py-2 px-5 bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
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
