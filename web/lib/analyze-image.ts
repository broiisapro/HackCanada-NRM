import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

const GEMINI_MODEL = 'gemini-2.5-flash';

// Exemplar order: image 1=Continuous, 2=Hydrogen, 3=Sodium, 4=Calcium, 5=Mercury. Image 6 = unknown.
const EXEMPLARS: { file: string; label: string }[] = [
  { file: 'continousspectrum.png', label: 'Reference image 1: Continuous spectrum. No gas.' },
  { file: 'hydrogen.png', label: 'Reference image 2: Hydrogen. Combustible.' },
  { file: 'sodium.png', label: 'Reference image 3: Sodium. Not combustible.' },
  { file: 'calcium.png', label: 'Reference image 4: Calcium. Not combustible.' },
  { file: 'mercury.png', label: 'Reference image 5: Mercury. Not combustible.' },
];

// Only these gases are reported (combustible or combustion-byproduct). All other identifications are discarded.
const COMBUSTIBLE_ONLY = new Set([
  'hydrogen', 'h', 'h2', 'methane', 'ch4', 'oxygen', 'o', 'o2', 'carbon monoxide', 'co',
  'propane', 'acetylene', 'ethane', 'ethylene', 'butane', 'ammonia', 'nh3',
  'carbon', 'c', 'nitrogen', 'n',
]);

const CLASSIFY_PROMPT = `You are a spectroscopy expert. You will see 6 images. Images 1-5 are REFERENCE spectra: (1) Continuous, (2) Hydrogen, (3) Sodium, (4) Calcium, (5) Mercury. Image 6 is the UNKNOWN to classify.

To identify a gas you must use ALL THREE variables — many elements share some lines, so the combination is what matters:

1. WHICH LINES: the color/type of each emission line (e.g. violet, blue, cyan, green, yellow, red).
2. HOW MANY: the number of distinct lines (count them).
3. WHERE: the position of each line along the spectrum (left to right = short to long wavelength). Note exact positions.

Reference fingerprints (which + how many + where):
- Ref 1 Continuous: no discrete lines; smooth rainbow; zero lines.
- Ref 2 Hydrogen: WHICH = violet, blue, cyan, red. HOW MANY = 4 discrete lines. WHERE = ~410 nm (violet), ~434 nm (blue), ~486 nm (cyan), ~656 nm (red) — Balmer pattern, well spaced.
- Ref 3 Sodium: WHICH = yellow only. HOW MANY = 1 doublet (two very close lines). WHERE = ~589 nm only; no violet/blue/cyan/red, no green.
- Ref 4 Calcium: WHICH = violet, blue, green. HOW MANY = several (multiple in violet/blue). WHERE = ~393–397 nm (violet), ~423 nm (blue), ~527 nm (green); not a single yellow spot.
- Ref 5 Mercury: WHICH = violet, blue, green, yellow. HOW MANY = several distinct. WHERE = ~405 nm, ~436 nm, strong ~546 nm (green), ~578 nm (yellow); distinct pattern, not like Sodium or Hydrogen.

For image 6: (a) Count how many distinct lines. (b) List which colors they are. (c) Note where they sit along the spectrum. (d) Compare this (which, how many, where) to the reference that matches best.

CRITICAL: Only report COMBUSTIBLE gases. From the references, only Hydrogen is combustible. So: if image 6 matches Ref 2 (same which/how many/where as Hydrogen) → return ["Hydrogen"]. If it matches Ref 1, 3, 4, or 5 → return elements: []. Do not return Sodium, Calcium, Mercury, or continuous.

Return at most 3 elements. Return a JSON object ONLY. No markdown, no code fences.
Fields: elements (array, 0-3 items; only combustible: Hydrogen, Methane, Oxygen, Carbon monoxide; empty if no match), line_observations (array: describe which lines, how many, where), confidence (float 0-1).`;

const RETRY_PROMPT = `Return only a raw JSON object. No markdown. Fields: elements (array, max 3 items, only combustible gases or empty), line_observations (array), confidence (float 0-1).`;

