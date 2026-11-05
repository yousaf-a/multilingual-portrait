// Anime Clash: Neo-Village Chronicles - Game Data Catalog

import { HeroData, TroopData, BuildingInstance, StoryChapter, PlayerVillageState, SanctuaryGuild, FriendProfile } from './types';

export const HEROES_CATALOG: Record<string, HeroData> = {
  naruto: {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    title: 'Seventh Hokage / Will of Fire',
    franchise: 'naruto',
    avatar: '🍥',
    image: '/anime-heroes/naruto-heroic.png',
    hp: 950,
    maxHp: 950,
    attack: 85,
    range: 1.5,
    speed: 3.2,
    quote: "I never go back on my word — that's my nindo, even in this concrete jungle!",
    catchphrase: "Dattebayo! Believe it! That's my nindo, my ninja way!",
    catchphraseJp: "まっすぐ自分の言葉は曲げねぇ、それがオレの忍道だ！だってばよ！",
    modernOutfit: 'Orange & Black High-Tech Windbreaker, Tactical Leg Holster, Leaf Village Headband Beanie',
    skillName: 'Multi-Shadow Clone Diversion',
    skillDesc: 'Spawns 4 shadow clones that rush enemy towers, absorbing defensive fire for 5 seconds.',
    ultimateName: 'Wind Style: Rasenshuriken',
    ultimateDesc: 'Hurls an expanding vortex of wind chakra dealing 450 AOE damage and fragmenting walls.',
    ultimateCooldown: 14,
    color: '#f97316',
    accentColor: '#fdba74',
    tierRank: 'goat',
    poseImages: {
      combat: '/anime-heroes/naruto-heroic.png',
      epic: '/anime-heroes/naruto-epic.png',
      goat: '/anime-heroes/naruto-goat.png'
    },
    forms: [
      {
        id: 'normal',
        name: 'Seventh Hokage Tactical',
        badge: '🥉 Normal Form',
        title: 'Shinobi Operative Commander',
        attackMultiplier: 1.0,
        hpMultiplier: 1.0,
        auraColor: '#f97316',
        auraVfx: 'wind',
        customSkill: 'Multi-Shadow Clone Diversion',
        customUltimate: 'Wind Style: Rasenshuriken',
        catchphrase: "Dattebayo! Believe it! That's my nindo, my ninja way!",
        catchphraseJp: "まっすぐ自分の言葉は曲げねぇ、それがオレの忍道だ！"
      },
      {
        id: 'epic',
        name: 'Mount Myoboku Sage Mode',
        badge: '🥈 Epic Awakening',
        title: 'Natural Senjutsu Master',
        attackMultiplier: 1.4,
        hpMultiplier: 1.3,
        auraColor: '#eab308',
        auraVfx: 'chakra',
        customSkill: 'Frog Kumite Shockwave',
        customUltimate: 'Sage Art: Massive Rasengan Barrage',
        catchphrase: "I can sense everything on this battlefield. Natural Senjutsu activated!",
        catchphraseJp: "仙人モード発動！自然エネルギーを感じる！"
      },
      {
        id: 'goat',
        name: 'Six Paths Kurama Chakra Avatar',
        badge: '👑 GOAT Mode',
        title: 'Child of Prophecy / Golden Sovereign',
        attackMultiplier: 2.0,
        hpMultiplier: 1.7,
        auraColor: '#fbbf24',
        auraVfx: 'divine',
        customSkill: 'Truth-Seeking Orb Piercing Blast',
        customUltimate: 'Six Paths: Super Bijuu Rasenshuriken',
        catchphrase: "Let's do this Kurama! Together we are unstoppable!",
        catchphraseJp: "行くぞ九喇嘛！俺たちの力、見せてやるってばよ！"
      }
    ]
  },
  luffy: {
    id: 'luffy',
    name: 'Monkey D. Luffy',
    title: 'Future King of the Pirates / Gear Master',
    franchise: 'one_piece',
    avatar: '🍖',
    image: '/anime-heroes/luffy-tactical.png',
    hp: 1250,
    maxHp: 1250,
    attack: 90,
    range: 2.8,
    speed: 2.7,
    quote: "If anyone threatens our sanctuary, I'm gonna kick their butt all the way back across the ocean!",
    catchphrase: "Kaizoku ou ni, ore wa naru! I'm gonna be King of the Pirates!",
    catchphraseJp: "海賊王に、おれはなるっ！肉食わせろー！",
    modernOutfit: 'Crimson Leather Sleeveless Vest, Heavy-Duty Cargo Pants, Classic Straw Hat with Weatherproof Cord',
    skillName: 'Gum-Gum Red Hawk',
    skillDesc: 'Ignites armament-haki fist with high-speed friction, blasting target defense for 2.2x damage.',
    ultimateName: 'Conqueror’s Haki Outburst',
    ultimateDesc: 'Unleashes supreme kingly disposition, stunning all defenses within 5 tiles for 4 seconds.',
    ultimateCooldown: 16,
    color: '#dc2626',
    accentColor: '#f87171',
    tierRank: 'goat',
    poseImages: {
      combat: '/anime-heroes/luffy-tactical.png',
      epic: '/anime-heroes/luffy-epic.png',
      goat: '/anime-heroes/luffy-goat.png'
    },
    forms: [
      {
        id: 'normal',
        name: 'Straw Hat Corsair Brawler',
        badge: '🥉 Normal Form',
        title: 'Future King of the Pirates',
        attackMultiplier: 1.0,
        hpMultiplier: 1.0,
        auraColor: '#dc2626',
        auraVfx: 'fire',
        customSkill: 'Gum-Gum Red Hawk',
        customUltimate: 'Conqueror’s Haki Outburst',
        catchphrase: "I'm gonna be King of the Pirates!",
        catchphraseJp: "海賊王に、おれはなるっ！"
      },
      {
        id: 'epic',
        name: 'Gear 4: Snakeman Speed Form',
        badge: '🥈 Epic Awakening',
        title: 'Python Recoil Predator',
        attackMultiplier: 1.45,
        hpMultiplier: 1.25,
        auraColor: '#7c3aed',
        auraVfx: 'lightning',
        customSkill: 'Black Mamba Cannon',
        customUltimate: 'King Cobra Armament Impact',
        catchphrase: "Faster! Snakeman python accelerates!",
        catchphraseJp: "ギア４…スネイクマン！速さは力だ！"
      },
      {
        id: 'goat',
        name: 'Gear 5: Sun God Nika',
        badge: '👑 GOAT Mode',
        title: 'Warrior of Liberation / Joy Boy',
        attackMultiplier: 2.1,
        hpMultiplier: 1.8,
        auraColor: '#f8fafc',
        auraVfx: 'divine',
        customSkill: 'Drums of Liberation Giant Stomp',
        customUltimate: 'Bajrang Gun: Island-Crusher Fist',
        catchphrase: "AHHAHAHA! I can do whatever I imagine! This is the peak!",
        catchphraseJp: "アヒャヒャヒャ！最高地点だ！解放のドラムが聞こえる！"
      }
    ]
  },
  ichigo: {
    id: 'ichigo',
    name: 'Ichigo Kurosaki',
    title: 'Substitute Shinigami / Moon Cutter',
    franchise: 'bleach',
    avatar: '⚔️',
    hp: 800,
    maxHp: 800,
    attack: 120,
    range: 1.8,
    speed: 4.0,
    quote: "I don't fight because I want to win; I fight because I have people to protect.",
    catchphrase: "I don't fight to win; I fight because I have people to protect! Getsuga Tensho!",
    catchphraseJp: "俺が守る！卍解・天鎖斬月！月牙天衝ー！",
    modernOutfit: 'Obsidian Trench Coat with Crimson Silk Lining, Combat Boots, Silver Shinigami Pass Pendant',
    skillName: 'Shunpo Flash-Step Raid',
    skillDesc: 'Instantaneously teleports behind the nearest heavy turret, ignoring outer wall barriers.',
    ultimateName: 'Bankai: Getsuga Tensho',
    ultimateDesc: 'Fires a massive pitch-black reiatsu blade wave that pierces through an entire straight line of buildings.',
    ultimateCooldown: 12,
    color: '#1e1b4b',
    accentColor: '#6366f1',
    tierRank: 'goat',
    image: '/anime-heroes/ichigo-turnaround/front.png',
    turnaround: {
      front: '/anime-heroes/ichigo-turnaround/front.png',
      left34: '/anime-heroes/ichigo-turnaround/left_34.png',
      leftSide: '/anime-heroes/ichigo-turnaround/left_side.png',
      back: '/anime-heroes/ichigo-turnaround/back.png',
      rightSide: '/anime-heroes/ichigo-turnaround/right_side.png',
      right34: '/anime-heroes/ichigo-turnaround/right_34.png'
    },
    poseImages: {
      combat: '/anime-heroes/ichigo-turnaround/pose_combat.png',
      epic: '/anime-heroes/ichigo-turnaround/pose_epic.png',
      goat: '/anime-heroes/ichigo-turnaround/pose_goat.png'
    },
    forms: [
      {
        id: 'normal',
        name: 'Substitute Shinigami Tactical',
        badge: '🥉 Normal Form',
        title: 'Karakura Guardian Specialist',
        attackMultiplier: 1.0,
        hpMultiplier: 1.0,
        auraColor: '#6366f1',
        auraVfx: 'shadow',
        customSkill: 'Shunpo Flash-Step Raid',
        customUltimate: 'Bankai: Tensa Zangetsu',
        catchphrase: "I don't fight to win; I fight because I have people to protect! Getsuga Tensho!",
        catchphraseJp: "俺が守る！卍解・天鎖斬月！"
      },
      {
        id: 'epic',
        name: 'Hollow Mask Bankai Awakening',
        badge: '🥈 Epic Awakening',
        title: 'Inner Hollow Synchronization',
        attackMultiplier: 1.4,
        hpMultiplier: 1.3,
        auraColor: '#dc2626',
        auraVfx: 'fire',
        customSkill: 'Black Getsuga Cero Slicer',
        customUltimate: 'Hollowfied Tensa Kurotsuchi',
        catchphrase: "I won't let my instincts consume me. Kuroi Getsuga Tensho!",
        catchphraseJp: "黒い月牙…これが俺の力だ！"
      },
      {
        id: 'goat',
        name: 'Horn of Salvation True Bankai',
        badge: '👑 GOAT Mode',
        title: 'Apex Soul Reaper / Hollow King',
        attackMultiplier: 2.05,
        hpMultiplier: 1.75,
        auraColor: '#fbbf24',
        auraVfx: 'divine',
        customSkill: 'Gran Rey Cero Getsuga',
        customUltimate: 'True Bankai: Dimensional Splitter',
        catchphrase: "This is the true shape of my soul! Bankai!",
        catchphraseJp: "これが…俺の真の卍解だァァァッ！"
      }
    ]
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
    catchphrase: "Mada mada! My magic is never giving up!",
    catchphraseJp: "まだだ、まだ終わってねぇ！諦めないのがオレの魔法だ！",
    modernOutfit: 'Urban Street Fighter Athletic Sleeveless Hoodie, Demon-Slayer Leather Harness, 5-Leaf Badge',
    skillName: 'Demon-Dweller Deflect',
    skillDesc: 'Spins black greatsword, deflecting incoming enemy projectiles back to attacker for 4s.',
    ultimateName: 'Black Meteorite',
    ultimateDesc: 'Enters Anti-Magic Black Form and rockets into the highest-HP turret, silencing it permanently.',
    ultimateCooldown: 15,
    color: '#047857',
    accentColor: '#34d399'
  },
  gojo: {
    id: 'gojo',
    name: 'Satoru Gojo',
    title: 'The Honored One / Limitless Six Eyes',
    franchise: 'naruto',
    avatar: '🤞',
    image: '/anime-heroes/gojo_shibuya_awakening.jpg',
    hp: 1550,
    maxHp: 1550,
    attack: 145,
    range: 3.2,
    speed: 3.6,
    quote: "Throughout heaven and earth, I alone am the honored one. Don't worry, you guys can catch your breath. I'm the strongest, after all.",
    catchphrase: "Daijobu, boku saikyo dakara! Don't worry, I'm the strongest.",
    catchphraseJp: "大丈夫、僕 最強だから。領域展開・無量空処。",
    modernOutfit: 'Obsidian High-Collar Cyber Trench, Blindfold Goggles, Carbon Boots',
    skillName: 'Cursed Technique: Blue & Red Collapse',
    skillDesc: 'Creates gravity singularities that crush multiple defenses at once.',
    ultimateName: 'Domain Expansion: Infinite Void',
    ultimateDesc: 'Overwhelms all enemy defenses in a 7-tile radius with infinite knowledge, freezing them for 6 seconds.',
    ultimateCooldown: 18,
    color: '#06b6d4',
    accentColor: '#38bdf8'
  },
  minato: {
    id: 'minato',
    name: 'Minato Namikaze',
    title: 'Yellow Flash of the Leaf / 4th Hokage',
    franchise: 'naruto',
    avatar: '⚡',
    image: '/anime-heroes/minato-tactical.jpg',
    hp: 1200,
    maxHp: 1200,
    attack: 135,
    range: 3.8,
    speed: 4.8,
    quote: "A shinobi's life is not measured by how they live, but what they accomplish before their death. I will protect our home!",
    catchphrase: "The Yellow Flash never blinks. Flying Thunder God: Guiding Thunder!",
    catchphraseJp: "黄色い閃光を甘く見るなよ！飛雷神の術！",
    modernOutfit: 'White & Crimson Fourth Hokage Haori, Shinobi Tactical Vest, Tri-Prong Kunai Holster',
    skillName: 'Flying Raijin Instant Step',
    skillDesc: 'Instantly teleports to mark targets across enemy territory, evading incoming projectile attacks.',
    ultimateName: 'Flying Thunder God: Spiral Flash Sphere',
    ultimateDesc: 'Hurls 6 spatial kunai and teleports through all enemy turrets in a flash, delivering 520 lightning damage.',
    ultimateCooldown: 15,
    color: '#eab308',
    accentColor: '#fde047'
  },
  zoro: {
    id: 'zoro',
    name: 'Roronoa Zoro',
    title: 'King of Hell / Master of Three Swords',
    franchise: 'one_piece',
    avatar: '🗡️',
    image: '/anime-heroes/zoro-tactical.jpg',
    hp: 1400,
    maxHp: 1400,
    attack: 140,
    range: 1.8,
    speed: 2.8,
    quote: "Scars on the back are a swordsman's shame. I swore to my captain that I'll never lose again!",
    catchphrase: "I'll become the World's Greatest Swordsman, even if it kills me! King of Hell: Three-Sword Style!",
    catchphraseJp: "背中の傷は剣士の恥だ！三刀流奥義・三千世界！",
    modernOutfit: 'Dark Green Tactical Trench Coat, Crimson Haramaki Sash, Triple Katana Hip Rig',
    skillName: 'One-Sword Style: 360 Pound Phoenix',
    skillDesc: 'Swings Wado Ichimonji creating a concentrated flying blade slash that pierces walls in a line.',
    ultimateName: 'King of Hell: Three Thousand Worlds',
    ultimateDesc: 'Infuses Enma and his katanas with Conqueror’s Haki flames, spinning in an unstoppable cyclone dealing 600 damage.',
    ultimateCooldown: 16,
    color: '#15803d',
    accentColor: '#4ade80'
  },
  sung_jinwoo: {
    id: 'sung_jinwoo',
    name: 'Sung Jin-Woo',
    title: 'The Shadow Monarch / S-Rank Sovereign',
    franchise: 'solo_leveling',
    avatar: '👑',
    image: '/anime-heroes/sung-jinwoo-tactical.png',
    hp: 1350,
    maxHp: 1350,
    attack: 150,
    range: 2.5,
    speed: 4.2,
    quote: "I am not someone who cowers in fear anymore. From the shadows, my legion claims this entire battlefield. Arise!",
    catchphrase: "Arise. From the shadows, my legion claims this battlefield!",
    catchphraseJp: "起きろ（起きよ）。影の軍団よ、我が前に集え！",
    modernOutfit: 'Shadow Silk Trench Coat, Dagger Combat Harness, Glowing Monarch Eyes Visor',
    skillName: 'Rulers Reach & Dagger Barrage',
    skillDesc: 'Uses telekinesis to drag enemy defenses close and shreds them with Kasakas Poison Fang.',
    ultimateName: 'Shadow Monarch: ARISE',
    ultimateDesc: 'Raises 5 shadow soldiers from defeated buildings to fight alongside your army for 10 seconds.',
    ultimateCooldown: 18,
    color: '#6366f1',
    accentColor: '#a5b4fc',
    tierRank: 'goat',
    poseImages: {
      combat: '/anime-heroes/sung-jinwoo-tactical.png',
      epic: '/anime-heroes/sung-jinwoo-tactical.png',
      goat: '/anime-heroes/sung-jinwoo-goat.png'
    },
  },
  igris: {
    id: 'igris',
    name: 'Blood-Red Commander Igris',
    title: 'Loyal Shadow Knight / Crimson Blade',
    franchise: 'solo_leveling',
    avatar: '🛡️',
    image: '/anime-heroes/igris-tactical.jpg',
    hp: 1600,
    maxHp: 1600,
    attack: 115,
    range: 2.0,
    speed: 3.1,
    quote: "My blade answers only to my monarch. I will cut down any sovereign or beast that stands against us.",
    catchphrase: "My blade answers only to the Shadow Monarch. None shall pass!",
    catchphraseJp: "我が主の前に立つ者は、この大剣の贄となるべし！",
    modernOutfit: 'Dark Obsidian Plate Armor, Blood-Red Helmet Plume, Titan Cleaver Greatsword',
    skillName: 'Knightly Defiance Whirl',
    skillDesc: 'Spins his massive two-handed greatsword, deflecting 40% of incoming damage and cleaving adjacent units.',
    ultimateName: 'Shadow Commander Overlord Cleave',
    ultimateDesc: 'Brings down a thunderous purple shadow slash that shatters walls and stuns defenses in a cone.',
    ultimateCooldown: 14,
    color: '#991b1b',
    accentColor: '#f87171'
  },
  sanemi: {
    id: 'sanemi',
    name: 'Sanemi Shinazugawa',
    title: 'Wind Hashira / Tempest of Wrath',
    franchise: 'demon_slayer',
    avatar: '🌪️',
    image: '/anime-heroes/sanemi-tactical.jpg',
    hp: 1150,
    maxHp: 1150,
    attack: 130,
    range: 1.9,
    speed: 4.1,
    quote: "I'll exterminate every last demon and shred your defenses into ribbons! Don't get in my way!",
    catchphrase: "I'll shred you all into ribbons! Wind Breathing: Dust Whirlwind Cutter!",
    catchphraseJp: "風の呼吸・壱ノ型・塵旋風・削ぎ！テメェら全員八つ裂きだ！",
    modernOutfit: 'Open Demon Slayer Tactical Vest, Scared Chest Wrap, Emerald Whirlwind Katana',
    skillName: 'Wind Breathing: Claws-Purifying Gale',
    skillDesc: 'Unleashes 4 vertical tempest claw slashes that rip through enemy turrets.',
    ultimateName: 'Dust Whirlwind Tempest Cutter',
    ultimateDesc: 'Dashes forward engulfed in a cyclone of wind blades, decimating all structures in his path.',
    ultimateCooldown: 13,
    color: '#059669',
    accentColor: '#34d399'
  },
  hitsugaya: {
    id: 'hitsugaya',
    name: 'Toshiro Hitsugaya',
    title: 'Captain of 10th Division / Frost Dragon Prodigy',
    franchise: 'bleach',
    avatar: '❄️',
    image: '/anime-heroes/hitsugaya-tactical.jpg',
    hp: 1050,
    maxHp: 1050,
    attack: 125,
    range: 3.0,
    speed: 3.5,
    quote: "Sit upon the frozen heavens, Hyorinmaru! I am the Captain of Squad 10, and I will freeze this entire battlefield.",
    catchphrase: "Sit upon the frozen heavens, Hyorinmaru! Bankai: Daiguren Hyorinmaru!",
    catchphraseJp: "霜天に坐せ、氷輪丸！大紅蓮氷輪丸！",
    modernOutfit: 'White 10th Division Captain Haori, Turquoise Tactical Scarf, Hyorinmaru Ice Sheath',
    skillName: 'Ryusenka Ice Dragon Burst',
    skillDesc: 'Lurches forward with a glacial thrust, encasing target building in solid ice for 3 seconds.',
    ultimateName: 'Bankai: Daiguren Hyorinmaru',
    ultimateDesc: 'Unfurls glacial ice wings and freezes all enemy defenses in a massive radius, slowing fire rate by 70%.',
    ultimateCooldown: 16,
    color: '#0284c7',
    accentColor: '#7dd3fc'
  },
  kenpachi: {
    id: 'kenpachi',
    name: 'Kenpachi Zaraki',
    title: 'Captain of 11th Division / Undying Demon of Combat',
    franchise: 'bleach',
    avatar: '🩸',
    image: '/anime-heroes/kenpachi-tactical.jpg',
    hp: 1850,
    maxHp: 1850,
    attack: 160,
    range: 1.5,
    speed: 2.6,
    quote: "Drink, Nozarashi! Fight me, bleed for me! If you think you can take my head, come on and try!",
    catchphrase: "Drink, Nozarashi! Fight me, bleed for me, give me a real challenge!",
    catchphraseJp: "呑め、野晒！もっとだ、もっと俺を楽しませてみろ！",
    modernOutfit: 'Tattered 11th Division Haori, Spiked Hair Bell Rig, Eye-Patch Reiatsu Seal',
    skillName: 'Nozarashi Two-Handed Strike',
    skillDesc: 'Gripping his jagged Zanpakuto with both hands, smashes through walls with immense physical power.',
    ultimateName: 'Yachiru Awakened Bloodlust',
    ultimateDesc: 'Releases his eye patch; a colossal skull-shaped golden reiatsu explodes dealing 650 AOE damage and enraged lifesteal.',
    ultimateCooldown: 18,
    color: '#ca8a04',
    accentColor: '#facc15'
  },
  inosuke: {
    id: 'inosuke',
    name: 'Inosuke Hashibira',
    title: 'King of the Mountains / Beast Breath Berserker',
    franchise: 'demon_slayer',
    avatar: '🐗',
    image: '/anime-heroes/inosuke-tactical.jpg',
    hp: 1250,
    maxHp: 1250,
    attack: 110,
    range: 1.6,
    speed: 4.3,
    quote: "PIG ASSAULT! Inosuke-sama has arrived to tear down your fortress! Better run for your lives!",
    catchphrase: "Coming through! Beast Breathing: Fang Strike! Inosuke-sama has arrived!",
    catchphraseJp: "猪突猛進！獣の呼吸！伊之助様のお通りだァァ！",
    modernOutfit: 'Iconic Boar Mask Headgear, Tactical Fur Combat Pants, Dual Serrated Nichirin Blades',
    skillName: 'Spatial Awareness Leap',
    skillDesc: 'Senses the weakest defensive building and lunges directly at it, bypassing traps.',
    ultimateName: 'Beast Breathing: Pig Assault Rush',
    ultimateDesc: 'Charges blindly through the village with dual jagged katanas, smashing walls and knocking turrets back.',
    ultimateCooldown: 12,
    color: '#475569',
    accentColor: '#94a3b8'
  },
  levi: {
    id: 'levi',
    name: 'Captain Levi Ackerman',
    title: "Humanity's Strongest / Beast Titan Shredder",
    franchise: 'attack_on_titan',
    avatar: '⚔️',
    image: '/anime-heroes/levi-tactical.png',
    hp: 1350,
    maxHp: 1350,
    attack: 160,
    range: 2.4,
    speed: 5.2,
    quote: "Give up on your dreams and die. Just kidding. Follow my orders and I will guarantee not a single beast breaches this base.",
    catchphrase: "I'll carve you into ribbons until there's nothing left. Beast Titan Spiral Shredder!",
    catchphraseJp: "おい…ガキ共、これはどういう状況だ？テメェら全員、肉片にしてやる。",
    modernOutfit: 'Dark Green Scout Tactical Bomber, Wings of Freedom Crest, Twin Reverse-Grip Blades, ODM Thrusters',
    skillName: 'Reverse-Grip High Speed Flurry',
    skillDesc: 'Dashes forward in a low spinning blur, slashing 3 defenses in rapid succession for 180% damage.',
    ultimateName: 'Beast Shredder: 360° Wire Cyclone',
    ultimateDesc: 'Grapples into the air and spirals downward in an unstoppable vortex of steel, annihilating enemy defenses and bypassing all walls.',
    ultimateCooldown: 13,
    color: '#065f46',
    accentColor: '#34d399',
    tierRank: 'goat',
    forms: [
      {
        id: 'normal',
        name: 'Scout Vanguard Levi',
        badge: '🥉 Normal Form',
        title: 'Special Operations Squad Captain',
        attackMultiplier: 1.0,
        hpMultiplier: 1.0,
        auraColor: '#10b981',
        auraVfx: 'wind',
        customSkill: 'ODM Wire Grapple Strike',
        customUltimate: 'Reverse-Blade Execution',
        catchphrase: "I will choose the option with no regrets.",
        catchphraseJp: "悔いの残らない方を自分で選べ。"
      },
      {
        id: 'epic',
        name: 'Awakened Ackermann Instinct',
        badge: '🥈 Epic Awakening',
        title: 'Limitless Battle Synapse',
        attackMultiplier: 1.35,
        hpMultiplier: 1.25,
        auraColor: '#06b6d4',
        auraVfx: 'lightning',
        customSkill: 'Godspeed Wire Flurry',
        customUltimate: 'Titan Decapitation Spiral',
        catchphrase: "My blades move faster than your thoughts.",
        catchphraseJp: "一瞬で首を刎ねてやる。"
      },
      {
        id: 'goat',
        name: 'Humanity’s Strongest GOAT Mode',
        badge: '👑 GOAT Mode',
        title: 'Apex Sovereign of the Battlefield',
        attackMultiplier: 1.8,
        hpMultiplier: 1.5,
        auraColor: '#fbbf24',
        auraVfx: 'divine',
        customSkill: '360° Thunder Spear Shredder',
        customUltimate: 'Absolute Beast Titan Extinction',
        catchphrase: "Not a single beast will walk out of my sight alive!",
        catchphraseJp: "貴様らの命など、最初から無かったものと思え。"
      }
    ]
  },
  mereoleona: {
    id: 'mereoleona',
    name: 'Mereoleona Vermillion',
    title: 'The Uncrowned Undefeated Lioness / Flame Empress',
    franchise: 'black_clover',
    avatar: '🦁',
    image: '/anime-heroes/mereoleona-tactical.png',
    hp: 1650,
    maxHp: 1650,
    attack: 155,
    range: 2.2,
    speed: 4.4,
    quote: "Nothing in this world is more ferocious than an awakened lioness! Burn all hesitation to cinders!",
    catchphrase: "Nothing can withstand my hellfire! Mana Zone: Calidus Brachium!",
    catchphraseJp: "熱狂が足りねぇなぁ！マナゾーン・滅尽焦破！",
    modernOutfit: 'Crimson Lion King Tactical Molle Rig, Blazing Fire-Claw Combat Gloves, Flaming Vermillion Mane',
    skillName: 'Mana Zone: Full-Power Lion Roar',
    skillDesc: 'Takes command of natural atmospheric mana, launching an omni-directional flame burst that melts nearby traps.',
    ultimateName: 'Calidus Brachium: Hellfire Purgatory',
    ultimateDesc: 'Engulfs the entire base in a swirling storm of holy lioness flames, incinerating defenses and boosting troop ATK by 50%.',
    ultimateCooldown: 15,
    color: '#b91c1c',
    accentColor: '#f87171',
    tierRank: 'goat',
    forms: [
      {
        id: 'normal',
        name: 'Crimson Lioness Captain',
        badge: '🥉 Normal Form',
        title: 'Royal Knight Supreme Commander',
        attackMultiplier: 1.0,
        hpMultiplier: 1.0,
        auraColor: '#ea580c',
        auraVfx: 'fire',
        customSkill: 'Blazing Lion Claw',
        customUltimate: 'Calidus Brachium Single Strike',
        catchphrase: "Train until your blood boils!",
        catchphraseJp: "血が沸騰するまで暴れろ！"
      },
      {
        id: 'epic',
        name: 'Mana Skin Flame Master',
        badge: '🥈 Epic Awakening',
        title: 'Uncrowned Undefeated Predator',
        attackMultiplier: 1.4,
        hpMultiplier: 1.3,
        auraColor: '#f97316',
        auraVfx: 'fire',
        customSkill: 'Consecutive Calidus Brachium',
        customUltimate: 'Mana Zone: Purgatory Barrage',
        catchphrase: "I'll burn every excuse down to the bone!",
        catchphraseJp: "私の炎からは何者も逃れられん！"
      },
      {
        id: 'goat',
        name: 'Hellfire Incarnate GOAT Mode',
        badge: '👑 GOAT Mode',
        title: 'Supreme Elemental Fire Empress',
        attackMultiplier: 1.9,
        hpMultiplier: 1.6,
        auraColor: '#e11d48',
        auraVfx: 'fire',
        customSkill: 'Supernova Lioness Eruption',
        customUltimate: 'Infinite Mana Zone: Extinction Burst',
        catchphrase: "Become one with the inferno! I am the flame itself!",
        catchphraseJp: "燃え尽きろ！私が炎そのものだ！"
      }
    ]
  },
  yoruichi: {
    id: 'yoruichi',
    name: 'Yoruichi Shihoin',
    title: 'Goddess of Flash / Former Onmitsukido Commander',
    franchise: 'bleach',
    avatar: '⚡',
    image: '/anime-heroes/yoruichi-tactical.jpg',
    hp: 1100,
    maxHp: 1100,
    attack: 140,
    range: 2.2,
    speed: 5.0,
    quote: "Can you even follow my afterimages? You are a hundred years too early to match the Flash Goddess!",
    catchphrase: "Can you even keep up with my speed? Shunko: Raijin Senkei!",
    catchphraseJp: "速すぎて見失うでないぞ！瞬閧・雷神戦形！",
    modernOutfit: 'Black Stealth Force Bodysuit, Orange Armguards, White Lightning Shunko Back Aura',
    skillName: 'Shunpo Speed Blitz',
    skillDesc: 'Dashes around 3 defenses in the blink of an eye, hitting each with high-voltage lightning strikes.',
    ultimateName: 'Shunko: Raijin Senkei',
    ultimateDesc: 'Manifests a circle of floating thunder drums, raining down catastrophic lightning bolts on all heavy turrets.',
    ultimateCooldown: 15,
    color: '#7e22ce',
    accentColor: '#c084fc'
  },
  boa_hancock: {
    id: 'boa_hancock',
    name: 'Boa Hancock',
    title: 'Pirate Empress / Snake Princess of Amazon Lily',
    franchise: 'one_piece',
    avatar: '🐍',
    image: '/anime-heroes/boa-tactical.jpg',
    hp: 1200,
    maxHp: 1200,
    attack: 135,
    range: 3.4,
    speed: 3.4,
    quote: "Whatever I do, whether I kick a cat or tear down an empire, I will always be forgiven... because I am beautiful!",
    catchphrase: "Whatever I do, whether I kick a puppy or burn an island, I will be forgiven... because I am beautiful!",
    catchphraseJp: "わらわが何をしようと許される…そう、美しすぎるからじゃ！",
    modernOutfit: 'Crimson Dragon Imperial Slit Qipao, Golden Snake Earrings, Salome Companion Harness',
    skillName: 'Perfume Femur Petro-Kick',
    skillDesc: 'Delivers high-velocity spinning kicks that turn stone walls and cannons into brittle rock.',
    ultimateName: 'Slave Arrow Heart Barrage',
    ultimateDesc: 'Fires hundreds of glowing pink love arrows, permanently petrifying defenses for 5 seconds.',
    ultimateCooldown: 16,
    color: '#e11d48',
    accentColor: '#fda4af'
  },
  mikasa: {
    id: 'mikasa',
    name: 'Mikasa Ackerman',
    title: 'Humanity’s Strongest Protector / Scout Vanguard',
    franchise: 'attack_on_titan',
    avatar: '🧣',
    image: '/anime-heroes/mikasa-tactical.jpg',
    hp: 1300,
    maxHp: 1300,
    attack: 125,
    range: 2.1,
    speed: 4.5,
    quote: "This world is cruel, but it is also very beautiful. If I have to destroy every enemy here to protect you, I will.",
    catchphrase: "This world is cruel, but it is also very beautiful. I will protect you!",
    catchphraseJp: "この世界は残酷だ、そしてとても美しい。私は生き残る！",
    modernOutfit: 'Scout Regiment Wings of Freedom Jacket, Tactical 3D Maneuver Gear, Red Knitted Scarf',
    skillName: 'ODM Gas Burst Grapple',
    skillDesc: 'Fires high-tension steel cables, launching herself over perimeter walls directly to the Town Hall.',
    ultimateName: 'Thunder Spear Decapitation Slash',
    ultimateDesc: 'Fires dual rocket-propelled Thunder Spears that detonate inside the toughest defense, dealing 550 blast damage.',
    ultimateCooldown: 14,
    color: '#334155',
    accentColor: '#94a3b8'
  }
};

