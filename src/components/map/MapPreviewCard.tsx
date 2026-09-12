import React from 'react';
import { motion } from 'motion/react';
import { Activity, User } from '../../types';
import { getCategoryMeta } from '../../data/categories';
import { calculateDistanceKm, formatApproximateDistance, novaStore } from '../../services/store';
import { isActivityNow } from './mapUtils';
import { Clock, MapPin, Users, X, ArrowRight, Check, MessageSquare } from 'lucide-react';

interface MapPreviewCardProps {
  activity: Activity;
  userLocation: { lat: number; lng: number };
  currentUser?: User;
  onSelect: (activity: Activity) => void;
  onClose: () => void;
  onQuickJoin?: (activityId: string) => void;
  onOpenSquadChat?: (activity: Activity) => void;
}

export const MapPreviewCard: React.FC<MapPreviewCardProps> = ({
  activity,
  userLocation,
  currentUser,
  onSelect,
  onClose,
  onQuickJoin,
  onOpenSquadChat
}) => {
  const meta = getCategoryMeta(activity.category);
  const distanceKm = calculateDistanceKm(
    userLocation.lat,
    userLocation.lng,
    activity.approximateLatitude,
    activity.approximateLongitude
  );
  const isNow = isActivityNow(activity);
  const isJoined = currentUser ? activity.participants.some(p => p.userId === currentUser.id) : false;
  const isHost = currentUser ? activity.creatorId === currentUser.id : false;
  const isFull = activity.participants.length >= activity.maxParticipants;
  const spotsLeft = Math.max(0, activity.maxParticipants - activity.participants.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="p-4 sm:p-5 rounded-3xl bg-[#14151D]/95 border border-[#FF5C00]/30 shadow-2xl backdrop-blur-xl space-y-3.5"
    >
      {/* 1. WHAT: Category & Title */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#FF5C00]/10 text-[#FF5C00] border border-[#FF5C00]/25">
              <span>{meta.emoji}</span>
              <span>{activity.category}</span>
            </span>

            {isNow && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FF5C00] text-black">
                <span>NOW</span>
              </span>
            )}
            <span className="text-xs text-slate-400 font-medium">
              {formatApproximateDistance(distanceKm)}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white font-display line-clamp-1">
            {activity.title}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description Snippet */}
      {activity.description && (
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {activity.description}
        </p>
      )}

      {/* 2. WHEN & 3. WHERE: Logistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 p-3 rounded-2xl bg-[#0F1017] border border-white/5">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium text-white truncate">
            {activity.date} · {activity.startTime}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-[#FF5C00] shrink-0" />
          <span className="truncate">{activity.locationName}</span>
        </div>
      </div>

      {/* 4. WHO & 5. ACTION: Footer */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Avatars & Count */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex -space-x-2 overflow-hidden shrink-0">
            {activity.participants.slice(0, 3).map((p, idx) => (
              <img
                key={p.userId || idx}
                src={p.profilePhoto}
                alt={p.displayName}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-[#14151D] object-cover"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
          <div className="text-xs text-slate-300 truncate flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-400" />
            <span className="font-semibold text-white">
              {activity.participants.length} / {activity.maxParticipants} joined
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isJoined && onOpenSquadChat && (
            <motion.button
              id={`preview-squad-chat-btn-${activity.id}`}
              whileTap={{ scale: 0.94 }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenSquadChat(activity);
              }}
              title="Open Squad Chat"
              className="relative px-3 py-2 rounded-xl bg-[#1A1A24] hover:bg-[#FF5C00]/15 text-slate-200 hover:text-[#FF5C00] border border-white/10 hover:border-[#FF5C00]/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#FF5C00]" />
              <span className="hidden sm:inline">Chat</span>
              {currentUser && novaStore.getUnreadMessageCount(activity.id, currentUser.id) > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#FF5C00] text-black">
                  {novaStore.getUnreadMessageCount(activity.id, currentUser.id)}
                </span>
              )}
            </motion.button>
          )}

          {isJoined ? (
            <button
              id="preview-manage-btn"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(activity);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition cursor-pointer border border-white/10 shadow-sm active:scale-95"
            >
              <Check className="w-3.5 h-3.5 text-[#FF5C00]" />
              <span>{isHost ? 'Manage' : 'Attending'}</span>
            </button>
          ) : isFull ? (
            <button
              id="preview-full-btn"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(activity);
              }}
              className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 text-xs font-medium cursor-pointer border border-white/5 hover:bg-white/10 hover:text-white transition"
            >
              Full · View
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              {onQuickJoin && (
                <motion.button
                  id="preview-quick-join-btn"
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickJoin(activity.id);
                  }}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-bold shadow-md shadow-[#FF5C00]/25 transition cursor-pointer"
                >
                  <span>Join</span>
                </motion.button>
              )}
              <motion.button
                id="preview-view-btn"
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(activity);
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition cursor-pointer border border-white/10"
              >
                <span>Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
