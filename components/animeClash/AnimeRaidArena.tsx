'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PlayerVillageState, HeroData, FriendProfile } from '@/lib/animeClash/types';
import { HEROES_CATALOG, TROOPS_CATALOG, DEFAULT_FRIEND_BASES } from '@/lib/animeClash/gameData';
import { toIso, ISO_TILE_W, ISO_TILE_H, draw3DBox } from '@/lib/animeClash/isometricRenderer';
import { animeAudio } from '@/lib/animeClash/animeAudio';
import { Sword, ArrowLeft, Trophy, Zap, Shield, Sparkles, Users, RefreshCw } from 'lucide-react';

interface RaidBuilding {
  id: string;
  name: string;
  type: 'core' | 'cannon' | 'storage' | 'wall';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  destroyed: boolean;
  color: string;
}

interface RaidUnit {
  id: string;
  troopId: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  targetId: string | null;
  hp: number;
  maxHp: number;
  attack: number;
  speed: number;
  range: number;
  projectileType: 'shuriken' | 'fist' | 'getsuga' | 'magic';
  color: string;
  isHero?: boolean;
}

interface DefendingHero {
  id: string;
  name: string;
  heroId: string;
  avatar: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attack: number;
  range: number;
  color: string;
  defeated: boolean;
  quote: string;
}

interface Projectile {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  type: 'shuriken' | 'fist' | 'getsuga' | 'magic' | 'cannonball';
  progress: number;
  color: string;
}

interface AnimeRaidArenaProps {
  villageState: PlayerVillageState;
  targetFriend?: FriendProfile | null;
  onFinishRaid: (lootBerries: number, lootChakra: number, targetName?: string, stars?: number) => void;
  onClose: () => void;
}