export const HERO_UNLOCK_HQ_REQUIREMENTS: Record<string, { hqLevel: number; heroName: string; anime: string; perk: string }> = {
  naruto: { hqLevel: 1, heroName: 'Naruto Uzumaki', anime: 'Naruto Shippuden', perk: 'Starter Defender / Multi-Shadow Clone' },
  luffy: { hqLevel: 2, heroName: 'Monkey D. Luffy', anime: 'One Piece', perk: 'Unlocks at Town Hall HQ 2 / Gum-Gum Red Hawk' },
  zoro: { hqLevel: 2, heroName: 'Roronoa Zoro', anime: 'One Piece', perk: 'Unlocks at Town Hall HQ 2 / King of Hell 3-Sword Style' },
  inosuke: { hqLevel: 2, heroName: 'Inosuke Hashibira', anime: 'Demon Slayer', perk: 'Unlocks at Town Hall HQ 2 / Beast Breathing Berserk' },
  mikasa: { hqLevel: 2, heroName: 'Mikasa Ackerman', anime: 'Attack on Titan', perk: 'Unlocks at Town Hall HQ 2 / ODM Blade Vapor Strike' },
  ichigo: { hqLevel: 3, heroName: 'Ichigo Kurosaki', anime: 'Bleach', perk: 'Unlocks at Town Hall HQ 3 / Bankai Getsuga Tensho' },
  sung_jinwoo: { hqLevel: 3, heroName: 'Sung Jin-Woo', anime: 'Solo Leveling', perk: 'Unlocks at Town Hall HQ 3 / Shadow Monarch Arise' },
  igris: { hqLevel: 3, heroName: 'Blood-Red Commander Igris', anime: 'Solo Leveling', perk: 'Unlocks at Town Hall HQ 3 / Crimson Greatsword Cleave' },
  levi: { hqLevel: 3, heroName: 'Captain Levi Ackerman', anime: 'Attack on Titan', perk: 'Unlocks at Town Hall HQ 3 / Beast Titan Spiral Shredder' },
  asta: { hqLevel: 4, heroName: 'Asta', anime: 'Black Clover', perk: 'Unlocks at Town Hall HQ 4 / Black Meteorite Anti-Magic' },
  mereoleona: { hqLevel: 4, heroName: 'Mereoleona Vermillion', anime: 'Black Clover', perk: 'Unlocks at Town Hall HQ 4 / Mana Zone Hellfire Empress' },
  sanemi: { hqLevel: 4, heroName: 'Sanemi Shinazugawa', anime: 'Demon Slayer', perk: 'Unlocks at Town Hall HQ 4 / Wind Breathing Dust Whirlwind' },
  hitsugaya: { hqLevel: 4, heroName: 'Toshiro Hitsugaya', anime: 'Bleach', perk: 'Unlocks at Town Hall HQ 4 / Daiguren Hyorinmaru Ice Wings' },
  yoruichi: { hqLevel: 4, heroName: 'Yoruichi Shihoin', anime: 'Bleach', perk: 'Unlocks at Town Hall HQ 4 / Flash Goddess Raijin Shunko' },
  gojo: { hqLevel: 5, heroName: 'Satoru Gojo', anime: 'Jujutsu Kaisen', perk: 'Unlocks at Town Hall HQ 5 / Infinite Void Domain' },
  minato: { hqLevel: 5, heroName: 'Minato Namikaze', anime: 'Naruto Shippuden', perk: 'Unlocks at Town Hall HQ 5 / Flying Thunder God Guiding Thunder' },
  kenpachi: { hqLevel: 5, heroName: 'Kenpachi Zaraki', anime: 'Bleach', perk: 'Unlocks at Town Hall HQ 5 / Nozarashi Colossal Skull Cleave' },
  boa_hancock: { hqLevel: 5, heroName: 'Boa Hancock', anime: 'One Piece', perk: 'Unlocks at Town Hall HQ 5 / Slave Arrow & Perfume Femur' },
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
  unlockedHeroes: ['naruto'],
  activeHeroId: 'naruto',
  completedChapters: [],
  heroLevels: { naruto: 1 },
  trainedTroops: { konoha_ninja: 8, strawhat_brawler: 4, shinigami_patrol: 4, black_bulls_mage: 2 },
  weatherMode: 'night',
  activeGuildId: 'hidden_leaf',
  guildContribution: 120,
  playerName: 'Marou (Me)',
  sanctuaryTag: '#SANCTUARY-MAROU-1',
  lastHarvestTime: 0
};

