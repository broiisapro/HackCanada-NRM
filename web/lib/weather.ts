/**
 * Real-time weather for wildfire risk: temperature, humidity, wind, dryness index.
 * Uses Open-Meteo Forecast API (https://open-meteo.com/en/docs) — no API key required.
 */

export interface WeatherSnapshot {
  temp_c: number;
  humidity_percent: number;
  wind_speed_kmh: number;
  wind_deg: number;
  wind_direction: string; // N, NE, E, SE, S, SW, W, NW
  dryness_index: number; // 0-1, higher = drier (more fire-prone)
  description?: string;
  fetched_at: string; // ISO
  location_label?: string;
}

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

function degToDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(((deg % 360) + 360) % 360 / 45) % 8;
  return dirs[idx];
}

/**
 * Compute a simple dryness index (0-1): low humidity + high temp = drier.
 * Not a formal fire-weather index; used to enrich risk context.
 */
function computeDrynessIndex(tempC: number, humidityPercent: number): number {
  const normalizedTemp = Math.max(0, Math.min(1, (tempC + 10) / 45)); // rough 0-1 for -10 to 35 C
  const normalizedDry = 1 - humidityPercent / 100;
  return Math.min(1, Math.max(0, normalizedTemp * 0.5 + normalizedDry * 0.5));
}

/** WMO weather code → short description (subset for wildfire context). */
function weatherCodeToDescription(code: number): string | undefined {
  const map: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
  };
  return map[code];
}

/** Open-Meteo current weather response. */
interface OpenMeteoCurrent {
  time?: string;
  temperature_2m?: number;
  relative_humidity_2m?: number;
  wind_speed_10m?: number;
  wind_direction_10m?: number;
  weather_code?: number;
}

interface OpenMeteoResponse {
  current?: OpenMeteoCurrent;
  error?: boolean;
  reason?: string;
}

export type WeatherError = 'api_error';

/**
 * Fetch current weather for a lat/lon using Open-Meteo. No API key required.
 * On failure, sets errorReason so the caller can show a specific message.
 */
export async function getWeatherForCoordinates(
  lat: number,
  lon: number,
  locationLabel?: string,
  errorReason?: { current: WeatherError | null }
): Promise<WeatherSnapshot | null> {
  const url = new URL(OPEN_METEO_BASE);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code');
  url.searchParams.set('temperature_unit', 'celsius');
  url.searchParams.set('wind_speed_unit', 'kmh');

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    if (!res.ok) {
      if (errorReason) errorReason.current = 'api_error';
      return null;
    }
    const data = (await res.json()) as OpenMeteoResponse;
    if (data.error || !data.current) {
      if (errorReason) errorReason.current = 'api_error';
      return null;
    }
    const cur = data.current;
    const temp = cur.temperature_2m ?? 15;
    const humidity = cur.relative_humidity_2m ?? 50;
    const windSpeedKmh = Math.round((cur.wind_speed_10m ?? 0) * 10) / 10;
    const windDeg = cur.wind_direction_10m ?? 0;
    const dryness = computeDrynessIndex(temp, humidity);
    const description = cur.weather_code != null ? weatherCodeToDescription(cur.weather_code) : undefined;

    return {
      temp_c: Math.round(temp * 10) / 10,
      humidity_percent: humidity,
      wind_speed_kmh: windSpeedKmh,
      wind_deg: windDeg,
      wind_direction: degToDirection(windDeg),
      dryness_index: Math.round(dryness * 100) / 100,
      description,
      fetched_at: new Date().toISOString(),
      location_label: locationLabel,
    };
  } catch {
    if (errorReason) errorReason.current = 'api_error';
    return null;
  }
}

/**
 * One-line summary for voice/agent: e.g. "18°C, 45% humidity, 25 km/h NW wind, dry."
 */
export function weatherSummary(snapshot: WeatherSnapshot): string {
  const dry = snapshot.dryness_index >= 0.6 ? ', dry' : snapshot.dryness_index >= 0.4 ? ', moderate dryness' : '';
  return `${snapshot.temp_c}°C, ${snapshot.humidity_percent}% humidity, ${snapshot.wind_speed_kmh} km/h ${snapshot.wind_direction} wind${dry}.`;
}
