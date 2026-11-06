'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PlayerVillageState, FriendProfile, BuildingInstance, BuildingType } from '@/lib/animeClash/types';
import { HEROES_CATALOG, TROOPS_CATALOG, DEFAULT_FRIEND_BASES } from '@/lib/animeClash/gameData';
import { toIso, ISO_TILE_W, ISO_TILE_H, drawIsoTerrain, drawIsoBuilding } from '@/lib/animeClash/isometricRenderer';
import { freeAnimeAudio } from '@/lib/animeClash/freeAnimeAudio';
import {
  Sword,
  ArrowLeft,
  Trophy,
  Zap,
  Shield,
  Sparkles,
  Users,
  RefreshCw,
  Flame,
  FastForward,
  Play,
  Pause,
  Compass,
  ChevronRight,
  Crosshair
} from 'lucide-react';

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
  level: number;
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
  projectileType: 'shuriken' | 'fireball' | 'gentle_fist' | 'toad_slam' | 'fist' | 'cannonball';
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
  type: 'shuriken' | 'fireball' | 'gentle_fist' | 'toad_slam' | 'fist' | 'cannonball';
  progress: number;
  color: string;
}

interface DamagePopup {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
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

  // Available Targets (Default canonical Naruto adversary bases + custom imported)
  const allFriendTargets: FriendProfile[] = [
    ...DEFAULT_FRIEND_BASES,
    ...(villageState.customFriends || [])
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
      color: b.color || '#dc2626',
      level: b.level || 1
    }));
  };

  const buildDefendingHeroFromProfile = (target: FriendProfile): DefendingHero => {
    const isMist = target.id.includes('mist');
    const isSound = target.id.includes('sound');
    const isRain = target.id.includes('rain') || target.id.includes('akatsuki');

    const heroName = isMist ? 'Zabuza Mercenary Captain'
      : isSound ? 'Sound Four Enforcer'
      : isRain ? 'Akatsuki Rain Commander'
      : `${target.name.split(' ')[0]} Champion`;

    const heroAvatar = isMist ? '⚔️' : isSound ? '🐍' : isRain ? '🌧️' : '🥷';
    const heroQuote = isMist
      ? 'You Leaf brats will never make it past the Great Naruto Bridge!'
      : isSound
      ? 'Lord Orochimaru will feast upon your chakra!'
      : 'Know true pain. This world shall know reckoning.';

    const coreBuilding = target.buildings.find((b) => b.type === 'command_core');
    const heroHp = (target.heroLevel || 1) * 350 + 850;

    return {
      id: `def_hero_${target.id}`,
      name: heroName,
      heroId: target.activeHeroId || 'naruto',
      avatar: heroAvatar,
      x: coreBuilding ? coreBuilding.x : 5,
      y: coreBuilding ? coreBuilding.y + 1 : 6,
      hp: heroHp,
      maxHp: heroHp,
      attack: (target.heroLevel || 1) * 25 + 65,
      range: 2.5,
      color: isMist ? '#0284c7' : isSound ? '#7c3aed' : '#ef4444',
      defeated: false,
      quote: heroQuote
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
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [selectedDeployTroop, setSelectedDeployTroop] = useState<string>('hero');
  const [heroDeployed, setHeroDeployed] = useState(false);
  const [heroUltimateReady, setHeroUltimateReady] = useState(true);
  const [isGameFast, setIsGameFast] = useState(false);

  const [availableTroops, setAvailableTroops] = useState<Record<string, number>>(() => {
    const validTroopIds = new Set(TROOPS_CATALOG.map((t) => t.id));
    if (villageState.trainedTroops) {
      const filtered: Record<string, number> = {};
      let total = 0;
      for (const [k, v] of Object.entries(villageState.trainedTroops)) {
        if (validTroopIds.has(k) && typeof v === 'number' && v > 0) {
          filtered[k] = v;
          total += v;
        }
      }
      if (total > 0) return filtered;
    }
    return { konoha_genin: 8, fire_chunin: 4, hyuga_striker: 2, toad_vanguard: 2 };
  });

  const [lootEarned, setLootEarned] = useState({ berries: 0, chakra: 0 });
  const [destructionPct, setDestructionPct] = useState(0);
  const [battleFinished, setBattleFinished] = useState(false);
  const [heroClashActive, setHeroClashActive] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);

  // References for Animation Loop
  const buildingsRef = useRef(enemyBuildings);
  buildingsRef.current = enemyBuildings;
  const defHeroRef = useRef(defendingHero);
  defHeroRef.current = defendingHero;
  const unitsRef = useRef(deployedUnits);
  unitsRef.current = deployedUnits;
  const projsRef = useRef(projectiles);
  projsRef.current = projectiles;
  const popupsRef = useRef(damagePopups);
  popupsRef.current = damagePopups;
  const speedRef = useRef(isGameFast ? 2.0 : 1.0);
  speedRef.current = isGameFast ? 2.0 : 1.0;

  // Change Target Base
  const handleSelectRival = (target: FriendProfile) => {
    if (deployedUnits.length > 0) {
      if (!confirm('Switching outposts will retreat current deployed troops. Continue?')) return;
    }
    setSelectedTarget(target);
    const newBuildings = buildEnemyBuildingsFromProfile(target);
    const newHero = buildDefendingHeroFromProfile(target);
    setEnemyBuildings(newBuildings);
    setDefendingHero(newHero);
    setDeployedUnits([]);
    setProjectiles([]);
    setDamagePopups([]);
    setHeroDeployed(false);
    setHeroUltimateReady(true);
    setLootEarned({ berries: 0, chakra: 0 });
    setDestructionPct(0);
    setBattleFinished(false);
    setHeroClashActive(false);
    freeAnimeAudio.playJutsuWhoosh();
  };

  // Convert internal RaidBuilding to BuildingInstance for rich isometric renderer
  const toBuildingInstance = (b: RaidBuilding): BuildingInstance => {
    let bType: BuildingType = 'command_core';
    if (b.type === 'core') bType = 'command_core';
    else if (b.type === 'wall') bType = 'defense_wall';
    else if (b.type === 'cannon') bType = 'paper_mortar';
    else if (b.type === 'storage') bType = 'berry_treasury';

    return {
      id: b.id,
      type: bType,
      name: b.name,
      level: b.level || 1,
      x: b.x,
      y: b.y,
      hp: b.hp,
      maxHp: b.maxHp,
      color: b.color,
      icon: b.type === 'core' ? '🏯' : b.type === 'cannon' ? '💥' : b.type === 'storage' ? '💰' : '🧱'
    };
  };

  // ============================================================
  // DEPLOYMENT ACTION: Deploy specific unit at (x, y)
  // ============================================================
  const executeDeployUnit = (troopKey: string, gridX: number, gridY: number) => {
    if (battleFinished) return;

    if (troopKey === 'hero') {
      if (heroDeployed) return;
      const heroUnit: RaidUnit = {
        id: `hero_unit_${Date.now()}`,
        troopId: 'hero',
        name: activeHero.name,
        icon: activeHero.avatar,
        x: gridX,
        y: gridY,
        targetId: null,
        hp: activeHero.hp,
        maxHp: activeHero.hp,
        attack: activeHero.attack,
        speed: activeHero.speed,
        range: activeHero.range,
        projectileType: 'fist',
        color: activeHero.color,
        isHero: true
      };

      setDeployedUnits((prev) => [...prev, heroUnit]);
      setHeroDeployed(true);
      freeAnimeAudio.playJutsuWhoosh();
      return;
    }

    const currentCount = availableTroops[troopKey] || 0;
    if (currentCount <= 0) return;

    const tData = TROOPS_CATALOG.find((t) => t.id === troopKey) || TROOPS_CATALOG[0];

    const getTroopProjectileType = (id: string): 'shuriken' | 'fireball' | 'gentle_fist' | 'toad_slam' | 'fist' => {
      if (id === 'fire_chunin') return 'fireball';
      if (id === 'hyuga_striker') return 'gentle_fist';
      if (id === 'toad_vanguard') return 'toad_slam';
      return 'shuriken';
    };

    const getTroopAuraColor = (id: string): string => {
      if (id === 'fire_chunin') return '#f97316';
      if (id === 'hyuga_striker') return '#06b6d4';
      if (id === 'toad_vanguard') return '#22c55e';
      return '#38bdf8';
    };

    const newUnit: RaidUnit = {
      id: `unit_${Date.now()}_${Math.random()}`,
      troopId: tData.id,
      name: tData.name,
      icon: tData.icon,
      x: gridX,
      y: gridY,
      targetId: null,
      hp: tData.hp,
      maxHp: tData.hp,
      attack: tData.attack,
      speed: tData.speed,
      range: tData.range,
      projectileType: getTroopProjectileType(tData.id),
      color: getTroopAuraColor(tData.id)
    };

    setDeployedUnits((prev) => [...prev, newUnit]);
    setAvailableTroops((prev) => ({
      ...prev,
      [troopKey]: Math.max(0, (prev[troopKey] || 0) - 1)
    }));

    if (tData.id === 'fire_chunin') {
      freeAnimeAudio.playFireballRoar();
    } else if (tData.id === 'hyuga_striker') {
      freeAnimeAudio.playGentleFistStrike();
    } else if (tData.id === 'toad_vanguard') {
      freeAnimeAudio.playToadCleaverSmash();
    } else {
      freeAnimeAudio.playKunaiThrow();
    }
  };

  // ============================================================
  // STRATEGIC LANE DEPLOYMENT BUTTONS (User-Friendly 1-Click)
  // ============================================================
  const handleDeployLane = (lane: 'north' | 'center' | 'south') => {
    const laneCoords = {
      north: [
        { x: 1, y: 0 },
        { x: 3, y: 0 },
        { x: 5, y: 0 }
      ],
      center: [
        { x: 0, y: 5 },
        { x: 0, y: 6 },
        { x: 0, y: 7 }
      ],
      south: [
        { x: 5, y: 10 },
        { x: 7, y: 10 },
        { x: 9, y: 10 }
      ]
    };

    const targetCoords = laneCoords[lane];
    const coord = targetCoords[Math.floor(Math.random() * targetCoords.length)];

    // Deploy selected unit or hero
    if (selectedDeployTroop === 'hero' && !heroDeployed) {
      executeDeployUnit('hero', coord.x, coord.y);
    } else {
      // Find an available troop
      const availableKey = Object.keys(availableTroops).find((k) => (availableTroops[k] || 0) > 0);
      const troopToDeploy = (availableTroops[selectedDeployTroop] || 0) > 0 ? selectedDeployTroop : availableKey;
      if (troopToDeploy) {
        executeDeployUnit(troopToDeploy, coord.x, coord.y);
      }
    }
  };

  // Deploy All Units in Full Pincer Formation
  const handleDeployAllUnits = () => {
    // 1. Deploy hero first if not deployed
    if (!heroDeployed) {
      executeDeployUnit('hero', 0, 5);
    }

    // 2. Deploy each troop in alternating lanes
    const perimeterCoords = [
      { x: 2, y: 0 },
      { x: 5, y: 0 },
      { x: 8, y: 0 },
      { x: 0, y: 3 },
      { x: 0, y: 7 },
      { x: 3, y: 10 },
      { x: 7, y: 10 },
      { x: 10, y: 4 },
      { x: 10, y: 8 }
    ];

    let coordIdx = 0;
    const newTroopsRemaining = { ...availableTroops };
    const unitsToAdd: RaidUnit[] = [];

    const getTroopProjectileType = (id: string): 'shuriken' | 'fireball' | 'gentle_fist' | 'toad_slam' | 'fist' => {
      if (id === 'fire_chunin') return 'fireball';
      if (id === 'hyuga_striker') return 'gentle_fist';
      if (id === 'toad_vanguard') return 'toad_slam';
      return 'shuriken';
    };

    const getTroopAuraColor = (id: string): string => {
      if (id === 'fire_chunin') return '#f97316';
      if (id === 'hyuga_striker') return '#06b6d4';
      if (id === 'toad_vanguard') return '#22c55e';
      return '#38bdf8';
    };

    Object.keys(newTroopsRemaining).forEach((troopKey) => {
      const count = newTroopsRemaining[troopKey] || 0;
      const tData = TROOPS_CATALOG.find((t) => t.id === troopKey) || TROOPS_CATALOG[0];

      for (let i = 0; i < count; i++) {
        const coord = perimeterCoords[coordIdx % perimeterCoords.length];
        coordIdx++;

        unitsToAdd.push({
          id: `unit_${Date.now()}_${Math.random()}`,
          troopId: tData.id,
          name: tData.name,
          icon: tData.icon,
          x: coord.x,
          y: coord.y,
          targetId: null,
          hp: tData.hp,
          maxHp: tData.hp,
          attack: tData.attack,
          speed: tData.speed,
          range: tData.range,
          projectileType: getTroopProjectileType(tData.id),
          color: getTroopAuraColor(tData.id)
        });
      }

      newTroopsRemaining[troopKey] = 0;
    });

    setDeployedUnits((prev) => [...prev, ...unitsToAdd]);
    setAvailableTroops(newTroopsRemaining);
    freeAnimeAudio.playClashImpact();
  };

  // ============================================================
  // HERO ULTIMATE SKILL: WIND STYLE RASENGAN
  // ============================================================
  const handleTriggerHeroUltimate = () => {
    if (!heroUltimateReady || battleFinished) return;
    setHeroUltimateReady(false);
    setScreenFlash(true);
    setTimeout(() => setScreenFlash(false), 120);

    freeAnimeAudio.playRasenshurikenWind();
    freeAnimeAudio.playShinraTensei();

    // Damage all enemy buildings within center radius
    const currentBuildings = [...buildingsRef.current];
    currentBuildings.forEach((b) => {
      if (!b.destroyed) {
        const distToCenter = Math.hypot(b.x - 5, b.y - 5);
        if (distToCenter <= 3.8) {
          b.hp = Math.max(0, b.hp - 450);
          if (b.hp <= 0) {
            b.destroyed = true;
          }
        }
      }
    });

    // Also damage defending hero
    const dHero = defHeroRef.current;
    if (dHero && !dHero.defeated) {
      dHero.hp = Math.max(0, dHero.hp - 400);
      if (dHero.hp <= 0) dHero.defeated = true;
    }

    // Add visual damage popups
    setDamagePopups((prev) => [
      ...prev,
      { x: 420, y: 200, text: '💥 RASENGAN -450 AOE!', color: '#38bdf8', life: 1.8 }
    ]);
  };

  // Canvas Direct Click Handler (Deploy at clicked edge)
  const handleDeployOnCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Approximate closest outer tile
    const originX = canvas.width / 2;
    const originY = 55;

    // Convert mouse to approximate grid coords
    const dx = clickX - originX;
    const dy = clickY - originY;
    let approxGx = Math.round((dx / (ISO_TILE_W / 2) + dy / (ISO_TILE_H / 2)) / 2);
    let approxGy = Math.round((dy / (ISO_TILE_H / 2) - dx / (ISO_TILE_W / 2)) / 2);

    // Clamp to boundary perimeter
    approxGx = Math.max(0, Math.min(10, approxGx));
    approxGy = Math.max(0, Math.min(10, approxGy));

    // Force onto edge if clicked inside
    if (approxGx > 1 && approxGx < 9 && approxGy > 1 && approxGy < 9) {
      if (approxGx < 5) approxGx = 0;
      else approxGx = 10;
    }

    if (selectedDeployTroop === 'hero') {
      executeDeployUnit('hero', approxGx, approxGy);
    } else {
      executeDeployUnit(selectedDeployTroop, approxGx, approxGy);
    }
  };

  // ============================================================
  // REAL-TIME BATTLE PHYSICS & RENDER LOOP (60 FPS)
  // ============================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = Date.now();

    const render = () => {
      const now = Date.now();
      const dt = Math.min(0.08, (now - lastTime) / 1000) * speedRef.current;
      lastTime = now;

      const w = canvas.width;
      const h = canvas.height;
      const originX = w / 2;
      const originY = 55;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw Gorgeous Floating Sanctuary Island Terrain
      drawIsoTerrain(ctx, w, h, originX, originY, 11, 'twilight', now * 0.001);

      // 2. Glowing Outer Infiltration Perimeter Boundary (No more ugly purple tiles!)
      ctx.save();
      for (let gy = 0; gy < 11; gy++) {
        for (let gx = 0; gx < 11; gx++) {
          const isEdge = gx === 0 || gx === 10 || gy === 0 || gy === 10;
          if (isEdge) {
            const p = toIso(gx, gy, originX, originY);
            ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + ISO_TILE_W / 2, p.y + ISO_TILE_H / 2);
            ctx.lineTo(p.x, p.y + ISO_TILE_H);
            ctx.lineTo(p.x - ISO_TILE_W / 2, p.y + ISO_TILE_H / 2);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // 3. Update Units Movement & Attack AI
      const curUnits = [...unitsRef.current];
      const curBuildings = [...buildingsRef.current];
      const curProjs = [...projsRef.current];
      const curPopups = [...popupsRef.current];
      const dHero = defHeroRef.current;

      let isClashing = false;

      // Attacking units action
      curUnits.forEach((unit) => {
        let targetX = 5;
        let targetY = 5;
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
          // March toward target
          const angle = Math.atan2(targetY - unit.y, targetX - unit.x);
          unit.x += Math.cos(angle) * unit.speed * 0.45 * dt;
          unit.y += Math.sin(angle) * unit.speed * 0.45 * dt;
        } else {
          // Attack target (fire projectile / strike)
          if (Math.random() < 0.05 * speedRef.current) {
            if (isAttackingHero && dHero) {
              dHero.hp = Math.max(0, dHero.hp - unit.attack);

              // Play canonical jutsu audio
              if (unit.troopId === 'fire_chunin') {
                freeAnimeAudio.playFireballRoar();
              } else if (unit.troopId === 'hyuga_striker') {
                freeAnimeAudio.playGentleFistStrike();
              } else if (unit.troopId === 'toad_vanguard') {
                freeAnimeAudio.playToadCleaverSmash();
              } else if (unit.troopId === 'konoha_genin') {
                freeAnimeAudio.playKunaiThrow();
              } else {
                freeAnimeAudio.playSwordClash();
              }

              const popupPrefix =
                unit.troopId === 'fire_chunin' ? '🔥'
                : unit.troopId === 'hyuga_striker' ? '⚡'
                : unit.troopId === 'toad_vanguard' ? '🗡️'
                : '🌪️';

              curPopups.push({
                x: toIso(dHero.x, dHero.y, originX, originY).x,
                y: toIso(dHero.x, dHero.y, originX, originY).y - 20,
                text: `${popupPrefix} -${unit.attack}`,
                color: unit.color,
                life: 1.0
              });

              if (dHero.hp <= 0) {
                dHero.defeated = true;
                setLootEarned((prev) => ({
                  berries: prev.berries + 400,
                  chakra: prev.chakra + 300
                }));
              }
            } else {
              const target = curBuildings.find((b) => !b.destroyed && Math.hypot(b.x - targetX, b.y - targetY) < 0.8);
              if (target) {
                target.hp = Math.max(0, target.hp - unit.attack);

                // Play canonical jutsu audio
                if (unit.troopId === 'fire_chunin') {
                  freeAnimeAudio.playFireballRoar();
                } else if (unit.troopId === 'hyuga_striker') {
                  freeAnimeAudio.playGentleFistStrike();
                } else if (unit.troopId === 'toad_vanguard') {
                  freeAnimeAudio.playToadCleaverSmash();
                } else if (unit.troopId === 'konoha_genin') {
                  freeAnimeAudio.playKunaiThrow();
                } else {
                  freeAnimeAudio.playSwordClash();
                }

                const popupPrefix =
                  unit.troopId === 'fire_chunin' ? '🔥'
                  : unit.troopId === 'hyuga_striker' ? '⚡'
                  : unit.troopId === 'toad_vanguard' ? '🗡️'
                  : '🌪️';

                curPopups.push({
                  x: toIso(target.x, target.y, originX, originY).x,
                  y: toIso(target.x, target.y, originX, originY).y - 25,
                  text: `${popupPrefix} -${unit.attack}`,
                  color: unit.color,
                  life: 0.9
                });

                if (target.hp <= 0) {
                  target.destroyed = true;
                  freeAnimeAudio.playClashImpact();

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

            // Spawn visual projectile
            const startPos = toIso(unit.x, unit.y, originX, originY);
            const endPos = toIso(targetX, targetY, originX, originY);
            curProjs.push({
              x: startPos.x,
              y: startPos.y - 12,
              targetX: endPos.x,
              targetY: endPos.y - 15,
              type: unit.projectileType,
              progress: 0,
              color: unit.color
            });
          }
        }
      });

      // Defending Hero AI
      if (dHero && !dHero.defeated && curUnits.length > 0) {
        curUnits.sort((a, b) => Math.hypot(a.x - dHero.x, a.y - dHero.y) - Math.hypot(b.x - dHero.x, b.y - dHero.y));
        const nearUnit = curUnits[0];
        const dist = Math.hypot(nearUnit.x - dHero.x, nearUnit.y - dHero.y);

        if (dist > dHero.range) {
          const angle = Math.atan2(nearUnit.y - dHero.y, nearUnit.x - dHero.x);
          dHero.x += Math.cos(angle) * 1.5 * dt;
          dHero.y += Math.sin(angle) * 1.5 * dt;
        } else {
          if (Math.random() < 0.04 * speedRef.current) {
            nearUnit.hp -= dHero.attack;
            freeAnimeAudio.playClashImpact();
            if (nearUnit.hp <= 0) {
              const uIdx = curUnits.indexOf(nearUnit);
              if (uIdx !== -1) curUnits.splice(uIdx, 1);
            }
          }
        }
      }

      setHeroClashActive(isClashing);

      // 4. Update & Draw Projectiles with Authentic Anime Jutsu Visuals
      for (let i = curProjs.length - 1; i >= 0; i--) {
        const pr = curProjs[i];
        pr.progress += dt * 4.4;
        const curX = pr.x + (pr.targetX - pr.x) * pr.progress;
        const curY = pr.y + (pr.targetY - pr.y) * pr.progress;

        if (pr.type === 'fireball') {
          // Blazing Fire Style: Grand Fireball (火遁・豪火球の術)
          ctx.save();
          const grad = ctx.createRadialGradient(curX, curY, 1, curX, curY, 11);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.25, '#fef08a');
          grad.addColorStop(0.65, '#f97316');
          grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(curX, curY, 11, 0, Math.PI * 2);
          ctx.fill();

          // Trailing ember sparks
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(curX - (pr.targetX - pr.x) * 0.06, curY - (pr.targetY - pr.y) * 0.06, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (pr.type === 'gentle_fist') {
          // Hyūga Gentle Fist Azure Chakra Needle Thrust (八卦六十四掌)
          ctx.save();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#67e8f9';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(curX - (pr.targetX - pr.x) * 0.09, curY - (pr.targetY - pr.y) * 0.09);
          ctx.lineTo(curX, curY);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(curX, curY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (pr.type === 'toad_slam') {
          // Mount Myoboku Toad Iron Cleaver Arc (ガマの大太刀)
          ctx.save();
          ctx.translate(curX, curY);
          ctx.rotate(now * 0.015);
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(0, 0, 8, -Math.PI * 0.6, Math.PI * 0.6);
          ctx.stroke();
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(-2, -2, 4, 4);
          ctx.restore();
        } else {
          // Spinning Shuriken & Kunai Storm (手裏剣・クナイ)
          ctx.save();
          ctx.translate(curX, curY);
          ctx.rotate(now * 0.025);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(-5, -1.2, 10, 2.4);
          ctx.fillRect(-1.2, -5, 2.4, 10);
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        if (pr.progress >= 1) {
          curProjs.splice(i, 1);
        }
      }

      // 5. Draw Buildings with Authentic Japanese Pagodas, Mortars & Treasuries
      curBuildings.sort((a, b) => a.x + a.y - (b.x + b.y));
      curBuildings.forEach((b) => {
        const p = toIso(b.x, b.y, originX, originY);
        const cx = p.x;
        const cy = p.y + ISO_TILE_H / 2;

        if (b.destroyed) {
          // Charred Plinth Foundation & Smoke
          ctx.fillStyle = '#1c1917';
          ctx.beginPath();
          ctx.ellipse(cx, cy, 22, 11, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('💥 BREACHED', cx, cy - 6);
        } else {
          // Draw authentic anime architecture using drawIsoBuilding!
          const bInst = toBuildingInstance(b);
          drawIsoBuilding(ctx, bInst, originX, originY, now * 0.001, false);

          // Building HP Bar
          const pct = Math.max(0, b.hp / b.maxHp);
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(cx - 16, cy - 36, 32, 4);
          ctx.fillStyle = pct > 0.4 ? '#22c55e' : '#ef4444';
          ctx.fillRect(cx - 16, cy - 36, 32 * pct, 4);
        }
      });

      // 6. Draw Defending Hero (Champion)
      if (dHero && !dHero.defeated) {
        const hp = toIso(dHero.x, dHero.y, originX, originY);
        const hcx = hp.x;
        const hcy = hp.y + ISO_TILE_H / 2;

        // Glowing Red Enemy Boss Aura
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.beginPath();
        ctx.ellipse(hcx, hcy, 24, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Hero Avatar Token
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(hcx, hcy - 22, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.fillText(dHero.avatar, hcx, hcy - 16);

        // Boss Bar
        const heroHpPct = Math.max(0, dHero.hp / dHero.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(hcx - 30, hcy - 46, 60, 11);
        ctx.strokeStyle = '#ef4444';
        ctx.strokeRect(hcx - 30, hcy - 46, 60, 11);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(hcx - 28, hcy - 44, 56 * heroHpPct, 7);

        ctx.font = 'bold 8px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`CHAMPION ${Math.round(dHero.hp)}`, hcx, hcy - 37);
      }

      // 7. Draw Attacking Units & Naruto Hero with Dynamic Combat Auras
      curUnits.forEach((u) => {
        const p = toIso(u.x, u.y, originX, originY);
        const cx = p.x;
        const cy = p.y + ISO_TILE_H / 2;

        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        if (u.isHero) {
          // Attacking Hero (Naruto) with Golden Kurama Chakra Aura
          ctx.fillStyle = 'rgba(249, 115, 22, 0.35)';
          ctx.beginPath();
          ctx.arc(cx, cy - 20, 20, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(cx, cy - 20, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.font = '15px serif';
          ctx.textAlign = 'center';
          ctx.fillText(u.icon, cx, cy - 14);

          // Hero Tag
          ctx.font = 'bold 8px sans-serif';
          ctx.fillStyle = '#fbbf24';
          ctx.fillText('NARUTO', cx, cy - 38);
        } else {
          // Shinobi Squad Unit Token with Clan Aura & Specialty Border
          ctx.save();
          // Chakra Foot Aura
          ctx.fillStyle =
            u.troopId === 'fire_chunin' ? 'rgba(249, 115, 22, 0.35)'
            : u.troopId === 'hyuga_striker' ? 'rgba(6, 182, 212, 0.4)'
            : u.troopId === 'toad_vanguard' ? 'rgba(34, 197, 94, 0.35)'
            : 'rgba(56, 189, 248, 0.35)';
          ctx.beginPath();
          ctx.arc(cx, cy - 14, 14, 0, Math.PI * 2);
          ctx.fill();

          // Token base
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(cx, cy - 14, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = u.color;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = '12px serif';
          ctx.textAlign = 'center';
          ctx.fillText(u.icon, cx, cy - 9);

          // Squad Tag
          const squadLabel =
            u.troopId === 'fire_chunin' ? 'CHUNIN'
            : u.troopId === 'hyuga_striker' ? 'HYŪGA'
            : u.troopId === 'toad_vanguard' ? 'TOAD'
            : 'GENIN';

          ctx.font = 'bold 7px sans-serif';
          ctx.fillStyle = u.color;
          ctx.fillText(squadLabel, cx, cy - 28);
          ctx.restore();
        }

        // Unit HP Bar
        const pct = Math.max(0, u.hp / u.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(cx - 10, cy - (u.isHero ? 34 : 25), 20, 3);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(cx - 10, cy - (u.isHero ? 34 : 25), 20 * pct, 3);
      });

      // 8. Draw Floating Damage Numbers
      for (let i = curPopups.length - 1; i >= 0; i--) {
        const pop = curPopups[i];
        pop.y -= dt * 25;
        pop.life -= dt;

        ctx.save();
        ctx.fillStyle = pop.color;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.globalAlpha = Math.max(0, pop.life);
        ctx.fillText(pop.text, pop.x, pop.y);
        ctx.restore();

        if (pop.life <= 0) {
          curPopups.splice(i, 1);
        }
      }

      // 9. Calculate Destruction & Star Progression
      const nonWallBuildings = curBuildings.filter((b) => b.type !== 'wall');
      const destroyedCount = nonWallBuildings.filter((b) => b.destroyed).length;
      const totalDestructible = Math.max(1, nonWallBuildings.length);
      const curPct = Math.round((destroyedCount / totalDestructible) * 100);
      setDestructionPct(curPct);

      if (curPct >= 100 && !battleFinished) {
        setBattleFinished(true);
        freeAnimeAudio.playEpisodeIntroFanfare();
      }

      setDeployedUnits(curUnits);
      setEnemyBuildings(curBuildings);
      setDefendingHero({ ...dHero });
      setDamagePopups(curPopups);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Finish Battle and claim rewards
  const handleFinishAndCollect = () => {
    const stars = destructionPct >= 100 ? 3 : destructionPct >= 50 ? 2 : destructionPct >= 20 ? 1 : 0;
    onFinishRaid(lootEarned.berries, lootEarned.chakra, selectedTarget.name, stars);
  };

  const totalTroopsRemaining = Object.entries(availableTroops).reduce((acc, [k, v]) => {
    return TROOPS_CATALOG.some((t) => t.id === k) && typeof v === 'number' ? acc + v : acc;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-2 sm:p-4 select-none animate-in fade-in duration-300">
      {screenFlash && <div className="absolute inset-0 bg-cyan-300 pointer-events-none z-40 opacity-50" />}

      {/* ============================================================ */}
      {/* 1. TOP TACTICAL HUD: TARGET SELECTION, LOOT & DESTRUCTION     */}
      {/* ============================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-3xl bg-[#091124]/95 border border-cyan-500/40 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <h3 className="text-sm sm:text-base font-black text-white">{selectedTarget.name}</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                HQ {selectedTarget.level}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Defense Champion: <strong className="text-amber-400">{defendingHero.name}</strong> &bull; Trophies: {selectedTarget.trophies}
            </div>
          </div>
        </div>

        {/* Live Battle Stats: Destruction Meter & Plunder */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* 3-Star Destruction Progress */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-sm font-bold">
              <span className={destructionPct >= 20 ? 'text-amber-400' : 'text-slate-600'}>⭐</span>
              <span className={destructionPct >= 50 ? 'text-amber-400' : 'text-slate-600'}>⭐</span>
              <span className={destructionPct >= 100 ? 'text-amber-400' : 'text-slate-600'}>⭐</span>
            </div>
            <span className="text-xs font-black text-white font-mono mt-0.5">
              {destructionPct}% Flattened
            </span>
          </div>

          {/* Plunder Counters */}
          <div className="flex items-center gap-2 bg-black/60 px-3.5 py-1.5 rounded-2xl border border-white/10">
            <div className="text-right">
              <div className="text-xs font-bold text-amber-300">💰 {lootEarned.berries}</div>
              <div className="text-xs font-bold text-cyan-300">🌀 {lootEarned.chakra}</div>
            </div>
          </div>

          {/* Speed & Target Switcher */}
          <button
            type="button"
            onClick={() => setIsGameFast(!isGameFast)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 border ${
              isGameFast
                ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-md'
                : 'bg-black/60 text-slate-300 border-white/10 hover:text-white'
            }`}
          >
            <FastForward size={14} />
            <span>{isGameFast ? '2X SPEED' : '1X SPEED'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CENTER BATTLEFIELD VIEWPORT                               */}
      {/* ============================================================ */}
      <div className="relative flex-1 flex items-center justify-center my-2 sm:my-3 rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
        <canvas
          ref={canvasRef}
          width={840}
          height={480}
          onClick={handleDeployOnCanvas}
          className="w-full h-full max-h-[520px] block cursor-crosshair select-none touch-manipulation object-contain"
        />

        {/* User-Friendly In-Canvas Deployment Guide Pill */}
        <div className="absolute top-3 left-4 px-3.5 py-1.5 rounded-full bg-black/85 border border-cyan-500/50 text-xs text-cyan-200 font-bold pointer-events-none flex items-center gap-2 shadow-lg backdrop-blur-md">
          <Crosshair size={14} className="text-cyan-400" />
          <span>Tap Glowing Perimeter Edge to Deploy &bull; Or Use 1-Click Tactical Lanes Below</span>
        </div>

        {/* 1v1 Hero Duel Alert Banner */}
        {heroClashActive && (
          <div className="absolute top-3 right-4 px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 border border-amber-300 text-slate-950 font-black text-xs shadow-xl animate-pulse flex items-center gap-2">
            <Sword size={16} className="text-slate-950 animate-spin" />
            <span>⚔️ HERO 1v1 DUEL IN PROGRESS!</span>
          </div>
        )}

        {/* 100% Annihilation Victory Screen */}
        {battleFinished && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 z-30">
            <Trophy size={56} className="text-yellow-400 animate-bounce mb-3 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]" />
            <h2 className="text-3xl sm:text-4xl font-black text-white">100% OUTPOST ANNIHILATION!</h2>
            <div className="text-amber-400 text-2xl font-bold my-2">⭐⭐⭐ 3-STAR GLORY</div>
            <p className="text-sm text-slate-300 max-w-md mt-1">
              You completely dismantled {selectedTarget.name}&apos;s fortifications and secured the Will of Fire!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 my-5">
              <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500 text-amber-300 font-black text-base shadow-lg">
                💰 +{lootEarned.berries} Berries Plundered
              </div>
              <div className="p-3.5 rounded-2xl bg-cyan-500/20 border border-cyan-500 text-cyan-300 font-black text-base shadow-lg">
                🌀 +{lootEarned.chakra} Chakra Secured
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-500/20 border border-purple-500 text-purple-300 font-black text-base shadow-lg">
                🏆 +35 Trophies
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishAndCollect}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 text-white font-black text-base shadow-2xl cursor-pointer transform hover:scale-105 transition"
            >
              Collect Plunder &amp; Return to Konoha
            </button>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. BOTTOM CONTROL DOCK: TACTICAL LANES, HERO JUTSU & TROOPS */}
      {/* ============================================================ */}
      <div className="flex flex-col gap-2 p-3 sm:p-4 rounded-3xl bg-[#091124]/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md">
        {/* Row A: 1-Click Strategic Deployment Lanes & Hero Jutsu */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold hidden sm:inline">
              QUICK TACTICAL LANES:
            </span>

            <button
              type="button"
              onClick={() => handleDeployLane('north')}
              disabled={totalTroopsRemaining <= 0 && heroDeployed}
              className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs cursor-pointer transition flex items-center gap-1"
            >
              <span>🟢 Flank North</span>
            </button>

            <button
              type="button"
              onClick={() => handleDeployLane('center')}
              disabled={totalTroopsRemaining <= 0 && heroDeployed}
              className="px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 font-bold text-xs cursor-pointer transition flex items-center gap-1"
            >
              <span>🟡 Frontal Charge</span>
            </button>

            <button
              type="button"
              onClick={() => handleDeployLane('south')}
              disabled={totalTroopsRemaining <= 0 && heroDeployed}
              className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold text-xs cursor-pointer transition flex items-center gap-1"
            >
              <span>🔴 Flank South</span>
            </button>

            <button
              type="button"
              onClick={handleDeployAllUnits}
              disabled={totalTroopsRemaining <= 0 && heroDeployed}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 hover:brightness-110 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow-md transition flex items-center gap-1.5"
            >
              <Zap size={14} className="fill-slate-950" />
              <span>Deploy All Squad ({totalTroopsRemaining})</span>
            </button>
          </div>

          {/* Hero Ultimate Rasengan Activation */}
          <button
            type="button"
            onClick={handleTriggerHeroUltimate}
            disabled={!heroUltimateReady || battleFinished}
            className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-lg ${
              heroUltimateReady && !battleFinished
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <Flame size={14} />
            <span>{heroUltimateReady ? '🌀 Hero Ultimate: Rasengan' : 'Ultimate Expended'}</span>
          </button>
        </div>

        {/* Row B: Select Troop Unit & End Battle */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Hero Deploy Selection */}
            <button
              type="button"
              onClick={() => setSelectedDeployTroop('hero')}
              disabled={heroDeployed}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black transition cursor-pointer border ${
                selectedDeployTroop === 'hero'
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-800 text-white border-white/10 hover:bg-slate-700 disabled:opacity-40'
              }`}
            >
              <span className="text-base">{activeHero.avatar}</span>
              <span>{activeHero.name.split(' ')[0]} (HERO)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/40 text-amber-300">
                {heroDeployed ? 'DEPLOYED' : 'READY'}
              </span>
            </button>

            {/* Troops Selection */}
            {TROOPS_CATALOG.map((t) => {
              const count = availableTroops[t.id] || 0;
              const isSelected = selectedDeployTroop === t.id;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedDeployTroop(t.id)}
                  disabled={count <= 0}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 ring-2 ring-cyan-400 font-black shadow-md'
                      : 'bg-slate-800 text-slate-200 border-white/10 hover:bg-slate-700 disabled:opacity-40'
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

          <button
            type="button"
            onClick={handleFinishAndCollect}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs text-slate-300 font-bold cursor-pointer transition flex items-center gap-1"
          >
            <span>Retreat &amp; Claim Plunder</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
