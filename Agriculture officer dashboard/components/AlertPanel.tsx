"use client";
import { mockAlerts } from "../data/farmers.mock";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

export default function AlertPanel() {
  const { t } = useLanguage();

  return (
    <section className="glass p-5 md:p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base md:text-lg font-bold text-[#1A1A1A]">
            {t('live_distress_alerts', 'Critical Distress Signals & Alerts')}
          </h3>
          <p className="text-xs text-[#6B6B66]">Real-time system telemetry and automatic threshold triggers</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          Live Feeds
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {mockAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            className="flex items-start gap-3 p-3.5 bg-white/70 border border-white/80 rounded-2xl hover:bg-white transition-all shadow-xs hover:shadow-md cursor-pointer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 flex-shrink-0 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#1A1A1A] line-clamp-2">{alert.message}</p>
              <p className="text-[10px] text-[#8C8C88] font-medium mt-1" suppressHydrationWarning>
                {alert.timestamp.replace('T', ' ').slice(0, 16)} • Mayurbhanj
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
