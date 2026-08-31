"use client";

import React from 'react';
import { CloudRain, Users, AlertTriangle, MapPin, Wheat } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WeatherData {
  rainfallDeviationPercent: number;
  farmersAffected: number;
  highRiskFarmers: number;
  mostAffectedCrop: string;
  mostAffectedBlock: string;
  chartData: { date: string; expected: number; actual: number }[];
}

interface Props {
  data: WeatherData | null;
  loading: boolean;
}

export function WeatherStressPanel({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="glass bg-white/80 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-xl animate-pulse" role="status" aria-busy="true" aria-label="Loading weather stress data">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-5 h-5 rounded bg-slate-900/10" />
          <div className="space-y-1">
            <div className="h-6 w-36 rounded bg-slate-900/10" />
            <div className="h-4 w-48 rounded bg-slate-900/10" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white/60 rounded-2xl p-3 space-y-2">
              <div className="h-3 w-24 rounded bg-slate-900/10" />
              <div className="h-6 w-14 rounded bg-slate-900/10" />
            </div>
          ))}
        </div>
        <span className="sr-only">Loading weather stress data</span>
      </div>
    );
  }

  const stats = [
    {
      label: 'Rainfall Deviation',
      value: `${data.rainfallDeviationPercent > 0 ? '+' : ''}${data.rainfallDeviationPercent}%`,
      icon: CloudRain,
      color: data.rainfallDeviationPercent < -15 ? 'text-red-700' : data.rainfallDeviationPercent < 0 ? 'text-amber-800' : 'text-emerald-800',
      bg: data.rainfallDeviationPercent < -15 ? 'bg-red-50' : data.rainfallDeviationPercent < 0 ? 'bg-amber-50' : 'bg-emerald-50',
    },
    {
      label: 'Farmers Affected',
      value: data.farmersAffected.toLocaleString(),
      icon: Users,
      color: 'text-blue-800',
      bg: 'bg-blue-50',
    },
    {
      label: 'High Risk (Weather)',
      value: data.highRiskFarmers.toLocaleString(),
      icon: AlertTriangle,
      color: 'text-red-700',
      bg: 'bg-red-50',
    },
    {
      label: 'Vulnerable Crop',
      value: data.mostAffectedCrop,
      icon: Wheat,
      color: 'text-emerald-800',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Priority Block',
      value: data.mostAffectedBlock,
      icon: MapPin,
      color: 'text-purple-800',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="glass bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-xl text-[#1A1A1A]">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
          <CloudRain className="w-4 h-4" />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Weather & Rainfall Stress</h3>
      </div>
      <p className="text-slate-600 text-xs font-medium mb-5">Cumulative precipitation deficits vs long-term benchmark</p>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`p-3 rounded-2xl border border-black/5 bg-white/80 shadow-2xs`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                <span className="text-[10px] font-bold text-slate-500 truncate">{stat.label}</span>
              </div>
              <p className={`text-base font-black ${stat.color}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Comparison Chart */}
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(0,0,0,0.1)',
                borderRadius: '16px',
                color: '#0f172a',
                fontWeight: 'bold',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#334155' }} />
            <Bar dataKey="expected" name="Historical Expected (mm)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" name="Actual Recorded (mm)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
