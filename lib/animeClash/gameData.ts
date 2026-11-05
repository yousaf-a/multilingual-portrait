// Anime Clash: Neo-Village Chronicles - Game Data Catalog

import { HeroData, TroopData, BuildingInstance, StoryChapter, PlayerVillageState, SanctuaryGuild } from './types';

export const HEROES_CATALOG: Record<string, HeroData> = {
  naruto: {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    title: 'Seventh Hokage / Will of Fire',
    franchise: 'naruto',
    avatar: '🍥',
    image: '/anime-heroes/naruto-tactical.png',
    hp: 950,
    maxHp: 950,
    attack: 85,
    range: 1.5,
    speed: 3.2,
    quote: "I never go back on my word — that's my nindo, even in this concrete jungle!",
    modernOutfit: 'Orange & Black High-Tech Windbreaker, Tactical Leg Holster, Leaf Village Headband Beanie',
    skillName: 'Multi-Shadow Clone Diversion',
    skillDesc: 'Spawns 4 shadow clones that rush enemy towers, absorbing defensive fire for 5 seconds.',
    ultimateName: 'Wind Style: Rasenshuriken',
    ultimateDesc: 'Hurls an expanding vortex of wind chakra dealing 450 AOE damage and fragmenting walls.',
    ultimateCooldown: 14,
    color: '#f97316',
    accentColor: '#fdba74'
  },
  luffy: {
    id: 'luffy',
    name: 'Monkey D. Luffy',
    title: 'Future King of the Pirates / Gear Master',
    franchise: 'one_piece',
    avatar: '🍖',
    image: '/anime-heroes/luffy-tactical.jpg',
    hp: 1250,
    maxHp: 1250,
    attack: 90,
    range: 2.8,
    speed: 2.7,
    quote: "If anyone threatens our sanctuary, I'm gonna kick their butt all the way back across the ocean!",
    modernOutfit: 'Crimson Leather Sleeveless Vest, Heavy-Duty Cargo Pants, Classic Straw Hat with Weatherproof Cord',
    skillName: 'Gum-Gum Red Hawk',
    skillDesc: 'Ignites armament-haki fist with high-speed friction, blasting target defense for 2.2x damage.',
    ultimateName: 'Conqueror’s Haki Outburst',
    ultimateDesc: 'Unleashes supreme kingly disposition, stunning all defenses within 5 tiles for 4 seconds.',
    ultimateCooldown: 16,
    color: '#dc2626',
    accentColor: '#f87171'
  },
  ichigo: {
    id: 'ichigo',
    name: 'Ichigo Kurosaki',
    title: 'Substitute Shinigami / Moon Cutter',
    franchise: 'bleach',
    avatar: '⚔️',
    image: '/anime-heroes/ichigo-tactical.jpg',
    hp: 800,
    maxHp: 800,
    attack: 120,
    range: 1.8,
    speed: 4.0,
    quote: "I don't fight because I want to win; I fight because I have people to protect.",
    modernOutfit: 'Obsidian Trench Coat with Crimson Silk Lining, Combat Boots, Silver Shinigami Pass Pendant',
    skillName: 'Shunpo Flash-Step Raid',
    skillDesc: 'Instantaneously teleports behind the nearest heavy turret, ignoring outer wall barriers.',
    ultimateName: 'Bankai: Getsuga Tensho',
    ultimateDesc: 'Fires a massive pitch-black reiatsu blade wave that pierces through an entire straight line of buildings.',
    ultimateCooldown: 12,
    color: '#1e1b4b',
    accentColor: '#6366f1'
  },
  asta: {
    id: 'asta',
    name: 'Asta',
    title: 'Black Bulls Anti-Magic Knight',
    franchise: 'black_clover',
    avatar: '🍀',
    image: '/anime-heroes/asta-tactical.jpg',
    hp: 1100,
    maxHp: 1100,
    attack: 95,
    range: 1.6,
    speed: 3.0,
    quote: "My magic is never giving up! No matter what dimension we’re in, I will carve our path!",
    modernOutfit: 'Urban Street Fighter Athletic Sleeveless Hoodie, Demon-Slayer Leather Harness, 5-Leaf Badge',
    skillName: 'Demon-Dweller Deflect',
    skillDesc: 'Spins black greatsword, deflecting incoming enemy projectiles back to attacker for 4s.',
    ultimateName: 'Black Meteorite',
    ultimateDesc: 'Enters Anti-Magic Black Form and rockets into the highest-HP turret, silencing it permanently.',
    ultimateCooldown: 15,
    color: '#047857',
    accentColor: '#34d399'
  }
};

