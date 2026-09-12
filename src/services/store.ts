import {
  Activity,
  ActivityCategory,
  Block,
  ChatMessage,
  Community,
  Report,
  User,
  PenaltyRecord,
  PenaltyReason,
  AppNotification,
  NotificationType
} from '../types';

const ACTIVITIES_KEY = 'nova_activities_v1';
const USER_KEY = 'nova_current_user_v1';
const REPORTS_KEY = 'nova_reports_v1';
const BLOCKS_KEY = 'nova_blocks_v1';
const COMMUNITIES_KEY = 'nova_communities_v1';
const CHAT_KEY = 'nova_chat_messages_v1';
const CHAT_LAST_READ_KEY = 'nova_chat_last_read_v1';
const ALL_USERS_KEY = 'nova_all_users_v1';
const REACTIONS_KEY = 'nova_reactions_v1';

export interface ActivityReactionsData {
  [activityId: string]: {
    [emoji: string]: string[]; // array of userIds who reacted
  };
}

export const INITIAL_ACTIVITY_REACTIONS: ActivityReactionsData = {
  act_fifa_01: {
    '🔥': ['usr_sasan_01', 'usr_marcus_03', 'usr_elena_02'],
    '🎮': ['usr_sasan_01', 'usr_aria_04'],
    '🏆': ['usr_marcus_03'],
    '🍕': ['usr_elena_02']
  },
  act_football_02: {
    '⚽': ['usr_marcus_03', 'usr_sasan_01', 'usr_elena_02'],
    '🔥': ['usr_sasan_01', 'usr_marcus_03'],
    '⚡': ['usr_elena_02'],
    '👏': ['usr_aria_04']
  },
  act_basketball_03: {
    '🏀': ['usr_marcus_03', 'usr_sasan_01'],
    '🔥': ['usr_marcus_03'],
    '💯': ['usr_elena_02']
  },
  act_running_05: {
    '🏃‍♂️': ['usr_elena_02', 'usr_sasan_01'],
    '🌅': ['usr_elena_02', 'usr_aria_04'],
    '☕': ['usr_sasan_01'],
    '⚡': ['usr_marcus_03']
  },
  act_code_09: {
    '💻': ['usr_aria_04', 'usr_sasan_01'],
    '🚀': ['usr_sasan_01', 'usr_marcus_03'],
    '⚡': ['usr_aria_04'],
    '☕': ['usr_sasan_01', 'usr_elena_02']
  }
};

// Default city center (e.g. vibrant metro hub - Tehran / Metro Center coordinates default)
export const DEFAULT_USER_LOCATION = {
  lat: 35.6892,
  lng: 51.3890,
  name: 'Tehran Valiasr'
};

export const INITIAL_USER: User = {
  id: 'usr_sasan_01',
  email: 'sasan@example.com',
  displayName: 'Sasan',
  profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  ageRange: '25-30',
  city: 'Tehran',
  bio: 'Looking for friendly people to play FIFA, play casual turf football, hit the gym, and collaborate on tech projects.',
  interests: ['Gaming', 'Football', 'Gym', 'Programming', 'Chess'],
  createdActivitiesCount: 2,
  joinedActivitiesCount: 3,
  reliabilityScore: 100,
  karmaScore: 100,
  penaltyStrikes: 0,
  penaltyHistory: [],
  following: ['usr_marcus_03', 'usr_elena_02'],
  followers: ['usr_elena_02', 'usr_aria_04'],
  locationVisible: true,
  appearInDiscovery: true,
  approximateLocation: {
    lat: DEFAULT_USER_LOCATION.lat,
    lng: DEFAULT_USER_LOCATION.lng,
    name: 'Tehran Central Hub'
  },
  createdAt: '2026-06-15T10:00:00Z'
};

export const PRESET_USERS: User[] = [
  INITIAL_USER,
  {
    id: 'usr_elena_02',
    email: 'elena@example.com',
    displayName: 'Elena Rostova',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    ageRange: '22-26',
    city: 'Tehran',
    bio: 'Casual runner, amateur photographer, and board games enthusiast.',
    interests: ['Running', 'Board Games', 'Photography', 'Hiking'],
    createdActivitiesCount: 1,
    joinedActivitiesCount: 4,
    reliabilityScore: 98,
    penaltyStrikes: 0,
    penaltyHistory: [],
    following: ['usr_sasan_01', 'usr_aria_04'],
    followers: ['usr_sasan_01', 'usr_marcus_03'],
    locationVisible: true,
    appearInDiscovery: true,
    approximateLocation: { lat: 35.6932, lng: 51.3950, name: 'Niavaran' },
    createdAt: '2026-07-01T12:00:00Z'
  },
  {
    id: 'usr_marcus_03',
    email: 'marcus@example.com',
    displayName: 'Marcus Vance',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    ageRange: '28-34',
    city: 'Tehran',
    bio: 'Pickup basketball fanatic, chess hobbyist, and guitarist.',
    interests: ['Basketball', 'Chess', 'Music', 'Cycling'],
    createdActivitiesCount: 3,
    joinedActivitiesCount: 2,
    reliabilityScore: 95,
    penaltyStrikes: 0,
    penaltyHistory: [],
    following: ['usr_sasan_01'],
    followers: ['usr_sasan_01', 'usr_elena_02'],
    locationVisible: true,
    appearInDiscovery: true,
    approximateLocation: { lat: 35.6812, lng: 51.3820, name: 'Tajrish' },
    createdAt: '2026-06-20T08:30:00Z'
  },
  {
    id: 'usr_aria_04',
    email: 'aria@example.com',
    displayName: 'Aria Lin',
    profilePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    ageRange: '24-29',
    city: 'Tehran',
    bio: 'Software engineer building web apps. Love language exchanges & coffee study sessions.',
    interests: ['Programming', 'Language Exchange', 'Study', 'Art'],
    createdActivitiesCount: 2,
    joinedActivitiesCount: 5,
    reliabilityScore: 100,
    penaltyStrikes: 0,
    penaltyHistory: [],
    following: ['usr_sasan_01', 'usr_elena_02'],
    followers: ['usr_elena_02'],
    locationVisible: true,
    appearInDiscovery: true,
    approximateLocation: { lat: 35.7002, lng: 51.3690, name: 'Valiasr North' },
    createdAt: '2026-05-10T14:15:00Z'
  }
];

