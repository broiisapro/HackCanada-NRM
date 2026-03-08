import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const HISTORY_PATH = path.join(process.cwd(), 'output', 'history.json');

export async function GET() {
  try {
    const raw = await fs.readFile(HISTORY_PATH, 'utf-8');
    const history = JSON.parse(raw);
    return NextResponse.json(history);
  } catch {
    return NextResponse.json([]);
  }
}
