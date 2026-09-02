/**
 * POST /api/automation/run  — Trigger the full Location -> Live Data -> AI -> SMS pipeline.
 * GET  /api/automation/run  — Same as { all: true }, used by Vercel Cron (cron sends GET with Authorization header).
 *
 * Protected by x-automation-key header or Bearer token (compared against AUTOMATION_SECRET / CRON_SECRET).
 *
 * POST body:
 *   { "farmerId": "<id>" }       — run for a single farmer
 *   { "all": true }              — run for all opted-in farmers
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { runFarmerPipeline, type PipelineResult } from '@/lib/automation/orchestrator';

// Shared auth guard
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.AUTOMATION_SECRET;
  const cronSecret = process.env.CRON_SECRET;

  // Allow in development if no secret is configured
  if (!secret && !cronSecret && process.env.NODE_ENV !== 'production') {
    return true;
  }

  const customKey = req.headers.get('x-automation-key') || '';
  const authHeader = req.headers.get('authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';

  if (secret && (customKey === secret || bearerToken === secret)) {
    return true;
  }

  if (cronSecret && bearerToken === cronSecret) {
    return true;
  }

  return false;
}

// POST /api/automation/run
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: 'Unauthorized — missing or invalid x-automation-key or Authorization Bearer token' },
      { status: 401 }
    );
  }

  let body: { farmerId?: string; all?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { farmerId, all } = body;

  // --- Single farmer ---
  if (farmerId) {
    try {
      const result = await runFarmerPipeline(farmerId);
      return NextResponse.json({ success: true, result }, { status: 200 });
    } catch (err: any) {
      console.error(`[automation/run] Single farmer error (${farmerId}):`, err.message);
      return NextResponse.json({ success: false, farmerId, error: err.message }, { status: 500 });
    }
  }

  // --- All opted-in farmers ---
  if (all) {
    return runAllFarmers();
  }

  return NextResponse.json(
    { error: 'Pass { "farmerId": "<id>" } or { "all": true }' },
    { status: 400 }
  );
}

// GET /api/automation/run — for Vercel Cron (GET only)
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runAllFarmers();
}

// Shared: iterate all opted-in farmers
async function runAllFarmers(): Promise<NextResponse> {
  const started = Date.now();

  const farmers = await query<{ id: string }[]>(
    `SELECT id FROM farmers WHERE COALESCE(sms_alerts_enabled, 1) = 1`
  ).catch(async () => {
    return query<{ id: string }[]>(`SELECT id FROM farmer_profiles`);
  });

  if (!farmers.length) {
    return NextResponse.json({ success: true, message: 'No opted-in farmers found', processed: 0 });
  }

  const results: PipelineResult[] = [];
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  console.log(`[automation/run] Starting pipeline for ${farmers.length} farmer(s)...`);

  for (const f of farmers) {
    try {
      const result = await runFarmerPipeline(f.id);
      results.push(result);
      if (result.skipped) skipped++;
      else if (result.error) failed++;
      else succeeded++;
    } catch (err: any) {
      console.error(`[automation/run] Failed for farmer ${f.id}:`, err.message);
      results.push({ farmerId: f.id, error: err.message });
      failed++;
    }
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `[automation/run] Completed in ${elapsed}s — total: ${farmers.length}, success: ${succeeded}, skipped: ${skipped}, failed: ${failed}`
  );

  return NextResponse.json({
    success: true,
    summary: { total: farmers.length, succeeded, skipped, failed, elapsedSeconds: elapsed },
    results,
  });
}
