'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  PlayerVillageState,
  BuildingInstance,
  BuildingType,
  HeroData,
  WeatherTimeMode,
  SanctuaryGuild
} from '@/lib/animeClash/types';
import {
  HEROES_CATALOG,
  TROOPS_CATALOG,
  VILLAGE_HQ_LEVEL_PLANS,
  BASE_LAYOUT_PRESETS,
  BaseLayoutPreset,
  SANCTUARY_GUILDS,
  ANIME_VOICE_SHOUTS,
  getMaxBuildingLevelForHQ,
  getMaxHeroLevelForHQ,
  getArmyCampCapForHQ,
  getHeroStatsForLevel,
  getHeroUpgradeCost
} from '@/lib/animeClash/gameData';
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
  Layers
} from 'lucide-react';

interface VillageBuilderProps {
  villageState: PlayerVillageState;
  onUpdateVillage: (state: PlayerVillageState) => void;
  onLaunchBattle: () => void;
  onOpenStory: () => void;
}

export default function VillageBuilder({
  villageState,
  onUpdateVillage,
  onLaunchBattle,
  onOpenStory
}: VillageBuilderProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInstance | null>(null);
  const [villageViewMode, setVillageViewMode] = useState<'orbit_hub' | 'grid'>('orbit_hub');
  const [activeBuildTab, setActiveBuildTab] = useState<'village' | 'shop' | 'heroes' | 'layouts' | 'roadmap' | 'attack' | 'guilds'>('village');
  const [isRelocatingBuildingId, setIsRelocatingBuildingId] = useState<string | null>(null);
  const [heroInteractionQuote, setHeroInteractionQuote] = useState<string | null>(null);
  const [isRaiding, setIsRaiding] = useState(false);
  const [isArenaRaidActive, setIsArenaRaidActive] = useState(false);
  const [isDefenseActive, setIsDefenseActive] = useState(false);
  const [voiceShoutBanner, setVoiceShoutBanner] = useState<{ kanji: string; romaji: string; trans: string } | null>(null);
  const [raidResult, setRaidResult] = useState<{
    stars: number;
    destruction: number;
    berriesLooted: number;
    chakraLooted: number;
    log: string[];
  } | null>(null);

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
    if (img.complete) {
      heroImgRef.current = img;
    } else {
      img.onload = () => {
        heroImgRef.current = img;
      };
    }
  }, [activeHero.image]);

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

      const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2, 2.5);
      const logicalW = 860;
      const logicalH = 480;

      if (canvas.width !== Math.round(logicalW * dpr) || canvas.height !== Math.round(logicalH * dpr)) {
        canvas.width = Math.round(logicalW * dpr);
        canvas.height = Math.round(logicalH * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const width = logicalW;
      const height = logicalH;
      const originX = width / 2;
      const originY = 65;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw 2.5D Lush Grass Terrain & Forest Perimeter with Dynamic Weather Lighting
      drawIsoTerrain(ctx, width, height, originX, originY, 12, villageState.weatherMode || 'night', elapsed);

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

      ctx.restore();

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [villageState, selectedBuilding, activeHero, isRelocatingBuildingId, villageViewMode, activeBuildTab]);

  // Handle Isometric Map Click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const logicalW = 860;
    const logicalH = 480;
    const clickX = ((e.clientX - rect.left) / rect.width) * logicalW;
    const clickY = ((e.clientY - rect.top) / rect.height) * logicalH;

    const originX = logicalW / 2;
    const originY = 65;

    const { gridX, gridY } = fromIso(clickX, clickY, originX, originY);

    // If in Relocation Mode: Place the moving building on the clicked grid tile!
    if (isRelocatingBuildingId) {
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
      }
      return;
    }

    // Check if clicked near the Patrolling Hero
    const hp = heroPatrolRef.current;
    const heroDist = Math.hypot(gridX - hp.currentX, gridY - hp.currentY);
    if (heroDist < 1.1) {
      const heroQuotes = [
        `"Sanctuary perimeter locked down!"`,
        `"I'll defend this village with my life!"`,
        `"Guard status: 100% active!"`,
        `"${activeHero.quote}"`
      ];
      const q = heroQuotes[Math.floor(Math.random() * heroQuotes.length)];
      hp.speech = q;
      hp.speechTimer = Date.now() + 3500;
      setHeroInteractionQuote(q);
      return;
    }

    // Find building at clicked tile
    const clicked = villageState.buildings.find(
      (b) => Math.abs(b.x - gridX) <= 0.8 && Math.abs(b.y - gridY) <= 0.8
    );

    if (clicked) {
      setSelectedBuilding(clicked);
    } else {
      setSelectedBuilding(null);
    }
  };

  // Collect passive resources
  const handleCollectResources = () => {
    let addBerries = 0;
    let addChakra = 0;
    let addReishi = 0;

    villageState.buildings.forEach((b) => {
      if (b.type === 'berry_treasury') addBerries += (b.productionRate || 20) * 2;
      if (b.type === 'chakra_turbine') addChakra += (b.productionRate || 15) * 2;
      if (b.type === 'reishi_siphon') addReishi += (b.productionRate || 12) * 2;
    });

    onUpdateVillage({
      ...villageState,
      berries: Math.min(villageState.maxStorage, villageState.berries + addBerries),
      chakra: Math.min(villageState.maxStorage, villageState.chakra + addChakra),
      reishi: Math.min(villageState.maxStorage, villageState.reishi + addReishi)
    });
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

    onUpdateVillage({
      ...villageState,
      berries: villageState.berries - cost,
      buildings: updatedBuildings
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

  // Troops & Raid Logistics
  const totalTroopsCount = Object.values(villageState.trainedTroops || {}).reduce((a, b) => a + b, 0);
  const armyCampCap = getArmyCampCapForHQ(villageState.level);

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
          `⚔️ ${activeHero.name} breached the outer perimeter wall!`,
          `🥷 Shinobi swarm bypassed cannon fire with Body Flicker jutsu.`,
          `🏴‍☠️ Straw Hat brawlers demolished the Syndicate Berry Vault!`,
          `🔮 Kido casters shattered enemy barrier spires with Hado #88.`,
          `🏆 100% Core Destruction! Base liberated from Syndicate control!`
        ]
      });

      onUpdateVillage({
        ...villageState,
        berries: Math.min(villageState.maxStorage, villageState.berries + berriesPlunder),
        chakra: Math.min(villageState.maxStorage, villageState.chakra + chakraPlunder),
        trainedTroops: {
          konoha_ninja: Math.max(0, (villageState.trainedTroops?.konoha_ninja || 0) - 3),
          strawhat_brawler: Math.max(0, (villageState.trainedTroops?.strawhat_brawler || 0) - 2),
          shinigami_patrol: Math.max(0, (villageState.trainedTroops?.shinigami_patrol || 0) - 2),
          black_bulls_mage: Math.max(0, (villageState.trainedTroops?.black_bulls_mage || 0) - 1)
        }
      });
    }, 1600);
  };

  // Upgrade Village Town Hall HQ Level
  const currentHQPlan = VILLAGE_HQ_LEVEL_PLANS[villageState.level] || VILLAGE_HQ_LEVEL_PLANS[1];
  const nextHQPlan = VILLAGE_HQ_LEVEL_PLANS[villageState.level + 1];

  const handleUpgradeTownHallHQ = () => {
    if (!nextHQPlan) return;
    if (villageState.berries < nextHQPlan.upgradeCostBerries || villageState.chakra < nextHQPlan.upgradeCostChakra) {
      alert(`Insufficient resources! Requires 💰 ${nextHQPlan.upgradeCostBerries} Berries & 🌀 ${nextHQPlan.upgradeCostChakra} Chakra.`);
      return;
    }

    onUpdateVillage({
      ...villageState,
      level: villageState.level + 1,
      berries: villageState.berries - nextHQPlan.upgradeCostBerries,
      chakra: villageState.chakra - nextHQPlan.upgradeCostChakra,
      maxStorage: nextHQPlan.maxStorage
    });
  };

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

    const newBuilding: BuildingInstance = {
      id: `${type}_${Date.now()}`,
      type,
      name:
        type === 'haki_cannon'
          ? 'Haki Rail Cannon'
          : type === 'paper_mortar'
          ? 'Paper-Bomb Mortar'
          : 'Titanium Wall',
      level: 1,
      x: freeX,
      y: freeY,
      hp: type === 'defense_wall' ? 850 : 700,
      maxHp: type === 'defense_wall' ? 850 : 700,
      attack: type === 'haki_cannon' ? 50 : type === 'paper_mortar' ? 60 : undefined,
      range: type === 'haki_cannon' ? 5 : type === 'paper_mortar' ? 6.5 : undefined,
      color: type === 'haki_cannon' ? '#ef4444' : type === 'paper_mortar' ? '#f59e0b' : '#64748b',
      icon: type === 'haki_cannon' ? '💣' : type === 'paper_mortar' ? '💥' : '🧱'
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
    <div className="w-full max-w-5xl flex flex-col gap-4 my-4">
      {/* 2.5D Real-Time Troop Marching Raid Arena Modal */}
      {isArenaRaidActive && (
        <AnimeRaidArena
          villageState={villageState}
          onFinishRaid={(lootBerries, lootChakra) => {
            onUpdateVillage({
              ...villageState,
              berries: Math.min(villageState.maxStorage, villageState.berries + lootBerries),
              chakra: Math.min(villageState.maxStorage, villageState.chakra + lootChakra)
            });
            setIsArenaRaidActive(false);
          }}
          onClose={() => setIsArenaRaidActive(false)}
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

      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-3xl bg-[#0b1226]/95 border border-[#1e2a4a] shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img
            src={activeHero.image}
            alt={activeHero.name}
            className="w-12 h-12 rounded-2xl object-cover object-top border-2 shadow-lg"
            style={{ borderColor: activeHero.color }}
          />
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Neo-Sanctuary Base</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                HQ LVL {villageState.level} • {currentHQPlan.title}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Active Defender: <strong className="text-white">{activeHero.name}</strong>{' '}
              <span className="text-emerald-400 text-[10px] ml-1">(Patrolling Live in 2.5D)</span>
            </div>
          </div>
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
            <Sun size={15} />
          </button>
          <button
            type="button"
            title="Golden Twilight Sunset"
            onClick={() => onUpdateVillage({ ...villageState, weatherMode: 'twilight' })}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              villageState.weatherMode === 'twilight' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sunset size={15} />
          </button>
          <button
            type="button"
            title="Neon Nighttime"
            onClick={() => onUpdateVillage({ ...villageState, weatherMode: 'night' })}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              villageState.weatherMode === 'night' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon size={15} />
          </button>
          <button
            type="button"
            title="Shibuya Rain Thunderstorm"
            onClick={() => onUpdateVillage({ ...villageState, weatherMode: 'rain' })}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              villageState.weatherMode === 'rain' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudRain size={15} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hero Voice Shout Audio */}
          <button
            type="button"
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
            className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Trigger Japanese Voice Shout Audio"
          >
            <Volume2 size={14} className="text-amber-400 animate-pulse" />
            <span>Voice Shout</span>
          </button>

          {/* Test Base Defense Simulator */}
          <button
            type="button"
            onClick={() => setIsDefenseActive(true)}
            className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 text-rose-200 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Defend against an incoming Syndicate assault!"
          >
            <Shield size={14} className="text-rose-400" />
            <span>🚨 Base Defense</span>
          </button>

          <button
            type="button"
            onClick={handleCollectResources}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <span>🌾 Harvest All</span>
          </button>

          <button
            type="button"
            onClick={onOpenStory}
            className="px-3.5 py-2 rounded-xl bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <BookOpen size={14} className="text-amber-400" />
            <span>Story Arc</span>
          </button>

          <button
            type="button"
            onClick={() => setIsArenaRaidActive(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition cursor-pointer"
          >
            <Sword size={14} />
            <span>⚔️ 2.5D Raid!</span>
          </button>
        </div>
      </div>

      {/* Origin Anime Movie Banner */}
      <div className="p-3.5 rounded-3xl bg-gradient-to-r from-purple-950/80 via-[#0b1329] to-pink-950/80 border border-purple-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <Tv size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-400 bg-pink-950/80 px-2.5 py-0.5 rounded-full border border-pink-700">
                PROLOGUE ANIME FILM
              </span>
              <span className="text-xs font-bold text-white">How the Heroes Arrived in Tokyo 2026</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Watch Naruto, Luffy, Ichigo &amp; Asta arrive through the space-time rift and form the Sanctuary Alliance!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenStory}
          className="whitespace-nowrap px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition cursor-pointer"
        >
          <Play size={13} fill="currentColor" />
          <span>Play Origin Video</span>
        </button>
      </div>

      {/* 2. MODE NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 bg-[#080d1e] p-1 rounded-2xl border border-[#1e2f54] self-start overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveBuildTab('village');
            setVillageViewMode('orbit_hub');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeBuildTab === 'village' && villageViewMode === 'orbit_hub'
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.6)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Crown size={13} className="text-yellow-300" />
          <span>👑 Sanctuary Hub</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveBuildTab('village');
            setVillageViewMode('grid');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeBuildTab === 'village' && villageViewMode === 'grid'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers size={13} />
          <span>🏰 Base Grid</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveBuildTab('attack')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeBuildTab === 'attack' ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sword size={13} className="text-red-300" />
          <span>Troops & Raid ({totalTroopsCount}/{armyCampCap})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveBuildTab('heroes')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeBuildTab === 'heroes' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Crown size={13} className="text-yellow-300" />
          <span>Hero Levels & Roster</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveBuildTab('layouts')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeBuildTab === 'layouts' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layout size={13} />
          <span>Custom Base Setup</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveBuildTab('roadmap')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeBuildTab === 'roadmap' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Star size={13} className="text-yellow-300" />
          <span>HQ Level Caps (HQ {villageState.level})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveBuildTab('guilds')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeBuildTab === 'guilds' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users size={13} className="text-emerald-300" />
          <span>Sanctuary Guilds</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveBuildTab('shop')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeBuildTab === 'shop' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🔨 Defense Shop
        </button>
      </div>

      {/* 3. MAIN INTERACTIVE CONTENT: ISOMETRIC VILLAGE OR SANCTUARY ORBITAL HUB */}
      {activeBuildTab === 'village' && (
        <>
          <div className={villageViewMode === 'orbit_hub' ? 'block' : 'hidden'}>
            <SanctuaryOrbitalHub
              villageState={villageState}
              onUpdateVillage={onUpdateVillage}
              onLaunch1v1={onLaunchBattle}
              onLaunchTrials={(_floor) => setIsArenaRaidActive(true)}
              onSwitchToVillageGrid={() => setVillageViewMode('grid')}
            />
          </div>

          <div className={villageViewMode === 'grid' ? 'flex flex-col lg:flex-row gap-4 items-start' : 'hidden'}>
            {/* Real 2.5D Isometric Canvas */}
            <div className="flex-1 w-full rounded-3xl overflow-hidden border-2 border-[#1e3a5f] shadow-2xl relative bg-[#091522]">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full h-auto block cursor-crosshair select-none"
              style={{ aspectRatio: '860 / 480' }}
            />

            {/* In-Canvas Hero Guard Indicator Pill */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-emerald-500/50 backdrop-blur-md text-[11px] text-emerald-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{activeHero.name} is on Patrol &bull; Tap Hero to Speak</span>
            </div>

            {/* Relocation Mode Banner */}
            {isRelocatingBuildingId && (
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-lg animate-pulse">
                <Move size={14} />
                <span>RELOCATING BUILDING: Tap Destination Tile</span>
                <button
                  type="button"
                  onClick={() => setIsRelocatingBuildingId(null)}
                  className="ml-2 text-red-950 underline hover:text-red-800"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Bottom Tip */}
            <div className="absolute bottom-3 left-4 text-[11px] text-slate-300 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
              💡 Tap any building to inspect/upgrade/move &bull; Tap {activeHero.name.split(' ')[0]} to interact
            </div>
          </div>

          {/* Right Panel: Selected Building or Active Hero Details */}
          <div className="w-full lg:w-80 shrink-0">
            {selectedBuilding ? (
              <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#182442] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{selectedBuilding.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{selectedBuilding.name}</h3>
                      <span className="text-[11px] text-amber-400 font-semibold">Level {selectedBuilding.level}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBuilding(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Durability (HP):</span>
                    <span className="font-bold text-white">
                      {selectedBuilding.hp} / {selectedBuilding.maxHp}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Map Coordinates:</span>
                    <span className="font-mono text-cyan-300">
                      ({selectedBuilding.x}, {selectedBuilding.y})
                    </span>
                  </div>
                  {selectedBuilding.productionRate && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Production Rate:</span>
                      <span className="font-bold text-emerald-400">+{selectedBuilding.productionRate}/hr</span>
                    </div>
                  )}
                  {selectedBuilding.attack && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Firepower:</span>
                      <span className="font-bold text-red-400">⚔️ {selectedBuilding.attack} DMG</span>
                    </div>
                  )}
                </div>

                {/* Upgrade Button */}
                <button
                  type="button"
                  onClick={() => handleUpgradeBuilding(selectedBuilding)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ArrowUpCircle size={15} />
                  <span>Upgrade to Level {selectedBuilding.level + 1} (💰 {selectedBuilding.level * 150})</span>
                </button>

                {/* Move Building Button */}
                <button
                  type="button"
                  onClick={() => setIsRelocatingBuildingId(selectedBuilding.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Move size={14} className="text-cyan-400" />
                  <span>Move to New Grid Tile</span>
                </button>
              </div>
            ) : (
              /* Active Hero Defender Showcase */
              <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-4 shadow-xl backdrop-blur-md flex flex-col">
                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-[#243356] shadow-lg mb-3 bg-[#080d1e]">
                  <img
                    src={activeHero.image}
                    alt={activeHero.name}
                    className="w-full h-full object-cover object-top hover:scale-105 transition duration-500"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase">
                      ACTIVE HERO DEFENDER
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-1">{activeHero.name}</h3>
                    <p className="text-[11px] text-amber-300">{activeHero.title}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic mb-2 px-1">
                  {heroInteractionQuote ? `💬 ${heroInteractionQuote}` : `"${activeHero.quote}"`}
                </p>

                <div className="space-y-1 text-xs text-slate-300 p-3 rounded-2xl bg-[#080d1e] border border-[#1e2a4a]">
                  <div className="text-[11px] text-slate-400">
                    <strong className="text-white">Style:</strong> {activeHero.modernOutfit}
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    <strong className="text-cyan-400">Skill:</strong> {activeHero.skillName}
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    <strong className="text-amber-400">Ultimate:</strong> {activeHero.ultimateName}
                  </div>
                </div>
              </div>
            )}
          </div>
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

                <button
                  type="button"
                  onClick={handleUpgradeTownHallHQ}
                  className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-300 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <ArrowUpCircle size={15} />
                  <span>
                    Upgrade Town Hall (💰 {nextHQPlan.upgradeCostBerries} &bull; 🌀 {nextHQPlan.upgradeCostChakra})
                  </span>
                </button>
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

      {/* 6. DEFENSE SHOP TAB */}
      {activeBuildTab === 'shop' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-2">💥</div>
              <h4 className="text-sm font-bold text-white">Paper-Bomb Mortar</h4>
              <p className="text-xs text-slate-400 mt-1">Konoha AOE explosive tag launcher for swarm attacks.</p>
              <div className="text-xs text-amber-400 font-semibold mt-2">💥 60 AOE DMG &bull; 650 HP</div>
            </div>
            <button
              type="button"
              onClick={() => handleConstructBuilding('paper_mortar', 200, 'chakra')}
              className="mt-4 w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer"
            >
              Construct (🌀 200 Chakra)
            </button>
          </div>

          <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-2">🧱</div>
              <h4 className="text-sm font-bold text-white">Titanium Fortified Wall</h4>
              <p className="text-xs text-slate-400 mt-1">High-durability reinforced barrier to channel enemy routes.</p>
              <div className="text-xs text-slate-300 font-semibold mt-2">🛡️ 850 HP Absorption</div>
            </div>
            <button
              type="button"
              onClick={() => handleConstructBuilding('defense_wall', 80, 'berries')}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs cursor-pointer"
            >
              Construct (💰 80 Berries)
            </button>
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
            <button
              type="button"
              onClick={() => setActiveBuildTab('village')}
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-[#1e293b]"
            >
              Return to Map
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(HEROES_CATALOG).map((hero) => {
              const heroLevel = villageState.heroLevels?.[hero.id] || 1;
              const maxHeroLevel = getMaxHeroLevelForHQ(villageState.level);
              const stats = getHeroStatsForLevel(hero, heroLevel);
              const nextStats = getHeroStatsForLevel(hero, heroLevel + 1);
              const costInfo = getHeroUpgradeCost(hero.id, heroLevel);
              const isMaxedForHQ = heroLevel >= maxHeroLevel;
              const isUnlocked = villageState.unlockedHeroes.includes(hero.id);
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
                    <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden mb-2.5 border border-white/10 shadow-md">
                      <img
                        src={hero.image}
                        alt={hero.name}
                        className="w-full h-full object-cover object-top hover:scale-105 transition duration-500"
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

                    {/* Active Guard Status */}
                    {isActive ? (
                      <div className="py-1.5 text-center text-xs font-bold text-amber-400 bg-amber-400/10 rounded-xl border border-amber-400/30">
                        ★ Patrolling Guard Defender ★
                      </div>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => onUpdateVillage({ ...villageState, activeHeroId: hero.id })}
                        className="w-full py-1.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs transition cursor-pointer"
                      >
                        Assign as Patrol Guard
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateVillage({
                            ...villageState,
                            unlockedHeroes: [...villageState.unlockedHeroes, hero.id]
                          })
                        }
                        className="w-full py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer"
                      >
                        Recruit Hero (⭐ Free)
                      </button>
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
                <Sword size={18} className="text-red-400" />
                <span>Army Camp &amp; Syndicate Outpost Raid</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Train anime troops in your barracks and launch real-time village assaults against the evil Syndicate to loot resources!
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

              return (
                <div
                  key={troop.id}
                  className="p-4 rounded-3xl bg-[#0e172f] border border-[#1e3a6a] flex flex-col justify-between hover:border-red-500/50 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">{troop.icon}</span>
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                        {count} Ready
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{troop.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{troop.desc}</p>
                    <div className="mt-2 text-xs text-slate-300 space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Combat Power:</span>
                        <span className="text-red-400 font-bold">⚔️ {troop.attack} ATK &bull; {troop.hp} HP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Training Cost:</span>
                        <span className="text-amber-300 font-bold">{resIcon} {troop.cost}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
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
                  </div>
                </div>
              );
            })}
          </div>

          {/* Raid Target Card & Battle Launcher */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1c0e2a] via-[#100b24] to-[#070b16] border border-red-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-950/80 border-2 border-red-500 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                ☠️
              </div>
              <div>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">
                  SYNDICATE FORWARD COMPOUND &bull; SECTOR 7
                </span>
                <h4 className="text-lg font-black text-white mt-0.5">Neo-Shibuya Plunder Outpost</h4>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                  <span>💰 Plunder: <strong>650 - 1,100 Berries</strong></span>
                  <span>🌀 Plunder: <strong>500 - 850 Chakra</strong></span>
                  <span>🛡️ Fortifications: <strong>Heavy Cannons + Mortar</strong></span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setIsArenaRaidActive(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:brightness-110 text-white font-black text-sm shadow-[0_0_25px_rgba(239,68,68,0.7)] flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Sword size={18} />
                <span>Launch 2.5D Animated Marching Raid</span>
              </button>
              <button
                type="button"
                onClick={handleLaunchSyndicateRaid}
                disabled={isRaiding || totalTroopsCount < 4}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>{isRaiding ? 'Deploying...' : 'Quick Auto-Raid'}</span>
              </button>
            </div>
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
    </div>
  );
}
