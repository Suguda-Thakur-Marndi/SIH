import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_SCHEMES = [
  {
    schemeId: "SCH-PMFBY-01",
    schemeName: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    coverage: 150000,
    premium: 750,
    bank: {
      id: "bank-gov",
      bankName: "Ministry of Agriculture & Farmers Welfare"
    },
    status: "available"
  },
  {
    schemeId: "SCH-WBCIS-02",
    schemeName: "Restructured Weather Based Crop Insurance Scheme (RWBCIS)",
    coverage: 100000,
    premium: 500,
    bank: {
      id: "bank-gov",
      bankName: "Government Scheme"
    },
    status: "available"
  },
  {
    schemeId: "SCH-KCC-03",
    schemeName: "Kisan Credit Card (KCC) Subvention Match",
    coverage: 300000,
    premium: 1200,
    bank: {
      id: "bank-sbi",
      bankName: "State Bank of India"
    },
    status: "available"
  }
];

export async function GET() {
  try {
    const schemes = await prisma.scheme.findMany().catch(() => []);
    
    if (schemes && schemes.length > 0) {
      const mappedSchemes = schemes.map((s: any) => ({
        schemeId: s.id,
        schemeName: s.name,
        coverage: 100000, 
        premium: 500,
        bank: {
          id: 'bank-gov',
          bankName: 'Government Scheme'
        },
        status: 'available'
      }));

      return NextResponse.json(mappedSchemes);
    }
  } catch (error) {
    console.warn('Prisma schemes fallback:', error);
  }

  return NextResponse.json(DEFAULT_SCHEMES);
}