export const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  act_fifa_01: [
    {
      id: 'msg_1',
      activityId: 'act_fifa_01',
      userId: 'usr_sasan_01',
      userName: 'Sasan',
      userPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: 'Hey squad! Looking forward to tonight. Level Up Lounge has the PS5 station reserved.',
      timestamp: 'Today, 17:30'
    },
    {
      id: 'msg_2',
      activityId: 'act_fifa_01',
      userId: 'usr_marcus_03',
      userName: 'Marcus Vance',
      userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      text: 'Nice! Bringing 2 extra wireless controllers. Let’s do 2v2 tournament style! 🎮',
      timestamp: 'Today, 18:15'
    }
  ],
  act_football_02: [
    {
      id: 'msg_3',
      activityId: 'act_football_02',
      userId: 'usr_marcus_03',
      userName: 'Marcus Vance',
      userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      text: 'Turf Pitch #3 is reserved under my name. Bring turf/AG boots! ⚽',
      timestamp: 'Yesterday, 19:00'
    },
    {
      id: 'msg_4',
      activityId: 'act_football_02',
      userId: 'usr_elena_02',
      userName: 'Elena Rostova',
      userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      text: 'Bringing pinnies/bibs and a size 5 ball so we can split teams instantly.',
      timestamp: 'Today, 11:20'
    }
  ],
  act_basketball_03: [
    {
      id: 'msg_5',
      activityId: 'act_basketball_03',
      userId: 'usr_marcus_03',
      userName: 'Marcus Vance',
      userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      text: 'Court lights are on until 22:00. Let’s play half-court 3v3 to 21.',
      timestamp: 'Today, 14:00'
    }
  ],
  act_running_05: [
    {
      id: 'msg_6',
      activityId: 'act_running_05',
      userId: 'usr_elena_02',
      userName: 'Elena Rostova',
      userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      text: 'Meeting by the main park fountain at 07:45. Pacing around 5:30 min/km 🏃‍♀️',
      timestamp: 'Today, 16:00'
    }
  ],
  act_code_09: [
    {
      id: 'msg_7',
      activityId: 'act_code_09',
      userId: 'usr_aria_04',
      userName: 'Aria Lin',
      userPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      text: 'Grabbed a long table near the back power outlets! WiFi is blazing ⚡💻',
      timestamp: 'Today, 12:30'
    }
  ]
};

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act_fifa_01',
    creatorId: 'usr_sasan_01',
    creator: {
      id: 'usr_sasan_01',
      displayName: 'Sasan',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      city: 'Tehran'
    },
    title: '🎮 Need 3 players for FIFA / FC25 tonight 🏆',
    category: 'Gaming',
    description: 'Looking for 3 friendly players for local FC25 tournament / friendly matches. We have cold drinks, snacks, and 4 wireless PS5 controllers ready! 🍕⚡',
    date: 'Today',
    startTime: '20:30',
    durationHours: 2.5,
    approximateLatitude: 35.6907,
    approximateLongitude: 51.3915,
    locationName: 'Level Up Gaming Lounge & Cafe (Public Venue)',
    maxParticipants: 4,
    skillLevel: 'Any',
    visibility: 'Public',
    status: 'upcoming',
    participants: [
      {
        userId: 'usr_sasan_01',
        displayName: 'Sasan',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T15:00:00Z',
        status: 'confirmed',
        checkedIn: false
      },
      {
        userId: 'usr_marcus_03',
        displayName: 'Marcus Vance',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T16:10:00Z',
        status: 'confirmed',
        checkedIn: false
      }
    ],
    createdAt: '2026-08-16T14:00:00Z'
  },
  {
    id: 'act_football_02',
    creatorId: 'usr_marcus_03',
    creator: {
      id: 'usr_marcus_03',
      displayName: 'Marcus Vance',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      city: 'Tehran'
    },
    title: '⚽ Football game Saturday 18:00 (5v5 turf) 🔥',
    category: 'Football',
    description: 'Casual 5v5 turf football. We booked the floodlit turf court for 2 hours. Looking for intermediate players who love passing and fair play! 👟🥅',
    date: 'Saturday',
    startTime: '18:00',
    durationHours: 2,
    approximateLatitude: 35.6832,
    approximateLongitude: 51.4020,
    locationName: 'Volkspark Community Sports Arena (Pitch 2)',
    maxParticipants: 10,
    skillLevel: 'Intermediate',
    visibility: 'Public',
    status: 'upcoming',
    participants: [
      {
        userId: 'usr_marcus_03',
        displayName: 'Marcus Vance',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-15T11:00:00Z',
        status: 'confirmed'
      },
      {
        userId: 'usr_sasan_01',
        displayName: 'Sasan',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-15T12:30:00Z',
        status: 'confirmed'
      },
      {
        userId: 'usr_p_01',
        displayName: 'Lukas Meyer',
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-15T14:20:00Z',
        status: 'confirmed'
      },
      {
        userId: 'usr_p_02',
        displayName: 'Tariq Al-Mansoor',
        profilePhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-15T16:45:00Z',
        status: 'confirmed'
      },
      {
        userId: 'usr_p_03',
        displayName: 'Mateo Rossi',
        profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T09:10:00Z',
        status: 'confirmed'
      },
      {
        userId: 'usr_p_04',
        displayName: 'Jonas Braun',
        profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T11:00:00Z',
        status: 'confirmed'
      }
    ],
    createdAt: '2026-08-15T10:00:00Z'
  },
  {
    id: 'act_gym_03',
    creatorId: 'usr_sasan_01',
    creator: {
      id: 'usr_sasan_01',
      displayName: 'Sasan',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      city: 'Tehran'
    },
    title: '🏋️‍♂️ Push day workout & bench spotter 💪',
    category: 'Gym',
    description: 'Chest, shoulders & triceps push session today. Need a solid spotter for heavy bench press and someone to keep motivation high! 💥🔥',
    date: 'Today',
    startTime: '19:00',
    durationHours: 1.5,
    approximateLatitude: 35.6872,
    approximateLongitude: 51.3750,
    locationName: 'FitHub City Central (Mitte Branch)',
    maxParticipants: 2,
    skillLevel: 'Any',
    visibility: 'Public',
    status: 'upcoming',
    participants: [
      {
        userId: 'usr_sasan_01',
        displayName: 'Sasan',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T12:00:00Z',
        status: 'confirmed'
      }
    ],
    createdAt: '2026-08-16T11:30:00Z'
  },
  {
    id: 'act_basketball_04',
    creatorId: 'usr_marcus_03',
    creator: {
      id: 'usr_marcus_03',
      displayName: 'Marcus Vance',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      city: 'Tehran'
    },
    title: '🏀 Pickup basketball at 7 PM - 3v3 half-court ⛹️',
    category: 'Basketball',
    description: '3v3 pickup half court or 5v5 full court if we get enough players. Bring a light & dark shirt and your A-game! ⚡🎯',
    date: 'Today',
    startTime: '19:00',
    durationHours: 2,
    approximateLatitude: 35.6972,
    approximateLongitude: 51.3820,
    locationName: 'Park am Nordbahnhof Basketball Courts',
    maxParticipants: 8,
    skillLevel: 'Intermediate',
    visibility: 'Public',
    status: 'upcoming',
    participants: [
      {
        userId: 'usr_marcus_03',
        displayName: 'Marcus Vance',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T10:00:00Z',
        status: 'confirmed'
      },
      {
        userId: 'usr_p_05',
        displayName: 'David Chen',
        profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T12:15:00Z',
        status: 'confirmed'
      },
      {
        userId: 'usr_p_06',
        displayName: 'Malik Wright',
        profilePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T13:40:00Z',
        status: 'confirmed'
      }
    ],
    createdAt: '2026-08-16T09:00:00Z'
  },
  {
    id: 'act_chess_05',
    creatorId: 'usr_elena_02',
    creator: {
      id: 'usr_elena_02',
      displayName: 'Elena Rostova',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      city: 'Tehran'
    },
    title: '♟️ Chess & iced coffee @ Garden Cafe ☕',
    category: 'Chess',
    description: 'Casual 10-minute rapid games and blitz over iced coffees. Bringing 2 boards and clocks. Beginners and grandmasters welcome! 👑🧠',
    date: 'Tomorrow',
    startTime: '16:00',
    durationHours: 2.5,
    approximateLatitude: 35.7007,
    approximateLongitude: 51.3990,
    locationName: 'Kastanienallee Garden Cafe (Outdoor Tables)',
    maxParticipants: 6,
    skillLevel: 'Any',
    visibility: 'Public',
    status: 'upcoming',
    participants: [
      {
        userId: 'usr_elena_02',
        displayName: 'Elena Rostova',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T08:00:00Z',
        status: 'confirmed'
      },
      {
        userId: 'usr_sasan_01',
        displayName: 'Sasan',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T11:00:00Z',
        status: 'confirmed'
      },
      {
        userId: 'usr_p_07',
        displayName: 'Viktor K.',
        profilePhoto: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T14:30:00Z',
        status: 'confirmed'
      }
    ],
    createdAt: '2026-08-16T07:45:00Z'
  },
  {
    id: 'act_hike_06',
    creatorId: 'usr_elena_02',
    creator: {
      id: 'usr_elena_02',
      displayName: 'Elena Rostova',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      city: 'Tehran'
    },
    title: '🥾 Scenic lake trail hike & picnic 🌲',
    category: 'Hiking',
    description: 'Scenic 7km peaceful trail walk around the lake. Slow pace with plenty of scenic photo stops and a picnic break halfway! 🥪🎒',
    date: 'Sunday',
    startTime: '10:30',
    durationHours: 3.5,
    approximateLatitude: 35.6642,
    approximateLongitude: 51.3290,
    locationName: 'Grunewald Nature Reserve (Meeting at S-Bahn Station Entrance)',
    maxParticipants: 10,
    skillLevel: 'Beginner',
    visibility: 'Public',
    status: 'upcoming',
    participants: [
      {
        userId: 'usr_elena_02',
        displayName: 'Elena Rostova',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-15T18:00:00Z',
        status: 'confirmed'
      },
      {
        userId: 'usr_p_08',
        displayName: 'Hannah Schmidt',
        profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T08:20:00Z',
        status: 'confirmed'
      },
      {
        userId: 'usr_aria_04',
        displayName: 'Aria Lin',
        profilePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T09:40:00Z',
        status: 'confirmed'
      }
    ],
    createdAt: '2026-08-15T17:00:00Z'
  },
  {
    id: 'act_prog_07',
    creatorId: 'usr_aria_04',
    creator: {
      id: 'usr_aria_04',
      displayName: 'Aria Lin',
      profilePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      city: 'Tehran'
    },
    title: '💻 Weekend indie builders & hack co-working 🚀',
    category: 'Programming',
    description: 'Working on indie projects, AI experiments, or side apps. Bring your laptop! Good Wi-Fi, power outlets, and collaborative discussions! ⚡☕',
    date: 'Tomorrow',
    startTime: '14:00',
    durationHours: 3,
    approximateLatitude: 35.6942,
    approximateLongitude: 51.3720,
    locationName: 'St. Oberholz Coworking Hub (Public Lounge)',
    maxParticipants: 8,
    skillLevel: 'Any',
    visibility: 'Public',
    status: 'upcoming',
    participants: [
      {
        userId: 'usr_aria_04',
        displayName: 'Aria Lin',
        profilePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T09:00:00Z',
        status: 'confirmed'
      },
      {
        userId: 'usr_sasan_01',
        displayName: 'Sasan',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T10:15:00Z',
        status: 'confirmed'
      }
    ],
    createdAt: '2026-08-16T08:30:00Z'
  },
  {
    id: 'act_photo_08',
    creatorId: 'usr_elena_02',
    creator: {
      id: 'usr_elena_02',
      displayName: 'Elena Rostova',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      city: 'Tehran'
    },
    title: '📸 Golden hour & neon street photography walk ✨',
    category: 'Photography',
    description: 'Golden hour city architecture transitioning into blue hour neon lights. Any camera (DSLR, Mirrorless, or smartphone) welcome! 🏙️🎞️',
    date: 'Saturday',
    startTime: '19:30',
    durationHours: 2,
    approximateLatitude: 35.6782,
    approximateLongitude: 51.3600,
    locationName: 'Potsdamer Platz (Sony Center Plaza Fountain)',
    maxParticipants: 6,
    skillLevel: 'Any',
    visibility: 'Public',
    status: 'upcoming',
    participants: [
      {
        userId: 'usr_elena_02',
        displayName: 'Elena Rostova',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-15T15:00:00Z',
        status: 'confirmed'
      }
    ],
    createdAt: '2026-08-15T14:45:00Z'
  },
  {
    id: 'act_music_09',
    creatorId: 'usr_marcus_03',
    creator: {
      id: 'usr_marcus_03',
      displayName: 'Marcus Vance',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      city: 'Tehran'
    },
    title: '🎸 Acoustic guitar & indie jam session 🎶',
    category: 'Music',
    description: 'Acoustic jam in the open park pavilion. Looking for guitars, percussion/cajon, harmonica, or singers. Chords & lyric sheets provided! 🔥🎵',
    date: 'Saturday',
    startTime: '16:00',
    durationHours: 2.5,
    approximateLatitude: 35.6702,
    approximateLongitude: 51.4190,
    locationName: 'Treptower Park (Rose Garden Gazebo)',
    maxParticipants: 5,
    skillLevel: 'Intermediate',
    visibility: 'Public',
    status: 'upcoming',
    participants: [
      {
        userId: 'usr_marcus_03',
        displayName: 'Marcus Vance',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T11:00:00Z',
        status: 'confirmed'
      }
    ],
    createdAt: '2026-08-16T10:20:00Z'
  },
  {
    id: 'act_lang_10',
    creatorId: 'usr_aria_04',
    creator: {
      id: 'usr_aria_04',
      displayName: 'Aria Lin',
      profilePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      city: 'Tehran'
    },
    title: '🗣️ Language exchange: English / Spanish / German ☕',
    category: 'Language Exchange',
    description: 'Casual conversation practice in small table groups. 20 min in one language, then switch. Relaxed, welcoming atmosphere! 🌐💬',
    date: 'Today',
    startTime: '18:30',
    durationHours: 2,
    approximateLatitude: 35.6922,
    approximateLongitude: 51.3980,
    locationName: 'Alexanderplatz Cultural Community Center',
    maxParticipants: 12,
    skillLevel: 'Any',
    visibility: 'Public',
    status: 'upcoming',
    participants: [
      {
        userId: 'usr_aria_04',
        displayName: 'Aria Lin',
        profilePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T09:30:00Z',
        status: 'confirmed'
      },
      {
        userId: 'usr_p_09',
        displayName: 'Claire Dupont',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T12:00:00Z',
        status: 'confirmed'
      },
      {
        userId: 'usr_p_10',
        displayName: 'Marco Benitez',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T13:10:00Z',
        status: 'confirmed'
      }
    ],
    createdAt: '2026-08-16T08:50:00Z'
  },
  {
    id: 'act_boardgames_11',
    creatorId: 'usr_elena_02',
    creator: {
      id: 'usr_elena_02',
      displayName: 'Elena Rostova',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      city: 'Tehran'
    },
    title: '🎲 Board game night: Catan & Codenames 🍕',
    category: 'Board Games',
    description: 'We have Catan with 5-6 player expansion, Codenames, Ticket to Ride, and 7 Wonders. Beginners welcome, rules will be explained! 🃏🥳',
    date: 'Tomorrow',
    startTime: '19:00',
    durationHours: 3,
    approximateLatitude: 35.6982,
    approximateLongitude: 51.3860,
    locationName: 'The Dice & Roll Cafe (Reserved Table #4)',
    maxParticipants: 6,
    skillLevel: 'Any',
    visibility: 'Public',
    status: 'upcoming',
    participants: [
      {
        userId: 'usr_elena_02',
        displayName: 'Elena Rostova',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T10:00:00Z',
        status: 'confirmed'
      },
      {
        userId: 'usr_sasan_01',
        displayName: 'Sasan',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-16T11:45:00Z',
        status: 'confirmed'
      }
    ],
    createdAt: '2026-08-16T09:20:00Z'
  },
  {
    id: 'act_tennis_12',
    creatorId: 'usr_p_01',
    creator: {
      id: 'usr_p_01',
      displayName: 'Lukas Meyer',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      city: 'Tehran'
    },
    title: '🎾 Tennis singles rally & match partner ⚡',
    category: 'Tennis',
    description: 'Looking for an intermediate player (~NTRP 3.5 - 4.0) for rally drills and a friendly 1-set match. Clay court booked! 🏆👟',
    date: 'Saturday',
    startTime: '11:00',
    durationHours: 1.5,
    approximateLatitude: 35.7042,
    approximateLongitude: 51.4090,
    locationName: 'Tiergarten Tennis Club (Court 3)',
    maxParticipants: 2,
    skillLevel: 'Intermediate',
    visibility: 'Public',
    status: 'upcoming',
    participants: [
      {
        userId: 'usr_p_01',
        displayName: 'Lukas Meyer',
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2026-08-15T19:00:00Z',
        status: 'confirmed'
      }
    ],
    createdAt: '2026-08-15T18:30:00Z'
  }
];

