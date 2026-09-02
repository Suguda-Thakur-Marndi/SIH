'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';

/**
 * PageTranslationSync - A component that ensures Google Translate
 * re-translates content after Next.js client-side navigation.
 * 
 * This is needed because Next.js uses client-side navigation without
 * full page reloads, which means Google Translate doesn't automatically
 * retranslate new content.
 */
export function PageTranslationSync() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const lastLang = useRef(language);
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (language === 'en') {
      // For English, remove all Google Translate modifications
      const gtFrame = document.querySelector('iframe.goog-te-menu-frame') as HTMLIFrameElement | null;
      if (gtFrame) {
        // Try to restore original content
        const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (combo && combo.value !== 'en') {
          combo.value = 'en';
          combo.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      lastLang.current = language;
      lastPath.current = pathname;
      return;
    }

    const pathChanged = pathname !== lastPath.current;
    const langChanged = language !== lastLang.current;

    if (!pathChanged && !langChanged) return;

    lastLang.current = language;
    lastPath.current = pathname;

    // Function to trigger translation
    const triggerTranslation = () => {
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (combo) {
        combo.value = language;
        combo.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    };

    // Try immediately and then retry with backoff
    if (!triggerTranslation()) {
      let attempts = 0;
      const maxAttempts = 20;
      const interval = setInterval(() => {
        if (triggerTranslation() || attempts >= maxAttempts) {
          clearInterval(interval);
        }
        attempts++;
      }, 250);
      return () => clearInterval(interval);
    }
  }, [language, pathname]);

  return null;
}