export const TROOPS_CATALOG: TroopData[] = [
  {
    id: 'konoha_genin',
    name: 'Konoha Shinobi Operative',
    franchise: 'naruto',
    cost: 40,
    resourceType: 'chakra',
    hp: 120,
    attack: 35,
    range: 3.5,
    speed: 3.8,
    desc: 'Agile modern ninja throwing shuriken from distance. Rapid fire.',
    icon: '🥷'
  },
  {
    id: 'strawhat_brawler',
    name: 'Straw Hat Corsair Brawler',
    franchise: 'one_piece',
    cost: 65,
    resourceType: 'berries',
    hp: 340,
    attack: 55,
    range: 1.0,
    speed: 2.2,
    desc: 'Heavy frontline tank with high durability. Targets resource storages.',
    icon: '🏴‍☠️'
  },
  {
    id: 'shinigami_patrol',
    name: 'Soul Reaper Sentry',
    franchise: 'bleach',
    cost: 50,
    resourceType: 'reishi',
    hp: 180,
    attack: 60,
    range: 2.5,
    speed: 3.2,
    desc: 'Wields Zanpakuto with spiritual blade beams. High damage against walls.',
    icon: '🗡️'
  },
  {
    id: 'black_bulls_mage',
    name: 'Black Bulls Apprentice',
    franchise: 'black_clover',
    cost: 75,
    resourceType: 'berries',
    hp: 210,
    attack: 75,
    range: 4.2,
    speed: 2.5,
    desc: 'Casts destructive elemental burst spells that bypass enemy energy shields.',
    icon: '🔮'
  }
];

export const INITIAL_VILLAGE_BUILDINGS: BuildingInstance[] = [
  {
    id: 'core_1',
    type: 'command_core',
    name: 'Neo-Hokage Command Core',
    level: 1,
    x: 5,
    y: 5,
    hp: 1800,
    maxHp: 1800,
    color: '#f97316',
    icon: '🏛️'
  },
  {
    id: 'chakra_1',
    type: 'chakra_turbine',
    name: 'Chakra Hydro-Turbine',
    level: 1,
    x: 3,
    y: 4,
    hp: 550,
    maxHp: 550,
    productionRate: 15,
    resourceProduced: 'chakra',
    color: '#06b6d4',
    icon: '🌀'
  },
  {
    id: 'berry_1',
    type: 'berry_treasury',
    name: 'Berry Vault',
    level: 1,
    x: 7,
    y: 4,
    hp: 600,
    maxHp: 600,
    productionRate: 20,
    resourceProduced: 'berries',
    color: '#eab308',
    icon: '💰'
  },
  {
    id: 'reishi_1',
    type: 'reishi_siphon',
    name: 'Spiritual Reishi Battery',
    level: 1,
    x: 5,
    y: 3,
    hp: 500,
    maxHp: 500,
    productionRate: 12,
    resourceProduced: 'reishi',
    color: '#a855f7',
    icon: '🔮'
  },
  {
    id: 'cannon_1',
    type: 'haki_cannon',
    name: 'Haki Rail Cannon',
    level: 1,
    x: 3,
    y: 7,
    hp: 750,
    maxHp: 750,
    attack: 45,
    range: 5,
    color: '#ef4444',
    icon: '💣'
  },
  {
    id: 'mortar_1',
    type: 'paper_mortar',
    name: 'Paper-Bomb Mortar',
    level: 1,
    x: 7,
    y: 7,
    hp: 650,
    maxHp: 650,
    attack: 55,
    range: 6.5,
    color: '#f59e0b',
    icon: '💥'
  },
  {
    id: 'wall_1',
    type: 'defense_wall',
    name: 'Titanium Wall',
    level: 1,
    x: 4,
    y: 6,
    hp: 850,
    maxHp: 850,
    color: '#64748b',
    icon: '🧱'
  },
  {
    id: 'wall_2',
    type: 'defense_wall',
    name: 'Titanium Wall',
    level: 1,
    x: 5,
    y: 6,
    hp: 850,
    maxHp: 850,
    color: '#64748b',
    icon: '🧱'
  },
  {
    id: 'wall_3',
    type: 'defense_wall',
    name: 'Titanium Wall',
    level: 1,
    x: 6,
    y: 6,
    hp: 850,
    maxHp: 850,
    color: '#64748b',
    icon: '🧱'
  }
];

