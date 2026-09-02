import React from 'react';
import { NotificationItem } from '../types';
import { NotificationCard } from './NotificationCard';

interface PrioritySummaryProps {
  criticalAlert?: NotificationItem;
  unreadCount: number;
  actionNeededCount: number;
}

export const PrioritySummary: React.FC<PrioritySummaryProps> = ({ 
  criticalAlert, 
  unreadCount, 
  actionNeededCount 
}) => {
  if (criticalAlert) {
    return (
      <div className="mb-6">
        <NotificationCard notification={criticalAlert} />
        <div className="mt-4 flex items-center justify-between px-2">
          <p className="text-sm text-[#1A1A1A] font-medium">
            {unreadCount} unread · {actionNeededCount} need action
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-2 py-4 mb-4">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        <span className="text-sm font-semibold text-[#1A1A1A]">No Critical Alerts</span>
      </div>
      <p className="text-sm text-gray-500">
        {unreadCount} unread · {actionNeededCount} need action
      </p>
    </div>
  );
};
