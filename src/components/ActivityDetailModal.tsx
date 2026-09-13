import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ChatMessage, User, PenaltyReason, RecapPhoto } from '../types';
import { getCategoryMeta } from '../data/categories';
import { calculateDistanceKm, formatApproximateDistance, novaStore } from '../services/store';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import { EmojiQuickPicker } from './EmojiQuickPicker';
import { fileToCompressedDataUrl } from '../utils/imageUpload';
import {
  calculateActivityCountdown,
  getGoogleCalendarUrl,
  downloadActivityIcs,
  getSavedReminders,
  saveActivityReminder
} from '../utils/countdown';
import {
  X,
  Clock,
  MapPin,
  Users,
  Award,
  ShieldCheck,
  Flag,
  Share2,
  Calendar,
  CheckCircle2,
  UserX,
  Sparkles,
  Info,
  MessageSquare,
  Send,
  UserPlus,
  UserCheck,
  Smile,
  Zap,
  Lock,
  Bell,
  ExternalLink,
  Download,
  SmilePlus,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  UserMinus,
  Star,
  QrCode,
  Camera,
  Check
} from 'lucide-react';

interface ActivityDetailModalProps {
  activity: Activity | null;
  currentUser: User;
  onClose: () => void;
  onJoin: (activityId: string) => void;
  onLeave: (activityId: string, applyPenalty?: boolean) => void;
  onCancelActivity: (activityId: string, reason?: string) => void;
  onDeleteActivity?: (activityId: string) => void;
  onRemoveParticipant?: (
    activityId: string,
    targetUserId: string,
    reasonKey: PenaltyReason,
    penaltyPoints: number,
    reasonText: string
  ) => void;
  onReport: (activityId: string, reportedUserId?: string) => void;
  onBlockUser: (userId: string) => void;
  onFollowUser?: (userId: string) => void;
  onUnfollowUser?: (userId: string) => void;
  isFollowing?: (userId: string) => boolean;
  onSendMessage?: (activityId: string, text: string) => void;
  onViewProfile?: (userId: string) => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  currentUser,
  onClose,
  onJoin,
  onLeave,
  onCancelActivity,
  onDeleteActivity,
  onRemoveParticipant,
  onReport,
  onBlockUser,
  onFollowUser,
  onUnfollowUser,
  isFollowing,
  onSendMessage,
  onViewProfile
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSafetyTip, setShowSafetyTip] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tick, setTick] = useState(0);
  const [recapPhotos, setRecapPhotos] = useState<RecapPhoto[]>(activity.recapPhotos || []);
  const [isRecapUploading, setIsRecapUploading] = useState(false);
  const recapInputRef = useRef<HTMLInputElement>(null);
  const [reminderSavedNotice, setReminderSavedNotice] = useState<string | null>(null);
  const [showChatEmojiPicker, setShowChatEmojiPicker] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [myReacted, setMyReacted] = useState<string[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Host removal & cancellation states
  const [showHostDeleteModal, setShowHostDeleteModal] = useState(false);
  const [showHostCancelModal, setShowHostCancelModal] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState('');

  // Host participant penalty modal
  const [participantToPenalize, setParticipantToPenalize] = useState<{
    userId: string;
    displayName: string;
  } | null>(null);
  const [selectedPenaltyReason, setSelectedPenaltyReason] = useState<PenaltyReason>('late_cancellation');
  const [customPenaltyReasonNote, setCustomPenaltyReasonNote] = useState('');

  // User leave penalty confirmation
  const [showLeaveWarningModal, setShowLeaveWarningModal] = useState(false);

  // QR Code & Micro-Deposit Management
  const [showHostQrModal, setShowHostQrModal] = useState(false);
  const [showScanQrModal, setShowScanQrModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [checkInSuccessToast, setCheckInSuccessToast] = useState<string | null>(null);
  const [participantToFlakePayout, setParticipantToFlakePayout] = useState<{
    userId: string;
    displayName: string;
  } | null>(null);

  // 1-second live ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync reactions
  useEffect(() => {
    if (!activity) return;
    setReactions(novaStore.getActivityReactions(activity.id));
    setMyReacted(novaStore.getUserReactedEmojis(activity.id, currentUser.id));
  }, [activity?.id, currentUser.id, tick]);

  // Sync messages & Realtime
  useEffect(() => {
    if (!activity) return;

    if (activeTab === 'chat') {
      novaStore.markActivityChatAsRead(activity.id, currentUser.id);
    }

    const fetchMessages = () => {
      setMessages(novaStore.getActivityMessages(activity.id, currentUser.id));
    };

    fetchMessages();
    const unsubscribeStore = novaStore.subscribe(fetchMessages);

    let unsubscribeSupabase = () => {};
    if (isSupabaseConfigured()) {
      supabaseService.fetchActivityMessages(activity.id).then((remoteMsgs) => {
        if (remoteMsgs && remoteMsgs.length > 0) {
          remoteMsgs.forEach(m => novaStore.receiveRealtimeChatMessage(activity.id, m));
          fetchMessages();
        }
      });

      unsubscribeSupabase = supabaseService.subscribeToActivityMessages(
        activity.id,
        (newMsg) => {
          novaStore.receiveRealtimeChatMessage(activity.id, newMsg);
          fetchMessages();
          if (activeTab === 'chat') {
            novaStore.markActivityChatAsRead(activity.id, currentUser.id);
          }
        },
        (deletedId) => {
          novaStore.deleteActivityMessage(activity.id, deletedId, currentUser.id);
          fetchMessages();
        }
      );
    }

    return () => {
      unsubscribeStore();
      unsubscribeSupabase();
    };
  }, [activity?.id, currentUser.id, activeTab]);

  // Auto scroll to bottom of chat when new message arrives
  useEffect(() => {
    if (activeTab === 'chat') {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [activeTab, messages.length]);

  if (!activity) return null;

  const handleToggleReaction = (emoji: string) => {
    novaStore.toggleActivityReaction(activity.id, emoji, currentUser.id);
    setReactions(novaStore.getActivityReactions(activity.id));
    setMyReacted(novaStore.getUserReactedEmojis(activity.id, currentUser.id));
  };

  const meta = getCategoryMeta(activity.category);
  const isJoined = activity.participants.some(p => p.userId === currentUser.id);
  const isHost = activity.creatorId === currentUser.id;
  const isFull = activity.participants.length >= activity.maxParticipants;
  const spotsLeft = Math.max(0, activity.maxParticipants - activity.participants.length);
  const countdown = calculateActivityCountdown(activity);
  const hasActivityStarted = countdown.isOngoing || countdown.isPast;
  const myRecapPhoto = recapPhotos.find(p => p.userId === currentUser.id);

  const handleRecapPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsRecapUploading(true);
      const dataUrl = await fileToCompressedDataUrl(file, 900, 0.75);
      const res = novaStore.addRecapPhoto(activity.id, dataUrl);
      if (res.success) {
        setRecapPhotos(novaStore.getActivityById(activity.id)?.recapPhotos || []);
      }
    } catch {
      // Keep it simple — a failed photo pick just quietly does nothing
    } finally {
      setIsRecapUploading(false);
      if (recapInputRef.current) recapInputRef.current.value = '';
    }
  };

  const savedReminders = getSavedReminders();
  const currentReminder = savedReminders[activity.id];

  const handleSetReminder = (leadMinutes: number) => {
    saveActivityReminder({
      activityId: activity.id,
      leadMinutes,
      enabled: true
    });
    setReminderSavedNotice(
      `Reminder set for ${leadMinutes >= 60 ? `${leadMinutes / 60}h` : `${leadMinutes}m`} before start!`
    );
    setTimeout(() => setReminderSavedNotice(null), 3000);
  };

  const distanceKm = calculateDistanceKm(
    currentUser.approximateLocation.lat,
    currentUser.approximateLocation.lng,
    activity.approximateLatitude,
    activity.approximateLongitude
  );

  const handleShare = () => {
    navigator.clipboard.writeText(
      `Check out "${activity.title}" (${activity.category}) on NOVA! Happening ${activity.date} at ${activity.startTime}.`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || activity.status === 'cancelled') return;

    if (onSendMessage) {
      onSendMessage(activity.id, trimmed);
    } else {
      novaStore.sendActivityMessage(activity.id, trimmed, false, {
        id: currentUser.id,
        displayName: currentUser.displayName,
        profilePhoto: currentUser.profilePhoto
      });
    }

    if (isSupabaseConfigured()) {
      supabaseService.sendActivityMessage(activity.id, currentUser.id, trimmed).catch(console.warn);
    }

    setChatInput('');
    setShowChatEmojiPicker(false);
  };

  const sendQuickPrompt = (prompt: string) => {
    if (activity.status === 'cancelled') return;
    if (onSendMessage) {
      onSendMessage(activity.id, prompt);
    } else {
      novaStore.sendActivityMessage(activity.id, prompt, false, {
        id: currentUser.id,
        displayName: currentUser.displayName,
        profilePhoto: currentUser.profilePhoto
      });
    }
    if (isSupabaseConfigured()) {
      supabaseService.sendActivityMessage(activity.id, currentUser.id, prompt).catch(console.warn);
    }
  };

  const handleDeleteChatMessage = (messageId: string) => {
    novaStore.deleteActivityMessage(activity.id, messageId, currentUser.id);
    if (isSupabaseConfigured()) {
      supabaseService.deleteActivityMessage(messageId).catch(console.warn);
    }
  };

  const checkIsFollowing = (userId: string) => {
    if (isFollowing) return isFollowing(userId);
    return novaStore.isFollowing(userId);
  };

  const toggleFollow = (userId: string) => {
    if (checkIsFollowing(userId)) {
      if (onUnfollowUser) onUnfollowUser(userId);
      else novaStore.unfollowUser(userId);
    } else {
      if (onFollowUser) onFollowUser(userId);
      else novaStore.followUser(userId);
    }
  };

  // Penalty Config for Host Participant Removal
  const PENALTY_REASONS: {
    key: PenaltyReason;
    label: string;
    description: string;
    points: number;
    strike: boolean;
    icon: string;
  }[] = [
    {
      key: 'late_cancellation',
      label: 'Late Drop-out / Short Notice (<2h)',
      description: 'Gave very short notice or dropped out last minute',
      points: 10,
      strike: true,
      icon: '⏱️'
    },
    {
      key: 'no_show',
      label: 'No-Show / Failed to Arrive',
      description: 'Did not attend and did not communicate',
      points: 15,
      strike: true,
      icon: '🚫'
    },
    {
      key: 'inappropriate_behavior',
      label: 'Conduct or Rule Violation',
      description: 'Inappropriate communication or ignoring squad rules',
      points: 10,
      strike: true,
      icon: '⚠️'
    },
    {
      key: 'unresponsive',
      label: 'Unresponsive / Blocking Spot',
      description: 'Never confirmed attendance in chat',
      points: 5,
      strike: false,
      icon: '💤'
    },
    {
      key: 'mutual_friendly',
      label: 'Mutual Reschedule / Friendly Pass',
      description: 'Agreed amicably to free the spot for others (0 penalty points)',
      points: 0,
      strike: false,
      icon: '🤝'
    }
  ];

  const handleConfirmParticipantRemoval = () => {
    if (!participantToPenalize) return;
    const selectedConfig = PENALTY_REASONS.find(r => r.key === selectedPenaltyReason);
    const penaltyPoints = selectedConfig ? selectedConfig.points : 0;
    const reasonText = customPenaltyReasonNote.trim() || selectedConfig?.label || 'Host removed participant';

    if (onRemoveParticipant) {
      onRemoveParticipant(
        activity.id,
        participantToPenalize.userId,
        selectedPenaltyReason,
        penaltyPoints,
        reasonText
      );
    } else {
      novaStore.removeParticipantByHost(
        activity.id,
        participantToPenalize.userId,
        selectedPenaltyReason,
        penaltyPoints,
        reasonText
      );
    }

    setParticipantToPenalize(null);
    setCustomPenaltyReasonNote('');
  };

  const handleConfirmHostDeleteActivity = () => {
    if (onDeleteActivity) {
      onDeleteActivity(activity.id);
    } else {
      novaStore.deleteActivity(activity.id);
    }
    setShowHostDeleteModal(false);
    onClose();
  };

  const handleConfirmHostCancelActivity = () => {
    onCancelActivity(activity.id, cancelReasonInput.trim() || undefined);
    setShowHostCancelModal(false);
  };

  const handleLeaveClick = () => {
    const isToday = activity.date === 'Today' || countdown.totalSeconds < 7200;
    if (isToday) {
      setShowLeaveWarningModal(true);
    } else {
      onLeave(activity.id, false);
    }
  };

  const handleConfirmLeaveWithPenalty = () => {
    setShowLeaveWarningModal(false);
    onLeave(activity.id, true);
  };

  const handleScanQrCheckIn = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const res = novaStore.checkInParticipant(activity.id, currentUser.id);
      setShowScanQrModal(false);
      setCheckInSuccessToast(res.message || 'Check-in verified! Attendance recorded.');
      setTimeout(() => setCheckInSuccessToast(null), 4000);
    }, 1200);
  };

  const handleProcessFlakePenalty = (userId: string) => {
    const res = novaStore.penalizeNoShowWithPayout(activity.id, userId);
    setParticipantToFlakePayout(null);
    setCheckInSuccessToast(res.message || 'No-show penalized (-15 Karma applied).');
    setTimeout(() => setCheckInSuccessToast(null), 4000);
  };

  const currentUserParticipant = activity.participants.find(p => p.userId === currentUser.id);

  return (
    <div
      id="activity-detail-modal-overlay"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div
        id="activity-detail-modal-card"
        className="relative w-full max-w-2xl bg-[#14151B] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header Banner */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-[#181920] to-[#121318] border-b border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl">{meta.emoji}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#FF5C00]/20 text-[#FF5C00] border border-[#FF5C00]/30">
                  {activity.category}
                </span>
                {activity.status === 'cancelled' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                    Cancelled by Host
                  </span>
                )}
                {isHost && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    👑 Host View
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white font-display truncate">
                {activity.title}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id="share-activity-btn"
                onClick={handleShare}
                className="p-2 rounded-xl bg-[#1A1A1F] hover:bg-[#25252B] text-slate-300 hover:text-white transition cursor-pointer border border-white/5 relative"
                title="Share Activity"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                {copied && (
                  <span className="absolute -bottom-7 right-0 text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-md font-bold whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>

              <button
                id="close-modal-btn"
                onClick={onClose}
                className="p-2 rounded-xl bg-[#1A1A1F] hover:bg-[#25252B] text-slate-300 hover:text-white transition cursor-pointer border border-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Details vs Squad Chat) */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
            <button
              id="tab-details-btn"
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'details'
                  ? 'bg-[#FF5C00] text-black shadow-[0_0_15px_rgba(255,92,0,0.3)]'
                  : 'bg-[#181920] text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Details & Attendees</span>
            </button>

            <button
              id="tab-chat-btn"
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 relative ${
                activeTab === 'chat'
                  ? 'bg-[#FF5C00] text-black shadow-[0_0_15px_rgba(255,92,0,0.3)]'
                  : 'bg-[#181920] text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Squad Chat</span>
              {messages.length > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeTab === 'chat' ? 'bg-black text-[#FF5C00]' : 'bg-[#FF5C00] text-black'
                  }`}
                >
                  {messages.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {activeTab === 'details' ? (
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
            {/* Countdown & Quick Action Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1A1A22] to-[#14151B] border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#FF5C00]/10 text-[#FF5C00] border border-[#FF5C00]/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Starting Time
                  </span>
                  <span className="text-base font-black text-white font-display">
                    {activity.date} at {activity.startTime}
                  </span>
                  <span className="text-xs text-[#FF5C00] font-semibold block">
                    {countdown.formattedReadable}
                  </span>
                </div>
              </div>

              {/* Quick Calendar & Reminder Dropdown */}
              <div className="flex items-center gap-2">
                <a
                  href={getGoogleCalendarUrl(activity)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-[#1A1A1F] hover:bg-[#25252B] text-slate-300 hover:text-white text-xs font-bold border border-white/5 flex items-center gap-1.5 transition"
                  title="Add to Google Calendar"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#FF5C00]" />
                  <span>Google Cal</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>

                <button
                  onClick={() => downloadActivityIcs(activity)}
                  className="px-3 py-2 rounded-xl bg-[#1A1A1F] hover:bg-[#25252B] text-slate-300 hover:text-white text-xs font-bold border border-white/5 flex items-center gap-1.5 transition cursor-pointer"
                  title="Download .ICS file"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>iCal</span>
                </button>
              </div>
            </div>

            {/* Event Attendance & Free Check-In Card */}
            {(isJoined || isHost) && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#181926] to-[#12131C] border border-white/10 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-white font-display">
                          Event Attendance & Check-In
                        </h4>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          FREE CHECK-IN
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        Verify your attendance to build your Karma reliability score and unlock priority matchmaking.
                      </p>
                    </div>
                  </div>

                  {/* Actions / Status Indicators */}
                  <div className="shrink-0 flex items-center gap-2">
                    {isHost ? (
                      <button
                        id="activity-host-qr-pass-btn"
                        onClick={() => setShowHostQrModal(true)}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(255,92,0,0.3)] transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <QrCode className="w-4 h-4 stroke-[2.5]" />
                        <span>Host QR Pass</span>
                      </button>
                    ) : (
                      currentUserParticipant?.checkedIn ? (
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Checked In</span>
                        </div>
                      ) : (
                        <button
                          id="activity-scan-qr-checkin-btn"
                          onClick={() => setShowScanQrModal(true)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)] transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <Camera className="w-4 h-4 stroke-[2.5]" />
                          <span>Scan Host QR Code</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Emoji Reactions Widget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-[#FF5C00]" />
                  <span>Squad Reactions</span>
                </h4>
                <span className="text-[11px] text-slate-500">Tap to react</span>
              </div>
              <EmojiQuickPicker
                activityId={activity.id}
                currentUserId={currentUser.id}
                onReactionToggled={() => {
                  setReactions(novaStore.getActivityReactions(activity.id));
                  setMyReacted(novaStore.getUserReactedEmojis(activity.id, currentUser.id));
                }}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Activity Overview
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed bg-[#1A1A1F] p-4 rounded-2xl border border-white/5">
                {activity.description}
              </p>
            </div>

            {/* Location & Safety Spot */}
            <div className="p-4 rounded-2xl bg-[#1A1A1F] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5C00]" />
                  <span>Meeting Venue (Public & Safe)</span>
                </h4>
                <button
                  onClick={() => setShowSafetyTip(!showSafetyTip)}
                  className="text-xs text-[#FF5C00] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Privacy Note</span>
                </button>
              </div>
              <p className="text-sm font-semibold text-white">{activity.locationName}</p>
              <p className="text-xs text-slate-400">
                {formatApproximateDistance(distanceKm)} from your current search area
              </p>

              {showSafetyTip && (
                <div className="mt-2 p-3 rounded-xl bg-[#0A0A0B] border border-[#FF5C00]/30 text-xs text-slate-200 leading-relaxed">
                  🛡️ <strong>Location Privacy:</strong> NOVA only uses public meeting spots and safe
                  venues. Exact residential coordinates are never shared between users.
                </div>
              )}
            </div>

            {/* Host Card with Management / Follow */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Organized By
              </h4>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1A1A1F] border border-white/5">
                <div className="flex items-center gap-3">
                  <img
                    src={activity.creator.profilePhoto}
                    alt={activity.creator.displayName}
                    className="w-11 h-11 rounded-full ring-2 ring-[#FF5C00]/40 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {activity.creator.displayName}
                      </span>
                      {isHost && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF5C00]/20 text-[#FF5C00] border border-[#FF5C00]/30">
                          You (Host)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{activity.creator.city} · Verified Host</p>
                  </div>
                </div>

                {!isHost ? (
                  <div className="flex items-center gap-2">
                    <button
                      id={`follow-host-${activity.creatorId}`}
                      onClick={() => toggleFollow(activity.creatorId)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        checkIsFollowing(activity.creatorId)
                          ? 'bg-[#121217] text-slate-300 hover:text-red-400 border border-white/10 hover:border-red-500/30'
                          : 'bg-[#FF5C00] hover:bg-[#ff6f1f] text-black font-black shadow-[0_0_10px_rgba(255,92,0,0.25)]'
                      }`}
                    >
                      {checkIsFollowing(activity.creatorId) ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-[#FF5C00]" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onReport(activity.id, activity.creatorId)}
                      title="Report Host"
                      className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/5 transition cursor-pointer"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onBlockUser(activity.creatorId)}
                      title="Block User"
                      className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/5 transition cursor-pointer"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-400 font-semibold flex items-center gap-1 bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/20">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>Host Controls Active</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Recap Photo Gallery — visible once the activity has started */}
            {hasActivityStarted && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Recap Photos ({recapPhotos.length})</span>
                  </h4>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {recapPhotos.map(photo => (
                    <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
                      <img src={photo.photoUrl} alt={photo.displayName} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white truncate bg-black/50 rounded px-1">
                        {photo.displayName}
                      </span>
                    </div>
                  ))}

                  {isJoined && !myRecapPhoto && (
                    <>
                      <input
                        ref={recapInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleRecapPhotoChange}
                      />
                      <button
                        type="button"
                        onClick={() => recapInputRef.current?.click()}
                        disabled={isRecapUploading}
                        className="aspect-square rounded-xl border border-dashed border-white/15 hover:border-[#FF5C00]/50 text-slate-400 hover:text-slate-200 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="text-[9px] font-bold text-center px-1">
                          {isRecapUploading ? 'Adding...' : 'Add yours'}
                        </span>
                      </button>
                    </>
                  )}
                </div>

                {recapPhotos.length === 0 && !isJoined && (
                  <p className="text-xs text-slate-500">No recap photos yet.</p>
                )}
              </div>
            )}

            {/* Participants List with Reliability Scores & Host Penalty Options */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    Confirmed Participants ({activity.participants.length} / {activity.maxParticipants})
                  </span>
                </h4>
                <span className="text-xs text-slate-400">
                  {spotsLeft > 0 ? `${spotsLeft} space${spotsLeft === 1 ? '' : 's'} remaining` : 'Full group'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activity.participants.map((participant) => {
                  const isCurrent = participant.userId === currentUser.id;
                  const isActivityHost = participant.userId === activity.creatorId;
                  const followingThisUser = checkIsFollowing(participant.userId);
                  const userRecord = novaStore.getUserById(participant.userId);
                  const reliability = userRecord?.reliabilityScore ?? participant.reliabilityScore ?? 100;
                  const strikes = userRecord?.penaltyStrikes ?? participant.penaltyStrikes ?? 0;

                  return (
                    <motion.div
                      key={participant.userId}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#1A1A1F] border border-white/5 hover:border-white/10 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={participant.profilePhoto}
                          alt={participant.displayName}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-200 block truncate">
                            {participant.displayName} {isCurrent ? '(You)' : ''}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span className="text-slate-500">
                              {isActivityHost ? 'Host' : 'Participant'}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span
                              className={`font-semibold ${
                                reliability >= 90
                                  ? 'text-emerald-400'
                                  : reliability >= 75
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                              }`}
                              title={`${reliability}% Reliability Score (${strikes} strikes)`}
                            >
                              ⚡ {reliability}%
                            </span>
                            {participant.checkedIn && (
                              <>
                                <span className="text-slate-600">·</span>
                                <span className="font-bold text-emerald-400">
                                  ✓ Checked In
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Host No-Show Penalty trigger */}
                        {isHost && !isActivityHost && !participant.checkedIn && (
                          <button
                            id={`flake-penalty-btn-${participant.userId}`}
                            onClick={() =>
                              setParticipantToFlakePayout({
                                userId: participant.userId,
                                displayName: participant.displayName
                              })
                            }
                            className="p-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                            title="Report Unexcused No-Show (-15 Karma)"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black">No-Show</span>
                          </button>
                        )}

                        {/* Host remove participant button */}
                        {isHost && !isActivityHost && (
                          <button
                            id={`remove-participant-btn-${participant.userId}`}
                            onClick={() =>
                              setParticipantToPenalize({
                                userId: participant.userId,
                                displayName: participant.displayName
                              })
                            }
                            className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                            title="Remove participant and assess penalty"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Remove</span>
                          </button>
                        )}

                        {isActivityHost ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF5C00]/10 text-[#FF5C00] border border-[#FF5C00]/20">
                            Host
                          </span>
                        ) : !isCurrent && !isHost ? (
                          <button
                            id={`follow-participant-${participant.userId}`}
                            onClick={() => toggleFollow(participant.userId)}
                            className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                              followingThisUser
                                ? 'bg-[#121217] text-slate-400 hover:text-red-400 border border-white/10'
                                : 'bg-[#FF5C00] hover:bg-[#ff6f1f] text-black'
                            }`}
                            title={followingThisUser ? 'Unfollow' : 'Follow'}
                          >
                            {followingThisUser ? (
                              <UserCheck className="w-3.5 h-3.5 text-[#FF5C00]" />
                            ) : (
                              <UserPlus className="w-3.5 h-3.5" />
                            )}
                          </button>
                        ) : null}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* LIVE SQUAD CHAT TAB */
          <div className="flex-1 flex flex-col min-h-[380px] max-h-[500px] overflow-hidden bg-[#0D0E12]">
            {isJoined ? (
              <>
                {/* Chat Top Banner */}
                <div className="px-5 py-2.5 bg-[#14151B] border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real-time squad room · {activity.participants.length} connected</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Only visible to attendees</span>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5">
                  {messages.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-[#1A1A1F] text-[#FF5C00] flex items-center justify-center mx-auto">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-slate-400">
                        No messages yet. Say hi to your squad or confirm the meeting point!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.userId === currentUser.id;
                      const isHostMsg = msg.userId === activity.creatorId;

                      if (msg.isSystem) {
                        return (
                          <div
                            key={msg.id}
                            className="my-2 p-2.5 rounded-2xl bg-[#181922] border border-white/5 text-center text-xs text-slate-300 font-medium leading-relaxed"
                          >
                            {msg.text}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <img
                            src={msg.userPhoto}
                            alt={msg.userName}
                            className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-white/10 mt-1"
                            referrerPolicy="no-referrer"
                          />
                          <div
                            className={`max-w-[75%] space-y-1 ${
                              isMe ? 'items-end text-right' : 'items-start text-left'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              <span className="font-bold text-slate-300">{msg.userName}</span>
                              {isHostMsg && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#FF5C00]/20 text-[#FF5C00]">
                                  HOST
                                </span>
                              )}
                              <span>{msg.timestamp}</span>
                              {isMe && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteChatMessage(msg.id)}
                                  className="text-slate-500 hover:text-red-400 p-0.5 transition cursor-pointer"
                                  title="Delete message"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              )}
                              {!isMe && (
                                <button
                                  type="button"
                                  onClick={() => onReport(activity.id, msg.userId)}
                                  className="text-slate-500 hover:text-amber-400 p-0.5 transition cursor-pointer"
                                  title="Report message"
                                >
                                  <Flag className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                isMe
                                  ? 'bg-[#FF5C00] text-black font-semibold rounded-tr-none'
                                  : 'bg-[#1A1A1F] text-slate-100 border border-white/5 rounded-tl-none'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Quick Prompt Suggestions */}
                {activity.status !== 'cancelled' && (
                  <div className="px-4 py-2 bg-[#121319] border-t border-white/5 flex items-center gap-1.5 overflow-x-auto">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#FF5C00]" />
                      Quick:
                    </span>
                    {[
                      "Hey squad! I'm on my way 🏃‍♂️",
                      "I'm at the entrance spot! 📍",
                      "Bringing extra gear ⚡",
                      "Ready! See you all soon 🔥"
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => sendQuickPrompt(prompt)}
                        className="px-2.5 py-1 rounded-xl bg-[#1A1A22] hover:bg-[#252530] text-[11px] text-slate-300 whitespace-nowrap border border-white/5 transition cursor-pointer shrink-0"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Chat Input Bar */}
                {activity.status === 'cancelled' ? (
                  <div className="p-3.5 bg-[#161720] border-t border-white/10 text-center text-xs text-red-300 font-medium">
                    Squad chat is disabled because this activity was cancelled.
                  </div>
                ) : (
                  <form
                    onSubmit={handleSendChatMessage}
                    className="p-3 bg-[#161720] border-t border-white/10 flex items-center gap-2 relative"
                  >
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowChatEmojiPicker(!showChatEmojiPicker)}
                        className="p-2 rounded-xl bg-[#1E202B] hover:bg-[#282B3A] text-slate-400 hover:text-[#FF5C00] transition cursor-pointer"
                        title="Insert Emoji"
                      >
                        <SmilePlus className="w-4 h-4" />
                      </button>

                      {showChatEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-2 p-2 bg-[#0E0F14] border border-white/10 rounded-2xl shadow-2xl z-30 flex flex-wrap gap-1 w-56">
                          {[
                            '👋', '🔥', '⚽', '🏀', '🎮', '🍕', '☕', '💪',
                            '🚀', '🎯', '📍', '🙌', '💯', '✨', '⚡', '🏃‍♂️'
                          ].map(em => (
                            <button
                              key={em}
                              type="button"
                              onClick={() => {
                                setChatInput(prev => prev + em);
                                setShowChatEmojiPicker(false);
                              }}
                              className="p-1.5 text-base hover:scale-125 transition cursor-pointer"
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message to the squad..."
                      maxLength={1000}
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-[#0E0F14] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5C00]"
                    />

                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="px-4 py-2.5 rounded-2xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black font-black text-xs uppercase tracking-wider transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                )}
              </>
            ) : (
              /* Locked Chat State */
              <div className="p-8 text-center space-y-4 my-auto">
                <div className="w-16 h-16 rounded-3xl bg-[#1A1A1F] border border-white/10 text-[#FF5C00] flex items-center justify-center mx-auto shadow-2xl">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white font-display">
                    Squad Chat is Exclusive to Participants
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Join "{activity.title}" to unlock the squad chat room, coordinate the meeting spot, and talk with the other attendees!
                  </p>
                </div>
                <button
                  id="unlock-chat-join-btn"
                  onClick={() => {
                    onJoin(activity.id);
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center gap-2 mx-auto cursor-pointer shadow-[0_0_20px_rgba(255,92,0,0.35)]"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>Join Activity to Chat</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer / Actions */}
        <div className="p-4 sm:p-5 bg-[#0F1115] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              {isHost
                ? 'As the host, you can manage attendees, cancel, or permanently remove this activity.'
                : isJoined
                ? 'You are attending! Chat with the squad anytime.'
                : 'Join to coordinate with the squad at the meeting venue.'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isHost ? (
              <>
                {/* Host: Remove / Delete Activity */}
                <button
                  id="delete-activity-btn"
                  onClick={() => setShowHostDeleteModal(true)}
                  className="px-3.5 py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  title="Permanently remove activity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Activity</span>
                </button>

                {/* Host: Cancel Activity */}
                {activity.status !== 'cancelled' && (
                  <button
                    id="cancel-activity-btn"
                    onClick={() => setShowHostCancelModal(true)}
                    className="px-3.5 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}

                <button
                  id="host-done-btn"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-2xl bg-[#1A1A1F] hover:bg-[#25252B] text-slate-200 text-xs font-bold uppercase tracking-wider border border-white/10 transition active:scale-95 cursor-pointer"
                >
                  Done
                </button>
              </>
            ) : isJoined ? (
              <button
                id="leave-activity-btn"
                onClick={handleLeaveClick}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-white/10 text-xs font-black uppercase tracking-wider transition active:scale-95 cursor-pointer"
              >
                Leave Activity
              </button>
            ) : isFull ? (
              <button
                disabled
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#1A1A1F] text-slate-600 text-xs font-bold uppercase tracking-wider cursor-not-allowed border border-white/5"
              >
                Activity Full
              </button>
            ) : (
              <button
                id="modal-join-btn"
                onClick={() => {
                  onJoin(activity.id);
                }}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(255,92,0,0.35)] transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Join Activity</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Host Remove Participant & Penalty Assessment */}
      <AnimatePresence>
        {participantToPenalize && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-[#161720] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white font-display">
                      Remove & Penalize Participant
                    </h3>
                    <p className="text-xs text-slate-400">
                      Removing <strong className="text-white">{participantToPenalize.displayName}</strong> from this activity
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setParticipantToPenalize(null)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Select Reason & Fair-Play Penalty:
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {PENALTY_REASONS.map((r) => {
                    const isSelected = selectedPenaltyReason === r.key;
                    return (
                      <div
                        key={r.key}
                        onClick={() => setSelectedPenaltyReason(r.key)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#FF5C00]/10 border-[#FF5C00] ring-1 ring-[#FF5C00]'
                            : 'bg-[#1A1B24] border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-xl">{r.icon}</span>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {r.label}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {r.description}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {r.points > 0 ? (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30">
                              -{r.points}% Reliability
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              No Penalty
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-400 block mb-1">
                    Optional Squad Chat Explanation:
                  </label>
                  <input
                    type="text"
                    value={customPenaltyReasonNote}
                    onChange={(e) => setCustomPenaltyReasonNote(e.target.value)}
                    placeholder="e.g., Requested drop-out 10 mins before match"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E0F14] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5C00]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#0F1017] border border-white/5 text-[11px] text-slate-400 leading-relaxed">
                💡 <strong>Community Accountability:</strong> Penalties update the attendee's reliability rating and free up their spot for others immediately.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setParticipantToPenalize(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="confirm-remove-participant-btn"
                  onClick={handleConfirmParticipantRemoval}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-900/30 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  <span>Confirm Removal</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Host Remove / Delete Activity Confirmation */}
      <AnimatePresence>
        {showHostDeleteModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#161720] border border-red-500/30 rounded-3xl p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-white font-display">
                  Permanently Remove Activity?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Are you sure you want to delete <strong className="text-white">"{activity.title}"</strong>? It will be permanently removed from NOVA discovery and squad chats will be deleted.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 text-left">
                ⚠️ All {activity.participants.length} registered participant{activity.participants.length === 1 ? '' : 's'} will be notified of removal.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowHostDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Keep Activity
                </button>
                <button
                  id="confirm-delete-activity-btn"
                  onClick={handleConfirmHostDeleteActivity}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-900/40 transition active:scale-95 cursor-pointer"
                >
                  Yes, Remove Activity
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Host Cancel Activity Modal */}
      <AnimatePresence>
        {showHostCancelModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#161720] border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-display">
                    Cancel Activity
                  </h3>
                  <p className="text-xs text-slate-400">
                    Marks the activity as cancelled for all participants
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Cancellation Reason (Shared in Squad Chat):
                </label>
                <input
                  type="text"
                  value={cancelReasonInput}
                  onChange={(e) => setCancelReasonInput(e.target.value)}
                  placeholder="e.g., Weather conditions / Bad rain forecast"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E0F14] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowHostCancelModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Back
                </button>
                <button
                  id="confirm-cancel-activity-btn"
                  onClick={handleConfirmHostCancelActivity}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition active:scale-95 cursor-pointer"
                >
                  Confirm Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: User Leave Penalty Notice */}
      <AnimatePresence>
        {showLeaveWarningModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#161720] border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-white font-display">
                  Late Cancellation Notice
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This activity is scheduled for today or starting soon. Leaving on short notice impacts the squad and will apply a <strong className="text-amber-400">-5 points reliability adjustment</strong>.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowLeaveWarningModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Keep My Spot
                </button>
                <button
                  id="confirm-leave-penalty-btn"
                  onClick={handleConfirmLeaveWithPenalty}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-lg transition active:scale-95 cursor-pointer"
                >
                  Leave Anyway (-5pts)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: Host Event Check-In QR Pass */}
      <AnimatePresence>
        {showHostQrModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#12131C] border border-[#FF5C00]/40 rounded-3xl p-6 shadow-2xl space-y-5 text-center"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-left">
                  <div className="w-8 h-8 rounded-xl bg-[#FF5C00]/20 text-[#FF5C00] flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white font-display">HOST CHECK-IN PASS</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Present to attendees to verify attendance</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHostQrModal(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* QR Matrix Graphics */}
              <div className="p-6 rounded-2xl bg-white text-black max-w-[220px] mx-auto shadow-2xl flex flex-col items-center justify-center gap-2 border-4 border-[#FF5C00]">
                <div className="grid grid-cols-6 gap-1 w-full aspect-square bg-slate-100 p-2 rounded-lg">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        i % 2 === 0 || i % 5 === 0 || i === 0 || i === 5 || i === 30 || i === 35
                          ? 'bg-black'
                          : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono text-[10px] font-black tracking-widest text-slate-800">
                  VYBE-{activity.id.slice(0, 6).toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-left bg-[#181926] p-3.5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Attendees Checked In:</span>
                  <span className="font-black text-emerald-400 font-mono">
                    {activity.participants.filter(p => p.checkedIn).length} / {activity.participants.length}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {activity.participants.map(p => (
                    <div key={p.userId} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                      <span className="text-slate-200 truncate">{p.displayName}</span>
                      {p.checkedIn ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Checked In
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            novaStore.checkInParticipant(activity.id, p.userId);
                            setCheckInSuccessToast(`${p.displayName} marked as checked in!`);
                            setTimeout(() => setCheckInSuccessToast(null), 3000);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold transition cursor-pointer"
                        >
                          Manual Check-In
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowHostQrModal(false)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer"
              >
                Close Pass
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 6: Participant QR Scanner Simulation */}
      <AnimatePresence>
        {showScanQrModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-[#12131C] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-left">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white font-display">EVENT CHECK-IN SCANNER</h3>
                    <p className="text-[10px] text-slate-400">Point at Host QR Code</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowScanQrModal(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Viewfinder Target */}
              <div className="relative aspect-square max-w-[240px] mx-auto bg-black/80 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-4 border-2 border-dashed border-emerald-400/60 rounded-xl" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-bounce" />
                <div className="text-center p-4">
                  <QrCode className="w-16 h-16 text-emerald-400/40 mx-auto animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-mono block mt-2">
                    {isScanning ? 'Verifying Host Cryptographic Pass...' : 'Scanning for host QR pass in frame'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                Scanning host's QR code will instantly verify your attendance and reward Karma reliability to your profile.
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowScanQrModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="confirm-qr-scan-btn"
                  onClick={handleScanQrCheckIn}
                  disabled={isScanning}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)] transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isScanning ? 'Verifying...' : 'Verify Attendance'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 7: Host No-Show Penalty Confirmation */}
      <AnimatePresence>
        {participantToFlakePayout && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#161720] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <UserX className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white font-display">REPORT NO-SHOW ATTENDEE</h3>
                    <p className="text-xs text-slate-400">
                      Participant: <strong className="text-white">{participantToFlakePayout.displayName}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setParticipantToFlakePayout(null)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F1017] border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Reliability Impact:</span>
                  <span className="font-mono font-bold text-red-400">-15 Karma</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Attendance Record:</span>
                  <span className="font-mono text-amber-400">Unexcused No-Show Strike</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                By confirming, the attendee will be penalized with -15 Karma reliability and an official unexcused no-show mark recorded on their activity history.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setParticipantToFlakePayout(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="confirm-flake-penalty-btn"
                  onClick={() => handleProcessFlakePenalty(participantToFlakePayout.userId)}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.3)] transition active:scale-95 cursor-pointer"
                >
                  Confirm Penalty (-15 Karma)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Check-In Notification Toast */}
      <AnimatePresence>
        {checkInSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-70 px-4 py-3 rounded-2xl bg-emerald-500 text-black text-xs font-black shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[3]" />
            <span>{checkInSuccessToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
