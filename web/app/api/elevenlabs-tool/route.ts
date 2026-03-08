import { NextResponse } from 'next/server';
import { checkAndProcess } from '../../../lib/monitor';
import { weatherSummary } from '../../../lib/weather';

export const dynamic = 'force-dynamic';

/**
 * ElevenLabs server tool webhook.
 * During a call, the agent POSTs here to get live fire detection status.
 * Returns current risk level, confidence, gases, indicators, and weather context.
 */
export async function POST() {
  try {
    const status = await checkAndProcess();

    const weather_context =
      status.weather != null
        ? weatherSummary(status.weather)
        : null;

    return NextResponse.json({
      status: status.status,
      risk_level: status.risk_level ?? 'unknown',
      confidence_percent: status.confidence
        ? Math.round(status.confidence * 100)
        : 0,
      fire_detected: status.fire_detected ?? false,
      gases_detected: status.gases_detected ?? [],
      indicators: status.indicators ?? [],
      drafted_message: status.drafted_message ?? null,
      last_checked: status.last_checked,
      weather: status.weather
        ? {
            temp_c: status.weather.temp_c,
            humidity_percent: status.weather.humidity_percent,
            wind_speed_kmh: status.weather.wind_speed_kmh,
            wind_direction: status.weather.wind_direction,
            dryness_index: status.weather.dryness_index,
            location: status.reading_location?.label ?? status.weather.location_label,
          }
        : null,
      weather_summary: weather_context,
    });
  } catch (e) {
    return NextResponse.json(
      {
        status: 'error',
        error: e instanceof Error ? e.message : 'Failed to fetch monitor data',
      },
      { status: 500 },
    );
  }
}
