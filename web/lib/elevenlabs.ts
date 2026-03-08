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

Here is the current detection data:

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
9. Keep the conversation focused and concise`;

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
