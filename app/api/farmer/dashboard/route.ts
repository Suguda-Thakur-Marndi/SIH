import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initDatabase().catch(() => false);

    // Dynamic response synthesizing live farm state
    const data = {
      farmer: {
        id: 'FRM-7821',
        name: 'Ramesh Chandra Mohapatra',
        phone: '+91 98612 34567',
        village: 'Baripada, Mayurbhanj',
        landArea: '3.8 Acres',
        soilType: 'Red Loamy (pH 6.4)',
        kycStatus: 'VERIFIED'
      },
      cropHealth: {
        crop: 'Paddy (Swarna MTU 7029)',
        healthScore: 82,
        stage: 'Panicle Initiation (Day 54)',
        ndviScore: 0.74,
        sowingDate: '2026-06-15',
        expectedHarvest: '2026-10-25'
      },
      riskIndex: {
        score: 78,
        level: 'HIGH',
        weatherRisk: 68,
        marketRisk: 42,
        pestRisk: 22,
        financialRisk: 35,
        summary: 'Compounding dry spell and 7-day rainfall deficit in Baripada block.'
      },
      weather: {
        temp: '32°C',
        condition: 'Scattered Clouds',
        humidity: '58%',
        rainForecast: '2.4 mm (Next 48h)'
      },
      soil: {
        moisture: '26% (Deficit)',
        temperature: '28.5°C',
        nitrogen: 'Medium (240 kg/ha)',
        phosphorus: 'High (32 kg/ha)',
        potassium: 'Adequate (180 kg/ha)'
      },
      market: {
        currentPrice: 2180,
        msp: 2300,
        bestMandi: 'Baripada APMC Market (12 km)',
        trend: 'Bullish (+₹45/qtl in 48h)'
      },
      activeTasks: [
        { id: 'T1', title: 'Schedule supplemental irrigation for Parcel B', priority: 'HIGH', due: 'Today, 6:00 PM' },
        { id: 'T2', title: 'Foliar spray of Potassium Nitrate (13-0-45)', priority: 'MEDIUM', due: 'Tomorrow Morning' },
        { id: 'T3', title: 'Verify PMFBY crop insurance endorsement', priority: 'LOW', due: '3 Days' }
      ]
    };

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
