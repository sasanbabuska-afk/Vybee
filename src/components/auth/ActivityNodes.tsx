import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ActivityNodeItem {
  id: string;
  icon: string;
  label: string;
  category: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  orbitRadius: number; // in px
  orbitSpeed: number; // in seconds
  color: string;
  size: number;
}

interface ActivityNodesProps {
  isConverging?: boolean;
  introPhase?: 'dark' | 'points' | 'connecting' | 'converged' | 'ready';
  reducedMotion?: boolean;
  isMobile?: boolean;
}

export const ActivityNodes: React.FC<ActivityNodesProps> = ({
  isConverging = false,
  introPhase = 'ready',
  reducedMotion = false,
  isMobile = false
}) => {
  // Activity icons & community archetypes
  const nodes: ActivityNodeItem[] = useMemo(() => [
    { id: 'gaming', icon: '🎮', label: 'Gaming', category: 'Gaming', x: 18, y: 24, orbitRadius: 28, orbitSpeed: 18, color: '#A855F7', size: 36 },
    { id: 'football', icon: '⚽', label: 'Football', category: 'Sports', x: 82, y: 22, orbitRadius: 32, orbitSpeed: 22, color: '#38BDF8', size: 36 },
    { id: 'basketball', icon: '🏀', label: 'Basketball', category: 'Sports', x: 14, y: 72, orbitRadius: 24, orbitSpeed: 16, color: '#FB923C', size: 36 },
    { id: 'gym', icon: '🏋️', label: 'Fitness', category: 'Fitness', x: 86, y: 68, orbitRadius: 30, orbitSpeed: 20, color: '#F43F5E', size: 36 },
    { id: 'music', icon: '🎵', label: 'Music', category: 'Music', x: 30, y: 15, orbitRadius: 26, orbitSpeed: 19, color: '#EC4899', size: 34 },
    { id: 'chess', icon: '♟️', label: 'Chess', category: 'Mind Games', x: 70, y: 82, orbitRadius: 22, orbitSpeed: 17, color: '#E2E8F0', size: 34 },
    { id: 'art', icon: '🎨', label: 'Creative', category: 'Creative', x: 28, y: 84, orbitRadius: 28, orbitSpeed: 24, color: '#F59E0B', size: 34 },
    { id: 'tech', icon: '💻', label: 'Tech & Code', category: 'Tech', x: 74, y: 16, orbitRadius: 25, orbitSpeed: 21, color: '#10B981', size: 34 }
  ], []);

  // Additional tiny people nodes (represented by subtle glowing dots)
  const peopleNodes = useMemo(() => {
    const count = isMobile ? 8 : 16;
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2 + (i % 2 === 0 ? 0.3 : -0.2);
      const dist = 32 + (i % 4) * 12; // distance from center (approx %)
      const x = 50 + Math.cos(angle) * dist * 0.9;
      const y = 50 + Math.sin(angle) * dist * 0.7;
      return {
        id: `person-${i}`,
        x: Math.max(8, Math.min(92, x)),
        y: Math.max(10, Math.min(90, y)),
        size: 4 + (i % 3) * 2,
        pulseDelay: (i * 0.7) % 3
      };
    });
  }, [isMobile]);

  // Active connection lines that periodically ignite between nodes
  const [activeConnections, setActiveConnections] = useState<[number, number][]>([
    [0, 4],
    [1, 7],
    [2, 6],
    [3, 5]
  ]);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      // Pick random pairs of nodes to dynamically link
      const i1 = Math.floor(Math.random() * nodes.length);
      let i2 = Math.floor(Math.random() * nodes.length);
      if (i1 === i2) i2 = (i1 + 1) % nodes.length;
      
      const i3 = (i1 + 2) % nodes.length;
      const i4 = (i2 + 3) % nodes.length;

      setActiveConnections([
        [i1, i2],
        [i3, i4]
      ]);
    }, 4500);

    return () => clearInterval(interval);
  }, [nodes.length, reducedMotion]);

  const showElements = introPhase !== 'dark';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* SVG Connecting filaments between People & Activities */}
      <svg className="w-full h-full absolute inset-0">
        <defs>
          <linearGradient id="vybeLineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF5C00" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#FF7A29" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="nodeGlow">
            <stop offset="0%" stopColor="#FF5C00" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF5C00" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Dynamic connection lines */}
        {showElements && !reducedMotion && activeConnections.map(([srcIdx, dstIdx], idx) => {
          const src = nodes[srcIdx];
          const dst = nodes[dstIdx];
          if (!src || !dst) return null;

          return (
            <g key={`conn-${idx}`}>
              <motion.line
                x1={`${src.x}%`}
                y1={`${src.y}%`}
                x2={`${dst.x}%`}
                y2={`${dst.y}%`}
                stroke="url(#vybeLineGradient)"
                strokeWidth={1}
                strokeDasharray="4 6"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: [0, 1, 1],
                  opacity: [0, 0.45, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: idx * 1.5
                }}
              />
            </g>
          );
        })}

        {/* Faint converging lines toward center during intro sequence */}
        {introPhase === 'connecting' && !reducedMotion && nodes.map((node, i) => (
          <motion.line
            key={`converge-${i}`}
            x1={`${node.x}%`}
            y1={`${node.y}%`}
            x2="50%"
            y2="50%"
            stroke="#FF5C00"
            strokeWidth={1.5}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1], opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.2, delay: i * 0.1, ease: 'easeOut' }}
          />
        ))}
      </svg>

      {/* Tiny People Node Dots */}
      <AnimatePresence>
        {showElements && peopleNodes.map((p) => {
          const targetX = isConverging ? 50 : p.x;
          const targetY = isConverging ? 50 : p.y;

          return (
            <motion.div
              key={p.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                backgroundColor: '#FF5C00'
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={
                isConverging
                  ? {
                      left: '50%',
                      top: '50%',
                      opacity: [0.6, 1, 0],
                      scale: [1, 1.8, 0]
                    }
                  : {
                      opacity: [0.2, 0.65, 0.2],
                      scale: [1, 1.3, 1],
                      boxShadow: [
                        '0 0 6px rgba(255,92,0,0.3)',
                        '0 0 14px rgba(255,92,0,0.7)',
                        '0 0 6px rgba(255,92,0,0.3)'
                      ]
                    }
              }
              transition={
                isConverging
                  ? { duration: 1.1, ease: 'easeInOut' }
                  : {
                      duration: 3 + p.pulseDelay,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: p.pulseDelay
                    }
              }
            />
          );
        })}
      </AnimatePresence>

      {/* Activity Category Node Badges */}
      <AnimatePresence>
        {showElements && nodes.map((node, i) => {
          const isHiddenOnMobile = isMobile && i > 4;
          if (isHiddenOnMobile) return null;

          return (
            <motion.div
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`
              }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={
                isConverging
                  ? {
                      left: '50%',
                      top: '50%',
                      scale: [1, 1.2, 0],
                      opacity: [0.8, 1, 0]
                    }
                  : {
                      opacity: [0.45, 0.85, 0.45],
                      scale: [0.96, 1.04, 0.96],
                      y: [0, -10, 0]
                    }
              }
              transition={
                isConverging
                  ? { duration: 1.3, ease: [0.16, 1, 0.3, 1] }
                  : {
                      duration: node.orbitSpeed,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.3
                    }
              }
            >
              {/* Glowing activity icon container */}
              <div 
                className="relative flex items-center justify-center rounded-2xl bg-[#0F101A]/85 border border-white/10 shadow-lg backdrop-blur-md px-2.5 py-2 transition-transform"
                style={{
                  boxShadow: `0 0 20px ${node.color}20`
                }}
              >
                <span className="text-lg leading-none filter drop-shadow-sm select-none">
                  {node.icon}
                </span>

                {/* Subtle activity label on desktop */}
                {!isMobile && (
                  <span className="text-[11px] font-mono font-bold text-slate-300 ml-1.5 opacity-80 tracking-wide">
                    {node.label}
                  </span>
                )}

                {/* Subtle pulse aura */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
                  style={{
                    backgroundColor: node.color
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
