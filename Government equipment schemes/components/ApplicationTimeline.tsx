'use client';

import React from 'react';
import { Scheme } from '../types';

import { useLanguage } from '@/lib/language-context';
interface ApplicationTimelineProps {
  scheme: Scheme;
}

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ scheme }) => {
  const { t } = useLanguage();
  const currentStage = scheme.applicationStage || 'submitted';

  const stages = [
    {
      id: 'submitted',
      label: 'Application Submitted',
      date: scheme.submittedDate || 'Recent',
      description: 'Submitted online via Smart Crop portal',
    },
    {
      id: 'verification',
      label: 'Field / e-KYC Verification',
      date: currentStage === 'verification' ? 'In Progress' : currentStage === 'approved' ? 'Completed' : 'Pending',
      description: 'District Agriculture Officer review & Land check',
    },
    {
      id: 'approved',
      label: 'Direct Benefit Disbursal',
      date: currentStage === 'approved' ? 'Disbursed' : 'Awaiting Approval',
      description: 'Funds / Subsidy credited to Aadhaar bank account',
    },
  ];

  const getStageStatus = (stageId: string) => {
    if (scheme.applicationStage === 'rejected') {
      if (stageId === 'submitted') return 'completed';
      if (stageId === 'verification') return 'rejected';
      return 'pending';
    }

    if (currentStage === 'approved') return 'completed';
    if (currentStage === 'verification') {
      if (stageId === 'submitted') return 'completed';
      if (stageId === 'verification') return 'current';
      return 'pending';
    }
    // submitted
    if (stageId === 'submitted') return 'current';
    return 'pending';
  };

  return (
    <div className="p-5 rounded-[24px] bg-white/90 border border-gray-200/80 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-[#1A1A1A] text-sm flex items-center gap-2">
          <span>📍</span>
          <span>{t('application_progress', 'Application Progress')}{' '}</span>
        </h4>
        <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Est: {scheme.estimatedDays || '7–10 days'}
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
        {stages.map((stage) => {
          const status = getStageStatus(stage.id);

          let circleClasses = 'bg-gray-100 border-gray-300 text-gray-500';
          let titleClasses = 'text-gray-500';

          if (status === 'completed') {
            circleClasses = 'bg-emerald-600 border-emerald-600 text-white';
            titleClasses = 'text-emerald-800 font-bold';
          } else if (status === 'current') {
            circleClasses = 'bg-[#CFE362] border-[#b8ce4e] text-[#1A1A1A] animate-pulse';
            titleClasses = 'text-[#1A1A1A] font-bold';
          } else if (status === 'rejected') {
            circleClasses = 'bg-rose-500 border-rose-500 text-white';
            titleClasses = 'text-rose-600 font-bold';
          }

          return (
            <div key={stage.id} className="relative">
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${circleClasses}`}
              >
                {status === 'completed' ? '✓' : status === 'rejected' ? '✗' : '•'}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${titleClasses}`}>{stage.label}</span>
                  <span className="text-[11px] text-[#6B6B66] font-medium">{stage.date}</span>
                </div>
                <p className="text-[11px] text-[#8C8C88] mt-0.5">{stage.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {scheme.applicationStage === 'rejected' && scheme.rejectionReason && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <span className="font-bold block mb-1">{t('reason_for_action_required', 'Reason for Action Required:')}{' '}</span>
          <p>{scheme.rejectionReason}</p>
        </div>
      )}
    </div>
  );
};

export default ApplicationTimeline;
