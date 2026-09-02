'use client';

import React from 'react';
import { VoiceButton } from './VoiceButton';
import { EligibilityBadge } from './EligibilityBadge';

import { useLanguage } from '@/lib/language-context';
interface SchemeHeroProps {
  farmerName: string;
  district: string;
  crop: string;
  landArea: string;
  matchCount: number;
  topMatchPercent: number;
  isSimpleText: boolean;
  onToggleSimpleText: () => void;
}

export const SchemeHero: React.FC<SchemeHeroProps> = ({
  farmerName,
  district,
  crop,
  landArea,
  matchCount,
  topMatchPercent,
  isSimpleText,
  onToggleSimpleText,
}) => {
  const { t } = useLanguage();
  const narrationText = `ନମସ୍କାର ${farmerName}। ଆପଣଙ୍କ ଫସଲ ${crop}, ଜମି ${landArea} ଏବଂ ମୟୂରଭଞ୍ଜ ଜିଲ୍ଲା ଆଧାରରେ ଆପଣଙ୍କ ପାଇଁ ${matchCount} ଟି ସରକାରୀ ଯୋଜନା ଉପଲବ୍ଧ ଅଛି। ସର୍ବାଧିକ ${topMatchPercent} ପ୍ରତିଶତ ଯୋଗ୍ୟତା ଅଛି।`;

  return (
    <div className="relative w-full rounded-[28px] overflow-hidden border border-white/80 bg-white/80 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] p-6 md:p-8">
      {/* Hero Content */}
      <div className="flex flex-col justify-between gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A1A] text-[#CFE362] text-xs font-bold mb-3 shadow-sm">
              <span>🏛️</span>
              <span>{t('government_schemes_subsidies', 'Government Schemes & Subsidies')}{' '}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
              Support for you
            </h1>
            <p className="text-[#4A4A4A] text-sm mt-1 flex items-center gap-1.5 font-medium">
              <span>👨‍🌾</span> {farmerName} · {district} · {crop} · {landArea}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onToggleSimpleText}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-sm ${
                isSimpleText
                  ? 'bg-[#CFE362] text-[#1A1A1A] border-[#b4ca4c] font-bold'
                  : 'bg-white text-[#4A4A4A] border-gray-200 hover:text-[#1A1A1A] hover:bg-gray-50'
              }`}
            >
              {isSimpleText ? '✓ Simple Mode ON' : 'Aa Simple Text'}
            </button>
            <EligibilityBadge percent={topMatchPercent} size="lg" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-t border-gray-200/80 pt-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[#1A1A1A] font-bold text-lg">
                {matchCount} schemes match your profile
              </span>
              <span className="text-gray-300 text-xs hidden sm:inline">|</span>
              <span className="text-[#6B6B66] text-xs font-medium hidden sm:inline">
                Top match: {topMatchPercent}% eligibility
              </span>
            </div>
            <p className="text-[#6B6B66] text-xs md:text-sm mt-1 max-w-xl">
              {isSimpleText
                ? 'Your crop, land size, and district qualify you for direct cash, machine subsidy, and crop insurance.'
                : "Based on your crop, land and district, here's what you may be entitled to."}
            </p>
          </div>

          <VoiceButton textToRead={narrationText} />
        </div>
      </div>
    </div>
  );
};

export default SchemeHero;
