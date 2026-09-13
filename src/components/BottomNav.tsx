import React from 'react';
import { motion } from 'motion/react';
import { User } from '../types';
import {
  AnimatedCompass,
  AnimatedPlus,
  AnimatedCalendar,
  AnimatedMapPin,
  AnimatedUser
} from './icons/AnimatedIcons';

interface BottomNavProps {
  activeView: 'home' | 'map' | 'my-activities' | 'communities' | 'profile';
  onNavigate: (view: 'home' | 'map' | 'my-activities' | 'communities' | 'profile') => void;
  onOpenCreate: () => void;
  currentUser: User;
  myActivitiesCount: number;
  todayCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  onNavigate,
  onOpenCreate,
  currentUser,
  myActivitiesCount,
  todayCount = 0
}) => {
  return (
    <div
      id="bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D0E12]/95 backdrop-blur-2xl border-t border-white/10 px-4 py-2"
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* 1. Home / Discover */}
        <motion.button
          id="tab-home"
          whileTap={{ scale: 0.85 }}
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            activeView === 'home' ? 'text-[#FF5C00]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AnimatedCompass size={20} isHovered={activeView === 'home'} />
          <span className="text-[10px] font-bold tracking-tight">Discover</span>
        </motion.button>

        {/* 2. Map */}
        <motion.button
          id="tab-map"
          whileTap={{ scale: 0.85 }}
          onClick={() => onNavigate('map')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            activeView === 'map' ? 'text-[#FF5C00]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AnimatedMapPin size={20} isHovered={activeView === 'map'} />
          <span className="text-[10px] font-bold tracking-tight">Live Map</span>
        </motion.button>

        {/* 3. Center Create Action (Prominent glowing orange button) */}
        <div className="relative -top-5">
          <motion.button
            id="tab-create-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpenCreate}
            className="w-13 h-13 bg-[#FF5C00] rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(255,92,0,0.45)] border-4 border-[#0D0E12] text-black transition-transform cursor-pointer"
          >
            <AnimatedPlus size={24} className="stroke-[3.5]" />
          </motion.button>
        </div>

        {/* 4. My Activities / Schedule */}
        <motion.button
          id="tab-my-activities"
          whileTap={{ scale: 0.85 }}
          onClick={() => onNavigate('my-activities')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors relative cursor-pointer ${
            activeView === 'my-activities'
              ? 'text-[#FF5C00]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AnimatedCalendar size={20} isHovered={activeView === 'my-activities'} />
          <span className="text-[10px] font-bold tracking-tight">
            {todayCount > 0 ? `${todayCount} Today` : 'Activities'}
          </span>
          {todayCount > 0 ? (
            <span className="absolute -top-1 right-0 px-1.5 py-0.2 bg-[#FF5C00] text-black text-[9px] font-black rounded-full shadow-[0_0_8px_#FF5C00] animate-pulse">
              {todayCount}
            </span>
          ) : myActivitiesCount > 0 ? (
            <span className="absolute top-0 right-1 w-2 h-2 bg-[#FF5C00] rounded-full shadow-[0_0_8px_#FF5C00]" />
          ) : null}
        </motion.button>

        {/* 5. Profile */}
        <motion.button
          id="tab-profile"
          whileTap={{ scale: 0.85 }}
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
            activeView === 'profile'
              ? 'text-[#FF5C00]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AnimatedUser size={20} isHovered={activeView === 'profile'} />
          <span className="text-[10px] font-bold tracking-tight">Profile</span>
        </motion.button>
      </div>
    </div>
  );
};
