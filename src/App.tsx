import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  ActivityCategory,
  Community,
  FilterState,
  SkillLevel,
  User,
  ActivityVisibility,
  AppNotification
} from './types';
import {
  novaStore,
  calculateDistanceKm,
  formatApproximateDistance
} from './services/store';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { LandingHero } from './components/LandingHero';
import { CategoryChips } from './components/CategoryChips';
import { FilterBar } from './components/FilterBar';
import { ActivityCard } from './components/ActivityCard';
import { InteractiveMap } from './components/InteractiveMap';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { CreateActivityModal } from './components/CreateActivityModal';
import { ProfileView } from './components/ProfileView';
import { MyActivitiesView } from './components/MyActivitiesView';
import { CommunitiesView } from './components/CommunitiesView';
import { SafetyReportModal } from './components/SafetyReportModal';
import { LocationPrivacyModal } from './components/LocationPrivacyModal';
import { JoinedActivitiesReminderBanner } from './components/JoinedActivitiesReminderBanner';
import { CyberpunkBackground } from './components/CyberpunkBackground';
import { DailyScheduleModal } from './components/DailyScheduleModal';
import { RemindersDrawer } from './components/RemindersDrawer';
import { PenaltyNotificationModal } from './components/PenaltyNotificationModal';
import { SquadChatModal } from './components/SquadChatModal';
import { AuthModal } from './components/AuthModal';
import { ModalPortal } from './components/ModalPortal';
import { SupabaseStatusBanner } from './components/SupabaseStatusBanner';
import { calculateUserSchedule } from './utils/schedule';
import { authService } from './services/authService';
import { supabaseService } from './services/supabaseService';
import { isSupabaseConfigured } from './lib/supabase';
import {
  Compass,
  Map as MapIcon,
  Plus,
  Sparkles,
  SlidersHorizontal,
  Flame,
  ShieldCheck,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function App() {
  // Store States
  const [currentUser, setCurrentUser] = useState<User>(novaStore.getCurrentUser());
  const [activities, setActivities] = useState<Activity[]>(novaStore.getActivities());
  const [communities, setCommunities] = useState<Community[]>(novaStore.getCommunities());
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(novaStore.getBlockedUserIds());

  // Supabase Auth State
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [authPrompt, setAuthPrompt] = useState<string | undefined>(undefined);
  const isSupabaseLive = isSupabaseConfigured();

  // View Navigation: 'home' | 'map' | 'my-activities' | 'communities' | 'profile'
  const [activeView, setActiveView] = useState<'home' | 'map' | 'my-activities' | 'communities' | 'profile'>('home');

  // Filter States
  const [filters, setFilters] = useState<FilterState>({
    category: 'All',
    searchQuery: '',
    maxDistanceKm: 15,
    dateFilter: 'all',
    timeFilter: 'all',
    skillLevel: 'All',
    availableSpacesOnly: false,
    sortBy: 'recommended'
  });

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Modals & Selected items
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activeChatActivity, setActiveChatActivity] = useState<Activity | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialCoords, setCreateInitialCoords] = useState<{ lat?: number; lng?: number }>({});
  const [createInitialCategory, setCreateInitialCategory] = useState<ActivityCategory | undefined>(undefined);
  const [reportModalData, setReportModalData] = useState<{ activityId?: string; reportedUserId?: string } | null>(null);
  const [isLocationPrivacyOpen, setIsLocationPrivacyOpen] = useState(false);
  const [isDailyScheduleOpen, setIsDailyScheduleOpen] = useState(false);
  const [isRemindersDrawerOpen, setIsRemindersDrawerOpen] = useState(false);
  const [initialScheduleDay, setInitialScheduleDay] = useState<string>('all');
  const [activePenaltyNotification, setActivePenaltyNotification] = useState<AppNotification | null>(
    novaStore.getActivePenaltyAlert()
  );

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Subscribe to NovaStore & Supabase Sync
  useEffect(() => {
    const unsubscribe = novaStore.subscribe(() => {
      setCurrentUser(novaStore.getCurrentUser());
      setActivities(novaStore.getActivities());
      setCommunities(novaStore.getCommunities());
      setBlockedUserIds(novaStore.getBlockedUserIds());
      const pendingAlert = novaStore.getActivePenaltyAlert();
      if (pendingAlert) {
        setActivePenaltyNotification(pendingAlert);
      }
    });

    // Check initial Supabase Auth session
    if (isSupabaseLive) {
      authService.getCurrentUser().then(user => {
        if (user) {
          setAuthEmail(user.email || null);
          supabaseService.fetchProfile(user.id).then(profile => {
            if (profile) {
              setCurrentUser(profile);
            }
          });
        }
      });

      // Fetch live Supabase Activities
      supabaseService.fetchActivities().then(supabaseActs => {
        if (supabaseActs && supabaseActs.length > 0) {
          setActivities(supabaseActs);
        }
      });

      // Fetch live Supabase Communities
      supabaseService.fetchCommunities().then(supabaseComms => {
        if (supabaseComms && supabaseComms.length > 0) {
          setCommunities(supabaseComms);
        }
      });

      // Listen to Auth State Changes
      const { unsubscribe: unsubAuth } = authService.onAuthStateChange((event, session) => {
        if (session?.user) {
          setAuthEmail(session.user.email || null);
          supabaseService.fetchProfile(session.user.id).then(prof => {
            if (prof) setCurrentUser(prof);
          });
        } else {
          setAuthEmail(null);
        }
      });

      return () => {
        unsubscribe();
        unsubAuth();
      };
    }

    return unsubscribe;
  }, [isSupabaseLive]);

  // Update selected activity reference if store updates
  useEffect(() => {
    if (selectedActivity) {
      const updated = activities.find(a => a.id === selectedActivity.id) || novaStore.getActivityById(selectedActivity.id);
      if (updated) {
        setSelectedActivity(updated);
      }
    }
  }, [activities]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: activities.length };
    activities.forEach(act => {
      counts[act.category] = (counts[act.category] || 0) + 1;
    });
    return counts;
  }, [activities]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'All') count++;
    if (filters.maxDistanceKm < 25) count++;
    if (filters.dateFilter !== 'all') count++;
    if (filters.skillLevel !== 'All') count++;
    if (filters.availableSpacesOnly) count++;
    if (filters.searchQuery) count++;
    return count;
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      category: 'All',
      searchQuery: '',
      maxDistanceKm: 25,
      dateFilter: 'all',
      timeFilter: 'all',
      skillLevel: 'All',
      availableSpacesOnly: false,
      sortBy: 'recommended'
    });
  };

  // Filtered and Sorted Activities
  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      // 1. Category
      if (filters.category !== 'All' && act.category !== filters.category) {
        return false;
      }

      // 2. Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = act.title.toLowerCase().includes(q);
        const matchDesc = act.description.toLowerCase().includes(q);
        const matchCat = act.category.toLowerCase().includes(q);
        const matchLoc = act.locationName.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat && !matchLoc) {
          return false;
        }
      }

      // 3. Distance
      const dist = calculateDistanceKm(
        currentUser.approximateLocation.lat,
        currentUser.approximateLocation.lng,
        act.approximateLatitude,
        act.approximateLongitude
      );
      if (filters.maxDistanceKm < 25 && dist > filters.maxDistanceKm) {
        return false;
      }

      // 4. Date filter
      if (filters.dateFilter === 'today' && act.date !== 'Today') return false;
      if (filters.dateFilter === 'tomorrow' && act.date !== 'Tomorrow') return false;
      if (
        filters.dateFilter === 'weekend' &&
        act.date !== 'Saturday' &&
        act.date !== 'Sunday'
      ) {
        return false;
      }

      // 5. Skill level
      if (filters.skillLevel !== 'All' && act.skillLevel !== filters.skillLevel && act.skillLevel !== 'Any') {
        return false;
      }

      // 6. Available spaces
      if (filters.availableSpacesOnly && act.participants.length >= act.maxParticipants) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const distA = calculateDistanceKm(
        currentUser.approximateLocation.lat,
        currentUser.approximateLocation.lng,
        a.approximateLatitude,
        a.approximateLongitude
      );
      const distB = calculateDistanceKm(
        currentUser.approximateLocation.lat,
        currentUser.approximateLocation.lng,
        b.approximateLatitude,
        b.approximateLongitude
      );

      if (filters.sortBy === 'nearest') {
        return distA - distB;
      }

      if (filters.sortBy === 'popular') {
        return b.participants.length - a.participants.length;
      }

      if (filters.sortBy === 'soonest') {
        const order = { Today: 1, Tomorrow: 2, Saturday: 3, Sunday: 4 };
        const scoreA = order[a.date as keyof typeof order] || 5;
        const scoreB = order[b.date as keyof typeof order] || 5;
        return scoreA - scoreB;
      }

      // Recommended sorting (Score based on user interests, distance, and freshness)
      let scoreA = 0;
      let scoreB = 0;

      if (currentUser.interests?.includes(a.category)) scoreA += 5;
      if (currentUser.interests?.includes(b.category)) scoreB += 5;

      if (a.date === 'Today') scoreA += 3;
      if (b.date === 'Today') scoreB += 3;

      scoreA -= distA * 0.5;
      scoreB -= distB * 0.5;

      return scoreB - scoreA;
    });
  }, [activities, filters, currentUser]);

  // Recommended Spotlight for user
  const recommendedActivities = useMemo(() => {
    return activities
      .filter(act => currentUser.interests?.includes(act.category))
      .slice(0, 3);
  }, [activities, currentUser]);

  // Handlers
  const handleJoinActivity = async (activityId: string) => {
    if (isSupabaseLive && !authEmail) {
      setAuthPrompt('Authenticate to join squad activities on the live network.');
      setAuthModalMode('signin');
      setIsAuthModalOpen(true);
      return;
    }

    if (isSupabaseLive) {
      const { success, error } = await supabaseService.joinActivity(activityId, currentUser);
      if (error) {
        showToast(error.message);
        return;
      }
      // Re-fetch activities or update store
      const updatedActs = await supabaseService.fetchActivities();
      if (updatedActs.length > 0) setActivities(updatedActs);
      showToast('Successfully joined squad!');
    } else {
      const res = novaStore.joinActivity(activityId);
      showToast(res.message);
    }
  };

  const handleLeaveActivity = async (activityId: string, applyPenalty?: boolean) => {
    if (isSupabaseLive) {
      const { success, error } = await supabaseService.leaveActivity(activityId, currentUser.id);
      if (error) {
        showToast(error.message);
        return;
      }
      const updatedActs = await supabaseService.fetchActivities();
      if (updatedActs.length > 0) setActivities(updatedActs);
      showToast('Left squad.');
    } else {
      const res = novaStore.leaveActivity(activityId, applyPenalty);
      showToast(res.message);
    }
  };

  const handleDeleteActivity = (activityId: string) => {
    const res = novaStore.deleteActivity(activityId);
    showToast(res.message);
    if (selectedActivity?.id === activityId) {
      setSelectedActivity(null);
    }
  };

  const handleRemoveParticipant = (
    activityId: string,
    targetUserId: string,
    reasonKey: any,
    penaltyPoints: number,
    reasonText: string
  ) => {
    const res = novaStore.removeParticipantByHost(
      activityId,
      targetUserId,
      reasonKey,
      penaltyPoints,
      reasonText
    );
    showToast(res.message);
  };

  const handleFollowUser = (userId: string) => {
    const res = novaStore.followUser(userId);
    showToast(res.message);
  };

  const handleUnfollowUser = (userId: string) => {
    const res = novaStore.unfollowUser(userId);
    showToast(res.message);
  };

  const handleSendMessage = (activityId: string, text: string) => {
    novaStore.sendActivityMessage(activityId, text);
  };

  const handleCancelActivity = (activityId: string) => {
    novaStore.cancelActivity(activityId);
    showToast('Activity marked as cancelled.');
  };

  const handleCreateActivity = async (activityData: {
    title: string;
    category: ActivityCategory;
    description: string;
    date: string;
    startTime: string;
    durationHours: number;
    approximateLatitude: number;
    approximateLongitude: number;
    locationName: string;
    maxParticipants: number;
    skillLevel: SkillLevel;
    visibility: ActivityVisibility;
  }) => {
    if (isSupabaseLive && !authEmail) {
      setAuthPrompt('Authenticate to host an activity on the live grid.');
      setAuthModalMode('signin');
      setIsAuthModalOpen(true);
      return;
    }

    if (isSupabaseLive) {
      const { activity, error } = await supabaseService.createActivity(
        {
          title: activityData.title,
          category: activityData.category,
          description: activityData.description,
          date: activityData.date,
          startTime: activityData.startTime,
          durationMinutes: activityData.durationHours * 60,
          locationName: activityData.locationName,
          approximateLatitude: activityData.approximateLatitude,
          approximateLongitude: activityData.approximateLongitude,
          maxParticipants: activityData.maxParticipants,
          skillLevel: activityData.skillLevel,
          creatorId: currentUser.id,
          creatorName: currentUser.displayName,
          creatorPhoto: currentUser.profilePhoto,
          status: 'active'
        },
        currentUser
      );

      if (error) {
        showToast(error.message);
        return;
      }

      if (activity) {
        setIsCreateModalOpen(false);
        showToast(`Activity "${activity.title}" published to Supabase!`);
        setSelectedActivity(activity);
        const updatedActs = await supabaseService.fetchActivities();
        if (updatedActs.length > 0) setActivities(updatedActs);
      }
    } else {
      const newAct = novaStore.createActivity(activityData);
      setIsCreateModalOpen(false);
      showToast(`Activity "${newAct.title}" published!`);
      setSelectedActivity(newAct);
    }
  };

  const handleOpenCreateWithCoords = (lat?: number, lng?: number, category?: ActivityCategory) => {
    setCreateInitialCoords({ lat, lng });
    setCreateInitialCategory(category);
    setIsCreateModalOpen(true);
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (isSupabaseLive) {
      const { error } = await supabaseService.joinCommunity(communityId, currentUser.id);
      if (error) {
        showToast(error.message);
        return;
      }
      const updatedComms = await supabaseService.fetchCommunities();
      if (updatedComms.length > 0) setCommunities(updatedComms);
      showToast('Joined Guild!');
    } else {
      const res = novaStore.joinCommunity(communityId);
      showToast(res.message);
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    if (isSupabaseLive) {
      const { error } = await supabaseService.leaveCommunity(communityId, currentUser.id);
      if (error) {
        showToast(error.message);
        return;
      }
      const updatedComms = await supabaseService.fetchCommunities();
      if (updatedComms.length > 0) setCommunities(updatedComms);
      showToast('Left Guild.');
    } else {
      const res = novaStore.leaveCommunity(communityId);
      showToast(res.message);
    }
  };

  const handleReportSubmit = async (data: {
    activityId?: string;
    reportedUserId?: string;
    reason: 'Spam' | 'Harassment' | 'Fake profile' | 'Inappropriate behavior' | 'Dangerous activity' | 'Other';
    description: string;
  }) => {
    if (isSupabaseLive) {
      await supabaseService.createReport({
        reporterId: currentUser.id,
        reportedUserId: data.reportedUserId,
        activityId: data.activityId,
        reason: data.reason,
        description: data.description
      });
      showToast('Thanks. Your report has been submitted.');
    } else {
      novaStore.report(data);
      showToast('Thanks. Your report has been submitted.');
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (confirm('Block this user? You will no longer see activities hosted by them.')) {
      if (isSupabaseLive) {
        await supabaseService.createBlock(currentUser.id, userId);
      }
      novaStore.blockUser(userId);
      showToast('User blocked.');
      if (selectedActivity?.creatorId === userId) {
        setSelectedActivity(null);
      }
    }
  };

  const handleUpdateProfile = async (updates: Partial<User>) => {
    if (isSupabaseLive) {
      await supabaseService.updateProfile(currentUser.id, updates);
    }
    novaStore.updateUserProfile(updates);
    showToast('Profile saved.');
  };

  const userSchedule = useMemo(() => {
    return calculateUserSchedule(activities, currentUser.id);
  }, [activities, currentUser.id]);

  const myActivitiesCount = userSchedule.totalJoinedCount;

  return (
    <div className={`bg-[#07080D] text-slate-100 flex flex-col selection:bg-[#FF5C00] selection:text-black relative ${
      activeView === 'map' ? 'h-screen h-[100dvh] overflow-hidden' : 'min-h-screen'
    }`}>
      {/* Living Cyberpunk Motion Background Canvas Layer */}
      <CyberpunkBackground />

      {/* Supabase Status HUD Banner */}
      <SupabaseStatusBanner />

      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        searchQuery={filters.searchQuery}
        onSearchChange={q => setFilters(prev => ({ ...prev, searchQuery: q }))}
        activeView={activeView}
        onNavigate={view => setActiveView(view)}
        onOpenCreate={() => handleOpenCreateWithCoords()}
        onOpenLocationPrivacy={() => setIsLocationPrivacyOpen(true)}
        joinedCount={userSchedule.totalJoinedCount}
        todayCount={userSchedule.todayCount}
        onOpenSchedule={() => {
          setInitialScheduleDay('all');
          setIsDailyScheduleOpen(true);
        }}
        notifications={currentUser.notifications || []}
        onOpenPenaltyAlert={notif => setActivePenaltyNotification(notif)}
        onMarkNotificationsRead={() => {
          novaStore.markAllNotificationsAsRead();
          showToast('Notifications marked as read.');
        }}
        onTestPenaltyAlert={() => {
          const notif = novaStore.triggerTestPenaltyAlert();
          setActivePenaltyNotification(notif);
        }}
        onOpenAuthModal={() => {
          setAuthModalMode('signin');
          setAuthPrompt('Sign in to discover what\'s happening around you.');
          setIsAuthModalOpen(true);
        }}
        authEmail={authEmail}
      />

      {/* Main Content Area */}
      <main className={`w-full flex flex-col relative z-10 ${
        activeView === 'map' ? 'flex-1 min-h-0 h-full overflow-hidden' : 'flex-1'
      }`}>
        <AnimatePresence mode="wait">
          {/* VIEW 1: HOME / DISCOVERY */}
          {activeView === 'home' && (
            <motion.div
              key="home-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full pb-28"
            >
              {/* Joined Activities Live Reminder & Today Schedule Banner */}
              {userSchedule.allJoinedUpcoming.length > 0 && (
                <JoinedActivitiesReminderBanner
                  joinedActivities={userSchedule.allJoinedUpcoming}
                  currentUser={currentUser}
                  onSelectActivity={act => setSelectedActivity(act)}
                  onOpenChat={act => setSelectedActivity(act)}
                  onOpenRemindersModal={() => setIsRemindersDrawerOpen(true)}
                  onOpenScheduleModal={() => {
                    setInitialScheduleDay('Today');
                    setIsDailyScheduleOpen(true);
                  }}
                  onExploreMore={() => {
                    const el = document.getElementById('discovery-feed');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onActivityEnded={act => {
                    showToast(`🏁 Concluded "${act.title}"! +5 Karma earned.`);
                  }}
                />
              )}

              {/* Landing Hero */}
              <LandingHero
                onExploreClick={() => {
                  const el = document.getElementById('discovery-feed');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onCreateClick={() => handleOpenCreateWithCoords()}
                onSelectCategory={cat => setFilters(prev => ({ ...prev, category: cat }))}
                activeCount={activities.length}
              />

              {/* Category Selector Chips */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    Categories
                  </span>
                  {filters.category !== 'All' && (
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, category: 'All' }))}
                      className="text-xs text-[#FF5C00] hover:underline cursor-pointer font-medium"
                    >
                      Show all
                    </button>
                  )}
                </div>
                <CategoryChips
                  selectedCategory={filters.category}
                  onSelectCategory={cat => setFilters(prev => ({ ...prev, category: cat }))}
                  categoryCounts={categoryCounts}
                />
              </div>

              {/* Interactive Map Preview Card */}
              <div className="rounded-2xl bg-[#14151D] border border-white/8 p-4 sm:p-5 shadow-xl space-y-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#FF5C00]/10 text-[#FF5C00] border border-[#FF5C00]/20">
                      <MapIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        Nearby in {currentUser.city}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Live activities happening around you
                      </p>
                    </div>
                  </div>

                  <motion.button
                    id="view-full-map-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveView('map')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#FF5C00] hover:text-[#ff782e] bg-[#1A1C26] hover:bg-[#222533] px-3.5 py-2 rounded-xl border border-white/8 hover:border-[#FF5C00]/30 transition cursor-pointer"
                  >
                    <span>Full Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>

                <div className="h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-white/8 relative">
                  <InteractiveMap
                    activities={filteredActivities}
                    userLocation={currentUser.approximateLocation}
                    onSelectActivity={act => setSelectedActivity(act)}
                    onOpenCreate={handleOpenCreateWithCoords}
                    filterCategory={filters.category}
                    isMiniPreview={true}
                  />
                </div>
              </div>

              {/* Discovery Feed Section */}
              <div id="discovery-feed" className="space-y-4 pt-4">
                {/* Filter & Sort Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/8 pb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white font-display tracking-tight">
                      {filters.category === 'All' ? `Activities in ${currentUser.city}` : `${filters.category} in ${currentUser.city}`}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'} available
                    </p>
                  </div>

                  <FilterBar
                    filters={filters}
                    onChange={newFilters => setFilters(newFilters)}
                    onReset={handleResetFilters}
                    isOpen={isFilterDrawerOpen}
                    onToggleOpen={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                    activeFilterCount={activeFilterCount}
                  />
                </div>

                {/* Activity Cards Grid */}
                {filteredActivities.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-[#14151C]/50 border border-dashed border-white/10 space-y-3">
                    <span className="text-4xl">🔍</span>
                    <h3 className="text-base font-bold text-white">No activities match your filters</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Try broadening your distance or resetting filters, or be the first to host an activity!
                    </p>
                    <div className="flex justify-center gap-2 pt-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleResetFilters}
                        className="px-4 py-2 rounded-xl bg-[#1A1B23] hover:bg-[#20212B] border border-white/10 text-slate-200 text-xs font-bold cursor-pointer"
                      >
                        Reset Filters
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenCreateWithCoords()}
                        className="px-4 py-2 rounded-xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(255,92,0,0.25)] cursor-pointer"
                      >
                        Host Activity
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {filteredActivities.map(activity => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        currentUser={currentUser}
                        onSelect={act => setSelectedActivity(act)}
                        onQuickJoin={handleJoinActivity}
                        onQuickLeave={handleLeaveActivity}
                        onOpenSquadChat={act => setActiveChatActivity(act)}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* VIEW 2: FULL INTERACTIVE MAP */}
          {activeView === 'map' && (
            <motion.div
              key="map-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 w-full h-full min-h-0 relative overflow-hidden pb-14 md:pb-0 flex flex-col pointer-events-auto [touch-action:pan-x_pan-y]"
              style={{ touchAction: 'pan-x pan-y', pointerEvents: 'auto' }}
            >
              <InteractiveMap
                activities={activities}
                userLocation={currentUser.approximateLocation}
                currentUser={currentUser}
                selectedActivityId={selectedActivity?.id}
                onSelectActivity={act => setSelectedActivity(act)}
                onQuickJoin={handleJoinActivity}
                onQuickLeave={handleLeaveActivity}
                onOpenCreate={handleOpenCreateWithCoords}
                onOpenSquadChat={act => setActiveChatActivity(act)}
                filterCategory={filters.category}
                onFilterCategoryChange={cat => setFilters(prev => ({ ...prev, category: cat }))}
              />
            </motion.div>
          )}

          {/* VIEW 3: MY ACTIVITIES */}
          {activeView === 'my-activities' && (
            <motion.div
              key="activities-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <MyActivitiesView
                activities={activities}
                currentUser={currentUser}
                onSelectActivity={act => setSelectedActivity(act)}
                onQuickJoin={handleJoinActivity}
                onQuickLeave={handleLeaveActivity}
                onOpenCreate={() => handleOpenCreateWithCoords()}
                onOpenRemindersModal={() => setIsRemindersDrawerOpen(true)}
                onOpenScheduleModal={() => {
                  setInitialScheduleDay('all');
                  setIsDailyScheduleOpen(true);
                }}
                onOpenSquadChat={act => setActiveChatActivity(act)}
              />
            </motion.div>
          )}

          {/* VIEW 4: COMMUNITIES */}
          {activeView === 'communities' && (
            <motion.div
              key="communities-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <CommunitiesView
                communities={communities}
                activities={activities}
                currentUser={currentUser}
                onJoinCommunity={handleJoinCommunity}
                onLeaveCommunity={handleLeaveCommunity}
                onSelectActivity={act => setSelectedActivity(act)}
                onOpenCreateWithCategory={cat => handleOpenCreateWithCoords(undefined, undefined, cat)}
              />
            </motion.div>
          )}

          {/* VIEW 5: USER PROFILE & SETTINGS */}
          {activeView === 'profile' && (
            <motion.div
              key="profile-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ProfileView
                currentUser={currentUser}
                onUpdateProfile={handleUpdateProfile}
                onSwitchUser={user => {
                  novaStore.setCurrentUser(user);
                  showToast(`Switched persona to ${user.displayName}`);
                }}
                blockedUserIds={blockedUserIds}
                onUnblockUser={uid => {
                  novaStore.unblockUser(uid);
                  showToast('User unblocked.');
                }}
                onFollowUser={handleFollowUser}
                onUnfollowUser={handleUnfollowUser}
                isFollowing={uid => novaStore.isFollowing(uid)}
                onResetData={() => {
                  novaStore.resetToSampleData();
                  showToast('Demo data reset to initial state.');
                }}
                onOpenLocationPrivacy={() => setIsLocationPrivacyOpen(true)}
                onOpenPenaltyNotification={notif => setActivePenaltyNotification(notif)}
                onTriggerTestPenaltyAlert={() => {
                  const notif = novaStore.triggerTestPenaltyAlert();
                  setActivePenaltyNotification(notif);
                }}
                onOpenAuthModal={() => {
                  setAuthModalMode('signin');
                  setAuthPrompt('Sign in to link your personal Supabase account.');
                  setIsAuthModalOpen(true);
                }}
                isSupabaseLive={isSupabaseLive}
                authEmail={authEmail}
                onSignOut={async () => {
                  await authService.signOut();
                  setAuthEmail(null);
                  showToast('Signed out of Supabase session.');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeView={activeView}
        onNavigate={view => setActiveView(view)}
        onOpenCreate={() => handleOpenCreateWithCoords()}
        currentUser={currentUser}
        myActivitiesCount={userSchedule.totalJoinedCount}
        todayCount={userSchedule.todayCount}
      />

      {/* Penalty Notification & Fair-Play Alert Modal */}
      {activePenaltyNotification && (
        <ModalPortal>
          <PenaltyNotificationModal
            notification={activePenaltyNotification}
            currentUser={currentUser}
            onClose={() => {
              novaStore.clearActivePenaltyAlert();
              setActivePenaltyNotification(null);
            }}
            onAcknowledge={() => {
              if (activePenaltyNotification) {
                novaStore.markNotificationAsRead(activePenaltyNotification.id);
              }
              novaStore.clearActivePenaltyAlert();
              setActivePenaltyNotification(null);
              showToast('Karma notice acknowledged.');
            }}
            onViewKarmaHub={() => {
              setActiveView('profile');
              novaStore.clearActivePenaltyAlert();
              setActivePenaltyNotification(null);
            }}
          />
        </ModalPortal>
      )}

      {/* Daily Schedule & Attendance Planner Modal */}
      {isDailyScheduleOpen && (
        <ModalPortal>
          <DailyScheduleModal
            activities={activities}
            currentUser={currentUser}
            onClose={() => setIsDailyScheduleOpen(false)}
            onSelectActivity={act => setSelectedActivity(act)}
            onOpenCreate={() => {
              setIsDailyScheduleOpen(false);
              handleOpenCreateWithCoords();
            }}
            onOpenExplore={() => {
              setIsDailyScheduleOpen(false);
              setActiveView('home');
            }}
            onLeaveActivity={handleLeaveActivity}
            initialDayFilter={initialScheduleDay}
          />
        </ModalPortal>
      )}

      {/* Reminders & Timers Drawer */}
      {isRemindersDrawerOpen && (
        <ModalPortal>
          <RemindersDrawer
            joinedActivities={userSchedule.allJoinedUpcoming}
            currentUser={currentUser}
            onClose={() => setIsRemindersDrawerOpen(false)}
            onSelectActivity={act => setSelectedActivity(act)}
            onOpenChat={act => {
              setIsRemindersDrawerOpen(false);
              setActiveChatActivity(act);
            }}
            onLeaveActivity={handleLeaveActivity}
          />
        </ModalPortal>
      )}

      {/* Standalone Real-Time Squad Chat Modal */}
      {activeChatActivity && (
        <ModalPortal>
          <SquadChatModal
            activity={activeChatActivity}
            currentUser={currentUser}
            onClose={() => setActiveChatActivity(null)}
            onOpenActivityDetails={act => {
              setActiveChatActivity(null);
              setSelectedActivity(act);
            }}
            onQuickJoin={handleJoinActivity}
            onReportMessage={msg =>
              setReportModalData({
                activityId: activeChatActivity.id,
                reportedUserId: msg.userId
              })
            }
            onOpenUserProfile={_uid => {
              setActiveChatActivity(null);
              setActiveView('profile');
            }}
          />
        </ModalPortal>
      )}

      {/* Activity Details Modal with Live Chat & Following */}
      {selectedActivity && (
        <ModalPortal>
          <ActivityDetailModal
            activity={selectedActivity}
            currentUser={currentUser}
            onClose={() => setSelectedActivity(null)}
            onJoin={handleJoinActivity}
            onLeave={handleLeaveActivity}
            onCancelActivity={handleCancelActivity}
            onDeleteActivity={handleDeleteActivity}
            onRemoveParticipant={handleRemoveParticipant}
            onReport={(actId, reportedUser) =>
              setReportModalData({ activityId: actId, reportedUserId: reportedUser })
            }
            onBlockUser={handleBlockUser}
            onFollowUser={handleFollowUser}
            onUnfollowUser={handleUnfollowUser}
            isFollowing={uid => novaStore.isFollowing(uid)}
            onSendMessage={handleSendMessage}
          />
        </ModalPortal>
      )}

      {/* Create Activity Modal */}
      {isCreateModalOpen && (
        <ModalPortal>
          <CreateActivityModal
            currentUser={currentUser}
            onClose={() => {
              setIsCreateModalOpen(false);
              setCreateInitialCategory(undefined);
            }}
            onSubmit={handleCreateActivity}
            initialLat={createInitialCoords.lat}
            initialLng={createInitialCoords.lng}
            initialCategory={createInitialCategory}
          />
        </ModalPortal>
      )}

      {/* Safety Report Modal */}
      {reportModalData && (
        <ModalPortal>
          <SafetyReportModal
            activityId={reportModalData.activityId}
            reportedUserId={reportModalData.reportedUserId}
            onClose={() => setReportModalData(null)}
            onSubmitReport={handleReportSubmit}
          />
        </ModalPortal>
      )}

      {/* Location Privacy Modal */}
      {isLocationPrivacyOpen && (
        <ModalPortal>
          <LocationPrivacyModal
            currentUser={currentUser}
            onClose={() => setIsLocationPrivacyOpen(false)}
            onToggleVisibility={visible => {
              novaStore.updateUserProfile({ locationVisible: visible });
              showToast(`Location discovery mode ${visible ? 'enabled' : 'disabled'}`);
            }}
          />
        </ModalPortal>
      )}

      {/* Supabase Authentication Modal */}
      {isAuthModalOpen && (
        <ModalPortal>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            initialMode={authModalMode}
            actionPrompt={authPrompt}
            onSuccess={async () => {
              const user = await authService.getCurrentUser();
              if (user) {
                setAuthEmail(user.email || null);
                const prof = await supabaseService.fetchProfile(user.id);
                if (prof) setCurrentUser(prof);
              }
              showToast('Authentication confirmed!');
            }}
          />
        </ModalPortal>
      )}

      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <ModalPortal>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-20 md:bottom-6 right-4 z-50 px-4 py-3 rounded-2xl bg-[#161722]/95 border border-[#FF5C00]/50 text-white text-xs font-bold shadow-[0_4px_25px_rgba(255,92,0,0.25)] backdrop-blur-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#FF5C00] shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>
    </div>
  );
}
