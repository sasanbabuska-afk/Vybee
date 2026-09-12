import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FilterState, SkillLevel, SortOption } from '../types';
import { SlidersHorizontal, ArrowUpDown, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  activeFilterCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  isOpen,
  onToggleOpen,
  activeFilterCount
}) => {
  const dateOptions = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow' },
    { id: 'weekend', label: 'Weekend' }
  ] as const;

  return (
    <div className="w-full">
      {/* Quick horizontal filter trigger bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Sort selector & Date Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14151D] border border-white/8 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#FF5C00]" />
            <span className="text-slate-400 font-medium hidden sm:inline">Sort:</span>
            <select
              id="sort-by-select"
              value={filters.sortBy}
              onChange={e => onChange({ ...filters, sortBy: e.target.value as SortOption })}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="recommended" className="bg-[#14151D]">Recommended</option>
              <option value="nearest" className="bg-[#14151D]">Nearest</option>
              <option value="soonest" className="bg-[#14151D]">Happening Soon</option>
              <option value="popular" className="bg-[#14151D]">Most Popular</option>
            </select>
          </div>

          {/* Quick Date Pills with animated sliding background */}
          <div className="hidden sm:flex items-center gap-1 bg-[#14151D] p-1 rounded-xl border border-white/8 text-xs">
            {dateOptions.map(d => {
              const isSelected = filters.dateFilter === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => onChange({ ...filters, dateFilter: d.id })}
                  className={`relative px-3 py-1 rounded-lg font-medium text-xs cursor-pointer transition-colors ${
                    isSelected ? 'text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="dateFilterIndicator"
                      className="absolute inset-0 bg-[#FF5C00] rounded-lg shadow-sm"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Drawer Toggle Button & Reset */}
        <div className="flex items-center gap-2">
          <motion.button
            id="filter-drawer-toggle-btn"
            whileTap={{ scale: 0.96 }}
            onClick={onToggleOpen}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              isOpen || activeFilterCount > 0
                ? 'bg-[#FF5C00]/15 border-[#FF5C00]/40 text-[#FF5C00]'
                : 'bg-[#14151D] border-white/8 text-slate-300 hover:border-white/20 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#FF5C00] text-black text-[10px] font-bold ml-0.5">
                {activeFilterCount}
              </span>
            )}
          </motion.button>

          {activeFilterCount > 0 && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileTap={{ scale: 0.9 }}
              onClick={onReset}
              title="Reset all filters"
              className="p-1.5 rounded-xl bg-[#14151D] border border-white/8 text-slate-400 hover:text-white hover:border-white/20 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Expanded Filter Panel with AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-[#14151D] border border-white/10 shadow-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Max Distance Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Distance
                    </label>
                    <span className="text-xs font-bold text-[#FF5C00]">
                      {filters.maxDistanceKm >= 25 ? 'Any distance' : `Within ${filters.maxDistanceKm} km`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="1"
                    value={filters.maxDistanceKm}
                    onChange={e => onChange({ ...filters, maxDistanceKm: Number(e.target.value) })}
                    className="w-full accent-[#FF5C00] cursor-pointer h-1.5 bg-[#1E202B] rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1 km</span>
                    <span>10 km</span>
                    <span>25+ km</span>
                  </div>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    When
                  </label>
                  <select
                    value={filters.dateFilter}
                    onChange={e =>
                      onChange({
                        ...filters,
                        dateFilter: e.target.value as FilterState['dateFilter']
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1C26] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#FF5C00]/50 cursor-pointer"
                  >
                    <option value="all" className="bg-[#1A1C26]">Any day</option>
                    <option value="today" className="bg-[#1A1C26]">Today only</option>
                    <option value="tomorrow" className="bg-[#1A1C26]">Tomorrow</option>
                    <option value="weekend" className="bg-[#1A1C26]">This Weekend</option>
                  </select>
                </div>

                {/* Skill Level Filter */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Skill Level
                  </label>
                  <select
                    value={filters.skillLevel}
                    onChange={e =>
                      onChange({
                        ...filters,
                        skillLevel: e.target.value as FilterState['skillLevel']
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1C26] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#FF5C00]/50 cursor-pointer"
                  >
                    <option value="All" className="bg-[#1A1C26]">All skill levels</option>
                    <option value="Beginner" className="bg-[#1A1C26]">Beginner / Casual</option>
                    <option value="Intermediate" className="bg-[#1A1C26]">Intermediate</option>
                    <option value="Advanced" className="bg-[#1A1C26]">Advanced / Competitive</option>
                    <option value="Any" className="bg-[#1A1C26]">Open to anyone</option>
                  </select>
                </div>

                {/* Available Spaces Toggle */}
                <div className="flex flex-col justify-between">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Availability
                  </label>
                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-[#1A1C26] border border-white/10 cursor-pointer hover:border-white/20 transition">
                    <input
                      type="checkbox"
                      checked={filters.availableSpacesOnly}
                      onChange={e => onChange({ ...filters, availableSpacesOnly: e.target.checked })}
                      className="rounded accent-[#FF5C00] w-4 h-4"
                    />
                    <span className="text-xs font-medium text-slate-200">
                      Open spots only
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
