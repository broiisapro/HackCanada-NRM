'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppProvider, useAppContext } from '../context/app-context';
import {
  IconUpload,
  IconOverview,
  IconChart,
  IconInfo,
  IconRender,
  IconHeatmap,
} from '../components/dashboard-ui';
import { Settings, Flame } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'upload', path: '/upload', label: 'Upload & Analyze', icon: IconUpload },
  { id: 'overview', path: '/overview', label: 'Overview', icon: IconOverview },
  { id: 'analytics', path: '/analytics', label: 'Analytics', icon: IconChart },
  { id: 'heatmap', path: '/heatmap', label: 'Heatmap', icon: IconHeatmap },
  { id: 'render', path: '/render/dashboard', label: 'Render', icon: IconRender },
  { id: 'about', path: '/about', label: 'About', icon: IconInfo },
] as const;

function SidebarContent() {
  const pathname = usePathname();
  const { data, history } = useAppContext();
  const isSettingsActive = pathname === '/settings';

  return (
    <>
      <aside className="flex w-56 shrink-0 flex-col border-r [background:var(--bg-elevated)] [border-color:var(--border-default)]">
        <div className="border-b px-5 py-5 [border-color:var(--border-default)]">
          <Link
            href="/"
            className="press-active flex items-center gap-2.5"
            aria-label="Pyros home"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--red-600)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]"
              aria-hidden
            >
              <Flame className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide [color:var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>Pyros</p>
              <p className="text-[10px] [color:var(--text-muted)]">Fire Detection</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-2 py-3" aria-label="Main navigation">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider [color:var(--text-muted)]">Navigation</p>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path || (item.id === 'render' && pathname.startsWith('/render/dashboard'));
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.path}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                className={`nav-btn press-active mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${
                  isActive
                    ? 'border-l-2 border-[var(--red-500)] bg-[var(--red-900)]/30 pl-[10px] [color:var(--red-400)]'
                    : 'border-l-2 border-transparent [color:var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:[color:var(--text-primary)]'
                }`}
              >
                <Icon />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t px-2 py-3 [border-color:var(--border-default)]">
          <Link
            href="/settings"
            aria-current={isSettingsActive ? 'page' : undefined}
            className={`nav-btn press-active flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
              isSettingsActive
                ? 'border-l-2 border-[var(--red-500)] bg-[var(--red-900)]/30 pl-[10px] [color:var(--red-400)]'
                : 'border-l-2 border-transparent [color:var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:[color:var(--text-primary)]'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </Link>
        </div>

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
