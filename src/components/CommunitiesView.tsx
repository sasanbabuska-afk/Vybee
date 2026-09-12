import React, { useState } from 'react';
import { Activity, Community, ActivityCategory, User } from '../types';
import { CATEGORIES, getCategoryMeta } from '../data/categories';
import { Users, Plus, MapPin, Sparkles, Check, Flame, ArrowRight, Search, ShieldCheck } from 'lucide-react';

interface CommunitiesViewProps {
  communities: Community[];
  activities: Activity[];
  currentUser: User;
  onJoinCommunity: (communityId: string) => void;
  onLeaveCommunity: (communityId: string) => void;
  onSelectActivity: (activity: Activity) => void;
  onOpenCreateWithCategory?: (category: ActivityCategory) => void;
}

export const CommunitiesView: React.FC<CommunitiesViewProps> = ({
  communities,
  activities,
  currentUser,
  onJoinCommunity,
  onLeaveCommunity,
  onSelectActivity,
  onOpenCreateWithCategory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

  const filteredCommunities = communities.filter(comm => {
    if (selectedCategory !== 'All' && comm.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = comm.name.toLowerCase().includes(q);
      const matchDesc = comm.description.toLowerCase().includes(q);
      const matchLoc = comm.location.toLowerCase().includes(q);
      const matchTag = comm.tags.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchLoc && !matchTag) return false;
    }
    return true;
  });

  const selectedCommunity = communities.find(c => c.id === selectedCommunityId);
  const communityActivities = selectedCommunity
    ? activities.filter(a => a.category === selectedCommunity.category)
    : [];

  return (
    <div id="communities-view-wrapper" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-[#16161D] border border-white/10 p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-[#FF5C00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5C00]/10 border border-[#FF5C00]/30 text-[#FF5C00] text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>Activity-First Local Circles</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white font-display">
            Communities & Squads
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Join local groups around specific activities, meet regular players, and coordinate matches or sessions.
          </p>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search communities, tags, areas..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#16161D] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#FF5C00]/50"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[#FF5C00] text-black'
                : 'bg-[#16161D] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            All Circles
          </button>
          {CATEGORIES.slice(0, 6).map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#FF5C00] text-black'
                  : 'bg-[#16161D] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCommunities.map(community => {
          const isMember = community.members.includes(currentUser.id);
          const meta = getCategoryMeta(community.category);
          const activeEvents = activities.filter(a => a.category === community.category).length;

          return (
            <div
              key={community.id}
              className="rounded-3xl bg-[#16161D] border border-white/10 shadow-xl overflow-hidden flex flex-col justify-between transition-all hover:border-white/20 group"
            >
              {/* Cover & Header */}
              <div>
                <div className="h-36 w-full relative overflow-hidden bg-[#111116]">
                  <img
                    src={community.coverImage}
                    alt={community.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16161D] via-transparent to-black/40" />

                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#FF5C00] border border-[#FF5C00]/30 flex items-center gap-1">
                    <span>{meta.emoji}</span>
                    <span>{community.category}</span>
                  </span>

                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#111116]/80 backdrop-blur-md text-slate-300 border border-white/10 flex items-center gap-1">
                    <Users className="w-3 h-3 text-cyan-400" />
                    <span>{community.memberCount} members</span>
                  </span>
                </div>

                {/* Community Details */}
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-black text-white font-display leading-snug">
                    {community.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5C00] shrink-0" />
                    <span className="truncate">{community.location}</span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {community.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {community.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#111116] text-slate-400 border border-white/5"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-[#111116] border-t border-white/5 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#FF5C00]" />
                  <span>{activeEvents} live activities</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setSelectedCommunityId(
                        selectedCommunityId === community.id ? null : community.id
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-[#1A1A1F] hover:bg-[#25252B] border border-white/10 text-xs font-bold text-slate-200 transition cursor-pointer"
                  >
                    {selectedCommunityId === community.id ? 'Hide Events' : 'View Events'}
                  </button>

                  {isMember ? (
                    <button
                      onClick={() => onLeaveCommunity(community.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-white/10 text-xs font-bold transition cursor-pointer"
                    >
                      Joined ✓
                    </button>
                  ) : (
                    <button
                      onClick={() => onJoinCommunity(community.id)}
                      className="px-4 py-1.5 rounded-xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-black uppercase tracking-wider transition shadow-[0_0_15px_rgba(255,92,0,0.3)] cursor-pointer"
                    >
                      Join Circle
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Community Activities Drawer */}
      {selectedCommunity && (
        <div className="p-6 rounded-3xl bg-[#16161D] border border-white/10 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getCategoryMeta(selectedCommunity.category).emoji}</span>
              <div>
                <h3 className="text-lg font-black text-white font-display">
                  Activities in {selectedCommunity.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Join upcoming sessions organized by community members
                </p>
              </div>
            </div>

            {onOpenCreateWithCategory && (
              <button
                onClick={() => onOpenCreateWithCategory(selectedCommunity.category)}
                className="px-4 py-2 rounded-xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,92,0,0.3)] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Host for Circle</span>
              </button>
            )}
          </div>

          {communityActivities.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#111116] border border-dashed border-white/10 space-y-2">
              <p className="text-xs text-slate-400">
                No scheduled activities in this community right now. Be the first to start one!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {communityActivities.map(activity => (
                <div
                  key={activity.id}
                  onClick={() => onSelectActivity(activity)}
                  className="p-4 rounded-2xl bg-[#111116] border border-white/5 hover:border-[#FF5C00]/40 transition cursor-pointer flex flex-col justify-between gap-3"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#FF5C00] uppercase tracking-wider block mb-1">
                      {activity.date} · {activity.startTime}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {activity.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {activity.locationName}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                    <span className="text-slate-400">
                      {activity.participants.length} / {activity.maxParticipants} joined
                    </span>
                    <span className="text-[#FF5C00] font-bold flex items-center gap-1 text-[11px]">
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
