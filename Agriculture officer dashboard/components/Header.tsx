"use client";

import { Search, Bell, Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import LanguageSelector from "@/components/LanguageSelector";
import { DataSaverToggle } from "@/components/DataSaverToggle";
import { useLanguage } from "@/lib/language-context";
import { smartCropAuth } from "@/lib/smartcrop-auth";

export default function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { t } = useLanguage();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await smartCropAuth.signOut();
    } catch {
      // ignore
    }
    router.push('/authentication');
  };

  return (
    <header className="glass relative z-[999] overflow-visible flex items-center justify-between px-6 py-4 text-[#1A1A1A]">
      {/* Left side: burger menu on mobile */}
      <button
        className="md:hidden p-2 rounded-md hover:bg-white/40 transition-colors cursor-pointer"
        onClick={onToggleSidebar}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title */}
      <div className="flex flex-col items-center md:items-start">
        <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">
          {t('distress_command', 'Agricultural Distress Command Center')}
        </h1>
        <span className="text-xs font-medium text-[#6B6B66]">
          {t('mayurbhanj_district', 'Mayurbhanj District, Odisha')}
        </span>
      </div>

      {/* Right side: actions */}
      <div className="flex items-center gap-3">
        {/* 2G Data Saver Mode Toggle */}
        <DataSaverToggle />

        {/* Language Selector */}
        <LanguageSelector variant="glass" />

        <button className="p-2.5 rounded-full hover:bg-white/40 text-[#1A1A1A] transition-colors cursor-pointer">
          <Search className="w-5 h-5" />
        </button>
        <button
          onClick={() => router.push('/notifications')}
          title={t('alerts', 'Alerts & Notifications')}
          className="relative p-2.5 rounded-full hover:bg-white/40 text-[#1A1A1A] transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        </button>
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#1A1A1A]/10">
          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-bold">
            AO
          </div>
          <span className="text-sm font-semibold text-[#1A1A1A]">Officer Portal</span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          title="Sign Out to Authentication"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold shadow-sm transition hover:scale-105 cursor-pointer ml-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
