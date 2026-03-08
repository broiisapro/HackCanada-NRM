import { NextResponse } from 'next/server';
import { appendCallLog, readRecentCallLogs, type CallLogEntry } from '../../../lib/call-logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = await readRecentCallLogs(20);
    return NextResponse.json(logs);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 },
    );
  }
}

function isValidEntry(body: unknown): body is CallLogEntry {
  if (body == null || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.conversation_id === 'string' &&
    b.conversation_id.trim() !== '' &&
    typeof b.started_at === 'string' &&
    (b.status === 'done' || b.status === 'failed')
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!isValidEntry(body)) {
      return NextResponse.json(
        { error: 'Missing or invalid fields: conversation_id, started_at, status (done|failed) required' },
        { status: 400 },
      );
    }
    const entry: CallLogEntry = {
      conversation_id: body.conversation_id.trim(),
      started_at: body.started_at,
      completed_at: typeof body.completed_at === 'string' ? body.completed_at : undefined,
      status: body.status,
      duration_seconds: typeof body.duration_seconds === 'number' ? body.duration_seconds : undefined,
      transcript: Array.isArray(body.transcript) ? body.transcript : undefined,
      error: typeof body.error === 'string' ? body.error : undefined,
    };
    await appendCallLog(entry);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
