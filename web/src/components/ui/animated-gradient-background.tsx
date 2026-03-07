"use client"
import { motion } from "framer-motion";
import React, { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface AnimatedGradientBackgroundProps {
   startingGap?: number;
   Breathing?: boolean;
   gradientColors?: string[];
   gradientStops?: number[];
   animationSpeed?: number;
   breathingRange?: number;
   containerStyle?: React.CSSProperties;
   containerClassName?: string;
   topOffset?: number;
}

const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({
   startingGap = 125,
   Breathing = false,
   gradientColors,
   gradientStops = [35, 50, 60, 70, 80, 90, 100],
   animationSpeed = 0.02,
   breathingRange = 5,
   containerStyle = {},
   topOffset = 0,
   containerClassName = "",
}) => {
   const { theme, systemTheme } = useTheme();
   const isLightMode = theme === "light" || (theme === "system" && systemTheme === "light");

   // Default colors based on theme
   const activeGradientColors = gradientColors || (isLightMode ? [
      "#ffffff", // card
      "#ffe4e6", // accent
      "#be123c", // chart-2
      "#e11d48", // primary
      "#f4f4f5", // muted
      "#ffffff", // background
      "#ffffff"  // background
   ] : [
      "#09090b",
      "#27272a",
      "#9f1239",
      "#e11d48",
      "#171717",
      "#09090b",
      "#09090b"
   ]);
   

   if (activeGradientColors.length !== gradientStops.length) {
      throw new Error(
         `GradientColors and GradientStops must have the same length.`
      );
   }

   const containerRef = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
      let animationFrame: number;
      let width = startingGap;
      let directionWidth = 1;

      const animateGradient = () => {
         if (width >= startingGap + breathingRange) directionWidth = -1;
         if (width <= startingGap - breathingRange) directionWidth = 1;

         if (!Breathing) directionWidth = 0;
         width += directionWidth * animationSpeed;

         const gradientStopsString = gradientStops
            .map((stop, index) => `${activeGradientColors[index]} ${stop}%`)
            .join(", ");

         const gradient = `radial-gradient(${width}% ${width+topOffset}% at 50% 20%, ${gradientStopsString})`;

         if (containerRef.current) {
            containerRef.current.style.background = gradient;
         }

         animationFrame = requestAnimationFrame(animateGradient);
      };

      animationFrame = requestAnimationFrame(animateGradient);

      return () => cancelAnimationFrame(animationFrame); // Cleanup animation
   }, [startingGap, Breathing, activeGradientColors, gradientStops, animationSpeed, breathingRange, topOffset]);

   return (
      <motion.div
         key="animated-gradient-background"
         initial={{
            opacity: 0,
            scale: 1.5,
         }}
         animate={{
            opacity: 1,
            scale: 1,
            transition: {
               duration: 2,
               ease: [0.25, 0.1, 0.25, 1], // Cubic bezier easing
             },
         }}
         className={`absolute inset-0 overflow-hidden ${containerClassName}`}
      >
         <div
            ref={containerRef}
            style={containerStyle}
            className="absolute inset-0 transition-transform"
         />
      </motion.div>
   );
};

export default AnimatedGradientBackground;
