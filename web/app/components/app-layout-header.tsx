'use client';

import { useAppContext } from '../context/app-context';

export function AppLayoutHeader({ title }: { title: string }) {
  const { clock } = useAppContext();
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3.5 backdrop-blur-sm [background:var(--bg-base)]/90 [border-color:var(--border-default)]">
      <h1 className="text-base font-semibold [color:var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
        {title}
      </h1>
      <div className="flex items-center gap-4 text-xs [color:var(--text-muted)]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50 bg-[var(--accent-success)]" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-success)]" />
          </span>
          <span>Live</span>
        </div>
        <span>Polling every 5s</span>
        <span>{clock}</span>
      </div>
    </header>
  );
}
