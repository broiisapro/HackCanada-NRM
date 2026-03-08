const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1/convai';
const AGENT_NAME = 'Pyros Emergency Dispatcher';
const DEMO_TARGET_NUMBER = '+14372562427';
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel — clear, professional

let cachedAgentId: string | null = null;
let cachedPhoneNumberId: string | null = null;

function headers(): Record<string, string> {
  return {
    'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
    'Content-Type': 'application/json',
  };
}

const AGENT_PROMPT = `You are an emergency wildfire dispatch operator from the Pyros wildfire detection system. You are placing an urgent phone call to report a detected wildfire threat to emergency services / fire department.

Here is the detection data from when the call started:

Risk Level: {{risk_level}}
Confidence: {{confidence}}%
Gases Detected: {{gases}}
Spectral Indicators: {{indicators}}

Alert Summary:
{{drafted_message}}

Your instructions:
1. Introduce yourself as the Pyros automated wildfire detection system
2. Clearly state this is an emergency wildfire threat notification
3. Report the risk level and confidence percentage
4. List the dangerous gases detected and explain why they indicate fire risk
5. Read the alert summary
6. Ask the recipient to confirm they have received the information
7. If they have questions about the detection, answer based on the data provided
8. Be urgent but professional — lives may depend on rapid response
9. Keep the conversation focused and concise

IMPORTANT — Live Data Tool:
You have access to a tool called "get_current_status" that fetches real-time data from the Pyros detection system. Use it when:
- The caller asks about the CURRENT status or whether conditions have changed
- The caller asks if the risk level has gone up or down
- You need to confirm whether the threat is still active before ending the call
Do NOT call it unprompted at the start — you already have the initial data above. Only use it when the caller requests an update or you need to verify the latest conditions.`;

const FIRST_MESSAGE = `Hello, this is an automated emergency call from the Pyros wildfire detection system. We have detected a {{risk_level}} risk wildfire threat with {{confidence}} percent confidence. I need to relay critical detection information to your department immediately. Are you ready to receive the report?`;

async function findExistingAgent(): Promise<string | null> {
  try {
    const res = await fetch(`${ELEVENLABS_BASE}/agents`, { headers: headers() });
    if (!res.ok) return null;
    const data = await res.json();
    const agents = data.agents ?? [];
    const existing = agents.find((a: { name?: string }) => a.name === AGENT_NAME);
    return existing?.agent_id ?? null;
  } catch {
    return null;
  }
}

