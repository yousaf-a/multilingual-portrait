'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Smile,
  Sparkles,
  Heart,
  Share2,
  Copy,
  Check,
  Flame,
  Volume2,
  VolumeX,
  Users,
  Feather
} from 'lucide-react';
import { audioController } from '@/lib/audio';

export interface ChatMessageItem {
  id: string;
  roomId: string;
  sender: string;
  text: string;
  reaction?: string;
  type: 'text' | 'reaction' | 'whisper';
  timestamp: number;
}

interface LiveDuoChatProps {
  roomId: string;
  defaultSender?: string;
  onWhisper?: (text: string) => void;
  isOpen?: boolean;
  onToggleOpen?: (open: boolean) => void;
}

const QUICK_REACTIONS = ['❤️', '✨', '🔥', '🥺', '🌹', '👏', '💍'];

export default function LiveDuoChat({
  roomId,
  defaultSender = 'You',
  onWhisper,
  isOpen: controlledIsOpen,
  onToggleOpen
}: LiveDuoChatProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    if (onToggleOpen) onToggleOpen(val);
    else setInternalIsOpen(val);
  };

  const [senderName, setSenderName] = useState(defaultSender);
  const [isEditingName, setIsEditingName] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isWhisperMode, setIsWhisperMode] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; x: number }[]>([]);

  const lastTimestampRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pollTimerRef = useRef<any>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Poll for new messages
  const fetchMessages = useCallback(async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/room?roomId=${encodeURIComponent(roomId)}&since=${lastTimestampRef.current}`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.messages && data.messages.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const fresh = data.messages.filter((m: ChatMessageItem) => !existingIds.has(m.id));
          if (fresh.length === 0) return prev;

          // Check if any fresh message is from partner
          const partnerMessages = fresh.filter((m: ChatMessageItem) => m.sender !== senderName);
          if (partnerMessages.length > 0) {
            audioController.playMessageSound();
            if (!isOpen) {
              setUnreadCount((c) => c + partnerMessages.length);
            }
          }

          // Trigger floating emojis or whispers
          fresh.forEach((m: ChatMessageItem) => {
            if (m.reaction) {
              spawnFloatingEmoji(m.reaction);
            }
            if (m.type === 'whisper' && onWhisper) {
              onWhisper(m.text);
            }
          });

          return [...prev, ...fresh];
        });

        // Update last timestamp
        const newest = data.messages[data.messages.length - 1];
        if (newest && newest.timestamp > lastTimestampRef.current) {
          lastTimestampRef.current = newest.timestamp;
        }
      }
    } catch (_) {}
  }, [roomId, senderName, isOpen, onWhisper]);

  // Spawn visual floating reaction that travels up the screen
  const spawnFloatingEmoji = (emoji: string) => {
    const id = `fl_${Date.now()}_${Math.random()}`;
    const x = 20 + Math.random() * 60; // 20% to 80% horizontal position
    setFloatingEmojis((prev) => [...prev, { id, emoji, x }]);
    audioController.playReactionSound();

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 2800);
  };

  // Polling loop
  useEffect(() => {
    fetchMessages();
    pollTimerRef.current = setInterval(fetchMessages, 1200);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [fetchMessages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setInputText('');
    const type = isWhisperMode ? 'whisper' : 'text';

    try {
      const res = await fetch('/api/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          sender: senderName,
          text,
          type
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          lastTimestampRef.current = Math.max(lastTimestampRef.current, data.message.timestamp);
          setMessages((prev) => [...prev, data.message]);
          if (type === 'whisper' && onWhisper) {
            onWhisper(text);
          }
          audioController.playMessageSound();
        }
      }
    } catch (_) {}
  };

  // Send quick emoji reaction
  const handleSendReaction = async (emoji: string) => {
    spawnFloatingEmoji(emoji);
    try {
      await fetch('/api/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          sender: senderName,
          text: emoji,
          reaction: emoji,
          type: 'reaction'
        })
      });
    } catch (_) {}
  };

  // Copy shareable invite link
  const handleCopyInvite = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <>
      {/* Floating Canvas Emojis (fly upwards over portrait) */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingEmojis.map((item) => (
          <div
            key={item.id}
            className="absolute bottom-16 text-3xl select-none animate-floating-reaction"
            style={{ left: `${item.x}%` }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Floating Toggle Button (Bottom-Right) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold shadow-[0_0_25px_rgba(6,182,212,0.45)] transition transform active:scale-95 cursor-pointer backdrop-blur-md border border-white/20"
        >
          <div className="relative">
            <MessageSquare size={17} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>
          <span>Live Duo Chat</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Active Chat Window Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[350px] sm:w-[380px] max-w-[calc(100vw-32px)] h-[520px] max-h-[calc(100vh-40px)] bg-[#0a1226]/95 border border-[#1e3463] rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-3.5 px-4 bg-[#070e1f] border-b border-[#18274d] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                  <Users size={15} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#070e1f]"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white tracking-wide">Live Duo Room</h3>
                  <span className="text-[10px] text-cyan-300 px-1.5 py-0.2 rounded-full bg-cyan-950 border border-cyan-500/30">
                    2 People
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>Chatting as:</span>
                  {isEditingName ? (
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      onBlur={() => setIsEditingName(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                      autoFocus
                      className="w-20 px-1 py-0.2 bg-slate-800 text-white rounded border border-cyan-400 text-[10px] outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                      title="Click to change your nickname"
                    >
                      {senderName} ✎
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: Invite & Close */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyInvite}
                className="p-1.5 rounded-xl bg-[#0f1b3d] hover:bg-[#182a5c] text-slate-300 hover:text-white border border-[#213568] transition text-xs flex items-center gap-1"
                title="Copy Room Link to share with partner"
              >
                {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span className="text-[10px] hidden sm:inline">{copiedLink ? 'Copied!' : 'Invite'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                title="Minimize Chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 scrollbar-thin scrollbar-thumb-[#1e305e] scrollbar-track-transparent">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-[#101b3b] flex items-center justify-center text-cyan-400 mb-2 border border-[#1e3260]">
                  <Sparkles size={20} />
                </div>
                <p className="text-xs font-medium text-slate-300">Welcome to your private room!</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
                  Share the link with your partner. Anything you send appears here live in sync.
                </p>
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  className="mt-3.5 px-3 py-1.5 rounded-xl bg-[#13234d] hover:bg-[#1b316b] text-cyan-300 text-[11px] font-semibold border border-cyan-500/30 flex items-center gap-1.5 transition"
                >
                  <Copy size={12} />
                  <span>Copy Partner Invite Link</span>
                </button>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender === senderName;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-1 duration-200`}
                  >
                    <div className="flex items-center gap-1 mb-0.5 px-1">
                      <span className="text-[10px] font-medium text-slate-400">
                        {isMe ? 'You' : m.sender}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs break-words shadow-md ${
                        isMe
                          ? m.type === 'whisper'
                            ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white rounded-br-xs border border-amber-300/40'
                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs'
                          : m.type === 'whisper'
                          ? 'bg-[#1a1429] text-amber-200 border border-amber-500/40 rounded-bl-xs'
                          : 'bg-[#101b38] text-slate-200 border border-[#1e3463] rounded-bl-xs'
                      }`}
                    >
                      {m.type === 'whisper' && (
                        <div className="text-[9px] font-semibold tracking-wider uppercase flex items-center gap-1 mb-0.5 opacity-90 text-amber-300">
                          <Feather size={10} />
                          <span>Calligraphy Whisper</span>
                        </div>
                      )}
                      <p className="leading-relaxed">{m.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reaction Bar */}
          <div className="px-3 py-1.5 bg-[#060b18] border-t border-[#131f3f] flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
            <span className="text-[10px] text-slate-500 font-medium shrink-0 pl-1">React:</span>
            <div className="flex items-center gap-1">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSendReaction(emoji)}
                  className="w-7 h-7 rounded-lg hover:bg-white/10 active:scale-125 transition flex items-center justify-center text-sm cursor-pointer"
                  title={`Send ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Input & Send Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 px-3 bg-[#080e1f] border-t border-[#18294f] flex flex-col gap-2"
          >
            {/* Whisper Mode Toggle */}
            <div className="flex items-center justify-between text-[11px] px-1">
              <button
                type="button"
                onClick={() => setIsWhisperMode(!isWhisperMode)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition font-medium cursor-pointer ${
                  isWhisperMode
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="When on, your message writes onto the portrait drawing canvas"
              >
                <Feather size={12} className={isWhisperMode ? 'text-amber-400' : ''} />
                <span>Whisper on Canvas</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isWhisperMode ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`}
                />
              </button>

              <span className="text-[10px] text-slate-500">Press Enter ↵ to send</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isWhisperMode ? 'Whisper onto canvas...' : 'Type a message to partner...'}
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#050a18] border border-[#213563] focus:border-cyan-400 focus:outline-none text-xs text-white placeholder:text-slate-500 transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 text-white transition cursor-pointer shadow-md shadow-cyan-500/20"
                title="Send Message"
              >
                <Send size={15} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

