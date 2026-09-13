import React, { useState, useRef } from 'react';
import { ActivityCategory, ActivityVisibility, SkillLevel, User } from '../types';
import { CATEGORIES, getCategoryMeta } from '../data/categories';
import { InteractiveMap } from './InteractiveMap';
import { fileToCompressedDataUrl } from '../utils/imageUpload';
import {
  X,
  Plus,
  MapPin,
  Calendar,
  Clock,
  Users,
  Award,
  Shield,
  Sparkles,
  ChevronRight,
  Lightbulb,
  ImagePlus
} from 'lucide-react';

interface CreateActivityModalProps {
  currentUser: User;
  onClose: () => void;
  onSubmit: (activityData: {
    title: string;
    category: ActivityCategory;
    description: string;
    date: string;
    startTime: string;
    durationHours: number;
    approximateLatitude: number;
    approximateLongitude: number;
    locationName: string;
    maxParticipants: number;
    skillLevel: SkillLevel;
    visibility: ActivityVisibility;
    coverPhoto?: string;
  }) => void;
  initialLat?: number;
  initialLng?: number;
  initialCategory?: ActivityCategory;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  currentUser,
  onClose,
  onSubmit,
  initialLat,
  initialLng,
  initialCategory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>(initialCategory || 'Football');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateType, setDateType] = useState<'Today' | 'Tomorrow' | 'Saturday' | 'Sunday' | 'Custom'>('Today');
  const [customDate, setCustomDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [durationHours, setDurationHours] = useState(2);
  const [locationName, setLocationName] = useState('Community Sports Center & Park');
  const [pickedCoords, setPickedCoords] = useState({
    lat: initialLat || currentUser.approximateLocation.lat + 0.003,
    lng: initialLng || currentUser.approximateLocation.lng + 0.002,
    name: 'Public Meeting Venue'
  });
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('Intermediate');
  const [visibility, setVisibility] = useState<ActivityVisibility>('Public');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | undefined>(undefined);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const meta = getCategoryMeta(selectedCategory);

  const handleCategorySelect = (cat: ActivityCategory) => {
    setSelectedCategory(cat);
    const catMeta = getCategoryMeta(cat);
    setDurationHours(catMeta.defaultDuration);
    setMaxParticipants(catMeta.defaultMaxParticipants);
  };

  const handleUseSuggestedTitle = (suggested: string) => {
    setTitle(suggested);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a descriptive activity title.');
      return;
    }
    if (!locationName.trim()) {
      setError('Please provide a safe public meeting venue or park name.');
      return;
    }

    const finalDate = dateType === 'Custom' ? customDate || 'Upcoming Date' : dateType;

    onSubmit({
      title: title.trim(),
      category: selectedCategory,
      description: description.trim() || `Looking for ${maxParticipants} people for ${selectedCategory}. Everyone welcome!`,
      date: finalDate,
      startTime,
      durationHours,
      approximateLatitude: pickedCoords.lat,
      approximateLongitude: pickedCoords.lng,
      locationName: locationName.trim(),
      maxParticipants,
      skillLevel,
      visibility,
      coverPhoto
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsPhotoUploading(true);
      const dataUrl = await fileToCompressedDataUrl(file, 900, 0.75);
      setCoverPhoto(dataUrl);
    } catch {
      setError('Could not use that photo — try a different one.');
    } finally {
      setIsPhotoUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        id="create-activity-modal"
        className="relative w-full max-w-3xl my-auto rounded-3xl bg-[#16161D] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-[#0F1115] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5C00] flex items-center justify-center text-black font-black shadow-[0_0_15px_rgba(255,92,0,0.3)]">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                Create an Activity
              </h2>
              <p className="text-xs text-slate-400">
                Find people, gather a squad, and do something in real life.
              </p>
            </div>
          </div>

          <button
            id="close-create-modal-btn"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-[#1A1A1F] hover:bg-[#25252B] text-slate-400 hover:text-white border border-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
              1. Select Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 bg-[#111116] rounded-2xl border border-white/5">
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF5C00]/15 border-[#FF5C00] text-[#FF5C00] font-bold shadow-[0_0_15px_rgba(255,92,0,0.2)]'
                        : 'bg-[#1A1A1F] border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl mb-1">{cat.emoji}</span>
                    <span className="text-[11px] font-bold truncate w-full">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Activity Title & Quick Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Activity Title
              </label>
              <span className="text-[11px] text-slate-400">Clear & specific</span>
            </div>
            <input
              id="activity-title-input"
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                setError(null);
              }}
              placeholder={`e.g. ${meta.suggestedTitles[0] || 'Need 3 players for tonight'}`}
              className="w-full px-4 py-3 rounded-2xl bg-[#1A1A1F] border border-white/10 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF5C00]/50 transition"
            />

            {/* Suggestions & Emojis */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-[#FF5C00]" /> Suggestions:
              </span>
              {meta.suggestedTitles.slice(0, 2).map((sugg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUseSuggestedTitle(sugg)}
                  className="text-[11px] text-slate-400 hover:text-white bg-[#1A1A1F] hover:bg-[#25252B] px-2 py-0.5 rounded-lg border border-white/5 transition cursor-pointer"
                >
                  "{sugg}"
                </button>
              ))}

              {/* Emoji quick insertion */}
              {meta.emojiSuggestions && meta.emojiSuggestions.length > 0 && (
                <div className="flex items-center gap-1 pl-2 border-l border-white/10">
                  {meta.emojiSuggestions.map((em, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTitle(prev => (prev ? `${prev} ${em}` : `${em} `))}
                      className="p-1 hover:bg-[#25252B] rounded text-xs transition cursor-pointer"
                      title={`Add ${em}`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              3. Description & Details
            </label>
            <textarea
              id="activity-desc-input"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What are the plans? Who should join? What should participants bring?"
              className="w-full px-4 py-3 rounded-2xl bg-[#1A1A1F] border border-white/10 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-[#FF5C00]/50 transition leading-relaxed"
            />
          </div>

          {/* Cover Photo (optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Cover Photo <span className="text-slate-500 normal-case font-medium">(optional)</span>
            </label>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            {coverPhoto ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/10 h-40">
                <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCoverPhoto(undefined)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={isPhotoUploading}
                className="w-full h-24 rounded-2xl bg-[#1A1A1F] border border-dashed border-white/15 hover:border-[#FF5C00]/50 text-slate-400 hover:text-slate-200 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-xs font-semibold">
                  {isPhotoUploading ? 'Adding photo...' : 'Add a photo to help people picture it'}
                </span>
              </button>
            )}
          </div>

          {/* 4. Date, Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Date
              </label>
              <div className="flex flex-wrap gap-1">
                {(['Today', 'Tomorrow', 'Saturday', 'Sunday'] as const).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDateType(d)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      dateType === d
                        ? 'bg-[#FF5C00] text-black border-transparent'
                        : 'bg-[#1A1A1F] text-slate-300 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Start Time
              </label>
              <input
                id="activity-start-time-input"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1A1A1F] border border-white/10 text-slate-100 text-sm focus:outline-none focus:border-[#FF5C00]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Duration (Hours)
              </label>
              <select
                id="activity-duration-select"
                value={durationHours}
                onChange={e => setDurationHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#1A1A1F] border border-white/10 text-slate-100 text-sm focus:outline-none focus:border-[#FF5C00]/50"
              >
                <option value={1} className="bg-[#1A1A1F]">1 hour</option>
                <option value={1.5} className="bg-[#1A1A1F]">1.5 hours</option>
                <option value={2} className="bg-[#1A1A1F]">2 hours</option>
                <option value={2.5} className="bg-[#1A1A1F]">2.5 hours</option>
                <option value={3} className="bg-[#1A1A1F]">3 hours</option>
                <option value={4} className="bg-[#1A1A1F]">4 hours</option>
                <option value={5} className="bg-[#1A1A1F]">5+ hours</option>
              </select>
            </div>
          </div>

          {/* 5. Meeting Venue & Location Picker */}
          <div className="p-4 rounded-2xl bg-[#1A1A1F] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#FF5C00]" />
                <span>5. Public Meeting Location</span>
              </label>
              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                className="text-xs font-bold text-[#FF5C00] hover:underline cursor-pointer"
              >
                {showMapPicker ? 'Hide Map Picker' : 'Select Pin on Map'}
              </button>
            </div>

            <input
              id="location-name-input"
              type="text"
              value={locationName}
              onChange={e => {
                setLocationName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Volkspark Court 2, Central Cafe, Campus Library"
              className="w-full px-4 py-2.5 rounded-xl bg-[#111116] border border-white/10 text-slate-100 text-sm focus:outline-none focus:border-[#FF5C00]/50"
            />

            {/* Embedded interactive map for pin choosing */}
            {showMapPicker && (
              <div className="h-56 w-full rounded-2xl overflow-hidden border border-white/10 mt-2 relative">
                <InteractiveMap
                  activities={[]}
                  userLocation={currentUser.approximateLocation}
                  isLocationPicker={true}
                  pickedLocation={pickedCoords}
                  onPickLocation={loc => {
                    setPickedCoords(loc);
                    if (!locationName || locationName === 'Public Meeting Venue') {
                      setLocationName(loc.name);
                    }
                  }}
                  onSelectActivity={() => {}}
                />
              </div>
            )}
          </div>

          {/* 6. Participants & Skill Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Max Participants
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="max-participants-range"
                  type="range"
                  min="2"
                  max="20"
                  value={maxParticipants}
                  onChange={e => setMaxParticipants(Number(e.target.value))}
                  className="w-full accent-[#FF5C00]"
                />
                <span className="text-sm font-bold text-[#FF5C00] px-2.5 py-1 rounded-xl bg-[#111116] border border-white/10 min-w-[38px] text-center">
                  {maxParticipants}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Skill Level
              </label>
              <select
                id="skill-level-select"
                value={skillLevel}
                onChange={e => setSkillLevel(e.target.value as SkillLevel)}
                className="w-full px-3 py-2 rounded-xl bg-[#1A1A1F] border border-white/10 text-slate-100 text-sm focus:outline-none focus:border-[#FF5C00]/50"
              >
                <option value="Any" className="bg-[#1A1A1F]">Any Level (All Welcome)</option>
                <option value="Beginner" className="bg-[#1A1A1F]">Beginner Friendly</option>
                <option value="Intermediate" className="bg-[#1A1A1F]">Intermediate</option>
                <option value="Advanced" className="bg-[#1A1A1F]">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Visibility
              </label>
              <select
                id="visibility-select"
                value={visibility}
                onChange={e => setVisibility(e.target.value as ActivityVisibility)}
                className="w-full px-3 py-2 rounded-xl bg-[#1A1A1F] border border-white/10 text-slate-100 text-sm focus:outline-none focus:border-[#FF5C00]/50"
              >
                <option value="Public" className="bg-[#1A1A1F]">Public (Everyone on Map)</option>
                <option value="Community" className="bg-[#1A1A1F]">Community Members Only</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 bg-[#0F1115] border-t border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-[#1A1A1F] hover:bg-[#25252B] text-slate-300 text-xs font-bold uppercase tracking-wider border border-white/10 transition active:scale-95 cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="publish-activity-submit-btn"
            type="button"
            onClick={handleSubmit}
            className="px-8 py-3 rounded-2xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(255,92,0,0.35)] transition active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>Create Activity</span>
          </button>
        </div>
      </div>
    </div>
  );
};
