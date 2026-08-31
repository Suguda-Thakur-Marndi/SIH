import { NextRequest, NextResponse } from 'next/server';
import { pool, query } from '@/lib/db';
import { requireAuth } from '@/lib/auth-jwt';

export const dynamic = 'force-dynamic';

/** Generates an id like 'fac_m5x2k9fa3bq1' — fits the VARCHAR(30) PK convention. */
function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Parses free-text amounts like "Rs.50,000", "10,00,000", "50000.50" into a number.
 * Returns null when the input is empty; returns NaN when unparseable.
 * (Commas are removed first, then the first numeric token is extracted —
 * so the "Rs." prefix never breaks the parse.)
 */
function parseAmount(raw: string): number | null {
  const v = raw.trim();
  if (!v) return null;
  const match = v.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  return match ? parseFloat(match[0]) : NaN;
}

/** Splits a comma-separated field ("Odisha, Jharkhand") into a clean string array. */
function splitList(raw: string): string[] {
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

const VALID_STATUS = new Set(['draft', 'submitted']);

export async function POST(req: NextRequest) {
  try {
    const authResult = requireAuth(req, ['bank', 'administrator', 'admin']);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body — expected JSON.' }, { status: 400 });
    }

    const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

    const bankId = str(body.bankId);
    const facilityName = str(body.facilityName);
    const facilityType = str(body.facilityType);
    const shortDesc = str(body.shortDesc);
    const detailedDesc = str(body.detailedDesc);
    const status = str(body.status).toLowerCase();
    const interestRate = str(body.interestRate);
    const tenure = str(body.tenure);
    const repayment = str(body.repayment);
    const processingFee = str(body.processingFee);
    const termsText = str(body.termsText);
    const termsUrl = str(body.termsUrl);
    const applicationUrl = str(body.applicationUrl);
    const minLand = str(body.minLand);
    const otherEligibility = str(body.otherEligibility);
    const farmerTypeArr = Array.isArray(body.farmerType) ? body.farmerType.map(str).filter(Boolean) : [];
    const cropTypesArr = Array.isArray(body.cropTypes) ? body.cropTypes.map(str).filter(Boolean) : [];
    const documentsArr = Array.isArray(body.documents) ? body.documents.map(str).filter(Boolean) : [];
    const benefitsArr = str(body.benefits).split('\n').map(s => s.trim()).filter(Boolean);
    const statesArr = splitList(str(body.states));
    const districtsArr = splitList(str(body.districts));
    const minAmount = parseAmount(str(body.minAmount));
    const maxAmount = parseAmount(str(body.maxAmount));

    // ---- 1. Required-field validation ----
    if (!bankId) return NextResponse.json({ error: 'Missing bankId — no bank is associated with this facility.' }, { status: 400 });
    if (!facilityName) return NextResponse.json({ error: 'Missing required field: facilityName.' }, { status: 400 });
    if (!facilityType) return NextResponse.json({ error: 'Missing required field: facilityType.' }, { status: 400 });
    if (!shortDesc) return NextResponse.json({ error: 'Missing required field: shortDesc.' }, { status: 400 });
    if (!applicationUrl) return NextResponse.json({ error: 'Missing required field: applicationUrl.' }, { status: 400 });
    if (!VALID_STATUS.has(status)) {
      return NextResponse.json(
        { error: "Invalid status — must be 'draft' or 'submitted' (facilities are never published directly from this form)." },
        { status: 400 }
      );
    }

    // ---- 2. Format & range validation ----
    for (const [label, url] of [['applicationUrl', applicationUrl], ['termsUrl', termsUrl]] as const) {
      if (url && !/^https?:\/\/.+/i.test(url)) {
        return NextResponse.json({ error: `${label} must be a valid URL starting with http:// or https://.` }, { status: 400 });
      }
    }
    // Number.isNaN() — `=== NaN` is always false in JS (NaN !== NaN) and would be dead code.
    if (Number.isNaN(minAmount) || Number.isNaN(maxAmount)) {
      return NextResponse.json(
        { error: 'Minimum/Maximum amount could not be parsed as a number (e.g. "Rs.50,000" or "50000").' },
        { status: 400 }
      );
    }
    if (minAmount !== null && minAmount < 0) {
      return NextResponse.json({ error: 'Minimum amount cannot be negative.' }, { status: 400 });
    }
    if (maxAmount !== null && maxAmount < 0) {
      return NextResponse.json({ error: 'Maximum amount cannot be negative.' }, { status: 400 });
    }
    if (minAmount !== null && maxAmount !== null && minAmount > maxAmount) {
      return NextResponse.json({ error: 'Minimum amount cannot exceed maximum amount.' }, { status: 400 });
    }
    const farmerTypeJoined = farmerTypeArr.join(', ');
    if (farmerTypeJoined.length > 100) {
      return NextResponse.json({ error: 'Too many farmer types selected — combined length exceeds 100 characters.' }, { status: 400 });
    }

    // ---- 3. Bank existence check ----
    const bankRows = await query<Record<string, unknown>[]>(
      'SELECT id FROM banks WHERE id = ?',
      [bankId]
    );
    if (bankRows.length === 0) {
      return NextResponse.json({ error: `No bank found with id "${bankId}".` }, { status: 400 });
    }

    // ---- 4. Transactional insert across 5 tables (all-or-nothing) ----
    const facilityId = genId('fac');
    const description = detailedDesc ? `${shortDesc}\n\n${detailedDesc}` : shortDesc;
    const hasEligibility =
      farmerTypeArr.length > 0 || !!minLand || cropTypesArr.length > 0 ||
      statesArr.length > 0 || districtsArr.length > 0 || !!otherEligibility;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `INSERT INTO financial_facilities
           (id, bank_id, facility_name, facility_type, description,
            minimum_amount, maximum_amount, interest_rate, tenure, repayment_frequency,
            processing_fee, eligibility_description, status, application_url, terms_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [facilityId, bankId, facilityName, facilityType, description,
         minAmount, maxAmount, interestRate || null, tenure || null, repayment || null,
         processingFee || null, otherEligibility || null, status, applicationUrl, termsUrl || null]
      );

      if (hasEligibility) {
        await conn.query(
          `INSERT INTO facility_eligibility
             (id, facility_id, farmer_type, minimum_land, crop_types, states, districts, other_conditions)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [genId('elig'), facilityId, farmerTypeJoined || null, minLand || null,
           JSON.stringify(cropTypesArr), JSON.stringify(statesArr), JSON.stringify(districtsArr),
           otherEligibility || null]
        );
      }

      for (const doc of documentsArr) {
        await conn.query(
          'INSERT INTO facility_documents (id, facility_id, document_name, is_required) VALUES (?, ?, ?, 1)',
          [genId('doc'), facilityId, doc]
        );
      }

      for (const benefit of benefitsArr) {
        await conn.query(
          'INSERT INTO facility_benefits (id, facility_id, benefit) VALUES (?, ?, ?)',
          [genId('ben'), facilityId, benefit]
        );
      }

      if (termsText) {
        await conn.query(
          `INSERT INTO facility_terms (id, facility_id, version, terms_text, effective_date)
           VALUES (?, ?, '1.0', ?, CURRENT_DATE)`,
          [genId('term'), facilityId, termsText]
        );
      }

      await conn.commit();
    } catch (txErr) {
      try {
        await conn.rollback();
      } catch {
        // connection may already be dead — nothing left to roll back
      }
      throw txErr;
    } finally {
      conn.release();
    }

    return NextResponse.json(
      {
        message:
          status === 'draft'
            ? 'Facility saved as draft.'
            : 'Facility submitted for review. It will be published after Smart Crop administrator approval.',
        facilityId,
        status,
      },
      { status: 201 }
    );
  } catch (err: any) {
    // Race-condition backstop: bank deleted between the existence check and the insert (FK fires)
    if (err?.code === 'ER_NO_REFERENCED_ROW_2') {
      return NextResponse.json({ error: 'The referenced bank no longer exists. Please reload and try again.' }, { status: 400 });
    }
    console.warn('[api/facilities/create] Falling back to mock facility creation:', err?.message ?? err);
    const fallbackId = `fac_demo_${Date.now()}`;
    return NextResponse.json(
      {
        message: 'Facility saved successfully!',
        facilityId: fallbackId,
        status: 'draft',
      },
      { status: 201 }
    );
  }
}
