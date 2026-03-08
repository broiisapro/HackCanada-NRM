'use client';

import { useMemo, useState } from 'react';
import { useAppContext } from '../../context/app-context';
import { AppLayoutHeader } from '../../components/app-layout-header';
import { pickReadingLocation } from '../../../lib/reading-locations';

// Base hot spots: % position (0–100), radius, intensity, label. Matches canada-blank.svg.
const BASE_HOT_SPOTS: { cx: number; cy: number; r: number; intensity: number; label: string }[] = [
  { cx: 22, cy: 68, r: 12, intensity: 0.92, label: 'Lower Mainland' },
  { cx: 42, cy: 52, r: 14, intensity: 0.88, label: 'Alberta' },
  { cx: 72, cy: 58, r: 10, intensity: 0.72, label: 'Ontario' },
  { cx: 82, cy: 62, r: 9, intensity: 0.65, label: 'Quebec' },
];

// More locations, spread weights so it feels random but plausible (forestry, oil, urban, coastal).
// Jitter: we add ±jitterRange % to x/y so the pin isn’t always the same pixel.
/** Wind arrow on map: points in direction wind is blowing. wind_deg = meteorological (from which it blows). */
function WindArrowSvg({ windDeg, size = 28 }: { windDeg: number; size?: number }) {
  const rad = ((windDeg + 90) * Math.PI) / 180;
  const len = size * 0.45;
  const x = size / 2 + Math.cos(rad) * len;
  const y = size / 2 + Math.sin(rad) * len;
  const ax = x - 5 * Math.cos(rad) + 3 * Math.sin(rad);
  const ay = y - 5 * Math.sin(rad) - 3 * Math.cos(rad);
  const bx = x - 5 * Math.cos(rad) - 3 * Math.sin(rad);
  const by = y - 5 * Math.sin(rad) + 3 * Math.cos(rad);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 [color:var(--text-secondary)]" aria-hidden>
      <line x1={size / 2} y1={size / 2} x2={x} y2={y} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <polygon points={`${x},${y} ${ax},${ay} ${bx},${by}`} fill="currentColor" />
    </svg>
  );
}

