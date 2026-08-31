import { NextResponse } from 'next/server';
import { pool, query } from '@/lib/db';

export const dynamic = 'force-dynamic';

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function formatDate(d: Date | string | null): string {
  if (!d) return '';
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseAmount(raw: string): number | null {
  const v = raw.trim();
  if (!v) return null;
  const match = v.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  return match ? parseFloat(match[0]) : NaN;
}

function splitList(raw: string): string[] {
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

function calculateNextVersion(currentVer: string | null): string {
  if (!currentVer) return '1.0';
  const match = currentVer.match(/^(\d+)\.(\d+)$/);
  if (match) {
    const major = parseInt(match[1], 10);
    const minor = parseInt(match[2], 10) + 1;
    return `${major}.${minor}`;
  }
  const num = parseFloat(currentVer);
  if (!isNaN(num)) {
    return (num + 0.1).toFixed(1);
  }
  return `${currentVer}.1`;
}

const MOCK_FACILITY_DETAILS: Record<string, any> = {
  fac_kisan_01: {
    id: 'fac_kisan_01',
    bankId: 'bank_test_facility_check',
    bankName: 'SBI / Regional Agri Credit Hub',
    bankVerified: true,
    facilityName: 'Kisan Crop Loan Scheme',
    facilityType: 'Crop Finance',
    shortDescription: 'Low-interest short-term credit scheme designed for seasonal agricultural operations and input procurement.',
    detailedDescription: 'Provides comprehensive credit support to farmers for crop cultivation, post-harvest expenses, and working capital maintenance with attractive interest subvention.',
    minAmount: 10000,
    maxAmount: 300000,
    interestRate: '4.00%',
    tenure: '12 Months',
    repayment: 'Seasonal',
    processingFee: 'Nil up to ₹3 Lakhs',
    otherCharges: null,
    farmerType: ['Individual Farmer', 'Tenant Farmer', 'Sharecropper'],
    minLand: '0.5 acre',
    maxLand: null,
    cropTypes: ['Paddy', 'Wheat', 'Pulses', 'Oilseeds'],
    states: ['Odisha', 'West Bengal', 'Jharkhand'],
    districts: ['Mayurbhanj', 'Balasore', 'Cuttack', 'Khordha'],
    otherEligibility: 'Valid Aadhaar, land record / tenancy certificate, and active bank savings account required.',
    documents: ['Aadhaar', 'Land record', 'Bank account details', 'Passport-size photograph'],
    benefits: [
      'Subsidized 4% interest rate with prompt repayment incentive',
      'Flexible seasonal repayment linked to crop harvest',
      'Zero processing fee for loans up to ₹3,00,000',
    ],
    termsText: 'Standard Kisan Credit Scheme terms apply. Repayment is mandatory within 12 months or upon harvest marketing.',
    termsVersion: '1.0',
    termsUrl: 'https://sbi.co.in/kisan-credit-scheme/terms',
    applicationUrl: 'https://sbi.co.in/apply/kcc',
    status: 'published',
    lastUpdated: '15 Aug 2026',
    expiryDate: null,
  },
  fac_dairy_02: {
    id: 'fac_dairy_02',
    bankId: 'bank_test_facility_check',
    bankName: 'SBI / Regional Agri Credit Hub',
    bankVerified: true,
    facilityName: 'Agri Infrastructure & Dairy Development',
    facilityType: 'Dairy Finance',
    shortDescription: 'Term loan assistance for setting up dairy units, purchasing milch animals, and modern shed construction.',
    detailedDescription: 'Structured financial facility aimed at augmenting allied agricultural income through cattle purchase, dairy chilling equipment, and automated milking units.',
    minAmount: 50000,
    maxAmount: 1000000,
    interestRate: '7.50%',
    tenure: '36 Months',
    repayment: 'Monthly',
    processingFee: '0.50% + GST',
    otherCharges: 'Documentation and asset hypothecation fees as per bank policy.',
    farmerType: ['Individual Farmer', 'Farmer Producer Organization', 'Agricultural Business'],
    minLand: '1 acre',
    maxLand: null,
    cropTypes: ['Fodder', 'Dairy', 'Other'],
    states: ['Odisha', 'Jharkhand'],
    districts: ['Mayurbhanj', 'Keonjhar', 'Cuttack'],
    otherEligibility: 'Minimum 2 years experience in animal husbandry or dairy farming. Veterinary clearance required.',
    documents: ['Aadhaar', 'PAN', 'Land ownership document', 'Project report', 'Quotation'],
    benefits: [
      'Medium-term repayment up to 36 months',
      'Capital subsidy eligible under National Dairy Plan',
      'Moratorium period of up to 3 months for shed setup',
    ],
    termsText: 'Draft facility terms. Hypothecation of milch cattle and dairy assets required as collateral.',
    termsVersion: '1.0',
    termsUrl: 'https://sbi.co.in/dairy-development/terms',
    applicationUrl: 'https://sbi.co.in/apply/dairy-loan',
    status: 'draft',
    lastUpdated: '28 Aug 2026',
    expiryDate: null,
  },
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ facilityId: string }> }
) {
  let facilityId = '';
  try {
    const resolvedParams = await params;
    facilityId = resolvedParams.facilityId;

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url, 'http://localhost');
    const bankId = searchParams.get('bankId');

    // 0. Check known mock/demo facility IDs first
    if (facilityId in MOCK_FACILITY_DETAILS) {
      const mock = MOCK_FACILITY_DETAILS[facilityId];
      // If it's a public farmer request (no bankId) and the facility is NOT published, return 404
      if ((!bankId || bankId.trim() === '') && mock.status !== 'published') {
        return NextResponse.json({ error: 'Facility not found or currently unpublished.' }, { status: 404 });
      }
      return NextResponse.json(mock);
    }

    if (facilityId.startsWith('fac_demo_')) {
      return NextResponse.json({
        ...MOCK_FACILITY_DETAILS.fac_kisan_01,
        id: facilityId,
        facilityName: 'Custom Agricultural Credit Scheme',
        status: bankId ? 'draft' : 'published',
      });
    }

    let facilityRows: Record<string, any>[] = [];

    if (bankId) {
      // Bank portal management/edit view: allows fetching facility regardless of status,
      // as long as it belongs to the authenticated bankId.
      facilityRows = await query<Record<string, any>[]>(
        `SELECT f.id, f.bank_id, f.facility_name, f.facility_type, f.description,
                f.minimum_amount, f.maximum_amount, f.interest_rate, f.tenure,
                f.repayment_frequency, f.processing_fee, f.eligibility_description,
                f.status, f.application_url, f.terms_url, f.updated_at, f.expiry_date,
                b.bank_name, b.verification_status
         FROM financial_facilities f
         JOIN banks b ON f.bank_id = b.id
         WHERE f.id = ? AND f.bank_id = ? AND f.status != 'deleted'`,
        [facilityId, bankId],
        8000
      );
    } else {
      // Public farmer-facing discovery: strictly published facilities only.
      facilityRows = await query<Record<string, any>[]>(
        `SELECT f.id, f.bank_id, f.facility_name, f.facility_type, f.description,
                f.minimum_amount, f.maximum_amount, f.interest_rate, f.tenure,
                f.repayment_frequency, f.processing_fee, f.eligibility_description,
                f.status, f.application_url, f.terms_url, f.updated_at, f.expiry_date,
                b.bank_name, b.verification_status
         FROM financial_facilities f
         JOIN banks b ON f.bank_id = b.id
         WHERE f.id = ? AND f.status = 'published'`,
        [facilityId],
        8000
      );
    }

    if (facilityRows.length === 0) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    }

    const f = facilityRows[0];

    // Fetch child records in parallel
    const [eligibilityRows, docRows, benefitRows, termRows] = await Promise.all([
      query<Record<string, any>[]>(
        'SELECT * FROM facility_eligibility WHERE facility_id = ? LIMIT 1',
        [facilityId],
        8000
      ),
      query<Record<string, any>[]>(
        'SELECT document_name, is_required FROM facility_documents WHERE facility_id = ? ORDER BY id ASC',
        [facilityId],
        8000
      ),
      query<Record<string, any>[]>(
        'SELECT benefit FROM facility_benefits WHERE facility_id = ? ORDER BY id ASC',
        [facilityId],
        8000
      ),
      query<Record<string, any>[]>(
        'SELECT terms_text, version, effective_date FROM facility_terms WHERE facility_id = ? ORDER BY created_at DESC, version DESC LIMIT 1',
        [facilityId],
        8000
      ),
    ]);

    const elig = eligibilityRows[0] || null;
    const term = termRows[0] || null;

    // Format description split
    const fullDesc: string = f.description || '';
    let shortDescription = '';
    let detailedDescription = '';

    if (fullDesc.includes('\n\n')) {
      const parts = fullDesc.split('\n\n');
      shortDescription = parts[0].trim();
      detailedDescription = parts.slice(1).join('\n\n').trim();
    } else {
      shortDescription = fullDesc.trim();
      detailedDescription = fullDesc.trim();
    }

    let farmerTypeArr: string[] = [];
    if (elig?.farmer_type) {
      farmerTypeArr = elig.farmer_type
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }

    const cropTypes = elig ? parseJsonArray(elig.crop_types) : [];
    const states = elig ? parseJsonArray(elig.states) : [];
    const districts = elig ? parseJsonArray(elig.districts) : [];

    const documents = docRows.map(d => d.document_name);
    const benefits = benefitRows.map(b => b.benefit);

    const result = {
      id: f.id,
      bankId: f.bank_id,
      bankName: f.bank_name,
      bankVerified: f.verification_status === 'verified',
      facilityName: f.facility_name,
      facilityType: f.facility_type,
      shortDescription: shortDescription || null,
      detailedDescription: detailedDescription || null,
      minAmount: f.minimum_amount !== null ? Number(f.minimum_amount) : null,
      maxAmount: f.maximum_amount !== null ? Number(f.maximum_amount) : null,
      interestRate: f.interest_rate || null,
      tenure: f.tenure || null,
      repayment: f.repayment_frequency || null,
      processingFee: f.processing_fee || null,
      otherCharges: null,
      farmerType: farmerTypeArr,
      minLand: elig?.minimum_land || null,
      maxLand: elig?.maximum_land || null,
      cropTypes,
      states,
      districts,
      otherEligibility: elig?.other_conditions || f.eligibility_description || null,
      documents,
      benefits,
      termsText: term?.terms_text || null,
      termsVersion: term?.version || null,
      termsUrl: f.terms_url || null,
      applicationUrl: f.application_url || null,
      status: f.status,
      lastUpdated: formatDate(f.updated_at),
      expiryDate: f.expiry_date ? formatDate(f.expiry_date) : null,
    };

    return NextResponse.json(result);
  } catch (err: any) {
    console.warn('[api/facilities/[facilityId]] Falling back to mock facility details:', err?.message ?? err);
    if (facilityId in MOCK_FACILITY_DETAILS) {
      return NextResponse.json(MOCK_FACILITY_DETAILS[facilityId]);
    }
    return NextResponse.json({
      ...MOCK_FACILITY_DETAILS.fac_kisan_01,
      id: facilityId || 'fac_kisan_01',
    });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ facilityId: string }> }
) {
  try {
    const { facilityId } = await params;
    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID is required.' }, { status: 400 });
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
    const requestedStatus = str(body.status).toLowerCase();
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

    // 1. Validation
    if (!bankId) return NextResponse.json({ error: 'Missing bankId.' }, { status: 400 });
    if (!facilityName) return NextResponse.json({ error: 'Missing required field: facilityName.' }, { status: 400 });
    if (!facilityType) return NextResponse.json({ error: 'Missing required field: facilityType.' }, { status: 400 });
    if (!shortDesc) return NextResponse.json({ error: 'Missing required field: shortDesc.' }, { status: 400 });
    if (!applicationUrl) return NextResponse.json({ error: 'Missing required field: applicationUrl.' }, { status: 400 });

    for (const [label, url] of [['applicationUrl', applicationUrl], ['termsUrl', termsUrl]] as const) {
      if (url && !/^https?:\/\/.+/i.test(url)) {
        return NextResponse.json({ error: `${label} must be a valid URL starting with http:// or https://.` }, { status: 400 });
      }
    }

    if (Number.isNaN(minAmount) || Number.isNaN(maxAmount)) {
      return NextResponse.json(
        { error: 'Minimum/Maximum amount could not be parsed as a number.' },
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

    // 2. Fetch existing facility & verify ownership and status
    const existingRows = await query<Record<string, any>[]>(
      'SELECT id, bank_id, status FROM financial_facilities WHERE id = ?',
      [facilityId]
    );

    if (existingRows.length === 0) {
      return NextResponse.json({ error: `No facility found with id "${facilityId}".` }, { status: 404 });
    }

    const existing = existingRows[0];
    if (existing.bank_id !== bankId) {
      return NextResponse.json({ error: 'Unauthorized — this facility does not belong to your bank.' }, { status: 403 });
    }

    if (existing.status === 'suspended' || existing.status === 'expired' || existing.status === 'deleted') {
      return NextResponse.json(
        { error: `Facility is ${existing.status} and cannot be edited.` },
        { status: 409 }
      );
    }

    // Preserve existing status unless an explicit valid status is provided
    const nextStatus = requestedStatus && ['draft', 'submitted', 'published', 'unpublished'].includes(requestedStatus)
      ? requestedStatus
      : existing.status;

    const description = detailedDesc ? `${shortDesc}\n\n${detailedDesc}` : shortDesc;
    const hasEligibility =
      farmerTypeArr.length > 0 || !!minLand || cropTypesArr.length > 0 ||
      statesArr.length > 0 || districtsArr.length > 0 || !!otherEligibility;

    // 3. Transactional update across child tables
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Update core financial_facilities row
      await conn.query(
        `UPDATE financial_facilities
         SET facility_name = ?, facility_type = ?, description = ?,
             minimum_amount = ?, maximum_amount = ?, interest_rate = ?, tenure = ?,
             repayment_frequency = ?, processing_fee = ?, eligibility_description = ?,
             status = ?, application_url = ?, terms_url = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND bank_id = ?`,
        [facilityName, facilityType, description,
         minAmount, maxAmount, interestRate || null, tenure || null,
         repayment || null, processingFee || null, otherEligibility || null,
         nextStatus, applicationUrl, termsUrl || null,
         facilityId, bankId]
      );

      // Handle facility_eligibility
      if (hasEligibility) {
        await conn.query(
          `INSERT INTO facility_eligibility
             (id, facility_id, farmer_type, minimum_land, crop_types, states, districts, other_conditions)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             farmer_type = VALUES(farmer_type),
             minimum_land = VALUES(minimum_land),
             crop_types = VALUES(crop_types),
             states = VALUES(states),
             districts = VALUES(districts),
             other_conditions = VALUES(other_conditions)`,
          [genId('elig'), facilityId, farmerTypeJoined || null, minLand || null,
           JSON.stringify(cropTypesArr), JSON.stringify(statesArr), JSON.stringify(districtsArr),
           otherEligibility || null]
        );
      } else {
        await conn.query('DELETE FROM facility_eligibility WHERE facility_id = ?', [facilityId]);
      }

      // Replace facility_documents
      await conn.query('DELETE FROM facility_documents WHERE facility_id = ?', [facilityId]);
      for (const doc of documentsArr) {
        await conn.query(
          'INSERT INTO facility_documents (id, facility_id, document_name, is_required) VALUES (?, ?, ?, 1)',
          [genId('doc'), facilityId, doc]
        );
      }

      // Replace facility_benefits
      await conn.query('DELETE FROM facility_benefits WHERE facility_id = ?', [facilityId]);
      for (const benefit of benefitsArr) {
        await conn.query(
          'INSERT INTO facility_benefits (id, facility_id, benefit) VALUES (?, ?, ?)',
          [genId('ben'), facilityId, benefit]
        );
      }

      // Handle versioned facility_terms (Preserves historical versions)
      if (termsText) {
        const [prevTermRows]: any = await conn.query(
          'SELECT version, terms_text FROM facility_terms WHERE facility_id = ? ORDER BY created_at DESC, version DESC LIMIT 1',
          [facilityId]
        );
        const latestTerm = prevTermRows?.[0] || null;

        // If terms text has changed or no previous terms exist, insert a new version row
        if (!latestTerm || latestTerm.terms_text !== termsText) {
          const nextVer = calculateNextVersion(latestTerm?.version || null);
          await conn.query(
            `INSERT INTO facility_terms (id, facility_id, version, terms_text, effective_date)
             VALUES (?, ?, ?, ?, CURRENT_DATE)`,
            [genId('term'), facilityId, nextVer, termsText]
          );
        }
      }

      await conn.commit();
    } catch (txErr) {
      try {
        await conn.rollback();
      } catch {
        // connection may be closed
      }
      throw txErr;
    } finally {
      conn.release();
    }

    return NextResponse.json({
      message: 'Facility updated successfully.',
      facilityId,
      status: nextStatus,
    });
  } catch (err: any) {
    console.error('[api/facilities/[facilityId]] PUT failed:', err?.message ?? err);
    return NextResponse.json(
      { error: 'Facility update failed due to a server error. Changes were rolled back.' },
      { status: 500 }
    );
  }
}
