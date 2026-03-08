import fs from 'fs/promises';
import path from 'path';

const CALLS_PATH = path.join(process.cwd(), 'logs', 'calls.json');

export interface TranscriptLine {
  role: string;
  message: string;
}

export interface CallLogEntry {
  conversation_id: string;
  started_at: string;
  completed_at?: string;
  status: 'done' | 'failed';
  duration_seconds?: number;
  transcript?: TranscriptLine[];
  error?: string;
}

export async function appendCallLog(entry: CallLogEntry): Promise<void> {
  let logs: CallLogEntry[] = [];
  try {
    const raw = await fs.readFile(CALLS_PATH, 'utf-8');
    logs = JSON.parse(raw);
  } catch {
    // File doesn't exist or is invalid — start fresh
  }
  if (!Array.isArray(logs)) logs = [];
  logs.push(entry);
  await fs.mkdir(path.dirname(CALLS_PATH), { recursive: true });
  await fs.writeFile(CALLS_PATH, JSON.stringify(logs, null, 2));
}

export async function readRecentCallLogs(limit = 20): Promise<CallLogEntry[]> {
  try {
    const raw = await fs.readFile(CALLS_PATH, 'utf-8');
    const logs: CallLogEntry[] = JSON.parse(raw);
    if (!Array.isArray(logs)) return [];
    return logs.slice(-limit);
  } catch {
    return [];
  }
}
