"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const stack = [
  {
    name: "Spectral Vision",
    description: "AI-powered spectral image analysis using Gemini 2.5 Flash for gas identification.",
    tech: "Python, google-generativeai, watchdog",
  },
  {
    name: "Detection Core",
    description: "Real-time dashboard with live analytics, charts, and monitoring interface.",
    tech: "Next.js 16, React 19, Tailwind CSS, Recharts",
  },
  {
    name: "Alert Pipeline",
    description: "AI-generated first responder alerts with actionable intelligence.",
    tech: "Anthropic Claude API, ElevenLabs",
  },
  {
    name: "Hardware Layer",
    description: "Raspberry Pi camera module + ESP32 IMU sensor for field deployment.",
    tech: "Python, TensorFlow, Bluetooth Serial",
  },
];

export function TechStackSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();
  const noMotion = !!prefersReducedMotion;

  return (
    <section
      id="tech-stack"
      ref={ref}
      className="relative z-10 w-full px-6 py-24 md:py-32"
    >
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
            Under the Hood
          </span>
        </motion.div>

        <motion.h2
          className="mb-16 text-center text-3xl font-bold text-[var(--text-primary)] md:text-4xl lg:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
          initial={noMotion ? false : { opacity: 0, y: 20 }}
          animate={
            noMotion
              ? { opacity: 1 }
              : { opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }
          }
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Built with Modern Tech
        </motion.h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stack.map((item, i) => (
            <motion.div
              key={item.name}
              className="group relative overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 transition-all duration-300 hover:border-[var(--red-900)]/50 hover:bg-[var(--bg-card-hover)]"
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
              <h3
                className="mb-2 text-base font-bold text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.name}
              </h3>
              <p className="mb-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                {item.description}
              </p>
              <p className="text-xs font-mono text-[var(--red-500)]/80">
                {item.tech}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
