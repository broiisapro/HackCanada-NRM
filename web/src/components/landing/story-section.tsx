"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { TextGradientScroll } from "@/components/ui/text-gradient-scroll";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

interface StorySectionProps {
  title: string;
  text: string;
  variant?: "default" | "split" | "quote";
  icon?: React.ReactNode;
}

export function StorySection({
  title,
  text,
  variant = "default",
  icon,
}: StorySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();
  const noMotion = !!prefersReducedMotion;

  const baseAnimation = noMotion
    ? { opacity: 1 }
    : {
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : 32,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
      };

  const cardClass = cn(
    "relative min-h-[30vh] flex flex-col justify-center rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm card-interactive",
    variant === "split" && "md:grid md:grid-cols-2 md:gap-12 md:items-center",
    variant === "quote" && "border-l-4 border-l-primary pl-8",
    "p-8 md:p-12"
  );

  if (variant === "split") {
    return (
      <motion.div
        ref={ref}
        className={cardClass}
        initial={noMotion ? false : { opacity: 0, y: 40 }}
        animate={baseAnimation}
      >
        <GlowingEffect
          spread={40}
          glow
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={2}
        />
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="text-primary opacity-90">{icon}</div>
            )}
            <h2 className="text-primary text-2xl font-bold uppercase tracking-widest">
              {title}
            </h2>
          </div>
          <div className="text-xl md:text-2xl font-medium leading-relaxed text-foreground">
            <TextGradientScroll text={text} />
          </div>
        </div>
        <div
          className="relative z-10 hidden md:flex items-center justify-center p-4"
          aria-hidden
        >
          {/* Mini heat-map grid: spectral/risk visualization */}
          <div className="grid grid-cols-5 grid-rows-5 gap-1 w-36 h-36">
            {Array.from({ length: 25 }, (_, i) => {
              const row = Math.floor(i / 5);
              const col = i % 5;
              const distFromCenter = Math.sqrt(Math.pow(row - 2, 2) + Math.pow(col - 2, 2));
              const intensity = Math.max(0, 1 - distFromCenter / 3.5);
              return (
                <div
                  key={i}
                  className="rounded-sm transition-opacity duration-300"
                  style={{
                    backgroundColor: `rgba(234, 88, 12, ${0.15 + intensity * 0.5})`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "quote") {
    return (
      <motion.div
        ref={ref}
        className={cardClass}
        initial={noMotion ? false : { opacity: 0, y: 40 }}
        animate={baseAnimation}
      >
        <GlowingEffect
          spread={40}
          glow
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={2}
        />
        <h2 className="relative z-10 text-primary text-2xl font-bold mb-4 uppercase tracking-widest">
          {title}
        </h2>
        <div className="relative z-10 text-2xl md:text-4xl font-medium leading-tight text-foreground">
          <TextGradientScroll text={text} />
        </div>
        {icon && (
          <div className="relative z-10 mt-6 text-primary/60">{icon}</div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cardClass}
      initial={noMotion ? false : { opacity: 0, y: 40 }}
      animate={baseAnimation}
    >
      <GlowingEffect
        spread={40}
        glow
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
      />
      {icon && (
        <div className="relative z-10 mb-4 text-primary opacity-90">{icon}</div>
      )}
      <h2 className="relative z-10 text-primary text-2xl font-bold mb-4 uppercase tracking-widest">
        {title}
      </h2>
      <div className="relative z-10 text-3xl md:text-5xl font-medium leading-tight text-foreground">
        <TextGradientScroll text={text} />
      </div>
    </motion.div>
  );
}
