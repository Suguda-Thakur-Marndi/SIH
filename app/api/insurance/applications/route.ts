import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { farmerId, schemeId } = body;
    
    if (!farmerId || !schemeId) {
      return NextResponse.json({ error: 'Missing farmerId or schemeId' }, { status: 400 });
    }

    // Create a new application in the existing scheme_applications table
    const newApp = await prisma.schemeApplication.create({
      data: {
        id: `APP-${Date.now()}`.substring(0, 30),
        farmerId,
        schemeId,
        eligibility_percent: 100, // Mocked 100% eligibility for demo
        matched_reasons: JSON.stringify(['Met all bank scheme criteria']),
        status: 'submitted',
        submitted_at: new Date()
      }
    });

    return NextResponse.json({ success: true, application: newApp });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
