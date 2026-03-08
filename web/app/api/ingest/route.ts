import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RESULT_PATH = path.join(process.cwd(), 'output', 'result.json');
const HISTORY_PATH = path.join(process.cwd(), 'output', 'history.json');

interface IngestPayload {
  fire_detected: boolean | null;
  gases_detected?: string[];
  confidence?: number;
  risk_level?: string;
  indicators?: string[];
  flammable_gases?: string[];
  combustion_indicators?: string[];
  timestamp: string;
  image_path?: string;
  error?: string;
}

export async function POST(req: NextRequest) {
  let payload: IngestPayload;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (payload.timestamp === undefined) {
    return NextResponse.json({ error: 'Missing required field: timestamp' }, { status: 400 });
  }

  try {
    await fs.mkdir(path.dirname(RESULT_PATH), { recursive: true });

    // Write latest result
    await fs.writeFile(RESULT_PATH, JSON.stringify(payload, null, 2));

    // Append to history
    let history: IngestPayload[] = [];
    try {
      const raw = await fs.readFile(HISTORY_PATH, 'utf-8');
      history = JSON.parse(raw);
    } catch {
      // File doesn't exist yet
    }
    history.push(payload);
    // Keep last 500 entries
    if (history.length > 500) {
      history = history.slice(-500);
    }
    await fs.writeFile(HISTORY_PATH, JSON.stringify(history, null, 2));
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to write result: ${err instanceof Error ? err.message : err}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, timestamp: payload.timestamp });
}
