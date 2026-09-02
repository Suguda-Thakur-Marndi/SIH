'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  LanguageCode,
  LanguageOption,
  SUPPORTED_LANGUAGES,
  UI_DICTIONARY,
} from './translations';

export type { LanguageCode, LanguageOption };
export { SUPPORTED_LANGUAGES, UI_DICTIONARY };

interface LanguageContextType {
  language: LanguageCode;
  languageCode: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => string;
  translateDynamic: (text: string) => Promise<string>;
  currentLanguageOption: LanguageOption;
  isAutoDetected: boolean;
  detectedLocation: string | null;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  languageCode: 'en',
  setLanguage: () => {},
  t: (key, fallback, params) => {
    let res = fallback || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        res = res.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return res;
  },
  translateDynamic: async (text) => text,
  currentLanguageOption: SUPPORTED_LANGUAGES[0],
  isAutoDetected: false,
  detectedLocation: null,
  isRtl: false,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);

  // Dynamic in-memory translation cache
  const [translationCache, setTranslationCache] = useState<Record<string, string>>({});

  // Helper function to sync Google Translate
  const syncGoogleTranslate = useCallback((lang: LanguageCode) => {
    if (typeof window === 'undefined') return;
    const domain = window.location.hostname;
    const hostParts = domain.split('.');
    const topDomain = hostParts.length > 1 ? '.' + hostParts.slice(-2).join('.') : domain;

    const clearCookie = (name: string) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
      if (topDomain !== domain) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${topDomain};`;
      }
    };

    clearCookie('googtrans');

    if (lang === 'en') {
      document.cookie = `googtrans=/auto/en; path=/;`;
      document.cookie = `googtrans=/auto/en; path=/; domain=${domain};`;
      document.cookie = `googtrans=/en/en; path=/;`;
      document.cookie = `googtrans=/en/en; path=/; domain=${domain};`;
    } else {
      document.cookie = `googtrans=/auto/${lang}; path=/;`;
      document.cookie = `googtrans=/auto/${lang}; path=/; domain=${domain};`;
      document.cookie = `googtrans=/en/${lang}; path=/;`;
      document.cookie = `googtrans=/en/${lang}; path=/; domain=${domain};`;
    }

    // Strategy 1: Use the Google Translate combo box
    let attempts = 0;
    const maxAttempts = 30;

    const tryTrigger = () => {
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (combo) {
        if (combo.value !== lang) {
          combo.value = lang;
          combo.dispatchEvent(new Event('change', { bubbles: true }));
        }
        return;
      }
      
      // Strategy 2: Try the Google Translate iframe approach
      const frames = document.querySelectorAll('iframe.goog-te-menu-frame');
      if (frames.length > 0) {
        // Reinitialize
        if (typeof window !== 'undefined' && (window as any).googleTranslateElementInit) {
          try { (window as any).googleTranslateElementInit(); } catch { /* ignore */ }
        }
      }
      
      if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryTrigger, 200);
      } else if (lang !== 'en') {
        // Last resort: force page reload with googtrans cookie set
        // Only reload if not already showing the right language
        const currentGoogtrans = document.cookie
          .split('; ')
          .find(r => r.startsWith('googtrans='));
        if (!currentGoogtrans?.includes(`/${lang}`)) {
          window.location.reload();
        }
      }
    };

    setTimeout(tryTrigger, 100);
  }, []);

  // 1. Initialize language from localStorage or Browser/Geolocation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedLang = localStorage.getItem('smartcrop_language') as LanguageCode | null;
    if (savedLang && SUPPORTED_LANGUAGES.some((l) => l.code === savedLang)) {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
      if (savedLang === 'ur') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
      syncGoogleTranslate(savedLang);
      return;
    }

    // Auto-detect based on Indian Geolocation or browser
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            let detectedLang: LanguageCode = 'en';
            let locName = 'India';

            if (latitude >= 17.5 && latitude <= 23.0 && longitude >= 81.0 && longitude <= 88.0) {
              detectedLang = 'or'; // Odisha -> Odia
              locName = 'Odisha';
            } else if (latitude >= 21.5 && latitude <= 27.5 && longitude >= 85.8 && longitude <= 89.9) {
              detectedLang = 'bn'; // West Bengal -> Bengali
              locName = 'West Bengal';
            } else if (latitude >= 24.0 && latitude <= 28.5 && longitude >= 89.5 && longitude <= 96.0) {
              detectedLang = 'as'; // Assam -> Assamese
              locName = 'Assam';
            } else if (latitude >= 26.5 && latitude <= 30.5 && longitude >= 80.0 && longitude <= 88.5) {
              detectedLang = 'ne'; // Nepal Border / Sikkim -> Nepali
              locName = 'Nepal Border / Sikkim';
            } else if (latitude >= 29.5 && latitude <= 32.5 && longitude >= 73.8 && longitude <= 76.9) {
              detectedLang = 'pa'; // Punjab -> Punjabi
              locName = 'Punjab';
            } else if (latitude >= 15.6 && latitude <= 22.0 && longitude >= 72.6 && longitude <= 80.9) {
              detectedLang = 'mr'; // Maharashtra -> Marathi
              locName = 'Maharashtra';
            } else if (latitude >= 20.1 && latitude <= 24.7 && longitude >= 68.1 && longitude <= 74.5) {
              detectedLang = 'gu'; // Gujarat -> Gujarati
              locName = 'Gujarat';
            } else if (latitude >= 8.0 && latitude <= 13.5 && longitude >= 76.2 && longitude <= 80.3) {
              detectedLang = 'ta'; // Tamil Nadu -> Tamil
              locName = 'Tamil Nadu';
            } else if (latitude >= 12.6 && latitude <= 19.9 && longitude >= 76.7 && longitude <= 84.8) {
              detectedLang = 'te'; // Andhra / Telangana -> Telugu
              locName = 'Andhra Pradesh / Telangana';
            } else if (latitude >= 11.5 && latitude <= 18.5 && longitude >= 74.0 && longitude <= 78.6) {
              detectedLang = 'kn'; // Karnataka -> Kannada
              locName = 'Karnataka';
            } else if (latitude >= 8.3 && latitude <= 12.8 && longitude >= 74.8 && longitude <= 77.4) {
              detectedLang = 'ml'; // Kerala -> Malayalam
              locName = 'Kerala';
            } else if (latitude >= 21.0 && latitude <= 30.5 && longitude >= 74.0 && longitude <= 88.0) {
              detectedLang = 'hi'; // Northern / Central Belt -> Hindi
              locName = 'North / Central India';
            } else {
              detectedLang = 'hi'; // Default for India
              locName = 'India';
            }

            setLanguageState(detectedLang);
            setIsAutoDetected(true);
            setDetectedLocation(locName);
            localStorage.setItem('smartcrop_language', detectedLang);
            document.documentElement.lang = detectedLang;
            document.documentElement.dir = (detectedLang as string) === 'ur' ? 'rtl' : 'ltr';
            syncGoogleTranslate(detectedLang);
          } catch {
            setLanguageState('en');
          }
        },
        () => {
          const browserLang = (navigator.language || 'en').split('-')[0].toLowerCase();
          if (SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) {
            setLanguageState(browserLang as LanguageCode);
            document.documentElement.lang = browserLang;
            syncGoogleTranslate(browserLang as LanguageCode);
          } else {
            setLanguageState('en');
            document.documentElement.lang = 'en';
            syncGoogleTranslate('en');
          }
        },
        { timeout: 4000 }
      );
    } else {
      setLanguageState('en');
      syncGoogleTranslate('en');
    }
  }, [syncGoogleTranslate]);

  // 2. Listen to route transitions and re-sync translation on newly mounted pages
  useEffect(() => {
    if (typeof window !== 'undefined' && language) {
      // Use a longer delay to ensure new page content has rendered
      const timer = setTimeout(() => {
        syncGoogleTranslate(language);
        // Also try again after a second in case Google Translate was slow to inject
        setTimeout(() => syncGoogleTranslate(language), 800);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, language, syncGoogleTranslate]);

  // 3. Set language handler
  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    setIsAutoDetected(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartcrop_language', lang);
      document.documentElement.lang = lang;
      if (lang === 'ur') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
      syncGoogleTranslate(lang);
    }
  }, [syncGoogleTranslate]);

  // 4. Fast translation dictionary lookup with parameter interpolation & English fallback
  const t = useCallback(
    (key: string, fallback?: string, params?: Record<string, string | number>): string => {
      if (!key) return fallback || '';

      const targetDict = UI_DICTIONARY[language];
      let translated = targetDict?.[key];

      if (!translated) {
        const enDict = UI_DICTIONARY.en;
        translated = enDict?.[key];
      }

      let result = translated || fallback || key;

      if (params && typeof result === 'string') {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        });
      }

      return result;
    },
    [language]
  );

  // 5. Dynamic AI/Cloud translation helper
  const translateDynamic = useCallback(
    async (text: string): Promise<string> => {
      if (!text || language === 'en') return text;
      const cacheKey = `${language}:${text}`;
      if (translationCache[cacheKey]) return translationCache[cacheKey];

      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLanguage: language }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.translatedText) {
            setTranslationCache((prev) => ({ ...prev, [cacheKey]: data.translatedText }));
            return data.translatedText;
          }
        }
      } catch (err) {
        console.warn('Translation failed, fallback to original text', err);
      }
      return text;
    },
    [language, translationCache]
  );

  const currentLanguageOption = useMemo(
    () => SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0],
    [language]
  );

  const isRtl = language === 'ur';

  return (
    <LanguageContext.Provider
      value={{
        language,
        languageCode: language,
        setLanguage,
        t,
        translateDynamic,
        currentLanguageOption,
        isAutoDetected,
        detectedLocation,
        isRtl,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};


export const useLanguage = () => useContext(LanguageContext);
