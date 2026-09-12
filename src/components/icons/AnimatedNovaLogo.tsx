import React, { useState } from 'react';
import { motion } from 'motion/react';

interface AnimatedNovaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isHovered?: boolean;
}

export const AnimatedNovaLogo: React.FC<AnimatedNovaLogoProps> = ({
  size = 'md',
  className = '',
  isHovered: externalHovered
}) => {
  const [internalHovered, setInternalHovered] = useState(false);
  const isHovered = externalHovered ?? internalHovered;

  const dimensionMap = {
    sm: { container: 'w-8 h-8 rounded-lg', svg: 20, stroke: 2.75 },
    md: { container: 'w-10 h-10 rounded-xl', svg: 24, stroke: 3 },
    lg: { container: 'w-13 h-13 rounded-2xl', svg: 32, stroke: 3.5 }
  };

  const { container, svg, stroke } = dimensionMap[size];

  // Path coordinates for an aggressive cyberpunk "N"
  // Up stroke (left), diagonal cut across, up stroke (right)
  const nPath = "M 5 21 L 5 4 L 19 20 L 19 3";

  return (
    <motion.div
      onMouseEnter={() => setInternalHovered(true)}
      onMouseLeave={() => setInternalHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative bg-[#FF5C00] flex items-center justify-center shadow-[0_0_20px_rgba(255,92,0,0.45)] border border-[#ff7b30]/60 overflow-hidden cursor-pointer ${container} ${className}`}
    >
      {/* Background cyber grid lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/25 via-transparent to-black/30 pointer-events-none" />

      {/* SVG Path drawing of 'N' */}
      <svg
        width={svg}
        height={svg}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Subtle shadow path underneath */}
        <path
          d={nPath}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Main animated drawing path for 'N' */}
        <motion.path
          d={nPath}
          stroke="#000000"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0.2 }}
          animate={{
            pathLength: 1,
            opacity: 1,
            transition: {
              duration: 0.85,
              ease: [0.16, 1, 0.3, 1]
            }
          }}
          key={isHovered ? 'hovered' : 'idle'}
        />

        {/* Glowing highlight tip following the path */}
        <motion.path
          d={nPath}
          stroke="#FFFFFF"
          strokeWidth={stroke * 0.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, pathOffset: 0 }}
          animate={
            isHovered
              ? {
                  pathLength: [0, 0.35, 0],
                  pathOffset: [0, 0.65, 1],
                  transition: {
                    duration: 0.7,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }
              : {
                  pathLength: [0, 0.25, 0],
                  pathOffset: [0, 0.75, 1],
                  transition: {
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 1.5
                  }
                }
          }
        />

        {/* Top-left node pip */}
        <circle cx="5" cy="4" r="1.5" fill="#000000" />
        {/* Bottom-right node pip */}
        <circle cx="19" cy="20" r="1.5" fill="#000000" />
      </svg>

      {/* Cyber corner glint accent */}
      <motion.div
        className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/60 pointer-events-none"
        animate={isHovered ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.5 }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
    </motion.div>
  );
};
