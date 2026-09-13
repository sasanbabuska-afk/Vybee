import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Story } from '../types';

interface StoryViewerModalProps {
  stories: Story[]; // all stories belonging to the user being viewed, oldest first
  startIndex?: number;
  onClose: () => void;
}

const STORY_DURATION_MS = 5000;

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  startIndex = 0,
  onClose
}) => {
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);

  const current = stories[index];

  useEffect(() => {
    setProgress(0);
    if (!current) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / STORY_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        goNext();
      }
    }, 50);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, current?.id]);

  const goNext = () => {
    if (index < stories.length - 1) {
      setIndex(i => i + 1);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (index > 0) setIndex(i => i - 1);
  };

  if (!current) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] bg-black flex items-center justify-center"
      >
        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1.5 z-10">
          {stories.map((s, i) => (
            <div key={s.id} className="flex-1 h-1 rounded-full bg-white/25 overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: `${i < index ? 100 : i === index ? progress : 0}%`,
                  transition: i === index ? 'none' : 'width 0.2s'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <img
              src={current.profilePhoto}
              alt={current.displayName}
              className="w-8 h-8 rounded-full object-cover border border-white/30"
            />
            <span className="text-white text-sm font-bold">{current.displayName}</span>
          </div>
          <button onClick={onClose} className="p-2 text-white/90">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Image */}
        <img
          src={current.imageUrl}
          alt=""
          className="max-h-full max-w-full object-contain select-none"
          draggable={false}
        />

        {/* Tap zones for prev/next */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={goPrev} />
          <div className="w-2/3 h-full cursor-pointer" onClick={goNext} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
