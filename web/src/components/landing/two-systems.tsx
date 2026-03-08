"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ScanSearch, Map, ArrowRight } from "lucide-react";
import Link from "next/link";

export function TwoSystems() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();
  const noMotion = !!prefersReducedMotion;

  return (
    <section ref={ref} className="relative z-10 w-full px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-4 text-center"
          initial={noMotion ? false : { opacity: 0, y: 20 }}
          animate={
            noMotion
              ? { opacity: 1 }
              : { opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }
          }
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--red-500)]">
            How Pyros Works
          </span>
        </motion.div>

        <motion.h2
          className="mb-6 text-center text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
          initial={noMotion ? false : { opacity: 0, y: 20 }}
          animate={
            noMotion
              ? { opacity: 1 }
              : { opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }
          }
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Two Systems. One Defense.
        </motion.h2>

        <motion.p
          className="mx-auto mb-16 max-w-2xl text-center text-base text-[var(--text-secondary)] md:text-lg"
          initial={noMotion ? false : { opacity: 0, y: 20 }}
          animate={
            noMotion
              ? { opacity: 1 }
              : { opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }
          }
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          Pyros combines spectral analysis with predictive heat mapping, running
          autonomously to detect threats before they become disasters.
        </motion.p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            className="group relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-8 transition-all duration-500 hover:border-[var(--red-900)]/50 md:p-10"
            initial={noMotion ? false : { opacity: 0, x: -30 }}
            animate={
              noMotion
                ? { opacity: 1 }
                : {
                    opacity: isInView ? 1 : 0,
                    x: isInView ? 0 : -30,
                    transition: { duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] },
                  }
            }
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[var(--red-600)]/5 blur-[80px]" />
            </div>

            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--red-950)] text-[var(--red-500)]">
                  <ScanSearch className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                  System 1
                </span>
              </div>

              <h3
                className="mb-4 text-2xl font-bold text-[var(--text-primary)] md:text-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Spectral Analysis Engine
              </h3>

              <p className="mb-8 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
                Our AI analyzes emission line spectra from captured imagery,
                identifying flammable gases like Hydrogen, Carbon, and Sodium.
                Combustion byproducts such as CO and NOx are flagged
                instantly, providing early warning before visible flames appear.
              </p>

              <Link
                href="/upload"
                className="group/btn inline-flex items-center gap-2 text-sm font-medium text-[var(--red-500)] transition-all duration-300 hover:text-[var(--red-400)]"
              >
                Try Analysis
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="group relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-8 transition-all duration-500 hover:border-[var(--red-900)]/50 md:p-10"
            initial={noMotion ? false : { opacity: 0, x: 30 }}
            animate={
              noMotion
                ? { opacity: 1 }
                : {
                    opacity: isInView ? 1 : 0,
                    x: isInView ? 0 : 30,
                    transition: { duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] },
                  }
            }
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[var(--red-600)]/5 blur-[80px]" />
            </div>

            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--red-950)] text-[var(--red-500)]">
                  <Map className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                  System 2
                </span>
              </div>

              <h3
                className="mb-4 text-2xl font-bold text-[var(--text-primary)] md:text-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Heat Map Intelligence
              </h3>

              <p className="mb-8 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
                Predictive risk visualization identifies high-danger zones across
                monitored regions. The heat map updates in real-time as new
                spectral data flows in, giving first responders actionable
                intelligence on where threats are emerging.
              </p>

              <Link
                href="/heatmap"
                className="group/btn inline-flex items-center gap-2 text-sm font-medium text-[var(--red-500)] transition-all duration-300 hover:text-[var(--red-400)]"
              >
                View Heatmap
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
