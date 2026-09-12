import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedBackground } from './AnimatedBackground';
import { ActivityNodes } from './ActivityNodes';
import { CursorGlow } from './CursorGlow';
import { VYBEIntro } from './VYBEIntro';
import { AuthCard } from './AuthCard';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { X, Sparkles, RotateCcw } from 'lucide-react';

interface CinematicAuthExperienceProps {
  onSuccess: () => void;
  onClose?: () => void;
  initialMode?: 'signin' | 'signup';
  forceIntro?: boolean;
}

export const CinematicAuthExperience: React.FC<CinematicAuthExperienceProps> = ({
  onSuccess,
  onClose,
  initialMode = 'signin',
  forceIntro = false
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [isExiting, setIsExiting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check session cache for intro animation
  const [hasSeenIntro, setHasSeenIntro] = useState(() => {
    if (forceIntro) return false;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem('vybe_intro_seen') === 'true';
    }
    return false;
  });

  const [introPhase, setIntroPhase] = useState<'dark' | 'points' | 'connecting' | 'converged' | 'ready'>(
    hasSeenIntro ? 'ready' : 'dark'
  );

  // Viewport & accessibility detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Intro progression if not already seen
  useEffect(() => {
    if (hasSeenIntro || reducedMotion) {
      setIntroPhase('ready');
      return;
    }

    const t1 = setTimeout(() => setIntroPhase('points'), 300);
    const t2 = setTimeout(() => setIntroPhase('connecting'), 900);
    const t3 = setTimeout(() => setIntroPhase('converged'), 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [hasSeenIntro, reducedMotion]);

  const handleIntroComplete = () => {
    setIntroPhase('ready');
    setHasSeenIntro(true);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('vybe_intro_seen', 'true');
    }
  };

  const handleAuthSuccess = () => {
    setIsExiting(true);
    setTimeout(() => {
      onSuccess();
    }, 700);
  };

  const handleReplayIntro = () => {
    setHasSeenIntro(false);
    setIntroPhase('dark');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-[#06070B] overflow-x-hidden overflow-y-auto select-none min-h-screen">
      {/* Background Ambience */}
      <AnimatedBackground reducedMotion={reducedMotion} />

      {/* Dynamic Social & Activity Graph Filaments */}
      <ActivityNodes
        introPhase={introPhase}
        isConverging={introPhase === 'converged'}
        reducedMotion={reducedMotion}
        isMobile={isMobile}
      />

      {/* Desktop Smooth Cursor Halo */}
      {!isMobile && !reducedMotion && <CursorGlow reducedMotion={reducedMotion} />}

      {/* Intro Sequencer Overlay */}
      <AnimatePresence>
        {!hasSeenIntro && !reducedMotion && introPhase !== 'ready' && (
          <VYBEIntro
            onIntroComplete={handleIntroComplete}
            reducedMotion={reducedMotion}
            skipStored={hasSeenIntro}
          />
        )}
      </AnimatePresence>

      {/* Top Controls: Dismiss / Replay */}
      <div className="fixed top-5 inset-x-6 flex items-center justify-between z-30 pointer-events-auto">
        <div className="flex items-center gap-2">
          {hasSeenIntro && (
            <button
              type="button"
              onClick={handleReplayIntro}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
            >
              <RotateCcw className="w-3 h-3 text-[#FF5C00]" />
              <span className="hidden sm:inline">REPLAY INTRO</span>
            </button>
          )}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition cursor-pointer backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Authentication Flow */}
      <AnimatePresence mode="wait">
        {(introPhase === 'ready' || hasSeenIntro || reducedMotion) && !isExiting && (
          <motion.div
            key="auth-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full my-auto flex items-center justify-center py-6"
          >
            <AuthCard reducedMotion={reducedMotion}>
              <AnimatePresence mode="wait">
                {mode === 'signin' ? (
                  <motion.div
                    key="signin-view"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LoginForm
                      onSuccess={handleAuthSuccess}
                      onSwitchToSignup={() => setMode('signup')}
                      onExploreAsGuest={onClose ? onClose : handleAuthSuccess}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup-view"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SignupForm
                      onSuccess={handleAuthSuccess}
                      onSwitchToSignin={() => setMode('signin')}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </AuthCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Transition Out Energy Aura */}
      <AnimatePresence>
        {isExiting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 3], opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className="w-64 h-64 rounded-full bg-[#FF5C00] blur-3xl"
            />
            <p className="text-sm font-mono text-[#FF5C00] tracking-widest uppercase mt-4">
              ENTERING VYBE NETWORK...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
