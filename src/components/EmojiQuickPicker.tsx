import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Smile, X, Search, Flame, Trophy, Utensils, Gamepad2, Heart } from 'lucide-react';

export interface EmojiGroup {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

export const EMOJI_GROUPS: EmojiGroup[] = [
  {
    id: 'hype',
    name: 'Hype & Energy',
    icon: '🔥',
    emojis: ['🔥', '⚡', '🚀', '💯', '🏆', '✨', '⭐', '💥', '🤩', '🤙', '🎉', '👑']
  },
  {
    id: 'sports',
    name: 'Sports & Active',
    icon: '⚽',
    emojis: ['⚽', '🏀', '🎾', '🏃‍♂️', '🏋️‍♂️', '🥾', '🚴‍♂️', '♟️', '🥊', '🏊‍♂️', '🧗‍♂️', '🛹', '🏸', '⛳', '🎯', '👟']
  },
  {
    id: 'social',
    name: 'Food & Hangouts',
    icon: '🍕',
    emojis: ['🍕', '☕', '🍻', '🍔', '🌮', '🍦', '🍿', '🍩', '🍝', '🍷', '🥐', '🍣', '🍹', '🍪']
  },
  {
    id: 'creative',
    name: 'Games & Creative',
    icon: '🎮',
    emojis: ['🎮', '🕹️', '💻', '🎨', '📸', '🎸', '🎹', '📚', '🎲', '🎬', '🎧', '🤖', '🎤', '💡', '🎞️', '🖌️']
  },
  {
    id: 'vibes',
    name: 'Reactions & Vibes',
    icon: '😎',
    emojis: ['😎', '🙌', '🥳', '💪', '🧠', '❤️', '👀', '👋', '🫡', '🤝', '👏', '🙏', '✌️', '💃']
  }
];

export const POPULAR_QUICK_EMOJIS = ['🔥', '⚡', '🚀', '⚽', '🏀', '🎮', '🏋️‍♂️', '☕', '🍕', '🍻', '👏', '💯', '🏆', '✨'];

interface EmojiQuickPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose?: () => void;
  isOpen?: boolean;
  inline?: boolean;
}

export const EmojiQuickPicker: React.FC<EmojiQuickPickerProps> = ({
  onSelectEmoji,
  onClose,
  isOpen = true,
  inline = false
}) => {
  const [activeTab, setActiveTab] = useState<string>('hype');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const currentGroup = EMOJI_GROUPS.find(g => g.id === activeTab) || EMOJI_GROUPS[0];

  const allFilteredEmojis = search.trim()
    ? EMOJI_GROUPS.flatMap(g => g.emojis).filter(
        (emoji, idx, self) => self.indexOf(emoji) === idx
      )
    : currentGroup.emojis;

  const content = (
    <div className="w-full max-w-sm rounded-2xl bg-[#14151C] border border-white/10 shadow-2xl p-3 space-y-3 z-50 text-slate-200">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Smile className="w-4 h-4 text-[#FF5C00]" />
          <span>Pick Emoji</span>
        </div>
        {onClose && !inline && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
        {EMOJI_GROUPS.map(group => (
          <button
            key={group.id}
            onClick={() => {
              setActiveTab(group.id);
              setSearch('');
            }}
            className={`px-2 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition shrink-0 cursor-pointer ${
              activeTab === group.id
                ? 'bg-[#FF5C00] text-black font-bold'
                : 'bg-[#1A1B23] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <span>{group.icon}</span>
            <span className="hidden sm:inline text-[11px]">{group.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-48 overflow-y-auto p-1 bg-[#0E0F14] rounded-xl border border-white/5">
        {allFilteredEmojis.map((emoji, index) => (
          <motion.button
            key={`${emoji}-${index}`}
            type="button"
            whileHover={{ scale: 1.25 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelectEmoji(emoji)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-white/10 transition cursor-pointer"
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      {/* Popular Fast Strip */}
      <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/5 text-[11px] text-slate-400">
        <span className="font-bold flex items-center gap-1 text-[#FF5C00]">
          <Flame className="w-3 h-3" /> Quick:
        </span>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {POPULAR_QUICK_EMOJIS.slice(0, 8).map(em => (
            <button
              key={em}
              type="button"
              onClick={() => onSelectEmoji(em)}
              className="px-1.5 py-0.5 rounded hover:bg-white/10 text-sm transition cursor-pointer"
            >
              {em}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 5 }}
      className="absolute bottom-full left-0 mb-2 z-50 shadow-2xl"
    >
      {content}
    </motion.div>
  );
};
