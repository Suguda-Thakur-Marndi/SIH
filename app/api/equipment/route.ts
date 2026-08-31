import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

type EquipmentRow = {
  id: string;
  name: string;
  type: string;
  owner: string;
  location: string;
  price_per_hour: string | number;
  availability: number;
};

const FALLBACK_EQUIPMENT = [
  {
    id: 'eq-001',
    name: 'Mahindra 575 DI Tractor (45 HP)',
    category: 'Tractor',
    categorySlug: 'tractor',
    provider: 'CHC Baripada Hub',
    location: 'Baripada, Mayurbhanj',
    availability: 'Available Now',
    matchScore: '98% match',
    icon: '🚜',
    specs: '45 HP • Dual Clutch • 4WD',
    rate: '₹450',
    unit: '/hour',
    distance: '3.2 km',
    features: ['High Fuel Efficiency', 'GPS Telemetry', 'Rotavator Compatible'],
  },
  {
    id: 'eq-002',
    name: 'Kubota Multi-Crop Combine Harvester',
    category: 'Harvester',
    categorySlug: 'harvester',
    provider: 'Krishi Vigyan Kendra CHC',
    location: 'Betnoti, Mayurbhanj',
    availability: 'Available Now',
    matchScore: '95% match',
    icon: '🌾',
    specs: '70 HP • Rubber Track • Straw Chopper',
    rate: '₹1,200',
    unit: '/hour',
    distance: '7.8 km',
    features: ['Minimal Grain Loss', 'Wet Field Operation', 'Night Floodlights'],
  },
  {
    id: 'eq-003',
    name: 'Solar-Powered Drone Crop Sprayer (16L)',
    category: 'Drone',
    categorySlug: 'drone',
    provider: 'GreenTech Agri Services',
    location: 'Badasahi, Mayurbhanj',
    availability: 'Available Now',
    matchScore: '99% match',
    icon: '🚁',
    specs: '16L Tank • 10-acre/hr • Terrain Radar',
    rate: '₹350',
    unit: '/acre',
    distance: '4.5 km',
    features: ['Precision Micron Nozzles', 'Autonomous Waypoint Flying', 'Pesticide Reduction'],
  },
  {
    id: 'eq-004',
    name: 'Heavy Duty Rotary Tiller (Rotavator)',
    category: 'Tillage',
    categorySlug: 'tillage',
    provider: 'Udala Farmers Cooperative CHC',
    location: 'Udala, Mayurbhanj',
    availability: 'Available Now',
    matchScore: '92% match',
    icon: '⚙️',
    specs: '6 Feet • 48 Blades • Multi-Speed Gearbox',
    rate: '₹280',
    unit: '/hour',
    distance: '12.0 km',
    features: ['Boron Steel Blades', 'Deep Soil Aeration', 'Heavy Duty Gear Drive'],
  },
];

export async function GET() {
  try {
    const rows: EquipmentRow[] = await query<EquipmentRow[]>(`
      SELECT id, name, type, owner, location, price_per_hour, availability
      FROM equipment
    `);

    if (rows && rows.length > 0) {
      const equipment = rows.map((row) => ({
        id: row.id,
        name: row.name,
        category: row.type,
        categorySlug: row.type.toLowerCase().replace(/\s+/g, '-'),
        provider: row.owner,
        location: row.location,
        availability: row.availability === 1 ? 'Available Now' : 'Unavailable',
        matchScore: '99% match',
        icon: '🔧',
        specs: '',
        rate: `₹${Number(row.price_per_hour)}`,
        unit: '/hour',
        distance: 'N/A',
        features: [],
      }));
      return NextResponse.json(equipment);
    }
  } catch (error: any) {
    console.warn('[API /api/equipment] Database query failed, using CHC fallback catalog:', error.message);
  }

  return NextResponse.json(FALLBACK_EQUIPMENT);
}
