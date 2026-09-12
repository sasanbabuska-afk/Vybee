import React from 'react';
import { X, ShieldCheck, MapPin, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface LocationPrivacyModalProps {
  currentUser: User;
  onClose: () => void;
  onToggleVisibility: (visible: boolean) => void;
}

export const LocationPrivacyModal: React.FC<LocationPrivacyModalProps> = ({
  currentUser,
  onClose,
  onToggleVisibility
}) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg my-auto rounded-3xl bg-[#16161D] border border-white/10 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5C00]/10 text-[#FF5C00] flex items-center justify-center border border-[#FF5C00]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-display">
                Location Privacy Principles
              </h3>
              <p className="text-xs text-slate-400">
                How VYBE protects your safety & privacy.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-[#111116] border border-white/5 flex items-start gap-3">
            <Lock className="w-4 h-4 text-[#FF5C00] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">No Exact GPS or Residential Coordinates</strong>
              VYBE never records, triangulates, or displays your private home address or exact device GPS coordinates to other members.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#111116] border border-white/5 flex items-start gap-3">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Approximate Distances Only</strong>
              Instead of precise coordinates, activities show a fuzzy radius (e.g. "~1.2 km away" or "Within 800m") to help you discover events in your general area without pinpointing individuals.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#111116] border border-white/5 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Public & Safe Meeting Points</strong>
              All host meeting locations are designated for public, well-lit spaces such as community sports centers, parks, cafes, and libraries.
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#111116] border border-[#FF5C00]/30 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#FF5C00] block">
              Location Discovery Mode
            </span>
            <span className="text-[11px] text-slate-400">
              {currentUser.locationVisible ? 'Active (Searching nearby)' : 'Disabled'}
            </span>
          </div>

          <button
            onClick={() => onToggleVisibility(!currentUser.locationVisible)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              currentUser.locationVisible
                ? 'bg-[#FF5C00] text-black shadow-md shadow-[#FF5C00]/20'
                : 'bg-[#1A1A1F] text-slate-300 border border-white/10'
            }`}
          >
            {currentUser.locationVisible ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-[#1A1A1F] hover:bg-[#25252B] text-slate-200 text-xs font-bold uppercase tracking-wider border border-white/10 transition active:scale-95 cursor-pointer"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};
