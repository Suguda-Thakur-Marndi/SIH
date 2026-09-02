"use client";

import { riskCounts } from "../data/farmers.mock";
import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, CheckCircle, Users } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function RiskSummaryCards() {
  const { t } = useLanguage();

  const cards = [
    { 
      key: "high_risk_farmers", 
      defaultLabel: "High Risk Farmers (>70 Score)", 
      value: riskCounts.high, 
      variant: "focus", 
      icon: AlertTriangle, 
      iconColor: "text-red-400",
      changeText: "Immediate Action Required"
    },
    { 
      key: "medium_risk_farmers", 
      defaultLabel: "Medium Risk Farmers (31-70)", 
      value: riskCounts.medium, 
      variant: "glass", 
      icon: AlertCircle, 
      iconColor: "text-amber-500",
      changeText: "Weekly Advisory Queue"
    },
    { 
      key: "low_risk_farmers", 
      defaultLabel: "Low Risk Farmers (<=30)", 
      value: riskCounts.low, 
      variant: "glass", 
      icon: CheckCircle, 
      iconColor: "text-emerald-500",
      changeText: "Optimal State"
    },
    { 
      key: "total_farmers_monitored", 
      defaultLabel: "Total Farmers Monitored", 
      value: riskCounts.total, 
      variant: "glass", 
      icon: Users, 
      iconColor: "text-[#1A1A1A]",
      changeText: "26 Blocks Monitored"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const isFocus = c.variant === "focus";
        const Icon = c.icon;
        const translatedLabel = t(c.key, c.defaultLabel);
        return (
          <motion.div
            key={c.key}
            className={`p-5 flex flex-col justify-between rounded-3xl shadow-lg border transition-all ${
              isFocus 
                ? "bg-[#1A1A1A] border-black/80 text-white shadow-xl" 
                : "glass bg-white/75 backdrop-blur-xl border-white/80 text-[#1A1A1A]"
            }`}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isFocus ? "text-neutral-400" : "text-[#6B6B66]"}`}>
                {translatedLabel}
              </span>
              <div className={`p-1.5 rounded-lg ${isFocus ? "bg-white/10" : "bg-black/5"}`}>
                <Icon className={`w-4 h-4 ${c.iconColor}`} />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <div className={`text-3xl md:text-4xl font-black tracking-tight ${isFocus ? "text-white" : "text-[#1A1A1A]"}`}>
                {c.value}
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isFocus ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-black/5 text-[#6B6B66]"
              }`}>
                {c.changeText}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
