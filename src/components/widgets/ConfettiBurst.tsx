import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfettiBurstProps {
  /** Flip this to a new truthy value (e.g. Date.now()) each time you want a burst to fire */
  triggerKey: number;
}

const COLORS = ['#FF5C00', '#FFB199', '#FFFFFF', '#FF8A3D', '#FFD9C2'];
const PARTICLE_COUNT = 22;

/**
 * Fixed, full-screen confetti burst centered on screen.
 * Fires once whenever `triggerKey` changes to a new non-zero value.
 * Purely decorative and non-interactive (pointer-events: none).
 */
export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ triggerKey }) => {
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.4;
      const distance = 90 + Math.random() * 110;
      return {
        id: `${triggerKey}-${i}`,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 40,
        rotate: Math.random() * 360,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 6,
        isCircle: Math.random() > 0.5
      };
    });
  }, [triggerKey]);

  if (!triggerKey) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
      <AnimatePresence>
        <React.Fragment key={triggerKey}>
          {particles.map(p => (
            <motion.span
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: 1, rotate: p.rotate }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: p.isCircle ? '9999px' : '2px'
              }}
            />
          ))}
        </React.Fragment>
      </AnimatePresence>
    </div>
  );
};
