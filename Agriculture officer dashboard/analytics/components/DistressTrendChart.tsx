"use client";

import React from 'react';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart, ReferenceLine } from 'recharts';

interface TrendData {
  date: string;
  avgScore: number;
  highRiskCount: number;
}

interface Props {
  data: TrendData[] | null;
  loading: boolean;
  insight: string;
}

export function DistressTrendChart({ data, loading, insight }: Props) {
  if (loading || !data) {
    return (
      <div className="glass bg-white/80 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-xl animate-pulse" role="status" aria-busy="true" aria-label="Loading distress trend chart">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="space-y-1.5">
            <div className="h-6 w-36 rounded bg-slate-900/10" />
            <div className="h-4 w-56 rounded bg-slate-900/10" />
          </div>
          <div className="mt-2 md:mt-0 px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <div className="h-4 w-40 rounded bg-slate-900/10" />
          </div>
        </div>
        <div className="w-full h-72 rounded-2xl relative overflow-hidden bg-slate-900/[0.03]">
          {/* Horizontal grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="absolute left-8 right-4 h-px bg-slate-900/5" style={{ top: `${20 + i * 15}%` }} />
          ))}
          <div className="absolute top-4 bottom-8 left-8 w-px bg-slate-900/5" />
          <div className="absolute bottom-8 left-8 right-4 h-px bg-slate-900/5" />
          <div className="absolute bottom-8 left-12 right-8 flex items-end justify-around gap-2 h-[60%]">
            {[40, 55, 35, 65, 50, 45, 60].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-slate-900/10" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <span className="sr-only">Loading distress trend chart</span>
      </div>
    );
  }

  return (
    <div className="glass bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 shadow-xl text-[#1A1A1A]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-0.5">Distress Trend Over Time</h3>
          <p className="text-slate-600 text-xs font-medium">Average risk score tracking vs high-risk farmer volume</p>
        </div>
        {insight && (
          <div className="px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <p className="text-blue-900 text-xs font-bold">{insight}</p>
          </div>
        )}
      </div>
      
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="left"
              stroke="#64748b" 
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#64748b" 
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255,255,255,0.95)', 
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(0,0,0,0.1)', 
                borderRadius: '16px', 
                color: '#0f172a',
                fontWeight: 'bold',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
              }}
              itemStyle={{ color: '#0f172a' }}
            />
            <ReferenceLine 
              yAxisId="left" 
              y={70} 
              stroke="#ef4444" 
              strokeDasharray="4 4" 
              strokeWidth={1.5}
              label={{ value: 'Critical Threshold (>70)', fill: '#dc2626', fontSize: 10, fontWeight: 700, position: 'insideTopLeft' }} 
            />
            <Bar yAxisId="right" dataKey="highRiskCount" name="High Risk Count" fill="rgba(15,23,42,0.15)" radius={[6, 6, 0, 0]} barSize={18} />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="avgScore" 
              name="Avg Risk Score"
              stroke="#dc2626" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorScore)" 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
