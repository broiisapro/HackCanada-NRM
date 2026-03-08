'use client';

import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, Legend,
} from 'recharts';
import type { MonitorStatus } from '../../lib/monitor';
import type { AnalyzeImageResult, ChartPoint } from '../context/app-context';

// ── Shared chart config ──

export const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 12,
  fontFamily: 'var(--font-sans)',
};
export const axisTickStyle = { fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-sans)' };
export const gridStroke = 'var(--border-subtle)';

// ── Icons (exported for nav) ──

export function IconUpload() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}
export function IconOverview() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}
export function IconChart() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}
export function IconFlask() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5.532 13.97a8.25 8.25 0 002.693 13.017c1.208.455 2.526.013 3.328-.936l.07-.086a3.75 3.75 0 015.754 0l.07.086c.802.949 2.12 1.39 3.328.936a8.25 8.25 0 002.693-13.017l-3.559-3.56A2.25 2.25 0 0114.25 8.818V3.104" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 2.25h7.5" />
    </svg>
  );
}
export function IconLog() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}
export function IconInfo() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}
export function IconRender() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6L9 11.25l5.25 5.25M9 6h10.5M4.5 18L20 4.5" />
    </svg>
  );
}
export function IconHeatmap() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15l4-8 4 4 5-9 4 6 4-4v12H3z" />
    </svg>
  );
}

// ── Card ──

function Card({ children, className = '', interactive }: { children: React.ReactNode; className?: string; interactive?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-5 transition-[background-color,border-color] duration-200 [background:var(--bg-card)] [border-color:var(--border-default)] hover:[background:var(--bg-card-hover)] ${interactive ? 'card-interactive' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-sm font-semibold tracking-wide [color:var(--text-secondary)]" style={{ fontFamily: 'var(--font-sans)' }}>
      {children}
    </h3>
  );
}

function StatCard({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <Card>
      <p className="mb-1 text-xs [color:var(--text-muted)]">{label}</p>
      <p className="text-2xl font-bold tracking-tight" style={{ color, fontFamily: 'var(--font-display)' }}>{value}</p>
      {sub && <p className="mt-1 text-xs [color:var(--text-muted)] truncate" title={sub}>{sub}</p>}
    </Card>
  );
}

function AlertContent({ message }: { message: string }) {
  const cleaned = message.replace(/\*\*/g, '');
  const lines = cleaned.split('\n').filter((l) => l.trim().length > 0);
  const elements: React.ReactNode[] = [];
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (/^[-•]/.test(trimmed)) {
      elements.push(
        <li key={i} className="flex items-start gap-2 text-sm leading-relaxed [color:var(--text-secondary)]">
          <span className="mt-0.5 shrink-0 [color:var(--maroon-400)]">•</span>
          <span>{trimmed.replace(/^[-•]\s*/, '')}</span>
        </li>
      );
    } else if (trimmed.endsWith(':')) {
      elements.push(
        <p key={i} className="mt-3 text-sm font-semibold first:mt-0 [color:var(--text-primary)]">{trimmed}</p>
      );
    } else {
      elements.push(
        <li key={i} className="flex items-start gap-2 text-sm leading-relaxed [color:var(--text-secondary)]">
          <span className="mt-0.5 shrink-0 [color:var(--maroon-400)]">•</span>
          <span>{trimmed}</span>
        </li>
      );
    }
  });
  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[15px]" style={{ fontFamily: 'var(--font-sans)' }}>
      {elements}
    </ul>
  );
}

// ── Upload Tab ──

