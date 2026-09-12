import { ActivityCategory } from '../types';

export interface CategoryMeta {
  id: ActivityCategory;
  name: string;
  emoji: string;
  emojiPair: string;
  iconName: string;
  color: string;
  bgGlow: string;
  borderHover: string;
  suggestedTitles: string[];
  emojiSuggestions: string[];
  defaultDuration: number;
  defaultMaxParticipants: number;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'Gaming',
    name: 'Gaming',
    emoji: '🎮',
    emojiPair: '🎮 ⚡',
    iconName: 'Gamepad2',
    color: 'text-violet-400',
    bgGlow: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
    borderHover: 'hover:border-violet-500/50',
    suggestedTitles: [
      '🎮 Need 3 players for FIFA / FC25 tonight 🏆',
      '🕹️ Smash Bros tournament & chill hangout 🍕',
      '🔥 Valorant 5-stack competitive evening ⚡',
      '👾 Co-op Helldivers / RPG squad session 🚀'
    ],
    emojiSuggestions: ['🎮', '🕹️', '🏆', '🔥', '👾', '⚡', '🍕', '🎧'],
    defaultDuration: 2.5,
    defaultMaxParticipants: 4
  },
  {
    id: 'Football',
    name: 'Football',
    emoji: '⚽',
    emojiPair: '⚽ 🔥',
    iconName: 'Trophy',
    color: 'text-emerald-400',
    bgGlow: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    borderHover: 'hover:border-emerald-500/50',
    suggestedTitles: [
      '⚽ Football game Saturday 18:00 (5v5 turf) 🔥',
      '🥅 Casual turf football match - all welcome 👟',
      '🏆 Sunday morning 7v7 friendly scrimmage ⚡',
      '🧤 Need 2 defenders & a keeper for evening league ⚽'
    ],
    emojiSuggestions: ['⚽', '🥅', '🔥', '👟', '🏆', '🧤', '⚡', '🍻'],
    defaultDuration: 1.5,
    defaultMaxParticipants: 10
  },
  {
    id: 'Basketball',
    name: 'Basketball',
    emoji: '🏀',
    emojiPair: '🏀 ⛹️',
    iconName: 'Dumbbell',
    color: 'text-orange-400',
    bgGlow: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    borderHover: 'hover:border-orange-500/50',
    suggestedTitles: [
      '🏀 Pickup basketball at 7 PM - 3v3 half-court ⛹️',
      '🔥 Outdoor park pickup hoops - all levels welcome 👟',
      '🎯 Shooting drills & scrimmage weekend 🏀',
      '⚡ Looking for 4 players for evening court run 🏆'
    ],
    emojiSuggestions: ['🏀', '⛹️', '🔥', '🎯', '👟', '⚡', '🏆', '🥤'],
    defaultDuration: 2,
    defaultMaxParticipants: 6
  },
  {
    id: 'Tennis',
    name: 'Tennis',
    emoji: '🎾',
    emojiPair: '🎾 ⚡',
    iconName: 'CircleDot',
    color: 'text-lime-400',
    bgGlow: 'bg-lime-500/10 text-lime-300 border-lime-500/30',
    borderHover: 'hover:border-lime-500/50',
    suggestedTitles: [
      '🎾 Singles rally partner (Intermediate ~3.5) ⚡',
      '🏆 Doubles tennis Sunday morning matches 🎾',
      '🎾 Beginner friendly tennis practice & drills 👟',
      '🔥 Looking for a hitting partner (1-2 hrs) 🎾'
    ],
    emojiSuggestions: ['🎾', '⚡', '🏆', '👟', '🔥', '🎯', '💪', '🥤'],
    defaultDuration: 1.5,
    defaultMaxParticipants: 2
  },
  {
    id: 'Running',
    name: 'Running',
    emoji: '🏃‍♂️',
    emojiPair: '🏃‍♂️ 💨',
    iconName: 'Activity',
    color: 'text-cyan-400',
    bgGlow: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    borderHover: 'hover:border-cyan-500/50',
    suggestedTitles: [
      '🏃‍♂️ Morning 5K riverside jog (Easy 5:45 pace) 🌅',
      '💨 Tempo 10K running group meetup ⚡',
      '👟 Beginner couch-to-5K weekly run & coffee ☕',
      '🌇 Sunset interval training session 🏃‍♀️'
    ],
    emojiSuggestions: ['🏃‍♂️', '🏃‍♀️', '💨', '👟', '🌅', '⚡', '☕', '🏅'],
    defaultDuration: 1,
    defaultMaxParticipants: 8
  },
  {
    id: 'Gym',
    name: 'Gym & Fitness',
    emoji: '🏋️‍♂️',
    emojiPair: '🏋️‍♂️ 💪',
    iconName: 'Dumbbell',
    color: 'text-rose-400',
    bgGlow: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    borderHover: 'hover:border-rose-500/50',
    suggestedTitles: [
      '🏋️‍♂️ Looking for a push day & bench spotter 💪',
      '🔥 Calisthenics & pull-up park workout 💥',
      '⚡ CrossFit style HIIT partner workout 🏋️',
      '💪 Leg day motivation partner tonight 🔥'
    ],
    emojiSuggestions: ['🏋️‍♂️', '💪', '🔥', '💥', '⚡', '🥤', '🎯', '👊'],
    defaultDuration: 1.5,
    defaultMaxParticipants: 2
  },
  {
    id: 'Hiking',
    name: 'Hiking',
    emoji: '🥾',
    emojiPair: '🥾 🌲',
    iconName: 'Compass',
    color: 'text-amber-400',
    bgGlow: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    borderHover: 'hover:border-amber-500/50',
    suggestedTitles: [
      '🥾 Beginner scenic trail hiking group 🌲',
      '🏔️ Saturday morning ridge hike & summit picnic 🥪',
      '🎒 Moderate 8km nature walk with photo stops 📸',
      '🌅 Sunset viewpoint trek & tea hangout 🥾'
    ],
    emojiSuggestions: ['🥾', '🌲', '🏔️', '🎒', '📸', '🥪', '🌅', '🍃'],
    defaultDuration: 3.5,
    defaultMaxParticipants: 8
  },
  {
    id: 'Cycling',
    name: 'Cycling',
    emoji: '🚴‍♂️',
    emojiPair: '🚴‍♂️ 💨',
    iconName: 'Bike',
    color: 'text-teal-400',
    bgGlow: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    borderHover: 'hover:border-teal-500/50',
    suggestedTitles: [
      '🚴‍♂️ Road cycling 30km group ride (22-25 km/h) 💨',
      '🚲 Casual city cruise & coffee stop ☕',
      '🌲 Gravel trail weekend exploration 🚴',
      '🌃 Night cycling along city waterfront ⚡'
    ],
    emojiSuggestions: ['🚴‍♂️', '🚲', '💨', '⚡', '☕', '🌲', '🌃', '🏅'],
    defaultDuration: 2,
    defaultMaxParticipants: 6
  },
  {
    id: 'Chess',
    name: 'Chess',
    emoji: '♟️',
    emojiPair: '♟️ 👑',
    iconName: 'Crown',
    color: 'text-yellow-400',
    bgGlow: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
    borderHover: 'hover:border-yellow-500/50',
    suggestedTitles: [
      '♟️ Chess players wanted @ Garden Cafe ☕',
      '⚡ Blitz & Rapid chess afternoon (10+0) 👑',
      '🧠 Tactics study & friendly games for beginners ♟️',
      '🌳 Outdoor park chess board matches ♟️'
    ],
    emojiSuggestions: ['♟️', '👑', '🧠', '☕', '⚡', '🎯', '🏆', '🌳'],
    defaultDuration: 2,
    defaultMaxParticipants: 4
  },
  {
    id: 'Board Games',
    name: 'Board Games',
    emoji: '🎲',
    emojiPair: '🎲 🃏',
    iconName: 'Dice5',
    color: 'text-pink-400',
    bgGlow: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
    borderHover: 'hover:border-pink-500/50',
    suggestedTitles: [
      '🎲 Board game night: Catan / Ticket to Ride 🍕',
      '🃏 Strategy board games meetup @ Game Cafe 🏰',
      '🎉 Party games night (Codenames, Secret Hitler) 🥳',
      '🐉 Dungeons & Dragons one-shot adventure ⚔️'
    ],
    emojiSuggestions: ['🎲', '🃏', '🍕', '🏰', '🎉', '🥳', '🐉', '⚔️'],
    defaultDuration: 3,
    defaultMaxParticipants: 6
  },
  {
    id: 'Study',
    name: 'Study & Work',
    emoji: '📚',
    emojiPair: '📚 ☕',
    iconName: 'BookOpen',
    color: 'text-sky-400',
    bgGlow: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    borderHover: 'hover:border-sky-500/50',
    suggestedTitles: [
      '📚 Focus study & Pomodoro co-working @ City Library ☕',
      '📖 University exam preparation group 🧠',
      '☕ Deep work session with coffee & quiet vibes ✨',
      '📑 Reading club & thought discussion 📚'
    ],
    emojiSuggestions: ['📚', '☕', '🧠', '✨', '📖', '📑', '🎧', '💡'],
    defaultDuration: 3,
    defaultMaxParticipants: 5
  },
  {
    id: 'Programming',
    name: 'Programming',
    emoji: '💻',
    emojiPair: '💻 🚀',
    iconName: 'Code',
    color: 'text-indigo-400',
    bgGlow: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    borderHover: 'hover:border-indigo-500/50',
    suggestedTitles: [
      '💻 Weekend Hackathon project brainstorm & build 🚀',
      '⚡ Frontend / React builders co-working & coffee ☕',
      '🧠 LeetCode & system design mock interviews 🎯',
      '🛠️ Indie hackers & side-project builders meetup 💻'
    ],
    emojiSuggestions: ['💻', '🚀', '⚡', '☕', '🧠', '🎯', '🛠️', '🤖'],
    defaultDuration: 3,
    defaultMaxParticipants: 6
  },
  {
    id: 'Music',
    name: 'Music & Jam',
    emoji: '🎸',
    emojiPair: '🎸 🎶',
    iconName: 'Music',
    color: 'text-fuchsia-400',
    bgGlow: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30',
    borderHover: 'hover:border-fuchsia-500/50',
    suggestedTitles: [
      '🎸 Acoustic guitar & vocals jam session 🎶',
      '🥁 Looking for a drummer/bassist for rock jam 🔥',
      '🎹 Electronic beatmaking / synth production session ⚡',
      '🎷 Jazz standards improvisation meetup 🎵'
    ],
    emojiSuggestions: ['🎸', '🎶', '🥁', '🔥', '🎹', '⚡', '🎷', '🎤'],
    defaultDuration: 2.5,
    defaultMaxParticipants: 4
  },
  {
    id: 'Photography',
    name: 'Photography',
    emoji: '📸',
    emojiPair: '📸 ✨',
    iconName: 'Camera',
    color: 'text-blue-400',
    bgGlow: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    borderHover: 'hover:border-blue-500/50',
    suggestedTitles: [
      '📸 Street photography walk downtown 🏙️',
      '🌅 Golden hour architecture & portrait walk ✨',
      '🌃 Night long-exposure photography session 🎞️',
      '🎞️ Analog 35mm film shooters meetup 📸'
    ],
    emojiSuggestions: ['📸', '✨', '🏙️', '🌅', '🌃', '🎞️', '🎨', '☕'],
    defaultDuration: 2,
    defaultMaxParticipants: 5
  },
  {
    id: 'Art',
    name: 'Art & Design',
    emoji: '🎨',
    emojiPair: '🎨 🖌️',
    iconName: 'Palette',
    color: 'text-emerald-300',
    bgGlow: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    borderHover: 'hover:border-emerald-500/50',
    suggestedTitles: [
      '🎨 Outdoor sketch & watercolor in the botanical garden 🌿',
      '✏️ Figure drawing & coffee session ☕',
      '🏺 Pottery workshop group visit ✨',
      '🖌️ Digital illustration & UI design hangout 🎨'
    ],
    emojiSuggestions: ['🎨', '🖌️', '🌿', '✏️', '☕', '🏺', '✨', '🖼️'],
    defaultDuration: 2.5,
    defaultMaxParticipants: 5
  },
  {
    id: 'Movies',
    name: 'Movies & Cinema',
    emoji: '🍿',
    emojiPair: '🍿 🎬',
    iconName: 'Film',
    color: 'text-red-400',
    bgGlow: 'bg-red-500/10 text-red-300 border-red-500/30',
    borderHover: 'hover:border-red-500/50',
    suggestedTitles: [
      '🍿 Indie cinema screening & post-film discussion 🎬',
      '🎥 IMAX Sci-Fi blockbuster movie night 🚀',
      '🌳 Outdoor park movie screening meetup 🍿',
      '📼 Classic 90s thriller movie night 🎬'
    ],
    emojiSuggestions: ['🍿', '🎬', '🎥', '🚀', '🌳', '📼', '🍕', '🥤'],
    defaultDuration: 3,
    defaultMaxParticipants: 6
  },
  {
    id: 'Language Exchange',
    name: 'Language Exchange',
    emoji: '🗣️',
    emojiPair: '🗣️ 🌐',
    iconName: 'Languages',
    color: 'text-green-400',
    bgGlow: 'bg-green-500/10 text-green-300 border-green-500/30',
    borderHover: 'hover:border-green-500/50',
    suggestedTitles: [
      '🗣️ English & Spanish conversation over coffee ☕',
      '🇯🇵 Japanese language practice & culture chat 🍵',
      '🇩🇪 German B1/B2 speaking practice group 🗣️',
      '🇫🇷 French practice & casual meetup 🥐'
    ],
    emojiSuggestions: ['🗣️', '🌐', '☕', '🍵', '🥐', '💬', '🌍', '🤝'],
    defaultDuration: 2,
    defaultMaxParticipants: 6
  },
  {
    id: 'Cooking',
    name: 'Cooking & Food',
    emoji: '🍳',
    emojiPair: '🍳 🍕',
    iconName: 'UtensilsCrossed',
    color: 'text-amber-500',
    bgGlow: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    borderHover: 'hover:border-amber-500/50',
    suggestedTitles: [
      '🍝 Homemade pasta making evening 🍷',
      '🌮 Street food market foodies crawl 🥟',
      '🥖 Baking sourdough bread exchange 🍞',
      '🍕 Homemade pizza night & cooking hangout 🍻'
    ],
    emojiSuggestions: ['🍳', '🍕', '🍝', '🍷', '🌮', '🥟', '🥖', '🍻'],
    defaultDuration: 2.5,
    defaultMaxParticipants: 5
  },
  {
    id: 'Other',
    name: 'Other Activities',
    emoji: '✨',
    emojiPair: '✨ ⚡',
    iconName: 'Sparkles',
    color: 'text-purple-400',
    bgGlow: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    borderHover: 'hover:border-purple-500/50',
    suggestedTitles: [
      '🛍️ Thrift shopping & vintage exploration 👗',
      '🌅 Sunset picnic & stargazing hangout ✨',
      '🏛️ Museum & modern art gallery tour 🖼️',
      '🌱 Weekend volunteering & community clean-up 🤝'
    ],
    emojiSuggestions: ['✨', '⚡', '🛍️', '🌅', '🏛️', '🌱', '🤝', '🎉'],
    defaultDuration: 2,
    defaultMaxParticipants: 6
  }
];

export function getCategoryMeta(category: ActivityCategory): CategoryMeta {
  const found = CATEGORIES.find(c => c.id === category);
  return (
    found || {
      id: 'Other',
      name: 'Other',
      emoji: '✨',
      emojiPair: '✨ ⚡',
      iconName: 'Sparkles',
      color: 'text-purple-400',
      bgGlow: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      borderHover: 'hover:border-purple-500/50',
      suggestedTitles: ['✨ Social hangout & activity 🔥'],
      emojiSuggestions: ['✨', '⚡', '🔥', '🤝', '☕', '🍕', '🎉', '🚀'],
      defaultDuration: 2,
      defaultMaxParticipants: 4
    }
  );
}

