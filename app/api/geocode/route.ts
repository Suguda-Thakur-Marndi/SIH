import { NextRequest, NextResponse } from 'next/server';

interface GeocodeResult {
  id: string;
  name: string;
  displayName: string;
  type: 'Country' | 'State' | 'District' | 'City / Town' | 'Block / Village';
  lat: number;
  lng: number;
  zoom: number;
  country?: string;
  state?: string;
}

// Built-in Instant Cache for key Indian States, Countries, and Mayurbhanj Hubs
const PRELOADED_LOCATIONS: GeocodeResult[] = [
  // Countries
  { id: 'cntry-in', name: 'India', displayName: 'India 🇮🇳', type: 'Country', lat: 20.5937, lng: 78.9629, zoom: 5 },
  { id: 'cntry-us', name: 'United States', displayName: 'United States 🇺🇸', type: 'Country', lat: 37.0902, lng: -95.7129, zoom: 4 },
  { id: 'cntry-uk', name: 'United Kingdom', displayName: 'United Kingdom 🇬🇧', type: 'Country', lat: 55.3781, lng: -3.4360, zoom: 5 },
  { id: 'cntry-au', name: 'Australia', displayName: 'Australia 🇦🇺', type: 'Country', lat: -25.2744, lng: 133.7751, zoom: 4 },
  { id: 'cntry-br', name: 'Brazil', displayName: 'Brazil 🇧🇷', type: 'Country', lat: -14.2350, lng: -51.9253, zoom: 4 },
  { id: 'cntry-ca', name: 'Canada', displayName: 'Canada 🇨🇦', type: 'Country', lat: 56.1304, lng: -106.3468, zoom: 4 },
  { id: 'cntry-jp', name: 'Japan', displayName: 'Japan 🇯🇵', type: 'Country', lat: 36.2048, lng: 138.2529, zoom: 5 },
  { id: 'cntry-de', name: 'Germany', displayName: 'Germany 🇩🇪', type: 'Country', lat: 51.1657, lng: 10.4515, zoom: 5 },

  // Indian States
  { id: 'st-od', name: 'Odisha', displayName: 'Odisha, India', type: 'State', lat: 20.9517, lng: 85.0985, zoom: 7.2 },
  { id: 'st-mh', name: 'Maharashtra', displayName: 'Maharashtra, India', type: 'State', lat: 19.7515, lng: 75.7139, zoom: 6.8 },
  { id: 'st-pb', name: 'Punjab', displayName: 'Punjab, India', type: 'State', lat: 31.1471, lng: 75.3412, zoom: 7.5 },
  { id: 'st-ka', name: 'Karnataka', displayName: 'Karnataka, India', type: 'State', lat: 15.3173, lng: 75.7139, zoom: 6.8 },
  { id: 'st-wb', name: 'West Bengal', displayName: 'West Bengal, India', type: 'State', lat: 22.9868, lng: 87.8550, zoom: 7.2 },
  { id: 'st-up', name: 'Uttar Pradesh', displayName: 'Uttar Pradesh, India', type: 'State', lat: 26.8467, lng: 80.9462, zoom: 6.5 },
  { id: 'st-tn', name: 'Tamil Nadu', displayName: 'Tamil Nadu, India', type: 'State', lat: 11.1271, lng: 78.6569, zoom: 6.8 },
  { id: 'st-ap', name: 'Andhra Pradesh', displayName: 'Andhra Pradesh, India', type: 'State', lat: 15.9129, lng: 79.7400, zoom: 6.8 },
  { id: 'st-tg', name: 'Telangana', displayName: 'Telangana, India', type: 'State', lat: 18.1124, lng: 79.0193, zoom: 7.2 },
  { id: 'st-br', name: 'Bihar', displayName: 'Bihar, India', type: 'State', lat: 25.0961, lng: 85.3131, zoom: 7.2 },
  { id: 'st-mp', name: 'Madhya Pradesh', displayName: 'Madhya Pradesh, India', type: 'State', lat: 22.9734, lng: 78.6569, zoom: 6.5 },
  { id: 'st-rj', name: 'Rajasthan', displayName: 'Rajasthan, India', type: 'State', lat: 27.0238, lng: 74.2179, zoom: 6.5 },
  { id: 'st-gj', name: 'Gujarat', displayName: 'Gujarat, India', type: 'State', lat: 22.2587, lng: 71.1924, zoom: 6.8 },
  { id: 'st-hr', name: 'Haryana', displayName: 'Haryana, India', type: 'State', lat: 29.0588, lng: 76.0856, zoom: 7.5 },
  { id: 'st-kl', name: 'Kerala', displayName: 'Kerala, India', type: 'State', lat: 10.8505, lng: 76.2711, zoom: 7.5 },
  { id: 'st-jh', name: 'Jharkhand', displayName: 'Jharkhand, India', type: 'State', lat: 23.6102, lng: 85.2799, zoom: 7.5 },
  { id: 'st-as', name: 'Assam', displayName: 'Assam, India', type: 'State', lat: 26.2006, lng: 92.9376, zoom: 7.2 },

  // Key Cities & Districts
  { id: 'cty-bbsr', name: 'Bhubaneswar', displayName: 'Bhubaneswar, Capital of Odisha', type: 'City / Town', lat: 20.2961, lng: 85.8245, zoom: 11.5 },
  { id: 'cty-ctc', name: 'Cuttack', displayName: 'Cuttack, Silver City, Odisha', type: 'City / Town', lat: 20.4625, lng: 85.8830, zoom: 11.5 },
  { id: 'cty-del', name: 'New Delhi', displayName: 'New Delhi, India', type: 'City / Town', lat: 28.6139, lng: 77.2090, zoom: 10.5 },
  { id: 'cty-mum', name: 'Mumbai', displayName: 'Mumbai, Maharashtra', type: 'City / Town', lat: 19.0760, lng: 72.8777, zoom: 10.5 },
  { id: 'cty-blr', name: 'Bengaluru', displayName: 'Bengaluru, Karnataka', type: 'City / Town', lat: 12.9716, lng: 77.5946, zoom: 10.5 },
  { id: 'cty-kol', name: 'Kolkata', displayName: 'Kolkata, West Bengal', type: 'City / Town', lat: 22.5726, lng: 88.3639, zoom: 10.5 },
  { id: 'cty-hyd', name: 'Hyderabad', displayName: 'Hyderabad, Telangana', type: 'City / Town', lat: 17.3850, lng: 78.4867, zoom: 10.5 },

  // Mayurbhanj District & Blocks
  { id: 'dist-myb', name: 'Mayurbhanj', displayName: 'Mayurbhanj District, Odisha', type: 'District', lat: 21.9324, lng: 86.7351, zoom: 9.3 },
  { id: 'blk-baripada', name: 'Baripada', displayName: 'Baripada Town & Block, Mayurbhanj', type: 'Block / Village', lat: 21.9324, lng: 86.7351, zoom: 12.5 },
  { id: 'blk-betnoti', name: 'Betnoti', displayName: 'Betnoti Block, Mayurbhanj', type: 'Block / Village', lat: 21.7382, lng: 86.8524, zoom: 12.5 },
  { id: 'blk-badasahi', name: 'Badasahi', displayName: 'Badasahi Block, Mayurbhanj', type: 'Block / Village', lat: 21.7241, lng: 86.7583, zoom: 12.5 },
  { id: 'blk-kuliana', name: 'Kuliana', displayName: 'Kuliana Block, Mayurbhanj', type: 'Block / Village', lat: 22.0425, lng: 86.6342, zoom: 12.5 },
  { id: 'blk-rairangpur', name: 'Rairangpur', displayName: 'Rairangpur Sub-Division, Mayurbhanj', type: 'Block / Village', lat: 22.2684, lng: 86.1682, zoom: 12.5 },
  { id: 'blk-udala', name: 'Udala', displayName: 'Udala Block, Mayurbhanj', type: 'Block / Village', lat: 21.5842, lng: 86.5721, zoom: 12.5 },
  { id: 'blk-karanjia', name: 'Karanjia', displayName: 'Karanjia Block, Mayurbhanj', type: 'Block / Village', lat: 21.7845, lng: 85.9723, zoom: 12.5 },
  { id: 'blk-jashipur', name: 'Jashipur', displayName: 'Jashipur (Similipal), Mayurbhanj', type: 'Block / Village', lat: 21.9681, lng: 86.0824, zoom: 12.5 },
  { id: 'blk-morada', name: 'Morada', displayName: 'Morada Block, Mayurbhanj', type: 'Block / Village', lat: 21.8482, lng: 86.9925, zoom: 12.5 },
  { id: 'blk-samakhunta', name: 'Samakhunta', displayName: 'Samakhunta Block, Mayurbhanj', type: 'Block / Village', lat: 21.9083, lng: 86.7121, zoom: 12.5 },
  { id: 'blk-khunta', name: 'Khunta', displayName: 'Khunta Block, Mayurbhanj', type: 'Block / Village', lat: 21.6243, lng: 86.6281, zoom: 12.5 },
  { id: 'blk-bangriposi', name: 'Bangriposi', displayName: 'Bangriposi Ghati & Block, Mayurbhanj', type: 'Block / Village', lat: 22.1582, lng: 86.5342, zoom: 12.5 },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json({
      success: true,
      query: '',
      results: PRELOADED_LOCATIONS.slice(0, 10),
    });
  }

  const lowerQ = q.toLowerCase();

  // 1. Instant matching against preloaded locations
  const preloadedMatches = PRELOADED_LOCATIONS.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQ) ||
      item.displayName.toLowerCase().includes(lowerQ) ||
      item.type.toLowerCase().includes(lowerQ)
  );

  // 2. Fetch live geocoding results from OpenStreetMap Nominatim for universal global places
  let liveResults: GeocodeResult[] = [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      q
    )}&limit=6&addressdetails=1`;

    const res = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SmartCrop-LocationIntelligence/1.0',
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        liveResults = data.map((item: any) => {
          let type: GeocodeResult['type'] = 'City / Town';
          let zoom = 10.5;

          if (item.type === 'country' || item.class === 'boundary' && item.addresstype === 'country') {
            type = 'Country';
            zoom = 4.5;
          } else if (item.type === 'state' || item.addresstype === 'state') {
            type = 'State';
            zoom = 6.8;
          } else if (item.addresstype === 'county' || item.addresstype === 'district') {
            type = 'District';
            zoom = 9.2;
          } else if (item.addresstype === 'village' || item.addresstype === 'suburb') {
            type = 'Block / Village';
            zoom = 13.0;
          }

          const parts = item.display_name.split(', ');
          const shortName = parts.slice(0, 2).join(', ');

          return {
            id: `osm-${item.place_id}`,
            name: parts[0],
            displayName: shortName || item.display_name,
            type,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            zoom,
            country: item.address?.country,
            state: item.address?.state,
          };
        });
      }
    }
  } catch (err) {
    // Graceful fallback to preloaded
  }

  // Combine results with preloaded prioritized
  const combined = [...preloadedMatches, ...liveResults];

  // De-duplicate by coordinate proximity
  const uniqueResults: GeocodeResult[] = [];
  for (const item of combined) {
    const isDuplicate = uniqueResults.some(
      (u) =>
        Math.abs(u.lat - item.lat) < 0.05 && Math.abs(u.lng - item.lng) < 0.05
    );
    if (!isDuplicate) {
      uniqueResults.push(item);
    }
  }

  return NextResponse.json({
    success: true,
    query: q,
    count: uniqueResults.length,
    results: uniqueResults.slice(0, 8),
  });
}