export const DEFAULT_FRIEND_BASES: FriendProfile[] = [
  {
    id: 'friend_kenji',
    name: 'Kenji (Straw Hat Corsair)',
    tag: '#CORSAIR-7721',
    level: 3,
    trophies: 4210,
    activeHeroId: 'luffy',
    heroLevel: 3,
    berriesLoot: 1400,
    chakraLoot: 950,
    buildings: [
      { id: 'k_core', type: 'command_core', name: 'Straw Hat Pagoda HQ', level: 3, x: 5, y: 5, hp: 1800, maxHp: 1800, color: '#dc2626', icon: '🏯' },
      { id: 'k_can1', type: 'haki_cannon', name: 'Haki Rail Turret', level: 2, x: 3, y: 5, hp: 750, maxHp: 750, attack: 65, range: 5.5, color: '#ef4444', icon: '💣' },
      { id: 'k_can2', type: 'haki_cannon', name: 'Haki Rail Turret', level: 2, x: 7, y: 5, hp: 750, maxHp: 750, attack: 65, range: 5.5, color: '#ef4444', icon: '💣' },
      { id: 'k_mor1', type: 'paper_mortar', name: 'Pirate Bomb Mortar', level: 2, x: 5, y: 3, hp: 600, maxHp: 600, attack: 75, range: 6.5, color: '#f59e0b', icon: '💥' },
      { id: 'k_stor1', type: 'berry_treasury', name: 'Grand Pirate Vault', level: 3, x: 4, y: 4, hp: 700, maxHp: 700, productionRate: 120, color: '#f59e0b', icon: '💰' },
      { id: 'k_stor2', type: 'chakra_turbine', name: 'Chakra Distillery', level: 2, x: 6, y: 4, hp: 650, maxHp: 650, productionRate: 90, color: '#06b6d4', icon: '🌀' },
      { id: 'k_w1', type: 'defense_wall', name: 'Titanium Wall', level: 2, x: 3, y: 4, hp: 900, maxHp: 900, color: '#475569', icon: '🧱' },
      { id: 'k_w2', type: 'defense_wall', name: 'Titanium Wall', level: 2, x: 4, y: 3, hp: 900, maxHp: 900, color: '#475569', icon: '🧱' },
      { id: 'k_w3', type: 'defense_wall', name: 'Titanium Wall', level: 2, x: 6, y: 3, hp: 900, maxHp: 900, color: '#475569', icon: '🧱' },
      { id: 'k_w4', type: 'defense_wall', name: 'Titanium Wall', level: 2, x: 7, y: 4, hp: 900, maxHp: 900, color: '#475569', icon: '🧱' },
      { id: 'k_w5', type: 'defense_wall', name: 'Titanium Wall', level: 2, x: 3, y: 6, hp: 900, maxHp: 900, color: '#475569', icon: '🧱' },
      { id: 'k_w6', type: 'defense_wall', name: 'Titanium Wall', level: 2, x: 7, y: 6, hp: 900, maxHp: 900, color: '#475569', icon: '🧱' }
    ]
  },
  {
    id: 'friend_ren',
    name: 'Ren (Soul Reaper Division)',
    tag: '#SHINIGAMI-3309',
    level: 3,
    trophies: 4480,
    activeHeroId: 'ichigo',
    heroLevel: 3,
    berriesLoot: 1100,
    chakraLoot: 1600,
    buildings: [
      { id: 'r_core', type: 'command_core', name: 'Soul Society Pagoda HQ', level: 3, x: 5, y: 5, hp: 1900, maxHp: 1900, color: '#1e1b4b', icon: '🏯' },
      { id: 'r_sip1', type: 'reishi_siphon', name: 'Reishi Monolith', level: 3, x: 5, y: 3, hp: 700, maxHp: 700, color: '#a855f7', icon: '🔮' },
      { id: 'r_sip2', type: 'reishi_siphon', name: 'Reishi Monolith', level: 2, x: 5, y: 7, hp: 650, maxHp: 650, color: '#a855f7', icon: '🔮' },
      { id: 'r_can1', type: 'haki_cannon', name: 'Getsuga Rail Cannon', level: 3, x: 3, y: 5, hp: 800, maxHp: 800, attack: 70, range: 6.0, color: '#ef4444', icon: '💣' },
      { id: 'r_can2', type: 'haki_cannon', name: 'Getsuga Rail Cannon', level: 3, x: 7, y: 5, hp: 800, maxHp: 800, attack: 70, range: 6.0, color: '#ef4444', icon: '💣' },
      { id: 'r_w1', type: 'defense_wall', name: 'Spirit Barrier Wall', level: 3, x: 4, y: 4, hp: 1100, maxHp: 1100, color: '#6366f1', icon: '🧱' },
      { id: 'r_w2', type: 'defense_wall', name: 'Spirit Barrier Wall', level: 3, x: 6, y: 4, hp: 1100, maxHp: 1100, color: '#6366f1', icon: '🧱' },
      { id: 'r_w3', type: 'defense_wall', name: 'Spirit Barrier Wall', level: 3, x: 4, y: 6, hp: 1100, maxHp: 1100, color: '#6366f1', icon: '🧱' },
      { id: 'r_w4', type: 'defense_wall', name: 'Spirit Barrier Wall', level: 3, x: 6, y: 6, hp: 1100, maxHp: 1100, color: '#6366f1', icon: '🧱' }
    ]
  },
  {
    id: 'friend_yuno',
    name: 'Yuno (Anti-Magic Spire)',
    tag: '#CLOVER-8812',
    level: 4,
    trophies: 4620,
    activeHeroId: 'asta',
    heroLevel: 4,
    berriesLoot: 1800,
    chakraLoot: 1400,
    buildings: [
      { id: 'y_core', type: 'command_core', name: 'Black Bulls Spire HQ', level: 4, x: 5, y: 5, hp: 2200, maxHp: 2200, color: '#047857', icon: '🏯' },
      { id: 'y_can1', type: 'haki_cannon', name: 'Anti-Magic Cannon', level: 3, x: 3, y: 3, hp: 850, maxHp: 850, attack: 75, range: 6.0, color: '#ef4444', icon: '💣' },
      { id: 'y_can2', type: 'haki_cannon', name: 'Anti-Magic Cannon', level: 3, x: 7, y: 3, hp: 850, maxHp: 850, attack: 75, range: 6.0, color: '#ef4444', icon: '💣' },
      { id: 'y_can3', type: 'haki_cannon', name: 'Anti-Magic Cannon', level: 3, x: 3, y: 7, hp: 850, maxHp: 850, attack: 75, range: 6.0, color: '#ef4444', icon: '💣' },
      { id: 'y_can4', type: 'haki_cannon', name: 'Anti-Magic Cannon', level: 3, x: 7, y: 7, hp: 850, maxHp: 850, attack: 75, range: 6.0, color: '#ef4444', icon: '💣' },
      { id: 'y_mor1', type: 'paper_mortar', name: 'Black Fire Mortar', level: 3, x: 5, y: 2, hp: 700, maxHp: 700, attack: 85, range: 7.0, color: '#f59e0b', icon: '💥' }
    ]
  }
];

