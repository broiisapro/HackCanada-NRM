'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { MonitorStatus } from '../../lib/monitor';

// ── Types ──

export interface HistoryEntry {
  fire_detected: boolean | null;
  gases_detected?: string[];
  confidence?: number;
  risk_level?: string;
  indicators?: string[];
  flammable_gases?: string[];
  combustion_indicators?: string[];
  timestamp: string;
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
}

export type ChartPoint = {
  time: string;
  confidence: number;
  riskLevel: number;
  flammable: number;
  flammableCount: number;
  combustionCount: number;
};

const RISK_MAP: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };

function riskToNum(level?: string): number {
  return RISK_MAP[(level ?? 'low').toLowerCase()] ?? 0;
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ── Context ──

interface AppContextValue {
  data: MonitorStatus | null;
  history: HistoryEntry[];
  clock: string;
  uploadFile: File | null;
  setUploadFile: (file: File | null) => void;
  analyzing: boolean;
  uploadResult: AnalyzeImageResult | null;
  handleAnalyze: () => Promise<void>;
  chartData: ChartPoint[];
  gasBarData: { gas: string; count: number }[];
  hasAnalyzed: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<MonitorStatus | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [clock, setClock] = useState('');
  const [uploadFile, setUploadFileState] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadResult, setUploadResult] = useState<AnalyzeImageResult | null>(null);

  const setUploadFile = useCallback((file: File | null) => {
    setUploadFileState(file);
    if (file) setUploadResult(null);
  }, []);

  useEffect(() => {
    const poll = async () => {
      try {
        const [monRes, histRes] = await Promise.all([
          fetch('/api/monitor'),
          fetch('/api/history'),
        ]);
        setData(await monRes.json());
        setHistory(await histRes.json());
      } catch {
        /* keep previous state */
      }
      setClock(new Date().toLocaleTimeString());
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!uploadFile) return;
    setAnalyzing(true);
    setUploadResult(null);
    try {
      const formData = new FormData();
      formData.append('image', uploadFile);
      const res = await fetch('/api/analyze-image', { method: 'POST', body: formData });
      const json = await res.json();
      setUploadResult(json);
      if (res.ok && !json.error) {
        const [monRes, histRes] = await Promise.all([fetch('/api/monitor'), fetch('/api/history')]);
        setData(await monRes.json());
        setHistory(await histRes.json());
      }
    } catch {
      setUploadResult({
        fire_detected: false,
        gases_detected: [],
        confidence: 0,
        risk_level: 'low',
        indicators: [],
        flammable_gases: [],
        combustion_indicators: [],
        timestamp: new Date().toISOString(),
        error: 'Request failed. Please try again.',
      });
    } finally {
      setAnalyzing(false);
    }
  }, [uploadFile]);

  const chartData: ChartPoint[] = history.map((entry) => ({
    time: formatTime(entry.timestamp),
    confidence: Math.round((entry.confidence ?? 0) * 100),
    riskLevel: riskToNum(entry.risk_level),
    flammable: entry.fire_detected ? 1 : 0,
    flammableCount: (entry.flammable_gases ?? []).length,
    combustionCount: (entry.combustion_indicators ?? []).length,
  }));

  const gasFreq: Record<string, number> = {};
  history.forEach((entry) => {
    (entry.gases_detected ?? []).forEach((gas) => {
      gasFreq[gas] = (gasFreq[gas] ?? 0) + 1;
    });
  });
  const gasBarData = Object.entries(gasFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([gas, count]) => ({ gas, count }));

  const hasAnalyzed = !!uploadResult && !uploadResult.error;

  const value: AppContextValue = {
    data,
    history,
    clock,
    uploadFile,
    setUploadFile,
    analyzing,
    uploadResult,
    handleAnalyze,
    chartData,
    gasBarData,
    hasAnalyzed,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
