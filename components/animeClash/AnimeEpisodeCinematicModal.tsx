'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChapterQuest, QuestDialogue } from '@/lib/animeClash/narutoChapterQuests';
import { freeAnimeAudio } from '@/lib/animeClash/freeAnimeAudio';
import {
  X,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Swords,
  Scroll,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Flame,
  Shield,
  Zap,
  Target,
  Tv,
  Film
} from 'lucide-react';

interface AnimeEpisodeCinematicModalProps {
  quest: ChapterQuest;
  onClose: () => void;
  onEnterVillageMission: () => void;
}

type CinematicAct = 'cold_open' | 'dialogue_faceoff' | 'recon_scroll' | 'climax_clash';

export default function AnimeEpisodeCinematicModal({
  quest,
  onClose,
  onEnterVillageMission
}: AnimeEpisodeCinematicModalProps) {
  const [activeAct, setActiveAct] = useState<CinematicAct>('cold_open');
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [flashWhite, setFlashWhite] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const dialogues: QuestDialogue[] = quest.prologue && quest.prologue.length > 0
    ? quest.prologue
    : [
        {
          speaker: quest.animeIntro?.speaker || 'Mentor',
          avatar: quest.animeIntro?.speakerAvatar || '🥷',
          text: quest.animeIntro?.dramaticQuote || 'Stay vigilant, Shinobi!',
          mood: 'dramatic'
        },
        {
          speaker: 'Naruto Uzumaki',
          avatar: '🍥',
          text: 'I will never give up! Believe it, dattebayo!',
          mood: 'determined'
        }
      ];

  const currentDialogue = dialogues[dialogueIdx] || dialogues[0];
  const isNarutoSpeaking = currentDialogue.speaker.toLowerCase().includes('naruto');

  // Trigger screen impact shake & flash
  const triggerImpact = () => {
    setScreenShake(true);
    setFlashWhite(true);
    setTimeout(() => setFlashWhite(false), 90);
    setTimeout(() => setScreenShake(false), 320);
  };

  // 1. Initial Launch: Cold Open Fanfare & Ambient BGM
  useEffect(() => {
    freeAnimeAudio.playEpisodeIntroFanfare();
    triggerImpact();

    if (!isAudioMuted) {
      freeAnimeAudio.startAnimePrologueBgm();
    }

    return () => {
      freeAnimeAudio.stopAnimePrologueBgm();
    };
  }, []);

  // 2. Typewriter Effect for Dialogue Cutscene
  useEffect(() => {
    if (activeAct !== 'dialogue_faceoff') return;

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setTypedText('');
    setIsTyping(true);

    const fullText = currentDialogue.text;
    let charIdx = 0;

    // Speak dialogue with Web Speech API
    if (!isAudioMuted) {
      freeAnimeAudio.speakDialogue(fullText, currentDialogue.mood);
    }

    typingTimerRef.current = setInterval(() => {
      charIdx++;
      if (charIdx <= fullText.length) {
        setTypedText(fullText.slice(0, charIdx));
      } else {
        setIsTyping(false);
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);

        // Auto play to next dialogue after delay
        if (isAutoPlay) {
          setTimeout(() => {
            handleNextDialogue();
          }, 2400);
        }
      }
    }, 28);

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [dialogueIdx, activeAct, isAutoPlay, isAudioMuted]);

  // Dialogue Stepper Handlers
  const handleNextDialogue = () => {
    if (dialogueIdx < dialogues.length - 1) {
      setDialogueIdx((prev) => prev + 1);
      freeAnimeAudio.playJutsuWhoosh();
    } else {
      // Transition to Recon Scroll Act
      setActiveAct('recon_scroll');
      freeAnimeAudio.playEpisodeIntroFanfare();
      triggerImpact();
    }
  };

  const handlePrevDialogue = () => {
    if (dialogueIdx > 0) {
      setDialogueIdx((prev) => prev - 1);
      freeAnimeAudio.playJutsuWhoosh();
    }
  };

  // 3. Canvas 60FPS Particles: Swirling Autumn Leaves, Glowing Embers, and Manga Speedlines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool: 35 Glowing Embers + 25 Konoha Green/Orange Leaves
    interface Particle {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      opacity: number;
      rotation: number;
      rotSpeed: number;
      type: 'ember' | 'leaf';
      color: string;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 60; i++) {
      const isLeaf = i % 2 === 0;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: isLeaf ? 9 + Math.random() * 8 : 2 + Math.random() * 3,
        vx: (Math.random() - 0.2) * 2.2 + 0.5,
        vy: isLeaf ? 0.8 + Math.random() * 1.4 : -1.2 - Math.random() * 1.8,
        opacity: 0.3 + Math.random() * 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        type: isLeaf ? 'leaf' : 'ember',
        color: isLeaf
          ? Math.random() > 0.5
            ? '#22c55e'
            : '#ea580c'
          : Math.random() > 0.4
          ? '#f97316'
          : '#fbbf24'
      });
    }

    let speedlineFrame = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // A. Dynamic Manga Speedlines when in Cold Open or Climax Clash
      if (activeAct === 'cold_open' || activeAct === 'climax_clash') {
        speedlineFrame++;
        const cx = width / 2;
        const cy = height / 2;
        ctx.save();
        ctx.strokeStyle = activeAct === 'climax_clash' ? 'rgba(249, 115, 22, 0.16)' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1.5;

        for (let a = 0; a < 36; a++) {
          const angle = (a * 10 * Math.PI) / 180 + Math.sin(speedlineFrame * 0.04 + a) * 0.03;
          const r1 = 180 + (Math.sin(speedlineFrame * 0.2 + a) * 40);
          const r2 = Math.max(width, height) * 0.95;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
          ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // B. Wind Particles & Embers
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        if (p.x > width + 40) p.x = -20;
        if (p.x < -40) p.x = width + 20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (p.type === 'ember') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Konoha Leaf Silhouette
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeAct]);

  // Audio Toggle
  const toggleAudio = () => {
    if (isAudioMuted) {
      setIsAudioMuted(false);
      freeAnimeAudio.startAnimePrologueBgm();
    } else {
      setIsAudioMuted(true);
      freeAnimeAudio.stopAnimePrologueBgm();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  };

  // Determine Mission Rank
  const missionRank =
    quest.questNumber >= 20 ? 'RANK S (APEX APOCALYPSE)'
    : quest.questNumber >= 15 ? 'RANK A (ELITE JONIN)'
    : quest.questNumber >= 8 ? 'RANK B (CHUNIN EXAM)'
    : quest.questNumber >= 4 ? 'RANK C (LAND OF WAVES)'
    : 'RANK D (GENIN SQUAD)';

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/98 flex flex-col justify-between select-none overflow-hidden transition-transform duration-75 ${
        screenShake ? 'scale-[1.015] translate-y-1 rotate-0.5' : 'scale-100'
      }`}
    >
      {/* 60FPS Particles Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-80" />

      {/* Screen White Flash Effect */}
      {flashWhite && <div className="absolute inset-0 bg-white pointer-events-none z-30 opacity-70 transition-opacity duration-100" />}

      {/* Atmospheric Radial Gradients */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-45"
        style={{
          background:
            activeAct === 'cold_open'
              ? 'radial-gradient(circle at 50% 40%, rgba(249,115,22,0.3) 0%, rgba(180,83,9,0.1) 45%, transparent 75%)'
              : activeAct === 'dialogue_faceoff'
              ? 'radial-gradient(circle at 50% 50%, rgba(14,165,233,0.25) 0%, rgba(59,130,246,0.08) 50%, transparent 80%)'
              : activeAct === 'recon_scroll'
              ? 'radial-gradient(circle at 50% 50%, rgba(234,179,8,0.2) 0%, rgba(161,98,7,0.08) 50%, transparent 80%)'
              : 'radial-gradient(circle at 50% 50%, rgba(239,68,68,0.35) 0%, rgba(185,28,28,0.15) 50%, transparent 80%)'
        }}
      />

      {/* ============================================================ */}
      {/* 1. TOP CINEMA BAR: TV TOKYO BROADCAST HUD & AUDIO CONTROLS   */}
      {/* ============================================================ */}
      <div className="relative z-20 h-16 sm:h-20 bg-black/90 border-b border-white/10 flex items-center justify-between px-4 sm:px-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-red-300">
              TV TOKYO &bull; SHONEN ANIME BROADCAST
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <span>KONOHAGAKURE CHRONICLES</span>
            <span>&bull;</span>
            <span className="text-amber-400 font-bold">{quest.arcName}</span>
          </div>
        </div>

        {/* Acts Stepper Pills */}
        <div className="hidden lg:flex items-center gap-1 bg-black/70 p-1 rounded-2xl border border-white/10">
          {[
            { id: 'cold_open', label: '1. Title Cold Open', icon: Film },
            { id: 'dialogue_faceoff', label: '2. Face-Off Story', icon: MessageSquare },
            { id: 'recon_scroll', label: '3. Shinobi Recon', icon: Scroll },
            { id: 'climax_clash', label: '4. Mission Deploy', icon: Swords }
          ].map((act) => {
            const Icon = act.icon;
            const isActive = activeAct === act.id;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => {
                  setActiveAct(act.id as CinematicAct);
                  freeAnimeAudio.playJutsuWhoosh();
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={13} />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>

        {/* Audio Toggle & Skip Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleAudio}
            className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold border ${
              !isAudioMuted
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-black/60 text-slate-400 border-white/10'
            }`}
            title={isAudioMuted ? 'Unmute Audio & Voice' : 'Mute Sound'}
          >
            {!isAudioMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="hidden sm:inline">{!isAudioMuted ? 'DSP Sound ON' : 'Muted'}</span>
          </button>

          <button
            type="button"
            onClick={onEnterVillageMission}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer transition flex items-center gap-1"
          >
            <span>Skip Intro</span>
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CENTER STAGE: 4 DYNAMIC ANIME CINEMATIC ACTS              */}
      {/* ============================================================ */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-6xl mx-auto w-full overflow-y-auto">

        {/* ------------------------------------------------------------ */}
        {/* ACT 1: THE COLD OPEN & KANJI CALLIGRAPHY SLAM                */}
        {/* ------------------------------------------------------------ */}
        {activeAct === 'cold_open' && (
          <div className="flex flex-col items-center text-center animate-in zoom-in-95 fade-in duration-500 max-w-4xl">
            {/* Episode Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 via-amber-500/30 to-orange-500/20 border border-orange-500/50 mb-3 backdrop-blur-md">
              <span className="text-orange-400 font-mono text-xs font-black uppercase tracking-widest">
                {quest.arcName} &bull; EPISODE {quest.questNumber}
              </span>
            </div>

            {/* Giant Japanese Kanji Calligraphy Slam with Golden Glow */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-500 tracking-wider font-serif drop-shadow-[0_0_45px_rgba(249,115,22,0.9)] my-2 animate-pulse">
              {quest.japaneseKanji}
            </h1>

            {/* English Title Subtitle */}
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide mt-1 mb-4 drop-shadow-md">
              {quest.animeIntro?.subTitle || quest.title}
            </h2>

            {/* High-Stakes Dramatic Synopsis */}
            <div className="p-5 sm:p-6 rounded-3xl bg-black/75 border-2 border-orange-500/40 max-w-2xl backdrop-blur-xl shadow-[0_0_60px_rgba(249,115,22,0.25)] mb-6 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-15 text-orange-400">
                <Flame size={80} />
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-orange-400 font-bold mb-1 flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>Episode Synopsis &bull; Will of Fire Inception</span>
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                {quest.animeIntro?.synopsis}
              </p>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-amber-300 font-bold">
                  {missionRank}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Konohagakure Archives
                </span>
              </div>
            </div>

            {/* Proceed to Act 2 Button */}
            <button
              type="button"
              onClick={() => {
                setActiveAct('dialogue_faceoff');
                freeAnimeAudio.playJutsuWhoosh();
              }}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_40px_rgba(249,115,22,0.8)] transition cursor-pointer flex items-center gap-2 transform hover:scale-105 active:scale-95"
            >
              <span>Watch Story Dialogue Cutscene</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* ACT 2: VISUAL NOVEL CHARACTER CUT-IN FACE-OFF                */}
        {/* ------------------------------------------------------------ */}
        {activeAct === 'dialogue_faceoff' && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            {/* Split Screen Character Battle Avatars */}
            <div className="w-full grid grid-cols-2 gap-4 sm:gap-8 max-w-4xl mb-4 sm:mb-6">
              {/* Left Side: Naruto Uzumaki */}
              <div
                className={`relative p-4 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center ${
                  isNarutoSpeaking
                    ? 'bg-orange-950/60 border-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.5)] scale-105'
                    : 'bg-black/60 border-white/10 opacity-70 scale-95'
                }`}
              >
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-orange-400/60 shadow-xl mb-2 bg-gradient-to-b from-orange-900/50 to-black flex items-center justify-center">
                  <img
                    src="/anime-heroes/naruto-heroic.png"
                    alt="Naruto Uzumaki"
                    className="w-full h-full object-contain transform hover:scale-110 transition duration-300"
                    onError={(e) => {
                      // Fallback emoji if image loading fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-4xl pointer-events-none">
                    🍥
                  </div>
                  {isNarutoSpeaking && (
                    <div className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full bg-orange-500 text-slate-950 text-[10px] font-black uppercase font-mono animate-pulse">
                      SPEAKING
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-sm sm:text-base font-black text-white">Naruto Uzumaki</h3>
                  <p className="text-[11px] text-orange-400 font-mono">Seventh Hokage Candidate</p>
                </div>
              </div>

              {/* Right Side: Mentor / Antagonist Guest */}
              <div
                className={`relative p-4 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center ${
                  !isNarutoSpeaking
                    ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.5)] scale-105'
                    : 'bg-black/60 border-white/10 opacity-70 scale-95'
                }`}
              >
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-cyan-400/60 shadow-xl mb-2 bg-gradient-to-b from-cyan-900/50 to-black flex items-center justify-center">
                  <img
                    src={(() => {
                      const s = (quest.animeIntro?.speaker || currentDialogue.speaker || '').toLowerCase();
                      if (s.includes('kakashi')) return '/anime-heroes/kakashi_portrait.jpg';
                      if (s.includes('zabuza') || s.includes('haku') || s.includes('demon')) return '/anime-heroes/zabuza_portrait.jpg';
                      if (s.includes('jiraiya')) return '/anime-heroes/jiraiya_portrait.jpg';
                      if (s.includes('pain') || s.includes('nagato') || s.includes('konan')) return '/anime-heroes/pain_portrait.jpg';
                      if (s.includes('tsunade')) return '/anime-heroes/tsunade-tactical.png';
                      if (s.includes('minato')) return '/anime-heroes/minato-tactical.png';
                      if (s.includes('madara') || s.includes('obito')) return '/anime-heroes/madara-boss.png';
                      return '/anime-heroes/naruto-epic.png';
                    })()}
                    alt={quest.animeIntro?.speaker || 'Speaker'}
                    className="w-full h-full object-cover transform hover:scale-110 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-4xl pointer-events-none">
                    {quest.animeIntro?.speakerAvatar || '🥷'}
                  </div>
                  {!isNarutoSpeaking && (
                    <div className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black uppercase font-mono animate-pulse">
                      SPEAKING
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {quest.animeIntro?.speaker || currentDialogue.speaker}
                  </h3>
                  <p className="text-[11px] text-cyan-400 font-mono">
                    {quest.animeIntro?.speaker?.toLowerCase().includes('kakashi')
                      ? 'Elite Leaf Jonin &bull; Sharingan'
                      : quest.arcName}
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Novel Typewriter Dialogue Box */}
            <div className="w-full max-w-3xl p-5 sm:p-6 rounded-3xl bg-black/85 border-2 border-white/20 backdrop-blur-2xl shadow-2xl relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    {currentDialogue.speaker}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    Mood: {currentDialogue.mood || 'determined'}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Dialogue {dialogueIdx + 1} / {dialogues.length}
                </span>
              </div>

              {/* Typewriter Spoken Text */}
              <p className="text-base sm:text-xl text-white font-serif leading-relaxed min-h-[68px]">
                &ldquo;{typedText}&rdquo;
                {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-amber-400 animate-pulse" />}
              </p>

              {/* Dialogue Controller Dock */}
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevDialogue}
                    disabled={dialogueIdx === 0}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-slate-300 transition cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft size={14} />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isAudioMuted) {
                        freeAnimeAudio.speakDialogue(currentDialogue.text, currentDialogue.mood);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Volume2 size={14} />
                    <span>Replay Voice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1 ${
                      isAutoPlay
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-md'
                        : 'bg-black/60 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {isAutoPlay ? <Pause size={13} /> : <Play size={13} />}
                    <span>{isAutoPlay ? 'Auto ON' : 'Auto Play'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleNextDialogue}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>{dialogueIdx === dialogues.length - 1 ? 'View Shinobi Recon Scroll' : 'Next Dialogue'}</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* ACT 3: SHINOBI RECON SCROLL (VILLAGE BLUEPRINT DIRECTIVE)     */}
        {/* ------------------------------------------------------------ */}
        {activeAct === 'recon_scroll' && (
          <div className="w-full max-w-4xl flex flex-col items-center animate-in zoom-in-95 duration-300">
            {/* The Ancient Scroll Presentation */}
            <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#1c1206] via-[#100a04] to-[#0a0502] border-4 border-amber-600/60 p-6 sm:p-8 shadow-[0_0_80px_rgba(217,119,6,0.35)] overflow-hidden">
              {/* Decorative Scroll Top & Bottom Rollers */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 shadow" />
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 shadow" />

              {/* Scroll Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-amber-500/20 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-mono font-black text-[10px] tracking-wider uppercase">
                      SECRET LEAF DISPATCH
                    </span>
                    <span className="text-amber-400 text-xs font-mono font-bold">
                      {missionRank}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-amber-200 mt-1">
                    {quest.title}
                  </h2>
                  <div className="text-xs font-mono text-amber-400/80">
                    {quest.japaneseKanji}
                  </div>
                </div>

                <div className="p-2 rounded-2xl bg-black/60 border border-amber-500/40 text-right">
                  <div className="text-[10px] font-mono uppercase text-slate-400">MISSION EXP</div>
                  <div className="text-base font-black text-amber-300">+{quest.rewards.heroXp} EXP</div>
                </div>
              </div>

              {/* High Stakes Situational Briefing */}
              <div className="mb-5 p-4 rounded-2xl bg-black/50 border border-amber-500/30">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                  <Target size={14} /> Mission Strategic Stakes
                </h4>
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-sans">
                  {quest.animeIntro?.cinematicStakes}
                </p>
              </div>

              {/* Required Village Construction & Preparation (Why Slow & Steady!) */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
                  <Shield size={14} /> Mandatory Village Construction &amp; Squad Training
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {quest.tasks.map((task, idx) => (
                    <div
                      key={task.id || idx}
                      className="p-3 rounded-xl bg-black/60 border border-amber-500/30 flex items-center gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-amber-500/40">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-white">{task.description}</div>
                        <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                          Requirement Target: {task.targetCount} &bull; Slow &amp; Steady Progress
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini-Boss Warning If Applicable */}
              {quest.miniBoss && (
                <div className="p-3.5 rounded-2xl bg-red-950/70 border border-red-500/50 flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-1.5 rounded-xl bg-black/60 border border-red-500/40">
                      {quest.miniBoss.avatar}
                    </span>
                    <div>
                      <div className="text-xs font-black text-red-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <Flame size={13} className="text-red-400" />
                        <span>HOSTILE ENCOUNTER: {quest.miniBoss.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        {quest.miniBoss.title} &bull; Base HP: {quest.miniBoss.hp.toLocaleString()} &bull; Skill: {quest.miniBoss.specialSkill}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-red-600/40 text-red-300 border border-red-500 text-[10px] font-mono font-black uppercase">
                    ALERT
                  </span>
                </div>
              )}

              {/* Bottom Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveAct('dialogue_faceoff');
                    freeAnimeAudio.playJutsuWhoosh();
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft size={15} />
                  <span>Review Dialogue</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveAct('climax_clash');
                    freeAnimeAudio.playSwordClash();
                    triggerImpact();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>Prepare Climax Clash</span>
                  <Swords size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* ACT 4: CLIMAX CLASH & COMMENCE MISSION                       */}
        {/* ------------------------------------------------------------ */}
        {activeAct === 'climax_clash' && (
          <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-400 max-w-3xl">
            {/* Clashing Crests */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-orange-950/80 border-2 border-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.8)] flex flex-col items-center justify-center animate-bounce">
                <span className="text-4xl">🍥</span>
                <span className="text-[10px] font-black text-orange-300 uppercase mt-1 font-mono">NARUTO</span>
              </div>

              <div className="p-3 rounded-full bg-red-600/30 border border-red-500 text-red-400 text-xl font-black font-mono animate-pulse">
                VS
              </div>

              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-cyan-950/80 border-2 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.8)] flex flex-col items-center justify-center animate-bounce">
                <span className="text-4xl">{quest.animeIntro?.speakerAvatar || '🥷'}</span>
                <span className="text-[10px] font-black text-cyan-300 uppercase mt-1 font-mono">
                  {quest.animeIntro?.speaker?.split(' ')[0] || 'OPPONENT'}
                </span>
              </div>
            </div>

            <div className="text-orange-400 font-mono text-xs uppercase tracking-widest font-black mb-1">
              THE WILL OF FIRE TEST COMMENCES NOW
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white font-serif tracking-wide mb-3">
              {quest.title}
            </h2>

            {/* Character Battle Quote */}
            <div className="p-4 rounded-2xl bg-black/80 border border-amber-500/50 max-w-xl backdrop-blur-md mb-6 shadow-xl">
              <p className="text-sm sm:text-base text-amber-200 font-serif italic">
                &ldquo;{quest.animeIntro?.dramaticQuote}&rdquo;
              </p>
              <div className="text-xs text-orange-400 font-mono font-bold mt-1.5 uppercase">
                &mdash; {quest.animeIntro?.speaker}
              </div>
            </div>

            {/* BIG ACTION BUTTON: ENTER VILLAGE & COMMENCE MISSION */}
            <button
              type="button"
              onClick={() => {
                freeAnimeAudio.playSwordClash();
                onEnterVillageMission();
              }}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-base uppercase tracking-wider shadow-[0_0_60px_rgba(249,115,22,0.9)] transition cursor-pointer flex items-center gap-3 transform hover:scale-105 active:scale-95 animate-pulse"
            >
              <Swords size={22} className="fill-slate-950" />
              <span>Enter Konoha &bull; Begin Story Quest</span>
            </button>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. BOTTOM CINEMA BAR: WILL OF FIRE CAMPAIGN FOOTER           */}
      {/* ============================================================ */}
      <div className="relative z-20 h-14 sm:h-16 bg-black/90 border-t border-white/10 flex items-center justify-between px-4 sm:px-8 text-xs font-mono backdrop-blur-md">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>CHAPTER 1: NARUTO &bull; WILL OF FIRE CAMPAIGN</span>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span className="hidden sm:inline">ACT: {activeAct.toUpperCase()}</span>
          <span>&bull;</span>
          <span className="text-amber-400/90 font-bold">100% FREE AUDIO ENGINE</span>
        </div>
      </div>
    </div>
  );
}
