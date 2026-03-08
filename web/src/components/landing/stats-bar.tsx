"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const stats = [
  { value: "10M+", label: "Acres Monitored" },
  { value: "99.2%", label: "Detection Accuracy" },
  { value: "< 30s", label: "Alert Time" },
];

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const prefersReducedMotion = useReducedMotion();
  const noMotion = !!prefersReducedMotion;

  return (
    <section ref={ref} className="relative z-10 w-full px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
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
            Why Pyros
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
          Wildfires Don&apos;t Wait. Neither Do We.
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
          Climate change is dramatically increasing wildfire frequency.
          Early detection is our most powerful defense.
        </motion.p>

        <div className="grid grid-cols-3 gap-6 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center text-center"
              initial={noMotion ? false : { opacity: 0, y: 20 }}
              animate={
                noMotion
                  ? { opacity: 1 }
                  : {
                      opacity: isInView ? 1 : 0,
                      y: isInView ? 0 : 20,
                      transition: {
                        duration: 0.5,
                        delay: 0.2 + i * 0.1,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }
              }
            >
              <div
                className="text-4xl font-black text-[var(--red-500)] md:text-5xl lg:text-6xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {stat.value}
              </div>
              <div className="mt-2 text-sm font-medium uppercase tracking-widest text-[var(--text-muted)] md:text-base">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="mx-auto mt-12 max-w-xl text-center text-sm text-[var(--text-muted)]"
          initial={noMotion ? false : { opacity: 0 }}
          animate={
            noMotion
              ? { opacity: 1 }
              : { opacity: isInView ? 0.7 : 0 }
          }
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Pyros monitors vast regions in real-time, identifies threats from
          spectral data, and alerts responders before flames become visible.
        </motion.p>
      </div>
    </section>
  );
}
