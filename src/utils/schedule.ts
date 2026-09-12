import { Activity, User } from '../types';
import { calculateActivityCountdown, CountdownResult } from './countdown';

export interface DayScheduleGroup {
  dayLabel: string; // e.g. "Today", "Tomorrow", "Saturday", "Sunday", "2026-08-20"
  formattedDayTitle: string; // e.g. "Today (Need to Go)", "Tomorrow", "This Saturday"
  isToday: boolean;
  isTomorrow: boolean;
  activities: Activity[];
  totalHours: number;
}

export interface UserScheduleSummary {
  totalJoinedCount: number;
  hostedCount: number;
  participantCount: number;
  todayCount: number;
  tomorrowCount: number;
  laterThisWeekCount: number;
  todayActivities: Activity[];
  tomorrowActivities: Activity[];
  allJoinedUpcoming: Activity[];
  allJoinedPast: Activity[];
  nextUpcomingActivity: Activity | null;
  nextActivityCountdown: CountdownResult | null;
  dayGroups: DayScheduleGroup[];
}

/**
 * Standardize activity date string into normalized day group
 */
export function normalizeDayLabel(dateStr: string): {
  normalized: string;
  isToday: boolean;
  isTomorrow: boolean;
  displayTitle: string;
  sortOrder: number;
} {
  const clean = (dateStr || '').trim().toLowerCase();

  if (clean === 'today') {
    return {
      normalized: 'Today',
      isToday: true,
      isTomorrow: false,
      displayTitle: 'Today (Need to Go)',
      sortOrder: 1
    };
  }

  if (clean === 'tomorrow') {
    return {
      normalized: 'Tomorrow',
      isToday: false,
      isTomorrow: true,
      displayTitle: 'Tomorrow',
      sortOrder: 2
    };
  }

  const daysMap: Record<string, { display: string; order: number }> = {
    monday: { display: 'Monday', order: 3 },
    tuesday: { display: 'Tuesday', order: 4 },
    wednesday: { display: 'Wednesday', order: 5 },
    thursday: { display: 'Thursday', order: 6 },
    friday: { display: 'Friday', order: 7 },
    saturday: { display: 'Saturday', order: 8 },
    sunday: { display: 'Sunday', order: 9 }
  };

  if (daysMap[clean]) {
    return {
      normalized: daysMap[clean].display,
      isToday: false,
      isTomorrow: false,
      displayTitle: daysMap[clean].display,
      sortOrder: daysMap[clean].order
    };
  }

  return {
    normalized: dateStr,
    isToday: false,
    isTomorrow: false,
    displayTitle: dateStr,
    sortOrder: 10
  };
}

/**
 * Calculate comprehensive schedule and attendance metrics for a user
 */
export function calculateUserSchedule(activities: Activity[], userId: string): UserScheduleSummary {
  // All activities where user is a confirmed participant or host
  const userActivities = activities.filter(a =>
    a.participants.some(p => p.userId === userId)
  );

  const hosted = userActivities.filter(a => a.creatorId === userId);
  const participating = userActivities.filter(a => a.creatorId !== userId);

  // Separate upcoming vs past/cancelled
  const activeUpcoming = userActivities
    .filter(a => a.status === 'upcoming' || a.status === 'ongoing')
    .sort((a, b) => {
      const cdA = calculateActivityCountdown(a);
      const cdB = calculateActivityCountdown(b);
      return cdA.totalSeconds - cdB.totalSeconds;
    });

  const past = userActivities.filter(
    a => a.status === 'completed' || a.status === 'cancelled'
  );

  // Group by day
  const dayBuckets: Record<string, Activity[]> = {};
  const dayMeta: Record<string, { isToday: boolean; isTomorrow: boolean; displayTitle: string; sortOrder: number }> = {};

  activeUpcoming.forEach(act => {
    const meta = normalizeDayLabel(act.date);
    if (!dayBuckets[meta.normalized]) {
      dayBuckets[meta.normalized] = [];
      dayMeta[meta.normalized] = meta;
    }
    dayBuckets[meta.normalized].push(act);
  });

  const dayGroups: DayScheduleGroup[] = Object.keys(dayBuckets).map(key => {
    const acts = dayBuckets[key].sort((a, b) => {
      const cdA = calculateActivityCountdown(a);
      const cdB = calculateActivityCountdown(b);
      return cdA.totalSeconds - cdB.totalSeconds;
    });

    const totalHours = acts.reduce((sum, item) => sum + (item.durationHours || 2), 0);

    return {
      dayLabel: key,
      formattedDayTitle: dayMeta[key].displayTitle,
      isToday: dayMeta[key].isToday,
      isTomorrow: dayMeta[key].isTomorrow,
      activities: acts,
      totalHours
    };
  }).sort((a, b) => {
    const orderA = dayMeta[a.dayLabel]?.sortOrder ?? 10;
    const orderB = dayMeta[b.dayLabel]?.sortOrder ?? 10;
    return orderA - orderB;
  });

  const todayActivities = dayBuckets['Today'] || [];
  const tomorrowActivities = dayBuckets['Tomorrow'] || [];
  const laterThisWeekCount = activeUpcoming.filter(a => {
    const meta = normalizeDayLabel(a.date);
    return !meta.isToday && !meta.isTomorrow;
  }).length;

  const nextUpcomingActivity = activeUpcoming.length > 0 ? activeUpcoming[0] : null;
  const nextActivityCountdown = nextUpcomingActivity
    ? calculateActivityCountdown(nextUpcomingActivity)
    : null;

  return {
    totalJoinedCount: userActivities.length,
    hostedCount: hosted.length,
    participantCount: participating.length,
    todayCount: todayActivities.length,
    tomorrowCount: tomorrowActivities.length,
    laterThisWeekCount,
    todayActivities,
    tomorrowActivities,
    allJoinedUpcoming: activeUpcoming,
    allJoinedPast: past,
    nextUpcomingActivity,
    nextActivityCountdown,
    dayGroups
  };
}
