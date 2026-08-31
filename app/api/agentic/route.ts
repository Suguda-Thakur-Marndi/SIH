import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '18.52');
    const lon = parseFloat(searchParams.get('lon') || '73.85');

    // Mock geolocation detection or reverse geocoding
    const location = {
      state: "Odisha",
      district: "Mayurbhanj",
      block: "Baripada",
      lat: lat,
      lon: lon,
      season: "Kharif-Rabi Transition"
    };

    const inputs = {
      weather: {
        temperature_C: 31.5,
        humidity: 58,
        rainfall_7d_mm: 14.2,
        forecast: "Scattered light showers"
      },
      soil: {
        nitrogen: 240, // kg/ha
        phosphorous: 28,
        potassium: 195,
        pH: 6.4,
        organic_carbon_pct: 0.62,
        moisture_pct: 26
      },
      market: {
        crop: "Paddy / Swarna",
        avg_price: 2180,
        msp: 2300,
        trend: "Rising (+₹45 in 48h)",
        best_mandi: "Baripada APMC Market (12 km)"
      }
    };

    const systemRecommendations = [
      { crop: "Paddy (Swarna MTU 7029)", confidence: 0.94, expected_yield: "4.2 t/ha", risk_factor: "Water Deficit" },
      { crop: "Finger Millet (Ragi GPU-28)", confidence: 0.91, expected_yield: "2.8 t/ha", risk_factor: "Low Risk" },
      { crop: "Mustard / Rapeseed (PT-303)", confidence: 0.88, expected_yield: "1.9 t/ha", risk_factor: "Low Risk" }
    ];

    const llmReasoning = `Based on latitude ${lat}, longitude ${lon} in Mayurbhanj district with Red Loamy soil (pH 6.4) and a 14-day rainfall deficit, Paddy remains the primary crop but requires supplemental evening irrigation. Finger Millet and Mustard are highly recommended as climate-resilient alternative options with guaranteed procurement under government MSP.`;

    const advisory = `Immediate advice: Apply 2% Potassium Nitrate foliar spray to bolster crop drought tolerance. Schedule pump irrigation during evening hours (6 PM - 9 PM) to minimize evapotranspiration losses.`;

    const payload = {
      location,
      reasoning: {
        inputs,
        system_recommendations: systemRecommendations,
        llm_reasoning: llmReasoning
      },
      advisory
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "pipeline_error", message: err.message || "Failed to execute agentic pipeline" } },
      { status: 500 }
    );
  }
}
