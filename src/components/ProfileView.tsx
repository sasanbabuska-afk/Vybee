import React, { useState } from 'react';
import { ActivityCategory, User, AppNotification } from '../types';
import { CATEGORIES } from '../data/categories';
import { novaStore } from '../services/store';
import {
  User as UserIcon,
  Shield,
  Eye,
  EyeOff,
  MapPin,
  Sparkles,
  Check,
  RotateCcw,
  UserCheck,
  Award,
  Calendar,
  Lock,
  LogOut,
  Trash2,
  AlertCircle,
  Users,
  UserPlus,
  X,
  ShieldAlert,
  Info,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: User;
  onUpdateProfile: (updates: Partial<User>) => void;
  onSwitchUser: (user: User) => void;
  blockedUserIds: string[];
  onUnblockUser: (userId: string) => void;
  onResetData: () => void;
  onOpenLocationPrivacy: () => void;
  onFollowUser?: (userId: string) => void;
  onUnfollowUser?: (userId: string) => void;
  isFollowing?: (userId: string) => boolean;
  onOpenPenaltyNotification?: (notification: AppNotification) => void;
  onTriggerTestPenaltyAlert?: () => void;
  onOpenAuthModal?: () => void;
  isSupabaseLive?: boolean;
  authEmail?: string | null;
  onSignOut?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateProfile,
  onSwitchUser,
  blockedUserIds,
  onUnblockUser,
  onResetData,
  onOpenLocationPrivacy,
  onFollowUser,
  onUnfollowUser,
  isFollowing,
  onOpenPenaltyNotification,
  onTriggerTestPenaltyAlert,
  onOpenAuthModal,
  isSupabaseLive,
  authEmail,
  onSignOut
}) => {
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [bio, setBio] = useState(currentUser.bio);
  const [city, setCity] = useState(currentUser.city);
  const [ageRange, setAgeRange] = useState(currentUser.ageRange);
  const [selectedInterests, setSelectedInterests] = useState<ActivityCategory[]>(
    currentUser.interests || []
  );
  const [locationVisible, setLocationVisible] = useState(currentUser.locationVisible);
  const [appearInDiscovery, setAppearInDiscovery] = useState(currentUser.appearInDiscovery);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSocialModal, setActiveSocialModal] = useState<'followers' | 'following' | null>(null);

  const allUsers = novaStore.getAllUsers();
  const followingIds = currentUser.following || [];
  const followerIds = currentUser.followers || [];

  const followingUsers = allUsers.filter(u => followingIds.includes(u.id));
  const followerUsers = allUsers.filter(u => followerIds.includes(u.id));

  const checkIsFollowing = (userId: string) => {
    if (isFollowing) return isFollowing(userId);
    return novaStore.isFollowing(userId);
  };

  const toggleFollow = (userId: string) => {
    if (checkIsFollowing(userId)) {
      if (onUnfollowUser) onUnfollowUser(userId);
      else novaStore.unfollowUser(userId);
    } else {
      if (onFollowUser) onFollowUser(userId);
      else novaStore.followUser(userId);
    }
  };

  const toggleInterest = (catId: ActivityCategory) => {
    if (selectedInterests.includes(catId)) {
      setSelectedInterests(selectedInterests.filter(i => i !== catId));
    } else {
      setSelectedInterests([...selectedInterests, catId]);
    }
  };

  const handleSave = () => {
    onUpdateProfile({
      displayName,
      bio,
      city,
      ageRange,
      interests: selectedInterests,
      locationVisible,
      appearInDiscovery
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div id="profile-page-wrapper" className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Supabase Cloud Auth HUD Card */}
      <div className="p-4 rounded-3xl bg-[#0E0F18] border border-white/10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left w-full sm:w-auto">
          <div className={`w-3 h-3 rounded-full ${
            isSupabaseLive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-[#FF5C00]'
          }`} />
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <span>{isSupabaseLive ? 'SUPABASE AUTH // CONNECTED' : 'SUPABASE AUTH // HYBRID LOCAL MODE'}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {authEmail ? `Logged in as: ${authEmail}` : 'Currently operating with active session profile.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2 rounded-xl bg-[#FF5C00]/20 hover:bg-[#FF5C00]/30 text-[#FF5C00] border border-[#FF5C00]/40 text-xs font-mono font-bold transition cursor-pointer"
            >
              {authEmail ? 'SWITCH ACCOUNT' : 'LOGIN / SIGN UP'}
            </button>
          )}

          {authEmail && onSignOut && (
            <button
              onClick={onSignOut}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 text-xs transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="p-6 rounded-3xl bg-[#16161D] border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#FF5C00]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
          <div className="relative">
            <img
              src={currentUser.profilePhoto}
              alt={currentUser.displayName}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-[#FF5C00]/30 shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-[#16161D] border border-white/10 text-[#FF5C00]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-white font-display">
                {currentUser.displayName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF5C00]/10 text-[#FF5C00] border border-[#FF5C00]/20">
                {currentUser.city}
              </span>
            </div>

            <p className="text-xs text-slate-400">{currentUser.email}</p>

            <p className="text-sm text-slate-300 max-w-lg italic leading-relaxed">
              "{currentUser.bio}"
            </p>

            {/* Social Followers / Following Bar */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
              <button
                id="view-following-btn"
                onClick={() => setActiveSocialModal('following')}
                className="px-3 py-1.5 rounded-xl bg-[#111116] hover:bg-[#1A1A1F] border border-white/5 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                <span className="font-extrabold text-[#FF5C00]">{followingIds.length}</span>
                <span>Following</span>
              </button>

              <button
                id="view-followers-btn"
                onClick={() => setActiveSocialModal('followers')}
                className="px-3 py-1.5 rounded-xl bg-[#111116] hover:bg-[#1A1A1F] border border-white/5 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                <span className="font-extrabold text-cyan-400">{followerIds.length}</span>
                <span>Followers</span>
              </button>
            </div>

            {/* Activities Stats */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Calendar className="w-4 h-4 text-[#FF5C00]" />
                <span className="font-bold text-white">{currentUser.createdActivitiesCount || 0}</span>
                <span className="text-slate-500">Created</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white">{currentUser.joinedActivitiesCount || 0}</span>
                <span className="text-slate-500">Joined</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span
                  className={`font-bold ${
                    (currentUser.reliabilityScore ?? 100) >= 90
                      ? 'text-emerald-400'
                      : (currentUser.reliabilityScore ?? 100) >= 75
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {currentUser.reliabilityScore ?? 100}% Reliability
                </span>
                {(currentUser.penaltyStrikes ?? 0) > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30">
                    {currentUser.penaltyStrikes} strike{(currentUser.penaltyStrikes ?? 0) === 1 ? '' : 's'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fair-Play & Karma Score Card */}
      <div className="p-6 rounded-3xl bg-[#16161D] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-display">
                Fair-Play & Karma Score
              </h3>
              <p className="text-xs text-slate-400">
                Karma determines squad matchmaking priority, host trust, and instant join access.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onTriggerTestPenaltyAlert && (
              <button
                id="profile-simulate-penalty-btn"
                onClick={onTriggerTestPenaltyAlert}
                className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-bold border border-red-500/30 transition cursor-pointer flex items-center gap-1.5"
                title="Trigger a test penalty notification alert"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Simulate Penalty Alert</span>
              </button>
            )}
            <div className="text-right">
              <span
                className={`text-2xl font-black font-display ${
                  (currentUser.reliabilityScore ?? 100) >= 90
                    ? 'text-emerald-400'
                    : (currentUser.reliabilityScore ?? 100) >= 75
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {currentUser.reliabilityScore ?? 100}
                <span className="text-xs text-slate-500 font-bold ml-0.5">/100</span>
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#111116] h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              (currentUser.reliabilityScore ?? 100) >= 90
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : (currentUser.reliabilityScore ?? 100) >= 75
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-red-600 to-red-400'
            }`}
            style={{ width: `${Math.max(5, currentUser.reliabilityScore ?? 100)}%` }}
          />
        </div>

        {/* Penalty Records History */}
        {(currentUser.penaltyHistory && currentUser.penaltyHistory.length > 0) ? (
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[10px]">
                Infraction & Penalty Log ({currentUser.penaltyHistory.length})
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Click any record to inspect impact</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {currentUser.penaltyHistory.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => {
                    if (onOpenPenaltyNotification) {
                      const notif: AppNotification = {
                        id: `notif_${rec.id}`,
                        userId: currentUser.id,
                        type: 'penalty',
                        title: 'Karma Penalty Record',
                        message: `Penalty assessed for "${rec.activityTitle}": ${rec.reason}`,
                        activityId: rec.activityId,
                        activityTitle: rec.activityTitle,
                        penaltyRecord: rec,
                        previousKarma: (currentUser.reliabilityScore ?? 100) + rec.penaltyPoints,
                        newKarma: currentUser.reliabilityScore ?? 100,
                        karmaDeduction: rec.penaltyPoints,
                        timestamp: rec.date || 'Recent',
                        isRead: true
                      };
                      onOpenPenaltyNotification(notif);
                    }
                  }}
                  className="p-3 rounded-2xl bg-[#111116] hover:bg-[#181922] border border-white/5 hover:border-red-500/30 flex items-start justify-between gap-3 text-xs transition cursor-pointer"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200 truncate">
                      <span className="text-red-400">⚠️</span>
                      <span className="truncate">{rec.activityTitle || 'Activity'}</span>
                      <span className="text-slate-400 font-normal text-[11px]">· {rec.reason}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">{rec.date} · Imposed by {rec.imposedBy}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30">
                      -{rec.penaltyPoints} Karma
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-[#111116] border border-white/5 flex items-center gap-2.5 text-xs text-slate-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Clean track record! No penalties or late cancellations on your profile.</span>
          </div>
        )}
      </div>

      {/* Social Following/Followers Modal */}
      {activeSocialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#16161D] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0F1115]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FF5C00]" />
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                  {activeSocialModal === 'following' ? 'People You Follow' : 'Your Followers'}
                </h3>
              </div>
              <button
                onClick={() => setActiveSocialModal(null)}
                className="p-1.5 rounded-xl bg-[#1A1A1F] text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {(activeSocialModal === 'following' ? followingUsers : followerUsers).length === 0 ? (
                <div className="text-center py-8 space-y-1">
                  <p className="text-xs font-bold text-slate-300">
                    {activeSocialModal === 'following'
                      ? 'You are not following anyone yet.'
                      : 'No followers yet.'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Join activities or check the host profiles to follow friends!
                  </p>
                </div>
              ) : (
                (activeSocialModal === 'following' ? followingUsers : followerUsers).map(u => {
                  const amFollowing = checkIsFollowing(u.id);
                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#1A1A1F] border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={u.profilePhoto}
                          alt={u.displayName}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">{u.displayName}</span>
                          <span className="text-[10px] text-slate-400">{u.city} · {u.interests.slice(0, 2).join(', ')}</span>
                        </div>
                      </div>

                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => toggleFollow(u.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            amFollowing
                              ? 'bg-[#111116] text-slate-300 hover:text-red-400 border border-white/10'
                              : 'bg-[#FF5C00] text-black font-black hover:bg-[#ff6f1f]'
                          }`}
                        >
                          {amFollowing ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-[#FF5C00]" />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 bg-[#0F1115] border-t border-white/10 text-center">
              <button
                onClick={() => setActiveSocialModal(null)}
                className="px-6 py-2 rounded-xl bg-[#1A1A1F] text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Form Details */}
      <div className="p-6 rounded-3xl bg-[#16161D] border border-white/10 shadow-xl space-y-5">
        <h3 className="text-lg font-black text-white font-display">Edit Profile</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#111116] border border-white/10 text-slate-100 text-sm focus:outline-none focus:border-[#FF5C00]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Age Range
            </label>
            <select
              value={ageRange}
              onChange={e => setAgeRange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#111116] border border-white/10 text-slate-100 text-sm focus:outline-none focus:border-[#FF5C00]/50"
            >
              <option value="18-24" className="bg-[#16161D]">18-24</option>
              <option value="25-30" className="bg-[#16161D]">25-30</option>
              <option value="31-40" className="bg-[#16161D]">31-40</option>
              <option value="41-55" className="bg-[#16161D]">41-55</option>
              <option value="55+" className="bg-[#16161D]">55+</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              City / Metro Region
            </label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#111116] border border-white/10 text-slate-100 text-sm focus:outline-none focus:border-[#FF5C00]/50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Bio (Focus on activities & hobbies)
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#111116] border border-white/10 text-slate-100 text-sm focus:outline-none focus:border-[#FF5C00]/50"
            />
          </div>
        </div>

        {/* Interests Selection Matrix */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Your Interests & Favorite Activities
            </label>
            <span className="text-xs text-slate-400">
              {selectedInterests.length} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-[#111116] border border-white/5">
            {CATEGORIES.map(cat => {
              const active = selectedInterests.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleInterest(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    active
                      ? 'bg-[#FF5C00] text-black font-black shadow-md shadow-[#FF5C00]/20'
                      : 'bg-[#1A1A1F] text-slate-400 hover:text-slate-200 border border-white/5'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs font-bold text-[#FF5C00] flex items-center gap-1">
              <Check className="w-4 h-4" /> Profile changes saved!
            </span>
          ) : (
            <div />
          )}

          <button
            id="save-profile-btn"
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black font-black text-xs uppercase tracking-wider transition active:scale-95 shadow-[0_0_15px_rgba(255,92,0,0.3)] cursor-pointer"
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* Location Privacy & Safety Controls */}
      <div className="p-6 rounded-3xl bg-[#16161D] border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF5C00]/10 text-[#FF5C00] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-display">
                Location Privacy & Safety
              </h3>
              <p className="text-xs text-slate-400">
                You control what others see. We never expose exact residential coordinates.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLocationPrivacy}
            className="text-xs font-bold text-[#FF5C00] hover:underline cursor-pointer"
          >
            Learn More
          </button>
        </div>

        <div className="space-y-3 pt-2">
          {/* Toggle Location Visibility */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#111116] border border-white/5">
            <div>
              <span className="text-sm font-semibold text-slate-200 block">
                Approximate Distance on Activities
              </span>
              <span className="text-xs text-slate-400">
                Show fuzzy radius (e.g. "~1.5 km away") to help coordinate nearby.
              </span>
            </div>
            <button
              onClick={() => {
                const next = !locationVisible;
                setLocationVisible(next);
                onUpdateProfile({ locationVisible: next });
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 cursor-pointer ${
                locationVisible ? 'bg-[#FF5C00]' : 'bg-[#25252B]'
              }`}
            >
              <div
                className={`bg-black w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                  locationVisible ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle Appear in Discovery */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#111116] border border-white/5">
            <div>
              <span className="text-sm font-semibold text-slate-200 block">
                Appear as Participant in Activities
              </span>
              <span className="text-xs text-slate-400">
                Allow other members in an activity to view your profile and follow you.
              </span>
            </div>
            <button
              onClick={() => {
                const next = !appearInDiscovery;
                setAppearInDiscovery(next);
                onUpdateProfile({ appearInDiscovery: next });
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 cursor-pointer ${
                appearInDiscovery ? 'bg-[#FF5C00]' : 'bg-[#25252B]'
              }`}
            >
              <div
                className={`bg-black w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                  appearInDiscovery ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Blocked Users Section */}
        {blockedUserIds.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#111116] border border-white/5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Blocked Users ({blockedUserIds.length})
            </h4>
            <div className="space-y-1.5">
              {blockedUserIds.map(uid => (
                <div
                  key={uid}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#1A1A1F] text-xs text-slate-300 border border-white/5"
                >
                  <span>User ID: {uid}</span>
                  <button
                    onClick={() => onUnblockUser(uid)}
                    className="text-xs font-bold text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* VYBE Account & Cinematic Auth Experience Card */}
      <div className="p-6 rounded-3xl bg-[#16161D] border border-white/10 shadow-xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5C00]/10 border border-[#FF5C00]/30 text-[#FF5C00] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-display">
                VYBE Account & Authentication
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {authEmail ? `Authenticated as: ${authEmail}` : 'Currently active in guest/demo persona.'}
              </p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider ${
            authEmail ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-[#FF5C00]/10 text-[#FF5C00] border border-[#FF5C00]/30'
          }`}>
            {authEmail ? 'LIVE SESSION' : 'GUEST MODE'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="px-4 py-2.5 rounded-2xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(255,92,0,0.3)]"
          >
            <Sparkles className="w-4 h-4" />
            <span>{authEmail ? 'SWITCH / RE-AUTHENTICATE' : 'OPEN CINEMATIC LOGIN'}</span>
          </button>

          {onSignOut && authEmail && (
            <button
              type="button"
              onClick={onSignOut}
              className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono font-bold transition cursor-pointer flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>SIGN OUT</span>
            </button>
          )}
        </div>
      </div>

      {/* Demo Account Switcher & Reset Sandbox */}
      <div className="p-6 rounded-3xl bg-[#16161D] border border-white/10 shadow-xl space-y-4">
        <h3 className="text-base font-black text-white font-display">
          Switch Demo Member Persona
        </h3>
        <p className="text-xs text-slate-400">
          Switch between pre-configured community members to test social following, host interactions, and live chat coordination!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {allUsers.map(user => {
            const isCurrent = user.id === currentUser.id;
            return (
              <button
                key={user.id}
                onClick={() => onSwitchUser(user)}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition cursor-pointer ${
                  isCurrent
                    ? 'bg-[#FF5C00]/15 border-[#FF5C00] text-[#FF5C00]'
                    : 'bg-[#111116] border-white/5 text-slate-300 hover:border-white/20'
                }`}
              >
                <img
                  src={user.profilePhoto}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
                  referrerPolicy="no-referrer"
                />
                <div className="truncate flex-1">
                  <span className="text-xs font-bold block text-slate-200">
                    {user.displayName} {isCurrent ? '(Active)' : ''}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {user.interests.join(' · ')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Reset all activities and profile data to default demo state?')) {
                onResetData();
              }
            }}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
