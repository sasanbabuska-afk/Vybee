import React, { useState } from 'react';
import { motion } from 'motion/react';

interface AnimatedVybeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isHovered?: boolean;
}

export const AnimatedVybeLogo: React.FC<AnimatedVybeLogoProps> = ({
  size = 'md',
  className = '',
  isHovered: externalHovered
}) => {
  const [internalHovered, setInternalHovered] = useState(false);
  const isHovered = externalHovered ?? internalHovered;

  const dimensionMap = {
    sm: { container: 'w-8 h-8 rounded-lg', svg: 22, stroke: 2.75 },
    md: { container: 'w-10 h-10 rounded-xl', svg: 26, stroke: 3 },
    lg: { container: 'w-13 h-13 rounded-2xl', svg: 34, stroke: 3.5 },
    xl: { container: 'w-16 h-16 rounded-3xl', svg: 42, stroke: 4 }
  };

  const { container, svg, stroke } = dimensionMap[size];

  // Precision geometric paths for the VYBE "V" + Kinetic Frequency Waveform
  // Outer Chevron "V"
  const vChevronPath = "M 4 4.5 L 12 20.5 L 20 4.5";
  // Inner dynamic frequency / pulse spike
  const frequencyPath = "M 6 7 L 9.5 13 L 12 6.5 L 14.5 14 L 18 7";

  return (
    <motion.div
      onMouseEnter={() => setInternalHovered(true)}
      onMouseLeave={() => setInternalHovered(false)}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className={`relative bg-[#FF5C00] flex items-center justify-center shadow-[0_0_22px_rgba(255,92,0,0.5)] border border-[#ff7b30]/70 overflow-hidden cursor-pointer ${container} ${className}`}
    >
      {/* Background kinetic frequency wave rings */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/30 via-transparent to-black/35 pointer-events-none" />

      {/* Live frequency soundwave bars on background (audio spectrum vibe) */}
      <div className="absolute bottom-1 inset-x-1.5 flex items-end justify-between gap-0.5 opacity-30 pointer-events-none h-2.5">
        {[0.4, 0.9, 0.5, 0.8, 0.3, 0.7, 1.0, 0.6, 0.4].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-black rounded-full"
            animate={
              isHovered
                ? {
                    height: [`${h * 20}%`, `${(1 - h * 0.5) * 90}%`, `${h * 100}%`],
                    opacity: [0.3, 0.8, 0.4]
                  }
                : {
                    height: [`${h * 30}%`, `${h * 75}%`, `${h * 30}%`],
                    opacity: [0.2, 0.5, 0.2]
                  }
            }
            transition={{
              duration: 0.6 + i * 0.08,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* SVG Path drawing of 'V' & Frequency Pulse */}
      <svg
        width={svg}
        height={svg}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Soft shadow base path */}
        <path
          d={vChevronPath}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Main Solid Sharp Cyberpunk "V" */}
        <motion.path
          d={vChevronPath}
          stroke="#000000"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{
            pathLength: 1,
            transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] }
          }}
          key={isHovered ? 'hover-v' : 'idle-v'}
        />

        {/* Inner Kinetic Frequency Pulse Wave inside the "V" */}
        <motion.path
          d={frequencyPath}
          stroke="#000000"
          strokeWidth={stroke * 0.65}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity={0.8}
          initial={{ pathLength: 0 }}
          animate={{
            pathLength: 1,
            transition: { duration: 0.6, delay: 0.15, ease: 'easeOut' }
          }}
          key={isHovered ? 'hover-freq' : 'idle-freq'}
        />

        {/* Tracer Light Bead running along the V path */}
        <motion.path
          d={vChevronPath}
          stroke="#FFFFFF"
          strokeWidth={stroke * 0.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, pathOffset: 0 }}
          animate={
            isHovered
              ? {
                  pathLength: [0, 0.4, 0],
                  pathOffset: [0, 0.6, 1],
                  transition: {
                    duration: 0.6,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }
                }
              : {
                  pathLength: [0, 0.3, 0],
                  pathOffset: [0, 0.7, 1],
                  transition: {
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    repeatDelay: 1.2
                  }
                }
          }
        />

        {/* Apex vertex glowing node */}
        <circle cx="12" cy="20.5" r="1.8" fill="#000000" />
        <circle cx="4" cy="4.5" r="1.4" fill="#000000" />
        <circle cx="20" cy="4.5" r="1.4" fill="#000000" />
      </svg>

      {/* Cyber Corner Glints */}
      <motion.div
        className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/80 pointer-events-none"
        animate={isHovered ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.5 }}
        transition={{ duration: 0.9, repeat: Infinity }}
      />
    </motion.div>
  );
};
