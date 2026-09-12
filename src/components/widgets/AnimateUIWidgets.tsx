import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// 1. Animate UI Animated Counter / Number Ticker
interface AnimatedNumberTickerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedNumberTicker: React.FC<AnimatedNumberTickerProps> = ({
  value,
  prefix = '',
  suffix = '',
  className = ''
}) => {
  return (
    <div className={`inline-flex items-center overflow-hidden font-mono ${className}`}>
      {prefix && <span>{prefix}</span>}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 14, opacity: 0, filter: 'blur(2px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: -14, opacity: 0, filter: 'blur(2px)' }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
      {suffix && <span>{suffix}</span>}
    </div>
  );
};

// 2. Animate UI Spotlight / Glow Border Card
interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
  id?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(255, 92, 0, 0.15)',
  onClick,
  id
}) => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      id={id}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl bg-[#0F1018]/85 border border-white/10 transition-colors ${className}`}
    >
      {/* Animated Spotlight gradient follows cursor */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 70%)`
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// 3. Animate UI Shimmer / Pulse Badge
interface ShimmerBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'orange' | 'cyan' | 'emerald';
}

export const ShimmerBadge: React.FC<ShimmerBadgeProps> = ({
  children,
  className = '',
  variant = 'orange'
}) => {
  const colors = {
    orange: 'from-[#FF5C00]/20 via-[#FF5C00]/40 to-[#FF5C00]/20 text-[#FF5C00] border-[#FF5C00]/40',
    cyan: 'from-cyan-500/20 via-cyan-500/40 to-cyan-500/20 text-cyan-400 border-cyan-500/40',
    emerald: 'from-emerald-500/20 via-emerald-500/40 to-emerald-500/20 text-emerald-400 border-emerald-500/40'
  };

  return (
    <div
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border overflow-hidden ${colors[variant]} ${className}`}
    >
      <motion.div
        className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        animate={{ x: ['-150%', '250%'] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
      />
      <span className="relative z-10 flex items-center gap-1.5">{children}</span>
    </div>
  );
};
