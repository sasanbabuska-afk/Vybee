import React, { useState } from 'react';
import { motion } from 'motion/react';

interface VybeWordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showEqualizer?: boolean;
}

export const VybeWordmark: React.FC<VybeWordmarkProps> = ({
  size = 'md',
  className = '',
  showEqualizer = true
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const letters = ['V', 'Y', 'B', 'E'];

  const sizeStyles = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-3xl sm:text-5xl'
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`inline-flex items-center gap-2 cursor-pointer select-none group ${className}`}
    >
      {/* Kinetic Animated Letters */}
      <div className={`flex items-center font-black uppercase font-display tracking-tight text-white ${sizeStyles[size]}`}>
        {letters.map((char, index) => (
          <motion.span
            key={index}
            className="inline-block transition-colors group-hover:text-[#FF5C00]"
            animate={
              isHovered
                ? {
                    y: [0, -4, 0],
                    scale: [1, 1.08, 1],
                    color: ['#FFFFFF', '#FF5C00', '#FFFFFF']
                  }
                : { y: 0, scale: 1 }
            }
            transition={{
              duration: 0.45,
              delay: index * 0.06,
              repeat: isHovered ? Infinity : 0,
              repeatDelay: 0.8
            }}
          >
            {char}
          </motion.span>
        ))}
      </div>

      {/* Mini Kinetic Equalizer Visualizer Bars */}
      {showEqualizer && (
        <div className="flex items-end gap-0.5 h-3 px-1 py-0.5 rounded bg-black/40 border border-white/10">
          {[0.4, 1.0, 0.6, 0.9].map((bar, i) => (
            <motion.div
              key={i}
              className="w-0.5 rounded-full bg-[#FF5C00]"
              animate={
                isHovered
                  ? {
                      height: ['20%', `${bar * 100}%`, '30%'],
                      opacity: [0.6, 1, 0.7]
                    }
                  : {
                      height: [`${bar * 40}%`, `${bar * 90}%`, `${bar * 40}%`],
                      opacity: [0.5, 0.9, 0.5]
                    }
              }
              transition={{
                duration: 0.5 + i * 0.1,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      )}

      {/* Cyber Tag */}
      <span className="text-[9px] font-mono font-bold uppercase text-[#FF5C00] tracking-widest hidden sm:inline">
        [FREQ_V4]
      </span>
    </div>
  );
};
