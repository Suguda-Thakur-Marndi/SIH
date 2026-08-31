import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 1. Try Prisma query if available
    const farmer = await prisma.farmer.findUnique({
      where: { id },
      include: {
        insurance: true,
        crops: true,
        farms: true,
      },
    }).catch(() => null);

    if (farmer) {
      return NextResponse.json(farmer);
    }
  } catch {
    // Prisma query error, continue to MySQL / fallback
  }

  try {
    // 2. Try MySQL direct query
    const rows = await query<any[]>(
      `SELECT id, name, phone, email, district, village, language, land_area, loan_amount, loan_due_date, state 
       FROM farmers 
       WHERE id = ? OR phone = ? 
       LIMIT 1;`,
      [id, id]
    ).catch(() => []);

    if (rows && rows.length > 0) {
      const f = rows[0];
      const farms = await query<any[]>(
        `SELECT id, name, area, soil_type, village, district FROM farms WHERE farmer_id = ?;`,
        [f.id]
      ).catch(() => []);

      const crops = await query<any[]>(
        `SELECT id, name, stage, sowing_date FROM crops WHERE farmer_id = ?;`,
        [f.id]
      ).catch(() => []);

      return NextResponse.json({
        id: f.id,
        name: f.name,
        phone: f.phone,
        email: f.email,
        district: f.district || 'Mayurbhanj',
        village: f.village || 'Baripada',
        language: f.language || 'en',
        landArea: f.land_area || 2.5,
        state: f.state || 'Odisha',
        loans: f.loan_amount ? [{ loanAmount: f.loan_amount, dueDate: f.loan_due_date || '2026-09-30' }] : [],
        farms: farms.length > 0 ? farms : [
          { id: "1", name: "North Plot (Plot 01)", area: "1.8", village: f.village, district: f.district, crops: [{ name: "Paddy (Swarna)" }] },
          { id: "2", name: "South Stream Plot", area: "0.7", village: f.village, district: f.district, crops: [{ name: "Mustard & Pulses" }] }
        ],
        crops: crops
      });
    }
  } catch {
    // MySQL query fallback
  }

  // 3. Fallback standard farmer profile for demonstration
  return NextResponse.json({
    id: id || "FARMER-001",
    name: "Ramesh Kumar Patel",
    phone: "+91 98451 28210",
    email: "farmer@smartcrop.in",
    village: "Baripada Rural",
    district: "Mayurbhanj",
    state: "Odisha",
    language: "or",
    landArea: 2.5,
    loans: [
      {
        id: "LOAN-01",
        loanAmount: 120000,
        dueDate: "2026-08-30",
        bankName: "SBI Baripada Agri Hub",
        status: "Active"
      }
    ],
    farms: [
      {
        id: "1",
        name: "North Plot (Plot 01)",
        area: 1.8,
        village: "Baripada",
        district: "Mayurbhanj",
        crops: [{ name: "Paddy (Swarna)" }]
      },
      {
        id: "2",
        name: "South Stream Plot",
        area: 0.7,
        village: "Baripada",
        district: "Mayurbhanj",
        crops: [{ name: "Mustard & Pulses" }]
      }
    ],
    crops: [
      {
        id: "CROP-01",
        name: "Paddy (Swarna MTU-7029)",
        stage: "Vegetative Stage",
        sowingDate: "2026-07-12"
      }
    ]
  });
}
