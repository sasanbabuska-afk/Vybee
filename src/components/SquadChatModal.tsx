import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Users,
  Info,
  Shield,
  AlertTriangle,
  Smile,
  Trash2,
  Flag,
  ArrowLeft,
  Lock,
  Calendar,
  MapPin,
  Clock,
  CheckCheck,
  Sparkles,
  ChevronDown,
  UserCheck,
  Flame,
  Radio
} from 'lucide-react';
import { Activity, ChatMessage, User } from '../types';
import { novaStore } from '../services/store';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import { EmojiQuickPicker } from './EmojiQuickPicker';

interface SquadChatModalProps {
  activity: Activity;
  currentUser: User;
  onClose: () => void;
  onOpenActivityDetails: (activity: Activity) => void;
  onQuickJoin?: (activityId: string) => void;
  onReportMessage?: (msg: ChatMessage) => void;
  onOpenUserProfile?: (userId: string) => void;
}

const QUICK_PROMPTS = [
  "I'm on my way! 🏃‍♂️",
  "At the venue 📍",
  "Bringing extra gear ⚡",
  "Ready to play! 🔥",
  "Running 5 mins late ⏰"
];

export const SquadChatModal: React.FC<SquadChatModalProps> = ({
  activity,
  currentUser,
  onClose,
  onOpenActivityDetails,
  onQuickJoin,
  onReportMessage,
  onOpenUserProfile
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showParticipantsDrawer, setShowParticipantsDrawer] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Access check
  const access = novaStore.canUserAccessChat(activity.id, currentUser.id);
  const isHost = activity.creatorId === currentUser.id;
  const isCancelled = activity.status === 'cancelled';
  const isFull = activity.participants.length >= activity.maxParticipants;

  // Load and subscribe to messages
  useEffect(() => {
    if (!access.canAccess) return;

    // Mark chat as read
    novaStore.markActivityChatAsRead(activity.id, currentUser.id);

    // Initial load from store
    const localMsgs = novaStore.getActivityMessages(activity.id, currentUser.id);
    setMessages(localMsgs);

    // If Supabase is configured, try fetching remote messages and subscribe
    let unsubscribeSupabase = () => {};
    if (isSupabaseConfigured()) {
      setIsRealtimeActive(true);
      supabaseService.fetchActivityMessages(activity.id).then((remoteMsgs) => {
        if (remoteMsgs && remoteMsgs.length > 0) {
          // Merge with local store
          remoteMsgs.forEach(m => novaStore.receiveRealtimeChatMessage(activity.id, m));
          setMessages(novaStore.getActivityMessages(activity.id, currentUser.id));
        }
      });

      unsubscribeSupabase = supabaseService.subscribeToActivityMessages(
        activity.id,
        (newMsg) => {
          novaStore.receiveRealtimeChatMessage(activity.id, newMsg);
          setMessages(novaStore.getActivityMessages(activity.id, currentUser.id));
          novaStore.markActivityChatAsRead(activity.id, currentUser.id);
        },
        (deletedId) => {
          novaStore.deleteActivityMessage(activity.id, deletedId, currentUser.id);
          setMessages(novaStore.getActivityMessages(activity.id, currentUser.id));
        }
      );
    }

    // Subscribe to store updates
    const unsubscribeStore = novaStore.subscribe(() => {
      setMessages(novaStore.getActivityMessages(activity.id, currentUser.id));
    });

    return () => {
      unsubscribeStore();
      unsubscribeSupabase();
    };
  }, [activity.id, currentUser.id, access.canAccess]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSendMessage = async (textToSend?: string) => {
    const raw = textToSend !== undefined ? textToSend : inputText;
    const trimmed = raw.trim();
    if (!trimmed || isSending || isCancelled) return;

    if (trimmed.length > 1000) {
      setSendError('Message exceeds 1,000 characters limit.');
      return;
    }

    setIsSending(true);
    setSendError(null);

    // Optimistic local dispatch
    const result = novaStore.sendActivityMessage(activity.id, trimmed, false, {
      id: currentUser.id,
      displayName: currentUser.displayName,
      profilePhoto: currentUser.profilePhoto
    });

    if (!result.success) {
      setSendError(result.error || 'Failed to send message.');
      setIsSending(false);
      return;
    }

    setInputText('');
    setShowEmojiPicker(false);
    setIsSending(false);

    // Sync to Supabase in background if available
    if (isSupabaseConfigured()) {
      supabaseService.sendActivityMessage(activity.id, currentUser.id, trimmed).catch((err) => {
        console.warn('Supabase message sync warning:', err);
      });
    }

    // Refocus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    novaStore.deleteActivityMessage(activity.id, messageId, currentUser.id);
    if (isSupabaseConfigured()) {
      supabaseService.deleteActivityMessage(messageId).catch(console.warn);
    }
  };

  return (
    <div
      id="squad-chat-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <motion.div
        id={`squad-chat-container-${activity.id}`}
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full sm:h-[88vh] sm:max-w-2xl bg-[#0C0D14] sm:border sm:border-white/10 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white relative"
      >
        {/* ========================================================== */}
        {/* 1. SQUAD CHAT HEADER */}
        {/* ========================================================== */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#12131C] border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Back Button */}
            <button
              id="squad-chat-back-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition active:scale-95 cursor-pointer shrink-0"
              title="Close Squad Chat"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Activity Info & Title */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#FF5C00]">
                  {activity.category}
                </span>
                {isRealtimeActive && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate font-display">
                {activity.title}
              </h2>
            </div>
          </div>

          {/* Right Action Shortcuts */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Participant Roster Toggle */}
            <button
              id="squad-participants-toggle-btn"
              onClick={() => setShowParticipantsDrawer(!showParticipantsDrawer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                showParticipantsDrawer
                  ? 'bg-[#FF5C00] text-black border-[#FF5C00]'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
              title="View Squad Roster"
            >
              <Users className="w-3.5 h-3.5" />
              <span>
                {activity.participants.length}/{activity.maxParticipants}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showParticipantsDrawer ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Activity Info Shortcut */}
            <button
              id="squad-activity-details-btn"
              onClick={() => onOpenActivityDetails(activity)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition active:scale-95 cursor-pointer"
              title="View Activity Details"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              id="squad-chat-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================== */}
        {/* PARTICIPANTS ROSTER DRAWER (COLLAPSIBLE) */}
        {/* ========================================================== */}
        <AnimatePresence>
          {showParticipantsDrawer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#151622] border-b border-white/10 px-4 sm:px-6 py-3 overflow-hidden shrink-0"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#FF5C00]" />
                  <span>Squad Members ({activity.participants.length}/{activity.maxParticipants})</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  {activity.locationName} · {activity.startTime}
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {activity.participants.map((p) => {
                  const isHostMember = p.userId === activity.creatorId;
                  const isMe = p.userId === currentUser.id;

                  return (
                    <div
                      key={p.userId}
                      onClick={() => onOpenUserProfile && onOpenUserProfile(p.userId)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shrink-0 transition cursor-pointer ${
                        isMe
                          ? 'bg-[#FF5C00]/10 border-[#FF5C00]/30 text-white'
                          : 'bg-[#1C1D2B] border-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={p.profilePhoto}
                          alt={p.displayName}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10"
                          referrerPolicy="no-referrer"
                        />
                        {isHostMember && (
                          <span
                            className="absolute -top-1 -right-1 text-[10px]"
                            title="Squad Host"
                          >
                            👑
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium truncate max-w-[90px]">
                        {p.displayName}
                      </span>
                      {isHostMember && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                          Host
                        </span>
                      )}
                      {isMe && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-[#FF5C00]/20 text-[#FF5C00] rounded">
                          You
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================== */}
        {/* CANCELLED ACTIVITY BANNER */}
        {/* ========================================================== */}
        {isCancelled && (
          <div className="bg-red-500/15 border-b border-red-500/30 px-4 sm:px-6 py-2.5 flex items-center gap-2.5 text-xs text-red-200 shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold">Activity Cancelled by Host. </span>
              <span className="text-red-300/80">Squad Chat is now in read-only archive mode.</span>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* 2. ACCESS CONTROL GATE OR CHAT STREAM */}
        {/* ========================================================== */}
        {!access.canAccess ? (
          /* LOCKED / ACCESS DENIED VIEW */
          <div
            id="squad-chat-access-locked"
            className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5 bg-[#0C0D14]"
          >
            <div className="w-16 h-16 rounded-3xl bg-[#1A1A26] border border-white/10 flex items-center justify-center text-[#FF5C00] shadow-xl">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-sm">
              <h3 className="text-lg font-bold text-white font-display">
                Private Squad Chat
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Only confirmed participants of this VYBE have access to the private Squad Chat.
              </p>
            </div>

            <div className="bg-[#141520] border border-white/5 rounded-2xl p-4 w-full max-w-xs space-y-2 text-left">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="text-slate-400">Activity:</span>
                <span className="font-bold text-white truncate max-w-[150px]">{activity.title}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="text-slate-400">Confirmed:</span>
                <span className="font-bold text-[#FF5C00]">
                  {activity.participants.length} / {activity.maxParticipants} joined
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="text-slate-400">Time:</span>
                <span className="font-medium text-slate-200">{activity.startTime}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs pt-2">
              {!isFull ? (
                <button
                  id="squad-chat-join-now-btn"
                  onClick={() => {
                    if (onQuickJoin) onQuickJoin(activity.id);
                  }}
                  className="w-full py-3 rounded-xl bg-[#FF5C00] hover:bg-[#ff6f1f] text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-[#FF5C00]/20 active:scale-95 cursor-pointer"
                >
                  Join VYBE to Enter Chat
                </button>
              ) : (
                <div className="w-full py-2.5 rounded-xl bg-white/5 text-slate-400 text-xs font-semibold text-center border border-white/5">
                  Squad is Currently Full
                </div>
              )}

              <button
                id="squad-chat-view-details-btn"
                onClick={() => onOpenActivityDetails(activity)}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition border border-white/10 cursor-pointer"
              >
                View Activity Details
              </button>
            </div>
          </div>
        ) : (
          /* CHAT STREAM + MESSAGES */
          <div className="flex-1 flex flex-col min-h-0 bg-[#0C0D14]">
            {/* Scrollable Message List */}
            <div
              id="squad-chat-messages-stream"
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin"
            >
              {/* Squad Welcome Banner */}
              <div className="text-center py-4 space-y-2 border-b border-white/5 mb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[#FF5C00]/10 text-[#FF5C00] border border-[#FF5C00]/20">
                  <Flame className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white font-display">
                    Welcome to the {activity.title} Squad Chat
                  </h4>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Coordinates, gear arrangements, and meetup logistics happen here. Keep it friendly and reliable!
                  </p>
                </div>
              </div>

              {/* Empty State */}
              {messages.length === 0 && (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#151622] text-slate-500 flex items-center justify-center mx-auto border border-white/5">
                    💬
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Start the conversation</p>
                    <p className="text-[11px] text-slate-400">
                      Say hello to your squad or confirm your arrival time.
                    </p>
                  </div>
                </div>
              )}

              {/* Message Items */}
              {messages.map((msg) => {
                const isMe = msg.userId === currentUser.id;
                const isSystem = msg.isSystem || msg.userId === 'system';
                const isHostSender = msg.userId === activity.creatorId;

                if (isSystem) {
                  return (
                    <div
                      key={msg.id}
                      className="flex items-center justify-center my-2 animate-fade-in"
                    >
                      <div className="px-3.5 py-1.5 rounded-full bg-[#181926] border border-white/10 text-[11px] text-slate-300 font-medium flex items-center gap-1.5 shadow-sm max-w-md text-center">
                        <Sparkles className="w-3 h-3 text-[#FF5C00] shrink-0" />
                        <span>{msg.text}</span>
                        <span className="text-[9px] text-slate-500 ml-1 shrink-0">{msg.timestamp}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 group animate-fade-in ${
                      isMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* Other User Avatar */}
                    {!isMe && (
                      <button
                        onClick={() => onOpenUserProfile && onOpenUserProfile(msg.userId)}
                        className="shrink-0 mb-1 cursor-pointer"
                        title={msg.userName}
                      >
                        <img
                          src={msg.userPhoto}
                          alt={msg.userName}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    )}

                    {/* Message Bubble & Metadata */}
                    <div className={`max-w-[78%] sm:max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* Sender Name (if not me) */}
                      {!isMe && (
                        <div className="flex items-center gap-1.5 px-1 text-[11px]">
                          <span className="font-bold text-slate-300">{msg.userName}</span>
                          {isHostSender && (
                            <span className="text-[9px] font-black uppercase px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 flex items-center gap-0.5">
                              <span>👑</span>
                              <span>Host</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Bubble */}
                      <div className="relative group/bubble">
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed break-words shadow-md ${
                            isMe
                              ? 'bg-[#FF5C00] text-black font-semibold rounded-br-xs shadow-[#FF5C00]/10'
                              : 'bg-[#1A1B28] text-slate-100 border border-white/5 rounded-bl-xs'
                          }`}
                        >
                          {msg.text}
                        </div>

                        {/* Hover Quick Actions */}
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-150 flex items-center gap-1 px-1 ${
                            isMe ? '-left-8' : '-right-8'
                          }`}
                        >
                          {isMe ? (
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1 rounded-lg bg-black/60 hover:bg-red-500/30 text-slate-400 hover:text-red-300 transition cursor-pointer"
                              title="Delete message"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onReportMessage && onReportMessage(msg)}
                              className="p-1 rounded-lg bg-black/60 hover:bg-white/10 text-slate-400 hover:text-amber-300 transition cursor-pointer"
                              title="Report message"
                            >
                              <Flag className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div
                        className={`flex items-center gap-1 px-1 text-[10px] text-slate-500 ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-slate-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Error Notification */}
            {sendError && (
              <div className="px-4 py-2 bg-red-500/20 border-t border-red-500/30 text-xs text-red-300 flex items-center justify-between shrink-0">
                <span>{sendError}</span>
                <button
                  onClick={() => setSendError(null)}
                  className="p-1 text-red-300 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Prompts Chips */}
            {!isCancelled && (
              <div className="px-4 py-2 bg-[#10111A] border-t border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-3 py-1 rounded-full bg-[#1A1B28] hover:bg-white/10 text-[11px] text-slate-300 hover:text-white border border-white/5 transition whitespace-nowrap active:scale-95 cursor-pointer shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Emoji Quick Picker Popup */}
            {showEmojiPicker && !isCancelled && (
              <div className="p-3 bg-[#12131D] border-t border-white/10 shrink-0">
                <EmojiQuickPicker
                  isOpen={showEmojiPicker}
                  inline={true}
                  onSelectEmoji={(emoji) => {
                    setInputText((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                    inputRef.current?.focus();
                  }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}

            {/* ========================================================== */}
            {/* 3. INPUT BAR */}
            {/* ========================================================== */}
            <div className="p-3 sm:p-4 bg-[#12131C] border-t border-white/10 shrink-0">
              {isCancelled ? (
                <div className="py-2 px-4 rounded-xl bg-white/5 text-center text-xs text-slate-400 font-medium border border-white/5">
                  Squad chat is disabled for cancelled activities.
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Emoji Button */}
                  <button
                    id="squad-chat-emoji-toggle-btn"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2.5 rounded-xl transition cursor-pointer border ${
                      showEmojiPicker
                        ? 'bg-[#FF5C00]/20 text-[#FF5C00] border-[#FF5C00]/40'
                        : 'bg-[#181926] text-slate-400 hover:text-white hover:bg-white/5 border-white/5'
                    }`}
                    title="Insert emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  {/* Input Field */}
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      id="squad-chat-input-field"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Write a message to your squad... (Enter to send)"
                      rows={1}
                      maxLength={1000}
                      className="w-full bg-[#181926] border border-white/10 focus:border-[#FF5C00] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition resize-none max-h-24 scrollbar-none"
                    />
                    {inputText.length > 800 && (
                      <span className="absolute right-2 bottom-1.5 text-[10px] text-slate-500">
                        {inputText.length}/1000
                      </span>
                    )}
                  </div>

                  {/* Send Button */}
                  <button
                    id="squad-chat-send-btn"
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isSending}
                    className={`p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                      inputText.trim() && !isSending
                        ? 'bg-[#FF5C00] hover:bg-[#ff6f1f] text-black shadow-md shadow-[#FF5C00]/20'
                        : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
