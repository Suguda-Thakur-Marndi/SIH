import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { LanguageProvider } from "@/lib/language-context";
import LanguageSelector from "@/components/LanguageSelector";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Crop | Farm Intelligence Platform",
  description: "AI-Powered Farm Intelligence, Crop Advisory, Mandi Prices and Financial Support.",
};

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "pk_test_YXNzdXJlZC1hbGllbi01OTgxLmNsZXJrLmFjY291bnRzLmRldiQ";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        {/* Google Translate Init Script using next/script */}
        <Script
          id="google-translate-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.googleTranslateElementInit = function() {
                try {
                  new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'en,hi,or,bn,te,ta,mr,gu,pa,kn,ml,as,ur,ne,sa,mai,sd,ks,kok,mni,brx,doi,sat',
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
          id="google-translate-lib"
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />

        {/* Hidden Google Translate container */}
        <div id="google_translate_element" style={{ display: 'none' }} aria-hidden="true" />
        <ClerkProvider publishableKey={publishableKey}>
          <LanguageProvider>
            {children}
            {/* Global floating Language Switcher */}
            <LanguageSelector variant="floating" />
          </LanguageProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
