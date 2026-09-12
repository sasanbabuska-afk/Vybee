import React, { useState, useEffect } from 'react';
import { Activity, User } from '../types';
import { ActivityCard } from './ActivityCard';
import { calculateActivityCountdown, getGoogleCalendarUrl, downloadActivityIcs } from '../utils/countdown';
import { calculateUserSchedule, UserScheduleSummary } from '../utils/schedule';
import {
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  FolderOpen,
  Bell,
  ExternalLink,
  Download,
  Flame,
  ChevronRight,
  MapPin,
  Users
} from 'lucide-react';

interface MyActivitiesViewProps {
  activities: Activity[];
  currentUser: User;
  onSelectActivity: (activity: Activity) => void;
  onQuickJoin: (activityId: string) => void;
  onQuickLeave: (activityId: string) => void;
  onOpenCreate: () => void;
  onOpenRemindersModal?: () => void;
  onOpenScheduleModal?: () => void;
  onOpenSquadChat?: (activity: Activity) => void;
}

type TabType = 'today' | 'tomorrow' | 'reminders' | 'joined' | 'created' | 'past';

export const MyActivitiesView: React.FC<MyActivitiesViewProps> = ({
  activities,
  currentUser,
  onSelectActivity,
  onQuickJoin,
  onQuickLeave,
  onOpenCreate,
  onOpenRemindersModal,
  onOpenScheduleModal,
  onOpenSquadChat
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [nowTick, setNowTick] = useState(Date.now());

  // Second-by-second live countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const schedule: UserScheduleSummary = calculateUserSchedule(activities, currentUser.id);

  // Filter activities based on tab
  const createdActivities = activities.filter(a => a.creatorId === currentUser.id);

  const joinedActivities = activities.filter(
    a => a.participants.some(p => p.userId === currentUser.id) && a.creatorId !== currentUser.id
  );

  const allMyActivities = activities.filter(a =>
    a.participants.some(p => p.userId === currentUser.id)
  );

  const upcomingActivities = allMyActivities
    .filter(a => a.status === 'upcoming' || a.status === 'ongoing')
    .sort((a, b) => {
      const cdA = calculateActivityCountdown(a);
      const cdB = calculateActivityCountdown(b);
      return cdA.totalSeconds - cdB.totalSeconds;
    });

  const pastActivities = allMyActivities.filter(
    a => a.status === 'completed' || a.status === 'cancelled'
  );

  const getActiveList = () => {
    switch (activeTab) {
      case 'today':
        return schedule.todayActivities;
      case 'tomorrow':
        return schedule.tomorrowActivities;
      case 'reminders':
        return upcomingActivities;
      case 'created':
        return createdActivities;
      case 'joined':
        return joinedActivities;
      case 'past':
        return pastActivities;
      default:
        return schedule.todayActivities.length > 0 ? schedule.todayActivities : upcomingActivities;
    }
  };

  const list = getActiveList();

  const tabCounts = {
    today: schedule.todayCount,
    tomorrow: schedule.tomorrowCount,
    reminders: upcomingActivities.length,
    joined: joinedActivities.length,
    created: createdActivities.length,
    past: pastActivities.length
  };

  return (
    <div id="my-activities-container" className="max-w-5xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#FF5C00]/20 text-[#FF5C00] border border-[#FF5C00]/30 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Attendance & Day Schedule</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display flex items-center gap-2.5">
            <span>My Activities Schedule</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FF5C00]/20 text-[#FF5C00] border border-[#FF5C00]/30">
              {allMyActivities.length} Total Joined
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {schedule.todayCount > 0
              ? `🔥 You have ${schedule.todayCount} activity scheduled to attend today!`
              : 'You have no activities scheduled for today. Check upcoming days or discover new ones.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenScheduleModal && (
            <button
              onClick={onOpenScheduleModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF5C00]/20 to-[#FF5C00]/10 hover:from-[#FF5C00]/30 hover:to-[#FF5C00]/20 text-[#FF5C00] font-bold text-xs border border-[#FF5C00]/40 transition cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#FF5C00]" />
              <span>Day Planner</span>
            </button>
          )}

          {onOpenRemindersModal && (
            <button
              onClick={onOpenRemindersModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#1A1A1F] hover:bg-[#25252B] text-slate-200 font-bold text-xs border border-white/10 transition cursor-pointer"
            >
              <Bell className="w-4 h-4 text-[#FF5C00]" />
              <span>Reminders</span>
            </button>
          )}

          <button
            id="my-activities-create-btn"
            onClick={onOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,92,0,0.35)] transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Host Activity</span>
          </button>
        </div>
      </div>

      {/* Daily Attendance Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Total Joined */}
        <div
          onClick={() => setActiveTab('joined')}
          className={`p-4 rounded-3xl border transition cursor-pointer flex flex-col justify-between ${
            activeTab === 'joined'
              ? 'bg-[#1E1E26] border-[#FF5C00]/50 shadow-[0_0_15px_rgba(255,92,0,0.15)]'
              : 'bg-[#16161D] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Joined</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-1.5">
            <span className="text-3xl font-black text-white font-display">
              {schedule.totalJoinedCount}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">activities</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {schedule.hostedCount} hosting · {schedule.participantCount} attendee
          </span>
        </div>

        {/* Card 2: Need to Go TODAY */}
        <div
          onClick={() => setActiveTab('today')}
          className={`p-4 rounded-3xl border transition cursor-pointer flex flex-col justify-between ${
            schedule.todayCount > 0
              ? 'bg-gradient-to-br from-[#FF5C00]/25 via-[#1E1B26] to-[#16161D] border-[#FF5C00]/60 shadow-[0_0_20px_rgba(255,92,0,0.25)]'
              : activeTab === 'today'
              ? 'bg-[#1E1E26] border-white/20'
              : 'bg-[#16161D] border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#FF5C00] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#FF5C00]" />
              <span>Go Today</span>
            </span>
            {schedule.todayCount > 0 && (
              <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-[#FF5C00] text-black">
                ACTIVE
              </span>
            )}
          </div>
          <div className="my-1.5">
            <span className="text-3xl font-black text-white font-display">
              {schedule.todayCount}
            </span>
            <span className="text-xs text-[#FF5C00] ml-1.5 font-bold">
              {schedule.todayCount === 1 ? 'activity' : 'activities'}
            </span>
          </div>
          <span className="text-[10px] text-slate-300 font-medium">
            {schedule.todayCount > 0 ? 'Kick-off happening today' : 'No activities today'}
          </span>
        </div>

        {/* Card 3: Tomorrow */}
        <div
          onClick={() => setActiveTab('tomorrow')}
          className={`p-4 rounded-3xl border transition cursor-pointer flex flex-col justify-between ${
            activeTab === 'tomorrow'
              ? 'bg-[#1E1E26] border-[#FF5C00]/50 shadow-[0_0_15px_rgba(255,92,0,0.15)]'
              : 'bg-[#16161D] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tomorrow</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-1.5">
            <span className="text-3xl font-black text-white font-display">
              {schedule.tomorrowCount}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">scheduled</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {schedule.tomorrowCount > 0 ? 'Upcoming session' : 'Free / Open day'}
          </span>
        </div>

        {/* Card 4: All Upcoming / Reminders */}
        <div
          onClick={() => setActiveTab('reminders')}
          className={`p-4 rounded-3xl border transition cursor-pointer flex flex-col justify-between ${
            activeTab === 'reminders'
              ? 'bg-[#1E1E26] border-[#FF5C00]/50 shadow-[0_0_15px_rgba(255,92,0,0.15)]'
              : 'bg-[#16161D] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">All Upcoming</span>
            <Clock className="w-4 h-4 text-[#FF5C00]" />
          </div>
          <div className="my-1.5">
            <span className="text-3xl font-black text-white font-display">
              {upcomingActivities.length}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">in queue</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {schedule.laterThisWeekCount} later this week
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#16161D] border border-white/10 rounded-2xl overflow-x-auto">
        {(
          [
            { id: 'today', label: '🔥 Today (Need to Go)', count: tabCounts.today, highlight: true },
            { id: 'tomorrow', label: 'Tomorrow', count: tabCounts.tomorrow, highlight: false },
            { id: 'reminders', label: '⏰ All Upcoming & Timers', count: tabCounts.reminders, highlight: false },
            { id: 'joined', label: 'Joined Squads', count: tabCounts.joined, highlight: false },
            { id: 'created', label: 'Created by Me', count: tabCounts.created, highlight: false },
            { id: 'past', label: 'Past & Done', count: tabCounts.past, highlight: false }
          ] as const
        ).map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#FF5C00] text-black font-black shadow-md shadow-[#FF5C00]/20'
                  : tab.highlight && tab.count > 0
                  ? 'text-[#FF5C00] bg-[#FF5C00]/10 hover:bg-[#FF5C00]/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive
                    ? 'bg-black/20 text-black'
                    : tab.highlight && tab.count > 0
                    ? 'bg-[#FF5C00]/25 text-[#FF5C00]'
                    : 'bg-[#1A1A1F] text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Activity Grid / Empty State */}
      {list.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#16161D]/60 border border-dashed border-white/10 space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-[#1A1A1F] text-[#FF5C00] flex items-center justify-center mx-auto shadow-xl border border-white/5">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-display">
              {activeTab === 'today'
                ? "You have no activities to attend Today"
                : activeTab === 'tomorrow'
                ? "You have no activities scheduled for Tomorrow"
                : `No activities found in "${activeTab}"`}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {activeTab === 'today'
                ? "Looking for something fun to do today? Discover pickup games, study sessions, or gyms happening around you!"
                : activeTab === 'created'
                ? "You haven't hosted any activities yet. Create one and invite people around you!"
                : "Explore activities happening in your city and join a squad!"}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black font-black text-xs uppercase tracking-wider transition active:scale-95 shadow-[0_0_15px_rgba(255,92,0,0.3)] cursor-pointer"
            >
              Host an Activity Now
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(act => (
            <ActivityCard
              key={act.id}
              activity={act}
              currentUser={currentUser}
              onSelect={onSelectActivity}
              onQuickJoin={onQuickJoin}
              onQuickLeave={onQuickLeave}
              onOpenSquadChat={onOpenSquadChat}
            />
          ))}
        </div>
      )}
    </div>
  );
};
