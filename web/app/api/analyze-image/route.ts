import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import fs from 'fs/promises';
import path from 'path';
import { analyzeImageBuffer, applyWeatherRisk, AnalyzeImageResult } from '../../../lib/analyze-image';
import { pickReadingLocation } from '../../../lib/reading-locations';
import { getWeatherForCoordinates } from '../../../lib/weather';
import { appendEvent } from '../../../lib/logger';

const RESULT_PATH = path.join(process.cwd(), 'output', 'result.json');
const HISTORY_PATH = path.join(process.cwd(), 'output', 'history.json');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('image') ?? formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Missing image file. Use field name "image" or "file".' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 10 MB.' }, { status: 400 });
  }

  const mimeType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return NextResponse.json(
      { error: `Unsupported type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let result: AnalyzeImageResult;
  try {
    result = await analyzeImageBuffer(buffer, mimeType);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Analysis failed' },
      { status: 500 }
    );
  }

  if (result.error) {
    return NextResponse.json(result, { status: 200 });
  }

  const timestampMs = new Date(result.timestamp).getTime();
  const readingLocation = pickReadingLocation(timestampMs);
  const weather = await getWeatherForCoordinates(
    readingLocation.lat,
    readingLocation.lon,
    readingLocation.label
  );

  if (weather) {
    const adjusted = applyWeatherRisk(result, weather);
    result = {
      ...result,
      risk_level: adjusted.risk_level,
      fire_detected: adjusted.fire_detected,
      indicators: adjusted.indicators,
      weather: {
        ...weather,
        description: weather.description,
        fetched_at: weather.fetched_at,
        location_label: weather.location_label,
      },
      reading_location: {
        x: readingLocation.x,
        y: readingLocation.y,
        label: readingLocation.label,
        lat: readingLocation.lat,
        lon: readingLocation.lon,
      },
    };
  } else {
    result = {
      ...result,
      reading_location: {
        x: readingLocation.x,
        y: readingLocation.y,
        label: readingLocation.label,
        lat: readingLocation.lat,
        lon: readingLocation.lon,
      },
    };
  }

  const event = {
    fire_detected: result.fire_detected,
    gases_detected: result.gases_detected,
    confidence: result.confidence,
    timestamp: result.timestamp,
    risk_level: result.risk_level,
    indicators: result.indicators,
  };

  try {
    await fs.mkdir(path.dirname(RESULT_PATH), { recursive: true });
    await fs.writeFile(RESULT_PATH, JSON.stringify(result, null, 2));
    await appendEvent(event);

    let history: typeof result[] = [];
    try {
      const raw = await fs.readFile(HISTORY_PATH, 'utf-8');
      history = JSON.parse(raw);
    } catch {
      // File doesn't exist yet
    }
    history.push(result);
    if (history.length > 500) history = history.slice(-500);
    await fs.mkdir(path.dirname(HISTORY_PATH), { recursive: true });
    await fs.writeFile(HISTORY_PATH, JSON.stringify(history, null, 2));
  } catch (err) {
    return NextResponse.json(
      { ...result, error: `Saved result but failed to update history: ${err instanceof Error ? err.message : err}` },
      { status: 200 }
    );
  }

  return NextResponse.json(result);
}
