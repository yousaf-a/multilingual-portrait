'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  PlayerVillageState,
  BuildingInstance,
  BuildingType,
  HeroData,
  WeatherTimeMode,
  SanctuaryGuild,
  FriendProfile,
  RaidBattleReport,
  UserAccount
} from '@/lib/animeClash/types';
import {
  HEROES_CATALOG,
  TROOPS_CATALOG,
  VILLAGE_HQ_LEVEL_PLANS,
  BASE_LAYOUT_PRESETS,
  BaseLayoutPreset,
  SANCTUARY_GUILDS,
  ANIME_VOICE_SHOUTS,
  DEFAULT_FRIEND_BASES,
  HERO_UNLOCK_HQ_REQUIREMENTS,
  exportSanctuaryCode,
  importSanctuaryCode,
  getMaxBuildingLevelForHQ,
  getMaxHeroLevelForHQ,
  getArmyCampCapForHQ,
  getHeroStatsForLevel,
  getHeroUpgradeCost
} from '@/lib/animeClash/gameData';
import { recordCrossUserRaid, resetToChapterOneFreshStart } from '@/lib/animeClash/accountManager';
import {
  toIso,
  fromIso,
  drawIsoTerrain,
  drawIsoBuilding,
  drawIsoHeroPatrol,
  drawClashHUD,
  ISO_TILE_W,
  ISO_TILE_H
} from '@/lib/animeClash/isometricRenderer';
import AnimeRaidArena from './AnimeRaidArena';
import BaseDefenseSimulator from './BaseDefenseSimulator';
import SanctuaryOrbitalHub from './SanctuaryOrbitalHub';
import Hero360Showcase from './Hero360Showcase';
import NarutoStoryQuestModal from './NarutoStoryQuestModal';
import PainBossBattleModal from './PainBossBattleModal';
import AnimeStoryPrologueModal from './AnimeStoryPrologueModal';
import { CHAPTER_1_NARUTO_QUESTS, ChapterQuest, evaluateQuestTaskProgress } from '@/lib/animeClash/narutoChapterQuests';
import { animeAudio } from '@/lib/animeClash/animeAudio';
import {
  Shield,
  Zap,
  Coins,
  Sparkles,
  Sword,
  Wrench,
  Plus,
  ArrowUpCircle,
  BookOpen,
  Info,
  Maximize2,
  Tv,
  Play,
  Move,
  CheckCircle,
  Layout,
  Star,
  Award,
  Crown,
  Sun,
  Sunset,
  Moon,
  CloudRain,
  Volume2,
  Users,
  Layers,
  Globe,
  Share2,
  Copy,
  Check,
  Lock,
  Unlock,
  UserPlus,
  Eye,
  Home,
  User,
  LogOut,
  Compass,
  RotateCcw
} from 'lucide-react';

interface VillageBuilderProps {
  villageState: PlayerVillageState;
  currentUser?: UserAccount | null;
  viewingTargetUser?: FriendProfile | null;
  onUpdateVillage: (state: PlayerVillageState) => void;
  onLaunchBattle: () => void;
  onOpenStory: () => void;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  onScoutBase?: (target: FriendProfile) => void;
  onReturnToMyBase?: () => void;
}

