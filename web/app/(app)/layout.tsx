'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppProvider, useAppContext } from '../context/app-context';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  IconUpload,
  IconOverview,
  IconChart,
  IconFlask,
  IconLog,
  IconInfo,
  IconRender,
  IconHeatmap,
} from '../components/dashboard-ui';

const NAV_ITEMS = [
  { id: 'upload', path: '/upload', label: 'Upload & Analyze', icon: IconUpload },
  { id: 'overview', path: '/overview', label: 'Overview', icon: IconOverview },
  { id: 'analytics', path: '/analytics', label: 'Analytics', icon: IconChart },
  { id: 'detections', path: '/detections', label: 'Detections', icon: IconFlask },
  { id: 'logs', path: '/logs', label: 'Event Log', icon: IconLog },
  { id: 'heatmap', path: '/heatmap', label: 'Heatmap', icon: IconHeatmap },
  { id: 'render', path: '/render/dashboard', label: 'Render', icon: IconRender },
  { id: 'about', path: '/about', label: 'About', icon: IconInfo },
] as const;

function SidebarContent() {
  const pathname = usePathname();
  const { data, history, hasAnalyzed } = useAppContext();

  return (
    <>
      <aside className="flex w-56 shrink-0 flex-col border-r [background:var(--bg-elevated)] [border-color:var(--border-default)]">
        <div className="border-b px-5 py-5 flex items-center justify-between gap-2 [border-color:var(--border-default)]">
          <Link
            href="/"
            className="press-active flex items-center gap-2.5"
            aria-label="Pyros home"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg [background:var(--maroon-600)]"
              aria-hidden
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L10 6L8 4L6 6L8 1Z" fill="white" />
                <path d="M8 4L12 10L8 8L4 10L8 4Z" fill="white" opacity="0.8" />
                <path d="M4 10L8 8L12 10L10 14H6L4 10Z" fill="white" opacity="0.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide [color:var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>Pyros</p>
              <p className="text-[10px] [color:var(--text-muted)]">Fire Detection</p>
            </div>
          </Link>
          <ThemeToggle />
        </div>

        <nav className="flex-1 px-2 py-3" aria-label="Main navigation">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider [color:var(--text-muted)]">Navigation</p>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path || (item.id === 'render' && pathname.startsWith('/render/dashboard'));
            const isLocked = item.id !== 'upload' && item.id !== 'render' && item.id !== 'heatmap' && !hasAnalyzed;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={isLocked ? '/upload' : item.path}
                aria-current={isActive ? 'page' : undefined}
                aria-label={isLocked ? `${item.label} (locked)` : item.label}
                title={isLocked ? 'Upload an image to unlock' : undefined}
                className={`nav-btn press-active mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${
                  isLocked
                    ? 'cursor-default opacity-60 [color:var(--text-muted)]'
                    : isActive
                      ? 'border-l-2 border-[var(--maroon-500)] bg-[var(--maroon-900)]/50 pl-[10px] [color:var(--maroon-400)]'
                      : 'border-l-2 border-transparent [color:var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:[color:var(--text-primary)]'
                }`}
              >
                <Icon />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t px-5 py-4 [border-color:var(--border-default)]">
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${data ? 'bg-[var(--accent-success)]' : 'animate-pulse [background:var(--border-default)]'}`}
              aria-hidden
            />
            <span className="text-xs [color:var(--text-muted)]">{data ? 'Connected' : 'Connecting...'}</span>
          </div>
          <p className="text-[10px] [color:var(--text-muted)]">{history.length} readings collected</p>
        </div>
      </aside>
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AppProvider>
      <div className="flex h-screen overflow-hidden">
        <SidebarContent />
        <main className="flex-1 overflow-y-auto">
          <div key={pathname} className="animate-tab">
            {children}
          </div>
        </main>
      </div>
    </AppProvider>
  );
}
