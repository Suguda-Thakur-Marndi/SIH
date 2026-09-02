'use client';

import React from 'react';
import Image from 'next/image';
import { useSchemeStore } from './store';
import { SchemeCategory } from './types';
import SchemeHero from './components/SchemeHero';
import CategoryFilter from './components/CategoryFilter';
import SchemeCard from './components/SchemeCard';
import SchemeDetails from './SchemeDetails';

import { useLanguage } from '@/lib/language-context';
export const SchemeHub: React.FC = () => {
  const { t } = useLanguage();
  const {
    schemes,
    farmerProfile,
    activeCategory,
    selectedSchemeId,
    isSimpleText,
    setFilter,
    setSelectedScheme,
    applyScheme,
    toggleDocumentReady,
    toggleSimpleText,
  } = useSchemeStore();

  const categories: SchemeCategory[] = [
    'All',
    'Crop Support',
    'Equipment Subsidy',
    'Irrigation Support',
    'Insurance Support',
    'Financial Assistance',
    'Farmer Welfare',
  ];

  // Calculate scheme counts per category
  const categoryCounts = categories.reduce((acc, cat) => {
    if (cat === 'All') {
      acc[cat] = schemes.length;
    } else {
      acc[cat] = schemes.filter((s) => s.category === cat).length;
    }
    return acc;
  }, {} as Record<SchemeCategory, number>);

  // Filter schemes
  const filteredSchemes =
    activeCategory === 'All'
      ? schemes
      : schemes.filter((s) => s.category === activeCategory);

  const selectedScheme = schemes.find((s) => s.id === selectedSchemeId);
  const topMatchPercent = schemes.reduce(
    (max, s) => (s.eligibilityPercent > max ? s.eligibilityPercent : max),
    0
  );

  return (
    <div className="relative min-h-screen font-sans text-[#1A1A1A]">
      {/* Full-viewport Ambient Fixed Background Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Desktop / Landscape (1(1).png) */}
        <div className="hidden md:block absolute inset-0">
          <Image
            src="/government-equipment-schemes/img/1(1).png"
            alt="Schemes Background Desktop"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        {/* Mobile / 9:16 Portrait (3.png) */}
        <div className="block md:hidden absolute inset-0">
          <Image
            src="/government-equipment-schemes/img/3.png"
            alt="Schemes Background Mobile"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        {/* Ambient overlay identical to officer dashboard */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
      </div>

      {/* Page Content Shell Container */}
      <div className="relative z-10 p-4 md:p-6 min-h-screen max-w-7xl mx-auto flex flex-col gap-6">
        {selectedScheme ? (
          <SchemeDetails
            scheme={selectedScheme}
            farmerProfile={farmerProfile}
            isSimpleText={isSimpleText}
            onBack={() => setSelectedScheme(null)}
            onApply={applyScheme}
            onToggleDocReady={toggleDocumentReady}
          />
        ) : (
          <>
            {/* Hero Section */}
            <SchemeHero
              farmerName={farmerProfile.name}
              district={farmerProfile.district}
              crop={farmerProfile.crop}
              landArea={farmerProfile.landArea}
              matchCount={schemes.length}
              topMatchPercent={topMatchPercent}
              isSimpleText={isSimpleText}
              onToggleSimpleText={toggleSimpleText}
            />

            {/* Category Filter Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs uppercase font-bold tracking-wider text-[#6B6B66]">
                  {t('filter_by_category', 'Filter by Category')}
                </h2>
                <span className="text-xs text-[#6B6B66] font-medium">
                  Showing {filteredSchemes.length} of {schemes.length} schemes
                </span>
              </div>
              <CategoryFilter
                categories={categories}
                activeCategory={activeCategory}
                categoryCounts={categoryCounts}
                onSelectCategory={setFilter}
              />
            </div>

            {/* Schemes Cards Grid */}
            {filteredSchemes.length === 0 ? (
              <div className="p-12 text-center rounded-[28px] bg-white/80 border border-white/80 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                <span className="text-4xl block mb-3">🌾</span>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">
                  No schemes match this category yet
                </h3>
                <p className="text-xs text-[#6B6B66] max-w-md mx-auto mb-4 font-medium">
                  We are actively scanning government databases for new support schemes matching your profile.
                </p>
                <button
                  onClick={() => setFilter('All')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#CFE362] text-[#1A1A1A] hover:bg-[#c2d755] transition-colors shadow-sm"
                >
                  View All Schemes ({schemes.length})
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSchemes.map((scheme) => (
                  <SchemeCard
                    key={scheme.id}
                    scheme={scheme}
                    onViewDetails={(id) => setSelectedScheme(id)}
                    isSimpleText={isSimpleText}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SchemeHub;