export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'comm_fifa_tehran',
    name: 'Tehran FC25 & FIFA Society',
    category: 'Gaming',
    description: 'Local gamers organizing weekend tournaments, co-op leagues, and casual console sessions across cafes and lounges.',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    memberCount: 28,
    members: ['usr_sasan_01', 'usr_marcus_03'],
    location: 'Valiasr & Tajrish',
    activityCount: 4,
    tags: ['FC25', 'PS5', 'Tournaments', 'Casual Gaming']
  },
  {
    id: 'comm_turf_football',
    name: 'Tehran 5v5 & 7v7 Footballers',
    category: 'Football',
    description: 'Friendly turf games twice a week. We split pitch booking costs equally and play fair, competitive football.',
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
    memberCount: 42,
    members: ['usr_sasan_01', 'usr_marcus_03'],
    location: 'Park-e Shahr',
    activityCount: 6,
    tags: ['Turf', '5v5', 'Weekend Matches', 'All Levels']
  },
  {
    id: 'comm_indie_hackers',
    name: 'Tehran Indie Coders & Hackers',
    category: 'Programming',
    description: 'Engineers, designers, and founders meeting for co-working cafes, weekend hack sessions, and side-project feedback.',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    memberCount: 35,
    members: ['usr_sasan_01', 'usr_aria_04'],
    location: 'Betahaus & Mitte Cafes',
    activityCount: 3,
    tags: ['React', 'TypeScript', 'AI', 'Startups']
  },
  {
    id: 'comm_chess_club',
    name: 'Niavaran Chess Circle',
    category: 'Chess',
    description: 'Speed chess, classical analysis, and coffee games in public parks and quiet coffee shops.',
    coverImage: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&auto=format&fit=crop&q=80',
    memberCount: 19,
    members: ['usr_sasan_01', 'usr_marcus_03'],
    location: 'Niavaran & Mitte',
    activityCount: 2,
    tags: ['Blitz', 'Casual', 'Parks', 'Beginner Friendly']
  },
  {
    id: 'comm_sunrise_runners',
    name: 'Mellat Park Sunrise Runners',
    category: 'Running',
    description: 'Early morning 5k and 10k paces through Tiergarten. Social coffee afterwards every Tuesday and Saturday.',
    coverImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=600&auto=format&fit=crop&q=80',
    memberCount: 54,
    members: ['usr_elena_02'],
    location: 'Mellat Park Central',
    activityCount: 5,
    tags: ['5k/10k', 'Morning Run', 'Social Coffee']
  },
  {
    id: 'comm_gym_calisthenics',
    name: 'Gleisdreieck Calisthenics & Gym',
    category: 'Gym',
    description: 'Workout accountability partners, outdoor bar training, and strength conditioning squads.',
    coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
    memberCount: 31,
    members: ['usr_sasan_01'],
    location: 'Park am Gleisdreieck',
    activityCount: 3,
    tags: ['Calisthenics', 'Gym Partners', 'Fitness']
  }
];

