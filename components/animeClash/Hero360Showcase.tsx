'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HeroData, PlayerVillageState } from '@/lib/animeClash/types';
import { HEROES_CATALOG, HERO_UNLOCK_HQ_REQUIREMENTS, ANIME_VOICE_SHOUTS } from '@/lib/animeClash/gameData';
import { animeAudio } from '@/lib/animeClash/animeAudio';
import {
  RotateCcw,
  Volume2,
  Sparkles,
  Zap,
  Shield,
  Award,
  Compass,
  X,
  Play,
  Pause,
  Swords,
  Flame,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export type PoseType = 'combat' | 'ultimate' | 'victory' | 'meditate';

interface Hero360ShowcaseProps {
  initialHeroId?: string;
  villageState: PlayerVillageState;
  onUpdateVillage: (state: PlayerVillageState) => void;
  onClose: () => void;
}

export default function Hero360Showcase({
  initialHeroId = 'naruto',
  villageState,
  onUpdateVillage,
  onClose
}: Hero360ShowcaseProps) {
  const [selectedHeroId, setSelectedHeroId] = useState<string>(initialHeroId);
  const [currentPose, setCurrentPose] = useState<PoseType>('combat');
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(true);
  const [spinSpeed, setSpinSpeed] = useState<number>(1.0);
  const [zoomLevel, setZoomLevel] = useState<number>(1.05);
  const [activeParticles, setActiveParticles] = useState<'all' | 'aura' | 'petals' | 'none'>('all');
  const [voiceBanner, setVoiceBanner] = useState<{ kanji: string; shout: string; subtitle: string } | null>(null);

  // Drag interaction state
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startAngleRef = useRef<number>(0);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const hero = HEROES_CATALOG[selectedHeroId] || HEROES_CATALOG.naruto;
  const reqHqLevel = HERO_UNLOCK_HQ_REQUIREMENTS[selectedHeroId]?.hqLevel || 1;
  const isUnlocked =
    selectedHeroId === 'naruto' ||
    villageState.level >= reqHqLevel ||
    Boolean(villageState.unlockedHeroes && villageState.unlockedHeroes.includes(selectedHeroId));
  const isActiveGuard = villageState.activeHeroId === selectedHeroId;

  // Auto-rotation turntable ticker
  useEffect(() => {
    if (!isAutoSpinning) return;
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      setRotationAngle((prev) => (prev + delta * 24 * spinSpeed) % 360);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isAutoSpinning, spinSpeed]);

  // Pointer/Mouse drag rotation handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startAngleRef.current = rotationAngle;
    setIsAutoSpinning(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    const newAngle = (startAngleRef.current + deltaX * 0.75 + 3600) % 360;
    setRotationAngle(newAngle);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Play Character Voice & Catchphrase with Japanese Subtitle Banner
  const handlePlayVoice = () => {
    const shout = ANIME_VOICE_SHOUTS[selectedHeroId];
    animeAudio.playHeroShout(selectedHeroId);
    if (shout) {
      setVoiceBanner({
        kanji: shout.kanji,
        shout: shout.shoutText,
        subtitle: shout.subTitle
      });
      setTimeout(() => setVoiceBanner(null), 3800);
    }
  };

  // Assign as active village defender
  const handleAssignGuard = () => {
    const allUnlocked = Array.from(
      new Set([...(villageState.unlockedHeroes || ['naruto']), selectedHeroId, 'naruto'])
    );
    onUpdateVillage({
      ...villageState,
      activeHeroId: selectedHeroId,
      unlockedHeroes: allUnlocked
    });
    animeAudio.playButtonClick();
  };

  // Calculate dynamic lighting and 3D angle transform
  const rad = (rotationAngle * Math.PI) / 180;
  const lightIntensity = Math.max(0.35, (Math.cos(rad) + 1.2) / 2.2);
  const shadowOffsetX = -Math.sin(rad) * 35;
  const shadowBlur = 30 + Math.abs(Math.sin(rad)) * 25;

  const allHeroIds = Object.keys(HEROES_CATALOG);
  const currentIndex = allHeroIds.indexOf(selectedHeroId);

  const handlePrevHero = () => {
    const prevIdx = (currentIndex - 1 + allHeroIds.length) % allHeroIds.length;
    setSelectedHeroId(allHeroIds[prevIdx]);
    animeAudio.playButtonClick();
  };

  const handleNextHero = () => {
    const nextIdx = (currentIndex + 1) % allHeroIds.length;
    setSelectedHeroId(allHeroIds[nextIdx]);
    animeAudio.playButtonClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 select-none overflow-y-auto">
      {/* Voice Shout Kanji Banner Overlay */}
      {voiceBanner && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in duration-300">
          <div className="px-8 py-3.5 rounded-3xl bg-black/95 border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.9)] text-center backdrop-blur-md">
            <div className="text-3xl font-black text-amber-300 tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.9)]">
              {voiceBanner.kanji}
            </div>
            <div className="text-xs text-white font-mono uppercase tracking-wider mt-0.5">
              {voiceBanner.shout} &bull; &ldquo;{voiceBanner.subtitle}&rdquo;
            </div>
          </div>
        </div>
      )}

      {/* Main Modal Shell */}
      <div className="relative w-full max-w-6xl max-h-[96vh] rounded-3xl bg-[#070b16] border border-cyan-500/30 shadow-[0_0_80px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[#0c142b]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400">
              <Compass size={20} className="animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  360° Hero Dojo &amp; 3D Showcase
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  REAL-TIME TURNTABLE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Drag horizontally to rotate 360° &bull; Test combat stances, ultimate awakenings &amp; Japanese voice shouts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePlayVoice}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs flex items-center gap-1.5 hover:brightness-110 shadow-md cursor-pointer transition"
              title="Speak character catchphrase"
            >
              <Volume2 size={15} />
              <span className="hidden sm:inline">Play Voice Line</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body: Split Stage + Character Detail Pane */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[500px]">
          {/* Left/Center Stage: 360° Turntable (Cols 7) */}
          <div
            ref={stageRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="lg:col-span-7 relative flex flex-col items-center justify-between p-4 bg-gradient-to-b from-[#090f20] via-[#050812] to-[#04060c] cursor-grab active:cursor-grabbing overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10"
          >
            {/* Ambient Background Grid & Energy Spotlights */}
            <div
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% 30%, rgba(6,182,212,0.2) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '100% 100%, 36px 36px, 36px 36px'
              }}
            />

            {/* Top Stage Overlay Controls */}
            <div className="w-full flex items-center justify-between z-10">
              {/* Previous / Next Hero Switchers */}
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                <button
                  type="button"
                  onClick={handlePrevHero}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Previous Hero"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-white px-2">
                  {currentIndex + 1} / {allHeroIds.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextHero}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Next Hero"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Angle Dial & Auto-Spin Toggle */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-2xl border border-white/10 text-xs text-slate-300 font-mono backdrop-blur-md">
                  <Compass size={13} className="text-cyan-400" />
                  <span>{Math.round(rotationAngle)}°</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAutoSpinning(!isAutoSpinning)}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                    isAutoSpinning
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-black/60 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  {isAutoSpinning ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isAutoSpinning ? 'Auto Spinning' : 'Spin Paused'}</span>
                </button>
              </div>
            </div>

            {/* Center 3D Stage Container */}
            <div className="relative my-auto flex items-center justify-center w-full h-[360px] sm:h-[420px]">
              {/* Dynamic Aura Particle Field based on Pose */}
              {activeParticles !== 'none' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Energy Shockwave Ring in Ultimate Mode */}
                  {currentPose === 'ultimate' && (
                    <div
                      className="absolute w-72 h-72 rounded-full border-2 border-cyan-400/80 animate-ping"
                      style={{ animationDuration: '1.4s' }}
                    />
                  )}
                  {/* Concentric Rotating Chakra/Summoning Circle on Ground */}
                  <div
                    className="absolute bottom-6 w-64 h-32 rounded-[100%] border border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.6)] animate-spin"
                    style={{
                      transform: `rotateX(72deg) rotateZ(${rotationAngle * 1.5}deg)`,
                      borderColor: hero.color,
                      boxShadow: `0 0 50px ${hero.color}66`
                    }}
                  />
                  <div
                    className="absolute bottom-6 w-80 h-40 rounded-[100%] border border-dashed border-white/20"
                    style={{
                      transform: `rotateX(72deg) rotateZ(${-rotationAngle}deg)`
                    }}
                  />
                </div>
              )}

              {/* 3D Turntable Hero Avatar Element */}
              <div
                className="relative transition-transform duration-75 ease-out"
                style={{
                  transform: `scale(${zoomLevel}) perspective(900px) rotateY(${Math.sin(rad) * 18}deg)`,
                  filter: `drop-shadow(${shadowOffsetX}px 24px ${shadowBlur}px ${hero.color}88) brightness(${lightIntensity})`
                }}
              >
                {/* Character Portrait Card in 3D Stance */}
                <div
                  className={`relative w-56 sm:w-64 aspect-[4/5] rounded-3xl overflow-hidden border-2 shadow-2xl transition-all duration-300 ${
                    currentPose === 'ultimate'
                      ? 'ring-4 ring-cyan-400 scale-105 shadow-[0_0_60px_rgba(6,182,212,0.8)]'
                      : currentPose === 'victory'
                      ? 'ring-4 ring-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.6)]'
                      : currentPose === 'meditate'
                      ? 'translate-y-[-10px] ring-2 ring-purple-400 animate-pulse'
                      : 'border-white/20'
                  }`}
                  style={{ borderColor: hero.color }}
                >
                  <img
                    src={hero.image}
                    alt={hero.name}
                    className={`w-full h-full object-cover object-top transition-transform duration-500 ${
                      currentPose === 'ultimate'
                        ? 'scale-110'
                        : currentPose === 'victory'
                        ? 'scale-105'
                        : 'scale-100'
                    }`}
                  />

                  {/* Gradient Rim Lighting based on Rotation */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                    style={{
                      background: `linear-gradient(${rotationAngle}deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.6) 100%)`
                    }}
                  />

                  {/* Pose Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/80 text-white border border-white/20 backdrop-blur-md flex items-center gap-1 shadow">
                      {currentPose === 'combat' && <Swords size={11} className="text-red-400" />}
                      {currentPose === 'ultimate' && <Zap size={11} className="text-cyan-400" />}
                      {currentPose === 'victory' && <Award size={11} className="text-amber-400" />}
                      {currentPose === 'meditate' && <Shield size={11} className="text-purple-400" />}
                      <span>{currentPose}</span>
                    </span>
                  </div>

                  {/* Japanese Kanji Emblem Stamp */}
                  <div className="absolute bottom-3 right-3 text-2xl font-black text-white/30 font-serif select-none drop-shadow">
                    {hero.avatar}
                  </div>
                </div>

                {/* Character Speech Quote on Taunt/Victory */}
                {(currentPose === 'victory' || currentPose === 'ultimate') && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 text-center z-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="px-3 py-1.5 rounded-2xl bg-black/90 border border-amber-400 text-amber-200 text-xs font-bold shadow-lg backdrop-blur-md">
                      &ldquo;{hero.catchphrase}&rdquo;
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls: Pose Buttons & Turntable Snapping */}
            <div className="w-full flex flex-col gap-2.5 z-10 pt-2">
              {/* Pose Selector Tabs */}
              <div className="grid grid-cols-4 gap-1.5 bg-black/70 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
                {(['combat', 'ultimate', 'victory', 'meditate'] as PoseType[]).map((pose) => (
                  <button
                    key={pose}
                    type="button"
                    onClick={() => {
                      setCurrentPose(pose);
                      animeAudio.playButtonClick();
                      if (pose === 'ultimate' || pose === 'victory') {
                        handlePlayVoice();
                      }
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      currentPose === pose
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {pose === 'combat' && <Swords size={13} />}
                    {pose === 'ultimate' && <Zap size={13} />}
                    {pose === 'victory' && <Award size={13} />}
                    {pose === 'meditate' && <Shield size={13} />}
                    <span className="capitalize">{pose}</span>
                  </button>
                ))}
              </div>

              {/* Angle Quick Snapping Buttons */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span className="font-semibold text-slate-400">Quick Angles:</span>
                <div className="flex items-center gap-1">
                  {[
                    { label: 'Front (0°)', angle: 0 },
                    { label: 'Left (90°)', angle: 90 },
                    { label: 'Back (180°)', angle: 180 },
                    { label: 'Right (270°)', angle: 270 }
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setRotationAngle(item.angle);
                        setIsAutoSpinning(false);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 font-mono transition cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane: Hero Stats, Lore, Skill Info & Roster Carousel (Cols 5) */}
          <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between bg-[#0a0f21] overflow-y-auto gap-4">
            {/* 1. Header Information */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-white">{hero.name}</span>
                    <span className="text-base">{hero.avatar}</span>
                  </div>
                  <p className="text-xs text-amber-300 font-semibold mt-0.5">{hero.title}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    {hero.franchise.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Catchphrase Card */}
              <div className="my-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 italic flex items-center justify-between gap-2 shadow-sm">
                <div>
                  <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider not-italic mb-0.5">
                    Iconic Catchphrase
                  </div>
                  <div>&ldquo;{hero.catchphrase}&rdquo;</div>
                </div>
                <button
                  type="button"
                  onClick={handlePlayVoice}
                  className="p-2 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 text-amber-300 transition cursor-pointer shrink-0"
                  title="Listen to character speech voice"
                >
                  <Volume2 size={16} className="text-amber-400" />
                </button>
              </div>

              {/* Combat Stats Grid */}
              <div className="grid grid-cols-4 gap-2 my-3 text-center">
                <div className="p-2 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold block">HP</span>
                  <span className="text-xs font-black text-emerald-400">{hero.hp}</span>
                </div>
                <div className="p-2 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold block">ATK</span>
                  <span className="text-xs font-black text-rose-400">⚔️ {hero.attack}</span>
                </div>
                <div className="p-2 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold block">RANGE</span>
                  <span className="text-xs font-black text-cyan-400">🎯 {hero.range}</span>
                </div>
                <div className="p-2 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold block">SPEED</span>
                  <span className="text-xs font-black text-yellow-400">⚡ {hero.speed}</span>
                </div>
              </div>

              {/* Skills & Ultimates */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-300 mb-0.5">
                    <Zap size={13} />
                    <span>Skill: {hero.skillName}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{hero.skillDesc}</p>
                </div>

                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-0.5">
                    <Flame size={13} />
                    <span>Ultimate: {hero.ultimateName}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({hero.ultimateCooldown}s CD)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{hero.ultimateDesc}</p>
                </div>
              </div>
            </div>

            {/* 2. Hero Quick-Switch Carousel */}
            <div>
              <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                <span>All Heroes Roster ({allHeroIds.length})</span>
                <span className="text-[10px] text-slate-400">Click avatar to inspect</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {allHeroIds.map((hId) => {
                  const hData = HEROES_CATALOG[hId];
                  const isSelected = hId === selectedHeroId;
                  const reqHq = HERO_UNLOCK_HQ_REQUIREMENTS[hId]?.hqLevel || 1;
                  const unlocked =
                    hId === 'naruto' ||
                    villageState.level >= reqHq ||
                    Boolean(villageState.unlockedHeroes && villageState.unlockedHeroes.includes(hId));

                  return (
                    <button
                      key={hId}
                      type="button"
                      onClick={() => {
                        setSelectedHeroId(hId);
                        animeAudio.playButtonClick();
                      }}
                      className={`relative shrink-0 w-12 h-14 rounded-2xl overflow-hidden border-2 transition cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105'
                          : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                      }`}
                    >
                      <img src={hData.image} alt={hData.name} className="w-full h-full object-cover object-top" />
                      {!unlocked && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px]">
                          🔒
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons: Deploy as Defender / Status */}
              <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                {isActiveGuard ? (
                  <div className="w-full py-2.5 text-center text-xs font-bold text-amber-400 bg-amber-400/10 rounded-2xl border border-amber-400/30 flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={15} />
                    <span>Currently Patrolling Village Base</span>
                  </div>
                ) : isUnlocked ? (
                  <button
                    type="button"
                    onClick={handleAssignGuard}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs transition cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Shield size={15} />
                    <span>Deploy {hero.name} as Patrol Guard</span>
                  </button>
                ) : (
                  <div className="w-full py-2 px-3 rounded-2xl bg-black/60 border border-slate-700 text-center text-[11px] font-bold text-amber-400 flex items-center justify-center gap-1">
                    <span>🔒 Requires Town Hall HQ Lv {reqHqLevel} to Deploy</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
