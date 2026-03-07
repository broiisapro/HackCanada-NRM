"use client"
import React, { useEffect, useRef } from 'react';

interface ConcentricRingsLoaderProps {
  size?: number;
  color?: string;
  text?: string;
  showText?: boolean;
  rings?: number;
}

const ConcentricRingsLoader = ({ 
  size = 120,
  color = '#e11d48', // Default to the newly established Maroon primary color
  text = 'Loading...',
  showText = true,
  rings = 4
}: ConcentricRingsLoaderProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = size;
    canvas.height = size;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let time = 0;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < rings; i++) {
        const baseRadius = (size * 0.1) + i * (size * 0.15);
        const pulse = Math.sin(time * 0.03 - i * 0.5) * (size * 0.05);
        const radius = Math.min(baseRadius + pulse, size / 2 - 2);
        const opacity = 0.2 + Math.sin(time * 0.03 - i * 0.5) * 0.3;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        
        // Convert hex to rgb for opacity injection to avoid edge cases
        ctx.strokeStyle = `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add dots on rings
        const numDots = 8;
        for (let j = 0; j < numDots; j++) {
          const angle = (j / numDots) * Math.PI * 2 + time * 0.02 * (i % 2 ? 1 : -1);
          const dotX = centerX + Math.cos(angle) * radius;
          const dotY = centerY + Math.sin(angle) * radius;
          
          ctx.beginPath();
          ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      }
      
      // Center pulse
      const centerPulse = Math.sin(time * 0.05) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5 * centerPulse, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      
      time++;
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [size, color, rings]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 concentric-rings-loader animate-fade">
      <canvas ref={canvasRef}></canvas>
      {showText && <div className="text-muted-foreground text-sm font-medium tracking-wide loader-text">{text}</div>}
    </div>
  );
};

export default ConcentricRingsLoader;