export function UploadTab({
  selectedFile,
  analyzing,
  result,
  onFileChange,
  onAnalyze,
  hasAnalyzed,
  onCallEmergency,
}: {
  selectedFile: File | null;
  analyzing: boolean;
  result: AnalyzeImageResult | null;
  onFileChange: (file: File | null) => void;
  onAnalyze: () => void;
  hasAnalyzed: boolean;
  onCallEmergency?: () => void;
}) {
  const inputId = 'upload-image-input';
  const riskColors: Record<string, string> = {
    LOW: 'var(--accent-success)',
    MEDIUM: 'var(--accent-warning)',
    HIGH: '#f97316',
    CRITICAL: 'var(--accent-danger)',
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && /^image\/(jpeg|png|webp)$/.test(file.type)) {
      onFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileChange(file);
  };

  if (result && !result.error) {
    const riskLevel = (result.risk_level ?? 'low').toUpperCase();
    const riskColor = riskColors[riskLevel] ?? 'var(--text-muted)';
    const confPct = Math.round(result.confidence * 100);

    return (
      <div className="flex flex-col gap-5">
        <div
          className={`stagger-1 flex items-center gap-4 rounded-xl border p-5 transition-colors duration-200 ${
            result.fire_detected
              ? 'border-[var(--maroon-800)] bg-[var(--maroon-950)]/60'
              : 'border-[var(--accent-success)]/30 bg-[var(--accent-success)]/10'
          }`}
        >
          <div
            className={`h-3 w-3 shrink-0 rounded-full ${
              result.fire_detected ? 'bg-[var(--maroon-500)]' : 'bg-[var(--accent-success)]'
            }`}
            aria-hidden
          />
          <div className="flex-1">
            <p
              className={`text-lg font-bold tracking-tight ${
                result.fire_detected ? 'text-[var(--maroon-400)]' : 'text-[var(--accent-success)]'
              }`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {result.fire_detected ? 'Fire Risk Detected' : 'All Clear'}
            </p>
            <p className="mt-0.5 text-xs [color:var(--text-muted)]">
              Analyzed at {new Date(result.timestamp).toLocaleTimeString()}
            </p>
          </div>
          {onCallEmergency && (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') && (
            <button
              type="button"
              onClick={onCallEmergency}
              className="press-active flex shrink-0 items-center gap-2 rounded-lg bg-[var(--maroon-600)] px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--maroon-500)]"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Call Emergency
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="stagger-2">
            <StatCard
              label="Confidence"
              value={`${confPct}%`}
              color={confPct >= 80 ? 'var(--accent-danger)' : confPct >= 50 ? 'var(--accent-warning)' : 'var(--accent-success)'}
            />
          </div>
          <div className="stagger-3">
            <StatCard label="Risk Level" value={riskLevel} color={riskColor} />
          </div>
          <div className="stagger-4">
            <StatCard
              label="Flammable"
              value={result.fire_detected ? 'Yes' : 'No'}
              color={result.fire_detected ? 'var(--accent-danger)' : 'var(--accent-success)'}
            />
          </div>
          <div className="stagger-5">
            <StatCard
              label="Gases Found"
              value={String(result.gases_detected?.length ?? 0)}
              color="var(--maroon-400)"
              sub={result.gases_detected?.join(', ') || '—'}
            />
          </div>
        </div>

        {result.indicators && result.indicators.length > 0 && (
          <Card className="stagger-5">
            <CardTitle>Spectral observations</CardTitle>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-sm [color:var(--text-secondary)]">
              {result.indicators.slice(0, 8).map((obs, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="shrink-0 [color:var(--maroon-400)]">•</span>
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {hasAnalyzed && (
          <Card className="stagger-6 border-[var(--maroon-800)]/50 bg-[var(--maroon-950)]/30">
            <p className="mb-3 text-sm [color:var(--text-secondary)]">
              Explore overview, analytics, detections, and event logs in the sidebar.
            </p>
            <Link
              href="/overview"
              className="press-active inline-block rounded-lg bg-[var(--maroon-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--maroon-500)] focus:outline-none focus:ring-2 focus:ring-[var(--maroon-500)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]"
              aria-label="Explore other tabs"
            >
              Explore other tabs
            </Link>
          </Card>
        )}

        <div className="flex gap-3 stagger-6">
          <label
            htmlFor={inputId}
            className="press-active cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium [border-color:var(--border-default)] [color:var(--text-secondary)] hover:[border-color:var(--maroon-800)] hover:[color:var(--text-primary)]"
            tabIndex={0}
            aria-label="Analyze another image"
          >
            Analyze another image
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleInputChange}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardTitle>Upload spectral image</CardTitle>
        <p className="mb-4 text-sm [color:var(--text-secondary)]">
          Upload an emission line or spectral image. Pyros will analyze it with AI and show fire risk
          metrics live.
        </p>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`rounded-xl border-2 border-dashed p-10 text-center transition-[border-color,background-color] duration-200 ${
            selectedFile
              ? 'border-[var(--maroon-600)]/50 bg-[var(--maroon-950)]/30'
              : '[border-color:var(--border-default)] bg-[var(--bg-elevated)] hover:[border-color:var(--maroon-800)]'
          }`}
        >
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleInputChange}
            aria-label="Choose image file"
          />
          <label
            htmlFor={inputId}
            className="flex cursor-pointer flex-col items-center gap-3"
          >
            <div className="press-active flex h-14 w-14 items-center justify-center rounded-full bg-[var(--maroon-900)]/50 text-[var(--maroon-400)]">
              <IconUpload />
            </div>
            {selectedFile ? (
              <>
                <p className="text-sm font-medium [color:var(--text-primary)]">{selectedFile.name}</p>
                <p className="text-xs [color:var(--text-muted)]">
                  {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type.replace('image/', '')}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium [color:var(--text-secondary)]">
                  Drag and drop an image here, or click to browse
                </p>
                <p className="text-xs [color:var(--text-muted)]">JPEG, PNG or WebP · max 10 MB</p>
              </>
            )}
          </label>
        </div>

        {result?.error && (
          <p className="mt-3 text-sm [color:var(--accent-danger)]" role="alert">
            {result.error}
          </p>
        )}

        <button
          type="button"
          disabled={!selectedFile || analyzing}
          onClick={onAnalyze}
          className="press-active mt-4 w-full rounded-lg bg-[var(--maroon-600)] px-6 py-2.5 text-sm font-semibold text-white transition-[color,transform] duration-200 hover:bg-[var(--maroon-500)] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--maroon-500)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)] sm:w-auto"
          aria-busy={analyzing}
          aria-label={analyzing ? 'Analyzing image' : 'Analyze image'}
        >
          {analyzing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Analyzing…
            </span>
          ) : (
            'Analyze image'
          )}
        </button>
      </Card>
    </div>
  );
}

// ── Overview Tab ──

export function OverviewTab({ data, chartData, onCallEmergency }: { data: MonitorStatus | null; chartData: ChartPoint[]; onCallEmergency?: () => void }) {
  const noData = !data || data.status === 'no_data';
  const isDanger = data?.status === 'danger';
  const riskLevel = (data?.risk_level ?? '—').toUpperCase();
  const confPct = data?.confidence !== undefined ? Math.round(data.confidence * 100) : 0;

  const riskColors: Record<string, string> = {
    LOW: 'var(--accent-success)', MEDIUM: 'var(--accent-warning)', HIGH: '#f97316', CRITICAL: 'var(--accent-danger)',
  };
  const riskColor = riskColors[riskLevel] ?? 'var(--text-muted)';

  return (
    <div className="flex flex-col gap-5">
      <div
        className={`stagger-1 flex items-center gap-4 rounded-xl border p-5 transition-colors duration-200 ${
          isDanger ? 'border-[var(--maroon-800)] bg-[var(--maroon-950)]/60' : noData ? '[background:var(--bg-card)] [border-color:var(--border-default)]' : 'border-[var(--accent-success)]/30 bg-[var(--accent-success)]/10'
        }`}
      >
        <div
          className={`h-3 w-3 shrink-0 rounded-full ${
            isDanger ? 'bg-[var(--maroon-500)]' : noData ? 'animate-pulse bg-[var(--text-muted)]' : 'bg-[var(--accent-success)]'
          }`}
          aria-hidden
        />
        <div>
          <p
            className={`text-lg font-bold tracking-tight ${
              isDanger ? 'text-[var(--maroon-400)]' : noData ? '[color:var(--text-muted)]' : 'text-[var(--accent-success)]'
            }`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {isDanger ? 'Fire Risk Detected' : noData ? 'Waiting for Data' : 'All Clear'}
          </p>
          <p className="mt-0.5 text-xs [color:var(--text-muted)]">
            {noData ? 'Listening for spectral analysis from pyros-vision...' : `Last updated ${data?.last_checked ? new Date(data.last_checked).toLocaleTimeString() : '—'}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="stagger-2"><StatCard label="Confidence" value={`${confPct}%`} color={confPct >= 80 ? 'var(--accent-danger)' : confPct >= 50 ? 'var(--accent-warning)' : 'var(--accent-success)'} /></div>
        <div className="stagger-3"><StatCard label="Risk Level" value={riskLevel} color={riskColor} /></div>
        <div className="stagger-4"><StatCard label="Flammable" value={data?.fire_detected ? 'Yes' : 'No'} color={data?.fire_detected ? 'var(--accent-danger)' : 'var(--accent-success)'} /></div>
        <div className="stagger-5"><StatCard label="Gases Found" value={String(data?.gases_detected?.length ?? 0)} color="var(--maroon-400)" sub={data?.gases_detected?.join(', ') || '—'} /></div>
      </div>

      {chartData.length > 1 && (
        <Card className="stagger-5" interactive>
          <CardTitle>Confidence Over Time</CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="confFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--maroon-500)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--maroon-500)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis dataKey="time" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={axisTickStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--text-secondary)' }} />
              <Area type="monotone" dataKey="confidence" stroke="var(--maroon-500)" fill="url(#confFill)" strokeWidth={2} dot={false} name="Confidence %" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {data?.drafted_message && (
        <Card className="stagger-6 !border-[var(--maroon-800)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold tracking-wide text-[var(--maroon-400)]" style={{ fontFamily: 'var(--font-display)' }}>
              AI Alert for First Responders
            </h3>
            {onCallEmergency && (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') && (
              <button
                type="button"
                onClick={onCallEmergency}
                className="press-active flex items-center gap-2 rounded-lg bg-[var(--maroon-600)] px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--maroon-500)]"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Call Emergency
              </button>
            )}
          </div>
          <AlertContent message={data.drafted_message} />
        </Card>
      )}
    </div>
  );
}

// ── Analytics Tab ──

export function AnalyticsTab({ chartData, gasBarData }: { chartData: ChartPoint[]; gasBarData: { gas: string; count: number }[] }) {
  if (chartData.length === 0) {
    return (
      <Card>
        <p className="py-12 text-center text-sm [color:var(--text-muted)]">No data yet. Charts will appear after the first analysis.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="stagger-1" interactive>
        <CardTitle>Confidence Over Time</CardTitle>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="confFillA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--maroon-500)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--maroon-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={gridStroke} vertical={false} />
            <XAxis dataKey="time" tick={axisTickStyle} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={axisTickStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--text-secondary)' }} />
            <Area type="monotone" dataKey="confidence" stroke="var(--maroon-500)" fill="url(#confFillA)" strokeWidth={2} dot={false} name="Confidence %" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="stagger-2" interactive>
          <CardTitle>Risk Level Over Time</CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis dataKey="time" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} tickFormatter={(v) => ['', 'Low', 'Med', 'High', 'Crit'][v] ?? ''} tick={axisTickStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--text-secondary)' }} formatter={(v: number) => ['', 'Low', 'Medium', 'High', 'Critical'][v] ?? ''} />
              <Line type="stepAfter" dataKey="riskLevel" stroke="var(--accent-warning)" strokeWidth={2} dot={{ r: 3, fill: 'var(--accent-warning)', strokeWidth: 0 }} name="Risk" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="stagger-3" interactive>
          <CardTitle>Fire Detection Status</CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fireFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--maroon-500)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--maroon-500)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis dataKey="time" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 1]} ticks={[0, 1]} tickFormatter={(v) => v === 1 ? 'Yes' : 'No'} tick={axisTickStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--text-secondary)' }} formatter={(v: number) => v === 1 ? 'Fire Detected' : 'Clear'} />
              <Area type="stepAfter" dataKey="flammable" stroke="var(--maroon-500)" fill="url(#fireFill)" strokeWidth={2} dot={false} name="Fire" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="stagger-4" interactive>
          <CardTitle>Hazard Indicators per Reading</CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis dataKey="time" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--text-secondary)' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} />
              <Bar dataKey="flammableCount" fill="var(--accent-warning)" name="Flammable" stackId="a" radius={[3, 3, 0, 0]} />
              <Bar dataKey="combustionCount" fill="var(--maroon-500)" name="Combustion" stackId="a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {gasBarData.length > 0 && (
          <Card className="stagger-5" interactive>
            <CardTitle>Gas Detection Frequency</CardTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gasBarData} layout="vertical" barSize={16}>
                <CartesianGrid stroke={gridStroke} horizontal={false} />
                <XAxis type="number" tick={axisTickStyle} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="gas" tick={{ ...axisTickStyle, fill: 'var(--maroon-400)' }} width={100} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--text-secondary)' }} />
                <Bar dataKey="count" fill="var(--maroon-600)" name="Times Detected" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── Detections Tab ──

export function DetectionsTab({ data }: { data: MonitorStatus | null }) {
  const gases = data?.gases_detected ?? [];
  const indicators = data?.indicators ?? [];

  return (
    <div className="flex flex-col gap-5">
      <Card className="stagger-1" interactive>
        <CardTitle>Detected Gases</CardTitle>
        {gases.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {gases.map((gas) => (
              <span
                key={gas}
                className="rounded-lg border border-[var(--maroon-800)]/50 bg-[var(--maroon-950)]/40 px-4 py-2 text-sm font-medium text-[var(--maroon-400)] transition-colors duration-200 hover:border-[var(--maroon-600)]/50"
              >
                {gas}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm [color:var(--text-muted)]">No gases detected yet.</p>
        )}
      </Card>

      <Card className="stagger-2" interactive>
        <CardTitle>Spectral Observations</CardTitle>
        {indicators.length > 0 ? (
          <div className="flex flex-col gap-2">
            {indicators.map((obs, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-[var(--bg-elevated)] px-3 py-2 text-sm transition-colors duration-200 hover:bg-[var(--border-subtle)]">
                <span className="mt-0.5 shrink-0 font-mono text-xs text-[var(--maroon-400)]">{String(i + 1).padStart(2, '0')}</span>
                <span className="[color:var(--text-secondary)]">{obs}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm [color:var(--text-muted)]">No observations recorded yet.</p>
        )}
      </Card>
    </div>
  );
}

// ── Logs Tab ──

export function LogsTab({ data }: { data: MonitorStatus | null }) {
  const events = data?.recent_events ?? [];
  const riskColorMap: Record<string, string> = { low: 'var(--accent-success)', medium: 'var(--accent-warning)', high: '#f97316', critical: 'var(--accent-danger)' };

  return (
    <Card className="stagger-1">
      <CardTitle>Recent Events</CardTitle>
      {events.length > 0 ? (
        <div className="flex flex-col">
          <div className="mb-1 grid grid-cols-[100px_70px_80px_80px_1fr] gap-3 border-b pb-2 text-xs font-medium [border-color:var(--border-default)] [color:var(--text-muted)]">
            <span>Time</span>
            <span>Status</span>
            <span>Confidence</span>
            <span>Risk</span>
            <span>Gases</span>
          </div>
          {[...events].reverse().map((ev, i) => (
            <div key={i} className="grid grid-cols-[100px_70px_80px_80px_1fr] items-center gap-3 border-b py-2.5 text-sm [border-color:var(--border-subtle)]">
              <span className="font-mono text-xs [color:var(--text-muted)]">{new Date(ev.timestamp).toLocaleTimeString()}</span>
              <span className={`text-xs font-semibold ${ev.fire_detected ? 'text-[var(--maroon-400)]' : 'text-[var(--accent-success)]'}`}>
                {ev.fire_detected ? 'Alert' : 'Clear'}
              </span>
              <span className="font-mono text-xs [color:var(--text-secondary)]">{Math.round((ev.confidence ?? 0) * 100)}%</span>
              <span className="text-xs" style={{ color: ev.risk_level ? riskColorMap[ev.risk_level.toLowerCase()] ?? 'var(--text-muted)' : 'var(--text-muted)' }}>
                {ev.risk_level ?? '—'}
              </span>
              <span className="text-xs [color:var(--text-secondary)]">{ev.gases_detected?.join(', ') || '—'}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm [color:var(--text-muted)]">No events recorded yet.</p>
      )}
    </Card>
  );
}

// ── About Tab ──

export function AboutTab() {
  const stack = [
    { name: 'Pyros Vision', desc: 'Python spectral image analysis via Gemini 2.5 Flash', tech: 'Python, google-generativeai, watchdog' },
    { name: 'Pyros Core', desc: 'Real-time dashboard and alert pipeline', tech: 'Next.js 16, React 19, Tailwind CSS, Recharts' },
    { name: 'Alert Drafting', desc: 'AI-generated first responder alerts', tech: 'Anthropic Claude API' },
    { name: 'Hardware', desc: 'Raspberry Pi camera + ESP32 IMU sensor', tech: 'Python, TensorFlow, Serial' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Card className="stagger-1" interactive>
        <CardTitle>How Pyros Works</CardTitle>
        <div className="flex flex-col gap-4 text-sm leading-relaxed [color:var(--text-secondary)]">
          <p>
            Pyros detects potential wildfire threats by analyzing spectral emission line images.
            A camera captures light spectra, and AI identifies which gases are present based on
            their unique emission line signatures.
          </p>
          <p>
            If flammable gases (like Hydrogen, Carbon, Sodium) or combustion byproducts
            (like Carbon Monoxide, Nitrogen oxides) are detected, the system raises a fire
            risk alert and drafts a message for first responders.
          </p>
          <div className="flex flex-col gap-1 rounded-lg bg-[var(--bg-elevated)] p-4 font-mono text-xs [color:var(--text-muted)]">
            <p>Camera &rarr; Spectral Image &rarr; Gemini AI &rarr; Gas Identification</p>
            <p>&rarr; Fire Risk Assessment &rarr; Dashboard &rarr; Claude AI Alert</p>
          </div>
        </div>
      </Card>

      <Card className="stagger-2" interactive>
        <CardTitle>Tech Stack</CardTitle>
        <div className="flex flex-col gap-3">
          {stack.map((item) => (
            <div key={item.name} className="flex flex-col gap-1 rounded-lg bg-[var(--bg-elevated)] p-3 transition-colors duration-200 hover:bg-[var(--border-subtle)]">
              <p className="text-sm font-semibold [color:var(--text-primary)]">{item.name}</p>
              <p className="text-xs [color:var(--text-secondary)]">{item.desc}</p>
              <p className="font-mono text-xs text-[var(--maroon-400)]">{item.tech}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="stagger-3">
        <CardTitle>Built For</CardTitle>
        <p className="text-sm [color:var(--text-secondary)]">HackCanada 2026</p>
      </Card>
    </div>
  );
}
