import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";
import { BandwidthProvider } from "@/lib/bandwidth-context";
import LanguageSelector from "@/components/LanguageSelector";
import { PageTranslationSync } from "@/components/PageTranslationSync";
import { OfflineAlertBanner } from "@/components/DataSaverToggle";
import { ProactiveAgronomistBot } from "@/components/ProactiveAgronomistBot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Crop | Smart Crop Advisory & Farmer Distress Early-Warning System",
  description: "AI-Powered Multilingual Crop Advisory, Climate Distress Early-Warning, and Mandi Intelligence for Smallholder Farmers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        {/* Google Translate: inline init must run before the loader script */}
        <Script
          id="google-translate-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.googleTranslateElementInit = function() {
                try {
                  new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'en,hi,or,bn,te,ta,mr,gu,pa,kn,ml,as,ur,ne',
                    autoDisplay: false,
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
                  }, 'google_translate_element');
                } catch (e) {
                  console.warn('Google Translate Init warning:', e);
                }
              };
            `,
          }}
        />
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />

        {/* Hidden Google Translate container */}
        <div id="google_translate_element" style={{ display: 'none' }} aria-hidden="true" />
        <BandwidthProvider>
          <LanguageProvider>
            <OfflineAlertBanner />
            {children}
            {/* Proactive AI Agronomist Top-Right Floating Assistant */}
            <ProactiveAgronomistBot />
            {/* Global floating Language Switcher */}
            <LanguageSelector variant="floating" />
            {/* Sync Google Translate on route changes */}
            <PageTranslationSync />
          </LanguageProvider>
        </BandwidthProvider>
      </body>
    </html>
  );
}
