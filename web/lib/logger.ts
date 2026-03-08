import fs from 'fs/promises';
import path from 'path';
import { FireDetectionResult } from './pipeline';

const EVENTS_PATH = path.join(process.cwd(), 'logs', 'events.json');

export async function appendEvent(event: FireDetectionResult): Promise<void> {
  let events: FireDetectionResult[] = [];

  try {
    const raw = await fs.readFile(EVENTS_PATH, 'utf-8');
    events = JSON.parse(raw);
  } catch {
    // File doesn't exist or is invalid — start fresh
  }

  events.push(event);

  await fs.mkdir(path.dirname(EVENTS_PATH), { recursive: true });
  await fs.writeFile(EVENTS_PATH, JSON.stringify(events, null, 2));
}

export async function readRecentEvents(limit = 10): Promise<FireDetectionResult[]> {
  try {
    const raw = await fs.readFile(EVENTS_PATH, 'utf-8');
    const events: FireDetectionResult[] = JSON.parse(raw);
    return events.slice(-limit);
  } catch {
    return [];
  }
}
