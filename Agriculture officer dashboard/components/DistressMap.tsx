"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { MapPin, Maximize2, ArrowUpRight, Plus, Minus, RotateCcw, Phone, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface DbDistressFarmer {
  id: string;
  farmerId: string;
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  district: string;
  block: string;
  village: string;
  crop: string;
  landArea: string;
  area: number;
  riskScore: number;
  riskLevel: "HIGH" | "MODERATE" | "LOW";
  primaryReason: string;
  riskFactors?: string[];
  rainfallRisk?: number;
  soilMoisture?: number;
  ndvi?: number;
  marketRisk?: number;
  financialRisk?: number;
  loanStatus?: string;
  insuranceStatus?: string;
  interventionStatus?: string;
}

export default function DistressMap() {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  
  const [farmers, setFarmers] = useState<DbDistressFarmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState<DbDistressFarmer | null>(null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "HIGH" | "MODERATE" | "LOW">("ALL");
  const [mapLoaded, setMapLoaded] = useState(false);

  // 1. Fetch real farmer risk telemetry from the database API
  const fetchFarmersFromDb = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/officer/farmers", {
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const json = await res.json();
        const rawList = Array.isArray(json) ? json : json?.farmers || json?.data || [];
        if (rawList.length > 0) {
          setFarmers(rawList);
        }
      }
    } catch (err) {
      console.warn("[DistressMap DB fetch error]:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmersFromDb();
  }, []);

  // 2. Filtered farmers list
  const filteredFarmers = useMemo(() => {
    if (activeFilter === "ALL") return farmers;
    return farmers.filter((f) => f.riskLevel === activeFilter);
  }, [farmers, activeFilter]);

  // 3. Initialize MapLibre GL instance
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const rasterOsmStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        "osm-tiles": {
          type: "raster",
          tiles: [
            "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
            "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution: "&copy; OpenStreetMap Contributors",
        },
      },
      layers: [
        {
          id: "osm-layer",
          type: "raster",
          source: "osm-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: rasterOsmStyle,
        center: [86.735, 21.932], // Centered on Mayurbhanj District, Odisha
        zoom: 9.3,
        minZoom: 6,
        maxZoom: 17,
        pitch: 0,
        attributionControl: false,
      });

      map.on("load", () => {
        setMapLoaded(true);
        setTimeout(() => map.resize(), 200);
      });

      mapRef.current = map;
    } catch (err) {
      console.warn("[DistressMap MapLibre Init]:", err);
    }

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 4. Update markers on the map whenever database farmers or filter changes
  useEffect(() => {
    const currentMap = mapRef.current;
    if (!currentMap || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredFarmers.forEach((farmer) => {
      if (!farmer.latitude || !farmer.longitude) return;

      const isHigh = farmer.riskLevel === "HIGH";
      const isMed = farmer.riskLevel === "MODERATE";

      const el = document.createElement("div");
      el.className = "group relative cursor-pointer flex flex-col items-center select-none";

      const badgeBg = isHigh ? "bg-red-600" : isMed ? "bg-amber-500" : "bg-emerald-600";
      const pingGlow = isHigh ? "bg-red-500/40" : isMed ? "bg-amber-500/30" : "bg-emerald-500/20";
      const pulseRing = isHigh ? "animate-ping" : "";

      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full ${pingGlow} ${pulseRing} pointer-events-none"></div>
          <div class="w-6 h-6 rounded-full ${badgeBg} border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-black transform transition group-hover:scale-125 group-hover:shadow-2xl">
            ${farmer.riskScore}
          </div>
        </div>
        <div class="mt-1 whitespace-nowrap bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-extrabold text-[#1A1A1A] border border-black/10 shadow-sm transition group-hover:bg-[#1A1A1A] group-hover:text-[#CFE362]">
          ${farmer.name.split(" ")[0]} (${farmer.block})
        </div>
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedFarmer(farmer);
        currentMap.flyTo({
          center: [farmer.longitude, farmer.latitude],
          zoom: 12.5,
          duration: 700,
        });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([farmer.longitude, farmer.latitude])
        .addTo(currentMap);

      markersRef.current.push(marker);
    });
  }, [filteredFarmers, mapLoaded]);

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn({ duration: 250 });
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut({ duration: 250 });
  };

  const handleReset = () => {
    setSelectedFarmer(null);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [86.735, 21.932],
        zoom: 9.3,
        duration: 700,
      });
    }
  };

  const highCount = useMemo(() => farmers.filter((f) => f.riskLevel === "HIGH").length, [farmers]);
  const modCount = useMemo(() => farmers.filter((f) => f.riskLevel === "MODERATE").length, [farmers]);
  const lowCount = useMemo(() => farmers.filter((f) => f.riskLevel === "LOW").length, [farmers]);

  return (
    <section className="glass bg-white/85 backdrop-blur-2xl border border-white/70 rounded-3xl p-5 flex flex-col justify-between h-full min-h-[380px] relative overflow-hidden shadow-xl text-[#1A1A1A]">
      {/* Header Bar with Live Database Status & Actions */}
      <div className="flex flex-wrap items-center justify-between z-10 gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#CFE362] font-bold text-xs shadow-sm">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[#1A1A1A] flex items-center gap-1.5">
              <span>{t("distress_map", "Distress Map")}</span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.2 rounded-full border border-emerald-300/60">
                AWS RDS Live
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={fetchFarmersFromDb}
            disabled={loading}
            title="Refresh Database Telemetry"
            className="p-1.5 rounded-full bg-white hover:bg-neutral-100 border border-black/10 text-neutral-700 transition cursor-pointer hover:scale-105"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-emerald-700" : ""}`} />
          </button>
          <span className="text-[11px] font-bold px-2.5 py-0.8 rounded-full bg-red-500/10 text-red-700 border border-red-500/20 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Mayurbhanj • {farmers.length} Beacons</span>
          </span>
          <Link
            href="/officer-dashboard/map"
            className="p-1.5 rounded-full bg-white hover:bg-neutral-100 border border-black/10 text-[#1A1A1A] transition shadow-xs hover:scale-105"
            title="Open Full Screen Spatial Map"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter Tabs for Risk Tiers */}
      <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto scrollbar-none pb-0.5 z-10">
        <button
          onClick={() => { setActiveFilter("ALL"); setSelectedFarmer(null); }}
          className={`px-2.5 py-0.8 rounded-lg text-[11px] font-bold transition cursor-pointer ${
            activeFilter === "ALL" 
              ? "bg-[#1A1A1A] text-[#CFE362] shadow-xs" 
              : "bg-white/80 hover:bg-white text-neutral-700 border border-black/10"
          }`}
        >
          All ({farmers.length})
        </button>
        <button
          onClick={() => { setActiveFilter("HIGH"); setSelectedFarmer(null); }}
          className={`px-2.5 py-0.8 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
            activeFilter === "HIGH" 
              ? "bg-red-600 text-white shadow-xs" 
              : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          High ({highCount})
        </button>
        <button
          onClick={() => { setActiveFilter("MODERATE"); setSelectedFarmer(null); }}
          className={`px-2.5 py-0.8 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
            activeFilter === "MODERATE" 
              ? "bg-amber-500 text-white shadow-xs" 
              : "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Moderate ({modCount})
        </button>
        <button
          onClick={() => { setActiveFilter("LOW"); setSelectedFarmer(null); }}
          className={`px-2.5 py-0.8 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
            activeFilter === "LOW" 
              ? "bg-emerald-600 text-white shadow-xs" 
              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Low ({lowCount})
        </button>
      </div>

      {/* Real Map Canvas Container */}
      <div className="relative flex-1 w-full min-h-[220px] rounded-2xl overflow-hidden border border-black/10 shadow-inner bg-[#EAECE6]">
        <div ref={mapContainerRef} className="w-full h-full min-h-[220px]" />

        {/* Loading Spinner Overlay */}
        {(loading || !mapLoaded) && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-30">
            <div className="w-7 h-7 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-800">
              Querying Database Coordinates & Distress Scores...
            </span>
          </div>
        )}

        {/* Floating Mini Map Controls (Top Right) */}
        <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 rounded-lg bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center shadow-md border border-black/10 transition cursor-pointer hover:scale-105"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 rounded-lg bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center shadow-md border border-black/10 transition cursor-pointer hover:scale-105"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="w-7 h-7 rounded-lg bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center shadow-md border border-black/10 transition cursor-pointer hover:scale-105"
            title="Reset District View"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Selected Farmer Database Card Popover */}
        {selectedFarmer && (
          <div className="absolute bottom-2 left-2 right-2 sm:right-auto sm:max-w-sm z-20 bg-white/95 backdrop-blur-xl rounded-xl p-3 border border-black/15 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-slate-900">{selectedFarmer.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">({selectedFarmer.farmerId})</span>
                </div>
                <p className="text-[10px] text-slate-600 font-medium">
                  {selectedFarmer.village} &bull; <span className="text-emerald-800 font-bold">{selectedFarmer.crop}</span> ({selectedFarmer.landArea})
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                selectedFarmer.riskLevel === "HIGH" 
                  ? "bg-red-100 text-red-700 border border-red-200" 
                  : selectedFarmer.riskLevel === "MODERATE" 
                  ? "bg-amber-100 text-amber-800 border border-amber-200" 
                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}>
                {selectedFarmer.riskScore}/100
              </span>
            </div>

            {/* Primary Stress Factor */}
            <div className="p-2 rounded-lg bg-neutral-100/80 border border-black/5 text-[11px] font-semibold text-slate-800 flex items-start gap-1.5 mb-2">
              {selectedFarmer.riskLevel === "HIGH" ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <span>{selectedFarmer.primaryReason || "Multi-signal agronomic stress"}</span>
            </div>

            {/* Sub-parameters breakdown */}
            <div className="grid grid-cols-3 gap-1 text-center text-[9px] font-bold text-slate-600 mb-2.5">
              <div className="bg-white p-1 rounded border border-black/5">
                <span className="block text-slate-400 font-normal">Rainfall Risk</span>
                <span className="text-amber-700 font-black">{selectedFarmer.rainfallRisk ?? 68}%</span>
              </div>
              <div className="bg-white p-1 rounded border border-black/5">
                <span className="block text-slate-400 font-normal">Soil Moisture</span>
                <span className="text-blue-700 font-black">{selectedFarmer.soilMoisture ?? 24}%</span>
              </div>
              <div className="bg-white p-1 rounded border border-black/5">
                <span className="block text-slate-400 font-normal">Market Risk</span>
                <span className="text-rose-700 font-black">{selectedFarmer.marketRisk ?? 42}%</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
              <a
                href={`tel:${selectedFarmer.phone}`}
                className="py-1 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold flex items-center gap-1 transition"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>
              <Link
                href={`/officer-dashboard/farmers?q=${encodeURIComponent(selectedFarmer.name.split(" ")[0])}`}
                className="flex-1 text-center py-1 rounded-lg bg-[#1A1A1A] hover:bg-black text-[#CFE362] text-[10px] font-bold transition"
              >
                Inspect Dossier
              </Link>
              <Link
                href="/officer-dashboard/map"
                className="py-1 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-bold border border-black/10 transition"
              >
                Full Map ↗
              </Link>
            </div>
          </div>
        )}

        {/* Floating Quick Action CTA at Bottom Right */}
        {!selectedFarmer && (
          <Link
            href="/officer-dashboard/map"
            className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5 text-[11px] font-extrabold text-[#1A1A1A] bg-white/95 hover:bg-[#CFE362] px-3 py-1.5 rounded-xl shadow-md border border-black/10 transition group"
          >
            <span>Open Full Interactive Map</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        )}
      </div>
    </section>
  );
}
