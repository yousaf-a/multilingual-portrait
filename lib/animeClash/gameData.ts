// Anime Clash: Neo-Village Chronicles - Game Data Catalog

import { HeroData, TroopData, BuildingInstance, StoryChapter, PlayerVillageState } from './types';

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
  berries: 450,
  chakra: 300,
  reishi: 250,
  maxStorage: 2500,
  buildings: INITIAL_VILLAGE_BUILDINGS,
  unlockedHeroes: ['naruto', 'luffy'],
  activeHeroId: 'naruto',
  completedChapters: []
};

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

