'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PlayerVillageState } from '@/lib/animeClash/types';
import { HEROES_CATALOG } from '@/lib/animeClash/gameData';
import { toIso, ISO_TILE_W, ISO_TILE_H, drawIsoTerrain, drawIsoBuilding } from '@/lib/animeClash/isometricRenderer';
import { animeAudio } from '@/lib/animeClash/animeAudio';
import { Shield, ArrowLeft, Trophy, Zap, AlertTriangle } from 'lucide-react';

interface BaseDefenseSimulatorProps {
  villageState: PlayerVillageState;
  onFinishDefense: (rewardBerries: number) => void;
  onClose: () => void;
}

interface Raider {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  attack: number;
  alive: boolean;
}

export default function BaseDefenseSimulator({
  villageState,
  onFinishDefense,
  onClose
}: BaseDefenseSimulatorProps) {
  const activeHero = HEROES_CATALOG[villageState.activeHeroId] || HEROES_CATALOG.naruto;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Village Building Copies
  const [villageBuildings, setVillageBuildings] = useState(
    villageState.buildings.map((b) => ({ ...b, currentHp: b.hp }))
  );

  // Raiders
  const [raiders, setRaiders] = useState<Raider[]>([
    { id: 'r1', name: 'Madara Shadow Ninja', icon: '🥷', x: 0, y: 3, hp: 320, maxHp: 320, speed: 1.4, attack: 35, alive: true },
    { id: 'r2', name: 'Madara Shadow Ninja', icon: '🥷', x: 0, y: 7, hp: 320, maxHp: 320, speed: 1.4, attack: 35, alive: true },
    { id: 'r3', name: 'Doflamingo Puppet', icon: '🎭', x: 10, y: 2, hp: 450, maxHp: 450, speed: 1.1, attack: 45, alive: true },
    { id: 'r4', name: 'Doflamingo Puppet', icon: '🎭', x: 10, y: 8, hp: 450, maxHp: 450, speed: 1.1, attack: 45, alive: true },
    { id: 'r5', name: 'Arrancar Hollow', icon: '💀', x: 4, y: 0, hp: 380, maxHp: 380, speed: 1.3, attack: 40, alive: true },
    { id: 'r6', name: 'Arrancar Hollow', icon: '💀', x: 7, y: 0, hp: 380, maxHp: 380, speed: 1.3, attack: 40, alive: true }
  ]);

  const [activeVoiceShout, setActiveVoiceShout] = useState<string | null>(null);
  const [defenseFinished, setDefenseFinished] = useState(false);
  const [baseIntegrity, setBaseIntegrity] = useState(100);

  const buildingsRef = useRef(villageBuildings);
  buildingsRef.current = villageBuildings;
  const raidersRef = useRef(raiders);
  raidersRef.current = raiders;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = Date.now();
    let heroShoutTriggered = false;

    const render = () => {
      const now = Date.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const w = canvas.width;
      const h = canvas.height;
      const originX = w / 2;
      const originY = 60;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw Terrain with Night / Warning Lighting
      drawIsoTerrain(ctx, w, h, originX, originY, 12, 'night', (now / 1000));

      const curBuildings = [...buildingsRef.current];
      const curRaiders = [...raidersRef.current];

      // 2. Raiders Move toward Center (Command Core)
      curRaiders.forEach((r) => {
        if (!r.alive) return;
        const targetX = 5;
        const targetY = 5;
        const dist = Math.hypot(targetX - r.x, targetY - r.y);

        if (dist > 1.2) {
          const angle = Math.atan2(targetY - r.y, targetX - r.x);
          r.x += Math.cos(angle) * r.speed * dt;
          r.y += Math.sin(angle) * r.speed * dt;
        } else {
          // Attack Core
          const core = curBuildings.find((b) => b.type === 'command_core');
          if (core) {
            core.currentHp = Math.max(0, core.currentHp - r.attack * dt * 0.8);
          }
        }

        // Defenses Fire Back (Cannons)
        const cannons = curBuildings.filter((b) => b.type === 'haki_cannon');
        cannons.forEach((c) => {
          const cDist = Math.hypot(c.x - r.x, c.y - r.y);
          if (cDist < 5.5 && Math.random() < 0.035) {
            r.hp -= 85;
            animeAudio.playCombatSFX('cannon');
            if (r.hp <= 0) {
              r.alive = false;
            }
          }
        });
      });

      // 3. Hero Counter-Attack on 1st Raider Arrival
      const aliveCount = curRaiders.filter((r) => r.alive).length;
      if (aliveCount <= 3 && !heroShoutTriggered) {
        heroShoutTriggered = true;
        const shout = animeAudio.playHeroShout(activeHero.id);
        if (shout) {
          setActiveVoiceShout(`${shout.kanji} (${shout.shoutText})`);
          setTimeout(() => setActiveVoiceShout(null), 2400);
        }
        // Wipe remaining raiders
        curRaiders.forEach((r) => {
          r.hp = 0;
          r.alive = false;
        });
      }

      // 4. Draw Buildings
      curBuildings.sort((a, b) => a.x + a.y - (b.x + b.y));
      curBuildings.forEach((b) => {
        drawIsoBuilding(ctx, b, originX, originY, now / 1000, false);
      });

      // 5. Draw Raiders
      curRaiders.forEach((r) => {
        if (!r.alive) return;
        const p = toIso(r.x, r.y, originX, originY);
        const cx = p.x;
        const cy = p.y + ISO_TILE_H / 2;

        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.fillText(r.icon, cx, cy - 8);

        // HP bar
        const pct = Math.max(0, r.hp / r.maxHp);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(cx - 8, cy - 24, 16, 2.5);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(cx - 8, cy - 24, 16 * pct, 2.5);
      });

      // Calculate Base Integrity
      const core = curBuildings.find((b) => b.type === 'command_core');
      const corePct = core ? Math.round((core.currentHp / core.hp) * 100) : 100;
      setBaseIntegrity(corePct);

      if (curRaiders.every((r) => !r.alive) && !defenseFinished) {
        setDefenseFinished(true);
      }

      setVillageBuildings(curBuildings);
      setRaiders(curRaiders);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [defenseFinished, activeHero]);

  return (
    <div className="w-full max-w-5xl flex flex-col gap-4 my-3 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-[#0b1226]/95 border border-amber-500/50 shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-[#1e293b]"
          >
            <ArrowLeft size={14} />
            <span>Return</span>
          </button>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Shield size={16} className="text-amber-400" />
              <span>Syndicate Counter-Raid Defense Test</span>
            </h3>
            <span className="text-xs text-emerald-400 font-bold">
              Base Core Integrity: {baseIntegrity}%
            </span>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-bold flex items-center gap-1.5">
          <AlertTriangle size={14} className="text-red-400 animate-pulse" />
          <span>INCOMING HOSTILES DETECTED</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full rounded-3xl overflow-hidden border-2 border-indigo-950 shadow-2xl bg-black">
        <canvas ref={canvasRef} width={840} height={460} className="w-full h-auto block" />

        {/* Japanese Voice Shout Cut-In Overlay */}
        {activeVoiceShout && (
          <div className="absolute inset-x-0 top-1/3 flex flex-col items-center justify-center pointer-events-none animate-in zoom-in-110 duration-300">
            <div className="px-8 py-3 rounded-2xl bg-black/90 border-2 border-amber-400 text-amber-300 font-black text-xl tracking-widest shadow-[0_0_35px_rgba(245,158,11,0.8)]">
              ⚡ {activeVoiceShout} ⚡
            </div>
            <span className="text-xs text-white uppercase font-bold mt-1 tracking-widest bg-black/70 px-3 py-0.5 rounded-full">
              HERO ULTIMATE INTERCEPTION
            </span>
          </div>
        )}

        {/* Victory Popup */}
        {defenseFinished && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
            <Trophy size={48} className="text-emerald-400 animate-bounce mb-2" />
            <h2 className="text-2xl font-black text-white">SANCTUARY DEFENDED!</h2>
            <div className="text-emerald-400 text-lg font-bold my-1">
              All Syndicate Invaders Repelled &bull; Base Integrity: {baseIntegrity}%
            </div>
            <p className="text-sm text-slate-300 max-w-md mt-1">
              Your Haki Cannons and {activeHero.name} successfully held the perimeter!
            </p>

            <button
              type="button"
              onClick={() => onFinishDefense(500)}
              className="mt-4 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 text-white font-extrabold text-sm shadow-xl cursor-pointer"
            >
              Collect +500 Berries Bounty &amp; Return
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
