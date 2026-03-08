import Anthropic from '@anthropic-ai/sdk';
import { appendEvent } from './logger';
import { notifyWebhook } from './notifier';

export interface FireDetectionResult {
  fire_detected: boolean;
  gases_detected?: string[];
  confidence: number;
  timestamp: string;
  risk_level?: string;
  indicators?: string[];
}

export interface PipelineState {
  logged: boolean;
  notified: boolean;
  drafted_message: string;
}

const SYSTEM_PROMPT =
  'You are an emergency response coordinator for wildfire prediction. Given atmospheric spectral analysis data identifying gases present in the air, draft a concise, urgent alert message for first responders. Include: detection time, identified gases, why they indicate fire risk (e.g. flammable/combustible), confidence level, and recommended action. Keep it under 120 words.';

export async function runPipeline(result: FireDetectionResult): Promise<string> {
  // Step 1 — Log
  await appendEvent(result);

  // Step 2 — Notify
  await notifyWebhook(result);

  // Step 3 — Draft message via Anthropic API
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userContent = JSON.stringify({
    detection_time: result.timestamp,
    confidence: result.confidence,
    risk_level: result.risk_level ?? 'unknown',
    gases_detected: result.gases_detected ?? [],
    spectral_observations: result.indicators ?? [],
  });

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  const block = message.content[0];
  return block.type === 'text' ? block.text : '';
}
