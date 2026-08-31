"use client";

import React, { useState, useEffect } from 'react';
import RiskHeader from './components/RiskHeader';
import RiskFactorsSection from './components/RiskFactorsSection';
import AiReasoningSection from './components/AiReasoningSection';

export default function RiskDetailsPage() {
  const [aiLoading, setAiLoading] = useState(false);
  const [riskData] = useState({
    overallScore: 78,
    cropName: 'Paddy (Swarna MTU 7029)',
    riskLevel: 'HIGH',
    factors: [
      { name: 'Weather Stress (Rainfall Deficit)', score: 68, max: 100, level: 'HIGH', detail: '22% deficit in 14-day cumulative rainfall in Baripada block.' },
      { name: 'Soil Moisture Depletion', score: 64, max: 100, level: 'HIGH', detail: 'Moisture dropped to 24% at 15cm depth during flowering stage.' },
      { name: 'Market Volatility & Price Risk', score: 42, max: 100, level: 'MEDIUM', detail: 'Wholesale arrival surge expected within 10 days.' },
      { name: 'Credit & Repayment Pressure', score: 35, max: 100, level: 'LOW', detail: 'KCC repayment due on Nov 30; interest subvention active.' },
      { name: 'Pest & Disease Pressure', score: 22, max: 100, level: 'LOW', detail: 'Brown plant hopper activity within permissible threshold.' }
    ]
  });

  const [aiExplanation, setAiExplanation] = useState<any>(null);

  const fetchAiExplanation = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/risk-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: 'Paddy (Swarna)',
          riskScore: 78,
          weatherRisk: 68,
          marketRisk: 42,
          soilMoisture: '24% (Deficit)',
          district: 'Mayurbhanj, Odisha'
        })
      });
      const json = await res.json();
      if (json.success) {
        setAiExplanation(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchAiExplanation();
  }, []);

  return (
    <div className="relative min-h-screen font-sans overflow-x-hidden text-slate-900">
      
      {/* Dynamic Responsive Background:
          - 16:9 / Desktop / Landscape: Bg Laptop.png
          - 9:16 / Mobile / Portrait: Bg phone.png
      */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed transition-all duration-700 bg-[url('/risk-detail/bg-phone.png')] md:bg-[url('/risk-detail/bg-laptop.png')] [aspect-ratio:16/9]:bg-[url('/risk-detail/bg-laptop.png')] [aspect-ratio:9/16]:bg-[url('/risk-detail/bg-phone.png')]"
      />

      {/* Subtle Transparent Emerald & Frosted Glass Layer */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-white/30 via-emerald-950/10 to-emerald-900/25 backdrop-blur-[2px] pointer-events-none" />

      {/* Main Glass Content Container */}
      <div className="relative z-10 p-4 md:p-8 lg:p-10 max-w-6xl mx-auto space-y-6">
        
        {/* Header Hero Section */}
        <RiskHeader 
          overallScore={riskData.overallScore} 
          cropName={riskData.cropName} 
        />

        {/* Factors & AI Reasoning Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <RiskFactorsSection factors={riskData.factors} />
          </div>
          <div className="lg:col-span-5">
            <AiReasoningSection 
              aiLoading={aiLoading} 
              aiExplanation={aiExplanation} 
              onReanalyze={fetchAiExplanation} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}