const FLAMMABLE = new Set([
  'hydrogen', 'h', 'h2', 'methane', 'ch4', 'carbon monoxide', 'co',
  'propane', 'c3h8', 'ethane', 'c2h6', 'ethylene', 'c2h4', 'acetylene', 'c2h2',
  'butane', 'c4h10', 'ammonia', 'nh3', 'carbon', 'c', 'phosphorus', 'p',
  'sodium', 'na', 'potassium', 'k', 'lithium', 'li', 'magnesium', 'mg',
]);

const COMBUSTION_INDICATORS = new Set([
  'carbon', 'c', 'nitrogen', 'n', 'carbon monoxide', 'co',
]);

interface GeminiElementsResponse {
  elements?: string[];
  line_observations?: string[];
  confidence?: number;
}

function parseJson(raw: string): GeminiElementsResponse {
  let text = raw.trim();
  if (text.startsWith('```')) {
    const lines = text.split('\n');
    text = lines.slice(1, lines[lines.length - 1].trim() === '```' ? -1 : undefined).join('\n');
  }
  return JSON.parse(text) as GeminiElementsResponse;
}

function assessFireRisk(elements: string[]): {
  fire_detected: boolean;
  risk_level: string;
  flammable_gases: string[];
  combustion_indicators: string[];
  risk_reasons: string[];
} {
  const lower = elements.map((e) => e.toLowerCase().trim());
  const flammableFound = elements.filter((e) => FLAMMABLE.has(e.toLowerCase().trim()));
  const combustionFound = elements.filter((e) => COMBUSTION_INDICATORS.has(e.toLowerCase().trim()));

  const hasFlammable = flammableFound.length > 0;
  const hasCombustion = combustionFound.length > 0;

  let risk_level: string;
  if (hasFlammable && hasCombustion) risk_level = 'critical';
  else if (hasFlammable) risk_level = 'high';
  else if (hasCombustion) risk_level = 'medium';
  else risk_level = 'low';

  const fire_detected = risk_level === 'high' || risk_level === 'critical';

  const risk_reasons: string[] = [];
  if (flammableFound.length) risk_reasons.push(`Flammable: ${flammableFound.join(', ')}`);
  if (combustionFound.length) risk_reasons.push(`Combustion indicators: ${combustionFound.join(', ')}`);
  if (risk_reasons.length === 0) risk_reasons.push('No flammable gases or combustion byproducts detected');

  return {
    fire_detected,
    risk_level,
    flammable_gases: flammableFound,
    combustion_indicators: combustionFound,
    risk_reasons,
  };
}

export interface ReadingLocationResult {
  x: number;
  y: number;
  label: string;
  lat: number;
  lon: number;
}

/** Minimal weather context for risk adjustment (avoids circular dep with weather.ts). */
export interface WeatherContextForRisk {
  temp_c: number;
  humidity_percent: number;
  wind_speed_kmh: number;
  wind_direction: string;
  dryness_index: number;
}

export interface AnalyzeImageResult {
  fire_detected: boolean;
  gases_detected: string[];
  confidence: number;
  risk_level: string;
  indicators: string[];
  flammable_gases: string[];
  combustion_indicators: string[];
  timestamp: string;
  error?: string;
  weather?: WeatherContextForRisk & { description?: string; fetched_at: string; location_label?: string };
  reading_location?: ReadingLocationResult;
}

/**
 * Elevate risk when weather favors fire spread: high wind + low humidity + flammable gases.
 * e.g. Hydrogen + 40 km/h winds + 12% humidity => critical.
 */
