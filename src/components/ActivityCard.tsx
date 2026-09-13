import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, User } from '../types';
import { getCategoryMeta } from '../data/categories';
import { calculateDistanceKm, formatApproximateDistance, novaStore } from '../services/store';
import { calculateActivityCountdown } from '../utils/countdown';
import { Award, ChevronRight, SmilePlus, Clock, MapPin, Users, Check, MessageSquare } from 'lucide-react';
import { POPULAR_QUICK_EMOJIS } from './EmojiQuickPicker';
import { SpotlightCard } from './widgets/AnimateUIWidgets';

interface ActivityCardProps {
  activity: Activity;
  currentUser: User;
  onSelect: (activity: Activity) => void;
  onQuickJoin?: (activityId: string) => void;
  onQuickLeave?: (activityId: string) => void;
  onOpenSquadChat?: (activity: Activity) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  currentUser,
  onSelect,
  onQuickJoin,
  onQuickLeave,
  onOpenSquadChat
}) => {
  const [tick, setTick] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>(() =>
    novaStore.getActivityReactions(activity.id)
  );
  const [myReacted, setMyReacted] = useState<string[]>(() =>
    novaStore.getUserReactedEmojis(activity.id, currentUser.id)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setReactions(novaStore.getActivityReactions(activity.id));
    setMyReacted(novaStore.getUserReactedEmojis(activity.id, currentUser.id));
  }, [activity.id, currentUser.id, tick]);

  const handleToggleReaction = (emoji: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    novaStore.toggleActivityReaction(activity.id, emoji, currentUser.id);
    setReactions(novaStore.getActivityReactions(activity.id));
    setMyReacted(novaStore.getUserReactedEmojis(activity.id, currentUser.id));
    setShowEmojiPicker(false);
  };

  const meta = getCategoryMeta(activity.category);
  const distanceKm = calculateDistanceKm(
    currentUser.approximateLocation.lat,
    currentUser.approximateLocation.lng,
    activity.approximateLatitude,
    activity.approximateLongitude
  );

  const isJoined = activity.participants.some(p => p.userId === currentUser.id);
  const isHost = activity.creatorId === currentUser.id;
  const isFull = activity.participants.length >= activity.maxParticipants;
  const spotsLeft = Math.max(0, activity.maxParticipants - activity.participants.length);

  const countdown = calculateActivityCountdown(activity);
  const reactionEntries = Object.entries(reactions);

  return (
    <SpotlightCard
      id={`activity-card-${activity.id}`}
      glowColor="rgba(255, 92, 0, 0.12)"
      className={`group relative flex flex-col justify-between rounded-2xl bg-[#14151D] border transition-all duration-200 overflow-hidden ${
        isJoined
          ? 'border-[#FF5C00]/50 shadow-[0_4px_20px_rgba(255,92,0,0.15)]'
          : 'border-white/8 hover:border-white/20 hover:shadow-lg hover:shadow-black/40'
      }`}
    >
      {/* Cover Photo (optional) */}
      {activity.coverPhoto && (
        <div
          onClick={() => onSelect(activity)}
          className="h-36 w-full overflow-hidden cursor-pointer"
        >
          <img
            src={activity.coverPhoto}
            alt={activity.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* 1. WHAT: Top Section (Category, Status & Title) */}
      <div className="p-5 pb-4 space-y-3">
        {/* Category & Status Pill Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Category Chip */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FF5C00]/10 text-[#FF5C00] border border-[#FF5C00]/20">
              <span>{meta.emoji}</span>
              <span>{activity.category}</span>
            </span>
          </div>

          {/* Status / Availability Pill */}
          <div className="flex items-center gap-1.5">
            {isJoined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FF5C00]/15 text-[#FF5C00] border border-[#FF5C00]/30">
                <Check className="w-3 h-3" />
                <span>{isHost ? 'Host' : 'Attending'}</span>
              </span>
            )}
            <span
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                isFull
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/20 font-semibold'
                  : spotsLeft <= 2
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 font-semibold'
                  : 'bg-[#1C1E2A] text-slate-300 border-white/5'
              }`}
            >
              {isFull ? 'Full' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
            </span>
          </div>
        </div>

        {/* Activity Title */}
        <h3
          onClick={() => onSelect(activity)}
          className="text-base sm:text-lg font-bold text-white group-hover:text-[#FF5C00] transition-colors line-clamp-1 cursor-pointer font-display leading-snug"
        >
          {activity.title}
        </h3>

        {/* Description Preview */}
        <p
          onClick={() => onSelect(activity)}
          className="text-xs text-slate-400 line-clamp-2 leading-relaxed cursor-pointer"
        >
          {activity.description}
        </p>

        {/* 2. WHEN & 3. WHERE: Essential Logistics Box */}
        <div className="p-3 rounded-xl bg-[#0F1017] border border-white/5 space-y-2 text-xs text-slate-300">
          {/* Time & Countdown */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-white truncate">
                {activity.date} at {activity.startTime}
              </span>
              <span className="text-slate-500 shrink-0">({activity.durationHours}h)</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-[11px] shrink-0">
              <Award className="w-3 h-3 text-amber-400" />
              <span>{activity.skillLevel}</span>
            </div>
          </div>

          {/* Location & Distance */}
          <div className="flex items-center gap-1.5 text-slate-300 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#FF5C00] shrink-0" />
            <span className="truncate">
              {activity.locationName} <span className="text-slate-500">· {formatApproximateDistance(distanceKm)}</span>
            </span>
          </div>

          {/* Countdown Indicator if upcoming */}
          {!countdown.isPast && (
            <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Starts in:</span>
              <span className="font-semibold text-[#FF5C00]">{countdown.compactTicker}</span>
            </div>
          )}
        </div>

        {/* Reactions Section */}
        <div className="flex items-center flex-wrap gap-1.5 pt-1">
          {reactionEntries.map(([emoji, count]) => {
            const hasReacted = myReacted.includes(emoji);
            return (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={(e) => handleToggleReaction(emoji, e)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  hasReacted
                    ? 'bg-[#FF5C00]/15 border-[#FF5C00]/40 text-[#FF5C00]'
                    : 'bg-[#0F1017] border-white/5 text-slate-300 hover:border-white/20'
                }`}
              >
                <span>{emoji}</span>
                <span className="text-[11px] font-semibold">{count}</span>
              </motion.button>
            );
          })}

          {/* Add reaction trigger */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker(!showEmojiPicker);
              }}
              className="p-1 rounded-lg bg-[#0F1017] border border-white/5 text-slate-400 hover:text-[#FF5C00] hover:border-[#FF5C00]/30 transition cursor-pointer text-xs flex items-center justify-center"
              title="Add reaction"
            >
              <SmilePlus className="w-3.5 h-3.5" />
            </button>

            {/* Quick reaction popover */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  className="absolute bottom-full left-0 mb-2 p-1.5 rounded-xl bg-[#0B0C12] border border-white/15 shadow-2xl flex items-center gap-1 z-30"
                >
                  {POPULAR_QUICK_EMOJIS.slice(0, 6).map(em => (
                    <button
                      key={em}
                      onClick={(e) => handleToggleReaction(em, e)}
                      className="p-1 text-base hover:scale-125 transition cursor-pointer"
                    >
                      {em}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 4. WHO & 5. ACTION: Bottom Footer */}
      <div className="px-5 py-3 bg-[#0E0F16] border-t border-white/5 flex items-center justify-between gap-3">
        {/* Participants Avatars & Count */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex -space-x-2 overflow-hidden shrink-0">
            {activity.participants.slice(0, 3).map((p, idx) => (
              <img
                key={p.userId || idx}
                src={p.profilePhoto}
                alt={p.displayName}
                title={p.displayName}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0E0F16] object-cover"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
          <div className="text-xs text-slate-400 truncate flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">
              {activity.participants.length}/{activity.maxParticipants} joined
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isJoined && onOpenSquadChat && (
            <motion.button
              id={`squad-chat-btn-${activity.id}`}
              whileTap={{ scale: 0.94 }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenSquadChat(activity);
              }}
              title="Open Squad Chat"
              className="relative px-3 py-1.5 rounded-xl bg-[#1A1A24] hover:bg-[#FF5C00]/15 text-slate-200 hover:text-[#FF5C00] border border-white/10 hover:border-[#FF5C00]/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#FF5C00]" />
              <span className="hidden sm:inline">Chat</span>
              {novaStore.getUnreadMessageCount(activity.id, currentUser.id) > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#FF5C00] text-black">
                  {novaStore.getUnreadMessageCount(activity.id, currentUser.id)}
                </span>
              )}
            </motion.button>
          )}

          {isJoined ? (
            <motion.button
              id={`leave-btn-${activity.id}`}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                e.stopPropagation();
                if (isHost) {
                  onSelect(activity);
                } else if (onQuickLeave) {
                  onQuickLeave(activity.id);
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isHost
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border-white/10'
              }`}
            >
              {isHost ? 'Manage' : 'Leave'}
            </motion.button>
          ) : isFull ? (
            <button
              disabled
              className="px-3.5 py-1.5 rounded-xl bg-white/5 text-slate-500 text-xs font-medium cursor-not-allowed border border-white/5"
            >
              Full
            </button>
          ) : (
            <motion.button
              id={`join-btn-${activity.id}`}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={(e) => {
                e.stopPropagation();
                if (onQuickJoin) onQuickJoin(activity.id);
              }}
              className="px-4 py-1.5 bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-bold rounded-xl shadow-md shadow-[#FF5C00]/20 transition cursor-pointer"
            >
              Join
            </motion.button>
          )}

          <motion.button
            id={`details-btn-${activity.id}`}
            whileTap={{ scale: 0.92 }}
            onClick={() => onSelect(activity)}
            title="View Details"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </SpotlightCard>
  );
};
