import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, User } from '../../types';
import { getCategoryMeta } from '../../data/categories';
import { calculateDistanceKm, formatApproximateDistance } from '../../services/store';
import { isActivityNow } from './mapUtils';
import { ChevronUp, ChevronDown, Clock, MapPin, Users, Sparkles, Check, ArrowRight } from 'lucide-react';

export type BottomSheetState = 'collapsed' | 'half' | 'expanded';

interface MapBottomSheetProps {
  activities: Activity[];
  userLocation: { lat: number; lng: number };
  currentUser?: User;
  selectedActivityId?: string | null;
  sheetState: BottomSheetState;
  onSheetStateChange: (state: BottomSheetState) => void;
  onSelectActivity: (activity: Activity) => void;
  onFocusMarker: (activity: Activity) => void;
  onExpandRadius?: () => void;
  onCreateActivity?: () => void;
  onQuickJoin?: (activityId: string) => void;
}

export const MapBottomSheet: React.FC<MapBottomSheetProps> = ({
  activities,
  userLocation,
  currentUser,
  selectedActivityId,
  sheetState,
  onSheetStateChange,
  onSelectActivity,
  onFocusMarker,
  onExpandRadius,
  onCreateActivity,
  onQuickJoin
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  // Auto-scroll selected activity card into view
  useEffect(() => {
    if (!selectedActivityId || !listRef.current) return;
    const cardEl = listRef.current.querySelector(`#sheet-card-${selectedActivityId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedActivityId]);

  // Touch drag handlers for smooth mobile gesture support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = null;

    if (diff > 40) {
      // Swiped UP
      if (sheetState === 'collapsed') onSheetStateChange('half');
      else if (sheetState === 'half') onSheetStateChange('expanded');
    } else if (diff < -40) {
      // Swiped DOWN
      if (sheetState === 'expanded') onSheetStateChange('half');
      else if (sheetState === 'half') onSheetStateChange('collapsed');
    }
  };

  // Height configurations
  const heightClasses = {
    collapsed: 'h-[72px]',
    half: 'h-[44vh] sm:h-[48vh]',
    expanded: 'h-[80vh] sm:h-[84vh]'
  };

  return (
    <div
      className={`w-full max-w-2xl mx-auto rounded-t-3xl sm:rounded-3xl bg-[#12131C]/95 border border-white/10 shadow-2xl backdrop-blur-2xl transition-all duration-300 flex flex-col pointer-events-auto overflow-hidden ${heightClasses[sheetState]}`}
    >
      {/* Header & Drag Handle */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (sheetState === 'collapsed') onSheetStateChange('half');
        }}
        className="p-3.5 sm:p-4 border-b border-white/8 flex items-center justify-between cursor-pointer select-none shrink-0"
      >
        {/* Left: Title & Count */}
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#FF5C00] animate-pulse" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Nearby VYBES
          </h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FF5C00]/15 text-[#FF5C00] border border-[#FF5C00]/25">
            {activities.length}
          </span>
        </div>

        {/* Center: Drag Pill */}
        <div className="w-10 h-1 rounded-full bg-white/20" />

        {/* Right: State Toggle Chevron Buttons */}
        <div className="flex items-center gap-1">
          {sheetState === 'collapsed' ? (
            <button
              onClick={e => {
                e.stopPropagation();
                onSheetStateChange('half');
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          ) : sheetState === 'half' ? (
            <div className="flex items-center gap-1">
              <button
                onClick={e => {
                  e.stopPropagation();
                  onSheetStateChange('expanded');
                }}
                title="Expand full list"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  onSheetStateChange('collapsed');
                }}
                title="Collapse list"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={e => {
                e.stopPropagation();
                onSheetStateChange('half');
              }}
              title="Minimize list"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Activity List Container */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 divide-y divide-transparent overscroll-contain"
      >
        {activities.length === 0 ? (
          <div className="py-8 px-4 text-center space-y-3">
            <span className="text-3xl">📍</span>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Nothing nearby yet</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Try expanding your search radius or create your own VYBE.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              {onExpandRadius && (
                <button
                  onClick={onExpandRadius}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 transition cursor-pointer"
                >
                  Expand Radius
                </button>
              )}
              {onCreateActivity && (
                <button
                  onClick={onCreateActivity}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Create a VYBE
                </button>
              )}
            </div>
          </div>
        ) : (
          activities.map(activity => {
            const meta = getCategoryMeta(activity.category);
            const isSelected = selectedActivityId === activity.id;
            const isNow = isActivityNow(activity);
            const distKm = calculateDistanceKm(
              userLocation.lat,
              userLocation.lng,
              activity.approximateLatitude,
              activity.approximateLongitude
            );
            const isJoined = currentUser ? activity.participants.some(p => p.userId === currentUser.id) : false;
            const isFull = activity.participants.length >= activity.maxParticipants;
            const spotsLeft = Math.max(0, activity.maxParticipants - activity.participants.length);

            return (
              <div
                key={activity.id}
                id={`sheet-card-${activity.id}`}
                onClick={() => onFocusMarker(activity)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                  isSelected
                    ? 'bg-[#1C1D2B] border-[#FF5C00] shadow-[0_0_20px_rgba(255,92,0,0.25)] ring-1 ring-[#FF5C00]'
                    : 'bg-[#161722] hover:bg-[#1A1C28] border-white/6 hover:border-white/15'
                }`}
              >
                {/* 1. WHAT: Category, NOW badge, Distance, Title */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                        <span>{meta.emoji}</span>
                        <span className="text-[11px] text-[#FF5C00] font-bold uppercase tracking-wider">
                          {activity.category}
                        </span>
                      </span>
                      {isNow && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#FF5C00] text-black">
                          NOW
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        · {formatApproximateDistance(distKm)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate font-display">
                      {activity.title}
                    </h4>
                  </div>

                  {/* Spots indicator */}
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg shrink-0 ${
                      isFull
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-white/5 text-slate-300 border border-white/8'
                    }`}
                  >
                    {isFull ? 'Full' : `${spotsLeft} spots left`}
                  </span>
                </div>

                {/* 2. WHEN & 3. WHERE */}
                <div className="flex items-center justify-between text-xs text-slate-400 gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">
                      {activity.date} · {activity.startTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 truncate text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5C00] shrink-0" />
                    <span className="truncate">{activity.locationName}</span>
                  </div>
                </div>

                {/* 4. WHO & 5. ACTION */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {activity.participants.slice(0, 3).map((p, idx) => (
                        <img
                          key={p.userId || idx}
                          src={p.profilePhoto}
                          alt={p.displayName}
                          className="inline-block h-5 w-5 rounded-full ring-1 ring-[#161722] object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                      {activity.participants.length} joined
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isJoined && !isFull && onQuickJoin && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onQuickJoin(activity.id);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-bold shadow-sm transition cursor-pointer active:scale-95"
                      >
                        Join
                      </button>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectActivity(activity);
                      }}
                      className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isJoined
                          ? 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
                          : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                      }`}
                    >
                      <span>{isJoined ? (activity.creatorId === currentUser?.id ? 'Manage' : 'Attending') : 'Details'}</span>
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
