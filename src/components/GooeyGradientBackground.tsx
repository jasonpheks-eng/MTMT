import React, { useEffect, useRef } from 'react';
import { useBoutique } from '../context/BoutiqueContext';
import './GooeyGradientBackground.css';

interface GooeyGradientBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  sensitivity?: number;
  opacity?: number;
}

export function GooeyGradientBackground({ 
  children, 
  className = '', 
  interactive = true,
  sensitivity = 80,
  opacity = 100
}: GooeyGradientBackgroundProps) {
  const { settings } = useBoutique();
  const interactiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!interactive) return;

    let curX = 0;
    let curY = 0;
    let tgX = 0;
    let tgY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      tgX = event.clientX;
      tgY = event.clientY;
    };

    const animate = () => {
      if (!interactiveRef.current) return;
      
      const factor = 101 - sensitivity;
      curX += (tgX - curX) / factor;
      curY += (tgY - curY) / factor;
      
      interactiveRef.current.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [interactive]);

  const bg1 = settings.gooey_color_1 || '#701932';
  const bg2 = settings.gooey_color_2 || '#240F1B';

  return (
    <div 
      className={`gooey-wrapper w-full h-full relative overflow-hidden ${className}`}
      style={{
        ['--color-bg1' as any]: bg1,
        ['--color-bg2' as any]: bg2,
        ['--speed-factor' as any]: `${(105 - sensitivity) / 25}`,
        ['--opacity' as any]: `${opacity / 100}`,
      }}
    >
      <div className="gradient-bg">
        <svg xmlns="http://www.w3.org/2000/svg" className="hidden">
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
        <div className="gradients-container">
          <div className="g1"></div>
          <div className="g2"></div>
          <div className="g3"></div>
          <div className="g4"></div>
          <div className="g5"></div>
          {interactive && <div ref={interactiveRef} className="interactive"></div>}
        </div>
      </div>
      
      {/* Content Layer */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

export default GooeyGradientBackground;
