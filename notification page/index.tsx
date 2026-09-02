'use client';

import React, { useEffect } from 'react';
import { NotificationHeader } from './components/NotificationHeader';
import { PrioritySummary } from './components/PrioritySummary';
import CategoryFilter from '../Government equipment schemes/components/CategoryFilter';
import { NotificationCard } from './components/NotificationCard';
import { TimelineGroup } from './components/TimelineGroup';
import { useNotificationStore } from './store';
import VoiceButton from '../Government equipment schemes/components/VoiceButton';
import { NotificationCategory, NotificationItem } from './types';

import { useLanguage } from '@/lib/language-context';
export default function NotificationsHub() {
  const { t } = useLanguage();
  const { notifications, activeFilter, unreadCount, setFilter, fetchNotifications, loading } = useNotificationStore();

  // Fetch from RDS on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered = activeFilter === 'All' 
    ? notifications 
    : notifications.filter((n: NotificationItem) => n.category === activeFilter);

  // Group by date
  const isToday = (dateStr: string) => {
    const today = new Date();
    const date = new Date(dateStr);
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isYesterday = (dateStr: string) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = new Date(dateStr);
    return date.getDate() === yesterday.getDate() &&
           date.getMonth() === yesterday.getMonth() &&
           date.getFullYear() === yesterday.getFullYear();
  };

  const groups: Record<string, NotificationItem[]> = {
    'Today': filtered.filter((n: NotificationItem) => isToday(n.timestamp)),
    'Yesterday': filtered.filter((n: NotificationItem) => isYesterday(n.timestamp)),
    'Earlier': filtered.filter((n: NotificationItem) => !isToday(n.timestamp) && !isYesterday(n.timestamp)),
  };

  const criticalAlert = notifications.find((n: NotificationItem) => n.priority === 'critical' && !n.isRead);
  const actionNeededCount = notifications.filter((n: NotificationItem) => !n.isRead && n.priority !== 'info').length;

  const categories: NotificationCategory[] = [
    'All', 'Risk', 'Weather', 'Crop Activities', 'Market', 'Government', 'Insurance', 'Officer Updates'
  ];

  const categoryCounts = categories.reduce((acc: Record<NotificationCategory, number>, cat: NotificationCategory) => {
    acc[cat] = cat === 'All' 
      ? notifications.length 
      : notifications.filter((n: NotificationItem) => n.category === cat).length;
    return acc;
  }, {} as Record<NotificationCategory, number>);

  return (
    <div className="relative min-h-screen font-sans overflow-x-hidden text-slate-900">
      
      {/* Responsive Background Images: 16:9 Laptop / 9:16 Phone */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed transition-all duration-700 bg-[url('/notification/bg-phone.png')] md:bg-[url('/notification/bg-laptop.png')]"
      />

      {/* Frosted Green Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-white/40 via-emerald-950/8 to-emerald-900/20 backdrop-blur-[2px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-start justify-center p-4 md:p-8">
        <div className="max-w-5xl w-full bg-white/45 backdrop-blur-2xl rounded-[32px] border border-white/80 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] p-6 md:p-8 mt-4 md:mt-8">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left Rail – Filters (Desktop) */}
            <aside className="hidden md:block w-64 shrink-0">
              <div className="sticky top-8 space-y-6">
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/90 shadow-sm p-4">
                  <h2 className="text-lg font-extrabold text-slate-900 mb-4 tracking-tight">Filters</h2>
                  <CategoryFilter
                    categories={categories}
                    activeCategory={activeFilter}
                    categoryCounts={categoryCounts}
                    onSelectCategory={setFilter}
                    variant="sidebar"
                  />
                </div>

                {/* API Status Badge */}
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/90 shadow-sm p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-900">{t('connected_to_aws_rds', 'Connected to AWS RDS')}{' '}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1">Real-time notification feed</p>
                </div>
              </div>
            </aside>

            {/* Main Column */}
            <main className="flex-1">
              {/* Header with updated glassmorphic styling */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/90 shadow-sm p-4 mb-4">
                <NotificationHeader unreadCount={unreadCount()} />
              </div>

              {/* Voice + Loading */}
              <div className="flex items-center justify-between mb-4">
                {loading && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                    <div className="w-3 h-3 border-2 border-emerald-300 border-t-emerald-700 rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-emerald-900">{t('fetching_from_rds', 'Fetching from RDS...')}{' '}</span>
                  </div>
                )}
                <div className="ml-auto">
                  <VoiceButton textToRead="You have new critical alerts and updates." />
                </div>
              </div>

              {/* Priority Summary */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/90 shadow-sm p-4 mb-4">
                <PrioritySummary
                  criticalAlert={criticalAlert}
                  unreadCount={unreadCount()}
                  actionNeededCount={actionNeededCount}
                />
              </div>

              {/* Mobile Filters */}
              <div className="md:hidden mb-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/90 shadow-sm p-4">
                <CategoryFilter
                  categories={categories}
                  activeCategory={activeFilter}
                  categoryCounts={categoryCounts}
                  onSelectCategory={setFilter}
                  variant="sidebar"
                />
              </div>

              {/* Timeline Groups */}
              <div className="flex flex-col gap-6 pb-24">
                {Object.entries(groups).map(([label, items]) => {
                  if (items.length === 0) return null;
                  return (
                    <div key={label} className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm p-4">
                      <TimelineGroup label={label}>
                        {items.map((notif) => (
                          <NotificationCard key={notif.id} notification={notif} />
                        ))}
                      </TimelineGroup>
                    </div>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="text-center py-12 bg-white/50 backdrop-blur-xl rounded-2xl border border-white/80">
                    <p className="text-slate-600 font-semibold">No notifications found for this category.</p>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
