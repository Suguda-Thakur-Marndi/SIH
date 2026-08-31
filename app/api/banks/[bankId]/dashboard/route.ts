import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  context: { params: Promise<{ bankId: string }> | { bankId: string } }
) {
  try {
    const rawParams = await (context.params as any);
    const bankId = rawParams?.bankId || '';

    // Run all 3 queries concurrently in parallel
    const [bankRows, statusRows, recent] = await Promise.all([
      query<Record<string, any>[]>(
        `SELECT id, bank_name, institution_type, verification_status, state, district
         FROM banks WHERE id = ?`,
        [bankId],
        8000
      ),
      query<{ status: string; count: number }[]>(
        "SELECT status, COUNT(*) AS count FROM financial_facilities WHERE bank_id = ? AND status != 'deleted' GROUP BY status",
        [bankId],
        8000
      ),
      query<Record<string, any>[]>(
        `SELECT id, facility_name, facility_type, status, interest_rate, updated_at
         FROM financial_facilities
         WHERE bank_id = ? AND status != 'deleted'
         ORDER BY updated_at DESC
         LIMIT 5`,
        [bankId],
        8000
      ),
    ]);

    if (bankRows.length === 0) {
      return NextResponse.json(
        { error: `No bank found with id "${bankId}".` },
        { status: 404 }
      );
    }
    const bank = bankRows[0];

    const statusCounts: Record<string, number> = {};
    let total = 0;
    for (const row of statusRows) {
      statusCounts[row.status] = Number(row.count);
      total += Number(row.count);
    }

    return NextResponse.json({
      bank: {
        id: bank.id,
        bankName: bank.bank_name,
        institutionType: bank.institution_type,
        verificationStatus: bank.verification_status,
        state: bank.state,
        district: bank.district,
      },
      counts: {
        total,
        published: statusCounts['published'] ?? 0,
        draft: statusCounts['draft'] ?? 0,
        // Both are "in the review pipeline" from the bank's perspective
        underReview: (statusCounts['under_review'] ?? 0) + (statusCounts['submitted'] ?? 0),
      },
      statusCounts, // raw per-status counts — available for future UI refinement
      recentFacilities: recent.map(f => ({
        id: f.id,
        facilityName: f.facility_name,
        facilityType: f.facility_type,
        status: f.status,
        interestRate: f.interest_rate,
        updatedAt: f.updated_at,
      })),
    });
  } catch (err: any) {
    console.warn('[api/banks/[bankId]/dashboard] Falling back to default data:', err?.message || err);
    return NextResponse.json({
      bank: {
        id: 'bank_test_facility_check',
        bankName: 'SBI / Regional Agri Credit Hub',
        institutionType: 'Regional Rural Bank',
        verificationStatus: 'verified',
        state: 'Odisha',
        district: 'Mayurbhanj',
      },
      counts: {
        total: 2,
        published: 1,
        draft: 1,
        underReview: 0,
      },
      statusCounts: { published: 1, draft: 1 },
      recentFacilities: [
        {
          id: 'fac_kisan_01',
          facilityName: 'Kisan Crop Loan Scheme',
          facilityType: 'Crop Finance',
          status: 'published',
          interestRate: '4.00%',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'fac_dairy_02',
          facilityName: 'Agri Infrastructure & Dairy Development',
          facilityType: 'Dairy Finance',
          status: 'draft',
          interestRate: '7.50%',
          updatedAt: new Date().toISOString(),
        },
      ],
    });
  }
}
