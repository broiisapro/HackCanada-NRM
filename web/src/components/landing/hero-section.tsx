"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { HeroAnimatedHeadline } from "@/components/ui/hero-animated-headline";
import { HeroFireVisual } from "@/components/landing/hero-fire-visual";
import { HeroPyrosTitle } from "@/components/landing/hero-pyros-title";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  visible: (noMotion: boolean) => ({
    opacity: 1,
    transition: noMotion
      ? { duration: 0.4 }
      : {
          staggerChildren: 0.12,
          delayChildren: 0.1,
        },
  }),
};

const child = (noMotion: boolean) => ({
  hidden: noMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: noMotion ? 0.2 : 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
});

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const noMotion = !!prefersReducedMotion;
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.3]);

  return (
    <motion.section
      ref={sectionRef}
      className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] w-full px-4 text-center overflow-hidden"
      variants={container}
      initial="hidden"
      animate="visible"
      custom={noMotion}
    >
      <HeroFireVisual />
      <motion.div
        className="relative z-10 flex flex-col items-center"
        style={noMotion ? undefined : { y, opacity }}
      >
      <motion.div variants={child(noMotion)} className="w-full flex flex-col items-center">
        <HeroPyrosTitle />
        <HeroAnimatedHeadline
          as="h2"
          text="Detect wildfires before they spread"
          className="text-4xl md:text-6xl lg:text-7xl mb-6"
          byWord
        />
      </motion.div>
      <motion.p
        variants={child(noMotion)}
        className="text-muted-foreground text-lg md:text-2xl max-w-2xl mb-12"
      >
        Advanced forest fire detection through spectral imaging and heat mapping.
      </motion.p>
      <motion.div variants={child(noMotion)}>
        <Link href="/upload">
          <ShimmerButton
            className="text-xl shadow-2xl"
            background="rgba(159, 18, 57, 1)"
          >
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg z-10">
              Go to Dashboard
            </span>
          </ShimmerButton>
        </Link>
      </motion.div>
      </motion.div>
    </motion.section>
  );
}
