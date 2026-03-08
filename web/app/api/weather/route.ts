import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getWeatherForCoordinates } from '../../../lib/weather';
import { READING_LOCATIONS } from '../../../lib/reading-locations';

export const dynamic = 'force-dynamic';

const RESULT_PATH = path.join(process.cwd(), 'output', 'result.json');

/**
 * GET /api/weather
 * Query: lat, lon (optional) — if omitted, uses reading location from last result or Vancouver.
 * Returns current weather for wildfire context (temp, humidity, wind, dryness).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latParam = searchParams.get('lat');
  const lonParam = searchParams.get('lon');

  let lat: number;
  let lon: number;
  let locationLabel: string | undefined;

  if (latParam != null && lonParam != null) {
    lat = parseFloat(latParam);
    lon = parseFloat(lonParam);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return NextResponse.json({ error: 'Invalid lat or lon' }, { status: 400 });
    }
  } else {
    try {
      const raw = await fs.readFile(RESULT_PATH, 'utf-8');
      const result = JSON.parse(raw) as { reading_location?: { lat: number; lon: number; label: string } };
      if (result.reading_location?.lat != null && result.reading_location?.lon != null) {
        lat = result.reading_location.lat;
        lon = result.reading_location.lon;
        locationLabel = result.reading_location.label;
      } else {
        const vancouver = READING_LOCATIONS[0];
        lat = vancouver.lat;
        lon = vancouver.lon;
        locationLabel = vancouver.label;
      }
    } catch {
      const vancouver = READING_LOCATIONS[0];
      lat = vancouver.lat;
      lon = vancouver.lon;
      locationLabel = vancouver.label;
    }
  }

  const errorReason: { current: 'api_error' | null } = { current: null };
  const weather = await getWeatherForCoordinates(lat, lon, locationLabel, errorReason);
  if (!weather) {
    return NextResponse.json(
      { error: 'Weather request failed. Open-Meteo may be temporarily unavailable; try again later.' },
      { status: 503 }
    );
  }
  return NextResponse.json(weather);
}
