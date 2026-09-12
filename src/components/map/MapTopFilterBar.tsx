import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActivityCategory } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { MapQuickFilter } from './mapUtils';
import { Search, X, SlidersHorizontal, Sparkles } from 'lucide-react';

interface MapTopFilterBarProps {
  quickFilter: MapQuickFilter;
  onQuickFilterChange: (filter: MapQuickFilter) => void;
  selectedCategory: ActivityCategory | 'All';
  onCategoryChange: (cat: ActivityCategory | 'All') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  nowCount: number;
  totalCount: number;
}

export const MapTopFilterBar: React.FC<MapTopFilterBarProps> = ({
  quickFilter,
  onQuickFilterChange,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  nowCount,
  totalCount
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const filterTabs: { id: MapQuickFilter; label: string; icon?: string; badge?: number | string; highlight?: boolean }[] = [
    { id: 'all', label: 'All', badge: totalCount },
    { id: 'now', label: 'NOW', icon: '🟠', badge: nowCount > 0 ? nowCount : undefined, highlight: true },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
    { id: 'social', label: 'Social', icon: '👥' },
    { id: 'nearby', label: 'Nearby', icon: '📍' }
  ];

  return (
    <div className="w-full flex flex-col gap-2 pointer-events-auto">
      {/* Main Glass Header */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-[#14151D]/90 border border-white/8 backdrop-blur-xl shadow-xl">
        {/* Search Input on mobile/desktop */}
        {showSearch ? (
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F1017] border border-[#FF5C00]/40">
            <Search className="w-4 h-4 text-[#FF5C00] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Find your next VYBE..."
              autoFocus
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setShowSearch(false)}
              className="text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/5 cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Quick Filter Horizontal Scroll */}
            <div
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-[calc(100%-80px)] sm:max-w-none smooth-horizontal-scroll select-none"
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-x pan-y',
                overscrollBehaviorX: 'contain',
              }}
            >
              {filterTabs.map(tab => {
                const isActive = quickFilter === tab.id && selectedCategory === 'All';
                return (
                  <motion.button
                    key={tab.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onQuickFilterChange(tab.id);
                      onCategoryChange('All');
                    }}
                    className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-[#FF5C00] text-black border-[#FF5C00] shadow-[0_0_15px_rgba(255,92,0,0.35)] font-bold'
                        : 'bg-[#181924] text-slate-300 hover:text-white border-white/5 hover:border-white/15'
                    }`}
                  >
                    {tab.icon && <span>{tab.icon}</span>}
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          isActive
                            ? 'bg-black/25 text-black'
                            : tab.highlight
                            ? 'bg-[#FF5C00]/20 text-[#FF5C00]'
                            : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </motion.button>
                );
              })}

              {/* Specific Category Indicator Pill if selected */}
              {selectedCategory !== 'All' && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FF5C00] text-black text-xs font-bold shrink-0">
                  <span>{selectedCategory}</span>
                  <button
                    onClick={() => onCategoryChange('All')}
                    className="p-0.5 hover:bg-black/20 rounded-full cursor-pointer ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Right Action Icons: Search Toggle & More Categories */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id="map-search-toggle-btn"
                onClick={() => setShowSearch(true)}
                title="Search activities"
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  searchQuery
                    ? 'bg-[#FF5C00]/20 text-[#FF5C00] border-[#FF5C00]/40'
                    : 'bg-[#181924] text-slate-300 hover:text-white border-white/5 hover:border-white/15'
                }`}
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                id="map-category-dropdown-btn"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                title="Filter by specific category"
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  showCategoryDropdown || selectedCategory !== 'All'
                    ? 'bg-[#FF5C00]/20 text-[#FF5C00] border-[#FF5C00]/40'
                    : 'bg-[#181924] text-slate-300 hover:text-white border-white/5 hover:border-white/15'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Expanded Categories Drawer */}
      <AnimatePresence>
        {showCategoryDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-2xl bg-[#14151D]/95 border border-white/10 backdrop-blur-xl shadow-2xl space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-slate-400">All Categories</span>
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => {
                      onCategoryChange('All');
                      setShowCategoryDropdown(false);
                    }}
                    className="text-xs text-[#FF5C00] font-medium hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {CATEGORIES.map(cat => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onCategoryChange(isSelected ? 'All' : cat.id);
                        setShowCategoryDropdown(false);
                      }}
                      className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-medium transition cursor-pointer text-left border ${
                        isSelected
                          ? 'bg-[#FF5C00] text-black border-[#FF5C00] font-bold shadow-sm'
                          : 'bg-[#191A25] text-slate-300 hover:text-white border-white/5 hover:border-white/15'
                      }`}
                    >
                      <span className="text-sm">{cat.emoji}</span>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
