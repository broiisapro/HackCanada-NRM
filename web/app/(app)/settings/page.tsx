'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';

const THEME_OPTIONS = [
  { id: 'dark', label: 'Dark', icon: Moon, description: 'Dark background with red accents' },
  { id: 'light', label: 'Light', icon: Sun, description: 'Light background for daytime use' },
  { id: 'system', label: 'System', icon: Monitor, description: 'Follow your system preference' },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold tracking-tight text-[var(--text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Settings
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Customize your dashboard experience
          </p>
        </div>
        <div className="h-48 animate-pulse rounded-xl bg-[var(--bg-card)]" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold tracking-tight text-[var(--text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Customize your dashboard experience
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="stagger-1 rounded-xl border p-6 [background:var(--bg-card)] [border-color:var(--border-default)]">
          <h2 className="mb-1 text-base font-semibold text-[var(--text-primary)]">
            Appearance
          </h2>
          <p className="mb-6 text-sm text-[var(--text-muted)]">
            Choose how the dashboard looks to you
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  className={`press-active flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-all duration-200 ${
                    isActive
                      ? 'border-[var(--red-600)] bg-[var(--red-950)]/40 shadow-[0_0_20px_rgba(220,38,38,0.1)]'
                      : 'border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[var(--red-900)]/50 hover:bg-[var(--bg-card-hover)]'
                  }`}
                  aria-pressed={isActive}
                  aria-label={`${option.label} theme`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-[var(--red-600)] text-white'
                        : 'bg-[var(--border-subtle)] text-[var(--text-muted)]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isActive ? 'text-[var(--red-400)]' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {option.label}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="stagger-2 mt-4 rounded-xl border p-6 [background:var(--bg-card)] [border-color:var(--border-default)]">
          <h2 className="mb-1 text-base font-semibold text-[var(--text-primary)]">
            About Pyros
          </h2>
          <p className="mb-4 text-sm text-[var(--text-muted)]">
            System information
          </p>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-[var(--bg-elevated)] px-4 py-3">
              <span className="text-[var(--text-secondary)]">Version</span>
              <span className="font-mono text-xs text-[var(--text-muted)]">0.1.0</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[var(--bg-elevated)] px-4 py-3">
              <span className="text-[var(--text-secondary)]">Framework</span>
              <span className="font-mono text-xs text-[var(--text-muted)]">Next.js 16</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[var(--bg-elevated)] px-4 py-3">
              <span className="text-[var(--text-secondary)]">AI Engine</span>
              <span className="font-mono text-xs text-[var(--text-muted)]">Gemini 2.5 Flash</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[var(--bg-elevated)] px-4 py-3">
              <span className="text-[var(--text-secondary)]">Built for</span>
              <span className="font-mono text-xs text-[var(--red-500)]/80">HackCanada 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
