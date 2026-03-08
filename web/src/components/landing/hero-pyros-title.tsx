"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroPyrosTitle() {
  const prefersReducedMotion = useReducedMotion();
  const noMotion = !!prefersReducedMotion;

  return (
    <motion.div
      className="relative mb-4 md:mb-6"
      initial={noMotion ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: noMotion ? 0.3 : 0.8, ease: [0.16, 1, 0.3, 1] as const }}
    >
      <h1
        className="pyros-wordmark text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-black tracking-tighter select-none"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Pyros
      </h1>
    </motion.div>
  );
}