export function exportSanctuaryCode(village: PlayerVillageState): string {
  const payload = {
    n: village.playerName || 'Marou',
    t: village.sanctuaryTag || '#SANCTUARY-1',
    l: village.level,
    h: village.activeHeroId,
    hl: village.heroLevels?.[village.activeHeroId] || 1,
    b: village.buildings.map((b) => ({
      i: b.id,
      t: b.type,
      n: b.name,
      l: b.level,
      x: b.x,
      y: b.y,
      h: b.hp,
      m: b.maxHp,
      a: b.attack,
      r: b.range,
      c: b.color,
      ic: b.icon
    }))
  };
  try {
    return 'BASE-' + btoa(JSON.stringify(payload));
  } catch (_) {
    return 'BASE-' + JSON.stringify(payload);
  }
}

export function importSanctuaryCode(codeString: string): FriendProfile | null {
  try {
    let clean = codeString.trim();
    if (clean.startsWith('BASE-')) clean = clean.slice(5);
    let parsed: any;
    try {
      parsed = JSON.parse(atob(clean));
    } catch (_) {
      parsed = JSON.parse(clean);
    }
    if (!parsed || !parsed.b || !Array.isArray(parsed.b)) return null;

    return {
      id: `custom_${Date.now()}`,
      name: parsed.n || 'Imported Friend',
      tag: parsed.t || '#FRIEND-CODE',
      level: parsed.l || 1,
      trophies: 4000 + Math.floor(Math.random() * 500),
      activeHeroId: parsed.h || 'naruto',
      heroLevel: parsed.hl || 1,
      berriesLoot: (parsed.l || 1) * 450,
      chakraLoot: (parsed.l || 1) * 350,
      isCustom: true,
      buildings: parsed.b.map((b: any) => ({
        id: b.i || `b_${Math.random()}`,
        type: b.t || 'command_core',
        name: b.n || 'Building',
        level: b.l || 1,
        x: b.x ?? 5,
        y: b.y ?? 5,
        hp: b.h || 800,
        maxHp: b.m || 800,
        attack: b.a,
        range: b.r,
        color: b.c || '#475569',
        icon: b.ic || '🧱'
      }))
    };
  } catch (_) {
    return null;
  }
}

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
  },
  gojo: {
    heroId: 'gojo',
    shoutText: 'RYOIKI TENKAI: INFINITE VOID!!',
    kanji: '領域展開・無量空処',
    subTitle: 'Limitless Six Eyes Dimensional Domain',
    audioKey: 'infinite_void'
  },
  minato: {
    heroId: 'minato',
    shoutText: 'HIRASHIN NO JUTSU!!',
    kanji: '飛雷神の術',
    subTitle: 'Flying Thunder God Yellow Flash',
    audioKey: 'thunder_flash'
  },
  zoro: {
    heroId: 'zoro',
    shoutText: 'SANTOURYU OUGI: SANZEN SEKAI!!',
    kanji: '三刀流奥義・三千世界',
    subTitle: 'Three-Sword Style King of Hell',
    audioKey: 'zoro_slash'
  },
  sung_jinwoo: {
    heroId: 'sung_jinwoo',
    shoutText: 'ARISE!!',
    kanji: '起きろ（影の君主）',
    subTitle: 'Shadow Monarch Legion Awakening',
    audioKey: 'shadow_arise'
  },
  igris: {
    heroId: 'igris',
    shoutText: 'BLOOD-RED CLEAVE!!',
    kanji: '血赤の指揮官・影断',
    subTitle: 'Crimson Commander Heavy Cleave',
    audioKey: 'igris_cleave'
  },
  sanemi: {
    heroId: 'sanemi',
    shoutText: 'KAZE NO KOKYU: JINSENPU!!',
    kanji: '風の呼吸・塵旋風',
    subTitle: 'Wind Breathing Tempest Shredder',
    audioKey: 'wind_shred'
  },
  hitsugaya: {
    heroId: 'hitsugaya',
    shoutText: 'SOU-TEN NI ZASE, HYORINMARU!!',
    kanji: '霜天に坐せ・氷輪丸',
    subTitle: 'Reign Over The Frosted Heavens',
    audioKey: 'ice_dragon'
  },
  kenpachi: {
    heroId: 'kenpachi',
    shoutText: 'NOME, NOZARASHI!!',
    kanji: '呑め・野晒',
    subTitle: 'Drink Nozarashi Colossal Cleave',
    audioKey: 'kenpachi_roar'
  },
  inosuke: {
    heroId: 'inosuke',
    shoutText: 'CHOTOTSU MOSHIN!!',
    kanji: '猪突猛進・獣の呼吸',
    subTitle: 'Beast Breathing Boar Assault',
    audioKey: 'boar_rush'
  },
  levi: {
    heroId: 'levi',
    shoutText: 'BEAST SHREDDER: WIRE CYCLONE!!',
    kanji: '獣の巨人・螺旋殲滅',
    subTitle: 'Humanity Strongest 360 Wire Slice',
    audioKey: 'levi_shredder'
  },
  mereoleona: {
    heroId: 'mereoleona',
    shoutText: 'MANA ZONE: CALIDUS BRACHIUM!!',
    kanji: 'マナゾーン・滅尽焦破',
    subTitle: 'Crimson Lioness Hellfire Empress',
    audioKey: 'mereoleona_roar'
  },
  yoruichi: {
    heroId: 'yoruichi',
    shoutText: 'SHUNKO: RAIJIN SENKEI!!',
    kanji: '瞬閧・雷神戦形',
    subTitle: 'Flash Goddess Thunder God Armor',
    audioKey: 'lightning_shunko'
  },
  boa_hancock: {
    heroId: 'boa_hancock',
    shoutText: 'MERO MERO MELLOW!!',
    kanji: 'メロメロ甘風',
    subTitle: 'Slave Arrow Heart Petrify',
    audioKey: 'mero_petrify'
  },
  mikasa: {
    heroId: 'mikasa',
    shoutText: 'THUNDER SPEAR: FIRE!!',
    kanji: '雷槍・抜刀突撃',
    subTitle: 'Humanity Strongest ODM Decapitation',
    audioKey: 'thunder_spear'
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
    unlockedFeatures: ['Command Core', 'Haki Rail Cannon', 'Titanium Wall Tier 1', 'Chakra Turbine', '👑 Starter Hero: Naruto Uzumaki', 'Max Hero Lv 5'],
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
    unlockedFeatures: ['👑 UNLOCK HERO: Monkey D. Luffy (One Piece)', 'Spiritual Tower', 'Paper-Bomb Traps', 'Storage Expansion (+100%)', 'Wall Tier 2', 'Max Hero Lv 10'],
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
    unlockedFeatures: ['👑 UNLOCK HERO: Ichigo Kurosaki (Bleach)', 'Heavy Laser Mortar', 'Reishi Siphon Overclock', 'Auto-Repair Shield', 'Wall Tier 3', 'Max Hero Lv 15'],
    heroBuffBonus: '+30% Hero Damage & Ultimate Cooldown -2s.'
  },
  4: {
    level: 4,
    title: 'Metropolitan Fortress',
    maxStorage: 2500,
    maxBuildings: 32,
    maxHeroLevel: 20,
    maxBuildingLevel: 7,
    armyCampCapacity: 120,
    upgradeCostBerries: 5000,
    upgradeCostChakra: 3200,
    unlockedFeatures: ['👑 UNLOCK HERO: Asta (Black Clover)', 'Hero Awakening Shrine', 'Twin Rail Cannons', 'EMP Defense Barrier', 'Wall Tier 4', 'Max Hero Lv 20'],
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
    unlockedFeatures: ['👑 UNLOCK HERO: Satoru Gojo (Jujutsu Kaisen)', 'Tetra-Dimensional Forcefield', 'Orbital Rail Artillery', 'Infinite Void Trap', 'Master Walls', 'Max Hero Lv 30'],
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

