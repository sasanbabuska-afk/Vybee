import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification, User } from '../types';
import {
  AlertTriangle,
  ShieldAlert,
  Flame,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  Sparkles,
  Calendar,
  X,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';

interface PenaltyNotificationModalProps {
  notification: AppNotification | null;
  currentUser: User;
  onClose: () => void;
  onViewKarmaHub: () => void;
  onAcknowledge?: () => void;
}

export const PenaltyNotificationModal: React.FC<PenaltyNotificationModalProps> = ({
  notification,
  currentUser,
  onClose,
  onViewKarmaHub,
  onAcknowledge
}) => {
  if (!notification) return null;

  const penaltyPoints = notification.karmaDeduction || notification.penaltyRecord?.penaltyPoints || 5;
  const previousKarma = notification.previousKarma ?? (currentUser.reliabilityScore ?? 100) + penaltyPoints;
  const currentKarma = notification.newKarma ?? (currentUser.reliabilityScore ?? 100);
  const strikes = currentUser.penaltyStrikes || 1;
  const reasonText = notification.penaltyRecord?.reason || notification.message || 'Late cancellation on short notice';
  const activityTitle = notification.activityTitle || notification.penaltyRecord?.activityTitle || 'Scheduled Activity';

  // Karma Tier helper
  const getKarmaTier = (score: number) => {
    if (score >= 95) {
      return {
        label: 'Elite Standing',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        barColor: 'from-emerald-500 to-teal-400',
        status: 'Optimal'
      };
    }
    if (score >= 80) {
      return {
        label: 'Good Standing',
        color: 'text-[#FF5C00]',
        bg: 'bg-[#FF5C00]/10 border-[#FF5C00]/30',
        barColor: 'from-[#FF5C00] to-amber-400',
        status: 'Standard'
      };
    }
    if (score >= 65) {
      return {
        label: 'Warning Zone',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        barColor: 'from-amber-500 to-orange-500',
        status: 'Caution'
      };
    }
    return {
      label: 'Probation Tier',
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/30',
      barColor: 'from-red-600 to-red-400',
      status: 'Restricted'
    };
  };

  const currentTier = getKarmaTier(currentKarma);

  const handleDismiss = () => {
    if (onAcknowledge) {
      onAcknowledge();
    } else {
      onClose();
    }
  };

  const handleGoToKarmaHub = () => {
    if (onAcknowledge) onAcknowledge();
    onViewKarmaHub();
  };

  return (
    <AnimatePresence>
      <div
        id="penalty-notification-alert-backdrop"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        onClick={handleDismiss}
      >
        <motion.div
          id="penalty-notification-alert-card"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-lg bg-[#14151B] border border-red-500/30 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden my-6 flex flex-col"
        >
          {/* Glowing Top Ambient Accent */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 via-[#FF5C00] to-amber-500" />

          {/* Header Banner */}
          <div className="p-6 pb-4 bg-gradient-to-b from-red-500/10 to-transparent flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                    Fair-Play Alert
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {notification.timestamp || 'Just now'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight font-display">
                  Karma Penalty Incurred
                </h3>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              title="Close alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 pt-2 space-y-5 overflow-y-auto max-h-[70vh]">
            {/* Infraction Summary Card */}
            <div className="p-4 rounded-2xl bg-[#1A1B24] border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Impacted Activity</span>
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> -{penaltyPoints} Karma
                </span>
              </div>
              
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF5C00] flex-shrink-0" />
                <span className="truncate">{activityTitle}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#101116] border border-white/5 text-xs text-slate-300">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider mb-1">
                  Reason for penalty
                </span>
                <p className="font-medium text-slate-200">
                  {reasonText}
                </p>
              </div>
            </div>

            {/* Visual Karma Meter Transformation */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#181A22] to-[#121319] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Karma Rating Shift
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${currentTier.bg} ${currentTier.color}`}>
                  {currentTier.label}
                </span>
              </div>

              {/* Numerical comparison row */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F1015] border border-white/5">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Previous</span>
                  <span className="text-lg font-black text-slate-300 line-through decoration-red-500/60 font-display">
                    {previousKarma}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-black text-red-400 bg-red-500/15 px-2 py-0.5 rounded-md border border-red-500/30">
                    -{penaltyPoints} pts
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 my-0.5" />
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Current Karma</span>
                  <span className="text-xl font-black text-white font-display">
                    {currentKarma}
                    <span className="text-xs text-slate-400 font-semibold ml-0.5">/100</span>
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="h-2.5 w-full bg-[#20222C] rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: `${previousKarma}%` }}
                    animate={{ width: `${currentKarma}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${currentTier.barColor}`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                  <span>0 (Restricted)</span>
                  <span>Active Strikes: <strong className="text-red-400">{strikes}</strong> / 3</span>
                  <span>100 (Elite)</span>
                </div>
              </div>
            </div>

            {/* Impact Explanation Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-[#FF5C00]" />
                <span>How This Impacts Your Squad Experience</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-[#161720] border border-white/5 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="text-amber-400">⚡</span>
                    <span>Waitlist Priority</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Users with 90+ Karma get automatic priority when open slots appear on full activities.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#161720] border border-white/5 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="text-blue-400">🛡️</span>
                    <span>Host Confidence</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Your Reliability Badge is displayed on attendance rosters to promote fair attendance.
                  </p>
                </div>
              </div>
            </div>

            {/* Karma Recovery Guidance Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/20 to-[#121319] border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>How to Recover Your Karma Score</span>
              </div>

              <ul className="text-xs space-y-1.5 text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Attend 2 upcoming activities</strong> on-time to restore <strong>+5 Karma</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Host an activity</strong> with verified participants to gain <strong>+10 Karma</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>
                    Maintain a 14-day zero cancellation streak to reset penalty strikes.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-5 bg-[#101117] border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
            <button
              id="penalty-alert-acknowledge-btn"
              onClick={handleDismiss}
              className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,92,0,0.3)] transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>I Understand & Acknowledge</span>
            </button>

            <button
              id="penalty-alert-view-hub-btn"
              onClick={handleGoToKarmaHub}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-[#1A1B24] hover:bg-[#252632] text-slate-200 hover:text-white font-bold text-xs border border-white/10 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Award className="w-4 h-4 text-[#FF5C00]" />
              <span>View Karma Hub</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
