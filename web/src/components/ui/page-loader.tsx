"use client";

import ConcentricRingsLoader from "@/components/ui/loading-animation-1";

const LOADER_SIZE = 160;

/**
 * Full-viewport loading overlay. Use in loading.tsx for consistent,
 * always-centered loading state across all routes (including app layout with sidebar).
 */
export function PageLoader() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen min-w-full bg-background"
      role="status"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center justify-center w-[200px] h-[200px] shrink-0">
        <ConcentricRingsLoader size={LOADER_SIZE} showText={false} />
        <span className="mt-3 text-sm font-medium text-muted-foreground tracking-wide">
          Loading...
        </span>
      </div>
    </div>
  );
}
