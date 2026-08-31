import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { processSmsAlert } from '@/SMS/SMS/lib/notifications/service';

/**
 * POST /api/notifications/emit — Create a new notification (event-driven fan-in per PRD §1).
 * Used by other Smart Crop modules (Risk Engine, Weather, Mandi, etc.) to emit notification events.
 */
export async function POST(req: NextRequest) {
  let connection;

  try {
    connection = await pool.getConnection();
    const body = await req.json();

    const {
      farmerId,
      category,
      priority = 'info',
      title,
      message,
      bodyData,
      voiceText,
      language = 'en',
      actionLabel,
      actionUrl,
      actionStatus = 'not_required',
      sourceFeature,
      sourceEntityId,
      correlationId,
      channel = 'IN_APP',
      score,
      reasons = [],
    } = body;

    // Validate required fields
    if (!farmerId || !title || !message || !category) {
      return NextResponse.json(
        { success: false, error: 'farmerId, category, title, and message are required' },
        { status: 400 }
      );
    }

    // Validate priority
    if (!['critical', 'high', 'warning', 'medium', 'info', 'low'].includes(priority.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Priority must be critical, high, warning, medium, info, or low' },
        { status: 400 }
      );
    }

    // Map category to type field (backward compat)
    const categoryToType: Record<string, string> = {
      'Risk': 'risk',
      'Weather': 'weather',
      'Crop Activities': 'crop_activity',
      'Market': 'market',
      'Government': 'government',
      'Insurance': 'insurance',
      'Officer Updates': 'officer_update',
    };
    const type = categoryToType[category] || category.toLowerCase().replace(/\s+/g, '_');

    if (channel === 'SMS') {
      const smsResult = await processSmsAlert({
        farmerId,
        type: type.toUpperCase(),
        priority: priority.toUpperCase() as any,
        score,
        reasons,
        language,
        channel: 'SMS',
      });
      return NextResponse.json({
        success: true,
        message: smsResult ? 'SMS Notification processed' : 'SMS Notification skipped (cooldown or error)',
        data: smsResult
      }, { status: smsResult ? 201 : 200 });
    }

    // Generate notification ID for IN_APP
    const ts = Date.now();
    const rand = Math.floor(100 + Math.random() * 900);
    const id = `NTF_${ts}_${rand}`;

    await connection.query(
      `INSERT INTO notifications 
       (id, user_id, farmer_id, type, category, priority, title, message, body,
        voice_text, language, action_label, action_url, action_status,
        source_feature, source_entity_id, correlation_id, is_read, created_at, channel)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), ?)`,
      [
        id, farmerId, farmerId, type, category, priority, title, message,
        bodyData ? JSON.stringify(bodyData) : null,
        voiceText || `${title}. ${message}`,
        language, actionLabel, actionUrl, actionStatus,
        sourceFeature, sourceEntityId, correlationId, channel
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Notification created',
      data: { id, farmerId, category, priority }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Notification emit error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
