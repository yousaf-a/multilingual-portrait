'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  PlayerVillageState,
  BuildingInstance,
  BuildingType,
  HeroData
} from '@/lib/animeClash/types';
import {
  HEROES_CATALOG,
  TROOPS_CATALOG,
  VILLAGE_HQ_LEVEL_PLANS,
  BASE_LAYOUT_PRESETS,
  BaseLayoutPreset
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
  Crown
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
  const [activeBuildTab, setActiveBuildTab] = useState<'village' | 'shop' | 'heroes' | 'layouts' | 'roadmap'>('village');
  const [isRelocatingBuildingId, setIsRelocatingBuildingId] = useState<string | null>(null);
  const [heroInteractionQuote, setHeroInteractionQuote] = useState<string | null>(null);

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
    img.onload = () => {
      heroImgRef.current = img;
    };
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
      const elapsed = (Date.now() - startTime) / 1000;

      const width = canvas.width;
      const height = canvas.height;
      const originX = width / 2;
      const originY = 70;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw 2.5D Lush Grass Terrain & Forest Perimeter
      drawIsoTerrain(ctx, width, height, originX, originY, 12);

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
            false
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
  }, [villageState, selectedBuilding, activeHero, isRelocatingBuildingId]);

  // Handle Isometric Map Click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const originX = canvas.width / 2;
    const originY = 70;

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

  // Upgrade building
  const handleUpgradeBuilding = (b: BuildingInstance) => {
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
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
            onClick={onLaunchBattle}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition cursor-pointer"
          >
            <Sword size={14} />
            <span>⚔️ Attack / Raid!</span>
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
          onClick={() => setActiveBuildTab('village')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeBuildTab === 'village' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🏰 Isometric Village
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
            activeBuildTab === 'roadmap' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Star size={13} className="text-yellow-300" />
          <span>Leveling Plans (HQ {villageState.level})</span>
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
        <button
          type="button"
          onClick={() => setActiveBuildTab('heroes')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeBuildTab === 'heroes' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          👑 Hero Roster (4)
        </button>
      </div>

      {/* 3. MAIN INTERACTIVE CONTENT: ISOMETRIC VILLAGE */}
      {activeBuildTab === 'village' && (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* Real 2.5D Isometric Canvas */}
          <div className="flex-1 w-full rounded-3xl overflow-hidden border-2 border-[#1e3a5f] shadow-2xl relative bg-[#091522]">
            <canvas
              ref={canvasRef}
              width={820}
              height={440}
              onClick={handleCanvasClick}
              className="w-full h-auto block cursor-crosshair"
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
                  {heroInteractionQuote ? `💬 ${heroInteractionQuote}` : `&ldquo;${activeHero.quote}&rdquo;`}
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

          {/* Leveling Progression Roadmap Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#1e2f54]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0e1730] text-[11px] text-slate-400 uppercase font-mono">
                <tr>
                  <th className="p-3">HQ Level</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Storage Cap</th>
                  <th className="p-3">Max Buildings</th>
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
                      <td className="p-3">{plan.maxStorage.toLocaleString()}</td>
                      <td className="p-3">{plan.maxBuildings}</td>
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

      {/* 7. HERO ROSTER TAB */}
      {activeBuildTab === 'heroes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(HEROES_CATALOG).map((hero) => {
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
                    <div className="absolute top-2 right-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-black/70 text-white font-mono border border-white/20">
                        HP {hero.hp}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white">{hero.name}</h4>
                  <p className="text-[11px] text-amber-300">{hero.title}</p>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 italic">
                    &ldquo;{hero.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-3">
                  {isActive ? (
                    <div className="py-2 text-center text-xs font-bold text-amber-400 bg-amber-400/10 rounded-xl border border-amber-400/30">
                      ★ Active Guard Defender ★
                    </div>
                  ) : isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => onUpdateVillage({ ...villageState, activeHeroId: hero.id })}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Assign as Guard
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
                      className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Recruit Hero (⭐ Free)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
