'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { MonitorStatus } from '../../lib/monitor';

// ── Types ──

export interface CallLogEntry {
  conversation_id: string;
  started_at: string;
  completed_at?: string;
  status: 'done' | 'failed';
  duration_seconds?: number;
  transcript?: { role: string; message: string }[];
  error?: string;
}

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
  weather?: {
    temp_c: number;
    humidity_percent: number;
    wind_speed_kmh: number;
    wind_deg: number;
    wind_direction: string;
    dryness_index: number;
    description?: string;
    fetched_at: string;
    location_label?: string;
  };
  reading_location?: { x: number; y: number; label: string; lat: number; lon: number };
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
  callStatus: 'idle' | 'calling' | 'success' | 'error';
  callError: string | null;
  handleEmergencyCall: () => Promise<void>;
  resetCallStatus: () => void;
  callLogs: CallLogEntry[];
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
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'success' | 'error'>('idle');
  const [callError, setCallError] = useState<string | null>(null);
  const [callLogs, setCallLogs] = useState<CallLogEntry[]>([]);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setUploadFile = useCallback((file: File | null) => {
    setUploadFileState(file);
    if (file) setUploadResult(null);
  }, []);

  useEffect(() => {
    const poll = async () => {
      try {
        const [monRes, histRes, callLogRes] = await Promise.all([
          fetch('/api/monitor'),
          fetch('/api/history'),
          fetch('/api/call-log'),
        ]);
        setData(await monRes.json());
        setHistory(await histRes.json());
        const logs = await callLogRes.json();
        if (Array.isArray(logs)) setCallLogs([...logs].reverse());
      } catch {
        /* keep previous state */
      }
      setClock(new Date().toLocaleTimeString());
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  // Poll conversation until done/failed after a successful emergency call
  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    const conversationId = typeof window !== 'undefined' ? sessionStorage.getItem('pyros_pending_conversation_id') : null;
    const startedAt = typeof window !== 'undefined' ? sessionStorage.getItem('pyros_call_started_at') : null;
    if (!conversationId || !startedAt) return;

    const pollConversation = async () => {
      try {
        const res = await fetch(`/api/conversation?conversation_id=${encodeURIComponent(conversationId)}`);
        const details = await res.json();
        const status = details.status as string;
        if (status !== 'done' && status !== 'failed') return;

        sessionStorage.removeItem('pyros_pending_conversation_id');
        sessionStorage.removeItem('pyros_call_started_at');
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }

        const entry: CallLogEntry = {
          conversation_id: conversationId,
          started_at: startedAt,
          completed_at: new Date().toISOString(),
          status: status === 'done' ? 'done' : 'failed',
          duration_seconds: typeof details.duration_seconds === 'number' ? details.duration_seconds : undefined,
          transcript: Array.isArray(details.transcript) ? details.transcript : undefined,
          error: typeof details.error === 'string' ? details.error : undefined,
        };
        await fetch('/api/call-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
        setCallLogs((prev) => [entry, ...prev]);
      } catch {
        /* retry on next tick */
      }
    };

    pollConversation();
    pollIntervalRef.current = setInterval(pollConversation, 5000);
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [callStatus]);

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

  const handleEmergencyCall = useCallback(async () => {
    if (callStatus === 'calling') return;
    setCallStatus('calling');
    setCallError(null);
    try {
      const source = data ?? uploadResult;
      const res = await fetch('/api/emergency-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          risk_level: source?.risk_level ?? 'unknown',
          confidence: source?.confidence ?? 0,
          gases_detected: source?.gases_detected ?? [],
          indicators: source?.indicators ?? [],
          drafted_message: data?.drafted_message ?? '',
        }),
      });
      const json = await res.json();
      if (json.success && json.conversation_id) {
        const startedAt = new Date().toISOString();
        try {
          sessionStorage.setItem('pyros_pending_conversation_id', json.conversation_id);
          sessionStorage.setItem('pyros_call_started_at', startedAt);
        } catch {
          /* ignore */
        }
        setCallStatus('success');
      } else if (json.success) {
        setCallStatus('success');
      } else {
        setCallStatus('error');
        setCallError(json.error ?? 'Call failed');
      }
    } catch {
      setCallStatus('error');
      setCallError('Network error. Please try again.');
    }
  }, [callStatus, data, uploadResult]);

  const resetCallStatus = useCallback(() => {
    setCallStatus('idle');
    setCallError(null);
  }, []);

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
    callStatus,
    callError,
    handleEmergencyCall,
    resetCallStatus,
    callLogs,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
