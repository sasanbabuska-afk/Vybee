import React from 'react';
import { motion } from 'motion/react';

interface AnimatedBackgroundProps {
  reducedMotion?: boolean;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ reducedMotion = false }) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#06070B]">
      {/* Deep dark radial vignettes */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,92,0,0.12),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_120%,rgba(255,92,0,0.06),rgba(0,0,0,0.95))]" />

      {/* Subtle glowing ambient energy orbs */}
      {!reducedMotion && (
        <>
          <motion.div
            className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[#FF5C00]/10 blur-[120px]"
            animate={{
              x: [0, 40, -20, 0],
              y: [0, -30, 20, 0],
              scale: [1, 1.15, 0.95, 1],
              opacity: [0.35, 0.6, 0.4, 0.35]
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[#FF5C00]/10 blur-[130px]"
            animate={{
              x: [0, -35, 25, 0],
              y: [0, 30, -25, 0],
              scale: [1, 0.9, 1.1, 1],
              opacity: [0.3, 0.55, 0.35, 0.3]
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full bg-[#FF5C00]/8 blur-[150px]"
            animate={{
              scale: [0.95, 1.1, 0.95],
              opacity: [0.2, 0.45, 0.2]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </>
      )}

      {/* High-definition faint grid */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Subtle fine noise overlay texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Soft radial vignette frame */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(6,7,11,0.85)_100%)] pointer-events-none" />
    </div>
  );
};
