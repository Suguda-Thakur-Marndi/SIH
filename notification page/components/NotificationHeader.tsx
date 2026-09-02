import React from 'react';
import { Bell, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/language-context';

interface NotificationHeaderProps {
  unreadCount: number;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({ unreadCount }) => {
  const { t } = useLanguage();

  return (
    <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard" 
          className="p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
        </Link>
        <h1 className="text-xl font-bold text-[#1A1A1A]">{t('notifications', 'Notifications')}</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <LanguageSelector variant="light" />
        <div className="relative">
          <Bell className="w-6 h-6 text-[#1A1A1A]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
