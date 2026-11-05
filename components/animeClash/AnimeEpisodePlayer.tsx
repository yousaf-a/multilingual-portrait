'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimeEpisode, ANIME_EPISODES, ANIME_VILLAINS } from '@/lib/animeClash/animeStoryData';
import { HEROES_CATALOG } from '@/lib/animeClash/gameData';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Sword,
  Sparkles,
  ChevronRight,
  Flame,
  ArrowLeft,
  Tv,
  BookOpen
} from 'lucide-react';

interface AnimeEpisodePlayerProps {
  onStartBossFight: (episode: AnimeEpisode) => void;
  onClose: () => void;
}

export default function AnimeEpisodePlayer({
  onStartBossFight,
  onClose
}: AnimeEpisodePlayerProps) {
  const [selectedEpIndex, setSelectedEpIndex] = useState(0);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<'video' | 'reader'>('video');
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  const episode = ANIME_EPISODES[selectedEpIndex] || ANIME_EPISODES[0];
  const hero = HEROES_CATALOG[episode.heroId] || HEROES_CATALOG.naruto;
  const villain = ANIME_VILLAINS[episode.villainId] || ANIME_VILLAINS.madara;
  const powerup = episode.powerup;

  const currentScene = episode.scenes[currentSceneIdx] || episode.scenes[0];
  const isFinalScene = currentSceneIdx === episode.scenes.length - 1;

  // Web Audio API Synthesizer for Anime Cinematic BGM & Sound FX
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmOscNodesRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);

  const startBgmAudio = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      // Stop previous
      stopBgmAudio();

      const ctx = audioCtxRef.current;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.12, ctx.currentTime);
      master.connect(ctx.destination);

      // Deep dramatic anime pad drone (Root + Fifth)
      const baseFreq = episode.heroId === 'naruto' ? 110 : episode.heroId === 'luffy' ? 130 : episode.heroId === 'ichigo' ? 98 : 123;
      const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2];

      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime);

        // Lowpass filter for warm cinematic feel
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450 + i * 150, ctx.currentTime);

        gain.gain.setValueAtTime(0.08 / (i + 1), ctx.currentTime);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        osc.start();

        bgmOscNodesRef.current.push({ osc, gain });
      });
    } catch {
      // Audio autoplay gracefully handled if restricted
    }
  };

  const stopBgmAudio = () => {
    bgmOscNodesRef.current.forEach(({ osc }) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignored
      }
    });
    bgmOscNodesRef.current = [];
  };

  const playImpactSound = () => {
    if (isAudioMuted || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // Ignored
    }
  };

  // Toggle Audio
  const toggleAudio = () => {
    if (isAudioMuted) {
      setIsAudioMuted(false);
      startBgmAudio();
    } else {
      setIsAudioMuted(true);
      stopBgmAudio();
    }
  };

  useEffect(() => {
    return () => {
      stopBgmAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Auto-play timer for Anime Video Mode
  useEffect(() => {
    if (!isPlaying || viewMode !== 'video') return;

    if (isFinalScene) {
      // Climax reached: Start 5-second countdown to Boss Fight
      setCountdown(5);
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            onStartBossFight(episode);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }

    // Advance scene every 5 seconds
    const timer = setTimeout(() => {
      setCurrentSceneIdx((prev) => prev + 1);
      playImpactSound();
    }, 5200);

    return () => clearTimeout(timer);
  }, [isPlaying, currentSceneIdx, viewMode, isFinalScene, episode, onStartBossFight]);

  // Handle Switch Episode
  const handleSelectEpisode = (idx: number) => {
    setSelectedEpIndex(idx);
    setCurrentSceneIdx(0);
    setCountdown(null);
    setIsPlaying(true);
    if (!isAudioMuted) {
      startBgmAudio();
    }
  };

  const handleNextScene = () => {
    if (currentSceneIdx < episode.scenes.length - 1) {
      setCurrentSceneIdx((prev) => prev + 1);
      playImpactSound();
    } else {
      onStartBossFight(episode);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIdx > 0) {
      setCurrentSceneIdx((prev) => prev - 1);
      setCountdown(null);
    }
  };

  const handleReplayVideo = () => {
    setCurrentSceneIdx(0);
    setCountdown(null);
    setIsPlaying(true);
    if (!isAudioMuted) {
      startBgmAudio();
    }
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-4 my-3 animate-in fade-in">
      {/* 1. TOP NAV & CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-3xl bg-[#0b1226]/95 border border-[#1e2a4a] shadow-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-2 rounded-xl bg-[#1e293b] hover:bg-[#2d3748] transition cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Village</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center bg-[#070b16] p-1 rounded-2xl border border-[#1e2a4a]">
            <button
              type="button"
              onClick={() => setViewMode('video')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === 'video'
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv size={14} />
              <span>Anime Video</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('reader')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === 'reader'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen size={14} />
              <span>Story Reader</span>
            </button>
          </div>
        </div>

        {/* 4 Episode Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {ANIME_EPISODES.map((ep, idx) => {
            const isSelected = selectedEpIndex === idx;
            return (
              <button
                key={ep.id}
                type="button"
                onClick={() => handleSelectEpisode(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-lg ring-2 ring-red-500/40'
                    : 'bg-[#0e172f] text-slate-400 hover:text-white border border-[#1e2a4a]'
                }`}
              >
                <span>EP {ep.episodeNumber}:</span>
                <span className="capitalize">{ep.heroId}</span>
                <span className="text-slate-500">vs</span>
                <span className="capitalize">{ep.villainId}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ANIME VIDEO PLAYER MODE */}
      {viewMode === 'video' ? (
        <div className="flex flex-col gap-3">
          {/* CinemaScope 16:9 Anime Screen */}
          <div className="relative w-full aspect-video max-h-[520px] rounded-3xl overflow-hidden border-2 border-[#1e3a6a] shadow-[0_0_40px_rgba(30,58,106,0.5)] bg-black flex flex-col justify-between">
            {/* Top Letterbox Cinema Bar */}
            <div className="z-20 w-full h-10 bg-gradient-to-b from-black via-black/80 to-transparent flex items-center justify-between px-5 text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[11px] font-mono tracking-widest text-slate-300 font-bold uppercase">
                  EPISODE {episode.episodeNumber} • {episode.japaneseTitle}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Audio Synth Toggle */}
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="px-2.5 py-1 rounded-xl bg-black/60 hover:bg-black/90 text-[11px] text-slate-300 flex items-center gap-1.5 border border-white/10 transition cursor-pointer"
                >
                  {isAudioMuted ? <VolumeX size={13} /> : <Volume2 size={13} className="text-cyan-400 animate-pulse" />}
                  <span>{isAudioMuted ? 'Anime BGM: Off' : 'Anime BGM: On'}</span>
                </button>
              </div>
            </div>

            {/* DYNAMIC SCENE VISUAL CHOREOGRAPHY */}
            <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
              {/* Background Glow */}
              <div
                className="absolute inset-0 transition-all duration-1000"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${currentScene.bgVibe} 0%, #03050a 100%)`,
                  opacity: 0.95
                }}
              />

              {/* Anime Speed Lines Effect */}
              <div
                className="absolute inset-0 pointer-events-none opacity-25 mix-blend-screen"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.06) 40px, rgba(255,255,255,0.06) 42px)'
                }}
              />

              {/* Scene Character Staging */}
              {currentScene.narration ? (
                /* Dual Confrontation Silhouette Standoff */
                <div className="relative w-full h-full flex items-center justify-around px-8 animate-in fade-in duration-700">
                  <div className="flex flex-col items-center transform -translate-x-4 scale-95 opacity-80">
                    <img
                      src={hero.image}
                      alt={hero.name}
                      className="w-48 h-64 sm:w-60 sm:h-80 object-cover object-top rounded-3xl border-2 border-cyan-400/50 shadow-2xl"
                    />
                    <span className="text-xs font-bold text-cyan-300 mt-2">{hero.name}</span>
                  </div>

                  {/* Lightning Rift Clash in Center */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-red-600/30 flex items-center justify-center border-2 border-red-500 animate-pulse">
                      <Sword size={28} className="text-amber-300 animate-bounce" />
                    </div>
                    <span className="text-xs font-black text-amber-400 mt-2 tracking-widest">
                      DIMENSIONAL RIFT
                    </span>
                  </div>

                  <div className="flex flex-col items-center transform translate-x-4 scale-95 opacity-80">
                    <img
                      src={villain.image}
                      alt={villain.name}
                      className="w-48 h-64 sm:w-60 sm:h-80 object-cover object-top rounded-3xl border-2 border-red-500/50 shadow-2xl"
                    />
                    <span className="text-xs font-bold text-red-400 mt-2">{villain.name}</span>
                  </div>
                </div>
              ) : currentScene.isVillain ? (
                /* Villain Solo Cinematic Camera Zoom */
                <div className="relative flex flex-col items-center justify-center animate-in zoom-in-95 fade-in duration-700">
                  <div className="relative">
                    {/* Dark Ominous Aura */}
                    <div
                      className="absolute -inset-6 rounded-full blur-2xl opacity-75 animate-pulse"
                      style={{ backgroundColor: villain.color }}
                    />
                    <img
                      src={villain.image}
                      alt={villain.name}
                      className="relative w-64 h-80 sm:w-80 sm:h-96 object-cover object-top rounded-3xl border-4 shadow-2xl"
                      style={{ borderColor: villain.color }}
                    />
                  </div>
                  <div className="mt-3 px-4 py-1 rounded-full bg-black/80 border border-red-500/50 text-red-400 text-xs font-extrabold tracking-wider">
                    ⚠️ {villain.title.toUpperCase()}
                  </div>
                </div>
              ) : (
                /* Hero Solo Cinematic Camera Zoom */
                <div className="relative flex flex-col items-center justify-center animate-in zoom-in-95 fade-in duration-700">
                  <div className="relative">
                    {/* Radiant Powerup Aura */}
                    <div
                      className="absolute -inset-6 rounded-full blur-2xl opacity-80 animate-pulse"
                      style={{ backgroundColor: powerup.auraColor }}
                    />
                    <img
                      src={hero.image}
                      alt={hero.name}
                      className="relative w-64 h-80 sm:w-80 sm:h-96 object-cover object-top rounded-3xl border-4 shadow-2xl"
                      style={{ borderColor: powerup.auraColor }}
                    />
                  </div>
                  <div className="mt-3 px-4 py-1 rounded-full bg-black/80 border border-amber-400/50 text-amber-300 text-xs font-extrabold tracking-wider flex items-center gap-1.5">
                    <Sparkles size={12} className="text-yellow-400" />
                    <span>{powerup.formName.toUpperCase()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Anime Subtitle Box (Netflix / Crunchyroll Broadcast Style) */}
            <div className="z-20 w-full p-4 sm:p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col gap-2">
              {/* Speaker Tag Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wider ${
                    currentScene.isVillain
                      ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                      : currentScene.narration
                      ? 'bg-slate-700 text-cyan-300'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                  }`}
                >
                  {currentScene.speaker}
                </span>

                <span className="text-[10px] text-slate-400 font-mono">
                  SCENE {currentSceneIdx + 1} OF {episode.scenes.length}
                </span>
              </div>

              {/* Dialogue Subtitle */}
              <p className="text-sm sm:text-base font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-relaxed italic bg-black/40 p-2.5 rounded-xl border border-white/5">
                &ldquo;{currentScene.text}&rdquo;
              </p>

              {/* Video Timeline & Scene Controls Bar */}
              <div className="flex items-center justify-between gap-3 mt-1 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  >
                    {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrevScene}
                    disabled={currentSceneIdx === 0}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition cursor-pointer"
                  >
                    <SkipBack size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextScene}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  >
                    <SkipForward size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={handleReplayVideo}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Replay Video"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center gap-1.5 flex-1 max-w-xs mx-3">
                  {episode.scenes.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentSceneIdx(i)}
                      className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                        i === currentSceneIdx
                          ? 'bg-amber-400 ring-2 ring-amber-400/50 scale-y-125'
                          : i < currentSceneIdx
                          ? 'bg-cyan-500'
                          : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Boss Battle Direct Launch Button */}
                <button
                  type="button"
                  onClick={() => onStartBossFight(episode)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:brightness-110 text-white font-black text-xs flex items-center gap-1.5 shadow-[0_0_18px_rgba(239,68,68,0.7)] transition cursor-pointer animate-pulse"
                >
                  <Sword size={14} />
                  <span>{countdown !== null ? `FIGHT IN ${countdown}s` : 'START BOSS FIGHT'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Episode Info & Powerup Highlights Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Hero Awakening Preview */}
            <div className="p-4 rounded-3xl bg-[#0b1226]/90 border border-amber-500/30 flex items-center gap-3">
              <img
                src={hero.image}
                alt={hero.name}
                className="w-16 h-20 rounded-2xl object-cover object-top border-2 border-amber-400 shadow-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                  <Flame size={13} />
                  <span>AWAKENING: {powerup.formName}</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                  {powerup.buildupStory}
                </div>
                <div className="text-[10px] text-amber-300 font-mono mt-1">
                  Ultimate: {powerup.unlockedAttack}
                </div>
              </div>
            </div>

            {/* Target Boss Preview */}
            <div className="p-4 rounded-3xl bg-[#0b1226]/90 border border-red-500/30 flex items-center gap-3">
              <img
                src={villain.image}
                alt={villain.name}
                className="w-16 h-20 rounded-2xl object-cover object-top border-2 border-red-500 shadow-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-red-400 text-xs font-bold">
                  <span>TARGET BOSS: {villain.name}</span>
                  <span className="text-[10px] text-red-300 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-800">
                    {villain.hp} HP
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                  {villain.modernRole}
                </div>
                <div className="text-[10px] text-red-300 font-mono mt-1">
                  Signature: {villain.signatureMove}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 3. STORY READER (VISUAL NOVEL) MODE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Visual Scene & Dialogue (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {/* Episode Header */}
            <div className="p-4 rounded-3xl bg-[#0b1226]/90 border border-[#1e2a4a] shadow-xl">
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                CANONICAL ANIME ARC • EPISODE {episode.episodeNumber}
              </span>
              <h2 className="text-lg font-black text-white mt-0.5">{episode.title}</h2>
              <div className="text-xs text-amber-400 font-mono italic">{episode.japaneseTitle}</div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{episode.synopsis}</p>
            </div>

            {/* Interactive Dialogue Stage */}
            <div className="p-5 rounded-3xl bg-gradient-to-b from-[#0e1730] to-[#080d1e] border-2 border-[#1e3a6a] shadow-2xl flex flex-col justify-between min-h-[240px]">
              {/* Speaker Header with Real Character Artwork */}
              <div className="flex items-center gap-3">
                <img
                  src={currentScene.isVillain ? villain.image : hero.image}
                  alt={currentScene.speaker}
                  className={`w-14 h-14 rounded-2xl object-cover object-top border-2 shadow-lg ${
                    currentScene.isVillain ? 'border-red-500' : 'border-amber-400'
                  }`}
                />
                <div>
                  <span className="text-sm font-bold text-white block">
                    {currentScene.speaker}
                    {currentScene.isVillain && (
                      <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        BOSS VILLAIN
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {currentScene.narration ? 'Atmospheric Prologue' : 'Dimensional Dialogue'}
                  </span>
                </div>
              </div>

              {/* Line Text */}
              <p className="text-xs sm:text-sm text-slate-100 italic my-4 leading-relaxed font-serif pl-1">
                &ldquo;{currentScene.text}&rdquo;
              </p>

              {/* Stage Progress & Next */}
              <div className="flex items-center justify-between pt-3 border-t border-[#182442]">
                <span className="text-[11px] text-slate-500 font-mono">
                  Dialogue {currentSceneIdx + 1} of {episode.scenes.length}
                </span>

                <button
                  type="button"
                  onClick={handleNextScene}
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>
                    {currentSceneIdx < episode.scenes.length - 1 ? 'Continue Story' : 'Engage Boss Fight!'}
                  </span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Powerup & Villain Boss Profile (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* Legendary Powerup Awakening Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1c130d] via-[#121c2e] to-[#080d1e] border border-amber-500/40 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <Flame size={16} className="text-amber-400" />
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  HERO POWERUP AWAKENING
                </span>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <img
                  src={hero.image}
                  alt={hero.name}
                  className="w-14 h-14 rounded-2xl object-cover object-top border-2 border-amber-400 shadow-md"
                />
                <div>
                  <h3 className="text-sm font-extrabold text-white">{powerup.formName}</h3>
                  <div className="text-[10px] text-amber-400 font-mono">{powerup.japaneseName}</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 my-2 leading-relaxed">{powerup.buildupStory}</p>

              <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20 text-[10px] text-amber-200 space-y-1">
                <div>
                  <strong>Awakening Trigger:</strong> {powerup.awakeningTrigger}
                </div>
                <div>
                  <strong>Ultimate Move:</strong> {powerup.unlockedAttack}
                </div>
              </div>
            </div>

            {/* Villain Boss Threat Card */}
            <div className="p-4 rounded-3xl bg-[#0b1226]/90 border border-red-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-red-400 tracking-wider uppercase">
                  TARGET BOSS INVASION
                </span>
                <span className="text-xs text-red-300 font-bold">{villain.hp} HP</span>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <img
                  src={villain.image}
                  alt={villain.name}
                  className="w-14 h-14 rounded-2xl object-cover object-top border-2 border-red-500 shadow-md"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">{villain.name}</h4>
                  <div className="text-[10px] text-slate-400">{villain.title}</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug">{villain.modernRole}</p>

              {/* Launch Boss Fight Button */}
              <button
                type="button"
                onClick={() => onStartBossFight(episode)}
                className="mt-3 w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition cursor-pointer"
              >
                <Sword size={15} />
                <span>START ANIME BOSS FIGHT NOW!</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