export const INITIAL_PLAYER_STATE: PlayerVillageState = {
  level: 1,
  berries: 650,
  chakra: 500,
  reishi: 400,
  maxStorage: 2500,
  buildings: INITIAL_VILLAGE_BUILDINGS,
  unlockedHeroes: ['naruto', 'luffy', 'ichigo', 'asta'],
  activeHeroId: 'naruto',
  completedChapters: [],
  heroLevels: { naruto: 1, luffy: 1, ichigo: 1, asta: 1 },
  trainedTroops: { konoha_ninja: 8, strawhat_brawler: 4, shinigami_patrol: 4, black_bulls_mage: 2 },
  weatherMode: 'night',
  activeGuildId: 'hidden_leaf',
  guildContribution: 120
};

export const SANCTUARY_GUILDS: SanctuaryGuild[] = [
  {
    id: 'hidden_leaf',
    name: 'Hidden Leaf Shinobi Coalition',
    tag: 'WILL OF FIRE',
    icon: '🍃',
    franchise: 'naruto',
    perkTitle: 'Body Flicker Logistics',
    perkDesc: '+18% Troop Movement Speed & +25% Chakra Passive Generation.',
    level: 4,
    memberCount: 48,
    leader: 'Seventh Hokage'
  },
  {
    id: 'strawhat_armada',
    name: 'Straw Hat Grand Armada',
    tag: 'SUN GOD DAWN',
    icon: '🏴‍☠️',
    franchise: 'one_piece',
    perkTitle: 'Baccarat Treasury Plunder',
    perkDesc: '+30% Plunder Loot from Syndicate Raids & +20% Storage Cap.',
    level: 5,
    memberCount: 50,
    leader: 'Straw Hat Luffy'
  },
  {
    id: 'gotei_squads',
    name: 'Gotei 13 Court Guard Squads',
    tag: 'SOUL SANCTUARY',
    icon: '⚔️',
    franchise: 'bleach',
    perkTitle: 'Sekiseki Barrier Fortification',
    perkDesc: '+25% Defense Wall HP & Haki Cannon Range +1.5 Tiles.',
    level: 3,
    memberCount: 42,
    leader: 'Head Captain Kurosaki'
  },
  {
    id: 'black_bulls',
    name: 'Black Bulls Rogue Brigade',
    tag: 'SURPASS LIMITS',
    icon: '🐂',
    franchise: 'black_clover',
    perkTitle: 'Anti-Magic Singularity',
    perkDesc: '+35% Hero Ultimate Damage & Ultimate Cooldown -3 Seconds.',
    level: 4,
    memberCount: 39,
    leader: 'Anti-Magic Knight Asta'
  }
];

export interface AnimeVoiceShout {
  heroId: string;
  shoutText: string;
  kanji: string;
  subTitle: string;
  audioKey: string;
}

export const ANIME_VOICE_SHOUTS: Record<string, AnimeVoiceShout> = {
  naruto: {
    heroId: 'naruto',
    shoutText: 'RASENGAN!!',
    kanji: '螺旋丸',
    subTitle: 'Wind Style: Spiral Sphere Vortex',
    audioKey: 'wind_vortex'
  },
  luffy: {
    heroId: 'luffy',
    shoutText: 'GOMU GOMU NO... RED HAWK!!',
    kanji: 'ゴムゴムの火拳銃',
    subTitle: 'Gear Second Flame Friction Impact',
    audioKey: 'flame_impact'
  },
  ichigo: {
    heroId: 'ichigo',
    shoutText: 'BANKAI: TENSA ZANGETSU!!',
    kanji: '卍解・天鎖斬月',
    subTitle: 'Heaven Chain Slicing Moon',
    audioKey: 'getsuga_slash'
  },
  asta: {
    heroId: 'asta',
    shoutText: 'BLACK DIVIDER!!',
    kanji: '断魔・ブラックディバイダー',
    subTitle: 'Demon-Slayer Greatsword Cleave',
    audioKey: 'black_divider'
  }
};

export interface VillageHQPlan {
  level: number;
  title: string;
  maxStorage: number;
  maxBuildings: number;
  maxHeroLevel: number;
  maxBuildingLevel: number;
  armyCampCapacity: number;
  upgradeCostBerries: number;
  upgradeCostChakra: number;
  unlockedFeatures: string[];
  heroBuffBonus: string;
}

