"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Activity, Shield, Clock, Sliders } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Real-Time Monitoring",
    description:
      "Track spectral data, risk assessments, and detection events as they happen. Monitor multiple zones from a single dashboard.",
  },
  {
    icon: Shield,
    title: "AI-Powered Alerts",
    description:
      "Claude AI drafts first-responder alerts with actionable intelligence when threats are detected. No manual intervention needed.",
  },
  {
    icon: Clock,
    title: "Instant Detection",
    description:
      "Pyros analyzes spectral emissions in under 30 seconds, identifying flammable gases before visible flames appear.",
  },
  {
    icon: Sliders,
    title: "Comprehensive Analytics",
    description:
      "Detailed charts for confidence trends, gas detection frequency, risk levels over time, and historical event logs.",
  },
];

export function FeaturesGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();
  const noMotion = !!prefersReducedMotion;

  return (
    <section
      id="features"
      ref={ref}
      className="relative z-10 w-full px-6 py-24 md:py-32"
    >
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
            Features
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
          Everything You Need to Stay Ahead of Fire
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
          From spectral analysis to emergency response, Pyros gives you the
          tools to detect, analyze, and respond to wildfire threats.
        </motion.p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-8 transition-all duration-500 hover:border-[var(--red-900)]/50 hover:bg-[var(--bg-card-hover)]"
                initial={noMotion ? false : { opacity: 0, y: 30 }}
                animate={
                  noMotion
                    ? { opacity: 1 }
                    : {
                        opacity: isInView ? 1 : 0,
                        y: isInView ? 0 : 30,
                        transition: {
                          duration: 0.5,
                          delay: 0.2 + i * 0.1,
                          ease: [0.16, 1, 0.3, 1],
                        },
                      }
                }
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[var(--red-600)]/5 blur-3xl" />
                </div>

                <div className="relative z-10">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--red-900)]/30 bg-[var(--red-950)]/50 text-[var(--red-500)] transition-all duration-300 group-hover:border-[var(--red-800)]/50 group-hover:bg-[var(--red-950)] group-hover:shadow-[0_0_20px_rgba(220,38,38,0.15)]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3
                    className="mb-3 text-lg font-bold text-[var(--text-primary)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {feature.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
