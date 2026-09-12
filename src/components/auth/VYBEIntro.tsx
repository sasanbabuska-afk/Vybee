import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedVybeLogo } from '../icons/AnimatedVybeLogo';

interface VYBEIntroProps {
  onIntroComplete: () => void;
  reducedMotion?: boolean;
  skipStored?: boolean;
}

export const VYBEIntro: React.FC<VYBEIntroProps> = ({
  onIntroComplete,
  reducedMotion = false,
  skipStored = false
}) => {
  const [phase, setPhase] = useState<'initial' | 'points' | 'converge' | 'logo' | 'complete'>('initial');

  useEffect(() => {
    // If reduced motion or already seen in session, complete immediately
    if (reducedMotion || skipStored) {
      onIntroComplete();
      return;
    }

    // Sequence timeline: total ~2.2s
    const t1 = setTimeout(() => setPhase('points'), 300);
    const t2 = setTimeout(() => setPhase('converge'), 1000);
    const t3 = setTimeout(() => setPhase('logo'), 1600);
    const t4 = setTimeout(() => {
      setPhase('complete');
      onIntroComplete();
    }, 2400);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        setPhase('complete');
        onIntroComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onIntroComplete, reducedMotion, skipStored]);

  if (phase === 'complete') return null;

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#06070B] overflow-hidden select-none"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* Central energy focal point */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Expanding orange shockwave rings */}
        <AnimatePresence>
          {(phase === 'converge' || phase === 'logo') && (
            <>
              <motion.div
                className="absolute w-32 h-32 rounded-full border border-[#FF5C00]/60 pointer-events-none"
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: [0.2, 2.5, 4], opacity: [0.9, 0.4, 0] }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute w-44 h-44 rounded-full border border-[#FF5C00]/30 pointer-events-none"
                initial={{ scale: 0.1, opacity: 0 }}
                animate={{ scale: [0.1, 2, 3.5], opacity: [0.8, 0.3, 0] }}
                transition={{ duration: 1.4, delay: 0.2, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute w-72 h-72 rounded-full bg-[#FF5C00]/25 blur-[60px] pointer-events-none"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.4, 1], opacity: [0, 0.9, 0.5] }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Central Logo Appearance */}
        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ scale: 0.7, opacity: 0, filter: 'blur(10px)' }}
          animate={
            phase === 'logo'
              ? { scale: [0.85, 1.08, 1], opacity: 1, filter: 'blur(0px)' }
              : phase === 'converge'
              ? { scale: 0.9, opacity: 0.4, filter: 'blur(4px)' }
              : { scale: 0.7, opacity: 0 }
          }
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="p-3 rounded-3xl bg-black/60 border border-[#FF5C00]/40 shadow-[0_0_50px_rgba(255,92,0,0.6)] backdrop-blur-xl">
            <AnimatedVybeLogo size="xl" isHovered={phase === 'logo'} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={phase === 'logo' ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-4 text-center"
          >
            <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-white font-display uppercase">
              V Y B E
            </h1>
            <p className="text-xs font-mono text-[#FF5C00] tracking-wider mt-1 opacity-90">
              SYNCHRONIZING NETWORK
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Subtle Skip button in bottom corner */}
      <motion.button
        type="button"
        onClick={() => {
          setPhase('complete');
          onIntroComplete();
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        whileHover={{ opacity: 1 }}
        className="absolute bottom-8 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-mono tracking-wider transition-all cursor-pointer"
      >
        SKIP INTRO [ESC]
      </motion.button>
    </motion.div>
  );
};