export default function VillageBuilder({
  villageState,
  currentUser,
  viewingTargetUser,
  onUpdateVillage,
  onLaunchBattle,
  onOpenStory,
  onOpenAuthModal,
  onLogout,
  onScoutBase,
  onReturnToMyBase
}: VillageBuilderProps) {
  // Strict Permission Check: Is current user logged in and owner of this sanctuary?
  const isOwner = Boolean(
    currentUser && (!viewingTargetUser || viewingTargetUser.id === (currentUser.id || villageState.ownerUserId))
  );

  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInstance | null>(null);
  const [villageViewMode, setVillageViewMode] = useState<'orbit_hub' | 'grid'>('orbit_hub');
  const [activeBuildTab, setActiveBuildTab] = useState<'village' | 'shop' | 'heroes' | 'layouts' | 'roadmap' | 'attack' | 'guilds' | 'multiplayer'>('village');
  const [isRelocatingBuildingId, setIsRelocatingBuildingId] = useState<string | null>(null);
  const [heroInteractionQuote, setHeroInteractionQuote] = useState<string | null>(null);
  const [isRaiding, setIsRaiding] = useState(false);
  const [isArenaRaidActive, setIsArenaRaidActive] = useState(false);
  const [selectedRaidFriend, setSelectedRaidFriend] = useState<FriendProfile | null>(() => DEFAULT_FRIEND_BASES[1] || DEFAULT_FRIEND_BASES[0]);
  const [selectedMissionRank, setSelectedMissionRank] = useState<'D' | 'C' | 'B' | 'A' | 'S'>('C');
  const [heroUnlockCelebration, setHeroUnlockCelebration] = useState<HeroData | null>(null);
  const [copiedCodeToast, setCopiedCodeToast] = useState(false);
  const [importFriendCodeInput, setImportFriendCodeInput] = useState('');
  const [isDefenseActive, setIsDefenseActive] = useState(false);
  const [show360Showcase, setShow360Showcase] = useState(false);
  const [showcaseHeroId, setShowcaseHeroId] = useState('naruto');
  const [voiceShoutBanner, setVoiceShoutBanner] = useState<{ kanji: string; romaji: string; trans: string } | null>(null);
  const [showNarutoStoryModal, setShowNarutoStoryModal] = useState(false);
  const [showPainBossModal, setShowPainBossModal] = useState(false);
  const [showPrologueModal, setShowPrologueModal] = useState(false);
  const [isRamenModalOpen, setIsRamenModalOpen] = useState(false);
  const [isTeam7ModalOpen, setIsTeam7ModalOpen] = useState(false);
  const [ramenFeedback, setRamenFeedback] = useState<string | null>(null);
  const [team7Feedback, setTeam7Feedback] = useState<string | null>(null);
  const [raidResult, setRaidResult] = useState<{
    stars: number;
    destruction: number;
    berriesLooted: number;
    chakraLooted: number;
    log: string[];
  } | null>(null);
  const [harvestToast, setHarvestToast] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // 1-second interval to update live countdown and real-time resource accrual
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-place canonical Konohagakure landmarks (Ichiraku Ramen & Team 7 Posts) if missing from current base
  useEffect(() => {
    if (!villageState.buildings || villageState.buildings.length === 0) return;
    const hasRamen = villageState.buildings.some((b) => b.type === 'ichiraku_ramen');
    const hasTeam7 = villageState.buildings.some((b) => b.type === 'team7_posts');

    if (!hasRamen || !hasTeam7) {
      const updatedBuildings = [...villageState.buildings];
      if (!hasRamen) {
        updatedBuildings.push({
          id: 'ichiraku_ramen_stand',
          type: 'ichiraku_ramen',
          name: 'Ichiraku Ramen Stand (一楽ラーメン)',
          level: 1,
          x: 3,
          y: 7,
          hp: 900,
          maxHp: 900,
          color: '#ea580c',
          icon: '🍜',
          productionRate: 25,
          resourceProduced: 'chakra'
        });
      }
      if (!hasTeam7) {
        updatedBuildings.push({
          id: 'team7_training_posts',
          type: 'team7_posts',
          name: 'Team 7 Sparring Posts (第7班・修練場)',
          level: 1,
          x: 7,
          y: 3,
          hp: 750,
          maxHp: 750,
          color: '#84cc16',
          icon: '🪵'
        });
      }
      onUpdateVillage({ ...villageState, buildings: updatedBuildings });
    }
  }, [villageState.buildings]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  const activeHero = HEROES_CATALOG[villageState.activeHeroId] || HEROES_CATALOG.naruto;

  // Active Hero Guard Patrol State
  const heroImgRef = useRef<HTMLImageElement | null>(null);
  const heroPatrolRef = useRef({
    currentX: 5.0,
    currentY: 4.0,
    waypointIdx: 0,
    waypoints: [
      { x: 5.0, y: 4.0 },
      { x: 6.8, y: 4.0 },
      { x: 6.8, y: 6.2 },
      { x: 5.0, y: 6.8 },
      { x: 3.8, y: 6.0 },
      { x: 3.8, y: 4.2 }
    ],
    speech: null as string | null,
    speechTimer: 0
  });

  // Preload Active Hero Portrait Image
  useEffect(() => {
    const img = new Image();
    img.src = activeHero.image;
    if (img.complete && img.naturalWidth > 0) {
      heroImgRef.current = img;
    }
    img.onload = () => {
      heroImgRef.current = img;
    };
  }, [activeHero.image, activeHero.id]);

  // Preload Authentic Anime Hokage Monument Panoramic Artwork
  const monumentImgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = '/anime-heroes/konoha-hokage-monument-hd.jpg';
    if (img.complete && img.naturalWidth > 0) {
      monumentImgRef.current = img;
    }
    img.onload = () => {
      monumentImgRef.current = img;
    };
  }, []);

  // 2.5D Isometric Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    let startTime = Date.now();

    const render = () => {
      if (!isRunning) return;
      if (villageViewMode !== 'grid') {
        animRef.current = requestAnimationFrame(render);
        return;
      }
      const elapsed = (Date.now() - startTime) / 1000;

      const width = 820;
      const height = 540;
      const originX = width / 2;
      const originY = 170;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Draw 2.5D Lush Grass Terrain & Forest Perimeter with Dynamic Weather Lighting & Hokage Monument
      drawIsoTerrain(ctx, width, height, originX, originY, 12, villageState.weatherMode || 'night', elapsed, monumentImgRef.current);

      // 2. Update Animated Hero Patrol Movement along waypoints
      const hp = heroPatrolRef.current;
      const target = hp.waypoints[hp.waypointIdx];
      const dx = target.x - hp.currentX;
      const dy = target.y - hp.currentY;
      const dist = Math.hypot(dx, dy);

      if (dist < 0.08) {
        hp.waypointIdx = (hp.waypointIdx + 1) % hp.waypoints.length;
      } else {
        hp.currentX += (dx / dist) * 0.016;
        hp.currentY += (dy / dist) * 0.016;
      }

      if (hp.speech && Date.now() > hp.speechTimer) {
        hp.speech = null;
        setHeroInteractionQuote(null);
      }

      // 3. Combined Depth Sorting (Buildings + Hero Unit)
      type RenderEntity =
        | { kind: 'building'; data: BuildingInstance; depth: number }
        | { kind: 'hero'; depth: number };

      const entities: RenderEntity[] = villageState.buildings.map((b) => ({
        kind: 'building',
        data: b,
        depth: b.x + b.y
      }));

      entities.push({
        kind: 'hero',
        depth: hp.currentX + hp.currentY
      });

      // Sort by depth (x + y ascending: back to front)
      entities.sort((a, b) => a.depth - b.depth);

      // 4. Render All Sorted Entities
      for (const ent of entities) {
        if (ent.kind === 'building') {
          const isSelected = selectedBuilding?.id === ent.data.id || isRelocatingBuildingId === ent.data.id;
          drawIsoBuilding(ctx, ent.data, originX, originY, elapsed, isSelected);
        } else {
          const activeHeroLevel = villageState.heroLevels?.[villageState.activeHeroId] || 1;
          drawIsoHeroPatrol(
            ctx,
            hp.currentX,
            hp.currentY,
            originX,
            originY,
            heroImgRef.current,
            activeHero.name,
            activeHero.color,
            elapsed,
            hp.speech,
            false,
            activeHeroLevel
          );
        }
      }

      // 5. Draw Relocation Grid Guide if moving building
      if (isRelocatingBuildingId) {
        ctx.save();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#22c55e';
        ctx.textAlign = 'center';
        ctx.fillText('Tap any green tile on the map to place building!', width / 2, height - 20);
        ctx.restore();
      }

      // 6. Draw Clash of Clans Top HUD
      drawClashHUD(ctx, width, villageState, activeHero.name);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [villageState, selectedBuilding, activeHero, isRelocatingBuildingId, villageViewMode, activeBuildTab]);

  // Unified Map Interaction (Mouse Click & Mobile Touch)
  const handleMapInteractAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (clientX - rect.left) * scaleX;
    const clickY = (clientY - rect.top) * scaleY;

    const originX = canvas.width / 2;
    const originY = 170;

    const { gridX, gridY } = fromIso(clickX, clickY, originX, originY);

    // If in Relocation Mode: Place the moving building on the clicked grid tile!
    if (isRelocatingBuildingId) {
      if (!isOwner) {
        setIsRelocatingBuildingId(null);
        return;
      }
      if (gridX < 1 || gridX > 10 || gridY < 1 || gridY > 10) return;

      // Check if tile is occupied by another building
      const isOccupied = villageState.buildings.some(
        (b) => b.id !== isRelocatingBuildingId && b.x === gridX && b.y === gridY
      );

      if (!isOccupied) {
        const updated = villageState.buildings.map((b) =>
          b.id === isRelocatingBuildingId ? { ...b, x: gridX, y: gridY } : b
        );
        onUpdateVillage({ ...villageState, buildings: updated });
        setIsRelocatingBuildingId(null);
        animeAudio.playButtonClick();
      }
      return;
    }

    // Check if clicked near the Patrolling Hero
    const hp = heroPatrolRef.current;
    const heroDist = Math.hypot(gridX - hp.currentX, gridY - hp.currentY);
    if (heroDist < 1.1) {
      const heroQuotes = [
        `"${activeHero.catchphrase}"`,
        `"Sanctuary perimeter locked down!"`,
        `"I'll defend this village with my life!"`,
        `"Guard status: 100% active!"`,
        `"${activeHero.quote}"`
      ];
      const q = heroQuotes[Math.floor(Math.random() * heroQuotes.length)];
      hp.speech = q;
      hp.speechTimer = Date.now() + 4500;
      setHeroInteractionQuote(q);
      animeAudio.speakHeroQuote(activeHero.id, q);
      return;
    }

    // Find building at clicked tile
    const clicked = villageState.buildings.find(
      (b) => Math.abs(b.x - gridX) <= 0.8 && Math.abs(b.y - gridY) <= 0.8
    );

    if (clicked) {
      setSelectedBuilding(clicked);
      if (clicked.type === 'ichiraku_ramen') {
        setIsRamenModalOpen(true);
      } else if (clicked.type === 'team7_posts') {
        setIsTeam7ModalOpen(true);
      }
      animeAudio.playButtonClick();
    } else {
      setSelectedBuilding(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleMapInteractAt(e.clientX, e.clientY);
  };

  const handleCanvasTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      handleMapInteractAt(touch.clientX, touch.clientY);
    }
  };

  // Strict Harvest Cooldown & Collector Capacity Limits
  const HARVEST_COOLDOWN_SECONDS = 45; // 45 seconds time period between harvests
  const lastHarvest = villageState.lastHarvestTime || (currentTime - 45000);
  const elapsedSeconds = Math.max(0, (currentTime - lastHarvest) / 1000);
  const cooldownRemaining = Math.max(0, Math.ceil(HARVEST_COOLDOWN_SECONDS - elapsedSeconds));

  // Calculate accumulated resources based on elapsed seconds and building rates
  let accruedBerries = 0;
  let accruedChakra = 0;
  let accruedReishi = 0;

  villageState.buildings.forEach((b) => {
    const ratePerSec = ((b.productionRate || 20) * 1.5) / 60; // Production per second
    const collectorCap = Math.round((b.productionRate || 20) * 8); // Capacity limit of uncollected loot
    const generated = Math.min(collectorCap, Math.floor(elapsedSeconds * ratePerSec));

    if (b.type === 'berry_treasury') accruedBerries += generated;
    if (b.type === 'chakra_turbine') accruedChakra += generated;
    if (b.type === 'reishi_siphon') accruedReishi += generated;
  });

  const totalAccrued = accruedBerries + accruedChakra + accruedReishi;
  const isStorageFull =
    villageState.berries >= villageState.maxStorage &&
    villageState.chakra >= villageState.maxStorage &&
    villageState.reishi >= villageState.maxStorage;

  // Collect passive resources with cooldown, collector cap, and storage limit
  const handleCollectResources = () => {
    if (cooldownRemaining > 0) {
      alert(`⏳ Collectors are still gathering! Next harvest available in ${cooldownRemaining}s.`);
      return;
    }

    if (isStorageFull) {
      alert(`⚠️ Storage Full! Your vaults are at maximum capacity (${villageState.maxStorage.toLocaleString()}). Upgrade your Town Hall HQ or spend resources before harvesting!`);
      return;
    }

    if (totalAccrued < 1) {
      alert('🌾 Collectors have not accumulated resources yet. Please wait a few moments!');
      return;
    }

    const newBerries = Math.min(villageState.maxStorage, villageState.berries + accruedBerries);
    const newChakra = Math.min(villageState.maxStorage, villageState.chakra + accruedChakra);
    const newReishi = Math.min(villageState.maxStorage, villageState.reishi + accruedReishi);

    onUpdateVillage({
      ...villageState,
      berries: newBerries,
      chakra: newChakra,
      reishi: newReishi,
      lastHarvestTime: Date.now()
    });

    animeAudio.playButtonClick();
    setHarvestToast(`+${accruedBerries} 💰  +${accruedChakra} 🌀  +${accruedReishi} 🔮`);
    setTimeout(() => setHarvestToast(null), 3500);
  };

  // Upgrade building (Capped by Town Hall HQ Level)
  const handleUpgradeBuilding = (b: BuildingInstance) => {
    const maxBuildingLevel = getMaxBuildingLevelForHQ(villageState.level);
    if (b.level >= maxBuildingLevel) {
      alert(
        `⚠️ Building Level Cap Reached!\n\nTown Hall HQ Level ${villageState.level} limits all structures to Level ${maxBuildingLevel}.\n\nUpgrade your Town Hall HQ in the "Leveling Plans" tab to unlock higher building tiers!`
      );
      return;
    }

    const cost = b.level * 150;
    if (villageState.berries < cost) {
      alert(`Not enough Berries! Upgrade requires 💰 ${cost} Berries.`);
      return;
    }

    const updatedBuildings = villageState.buildings.map((item) => {
      if (item.id === b.id) {
        return {
          ...item,
          level: item.level + 1,
          maxHp: Math.round(item.maxHp * 1.3),
          hp: Math.round(item.maxHp * 1.3),
          productionRate: item.productionRate ? Math.round(item.productionRate * 1.4) : undefined,
          attack: item.attack ? Math.round(item.attack * 1.3) : undefined
        };
      }
      return item;
    });

    const isHQUpgrade = b.type === 'command_core';
    const newHQLevel = isHQUpgrade ? b.level + 1 : villageState.level;

    // Automatically unlock all heroes whose HQ level requirement is met
    const currentUnlocked = Array.from(new Set(['naruto', ...(villageState.unlockedHeroes || [])]));
    Object.entries(HERO_UNLOCK_HQ_REQUIREMENTS).forEach(([hId, req]) => {
      if (req.hqLevel <= newHQLevel && !currentUnlocked.includes(hId)) {
        currentUnlocked.push(hId);
      }
    });

    onUpdateVillage({
      ...villageState,
      level: newHQLevel,
      berries: villageState.berries - cost,
      buildings: updatedBuildings,
      unlockedHeroes: currentUnlocked
    });

    setSelectedBuilding((prev) => (prev ? { ...prev, level: prev.level + 1 } : null));
  };

  // Upgrade Hero Function (Capped by Town Hall HQ Level)
  const handleUpgradeHero = (heroId: string) => {
    const currentHeroLevel = villageState.heroLevels?.[heroId] || 1;
    const maxHeroLevel = getMaxHeroLevelForHQ(villageState.level);

    if (currentHeroLevel >= maxHeroLevel) {
      alert(
        `⚠️ Hero Level Cap Reached!\n\nTown Hall HQ Level ${villageState.level} caps heroes at Level ${maxHeroLevel}.\n\nUpgrade your Town Hall HQ in the "Leveling Plans" tab to unlock higher hero power tiers!`
      );
      return;
    }

    const costInfo = getHeroUpgradeCost(heroId, currentHeroLevel);
    if (costInfo.resource === 'chakra' && villageState.chakra < costInfo.amount) {
      alert(`Insufficient Chakra! Requires 🌀 ${costInfo.amount} Chakra.`);
      return;
    }
    if (costInfo.resource === 'berries' && villageState.berries < costInfo.amount) {
      alert(`Insufficient Berries! Requires 💰 ${costInfo.amount} Berries.`);
      return;
    }
    if (costInfo.resource === 'reishi' && villageState.reishi < costInfo.amount) {
      alert(`Insufficient Reishi! Requires 🔮 ${costInfo.amount} Reishi.`);
      return;
    }

    const newHeroLevels = {
      ...(villageState.heroLevels || { naruto: 1, luffy: 1, ichigo: 1, asta: 1 }),
      [heroId]: currentHeroLevel + 1
    };

    onUpdateVillage({
      ...villageState,
      chakra:
        costInfo.resource === 'chakra'
          ? villageState.chakra - costInfo.amount
          : costInfo.chakraAmount
          ? villageState.chakra - costInfo.chakraAmount
          : villageState.chakra,
      berries: costInfo.resource === 'berries' ? villageState.berries - costInfo.amount : villageState.berries,
      reishi: costInfo.resource === 'reishi' ? villageState.reishi - costInfo.amount : villageState.reishi,
      heroLevels: newHeroLevels
    });
  };

  // Chapter 1 Naruto Campaign Quest Handlers
  const completedStoryQuests = villageState.completedStoryQuests || [];
  const activeNarutoQuest =
    CHAPTER_1_NARUTO_QUESTS.find((q) => !completedStoryQuests.includes(q.id)) ||
    CHAPTER_1_NARUTO_QUESTS[CHAPTER_1_NARUTO_QUESTS.length - 1];

  const handleCompleteNarutoQuest = (quest: ChapterQuest) => {
    if (completedStoryQuests.includes(quest.id)) return;

    const nextCompleted = [...completedStoryQuests, quest.id];
    let nextUnlockedHeroes = [...villageState.unlockedHeroes];
    if (quest.rewards.unlockHeroId && !nextUnlockedHeroes.includes(quest.rewards.unlockHeroId)) {
      nextUnlockedHeroes.push(quest.rewards.unlockHeroId);
    }

    onUpdateVillage({
      ...villageState,
      berries: villageState.berries + quest.rewards.berries,
      chakra: villageState.chakra + quest.rewards.chakra,
      reishi: villageState.reishi + quest.rewards.reishi,
      completedStoryQuests: nextCompleted,
      unlockedHeroes: nextUnlockedHeroes
    });
    animeAudio.playUpgradeSuccess();
  };

  const handlePainBossVictory = (rewards: { berries: number; chakra: number; reishi: number; unlockedHeroId?: string }) => {
    const nextCompleted = completedStoryQuests.includes('naruto_q25')
      ? completedStoryQuests
      : [...completedStoryQuests, 'naruto_q25'];

    const currentChapters = villageState.completedChapters || [];
    const nextChapters = currentChapters.includes('chapter_1')
      ? currentChapters
      : [...currentChapters, 'chapter_1'];

    let nextUnlockedHeroes = [...villageState.unlockedHeroes];
    if (rewards.unlockedHeroId && !nextUnlockedHeroes.includes(rewards.unlockedHeroId)) {
      nextUnlockedHeroes.push(rewards.unlockedHeroId);
    }

    onUpdateVillage({
      ...villageState,
      level: Math.max(villageState.level, 2), // Auto-unlocks Chapter 2 Town Hall level!
      currentChapter: 2, // UNLOCKS CHAPTER 2 (ONE PIECE)!
      berries: villageState.berries + rewards.berries,
      chakra: villageState.chakra + rewards.chakra,
      reishi: villageState.reishi + rewards.reishi,
      completedStoryQuests: nextCompleted,
      completedChapters: nextChapters,
      unlockedHeroes: nextUnlockedHeroes
    });
    setShowPainBossModal(false);
    animeAudio.playUpgradeSuccess();
  };

  // Troops & Raid Logistics: strictly count valid catalog troops
  const validTroopIds = useMemo(() => new Set(TROOPS_CATALOG.map((t) => t.id)), []);
  const totalTroopsCount = useMemo(() => {
    return Object.entries(villageState.trainedTroops || {}).reduce((acc, [k, v]) => {
      return validTroopIds.has(k) && typeof v === 'number' ? acc + v : acc;
    }, 0);
  }, [villageState.trainedTroops, validTroopIds]);
  const armyCampCap = getArmyCampCapForHQ(villageState.level);

  // Auto-clean any legacy troops lingering in active villageState from localStorage
  useEffect(() => {
    if (!villageState.trainedTroops) return;
    const hasLegacy = Object.keys(villageState.trainedTroops).some((k) => !validTroopIds.has(k));
    if (hasLegacy) {
      const sanitized: Record<string, number> = {};
      for (const [k, v] of Object.entries(villageState.trainedTroops)) {
        if (validTroopIds.has(k) && typeof v === 'number' && v > 0) {
          sanitized[k] = v;
        }
      }
      onUpdateVillage({
        ...villageState,
        trainedTroops: sanitized
      });
    }
  }, [villageState, onUpdateVillage, validTroopIds]);

  const handleTrainTroop = (troopId: string, count: number, cost: number, resType: 'chakra' | 'berries' | 'reishi') => {
    if (totalTroopsCount + count > armyCampCap) {
      alert(`Army Camp is full! Current capacity: ${totalTroopsCount}/${armyCampCap} units. Upgrade your Town Hall HQ to expand your army!`);
      return;
    }

    if (resType === 'chakra' && villageState.chakra < cost * count) {
      alert('Not enough Chakra!');
      return;
    }
    if (resType === 'berries' && villageState.berries < cost * count) {
      alert('Not enough Berries!');
      return;
    }
    if (resType === 'reishi' && villageState.reishi < cost * count) {
      alert('Not enough Reishi!');
      return;
    }

    const currentTroops = villageState.trainedTroops || {};
    const newTroops = {
      ...currentTroops,
      [troopId]: (currentTroops[troopId] || 0) + count
    };

    onUpdateVillage({
      ...villageState,
      chakra: resType === 'chakra' ? villageState.chakra - cost * count : villageState.chakra,
      berries: resType === 'berries' ? villageState.berries - cost * count : villageState.berries,
      reishi: resType === 'reishi' ? villageState.reishi - cost * count : villageState.reishi,
      trainedTroops: newTroops
    });
  };

  const handleTrainMaxTroop = (troopId: string, cost: number, resType: 'chakra' | 'berries' | 'reishi') => {
    const spaceRemaining = Math.max(0, armyCampCap - totalTroopsCount);
    if (spaceRemaining <= 0) {
      alert(`Army Camp is already full (${totalTroopsCount}/${armyCampCap} units)!`);
      return;
    }

    const availableRes = resType === 'chakra' ? villageState.chakra : resType === 'berries' ? villageState.berries : villageState.reishi;
    const affordableCount = Math.floor(availableRes / cost);
    const toTrain = Math.min(spaceRemaining, affordableCount);

    if (toTrain <= 0) {
      alert(`Not enough ${resType} to train any more units!`);
      return;
    }

    const currentTroops = villageState.trainedTroops || {};
    const newTroops = {
      ...currentTroops,
      [troopId]: (currentTroops[troopId] || 0) + toTrain
    };

    onUpdateVillage({
      ...villageState,
      chakra: resType === 'chakra' ? villageState.chakra - cost * toTrain : villageState.chakra,
      berries: resType === 'berries' ? villageState.berries - cost * toTrain : villageState.berries,
      reishi: resType === 'reishi' ? villageState.reishi - cost * toTrain : villageState.reishi,
      trainedTroops: newTroops
    });
    animeAudio.playButtonClick();
  };

  // Launch Real-Time Village Raid Assault
  const handleLaunchSyndicateRaid = () => {
    if (totalTroopsCount < 4) {
      alert('Train at least 4 troops before deploying on a raid!');
      return;
    }

    setIsRaiding(true);
    setTimeout(() => {
      setIsRaiding(false);
      const berriesPlunder = 650 + Math.floor(Math.random() * 450);
      const chakraPlunder = 500 + Math.floor(Math.random() * 350);
      const destructionPct = 85 + Math.floor(Math.random() * 16);
      const stars = destructionPct >= 100 ? 3 : destructionPct >= 70 ? 2 : 1;

      setRaidResult({
        stars,
        destruction: Math.min(100, destructionPct),
        berriesLooted: berriesPlunder,
        chakraLooted: chakraPlunder,
        log: [
          `⚔️ ${activeHero.name} breached the rogue perimeter with Wind Style Rasengan!`,
          `🥷 Leaf Genin squad pinned down snipers with rapid Kunai Storm.`,
          `🔥 Chunin Fireball Specialists scorched palisade barriers with Grand Fireball Jutsu!`,
          `👁️ Hyūga Gentle Fist strikers disabled defensive chakra nodes with 8 Trigrams 64 Palms!`,
          `🐸 Mount Myoboku Toad Vanguard cleaved through the enemy vault with giant iron cleavers!`,
          `🏆 100% Outpost Annihilation! The Land of Fire borders remain secure!`
        ]
      });

      onUpdateVillage({
        ...villageState,
        berries: Math.min(villageState.maxStorage, villageState.berries + berriesPlunder),
        chakra: Math.min(villageState.maxStorage, villageState.chakra + chakraPlunder),
        trainedTroops: {
          konoha_genin: Math.max(0, (villageState.trainedTroops?.konoha_genin || 0) - 3),
          fire_chunin: Math.max(0, (villageState.trainedTroops?.fire_chunin || 0) - 2),
          hyuga_striker: Math.max(0, (villageState.trainedTroops?.hyuga_striker || 0) - 1),
          toad_vanguard: Math.max(0, (villageState.trainedTroops?.toad_vanguard || 0) - 1)
        }
      });
    }, 1600);
  };

  // Upgrade Village Town Hall HQ Level
  const currentHQPlan = VILLAGE_HQ_LEVEL_PLANS[villageState.level] || VILLAGE_HQ_LEVEL_PLANS[1];
  const nextHQPlan = VILLAGE_HQ_LEVEL_PLANS[villageState.level + 1];
  const nextHQLevel = villageState.level + 1;
  const nextHeroUnlockEntry = Object.entries(HERO_UNLOCK_HQ_REQUIREMENTS).find(
    ([heroId, req]) => req.hqLevel === nextHQLevel && !villageState.unlockedHeroes.includes(heroId)
  );
  const nextHeroName = nextHeroUnlockEntry ? nextHeroUnlockEntry[1].heroName : null;

  // Apply Preset Base Layout
  const handleApplyPresetLayout = (preset: BaseLayoutPreset) => {
    const updated = preset.applyLayout(villageState.buildings);
    onUpdateVillage({
      ...villageState,
      buildings: updated
    });
    setActiveBuildTab('village');
  };

  // Add new building from shop
  const handleConstructBuilding = (type: BuildingType, cost: number, resType: 'berries' | 'chakra') => {
    if (resType === 'berries' && villageState.berries < cost) {
      alert('Not enough Berries!');
      return;
    }
    if (resType === 'chakra' && villageState.chakra < cost) {
      alert('Not enough Chakra!');
      return;
    }

    // Find first empty cell
    const occupied = new Set(villageState.buildings.map((b) => `${b.x},${b.y}`));
    let freeX = 2;
    let freeY = 2;

    for (let r = 2; r <= 8; r++) {
      for (let c = 2; c <= 8; c++) {
        if (!occupied.has(`${c},${r}`)) {
          freeX = c;
          freeY = r;
          break;
        }
      }
    }

    let bName = 'Structure';
    let bHp = 700;
    let bColor = '#3b82f6';
    let bIcon = '🏛️';
    let bAtk: number | undefined;
    let bRange: number | undefined;
    let bProd: number | undefined;
    let bRes: 'berries' | 'chakra' | 'reishi' | undefined;

    if (type === 'hero_altar') {
      bName = 'Ninja Academy (Training Ground)';
      bHp = 950;
      bColor = '#f97316';
      bIcon = '🏯';
    } else if (type === 'defense_wall') {
      bName = 'Leaf Palisade Wall';
      bHp = 850;
      bColor = '#78350f';
      bIcon = '🧱';
    } else if (type === 'chakra_turbine') {
      bName = 'Chakra Hydro-Turbine';
      bHp = 600;
      bColor = '#06b6d4';
      bIcon = '🌀';
      bProd = 15;
      bRes = 'chakra';
    } else if (type === 'berry_treasury') {
      bName = 'Konoha Berry Vault';
      bHp = 650;
      bColor = '#eab308';
      bIcon = '💰';
      bProd = 20;
      bRes = 'berries';
    } else if (type === 'paper_mortar') {
      bName = 'Paper-Bomb Mortar';
      bHp = 650;
      bColor = '#f59e0b';
      bIcon = '💥';
      bAtk = 60;
      bRange = 6.5;
    } else if (type === 'haki_cannon') {
      bName = 'Haki Rail Cannon';
      bHp = 750;
      bColor = '#ef4444';
      bIcon = '💣';
      bAtk = 50;
      bRange = 5.0;
    } else if (type === 'ichiraku_ramen') {
      bName = 'Ichiraku Ramen Stand (一楽ラーメン)';
      bHp = 900;
      bColor = '#ea580c';
      bIcon = '🍜';
      bProd = 25;
      bRes = 'chakra';
    } else if (type === 'team7_posts') {
      bName = 'Team 7 Sparring Posts (第7班・修練場)';
      bHp = 750;
      bColor = '#84cc16';
      bIcon = '🪵';
    }

    const newBuilding: BuildingInstance = {
      id: `${type}_${Date.now()}`,
      type,
      name: bName,
      level: 1,
      x: freeX,
      y: freeY,
      hp: bHp,
      maxHp: bHp,
      attack: bAtk,
      range: bRange,
      productionRate: bProd,
      resourceProduced: bRes,
      color: bColor,
      icon: bIcon
    };

    onUpdateVillage({
      ...villageState,
      berries: resType === 'berries' ? villageState.berries - cost : villageState.berries,
      chakra: resType === 'chakra' ? villageState.chakra - cost : villageState.chakra,
      buildings: [...villageState.buildings, newBuilding]
    });

    setActiveBuildTab('village');
  };

  return (
    <div className="w-full max-w-7xl px-2 sm:px-4 flex flex-col gap-3 sm:gap-4 my-2 sm:my-4 transition-all">
      {/* 2.5D Real-Time Troop Marching Raid Arena Modal (Multiplayer & Syndicate) */}
      {isArenaRaidActive && (
        <AnimeRaidArena
          villageState={villageState}
          targetFriend={selectedRaidFriend}
          onFinishRaid={(lootBerries, lootChakra, targetName, stars) => {
            const report: RaidBattleReport = {
              id: `rep_${Date.now()}`,
              timestamp: Date.now(),
              attackerName: villageState.playerName || 'Marou (Me)',
              defenderName: targetName || 'Rival Sanctuary',
              stars: stars || 0,
              destructionPct: stars === 3 ? 100 : stars === 2 ? 75 : 45,
              lootStolenBerries: lootBerries,
              lootStolenChakra: lootChakra,
              trophiesDelta: (stars || 0) > 0 ? 32 : -18,
              isDefense: false
            };

            onUpdateVillage({
              ...villageState,
              berries: Math.min(villageState.maxStorage, villageState.berries + lootBerries),
              chakra: Math.min(villageState.maxStorage, villageState.chakra + lootChakra),
              battleReports: [report, ...(villageState.battleReports || [])].slice(0, 15)
            });

            // Cross-user raid persistence: deduct loot and log defense on target's profile
            if (selectedRaidFriend) {
              recordCrossUserRaid(
                selectedRaidFriend.id,
                villageState.playerName || currentUser?.username || 'Attacking Challenger',
                stars || 0,
                stars === 3 ? 100 : stars === 2 ? 75 : 45,
                lootBerries,
                lootChakra
              );
            }

            setIsArenaRaidActive(false);
            setSelectedRaidFriend(null);
          }}
          onClose={() => {
            setIsArenaRaidActive(false);
            setSelectedRaidFriend(null);
          }}
        />
      )}

      {/* Syndicate Counter-Raid Base Defense Simulator Modal */}
      {isDefenseActive && (
        <BaseDefenseSimulator
          villageState={villageState}
          onFinishDefense={(rewardBerries) => {
            if (rewardBerries > 0) {
              onUpdateVillage({
                ...villageState,
                berries: Math.min(villageState.maxStorage, villageState.berries + rewardBerries),
                chakra: Math.min(villageState.maxStorage, villageState.chakra + 300)
              });
            }
            setIsDefenseActive(false);
          }}
          onClose={() => setIsDefenseActive(false)}
        />
      )}

      {/* 360° Interactive Hero Dojo & Turntable Showcase Modal */}
      {show360Showcase && (
        <Hero360Showcase
          initialHeroId={showcaseHeroId}
          villageState={villageState}
          onUpdateVillage={onUpdateVillage}
          onClose={() => setShow360Showcase(false)}
        />
      )}

      {/* Voice Shout Japanese Kanji Banner Overlay */}
      {voiceShoutBanner && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in duration-300">
          <div className="px-8 py-3.5 rounded-3xl bg-black/90 border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.8)] text-center backdrop-blur-md">
            <div className="text-3xl font-black text-amber-300 tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.9)]">
              {voiceShoutBanner.kanji}
            </div>
            <div className="text-xs text-white font-mono uppercase tracking-wider mt-0.5">
              {voiceShoutBanner.romaji} &bull; &ldquo;{voiceShoutBanner.trans}&rdquo;
            </div>
          </div>
        </div>
      )}

      {/* Harvest Accrual Floating Toast */}
      {harvestToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-2.5 rounded-2xl bg-emerald-950/95 border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.8)] text-center backdrop-blur-md">
            <div className="text-xs font-black uppercase text-emerald-300 tracking-wider">
              🌾 Harvest Successful!
            </div>
            <div className="text-sm font-black text-white mt-0.5">
              {harvestToast}
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:p-4 rounded-3xl bg-[#0b1226]/95 border border-[#1e2a4a] shadow-xl backdrop-blur-md">
        {/* Left: Active Hero Avatar & Player Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative">
            <img
              src={activeHero.image}
              alt={activeHero.name}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover object-top border-2 shadow-lg"
              style={{ borderColor: activeHero.color }}
            />
            <span className="absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full shadow">
              Lv {villageState.heroLevels?.[villageState.activeHeroId] || 1}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-white">
                {currentUser?.username.split(' ')[0] || villageState.playerName || 'Sanctuary'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                HQ {villageState.level}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span className="text-amber-300 font-semibold">{activeHero.name}</span>
              {currentUser ? (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="text-cyan-400 hover:underline ml-1 cursor-pointer font-bold"
                >
                  (Switch)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="text-yellow-400 hover:underline ml-1 cursor-pointer font-bold animate-pulse"
                >
                  (Log In)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Center: Chapter 1 Naruto Campaign & Guided Objective Pills */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowNarutoStoryModal(true);
              animeAudio.playButtonClick();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-600/25 via-amber-600/25 to-red-600/25 border border-orange-500/50 hover:brightness-125 transition cursor-pointer text-xs shadow-[0_0_20px_rgba(249,115,22,0.3)] animate-pulse"
            title="Open Chapter 1: Naruto Story Campaign (25 Quests)"
          >
            <span className="text-base">🍥</span>
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-orange-300 font-mono font-bold leading-none">
                CH. 1: NARUTO ({completedStoryQuests.length}/25)
              </span>
              <span className="text-[11px] font-black text-white leading-tight line-clamp-1 max-w-[160px]">
                {activeNarutoQuest.title}
              </span>
            </div>
            <span className="text-[9px] text-slate-950 font-black bg-gradient-to-r from-amber-400 to-yellow-300 px-2 py-0.5 rounded-full shadow">
              Quests &rarr;
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowPrologueModal(true);
              animeAudio.playButtonClick();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/40 hover:bg-blue-500/25 transition cursor-pointer text-xs text-blue-300"
            title="How the Game Works & Story Lore"
          >
            <BookOpen size={13} />
            <span className="font-bold">Story &amp; Guide</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm("Start All-New Chapter 1 Fresh? This resets your village, quests to 0/25, and lets you experience the campaign from scratch!")) {
                const fresh = resetToChapterOneFreshStart(currentUser?.id || 'user_naruto');
                onUpdateVillage(fresh);
                animeAudio.playUpgradeSuccess();
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-400/40 hover:bg-rose-500/25 transition cursor-pointer text-xs text-rose-300"
            title="Wipe and start fresh from Chapter 1 (Konoha)"
          >
            <RotateCcw size={12} />
            <span className="font-bold">Reset Ch. 1</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/40 text-xs">
            <span className="text-orange-400">🏛️</span>
            <span className="text-orange-200 font-bold text-[11px]">
              Ch. {villageState.currentChapter || 1}: Leaf HQ Lv {villageState.level}
            </span>
          </div>
        </div>

        {/* Right: Resources & Quick Harvest */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Resources Pill */}
          <div className="flex items-center gap-2 sm:gap-3 bg-black/60 px-3 py-1.5 rounded-2xl border border-white/10 text-xs font-bold">
            <span className="text-amber-300 flex items-center gap-1" title="Berries">
              💰 <span>{villageState.berries.toLocaleString()}</span>
            </span>
            <span className="text-cyan-300 flex items-center gap-1" title="Chakra">
              🌀 <span>{villageState.chakra.toLocaleString()}</span>
            </span>
            <span className="text-purple-300 flex items-center gap-1" title="Reishi">
              🔮 <span>{villageState.reishi.toLocaleString()}</span>
            </span>
          </div>

          {/* Quick Harvest Button with Cooldown & Capacity Limiter */}
          <button
            type="button"
            onClick={handleCollectResources}
            disabled={cooldownRemaining > 0 || isStorageFull || totalAccrued < 1}
            className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
              isStorageFull
                ? 'bg-rose-950/70 border border-rose-500/50 text-rose-300 cursor-not-allowed opacity-85'
                : cooldownRemaining > 0
                ? 'bg-slate-800/90 border border-slate-700 text-slate-400 cursor-not-allowed'
                : totalAccrued > 0
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title={
              isStorageFull
                ? `Storage Full (${villageState.maxStorage.toLocaleString()})! Upgrade HQ or spend resources.`
                : cooldownRemaining > 0
                ? `Gathering resources... Next harvest ready in ${cooldownRemaining}s.`
                : totalAccrued > 0
                ? `Ready to harvest: +${accruedBerries} Berries, +${accruedChakra} Chakra, +${accruedReishi} Reishi`
                : 'Gathering resources...'
            }
          >
            <span>🌾</span>
            <span>
              {isStorageFull
                ? 'Full'
                : cooldownRemaining > 0
                ? `⏳ ${cooldownRemaining}s`
                : totalAccrued > 0
                ? `Harvest (+${totalAccrued})`
                : 'Gathering...'}
            </span>
          </button>
        </div>
      </div>

      {/* 2. PRIMARY VIEW MODE SWITCHER & ENVIRONMENT BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1 bg-[#080d1e] p-1 rounded-2xl border border-[#1e2f54]">
          <button
            type="button"
            onClick={() => {
              setActiveBuildTab('village');
              setVillageViewMode('orbit_hub');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeBuildTab === 'village' && villageViewMode === 'orbit_hub'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown size={14} className="text-yellow-400" />
            <span>👑 Command Hub</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveBuildTab('village');
              setVillageViewMode('grid');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeBuildTab === 'village' && villageViewMode === 'grid'
                ? 'bg-blue-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>🏰 Base Grid & Build</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowcaseHeroId(activeHero.id);
              setShow360Showcase(true);
              animeAudio.playButtonClick();
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-[1.02]"
            title="Inspect all heroes in interactive 360 degree turntable with multiple animated poses"
          >
            <Compass size={14} className="text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>🌀 360° Hero Dojo</span>
          </button>
        </div>

        {/* Dynamic Weather & Time Atmosphere Switcher */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-2xl border border-white/10 text-xs">
          <button
            type="button"
            title="Daytime Sunny"
            onClick={() => onUpdateVillage({ ...villageState, weatherMode: 'day' })}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              (villageState.weatherMode || 'night') === 'day' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun size={14} />
          </button>
          <button
            type="button"
            title="Golden Twilight Sunset"
            onClick={() => onUpdateVillage({ ...villageState, weatherMode: 'twilight' })}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              villageState.weatherMode === 'twilight' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sunset size={14} />
          </button>
          <button
            type="button"
            title="Neon Nighttime"
            onClick={() => onUpdateVillage({ ...villageState, weatherMode: 'night' })}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              villageState.weatherMode === 'night' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon size={14} />
          </button>
          <button
            type="button"
            title="Shibuya Rain Thunderstorm"
            onClick={() => onUpdateVillage({ ...villageState, weatherMode: 'rain' })}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              villageState.weatherMode === 'rain' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudRain size={14} />
          </button>
          <button
            type="button"
            title="Hero Japanese Voice Shout"
            onClick={() => {
              const shout = animeAudio.playHeroShout(activeHero.id);
              if (shout) {
                setVoiceShoutBanner({
                  kanji: shout.kanji,
                  romaji: shout.shoutText,
                  trans: shout.subTitle
                });
                setTimeout(() => setVoiceShoutBanner(null), 2500);
              }
            }}
            className="p-1.5 rounded-xl text-amber-400 hover:text-amber-300 transition cursor-pointer ml-1"
          >
            <Volume2 size={14} />
          </button>
        </div>
      </div>

      {/* SCOUTING SANCTUARY READ-ONLY BANNER */}
      {!isOwner && viewingTargetUser && (
        <div className="w-full bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 shrink-0">
              <Eye size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-950 border border-amber-600">
                  SCOUTING SANCTUARY &bull; READ ONLY
                </span>
                <span className="text-sm font-black text-white">{viewingTargetUser.name}</span>
                <span className="text-xs font-mono text-cyan-300">[{viewingTargetUser.tag}]</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                🔒 You are inspecting another player&apos;s base. Only <strong>{viewingTargetUser.name}</strong> can build, move, or upgrade here.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedRaidFriend(viewingTargetUser);
                setIsArenaRaidActive(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-black text-xs shadow-lg cursor-pointer flex items-center gap-1.5 transition"
            >
              <Sword size={14} />
              <span>⚔️ Raid This Base!</span>
            </button>
            {onReturnToMyBase && (
              <button
                type="button"
                onClick={onReturnToMyBase}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/20 cursor-pointer flex items-center gap-1.5 transition"
              >
                <Home size={14} />
                <span>🏠 Return to My Base</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. MAIN INTERACTIVE CONTENT: ISOMETRIC VILLAGE OR SANCTUARY ORBITAL HUB */}
      {activeBuildTab === 'village' && (
        <>
          {/* PERSISTENT LIVING ANIME MISSION BANNER */}
          <div className="w-full bg-gradient-to-r from-[#0d1733] via-[#091024] to-[#0d1733] border-2 border-orange-500/40 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <span className="text-3xl sm:text-4xl p-2 rounded-2xl bg-orange-500/20 border border-orange-400/40 shrink-0">
                🍥
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-300 px-2 py-0.5 rounded-full bg-orange-950 border border-orange-500/50">
                    CHAPTER 1 &bull; QUEST {activeNarutoQuest.questNumber} OF 25
                  </span>
                  <span className="text-xs font-mono text-cyan-300">
                    [{activeNarutoQuest.japaneseKanji}]
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white mt-1">
                  {activeNarutoQuest.title}
                </h3>
                {/* Active Tasks Checklist with Live Counts */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-xs text-slate-300">
                  {activeNarutoQuest.tasks.map((task) => {
                    const evalRes = evaluateQuestTaskProgress(task, villageState);
                    return (
                      <span
                        key={task.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-mono ${
                          evalRes.isMet
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                            : 'bg-black/50 border-white/10 text-slate-300'
                        }`}
                      >
                        <span>{evalRes.isMet ? '✅' : '⏳'}</span>
                        <span className="text-white font-medium">{task.description}:</span>
                        <strong className={evalRes.isMet ? 'text-emerald-400' : 'text-amber-400'}>
                          {evalRes.current}/{evalRes.target}
                        </strong>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowNarutoStoryModal(true);
                  animeAudio.playButtonClick();
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>📜 View Quest &amp; Dialogue</span>
              </button>
            </div>
          </div>

          <div className={villageViewMode === 'orbit_hub' ? 'block' : 'hidden'}>
            <SanctuaryOrbitalHub
              villageState={villageState}
              onUpdateVillage={onUpdateVillage}
              onLaunch1v1={onLaunchBattle}
              onLaunchTrials={(_floor) => setIsArenaRaidActive(true)}
              onSwitchToVillageGrid={() => setVillageViewMode('grid')}
              onOpenMultiplayer={() => setActiveBuildTab('multiplayer')}
            />
          </div>

          <div className={villageViewMode === 'grid' ? 'flex flex-col gap-3 w-full' : 'hidden'}>
            {/* Real 2.5D Isometric Canvas (Widescreen Full Width) */}
            <div className="w-full rounded-3xl overflow-hidden border-2 border-[#1e3a5f] shadow-2xl relative bg-[#091522]">
              {/* Authentic Anime Hokage Monument Backdrop from Official Artwork */}
              <div
                className="absolute top-0 left-0 right-0 h-60 bg-cover bg-top pointer-events-none opacity-90 transition-opacity duration-500"
                style={{ backgroundImage: `url('/anime-heroes/konoha-hokage-monument-hd.jpg')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#091522]" />
              </div>

              <canvas
                ref={canvasRef}
                width={820}
                height={540}
                onClick={handleCanvasClick}
                onTouchEnd={handleCanvasTouch}
                className="w-full h-auto block cursor-crosshair select-none touch-manipulation max-h-[580px] object-cover relative z-0"
              />

              {/* In-Canvas Hero Guard Indicator & 360 Dojo Pill */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 z-10">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/75 border border-emerald-500/50 backdrop-blur-md text-[11px] text-emerald-300 font-bold pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{activeHero.name} on Guard Patrol</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowcaseHeroId(activeHero.id);
                    setShow360Showcase(true);
                    animeAudio.playButtonClick();
                  }}
                  className="px-3 py-1 rounded-full bg-cyan-600/80 hover:bg-cyan-500 text-white border border-cyan-400/50 backdrop-blur-md text-[11px] font-bold cursor-pointer shadow flex items-center gap-1 transition"
                  title="Inspect hero in 360° turntable with animated poses"
                >
                  <Compass size={12} />
                  <span>360° Dojo</span>
                </button>
              </div>

              {/* Relocation Mode Banner */}
              {isRelocatingBuildingId && (
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-lg animate-pulse">
                  <Move size={14} />
                  <span>RELOCATING: Tap any green tile</span>
                  <button
                    type="button"
                    onClick={() => setIsRelocatingBuildingId(null)}
                    className="ml-1 text-red-950 underline hover:text-red-800 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Bottom Tip */}
              <div className="absolute bottom-3 left-3 sm:left-4 text-[11px] text-slate-300 bg-black/70 px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none border border-white/10 hidden sm:block">
                💡 Tap any building to inspect/upgrade/move &bull; Tap {activeHero.name.split(' ')[0]} to interact
              </div>
            </div>

            {/* Bottom Floating Inspector Drawer for Selected Building */}
            {selectedBuilding ? (
              <div className="w-full bg-[#0b1226]/95 border-2 border-amber-500/60 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <span className="text-4xl p-2.5 rounded-2xl bg-black/50 border border-white/10 shrink-0">
                    {selectedBuilding.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-white">{selectedBuilding.name}</h3>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Level {selectedBuilding.level}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                      <span>HP: <strong className="text-white">{selectedBuilding.hp} / {selectedBuilding.maxHp}</strong></span>
                      {selectedBuilding.attack && (
                        <span className="text-red-400 font-bold">⚔️ {selectedBuilding.attack} ATK</span>
                      )}
                      {selectedBuilding.productionRate && (
                        <span className="text-emerald-400 font-bold">+{selectedBuilding.productionRate}/hr</span>
                      )}
                      <span className="text-slate-400 font-mono">({selectedBuilding.x}, {selectedBuilding.y})</span>
                    </div>
                  </div>
                </div>

                {/* Owner Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  {selectedBuilding.type === 'ichiraku_ramen' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsRamenModalOpen(true);
                        animeAudio.playButtonClick();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer animate-pulse"
                    >
                      <span>🍜</span>
                      <span>Eat Ramen Feast</span>
                    </button>
                  )}

                  {selectedBuilding.type === 'team7_posts' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsTeam7ModalOpen(true);
                        animeAudio.playButtonClick();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer animate-pulse"
                    >
                      <span>🔔</span>
                      <span>Spar with Kakashi</span>
                    </button>
                  )}

                  {isOwner ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpgradeBuilding(selectedBuilding)}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <ArrowUpCircle size={15} />
                        <span>Upgrade (💰 {selectedBuilding.level * 150})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsRelocatingBuildingId(selectedBuilding.id)}
                        className="px-3.5 py-2.5 rounded-xl bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Move size={14} />
                        <span>Move</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-amber-300 font-bold px-3 py-1.5 rounded-xl bg-amber-950/70 border border-amber-500/50">
                      🔒 Protected Structure
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedBuilding(null)}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-white/10 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Quick Building Bar when no building selected */
              <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#081126]/80 border border-[#1e2f54] text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-amber-400">🛡️</span>
                  <span>Defenses: <strong>{villageState.buildings.length}</strong> structures active</span>
                  <span className="text-slate-500">&bull;</span>
                  <span>Patrol: <strong className="text-emerald-300">{activeHero.name}</strong></span>
                </div>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setActiveBuildTab('shop')}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <span>🔨 Construct Defense</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* 4. CUSTOM BASE SETUP TAB */}
      {activeBuildTab === 'layouts' && (
        <div className="flex flex-col gap-4 bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#182442] pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Layout size={18} className="text-indigo-400" />
                <span>Custom Base Layout Blueprints</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rearrange your village into optimized tactical battle formations designed by the anime heroes!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveBuildTab('village')}
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-[#1e293b]"
            >
              Return to Map
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BASE_LAYOUT_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="p-4 rounded-2xl bg-[#0e172f] border border-[#1e3a6a] flex flex-col justify-between hover:border-indigo-400 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{preset.icon}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      {preset.tag}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{preset.name}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{preset.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyPresetLayout(preset)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <CheckCircle size={14} />
                  <span>Apply This Layout</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. LEVELING PLANS & ROADMAP TAB */}
      {activeBuildTab === 'roadmap' && (
        <div className="flex flex-col gap-4 bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#182442] pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Crown size={18} className="text-amber-400" />
                <span>Sanctuary Town Hall Leveling Plans &amp; Progression</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upgrading your Town Hall HQ unlocks new building types, expands village capacity, and permanently boosts hero firepower.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveBuildTab('village')}
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-[#1e293b]"
            >
              Return to Map
            </button>
          </div>

          {/* Current Level Status vs Next Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Level Card */}
            <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/40">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                CURRENT BASE TIER
              </span>
              <h4 className="text-lg font-black text-white mt-1">
                HQ Level {villageState.level} &bull; {currentHQPlan.title}
              </h4>
              <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Resource Storage:</span>
                  <span className="font-bold text-white">{currentHQPlan.maxStorage.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Building Cap:</span>
                  <span className="font-bold text-white">{currentHQPlan.maxBuildings} Structures</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hero Buff:</span>
                  <span className="font-bold text-emerald-300">{currentHQPlan.heroBuffBonus}</span>
                </div>
              </div>
            </div>

            {/* Next Level Card */}
            {nextHQPlan ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1a1033] to-[#0d091e] border border-amber-500/40 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                    NEXT LEVEL UNLOCKS
                  </span>
                  <h4 className="text-lg font-black text-white mt-1">
                    HQ Level {nextHQPlan.level} &bull; {nextHQPlan.title}
                  </h4>
                  <div className="mt-2 text-xs text-amber-200">
                    <strong>New Unlocks:</strong> {nextHQPlan.unlockedFeatures.join(', ')}
                  </div>
                  <div className="mt-1 text-xs text-slate-300">
                    <strong>Hero Buff:</strong> {nextHQPlan.heroBuffBonus}
                  </div>
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-black/60 border border-amber-500/40 text-center flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold">
                    <Lock size={14} className="text-amber-400" />
                    <span>LOCKED: Defeat Chapter {villageState.level} Final Boss to Advance!</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    HQ level is strictly tied to your anime story campaign. Defeat all 25 Chapter {villageState.level} Quests and vanquish the Final Boss to unlock Chapter {villageState.level + 1} ({nextHQPlan.title})!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNarutoStoryModal(true);
                      animeAudio.playButtonClick();
                    }}
                    className="mt-1 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📜 Open Chapter {villageState.level} Story Quests ({completedStoryQuests.length}/25)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/40 flex items-center justify-center text-center">
                <div>
                  <Award size={36} className="text-purple-400 mx-auto mb-2" />
                  <h4 className="text-base font-black text-white">MAX HQ LEVEL REACHED!</h4>
                  <p className="text-xs text-slate-400 mt-1">Your Sanctuary is at the apex celestial tier!</p>
                </div>
              </div>
            )}
          </div>

          {/* Leveling Progression Roadmap Table (Clash of Clans Town Hall Limit Chart) */}
          <div className="overflow-x-auto rounded-2xl border border-[#1e2f54]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0e1730] text-[11px] text-slate-400 uppercase font-mono">
                <tr>
                  <th className="p-3">HQ Level</th>
                  <th className="p-3">Title</th>
                  <th className="p-3 text-amber-300">Max Hero Lv</th>
                  <th className="p-3 text-cyan-300">Max Structure Lv</th>
                  <th className="p-3 text-red-300">Army Camp Space</th>
                  <th className="p-3">Storage Cap</th>
                  <th className="p-3">Unlocked Features</th>
                  <th className="p-3">Hero Buff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182442]">
                {Object.values(VILLAGE_HQ_LEVEL_PLANS).map((plan) => {
                  const isCurrent = plan.level === villageState.level;
                  return (
                    <tr key={plan.level} className={isCurrent ? 'bg-blue-950/40 font-bold text-white' : ''}>
                      <td className="p-3 font-mono text-cyan-400">LVL {plan.level}</td>
                      <td className="p-3 font-semibold">{plan.title}</td>
                      <td className="p-3 text-amber-400 font-bold">Lv {plan.maxHeroLevel}</td>
                      <td className="p-3 text-cyan-400 font-bold">Lv {plan.maxBuildingLevel}</td>
                      <td className="p-3 text-red-400 font-bold">{plan.armyCampCapacity} Units</td>
                      <td className="p-3">{plan.maxStorage.toLocaleString()}</td>
                      <td className="p-3 text-[11px] text-slate-300">{plan.unlockedFeatures.join(', ')}</td>
                      <td className="p-3 text-[11px] text-emerald-300">{plan.heroBuffBonus}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. DEFENSE & VILLAGE BUILD SHOP TAB */}
      {activeBuildTab === 'shop' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 rounded-3xl bg-[#0b1226]/90 border border-[#1e2a4a]">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>🔨</span>
                <span>Konohagakure Building Shop</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Construct training academies, defenses, resource collectors, and fortified walls to expand your village and complete chapter quests slow &amp; steady.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveBuildTab('village')}
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-[#1e293b]"
            >
              Return to Map
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. NINJA ACADEMY (TRAINING GROUND) - QUEST 1 REQUIREMENT */}
            <div className="bg-[#0b1226]/90 border border-orange-500/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
                QUEST 1 GOAL
              </span>
              <div>
                <div className="text-3xl mb-2">🏯</div>
                <h4 className="text-sm font-bold text-white">Ninja Academy (Training Ground)</h4>
                <p className="text-xs text-slate-400 mt-1">Konoha shinobi academy where young genin train basic jutsu and physical combat.</p>
                <div className="text-xs text-orange-400 font-semibold mt-2">🥋 Shinobi Hub &bull; 950 HP</div>
              </div>
              <button
                type="button"
                onClick={() => handleConstructBuilding('hero_altar', 120, 'berries')}
                className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Construct (💰 120 Berries)
              </button>
            </div>

            {/* 2. LEAF PALISADE WALL - QUEST 2 REQUIREMENT */}
            <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-2">🧱</div>
                <h4 className="text-sm font-bold text-white">Leaf Palisade Wall</h4>
                <p className="text-xs text-slate-400 mt-1">Reinforced wooden perimeter barrier protecting Konoha against rogue ninjas.</p>
                <div className="text-xs text-slate-300 font-semibold mt-2">🛡️ 850 HP Absorption</div>
              </div>
              <button
                type="button"
                onClick={() => handleConstructBuilding('defense_wall', 40, 'berries')}
                className="mt-4 w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs cursor-pointer"
              >
                Construct (💰 40 Berries)
              </button>
            </div>

            {/* 3. CHAKRA HYDRO-TURBINE */}
            <div className="bg-[#0b1226]/90 border border-cyan-500/30 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-2">🌀</div>
                <h4 className="text-sm font-bold text-white">Chakra Hydro-Turbine</h4>
                <p className="text-xs text-slate-400 mt-1">Harvests elemental river flow to produce pure blue chakra for troops and jutsu.</p>
                <div className="text-xs text-cyan-400 font-semibold mt-2">⚡ +15 Chakra / min &bull; 600 HP</div>
              </div>
              <button
                type="button"
                onClick={() => handleConstructBuilding('chakra_turbine', 100, 'berries')}
                className="mt-4 w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer"
              >
                Construct (💰 100 Berries)
              </button>
            </div>

            {/* 4. KONOHA BERRY VAULT */}
            <div className="bg-[#0b1226]/90 border border-amber-500/30 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-2">💰</div>
                <h4 className="text-sm font-bold text-white">Konoha Berry Vault</h4>
                <p className="text-xs text-slate-400 mt-1">Secure underground treasury holding mission bounty ryo and commerce taxes.</p>
                <div className="text-xs text-amber-400 font-semibold mt-2">🪙 +20 Berries / min &bull; 650 HP</div>
              </div>
              <button
                type="button"
                onClick={() => handleConstructBuilding('berry_treasury', 80, 'chakra')}
                className="mt-4 w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer"
              >
                Construct (🌀 80 Chakra)
              </button>
            </div>

            {/* 5. PAPER-BOMB MORTAR */}
            <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-2">💥</div>
                <h4 className="text-sm font-bold text-white">Paper-Bomb Mortar</h4>
                <p className="text-xs text-slate-400 mt-1">Konoha AOE explosive tag launcher for repelling enemy swarms.</p>
                <div className="text-xs text-amber-400 font-semibold mt-2">💥 60 AOE DMG &bull; 650 HP</div>
              </div>
              <button
                type="button"
                onClick={() => handleConstructBuilding('paper_mortar', 180, 'chakra')}
                className="mt-4 w-full py-2.5 rounded-xl bg-orange-700 hover:bg-orange-600 text-white font-bold text-xs cursor-pointer"
              >
                Construct (🌀 180 Chakra)
              </button>
            </div>

            {/* 6. HAKI RAIL CANNON */}
            <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-2">💣</div>
                <h4 className="text-sm font-bold text-white">Haki Rail Cannon</h4>
                <p className="text-xs text-slate-400 mt-1">Heavy single-target defense turret infused with Armament Haki.</p>
                <div className="text-xs text-red-400 font-semibold mt-2">⚔️ 50 Attack DMG &bull; 750 HP</div>
              </div>
              <button
                type="button"
                onClick={() => handleConstructBuilding('haki_cannon', 250, 'berries')}
                className="mt-4 w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
              >
                Construct (💰 250 Berries)
              </button>
            </div>

            {/* 7. ICHIRAKU RAMEN STAND - CANONICAL KONOHA LANDMARK */}
            <div className="bg-[#0b1226]/90 border border-orange-500/50 rounded-3xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
                KONOHA ICON
              </span>
              <div>
                <div className="text-3xl mb-2">🍜</div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Ichiraku Ramen Stand</span>
                  <span className="text-[10px] text-amber-400 font-normal">一楽ラーメン</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">Old Man Teuchi &amp; Ayame&apos;s legendary noodle shop. Feasts restore Chakra, grants Hero EXP and boosts troop morale!</p>
                <div className="text-xs text-orange-400 font-semibold mt-2">🍥 +25 Chakra / min &bull; 900 HP</div>
              </div>
              <button
                type="button"
                onClick={() => handleConstructBuilding('ichiraku_ramen', 140, 'berries')}
                className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Construct (💰 140 Berries)
              </button>
            </div>

            {/* 8. TEAM 7 SPARRING POSTS - BELL TEST LANDMARK */}
            <div className="bg-[#0b1226]/90 border border-emerald-500/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                TEAM 7 DOJO
              </span>
              <div>
                <div className="text-3xl mb-2">🪵</div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Team 7 Sparring Posts</span>
                  <span className="text-[10px] text-emerald-400 font-normal">第7班・修練場</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">The three wooden training logs with Kakashi&apos;s bells. Practice shuriken targeting and bell test reflex drills!</p>
                <div className="text-xs text-emerald-400 font-semibold mt-2">🔔 Shinobi Training Post &bull; 750 HP</div>
              </div>
              <button
                type="button"
                onClick={() => handleConstructBuilding('team7_posts', 90, 'berries')}
                className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Construct (💰 90 Berries)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. HERO ROSTER & LEVELING TAB */}
      {activeBuildTab === 'heroes' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-[#0b1226]/90 border border-[#1e2a4a]">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Crown size={18} className="text-amber-400" />
                <span>Hero Levels, Upgrades &amp; Guardians</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Level up anime heroes with resources. Hero level cap is bound by Town Hall HQ Level {villageState.level} (Max Hero Lv {getMaxHeroLevelForHQ(villageState.level)}).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowcaseHeroId(activeHero.id);
                  setShow360Showcase(true);
                  animeAudio.playButtonClick();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer transition"
              >
                <Compass size={14} className="text-cyan-200" />
                <span>🌀 360° Dojo &amp; Poses</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveBuildTab('village')}
                className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-[#1e293b]"
              >
                Return to Map
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(HEROES_CATALOG).map((hero) => {
              const heroLevel = villageState.heroLevels?.[hero.id] || 1;
              const maxHeroLevel = getMaxHeroLevelForHQ(villageState.level);
              const stats = getHeroStatsForLevel(hero, heroLevel);
              const nextStats = getHeroStatsForLevel(hero, heroLevel + 1);
              const costInfo = getHeroUpgradeCost(hero.id, heroLevel);
              const isMaxedForHQ = heroLevel >= maxHeroLevel;
              const reqHqLevel = HERO_UNLOCK_HQ_REQUIREMENTS[hero.id]?.hqLevel || 1;
              const isUnlocked =
                hero.id === 'naruto' ||
                villageState.level >= reqHqLevel ||
                Boolean(villageState.unlockedHeroes && villageState.unlockedHeroes.includes(hero.id));
              const isActive = villageState.activeHeroId === hero.id;

              return (
                <div
                  key={hero.id}
                  className={`p-3.5 rounded-3xl border flex flex-col justify-between transition overflow-hidden ${
                    isActive
                      ? 'bg-[#152347] border-amber-400 shadow-xl ring-2 ring-amber-400/30'
                      : 'bg-[#0b1226]/90 border-[#1e2a4a]'
                  }`}
                >
                  <div>
                    <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden mb-2.5 border border-white/10 shadow-md bg-gradient-to-b from-[#131f3d] via-[#0b1226] to-[#060a16] flex items-center justify-center p-1.5">
                      <img
                        src={hero.image}
                        alt={hero.name}
                        className="w-full h-full object-contain object-top hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-md">
                          LVL {heroLevel} / {maxHeroLevel}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/70 text-white font-mono border border-white/20">
                          HP {stats.hp}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{hero.name}</h4>
                      <span className="text-xs text-red-400 font-bold">⚔️ {stats.attack} ATK</span>
                    </div>
                    <p className="text-[11px] text-amber-300 font-medium">{hero.title}</p>

                    {/* Iconic Catchphrase Banner with Audio Listen Button */}
                    <div className="my-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 italic flex items-center justify-between gap-1.5 shadow-sm">
                      <span className="line-clamp-2">&ldquo;{hero.catchphrase}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() => animeAudio.speakHeroQuote(hero.id, hero.catchphrase)}
                        className="p-1 rounded-lg bg-amber-500/25 hover:bg-amber-500/40 text-amber-300 transition cursor-pointer shrink-0"
                        title="Listen to character catchphrase voice line"
                      >
                        <Volume2 size={13} className="text-amber-400" />
                      </button>
                    </div>

                    {/* Level Progress Bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full my-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (heroLevel / maxHeroLevel) * 100)}%` }}
                      />
                    </div>

                    <div className="text-[10px] text-slate-400 space-y-0.5 bg-[#080d1e] p-2 rounded-xl border border-white/5">
                      <div><strong>Skill:</strong> {hero.skillName}</div>
                      <div><strong>Ultimate:</strong> {hero.ultimateName}</div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {/* Hero Upgrade Button */}
                    {!isMaxedForHQ ? (
                      <button
                        type="button"
                        onClick={() => handleUpgradeHero(hero.id)}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <ArrowUpCircle size={14} />
                        <span>Level Up to {heroLevel + 1} ({costInfo.label})</span>
                      </button>
                    ) : (
                      <div className="py-1.5 px-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold text-center">
                        🔒 Max Lv {maxHeroLevel} for HQ {villageState.level} (Upgrade HQ)
                      </div>
                    )}

                    {/* 360° Dojo View & Poses Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowcaseHeroId(hero.id);
                        setShow360Showcase(true);
                        animeAudio.playButtonClick();
                      }}
                      className="w-full py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/25 to-blue-600/25 hover:from-cyan-600/40 hover:to-blue-600/40 text-cyan-300 font-bold text-xs border border-cyan-500/30 flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      <Compass size={13} className="text-cyan-400" />
                      <span>360° View &amp; Poses</span>
                    </button>

                    {/* Active Guard Status */}
                    {isActive ? (
                      <div className="py-1.5 text-center text-xs font-bold text-amber-400 bg-amber-400/10 rounded-xl border border-amber-400/30">
                        ★ Patrolling Guard Defender ★
                      </div>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => {
                          const allUnlocked = Array.from(new Set([...(villageState.unlockedHeroes || ['naruto']), hero.id, 'naruto']));
                          onUpdateVillage({ ...villageState, activeHeroId: hero.id, unlockedHeroes: allUnlocked });
                        }}
                        className="w-full py-1.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs transition cursor-pointer"
                      >
                        Assign as Patrol Guard
                      </button>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-black/60 border border-slate-700 text-center flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-amber-400 flex items-center justify-center gap-1">
                          <Lock size={12} />
                          <span>Requires Town Hall HQ Lv {HERO_UNLOCK_HQ_REQUIREMENTS[hero.id]?.hqLevel || 1}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveBuildTab('roadmap')}
                          className="w-full py-1 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-[10px] font-bold cursor-pointer transition shadow"
                        >
                          Upgrade HQ to Unlock
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. TROOPS & RAID SIMULATOR TAB */}
      {activeBuildTab === 'attack' && (
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-[#0b1226]/90 border border-[#1e2a4a]">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sword size={18} className="text-cyan-400" />
                <span>Leaf Shinobi Barracks &amp; Hokage Mission Desk</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Train Leaf Village shinobi squads in your barracks and deploy on official D-to-S rank missions for the Hokage to secure essential supplies!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">ARMY HOUSING SPACE</span>
                <span className="text-sm font-black text-amber-300">
                  {totalTroopsCount} / {armyCampCap} Units
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveBuildTab('village')}
                className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-[#1e293b]"
              >
                Return to Map
              </button>
            </div>
          </div>

          {/* Troop Training Barracks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TROOPS_CATALOG.map((troop) => {
              const count = villageState.trainedTroops?.[troop.id] || 0;
              const resIcon = troop.resourceType === 'chakra' ? '🌀' : troop.resourceType === 'berries' ? '💰' : '🔮';
              const roleTag =
                troop.id === 'konoha_genin' ? '🎯 Ranged Shuriken • Rapid Fire'
                : troop.id === 'fire_chunin' ? '🔥 Grand Fireball • Scorching AOE'
                : troop.id === 'hyuga_striker' ? '⚡ Gentle Fist • Defense Pierce'
                : '🐸 Toad Cleaver • Frontline Tank & Wall Crusher';

              const jutsuKanji =
                troop.id === 'konoha_genin' ? '木ノ葉忍術 • 忍具の連撃'
                : troop.id === 'fire_chunin' ? '火遁・豪火球の術'
                : troop.id === 'hyuga_striker' ? '日向流 • 八卦六十四掌'
                : '妙木山 • ガマ鉄拳太刀';

              return (
                <div
                  key={troop.id}
                  className="p-4 rounded-3xl bg-gradient-to-b from-[#0c162f] to-[#070d1e] border border-cyan-500/30 flex flex-col justify-between hover:border-cyan-400/60 shadow-lg transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center text-3xl shadow">
                        {troop.icon}
                      </div>
                      <span className="text-xs font-mono font-black px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-sm">
                        {count} Ready
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-white">{troop.name}</h4>
                    <span className="text-[10px] font-mono text-amber-400 font-bold block mt-0.5">
                      {roleTag}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-300/80 font-bold block mt-0.5 tracking-wide">
                      {jutsuKanji}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{troop.desc}</p>

                    <div className="mt-3 p-2 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[11px]">Combat Power:</span>
                        <span className="text-red-400 font-bold font-mono">⚔️ {troop.attack} ATK &bull; {troop.hp} HP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[11px]">Training Cost:</span>
                        <span className="text-amber-300 font-bold font-mono">{resIcon} {troop.cost}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleTrainTroop(troop.id, 1, troop.cost, troop.resourceType)}
                      disabled={totalTroopsCount >= armyCampCap}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 disabled:opacity-40 text-white font-bold text-xs shadow-md transition cursor-pointer"
                    >
                      +1 Train
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTrainTroop(troop.id, 5, troop.cost, troop.resourceType)}
                      disabled={totalTroopsCount + 5 > armyCampCap}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-xs border border-white/10 transition cursor-pointer"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTrainMaxTroop(troop.id, troop.cost, troop.resourceType)}
                      disabled={totalTroopsCount >= armyCampCap}
                      className="py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-40 text-amber-300 font-bold text-xs border border-amber-500/40 transition cursor-pointer"
                      title="Train maximum possible"
                    >
                      Max
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Official Hokage Shinobi Mission Desk (火影の忍務発令所) */}
          <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0c1328] via-[#080d1d] to-[#040711] border border-cyan-500/40 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Hokage Shinobi Mission Desk</span>
                    <span className="text-[10px] font-mono font-normal text-amber-400">火影執務室・忍務選定所</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Select an official ninja mission rank (D to S) and deploy your trained squad to plunder essential supplies!
                  </p>
                </div>
              </div>

              {/* Mission Rank Tabs: D, C, B, A, S */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/10 overflow-x-auto">
                {[
                  { rank: 'D', label: 'D-Rank', sub: 'Genin' },
                  { rank: 'C', label: 'C-Rank', sub: 'Chunin' },
                  { rank: 'B', label: 'B-Rank', sub: 'Jonin' },
                  { rank: 'A', label: 'A-Rank', sub: 'ANBU' },
                  { rank: 'S', label: 'S-Rank', sub: 'Forbidden' }
                ].map((item) => {
                  const isSelected = selectedMissionRank === item.rank;
                  return (
                    <button
                      key={item.rank}
                      type="button"
                      onClick={() => {
                        setSelectedMissionRank(item.rank as any);
                        const targetId =
                          item.rank === 'D' ? 'target_bandit_camp'
                          : item.rank === 'C' ? 'target_mist_compound'
                          : item.rank === 'B' ? 'target_sound_base'
                          : item.rank === 'A' ? 'target_akatsuki_rain'
                          : 'target_pain_stronghold';
                        const match = DEFAULT_FRIEND_BASES.find((b) => b.id === targetId) || DEFAULT_FRIEND_BASES[0];
                        setSelectedRaidFriend(match);
                        animeAudio.playButtonClick();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex flex-col items-center ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[9px] font-mono opacity-80 uppercase">{item.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Selected Mission Brief Card */}
            {(() => {
              const activeMission =
                selectedRaidFriend ||
                DEFAULT_FRIEND_BASES.find((b) =>
                  selectedMissionRank === 'D' ? b.id === 'target_bandit_camp'
                  : selectedMissionRank === 'C' ? b.id === 'target_mist_compound'
                  : selectedMissionRank === 'B' ? b.id === 'target_sound_base'
                  : selectedMissionRank === 'A' ? b.id === 'target_akatsuki_rain'
                  : b.id === 'target_pain_stronghold'
                ) || DEFAULT_FRIEND_BASES[0];

              const rankBadge =
                selectedMissionRank === 'D' ? { badge: 'D-RANK • GENIN SCOUTING', jp: 'Ｄランク任務 • 国境野盗掃討', avatar: '⛺', border: 'border-emerald-500/50' }
                : selectedMissionRank === 'C' ? { badge: 'C-RANK • CHUNIN ESCORT', jp: 'Ｃランク任務 • 波の国霧暗殺者', avatar: '🌊', border: 'border-blue-500/50' }
                : selectedMissionRank === 'B' ? { badge: 'B-RANK • JONIN STRIKE', jp: 'Ｂランク任務 • 音隠れ呪印基地', avatar: '🐍', border: 'border-purple-500/50' }
                : selectedMissionRank === 'A' ? { badge: 'A-RANK • ANBU BLACK OPS', jp: 'Ａランク任務 • 雨隠れ暁前哨', avatar: '🌧️', border: 'border-rose-500/50' }
                : { badge: 'S-RANK • FORBIDDEN RAID', jp: 'Ｓランク極秘任務 • 暁総本山六道', avatar: '⛩️', border: 'border-amber-500/60' };

              return (
                <div className={`p-4 sm:p-5 rounded-2xl bg-black/40 border ${rankBadge.border} flex flex-col md:flex-row items-center justify-between gap-4`}>
                  <div className="flex items-center gap-3.5 flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-black border border-white/20 flex items-center justify-center text-3xl shadow-lg shrink-0">
                      {rankBadge.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {rankBadge.badge}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-300/90 font-bold">
                          {rankBadge.jp}
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-white mt-1">
                        {activeMission.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1 font-mono">
                        <span>💰 Plunder: <strong className="text-amber-300">+{activeMission.berriesLoot} Berries</strong></span>
                        <span>🌀 Plunder: <strong className="text-cyan-300">+{activeMission.chakraLoot} Chakra</strong></span>
                        <span>🛡️ Fortifications: <strong className="text-rose-400">{activeMission.buildings.length} Structures</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRaidFriend(activeMission);
                        setIsArenaRaidActive(true);
                      }}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(239,68,68,0.6)] flex items-center justify-center gap-2 transition cursor-pointer transform hover:scale-105 active:scale-95"
                    >
                      <Sword size={16} />
                      <span>Launch 2.5D Animated Marching Raid</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRaidFriend(activeMission);
                        handleLaunchSyndicateRaid();
                      }}
                      disabled={isRaiding || totalTroopsCount < 4}
                      className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <span>{isRaiding ? 'Deploying...' : 'Quick Auto-Raid'}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Raid Result Modal / Banner */}
          {raidResult && (
            <div className="p-5 rounded-3xl bg-gradient-to-b from-[#0b1f3a] to-[#070e1c] border-2 border-emerald-400 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {'⭐'.repeat(raidResult.stars)}
                  </span>
                  <div>
                    <h4 className="text-base font-black text-white">
                      {raidResult.stars === 3 ? 'VICTORY: 100% BASE ANNIHILATION!' : 'OUTPOST BREACHED!'}
                    </h4>
                    <span className="text-xs text-emerald-300 font-bold">
                      {raidResult.destruction}% Total Destruction Achieved
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRaidResult(null)}
                  className="text-xs px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  Close Results
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 text-center">
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40">
                  <span className="text-[10px] text-slate-400 uppercase block">BERRIES PLUNDERED</span>
                  <span className="text-base font-black text-amber-300">+💰 {raidResult.berriesLooted}</span>
                </div>
                <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40">
                  <span className="text-[10px] text-slate-400 uppercase block">CHAKRA SECURED</span>
                  <span className="text-base font-black text-cyan-300">+🌀 {raidResult.chakraLooted}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-300 bg-black/40 p-3 rounded-xl border border-white/5 font-mono">
                {raidResult.log.map((entry, idx) => (
                  <div key={idx}>{entry}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 9. ANIME CLAN / SANCTUARY GUILDS TAB */}
      {activeBuildTab === 'guilds' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-[#0b1226]/90 border border-[#1e2a4a]">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users size={18} className="text-emerald-400" />
                <span>Anime Sanctuary Guilds &amp; Alliances</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Join a legendary anime coalition to unlock global passive boosts, joint raid perks, and clan leveling milestones.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-500/50 px-3 py-1 rounded-xl">
                Active Guild: <strong className="text-white">{villageState.activeGuildId ? SANCTUARY_GUILDS.find(g => g.id === villageState.activeGuildId)?.name : 'None (Join Below)'}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SANCTUARY_GUILDS.map((guild) => {
              const isMember = villageState.activeGuildId === guild.id;
              return (
                <div
                  key={guild.id}
                  className={`p-5 rounded-3xl border transition flex flex-col justify-between ${
                    isMember
                      ? 'bg-gradient-to-br from-emerald-950/60 to-[#0e172f] border-emerald-500 shadow-xl ring-2 ring-emerald-500/30'
                      : 'bg-[#0e172f] border-[#1e3a6a] hover:border-slate-500'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 rounded-2xl bg-slate-900 border border-slate-700">{guild.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-extrabold text-white">{guild.name}</h4>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">{guild.tag}</span>
                          </div>
                          <span className="text-xs text-slate-400">Leader: <strong className="text-slate-300">{guild.leader}</strong> &bull; {guild.memberCount} Members</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-amber-300 px-2.5 py-1 rounded-xl bg-amber-950/70 border border-amber-500/40">
                        Guild Lv. {guild.level}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1 mb-3">
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Sparkles size={13} />
                        <span>{guild.perkTitle}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{guild.perkDesc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    {isMember ? (
                      <>
                        <span className="text-xs text-emerald-400 font-bold flex-1 flex items-center gap-1">
                          <CheckCircle size={14} /> Active Guild Perks Active
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (villageState.berries < 200 || villageState.chakra < 150) {
                              alert('Requires 200 Berries & 150 Chakra to contribute!');
                              return;
                            }
                            onUpdateVillage({
                              ...villageState,
                              berries: villageState.berries - 200,
                              chakra: villageState.chakra - 150,
                              guildContribution: (villageState.guildContribution || 0) + 100
                            });
                            alert(`Donated 200 Berries & 150 Chakra! Earned +100 Guild Prestige Points.`);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition shadow-md"
                        >
                          + Donate Resources
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateVillage({
                            ...villageState,
                            activeGuildId: guild.id
                          });
                        }}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs transition cursor-pointer shadow-md"
                      >
                        Enlist in {guild.name}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 9. FRIENDS & MULTIPLAYER RIVALS TAB */}
      {activeBuildTab === 'multiplayer' && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-[#0b1226]/90 border border-purple-500/50 shadow-xl">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Globe size={18} className="text-purple-400" />
                <span>Multiplayer Base Raids &amp; Friend Sanctuaries</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Share your base with friends, raid your friend&apos;s custom base defenses, and duel their defending hero in 1v1 combat!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveBuildTab('village')}
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-[#1e293b]"
            >
              Return to Map
            </button>
          </div>

          {/* 1. Share My Base & Import Friend Code Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* My Sanctuary Profile & Base Code Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#121c38] to-[#070d1e] border border-cyan-500/40 shadow-lg flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
                  MY SANCTUARY PROFILE
                </span>
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-white flex items-center gap-2">
                    <span>👑</span>
                    <span>{villageState.playerName || 'Marou (Me)'}</span>
                  </h4>
                  <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800">
                    {villageState.sanctuaryTag || '#SANCTUARY-MAROU-1'}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-300 flex items-center gap-3">
                  <span>HQ Tier: <strong className="text-white">Level {villageState.level}</strong></span>
                  <span>Defending Hero: <strong className="text-amber-300">{activeHero.name}</strong></span>
                  <span>Walls: <strong className="text-slate-200">{villageState.buildings.filter(b => b.type === 'defense_wall').length}</strong></span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Send your Sanctuary Code to your friend! When they import it on their device, your exact base layout and defending hero will appear for them to attack.
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const code = exportSanctuaryCode(villageState);
                    navigator.clipboard.writeText(code);
                    setCopiedCodeToast(true);
                    setTimeout(() => setCopiedCodeToast(false), 3000);
                  }}
                  className="flex-1 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  {copiedCodeToast ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                  <span>{copiedCodeToast ? 'Base Code Copied to Clipboard!' : '📋 Copy My Base Share Code'}</span>
                </button>
              </div>
            </div>

            {/* Import Friend's Sanctuary Code Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1a1033] to-[#0d091e] border border-purple-500/40 shadow-lg flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold block mb-1">
                  IMPORT FRIEND&apos;S SANCTUARY
                </span>
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <UserPlus size={16} className="text-purple-400" />
                  <span>Add Friend by Base Code</span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-1">
                  Did your friend give you their base code? Paste it below to add their sanctuary directly into your rival raid targets!
                </p>
                <input
                  type="text"
                  placeholder="Paste friend's Base Code here (e.g. BASE-eyJ...)"
                  value={importFriendCodeInput}
                  onChange={(e) => setImportFriendCodeInput(e.target.value)}
                  className="w-full mt-3 bg-black/60 border border-purple-400/50 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-300"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!importFriendCodeInput.trim()) return;
                  const imported = importSanctuaryCode(importFriendCodeInput);
                  if (imported) {
                    const existing = villageState.customFriends || [];
                    onUpdateVillage({
                      ...villageState,
                      customFriends: [imported, ...existing]
                    });
                    setImportFriendCodeInput('');
                    alert(`🎉 Successfully added ${imported.name} to your Rival Bases! You can now raid their village.`);
                  } else {
                    alert('Invalid Base Code! Please verify the code string.');
                  }
                }}
                className="mt-3 w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <Plus size={14} />
                <span>📥 Import Friend&apos;s Base</span>
              </button>
            </div>
          </div>

          {/* 2. Rival Friend Sanctuaries to Raid */}
          <div className="p-5 rounded-3xl bg-[#0b1226]/90 border border-[#1e2a4a] shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#182442] pb-3">
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Sword size={16} className="text-red-400" />
                  <span>Rival Sanctuaries (Friends Ready for Raid)</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  Select a friend&apos;s base below to attack their real building layouts and duel their defending hero!
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...(villageState.customFriends || []), ...DEFAULT_FRIEND_BASES].map((friend) => {
                const hero = HEROES_CATALOG[friend.activeHeroId] || HEROES_CATALOG.naruto;
                return (
                  <div
                    key={friend.id}
                    className="p-4 rounded-2xl bg-gradient-to-b from-[#101b33] to-[#070c19] border border-[#203666] hover:border-purple-400/60 transition shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl p-1.5 rounded-xl bg-black/40 border border-white/10">
                            {hero.avatar}
                          </span>
                          <div>
                            <h5 className="text-xs font-black text-white">{friend.name}</h5>
                            <span className="text-[10px] font-mono text-purple-300">{friend.tag}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full">
                          HQ Lv {friend.level}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1 text-[11px] text-slate-300 mb-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Defending Hero:</span>
                          <span className="font-bold text-amber-300">{hero.name} (Lv {friend.heroLevel})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Buildings:</span>
                          <span className="font-bold text-white">{friend.buildings.length} structures</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Available Loot:</span>
                          <span className="font-bold text-emerald-300">💰 {friend.berriesLoot} &bull; 🌀 {friend.chakraLoot}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRaidFriend(friend);
                          setIsArenaRaidActive(true);
                        }}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <Sword size={13} />
                        <span>⚔️ Raid</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onScoutBase) {
                            onScoutBase(friend);
                            setActiveBuildTab('village');
                            setVillageViewMode('grid');
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 cursor-pointer flex items-center gap-1 transition"
                        title="Inspect friend's base layout in Read-Only Scout Mode"
                      >
                        <Eye size={13} className="text-amber-400" />
                        <span>Scout</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Multiplayer Defense Battle Log */}
          <div className="p-5 rounded-3xl bg-[#0b1226]/90 border border-[#1e2a4a] shadow-xl flex flex-col gap-3">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Shield size={16} className="text-blue-400" />
              <span>Multiplayer Defense &amp; Raid History</span>
            </h4>

            {(villageState.battleReports && villageState.battleReports.length > 0) ? (
              <div className="space-y-2">
                {villageState.battleReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3 rounded-2xl bg-black/40 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          ⚔️ {rep.attackerName} vs {rep.defenderName}
                        </span>
                        <span className="text-[10px] text-amber-300 font-bold">
                          {rep.stars >= 3 ? '⭐⭐⭐ 3-STAR' : rep.stars >= 2 ? '⭐⭐ 2-STAR' : rep.stars >= 1 ? '⭐ 1-STAR' : 'FAILED DEFENSE'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {rep.destructionPct}% Destruction &bull; Plunder: +{rep.lootStolenBerries} 💰 +{rep.lootStolenChakra} 🌀
                      </span>
                    </div>

                    <span className="font-black text-amber-400">
                      {rep.trophiesDelta > 0 ? `+${rep.trophiesDelta}` : rep.trophiesDelta} 🏆
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No recent raids logged yet. Raid a friend&apos;s base above to start logging multiplayer battles!
              </p>
            )}
          </div>
        </div>
      )}

      {/* 10. EPIC NEW HERO UNLOCKED CELEBRATION MODAL */}
      {heroUnlockCelebration && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-in zoom-in-95">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#181130] via-[#0e0a24] to-[#060410] border-2 border-amber-400 rounded-3xl p-6 shadow-[0_0_60px_rgba(245,158,11,0.6)] flex flex-col items-center text-center">
            <span className="text-3xl animate-bounce mb-1">🎉</span>
            <span className="text-xs font-mono font-black uppercase tracking-widest text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/50">
              TOWN HALL HQ LEVEL {villageState.level} REACHED!
            </span>

            <h2 className="text-xl font-black text-white mt-2">NEW HERO UNLOCKED!</h2>
            <p className="text-xs text-amber-200 mt-0.5">{heroUnlockCelebration.title}</p>

            {/* Hero Portrait in Flaming Elemental Ring */}
            <div className="relative w-36 h-36 my-4 rounded-full overflow-hidden border-4 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.8)]">
              <img
                src={heroUnlockCelebration.image}
                alt={heroUnlockCelebration.name}
                className="w-full h-full object-cover object-top scale-110"
              />
            </div>

            <h3 className="text-lg font-black text-white">{heroUnlockCelebration.name}</h3>
            <p className="text-xs text-slate-300 italic max-w-xs mt-1">
              &ldquo;{heroUnlockCelebration.quote}&rdquo;
            </p>

            <div className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 my-3 text-left space-y-1 text-xs">
              <div>
                <strong className="text-cyan-400">Skill:</strong> {heroUnlockCelebration.skillName}
              </div>
              <div>
                <strong className="text-amber-400">Ultimate:</strong> {heroUnlockCelebration.ultimateName}
              </div>
            </div>

            <div className="w-full flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateVillage({ ...villageState, activeHeroId: heroUnlockCelebration.id });
                  setHeroUnlockCelebration(null);
                }}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs shadow-lg hover:brightness-110 cursor-pointer"
              >
                ★ Assign as Active Patrol Guard ★
              </button>
              <button
                type="button"
                onClick={() => setHeroUnlockCelebration(null)}
                className="w-full py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Keep Current Defender &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. STREAMLINED BOTTOM GAME DOCK (THE 4 CORE ACTION HUBS) */}
      {/* ======================================================== */}
      <div className="sticky bottom-2 sm:bottom-4 z-40 w-full max-w-2xl mx-auto px-1 sm:px-2 pt-2">
        <div className="flex items-center justify-around gap-1 p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-[#081126]/95 border-2 border-[#1e3a6a] shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          {/* 1. ATTACK & RAIDS */}
          <button
            type="button"
            onClick={() => {
              setActiveBuildTab(activeBuildTab === 'attack' ? 'village' : 'attack');
              animeAudio.playButtonClick();
            }}
            className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl sm:rounded-2xl flex flex-col items-center gap-0.5 sm:gap-1 transition cursor-pointer ${
              activeBuildTab === 'attack'
                ? 'bg-gradient-to-t from-red-600 via-rose-600 to-red-500 text-white shadow-lg ring-1 ring-red-400/50'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="relative">
              <Sword size={17} className={activeBuildTab === 'attack' ? 'text-white' : 'text-red-400'} />
              {totalTroopsCount > 0 && (
                <span className="absolute -top-1.5 -right-3 text-[8px] sm:text-[9px] font-black px-1 sm:px-1.5 py-0.2 rounded-full bg-red-500 text-white border border-white/40">
                  {totalTroopsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-black tracking-tight sm:tracking-wide">Attack &amp; Raid</span>
          </button>

          {/* 2. BUILD SHOP */}
          <button
            type="button"
            onClick={() => {
              setActiveBuildTab(activeBuildTab === 'shop' ? 'village' : 'shop');
              animeAudio.playButtonClick();
            }}
            className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl sm:rounded-2xl flex flex-col items-center gap-0.5 sm:gap-1 transition cursor-pointer ${
              activeBuildTab === 'shop'
                ? 'bg-gradient-to-t from-blue-600 to-cyan-500 text-white shadow-lg ring-1 ring-cyan-400/50'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-base sm:text-lg">🔨</span>
            <span className="text-[10px] sm:text-xs font-black tracking-tight sm:tracking-wide">Build Shop</span>
          </button>

          {/* 3. ARMY & HEROES */}
          <button
            type="button"
            onClick={() => {
              setActiveBuildTab(activeBuildTab === 'heroes' ? 'village' : 'heroes');
              animeAudio.playButtonClick();
            }}
            className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl sm:rounded-2xl flex flex-col items-center gap-0.5 sm:gap-1 transition cursor-pointer ${
              activeBuildTab === 'heroes'
                ? 'bg-gradient-to-t from-amber-500 to-yellow-400 text-slate-950 shadow-lg font-black ring-1 ring-yellow-300/50'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Crown size={17} className={activeBuildTab === 'heroes' ? 'text-slate-950' : 'text-amber-400'} />
            <span className="text-[10px] sm:text-xs font-black tracking-tight sm:tracking-wide">Army &amp; Heroes</span>
          </button>

          {/* 4. FRIENDS & MULTIPLAYER */}
          <button
            type="button"
            onClick={() => {
              setActiveBuildTab(activeBuildTab === 'multiplayer' ? 'village' : 'multiplayer');
              animeAudio.playButtonClick();
            }}
            className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl sm:rounded-2xl flex flex-col items-center gap-0.5 sm:gap-1 transition cursor-pointer ${
              activeBuildTab === 'multiplayer'
                ? 'bg-gradient-to-t from-purple-600 to-indigo-500 text-white shadow-lg ring-1 ring-purple-400/50'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe size={17} className={activeBuildTab === 'multiplayer' ? 'text-white' : 'text-purple-400'} />
            <span className="text-[10px] sm:text-xs font-black tracking-tight sm:tracking-wide">Friends &amp; Rivals</span>
          </button>

          {/* 5. CHAPTER STORY CAMPAIGN */}
          <button
            type="button"
            onClick={() => {
              setShowNarutoStoryModal(true);
              animeAudio.playButtonClick();
            }}
            className="flex-1 py-1.5 sm:py-2 px-1 rounded-xl sm:rounded-2xl flex flex-col items-center gap-0.5 sm:gap-1 transition cursor-pointer text-slate-300 hover:text-white hover:bg-white/5"
          >
            <span className="text-base sm:text-lg">📜</span>
            <span className="text-[10px] sm:text-xs font-black tracking-tight sm:tracking-wide">Story Quests</span>
          </button>
        </div>
      </div>

      {/* CHAPTER 1: NARUTO 25-QUEST CAMPAIGN MODAL */}
      {showNarutoStoryModal && (
        <NarutoStoryQuestModal
          villageState={villageState}
          onClose={() => setShowNarutoStoryModal(false)}
          onCompleteQuest={handleCompleteNarutoQuest}
          onStartPainBoss={() => {
            setShowNarutoStoryModal(false);
            setShowPainBossModal(true);
          }}
          onNavigateTab={(tab) => {
            if (tab === 'battle') {
              setActiveBuildTab('attack');
              setVillageViewMode('grid');
            } else if (tab === 'village') {
              setActiveBuildTab('shop');
              setVillageViewMode('grid');
            } else {
              setActiveBuildTab(tab as any);
              setVillageViewMode('grid');
            }
          }}
        />
      )}

      {/* SIX PATHS OF PAIN FINAL BOSS CLIMAX MODAL */}
      {showPainBossModal && (
        <PainBossBattleModal
          villageState={villageState}
          onClose={() => setShowPainBossModal(false)}
          onVictory={handlePainBossVictory}
        />
      )}

      {/* ANIME STORY PROLOGUE & GAMEPLAY GUIDE MODAL */}
      {showPrologueModal && (
        <AnimeStoryPrologueModal
          onClose={() => {
            setShowPrologueModal(false);
            try { localStorage.setItem('animeClash_prologue_seen', 'true'); } catch {}
          }}
          onStartPlaying={() => {
            setShowPrologueModal(false);
            try { localStorage.setItem('animeClash_prologue_seen', 'true'); } catch {}
            setShowNarutoStoryModal(true);
          }}
        />
      )}

      {/* ICHIRAKU RAMEN STAND INTERACTIVE FEAST MODAL */}
      {isRamenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-gradient-to-b from-[#131b2e] to-[#070b14] border-2 border-orange-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
            {/* Header / Banner */}
            <div className="flex items-center justify-between pb-4 border-b border-orange-500/20">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2.5 rounded-2xl bg-orange-500/20 border border-orange-500/40">🍜</span>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span>Ichiraku Ramen Stand</span>
                    <span className="text-xs font-mono text-amber-400 font-normal">一楽ラーメン</span>
                  </h3>
                  <p className="text-xs text-slate-400">Old Man Teuchi &amp; Ayame&apos;s Soul-Warming Kitchen</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRamenModalOpen(false);
                  setRamenFeedback(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Chef Teuchi Dialogue */}
            <div className="my-4 p-3.5 rounded-2xl bg-orange-950/30 border border-orange-500/30 flex items-start gap-3">
              <span className="text-2xl shrink-0">👨‍🍳</span>
              <p className="text-xs text-orange-200/90 leading-relaxed italic">
                &ldquo;Welcome back from your mission, Naruto! Dig in while the broth is piping hot — nothing fuels the Will of Fire like a giant bowl of miso chashu!&rdquo;
              </p>
            </div>

            {ramenFeedback && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-300 font-bold text-center animate-in fade-in">
                {ramenFeedback}
              </div>
            )}

            {/* Ramen Menu Items */}
            <div className="space-y-3">
              {/* Menu Item 1: Miso Chashu */}
              <div className="p-3.5 rounded-2xl bg-[#0b1226]/80 border border-orange-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🍜</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Miso Chashu Ramen (味噌チャーシュー)</h4>
                    <p className="text-xs text-slate-400">Tender pork belly slices in rich fermented miso broth.</p>
                    <span className="text-[11px] font-mono font-bold text-cyan-300">Reward: +250 Pure Chakra</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (villageState.berries < 40) {
                      setRamenFeedback('❌ Not enough Berries! Complete missions to earn more ryo.');
                      return;
                    }
                    const updated = {
                      ...villageState,
                      berries: villageState.berries - 40,
                      chakra: Math.min(villageState.maxStorage, villageState.chakra + 250)
                    };
                    onUpdateVillage(updated);
                    animeAudio.playButtonClick();
                    setRamenFeedback('✨ *Slurp!* Delicious! +250 Chakra added to your reserves!');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-black text-xs shrink-0 cursor-pointer shadow-md"
                >
                  Order (40 💰)
                </button>
              </div>

              {/* Menu Item 2: Hokage Mega Pork */}
              <div className="p-3.5 rounded-2xl bg-[#0b1226]/80 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🍥</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Hokage Mega Extra-Pork (特大豚骨)</h4>
                    <p className="text-xs text-slate-400">Triple pork noodles mountain topped with double narutomaki.</p>
                    <span className="text-[11px] font-mono font-bold text-amber-300">Reward: +200 Hero EXP for {activeHero.name}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (villageState.berries < 70) {
                      setRamenFeedback('❌ Not enough Berries! Complete missions to earn more ryo.');
                      return;
                    }
                    const currentLevels = { ...(villageState.heroLevels || {}) };
                    const nextExp = (currentLevels[activeHero.id] || 1) + 1;
                    currentLevels[activeHero.id] = nextExp;
                    const updated = {
                      ...villageState,
                      berries: villageState.berries - 70,
                      heroLevels: currentLevels
                    };
                    onUpdateVillage(updated);
                    animeAudio.playButtonClick();
                    setRamenFeedback(`🔥 Power surging! ${activeHero.name} gained EXP and leveled up to Lv. ${nextExp}!`);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-md hover:brightness-110"
                >
                  Order (70 💰)
                </button>
              </div>

              {/* Menu Item 3: Ayame's Sweet Dango & Green Tea */}
              <div className="p-3.5 rounded-2xl bg-[#0b1226]/80 border border-emerald-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🍵</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Ayame&apos;s Sweet Dango &amp; Tea (お団子とお茶)</h4>
                    <p className="text-xs text-slate-400">Three-color mochi skewer served with freshly brewed green tea.</p>
                    <span className="text-[11px] font-mono font-bold text-emerald-300">Reward: +100 Chakra &amp; Shinobi Morale</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (villageState.berries < 25) {
                      setRamenFeedback('❌ Not enough Berries!');
                      return;
                    }
                    const updated = {
                      ...villageState,
                      berries: villageState.berries - 25,
                      chakra: Math.min(villageState.maxStorage, villageState.chakra + 100)
                    };
                    onUpdateVillage(updated);
                    animeAudio.playButtonClick();
                    setRamenFeedback('🍡 Sweet & refreshing! Troops feel energized! +100 Chakra!');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-black text-xs shrink-0 cursor-pointer shadow-md"
                >
                  Order (25 💰)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEAM 7 SPARRING POSTS INTERACTIVE DOJO MODAL */}
      {isTeam7ModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-gradient-to-b from-[#131b2e] to-[#070b14] border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40">🪵</span>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span>Team 7 Sparring Ground</span>
                    <span className="text-xs font-mono text-emerald-400 font-normal">第7班・鈴の演習場</span>
                  </h3>
                  <p className="text-xs text-slate-400">Three Wooden Posts &bull; Kakashi&apos;s Bell Test Sanctuary</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTeam7ModalOpen(false);
                  setTeam7Feedback(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Kakashi Dialogue */}
            <div className="my-4 p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
              <span className="text-2xl shrink-0">🥷</span>
              <p className="text-xs text-emerald-200/90 leading-relaxed italic">
                &ldquo;You want these bells? Come at me with the intent to kill. If you don&apos;t practice your teamwork and jutsu discipline, you won&apos;t even graze a single chime.&rdquo;
                <span className="block mt-1 font-mono font-bold text-slate-400">— Kakashi Hatake</span>
              </p>
            </div>

            {team7Feedback && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-300 font-bold text-center animate-in fade-in">
                {team7Feedback}
              </div>
            )}

            {/* Sparring Drills */}
            <div className="space-y-3">
              {/* Drill 1: Shuriken Target Practice */}
              <div className="p-3.5 rounded-2xl bg-[#0b1226]/80 border border-emerald-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Target Practice Drill (手裏剣修練)</h4>
                    <p className="text-xs text-slate-400">Drill basic kunai throwing arcs against the wooden trunks.</p>
                    <span className="text-[11px] font-mono font-bold text-emerald-300">Reward: Instantly recruits +3 Leaf Genin Troops</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (villageState.chakra < 30) {
                      setTeam7Feedback('❌ Not enough Chakra to focus shuriken accuracy!');
                      return;
                    }
                    const trained = { ...(villageState.trainedTroops || {}) };
                    trained['leaf_genin'] = (trained['leaf_genin'] || 0) + 3;
                    const updated = {
                      ...villageState,
                      chakra: villageState.chakra - 30,
                      trainedTroops: trained
                    };
                    onUpdateVillage(updated);
                    animeAudio.playButtonClick();
                    setTeam7Feedback('🎯 Bullseye! 3 Leaf Shinobi Genin successfully trained and added to barracks!');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-black text-xs shrink-0 cursor-pointer shadow-md"
                >
                  Train (30 🌀)
                </button>
              </div>

              {/* Drill 2: Bell Snatch Trial */}
              <div className="p-3.5 rounded-2xl bg-[#0b1226]/80 border border-cyan-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔔</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Bell Snatch Reflex Bout (鈴奪取試験)</h4>
                    <p className="text-xs text-slate-400">Coordinated sneak assault against Kakashi&apos;s Substitution Jutsu.</p>
                    <span className="text-[11px] font-mono font-bold text-cyan-300">Reward: +180 Hero EXP &bull; Will of Fire</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (villageState.chakra < 50) {
                      setTeam7Feedback('❌ Not enough Chakra to perform body-flicker substitution!');
                      return;
                    }
                    const currentLevels = { ...(villageState.heroLevels || {}) };
                    const nextExp = (currentLevels[activeHero.id] || 1) + 1;
                    currentLevels[activeHero.id] = nextExp;
                    const updated = {
                      ...villageState,
                      chakra: villageState.chakra - 50,
                      heroLevels: currentLevels
                    };
                    onUpdateVillage(updated);
                    animeAudio.playButtonClick();
                    setTeam7Feedback(`🔔 *Chime!* You nearly touched the bells! ${activeHero.name} grew stronger and reached Lv. ${nextExp}!`);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 hover:brightness-110 text-white font-black text-xs shrink-0 cursor-pointer shadow-md"
                >
                  Spar (50 🌀)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
