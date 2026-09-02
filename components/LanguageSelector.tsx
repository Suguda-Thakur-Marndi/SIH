'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check, MapPin } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/language-context';

interface LanguageSelectorProps {
  variant?: 'light' | 'dark' | 'glass' | 'compact' | 'floating';
  className?: string;
}

export default function LanguageSelector({
  variant = 'glass',
  className = '',
}: LanguageSelectorProps) {
  const { language, setLanguage, currentLanguageOption, isAutoDetected, detectedLocation } =
    useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  // Floating variant for global persistent switch
  if (variant === 'floating') {
    return (
      <div
        ref={dropdownRef}
        className={`fixed bottom-6 right-6 z-[999999] flex flex-col items-end ${className}`}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="mb-3 w-64 rounded-2xl bg-neutral-900/95 backdrop-blur-2xl border border-white/15 p-2 shadow-2xl text-white overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#CFE362]">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Choose Language</span>
                </div>
                {detectedLocation && (
                  <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    {detectedLocation}
                  </span>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = lang.code === language;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelect(lang.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#CFE362] text-neutral-950 font-bold shadow-sm'
                          : 'text-neutral-200 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{lang.flag}</span>
                        <div className="text-left">
                          <div className="font-semibold">{lang.nativeName}</div>
                          <div
                            className={`text-[10px] ${
                              isSelected ? 'text-neutral-800' : 'text-neutral-400'
                            }`}
                          >
                            {lang.name}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-neutral-950" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-neutral-900/90 hover:bg-neutral-900 text-white backdrop-blur-xl border border-white/20 shadow-xl shadow-black/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group"
          title="Change language / ଭାଷା ବଦଳାନ୍ତୁ / भाषा बदलें"
        >
          <div className="w-6 h-6 rounded-full bg-[#CFE362] text-neutral-950 flex items-center justify-center font-bold text-xs">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold">{currentLanguageOption.nativeName}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    );
  }

  // Header / Navbar Inlined Dropdown Variant
  const baseButtonStyles = {
    glass:
      'bg-white/90 hover:bg-white backdrop-blur-xl border border-black/10 hover:border-black/20 text-[#1B1E19] shadow-sm',
    light:
      'bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-900 shadow-sm',
    dark: 'bg-neutral-900 hover:bg-neutral-800 border border-white/15 text-white shadow-lg',
    compact:
      'bg-white/90 hover:bg-white border border-black/10 text-xs px-2.5 py-1.5 text-neutral-800',
  }[variant];

  return (
    <div ref={dropdownRef} className={`relative z-[99999] inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full font-semibold transition-all duration-200 cursor-pointer shrink-0 ${baseButtonStyles}`}
      >
        <span className="text-sm leading-none">{currentLanguageOption.flag}</span>
        <span className="text-xs font-bold tracking-tight">
          {currentLanguageOption.nativeName}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-neutral-500 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-60 rounded-2xl bg-neutral-900/98 backdrop-blur-2xl border border-white/20 p-2 shadow-2xl z-[999999] text-white"
          >
            <div className="px-3 py-1.5 border-b border-white/10 flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#CFE362] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#CFE362]" />
                Select Language
              </span>
              {isAutoDetected && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#CFE362]/20 text-[#CFE362] font-bold">
                  Auto
                </span>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto py-1 space-y-1 custom-scrollbar">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#CFE362] text-neutral-950 font-bold shadow-md'
                        : 'text-neutral-200 hover:bg-white/10 hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none">{lang.flag}</span>
                      <div className="text-left">
                        <div className="font-semibold">{lang.nativeName}</div>
                        <div
                          className={`text-[10px] ${
                            isSelected ? 'text-neutral-800' : 'text-neutral-400'
                          }`}
                        >
                          {lang.name}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-neutral-950" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