export const VILLAGE_HQ_LEVEL_PLANS: Record<number, VillageHQPlan> = {
  1: {
    level: 1,
    title: 'Neon Outpost',
    maxStorage: 2500,
    maxBuildings: 12,
    maxHeroLevel: 5,
    maxBuildingLevel: 2,
    armyCampCapacity: 30,
    upgradeCostBerries: 0,
    upgradeCostChakra: 0,
    unlockedFeatures: ['Command Core', 'Haki Rail Cannon', 'Titanium Wall Tier 1', 'Chakra Turbine', 'Max Hero Lv 5'],
    heroBuffBonus: 'Base hero stats active.'
  },
  2: {
    level: 2,
    title: 'Fortified Sanctuary',
    maxStorage: 5000,
    maxBuildings: 18,
    maxHeroLevel: 10,
    maxBuildingLevel: 3,
    armyCampCapacity: 50,
    upgradeCostBerries: 800,
    upgradeCostChakra: 500,
    unlockedFeatures: ['Spiritual Tower', 'Paper-Bomb Traps', 'Storage Expansion (+100%)', 'Wall Tier 2', 'Max Hero Lv 10'],
    heroBuffBonus: '+15% Hero HP & Guard Patrol Aura.'
  },
  3: {
    level: 3,
    title: 'Dimensional Bastion',
    maxStorage: 10000,
    maxBuildings: 24,
    maxHeroLevel: 15,
    maxBuildingLevel: 5,
    armyCampCapacity: 80,
    upgradeCostBerries: 2200,
    upgradeCostChakra: 1400,
    unlockedFeatures: ['Heavy Laser Mortar', 'Reishi Siphon Overclock', 'Auto-Repair Shield', 'Wall Tier 3', 'Max Hero Lv 15'],
    heroBuffBonus: '+30% Hero Damage & Ultimate Cooldown -2s.'
  },
  4: {
    level: 4,
    title: 'Metropolitan Fortress',
    maxStorage: 25000,
    maxBuildings: 32,
    maxHeroLevel: 20,
    maxBuildingLevel: 7,
    armyCampCapacity: 120,
    upgradeCostBerries: 5000,
    upgradeCostChakra: 3200,
    unlockedFeatures: ['Hero Awakening Shrine', 'Twin Rail Cannons', 'EMP Defense Barrier', 'Wall Tier 4', 'Max Hero Lv 20'],
    heroBuffBonus: '+50% Hero Firepower & Instant Guard Teleport.'
  },
  5: {
    level: 5,
    title: 'Apex Celestial Citadel',
    maxStorage: 60000,
    maxBuildings: 42,
    maxHeroLevel: 30,
    maxBuildingLevel: 10,
    armyCampCapacity: 180,
    upgradeCostBerries: 12000,
    upgradeCostChakra: 8000,
    unlockedFeatures: ['Tetra-Dimensional Forcefield', 'Orbital Rail Artillery', 'Infinite Void Trap', 'Master Walls', 'Max Hero Lv 30'],
    heroBuffBonus: '+100% Hero Stats & Permanent Awakening Aura.'
  }
};

export function getMaxBuildingLevelForHQ(hqLevel: number): number {
  return hqLevel === 1 ? 2 : hqLevel === 2 ? 3 : hqLevel === 3 ? 5 : hqLevel === 4 ? 7 : 10;
}

export function getMaxHeroLevelForHQ(hqLevel: number): number {
  return hqLevel === 1 ? 5 : hqLevel === 2 ? 10 : hqLevel === 3 ? 15 : hqLevel === 4 ? 20 : 30;
}

export function getArmyCampCapForHQ(hqLevel: number): number {
  return hqLevel === 1 ? 30 : hqLevel === 2 ? 50 : hqLevel === 3 ? 80 : hqLevel === 4 ? 120 : 180;
}

export function getHeroStatsForLevel(baseHero: HeroData, level: number = 1) {
  const hpMultiplier = 1 + (level - 1) * 0.18;
  const atkMultiplier = 1 + (level - 1) * 0.15;
  const currentHp = Math.round(baseHero.hp * hpMultiplier);
  const currentAtk = Math.round(baseHero.attack * atkMultiplier);
  return {
    ...baseHero,
    level,
    hp: currentHp,
    maxHp: currentHp,
    attack: currentAtk
  };
}