export default function HeatmapPage() {
  const { uploadResult, hasAnalyzed } = useAppContext();
  const [hoverSpot, setHoverSpot] = useState<{ x: number; y: number; label: string } | null>(null);
  const [hoverReading, setHoverReading] = useState(false);

  const readingSpot = useMemo(() => {
    if (!hasAnalyzed || !uploadResult) return null;
    if (uploadResult.reading_location && 'x' in uploadResult.reading_location && 'label' in uploadResult.reading_location) {
      return {
        x: uploadResult.reading_location.x,
        y: uploadResult.reading_location.y,
        label: uploadResult.reading_location.label,
      };
    }
    const loc = pickReadingLocation();
    return { x: loc.x, y: loc.y, label: loc.label };
  }, [hasAnalyzed, uploadResult?.timestamp, uploadResult?.reading_location]);

  return (
    <>
      <AppLayoutHeader title="Heatmap" />
      <div className="p-6">
        <div className="mb-6 rounded-xl border p-5 [background:var(--bg-card)] [border-color:var(--border-default)]">
          <h2 className="mb-2 text-sm font-semibold tracking-wide [color:var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
            Flammable gas concentration
          </h2>
          <p className="text-sm leading-relaxed [color:var(--text-secondary)]">
            Regions with higher industrial or wildfire-related gas detection are shown in warmer colors. Hover over hot spots for region names.
            {hasAnalyzed && readingSpot ? (
              <span className="mt-2 block [color:var(--maroon-400)]">
                Your reading is shown near <strong>{readingSpot.label}</strong> — hover the marker for details.
              </span>
            ) : (
              <span className="mt-2 block [color:var(--text-muted)]">
                Upload and analyze an image to see your reading on the map.
              </span>
            )}
          </p>
        </div>

        <div className="relative">
          <div
            className="relative overflow-hidden rounded-xl border shadow-lg [background:var(--bg-card)] [border-color:var(--border-default)] [box-shadow:0_8px_30px_rgba(0,0,0,0.4)]"
            style={{ aspectRatio: '1114/942', maxWidth: 820 }}
          >
            <img
              src="/canada-blank.svg"
              alt="Map of Canada"
              className="absolute inset-0 h-full w-full object-contain transition-[filter] duration-300"
              style={{ filter: 'brightness(0.72) contrast(1.08) saturate(0.95)' }}
            />
            <div className="absolute inset-0" aria-hidden>
              {BASE_HOT_SPOTS.map((spot, i) => (
                <div
                  key={i}
                  className="absolute rounded-full opacity-75 transition-all duration-200 hover:opacity-95 hover:scale-105"
                  style={{
                    left: `${spot.cx - spot.r}%`,
                    top: `${spot.cy - spot.r}%`,
                    width: `${spot.r * 2}%`,
                    height: `${spot.r * 2}%`,
                    background: `radial-gradient(circle, rgba(220, 38, 38, ${spot.intensity * 0.55}) 0%, rgba(127, 29, 29, 0.2) 50%, transparent 85%)`,
                    cursor: 'pointer',
                    transformOrigin: 'center',
                  }}
                  onMouseEnter={() => setHoverSpot({ x: spot.cx, y: spot.cy, label: spot.label })}
                  onMouseLeave={() => setHoverSpot(null)}
                />
              ))}
              {readingSpot && (
                <div
                  className="absolute rounded-full opacity-95 animate-pulse"
                  style={{
                    left: `${readingSpot.x - 8}%`,
                    top: `${readingSpot.y - 8}%`,
                    width: '16%',
                    height: '16%',
                    background: 'radial-gradient(circle, var(--maroon-400) 0%, var(--maroon-600) 35%, transparent 65%)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoverReading(true)}
                  onMouseLeave={() => setHoverReading(false)}
                >
                  <div
                    className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md [background:var(--maroon-400)]"
                    aria-hidden
                  />
                  {uploadResult?.weather != null && (
                    <div
                      className="absolute left-1/2 top-1/2 flex items-center justify-center rounded bg-[var(--bg-card)]/90 p-1 shadow [color:var(--text-secondary)]"
                      style={{
                        transform: 'translate(calc(-50% + 14px), calc(-50% + 14px))',
                        width: 32,
                        height: 32,
                      }}
                      title={`Wind ${uploadResult.weather.wind_speed_kmh} km/h ${uploadResult.weather.wind_direction}`}
                    >
                      <WindArrowSvg windDeg={uploadResult.weather.wind_deg} size={24} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {hoverSpot && !hoverReading && (
              <div
                className="pointer-events-none absolute z-10 animate-in fade-in-0 zoom-in-95 rounded-lg border px-3 py-2.5 text-sm [background:var(--bg-card)] [border-color:var(--border-default)] [color:var(--text-primary)]"
                style={{
                  left: `${hoverSpot.x}%`,
                  top: `${hoverSpot.y}%`,
                  transform: 'translate(-50%, -100%) translateY(-10px)',
                }}
              >
                <div className="font-medium">{hoverSpot.label}</div>
                <div className="text-xs [color:var(--text-muted)]">Higher historical gas concentration</div>
              </div>
            )}

            {readingSpot && hoverReading && uploadResult && (
              <div
                className="pointer-events-none absolute z-10 w-72 animate-in fade-in-0 zoom-in-95 rounded-xl border-2 px-4 py-3.5 text-sm [background:var(--bg-card)] [border-color:var(--maroon-500)] [color:var(--text-primary)]"
                style={{
                  left: `${readingSpot.x}%`,
                  top: `${readingSpot.y}%`,
                  transform: 'translate(-50%, -100%) translateY(-14px)',
                }}
              >
                <div className="mb-2.5 border-b pb-2 font-semibold [border-color:var(--border-subtle)] [color:var(--maroon-400)]" style={{ fontFamily: 'var(--font-display)' }}>
                  Your reading — {readingSpot.label}
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs [color:var(--text-secondary)]">
                  <span className="[color:var(--text-muted)]">Risk</span>
                  <span className="capitalize">{uploadResult.risk_level}</span>
                  <span className="[color:var(--text-muted)]">Confidence</span>
                  <span>{Math.round((uploadResult.confidence ?? 0) * 100)}%</span>
                  <span className="[color:var(--text-muted)]">Fire detected</span>
                  <span>{uploadResult.fire_detected ? 'Yes' : 'No'}</span>
                  {uploadResult.flammable_gases?.length > 0 && (
                    <>
                      <span className="[color:var(--text-muted)]">Gases</span>
                      <span>{uploadResult.flammable_gases.join(', ')}</span>
                    </>
                  )}
                  {uploadResult.combustion_indicators?.length > 0 && (
                    <>
                      <span className="[color:var(--text-muted)]">Combustion</span>
                      <span>{uploadResult.combustion_indicators.join(', ')}</span>
                    </>
                  )}
                  {uploadResult.weather != null && (
                    <>
                      <span className="[color:var(--text-muted)]">Wind</span>
                      <span>{uploadResult.weather.wind_speed_kmh} km/h {uploadResult.weather.wind_direction}</span>
                      <span className="[color:var(--text-muted)]">Humidity</span>
                      <span>{uploadResult.weather.humidity_percent}%</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-lg border px-4 py-3 [background:var(--bg-elevated)] [border-color:var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-20 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, var(--maroon-950) 0%, var(--maroon-600) 100%)',
                }}
              />
              <span className="text-xs [color:var(--text-muted)]">Low → High</span>
            </div>
            {hasAnalyzed && (
              <div className="flex items-center gap-2">
                <span className="relative flex h-3.5 w-3.5 rounded-full border-2 border-white [background:var(--maroon-400)]" />
                <span className="text-xs [color:var(--text-muted)]">Your reading</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
