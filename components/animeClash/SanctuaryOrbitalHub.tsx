'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PlayerVillageState, HeroData } from '@/lib/animeClash/types';
import { HEROES_CATALOG } from '@/lib/animeClash/gameData';
import { animeAudio } from '@/lib/animeClash/animeAudio';
import {
  Trophy,
  Swords,
  Search,
  Sparkles,
  Award,
  Crown,
  Zap,
  Shield,
  CheckCircle,
  X,
  Play,
  ArrowRight,
  Flame,
  Star,
  Users,
  Compass,
  Layers,
  ChevronRight
} from 'lucide-react';

interface SanctuaryOrbitalHubProps {
  villageState: PlayerVillageState;
  onUpdateVillage: (state: PlayerVillageState) => void;
  onLaunch1v1: () => void;
  onLaunchTrials: (floor: number) => void;
  onSwitchToVillageGrid: () => void;
  onOpenMultiplayer?: () => void;
}

interface QuestItem {
  id: string;
  title: string;
  desc: string;
  current: number;
  target: number;
  rewardBerries: number;
  rewardChakra: number;
  rewardReishi?: number;
  claimed: boolean;
  category: 'daily' | 'weekly' | 'milestone';
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  trophies: number;
  heroId: string;
  guildTag: string;
  tier: 'Grandmaster' | 'Master' | 'Diamond' | 'Platinum';
  isPlayer?: boolean;
}

interface TrialFloor {
  floor: number;
  title: string;
  bossName: string;
  bossPower: number;
  rewardBerries: number;
  rewardChakra: number;
  rewardReishi: number;
  cleared: boolean;
}

