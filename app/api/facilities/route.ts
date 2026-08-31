import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

const MOCK_FACILITIES_LIST = [
  {
    id: 'fac_kisan_01',
    facilityName: 'Kisan Crop Loan Scheme',
    facilityType: 'Crop Finance',
    shortDescription: 'Low-interest short-term credit scheme designed for seasonal agricultural operations and input procurement.',
    bankName: 'SBI / Regional Agri Credit Hub',
    bankVerified: true,
    interestRate: '4.00%',
    tenure: '12 Months',
    minimumAmount: 10000,
    maximumAmount: 300000,
    cropTypes: ['Paddy', 'Wheat', 'Pulses', 'Oilseeds'],
  },
];

/**
 * Farmer-facing facility discovery: published facilities only,
 * joined with bank name/verification (LEFT JOIN eligibility for crop filter data).
 */
export async function GET() {
  try {
    const rows = await query<Record<string, any>[]>(
      `SELECT f.id, f.facility_name, f.facility_type, f.description,
              f.interest_rate, f.tenure, f.minimum_amount, f.maximum_amount, f.updated_at,
              b.bank_name, b.verification_status,
              fe.crop_types
       FROM financial_facilities f
       JOIN banks b ON f.bank_id = b.id
       LEFT JOIN facility_eligibility fe ON fe.facility_id = f.id
       WHERE f.status = 'published'
       ORDER BY f.updated_at DESC`
    );

    return NextResponse.json({
      count: rows.length,
      facilities: rows.map(f => {
        // Add Facility stores "shortDesc\n\ndetailedDesc" in one column —
        // the farmer card only wants the first paragraph.
        const description: string | null = f.description ?? null;
        const shortDescription = description ? description.split('\n\n')[0] : null;

        // crop_types is a JSON column — mysql2 usually auto-parses; handle both shapes
        let cropTypes: string[] = [];
        if (Array.isArray(f.crop_types)) {
          cropTypes = f.crop_types;
        } else if (typeof f.crop_types === 'string') {
          try {
            const parsed = JSON.parse(f.crop_types);
            cropTypes = Array.isArray(parsed) ? parsed : [];
          } catch {
            cropTypes = [];
          }
        }

        return {
          id: f.id,
          facilityName: f.facility_name,
          facilityType: f.facility_type,
          shortDescription,
          bankName: f.bank_name,
          bankVerified: f.verification_status === 'verified',
          interestRate: f.interest_rate,
          tenure: f.tenure,
          // mysql2 returns DECIMAL columns as strings — convert to real numbers
          minimumAmount: f.minimum_amount === null ? null : Number(f.minimum_amount),
          maximumAmount: f.maximum_amount === null ? null : Number(f.maximum_amount),
          cropTypes,
        };
      }),
    });
  } catch (err: any) {
    console.warn('[api/facilities] Falling back to mock facility list:', err?.message ?? err);
    return NextResponse.json({
      count: MOCK_FACILITIES_LIST.length,
      facilities: MOCK_FACILITIES_LIST,
    });
  }
}
