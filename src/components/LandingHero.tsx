import React from 'react';
import { motion } from 'motion/react';
import { ActivityCategory } from '../types';
import {
  AnimatedCompass,
  AnimatedPlus,
  AnimatedZap,
  AnimatedShieldCheck,
  AnimatedUsers,
  AnimatedFlame,
  AnimatedArrowRight,
  AnimatedSparkles
} from './icons/AnimatedIcons';
import { AnimatedVybeLogo } from './icons/AnimatedVybeLogo';
import { ShimmerBadge, AnimatedNumberTicker } from './widgets/AnimateUIWidgets';

interface LandingHeroProps {
  onExploreClick: () => void;
  onCreateClick: () => void;
  onSelectCategory: (category: ActivityCategory) => void;
  activeCount: number;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onExploreClick,
  onCreateClick,
  onSelectCategory,
  activeCount
}) => {
  const quickCategories: { cat: ActivityCategory; label: string; icon: string }[] = [
    { cat: 'Football', label: 'Football', icon: '⚽' },
    { cat: 'Gaming', label: 'FC25 & Gaming', icon: '🎮' },
    { cat: 'Basketball', label: 'Basketball', icon: '🏀' },
    { cat: 'Gym', label: 'Gym & Fitness', icon: '🏋️‍♂️' },
    { cat: 'Tennis', label: 'Tennis', icon: '🎾' },
    { cat: 'Running', label: 'Running', icon: '🏃‍♂️' },
    { cat: 'Chess', label: 'Chess & Cafe', icon: '♟️' },
    { cat: 'Programming', label: 'Code & Tech', icon: '💻' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-3xl bg-[#12131C]/90 border border-white/10 p-6 sm:p-12 text-center backdrop-blur-md shadow-2xl mb-8 flex flex-col items-center justify-center"
    >
      {/* Animated Shimmer Status Pill */}
      <div className="mb-5">
        <ShimmerBadge variant="orange">
          <AnimatedSparkles size={13} className="text-[#FF5C00]" />
          <span>Live Radar · </span>
          <AnimatedNumberTicker value={activeCount} suffix=" activities nearby" />
        </ShimmerBadge>
      </div>

      {/* Centered Animated VYBE Logo Emblem */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-5"
      >
        <AnimatedVybeLogo size="lg" />
      </motion.div>

      {/* Main Display Headline */}
      <div className="max-w-2xl space-y-3 mb-7">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight font-display">
          Find your people.{' '}
          <span className="text-[#FF5C00]">
            Do your thing.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl mx-auto">
          Pickup sports, gym spotters, gaming sessions, and creative meetups in real life near you.
        </p>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 mb-8">
        <motion.button
          id="hero-explore-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onExploreClick}
          className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-sm font-bold shadow-lg shadow-[#FF5C00]/25 transition cursor-pointer"
        >
          <AnimatedCompass className="w-4 h-4 text-black" size={17} />
          <span>Explore Activities</span>
          <AnimatedArrowRight className="w-4 h-4 text-black ml-0.5" size={15} />
        </motion.button>

        <motion.button
          id="hero-create-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateClick}
          className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1A1C26] hover:bg-[#222533] text-white border border-white/10 text-sm font-semibold transition cursor-pointer hover:border-white/20"
        >
          <AnimatedPlus className="w-4 h-4 text-[#FF5C00]" size={16} />
          <span>Host an Activity</span>
        </motion.button>
      </div>

      {/* Feature Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-2xl w-full pt-6 border-t border-white/8 text-center">
        <div className="group flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-default">
          <AnimatedZap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" size={18} />
          <span className="text-xs font-medium text-slate-300">Instant Drop-in</span>
        </div>

        <div className="group flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-default">
          <AnimatedShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" size={18} />
          <span className="text-xs font-medium text-slate-300">Reliability Karma</span>
        </div>

        <div className="group flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-default">
          <AnimatedUsers className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" size={18} />
          <span className="text-xs font-medium text-slate-300">Verified Locals</span>
        </div>

        <div className="group flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-default">
          <AnimatedFlame className="w-4 h-4 text-[#FF5C00] group-hover:scale-110 transition-transform" size={18} />
          <div className="text-xs font-medium text-slate-300 flex items-center gap-1">
            <AnimatedNumberTicker value={activeCount} suffix=" Live Activities" />
          </div>
        </div>
      </div>

      {/* Quick Launch Categories */}
      <div className="w-full max-w-2xl pt-6 mt-5 border-t border-white/5 space-y-2.5">
        <span className="text-xs font-semibold text-slate-400 block">
          Quick Browse
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {quickCategories.map((item) => (
            <motion.button
              key={item.cat}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelectCategory(item.cat)}
              className="px-3.5 py-1.5 rounded-xl bg-[#181924] hover:bg-[#202230] border border-white/8 hover:border-[#FF5C00]/40 text-xs font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
