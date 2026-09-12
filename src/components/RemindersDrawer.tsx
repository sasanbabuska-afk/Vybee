import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, User } from '../types';
import { getCategoryMeta } from '../data/categories';
import {
  calculateActivityCountdown,
  CountdownResult,
  getGoogleCalendarUrl,
  downloadActivityIcs,
  getSavedReminders,
  saveActivityReminder,
  triggerNotificationAlert,
  ActivityReminderConfig
} from '../utils/countdown';
import {
  X,
  Clock,
  Bell,
  Calendar,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  ExternalLink,
  Download,
  Volume2,
  MessageSquare,
  MapPin,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface RemindersDrawerProps {
  joinedActivities: Activity[];
  currentUser: User;
  onClose: () => void;
  onSelectActivity: (activity: Activity) => void;
  onOpenChat: (activity: Activity) => void;
  onLeaveActivity: (activityId: string) => void;
}

export const RemindersDrawer: React.FC<RemindersDrawerProps> = ({
  joinedActivities,
  currentUser,
  onClose,
  onSelectActivity,
  onOpenChat,
  onLeaveActivity
}) => {
  const [nowTick, setNowTick] = useState(Date.now());
  const [reminders, setReminders] = useState<Record<string, ActivityReminderConfig>>(getSavedReminders());
  const [newChecklistText, setNewChecklistText] = useState<Record<string, string>>({});
  const [notificationTestResult, setNotificationTestResult] = useState<string | null>(null);

  // Live 1-second countdown update
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter only upcoming / ongoing activities and sort by soonest
  const sortedActivities = [...joinedActivities]
    .filter(a => a.status === 'upcoming' || a.status === 'ongoing')
    .sort((a, b) => {
      const cdA = calculateActivityCountdown(a);
      const cdB = calculateActivityCountdown(b);
      return cdA.totalSeconds - cdB.totalSeconds;
    });

  const handleUpdateReminder = (activityId: string, leadMinutes: number, enabled: boolean) => {
    const current = reminders[activityId] || {
      activityId,
      leadMinutes: 60,
      enabled: true,
      checklist: []
    };
    const updated: ActivityReminderConfig = {
      ...current,
      leadMinutes,
      enabled
    };
    saveActivityReminder(updated);
    setReminders(getSavedReminders());
  };

  const handleToggleChecklistItem = (activityId: string, itemId: string) => {
    const current = reminders[activityId] || {
      activityId,
      leadMinutes: 60,
      enabled: true,
      checklist: []
    };
    const checklist = current.checklist || [];
    const updatedChecklist = checklist.map(item =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    const updated = { ...current, checklist: updatedChecklist };
    saveActivityReminder(updated);
    setReminders(getSavedReminders());
  };

  const handleAddChecklistItem = (activityId: string) => {
    const text = newChecklistText[activityId]?.trim();
    if (!text) return;

    const current = reminders[activityId] || {
      activityId,
      leadMinutes: 60,
      enabled: true,
      checklist: []
    };
    const checklist = current.checklist || [];
    const updatedChecklist = [
      ...checklist,
      { id: `chk_${Date.now()}`, text, done: false }
    ];
    const updated = { ...current, checklist: updatedChecklist };
    saveActivityReminder(updated);
    setReminders(getSavedReminders());
    setNewChecklistText(prev => ({ ...prev, [activityId]: '' }));
  };

  const handleDeleteChecklistItem = (activityId: string, itemId: string) => {
    const current = reminders[activityId];
    if (!current || !current.checklist) return;
    const updated = {
      ...current,
      checklist: current.checklist.filter(i => i.id !== itemId)
    };
    saveActivityReminder(updated);
    setReminders(getSavedReminders());
  };

  const handleTestNotification = async () => {
    const firstAct = sortedActivities[0];
    const actTitle = firstAct ? firstAct.title : 'Pickup Soccer Match';
    const cd = firstAct ? calculateActivityCountdown(firstAct).compactTicker : '3h.25m.22sc';

    const ok = await triggerNotificationAlert(
      `NOVA Reminder: ${actTitle}`,
      `Your squad activity starts soon (in ${cd})! Check your gear & venue directions.`
    );
    if (ok) {
      setNotificationTestResult('Notification sent to your desktop / browser!');
    } else {
      setNotificationTestResult('In-app alert chime simulated (Notifications active).');
    }
    setTimeout(() => setNotificationTestResult(null), 3500);
  };

  return (
    <motion.div
      id="reminders-drawer-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        id="reminders-drawer-modal"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-3xl my-auto rounded-3xl bg-[#14151C] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-[#0E0F14] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5C00] text-black flex items-center justify-center font-bold shadow-[0_0_20px_rgba(255,92,0,0.4)]">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                Activity Reminders & Countdown
              </h2>
              <p className="text-xs text-slate-400">
                Track all activities you joined with live second-by-second timers & checklists.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleTestNotification}
              title="Test Reminder Notification"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1B23] hover:bg-[#20212B] text-slate-300 text-xs font-semibold border border-white/10 transition cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#FF5C00]" />
              <span className="hidden sm:inline">Test Alert</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-2xl bg-[#1A1B23] hover:bg-[#20212B] text-slate-400 hover:text-white border border-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Test result banner */}
        <AnimatePresence>
          {notificationTestResult && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 py-2.5 bg-[#FF5C00]/15 border-b border-[#FF5C00]/30 text-xs font-bold text-[#FF5C00] flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{notificationTestResult}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Body: List of Joined Activities */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-[#101117]">
          {sortedActivities.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#161722] border border-dashed border-white/10 space-y-4">
              <div className="w-14 h-14 rounded-3xl bg-[#1A1B23] text-[#FF5C00] flex items-center justify-center mx-auto border border-white/10">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-display">
                  No upcoming activities joined yet
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Browse the map or discovery feed to find gaming squads, sports matches, gym buddies, and study sessions!
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#FF5C00] text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#FF5C00]/20 transition cursor-pointer"
              >
                Explore Nearby Activities
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedActivities.map(activity => {
                const meta = getCategoryMeta(activity.category);
                const cd: CountdownResult = calculateActivityCountdown(activity);
                const cfg = reminders[activity.id] || {
                  activityId: activity.id,
                  leadMinutes: 60,
                  enabled: true,
                  checklist: [
                    { id: 'def_1', text: `Confirm location: ${activity.locationName}`, done: true },
                    { id: 'def_2', text: 'Arrive 10 minutes early', done: false }
                  ]
                };
                const isHost = activity.creatorId === currentUser.id;

                return (
                  <motion.div
                    key={activity.id}
                    layout
                    className="p-4 sm:p-5 rounded-3xl bg-[#161722] border border-white/10 hover:border-[#FF5C00]/40 transition space-y-4 shadow-xl"
                  >
                    {/* Top Row: Category & Live Countdown Ticker */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold uppercase bg-[#FF5C00]/15 text-[#FF5C00] border border-[#FF5C00]/30">
                          <span>{meta.emoji}</span>
                          <span>{activity.category}</span>
                        </span>

                        {isHost ? (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Host
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-400 bg-white/5">
                            Joined Squad
                          </span>
                        )}

                        <span className="text-xs text-slate-400 font-medium">
                          {activity.date} · {activity.startTime} ({activity.durationHours}h)
                        </span>
                      </div>

                      {/* Live Neon Ticker Clock */}
                      <div className="flex items-center gap-2 bg-[#0D0E13] px-3.5 py-1.5 rounded-2xl border border-[#FF5C00]/30 shadow-inner">
                        <Clock className="w-3.5 h-3.5 text-[#FF5C00] animate-pulse" />
                        <span className="text-[10px] uppercase font-bold text-slate-400">Countdown:</span>
                        <span className="font-mono text-sm sm:text-base font-bold text-[#FF5C00]">
                          {cd.compactTicker}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Title & Venue */}
                    <div className="space-y-1">
                      <h4
                        onClick={() => {
                          onClose();
                          onSelectActivity(activity);
                        }}
                        className="text-base sm:text-lg font-bold text-white hover:text-[#FF5C00] transition cursor-pointer"
                      >
                        {activity.title}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#FF5C00] shrink-0" />
                        <span>{activity.locationName}</span>
                      </p>
                    </div>

                    {/* Reminder Timing Selector & Calendar export */}
                    <div className="p-3.5 rounded-2xl bg-[#12131A] border border-white/5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#FF5C00]" />
                          <span className="text-xs font-bold text-slate-300">
                            Reminder Alert:
                          </span>
                          <select
                            value={cfg.leadMinutes}
                            onChange={e =>
                              handleUpdateReminder(activity.id, Number(e.target.value), true)
                            }
                            className="bg-[#1A1B23] text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1 border border-white/10 focus:outline-none focus:border-[#FF5C00]/50 cursor-pointer"
                          >
                            <option value={15}>15 minutes before</option>
                            <option value={30}>30 minutes before</option>
                            <option value={60}>1 hour before</option>
                            <option value={180}>3 hours before</option>
                            <option value={1440}>1 day before</option>
                          </select>
                        </div>

                        {/* Calendar Sync Buttons */}
                        <div className="flex items-center gap-2">
                          <a
                            href={getGoogleCalendarUrl(activity)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-semibold border border-white/5 transition"
                          >
                            <ExternalLink className="w-3 h-3 text-cyan-400" />
                            <span>Google Cal</span>
                          </a>

                          <button
                            onClick={() => downloadActivityIcs(activity)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-semibold border border-white/5 transition cursor-pointer"
                          >
                            <Download className="w-3 h-3 text-amber-400" />
                            <span>iCal (.ics)</span>
                          </button>
                        </div>
                      </div>

                      {/* Preparation & Equipment Checklist */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>Prep & Gear Checklist</span>
                          <span>
                            {(cfg.checklist || []).filter(i => i.done).length}/
                            {(cfg.checklist || []).length} Ready
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {(cfg.checklist || []).map(item => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2 rounded-xl bg-[#161722] border border-white/5 group"
                            >
                              <button
                                onClick={() => handleToggleChecklistItem(activity.id, item.id)}
                                className="flex items-center gap-2 text-xs text-left cursor-pointer flex-1"
                              >
                                {item.done ? (
                                  <CheckSquare className="w-4 h-4 text-[#FF5C00] shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-500 shrink-0" />
                                )}
                                <span
                                  className={
                                    item.done ? 'line-through text-slate-500' : 'text-slate-200'
                                  }
                                >
                                  {item.text}
                                </span>
                              </button>

                              <button
                                onClick={() => handleDeleteChecklistItem(activity.id, item.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition cursor-pointer"
                                title="Remove checklist item"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}

                          {/* Add new checklist item input */}
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              value={newChecklistText[activity.id] || ''}
                              onChange={e =>
                                setNewChecklistText(prev => ({
                                  ...prev,
                                  [activity.id]: e.target.value
                                }))
                              }
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddChecklistItem(activity.id);
                                }
                              }}
                              placeholder="Add checklist item (e.g. bring boots, water, gear)..."
                              className="flex-1 px-3 py-1.5 rounded-xl bg-[#161722] border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-[#FF5C00]/50"
                            />
                            <motion.button
                              whileTap={{ scale: 0.92 }}
                              onClick={() => handleAddChecklistItem(activity.id)}
                              className="px-3 py-1.5 rounded-xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-bold transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action bar */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          onClose();
                          onOpenChat(activity);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1A1B23] hover:bg-[#20212B] text-slate-200 text-xs font-semibold border border-white/10 transition cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#FF5C00]" />
                        <span>Squad Chat</span>
                      </motion.button>

                      <div className="flex items-center gap-2">
                        {!isHost && (
                          <button
                            onClick={() => onLeaveActivity(activity.id)}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs font-semibold transition cursor-pointer"
                          >
                            Leave Activity
                          </button>
                        )}

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            onClose();
                            onSelectActivity(activity);
                          }}
                          className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-bold uppercase tracking-wider shadow-md shadow-[#FF5C00]/20 transition cursor-pointer"
                        >
                          <span>Full Details</span>
                          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#0E0F14] border-t border-white/10 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#FF5C00]" />
            <span>Reminders stay active across sessions via browser cache.</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-[#1A1B23] hover:bg-[#20212B] text-slate-200 text-xs font-bold uppercase tracking-wider border border-white/10 transition cursor-pointer"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
