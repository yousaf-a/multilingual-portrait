'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AnimeEpisode, AnimeVillain, HeroPowerup, ANIME_VILLAINS } from '@/lib/animeClash/animeStoryData';
import { HEROES_CATALOG } from '@/lib/animeClash/gameData';
import { HeroData } from '@/lib/animeClash/types';
import {
  Sword,
  Shield,
  Zap,
  Flame,
  Award,
  ArrowLeft,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface AnimeBossFightArenaProps {
  episode: AnimeEpisode;
  onVictory: (rewards: { berries: number; chakra: number; reishi: number }) => void;
  onExit: () => void;
}

export default function AnimeBossFightArena({
  episode,
  onVictory,
  onExit
}: AnimeBossFightArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  const hero = HEROES_CATALOG[episode.heroId] || HEROES_CATALOG.naruto;
  const villain = ANIME_VILLAINS[episode.villainId] || ANIME_VILLAINS.madara;
  const powerup = episode.powerup;

  // Combat State
  const [heroHp, setHeroHp] = useState(hero.hp);
  const [bossHp, setBossHp] = useState(villain.hp);
  const [heroAwakened, setHeroAwakened] = useState(false);
  const [awakeningMeter, setAwakeningMeter] = useState(40); // 0 to 100%
  const [activeCutscene, setActiveCutscene] = useState<string | null>(null);
  const [battleWon, setBattleWon] = useState(false);
  const [battleLost, setBattleLost] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  // Preload Real Hero & Boss Artwork Images
  const heroImgRef = useRef<HTMLImageElement | null>(null);
  const bossImgRef = useRef<HTMLImageElement | null>(null);
  const [, setImagesLoadedTick] = useState(0);

  useEffect(() => {
    const hImg = new Image();
    hImg.src = hero.image;
    hImg.onload = () => {
      heroImgRef.current = hImg;
      setImagesLoadedTick((t) => t + 1);
    };

    const bImg = new Image();
    bImg.src = villain.image;
    bImg.onload = () => {
      bossImgRef.current = bImg;
      setImagesLoadedTick((t) => t + 1);
    };
  }, [hero.image, villain.image]);

  // Entities Ref
  const combatRef = useRef({
    heroX: 180,
    heroY: 230,
    bossX: 620,
    bossY: 230,
    heroVelX: 0,
    bossVelX: 0,
    lastBossAttack: Date.now(),
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number }[]
  });

  // Trigger Basic Attack
  const handleHeroAttack = () => {
    if (battleWon || battleLost) return;
    const c = combatRef.current;

    // Dash forward
    c.heroVelX = 14;

    // Damage boss
    const dmg = heroAwakened ? hero.attack * 2.2 : hero.attack;
    setBossHp((prev) => {
      const next = Math.max(0, prev - dmg);
      if (next <= 0) setBattleWon(true);
      return next;
    });

    // Spawn clash particles
    for (let i = 0; i < 12; i++) {
      c.particles.push({
        x: c.bossX - 10,
        y: c.bossY,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: heroAwakened ? powerup.auraColor : hero.color,
        life: 1.0
      });
    }

    setAwakeningMeter((prev) => Math.min(100, prev + 15));
  };

  // Trigger Signature Skill
  const handleHeroSkill = () => {
    if (battleWon || battleLost) return;
    const c = combatRef.current;

    // Damage boss
    const dmg = (heroAwakened ? hero.attack * 3.2 : hero.attack * 1.8);
    setBossHp((prev) => {
      const next = Math.max(0, prev - dmg);
      if (next <= 0) setBattleWon(true);
      return next;
    });

    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 400);

    // Blast particles
    for (let i = 0; i < 20; i++) {
      c.particles.push({
        x: c.bossX,
        y: c.bossY,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        color: hero.accentColor,
        life: 1.2
      });
    }

    setAwakeningMeter((prev) => Math.min(100, prev + 25));
  };

  // Trigger Legendary Powerup Awakening Form!
  const handleAwakenPowerup = () => {
    if (awakeningMeter < 100 || heroAwakened) return;

    setHeroAwakened(true);
    setActiveCutscene(`★ ${powerup.formName.toUpperCase()}! ★`);
    setScreenShake(true);

    // Deal massive Awakening damage
    setBossHp((prev) => {
      const next = Math.max(0, prev - 850);
      if (next <= 0) setBattleWon(true);
      return next;
    });

    // Heal hero 40%
    setHeroHp((prev) => Math.min(hero.maxHp, prev + hero.maxHp * 0.4));

    // Colossal aura burst particles
    const c = combatRef.current;
    for (let i = 0; i < 40; i++) {
      c.particles.push({
        x: c.heroX,
        y: c.heroY,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 16,
        color: powerup.auraColor,
        life: 1.8
      });
    }

    setTimeout(() => {
      setActiveCutscene(null);
      setScreenShake(false);
    }, 3200);
  };

  // Combat Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      const c = combatRef.current;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Metropolitan Warzone Backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#070b16');
      bgGrad.addColorStop(0.6, villain.bossTheme);
      bgGrad.addColorStop(1, '#05070f');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ground pavement
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, height * 0.65, width, height * 0.35);

      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, height * 0.65, width, 1);

      // 2. Boss AI: Periodic Boss Attack
      const now = Date.now();
      if (!battleWon && !battleLost && now - c.lastBossAttack > 2200) {
        c.lastBossAttack = now;
        c.bossVelX = -12;

        const bossDmg = villain.attack;
        setHeroHp((prev) => {
          const next = Math.max(0, prev - bossDmg);
          if (next <= 0) setBattleLost(true);
          return next;
        });

        // Boss attack particles
        for (let i = 0; i < 15; i++) {
          c.particles.push({
            x: c.heroX + 15,
            y: c.heroY,
            vx: (Math.random() - 0.5) * 9,
            vy: (Math.random() - 0.5) * 9,
            color: villain.color,
            life: 1.0
          });
        }
      }

      // Physics recoil return
      c.heroX += c.heroVelX;
      c.heroVelX *= 0.85;
      if (c.heroX > 220) c.heroX = 220;
      if (c.heroX < 180) c.heroX += (180 - c.heroX) * 0.1;

      c.bossX += c.bossVelX;
      c.bossVelX *= 0.85;
      if (c.bossX < 580) c.bossX = 580;
      if (c.bossX > 620) c.bossX += (620 - c.bossX) * 0.1;

      // 3. Draw Particles
      for (let i = c.particles.length - 1; i >= 0; i--) {
        const p = c.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        if (p.life <= 0) {
          c.particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life + 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 4. Draw Hero Character (Real Anime Artwork)
      ctx.save();
      // Drop shadow
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.ellipse(c.heroX, c.heroY + 70, 38, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Awakened Aura Glow
      if (heroAwakened) {
        const pulse = (Math.sin(now / 150) + 1) / 2;
        const auraGrad = ctx.createRadialGradient(c.heroX, c.heroY, 15, c.heroX, c.heroY, 80 + pulse * 20);
        auraGrad.addColorStop(0, powerup.auraColor);
        auraGrad.addColorStop(0.7, 'rgba(255,255,255,0.3)');
        auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(c.heroX, c.heroY, 80 + pulse * 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // Real Hero Character Illustration
      if (heroImgRef.current && heroImgRef.current.complete) {
        const spriteW = 95;
        const spriteH = 130;
        ctx.save();
        const swayY = Math.sin(now / 400) * 3;
        ctx.beginPath();
        ctx.roundRect(c.heroX - spriteW / 2, c.heroY - spriteH / 2 + swayY, spriteW, spriteH, 16);
        ctx.clip();
        ctx.drawImage(heroImgRef.current, c.heroX - spriteW / 2, c.heroY - spriteH / 2 + swayY, spriteW, spriteH);
        ctx.restore();

        // Border ring
        ctx.strokeStyle = heroAwakened ? powerup.auraColor : hero.color;
        ctx.lineWidth = heroAwakened ? 3 : 2;
        ctx.beginPath();
        ctx.roundRect(c.heroX - 95 / 2, c.heroY - 130 / 2 + Math.sin(now / 400) * 3, 95, 130, 16);
        ctx.stroke();
      } else {
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(hero.name, c.heroX, c.heroY);
      }

      // Hero Name & Mode
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.fillStyle = heroAwakened ? powerup.auraColor : '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(heroAwakened ? `★ ${powerup.formName.split(':')[0]} ★` : hero.name.split(' ')[0], c.heroX, c.heroY - 75);
      ctx.restore();

      // 5. Draw Villain Boss (Real Anime Artwork)
      ctx.save();
      // Drop shadow
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.ellipse(c.bossX, c.bossY + 70, 42, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Villain Boss Aura
      const bossAura = ctx.createRadialGradient(c.bossX, c.bossY, 20, c.bossX, c.bossY, 85);
      bossAura.addColorStop(0, villain.color);
      bossAura.addColorStop(0.8, 'rgba(0,0,0,0.3)');
      bossAura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bossAura;
      ctx.beginPath();
      ctx.arc(c.bossX, c.bossY, 85, 0, Math.PI * 2);
      ctx.fill();

      // Real Villain Boss Illustration
      if (bossImgRef.current && bossImgRef.current.complete) {
        const bossW = 100;
        const bossH = 135;
        ctx.save();
        const swayBoss = Math.sin(now / 450 + 1) * 3;
        ctx.beginPath();
        ctx.roundRect(c.bossX - bossW / 2, c.bossY - bossH / 2 + swayBoss, bossW, bossH, 16);
        ctx.clip();
        ctx.drawImage(bossImgRef.current, c.bossX - bossW / 2, c.bossY - bossH / 2 + swayBoss, bossW, bossH);
        ctx.restore();

        // Border ring
        ctx.strokeStyle = villain.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(c.bossX - bossW / 2, c.bossY - bossH / 2 + Math.sin(now / 450 + 1) * 3, bossW, bossH, 16);
        ctx.stroke();
      }

      // Boss Name
      ctx.font = 'bold 13px "Segoe UI", sans-serif';
      ctx.fillStyle = villain.color;
      ctx.textAlign = 'center';
      ctx.fillText(villain.name, c.bossX, c.bossY - 78);
      ctx.restore();

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [hero, villain, heroAwakened, powerup, battleWon, battleLost]);

  return (
    <div className={`w-full max-w-5xl flex flex-col gap-3 my-3 transition ${screenShake ? 'translate-x-1.5' : ''}`}>
      {/* 1. TOP HEALTH & BOSS BARS (Anime Fighter Style) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-[#0b1226]/95 border border-[#1e2a4a] text-white shadow-2xl">
        {/* Left: Hero Health & Portrait */}
        <div className="flex items-center gap-3 w-full sm:w-5/12">
          <img
            src={hero.image}
            alt={hero.name}
            className={`w-14 h-14 rounded-2xl object-cover object-top border-2 shadow-lg transition ${
              heroAwakened ? 'border-amber-400 ring-4 ring-amber-400/40 scale-105' : 'border-blue-400'
            }`}
          />
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>{hero.name}</span>
              <span className="text-emerald-400">{Math.round(heroHp)} / {hero.maxHp} HP</span>
            </div>
            {/* Health Bar */}
            <div className="w-full h-3 rounded-full bg-[#1e293b] overflow-hidden p-0.5 border border-[#334155]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${Math.max(0, (heroHp / hero.maxHp) * 100)}%` }}
              />
            </div>
            {/* Awakening Meter */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] text-amber-400 font-bold">POWERUP:</span>
              <div className="flex-1 h-1.5 rounded-full bg-[#1e293b] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all"
                  style={{ width: `${awakeningMeter}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: VS Badge */}
        <div className="px-3 py-1 rounded-xl bg-red-600 text-white font-extrabold text-xs shadow-md tracking-widest">
          CLASH
        </div>

        {/* Right: Boss Health & Portrait */}
        <div className="flex items-center gap-3 w-full sm:w-5/12 justify-end">
          <div className="flex-1 text-right">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-red-400">{Math.round(bossHp)} / {villain.maxHp} HP</span>
              <span className="text-red-300">{villain.name}</span>
            </div>
            {/* Boss Health Bar */}
            <div className="w-full h-3 rounded-full bg-[#1e293b] overflow-hidden p-0.5 border border-[#334155]">
              <div
                className="h-full rounded-full bg-gradient-to-l from-red-600 to-rose-400 transition-all duration-300"
                style={{ width: `${Math.max(0, (bossHp / villain.maxHp) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">{villain.title}</span>
          </div>
          <img
            src={villain.image}
            alt={villain.name}
            className="w-14 h-14 rounded-2xl object-cover object-top border-2 shadow-lg"
            style={{ borderColor: villain.color }}
          />
        </div>
      </div>

      {/* 2. REAL-TIME BATTLE VIEWPORT */}
      <div className="relative w-full aspect-[16/9] max-h-[460px] rounded-3xl overflow-hidden border-2 border-[#1e3a5f] shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={800}
          height={420}
          className="w-full h-full object-contain"
        />

        {/* Cinematic Anime Powerup Awakening Cut-In */}
        {activeCutscene && (
          <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col md:flex-row items-center gap-6 max-w-3xl">
              <img
                src={hero.image}
                alt={hero.name}
                className="w-36 h-48 rounded-2xl object-cover object-top border-4 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.9)]"
              />
              <div>
                <span className="text-xs font-black text-amber-400 tracking-widest uppercase block">
                  ★ LEGENDARY POWERUP AWAKENING ★
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white italic drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                  {powerup.formName}!
                </h2>
                <div className="text-xs text-amber-300 font-mono mt-0.5">{powerup.japaneseName}</div>
                <p className="text-xs text-slate-200 mt-2 italic font-medium leading-relaxed">
                  &ldquo;{powerup.quote}&rdquo;
                </p>
                <div className="mt-2 text-[11px] text-emerald-400 font-semibold">
                  ⚡ Stat Boost: +{Math.round((powerup.statBoostMultiplier - 1) * 100)}% Firepower | +40% Health Restored!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Victory Screen */}
        {battleWon && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 animate-in fade-in">
            <Award size={48} className="text-amber-400 mb-2 animate-bounce" />
            <h2 className="text-2xl font-black text-white">EPISODE CLEARED!</h2>
            <p className="text-xs text-slate-300 mt-1">{villain.name} defeated! The modern city is protected!</p>

            <div className="flex gap-4 my-4 p-3 rounded-2xl bg-[#0f172a] border border-[#334155]">
              <span className="text-amber-400 text-xs font-bold">💰 +1,000 Berries</span>
              <span className="text-cyan-400 text-xs font-bold">🌀 +750 Chakra</span>
              <span className="text-purple-400 text-xs font-bold">🔮 +600 Reishi</span>
            </div>

            <button
              type="button"
              onClick={() => {
                onVictory({ berries: 1000, chakra: 750, reishi: 600 });
                onExit();
              }}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg cursor-pointer"
            >
              Claim Victory &amp; Return to Sanctuary
            </button>
          </div>
        )}

        {/* Defeat Screen */}
        {battleLost && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 animate-in fade-in">
            <h2 className="text-2xl font-black text-rose-500">DEFEATED...</h2>
            <p className="text-xs text-slate-400 mt-1 italic">&ldquo;{villain.quote}&rdquo;</p>
            <button
              type="button"
              onClick={() => {
                setHeroHp(hero.hp);
                setBossHp(villain.hp);
                setBattleLost(false);
                setHeroAwakened(false);
                setAwakeningMeter(50);
              }}
              className="mt-4 py-2 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Retry Episode</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. COMBAT ACTIONS BAR */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#0b1226]/95 border border-[#1e2a4a]">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-[#1e293b]"
        >
          <ArrowLeft size={14} />
          <span>Exit Boss Fight</span>
        </button>

        {/* Hero Combat Moves */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Move 1: Basic Combo */}
          <button
            type="button"
            disabled={battleWon || battleLost}
            onClick={handleHeroAttack}
            className="py-2 px-3 sm:px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Sword size={14} />
            <span>Strike Attack (⚔️ {heroAwakened ? Math.round(hero.attack * 2.2) : hero.attack})</span>
          </button>

          {/* Move 2: Signature Skill */}
          <button
            type="button"
            disabled={battleWon || battleLost}
            onClick={handleHeroSkill}
            className="py-2 px-3 sm:px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Zap size={14} />
            <span>{hero.skillName.split(' ')[0]} (💥 {Math.round(hero.attack * (heroAwakened ? 3.2 : 1.8))})</span>
          </button>

          {/* Move 3: LEGENDARY POWERUP AWAKENING */}
          <button
            type="button"
            disabled={awakeningMeter < 100 || heroAwakened || battleWon || battleLost}
            onClick={handleAwakenPowerup}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              heroAwakened
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 cursor-default'
                : awakeningMeter >= 100
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-300 text-slate-950 font-black animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.9)] cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Flame size={14} />
            <span>{heroAwakened ? '🔥 AWAKENED ACTIVE' : `AWAKEN FORM (${Math.round(awakeningMeter)}%)`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

