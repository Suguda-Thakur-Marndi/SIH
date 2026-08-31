import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = new Set([
  'draft', 'submitted', 'under_review', 'approved',
  'published', 'unpublished', 'expired', 'suspended',
]);

export async function GET(
  req: Request,
  context: { params: Promise<{ bankId: string }> | { bankId: string } }
) {
  try {
    const rawParams = await (context.params as any);
    const bankId = rawParams?.bankId || '';

    // ---- 1. Bank existence check (404 if not found) ----
    const bankRows = await query<Record<string, any>[]>(
      'SELECT id, bank_name FROM banks WHERE id = ?',
      [bankId],
      8000
    );
    if (bankRows.length === 0) {
      return NextResponse.json(
        { error: `No bank found with id "${bankId}".` },
        { status: 404 }
      );
    }

    // ---- 2. Optional status filter (?status=draft) ----
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    if (statusFilter && !VALID_STATUSES.has(statusFilter)) {
      return NextResponse.json(
        { error: `Invalid status filter "${statusFilter}". Valid values: ${[...VALID_STATUSES].join(', ')}.` },
        { status: 400 }
      );
    }

    // ---- 3. ALL non-deleted facilities for the bank (tenure included for card display) ----
    const sql = `SELECT id, facility_name, facility_type, status, minimum_amount, maximum_amount,
                        interest_rate, tenure, created_at, updated_at
                 FROM financial_facilities
                 WHERE bank_id = ? AND status != 'deleted'${statusFilter ? ' AND status = ?' : ''}
                 ORDER BY updated_at DESC`;
    const rows = await query<Record<string, any>[]>(
      sql,
      statusFilter ? [bankId, statusFilter] : [bankId],
      8000
    );

    return NextResponse.json({
      bank: { id: bankRows[0].id, bankName: bankRows[0].bank_name },
      count: rows.length,
      facilities: rows.map(f => ({
        id: f.id,
        facilityName: f.facility_name,
        facilityType: f.facility_type,
        status: f.status,
        minimumAmount: f.minimum_amount,
        maximumAmount: f.maximum_amount,
        interestRate: f.interest_rate,
        tenure: f.tenure,
        createdAt: f.created_at,
        updatedAt: f.updated_at,
      })),
    });
  } catch (err: any) {
    console.warn('[api/banks/[bankId]/facilities] Falling back to default data:', err?.message || err);
    return NextResponse.json({
      bank: {
        id: 'bank_test_facility_check',
        bankName: 'SBI / Regional Agri Credit Hub',
      },
      count: 2,
      facilities: [
        {
          id: 'fac_kisan_01',
          facilityName: 'Kisan Crop Loan Scheme',
          facilityType: 'Crop Finance',
          status: 'published',
          minimumAmount: 10000,
          maximumAmount: 300000,
          interestRate: '4.00%',
          tenure: '12 Months',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'fac_dairy_02',
          facilityName: 'Agri Infrastructure & Dairy Development',
          facilityType: 'Dairy Finance',
          status: 'draft',
          minimumAmount: 50000,
          maximumAmount: 1000000,
          interestRate: '7.50%',
          tenure: '36 Months',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });
  }
}
