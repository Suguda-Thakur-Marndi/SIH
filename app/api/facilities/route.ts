import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Farmer-facing facility discovery: published facilities only,
 * joined with bank name/verification (LEFT JOIN eligibility for crop filter data).
 */
const FALLBACK_FACILITIES = [
  {
    id: 'fac_01',
    facilityName: 'Kisan Credit Card (KCC) Crop Loan',
    facilityType: 'KCC Loan',
    shortDescription: 'Concessional crop loan with 3% interest subvention for timely repayment.',
    bankName: 'State Bank of India (SBI)',
    bankVerified: true,
    interestRate: '4.00%',
    tenure: '12 Months',
    minimumAmount: 10000,
    maximumAmount: 300000,
    cropTypes: ['Paddy', 'Wheat', 'Mustard', 'Maize'],
  },
  {
    id: 'fac_02',
    facilityName: 'Micro-Irrigation & Drip Subvention Scheme',
    facilityType: 'Equipment Loan',
    shortDescription: 'Subsidized financing for solar pump sets and precision micro-drip irrigation.',
    bankName: 'Odisha Gramya Bank',
    bankVerified: true,
    interestRate: '6.50%',
    tenure: '36 Months',
    minimumAmount: 25000,
    maximumAmount: 150000,
    cropTypes: ['Vegetables', 'Pulses', 'Oilseeds'],
  },
  {
    id: 'fac_03',
    facilityName: 'NABARD Post-Harvest Storage Financing',
    facilityType: 'Warehouse Receipt Loan',
    shortDescription: 'Pledge warehouse e-NWR receipts to avoid distress sale post-harvest.',
    bankName: 'Punjab National Bank',
    bankVerified: true,
    interestRate: '5.25%',
    tenure: '6 Months',
    minimumAmount: 50000,
    maximumAmount: 500000,
    cropTypes: ['Paddy', 'Cotton', 'Millets'],
  },
];

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

    if (rows && rows.length > 0) {
      return NextResponse.json({
        count: rows.length,
        facilities: rows.map((f) => {
          const description: string | null = f.description ?? null;
          const shortDescription = description ? description.split('\n\n')[0] : null;

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
            minimumAmount: f.minimum_amount === null ? null : Number(f.minimum_amount),
            maximumAmount: f.maximum_amount === null ? null : Number(f.maximum_amount),
            cropTypes,
          };
        }),
      });
    }
  } catch (err: any) {
    console.error('[api/facilities] GET failed:', err?.message ?? err);
    return NextResponse.json({ error: 'Failed to load facilities. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({
    count: FALLBACK_FACILITIES.length,
    facilities: FALLBACK_FACILITIES,
  });
}
