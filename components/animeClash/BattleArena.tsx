'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PlayerVillageState,
  HeroData,
  TroopData
} from '@/lib/animeClash/types';
import {
  HEROES_CATALOG,
  TROOPS_CATALOG
} from '@/lib/animeClash/gameData';
import {
  Sword,
  Shield,
  Zap,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Flame,
  Award
} from 'lucide-react';

interface BattleArenaProps {
  villageState: PlayerVillageState;
  onVictory: (rewards: { berries: number; chakra: number; reishi: number }) => void;
  onExit: () => void;
}

interface CombatUnit {
  id: string;
  isHero: boolean;
  name: string;
  avatar: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  hp: number;
  maxHp: number;
  attack: number;
  range: number;
  speed: number;
  color: string;
  isDead: boolean;
}

interface EnemyBuilding {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attack?: number;
  range?: number;
  isDestroyed: boolean;
  color: string;
}

interface Projectile {
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  speed: number;
  progress: number; // 0 to 1
  damage: number;
  targetId: string;
  targetIsHeroOrTroop: boolean;
}

export default function BattleArena({
  villageState,
  onVictory,
  onExit
}: BattleArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  const hero = HEROES_CATALOG[villageState.activeHeroId] || HEROES_CATALOG.naruto;

  const heroImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = hero.image;
    img.onload = () => { heroImgRef.current = img; };
  }, [hero.image]);

  const [heroDeployed, setHeroDeployed] = useState(false);
  const [heroUltimateCharge, setHeroUltimateCharge] = useState(100); // 0 to 100%
  const [ultimateActiveBanner, setUltimateActiveBanner] = useState<string | null>(null);
  const [battleFinished, setBattleFinished] = useState(false);
  const [destructionPercent, setDestructionPercent] = useState(0);

  // Troop Deployment stock
  const [troopStock, setTroopStock] = useState<Record<string, number>>({
    konoha_genin: 8,
    strawhat_brawler: 4,
    shinigami_patrol: 3,
    black_bulls_mage: 2
  });

  const [selectedDeployTroop, setSelectedDeployTroop] = useState<string>('konoha_genin');

  // Combat Entities Refs
  const unitsRef = useRef<CombatUnit[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);

  // Enemy Base Setup
  const initialBuildings: EnemyBuilding[] = [
    { id: 'ecore', name: 'Rogue Command HQ', icon: '🏯', x: 400, y: 250, hp: 1200, maxHp: 1200, color: '#ef4444', isDestroyed: false },
    { id: 'etower1', name: 'Laser Cannon', icon: '💣', x: 280, y: 190, hp: 450, maxHp: 450, attack: 35, range: 180, color: '#f87171', isDestroyed: false },
    { id: 'etower2', name: 'Laser Cannon', icon: '💣', x: 520, y: 190, hp: 450, maxHp: 450, attack: 35, range: 180, color: '#f87171', isDestroyed: false },
    { id: 'emortar', name: 'Heavy Mortar', icon: '💥', x: 400, y: 150, hp: 400, maxHp: 400, attack: 50, range: 240, color: '#fb923c', isDestroyed: false },
    { id: 'ewall1', name: 'Steel Wall', icon: '🧱', x: 340, y: 320, hp: 600, maxHp: 600, color: '#94a3b8', isDestroyed: false },
    { id: 'ewall2', name: 'Steel Wall', icon: '🧱', x: 400, y: 320, hp: 600, maxHp: 600, color: '#94a3b8', isDestroyed: false },
    { id: 'ewall3', name: 'Steel Wall', icon: '🧱', x: 460, y: 320, hp: 600, maxHp: 600, color: '#94a3b8', isDestroyed: false }
  ];
  const buildingsRef = useRef<EnemyBuilding[]>(initialBuildings);

  // Deploy Unit on Tap
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (battleFinished) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Only allow deployment in outer boundary zone (y > 380 or x < 180 or x > 620)
    if (clickY < 360 && clickX > 200 && clickX < 600) {
      // In forbidden base zone
      return;
    }

    if (selectedDeployTroop === 'hero') {
      if (heroDeployed) return;
      unitsRef.current.push({
        id: `hero_${Date.now()}`,
        isHero: true,
        name: hero.name,
        avatar: hero.avatar,
        x: clickX,
        y: clickY,
        targetX: 400,
        targetY: 250,
        hp: hero.hp,
        maxHp: hero.hp,
        attack: hero.attack,
        range: hero.range * 30,
        speed: hero.speed * 1.2,
        color: hero.color,
        isDead: false
      });
      setHeroDeployed(true);
      setSelectedDeployTroop('konoha_genin');
    } else {
      const currentCount = troopStock[selectedDeployTroop] || 0;
      if (currentCount <= 0) return;

      const troopData = TROOPS_CATALOG.find((t) => t.id === selectedDeployTroop);
      if (!troopData) return;

      unitsRef.current.push({
        id: `troop_${Date.now()}`,
        isHero: false,
        name: troopData.name,
        avatar: troopData.icon,
        x: clickX,
        y: clickY,
        targetX: 400,
        targetY: 250,
        hp: troopData.hp,
        maxHp: troopData.hp,
        attack: troopData.attack,
        range: troopData.range * 25,
        speed: troopData.speed * 1.1,
        color: '#38bdf8',
        isDead: false
      });

      setTroopStock((prev) => ({
        ...prev,
        [selectedDeployTroop]: prev[selectedDeployTroop] - 1
      }));
    }
  };

  // Trigger Anime Hero Ultimate
  const handleTriggerUltimate = () => {
    if (heroUltimateCharge < 100 || !heroDeployed) return;

    setUltimateActiveBanner(`★ ${hero.ultimateName.toUpperCase()}! ★`);
    setHeroUltimateCharge(0);

    // Apply Ultimate Effect to all enemy buildings
    buildingsRef.current.forEach((b) => {
      if (!b.isDestroyed) {
        if (hero.id === 'naruto') {
          // Rasenshuriken: 450 AOE damage
          b.hp -= 450;
        } else if (hero.id === 'luffy') {
          // Conqueror's Haki: 300 damage + stuns
          b.hp -= 300;
        } else if (hero.id === 'ichigo') {
          // Getsuga Tensho: pierces 420 damage
          b.hp -= 420;
        } else if (hero.id === 'asta') {
          // Black Meteorite: 400 damage
          b.hp -= 400;
        }
        if (b.hp <= 0) b.isDestroyed = true;
      }
    });

    setTimeout(() => {
      setUltimateActiveBanner(null);
    }, 2800);
  };

  // Main Battle Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    let lastTurretShot = Date.now();

    const loop = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Battlefield Terrain (Cyber-Metropolitan War Zone)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid line markings
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Deployment Drop Zone (Outer Green Dotted Line)
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 6]);
      ctx.strokeRect(180, 80, 440, 280);
      ctx.setLineDash([]);

      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
      ctx.fillText('DROP ZONE BORDER', 200, 375);

      // 2. Draw Enemy Buildings
      let totalBuildings = buildingsRef.current.length;
      let destroyedCount = 0;

      buildingsRef.current.forEach((b) => {
        if (b.isDestroyed) {
          destroyedCount++;
          // Ruin marker
          ctx.fillStyle = 'rgba(71, 85, 105, 0.5)';
          ctx.fillRect(b.x - 20, b.y - 20, 40, 40);
          ctx.font = '18px serif';
          ctx.fillText('💥', b.x - 10, b.y + 6);
          return;
        }

        // Active building
        ctx.fillStyle = b.color + '30';
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 2;
        ctx.fillRect(b.x - 24, b.y - 24, 48, 48);
        ctx.strokeRect(b.x - 24, b.y - 24, 48, 48);

        ctx.font = '22px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.icon, b.x, b.y - 2);

        // HP bar
        const hpPercent = Math.max(0, b.hp / b.maxHp);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(b.x - 22, b.y + 28, 44, 4);
        ctx.fillStyle = hpPercent > 0.4 ? '#22c55e' : '#ef4444';
        ctx.fillRect(b.x - 22, b.y + 28, 44 * hpPercent, 4);
      });

      // Update Destruction
      const pct = Math.round((destroyedCount / totalBuildings) * 100);
      setDestructionPercent(pct);

      if (pct === 100 && !battleFinished) {
        setBattleFinished(true);
      }

      // 3. Enemy Defense AI: Shoot at nearest live troops
      const now = Date.now();
      if (now - lastTurretShot > 1100) {
        lastTurretShot = now;
        buildingsRef.current.forEach((b) => {
          if (!b.isDestroyed && b.attack && b.range) {
            // Find closest living unit
            let closestDist = Infinity;
            let targetUnit: CombatUnit | null = null;
            unitsRef.current.forEach((u) => {
              if (!u.isDead) {
                const dist = Math.hypot(u.x - b.x, u.y - b.y);
                if (dist < b.range! && dist < closestDist) {
                  closestDist = dist;
                  targetUnit = u;
                }
              }
            });

            if (targetUnit) {
              projectilesRef.current.push({
                x: b.x,
                y: b.y,
                tx: (targetUnit as CombatUnit).x,
                ty: (targetUnit as CombatUnit).y,
                color: '#ef4444',
                speed: 0.15,
                progress: 0,
                damage: b.attack,
                targetId: (targetUnit as CombatUnit).id,
                targetIsHeroOrTroop: true
              });
            }
          }
        });
      }

      // 4. Update & Draw Projectiles
      for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const p = projectilesRef.current[i];
        p.progress += p.speed;
        const curX = p.x + (p.tx - p.x) * p.progress;
        const curY = p.y + (p.ty - p.y) * p.progress;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(curX, curY, 4, 0, Math.PI * 2);
        ctx.fill();

        if (p.progress >= 1.0) {
          // Impact
          if (p.targetIsHeroOrTroop) {
            const hitUnit = unitsRef.current.find((u) => u.id === p.targetId);
            if (hitUnit) {
              hitUnit.hp -= p.damage;
              if (hitUnit.hp <= 0) hitUnit.isDead = true;
            }
          } else {
            const hitBuilding = buildingsRef.current.find((b) => b.id === p.targetId);
            if (hitBuilding) {
              hitBuilding.hp -= p.damage;
              if (hitBuilding.hp <= 0) hitBuilding.isDestroyed = true;
            }
          }
          projectilesRef.current.splice(i, 1);
        }
      }

      // 5. Update & Draw Friendly Troops & Heroes
      unitsRef.current.forEach((unit) => {
        if (unit.isDead) return;

        // Find nearest live building
        let nearestDist = Infinity;
        let targetB: EnemyBuilding | null = null;
        buildingsRef.current.forEach((b) => {
          if (!b.isDestroyed) {
            const dist = Math.hypot(b.x - unit.x, b.y - unit.y);
            if (dist < nearestDist) {
              nearestDist = dist;
              targetB = b;
            }
          }
        });

        if (targetB) {
          // Move towards target
          if (nearestDist > unit.range) {
            const angle = Math.atan2((targetB as EnemyBuilding).y - unit.y, (targetB as EnemyBuilding).x - unit.x);
            unit.x += Math.cos(angle) * unit.speed;
            unit.y += Math.sin(angle) * unit.speed;
          } else {
            // Attack in range
            (targetB as EnemyBuilding).hp -= unit.attack * 0.04;
            if ((targetB as EnemyBuilding).hp <= 0) {
              (targetB as EnemyBuilding).isDestroyed = true;
            }

            // Hero builds ultimate
            if (unit.isHero) {
              setHeroUltimateCharge((prev) => Math.min(100, prev + 0.15));
            }
          }
        }

        // Draw Unit
        ctx.save();
        if (unit.isHero && heroImgRef.current && heroImgRef.current.complete) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(unit.x, unit.y, 16, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(heroImgRef.current, unit.x - 16, unit.y - 16, 32, 32);
          ctx.restore();
          ctx.strokeStyle = unit.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(unit.x, unit.y, 16, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = unit.isHero ? '28px serif' : '18px serif';
          ctx.fillText(unit.avatar, unit.x, unit.y);
        }

        // Name tag
        ctx.font = '9px "Segoe UI", sans-serif';
        ctx.fillStyle = unit.color;
        ctx.fillText(unit.name.split(' ')[0], unit.x, unit.y - (unit.isHero ? 20 : 14));

        // HP bar
        const hpPct = Math.max(0, unit.hp / unit.maxHp);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(unit.x - 14, unit.y + (unit.isHero ? 18 : 12), 28, 3.5);
        ctx.fillStyle = unit.color;
        ctx.fillRect(unit.x - 14, unit.y + (unit.isHero ? 18 : 12), 28 * hpPct, 3.5);

        ctx.restore();
      });

      // 6. Draw Ultimate Banner Animation
      if (ultimateActiveBanner) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height * 0.42, canvas.width, 70);

        ctx.font = 'bold 24px Georgia, serif';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 15;
        ctx.fillText(ultimateActiveBanner, canvas.width / 2, canvas.height * 0.48);
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [ultimateActiveBanner, battleFinished]);

  return (
    <div className="w-full max-w-5xl flex flex-col gap-3 my-3">
      {/* Top Combat Dashboard */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0b1226]/95 border border-[#1e2a4a] text-white">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-xl bg-[#1e293b]"
        >
          <ArrowLeft size={14} />
          <span>Retreat to Village</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 block">DESTRUCTION</span>
            <span className="text-lg font-extrabold text-amber-400">{destructionPercent}%</span>
          </div>
          <div className="flex gap-1 text-lg">
            <span className={destructionPercent >= 30 ? 'text-amber-400' : 'text-slate-600'}>★</span>
            <span className={destructionPercent >= 60 ? 'text-amber-400' : 'text-slate-600'}>★</span>
            <span className={destructionPercent >= 100 ? 'text-amber-400' : 'text-slate-600'}>★</span>
          </div>
        </div>

        {/* Hero Ultimate Ready Meter */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={heroUltimateCharge < 100 || !heroDeployed}
            onClick={handleTriggerUltimate}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              heroUltimateCharge >= 100 && heroDeployed
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.8)] cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Flame size={14} />
            <span>{hero.name.split(' ')[0]} Ultimate ({Math.round(heroUltimateCharge)}%)</span>
          </button>
        </div>
      </div>

      {/* Main Tactical Canvas */}
      <div className="relative w-full aspect-[16/9] max-h-[500px] rounded-3xl overflow-hidden border-2 border-[#1e3a5f] shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain cursor-crosshair"
        />

        {/* Victory Overlay Modal */}
        {battleFinished && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 animate-in fade-in">
            <Award size={48} className="text-amber-400 mb-2 animate-bounce" />
            <h2 className="text-2xl font-extrabold text-white">3-STAR VICTORY!</h2>
            <p className="text-xs text-slate-300 mt-1">Enemy outpost dismantled! Sanctuary protected!</p>

            <div className="flex gap-4 my-4 p-3 rounded-2xl bg-[#0f172a] border border-[#334155]">
              <span className="text-amber-400 text-xs font-bold">💰 +500 Berries</span>
              <span className="text-cyan-400 text-xs font-bold">🌀 +350 Chakra</span>
              <span className="text-purple-400 text-xs font-bold">🔮 +250 Reishi</span>
            </div>

            <button
              type="button"
              onClick={() => {
                onVictory({ berries: 500, chakra: 350, reishi: 250 });
                onExit();
              }}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg cursor-pointer"
            >
              Claim Rewards &amp; Return
            </button>
          </div>
        )}

        {/* Cinematic Anime Hero Cut-In Overlay during Ultimate */}
        {ultimateActiveBanner && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-transparent flex items-center px-6 sm:px-12 pointer-events-none animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-4 sm:gap-6">
              <img
                src={hero.image}
                alt={hero.name}
                className="w-24 sm:w-32 h-36 sm:h-44 rounded-2xl object-cover object-top border-4 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.85)]"
              />
              <div>
                <span className="text-[11px] font-extrabold text-amber-400 tracking-widest uppercase block">
                  ★ SPECIAL ANIME ULTIMATE ★
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white italic drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                  {hero.ultimateName}!
                </h2>
                <p className="text-xs sm:text-sm text-amber-200 mt-1 italic font-medium max-w-sm">
                  &ldquo;{hero.quote}&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Troop & Hero Deployment Bar */}
      <div className="flex items-center gap-2 overflow-x-auto p-2 bg-[#0b1226]/90 border border-[#1e2a4a] rounded-2xl">
        {/* Active Hero Deployment Pill */}
        <button
          type="button"
          disabled={heroDeployed}
          onClick={() => setSelectedDeployTroop('hero')}
          className={`flex items-center gap-2.5 p-2 rounded-xl border transition ${
            selectedDeployTroop === 'hero'
              ? 'border-amber-400 bg-[#1e293b]'
              : heroDeployed
              ? 'border-slate-800 bg-[#070b16] opacity-40 cursor-not-allowed'
              : 'border-[#22335c] bg-[#080d1e] cursor-pointer'
          }`}
        >
          <img
            src={hero.image}
            alt={hero.name}
            className="w-9 h-9 rounded-xl object-cover object-top border"
            style={{ borderColor: hero.color }}
          />
          <div className="text-left text-xs">
            <div className="font-bold text-white">{hero.name.split(' ')[0]}</div>
            <div className="text-[10px] text-amber-400">{heroDeployed ? 'DEPLOYED' : 'HERO UNIT'}</div>
          </div>
        </button>

        {/* Regular Troops */}
        {TROOPS_CATALOG.map((t) => {
          const remaining = troopStock[t.id] || 0;
          const isSelected = selectedDeployTroop === t.id;

          return (
            <button
              key={t.id}
              type="button"
              disabled={remaining <= 0}
              onClick={() => setSelectedDeployTroop(t.id)}
              className={`flex items-center gap-2 p-2 rounded-xl border transition ${
                isSelected
                  ? 'border-cyan-400 bg-[#1e293b]'
                  : remaining <= 0
                  ? 'border-slate-800 bg-[#070b16] opacity-40 cursor-not-allowed'
                  : 'border-[#22335c] bg-[#080d1e] cursor-pointer'
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <div className="text-left text-xs">
                <div className="font-bold text-white">{t.name.split(' ')[0]}</div>
                <div className="text-[10px] text-cyan-300">x{remaining} Left</div>
              </div>
            </button>
          );
        })}

        <div className="text-xs text-slate-400 ml-auto pr-3 hidden sm:block">
          Tap battlefield perimeter to deploy selected unit!
        </div>
      </div>
    </div>
  );
}

