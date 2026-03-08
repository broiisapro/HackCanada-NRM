import { NextResponse } from 'next/server';
import { makeEmergencyCall } from '../../../lib/elevenlabs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { risk_level, confidence, gases_detected, indicators, drafted_message } = body;

    if (!risk_level || confidence === undefined || !Array.isArray(gases_detected)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: risk_level, confidence, gases_detected' },
        { status: 400 },
      );
    }

    const result = await makeEmergencyCall({
      risk_level,
      confidence,
      gases_detected,
      indicators: indicators ?? [],
      drafted_message: drafted_message ?? '',
    });

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
