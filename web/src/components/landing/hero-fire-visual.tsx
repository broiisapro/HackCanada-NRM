"use client";

import { useReducedMotion } from "framer-motion";

export function HeroFireVisual() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={`pointer-events-none absolute inset-0 flex items-center justify-center ${!prefersReducedMotion ? "hero-heat-pulse" : ""}`}
      aria-hidden
    >
      <div
        className="w-full max-w-2xl h-48 rounded-full blur-3xl opacity-[0.45]"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(234, 88, 12, 0.4) 0%, rgba(220, 38, 38, 0.25) 30%, rgba(185, 28, 28, 0.12) 50%, transparent 70%)",
        }}
      />
    </div>
  );
}
