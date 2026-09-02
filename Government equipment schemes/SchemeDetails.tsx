'use client';

import React, { useState } from 'react';
import { Scheme, FarmerProfile } from './types';
import { EligibilityBadge } from './components/EligibilityBadge';
import { useLanguage } from '@/lib/language-context';
import { FarmerProfileCard } from './components/FarmerProfileCard';
import { DocumentChecklist } from './components/DocumentChecklist';
import { ApplicationTimeline } from './components/ApplicationTimeline';
import { VoiceButton } from './components/VoiceButton';

interface SchemeDetailsProps {
  scheme: Scheme;
  farmerProfile: FarmerProfile;
  isSimpleText: boolean;
  onBack: () => void;
  onApply: (id: string) => void;
  onToggleDocReady: (schemeId: string, docId: string) => void;
}

export const SchemeDetails: React.FC<SchemeDetailsProps> = ({
  scheme,
  farmerProfile,
  isSimpleText,
  onBack,
  onApply,
  onToggleDocReady,
}) => {
  const { t } = useLanguage();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const missingDocs = scheme.documents.filter((d) => d.status === 'missing');
  const isApplied =
    scheme.applicationStatus && scheme.applicationStatus !== 'not_applied';

  const handleApplyClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onApply(scheme.id);
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }, 600);
  };

  const detailNarrationText = `${scheme.name} ଯୋଜନା ବିଷୟରେ: ${scheme.benefitSummary}। ଆପଣଙ୍କ ଯୋଗ୍ୟତା ${scheme.eligibilityPercent} ପ୍ରତିଶତ ଅଛି।`;

  return (
    <div className="w-full space-y-6">
      {/* Top Bar: Back navigation + Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/90 hover:bg-white text-[#1A1A1A] border border-gray-200 shadow-sm transition-all cursor-pointer min-h-[44px]"
        >
          <span>←</span>
          <span>{t('schemeDetails.back_to_schemes')}</span>
        </button>

        <div className="flex items-center gap-2.5">
          <VoiceButton textToRead={detailNarrationText} />
          <EligibilityBadge percent={scheme.eligibilityPercent} size="lg" />
        </div>
      </div>

      {/* Main Header Card */}
      <div className="p-6 md:p-8 rounded-[28px] bg-white/90 border border-white/90 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
          {scheme.category}
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1A1A1A] mb-2">
          {scheme.name}
        </h1>
        <p className="text-xs text-[#6B6B66] font-medium">{scheme.department}</p>

        {/* Highlight Benefit Bar */}
        <div className="mt-5 p-4 rounded-2xl bg-[#F8F8F6] border border-gray-200/80 text-[#1A1A1A] flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-xs text-[#6B6B66] font-semibold block mb-0.5">
              {isSimpleText ? t('schemeDetails.cash_benefit_amount') : t('schemeDetails.eligible_benefit')}
            </span>
            <span className="font-extrabold text-emerald-800 text-sm md:text-base">
              {scheme.benefitSummary}
            </span>
          </div>
          {isApplied && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
              {t('schemeDetails.application_submitted')}
            </span>
          )}
        </div>
      </div>

      {/* Two-Column Grid for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Details) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: About */}
          <div className="p-6 rounded-[24px] bg-white/90 border border-white/90 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide mb-2.5 flex items-center gap-2">
              <span>📖</span>
              <span>{t('schemeDetails.about_scheme')}</span>
            </h2>
            <p className="text-sm text-[#4A4A4A] leading-relaxed font-medium">
              {scheme.fullDescription}
            </p>
          </div>

          {/* Section 2: Why You Qualify */}
          <div className="p-6 rounded-[24px] bg-white/90 border border-white/90 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide flex items-center gap-2">
                <span>🎯</span>
                <span>{t('schemeDetails.why_you_qualify')} ({scheme.eligibilityPercent}% Match)</span>
              </h2>
              <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {t('schemeDetails.personalized')}
              </span>
            </div>

            <div className="space-y-2.5">
              {scheme.eligibilityCriteria.map((criterion) => (
                <div
                  key={criterion.id}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                    criterion.matched
                      ? 'bg-emerald-50/60 border-emerald-200 text-[#1A1A1A]'
                      : 'bg-amber-50/60 border-amber-200 text-[#1A1A1A]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      criterion.matched
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {criterion.matched ? '✓' : '!'}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-[#1A1A1A] block">
                      {criterion.label}
                    </span>
                    <p className="text-xs text-[#6B6B66] mt-0.5 font-medium">
                      {criterion.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Benefits */}
          <div className="p-6 rounded-[24px] bg-white/90 border border-white/90 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide mb-3.5 flex items-center gap-2">
              <span>🎁</span>
              <span>{t('schemeDetails.key_scheme_benefits')}</span>
            </h2>
            <ul className="space-y-2.5">
              {scheme.benefits.map((benefit, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-xs md:text-sm text-[#4A4A4A] font-medium"
                >
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4: Required Documents */}
          <div className="p-6 rounded-[24px] bg-white/90 border border-white/90 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide mb-3.5 flex items-center gap-2">
              <span>📁</span>
              <span>{t('schemeDetails.required_documents')}</span>
            </h2>
            <DocumentChecklist
              schemeId={scheme.id}
              documents={scheme.documents}
              onToggleReady={onToggleDocReady}
            />
          </div>
        </div>

        {/* Right Column (Sidebar for Desktop: Profile & Status & Sticky CTA) */}
        <div className="space-y-6">
          <FarmerProfileCard profile={farmerProfile} />

          {/* Application Tracking */}
          {isApplied && <ApplicationTimeline scheme={scheme} />}

          {/* Application CTA Card */}
          <div className="p-6 rounded-[24px] bg-white/90 border border-white/90 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] sticky top-6">
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-1.5">
              {isApplied ? 'Application Status' : 'Ready to apply?'}
            </h3>
            <p className="text-xs text-[#6B6B66] mb-4 font-medium">
              {isApplied
                ? 'Your application is progressing. You will receive SMS alerts on your registered mobile number.'
                : 'Smart Crop pre-fills your verified land and crop credentials.'}
            </p>

            {isApplied ? (
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs">
                <span className="font-bold block mb-1">Status: Active</span>
                <p>Tracking under Application ID: #{scheme.id.toUpperCase()}-2026</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleApplyClick}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-[#CFE362] hover:bg-[#c2d755] text-[#1A1A1A] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <span>{t('schemeDetails.apply_for_scheme')}</span>
              </button>
            )}

            {missingDocs.length > 0 && !isApplied && (
              <p className="text-[11px] text-amber-700 font-medium mt-2.5 text-center">
                ⚠️ Note: {missingDocs.length} document(s) not marked ready. You can still apply and verify later.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal Sheet */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-[28px] bg-white border border-gray-200 shadow-2xl space-y-4 text-[#1A1A1A]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                <span>📝</span>
                <span>{t('schemeDetails.confirm_application')}</span>
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8F8F6] border border-gray-200/80 text-xs text-[#1A1A1A]">
              <span className="font-bold block">{scheme.name}</span>
              <p className="mt-1 text-[#6B6B66]">{scheme.benefitSummary}</p>
            </div>

            <div className="text-xs text-[#4A4A4A] space-y-2 font-medium">
              <p>
                <strong className="text-[#1A1A1A]">Applicant:</strong> {farmerProfile.name} ({farmerProfile.district}, {farmerProfile.state})
              </p>
              <p>
                <strong className="text-[#1A1A1A]">Crop & Land:</strong> {farmerProfile.crop} · {farmerProfile.landArea}
              </p>
              {missingDocs.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                  ⚠️ {missingDocs.length} document(s) pending. Smart Crop will initiate submission with currently available records.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 text-[#4A4A4A] hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#CFE362] hover:bg-[#c2d755] text-[#1A1A1A] shadow-sm flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                    {t('schemeDetails.submitting')}
                  </>
                ) : (
                  t('schemeDetails.confirm_application')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeDetails;