export default function SanctuaryOrbitalHub({
  villageState,
  onUpdateVillage,
  onLaunch1v1,
  onLaunchTrials,
  onSwitchToVillageGrid,
  onOpenMultiplayer
}: SanctuaryOrbitalHubProps) {
  const activeHero = HEROES_CATALOG[villageState.activeHeroId] || HEROES_CATALOG.naruto;

  // Active Modals
  const [activeModal, setActiveModal] = useState<'quests' | 'leaderboard' | 'trials' | 'search' | null>(null);
  const [playerName, setPlayerName] = useState('Marou');
  const [playerRank] = useState('#1 11');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScoutPlayer, setSelectedScoutPlayer] = useState<string | null>(null);

  // Quests State
  const [quests, setQuests] = useState<QuestItem[]>([
    {
      id: 'q1',
      title: '⚔️ 1v1 Arena Victor',
      desc: 'Win 1 duel in the 1v1 Combat Arena with any Anime Hero',
      current: 1,
      target: 1,
      rewardBerries: 450,
      rewardChakra: 300,
      claimed: false,
      category: 'daily'
    },
    {
      id: 'q2',
      title: '🌀 Shinobi Mobilization',
      desc: 'Train 5 Shinobi Genin or Straw Hat Brawlers in the Army Camp',
      current: 4,
      target: 5,
      rewardBerries: 350,
      rewardChakra: 250,
      claimed: false,
      category: 'daily'
    },
    {
      id: 'q3',
      title: '🗡️ Dimensional Trials Ascent',
      desc: 'Clear Floor 3 in the Infinite Trials Gauntlet',
      current: 3,
      target: 3,
      rewardBerries: 600,
      rewardChakra: 400,
      rewardReishi: 20,
      claimed: false,
      category: 'daily'
    },
    {
      id: 'q4',
      title: '👑 Sovereign Town Hall',
      desc: 'Upgrade Command Core Pagoda to Level 2 or higher',
      current: villageState.level,
      target: 2,
      rewardBerries: 1000,
      rewardChakra: 800,
      rewardReishi: 50,
      claimed: villageState.level >= 2,
      category: 'weekly'
    },
    {
      id: 'q5',
      title: '☠️ Overlord Bounty Hunt',
      desc: 'Defeat Madara Uchiha or Donquixote Doflamingo in the Boss Story Clash',
      current: 0,
      target: 1,
      rewardBerries: 1500,
      rewardChakra: 1200,
      rewardReishi: 100,
      claimed: false,
      category: 'weekly'
    }
  ]);

  // Leaderboard Data
  const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, name: playerName, level: 11, trophies: 4890, heroId: activeHero.id, guildTag: 'LEAF', tier: 'Grandmaster', isPlayer: true },
    { rank: 2, name: 'ShadowHokage_99', level: 11, trophies: 4780, heroId: 'naruto', guildTag: 'SHINOBI', tier: 'Grandmaster' },
    { rank: 3, name: 'StrawHatEmperor', level: 10, trophies: 4690, heroId: 'luffy', guildTag: 'PIRATES', tier: 'Master' },
    { rank: 4, name: 'GetsugaSovereign', level: 10, trophies: 4540, heroId: 'ichigo', guildTag: 'GOTEI13', tier: 'Master' },
    { rank: 5, name: 'AntiMagicDemon', level: 9, trophies: 4420, heroId: 'asta', guildTag: 'BULLS', tier: 'Diamond' },
    { rank: 6, name: 'ShibuyaGojo_24', level: 9, trophies: 4310, heroId: 'naruto', guildTag: 'JUJUTSU', tier: 'Diamond' },
    { rank: 7, name: 'ZoroSantoryu', level: 8, trophies: 4180, heroId: 'luffy', guildTag: 'PIRATES', tier: 'Diamond' },
    { rank: 8, name: 'AizenIllusionist', level: 8, trophies: 4050, heroId: 'ichigo', guildTag: 'ESPADAS', tier: 'Platinum' }
  ];

  // Infinite Trials Tower Data
  const [trialFloors, setTrialFloors] = useState<TrialFloor[]>([
    { floor: 1, title: 'Floor 1: Rogue Shinobi Outpost', bossName: 'Chakra Puppet Master', bossPower: 650, rewardBerries: 300, rewardChakra: 200, rewardReishi: 10, cleared: true },
    { floor: 2, title: 'Floor 2: Marine Patrol Ambush', bossName: 'Smoker Cyber-Drone', bossPower: 850, rewardBerries: 450, rewardChakra: 300, rewardReishi: 15, cleared: true },
    { floor: 3, title: 'Floor 3: Karakura Hollow Rift', bossName: 'Menos Grande Vanguard', bossPower: 1100, rewardBerries: 600, rewardChakra: 450, rewardReishi: 25, cleared: true },
    { floor: 4, title: 'Floor 4: Spade Demon Beast', bossName: 'Ancient Devil Hound', bossPower: 1400, rewardBerries: 850, rewardChakra: 600, rewardReishi: 40, cleared: false },
    { floor: 5, title: 'Floor 5: Dimensional Paradox [BOSS]', bossName: 'Void Avatar of Chaos', bossPower: 1950, rewardBerries: 1500, rewardChakra: 1000, rewardReishi: 80, cleared: false },
    { floor: 6, title: 'Floor 6: Cyber-Uchiha Mirage', bossName: 'Susanoo Shadow Fragment', bossPower: 2400, rewardBerries: 2000, rewardChakra: 1400, rewardReishi: 120, cleared: false }
  ]);

  // Preset Scout Players for Player Search
  const scoutPlayers = [
    { name: 'Kage_Ren', trophies: 4210, townHall: 4, hero: 'Naruto Uzumaki', defenses: 'Twin Rail Cannons, Magma Walls', guild: 'Hidden Leaf' },
    { name: 'Grand_Zoro', trophies: 4150, townHall: 3, hero: 'Monkey D. Luffy', defenses: 'Haki Turrets, Steel Bastion', guild: 'Straw Hat Fleet' },
    { name: 'Grimmjow_6', trophies: 3980, townHall: 3, hero: 'Ichigo Kurosaki', defenses: 'Reishi Siphons, Granite Ring', guild: 'Gotei 13' },
    { name: 'Captain_Yami', trophies: 4490, townHall: 4, hero: 'Asta', defenses: 'Anti-Magic EMP, Titanium Spikes', guild: 'Black Bulls' }
  ];

  // Handle Quest Claim
  const handleClaimQuest = (quest: QuestItem) => {
    if (quest.claimed || quest.current < quest.target) return;

    onUpdateVillage({
      ...villageState,
      berries: Math.min(villageState.maxStorage, villageState.berries + quest.rewardBerries),
      chakra: Math.min(villageState.maxStorage, villageState.chakra + quest.rewardChakra),
      reishi: quest.rewardReishi ? Math.min(villageState.maxStorage, villageState.reishi + quest.rewardReishi) : villageState.reishi
    });

    setQuests((prev) =>
      prev.map((q) => (q.id === quest.id ? { ...q, claimed: true } : q))
    );

    animeAudio.playCombatSFX('spell');
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center select-none py-2">
      {/* 1. TOP SANCTUARY CONTROLS & BREADCRUMB */}
      <div className="w-full flex items-center justify-between px-4 py-2 mb-2 bg-[#081226]/80 rounded-2xl border border-[#1e3056] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-black tracking-widest text-emerald-300 uppercase">
            SANCTUARY COMMAND ORBIT
          </span>
          <span className="text-[10px] text-slate-400 font-mono">HQ LVL {villageState.level}</span>
        </div>

        <button
          type="button"
          onClick={onSwitchToVillageGrid}
          className="flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition cursor-pointer"
        >
          <span>🌸</span>
          <span>Enter Konoha Village</span>
        </button>
      </div>

      {/* 2. MAIN 2.5D ISOMETRIC ORBITAL HUB CANVAS VIEW */}
      <div className="relative w-full aspect-[4/3] max-h-[560px] rounded-3xl overflow-hidden border-2 border-[#1e3a6a] bg-gradient-to-b from-[#040914] via-[#09152a] to-[#040813] shadow-[0_0_50px_rgba(4,9,20,0.9)] flex items-center justify-center">
        {/* Isometric Checkerboard Grid Floor with Atmospheric Vignette */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 50% 50%, rgba(6, 182, 212, 0.15) 0%, rgba(4, 9, 20, 0.95) 75%),
              repeating-linear-gradient(45deg, rgba(30, 58, 106, 0.25) 0, rgba(30, 58, 106, 0.25) 30px, transparent 30px, transparent 60px),
              repeating-linear-gradient(-45deg, rgba(30, 58, 106, 0.25) 0, rgba(30, 58, 106, 0.25) 30px, transparent 30px, transparent 60px)
            `,
            backgroundSize: 'cover, 60px 60px, 60px 60px'
          }}
        />

        {/* Ambient Rising Embers & Floating Sakura Petals */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-pink-400 blur-[1px] animate-ping opacity-60" />
          <div className="absolute top-1/3 right-1/4 w-2.5 h-2.5 rounded-full bg-amber-400 blur-[1px] animate-bounce opacity-70" />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse opacity-80" />
          <div className="absolute top-12 left-1/2 w-3 h-3 rounded-full bg-purple-400 blur-sm animate-pulse opacity-50" />
        </div>

        {/* ======================================================== */}
        {/* CENTERPIECE: CITADEL FORTRESS & FIERY HERO MEDALLION     */}
        {/* ======================================================== */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Floating Cyan Diamond Eye Halo (Hovering Above Spire) */}
          <div className="relative mb-2 animate-bounce duration-1000">
            <div className="w-14 h-7 rounded-[100%] border-2 border-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.95)] bg-cyan-950/40 flex items-center justify-center backdrop-blur-sm">
              <div className="w-5 h-5 rotate-45 border-2 border-white bg-gradient-to-br from-cyan-300 to-blue-500 shadow-md" />
            </div>
            {/* Soft vertical beam */}
            <div className="absolute top-7 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gradient-to-b from-cyan-400 to-transparent opacity-80" />
          </div>

          {/* Grand Hokage Citadel Pagoda Roof (Deep Blue & Gold Eaves) */}
          <div className="relative w-28 h-20 flex items-center justify-center mb-1">
            {/* Pagoda Triangular Roof */}
            <div
              className="w-28 h-14 bg-gradient-to-b from-[#172554] to-[#0f172a] border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center"
              style={{
                clipPath: 'polygon(50% 0%, 100% 70%, 82% 100%, 18% 100%, 0% 70%)'
              }}
            >
              <div className="w-16 h-8 bg-gradient-to-b from-red-600 to-amber-600 rounded-t-sm opacity-90" />
            </div>
          </div>

          {/* Golden Crown Player Rank Plaque: 👑 #1 11 Marou 💎 */}
          <div className="relative z-20 -mt-5 mb-2 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 border-2 border-yellow-200 shadow-[0_0_25px_rgba(234,179,8,0.8)] flex items-center gap-2">
            <span className="text-base text-yellow-100 drop-shadow">👑</span>
            <span className="text-xs sm:text-sm font-black text-slate-950 tracking-wider">
              {playerRank} {playerName}
            </span>
            <span className="text-xs text-cyan-200">💎</span>
          </div>

          {/* 🌟 HERO CHAMPION MEDALLION (Surrounded by Fiery Solar Flare Corona) */}
          <div className="relative flex items-center justify-center w-36 h-36">
            {/* Outer Rotating Fiery Sun Flame Rays */}
            <div
              className="absolute inset-0 rounded-full border-4 border-dashed border-amber-500 animate-spin"
              style={{ animationDuration: '18s' }}
            />
            {/* Blazing Flame Aura Corona */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 opacity-80 blur-md animate-pulse" />
            <div className="absolute -inset-1 rounded-full border-2 border-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.95)]" />

            {/* Inner Hero Portrait Container */}
            <div className="relative w-28 h-28 rounded-full overflow-hidden bg-slate-950 border-2 border-yellow-300 shadow-inner flex items-center justify-center">
              <img
                src={activeHero.image}
                alt={activeHero.name}
                className="w-full h-full object-cover object-top scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Ground Flame Ring Base */}
            <div className="absolute -bottom-2 w-32 h-6 rounded-[100%] bg-amber-600/40 blur-sm pointer-events-none" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5 SYMMETRICAL ORBITAL MODE PODS                          */}
        {/* ======================================================== */}

        {/* 1. TOP-LEFT POD: QUESTS (Cyan Flame Aura Shield) */}
        <div className="absolute top-4 sm:top-10 left-2 sm:left-12 md:left-20 flex flex-col items-center">
          <button
            type="button"
            onClick={() => {
              setActiveModal('quests');
              animeAudio.playCombatSFX('spell');
            }}
            className="group relative w-14 h-16 sm:w-20 sm:h-24 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
          >
            {/* Glowing Cyan Flame Aura */}
            <div className="absolute -inset-2 rounded-2xl bg-cyan-500/50 blur-lg group-hover:bg-cyan-400/80 transition" />

            {/* Shield Body */}
            <div
              className="relative w-full h-full bg-gradient-to-b from-cyan-500 via-blue-600 to-indigo-900 border-2 border-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.8)] flex items-center justify-center"
              style={{
                clipPath: 'polygon(50% 0%, 100% 20%, 100% 75%, 50% 100%, 0% 75%, 0% 20%)'
              }}
            >
              {/* White Exclamation Mark ! */}
              <div className="text-2xl sm:text-4xl font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]">
                !
              </div>

              {/* Notification Badge Ring on Top-Right */}
              <div className="absolute top-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-500 border border-white text-[8px] sm:text-[9px] font-bold text-white flex items-center justify-center">
                2
              </div>
            </div>
          </button>
          {/* Black Pill Label: Quests */}
          <span className="mt-1 sm:mt-2 px-2 sm:px-3 py-0.5 rounded-full bg-black/90 border border-white/20 text-[10px] sm:text-xs font-black text-white tracking-wide shadow-lg">
            Quests
          </span>
        </div>

        {/* 2. TOP-RIGHT POD: LEADERBOARD (Purple & Orange Fire Banner) */}
        <div className="absolute top-4 sm:top-10 right-2 sm:right-12 md:right-20 flex flex-col items-center">
          <button
            type="button"
            onClick={() => {
              setActiveModal('leaderboard');
              animeAudio.playCombatSFX('sword');
            }}
            className="group relative w-14 h-16 sm:w-20 sm:h-24 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
          >
            {/* Glowing Purple & Amber Fire Aura */}
            <div className="absolute -inset-2 rounded-2xl bg-purple-500/50 blur-lg group-hover:bg-purple-400/80 transition" />

            {/* Banner/Shield Body */}
            <div
              className="relative w-full h-full bg-gradient-to-b from-purple-600 via-indigo-800 to-[#1e1035] border-2 border-amber-300 shadow-[0_0_25px_rgba(168,85,247,0.8)] flex items-center justify-center"
              style={{
                clipPath: 'polygon(50% 0%, 100% 18%, 100% 75%, 50% 100%, 0% 75%, 0% 18%)'
              }}
            >
              {/* Trophy Cup Icon with Flame */}
              <Trophy size={24} className="sm:hidden text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]" />
              <Trophy size={32} className="hidden sm:block text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]" />

              {/* Red Badge */}
              <div className="absolute top-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-500 border border-white flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-white">
                #1
              </div>
            </div>
          </button>
          {/* Black Pill Label: Leaderboard */}
          <span className="mt-1 sm:mt-2 px-2 sm:px-3 py-0.5 rounded-full bg-black/90 border border-white/20 text-[10px] sm:text-xs font-black text-white tracking-wide shadow-lg">
            Leaderboard
          </span>
        </div>

        {/* 3. BOTTOM-LEFT POD: TRIALS (Indigo Hexagon with Sword) */}
        <div className="absolute bottom-4 sm:bottom-12 left-2 sm:left-12 md:left-24 flex flex-col items-center">
          <button
            type="button"
            onClick={() => {
              setActiveModal('trials');
              animeAudio.playCombatSFX('sword');
            }}
            className="group relative w-14 h-16 sm:w-20 sm:h-22 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
          >
            {/* Beveled Hexagon Body */}
            <div
              className="relative w-full h-full bg-gradient-to-b from-[#24355a] via-[#162340] to-[#0b1324] border-2 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.6)] flex items-center justify-center group-hover:border-cyan-400 transition"
              style={{
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
              }}
            >
              {/* Diagonal White Sword/Rapier */}
              <span className="text-xl sm:text-3xl -rotate-45 transform drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                🗡️
              </span>

              {/* Red Indicator Ring on Top */}
              <div className="absolute -top-1 right-2 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-red-500 bg-red-950/80" />
            </div>
          </button>
          {/* Black Pill Label: Trials */}
          <span className="mt-1 sm:mt-2 px-2 sm:px-3 py-0.5 rounded-full bg-black/90 border border-white/20 text-[10px] sm:text-xs font-black text-white tracking-wide shadow-lg">
            Trials
          </span>
        </div>

        {/* 4. BOTTOM-RIGHT POD: PLAYERS SEARCH (Hexagon with Magnifying Glass & Gem) */}
        <div className="absolute bottom-4 sm:bottom-12 right-2 sm:right-12 md:right-24 flex flex-col items-center">
          <button
            type="button"
            onClick={() => {
              setActiveModal('search');
              animeAudio.playCombatSFX('spell');
            }}
            className="group relative w-14 h-16 sm:w-20 sm:h-22 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
          >
            {/* Beveled Hexagon Body */}
            <div
              className="relative w-full h-full bg-gradient-to-b from-[#24355a] via-[#162340] to-[#0b1324] border-2 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.6)] flex items-center justify-center group-hover:border-amber-400 transition"
              style={{
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
              }}
            >
              {/* Magnifying Glass with Gem inside */}
              <div className="relative flex items-center justify-center">
                <Search size={20} className="sm:hidden text-amber-400 drop-shadow" />
                <Search size={28} className="hidden sm:block text-amber-400 drop-shadow" />
                <span className="absolute text-[8px] sm:text-[10px] text-pink-300">💎</span>
              </div>
            </div>
          </button>
          {/* Black Pill Label: Players Search */}
          <span className="mt-1 sm:mt-2 px-2 sm:px-3 py-0.5 rounded-full bg-black/90 border border-white/20 text-[10px] sm:text-xs font-black text-white tracking-wide shadow-lg whitespace-nowrap">
            Players Search
          </span>
        </div>

        {/* 5. BOTTOM-CENTER POD: 1v1 (Dual Crossed Flaming Katanas Hexagon) */}
        <div className="absolute bottom-1.5 sm:bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-25">
          <button
            type="button"
            onClick={() => {
              onLaunch1v1();
              animeAudio.playCombatSFX('sword');
            }}
            className="group relative w-16 h-18 sm:w-24 sm:h-26 flex items-center justify-center transition-transform hover:scale-115 cursor-pointer"
          >
            {/* Flaming Red Clash Glow */}
            <div className="absolute -inset-3 rounded-full bg-red-600/40 blur-xl group-hover:bg-red-500/70 transition" />

            {/* Beveled Dark Hexagon with Red Border */}
            <div
              className="relative w-full h-full bg-gradient-to-b from-[#3a121d] via-[#1e0a12] to-[#090205] border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.9)] flex items-center justify-center"
              style={{
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
              }}
            >
              {/* Dual Crossed Flaming Swords Icon */}
              <Swords size={24} className="sm:hidden text-amber-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.95)]" />
              <Swords size={36} className="hidden sm:block text-amber-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.95)]" />

              {/* Red Badge Ring */}
              <div className="absolute -top-1 left-2 w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-red-400 bg-red-600 animate-ping opacity-75" />
            </div>
          </button>
          {/* Black Pill Label: 1v1 */}
          <span className="mt-1 px-3 sm:px-4 py-0.5 rounded-full bg-black/95 border border-red-500/80 text-[10px] sm:text-xs font-black text-amber-300 tracking-wider shadow-lg">
            1v1
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: QUESTS & REWARD SYSTEM                          */}
      {/* ======================================================== */}
      {activeModal === 'quests' && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0b1733] to-[#060c1d] border-2 border-cyan-400 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.5)] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-2 rounded-2xl bg-cyan-950/80 border border-cyan-400 text-cyan-300">
                  📜
                </span>
                <div>
                  <h3 className="text-lg font-black text-white">Sanctuary Daily &amp; Weekly Quests</h3>
                  <span className="text-xs text-cyan-300 font-mono">Complete missions to harvest resources and prestige</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
              {quests.map((q) => {
                const isComplete = q.current >= q.target;
                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      q.claimed
                        ? 'bg-slate-900/40 border-slate-700 opacity-60'
                        : isComplete
                        ? 'bg-cyan-950/40 border-cyan-400/80 shadow-md ring-1 ring-cyan-400/30'
                        : 'bg-[#0f1d3d] border-[#1e3460]'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{q.title}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase">
                          {q.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{q.desc}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span>Progress: <strong className={isComplete ? 'text-emerald-400' : 'text-amber-300'}>{q.current}/{q.target}</strong></span>
                        <span>Reward: 💰 {q.rewardBerries} &bull; 🌀 {q.rewardChakra} {q.rewardReishi ? `&bull; 🔮 ${q.rewardReishi}` : ''}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={q.claimed || !isComplete}
                      onClick={() => handleClaimQuest(q)}
                      className={`px-4 py-2 rounded-xl font-black text-xs transition cursor-pointer whitespace-nowrap ${
                        q.claimed
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : isComplete
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.7)] animate-pulse'
                          : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-white/5'
                      }`}
                    >
                      {q.claimed ? 'Claimed ✓' : isComplete ? 'Claim Reward' : `${q.current}/${q.target}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: LEADERBOARD SYSTEM                              */}
      {/* ======================================================== */}
      {activeModal === 'leaderboard' && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#180d2b] to-[#0c0617] border-2 border-purple-500 rounded-3xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.5)] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-2 rounded-2xl bg-purple-950/80 border border-purple-400 text-purple-300">
                  🏆
                </span>
                <div>
                  <h3 className="text-lg font-black text-white">Global Season Leaderboard</h3>
                  <span className="text-xs text-purple-300 font-mono">Season 1: Dimension Collapse &bull; Resets in 6 Days</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
              {leaderboardData.map((lb) => {
                const hero = HEROES_CATALOG[lb.heroId] || HEROES_CATALOG.naruto;
                return (
                  <div
                    key={lb.rank}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                      lb.isPlayer
                        ? 'bg-amber-950/50 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                        : lb.rank <= 3
                        ? 'bg-purple-950/40 border-purple-500/60'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-center font-black text-base">
                        {lb.rank === 1 ? '🥇' : lb.rank === 2 ? '🥈' : lb.rank === 3 ? '🥉' : `#${lb.rank}`}
                      </div>
                      <img
                        src={hero.image}
                        alt={hero.name}
                        className="w-10 h-10 rounded-xl object-cover object-top border"
                        style={{ borderColor: hero.color }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white">{lb.name}</span>
                          {lb.isPlayer && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-black">YOU</span>
                          )}
                          <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-1.5 py-0.5 rounded border border-purple-800">
                            [{lb.guildTag}]
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">Lv {lb.level} &bull; Hero: {hero.name.split(' ')[0]}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-amber-300 flex items-center gap-1 justify-end">
                        <Trophy size={14} className="text-amber-400" />
                        <span>{lb.trophies.toLocaleString()}</span>
                      </div>
                      <span className="text-[10px] font-mono text-purple-300 uppercase">{lb.tier}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: INFINITE TRIALS GAUNTLET                        */}
      {/* ======================================================== */}
      {activeModal === 'trials' && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#101c38] to-[#070d1c] border-2 border-indigo-400 rounded-3xl p-6 shadow-[0_0_50px_rgba(99,102,241,0.5)] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-2 rounded-2xl bg-indigo-950/80 border border-indigo-400 text-indigo-300">
                  🗡️
                </span>
                <div>
                  <h3 className="text-lg font-black text-white">Dimensional Void Trials Tower</h3>
                  <span className="text-xs text-indigo-300 font-mono">Climb 50 floors of escalating enemy syndicate bosses</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
              {trialFloors.map((tf) => (
                <div
                  key={tf.floor}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    tf.cleared
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : 'bg-[#142345] border-[#203666]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{tf.title}</h4>
                      {tf.cleared && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                          CLEARED ✓
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      Target: <strong className="text-red-400">{tf.bossName}</strong> (Power: {tf.bossPower})
                    </div>
                    <div className="text-xs text-amber-300 mt-1">
                      Loot: 💰 {tf.rewardBerries} &bull; 🌀 {tf.rewardChakra} &bull; 🔮 {tf.rewardReishi}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      onLaunchTrials(tf.floor);
                    }}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                      tf.cleared
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-gradient-to-r from-red-600 to-indigo-600 hover:brightness-110 text-white shadow-md'
                    }`}
                  >
                    <span>{tf.cleared ? 'Replay' : 'Challenge'}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: PLAYERS SEARCH & SCOUT                          */}
      {/* ======================================================== */}
      {activeModal === 'search' && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#101b33] to-[#070c19] border-2 border-indigo-400 rounded-3xl p-6 shadow-[0_0_50px_rgba(99,102,241,0.5)] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-2 rounded-2xl bg-indigo-950/80 border border-indigo-400 text-indigo-300">
                  🔍
                </span>
                <div>
                  <h3 className="text-lg font-black text-white">Ninja Scout &bull; Player Search</h3>
                  <span className="text-xs text-indigo-300 font-mono">Inspect rival village defenses and initiate friendly duels</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by Player Tag or Name (e.g. Ren, Zoro, Yami)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-black/50 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Search
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
              {scoutPlayers
                .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery)
                .map((p) => (
                  <div
                    key={p.name}
                    className="p-3.5 rounded-2xl bg-[#142345] border border-[#203666] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{p.name}</h4>
                        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                          {p.guild}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        Active Champion: <strong className="text-amber-300">{p.hero}</strong> &bull; Town Hall: Lv {p.townHall}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Defenses: {p.defenses} &bull; Trophies: 🏆 {p.trophies}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => alert(`Scouting ${p.name}'s village layout! Defense Rating: 94/100.`)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 cursor-pointer"
                      >
                        Scout Base
                      </button>
                      {onOpenMultiplayer ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModal(null);
                            onOpenMultiplayer();
                          }}
                          className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold shadow-md cursor-pointer"
                        >
                          ⚔️ Raid Base
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModal(null);
                            onLaunch1v1();
                          }}
                          className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white text-xs font-bold shadow-md cursor-pointer"
                        >
                          Spar 1v1
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