export function getHeroUpgradeCost(heroId: string, currentLevel: number) {
  if (heroId === 'naruto') {
    return { resource: 'chakra' as const, amount: currentLevel * 180, label: `🌀 ${currentLevel * 180} Chakra` };
  }
  if (heroId === 'luffy') {
    return { resource: 'berries' as const, amount: currentLevel * 200, label: `💰 ${currentLevel * 200} Berries` };
  }
  if (heroId === 'ichigo') {
    return { resource: 'reishi' as const, amount: currentLevel * 160, label: `🔮 ${currentLevel * 160} Reishi` };
  }
  return { resource: 'berries' as const, amount: currentLevel * 150, chakraAmount: currentLevel * 100, label: `💰 ${currentLevel * 150} + 🌀 ${currentLevel * 100}` };
}

export interface BaseLayoutPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  tag: string;
  applyLayout: (currentBuildings: BuildingInstance[]) => BuildingInstance[];
}

export const BASE_LAYOUT_PRESETS: BaseLayoutPreset[] = [
  {
    id: 'trophy_fortress',
    name: 'Trophy Fortress',
    description: 'Town Hall centered at (5,5), tightly wrapped in protective titanium walls, flanked by Haki cannons and spiritual towers.',
    icon: '🛡️',
    tag: 'Balanced Defense',
    applyLayout: (buildings) => {
      const core = buildings.find((b) => b.type === 'command_core');
      const walls = buildings.filter((b) => b.type === 'defense_wall');
      const defenses = buildings.filter((b) => b.type === 'haki_cannon' || b.type === 'kido_spire' || b.type === 'paper_mortar');
      const storages = buildings.filter((b) => b.type === 'berry_treasury' || b.type === 'chakra_turbine' || b.type === 'reishi_siphon');

      const updated: BuildingInstance[] = [];
      if (core) updated.push({ ...core, x: 5, y: 5 });

      const wallCoords = [{ x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 4, y: 5 }, { x: 6, y: 5 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }];
      walls.forEach((w, idx) => {
        const coord = wallCoords[idx % wallCoords.length];
        updated.push({ ...w, x: coord.x, y: coord.y });
      });

      const defCoords = [{ x: 3, y: 5 }, { x: 7, y: 5 }, { x: 5, y: 3 }, { x: 5, y: 7 }, { x: 3, y: 3 }, { x: 7, y: 7 }];
      defenses.forEach((d, idx) => {
        const coord = defCoords[idx % defCoords.length];
        updated.push({ ...d, x: coord.x, y: coord.y });
      });

      const storCoords = [{ x: 3, y: 4 }, { x: 7, y: 6 }, { x: 4, y: 3 }, { x: 6, y: 7 }, { x: 2, y: 5 }, { x: 8, y: 5 }];
      storages.forEach((s, idx) => {
        const coord = storCoords[idx % storCoords.length];
        updated.push({ ...s, x: coord.x, y: coord.y });
      });

      buildings.forEach((b) => {
        if (!updated.some((u) => u.id === b.id)) updated.push(b);
      });

      return updated;
    }
  },
  {
    id: 'vault_sanctuary',
    name: 'Vault Sanctuary',
    description: 'Gold & Chakra vaults locked inside heavy core walls, protecting resources from enemy plunderers.',
    icon: '💰',
    tag: 'Resource Protection',
    applyLayout: (buildings) => {
      const storages = buildings.filter((b) => b.type === 'berry_treasury' || b.type === 'chakra_turbine' || b.type === 'reishi_siphon');
      const core = buildings.find((b) => b.type === 'command_core');
      const walls = buildings.filter((b) => b.type === 'defense_wall');
      const others = buildings.filter((b) => b.type !== 'command_core' && b.type !== 'defense_wall' && !b.type.includes('treasury') && !b.type.includes('turbine') && !b.type.includes('siphon'));

      const updated: BuildingInstance[] = [];
      if (core) updated.push({ ...core, x: 4, y: 4 });

      const storCoords = [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 6 }];
      storages.forEach((s, idx) => {
        const coord = storCoords[idx % storCoords.length];
        updated.push({ ...s, x: coord.x, y: coord.y });
      });

      const wallCoords = [{ x: 4, y: 5 }, { x: 4, y: 6 }, { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 5, y: 7 }, { x: 6, y: 7 }];
      walls.forEach((w, idx) => {
        const coord = wallCoords[idx % wallCoords.length];
        updated.push({ ...w, x: coord.x, y: coord.y });
      });

      const defCoords = [{ x: 3, y: 3 }, { x: 8, y: 3 }, { x: 3, y: 8 }, { x: 8, y: 8 }, { x: 2, y: 5 }, { x: 9, y: 5 }];
      others.forEach((o, idx) => {
        const coord = defCoords[idx % defCoords.length];
        updated.push({ ...o, x: coord.x, y: coord.y });
      });

      buildings.forEach((b) => {
        if (!updated.some((u) => u.id === b.id)) updated.push(b);
      });

      return updated;
    }
  },
  {
    id: 'anti_syndicate_cross',
    name: 'Anti-Syndicate Crossfire',
    description: 'Cannons and laser mortars placed at 4 cardinal gates, creating overlapping killzones with no blind spots.',
    icon: '⚔️',
    tag: 'Aggressive Crossfire',
    applyLayout: (buildings) => {
      const core = buildings.find((b) => b.type === 'command_core');
      const defenses = buildings.filter((b) => b.type === 'haki_cannon' || b.type === 'kido_spire' || b.type === 'paper_mortar');
      const walls = buildings.filter((b) => b.type === 'defense_wall');
      const storages = buildings.filter((b) => b.type === 'berry_treasury' || b.type === 'chakra_turbine' || b.type === 'reishi_siphon');

      const updated: BuildingInstance[] = [];
      if (core) updated.push({ ...core, x: 5, y: 5 });

      const defCoords = [{ x: 2, y: 5 }, { x: 8, y: 5 }, { x: 5, y: 2 }, { x: 5, y: 8 }, { x: 3, y: 3 }, { x: 7, y: 7 }];
      defenses.forEach((d, idx) => {
        const coord = defCoords[idx % defCoords.length];
        updated.push({ ...d, x: coord.x, y: coord.y });
      });

      const wallCoords = [{ x: 4, y: 5 }, { x: 6, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 6 }, { x: 3, y: 4 }, { x: 7, y: 6 }, { x: 4, y: 7 }, { x: 6, y: 3 }];
      walls.forEach((w, idx) => {
        const coord = wallCoords[idx % wallCoords.length];
        updated.push({ ...w, x: coord.x, y: coord.y });
      });

      const storCoords = [{ x: 3, y: 6 }, { x: 6, y: 3 }, { x: 7, y: 4 }, { x: 4, y: 7 }, { x: 2, y: 4 }, { x: 8, y: 6 }];
      storages.forEach((s, idx) => {
        const coord = storCoords[idx % storCoords.length];
        updated.push({ ...s, x: coord.x, y: coord.y });
      });

      buildings.forEach((b) => {
        if (!updated.some((u) => u.id === b.id)) updated.push(b);
      });

      return updated;
    }
  }
];

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'ch_1',
    chapterNumber: 1,
    title: 'Dimensional Rupture: Shibuya Crossing',
    subtitle: 'Naruto meets the Modern World',
    franchiseFocus: 'naruto',
    modernLocation: 'Tokyo, Japan (2026)',
    briefing: 'A dimensional fracture opens right above Shibuya. High-tech rogue ninja syndicates are raiding the power grid. Naruto stands guard to protect civilian towers.',
    dialogs: [
      {
        speaker: 'Naruto Uzumaki',
        franchise: 'naruto',
        avatar: '🍥',
        text: 'Whoa... what kind of village is this?! Towers made of shiny glass, and giant iron beetles moving on asphalt without horses?!',
        expression: 'shocked'
      },
      {
        speaker: 'Luffy',
        franchise: 'one_piece',
        avatar: '🍖',
        text: 'Hey Naruto! Look at those neon signs! Do you think they sell giant roasted ribs in those glass towers?!',
        expression: 'humorous'
      },
      {
        speaker: 'Naruto Uzumaki',
        franchise: 'naruto',
        avatar: '🍥',
        text: 'Focus, Luffy! Look over there — mechanized rogue sound ninjas are targeting that electrical power station! We have to build our defensive perimeter now!',
        expression: 'serious'
      }
    ],
    rewardBerries: 500,
    rewardChakra: 400,
    rewardReishi: 250,
    unlockedHeroId: 'ichigo',
    enemyBasePreset: 'shibuya_outpost'
  },
  {
    id: 'ch_2',
    chapterNumber: 2,
    title: 'Pirate Armada at the Industrial Docks',
    subtitle: 'Luffy commands the Coastal Harbor',
    franchiseFocus: 'one_piece',
    modernLocation: 'Yokohama Shipping Port',
    briefing: 'Corrupted cyber-corsairs equipped with laser artillery have blockaded the container harbor. Luffy and the Straw Hat brawlers must shatter their naval fortress.',
    dialogs: [
      {
        speaker: 'Luffy',
        franchise: 'one_piece',
        avatar: '🍖',
        text: 'They dare call themselves pirates while bullying defenseless dock workers?! Zoro, get ready to slice their heavy blast gates!',
        expression: 'confident'
      },
      {
        speaker: 'Ichigo Kurosaki',
        franchise: 'bleach',
        avatar: '⚔️',
        text: 'Hold your horses, Straw Hat. Those cargo cranes have automated rail cannons tracking thermal signatures. I’ll flash-step inside and disable their generator first.',
        expression: 'serious'
      },
      {
        speaker: 'Luffy',
        franchise: 'one_piece',
        avatar: '🍖',
        text: 'Haha, sounds like fun! Let’s show them what real pirate freedom looks like! Gum-Gum...!',
        expression: 'confident'
      }
    ],
    rewardBerries: 800,
    rewardChakra: 600,
    rewardReishi: 500,
    unlockedHeroId: 'asta',
    enemyBasePreset: 'yokohama_docks'
  },
  {
    id: 'ch_3',
    chapterNumber: 3,
    title: 'Midnight Hollows on Roppongi Hills',
    subtitle: 'Ichigo’s Moonlight Exorcism',
    franchiseFocus: 'bleach',
    modernLocation: 'Tokyo Rooftops & Skyscraper Spires',
    briefing: 'A rift to the Hollow Realm opens across the skyscraper skyline. Ichigo uses Bankai to intercept Menos Grande entities before they crush the city.',
    dialogs: [
      {
        speaker: 'Ichigo Kurosaki',
        franchise: 'bleach',
        avatar: '⚔️',
        text: 'The spiritual pressure in this city is off the charts. The modern radio frequencies are amplifying hollow resonance.',
        expression: 'serious'
      },
      {
        speaker: 'Asta',
        franchise: 'black_clover',
        avatar: '🍀',
        text: 'WOAH! Look at that giant black shadow with the white bone mask! It doesn’t have magic, but my Anti-Magic sword is vibrating like crazy!',
        expression: 'confident'
      },
      {
        speaker: 'Ichigo Kurosaki',
        franchise: 'bleach',
        avatar: '⚔️',
        text: 'Asta, your sword can absorb spiritual energy. If you take point and disrupt their Cero beam, I’ll finish them with a Getsuga Tensho.',
        expression: 'confident'
      }
    ],
    rewardBerries: 1200,
    rewardChakra: 900,
    rewardReishi: 1000,
    enemyBasePreset: 'roppongi_hollow_fort'
  },
  {
    id: 'ch_4',
    chapterNumber: 4,
    title: 'The Anti-Magic Spire of the Clover',
    subtitle: 'Asta against the Rogue AI Warlord',
    franchiseFocus: 'black_clover',
    modernLocation: 'Neo-Silicon Research Fortress',
    briefing: 'A rogue cybernetic fortress powered by forbidden hybrid magic threatens to overwrite the modern digital world. All 4 heroes initiate an all-out assault!',
    dialogs: [
      {
        speaker: 'Asta',
        franchise: 'black_clover',
        avatar: '🍀',
        text: 'They think they can rule through cold algorithms and stolen spells?! NEVER GIVING UP IS OUR GREATEST MAGIC!',
        expression: 'confident'
      },
      {
        speaker: 'Naruto Uzumaki',
        franchise: 'naruto',
        avatar: '🍥',
        text: 'That’s the spirit, Asta! All four of us together — nobody can break our bond or our sanctuary!',
        expression: 'confident'
      },
      {
        speaker: 'Luffy',
        franchise: 'one_piece',
        avatar: '🍖',
        text: 'Let’s smash this fortress to pieces and have an enormous banquet with all the meat in the city!!',
        expression: 'humorous'
      }
    ],
    rewardBerries: 2000,
    rewardChakra: 1500,
    rewardReishi: 1500,
    enemyBasePreset: 'cyber_clover_citadel'
  }
];

