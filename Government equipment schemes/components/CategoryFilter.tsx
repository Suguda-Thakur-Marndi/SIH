'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';

interface CategoryFilterProps<T extends string> {
  categories: T[];
  activeCategory: T;
  categoryCounts: Record<T, number>;
  onSelectCategory: (category: T) => void;
  /** "scroll" (default) – horizontal scroll bar, used in Government Equipment Schemes.
   *  "sidebar" – switches to a vertical column layout for the notification sidebar rail. */
  variant?: 'scroll' | 'sidebar';
}

export function CategoryFilter<T extends string>({
  categories,
  activeCategory,
  categoryCounts,
  onSelectCategory,
  variant = 'scroll',
}: CategoryFilterProps<T>) {
  const { t } = useLanguage();
  const isSidebar = variant === 'sidebar';

  return (
    <div
      className={
        isSidebar
          ? 'w-full overflow-x-auto py-1 scrollbar-none md:overflow-x-visible md:overflow-y-auto md:flex-col md:gap-2 md:py-2'
          : 'w-full overflow-x-auto py-1 scrollbar-none'
      }
    >
      <div
        className={
          isSidebar
            ? 'flex md:flex-col items-start gap-2 min-w-max'
            : 'flex items-center gap-2 min-w-max'
        }
      >
        {categories.map((category) => {
          const isActive = activeCategory === category;
          const count = categoryCounts[category] || 0;
          const isDisabled = count === 0 && category !== 'All';

          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              disabled={isDisabled}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap border shadow-sm ${
                isActive
                  ? 'bg-[#CFE362] text-[#1A1A1A] border-[#b4ca4c] shadow-sm'
                  : isDisabled
                  ? 'bg-gray-100/70 text-gray-400 border-gray-200/60 opacity-60 cursor-not-allowed'
                  : 'bg-white/90 text-[#4A4A4A] border-gray-200/80 hover:bg-white hover:text-[#1A1A1A] hover:border-gray-300'
              }`}
            >
              <span>{t(`category_${category.toLowerCase().replace(/\s+/g, '_')}`, category)}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] ${
                  isActive
                    ? 'bg-[#1A1A1A]/15 text-[#1A1A1A] font-bold'
                    : 'bg-gray-100 text-gray-600 font-semibold'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryFilter;