export default function AnimeRaidArena({
  villageState,
  targetFriend: initialTargetFriend,
  onFinishRaid,
  onClose
}: AnimeRaidArenaProps) {
  const activeHero = HEROES_CATALOG[villageState.activeHeroId] || HEROES_CATALOG.naruto;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Available Targets (Default friends + custom imported friends + syndicate outpost)
  const allFriendTargets: FriendProfile[] = [
    ...(villageState.customFriends || []),
    ...DEFAULT_FRIEND_BASES
  ];

  const [selectedTarget, setSelectedTarget] = useState<FriendProfile>(
    initialTargetFriend || allFriendTargets[0]
  );

  // Helper to build enemy buildings from a FriendProfile
  const buildEnemyBuildingsFromProfile = (target: FriendProfile): RaidBuilding[] => {
    return target.buildings.map((b) => ({
      id: b.id,
      name: b.name,
      type: b.type === 'command_core' ? 'core' : b.type === 'defense_wall' ? 'wall' : b.type.includes('cannon') || b.type.includes('mortar') ? 'cannon' : 'storage',
      x: b.x,
      y: b.y,
      hp: b.hp || (b.type === 'command_core' ? 1800 : b.type === 'defense_wall' ? 850 : 650),
      maxHp: b.maxHp || (b.type === 'command_core' ? 1800 : b.type === 'defense_wall' ? 850 : 650),
      destroyed: false,
      color: b.color || '#dc2626'
    }));
  };

  const buildDefendingHeroFromProfile = (target: FriendProfile): DefendingHero => {
    const heroInfo = HEROES_CATALOG[target.activeHeroId] || HEROES_CATALOG.luffy;
    const coreBuilding = target.buildings.find((b) => b.type === 'command_core');
    const heroHp = (target.heroLevel || 1) * 350 + 850;
    return {
      id: `def_hero_${target.id}`,
      name: `${target.name.split(' ')[0]}'s ${heroInfo.name}`,
      heroId: heroInfo.id,
      avatar: heroInfo.avatar,
      x: coreBuilding ? coreBuilding.x : 5,
      y: coreBuilding ? coreBuilding.y + 1 : 6,
      hp: heroHp,
      maxHp: heroHp,
      attack: (target.heroLevel || 1) * 25 + 65,
      range: 2.5,
      color: heroInfo.color,
      defeated: false,
      quote: heroInfo.quote
    };
  };

  const [enemyBuildings, setEnemyBuildings] = useState<RaidBuilding[]>(() =>
    buildEnemyBuildingsFromProfile(selectedTarget)
  );

  const [defendingHero, setDefendingHero] = useState<DefendingHero>(() =>
    buildDefendingHeroFromProfile(selectedTarget)
  );

  const [deployedUnits, setDeployedUnits] = useState<RaidUnit[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [selectedDeployTroop, setSelectedDeployTroop] = useState<string>('hero');
  const [heroDeployed, setHeroDeployed] = useState(false);
  const [availableTroops, setAvailableTroops] = useState(
    villageState.trainedTroops || { konoha_ninja: 8, strawhat_brawler: 4, shinigami_patrol: 4, black_bulls_mage: 2 }
  );

  const [lootEarned, setLootEarned] = useState({ berries: 0, chakra: 0 });
  const [destructionPct, setDestructionPct] = useState(0);
  const [battleFinished, setBattleFinished] = useState(false);
  const [heroClashActive, setHeroClashActive] = useState(false);

  // References for Animation Loop
  const buildingsRef = useRef(enemyBuildings);
  buildingsRef.current = enemyBuildings;
  const defHeroRef = useRef(defendingHero);
  defHeroRef.current = defendingHero;
  const unitsRef = useRef(deployedUnits);
  unitsRef.current = deployedUnits;
  const projsRef = useRef(projectiles);
  projsRef.current = projectiles;

  // Change Target Base
  const handleSelectRival = (target: FriendProfile) => {
    if (deployedUnits.length > 0) {
      if (!confirm('Switching rival bases will retreat current deployed troops. Continue?')) return;
    }
    setSelectedTarget(target);
    const newBuildings = buildEnemyBuildingsFromProfile(target);
    const newHero = buildDefendingHeroFromProfile(target);
    setEnemyBuildings(newBuildings);
    setDefendingHero(newHero);
    setDeployedUnits([]);
    setProjectiles([]);
    setHeroDeployed(false);
    setLootEarned({ berries: 0, chakra: 0 });
    setDestructionPct(0);
    setBattleFinished(false);
    setHeroClashActive(false);
  };

  // Real-time Battle Physics Loop (60FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = Date.now();

    const render = () => {
      const now = Date.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const w = canvas.width;
      const h = canvas.height;
      const originX = w / 2;
      const originY = 60;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw Rival Sanctuary Grassy Clearing
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, w, h);

      // Red Outer Deployment Boundary Line
      for (let gy = 0; gy < 11; gy++) {
        for (let gx = 0; gx < 11; gx++) {
          const p = toIso(gx, gy, originX, originY);
          const isEdge = gx === 0 || gx === 10 || gy === 0 || gy === 10;
          ctx.fillStyle = isEdge ? '#3b0764' : (gx + gy) % 2 === 0 ? '#1f2937' : '#111827';

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + ISO_TILE_W / 2, p.y + ISO_TILE_H / 2);
          ctx.lineTo(p.x, p.y + ISO_TILE_H);
          ctx.lineTo(p.x - ISO_TILE_W / 2, p.y + ISO_TILE_H / 2);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = isEdge ? 'rgba(192, 132, 252, 0.4)' : 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // 2. Update Units Movement & Attack
      const curUnits = [...unitsRef.current];
      const curBuildings = [...buildingsRef.current];
      const curProjs = [...projsRef.current];
      const dHero = defHeroRef.current;

      let isClashing = false;

      // Attacking units action
      curUnits.forEach((unit) => {
        // If defending hero is alive and unit is hero, prioritize 1v1 duel!
        let targetX = 0;
        let targetY = 0;
        let isAttackingHero = false;

        const distToDefHero = dHero && !dHero.defeated ? Math.hypot(dHero.x - unit.x, dHero.y - unit.y) : 999;

        if (dHero && !dHero.defeated && (unit.isHero || distToDefHero < 2.5)) {
          targetX = dHero.x;
          targetY = dHero.y;
          isAttackingHero = true;
          if (unit.isHero && distToDefHero < 3.0) isClashing = true;
        } else {
          // Target closest alive building
          const aliveTargets = curBuildings.filter((b) => !b.destroyed);
          if (aliveTargets.length === 0) return;

          aliveTargets.sort((a, b) => {
            const distA = Math.hypot(a.x - unit.x, a.y - unit.y);
            const distB = Math.hypot(b.x - unit.x, b.y - unit.y);
            return distA - distB;
          });

          const target = aliveTargets[0];
          targetX = target.x;
          targetY = target.y;
        }

        const dist = Math.hypot(targetX - unit.x, targetY - unit.y);

        if (dist > unit.range) {
          // Walk toward target
          const angle = Math.atan2(targetY - unit.y, targetX - unit.x);
          unit.x += Math.cos(angle) * unit.speed * dt;
          unit.y += Math.sin(angle) * unit.speed * dt;
        } else {
          // In range: attack!
          if (Math.random() < 0.05) {
            if (isAttackingHero && dHero && !dHero.defeated) {
              dHero.hp -= unit.attack;
              animeAudio.playCombatSFX('sword');

              if (dHero.hp <= 0) {
                dHero.defeated = true;
                dHero.hp = 0;
                setLootEarned((prev) => ({
                  berries: prev.berries + 500,
                  chakra: prev.chakra + 350
                }));
                animeAudio.playHeroShout(activeHero.id);
              }
            } else {
              const target = curBuildings.find((b) => !b.destroyed && Math.hypot(b.x - unit.x, b.y - unit.y) <= unit.range + 0.5);
              if (target) {
                target.hp -= unit.attack;
                animeAudio.playCombatSFX(unit.projectileType === 'shuriken' ? 'shuriken' : unit.projectileType === 'getsuga' ? 'sword' : 'spell');

                if (target.hp <= 0) {
                  target.destroyed = true;
                  target.hp = 0;
                  if (target.type === 'storage') {
                    setLootEarned((prev) => ({
                      berries: prev.berries + Math.round(selectedTarget.berriesLoot * 0.4),
                      chakra: prev.chakra + Math.round(selectedTarget.chakraLoot * 0.4)
                    }));
                  } else if (target.type === 'core') {
                    setLootEarned((prev) => ({
                      berries: prev.berries + Math.round(selectedTarget.berriesLoot * 0.6),
                      chakra: prev.chakra + Math.round(selectedTarget.chakraLoot * 0.6)
                    }));
                  }
                }
              }
            }

            // Spawn projectile
            const startPos = toIso(unit.x, unit.y, originX, originY);
            const endPos = toIso(targetX, targetY, originX, originY);
            curProjs.push({
              x: startPos.x,
              y: startPos.y,
              targetX: endPos.x,
              targetY: endPos.y - 15,
              type: unit.projectileType,
              progress: 0,
              color: unit.color
            });
          }
        }
      });

      // Defending Hero AI action
      if (dHero && !dHero.defeated && curUnits.length > 0) {
        // Target nearest attacking unit
        curUnits.sort((a, b) => Math.hypot(a.x - dHero.x, a.y - dHero.y) - Math.hypot(b.x - dHero.x, b.y - dHero.y));
        const nearUnit = curUnits[0];
        const dist = Math.hypot(nearUnit.x - dHero.x, nearUnit.y - dHero.y);

        if (dist > dHero.range) {
          const angle = Math.atan2(nearUnit.y - dHero.y, nearUnit.x - dHero.x);
          dHero.x += Math.cos(angle) * 1.8 * dt;
          dHero.y += Math.sin(angle) * 1.8 * dt;
        } else {
          if (Math.random() < 0.04) {
            nearUnit.hp -= dHero.attack;
            animeAudio.playCombatSFX('cannon');
            if (nearUnit.hp <= 0) {
              const uIdx = curUnits.indexOf(nearUnit);
              if (uIdx !== -1) curUnits.splice(uIdx, 1);
            }
          }
        }
      }

      setHeroClashActive(isClashing);

      // 3. Update & Draw Projectiles
      for (let i = curProjs.length - 1; i >= 0; i--) {
        const pr = curProjs[i];
        pr.progress += dt * 3.5;
        const curX = pr.x + (pr.targetX - pr.x) * pr.progress;
        const curY = pr.y + (pr.targetY - pr.y) * pr.progress;

        ctx.fillStyle = pr.color;
        ctx.shadowColor = pr.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(curX, curY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (pr.progress >= 1) {
          curProjs.splice(i, 1);
        }
      }

      // 4. Draw Buildings (Sort by depth)
      curBuildings.sort((a, b) => a.x + a.y - (b.x + b.y));
      curBuildings.forEach((b) => {
        const p = toIso(b.x, b.y, originX, originY);
        const cx = p.x;
        const cy = p.y + ISO_TILE_H / 2;

        if (b.destroyed) {
          draw3DBox(ctx, cx, cy, 26, 14, 4, '#292524', '#1c1917', '#44403c');
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('💥 RUINS', cx, cy - 8);
        } else {
          if (b.type === 'core') {
            draw3DBox(ctx, cx, cy, 40, 22, 24, '#7f1d1d', '#450a0a', '#b91c1c');
            ctx.fillStyle = '#f87171';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🏯 CITADEL', cx, cy - 28);
          } else if (b.type === 'cannon') {
            draw3DBox(ctx, cx, cy, 28, 16, 12, '#334155', '#1e293b', '#475569');
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(cx - 3, cy - 22, 6, 12);
          } else if (b.type === 'storage') {
            draw3DBox(ctx, cx, cy, 30, 18, 10, '#b45309', '#78350f', '#d97706');
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 8.5px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('💰 VAULT', cx, cy - 14);
          } else {
            draw3DBox(ctx, cx, cy, 22, 14, 16, '#475569', '#334155', '#64748b');
          }

          // Health Bar
          const pct = Math.max(0, b.hp / b.maxHp);
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(cx - 16, cy - 32, 32, 4);
          ctx.fillStyle = pct > 0.4 ? '#22c55e' : '#ef4444';
          ctx.fillRect(cx - 16, cy - 32, 32 * pct, 4);
        }
      });

      // 5. Draw Defending Hero (Friend's Champion)
      if (dHero && !dHero.defeated) {
        const hp = toIso(dHero.x, dHero.y, originX, originY);
        const hcx = hp.x;
        const hcy = hp.y + ISO_TILE_H / 2;

        // Flaming Aura Circle
        ctx.fillStyle = dHero.color + '26';
        ctx.beginPath();
        ctx.ellipse(hcx, hcy, 24, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = dHero.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Hero Avatar Token
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(hcx, hcy - 20, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.fillText(dHero.avatar, hcx, hcy - 14);

        // Defending Hero Tag & HP Bar
        const heroHpPct = Math.max(0, dHero.hp / dHero.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(hcx - 28, hcy - 44, 56, 12);
        ctx.strokeStyle = '#fbbf24';
        ctx.strokeRect(hcx - 28, hcy - 44, 56, 12);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(hcx - 26, hcy - 42, 52 * heroHpPct, 8);

        ctx.font = 'bold 7.5px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`DEFENDER ${Math.round(dHero.hp)}`, hcx, hcy - 35);
      }

      // 6. Draw Attacking Units & Attacking Hero
      curUnits.forEach((u) => {
        const p = toIso(u.x, u.y, originX, originY);
        const cx = p.x;
        const cy = p.y + ISO_TILE_H / 2;

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        if (u.isHero) {
          // Attacking Hero Token
          ctx.fillStyle = u.color;
          ctx.beginPath();
          ctx.arc(cx, cy - 18, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = '14px serif';
          ctx.textAlign = 'center';
          ctx.fillText(u.icon, cx, cy - 13);
        } else {
          // Troop Unit Token
          ctx.fillStyle = u.color;
          ctx.beginPath();
          ctx.arc(cx, cy - 10, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '10px serif';
          ctx.textAlign = 'center';
          ctx.fillText(u.icon, cx, cy - 7);
        }

        // Unit Health Bar
        const pct = Math.max(0, u.hp / u.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(cx - 10, cy - (u.isHero ? 34 : 22), 20, 3);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(cx - 10, cy - (u.isHero ? 34 : 22), 20 * pct, 3);
      });

      // 7. Calculate Destruction & Stars
      const nonWallBuildings = curBuildings.filter((b) => b.type !== 'wall');
      const destroyedCount = nonWallBuildings.filter((b) => b.destroyed).length;
      const totalDestructible = Math.max(1, nonWallBuildings.length);
      const curPct = Math.round((destroyedCount / totalDestructible) * 100);
      setDestructionPct(curPct);

      if (curPct >= 100 && !battleFinished) {
        setBattleFinished(true);
      }

      setDeployedUnits(curUnits);
      setEnemyBuildings(curBuildings);
      setDefendingHero({ ...dHero });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [selectedTarget, battleFinished]);

  // Handle Deploy on Canvas (Unified Click & Mobile Touch)
  const handleDeployAt = (clientX: number, clientY: number) => {
    if (battleFinished) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (clientX - rect.left) * scaleX;
    const clickY = (clientY - rect.top) * scaleY;

    const originX = canvas.width / 2;
    const originY = 60;

    const dx = clickX - originX;
    const dy = clickY - originY;
    const gx = Math.floor((dx / (ISO_TILE_W / 2) + dy / (ISO_TILE_H / 2)) / 2);
    const gy = Math.floor((dy / (ISO_TILE_H / 2) - dx / (ISO_TILE_W / 2)) / 2);

    // Deployment only allowed in outer rim
    const isPerimeter = gx <= 1 || gx >= 9 || gy <= 1 || gy >= 9;
    if (!isPerimeter) {
      alert('⚠️ Deployment restricted! Deploy troops along the outer boundary tiles.');
      return;
    }

    if (selectedDeployTroop === 'hero') {
      if (heroDeployed) return;
      setHeroDeployed(true);
      animeAudio.playHeroShout(activeHero.id);

      const heroUnit: RaidUnit = {
        id: 'hero_unit',
        troopId: 'hero',
        name: activeHero.name,
        icon: activeHero.avatar,
        x: gx,
        y: gy,
        targetId: null,
        hp: activeHero.hp,
        maxHp: activeHero.maxHp,
        attack: activeHero.attack,
        speed: activeHero.speed * 0.75,
        range: activeHero.range,
        projectileType: activeHero.id === 'naruto' ? 'shuriken' : activeHero.id === 'luffy' ? 'fist' : activeHero.id === 'ichigo' ? 'getsuga' : 'magic',
        color: activeHero.color,
        isHero: true
      };

      setDeployedUnits((prev) => [...prev, heroUnit]);
    } else {
      const count = availableTroops[selectedDeployTroop] || 0;
      if (count <= 0) return;

      const troopData = TROOPS_CATALOG.find((t) => t.id === selectedDeployTroop);
      if (!troopData) return;

      setAvailableTroops((prev) => ({
        ...prev,
        [selectedDeployTroop]: prev[selectedDeployTroop] - 1
      }));

      const newUnit: RaidUnit = {
        id: `unit_${Date.now()}_${Math.random()}`,
        troopId: troopData.id,
        name: troopData.name,
        icon: troopData.icon,
        x: gx,
        y: gy,
        targetId: null,
        hp: troopData.hp,
        maxHp: troopData.hp,
        attack: troopData.attack,
        speed: troopData.speed * 0.7,
        range: troopData.range,
        projectileType: troopData.id === 'konoha_ninja' ? 'shuriken' : troopData.id === 'strawhat_brawler' ? 'fist' : troopData.id === 'shinigami_patrol' ? 'getsuga' : 'magic',
        color: '#38bdf8'
      };

      setDeployedUnits((prev) => [...prev, newUnit]);
    }
  };

  const handleDeployOnCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleDeployAt(e.clientX, e.clientY);
  };

  const handleDeployTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      handleDeployAt(touch.clientX, touch.clientY);
    }
  };

  const handleFinishAndCollect = () => {
    const stars = destructionPct >= 100 ? 3 : destructionPct >= 70 ? 2 : destructionPct >= 40 ? 1 : 0;
    onFinishRaid(lootEarned.berries, lootEarned.chakra, selectedTarget.name, stars);
  };

  return (
    <div className="w-full max-w-7xl px-2 sm:px-4 flex flex-col gap-3 sm:gap-4 my-2 sm:my-3 animate-in fade-in transition-all">
      {/* 1. TOP COMBAT BAR & RIVAL SWITCHER */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-[#0b1226]/95 border border-purple-500/50 shadow-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-[#1e293b]"
          >
            <ArrowLeft size={14} />
            <span>Retreat to Base</span>
          </button>

          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Sword size={16} className="text-red-500" />
              <span>Multiplayer Raid: {selectedTarget.name}</span>
            </h3>
            <span className="text-xs text-amber-400 font-bold">
              Destruction: {destructionPct}% &bull;{' '}
              {destructionPct >= 100
                ? '⭐⭐⭐ 3-STAR VICTORY'
                : destructionPct >= 70
                ? '⭐⭐ 2-STAR'
                : destructionPct >= 40
                ? '⭐ 1-STAR'
                : '0-STAR'}
            </span>
          </div>
        </div>

        {/* Rival Base Matchmaking Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">RIVAL:</span>
          <select
            value={selectedTarget.id}
            onChange={(e) => {
              const found = allFriendTargets.find((f) => f.id === e.target.value);
              if (found) handleSelectRival(found);
            }}
            disabled={deployedUnits.length > 0}
            className="bg-[#1e293b] border border-purple-400/50 text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            {allFriendTargets.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} (HQ {f.level} &bull; 🏆 {f.trophies})
              </option>
            ))}
          </select>

          {/* Real-time Loot Counters */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
              💰 +{lootEarned.berries}
            </div>
            <div className="px-3 py-1 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs">
              🌀 +{lootEarned.chakra}
            </div>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME 2.5D RAID CANVAS */}
      <div className="relative w-full rounded-3xl overflow-hidden border-2 border-purple-900/60 shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={840}
          height={460}
          onClick={handleDeployOnCanvas}
          onTouchEnd={handleDeployTouch}
          className="w-full h-auto block cursor-crosshair select-none touch-manipulation"
        />

        {/* Deployment Instruction Banner */}
        <div className="absolute top-3 left-4 px-3 py-1 rounded-full bg-black/80 border border-purple-500/50 text-[11px] text-purple-200 font-bold pointer-events-none flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span>TAP PURPLE OUTER PERIMETER TILES TO DEPLOY ATTACKERS</span>
        </div>

        {/* Hero 1v1 Clash Banner */}
        {heroClashActive && (
          <div className="absolute top-3 right-4 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 border border-amber-300 text-slate-950 font-black text-xs shadow-lg animate-pulse flex items-center gap-1.5">
            <Sword size={14} className="text-white animate-spin" />
            <span>⚔️ HERO 1v1 CLASH ACTIVE!</span>
          </div>
        )}

        {/* Victory Popup */}
        {battleFinished && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
            <Trophy size={48} className="text-yellow-400 animate-bounce mb-2" />
            <h2 className="text-2xl font-black text-white">100% BASE ANNIHILATION!</h2>
            <div className="text-amber-400 text-xl font-bold my-1">⭐⭐⭐ 3-STAR VICTORY</div>
            <p className="text-sm text-slate-300 max-w-md mt-1">
              You completely flattened {selectedTarget.name}&apos;s sanctuary and defeated their defending champion!
            </p>

            <div className="flex items-center gap-4 my-4">
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500 text-amber-300 font-black text-base">
                💰 +{lootEarned.berries} Berries Plundered
              </div>
              <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500 text-cyan-300 font-black text-base">
                🌀 +{lootEarned.chakra} Chakra Secured
              </div>
              <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-500 text-purple-300 font-black text-base">
                🏆 +32 Trophies
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishAndCollect}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 text-white font-extrabold text-sm shadow-xl cursor-pointer"
            >
              Collect Plunder &amp; Return to Base
            </button>
          </div>
        )}
      </div>

      {/* 3. TROOP & HERO DEPLOYMENT BAR */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl bg-[#0b1226]/95 border border-[#1e2a4a] overflow-x-auto">
        <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-400 uppercase ml-1">DEPLOY UNIT:</span>

        {/* Hero Deploy Button */}
        <button
          type="button"
          onClick={() => setSelectedDeployTroop('hero')}
          disabled={heroDeployed}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black transition cursor-pointer ${
            selectedDeployTroop === 'hero'
              ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
              : 'bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40'
          }`}
        >
          <span>{activeHero.avatar}</span>
          <span>{activeHero.name.split(' ')[0]} (HERO)</span>
          <span className="text-[10px] bg-black/40 text-amber-300 px-1.5 py-0.5 rounded-full">
            {heroDeployed ? 'DEPLOYED' : 'READY'}
          </span>
        </button>

        {/* Troop Units */}
        {TROOPS_CATALOG.map((t) => {
          const count = availableTroops[t.id] || 0;
          const isSelected = selectedDeployTroop === t.id;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedDeployTroop(t.id)}
              disabled={count <= 0}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                isSelected
                  ? 'bg-red-600 text-white ring-2 ring-red-400'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40'
              }`}
            >
              <span className="text-base">{t.icon}</span>
              <span>{t.name.split(' ')[0]}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/50 text-cyan-300 font-bold">
                x{count}
              </span>
            </button>
          );
        })}

        {/* End Raid Button if user wants to retreat with partial stars */}
        <button
          type="button"
          onClick={handleFinishAndCollect}
          className="ml-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs text-slate-300 font-bold cursor-pointer"
        >
          End Battle &amp; Claim Plunder
        </button>
      </div>
    </div>
  );
}
