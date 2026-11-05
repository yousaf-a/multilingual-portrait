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
  TROOPS_CATALOG
} from '@/lib/animeClash/gameData';
import {
  toIso,
  fromIso,
  drawIsoTerrain,
  drawIsoBuilding,
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
  Play
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
  const [activeBuildTab, setActiveBuildTab] = useState<'village' | 'shop' | 'heroes'>('village');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  const activeHero = HEROES_CATALOG[villageState.activeHeroId] || HEROES_CATALOG.naruto;

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

      // 2. Depth Sort Buildings (Back to front: x + y)
      const sorted = [...villageState.buildings].sort((a, b) => (a.x + a.y) - (b.x + b.y));

      // 3. Render 3D Buildings
      for (const b of sorted) {
        const isSelected = selectedBuilding?.id === b.id;
        drawIsoBuilding(ctx, b, originX, originY, elapsed, isSelected);
      }

      // 4. Draw Clash of Clans Top HUD
      drawClashHUD(ctx, width, villageState, activeHero.name);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [villageState, selectedBuilding, activeHero]);

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

    // Find building at clicked tile (or nearby within 1 tile)
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
    let found = false;

    for (let y = 1; y < 11; y++) {
      for (let x = 1; x < 11; x++) {
        if (!occupied.has(`${x},${y}`)) {
          freeX = x;
          freeY = y;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    const newBuilding: BuildingInstance = {
      id: `b_${Date.now()}`,
      type,
      name: type === 'haki_cannon' ? 'Haki Cannon' : type === 'paper_mortar' ? 'Paper Mortar' : 'Titanium Wall',
      level: 1,
      x: freeX,
      y: freeY,
      hp: type === 'defense_wall' ? 850 : 700,
      maxHp: type === 'defense_wall' ? 850 : 700,
      attack: type === 'haki_cannon' ? 50 : type === 'paper_mortar' ? 60 : undefined,
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
                HQ LVL {villageState.level}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Active Defender: <strong className="text-white">{activeHero.name}</strong>
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
      <div className="flex items-center gap-2 bg-[#080d1e] p-1 rounded-2xl border border-[#1e2f54] self-start">
        <button
          type="button"
          onClick={() => setActiveBuildTab('village')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeBuildTab === 'village' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🏰 Isometric Village
        </button>
        <button
          type="button"
          onClick={() => setActiveBuildTab('shop')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeBuildTab === 'shop' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🔨 Defense Shop
        </button>
        <button
          type="button"
          onClick={() => setActiveBuildTab('heroes')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeBuildTab === 'heroes' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          👑 Hero Roster (4)
        </button>
      </div>

      {/* 3. MAIN INTERACTIVE CONTENT */}
      {activeBuildTab === 'village' && (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* Real 2.5D Isometric Canvas (Clash of Clans Style) */}
          <div className="flex-1 w-full rounded-3xl overflow-hidden border-2 border-[#1e3a5f] shadow-2xl relative bg-[#091522]">
            <canvas
              ref={canvasRef}
              width={820}
              height={520}
              onClick={handleCanvasClick}
              className="w-full aspect-[16/10] object-cover cursor-pointer"
            />
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-[11px] text-slate-300 pointer-events-none">
              💡 Tap any building to inspect or upgrade!
            </div>
          </div>

          {/* Right Inspector Panel: Building Info or Full Tactical Hero Showcase */}
          <div className="w-full lg:w-80 flex flex-col gap-3">
            {selectedBuilding ? (
              <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl backdrop-blur-md animate-in fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{selectedBuilding.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{selectedBuilding.name}</h4>
                      <span className="text-[11px] text-amber-400 font-semibold">Level {selectedBuilding.level}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBuilding(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-300 my-4 p-3.5 rounded-2xl bg-[#080d1e] border border-[#1e2a4a]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Durability (HP):</span>
                    <span className="font-bold text-emerald-400">{selectedBuilding.hp} / {selectedBuilding.maxHp}</span>
                  </div>
                  {selectedBuilding.productionRate && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Passive Income:</span>
                      <span className="font-bold text-cyan-400">+{selectedBuilding.productionRate} / min</span>
                    </div>
                  )}
                  {selectedBuilding.attack && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Firepower:</span>
                      <span className="font-bold text-red-400">⚔️ {selectedBuilding.attack} DMG</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleUpgradeBuilding(selectedBuilding)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ArrowUpCircle size={15} />
                  <span>Upgrade to Level {selectedBuilding.level + 1} (💰 {selectedBuilding.level * 150})</span>
                </button>
              </div>
            ) : (
              /* Tactical Streetwear Anime Hero Character Showcase (Reference Art Image) */
              <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-4 shadow-xl backdrop-blur-md flex flex-col">
                {/* Hero Character Art */}
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

                <p className="text-xs text-slate-300 italic mb-2 px-1">&ldquo;{activeHero.quote}&rdquo;</p>

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

      {/* 4. DEFENSE SHOP TAB */}
      {activeBuildTab === 'shop' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-2">💣</div>
              <h4 className="text-sm font-bold text-white">Haki Rail Cannon</h4>
              <p className="text-xs text-slate-400 mt-1">Heavy single-target defense turret infused with Armament Haki.</p>
              <div className="text-xs text-red-400 font-semibold mt-2">⚔️ 50 Attack DMG • 750 HP</div>
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
              <div className="text-xs text-amber-400 font-semibold mt-2">💥 60 AOE DMG • 650 HP</div>
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

      {/* 5. HERO ROSTER TAB (Real Artwork Cards) */}
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
                    ? 'border-amber-400 bg-[#16213e] shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                    : isUnlocked
                    ? 'border-[#22335c] bg-[#0b1226]'
                    : 'border-slate-800 bg-[#070b16] opacity-60'
                }`}
              >
                <div>
                  {/* Real Character Illustration */}
                  <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-[#1f2d4d] mb-2.5 bg-[#080d1e]">
                    <img
                      src={hero.image}
                      alt={hero.name}
                      className="w-full h-full object-cover object-top"
                    />
                    {isActive && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                        ACTIVE GUARD
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white">{hero.name}</h4>
                  <div className="text-[11px] text-amber-400 font-medium mb-1.5">{hero.title}</div>

                  <div className="text-[11px] space-y-0.5 text-slate-300">
                    <div>❤️ HP: <strong>{hero.hp}</strong></div>
                    <div>⚔️ ATK: <strong>{hero.attack}</strong></div>
                    <div className="text-cyan-300 font-medium pt-0.5">
                      Ultimate: {hero.ultimateName}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  {isUnlocked ? (
                    <button
                      type="button"
                      disabled={isActive}
                      onClick={() => onUpdateVillage({ ...villageState, activeHeroId: hero.id })}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 cursor-default'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {isActive ? 'Current Defender' : 'Set as Guard'}
                    </button>
                  ) : (
                    <div className="text-[10px] text-slate-500 text-center py-1">
                      🔒 Complete Chapter to Unlock
                    </div>
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
