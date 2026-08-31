import { NextRequest, NextResponse } from 'next/server';
import { sendSms } from '@/SMS/SMS/lib/notifications/sms';
import { buildMessage } from '@/SMS/SMS/lib/notifications/templates';
import { getRiskPriority } from '@/SMS/SMS/lib/notifications/rules';

export async function GET(_req: NextRequest) {
  try {
    const testPhone = '8004252399';
    const distressScore = 95; // High enough for CRITICAL priority
    const priority = getRiskPriority(distressScore); // Expected: CRITICAL

    const reasons = [
      'Severe prolonged dry spell',
      'High rainfall deviation detected',
      'Critical crop stage vulnerability'
    ];

    // 1. Build the SMS content using the template system
    const messageContent = buildMessage(
      priority,
      'DISTRESS',
      distressScore,
      reasons,
      'en' // English language
    );

    // 2. Mock sending the SMS directly without the DB to bypass RDS timeouts
    // (This calls the same core SMS adapter that production uses)
    const result = await sendSms(testPhone, messageContent, 'MOCK_DIRECT_001');

    return NextResponse.json({
      success: true,
      message: 'Mock SMS scenario triggered successfully',
      details: {
        farmer_number: testPhone,
        distress_score: distressScore,
        priority_evaluated: priority,
        reasons: reasons,
        generated_sms: messageContent
      },
      sms_provider_result: result
    });
  } catch (error: any) {
    console.error('Test SMS Direct error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
