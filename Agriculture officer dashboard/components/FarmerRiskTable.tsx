"use client";

import { mockFarmers } from "../data/farmers.mock";
import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

const tierInfo = {
  high: { badge: "bg-red-500/15 text-red-700 border border-red-500/30", Icon: AlertTriangle },
  medium: { badge: "bg-amber-500/15 text-amber-700 border border-amber-500/30", Icon: AlertCircle },
  low: { badge: "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30", Icon: CheckCircle },
};

export default function FarmerRiskTable({ onRowSelect }: { onRowSelect?: (id: string) => void }) {
  const { t } = useLanguage();

  return (
    <section className="glass p-5 md:p-6 flex flex-col justify-between shadow-lg h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base md:text-lg font-bold text-[#1A1A1A]">
            {t('priority_farmers', 'Priority Action Farmers')}
          </h2>
          <p className="text-xs text-[#6B6B66]">Requires immediate extension advisory or intervention</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-200">
          Top {mockFarmers.length} Critical
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-black/10">
        <table className="w-full text-left border-collapse min-w-[540px]">
          <thead>
            <tr className="border-b border-[#1A1A1A]/10 text-[11px] font-bold text-[#6B6B66] uppercase tracking-wider">
              <th className="pb-3 px-3">{t('farmer', 'Farmer')}</th>
              <th className="pb-3 px-3">{t('crop', 'Crop')}</th>
              <th className="pb-3 px-3">{t('risk_score', 'Risk Score')}</th>
              <th className="pb-3 px-3">{t('location', 'Location')}</th>
              <th className="pb-3 px-3">{t('risk_reason', 'Risk Reason')}</th>
              <th className="pb-3 px-3">{t('loan_status', 'Loan Status')}</th>
              <th className="pb-3 px-3 text-right">{t('action', 'Action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1A1A]/5 text-sm">
            {mockFarmers.map((f) => {
              const { badge, Icon } = tierInfo[f.riskTier as keyof typeof tierInfo];
              return (
                <motion.tr
                  key={f.id}
                  className="hover:bg-white/60 cursor-pointer transition-colors group"
                  onClick={() => onRowSelect?.(f.id)}
                >
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-[#1A1A1A] group-hover:text-emerald-900 block">{f.name}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-md bg-neutral-100/90 text-neutral-800 border border-black/5">
                      {f.crop}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs ${badge}`}>
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {f.riskScore}/100
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-xs text-[#4A4A4A] font-medium">{f.location}</td>
                  <td className="py-3.5 px-3">
                    <span className="text-xs font-semibold text-[#1A1A1A] bg-amber-50/80 px-2 py-1 rounded border border-amber-200/50">
                      {f.riskReason}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-xs text-[#6B6B66] font-medium">{f.loanStatus}</td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowSelect?.(f.id);
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#CFE362] text-[#1A1A1A] hover:bg-[#b8cc4b] transition shadow-xs cursor-pointer active:scale-95"
                    >
                      {t('view_details', 'View Details')}
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
