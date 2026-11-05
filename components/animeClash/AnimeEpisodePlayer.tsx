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
  BookOpen,
  Zap,
  Eye
} from 'lucide-react';

interface AnimeEpisodePlayerProps {
  onStartBossFight: (episode: AnimeEpisode) => void;
  onClose: () => void;
  initialEpisodeIndex?: number;
}

export default function AnimeEpisodePlayer({
  onStartBossFight,
  onClose,
  initialEpisodeIndex = 0
}: AnimeEpisodePlayerProps) {
  const [selectedEpIndex, setSelectedEpIndex] = useState(initialEpisodeIndex);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<'video' | 'reader'>('video');
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Eye opening animation state: 0 = closed, 0.35 = squint/flutter, 1.0 = wide open
  const [eyeOpenProgress, setEyeOpenProgress] = useState(0);
  const [eyeBlur, setEyeBlur] = useState(16);

  const episode = ANIME_EPISODES[selectedEpIndex] || ANIME_EPISODES[0];
  const isPrologue = episode.episodeNumber === 0;

  const hero = HEROES_CATALOG[episode.heroId] || HEROES_CATALOG.naruto;
  const villain = ANIME_VILLAINS[episode.villainId] || ANIME_VILLAINS.madara;
  const powerup = episode.powerup;

  const currentScene = episode.scenes[currentSceneIdx] || episode.scenes[0];
  const isFinalScene = currentSceneIdx === episode.scenes.length - 1;

  // Web Audio API Synthesizer for Anime Cinematic BGM, Heartbeats & Sound FX
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmOscNodesRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);

  // 60FPS Canvas Vortex Ref
  const vortexCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Eye Awakening Choreography
  useEffect(() => {
    if (currentScene.visualFocus === 'naruto_eyes') {
      setEyeOpenProgress(0);
      setEyeBlur(20);

      const t1 = setTimeout(() => {
        setEyeOpenProgress(0.35);
        setEyeBlur(12);
        playHeartbeatSound();
      }, 700);

      const t2 = setTimeout(() => {
        setEyeOpenProgress(0.15);
        setEyeBlur(15);
      }, 1600);

      const t3 = setTimeout(() => {
        setEyeOpenProgress(1.0);
        setEyeBlur(0);
        playHeartbeatSound();
      }, 2400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setEyeOpenProgress(1.0);
      setEyeBlur(0);
    }
  }, [currentSceneIdx, currentScene.visualFocus]);

  // 60FPS Space-Time Void Vortex Canvas Simulation
  useEffect(() => {
    if (currentScene.visualFocus !== 'collision_void') return;
    const canvas = vortexCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { angle: number; dist: number; speed: number; radius: number; color: string }[] = [];
    const colors = ['#a855f7', '#ec4899', '#06b6d4', '#f59e0b', '#ffffff'];

    for (let i = 0; i < 140; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: 50 + Math.random() * 320,
        speed: 0.02 + Math.random() * 0.04,
        radius: 1 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Swirling gravitational distortion rings
      for (let r = 40; r < 300; r += 50) {
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.15 - r * 0.0003})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Particles sucked inward
      particles.forEach((p) => {
        p.angle += p.speed;
        p.dist -= 1.2;
        if (p.dist <= 15) {
          p.dist = 300 + Math.random() * 80;
        }

        const px = cx + Math.cos(p.angle) * p.dist;
        const py = cy + Math.sin(p.angle) * p.dist * 0.6; // Perspective squish

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Event horizon core
      const coreGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 35);
      coreGrad.addColorStop(0, '#000000');
      coreGrad.addColorStop(0.7, '#1e0538');
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 35, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [currentSceneIdx, currentScene.visualFocus]);

  const startBgmAudio = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      stopBgmAudio();

      const ctx = audioCtxRef.current;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.12, ctx.currentTime);
      master.connect(ctx.destination);

      const baseFreq = isPrologue ? 98 : episode.heroId === 'naruto' ? 110 : episode.heroId === 'luffy' ? 130 : episode.heroId === 'ichigo' ? 98 : 123;
      const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2];

      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime);

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
      // Audio handled
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

  const playHeartbeatSound = () => {
    if (isAudioMuted || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(75, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.23);
    } catch {
      // Handled
    }
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
      // Handled
    }
  };

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
      if (!isPrologue) {
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
      return;
    }

    const timer = setTimeout(() => {
      setCurrentSceneIdx((prev) => prev + 1);
      playImpactSound();
    }, 6000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentSceneIdx, viewMode, isFinalScene, episode, isPrologue, onStartBossFight]);

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

  const getSpeakerImage = () => {
    if (currentScene.visualFocus === 'naruto' || currentScene.visualFocus === 'naruto_eyes') return HEROES_CATALOG.naruto.image;
    if (currentScene.visualFocus === 'luffy') return HEROES_CATALOG.luffy.image;
    if (currentScene.visualFocus === 'ichigo') return HEROES_CATALOG.ichigo.image;
    if (currentScene.visualFocus === 'asta') return HEROES_CATALOG.asta.image;
    if (currentScene.visualFocus === 'villains_domination' || currentScene.isVillain) return villain.image;
    if (currentScene.visualFocus === 'heroes_assemble' || currentScene.visualFocus === 'all_heroes') return '/anime-heroes/heroes_assemble_tokyo_tower.jpg';
    return hero.image;
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

        {/* Episode Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {ANIME_EPISODES.map((ep, idx) => {
            const isSelected = selectedEpIndex === idx;
            const isEp0 = ep.episodeNumber === 0;
            return (
              <button
                key={ep.id}
                type="button"
                onClick={() => handleSelectEpisode(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? isEp0
                      ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-lg ring-2 ring-pink-500/50'
                      : 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-lg ring-2 ring-red-500/40'
                    : 'bg-[#0e172f] text-slate-400 hover:text-white border border-[#1e2a4a]'
                }`}
              >
                {isEp0 ? (
                  <>
                    <span className="text-amber-300 font-black">🎬 ORIGIN MOVIE</span>
                    <span className="text-[10px] text-pink-200">(Prologue)</span>
                  </>
                ) : (
                  <>
                    <span>EP {ep.episodeNumber}:</span>
                    <span className="capitalize">{ep.heroId}</span>
                    <span className="text-slate-500">vs</span>
                    <span className="capitalize">{ep.villainId}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ANIME VIDEO PLAYER MODE */}
      {viewMode === 'video' ? (
        <div className="flex flex-col gap-3">
          {/* CinemaScope 16:9 Anime Screen */}
          <div className="relative w-full aspect-video max-h-[530px] rounded-3xl overflow-hidden border-2 border-[#1e3a6a] shadow-[0_0_45px_rgba(30,58,106,0.6)] bg-black flex flex-col justify-between">
            {/* Top Letterbox Cinema Bar */}
            <div className="z-30 w-full h-11 bg-gradient-to-b from-black via-black/85 to-transparent flex items-center justify-between px-5 text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[11px] font-mono tracking-widest text-slate-300 font-bold uppercase">
                  {isPrologue ? 'ORIGIN MOVIE' : `EPISODE ${episode.episodeNumber}`} • {episode.japaneseTitle}
                </span>
              </div>
              <div className="flex items-center gap-2">
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
              {/* SCENE 1: DIMENSIONAL VOID COLLISION & GRAVITATIONAL SUCTION */}
              {currentScene.visualFocus === 'collision_void' ? (
                <div className="relative w-full h-full overflow-hidden animate-in fade-in zoom-in-105 duration-1000">
                  <img
                    src="/anime-heroes/dimensional_void_collision.jpg"
                    alt="Dimensional Void Collision"
                    className="w-full h-full object-cover object-center transform scale-105 animate-pulse"
                  />
                  {/* 60FPS Space-Time Accretion Vortex Canvas Overlay */}
                  <canvas
                    ref={vortexCanvasRef}
                    width={800}
                    height={450}
                    className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />
                  <div className="absolute top-14 left-6 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/60 text-purple-200 text-xs font-black tracking-widest flex items-center gap-2 shadow-lg">
                    <Zap size={14} className="text-yellow-400 animate-bounce" />
                    <span>COSMIC SPACE-TIME COLLAPSE • HEROES SUCKED IN</span>
                  </div>
                </div>
              ) : currentScene.visualFocus === 'naruto_eyes' ? (
                /* SCENE 2: AWAKENING IN SHIBUYA RAIN - FIRST-PERSON EYE OPENING */
                <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                  {/* High-res keyframe of Naruto awakening in the rain */}
                  <img
                    src="/anime-heroes/naruto_awakening_rain.jpg"
                    alt="Naruto Awakening in Rain"
                    className="w-full h-full object-cover object-center transition-all duration-700"
                    style={{ filter: `blur(${eyeBlur}px)` }}
                  />

                  {/* Dynamic Eyelid Shutter Mask Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-all duration-700 bg-black"
                    style={{
                      opacity: Math.max(0, 1 - eyeOpenProgress),
                      clipPath:
                        eyeOpenProgress >= 0.99
                          ? 'none'
                          : `ellipse(100% ${eyeOpenProgress * 65}% at 50% 50%)`,
                      display: eyeOpenProgress >= 0.99 ? 'none' : 'block'
                    }}
                  />

                  {/* Atmospheric neon rain streaks overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(110deg, transparent, transparent 25px, rgba(56, 189, 248, 0.25) 25px, rgba(56, 189, 248, 0.25) 26px)'
                    }}
                  />

                  <div className="absolute top-14 left-6 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-200 text-xs font-black tracking-widest flex items-center gap-2 shadow-lg">
                    <Eye size={14} className="text-cyan-400 animate-ping" />
                    <span>AWAKENING IN SHIBUYA CROSSING • RAIN NEON FOCUS</span>
                  </div>
                </div>
              ) : currentScene.visualFocus === 'villains_domination' ? (
                /* SCENE 3: EVIL SYNDICATE SKYLINE DOMINATION */
                <div className="relative w-full h-full overflow-hidden animate-in fade-in zoom-in-105 duration-1000">
                  <img
                    src="/anime-heroes/villains_syndicate_tokyo.jpg"
                    alt="Evil Syndicate Tokyo Domination"
                    className="w-full h-full object-cover object-center transform scale-100 hover:scale-105 transition-all duration-1000"
                  />
                  {/* Dark malevolent red aura gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-red-950/20 to-black/60 pointer-events-none" />
                  <div className="absolute top-14 left-6 px-3.5 py-1.5 rounded-full bg-red-950/90 border border-red-500/70 text-red-200 text-xs font-black tracking-widest flex items-center gap-2 shadow-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span>EVIL SYNDICATE • TOKYO METROPOLITAN STRANGLEHOLD</span>
                  </div>
                </div>
              ) : currentScene.visualFocus === 'heroes_assemble' ? (
                /* SCENE 4: HEROES ASSEMBLE UNDER TOKYO TOWER */
                <div className="relative w-full h-full overflow-hidden animate-in fade-in zoom-in-105 duration-1000">
                  <img
                    src="/anime-heroes/heroes_assemble_tokyo_tower.jpg"
                    alt="Heroes Assemble Under Tokyo Tower"
                    className="w-full h-full object-cover object-center transform scale-100 hover:scale-105 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />
                  <div className="absolute top-14 left-6 px-3.5 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-500/70 text-cyan-200 text-xs font-black tracking-widest flex items-center gap-2 shadow-lg">
                    <Sparkles size={14} className="text-amber-400 animate-spin" />
                    <span>✦ TETRA ALLIANCE FORMED • TOKYO TOWER SANCTUARY ✦</span>
                  </div>
                </div>
              ) : currentScene.visualFocus === 'luffy' ? (
                /* LUFFY AT YOKOHAMA CONTAINER DOCKS */
                <div className="relative flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
                  <div className="relative">
                    <div className="absolute -inset-8 rounded-full bg-red-600/40 blur-2xl animate-pulse" />
                    <img
                      src={HEROES_CATALOG.luffy.image}
                      alt="Monkey D. Luffy"
                      className="relative w-64 h-80 sm:w-80 sm:h-96 object-cover object-top rounded-3xl border-4 border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.5)]"
                    />
                  </div>
                  <div className="mt-3 px-4 py-1 rounded-full bg-black/80 border border-red-500/50 text-red-300 text-xs font-extrabold tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>MONKEY D. LUFFY • YOKOHAMA DOCKS (CONQUEROR'S HAKI)</span>
                  </div>
                </div>
              ) : currentScene.visualFocus === 'ichigo' ? (
                /* ICHIGO IN SHINJUKU FIBER-GRID */
                <div className="relative flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
                  <div className="relative">
                    <div className="absolute -inset-8 rounded-full bg-indigo-600/40 blur-2xl animate-pulse" />
                    <img
                      src={HEROES_CATALOG.ichigo.image}
                      alt="Ichigo Kurosaki"
                      className="relative w-64 h-80 sm:w-80 sm:h-96 object-cover object-top rounded-3xl border-4 border-indigo-500 shadow-[0_0_35px_rgba(99,102,241,0.5)]"
                    />
                  </div>
                  <div className="mt-3 px-4 py-1 rounded-full bg-black/80 border border-indigo-500/50 text-indigo-300 text-xs font-extrabold tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                    <span>ICHIGO KUROSAKI • SHINJUKU FIBER-GRID (REISHI DENSITY)</span>
                  </div>
                </div>
              ) : currentScene.visualFocus === 'asta' ? (
                /* ASTA IN TOKYO METROPOLITAN PERIMETER */
                <div className="relative flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
                  <div className="relative">
                    <div className="absolute -inset-8 rounded-full bg-emerald-600/40 blur-2xl animate-pulse" />
                    <img
                      src={HEROES_CATALOG.asta.image}
                      alt="Asta"
                      className="relative w-64 h-80 sm:w-80 sm:h-96 object-cover object-top rounded-3xl border-4 border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.5)]"
                    />
                  </div>
                  <div className="mt-3 px-4 py-1 rounded-full bg-black/80 border border-emerald-500/50 text-emerald-300 text-xs font-extrabold tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>ASTA • TOKYO OUTSKIRTS (ANTI-MAGIC SINGULARITY)</span>
                  </div>
                </div>
              ) : currentScene.isVillain ? (
                /* Villain Solo */
                <div className="relative flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
                  <div className="relative">
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
                /* Hero Solo */
                <div className="relative flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
                  <div className="relative">
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
            <div className="z-30 w-full p-4 sm:p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col gap-2">
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
                  ACT {currentSceneIdx + 1} OF {episode.scenes.length}
                </span>
              </div>

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

                {/* Action button */}
                {isPrologue ? (
                  <button
                    type="button"
                    onClick={() => handleSelectEpisode(1)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:brightness-110 text-white font-black text-xs flex items-center gap-1.5 shadow-[0_0_18px_rgba(236,72,153,0.7)] transition cursor-pointer"
                  >
                    <Sword size={14} />
                    <span>START EPISODE 1 BATTLE</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onStartBossFight(episode)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:brightness-110 text-white font-black text-xs flex items-center gap-1.5 shadow-[0_0_18px_rgba(239,68,68,0.7)] transition cursor-pointer animate-pulse"
                  >
                    <Sword size={14} />
                    <span>{countdown !== null ? `FIGHT IN ${countdown}s` : 'START BOSS FIGHT'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Episode Info Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-3xl bg-[#0b1226]/90 border border-amber-500/30 flex items-center gap-3">
              <img
                src={getSpeakerImage()}
                alt="Active Character"
                className="w-16 h-20 rounded-2xl object-cover object-top border-2 border-amber-400 shadow-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                  <Flame size={13} />
                  <span>{isPrologue ? 'TETRA ALLIANCE FORMATION' : `AWAKENING: ${powerup.formName}`}</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                  {powerup.buildupStory}
                </div>
                <div className="text-[10px] text-amber-300 font-mono mt-1">
                  Ultimate: {powerup.unlockedAttack}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-[#0b1226]/90 border border-purple-500/30 flex items-center gap-3">
              <img
                src={isPrologue ? '/anime-heroes/villains_syndicate_tokyo.jpg' : villain.image}
                alt="Target Boss"
                className="w-16 h-20 rounded-2xl object-cover object-top border-2 border-purple-500 shadow-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-purple-400 text-xs font-bold">
                  <span>{isPrologue ? 'TARGET THREAT: EVIL SYNDICATE' : `TARGET BOSS: ${villain.name}`}</span>
                  <span className="text-[10px] text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-800">
                    {villain.hp} HP
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                  {villain.modernRole}
                </div>
                <div className="text-[10px] text-purple-300 font-mono mt-1">
                  Signature: {villain.signatureMove}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 3. STORY READER (VISUAL NOVEL) MODE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="p-4 rounded-3xl bg-[#0b1226]/90 border border-[#1e2a4a] shadow-xl">
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                {isPrologue ? 'ORIGIN PROLOGUE FILM' : `CANONICAL ANIME ARC • EPISODE ${episode.episodeNumber}`}
              </span>
              <h2 className="text-lg font-black text-white mt-0.5">{episode.title}</h2>
              <div className="text-xs text-amber-400 font-mono italic">{episode.japaneseTitle}</div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{episode.synopsis}</p>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-b from-[#0e1730] to-[#080d1e] border-2 border-[#1e3a6a] shadow-2xl flex flex-col justify-between min-h-[240px]">
              <div className="flex items-center gap-3">
                <img
                  src={getSpeakerImage()}
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

              <p className="text-xs sm:text-sm text-slate-100 italic my-4 leading-relaxed font-serif pl-1">
                &ldquo;{currentScene.text}&rdquo;
              </p>

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
                    {currentSceneIdx < episode.scenes.length - 1
                      ? 'Continue Story'
                      : isPrologue
                      ? 'Proceed to Episode 1'
                      : 'Engage Boss Fight!'}
                  </span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1c130d] via-[#121c2e] to-[#080d1e] border border-amber-500/40 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <Flame size={16} className="text-amber-400" />
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  {isPrologue ? 'SANCTUARY VILLAGE FORMATION' : 'HERO POWERUP AWAKENING'}
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
                  <strong>Origin Trigger:</strong> {powerup.awakeningTrigger}
                </div>
                <div>
                  <strong>Ultimate Move:</strong> {powerup.unlockedAttack}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-[#0b1226]/90 border border-red-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-red-400 tracking-wider uppercase">
                  {isPrologue ? 'SYNDICATE INVASION CRISIS' : 'TARGET BOSS INVASION'}
                </span>
                <span className="text-xs text-red-300 font-bold">{villain.hp} HP</span>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <img
                  src={isPrologue ? '/anime-heroes/villains_syndicate_tokyo.jpg' : villain.image}
                  alt={villain.name}
                  className="w-14 h-14 rounded-2xl object-cover object-top border-2 border-red-500 shadow-md"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">{villain.name}</h4>
                  <div className="text-[10px] text-slate-400">{villain.title}</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug">{villain.modernRole}</p>

              <button
                type="button"
                onClick={() => (isPrologue ? handleSelectEpisode(1) : onStartBossFight(episode))}
                className="mt-3 w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition cursor-pointer"
              >
                <Sword size={15} />
                <span>{isPrologue ? 'START EPISODE 1 BATTLE' : 'START ANIME BOSS FIGHT NOW!'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
