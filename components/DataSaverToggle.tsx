'use client';

import React from 'react';
import { useBandwidth } from '@/lib/bandwidth-context';
import { useLanguage } from '@/lib/language-context';
import { Zap, WifiOff, Gauge } from 'lucide-react';

export const DataSaverToggle: React.FC = () => {
  const { isLiteMode, toggleLiteMode, networkSpeed } = useBandwidth();
  const { t } = useLanguage();

  return (
    <button
      onClick={toggleLiteMode}
      title={isLiteMode ? 'Data Saver Active (Low Bandwidth Mode)' : 'Enable Low-Bandwidth Mode'}
      className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
        isLiteMode
          ? 'bg-amber-400/90 text-zinc-950 shadow-xs border border-amber-300 ring-2 ring-amber-400/20'
          : 'bg-black/5 hover:bg-black/10 text-zinc-700 border border-black/10'
      }`}
    >
      <Zap className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${isLiteMode ? 'text-zinc-950 fill-zinc-950' : 'text-zinc-500'}`} />
      <span className="text-[10px] sm:text-[11px] whitespace-nowrap">
        {isLiteMode ? t('data_saver_on', 'Lite 2G') : t('data_saver_off', 'Data Saver')}
      </span>
      {networkSpeed === 'slow' && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping shrink-0" />
      )}
    </button>
  );
};

export const OfflineAlertBanner: React.FC = () => {
  const { isOnline, isLiteMode } = useBandwidth();
  const { t } = useLanguage();

  if (isOnline && !isLiteMode) return null;

  return (
    <div
      className={`w-full py-1 px-4 text-center text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
        !isOnline
          ? 'bg-rose-600 text-white'
          : isLiteMode
          ? 'bg-amber-500/15 border-b border-amber-500/20 text-amber-900'
          : 'hidden'
      }`}
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>{t('offline_advisory_active', 'Offline Mode: Displaying cached farm advisories & emergency guides.')}</span>
        </>
      ) : isLiteMode ? (
        <>
          <Gauge className="w-3.5 h-3.5 shrink-0 text-amber-700" />
          <span>{t('lite_mode_active', 'Lite Mode Active: Low-bandwidth optimization enabled for basic smartphones.')}</span>
        </>
      ) : null}
    </div>
  );
};
