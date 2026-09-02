'use client';

import React from 'react';
import { FarmerProfile } from '../types';

import { useLanguage } from '@/lib/language-context';
interface FarmerProfileCardProps {
  profile: FarmerProfile;
  className?: string;
}

export const FarmerProfileCard: React.FC<FarmerProfileCardProps> = ({
  profile,
  className = '',
}) => {
  const { t } = useLanguage();
  return (
    <div
      className={`p-5 rounded-[24px] border border-gray-200/80 bg-white/90 backdrop-blur-md text-[#1A1A1A] shadow-[0_8px_24px_rgba(0,0,0,0.06)] ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#1A1A1A] text-[#CFE362] flex items-center justify-center font-bold text-base shadow-sm">
            👨‍🌾
          </div>
          <div>
            <h4 className="font-bold text-[#1A1A1A] text-sm">{profile.name}</h4>
            <p className="text-xs text-[#6B6B66]">{t('matched_farmer_profile', 'Matched Farmer Profile')}{' '}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          {profile.category}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="bg-[#F8F8F6] p-2.5 rounded-xl border border-gray-200/60">
          <span className="text-[#6B6B66] block font-medium">Location</span>
          <span className="font-semibold text-[#1A1A1A]">
            {profile.district}, {profile.state}
          </span>
        </div>
        <div className="bg-[#F8F8F6] p-2.5 rounded-xl border border-gray-200/60">
          <span className="text-[#6B6B66] block font-medium">{t('land_size', 'Land Size')}{' '}</span>
          <span className="font-semibold text-[#1A1A1A]">{profile.landArea}</span>
        </div>
        <div className="bg-[#F8F8F6] p-2.5 rounded-xl border border-gray-200/60">
          <span className="text-[#6B6B66] block font-medium">{t('primary_crop', 'Primary Crop')}{' '}</span>
          <span className="font-semibold text-[#1A1A1A]">{profile.crop}</span>
        </div>
        <div className="bg-[#F8F8F6] p-2.5 rounded-xl border border-gray-200/60">
          <span className="text-[#6B6B66] block font-medium">{t('distress_risk', 'Distress Risk')}{' '}</span>
          <span className="font-bold text-[#E4574B]">
            🔴 {profile.distressRiskScore}/100 High
          </span>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfileCard;
