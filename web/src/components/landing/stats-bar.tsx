"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const stats = [
  { value: "Spectral", label: "imaging" },
  { value: "AI", label: "analysis" },
  { value: "Heat", label: "mapping" },
];

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const prefersReducedMotion = useReducedMotion();
  const noMotion = !!prefersReducedMotion;

  return (
    <section
      ref={ref}
      className="relative z-10 w-full max-w-4xl mx-auto px-6 py-16"
    >
      <div className="grid grid-cols-3 gap-6 md:gap-12">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="text-center"
            initial={noMotion ? false : { opacity: 0, y: 20 }}
            animate={
              noMotion
                ? { opacity: 1 }
                : {
                    opacity: isInView ? 1 : 0,
                    y: isInView ? 0 : 20,
                    transition: {
                      duration: 0.4,
                      delay: i * 0.08,
                      ease: [0.16, 1, 0.3, 1] as const,
                    },
                  }
            }
          >
            <div className="text-2xl md:text-3xl font-bold text-primary">
              {stat.value}
            </div>
            <div className="text-sm md:text-base text-muted-foreground uppercase tracking-widest mt-1">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
