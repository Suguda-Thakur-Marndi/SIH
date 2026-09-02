"use client";

import { mockFarmers } from '../data/farmers.mock';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function FarmerDetailPanel({ farmerId, onClose }: { farmerId: string; onClose: () => void }) {
  const farmer = mockFarmers.find((f) => f.id === farmerId);
  if (!farmer) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="glass bg-white/95 backdrop-blur-2xl border border-white/90 p-6 rounded-3xl w-full max-w-md relative shadow-2xl text-[#1A1A1A]"
          initial={{ y: 30, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-black/5 text-[#8C8C88] hover:text-[#1A1A1A] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] text-[#CFE362] flex items-center justify-center text-lg font-black shadow-md">
              {farmer.name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight">{farmer.name}</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                  Critical
                </span>
              </div>
              <p className="text-xs font-medium text-[#6B6B66]">{farmer.location}, Mayurbhanj District</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div className="p-3 rounded-2xl bg-black/5 border border-black/5">
              <span className="text-[10px] font-bold text-[#8C8C88] uppercase tracking-wider block">Primary Crop</span>
              <span className="text-sm font-bold text-[#1A1A1A]">{farmer.crop}</span>
            </div>
            <div className="p-3 rounded-2xl bg-red-50/80 border border-red-100">
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Distress Score</span>
              <span className="text-sm font-black text-red-700">{farmer.riskScore}/100</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-100">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Primary Driver</span>
              <span className="text-xs font-bold text-amber-900">{farmer.riskReason}</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/5 border border-black/5">
              <span className="text-[10px] font-bold text-[#8C8C88] uppercase tracking-wider block">Loan Status</span>
              <span className="text-xs font-bold text-[#1A1A1A]">{farmer.loanStatus}</span>
            </div>
          </div>

          <div className="flex gap-2 justify-between pt-2 border-t border-black/10">
            <button 
              onClick={() => alert(`Calling ${farmer.name} (+91 9040495565)...`)}
              className="flex-1 py-2.5 px-3 text-xs font-bold bg-[#1A1A1A] text-white rounded-xl hover:bg-neutral-800 transition cursor-pointer shadow-xs"
            >
              Call Farmer
            </button>
            <button 
              onClick={() => alert(`SMS Advisory queued for ${farmer.name} via Fast2SMS DLT gateway.`)}
              className="flex-1 py-2.5 px-3 text-xs font-bold bg-[#CFE362] text-[#1A1A1A] rounded-xl hover:bg-[#b8cc4b] transition cursor-pointer shadow-xs"
            >
              Send SMS
            </button>
            <button 
              onClick={() => alert(`Field visit assigned to KVK Officer for ${farmer.name}.`)}
              className="flex-1 py-2.5 px-3 text-xs font-bold bg-white hover:bg-neutral-100 text-neutral-800 border border-black/10 rounded-xl transition cursor-pointer shadow-xs"
            >
              Assign Visit
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
