import Link from "next/link";
import { MapPin, Maximize2, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function DistressMap() {
  const { t } = useLanguage();

  return (
    <section className="glass bg-white/80 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 flex flex-col justify-between h-full min-h-[340px] relative overflow-hidden shadow-xl text-[#1A1A1A]">
      <div className="flex items-center justify-between z-10 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#CFE362] font-bold text-xs shadow-sm">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-lg font-extrabold tracking-tight text-[#1A1A1A]">
            {t('distress_map', 'Distress Map')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-700 border border-red-500/20 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>{t('live_map_label', 'Mayurbhanj • Live')}</span>
          </span>
          <Link
            href="/admin/dashboard"
            className="p-1.5 rounded-full bg-white hover:bg-neutral-100 border border-black/10 text-[#1A1A1A] transition shadow-xs hover:scale-105"
            title="Open Interactive Map"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Abstract stylized map view with live launcher */}
      <Link
        href="/admin/dashboard"
        className="group flex-1 w-full relative rounded-2xl bg-[#E6E8E2]/60 border border-white/50 overflow-hidden flex items-center justify-center cursor-pointer transition hover:border-[#1A1A1A]/30"
      >
        {/* Abstract topographic contour lines SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-30 stroke-[#1A1A1A]/30 fill-none" viewBox="0 0 400 200">
          <path d="M-20,100 Q80,20 200,100 T420,80" strokeWidth="1.5" />
          <path d="M-20,140 Q100,50 240,150 T420,120" strokeWidth="1.5" />
          <path d="M-20,60 Q120,160 280,40 T420,160" strokeWidth="1.5" />
          <circle cx="120" cy="90" r="45" strokeWidth="1" strokeDasharray="3,3" />
          <circle cx="280" cy="110" r="60" strokeWidth="1" strokeDasharray="3,3" />
        </svg>

        {/* Map markers for district risk zones */}
        <div className="absolute top-[35%] left-[28%] flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-red-500/30 group-hover:scale-105 transition">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold text-[#1A1A1A]">
            Baripada (84 🔴)
          </span>
        </div>

        <div className="absolute top-[55%] left-[62%] flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-amber-500/30 group-hover:scale-105 transition">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-xs font-bold text-[#1A1A1A]">
            Betnoti (62 🟡)
          </span>
        </div>

        <div className="absolute top-[25%] left-[68%] flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-emerald-500/30 group-hover:scale-105 transition">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-[#1A1A1A]">
            Rairangpur (28 🟢)
          </span>
        </div>

        {/* Hover overlay hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-extrabold text-[#1A1A1A] bg-white/95 px-3 py-1 rounded-xl shadow-md border border-black/10 group-hover:bg-[#CFE362] transition">
          <span>Open Interactive Map</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </Link>
    </section>
  );
}

