import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ActivityCategory } from '../types';
import { CATEGORIES } from '../data/categories';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryChipsProps {
  selectedCategory: ActivityCategory | 'All';
  onSelectCategory: (category: ActivityCategory | 'All') => void;
  categoryCounts?: Record<string, number>;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {}
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);

  // Update scroll indicator visibility
  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  // Smooth scroll left / right buttons
  const scrollByOffset = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: offset,
        behavior: 'smooth'
      });
    }
  };

  // Center selected item when chosen
  const handleSelect = (category: ActivityCategory | 'All', elementId: string) => {
    // If the user was dragging/swiping, do not trigger click
    if (dragDistanceRef.current > 6) return;

    onSelectCategory(category);
    const targetElement = document.getElementById(elementId);
    if (targetElement && scrollContainerRef.current) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  };

  // Pointer / Mouse drag to swipe handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
    dragDistanceRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5; // Drag sensitivity
    dragDistanceRef.current = Math.abs(x - startXRef.current);
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handlePointerUpOrLeave = () => {
    isDraggingRef.current = false;
    // reset drag distance after slight delay so click handler can evaluate it
    setTimeout(() => {
      dragDistanceRef.current = 0;
    }, 50);
  };

  return (
    <div className="relative w-full group/chips">
      {/* Left Fade & Arrow indicator */}
      {showLeftArrow && (
        <div className="absolute left-0 top-0 bottom-1.5 z-20 flex items-center pr-3 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-[#07080D] via-[#07080D]/90 to-transparent w-10 pointer-events-none" />
          <button
            onClick={() => scrollByOffset(-200)}
            aria-label="Scroll categories left"
            className="relative z-30 p-1 rounded-full bg-[#1A1C26]/90 border border-white/15 text-slate-300 hover:text-white hover:bg-[#252836] shadow-lg pointer-events-auto transition-all cursor-pointer hidden sm:flex items-center justify-center backdrop-blur-md"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Right Fade & Arrow indicator */}
      {showRightArrow && (
        <div className="absolute right-0 top-0 bottom-1.5 z-20 flex items-center justify-end pl-3 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-[#07080D] via-[#07080D]/90 to-transparent w-10 pointer-events-none" />
          <button
            onClick={() => scrollByOffset(200)}
            aria-label="Scroll categories right"
            className="relative z-30 p-1 rounded-full bg-[#1A1C26]/90 border border-white/15 text-slate-300 hover:text-white hover:bg-[#252836] shadow-lg pointer-events-auto transition-all cursor-pointer hidden sm:flex items-center justify-center backdrop-blur-md"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Swipeable Scroll Container */}
      <div
        ref={scrollContainerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrLeave}
        onPointerLeave={handlePointerUpOrLeave}
        className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scrollbar-none smooth-horizontal-scroll cursor-grab active:cursor-grabbing select-none px-0.5"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x pan-y',
          overscrollBehaviorX: 'contain',
        }}
      >
        {/* 'All' category button */}
        <motion.button
          id="category-chip-all"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSelect('All', 'category-chip-all')}
          className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border select-none ${
            selectedCategory === 'All'
              ? 'text-black border-transparent font-bold shadow-[0_0_18px_rgba(255,92,0,0.4)]'
              : 'text-slate-300 border-white/8 hover:border-white/20 hover:text-white bg-[#14151D] active:bg-[#1A1C26]'
          }`}
        >
          {selectedCategory === 'All' && (
            <motion.div
              layoutId="activeCategoryPill"
              className="absolute inset-0 bg-gradient-to-r from-[#FF5C00] to-[#FF7A29] rounded-xl -z-0 shadow-inner"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5 pointer-events-none">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">All Activities</span>
            {categoryCounts['All'] !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  selectedCategory === 'All' ? 'bg-black/25 text-black' : 'bg-[#1D1F2B] text-slate-400'
                }`}
              >
                {categoryCounts['All']}
              </span>
            )}
          </span>
        </motion.button>

        {/* Dynamic Categories */}
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] || 0;
          const chipId = `category-chip-${cat.id.toLowerCase().replace(/\s+/g, '-')}`;

          return (
            <motion.button
              key={cat.id}
              id={chipId}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(cat.id, chipId)}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs transition-all shrink-0 cursor-pointer border select-none ${
                isSelected
                  ? 'text-black font-bold border-transparent shadow-[0_0_18px_rgba(255,92,0,0.4)]'
                  : 'text-slate-300 border-white/8 hover:border-white/20 hover:text-white bg-[#14151D] active:bg-[#1A1C26] font-medium'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 bg-gradient-to-r from-[#FF5C00] to-[#FF7A29] rounded-xl -z-0 shadow-inner"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5 pointer-events-none">
                <span className="text-sm">{cat.emoji}</span>
                <span className="whitespace-nowrap">{cat.name}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isSelected ? 'bg-black/25 text-black' : 'bg-[#1D1F2B] text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
