import { NextResponse } from 'next/server';
import { checkAndProcess } from '../../../lib/monitor';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await checkAndProcess();
  return NextResponse.json(status);
}
