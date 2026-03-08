"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  visible: (noMotion: boolean) => ({
    opacity: 1,
    transition: noMotion ? { duration: 0.3 } : {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  }),
};

const item = (noMotion: boolean) => ({
  hidden: noMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
});

interface HeroAnimatedHeadlineProps {
  text: string;
  className?: string;
  byWord?: boolean;
  as?: "h1" | "h2";
}

export function HeroAnimatedHeadline({ text, className, byWord = true, as: Tag = "h1" }: HeroAnimatedHeadlineProps) {
  const prefersReducedMotion = useReducedMotion();
  const noMotion = !!prefersReducedMotion;

  const chunks = byWord ? text.split(" ") : text.split("");
  const MotionTag = motion[Tag] as typeof motion.h1;

  return (
    <MotionTag
      className={cn("font-black text-foreground drop-shadow-sm text-balance leading-tight", className)}
      variants={container}
      initial="hidden"
      animate="visible"
      custom={noMotion}
    >
      {chunks.map((chunk, i) => (
        <motion.span
          key={i}
          variants={item(noMotion)}
          className="inline-block"
          transition={{ duration: noMotion ? 0.2 : 0.4, ease: [0.16, 1, 0.3, 1] as const }}
        >
          {chunk}
          {i !== chunks.length - 1 && byWord ? "\u00A0" : null}
        </motion.span>
      ))}
    </MotionTag>
  );
}
