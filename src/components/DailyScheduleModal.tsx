import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, User } from '../types';
import { getCategoryMeta } from '../data/categories';
import {
  calculateUserSchedule,
  DayScheduleGroup,
  UserScheduleSummary
} from '../utils/schedule';
import {
  calculateActivityCountdown,
  getGoogleCalendarUrl,
  downloadActivityIcs
} from '../utils/countdown';
import { calculateDistanceKm, formatApproximateDistance } from '../services/store';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  ExternalLink,
  Download,
  Flame,
  Plus,
  Compass,
  Sparkles
} from 'lucide-react';

interface DailyScheduleModalProps {
  activities: Activity[];
  currentUser: User;
  onClose: () => void;
  onSelectActivity: (activity: Activity) => void;
  onOpenCreate: () => void;
  onOpenExplore: () => void;
  onLeaveActivity?: (activityId: string) => void;
  initialDayFilter?: string; // 'all' | 'Today' | 'Tomorrow' | etc.
}

export const DailyScheduleModal: React.FC<DailyScheduleModalProps> = ({
  activities,
  currentUser,
  onClose,
  onSelectActivity,
  onOpenCreate,
  onOpenExplore,
  onLeaveActivity,
  initialDayFilter = 'all'
}) => {
  const [selectedDay, setSelectedDay] = useState<string>(initialDayFilter);
  const [tick, setTick] = useState(0);

  // Real-time second ticker for live countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const schedule: UserScheduleSummary = calculateUserSchedule(activities, currentUser.id);

  const displayedGroups = schedule.dayGroups.filter(group => {
    if (selectedDay === 'all') return true;
    return group.dayLabel === selectedDay;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        id="daily-schedule-modal"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-3xl my-auto rounded-3xl bg-[#14151C] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-[#0E0F14] relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FF5C00]/15 text-[#FF5C00] border border-[#FF5C00]/30 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>My Attendance & Schedule</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                Your Joined Activities & Lineup
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                You have joined <strong className="text-white">{schedule.totalJoinedCount} total activities</strong>.
                {schedule.todayCount > 0 ? (
                  <span className="text-[#FF5C00] font-bold"> You have {schedule.todayCount} to attend today!</span>
                ) : (
                  <span> No activities scheduled for today.</span>
                )}
              </p>
            </div>

            <motion.button
              id="close-schedule-modal-btn"
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-2xl bg-[#1A1B23] hover:bg-[#20212B] text-slate-300 hover:text-white border border-white/10 transition cursor-pointer shrink-0"
              title="Close"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
            {/* Metric 1: Total Joined */}
            <div className="p-3 rounded-2xl bg-[#1A1B23] border border-white/5 flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Joined
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-bold text-white">
                  {schedule.totalJoinedCount}
                </span>
                <span className="text-[11px] text-slate-400">activities</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {schedule.hostedCount} hosted · {schedule.participantCount} joined
              </span>
            </div>

            {/* Metric 2: Today (Need to Go) */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDay(schedule.todayCount > 0 ? 'Today' : 'all')}
              className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col ${
                schedule.todayCount > 0
                  ? 'bg-gradient-to-br from-[#FF5C00]/20 to-[#1A1B23] border-[#FF5C00]/40 shadow-[0_0_15px_rgba(255,92,0,0.15)]'
                  : 'bg-[#1A1B23] border-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5C00] flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#FF5C00]" />
                  <span>Go Today</span>
                </span>
                {schedule.todayCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#FF5C00] animate-ping" />
                )}
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-bold text-white">
                  {schedule.todayCount}
                </span>
                <span className="text-[11px] text-[#FF5C00] font-semibold">
                  {schedule.todayCount === 1 ? 'event' : 'events'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {schedule.todayCount > 0 ? 'Action required today' : 'No events today'}
              </span>
            </motion.div>

            {/* Metric 3: Tomorrow */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDay(schedule.tomorrowCount > 0 ? 'Tomorrow' : 'all')}
              className="p-3 rounded-2xl bg-[#1A1B23] border border-white/5 hover:border-white/20 transition cursor-pointer flex flex-col"
            >
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tomorrow
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-bold text-white">
                  {schedule.tomorrowCount}
                </span>
                <span className="text-[11px] text-slate-400">scheduled</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {schedule.tomorrowCount > 0 ? 'Ready for tomorrow' : 'Rest day / Open'}
              </span>
            </motion.div>

            {/* Metric 4: Later this week */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDay('all')}
              className="p-3 rounded-2xl bg-[#1A1B23] border border-white/5 hover:border-white/20 transition cursor-pointer flex flex-col"
            >
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Later This Week
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-bold text-white">
                  {schedule.laterThisWeekCount}
                </span>
                <span className="text-[11px] text-slate-400">upcoming</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Future sessions
              </span>
            </motion.div>
          </div>

          {/* Filter Pills by Day */}
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/5 overflow-x-auto">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDay('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedDay === 'all'
                  ? 'bg-[#FF5C00] text-black font-bold'
                  : 'bg-[#1A1B23] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              All Days ({schedule.allJoinedUpcoming.length})
            </motion.button>

            {schedule.dayGroups.map(group => {
              const isSel = selectedDay === group.dayLabel;
              return (
                <motion.button
                  key={group.dayLabel}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDay(group.dayLabel)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isSel
                      ? 'bg-[#FF5C00] text-black font-bold'
                      : group.isToday
                      ? 'bg-[#FF5C00]/15 text-[#FF5C00] border border-[#FF5C00]/30 hover:bg-[#FF5C00]/25'
                      : 'bg-[#1A1B23] text-slate-300 hover:text-white border border-white/5'
                  }`}
                >
                  <span>{group.dayLabel}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                      isSel
                        ? 'bg-black/25 text-black'
                        : 'bg-black/40 text-slate-300'
                    }`}
                  >
                    {group.activities.length}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Modal Body: Day-by-Day Itinerary Feed */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#101117]">
          {schedule.allJoinedUpcoming.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 px-4 space-y-4 rounded-3xl bg-[#161722] border border-dashed border-white/10">
              <div className="w-16 h-16 rounded-3xl bg-[#1A1B23] text-[#FF5C00] flex items-center justify-center mx-auto shadow-xl border border-white/5">
                <Calendar className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  No Joined Activities in Your Schedule Yet
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Browse live sessions happening around {currentUser.city} and join soccer, gaming, fitness, or study groups to build your day lineup!
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onClose();
                    onOpenExplore();
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-[0_0_15px_rgba(255,92,0,0.3)] cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Discover Activities</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onClose();
                    onOpenCreate();
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-[#1A1B23] hover:bg-[#20212B] text-slate-200 font-bold text-xs border border-white/10 transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#FF5C00]" />
                  <span>Host an Activity</span>
                </motion.button>
              </div>
            </div>
          ) : displayedGroups.length === 0 ? (
            <div className="text-center py-10 space-y-3 rounded-2xl bg-[#161722] border border-white/5">
              <p className="text-sm text-slate-300 font-semibold">
                No activities scheduled for "{selectedDay}".
              </p>
              <button
                onClick={() => setSelectedDay('all')}
                className="text-xs text-[#FF5C00] font-bold hover:underline cursor-pointer"
              >
                View all scheduled days ({schedule.allJoinedUpcoming.length} total)
              </button>
            </div>
          ) : (
            displayedGroups.map(group => (
              <div key={group.dayLabel} className="space-y-3">
                {/* Day Header Badge */}
                <div className="flex items-center justify-between sticky top-0 bg-[#101117]/95 backdrop-blur-md py-1.5 z-10">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        group.isToday
                          ? 'bg-[#FF5C00] text-black shadow-[0_0_15px_rgba(255,92,0,0.35)]'
                          : 'bg-[#1A1B23] text-slate-200 border border-white/10'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{group.formattedDayTitle}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {group.activities.length} {group.activities.length === 1 ? 'activity' : 'activities'} · {group.totalHours}h planned
                    </span>
                  </div>

                  {group.isToday && (
                    <span className="text-[11px] font-bold text-[#FF5C00] flex items-center gap-1 animate-pulse">
                      <Flame className="w-3 h-3" />
                      <span>Happening Today!</span>
                    </span>
                  )}
                </div>

                {/* List of activities for this day */}
                <div className="space-y-3">
                  {group.activities.map(act => {
                    const meta = getCategoryMeta(act.category);
                    const countdown = calculateActivityCountdown(act);
                    const isHost = act.creatorId === currentUser.id;
                    const distanceKm = calculateDistanceKm(
                      currentUser.approximateLocation.lat,
                      currentUser.approximateLocation.lng,
                      act.approximateLatitude,
                      act.approximateLongitude
                    );

                    return (
                      <motion.div
                        key={act.id}
                        layout
                        className={`p-4 sm:p-5 rounded-3xl border transition flex flex-col gap-3.5 ${
                          countdown.isOngoing
                            ? 'bg-gradient-to-r from-[#1F1918] to-[#14151C] border-[#FF5C00]/40 shadow-[0_0_20px_rgba(255,92,0,0.15)]'
                            : 'bg-[#161722] hover:bg-[#1A1B28] border-white/10'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          {/* Left: Category & Title */}
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl text-[10px] font-black uppercase bg-[#FF5C00]/15 text-[#FF5C00] border border-[#FF5C00]/30">
                                <span>{meta.emoji}</span>
                                <span>{act.category}</span>
                              </span>

                              {isHost ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#FF5C00]/20 text-[#FF5C00] border border-[#FF5C00]/30">
                                  You are Hosting
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                                  Confirmed Spot
                                </span>
                              )}

                              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#FF5C00]" />
                                <strong className="text-slate-200">{act.startTime}</strong> ({act.durationHours}h)
                              </span>
                            </div>

                            <h4
                              onClick={() => {
                                onClose();
                                onSelectActivity(act);
                              }}
                              className="text-base sm:text-lg font-bold text-white hover:text-[#FF5C00] transition cursor-pointer"
                            >
                              {act.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                              <div className="flex items-center gap-1 text-slate-300">
                                <MapPin className="w-3.5 h-3.5 text-[#FF5C00] shrink-0" />
                                <span className="truncate">{act.locationName}</span>
                              </div>
                              <span className="text-[11px] text-slate-500">
                                (~{formatApproximateDistance(distanceKm)})
                              </span>
                              <div className="flex items-center gap-1 text-slate-400">
                                <Users className="w-3.5 h-3.5 text-cyan-400" />
                                <span>
                                  {act.participants.length}/{act.maxParticipants} attendees
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Live Countdown Pill */}
                          <div className="sm:text-right shrink-0 flex flex-col items-start sm:items-end">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5C00]">
                              {countdown.isOngoing ? '🔥 Live Now' : '⏳ Kick-off In'}
                            </span>
                            <span className="font-mono text-sm sm:text-base font-bold text-white bg-[#0D0E13] px-3 py-1 rounded-xl border border-[#FF5C00]/30 shadow-inner">
                              {countdown.compactTicker}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {countdown.formattedReadable}
                            </span>
                          </div>
                        </div>

                        {/* Card Action Row */}
                        <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Open Details Button */}
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                onClose();
                                onSelectActivity(act);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(255,92,0,0.25)]"
                            >
                              <span>View & Chat</span>
                              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            </motion.button>

                            {/* Calendar Sync */}
                            <a
                              href={getGoogleCalendarUrl(act)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-[#1A1B23] hover:bg-[#20212B] text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition flex items-center gap-1.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="hidden sm:inline">Google Cal</span>
                            </a>

                            <button
                              onClick={() => downloadActivityIcs(act)}
                              className="px-3 py-1.5 rounded-xl bg-[#1A1B23] hover:bg-[#20212B] text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                              title="Download iCal file"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-400" />
                              <span className="hidden sm:inline">.ics</span>
                            </button>
                          </div>

                          {/* Leave / Cancel Button if participant */}
                          {!isHost && onLeaveActivity && (
                            <button
                              onClick={() => {
                                if (confirm(`Leave "${act.title}"?`)) {
                                  onLeaveActivity(act.id);
                                }
                              }}
                              className="px-3 py-1 rounded-xl text-[11px] font-bold text-slate-400 hover:text-red-400 hover:bg-white/5 transition cursor-pointer"
                            >
                              Leave Spot
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#0E0F14] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-[#FF5C00] shrink-0" />
            <span>
              Real-time synchronization across your devices. Never miss your session kick-off!
            </span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onClose();
                onOpenExplore();
              }}
              className="px-4 py-2 rounded-xl bg-[#1A1B23] hover:bg-[#20212B] text-slate-200 text-xs font-bold border border-white/10 transition cursor-pointer"
            >
              Explore More
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-[0_0_15px_rgba(255,92,0,0.3)]"
            >
              Done
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
