import { NextResponse } from 'next/server';
import { generateIrrigationAdvisory } from '@/lib/irrigation-advisor';

export async function GET() {
  // Compute dynamic irrigation advisory based on 48h weather forecast (e.g. 28mm rain in Baripada)
  const irrigationAdvisory = generateIrrigationAdvisory({
    forecast48hMm: 28.0,
    soilMoisturePct: 26,
    cropStage: 'Flowering',
    skipThresholdMm: 20,
    pumpCostPerEventInr: 450,
  });

  const recommendations = [
    {
      id: 'REC-01',
      title: irrigationAdvisory.title,
      category: 'Irrigation Management',
      priority: irrigationAdvisory.urgency,
      impact: `Save ₹${irrigationAdvisory.estimatedSavingsInr} fuel & ${irrigationAdvisory.waterSavedLiters.toLocaleString()}L water`,
      timeframe: 'Next 48 Hours',
      description: irrigationAdvisory.reason,
      actionUrl: '/crop-monitoring',
      isCompleted: false,
      advisoryDetails: irrigationAdvisory,
    },
    {
      id: 'REC-02',
      title: 'Apply 2% Potassium Nitrate (13-0-45) Foliar Spray',
      category: 'Nutrient Management',
      priority: 'HIGH',
      impact: 'Strengthens osmotic adjustment & prevents flower drop',
      timeframe: 'Within 48 Hours',
      description: 'Spray 20g per liter of water in clear morning weather. Avoid tank-mixing with organophosphates.',
      actionUrl: '/crop-details',
      isCompleted: false
    },
    {
      id: 'REC-03',
      title: 'Explore Short-Duration Alternative Crop for Parcel C',
      category: 'Risk Diversification',
      priority: 'MEDIUM',
      impact: 'Protects post-monsoon farm revenue',
      timeframe: 'Next 7 Days',
      description: 'Consider Finger Millet (Ragi GPU-28) or Black Gram under Odisha Millet Mission with guaranteed MSP procurement.',
      actionUrl: '/alternative-crop',
      isCompleted: false
    },
    {
      id: 'REC-04',
      title: 'Verify Government Relief & Input Subsidies',
      category: 'Government Schemes',
      priority: 'MEDIUM',
      impact: 'Unlocks subsidized farm inputs & drought relief',
      timeframe: 'Next 3 Days',
      description: 'Check active Odisha Krushak & Central schemes matching your Mayurbhanj land parcel.',
      actionUrl: '/schemes',
      isCompleted: false
    },
    {
      id: 'REC-05',
      title: 'Request Agriculture Officer Field Inspection',
      category: 'Extension Support',
      priority: 'LOW',
      impact: 'Formalizes block-level assistance & subsidy advisory',
      timeframe: 'Flexible',
      description: 'Notify Agriculture Officer Satyajit Jena for parcel verification and soil amendment kit distribution.',
      actionUrl: '/officer-dashboard',
      isCompleted: false
    }
  ];

  return NextResponse.json({ 
    success: true, 
    data: recommendations,
    irrigationAdvisory,
  });
}

