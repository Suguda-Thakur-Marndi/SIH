'use client';

import React from 'react';
import { Scheme } from '../types';
import { EligibilityBadge } from './EligibilityBadge';

import { useLanguage } from '@/lib/language-context';
interface SchemeCardProps {
  scheme: Scheme;
  onViewDetails: (id: string) => void;
  isSimpleText?: boolean;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  onViewDetails,
  isSimpleText = false,
}) => {
  const { t } = useLanguage();
  const readyDocsCount = scheme.documents.filter((d) => d.status === 'ready').length;
  const totalDocsCount = scheme.documents.length;
  const isAllDocsReady = readyDocsCount === totalDocsCount;

  const getStatusBadge = () => {
    switch (scheme.applicationStatus) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
            {t('submitted', 'Submitted')}
          </span>
        );
      case 'verification':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {t('under_verification', 'Under Verification')}
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            ✓ Approved & Active
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group relative flex flex-col justify-between p-6 rounded-[24px] bg-white/90 border border-white/90 hover:border-emerald-300/80 hover:bg-white transition-all duration-300 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-lg">
      <div>
        {/* Header: Department + Badge / Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
              {scheme.category}
            </span>
            <p className="text-xs text-[#6B6B66] line-clamp-1 font-medium">{scheme.department}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <EligibilityBadge percent={scheme.eligibilityPercent} size="sm" />
            {getStatusBadge()}
          </div>
        </div>

        {/* Scheme Title */}
        <h3 className="text-base font-bold text-[#1A1A1A] group-hover:text-emerald-800 transition-colors line-clamp-2 mb-2.5">
          {scheme.name}
        </h3>

        {/* Benefit Callout */}
        <div className="p-3.5 rounded-xl bg-[#F8F8F6] border border-gray-200/70 text-[#1A1A1A] text-xs mb-3.5">
          <span className="font-bold text-[#1A1A1A] block mb-0.5">
            {isSimpleText ? '💰 Cash / Benefit:' : '✨ Direct Benefit:'}
          </span>
          <p className="line-clamp-2 text-[#4A4A4A] font-medium">{scheme.benefitSummary}</p>
        </div>

        {/* Matched Criteria Bullet point */}
        {scheme.eligibilityCriteria.length > 0 && (
          <div className="text-xs text-[#4A4A4A] mb-3.5 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span className="line-clamp-1 font-medium">{scheme.eligibilityCriteria[0].detail}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer: Documents readiness & Action button */}
      <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between gap-2 mt-2">
        <div className="text-xs">
          <span className="text-[#6B6B66] font-medium">Documents: </span>
          <span
            className={`font-bold ${
              isAllDocsReady ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {readyDocsCount}/{totalDocsCount} Ready
          </span>
        </div>

        <button
          onClick={() => onViewDetails(scheme.id)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#CFE362] hover:bg-[#c2d755] text-[#1A1A1A] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer min-h-[40px]"
        >
          <span>{scheme.applicationStatus === 'not_applied' ? t('schemeCard.view_details') : t('schemeCard.track_status')}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default SchemeCard;