export function applyWeatherRisk(
  result: AnalyzeImageResult,
  weather: WeatherContextForRisk
): { risk_level: string; fire_detected: boolean; indicators: string[] } {
  const baseLevel = result.risk_level;
  const indicators = [...(result.indicators ?? [])];
  const hasFlammable = (result.flammable_gases?.length ?? 0) > 0;
  const highWind = weather.wind_speed_kmh >= 30;
  const lowHumidity = weather.humidity_percent < 25;
  const dry = weather.dryness_index >= 0.5;

  if (!hasFlammable) {
    return { risk_level: baseLevel, fire_detected: result.fire_detected ?? false, indicators };
  }

  let risk_level = baseLevel;
  if (baseLevel === 'high' && (highWind || lowHumidity) && dry) {
    risk_level = 'critical';
    indicators.push(
      `Weather elevates risk: ${weather.wind_speed_kmh} km/h ${weather.wind_direction} wind, ${weather.humidity_percent}% humidity, dry conditions.`
    );
  } else if (baseLevel === 'medium' && highWind && lowHumidity) {
    risk_level = 'high';
    indicators.push(
      `Wind and low humidity: ${weather.wind_speed_kmh} km/h ${weather.wind_direction}, ${weather.humidity_percent}% humidity.`
    );
  } else if (highWind || lowHumidity) {
    indicators.push(
      `Weather context: ${weather.wind_speed_kmh} km/h ${weather.wind_direction}, ${weather.humidity_percent}% humidity.`
    );
  }

  const fire_detected = risk_level === 'high' || risk_level === 'critical';
  return { risk_level, fire_detected, indicators };
}

const exemplarsDir = () => path.join(process.cwd(), 'public', 'exemplars');

async function loadExemplarParts(): Promise<Array<{ inlineData: { mimeType: string; data: string } } | string>> {
  const dir = exemplarsDir();
  const parts: Array<{ inlineData: { mimeType: string; data: string } } | string> = [];
  for (const { file, label } of EXEMPLARS) {
    try {
      const buf = await fs.readFile(path.join(dir, file));
      parts.push({
        inlineData: { mimeType: 'image/png', data: buf.toString('base64') },
      });
      parts.push(label);
    } catch {
      return [];
    }
  }
  return parts;
}

export async function analyzeImageBuffer(
  imageBuffer: Buffer,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<AnalyzeImageResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const timestamp = new Date().toISOString();

  const userImagePart = {
    inlineData: {
      mimeType,
      data: imageBuffer.toString('base64'),
    },
  };

  const exemplarParts = await loadExemplarParts();
  const content: Array<{ inlineData: { mimeType: string; data: string } } | string> = exemplarParts.length
    ? [...exemplarParts, userImagePart, CLASSIFY_PROMPT]
    : [userImagePart, CLASSIFY_PROMPT];

  let raw: string;
  try {
    const result = await model.generateContent(content);
    const response = result.response;
    raw = response.text()?.trim() ?? '';
  } catch (err) {
    return {
      fire_detected: false,
      gases_detected: [],
      confidence: 0,
      risk_level: 'low',
      indicators: [],
      flammable_gases: [],
      combustion_indicators: [],
      timestamp,
      error: err instanceof Error ? err.message : 'Gemini API call failed',
    };
  }

  let data: GeminiElementsResponse;
  try {
    data = parseJson(raw);
  } catch {
    const retryContent = content.slice(0, -1).concat(RETRY_PROMPT);
    try {
      const retryResult = await model.generateContent(retryContent);
      raw = retryResult.response.text()?.trim() ?? '';
      data = parseJson(raw);
    } catch (e) {
      return {
        fire_detected: false,
        gases_detected: [],
        confidence: 0,
        risk_level: 'low',
        indicators: [],
        flammable_gases: [],
        combustion_indicators: [],
        timestamp,
        error: `Malformed JSON from Gemini: ${e instanceof Error ? e.message : String(e)}`,
      };
    }
  }

  const rawElements = (data.elements ?? []) as string[];
  const elements = rawElements
    .filter((e) => typeof e === 'string' && COMBUSTIBLE_ONLY.has(e.toLowerCase().trim()))
    .slice(0, 3);
  const observations = data.line_observations ?? [];
  const geminiConfidence = typeof data.confidence === 'number' ? data.confidence : 0;

  const risk = assessFireRisk(elements);

  return {
    fire_detected: risk.fire_detected,
    gases_detected: elements,
    confidence: geminiConfidence,
    risk_level: risk.risk_level,
    indicators: [...observations, ...risk.risk_reasons],
    flammable_gases: risk.flammable_gases,
    combustion_indicators: risk.combustion_indicators,
    timestamp,
  };
}
