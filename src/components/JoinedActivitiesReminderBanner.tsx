import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, User } from '../types';
import { getCategoryMeta } from '../data/categories';
import { novaStore } from '../services/store';
import {
  calculateActivityCountdown,
  CountdownResult,
  getGoogleCalendarUrl,
  downloadActivityIcs,
  getSavedReminders,
  saveActivityReminder
} from '../utils/countdown';
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  MessageSquare,
  CheckCircle2,
  CheckCircle,
  ExternalLink,
  Download,
  Sparkles
} from 'lucide-react';
import {
  AnimatedClock,
  AnimatedBell,
  AnimatedCheckCircle,
  AnimatedCompass,
  AnimatedArrowRight,
  AnimatedCalendar
} from './icons/AnimatedIcons';
import { AnimatedNumberTicker } from './widgets/AnimateUIWidgets';

interface JoinedActivitiesReminderBannerProps {
  joinedActivities: Activity[];
  currentUser: User;
  onSelectActivity: (activity: Activity) => void;
  onOpenChat: (activity: Activity) => void;
  onOpenRemindersModal: () => void;
  onOpenScheduleModal?: () => void;
  onExploreMore?: () => void;
  onActivityEnded?: (activity: Activity) => void;
}

export const JoinedActivitiesReminderBanner: React.FC<JoinedActivitiesReminderBannerProps> = ({
  joinedActivities,
  currentUser,
  onSelectActivity,
  onOpenChat,
  onOpenRemindersModal,
  onOpenScheduleModal,
  onExploreMore,
  onActivityEnded
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nowTick, setNowTick] = useState(Date.now());
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);
  const [showReminderOptions, setShowReminderOptions] = useState(false);
  const [reminderSavedNotice, setReminderSavedNotice] = useState<string | null>(null);
  const [poppingOutId, setPoppingOutId] = useState<string | null>(null);
  const [nextActivityNotice, setNextActivityNotice] = useState<string | null>(null);

  // Live 1-second countdown interval
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter only upcoming / ongoing activities and sort by soonest
  const activeUpcoming = joinedActivities
    .filter(a => a.status === 'upcoming' || a.status === 'ongoing')
    .sort((a, b) => {
      const cdA = calculateActivityCountdown(a);
      const cdB = calculateActivityCountdown(b);
      return cdA.totalSeconds - cdB.totalSeconds;
    });

  // Ensure index is within safe range
  const safeIndex = Math.min(currentIndex, Math.max(0, activeUpcoming.length - 1));
  const currentActivity = activeUpcoming[safeIndex] || activeUpcoming[0];

  // Auto-completion detection when countdown ends
  const autoEndedProcessedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (currentActivity && !poppingOutId) {
      const cd = calculateActivityCountdown(currentActivity);
      if (cd.isPast && !autoEndedProcessedRef.current.has(currentActivity.id)) {
        autoEndedProcessedRef.current.add(currentActivity.id);
        handleConcludeAndPopOut(currentActivity);
      }
    }
  }, [nowTick, currentActivity?.id, poppingOutId]);

  const handleConcludeAndPopOut = (activity: Activity) => {
    if (poppingOutId === activity.id) return;

    setPoppingOutId(activity.id);

    const remainingOther = activeUpcoming.filter(a => a.id !== activity.id);
    const nextActivity = remainingOther.length > 0
      ? (remainingOther[safeIndex] || remainingOther[0])
      : null;

    if (nextActivity) {
      setNextActivityNotice(`🎉 Completed "${activity.title}"! Next up: "${nextActivity.title}"`);
    } else {
      setNextActivityNotice(`🎉 Completed "${activity.title}"! All upcoming attendance finished.`);
    }

    // Complete in store after animation
    setTimeout(() => {
      novaStore.completeActivity(activity.id);
      if (onActivityEnded) {
        onActivityEnded(activity);
      }
      setPoppingOutId(null);

      // Advance index
      setCurrentIndex(prev => {
        if (remainingOther.length === 0) return 0;
        return Math.min(prev, remainingOther.length - 1);
      });

      setTimeout(() => {
        setNextActivityNotice(null);
      }, 4000);
    }, 600);
  };

  // If no upcoming activities are left
  if (activeUpcoming.length === 0) {
    return (
      <motion.div
        id="joined-activities-empty-banner"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#181926] via-[#14151E] to-[#101117] border border-emerald-500/25 p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5 text-left">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white font-display">
                All Attendance Caught Up!
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Pristine Record
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              All joined squad activities for now are concluded. Discover new pickup games and sessions!
            </p>
          </div>
        </div>

        {onExploreMore && (
          <button
            onClick={onExploreMore}
            className="group flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-black uppercase tracking-wider transition shadow-[0_0_15px_rgba(255,92,0,0.25)] shrink-0 cursor-pointer"
          >
            <AnimatedCompass className="w-4 h-4 text-black" size={16} />
            <span>Find New Squads</span>
          </button>
        )}
      </motion.div>
    );
  }

  const todayCount = activeUpcoming.filter(a => (a.date || '').trim().toLowerCase() === 'today').length;
  const meta = getCategoryMeta(currentActivity.category);
  const countdown: CountdownResult = calculateActivityCountdown(currentActivity);

  const savedReminders = getSavedReminders();
  const currentReminder = savedReminders[currentActivity.id];
  const isReminderSet = currentReminder?.enabled ?? true;

  const handleToggleReminder = (leadMinutes: number) => {
    saveActivityReminder({
      activityId: currentActivity.id,
      leadMinutes,
      enabled: true
    });
    setReminderSavedNotice(`Reminder set for ${leadMinutes >= 60 ? `${leadMinutes / 60}h` : `${leadMinutes}m`} before!`);
    setShowReminderOptions(false);
    setTimeout(() => setReminderSavedNotice(null), 3000);
  };

  const isHost = currentActivity.creatorId === currentUser.id;
  const isPoppingOut = poppingOutId === currentActivity.id;

  // Next activity preview
  const nextInLine = activeUpcoming.length > 1
    ? activeUpcoming[(safeIndex + 1) % activeUpcoming.length]
    : null;

  return (
    <motion.div
      id="joined-activities-reminder-banner"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1A1828] via-[#14151D] to-[#101116] border border-[#FF5C00]/30 shadow-[0_4px_30px_rgba(255,92,0,0.12)] p-4 sm:p-5"
    >
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-[#FF5C00]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar of Banner */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#FF5C00] text-black font-black shadow-[0_0_12px_rgba(255,92,0,0.3)]">
            <AnimatedClock className="w-4 h-4 text-black" size={17} isHovered={true} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Upcoming Attendance
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF5C00]/15 text-[#FF5C00] border border-[#FF5C00]/30 flex items-center gap-1 font-mono">
                <AnimatedNumberTicker value={activeUpcoming.length} />
                <span>Joined</span>
              </span>
              {todayCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF5C00] text-black animate-pulse flex items-center gap-1 font-mono">
                  <span>🔥</span>
                  <AnimatedNumberTicker value={todayCount} />
                  <span>Today</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Carousel / Navigation Controls */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {activeUpcoming.length > 1 && (
            <div className="flex items-center gap-1 bg-[#101117] p-1 rounded-xl border border-white/10 text-xs">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : activeUpcoming.length - 1))}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                title="Previous Activity"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </motion.button>
              <span className="text-[10px] font-bold text-slate-300 px-1">
                {safeIndex + 1}/{activeUpcoming.length}
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentIndex(prev => (prev < activeUpcoming.length - 1 ? prev + 1 : 0))}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                title="Next Activity"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          )}

          {onOpenScheduleModal && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenScheduleModal}
              className="flex items-center gap-1.5 text-[11px] font-bold text-[#FF5C00] hover:text-white bg-[#FF5C00]/15 hover:bg-[#FF5C00]/25 px-3 py-1.5 rounded-xl border border-[#FF5C00]/30 transition cursor-pointer group"
            >
              <AnimatedCalendar className="w-3.5 h-3.5 text-[#FF5C00] group-hover:scale-110 transition-transform" size={14} />
              <span>Day Planner</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenRemindersModal}
            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 hover:text-white bg-[#171820] hover:bg-[#20212B] px-3 py-1.5 rounded-xl border border-white/10 transition cursor-pointer group"
          >
            <AnimatedBell className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF5C00] transition-colors" size={14} />
            <span className="hidden sm:inline">Reminders</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content Layout with Pop-out and Switch Animations */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentActivity.id}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={
              isPoppingOut
                ? {
                    scale: [1, 1.06, 0.7],
                    opacity: [1, 1, 0],
                    y: [0, -8, -35],
                    rotate: [0, 1, -3],
                    filter: 'blur(2px)'
                  }
                : { opacity: 1, scale: 1, y: 0, rotate: 0, filter: 'blur(0px)' }
            }
            exit={{ opacity: 0, scale: 0.75, y: -30, filter: 'blur(3px)' }}
            transition={{ duration: isPoppingOut ? 0.6 : 0.25, ease: 'easeInOut' }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center relative"
          >
            {/* Pop-out overlay feedback notice */}
            {isPoppingOut && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 text-center border-2 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.35)]"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center mb-2 shadow-lg animate-bounce">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="text-base font-black text-white">Activity Concluded!</h4>
                <p className="text-xs text-emerald-400 font-bold mt-0.5">
                  +5 Attendance Karma Earned · Popping out and showing next activity...
                </p>
              </motion.div>
            )}

            {/* Left Section: Activity Details */}
            <div className="lg:col-span-7 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#FF5C00]/15 text-[#FF5C00] border border-[#FF5C00]/30">
                  <span>{meta.emoji}</span>
                  <span>{currentActivity.category}</span>
                </span>

                {isHost && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Host
                  </span>
                )}

                <span className="text-xs text-slate-300">
                  📅 {currentActivity.date} at <strong className="text-white">{currentActivity.startTime}</strong> ({currentActivity.durationHours}h)
                </span>
              </div>

              <h3
                onClick={() => onSelectActivity(currentActivity)}
                className="text-base sm:text-lg font-bold text-white hover:text-[#FF5C00] transition cursor-pointer line-clamp-1"
              >
                {currentActivity.title}
              </h3>

              <div className="flex items-center gap-2 text-xs text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-[#FF5C00] shrink-0" />
                <span className="truncate">{currentActivity.locationName}</span>
              </div>
            </div>

            {/* Right Section: Digital Countdown Ticker Display */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
              <div className="w-full sm:w-auto bg-[#0E0F14] border border-[#FF5C00]/25 rounded-2xl p-3 sm:px-5 sm:py-2.5 flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5C00] mb-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FF5C00]" />
                  <span>{countdown.isOngoing ? '🔥 Squad is Live' : '⏳ Time Remaining'}</span>
                </span>

                {/* Neon Ticker */}
                <div className="font-mono text-xl sm:text-2xl font-black tracking-wider text-white flex items-baseline gap-1">
                  <span className="text-[#FF5C00]">{countdown.compactTicker}</span>
                </div>

                {/* Formatted readable subtitle */}
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {countdown.isOngoing
                    ? 'Happening right now!'
                    : `${countdown.formattedReadable} until start`}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Squad Chat Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onOpenChat(currentActivity)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171820] hover:bg-[#20212B] text-slate-200 text-xs font-bold border border-white/10 transition cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#FF5C00]" />
            <span>Squad Chat</span>
          </motion.button>

          {/* Dedicated End & Pop Out Action Button */}
          <motion.button
            id="banner-end-popout-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            disabled={isPoppingOut}
            onClick={() => handleConcludeAndPopOut(currentActivity)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-white text-xs font-bold border border-emerald-500/30 transition cursor-pointer"
            title="Conclude activity and pop out to reveal next attendance"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isHost ? 'End & Pop Out' : 'Finish & Pop Out'}</span>
          </motion.button>

          {/* Quick Reminder Toggle */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowReminderOptions(!showReminderOptions)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                isReminderSet
                  ? 'bg-[#FF5C00]/15 text-[#FF5C00] border-[#FF5C00]/40'
                  : 'bg-[#171820] text-slate-300 border-white/10'
              }`}
            >
              <AnimatedBell className="w-3.5 h-3.5" size={14} />
              <span>{isReminderSet ? 'Reminder Set' : 'Set Reminder'}</span>
            </motion.button>

            {/* Reminder Dropdown Menu */}
            <AnimatePresence>
              {showReminderOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="absolute left-0 bottom-full mb-2 w-48 bg-[#161722] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 space-y-1"
                >
                  <div className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">
                    Notify Me Before:
                  </div>
                  {[
                    { mins: 15, label: '15 minutes before' },
                    { mins: 60, label: '1 hour before' },
                    { mins: 180, label: '3 hours before' },
                    { mins: 1440, label: '1 day before' }
                  ].map(opt => (
                    <button
                      key={opt.mins}
                      onClick={() => handleToggleReminder(opt.mins)}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-slate-200 hover:bg-[#FF5C00] hover:text-black font-semibold transition cursor-pointer flex items-center justify-between"
                    >
                      <span>{opt.label}</span>
                      {currentReminder?.leadMinutes === opt.mins && (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Calendar Export Menu */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCalendarMenu(!showCalendarMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171820] hover:bg-[#20212B] text-slate-200 text-xs font-bold border border-white/10 transition cursor-pointer"
            >
              <AnimatedCalendar className="w-3.5 h-3.5 text-cyan-400" size={14} />
              <span>Add to Calendar</span>
            </motion.button>

            <AnimatePresence>
              {showCalendarMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="absolute left-0 bottom-full mb-2 w-52 bg-[#161722] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 space-y-1"
                >
                  <a
                    href={getGoogleCalendarUrl(currentActivity)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowCalendarMenu(false)}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-slate-200 hover:bg-[#FF5C00] hover:text-black font-semibold transition flex items-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Google Calendar</span>
                  </a>
                  <button
                    onClick={() => {
                      downloadActivityIcs(currentActivity);
                      setShowCalendarMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-slate-200 hover:bg-[#FF5C00] hover:text-black font-semibold transition flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Apple / iCal (.ics)</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* View Details CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectActivity(currentActivity)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(255,92,0,0.25)] transition cursor-pointer"
        >
          <span>Activity Info</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </motion.button>
      </div>

      {/* Next activity in line indicator */}
      {nextInLine && (
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] uppercase font-black text-[#FF5C00] tracking-wider shrink-0">
              Next in queue:
            </span>
            <span className="font-bold text-slate-200 truncate">
              {nextInLine.title}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold shrink-0">
              ({nextInLine.date} at {nextInLine.startTime})
            </span>
          </div>

          <button
            onClick={() => setCurrentIndex((safeIndex + 1) % activeUpcoming.length)}
            className="text-[11px] font-bold text-[#FF5C00] hover:text-white flex items-center gap-0.5 shrink-0 transition cursor-pointer"
          >
            <span>Switch to this</span>
            <AnimatedArrowRight className="w-3 h-3 text-[#FF5C00]" size={12} />
          </button>
        </div>
      )}

      {/* Pop-out notification toast / pill */}
      <AnimatePresence>
        {nextActivityNotice && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 5 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            className="mt-2.5 p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 truncate">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{nextActivityNotice}</span>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-400 shrink-0">
              +5 Karma
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminder confirmation notification pill */}
      <AnimatePresence>
        {reminderSavedNotice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2.5 p-2 bg-[#FF5C00]/20 border border-[#FF5C00]/40 rounded-xl text-xs text-[#FF5C00] font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{reminderSavedNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
