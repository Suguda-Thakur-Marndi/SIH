"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart, ReferenceLine } from 'recharts';

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
      <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md animate-pulse" role="status" aria-busy="true" aria-label="Loading distress trend chart">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="space-y-1">
            <div className="h-6 w-36 rounded bg-white/10" />
            <div className="h-4 w-56 rounded bg-white/10" />
          </div>
          <div className="mt-2 md:mt-0 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <div className="h-4 w-40 rounded bg-white/10" />
          </div>
        </div>
        <div className="w-full h-72 rounded-xl relative overflow-hidden bg-white/[0.02]">
          {/* Horizontal grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="absolute left-8 right-4 h-px bg-white/5" style={{ top: `${20 + i * 15}%` }} />
          ))}
          {/* Vertical axis */}
          <div className="absolute top-4 bottom-8 left-8 w-px bg-white/5" />
          {/* Bottom axis */}
          <div className="absolute bottom-8 left-8 right-4 h-px bg-white/5" />
          {/* Fake bar charts */}
          <div className="absolute bottom-8 left-12 right-8 flex items-end justify-around gap-2 h-[60%]">
            {[40, 55, 35, 65, 50, 45, 60].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-white/5" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <span className="sr-only">Loading distress trend chart</span>
      </div>
    );
  }

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Distress Trend</h3>
          <p className="text-white/60 text-sm">Average risk score vs high-risk volume</p>
        </div>
        <div className="mt-2 md:mt-0 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
          <p className="text-blue-400 text-sm font-medium">{insight}</p>
        </div>
      </div>
      
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.5)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="left"
              stroke="rgba(255,255,255,0.5)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="rgba(255,255,255,0.5)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <ReferenceLine 
              yAxisId="left" 
              y={70} 
              stroke="#ef4444" 
              strokeDasharray="4 4" 
              strokeWidth={1.5}
              label={{ value: 'Critical Distress (>70)', fill: '#f87171', fontSize: 11, position: 'insideTopLeft' }} 
            />
            <Bar yAxisId="right" dataKey="highRiskCount" name="High Risk Count" fill="rgba(255,255,255,0.2)" radius={[4, 4, 0, 0]} barSize={20} />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="avgScore" 
              name="Avg Risk Score"
              stroke="#ef4444" 
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
