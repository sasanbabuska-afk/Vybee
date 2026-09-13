import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { Story, User } from '../types';
import { fileToCompressedDataUrl } from '../utils/imageUpload';

interface StoriesBarProps {
  stories: Story[];
  currentUser: User;
  onAddStory: (imageUrl: string) => void;
  onOpenStory: (userId: string) => void;
}

/**
 * Instagram-style row of 24-hour disappearing stories.
 * Simple by design: one tap to add a photo, one tap to view.
 */
export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  currentUser,
  onAddStory,
  onOpenStory
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // One circle per user, showing their most recent story
  const byUser = new Map<string, Story>();
  for (const s of stories) {
    if (!byUser.has(s.userId)) byUser.set(s.userId, s);
  }
  const otherUsersStories = Array.from(byUser.values()).filter(s => s.userId !== currentUser.id);
  const myStory = byUser.get(currentUser.id);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const dataUrl = await fileToCompressedDataUrl(file, 900, 0.75);
      onAddStory(dataUrl);
    } catch {
      // Silently ignore — keeping this simple, no need to alarm the user over a photo pick failure
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar px-4 py-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Add / view my story */}
      <button
        onClick={() => (myStory ? onOpenStory(currentUser.id) : fileInputRef.current?.click())}
        className="flex flex-col items-center gap-1 shrink-0"
      >
        <div
          className={`relative w-16 h-16 rounded-full p-[2px] ${
            myStory ? 'bg-gradient-to-tr from-[#FF5C00] to-[#FFB199]' : 'bg-white/15'
          }`}
        >
          <img
            src={currentUser.profilePhoto}
            alt="You"
            className="w-full h-full rounded-full object-cover border-2 border-[#0A0A0B]"
          />
          <motion.div
            whileTap={{ scale: 0.85 }}
            onClick={e => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#FF5C00] border-2 border-[#0A0A0B] flex items-center justify-center"
          >
            <Plus className="w-3 h-3 text-black" strokeWidth={3} />
          </motion.div>
          {isUploading && (
            <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
        <span className="text-[10px] font-bold text-slate-300">Your Vybe</span>
      </button>

      {otherUsersStories.map(s => (
        <button
          key={s.userId}
          onClick={() => onOpenStory(s.userId)}
          className="flex flex-col items-center gap-1 shrink-0"
        >
          <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#FF5C00] to-[#FFB199]">
            <img
              src={s.profilePhoto}
              alt={s.displayName}
              className="w-full h-full rounded-full object-cover border-2 border-[#0A0A0B]"
            />
          </div>
          <span className="text-[10px] font-bold text-slate-300 max-w-[64px] truncate">
            {s.displayName.split(' ')[0]}
          </span>
        </button>
      ))}
    </div>
  );
};
