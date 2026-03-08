/**
 * Canadian reading locations for heatmap + weather (shared by frontend and API).
 * x,y = % position on canada-blank.svg; lat,lon for weather API.
 */
export interface ReadingLocation {
  x: number;
  y: number;
  label: string;
  weight: number;
  lat: number;
  lon: number;
}

export const READING_LOCATIONS: ReadingLocation[] = [
  { x: 22, y: 68, label: 'Vancouver, BC', weight: 18, lat: 49.28, lon: -123.12 },
  { x: 18, y: 72, label: 'Victoria, BC', weight: 8, lat: 48.43, lon: -123.37 },
  { x: 26, y: 62, label: 'Kelowna, BC', weight: 6, lat: 49.89, lon: -119.5 },
  { x: 42, y: 52, label: 'Calgary, AB', weight: 14, lat: 51.04, lon: -114.07 },
  { x: 40, y: 56, label: 'Edmonton, AB', weight: 10, lat: 53.55, lon: -113.49 },
  { x: 48, y: 58, label: 'Regina, SK', weight: 5, lat: 50.45, lon: -104.61 },
  { x: 52, y: 58, label: 'Winnipeg, MB', weight: 8, lat: 49.9, lon: -97.14 },
  { x: 72, y: 58, label: 'Toronto, ON', weight: 12, lat: 43.65, lon: -79.38 },
  { x: 70, y: 62, label: 'Ottawa, ON', weight: 5, lat: 45.42, lon: -75.69 },
  { x: 82, y: 62, label: 'Montreal, QC', weight: 8, lat: 45.5, lon: -73.57 },
  { x: 88, y: 68, label: 'Halifax, NS', weight: 4, lat: 44.65, lon: -63.58 },
  { x: 28, y: 48, label: 'Prince George, BC', weight: 2, lat: 53.92, lon: -122.75 },
];

const JITTER_RANGE = 2.5;

/** Simple seeded 0-1 for deterministic jitter. */
function seeded(seed: number, a: number): number {
  return ((seed * 9301 + 49297) % 233280) / 233280 * 2 * JITTER_RANGE - JITTER_RANGE;
}

/**
 * Pick a reading location by weight. Optional seed (e.g. timestamp) for deterministic pick on server.
 */
export function pickReadingLocation(seed?: number): { x: number; y: number; label: string; lat: number; lon: number } {
  const total = READING_LOCATIONS.reduce((s, l) => s + l.weight, 0);
  const r = seed !== undefined ? ((seed % 10000) / 10000) * total : Math.random() * total;
  let acc = 0;
  for (const loc of READING_LOCATIONS) {
    acc += loc.weight;
    if (r <= acc) {
      const jx = seed !== undefined ? seeded(seed + loc.x, loc.x) : (Math.random() - 0.5) * 2 * JITTER_RANGE;
      const jy = seed !== undefined ? seeded(seed + loc.y + 1000, loc.y) : (Math.random() - 0.5) * 2 * JITTER_RANGE;
      return {
        x: Math.max(2, Math.min(98, loc.x + jx)),
        y: Math.max(2, Math.min(98, loc.y + jy)),
        label: loc.label,
        lat: loc.lat,
        lon: loc.lon,
      };
    }
  }
  const last = READING_LOCATIONS[READING_LOCATIONS.length - 1];
  const jx = seed !== undefined ? seeded(seed + 1, 0) : (Math.random() - 0.5) * 2 * JITTER_RANGE;
  const jy = seed !== undefined ? seeded(seed + 2, 0) : (Math.random() - 0.5) * 2 * JITTER_RANGE;
  return {
    x: Math.max(2, Math.min(98, last.x + jx)),
    y: Math.max(2, Math.min(98, last.y + jy)),
    label: last.label,
    lat: last.lat,
    lon: last.lon,
  };
}
