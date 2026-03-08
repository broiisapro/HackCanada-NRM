"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();
  const noMotion = !!prefersReducedMotion;

  return (
    <section ref={ref} className="relative z-10 w-full px-6 py-24 md:py-32">
      <motion.div
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[var(--red-900)]/30 bg-gradient-to-br from-[var(--red-950)]/40 via-[var(--bg-card)] to-[var(--bg-card)] p-12 text-center md:p-16"
        initial={noMotion ? false : { opacity: 0, y: 30 }}
        animate={
          noMotion
            ? { opacity: 1 }
            : { opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }
        }
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--red-600)]/8 blur-[100px]" />
          <div className="absolute -bottom-40 -right-20 h-60 w-60 rounded-full bg-[var(--red-600)]/5 blur-[80px]" />
        </div>

        <div className="relative z-10">
          <motion.div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--red-600)]/10 text-[var(--red-500)]"
            animate={noMotion ? {} : { scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Flame className="h-8 w-8" />
          </motion.div>

          <h2
            className="mb-4 text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Protect What Matters.
          </h2>

          <p className="mx-auto mb-8 max-w-xl text-base text-[var(--text-secondary)] md:text-lg">
            Start detecting wildfire threats today. Upload a spectral image and
            see Pyros in action — no setup, no delays.
          </p>

          <Link
            href="/upload"
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--red-600)] px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-[var(--red-500)] hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]"
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