async function ensureAgent(): Promise<string> {
  if (cachedAgentId) return cachedAgentId;

  // Check if agent already exists (handles serverless cold starts)
  const existingId = await findExistingAgent();
  if (existingId) {
    cachedAgentId = existingId;
    return existingId;
  }

  const toolWebhookUrl = process.env.APP_URL
    ? `${process.env.APP_URL}/api/elevenlabs-tool`
    : 'http://localhost:3000/api/elevenlabs-tool';

  const res = await fetch(`${ELEVENLABS_BASE}/agents/create`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      name: AGENT_NAME,
      conversation_config: {
        agent: {
          prompt: { prompt: AGENT_PROMPT },
          first_message: FIRST_MESSAGE,
          language: 'en',
          tools: [
            {
              type: 'webhook',
              name: 'get_current_status',
              description:
                'Fetches the latest real-time wildfire detection status from the Pyros system, including current risk level, confidence percentage, detected gases, and spectral indicators. Use this when the caller asks about the current status or whether conditions have changed since the call started.',
              api_schema: {
                url: toolWebhookUrl,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
              },
            },
          ],
        },
        tts: {
          voice_id: VOICE_ID,
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create ElevenLabs agent: ${res.status} ${err}`);
  }

  const data = await res.json();
  cachedAgentId = data.agent_id;
  return data.agent_id;
}

async function findExistingPhoneNumber(): Promise<string | null> {
  try {
    const res = await fetch(`${ELEVENLABS_BASE}/phone-numbers`, { headers: headers() });
    if (!res.ok) return null;
    const data = await res.json();
    const numbers = data.phone_numbers ?? data ?? [];
    const phoneNum = process.env.TWILIO_PHONE_NUMBER ?? '';
    if (Array.isArray(numbers)) {
      const existing = numbers.find((n: { phone_number?: string }) => n.phone_number === phoneNum);
      return existing?.phone_number_id ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

async function ensurePhoneNumber(): Promise<string> {
  if (cachedPhoneNumberId) return cachedPhoneNumberId;

  // Check if already imported
  const existingId = await findExistingPhoneNumber();
  if (existingId) {
    cachedPhoneNumberId = existingId;
    return existingId;
  }

  const res = await fetch(`${ELEVENLABS_BASE}/phone-numbers`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      phone_number: process.env.TWILIO_PHONE_NUMBER ?? '',
      provider: 'twilio',
      label: 'Pyros Emergency Line',
      twilio_account_sid: process.env.TWILIO_ACCOUNT_SID ?? '',
      twilio_auth_token: process.env.TWILIO_AUTH_TOKEN ?? '',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    // If import fails (likely already imported), try listing
    const fallbackId = await findExistingPhoneNumber();
    if (fallbackId) {
      cachedPhoneNumberId = fallbackId;
      return fallbackId;
    }
    throw new Error(`Failed to import phone number: ${res.status} ${err}`);
  }

  const data = await res.json();
  cachedPhoneNumberId = data.phone_number_id;
  return data.phone_number_id;
}

export interface EmergencyCallParams {
  risk_level: string;
  confidence: number;
  gases_detected: string[];
  indicators: string[];
  drafted_message: string;
}

export interface EmergencyCallResult {
  success: boolean;
  conversation_id?: string;
  error?: string;
}

// Normalized conversation result for polling (transcript available when status is done)
export type ConversationStatus = 'initiated' | 'in-progress' | 'processing' | 'done' | 'failed';

export interface TranscriptLine {
  role: 'agent' | 'user' | string;
  message: string;
}

export interface ConversationDetails {
  status: ConversationStatus;
  transcript?: TranscriptLine[];
  duration_seconds?: number;
  error?: string;
}

function normalizeTranscript(raw: unknown): TranscriptLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (item == null || typeof item !== 'object') return null;
      const obj = item as Record<string, unknown>;
      const role = (obj.role ?? obj.source ?? 'unknown') as string;
      const message = typeof obj.message === 'string' ? obj.message : typeof obj.text === 'string' ? obj.text : String(obj.content ?? '');
      return { role, message };
    })
    .filter((line): line is TranscriptLine => line !== null && line.message.length > 0);
}

function parseDurationSeconds(metadata: unknown): number | undefined {
  if (metadata == null || typeof metadata !== 'object') return undefined;
  const m = metadata as Record<string, unknown>;
  if (typeof m.duration_seconds === 'number') return m.duration_seconds;
  if (typeof m.duration === 'number') return m.duration;
  return undefined;
}

export async function getConversation(conversationId: string): Promise<ConversationDetails> {
  try {
    const res = await fetch(`${ELEVENLABS_BASE}/conversations/${encodeURIComponent(conversationId)}`, {
      headers: headers(),
    });
    if (!res.ok) {
      const err = await res.text();
      return { status: 'failed', error: `Conversation fetch failed: ${res.status} ${err}` };
    }
    const data = (await res.json()) as Record<string, unknown>;
    const status = (data.status as ConversationStatus) ?? 'failed';
    const transcript = normalizeTranscript(data.transcript);
    const duration_seconds = parseDurationSeconds(data.metadata);
    return { status, transcript: transcript.length > 0 ? transcript : undefined, duration_seconds };
  } catch (e) {
    return { status: 'failed', error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function makeEmergencyCall(params: EmergencyCallParams): Promise<EmergencyCallResult> {
  try {
    const [agentId, phoneNumberId] = await Promise.all([
      ensureAgent(),
      ensurePhoneNumber(),
    ]);

    const res = await fetch(`${ELEVENLABS_BASE}/twilio/outbound-call`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        agent_id: agentId,
        agent_phone_number_id: phoneNumberId,
        to_number: DEMO_TARGET_NUMBER,
        conversation_initiation_client_data: {
          dynamic_variables: {
            risk_level: params.risk_level.toUpperCase(),
            confidence: String(Math.round(params.confidence * 100)),
            gases: params.gases_detected.join(', ') || 'None identified',
            indicators: params.indicators.join('; ') || 'No spectral indicators',
            drafted_message: params.drafted_message || 'No alert summary available.',
          },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Outbound call failed: ${res.status} ${err}` };
    }

    const data = await res.json();
    return { success: true, conversation_id: data.conversation_id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
