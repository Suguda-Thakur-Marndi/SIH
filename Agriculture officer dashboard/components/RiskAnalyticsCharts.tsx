"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { riskCounts } from "../data/farmers.mock";
import { useLanguage } from "@/lib/language-context";

const trendData = [
  { name: 'Q1', value: 60 },
  { name: 'Q2', value: 67 },
  { name: 'Q3', value: 72 },
  { name: 'Q4', value: 81 },
];

export default function RiskAnalyticsCharts() {
  const { t } = useLanguage();

  const distributionData = [
    { name: t('high_risk', 'High Risk'), value: riskCounts.high, color: '#EF4444' },
    { name: t('medium_risk', 'Medium Risk'), value: riskCounts.medium, color: '#F59E0B' },
    { name: t('low_risk', 'Low Risk'), value: riskCounts.low, color: '#10B981' },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Risk Trend Line Chart */}
      <div className="glass p-5 md:p-6 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base md:text-lg font-bold text-[#1A1A1A]">
              {t('risk_trend', 'Quarterly Risk Trajectory')}
            </h3>
            <p className="text-xs text-[#6B6B66]">Mayurbhanj aggregate distress index (0-100)</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            +35% vs Q1
          </span>
        </div>
        <div className="h-[210px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#8C8C88" fontSize={11} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
              <YAxis stroke="#8C8C88" fontSize={11} tickLine={false} domain={[0, 100]} axisLine={{ stroke: '#E5E7EB' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(0,0,0,0.08)', 
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                  color: '#1A1A1A',
                  fontSize: '12px',
                  fontWeight: '600'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#1A1A1A" 
                strokeWidth={3} 
                dot={{ r: 5, fill: '#CFE362', stroke: '#1A1A1A', strokeWidth: 2 }} 
                activeDot={{ r: 7, fill: '#CFE362' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District Risk Distribution Pie Chart */}
      <div className="glass p-5 md:p-6 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base md:text-lg font-bold text-[#1A1A1A]">
              {t('risk_distribution', 'District Risk Distribution')}
            </h3>
            <p className="text-xs text-[#6B6B66]">Active triage breakdown across monitored farmers</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
            {riskCounts.high + riskCounts.medium + riskCounts.low} Tracked
          </span>
        </div>
        <div className="h-[210px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={distributionData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="46%" 
                innerRadius={45}
                outerRadius={75} 
                paddingAngle={4}
                label={({ value }) => `${value}`}
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.8)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                  fontWeight: '600'
                }} 
              />
              <Legend 
                verticalAlign="bottom" 
                height={28}
                wrapperStyle={{ color: '#1A1A1A', fontSize: '11px', fontWeight: '600' }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
