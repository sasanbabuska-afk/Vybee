export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Any';

export type ActivityVisibility = 'Public' | 'Community';

export type ActivityStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export type ActivityCategory =
  | 'Gaming'
  | 'Football'
  | 'Basketball'
  | 'Tennis'
  | 'Running'
  | 'Gym'
  | 'Hiking'
  | 'Cycling'
  | 'Chess'
  | 'Board Games'
  | 'Study'
  | 'Programming'
  | 'Music'
  | 'Photography'
  | 'Art'
  | 'Movies'
  | 'Language Exchange'
  | 'Cooking'
  | 'Other';

export type PenaltyReason =
  | 'late_cancellation'
  | 'no_show'
  | 'inappropriate_behavior'
  | 'unresponsive'
  | 'host_cancellation'
  | 'mutual_friendly';

export interface PenaltyRecord {
  id: string;
  activityId: string;
  activityTitle: string;
  reason: string;
  reasonKey: PenaltyReason;
  penaltyPoints: number; // e.g. 5, 10, 15
  date: string;
  imposedBy: 'host' | 'system';
  hostName?: string;
}

export type NotificationType = 'penalty' | 'activity_cancelled' | 'host_removal' | 'reminder' | 'follow' | 'check_in';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  activityId?: string;
  activityTitle?: string;
  penaltyRecord?: PenaltyRecord;
  previousKarma?: number;
  newKarma?: number;
  karmaDeduction?: number;
  timestamp: string;
  isRead: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  profilePhoto: string;
  ageRange: string;
  city: string;
  bio: string;
  interests: ActivityCategory[];
  createdActivitiesCount: number;
  joinedActivitiesCount: number;
  reliabilityScore?: number; // 0-100 (Default: 100) - Karma Score
  karmaScore?: number; // 0-100 Karma points
  penaltyStrikes?: number; // count of infractions
  penaltyHistory?: PenaltyRecord[];
  notifications?: AppNotification[];
  following?: string[];
  followers?: string[];
  locationVisible: boolean;
  appearInDiscovery: boolean;
  approximateLocation: {
    lat: number;
    lng: number;
    name: string;
  };
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  timestamp: string;
  createdAt?: string;
  isSystem?: boolean;
  isHost?: boolean;
}

export interface Participant {
  userId: string;
  displayName: string;
  profilePhoto: string;
  joinedAt: string;
  status: 'confirmed' | 'waitlist';
  reliabilityScore?: number;
  penaltyStrikes?: number;
  checkedIn?: boolean;
  checkedInAt?: string;
}

export interface Community {
  id: string;
  name: string;
  category: ActivityCategory;
  description: string;
  coverImage: string;
  memberCount: number;
  members: string[]; // user IDs
  location: string;
  activityCount: number;
  tags: string[];
}

export interface Activity {
  id: string;
  creatorId: string;
  creator: {
    id: string;
    displayName: string;
    profilePhoto: string;
    city: string;
  };
  title: string;
  category: ActivityCategory;
  description: string;
  date: string; // YYYY-MM-DD or readable "Today", "Tomorrow"
  startTime: string; // HH:MM
  durationHours: number;
  approximateLatitude: number;
  approximateLongitude: number;
  locationName: string;
  maxParticipants: number;
  skillLevel: SkillLevel;
  visibility: ActivityVisibility;
  status: ActivityStatus;
  participants: Participant[];
  createdAt: string;
  tags?: string[];
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  activityId?: string;
  reason: 'Spam' | 'Harassment' | 'Fake profile' | 'Inappropriate behavior' | 'Dangerous activity' | 'Other';
  description: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface Block {
  id: string;
  blockerId: string;
  blockedUserId: string;
  createdAt: string;
}

export type SortOption = 'nearest' | 'soonest' | 'popular' | 'recommended';

export interface FilterState {
  category: ActivityCategory | 'All';
  searchQuery: string;
  maxDistanceKm: number;
  dateFilter: 'all' | 'today' | 'tomorrow' | 'weekend';
  timeFilter: 'all' | 'morning' | 'afternoon' | 'evening';
  skillLevel: SkillLevel | 'All';
  availableSpacesOnly: boolean;
  sortBy: SortOption;
}
