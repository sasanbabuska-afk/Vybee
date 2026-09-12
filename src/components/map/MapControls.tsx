import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RADIUS_OPTIONS } from './mapUtils';
import { Plus, Locate, ZoomIn, ZoomOut, Compass, ChevronDown, Check, Maximize2, Minimize2 } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  isLocating: boolean;
  selectedRadiusKm: number;
  onRadiusChange: (radiusKm: number) => void;
  onOpenCreate?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  isLocating,
  selectedRadiusKm,
  onRadiusChange,
  onOpenCreate,
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const [showRadiusMenu, setShowRadiusMenu] = useState(false);

  const currentRadiusLabel =
    RADIUS_OPTIONS.find(r => r.value === selectedRadiusKm)?.label || `${selectedRadiusKm} km`;

  return (
    <div className="flex flex-col items-end gap-2 pointer-events-auto">
      {/* 1. Discovery Radius Selector */}
      <div className="relative">
        <button
          id="map-radius-control-btn"
          onClick={() => setShowRadiusMenu(!showRadiusMenu)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#14151D]/90 hover:bg-[#1C1D28] border border-white/8 text-xs font-semibold text-slate-200 shadow-xl backdrop-blur-md transition cursor-pointer"
        >
          <span className="text-[#FF5C00]">📍</span>
          <span>{currentRadiusLabel}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <AnimatePresence>
          {showRadiusMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1.5 w-36 p-1.5 rounded-2xl bg-[#14151D]/95 border border-white/10 shadow-2xl backdrop-blur-xl z-30 space-y-1"
            >
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Discovery Radius
              </div>
              {RADIUS_OPTIONS.map(opt => {
                const isSelected = selectedRadiusKm === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onRadiusChange(opt.value);
                      setShowRadiusMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF5C00] text-black font-bold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Zoom & Location Control Stack */}
      <div className="flex flex-col rounded-2xl bg-[#14151D]/90 border border-white/8 shadow-xl backdrop-blur-md overflow-hidden">
        {onToggleFullscreen && (
          <button
            id="map-fullscreen-btn"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="p-2.5 text-slate-300 hover:text-[#FF5C00] hover:bg-white/5 border-b border-white/5 transition cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}
        <button
          id="map-zoom-in-btn"
          onClick={onZoomIn}
          title="Zoom in"
          className="p-2.5 text-slate-300 hover:text-white hover:bg-white/5 border-b border-white/5 transition cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="map-zoom-out-btn"
          onClick={onZoomOut}
          title="Zoom out"
          className="p-2.5 text-slate-300 hover:text-white hover:bg-white/5 border-b border-white/5 transition cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="map-recenter-btn"
          onClick={onRecenter}
          title="Center on my location"
          className={`p-2.5 transition cursor-pointer ${
            isLocating
              ? 'text-[#FF5C00] bg-[#FF5C00]/10 animate-spin'
              : 'text-slate-300 hover:text-[#FF5C00] hover:bg-white/5'
          }`}
        >
          <Locate className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Create a VYBE Button */}
      {onOpenCreate && (
        <motion.button
          id="map-create-vybe-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-bold shadow-lg shadow-[#FF5C00]/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create a VYBE</span>
        </motion.button>
      )}
    </div>
  );
};
