import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, AppNotification } from '../types';
import {
  MapPin,
  Map as MapIcon,
  Layers,
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Trash2,
  Radio,
  Download
} from 'lucide-react';
import {
  AnimatedBell,
  AnimatedPlus,
  AnimatedSearch,
  AnimatedFlame,
  AnimatedCalendar,
  AnimatedShieldCheck
} from './icons/AnimatedIcons';
import { AnimatedVybeLogo } from './icons/AnimatedVybeLogo';
import { AnimatedNumberTicker } from './widgets/AnimateUIWidgets';
import { VybeWordmark } from './widgets/VybeWordmark';

interface NavbarProps {
  currentUser: User;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeView: 'home' | 'map' | 'my-activities' | 'communities' | 'profile';
  onNavigate: (view: 'home' | 'map' | 'my-activities' | 'communities' | 'profile') => void;
  onOpenCreate: () => void;
  onOpenLocationPrivacy: () => void;
  joinedCount?: number;
  todayCount?: number;
  onOpenSchedule?: () => void;
  notifications?: AppNotification[];
  onOpenPenaltyAlert?: (notification: AppNotification) => void;
  onMarkNotificationsRead?: () => void;
  onTestPenaltyAlert?: () => void;
  onOpenAuthModal?: () => void;
  authEmail?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  searchQuery,
  onSearchChange,
  activeView,
  onNavigate,
  onOpenCreate,
  onOpenLocationPrivacy,
  joinedCount = 0,
  todayCount = 0,
  onOpenSchedule,
  notifications = [],
  onOpenPenaltyAlert,
  onMarkNotificationsRead,
  onTestPenaltyAlert,
  onOpenAuthModal,
  authEmail
}) => {
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const karmaScore = currentUser.reliabilityScore ?? 100;

  const navItems = [
    { id: 'home' as const, label: 'DISCOVER', icon: null },
    { id: 'map' as const, label: 'LIVE MAP', icon: MapIcon },
    { id: 'my-activities' as const, label: 'SQUADS', icon: null },
    { id: 'communities' as const, label: 'GUILDS', icon: Layers }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08090E]/95 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-3">
        {/* Logo & Cyberpunk Deck Brand */}
        <motion.div
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          onClick={() => onNavigate('home')}
        >
          <AnimatedVybeLogo size="sm" />
          <VybeWordmark size="sm" />
        </motion.div>

        {/* Cyberpunk Telemetry Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4 items-center relative font-mono group">
          <div className="absolute left-3 pointer-events-none">
            <AnimatedSearch className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#FF5C00] transition-colors" size={16} />
          </div>
          <input
            id="nav-search-input"
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="// SEARCH SQUADS & GAMES..."
            className="w-full bg-[#11121B] border border-white/10 rounded-lg py-1.5 pl-9 pr-12 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#FF5C00]/60 focus:ring-1 focus:ring-[#FF5C00]/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 text-[10px] font-bold text-slate-400 hover:text-white cursor-pointer"
            >
              ESC
            </button>
          )}
        </div>

        {/* Navigation Deck, Schedule & Actions */}
        <div className="flex items-center gap-2">
          {/* Desktop Nav Links with Cyber Active Highlight */}
          <nav className="hidden md:flex items-center gap-1 bg-[#101119] p-1 rounded-xl border border-white/10 font-mono">
            {navItems.map(item => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`desktop-nav-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`relative px-3 py-1 rounded-lg text-[11px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive ? 'text-black font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="desktopNavActiveIndicator"
                      className="absolute inset-0 bg-[#FF5C00] rounded-lg shadow-[0_0_12px_rgba(255,92,0,0.35)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1">
                    {Icon && <Icon className="w-3 h-3" />}
                    <span>{item.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Daily Schedule & Joined Activities Counter with Animated Ticker */}
          <motion.button
            id="nav-daily-schedule-pill"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (onOpenSchedule) onOpenSchedule();
              else onNavigate('my-activities');
            }}
            title={todayCount > 0 ? `${todayCount} activities today` : `${joinedCount} activities joined`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border ${
              todayCount > 0
                ? 'bg-[#FF5C00]/15 text-[#FF5C00] border-[#FF5C00]/40 shadow-[0_0_12px_rgba(255,92,0,0.2)]'
                : joinedCount > 0
                ? 'bg-[#11121A] text-slate-200 hover:text-white border-white/10 hover:border-white/20'
                : 'hidden sm:flex bg-[#11121A] text-slate-400 hover:text-slate-200 border-white/5'
            }`}
          >
            {todayCount > 0 ? (
              <>
                <AnimatedFlame className="w-3.5 h-3.5 text-[#FF5C00]" size={15} />
                <AnimatedNumberTicker value={todayCount} className="font-black text-white" />
                <span className="hidden sm:inline">TODAY</span>
              </>
            ) : (
              <>
                <AnimatedCalendar className="w-3.5 h-3.5 text-[#FF5C00]" size={15} />
                <AnimatedNumberTicker value={joinedCount} className="font-black text-white" />
                <span className="hidden sm:inline">LINKED</span>
              </>
            )}
          </motion.button>

          {/* Location Privacy Pill */}
          <motion.button
            id="nav-location-pill"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenLocationPrivacy}
            title="Location Privacy Settings"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#11121A] hover:bg-[#181924] border border-white/10 text-xs font-mono text-slate-300 transition cursor-pointer group"
          >
            <MapPin className="w-3.5 h-3.5 text-[#FF5C00]" />
            <span className="font-bold text-slate-200 hidden sm:inline">{currentUser.city}</span>
            <AnimatedShieldCheck className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 ml-0.5" size={13} />
          </motion.button>

          {/* Host Activity Button (Desktop) with Animated Plus */}
          <motion.button
            id="nav-create-activity-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenCreate}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-mono font-black uppercase tracking-wider shadow-[0_0_15px_rgba(255,92,0,0.3)] transition cursor-pointer group"
          >
            <AnimatedPlus className="w-3.5 h-3.5 stroke-[3]" size={15} />
            <span>HOST</span>
          </motion.button>

          {/* Notification Bell & Fair-Play Alert Center with Animated Bell */}
          <div className="relative">
            <motion.button
              id="nav-notification-bell-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              title={unreadCount > 0 ? `${unreadCount} unread alerts` : 'Fair-Play & Activity Notifications'}
              className={`relative p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                unreadCount > 0
                  ? 'bg-red-500/15 border-red-500/40 text-red-400 hover:bg-red-500/25'
                  : 'bg-[#11121A] hover:bg-[#181924] border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <AnimatedBell
                className={`w-4 h-4 ${unreadCount > 0 ? 'text-red-400' : 'text-slate-300'}`}
                size={17}
                isHovered={showNotificationsDropdown || unreadCount > 0}
              />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-black text-[9px] font-mono font-black flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                  {unreadCount}
                </span>
              )}
            </motion.button>

            {/* Notifications Popover Menu */}
            <AnimatePresence>
              {showNotificationsDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0E0F16] border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col cyber-bracket"
                >
                  {/* Top Notification Header */}
                  <div className="p-3 bg-[#13141E] border-b border-white/10 flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-[#FF5C00]" />
                      <span className="text-xs font-black uppercase text-white tracking-wider">
                        TELEMETRY // ALERTS
                      </span>
                    </div>

                    {unreadCount > 0 && onMarkNotificationsRead && (
                      <button
                        onClick={onMarkNotificationsRead}
                        className="text-[10px] font-bold text-slate-400 hover:text-white cursor-pointer"
                      >
                        CLEAR_ALL
                      </button>
                    )}
                  </div>

                  {/* Karma Overview Strip */}
                  <div className="px-3 py-2 bg-[#090A10] border-b border-white/5 flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">KARMA:</span>
                      <span className={`font-black ${karmaScore >= 80 ? 'text-emerald-400' : karmaScore >= 65 ? 'text-amber-400' : 'text-red-400'}`}>
                        {karmaScore}/100
                      </span>
                    </div>

                    {onTestPenaltyAlert && (
                      <button
                        onClick={() => {
                          setShowNotificationsDropdown(false);
                          onTestPenaltyAlert();
                        }}
                        className="px-2 py-0.5 rounded bg-red-500/15 hover:bg-red-500/25 text-red-300 text-[10px] font-bold border border-red-500/30 transition cursor-pointer"
                        title="Simulate a penalty notification alert"
                      >
                        SIM_ALERT
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center space-y-1.5">
                        <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto opacity-70" />
                        <p className="text-xs font-bold text-slate-200">System Clear</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          No infractions or telemetry alerts.
                        </p>
                      </div>
                    ) : (
                      notifications.map(notif => {
                        const isPenalty = notif.type === 'penalty';
                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              if (isPenalty && onOpenPenaltyAlert) {
                                setShowNotificationsDropdown(false);
                                onOpenPenaltyAlert(notif);
                              }
                            }}
                            className={`p-3 transition flex items-start gap-2.5 cursor-pointer ${
                              !notif.isRead
                                ? 'bg-red-500/5 hover:bg-red-500/10'
                                : 'hover:bg-white/5'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                              isPenalty ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#FF5C00]/20 text-[#FF5C00]'
                            }`}>
                              {isPenalty ? <ShieldAlert className="w-3.5 h-3.5" /> : <AnimatedBell className="w-3.5 h-3.5" size={14} />}
                            </div>

                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-xs font-bold truncate ${isPenalty ? 'text-red-300' : 'text-white'}`}>
                                  {notif.title}
                                </span>
                                <span className="text-[9px] font-mono text-slate-500 flex-shrink-0">
                                  {notif.timestamp}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-2 bg-[#090A10] border-t border-white/10 text-center">
                    <button
                      onClick={() => {
                        setShowNotificationsDropdown(false);
                        onNavigate('profile');
                      }}
                      className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono font-bold transition cursor-pointer"
                    >
                      OPEN USER PROFILE // LOG
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Sign In / Re-auth trigger if unauthenticated or on demand */}
          {!authEmail && onOpenAuthModal && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenAuthModal}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#FF5C00] hover:text-[#ff7a29] border border-white/10 text-xs font-mono font-bold tracking-wider transition cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#FF5C00]" />
              <span>SIGN IN</span>
            </motion.button>
          )}

          {/* Download VYBEE.zip Source Code */}
          <a
            id="nav-download-zip-btn"
            href="/VYBEE.zip"
            download="VYBEE.zip"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#11121A] hover:bg-[#181924] border border-white/10 hover:border-[#FF5C00]/40 text-xs font-mono font-bold text-slate-200 transition group"
            title="Download VYBEE.zip (Complete Source Code)"
          >
            <Download className="w-3.5 h-3.5 text-[#FF5C00] group-hover:scale-110 transition-transform" />
            <span className="hidden xl:inline">VYBEE.zip</span>
          </a>

          {/* User Profile Avatar */}
          <motion.button
            id="nav-profile-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('profile')}
            className={`relative p-0.5 rounded-lg border transition cursor-pointer ${
              activeView === 'profile'
                ? 'border-[#FF5C00] shadow-[0_0_10px_rgba(255,92,0,0.5)]'
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <img
              src={currentUser.profilePhoto}
              alt={currentUser.displayName}
              className="w-6 h-6 rounded-md object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.button>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-2.5 font-mono">
        <div className="relative w-full">
          <div className="absolute left-3 top-2.5 pointer-events-none">
            <AnimatedSearch size={13} className="text-slate-500" />
          </div>
          <input
            id="mobile-search-input"
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="// SEARCH SQUADS..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#11121B] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#FF5C00]/50"
          />
        </div>
      </div>
    </header>
  );
};
