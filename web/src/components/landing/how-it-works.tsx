"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Upload, ScanSearch, Map } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Upload,
    title: "Upload Image",
    description: "Capture or upload aerial or ground imagery of at-risk areas.",
  },
  {
    icon: ScanSearch,
    title: "Spectral Analysis",
    description: "AI classifies flammable gas spectra using TensorFlow models.",
  },
  {
    icon: Map,
    title: "Heat Map",
    description: "Predictive risk visualization identifies high-danger zones.",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();
  const noMotion = !!prefersReducedMotion;

  return (
    <section
      ref={ref}
      className="relative z-10 w-full max-w-5xl mx-auto px-6 py-24 md:py-32"
    >
      <motion.h2
        className="text-2xl md:text-3xl font-bold text-center text-foreground mb-16 uppercase tracking-widest"
        initial={noMotion ? false : { opacity: 0, y: 20 }}
        animate={
          noMotion ? { opacity: 1 } : { opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }
        }
        transition={{ duration: 0.5 }}
      >
        How it works
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              className="relative flex flex-col items-center text-center group"
              initial={noMotion ? false : { opacity: 0, y: 30 }}
              animate={
                noMotion
                  ? { opacity: 1 }
                  : {
                      opacity: isInView ? 1 : 0,
                      y: isInView ? 0 : 30,
                      transition: {
                        duration: 0.5,
                        delay: i * 0.12,
                        ease: [0.16, 1, 0.3, 1] as const,
                      },
                    }
              }
            >
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                  "bg-primary/10 text-primary border border-primary/20",
                  "group-hover:bg-primary/20 group-hover:border-primary/40"
                )}
              >
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-[200px]">
                {step.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
