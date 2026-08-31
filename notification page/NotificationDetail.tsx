'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Lightbulb, ExternalLink } from 'lucide-react';
import { useNotificationStore } from './store';
import { PriorityBadge } from './components/PriorityBadge';
import { ActionButton } from './components/ActionButton';
import VoiceButton from '../Government equipment schemes/components/VoiceButton';
import { TimelineGroup } from './components/TimelineGroup';
import { NotificationCard } from './components/NotificationCard';

interface NotificationBody {
  whatHappened?: string;
  whyReasons?: string[];
  recommendedAction?: string;
}

interface DetailData {
  id: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionStatus: string;
  body: NotificationBody;
  voiceText: string;
  language: string;
  action: {
    actionType: string;
    label: string;
    routeKey: string;
    params: Record<string, string>;
  } | null;
  relatedAlerts: any[];
}

export default function NotificationDetail({ id }: { id: string }) {
  const router = useRouter();
  const { notifications, markAsRead } = useNotificationStore();
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch detail from API (which also marks as read server-side)
  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/notifications/${id}`);
        const json = await res.json();
        if (json.success) {
          setDetail(json.data);
          markAsRead(id); // Sync local store
        }
      } catch (e) {
        console.error('Failed to fetch notification detail:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id, markAsRead]);

  // Fallback to store data if API fails
  const notification = detail || notifications.find((n: any) => n.id === id);
  const relatedAlerts = detail?.relatedAlerts || 
    notifications.filter((n: any) => n.category === notification?.category && n.id !== id).slice(0, 3);

  if (loading) {
    return (
      <div className="relative min-h-screen font-sans overflow-x-hidden">
        <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed bg-[url('/notification/bg-phone.png')] md:bg-[url('/notification/bg-laptop.png')]" />
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-white/40 via-emerald-950/8 to-emerald-900/20 backdrop-blur-[2px]" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-lg p-12 text-center">
            <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-700 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-emerald-900">Loading notification from AWS RDS...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="relative min-h-screen font-sans overflow-x-hidden">
        <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed bg-[url('/notification/bg-phone.png')] md:bg-[url('/notification/bg-laptop.png')]" />
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-white/40 via-emerald-950/8 to-emerald-900/20 backdrop-blur-[2px]" />
        <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
          <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-lg p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Notification not found</h2>
            <button 
              onClick={() => router.back()} 
              className="px-5 py-2 rounded-full bg-emerald-800 text-white font-bold text-sm hover:bg-emerald-900 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const body: NotificationBody = detail?.body || {
    whatHappened: (notification as any).description || (notification as any).message,
    whyReasons: ['Your district — Mayurbhanj', 'Linked to your farmer profile'],
    recommendedAction: 'Review the details and take necessary steps to mitigate risks or claim benefits.'
  };

  const voiceText = detail?.voiceText || `${notification.title}. ${(notification as any).description || ''}. Action: ${(notification as any).ctaLabel || 'View Details'}.`;
  const ctaLabel = detail?.action?.label || (notification as any).ctaLabel || 'View Details';
  const ctaHref = detail?.action?.routeKey 
    ? `/${detail.action.routeKey}` 
    : ((notification as any).ctaHref || (notification as any).action_url || '/dashboard');

  return (
    <div className="relative min-h-screen font-sans overflow-x-hidden text-slate-900">
      
      {/* Responsive Background */}
      <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed transition-all duration-700 bg-[url('/notification/bg-phone.png')] md:bg-[url('/notification/bg-laptop.png')]" />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-white/40 via-emerald-950/8 to-emerald-900/20 backdrop-blur-[2px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto min-h-screen px-4 py-6 md:py-8 flex flex-col md:flex-row gap-8">
        
        {/* Main Detail Column */}
        <div className="flex-1">
          <header className="mb-6">
            <button 
              onClick={() => router.back()} 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 hover:bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm text-sm font-bold text-emerald-950 hover:text-emerald-900 transition-all transform hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-700" />
              Back to Notifications
            </button>
          </header>

          {/* Main Glassmorphic Detail Card */}
          <div className="bg-white/45 backdrop-blur-2xl rounded-[32px] border border-white/80 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] p-6 md:p-8 space-y-6">
            
            {/* Category + Priority + Time */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-600/10 text-emerald-900 border border-emerald-500/20">
                {notification.category || (notification as any).type}
              </span>
              <PriorityBadge priority={notification.priority as any} size="lg" />
              <span className="text-xs text-slate-600 font-medium ml-auto">
                {new Date(notification.timestamp || (notification as any).created_at).toLocaleString(undefined, {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                })}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {notification.title}
            </h1>

            {/* What Happened */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/90 p-5 shadow-sm">
              <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-emerald-700" />
                What This Means
              </h2>
              <p className="text-slate-800 text-base leading-relaxed font-medium">
                {body.whatHappened || (notification as any).description}
              </p>
            </div>

            {/* Why Reasons */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/90 p-5 shadow-sm">
              <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">
                Why You're Seeing This
              </h2>
              <ul className="space-y-2">
                {(body.whyReasons || []).map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-slate-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Action */}
            <div className="bg-emerald-500/10 backdrop-blur-xl rounded-2xl border border-emerald-500/25 p-5">
              <h2 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider mb-2">
                Recommended Action
              </h2>
              <p className="text-slate-800 font-medium mb-4">{body.recommendedAction}</p>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <ActionButton 
                  label={ctaLabel} 
                  href={ctaHref} 
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all transform hover:-translate-y-0.5" 
                />
                <VoiceButton textToRead={voiceText} />
              </div>
            </div>

            {/* Action Status Badge */}
            {detail?.actionStatus && detail.actionStatus !== 'not_required' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-white/90 w-fit">
                <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-900 uppercase">
                  Action Status: {detail.actionStatus.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Rail: Related Alerts (Desktop) */}
        {relatedAlerts.length > 0 && (
          <div className="hidden md:block w-72 shrink-0">
            <div className="sticky top-8">
              <div className="bg-white/45 backdrop-blur-2xl rounded-[32px] border border-white/80 shadow-sm p-5">
                <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-4">
                  Related Alerts
                </h2>
                <TimelineGroup label="Recent">
                  {relatedAlerts.map((alert: any) => (
                    <NotificationCard key={alert.id} notification={alert} />
                  ))}
                </TimelineGroup>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
