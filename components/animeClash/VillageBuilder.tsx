'use client';

import React, { useState } from 'react';
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
  Shield,
  Zap,
  Coins,
  Sparkles,
  Sword,
  Wrench,
  Plus,
  ArrowUpCircle,
  BookOpen,
  Info
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

  const activeHero = HEROES_CATALOG[villageState.activeHeroId] || HEROES_CATALOG.naruto;

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
      {/* 1. TOP STATUS & RESOURCE BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-3xl bg-[#0b1226]/95 border border-[#1e2a4a] shadow-xl backdrop-blur-md">
        {/* Village Level & Active Hero Emblem */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border"
            style={{ backgroundColor: activeHero.color + '25', borderColor: activeHero.color }}
          >
            <span>{activeHero.avatar}</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Neo-Sanctuary Base</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                HQ LVL {villageState.level}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Guard: <strong className="text-white">{activeHero.name}</strong></span>
              <span>•</span>
              <span className="text-slate-500">{activeHero.franchise.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Resources Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Berries */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-bold">
            <Coins size={14} className="text-amber-400" />
            <span>{villageState.berries}</span>
          </div>
          {/* Chakra */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs font-bold">
            <Zap size={14} className="text-cyan-400" />
            <span>{villageState.chakra}</span>
          </div>
          {/* Reishi */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-300 text-xs font-bold">
            <Sparkles size={14} className="text-purple-400" />
            <span>{villageState.reishi}</span>
          </div>

          {/* Collect Button */}
          <button
            type="button"
            onClick={handleCollectResources}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
          >
            <span>Harvest All</span>
          </button>
        </div>

        {/* Quick Battle & Story Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenStory}
            className="px-3.5 py-2 rounded-xl bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <BookOpen size={14} className="text-amber-400" />
            <span>Story Chronicles</span>
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

      {/* 2. MODE NAVIGATION TABS */}
      <div className="flex items-center gap-2 bg-[#080d1e] p-1 rounded-2xl border border-[#1e2f54] self-start">
        <button
          type="button"
          onClick={() => setActiveBuildTab('village')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeBuildTab === 'village' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🏰 Base Map
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
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Tactical 12x12 Grid Canvas Map */}
          <div className="flex-1 bg-[#091522] border-2 border-[#1e3a5f] rounded-3xl p-3 shadow-2xl relative overflow-hidden flex flex-col items-center">
            <div className="text-[11px] text-slate-400 font-mono mb-2 flex items-center justify-between w-full px-2">
              <span>SECTOR: NEO-TOKYO METROPOLITAN PERIMETER</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                DEFENSIVE SHIELD: ACTIVE
              </span>
            </div>

            {/* Grid Container (11x11 visual tiles) */}
            <div className="grid grid-cols-11 gap-1.5 bg-[#0e1d2f]/90 p-3 rounded-2xl border border-[#182e4a] shadow-inner max-w-full overflow-x-auto">
              {Array.from({ length: 11 }).map((_, y) => (
                <React.Fragment key={y}>
                  {Array.from({ length: 11 }).map((_, x) => {
                    const building = villageState.buildings.find((b) => b.x === x && b.y === y);
                    const isCore = building?.type === 'command_core';
                    const isSelected = selectedBuilding?.id === building?.id;

                    return (
                      <div
                        key={`${x}-${y}`}
                        onClick={() => building && setSelectedBuilding(building)}
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex flex-col items-center justify-center transition relative cursor-pointer ${
                          building
                            ? isSelected
                              ? 'ring-2 ring-amber-400 bg-[#1e3a5f] shadow-lg scale-105'
                              : 'bg-[#132237] hover:bg-[#1a314f] border border-[#23456b]'
                            : 'bg-[#0b1420]/60 hover:bg-[#13253b]/40 border border-[#142336]/40'
                        }`}
                      >
                        {building && (
                          <>
                            <span className="text-base sm:text-lg select-none">{building.icon}</span>
                            <span className="text-[8px] font-bold text-slate-300 leading-none">
                              L{building.level}
                            </span>
                            {/* Health bar dot */}
                            <span
                              className="absolute bottom-0.5 w-3 h-0.5 rounded-full"
                              style={{ backgroundColor: building.color }}
                            />
                          </>
                        )}
                        {!building && (
                          <span className="text-[9px] text-slate-700 font-mono select-none">
                            {x},{y}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right Panel: Selected Building Inspector or Hero Card */}
          <div className="w-full lg:w-80 flex flex-col gap-3">
            {selectedBuilding ? (
              <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-4 shadow-xl backdrop-blur-md animate-in fade-in">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedBuilding.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{selectedBuilding.name}</h4>
                      <span className="text-[11px] text-slate-400">Level {selectedBuilding.level}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBuilding(null)}
                    className="text-xs text-slate-500 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 my-3 p-3 rounded-2xl bg-[#080d1e] border border-[#1e2a4a]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Durability (HP):</span>
                    <span className="font-bold text-emerald-400">{selectedBuilding.hp} / {selectedBuilding.maxHp}</span>
                  </div>
                  {selectedBuilding.productionRate && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Production Rate:</span>
                      <span className="font-bold text-cyan-400">+{selectedBuilding.productionRate} / min</span>
                    </div>
                  )}
                  {selectedBuilding.attack && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Firepower Attack:</span>
                      <span className="font-bold text-red-400">⚔️ {selectedBuilding.attack} DMG</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Grid Position:</span>
                    <span className="font-mono text-slate-300">X: {selectedBuilding.x}, Y: {selectedBuilding.y}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpgradeBuilding(selectedBuilding)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ArrowUpCircle size={15} />
                  <span>Upgrade to Level {selectedBuilding.level + 1} (💰 {selectedBuilding.level * 150})</span>
                </button>
              </div>
            ) : (
              /* Active Hero Showcase Card */
              <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl border shadow-lg"
                    style={{ backgroundColor: activeHero.color + '20', borderColor: activeHero.color }}
                  >
                    <span>{activeHero.avatar}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{activeHero.name}</h4>
                    <span className="text-[11px] text-amber-400 font-medium">{activeHero.title}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic mb-3">&ldquo;{activeHero.quote}&rdquo;</p>

                <div className="space-y-1.5 text-xs text-slate-300 p-3 rounded-2xl bg-[#080d1e] border border-[#1e2a4a] mb-3">
                  <div className="text-[11px] text-slate-400">
                    <strong>Modern Wardrobe:</strong> {activeHero.modernOutfit}
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    <strong className="text-white">Signature Skill:</strong> {activeHero.skillName} ({activeHero.skillDesc})
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    <strong className="text-amber-400">Ultimate:</strong> {activeHero.ultimateName} ({activeHero.ultimateDesc})
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 text-center">
                  Select any building on the map to inspect or upgrade.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. DEFENSE SHOP TAB */}
      {activeBuildTab === 'shop' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Haki Cannon */}
          <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-2">💣</div>
              <h4 className="text-sm font-bold text-white">Haki Rail Cannon</h4>
              <p className="text-xs text-slate-400 mt-1">Heavy single-target defense turret infused with Armament Haki. Shatters armored enemy tanks.</p>
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

          {/* Paper Mortar */}
          <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-2">💥</div>
              <h4 className="text-sm font-bold text-white">Paper-Bomb Mortar</h4>
              <p className="text-xs text-slate-400 mt-1">Konoha AOE explosive tag launcher. Fires high-arching volleys into swarms of infantry troops.</p>
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

          {/* Titanium Wall */}
          <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-2">🧱</div>
              <h4 className="text-sm font-bold text-white">Titanium Fortified Wall</h4>
              <p className="text-xs text-slate-400 mt-1">High-durability reinforced barrier to channel and delay enemy attack routes.</p>
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

      {/* 5. HERO ROSTER TAB */}
      {activeBuildTab === 'heroes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(HEROES_CATALOG).map((hero) => {
            const isUnlocked = villageState.unlockedHeroes.includes(hero.id);
            const isActive = villageState.activeHeroId === hero.id;

            return (
              <div
                key={hero.id}
                className={`p-4 rounded-3xl border flex flex-col justify-between transition ${
                  isActive
                    ? 'border-amber-400 bg-[#16213e] shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                    : isUnlocked
                    ? 'border-[#22335c] bg-[#0b1226]'
                    : 'border-slate-800 bg-[#070b16] opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{hero.avatar}</span>
                    {isActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                        ACTIVE GUARD
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[10px] text-emerald-400 font-semibold">READY</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold">🔒 LOCKED</span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white">{hero.name}</h4>
                  <div className="text-[11px] text-slate-400 mb-2">{hero.title}</div>

                  <div className="text-[11px] space-y-1 text-slate-300">
                    <div>❤️ HP: <strong>{hero.hp}</strong></div>
                    <div>⚔️ Attack: <strong>{hero.attack}</strong></div>
                    <div className="text-amber-300 font-semibold pt-1">
                      Ultimate: {hero.ultimateName}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
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
                      Unlock by completing Story Chapters
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
