import React, { useEffect, useRef } from 'react';

interface CursorGlowProps {
  reducedMotion?: boolean;
}

export const CursorGlow: React.FC<CursorGlowProps> = ({ reducedMotion = false }) => {
  const glowRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const currentPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    
    // Check if pointer is fine (mouse, not touch)
    if (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Smooth linear interpolation loop
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const animate = () => {
      currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.08);
      currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.08);

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${currentPos.current.x - 220}px, ${currentPos.current.y - 220}px, 0)`;
      }

      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 w-[440px] h-[440px] rounded-full pointer-events-none z-10 opacity-30 mix-blend-screen transition-opacity duration-500 hidden md:block"
      style={{
        background: 'radial-gradient(circle, rgba(255,92,0,0.18) 0%, rgba(255,120,40,0.06) 40%, rgba(0,0,0,0) 70%)',
        filter: 'blur(35px)',
        willChange: 'transform'
      }}
    />
  );
};
