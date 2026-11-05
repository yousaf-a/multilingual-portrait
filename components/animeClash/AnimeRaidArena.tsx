'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PlayerVillageState, HeroData } from '@/lib/animeClash/types';
import { HEROES_CATALOG, TROOPS_CATALOG } from '@/lib/animeClash/gameData';
import { toIso, ISO_TILE_W, ISO_TILE_H, draw3DBox } from '@/lib/animeClash/isometricRenderer';
import { animeAudio } from '@/lib/animeClash/animeAudio';
import { Sword, ArrowLeft, Trophy, Zap, Shield, Sparkles } from 'lucide-react';

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
  onFinishRaid: (lootBerries: number, lootChakra: number) => void;
  onClose: () => void;
}

export default function AnimeRaidArena({
  villageState,
  onFinishRaid,
  onClose
}: AnimeRaidArenaProps) {
  const activeHero = HEROES_CATALOG[villageState.activeHeroId] || HEROES_CATALOG.naruto;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Enemy Syndicate Outpost Buildings
  const [enemyBuildings, setEnemyBuildings] = useState<RaidBuilding[]>([
    { id: 'b_core', name: 'Syndicate Command HQ', type: 'core', x: 5, y: 5, hp: 1600, maxHp: 1600, destroyed: false, color: '#dc2626' },
    { id: 'b_can1', name: 'Syndicate Rail Turret', type: 'cannon', x: 3, y: 5, hp: 650, maxHp: 650, destroyed: false, color: '#991b1b' },
    { id: 'b_can2', name: 'Syndicate Rail Turret', type: 'cannon', x: 7, y: 5, hp: 650, maxHp: 650, destroyed: false, color: '#991b1b' },
    { id: 'b_stor1', name: 'Stolen Berry Vault', type: 'storage', x: 5, y: 3, hp: 550, maxHp: 550, destroyed: false, color: '#f59e0b' },
    { id: 'b_stor2', name: 'Plundered Chakra Vat', type: 'storage', x: 5, y: 7, hp: 550, maxHp: 550, destroyed: false, color: '#06b6d4' },
    // Protective Walls
    { id: 'w1', name: 'Iron Wall', type: 'wall', x: 4, y: 4, hp: 500, maxHp: 500, destroyed: false, color: '#475569' },
    { id: 'w2', name: 'Iron Wall', type: 'wall', x: 5, y: 4, hp: 500, maxHp: 500, destroyed: false, color: '#475569' },
    { id: 'w3', name: 'Iron Wall', type: 'wall', x: 6, y: 4, hp: 500, maxHp: 500, destroyed: false, color: '#475569' },
    { id: 'w4', name: 'Iron Wall', type: 'wall', x: 4, y: 6, hp: 500, maxHp: 500, destroyed: false, color: '#475569' },
    { id: 'w5', name: 'Iron Wall', type: 'wall', x: 5, y: 6, hp: 500, maxHp: 500, destroyed: false, color: '#475569' },
    { id: 'w6', name: 'Iron Wall', type: 'wall', x: 6, y: 6, hp: 500, maxHp: 500, destroyed: false, color: '#475569' }
  ]);

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

  // References for Animation Loop
  const buildingsRef = useRef(enemyBuildings);
  buildingsRef.current = enemyBuildings;
  const unitsRef = useRef(deployedUnits);
  unitsRef.current = deployedUnits;
  const projsRef = useRef(projectiles);
  projsRef.current = projectiles;

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

      // 1. Draw Enemy Outpost Wasteland Grass
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, w, h);

      // Red Outer Deployment Boundary Line
      for (let gy = 0; gy < 11; gy++) {
        for (let gx = 0; gx < 11; gx++) {
          const p = toIso(gx, gy, originX, originY);
          const isEdge = gx === 0 || gx === 10 || gy === 0 || gy === 10;
          ctx.fillStyle = isEdge ? '#450a0a' : (gx + gy) % 2 === 0 ? '#292524' : '#1c1917';

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + ISO_TILE_W / 2, p.y + ISO_TILE_H / 2);
          ctx.lineTo(p.x, p.y + ISO_TILE_H);
          ctx.lineTo(p.x - ISO_TILE_W / 2, p.y + ISO_TILE_H / 2);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = isEdge ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // 2. Update Units Movement & Attack
      const curUnits = [...unitsRef.current];
      const curBuildings = [...buildingsRef.current];
      const curProjs = [...projsRef.current];

      curUnits.forEach((unit) => {
        // Find closest alive building
        const aliveTargets = curBuildings.filter((b) => !b.destroyed);
        if (aliveTargets.length === 0) return;

        aliveTargets.sort((a, b) => {
          const distA = Math.hypot(a.x - unit.x, a.y - unit.y);
          const distB = Math.hypot(b.x - unit.x, b.y - unit.y);
          return distA - distB;
        });

        const target = aliveTargets[0];
        const dist = Math.hypot(target.x - unit.x, target.y - unit.y);

        if (dist > unit.range) {
          // Walk toward target
          const angle = Math.atan2(target.y - unit.y, target.x - unit.x);
          unit.x += Math.cos(angle) * unit.speed * dt;
          unit.y += Math.sin(angle) * unit.speed * dt;
        } else {
          // In range: attack!
          if (Math.random() < 0.04) {
            target.hp -= unit.attack;
            animeAudio.playCombatSFX(unit.projectileType === 'shuriken' ? 'shuriken' : unit.projectileType === 'getsuga' ? 'sword' : 'spell');

            // Spawn projectile
            const startPos = toIso(unit.x, unit.y, originX, originY);
            const endPos = toIso(target.x, target.y, originX, originY);
            curProjs.push({
              x: startPos.x,
              y: startPos.y,
              targetX: endPos.x,
              targetY: endPos.y - 15,
              type: unit.projectileType,
              progress: 0,
              color: unit.color
            });

            if (target.hp <= 0) {
              target.destroyed = true;
              target.hp = 0;
              // Loot
              if (target.type === 'storage') {
                setLootEarned((prev) => ({
                  berries: prev.berries + 450,
                  chakra: prev.chakra + 350
                }));
              } else if (target.type === 'core') {
                setLootEarned((prev) => ({
                  berries: prev.berries + 600,
                  chakra: prev.chakra + 500
                }));
              }
            }
          }
        }
      });

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
          // Destroyed Rubble
          draw3DBox(ctx, cx, cy, 26, 14, 4, '#292524', '#1c1917', '#44403c');
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('💥 RUINS', cx, cy - 8);
        } else {
          // Alive Building
          if (b.type === 'core') {
            draw3DBox(ctx, cx, cy, 40, 22, 24, '#7f1d1d', '#450a0a', '#b91c1c');
            ctx.fillStyle = '#f87171';
            ctx.fillText('🏛️ HQ', cx, cy - 28);
          } else if (b.type === 'cannon') {
            draw3DBox(ctx, cx, cy, 28, 16, 12, '#334155', '#1e293b', '#475569');
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(cx - 3, cy - 22, 6, 12);
          } else if (b.type === 'storage') {
            draw3DBox(ctx, cx, cy, 30, 18, 10, '#b45309', '#78350f', '#d97706');
            ctx.fillStyle = '#fbbf24';
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

      // 5. Draw Deployed Units
      curUnits.forEach((u) => {
        const p = toIso(u.x, u.y, originX, originY);
        const cx = p.x;
        const cy = p.y + ISO_TILE_H / 2;

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.fillText(u.icon, cx, cy - 6);

        // Unit HP
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(cx - 8, cy - 22, 16, 2.5);
      });

      // Calculate Destruction
      const totalB = curBuildings.length;
      const destroyedB = curBuildings.filter((b) => b.destroyed).length;
      const pct = Math.round((destroyedB / totalB) * 100);
      setDestructionPct(pct);

      if (destroyedB === totalB && !battleFinished) {
        setBattleFinished(true);
      }

      setDeployedUnits(curUnits);
      setEnemyBuildings(curBuildings);
      setProjectiles(curProjs);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [battleFinished]);

  // Deploy Troop onto Perimeter
  const handleDeployOnCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (battleFinished) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const originX = canvas.width / 2;
    const originY = 60;

    // Convert screen to isometric grid
    const dx = clickX - originX;
    const dy = clickY - originY;
    const gx = Math.max(0, Math.min(10, Math.floor((dx / (ISO_TILE_W / 2) + dy / (ISO_TILE_H / 2)) / 2)));
    const gy = Math.max(0, Math.min(10, Math.floor((dy / (ISO_TILE_H / 2) - dx / (ISO_TILE_W / 2)) / 2)));

    if (selectedDeployTroop === 'hero') {
      if (heroDeployed) return;
      setHeroDeployed(true);
      animeAudio.playHeroShout(activeHero.id);

      const heroUnit: RaidUnit = {
        id: `hero_${Date.now()}`,
        troopId: activeHero.id,
        name: activeHero.name,
        icon: activeHero.avatar,
        x: gx,
        y: gy,
        targetId: null,
        hp: activeHero.hp * 1.5,
        maxHp: activeHero.hp * 1.5,
        attack: activeHero.attack * 1.4,
        speed: 2.2,
        range: activeHero.range,
        projectileType: activeHero.id === 'naruto' ? 'shuriken' : activeHero.id === 'luffy' ? 'fist' : activeHero.id === 'ichigo' ? 'getsuga' : 'magic',
        color: activeHero.color
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
        id: `unit_${Date.now()}`,
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

  const handleFinishAndCollect = () => {
    onFinishRaid(lootEarned.berries, lootEarned.chakra);
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-4 my-3 animate-in fade-in">
      {/* 1. TOP COMBAT BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-[#0b1226]/95 border border-red-500/50 shadow-2xl">
        <div className="flex items-center gap-3">
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
              <span>Syndicate Outpost Assault</span>
            </h3>
            <span className="text-xs text-red-400 font-bold">
              Destruction: {destructionPct}% &bull; {destructionPct >= 100 ? '⭐⭐⭐ 3-STAR VICTORY' : destructionPct >= 70 ? '⭐⭐ 2-STAR' : '⭐ 1-STAR'}
            </span>
          </div>
        </div>

        {/* Real-time Loot Counters */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
            💰 +{lootEarned.berries} Berries
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs">
            🌀 +{lootEarned.chakra} Chakra
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME 2.5D RAID CANVAS */}
      <div className="relative w-full rounded-3xl overflow-hidden border-2 border-red-950 shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={840}
          height={460}
          onClick={handleDeployOnCanvas}
          className="w-full h-auto block cursor-crosshair"
        />

        {/* Deployment Instruction Banner */}
        <div className="absolute top-3 left-4 px-3 py-1 rounded-full bg-black/80 border border-red-500/40 text-[11px] text-red-200 font-bold pointer-events-none">
          📍 TAP RED OUTER PERIMETER TILES TO DEPLOY TROOPS
        </div>

        {/* Victory Popup */}
        {battleFinished && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
            <Trophy size={48} className="text-yellow-400 animate-bounce mb-2" />
            <h2 className="text-2xl font-black text-white">100% BASE ANNIHILATION!</h2>
            <div className="text-amber-400 text-xl font-bold my-1">⭐⭐⭐ 3-STAR VICTORY</div>
            <p className="text-sm text-slate-300 max-w-md mt-1">
              The Syndicate compound was completely flattened by {activeHero.name} and your allied strike force!
            </p>

            <div className="flex items-center gap-4 my-4">
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500 text-amber-300 font-black text-base">
                💰 +{lootEarned.berries} Berries Plundered
              </div>
              <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500 text-cyan-300 font-black text-base">
                🌀 +{lootEarned.chakra} Chakra Secured
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

      {/* 3. TROOP DEPLOYMENT SELECTOR BAR */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-3xl bg-[#0b1226]/95 border border-[#1e2a4a]">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase ml-1">DEPLOY UNIT:</span>

        {/* Hero Deploy Button */}
        <button
          type="button"
          onClick={() => setSelectedDeployTroop('hero')}
          disabled={heroDeployed}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
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
      </div>
    </div>
  );
}

