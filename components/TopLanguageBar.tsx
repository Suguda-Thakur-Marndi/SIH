'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check, MapPin } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/language-context';

export default function TopLanguageBar() {
  const { language, setLanguage, currentLanguageOption, isAutoDetected, detectedLocation, t } =
    useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="fixed top-0 left-0 right-0 z-[999999] w-full bg-[#141613]/95 text-white backdrop-blur-2xl border-b border-white/15 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-xs">
        {/* Left Status */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#CFE362] animate-pulse" />
          <span className="font-semibold tracking-tight text-neutral-200 hidden sm:inline">
            Smart Crop Multi-Language System
          </span>
          {detectedLocation && (
            <span className="text-[11px] text-neutral-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
              <MapPin className="w-3 h-3 text-[#CFE362]" />
              <span>{detectedLocation}</span>
            </span>
          )}
        </div>

        {/* Right Language Selector */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all duration-200 cursor-pointer text-xs font-semibold shadow-inner"
          >
            <span className="text-sm leading-none">{currentLanguageOption.flag}</span>
            <span className="font-bold text-[#CFE362]">{currentLanguageOption.nativeName}</span>
            <span className="text-[11px] text-neutral-400">({currentLanguageOption.name})</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-neutral-300 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-1.5 w-64 rounded-2xl bg-neutral-900/98 backdrop-blur-2xl border border-white/15 p-2 shadow-2xl z-[10000] text-white"
              >
                <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#CFE362] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#CFE362]" />
                    {t('select_language', 'Select Language')}
                  </span>
                  {isAutoDetected && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Auto-detected
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
                            <div className="font-bold">{lang.nativeName}</div>
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
      </div>
    </div>
  );
}
