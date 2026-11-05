'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HeroData, PlayerVillageState, HeroTierRank, HeroFormVariant } from '@/lib/animeClash/types';
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
  ChevronRight,
  Sun,
  Moon,
  Crown
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
  const [selectedRank, setSelectedRank] = useState<HeroTierRank>('normal');
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(true);
  const [spinSpeed, setSpinSpeed] = useState<number>(1.0);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [studioTheme, setStudioTheme] = useState<'midnight' | 'gold_hour' | 'cyber_neon'>('midnight');
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

  // Active form variant based on selected rank
  const activeForm: HeroFormVariant = hero.forms?.find((f) => f.id === selectedRank) || {
    id: selectedRank,
    name: selectedRank === 'goat' ? `${hero.name} (GOAT Mode)` : selectedRank === 'epic' ? `${hero.name} (Awakened)` : `${hero.name} (Tactical)`,
    badge: selectedRank === 'goat' ? '👑 GOAT Mode' : selectedRank === 'epic' ? '🥈 Epic Awakening' : '🥉 Normal Form',
    title: selectedRank === 'goat' ? 'Supreme God-Tier Apex Sovereign' : selectedRank === 'epic' ? 'Empowered Battle Awakening' : hero.title,
    attackMultiplier: selectedRank === 'goat' ? 1.85 : selectedRank === 'epic' ? 1.35 : 1.0,
    hpMultiplier: selectedRank === 'goat' ? 1.6 : selectedRank === 'epic' ? 1.25 : 1.0,
    auraColor: selectedRank === 'goat' ? '#fbbf24' : selectedRank === 'epic' ? '#06b6d4' : hero.color,
    auraVfx: selectedRank === 'goat' ? 'divine' : selectedRank === 'epic' ? 'lightning' : 'wind',
    customSkill: hero.skillName,
    customUltimate: hero.ultimateName,
    catchphrase: hero.catchphrase,
    catchphraseJp: hero.catchphraseJp || ''
  };

  const calculatedAttack = Math.round(hero.attack * activeForm.attackMultiplier);
  const calculatedHp = Math.round(hero.hp * activeForm.hpMultiplier);

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
    animeAudio.speakHeroQuote(selectedHeroId, activeForm.catchphrase);
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

  // 3D Turntable Mathematical Projections
  const rad = (rotationAngle * Math.PI) / 180;
  // Dynamic light & shadow simulation based on turntable angle
  const lightIntensity = Math.max(0.55, 0.85 + Math.cos(rad) * 0.25);
  const shadowX = -Math.sin(rad) * 45;
  const shadowScaleX = 1 + Math.abs(Math.sin(rad)) * 0.4;
  const shadowOpacity = Math.max(0.35, 0.7 - Math.abs(Math.sin(rad)) * 0.25);

  // Turnaround Angle Sector
  const isFacingBack = rotationAngle >= 120 && rotationAngle <= 240;
  const isProfileLeft = rotationAngle >= 60 && rotationAngle < 120;
  const isProfileRight = rotationAngle > 240 && rotationAngle <= 300;
  const perspectiveSkewX = Math.sin(rad) * 12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/92 backdrop-blur-2xl animate-in fade-in duration-300 select-none overflow-y-auto">
      {/* Voice Shout Kanji Banner Overlay */}
      {voiceBanner && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in duration-300">
          <div className="px-8 py-3 rounded-3xl bg-black/95 border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.9)] text-center backdrop-blur-md">
            <div className="text-3xl font-black text-amber-300 tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.9)]">
              {voiceBanner.kanji}
            </div>
            <div className="text-xs text-white font-mono uppercase tracking-wider mt-0.5">
              {voiceBanner.shout} &bull; &ldquo;{voiceBanner.subtitle}&rdquo;
            </div>
          </div>
        </div>
      )}

      {/* Main 3D Showcase Modal */}
      <div className="relative w-full max-w-6xl max-h-[96vh] rounded-3xl bg-[#060a14] border border-cyan-500/40 shadow-[0_0_100px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-[#091124]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Compass size={20} className="animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  360° Hero Turntable &amp; Form Showcase
                </h2>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md">
                  FULL-BODY 3D AVATAR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Drag horizontally to rotate avatar 360° &bull; Test Normal, Epic &amp; GOAT Mode transformations
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
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body: 3D Turntable Stage + Character Controls & Specs */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[520px]">
          {/* Left/Center: 360° Turntable Studio (Cols 7) */}
          <div
            ref={stageRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className={`lg:col-span-7 relative flex flex-col items-center justify-between p-4 cursor-grab active:cursor-grabbing overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 ${
              studioTheme === 'gold_hour'
                ? 'bg-gradient-to-b from-[#1c1209] via-[#0f0905] to-[#080502]'
                : studioTheme === 'cyber_neon'
                ? 'bg-gradient-to-b from-[#130722] via-[#0a0414] to-[#040108]'
                : 'bg-gradient-to-b from-[#091124] via-[#050813] to-[#030509]'
            }`}
          >
            {/* Dynamic Spotlight Cone from Ceiling onto Turntable */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-[550px] pointer-events-none opacity-40"
              style={{
                background:
                  selectedRank === 'goat'
                    ? 'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.4) 0%, rgba(245,158,11,0.15) 45%, transparent 75%)'
                    : selectedRank === 'epic'
                    ? 'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.4) 0%, rgba(14,165,233,0.15) 45%, transparent 75%)'
                    : 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 45%, transparent 75%)'
              }}
            />

            {/* Top Stage Controls: Switcher + Angle + Studio Theme */}
            <div className="w-full flex items-center justify-between z-10">
              {/* Prev/Next Hero Navigation */}
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

              {/* Angle Dial + Auto Spin */}
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
                  <span>{isAutoSpinning ? 'Auto Spin' : 'Spin Paused'}</span>
                </button>
              </div>
            </div>

            {/* CENTER 3D STAGE & TURNTABLE PEDESTAL */}
            <div className="relative my-auto flex flex-col items-center justify-center w-full h-[380px] sm:h-[440px]">
              {/* GOAT MODE EXPLOSIVE DIVINE AURAS & SHOCKWAVES */}
              {selectedRank === 'goat' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-80 h-80 rounded-full border-2 border-amber-400/60 animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="w-96 h-96 rounded-full border border-dashed border-amber-300/40 animate-spin" style={{ animationDuration: '8s' }} />
                  <div className="absolute inset-0 bg-radial from-amber-400/10 via-transparent to-transparent animate-pulse" />
                </div>
              )}

              {/* 3D TURNTABLE BASE ON THE FLOOR */}
              <div className="absolute bottom-2 sm:bottom-4 flex items-center justify-center pointer-events-none">
                {/* 1. Floor Drop Shadow (Dynamic Ellipse shifting with rotationAngle) */}
                <div
                  className="absolute w-56 sm:w-64 h-16 rounded-[100%] bg-black/90 blur-md transition-all duration-75"
                  style={{
                    transform: `translateX(${shadowX}px) scaleX(${shadowScaleX}) rotateX(68deg)`,
                    opacity: shadowOpacity
                  }}
                />

                {/* 2. Multi-tier 3D Metallic Turntable Ring (Top Edge) */}
                <div
                  className="relative w-64 sm:w-72 h-32 rounded-[100%] border-4 shadow-[0_15px_40px_rgba(0,0,0,0.9)] transition-all duration-300"
                  style={{
                    transform: 'rotateX(70deg)',
                    background:
                      selectedRank === 'goat'
                        ? 'radial-gradient(circle, #2d2005 0%, #150f02 70%, #451a03 100%)'
                        : selectedRank === 'epic'
                        ? 'radial-gradient(circle, #082f49 0%, #031525 70%, #0284c7 100%)'
                        : 'radial-gradient(circle, #1e293b 0%, #0f172a 70%, #334155 100%)',
                    borderColor: activeForm.auraColor,
                    boxShadow: `0 0 50px ${activeForm.auraColor}55`
                  }}
                >
                  {/* Rotating Rune Symbols on the Turntable Rim */}
                  <div
                    className="absolute inset-0 rounded-[100%] border border-dashed border-white/30"
                    style={{ transform: `rotateZ(${rotationAngle * 1.2}deg)` }}
                  />
                  <div
                    className="absolute inset-3 rounded-[100%] border border-white/20"
                    style={{ transform: `rotateZ(${-rotationAngle * 0.8}deg)` }}
                  />
                </div>
              </div>

              {/* THE 3D STANDING AVATAR (NO CARDBOARD CARD RECTANGLE!) */}
              <div
                className="relative z-10 transition-transform duration-75 ease-out flex flex-col items-center justify-end"
                style={{
                  transform: `scale(${zoomLevel}) perspective(1000px) skewX(${perspectiveSkewX * 0.15}deg)`,
                  filter: `drop-shadow(${shadowX * 0.4}px 18px 24px ${activeForm.auraColor}77) brightness(${lightIntensity})`
                }}
              >
                {/* Clean Cutout Standing Anime Avatar Figure */}
                <div
                  className={`relative h-[310px] sm:h-[350px] w-auto max-w-[260px] flex items-center justify-center transition-all duration-300 ${
                    currentPose === 'ultimate'
                      ? 'scale-105'
                      : currentPose === 'meditate'
                      ? 'translate-y-[-14px] animate-pulse'
                      : 'hover:scale-[1.02]'
                  }`}
                >
                  <img
                    src={hero.image}
                    alt={hero.name}
                    className={`h-full w-auto object-contain transition-all duration-300 ${
                      isFacingBack
                        ? 'brightness-[0.45] contrast-125 saturate-50'
                        : isProfileLeft
                        ? 'skew-y-1 brightness-95'
                        : isProfileRight
                        ? '-skew-y-1 brightness-95'
                        : 'brightness-100'
                    }`}
                    style={{
                      // In back stance, render as backlit battle silhouette
                      filter: isFacingBack
                        ? `drop-shadow(0 0 16px ${activeForm.auraColor}) drop-shadow(0 0 35px ${activeForm.auraColor}88)`
                        : undefined
                    }}
                  />

                  {/* Backlit Rim Aura when turning */}
                  {isFacingBack && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-black/80 border border-white/20 text-[10px] font-mono text-cyan-300 tracking-widest uppercase">
                      ★ Rear Guard Angle ★
                    </div>
                  )}

                  {/* Elemental Aura Glow Particles on Body */}
                  {selectedRank === 'goat' && (
                    <div
                      className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70 animate-pulse"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${activeForm.auraColor}44 0%, transparent 70%)`
                      }}
                    />
                  )}
                </div>

                {/* Character Nameplate Plaque floating just above the turntable */}
                <div className="mt-[-8px] z-20 flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/90 border border-white/20 shadow-xl backdrop-blur-md">
                  <span className="text-[10px] font-black uppercase text-amber-400">
                    {activeForm.badge}
                  </span>
                  <span className="text-white text-xs font-black">
                    {hero.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Turntable Quick Angles */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 px-2 pt-2 border-t border-white/10 z-10">
              <span className="font-semibold text-slate-300">Quick Angles:</span>
              <div className="flex items-center gap-1.5">
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
                    className={`px-2.5 py-1 rounded-xl text-xs font-mono transition cursor-pointer border ${
                      Math.round(rotationAngle) === item.angle
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Pane: Form Rank Switcher + Combat Poses + Hero Roster (Cols 5) */}
          <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between bg-[#0a0f21] overflow-y-auto gap-4">
            {/* 1. Header Information & Franchise */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-white">{hero.name}</span>
                    <span className="text-base">{hero.avatar}</span>
                  </div>
                  <p className="text-xs text-amber-300 font-semibold mt-0.5">{activeForm.title}</p>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  {hero.franchise.replace('_', ' ')}
                </span>
              </div>

              {/* 2. FORM & TIER RANK SWITCHER (NORMAL, EPIC, GOAT MODE) */}
              <div className="my-3">
                <div className="text-xs font-extrabold text-white mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Crown size={14} className="text-amber-400" />
                    <span>Select Character Form &amp; Tier Rank:</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-300">{activeForm.badge}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/70 border border-white/10">
                  {(['normal', 'epic', 'goat'] as HeroTierRank[]).map((rk) => (
                    <button
                      key={rk}
                      type="button"
                      onClick={() => {
                        setSelectedRank(rk);
                        animeAudio.playButtonClick();
                        if (rk === 'goat') {
                          handlePlayVoice();
                        }
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-extrabold transition flex flex-col items-center justify-center cursor-pointer ${
                        selectedRank === rk
                          ? rk === 'goat'
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-[1.02]'
                            : rk === 'epic'
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                            : 'bg-slate-700 text-white shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{rk === 'normal' ? '🥉 Normal' : rk === 'epic' ? '🥈 Epic' : '👑 GOAT'}</span>
                      <span className="text-[9px] opacity-80 mt-0.5 font-normal">
                        {rk === 'normal' ? 'Streetwear' : rk === 'epic' ? '+35% ATK' : '+85% ATK Apex'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Pose Selector */}
              <div className="my-2">
                <span className="text-xs font-bold text-slate-300 mb-1.5 block">Animated Combat Pose:</span>
                <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-black/50 border border-white/5">
                  {(['combat', 'ultimate', 'victory', 'meditate'] as PoseType[]).map((pose) => (
                    <button
                      key={pose}
                      type="button"
                      onClick={() => {
                        setCurrentPose(pose);
                        animeAudio.playButtonClick();
                      }}
                      className={`py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer capitalize ${
                        currentPose === pose
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {pose === 'combat' && <Swords size={12} />}
                      {pose === 'ultimate' && <Zap size={12} />}
                      {pose === 'victory' && <Award size={12} />}
                      {pose === 'meditate' && <Shield size={12} />}
                      <span>{pose}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Combat Stats Overview */}
              <div className="grid grid-cols-4 gap-2 my-3 text-center">
                <div className="p-2 rounded-2xl bg-black/50 border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold block">HP</span>
                  <span className="text-xs font-black text-emerald-400">{calculatedHp}</span>
                </div>
                <div className="p-2 rounded-2xl bg-black/50 border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold block">ATK</span>
                  <span className="text-xs font-black text-rose-400">⚔️ {calculatedAttack}</span>
                </div>
                <div className="p-2 rounded-2xl bg-black/50 border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold block">RANGE</span>
                  <span className="text-xs font-black text-cyan-400">🎯 {hero.range}</span>
                </div>
                <div className="p-2 rounded-2xl bg-black/50 border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold block">SPEED</span>
                  <span className="text-xs font-black text-yellow-400">⚡ {hero.speed}</span>
                </div>
              </div>

              {/* 5. Catchphrase Banner */}
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 italic flex items-center justify-between gap-2 shadow-sm my-2">
                <div>
                  <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider not-italic mb-0.5">
                    Spoken Dialogue Line
                  </div>
                  <div>&ldquo;{activeForm.catchphrase}&rdquo;</div>
                </div>
                <button
                  type="button"
                  onClick={handlePlayVoice}
                  className="p-2 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 text-amber-300 transition cursor-pointer shrink-0"
                  title="Audition spoken catchphrase"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            </div>

            {/* 6. All Heroes Roster Carousel */}
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
                        <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-[10px]">
                          🔒
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Deploy / Status Button */}
              <div className="pt-3 border-t border-white/10">
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
