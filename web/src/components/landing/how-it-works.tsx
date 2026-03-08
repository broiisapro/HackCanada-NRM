"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Upload, ScanSearch, Map, ArrowRight } from "lucide-react";

const steps = [
  {
    step: "Step 1",
    icon: Upload,
    title: "Upload Spectral Image",
    description:
      "Capture or upload aerial and ground-level imagery from at-risk areas. Our system accepts JPEG, PNG, and WebP formats.",
  },
  {
    step: "Step 2",
    icon: ScanSearch,
    title: "AI Spectral Analysis",
    description:
      "Gemini AI classifies flammable gas spectra and combustion byproducts from emission line patterns, identifying threats instantly.",
  },
  {
    step: "Step 3",
    icon: Map,
    title: "Alert & Heat Map",
    description:
      "Get real-time risk assessments, predictive heat maps, and AI-drafted alerts for first responders when threats are detected.",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();
  const noMotion = !!prefersReducedMotion;

  return (
    <section
      id="how-it-works"
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
            3-Steps Workflow
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
          How Pyros Works
        </motion.h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
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
                          delay: i * 0.15,
                          ease: [0.16, 1, 0.3, 1],
                        },
                      }
                }
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[var(--red-600)]/5 blur-3xl" />
                </div>

                <div className="relative z-10">
                  <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--red-500)]">
                    {step.step}
                  </span>

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--red-900)]/30 bg-[var(--red-950)]/50 text-[var(--red-500)] transition-all duration-300 group-hover:border-[var(--red-800)]/50 group-hover:bg-[var(--red-950)] group-hover:shadow-[0_0_20px_rgba(220,38,38,0.15)]">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3
                    className="mb-3 text-xl font-bold text-[var(--text-primary)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {step.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-12 flex justify-center"
          initial={noMotion ? false : { opacity: 0, y: 20 }}
          animate={
            noMotion
              ? { opacity: 1 }
              : { opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }
          }
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <a
            href="/upload"
            className="group inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-transparent px-6 py-3 text-sm font-medium text-[var(--text-secondary)] transition-all duration-300 hover:border-[var(--red-800)] hover:text-[var(--red-400)] hover:bg-[var(--red-950)]/30"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