// Helper to calculate approximate distance in km (Haversine formula)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Format approximate distance respecting location privacy
export function formatApproximateDistance(distanceKm: number): string {
  if (distanceKm < 0.5) return 'Within 500m';
  if (distanceKm < 1.0) return 'Approximately 800m away';
  return `Approximately ${distanceKm.toFixed(1)} km away`;
}

class NovaStore {
  private activities: Activity[] = [];
  private currentUser: User = INITIAL_USER;
  private allUsers: User[] = PRESET_USERS;
  private communities: Community[] = [];
  private reports: Report[] = [];
  private blocks: Block[] = [];
  private chatMessages: Record<string, ChatMessage[]> = INITIAL_CHAT_MESSAGES;
  private chatLastRead: Record<string, Record<string, string>> = {}; // activityId -> userId -> ISO string
  private reactions: ActivityReactionsData = INITIAL_ACTIVITY_REACTIONS;
  private activePenaltyAlert: AppNotification | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        this.currentUser = {
          ...INITIAL_USER,
          ...parsed,
          reliabilityScore: typeof parsed.reliabilityScore === 'number' ? parsed.reliabilityScore : (typeof parsed.karmaScore === 'number' ? parsed.karmaScore : 100),
          karmaScore: typeof parsed.karmaScore === 'number' ? parsed.karmaScore : (typeof parsed.reliabilityScore === 'number' ? parsed.reliabilityScore : 100),
          penaltyStrikes: typeof parsed.penaltyStrikes === 'number' ? parsed.penaltyStrikes : 0,
          penaltyHistory: Array.isArray(parsed.penaltyHistory) ? parsed.penaltyHistory : [],
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : []
        };
      } else {
        this.currentUser = INITIAL_USER;
        this.saveUser();
      }

      const savedAllUsers = localStorage.getItem(ALL_USERS_KEY);
      if (savedAllUsers) {
        const parsedAll = JSON.parse(savedAllUsers);
        this.allUsers = parsedAll.map((u: User) => ({
          ...u,
          reliabilityScore: typeof u.reliabilityScore === 'number' ? u.reliabilityScore : (typeof u.karmaScore === 'number' ? u.karmaScore : 100),
          karmaScore: typeof u.karmaScore === 'number' ? u.karmaScore : (typeof u.reliabilityScore === 'number' ? u.reliabilityScore : 100),
          penaltyStrikes: typeof u.penaltyStrikes === 'number' ? u.penaltyStrikes : 0,
          penaltyHistory: Array.isArray(u.penaltyHistory) ? u.penaltyHistory : [],
          notifications: Array.isArray(u.notifications) ? u.notifications : []
        }));
      } else {
        this.allUsers = PRESET_USERS;
        this.saveAllUsers();
      }

      const savedActivities = localStorage.getItem(ACTIVITIES_KEY);
      if (savedActivities) {
        this.activities = JSON.parse(savedActivities);
      } else {
        this.activities = INITIAL_ACTIVITIES;
        this.saveActivities();
      }

      const savedCommunities = localStorage.getItem(COMMUNITIES_KEY);
      if (savedCommunities) {
        this.communities = JSON.parse(savedCommunities);
      } else {
        this.communities = INITIAL_COMMUNITIES;
        this.saveCommunities();
      }

      const savedChat = localStorage.getItem(CHAT_KEY);
      if (savedChat) {
        this.chatMessages = JSON.parse(savedChat);
      } else {
        this.chatMessages = INITIAL_CHAT_MESSAGES;
        this.saveChatMessages();
      }

      const savedChatLastRead = localStorage.getItem(CHAT_LAST_READ_KEY);
      if (savedChatLastRead) {
        this.chatLastRead = JSON.parse(savedChatLastRead);
      } else {
        this.chatLastRead = {};
      }

      const savedReactions = localStorage.getItem(REACTIONS_KEY);
      if (savedReactions) {
        this.reactions = JSON.parse(savedReactions);
      } else {
        this.reactions = INITIAL_ACTIVITY_REACTIONS;
        this.saveReactions();
      }

      const savedReports = localStorage.getItem(REPORTS_KEY);
      if (savedReports) {
        this.reports = JSON.parse(savedReports);
      }

      const savedBlocks = localStorage.getItem(BLOCKS_KEY);
      if (savedBlocks) {
        this.blocks = JSON.parse(savedBlocks);
      }
    } catch (e) {
      console.warn('LocalStorage error in NovaStore:', e);
      this.currentUser = INITIAL_USER;
      this.activities = INITIAL_ACTIVITIES;
      this.communities = INITIAL_COMMUNITIES;
      this.chatMessages = INITIAL_CHAT_MESSAGES;
      this.reactions = INITIAL_ACTIVITY_REACTIONS;
      this.allUsers = PRESET_USERS;
    }
  }

  private saveActivities() {
    try {
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(this.activities));
    } catch (e) {
      console.error(e);
    }
    this.notify();
  }

  private saveCommunities() {
    try {
      localStorage.setItem(COMMUNITIES_KEY, JSON.stringify(this.communities));
    } catch (e) {
      console.error(e);
    }
    this.notify();
  }

  private saveUser() {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(this.currentUser));
    } catch (e) {
      console.error(e);
    }
    this.notify();
  }

  private saveAllUsers() {
    try {
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(this.allUsers));
    } catch (e) {
      console.error(e);
    }
    this.notify();
  }

  private saveChatMessages() {
    try {
      localStorage.setItem(CHAT_KEY, JSON.stringify(this.chatMessages));
    } catch (e) {
      console.error(e);
    }
    this.notify();
  }

  private saveChatLastRead() {
    try {
      localStorage.setItem(CHAT_LAST_READ_KEY, JSON.stringify(this.chatLastRead));
    } catch (e) {
      console.error(e);
    }
    this.notify();
  }

  private saveReactions() {
    try {
      localStorage.setItem(REACTIONS_KEY, JSON.stringify(this.reactions));
    } catch (e) {
      console.error(e);
    }
    this.notify();
  }

  private saveReports() {
    try {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(this.reports));
    } catch (e) {
      console.error(e);
    }
    this.notify();
  }

  private saveBlocks() {
    try {
      localStorage.setItem(BLOCKS_KEY, JSON.stringify(this.blocks));
    } catch (e) {
      console.error(e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public setCurrentUser(user: User) {
    this.currentUser = user;
    this.saveUser();
  }

  public getAllUsers(): User[] {
    return this.allUsers;
  }

  public getUserById(userId: string): User | undefined {
    if (userId === this.currentUser.id) return this.currentUser;
    return this.allUsers.find(u => u.id === userId);
  }

  public isFollowing(targetUserId: string): boolean {
    const following = this.currentUser.following || [];
    return following.includes(targetUserId);
  }

  public followUser(targetUserId: string): { success: boolean; message: string } {
    if (targetUserId === this.currentUser.id) {
      return { success: false, message: 'You cannot follow yourself.' };
    }

    const following = new Set(this.currentUser.following || []);
    if (following.has(targetUserId)) {
      return { success: false, message: 'Already following this user.' };
    }

    following.add(targetUserId);
    this.currentUser.following = Array.from(following);
    this.saveUser();

    // Update target user's followers list in allUsers
    const targetUser = this.allUsers.find(u => u.id === targetUserId);
    if (targetUser) {
      const followers = new Set(targetUser.followers || []);
      followers.add(this.currentUser.id);
      targetUser.followers = Array.from(followers);
      this.saveAllUsers();
    }

    return {
      success: true,
      message: `You are now following ${targetUser?.displayName || 'user'}!`
    };
  }

  public unfollowUser(targetUserId: string): { success: boolean; message: string } {
    const following = new Set(this.currentUser.following || []);
    if (!following.has(targetUserId)) {
      return { success: false, message: 'You are not following this user.' };
    }

    following.delete(targetUserId);
    this.currentUser.following = Array.from(following);
    this.saveUser();

    // Update target user's followers in allUsers
    const targetUser = this.allUsers.find(u => u.id === targetUserId);
    if (targetUser) {
      const followers = new Set(targetUser.followers || []);
      followers.delete(this.currentUser.id);
      targetUser.followers = Array.from(followers);
      this.saveAllUsers();
    }

    return {
      success: true,
      message: `Unfollowed ${targetUser?.displayName || 'user'}.`
    };
  }

  public getUserFollowers(userId: string): User[] {
    const target = this.getUserById(userId);
    if (!target) return [];
    const followerIds = target.followers || [];
    return this.allUsers.filter(u => followerIds.includes(u.id));
  }

  public getUserFollowing(userId: string): User[] {
    const target = this.getUserById(userId);
    if (!target) return [];
    const followingIds = target.following || [];
    return this.allUsers.filter(u => followingIds.includes(u.id));
  }

  // ==========================================
  // SQUAD CHAT ACCESS CONTROL & MESSAGING
  // ==========================================

  public canUserAccessChat(
    activityId: string,
    userId: string = this.currentUser.id
  ): { canAccess: boolean; reason?: string; isHost: boolean; isJoined: boolean; activity?: Activity } {
    const activity = this.activities.find(a => a.id === activityId);
    if (!activity) {
      return { canAccess: false, reason: 'Activity not found', isHost: false, isJoined: false };
    }

    if (!userId) {
      return { canAccess: false, reason: 'Authentication required to enter Squad Chat', isHost: false, isJoined: false, activity };
    }

    const isHost = activity.creatorId === userId;
    const isJoined = isHost || activity.participants.some(p => p.userId === userId);

    if (isHost || isJoined) {
      return { canAccess: true, isHost, isJoined: true, activity };
    }

    return {
      canAccess: false,
      reason: 'Only confirmed participants of this VYBE have access to Squad Chat.',
      isHost: false,
      isJoined: false,
      activity
    };
  }

  public getActivityMessages(activityId: string, currentUserId: string = this.currentUser.id): ChatMessage[] {
    const rawList = this.chatMessages[activityId] || [];
    const blockedUserIds = new Set(this.getBlockedUserIds(currentUserId));

    return rawList.filter(msg => {
      if (msg.isSystem) return true;
      if (blockedUserIds.has(msg.userId)) return false;
      return true;
    });
  }

  public sendActivityMessage(
    activityId: string,
    text: string,
    isSystem = false,
    senderOverride?: { id: string; displayName: string; profilePhoto: string }
  ): { success: boolean; message?: ChatMessage; error?: string } {
    const sender = senderOverride || {
      id: this.currentUser.id,
      displayName: this.currentUser.displayName,
      profilePhoto: this.currentUser.profilePhoto
    };

    const activity = this.activities.find(a => a.id === activityId);
    if (!activity) {
      return { success: false, error: 'Activity not found.' };
    }

    // Access control check: user must be participant or creator unless system notification
    if (!isSystem) {
      const access = this.canUserAccessChat(activityId, sender.id);
      if (!access.canAccess) {
        return { success: false, error: access.reason || 'You do not have access to this Squad Chat.' };
      }

      // Check if activity is cancelled
      if (activity.status === 'cancelled') {
        return { success: false, error: 'This VYBE has been cancelled by the host. Squad Chat is read-only.' };
      }
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return { success: false, error: 'Message cannot be empty.' };
    }

    if (trimmed.length > 1000) {
      return { success: false, error: 'Message cannot exceed 1,000 characters.' };
    }

    const now = new Date();
    const timeStr = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);

    const isHost = activity.creatorId === sender.id;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      activityId,
      userId: isSystem ? 'system' : sender.id,
      userName: isSystem ? 'VYBE Squad' : sender.displayName,
      userPhoto: isSystem
        ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
        : sender.profilePhoto,
      text: trimmed,
      timestamp: `Today, ${timeStr}`,
      createdAt: now.toISOString(),
      isSystem,
      isHost
    };

    const currentList = this.chatMessages[activityId] || [];
    this.chatMessages = {
      ...this.chatMessages,
      [activityId]: [...currentList, newMessage]
    };
    this.saveChatMessages();

    // Mark as read for the sender
    if (!isSystem && sender.id) {
      this.markActivityChatAsRead(activityId, sender.id);
    }

    return { success: true, message: newMessage };
  }

  public deleteActivityMessage(
    activityId: string,
    messageId: string,
    userId: string = this.currentUser.id
  ): { success: boolean; error?: string } {
    const list = this.chatMessages[activityId] || [];
    const msgIndex = list.findIndex(m => m.id === messageId);

    if (msgIndex === -1) {
      return { success: false, error: 'Message not found.' };
    }

    const msg = list[msgIndex];
    if (msg.userId !== userId && !msg.isSystem) {
      return { success: false, error: 'You can only delete your own messages.' };
    }

    this.chatMessages = {
      ...this.chatMessages,
      [activityId]: list.filter(m => m.id !== messageId)
    };
    this.saveChatMessages();
    return { success: true };
  }

  public markActivityChatAsRead(activityId: string, userId: string = this.currentUser.id): void {
    if (!userId || !activityId) return;
    const nowIso = new Date().toISOString();
    this.chatLastRead = {
      ...this.chatLastRead,
      [activityId]: {
        ...(this.chatLastRead[activityId] || {}),
        [userId]: nowIso
      }
    };
    this.saveChatLastRead();
  }

  public getUnreadMessageCount(activityId: string, userId: string = this.currentUser.id): number {
    if (!userId) return 0;
    const access = this.canUserAccessChat(activityId, userId);
    if (!access.canAccess) return 0;

    const list = this.getActivityMessages(activityId, userId);
    const lastReadIso = this.chatLastRead[activityId]?.[userId];

    if (!lastReadIso) {
      // If never opened, count all messages not sent by this user
      return list.filter(m => m.userId !== userId && !m.isSystem).length;
    }

    const lastReadTime = new Date(lastReadIso).getTime();
    return list.filter(m => {
      if (m.userId === userId) return false;
      if (m.isSystem) return false;
      const msgTime = m.createdAt ? new Date(m.createdAt).getTime() : 0;
      return msgTime > lastReadTime;
    }).length;
  }

  public getTotalUnreadChatCount(userId: string = this.currentUser.id): number {
    if (!userId) return 0;
    const myActivities = this.activities.filter(
      a => a.creatorId === userId || a.participants.some(p => p.userId === userId)
    );

    return myActivities.reduce((acc, act) => acc + this.getUnreadMessageCount(act.id, userId), 0);
  }

  public receiveRealtimeChatMessage(activityId: string, message: ChatMessage): void {
    const currentList = this.chatMessages[activityId] || [];
    if (currentList.some(m => m.id === message.id)) return; // prevent duplicate

    this.chatMessages = {
      ...this.chatMessages,
      [activityId]: [...currentList, message]
    };
    this.saveChatMessages();
  }

  public updateUserProfile(updates: Partial<User>) {
    this.currentUser = {
      ...this.currentUser,
      ...updates
    };
    this.saveUser();
  }

  public getActivities(): Activity[] {
    const blockedUserIds = new Set(
      this.blocks
        .filter(b => b.blockerId === this.currentUser.id)
        .map(b => b.blockedUserId)
    );

    return this.activities.filter(act => !blockedUserIds.has(act.creatorId));
  }

  public getActivityById(id: string): Activity | undefined {
    return this.activities.find(a => a.id === id);
  }

  public createActivity(
    data: Omit<Activity, 'id' | 'creatorId' | 'creator' | 'participants' | 'createdAt' | 'status'>
  ): Activity {
    const newActivity: Activity = {
      ...data,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      creatorId: this.currentUser.id,
      creator: {
        id: this.currentUser.id,
        displayName: this.currentUser.displayName,
        profilePhoto: this.currentUser.profilePhoto,
        city: this.currentUser.city
      },
      status: 'upcoming',
      participants: [
        {
          userId: this.currentUser.id,
          displayName: this.currentUser.displayName,
          profilePhoto: this.currentUser.profilePhoto,
          joinedAt: new Date().toISOString(),
          status: 'confirmed'
        }
      ],
      createdAt: new Date().toISOString()
    };

    this.activities = [newActivity, ...this.activities];
    this.currentUser.createdActivitiesCount = (this.currentUser.createdActivitiesCount || 0) + 1;
    this.saveUser();
    this.saveActivities();

    // Create initial welcome message
    this.sendActivityMessage(
      newActivity.id,
      `🎯 Activity created by ${this.currentUser.displayName}! Meeting at: ${newActivity.locationName}`,
      true
    );

    return newActivity;
  }

  public joinActivity(activityId: string): { success: boolean; message: string } {
    const activity = this.activities.find(a => a.id === activityId);
    if (!activity) {
      return { success: false, message: 'Activity not found' };
    }

    if (activity.status === 'cancelled') {
      return { success: false, message: 'This activity has been cancelled by the host.' };
    }

    const alreadyJoined = activity.participants.some(p => p.userId === this.currentUser.id);
    if (alreadyJoined) {
      return { success: false, message: 'You have already joined this activity.' };
    }

    if (activity.participants.length >= activity.maxParticipants) {
      return { success: false, message: 'This activity is already at maximum capacity.' };
    }

    activity.participants.push({
      userId: this.currentUser.id,
      displayName: this.currentUser.displayName,
      profilePhoto: this.currentUser.profilePhoto,
      joinedAt: new Date().toISOString(),
      status: 'confirmed',
      reliabilityScore: this.currentUser.reliabilityScore ?? 100,
      penaltyStrikes: this.currentUser.penaltyStrikes ?? 0
    });

    this.currentUser.joinedActivitiesCount = (this.currentUser.joinedActivitiesCount || 0) + 1;
    this.saveUser();
    this.saveActivities();

    // Send system announcement in activity chat
    this.sendActivityMessage(
      activityId,
      `👋 ${this.currentUser.displayName} joined the squad!`,
      true
    );

    return { success: true, message: 'Successfully joined activity! Chat room unlocked.' };
  }

  public leaveActivity(
    activityId: string,
    options?: boolean | { applyPenalty?: boolean; reason?: string; penaltyPoints?: number }
  ): { success: boolean; message: string; penaltyApplied?: boolean; penaltyPoints?: number } {
    const activity = this.activities.find(a => a.id === activityId);
    if (!activity) {
      return { success: false, message: 'Activity not found' };
    }

    const initialLength = activity.participants.length;
    activity.participants = activity.participants.filter(p => p.userId !== this.currentUser.id);

    if (activity.participants.length < initialLength) {
      this.currentUser.joinedActivitiesCount = Math.max(0, (this.currentUser.joinedActivitiesCount || 1) - 1);
      
      const shouldPenalize = typeof options === 'boolean' ? options : options?.applyPenalty;
      const customPoints = typeof options === 'object' ? options.penaltyPoints : undefined;
      const customReason = typeof options === 'object' ? options.reason : undefined;

      let penaltyApplied = false;
      const penaltyPoints = customPoints ?? (shouldPenalize ? 5 : 0);

      if (shouldPenalize && penaltyPoints > 0) {
        penaltyApplied = true;
        const oldKarma = this.currentUser.reliabilityScore ?? 100;
        const newKarma = Math.max(0, oldKarma - penaltyPoints);
        this.currentUser.reliabilityScore = newKarma;
        this.currentUser.karmaScore = newKarma;
        this.currentUser.penaltyStrikes = (this.currentUser.penaltyStrikes ?? 0) + 1;
        
        const record: PenaltyRecord = {
          id: `pen_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          activityId,
          activityTitle: activity.title,
          reason: customReason || 'Late cancellation (<2h before start)',
          reasonKey: 'late_cancellation',
          penaltyPoints,
          date: new Date().toISOString().split('T')[0],
          imposedBy: 'system'
        };

        this.currentUser.penaltyHistory = [record, ...(this.currentUser.penaltyHistory || [])];

        const notif: AppNotification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: this.currentUser.id,
          type: 'penalty',
          title: 'Karma Penalty Incurred',
          message: `You received a -${penaltyPoints} Karma deduction for dropping out of "${activity.title}" on short notice.`,
          activityId,
          activityTitle: activity.title,
          penaltyRecord: record,
          previousKarma: oldKarma,
          newKarma,
          karmaDeduction: penaltyPoints,
          timestamp: 'Just now',
          isRead: false
        };

        this.currentUser.notifications = [notif, ...(this.currentUser.notifications || [])];
        this.activePenaltyAlert = notif;
      }

      this.saveUser();
      this.saveActivities();
      this.notify();

      // Post leave notice
      this.sendActivityMessage(
        activityId,
        `🏃 ${this.currentUser.displayName} left the activity.${penaltyApplied ? ` (Late cancellation penalty: -${penaltyPoints} pts)` : ''}`,
        true
      );

      return {
        success: true,
        message: penaltyApplied
          ? `Left activity. ${penaltyPoints} points late cancellation penalty applied.`
          : 'Left the activity.',
        penaltyApplied,
        penaltyPoints
      };
    }

    return { success: false, message: 'You were not a participant.' };
  }

  public removeParticipantByHost(
    activityId: string,
    targetUserId: string,
    reasonKey: PenaltyReason,
    penaltyPoints: number,
    reasonText: string
  ): { success: boolean; message: string } {
    const activity = this.activities.find(a => a.id === activityId);
    if (!activity) {
      return { success: false, message: 'Activity not found.' };
    }

    if (activity.creatorId !== this.currentUser.id) {
      return { success: false, message: 'Only the host can remove participants.' };
    }

    const participant = activity.participants.find(p => p.userId === targetUserId);
    if (!participant) {
      return { success: false, message: 'Participant not found in this activity.' };
    }

    // Remove from activity
    activity.participants = activity.participants.filter(p => p.userId !== targetUserId);

    // Apply penalty to the target user
    let targetUserName = participant.displayName;
    const updateTargetUser = (user: User) => {
      user.joinedActivitiesCount = Math.max(0, (user.joinedActivitiesCount || 1) - 1);
      if (penaltyPoints > 0) {
        const oldScore = user.reliabilityScore ?? 100;
        const newScore = Math.max(0, oldScore - penaltyPoints);
        user.reliabilityScore = newScore;
        user.karmaScore = newScore;
        user.penaltyStrikes = (user.penaltyStrikes ?? 0) + 1;
        
        const record: PenaltyRecord = {
          id: `pen_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          activityId,
          activityTitle: activity.title,
          reason: reasonText,
          reasonKey,
          penaltyPoints,
          date: new Date().toISOString().split('T')[0],
          imposedBy: 'host',
          hostName: this.currentUser.displayName
        };
        user.penaltyHistory = [record, ...(user.penaltyHistory || [])];

        const notif: AppNotification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: user.id,
          type: 'penalty',
          title: 'Karma Penalty Imposed by Host',
          message: `Host ${this.currentUser.displayName} removed you from "${activity.title}" with a -${penaltyPoints} Karma deduction. Reason: ${reasonText}`,
          activityId,
          activityTitle: activity.title,
          penaltyRecord: record,
          previousKarma: oldScore,
          newKarma: newScore,
          karmaDeduction: penaltyPoints,
          timestamp: 'Just now',
          isRead: false
        };
        user.notifications = [notif, ...(user.notifications || [])];

        if (user.id === this.currentUser.id) {
          this.activePenaltyAlert = notif;
        }
      }
    };

    if (targetUserId === this.currentUser.id) {
      updateTargetUser(this.currentUser);
      this.saveUser();
    } else {
      const foundInAll = this.allUsers.find(u => u.id === targetUserId);
      if (foundInAll) {
        targetUserName = foundInAll.displayName;
        updateTargetUser(foundInAll);
        this.saveAllUsers();
      }
    }

    this.saveActivities();
    this.notify();

    // Post notice to squad chat
    this.sendActivityMessage(
      activityId,
      `⚠️ Host ${this.currentUser.displayName} removed ${targetUserName} from the activity. (Reason: ${reasonText}${penaltyPoints > 0 ? ` · -${penaltyPoints} penalty applied` : ' · No penalty'})`,
      true
    );

    return {
      success: true,
      message: `Removed ${targetUserName} from activity.${penaltyPoints > 0 ? ` Applied -${penaltyPoints} penalty.` : ''}`
    };
  }

  public cancelActivity(activityId: string, reason?: string): boolean {
    const activity = this.activities.find(a => a.id === activityId);
    if (!activity || activity.creatorId !== this.currentUser.id) {
      return false;
    }

    activity.status = 'cancelled';
    this.saveActivities();

    // Send system broadcast
    this.sendActivityMessage(
      activityId,
      `🚨 Activity cancelled by host ${this.currentUser.displayName}.${reason ? ` Reason: ${reason}` : ''}`,
      true
    );

    return true;
  }

  public completeActivity(activityId: string): { success: boolean; message: string; completedActivity?: Activity } {
    const activity = this.activities.find(a => a.id === activityId);
    if (!activity) {
      return { success: false, message: 'Activity not found.' };
    }

    activity.status = 'completed';

    // Award +5 Karma for successful attendance / hosting if score < 100
    if ((this.currentUser.reliabilityScore ?? 100) < 100) {
      this.currentUser.reliabilityScore = Math.min(100, (this.currentUser.reliabilityScore ?? 100) + 5);
      this.currentUser.karmaScore = this.currentUser.reliabilityScore;
    }

    this.saveUser();
    this.saveActivities();
    this.notify();

    // Broadcast system message in activity chat
    this.sendActivityMessage(
      activityId,
      `🏁 Activity concluded! Thank you to all squad members for attending.`,
      true
    );

    return {
      success: true,
      message: `Activity "${activity.title}" marked as completed!`,
      completedActivity: activity
    };
  }

  public deleteActivity(activityId: string): { success: boolean; message: string } {
    const index = this.activities.findIndex(a => a.id === activityId && a.creatorId === this.currentUser.id);
    if (index === -1) {
      return { success: false, message: 'Activity not found or you are not the host.' };
    }

    const [deleted] = this.activities.splice(index, 1);
    this.currentUser.createdActivitiesCount = Math.max(0, (this.currentUser.createdActivitiesCount || 1) - 1);
    
    // Clean up chat & reactions
    delete this.chatMessages[activityId];
    delete this.reactions[activityId];
    
    this.saveUser();
    this.saveActivities();
    this.saveChatMessages();
    this.saveReactions();
    return { success: true, message: `Activity "${deleted.title}" permanently removed.` };
  }

  public report(report: Omit<Report, 'id' | 'reporterId' | 'createdAt' | 'status'>): Report {
    const newReport: Report = {
      ...report,
      id: `rep_${Date.now()}`,
      reporterId: this.currentUser.id,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    this.reports = [newReport, ...this.reports];
    this.saveReports();
    return newReport;
  }

  public blockUser(targetUserId: string): Block {
    const newBlock: Block = {
      id: `blk_${Date.now()}`,
      blockerId: this.currentUser.id,
      blockedUserId: targetUserId,
      createdAt: new Date().toISOString()
    };
    this.blocks = [newBlock, ...this.blocks];
    this.saveBlocks();
    return newBlock;
  }

  public unblockUser(targetUserId: string): boolean {
    const initialLen = this.blocks.length;
    this.blocks = this.blocks.filter(b => !(b.blockerId === this.currentUser.id && b.blockedUserId === targetUserId));
    if (this.blocks.length < initialLen) {
      this.saveBlocks();
      return true;
    }
    return false;
  }

  public getBlockedUserIds(userId: string = this.currentUser.id): string[] {
    return this.blocks
      .filter(b => b.blockerId === userId)
      .map(b => b.blockedUserId);
  }

  public getCommunities(): Community[] {
    return this.communities;
  }

  public getCommunityById(id: string): Community | undefined {
    return this.communities.find(c => c.id === id);
  }

  public joinCommunity(communityId: string): { success: boolean; message: string } {
    const community = this.communities.find(c => c.id === communityId);
    if (!community) {
      return { success: false, message: 'Community not found' };
    }

    if (community.members.includes(this.currentUser.id)) {
      return { success: false, message: 'Already a member of this community.' };
    }

    community.members.push(this.currentUser.id);
    community.memberCount += 1;
    this.saveCommunities();
    return { success: true, message: `Joined ${community.name}!` };
  }

  public leaveCommunity(communityId: string): { success: boolean; message: string } {
    const community = this.communities.find(c => c.id === communityId);
    if (!community) {
      return { success: false, message: 'Community not found' };
    }

    if (!community.members.includes(this.currentUser.id)) {
      return { success: false, message: 'You are not a member of this community.' };
    }

    community.members = community.members.filter(id => id !== this.currentUser.id);
    community.memberCount = Math.max(0, community.memberCount - 1);
    this.saveCommunities();
    return { success: true, message: `Left ${community.name}.` };
  }

  public getActivityReactions(activityId: string): Record<string, number> {
    const actReactions = this.reactions[activityId] || {};
    const result: Record<string, number> = {};
    for (const [emoji, users] of Object.entries(actReactions)) {
      if (users.length > 0) {
        result[emoji] = users.length;
      }
    }
    return result;
  }

  public getUserReactedEmojis(activityId: string, userId: string = this.currentUser.id): string[] {
    const actReactions = this.reactions[activityId] || {};
    const reacted: string[] = [];
    for (const [emoji, users] of Object.entries(actReactions)) {
      if (users.includes(userId)) {
        reacted.push(emoji);
      }
    }
    return reacted;
  }

  public toggleActivityReaction(activityId: string, emoji: string, userId: string = this.currentUser.id): { added: boolean } {
    if (!this.reactions[activityId]) {
      this.reactions[activityId] = {};
    }
    if (!this.reactions[activityId][emoji]) {
      this.reactions[activityId][emoji] = [];
    }

    const userList = this.reactions[activityId][emoji];
    const existsIndex = userList.indexOf(userId);
    let added = false;

    if (existsIndex > -1) {
      // remove reaction
      this.reactions[activityId][emoji].splice(existsIndex, 1);
      added = false;
    } else {
      // add reaction
      this.reactions[activityId][emoji].push(userId);
      added = true;
    }

    this.saveReactions();
    return { added };
  }

  public getActivePenaltyAlert(): AppNotification | null {
    return this.activePenaltyAlert;
  }

  public setActivePenaltyAlert(alert: AppNotification | null): void {
    this.activePenaltyAlert = alert;
    this.notify();
  }

  public clearActivePenaltyAlert(): void {
    this.activePenaltyAlert = null;
    this.notify();
  }

  public getUserNotifications(userId?: string): AppNotification[] {
    const uid = userId || this.currentUser.id;
    if (uid === this.currentUser.id) {
      return this.currentUser.notifications || [];
    }
    const user = this.allUsers.find(u => u.id === uid);
    return user?.notifications || [];
  }

  public getUnreadNotificationCount(): number {
    const notifs = this.currentUser.notifications || [];
    return notifs.filter(n => !n.isRead).length;
  }

  public markNotificationAsRead(notifId: string): void {
    if (this.currentUser.notifications) {
      this.currentUser.notifications = this.currentUser.notifications.map(n =>
        n.id === notifId ? { ...n, isRead: true } : n
      );
      this.saveUser();
      this.notify();
    }
  }

  public markAllNotificationsAsRead(): void {
    if (this.currentUser.notifications) {
      this.currentUser.notifications = this.currentUser.notifications.map(n => ({ ...n, isRead: true }));
      this.saveUser();
      this.notify();
    }
  }

  public clearAllNotifications(): void {
    this.currentUser.notifications = [];
    this.saveUser();
    this.notify();
  }

  public triggerTestPenaltyAlert(customReason?: string, customPoints: number = 10): AppNotification {
    const oldKarma = this.currentUser.reliabilityScore ?? 100;
    const newKarma = Math.max(0, oldKarma - customPoints);
    this.currentUser.reliabilityScore = newKarma;
    this.currentUser.karmaScore = newKarma;
    this.currentUser.penaltyStrikes = (this.currentUser.penaltyStrikes ?? 0) + 1;

    const sampleActivity = this.activities[0] || {
      id: 'act_fifa_01',
      title: '5v5 Indoor Futsal Match'
    };

    const record: PenaltyRecord = {
      id: `pen_${Date.now()}_test`,
      activityId: sampleActivity.id,
      activityTitle: sampleActivity.title,
      reason: customReason || 'Late cancellation (<2 hours prior to start)',
      reasonKey: 'late_cancellation',
      penaltyPoints: customPoints,
      date: new Date().toISOString().split('T')[0],
      imposedBy: 'system',
      hostName: 'System Fair-Play Guard'
    };

    this.currentUser.penaltyHistory = [record, ...(this.currentUser.penaltyHistory || [])];

    const notif: AppNotification = {
      id: `notif_${Date.now()}_test`,
      userId: this.currentUser.id,
      type: 'penalty',
      title: 'Karma Penalty Incurred',
      message: `You received a -${customPoints} Karma deduction for late cancellation of "${sampleActivity.title}".`,
      activityId: sampleActivity.id,
      activityTitle: sampleActivity.title,
      penaltyRecord: record,
      previousKarma: oldKarma,
      newKarma,
      karmaDeduction: customPoints,
      timestamp: 'Just now',
      isRead: false
    };

    this.currentUser.notifications = [notif, ...(this.currentUser.notifications || [])];
    this.activePenaltyAlert = notif;
    this.saveUser();
    this.notify();
    return notif;
  }

  // ==========================================
  // ATTENDANCE & NO-SHOW VERIFICATION SYSTEM
  // ==========================================

  public checkInParticipant(
    activityId: string,
    participantUserId: string
  ): { success: boolean; refunded?: boolean; message: string } {
    const activity = this.activities.find(a => a.id === activityId);
    if (!activity) {
      return { success: false, refunded: false, message: 'Activity not found.' };
    }

    const participant = activity.participants.find(p => p.userId === participantUserId);
    if (!participant) {
      return { success: false, refunded: false, message: 'Participant not in roster.' };
    }

    participant.checkedIn = true;
    participant.checkedInAt = new Date().toISOString();

    this.saveActivities();
    this.saveUser();
    this.notify();

    this.sendActivityMessage(
      activityId,
      `✅ Host verified attendance for ${participant.displayName}!`,
      true
    );

    return {
      success: true,
      refunded: false,
      message: `Checked in ${participant.displayName}! Attendance verified.`
    };
  }

  public penalizeNoShowWithPayout(
    activityId: string,
    targetUserId: string
  ): { success: boolean; hostEarnings: number; fee: number; message: string } {
    return this.penalizeNoShow(activityId, targetUserId);
  }

  public penalizeNoShow(
    activityId: string,
    targetUserId: string
  ): { success: boolean; hostEarnings: number; fee: number; message: string } {
    const activity = this.activities.find(a => a.id === activityId);
    if (!activity) {
      return { success: false, hostEarnings: 0, fee: 0, message: 'Activity not found.' };
    }

    const participant = activity.participants.find(p => p.userId === targetUserId);
    if (!participant) {
      return { success: false, hostEarnings: 0, fee: 0, message: 'Participant not found.' };
    }

    const targetUser = this.allUsers.find(u => u.id === targetUserId);
    const targetName = participant.displayName || targetUser?.displayName || 'Attendee';

    // Apply Karma Penalty to flaker
    const penaltyPoints = 15;
    if (targetUser) {
      const oldKarma = targetUser.reliabilityScore ?? 100;
      const newKarma = Math.max(0, oldKarma - penaltyPoints);
      targetUser.reliabilityScore = newKarma;
      targetUser.karmaScore = newKarma;
      targetUser.penaltyStrikes = (targetUser.penaltyStrikes ?? 0) + 1;

      const record: PenaltyRecord = {
        id: `pen_${Date.now()}_noshow`,
        activityId,
        activityTitle: activity.title,
        reason: 'Unexcused No-Show (-15 Karma)',
        reasonKey: 'no_show',
        penaltyPoints,
        date: new Date().toISOString().split('T')[0],
        imposedBy: 'host',
        hostName: this.currentUser.displayName
      };

      targetUser.penaltyHistory = [record, ...(targetUser.penaltyHistory || [])];
      this.saveAllUsers();
    }

    this.saveActivities();
    this.saveUser();
    this.notify();

    this.sendActivityMessage(
      activityId,
      `⚠️ ${targetName} was marked as No-Show. (-15 Karma penalty applied.)`,
      true
    );

    return {
      success: true,
      hostEarnings: 0,
      fee: 0,
      message: `No-Show logged for ${targetName}. -15 Karma penalty applied.`
    };
  }

  public resetToSampleData() {
    this.activities = INITIAL_ACTIVITIES;
    this.currentUser = INITIAL_USER;
    this.communities = INITIAL_COMMUNITIES;
    this.reactions = INITIAL_ACTIVITY_REACTIONS;
    this.reports = [];
    this.blocks = [];
    this.saveActivities();
    this.saveUser();
    this.saveCommunities();
    this.saveReactions();
    this.saveReports();
    this.saveBlocks();
  }
}

export const novaStore = new NovaStore();
export const store = novaStore;
