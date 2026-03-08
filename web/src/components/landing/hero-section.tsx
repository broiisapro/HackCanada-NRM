"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { SparklesCore } from "@/components/ui/sparkles";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const container = {
  hidden: { opacity: 0 },
  visible: (noMotion: boolean) => ({
    opacity: 1,
    transition: noMotion
      ? { duration: 0.4 }
      : { staggerChildren: 0.1, delayChildren: 0.2 },
  }),
};

const child = (noMotion: boolean) => ({
  hidden: noMotion ? { opacity: 0 } : { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: noMotion ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
});

const HERO_STATS = [
  { value: "Real-time", label: "Detection" },
  { value: "AI-Powered", label: "Analysis" },
  { value: "< 30s", label: "Response Time" },
] as const;

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const noMotion = !!prefersReducedMotion;

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-[120px] opacity-[0.15] bg-[radial-gradient(ellipse,rgba(220,38,38,0.4),rgba(185,28,28,0.2),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-base)] to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1]">
        <SparklesCore
          id="hero-particles"
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={50}
          className="h-full w-full"
          particleColor="#dc2626"
          speed={0.3}
        />
      </div>

      <motion.div
        className="relative z-10 flex max-w-4xl flex-col items-center text-center"
        variants={container}
        initial="hidden"
        animate="visible"
        custom={noMotion}
      >
        <motion.div variants={child(noMotion)} className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--red-900)]/50 bg-[var(--red-950)]/50 px-4 py-1.5 text-xs font-medium text-[var(--red-400)] backdrop-blur-sm">
            <Flame className="h-3.5 w-3.5" />
            AI-Powered Wildfire Detection
          </span>
        </motion.div>

        <motion.h1
          variants={child(noMotion)}
          className="mb-6 text-5xl font-black leading-[1.1] tracking-tight text-[var(--text-primary)] sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Detect Wildfires{" "}
          <span className="bg-gradient-to-r from-[var(--red-400)] via-[var(--red-500)] to-[var(--red-700)] bg-clip-text text-transparent">
            Before They Spread
          </span>
        </motion.h1>

        <motion.p
          variants={child(noMotion)}
          className="mb-10 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl"
        >
          Advanced spectral imaging and AI analysis to identify fire risks in
          real-time, protecting forests and saving lives.
        </motion.p>

        <motion.div
          variants={child(noMotion)}
          className="flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link href="/upload">
            <ShimmerButton
              className="text-base shadow-2xl"
              background="rgba(220, 38, 38, 1)"
              shimmerColor="rgba(255,255,255,0.2)"
            >
              <span className="z-10 flex items-center gap-2 px-2 text-sm font-semibold text-white lg:text-base">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </span>
            </ShimmerButton>
          </Link>
          <a
            href="#how-it-works"
            className="rounded-full border border-[var(--border-default)] bg-transparent px-6 py-3 text-sm font-medium text-[var(--text-secondary)] transition-all duration-300 hover:border-[var(--red-900)] hover:text-[var(--text-primary)] hover:bg-[var(--red-950)]/30"
          >
            Learn How It Works
          </a>
        </motion.div>

        <motion.div
          variants={child(noMotion)}
          className="mt-16 flex items-center gap-8 md:gap-12"
        >
          {HERO_STATS.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="text-lg font-bold text-[var(--red-500)] md:text-xl">
                {stat.value}
              </span>
              <span className="mt-1 text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
