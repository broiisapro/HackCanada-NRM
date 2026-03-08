import fs from 'fs/promises';
import path from 'path';
import { FireDetectionResult, runPipeline } from './pipeline';
import { readRecentEvents } from './logger';

const RESULT_PATH = path.join(process.cwd(), 'output', 'result.json');

export interface MonitorStatus {
  status: 'safe' | 'danger' | 'no_data' | 'error';
  fire_detected?: boolean;
  gases_detected?: string[];
  confidence?: number;
  risk_level?: string;
  indicators?: string[];
  drafted_message?: string;
  last_checked: string;
  recent_events?: FireDetectionResult[];
  error?: string;
}

let lastProcessedTimestamp: string | null = null;
let lastDraftedMessage: string | null = null;

export async function checkAndProcess(): Promise<MonitorStatus> {
  const last_checked = new Date().toISOString();

  let raw: string;
  try {
    raw = await fs.readFile(RESULT_PATH, 'utf-8');
  } catch {
    return { status: 'no_data', last_checked };
  }

  let result: FireDetectionResult;
  try {
    result = JSON.parse(raw);
  } catch {
    return { status: 'error', last_checked, error: 'Invalid result.json format' };
  }

  const confidenceThreshold = parseFloat(process.env.CONFIDENCE_THRESHOLD ?? '0.80');
  const recent_events = await readRecentEvents(10);

  const shouldProcess =
    result.fire_detected &&
    result.confidence >= confidenceThreshold &&
    result.timestamp !== lastProcessedTimestamp;

  if (shouldProcess) {
    try {
      lastDraftedMessage = await runPipeline(result);
      lastProcessedTimestamp = result.timestamp;
    } catch (err) {
      return {
        status: 'error',
        last_checked,
        error: err instanceof Error ? err.message : 'Pipeline failed',
        recent_events,
      };
    }
  }

  const isDanger = result.fire_detected && result.confidence >= confidenceThreshold;

  return {
    status: isDanger ? 'danger' : 'safe',
    fire_detected: result.fire_detected,
    gases_detected: result.gases_detected,
    confidence: result.confidence,
    risk_level: result.risk_level,
    indicators: result.indicators,
    drafted_message: isDanger ? (lastDraftedMessage ?? undefined) : undefined,
    last_checked,
    recent_events,
  };
}
