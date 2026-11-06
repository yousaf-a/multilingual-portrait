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
    image: '/anime-heroes/ichigo-tactical.png',
    turnaround: {
      front: '/anime-heroes/ichigo-turnaround/front.png',
      left34: '/anime-heroes/ichigo-turnaround/left_34.png',
      leftSide: '/anime-heroes/ichigo-turnaround/left_side.png',
      back: '/anime-heroes/ichigo-turnaround/back.png',
      rightSide: '/anime-heroes/ichigo-turnaround/right_side.png',
      right34: '/anime-heroes/ichigo-turnaround/right_34.png'
    },
    poseImages: {
      combat: '/anime-heroes/ichigo-tactical.png',
      epic: '/anime-heroes/ichigo-epic.png',
      goat: '/anime-heroes/ichigo-goat.png'
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
  sasuke: {
    id: 'sasuke',
    name: 'Sasuke Uchiha',
    title: 'Last Uchiha Avenger / Sharingan Prodigy',
    franchise: 'naruto',
    avatar: '⚡',
    image: '/anime-heroes/naruto-heroic.jpg',
    hp: 1150,
    maxHp: 1150,
    attack: 120,
    range: 2.4,
    speed: 3.9,
    quote: "My name is Sasuke Uchiha. I will restore my clan, and there is someone I must kill.",
    catchphrase: "Chidori! One thousand chirping birds pierce your heart!",
    catchphraseJp: "千鳥…これで終わりだ！",
    modernOutfit: 'High-Collar Navy Shinobi Tunic, Uchiha Crest Fan, Arm Bandages & Shuriken Holster',
    skillName: 'Fire Style: Dragon Fire Jutsu',
    skillDesc: 'Breathes a focused torrent of flames along wire guides, piercing defenses in a straight line.',
    ultimateName: 'Chidori (One Thousand Birds)',
    ultimateDesc: 'Charges at breakneck speed with concentrated lightning chakra, piercing straight through the highest-HP defense for 520 damage.',
    ultimateCooldown: 14,
    color: '#6366f1',
    accentColor: '#818cf8'
  },
  kakashi: {
    id: 'kakashi',
    name: 'Kakashi Hatake',
    title: 'The Copy Ninja / Leader of Team 7',
    franchise: 'naruto',
    avatar: '👁️',
    image: '/anime-heroes/kakashi_portrait.jpg',
    hp: 1300,
    maxHp: 1300,
    attack: 130,
    range: 2.6,
    speed: 3.7,
    quote: "In the ninja world, those who break the rules are scum, but those who abandon their friends are worse than scum.",
    catchphrase: "I won't let you kill my comrades. Raikiri!",
    catchphraseJp: "オレの仲間は絶対に殺させやしない…雷切！",
    modernOutfit: 'Konoha Jonin Flak Vest, Dark Blue Undergarments, Forehead Protector angled over left eye',
    skillName: 'Sharingan Foresight Counter',
    skillDesc: 'Predicts incoming trajectories and evades enemy projectile attacks for 3.5s while counter-attacking.',
    ultimateName: 'Lightning Blade: Twin Dogs (雷切・双雷震)',
    ultimateDesc: 'Splits lightning into dual hound streaks that tear through enemy walls and stun nearby defense turrets for 4s.',
    ultimateCooldown: 15,
    color: '#0284c7',
    accentColor: '#38bdf8'
  },
  jiraiya: {
    id: 'jiraiya',
    name: 'Jiraiya (Toad Sage)',
    title: 'Legendary Sannin of Mount Myoboku',
    franchise: 'naruto',
    avatar: '🐸',
    image: '/anime-heroes/jiraiya_portrait.jpg',
    hp: 1550,
    maxHp: 1550,
    attack: 135,
    range: 2.0,
    speed: 2.8,
    quote: "A person grows up when he's able to overcome hardships. Protection is the true path of a ninja.",
    catchphrase: "The Mountain Sage of Mount Myoboku! Ultra-Big Ball Rasengan!",
    catchphraseJp: "妙木山蝦蟇仙人・自来也様とはオレのことよ！超大玉螺旋丸！",
    modernOutfit: 'Sage Green Kimono Shirt, Crimson Outer Haori, Spiked White Mane, Oil Headband',
    skillName: 'Toad Mouth Trap & Needle Jizo',
    skillDesc: 'Hardens hair into needle armor, reflecting 60% of physical damage taken back onto attackers.',
    ultimateName: 'Ultra-Big Ball Rasengan (超大玉螺旋丸)',
    ultimateDesc: 'Creates a massive swirling sphere of sage chakra that obliterates enemy defensive structures in a 4-tile blast radius.',
    ultimateCooldown: 16,
    color: '#ea580c',
    accentColor: '#f97316'
  },
  tsunade: {
    id: 'tsunade',
    name: 'Lady Tsunade',
    title: 'Fifth Hokage / Slug Princess of Leaf',
    franchise: 'naruto',
    avatar: '🌸',
    image: '/anime-heroes/tsunade-tactical.jpg',
    hp: 1650,
    maxHp: 1650,
    attack: 140,
    range: 1.5,
    speed: 2.6,
    quote: "I am the Fifth Hokage! You have trampled on my ancestors' treasure and dreams... I will not forgive you!",
    catchphrase: "Strength of a Hundred Seal! Heavenly Foot of Pain!",
    catchphraseJp: "百豪の術…痛天脚！木ノ葉の火の意志を舐めるな！",
    modernOutfit: 'Emerald Green Haori with Gamble Kanji, Grey Sleeveless Blouse, First Hokage Crystal Necklace',
    skillName: 'Mitotic Regeneration: Healing Tag',
    skillDesc: 'Heals all friendly deployed squads by 280 HP and cleanses debuffs.',
    ultimateName: 'Heavenly Foot of Pain (痛天脚)',
    ultimateDesc: 'Concentrates monstrous chakra into her heel and strikes the earth, shattering adjacent walls and buildings with an earthquake.',
    ultimateCooldown: 16,
    color: '#16a34a',
    accentColor: '#4ade80'
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
      epic: '/anime-heroes/sung-jinwoo-epic.png',
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
    poseImages: {
      combat: '/anime-heroes/levi-tactical.png',
      epic: '/anime-heroes/levi-epic.png',
      goat: '/anime-heroes/levi-goat.png'
    },
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
    poseImages: {
      combat: '/anime-heroes/mereoleona-tactical.png',
      epic: '/anime-heroes/mereoleona-epic.png',
      goat: '/anime-heroes/mereoleona-goat.png'
    },
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
  naruto: { hqLevel: 1, heroName: 'Naruto Uzumaki', anime: 'Naruto Shippuden', perk: 'Starter Defender / Multi-Shadow Clone & Rasengan' },
  sasuke: { hqLevel: 1, heroName: 'Sasuke Uchiha', anime: 'Naruto', perk: 'Unlocks in Arc 1 (Waves Arc) / Chidori & Dragon Fire' },
  kakashi: { hqLevel: 1, heroName: 'Kakashi Hatake', anime: 'Naruto', perk: 'Unlocks in Arc 2 (Chunin Exams) / Sharingan Counter & Raikiri' },
  jiraiya: { hqLevel: 1, heroName: 'Jiraiya (Toad Sage)', anime: 'Naruto', perk: 'Unlocks in Arc 3 (Sannin Search) / Ultra-Big Ball Rasengan' },
  tsunade: { hqLevel: 1, heroName: 'Lady Tsunade', anime: 'Naruto', perk: 'Unlocks in Arc 3 (Sannin Search) / Heavenly Foot of Pain' },
  minato: { hqLevel: 1, heroName: 'Minato Namikaze', anime: 'Naruto Shippuden', perk: 'Unlocks in Arc 4 (Will of Fire) / Flying Thunder God' },
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
  kenpachi: { hqLevel: 5, heroName: 'Kenpachi Zaraki', anime: 'Bleach', perk: 'Unlocks at Town Hall HQ 5 / Nozarashi Colossal Skull Cleave' },
  boa_hancock: { hqLevel: 5, heroName: 'Boa Hancock', anime: 'One Piece', perk: 'Unlocks at Town Hall HQ 5 / Slave Arrow & Perfume Femur' },
};

export const TROOPS_CATALOG: TroopData[] = [
  {
    id: 'konoha_genin',
    name: 'Leaf Village Genin Operative',
    franchise: 'naruto',
    cost: 35,
    resourceType: 'chakra',
    hp: 130,
    attack: 38,
    range: 3.5,
    speed: 3.8,
    desc: 'Agile Leaf Genin throwing rapid Shuriken & Kunai with Body Flicker movement.',
    icon: '🥷'
  },
  {
    id: 'fire_chunin',
    name: 'Chunin Fireball Specialist',
    franchise: 'naruto',
    cost: 55,
    resourceType: 'chakra',
    hp: 190,
    attack: 65,
    range: 4.8,
    speed: 2.8,
    desc: 'Leaf Chunin unleashing 火遁・豪火球の術 (Fire Style: Grand Fireball Jutsu) with scorching AOE splash.',
    icon: '🔥'
  },
  {
    id: 'hyuga_striker',
    name: 'Hyūga Clan Gentle Fist Striker',
    franchise: 'naruto',
    cost: 70,
    resourceType: 'chakra',
    hp: 230,
    attack: 80,
    range: 1.6,
    speed: 3.6,
    desc: 'Byakugan-wielding Taijutsu master using 八卦六十四掌 (8 Trigrams 64 Palms) to pierce defenses and shut down chakra points.',
    icon: '👁️'
  },
  {
    id: 'toad_vanguard',
    name: 'Mount Myoboku Toad Vanguard',
    franchise: 'naruto',
    cost: 85,
    resourceType: 'berries',
    hp: 450,
    attack: 75,
    range: 1.2,
    speed: 2.2,
    desc: 'Armored battle toad summoned from Mount Myoboku wielding a colossal iron cleaver. Heavy frontline tank and wall-smasher.',
    icon: '🐸'
  }
];

export const INITIAL_VILLAGE_BUILDINGS: BuildingInstance[] = [
  {
    id: 'hokage_residence_core',
    type: 'command_core',
    name: 'Hokage Residence (Leaf Town Hall Lv. 1)',
    level: 1,
    x: 5,
    y: 5,
    hp: 1800,
    maxHp: 1800,
    color: '#f97316',
    icon: '🏛️'
  },
  {
    id: 'ichiraku_ramen_stand',
    type: 'ichiraku_ramen',
    name: 'Ichiraku Ramen Stand (一楽ラーメン)',
    level: 1,
    x: 3,
    y: 6,
    hp: 900,
    maxHp: 900,
    color: '#ea580c',
    icon: '🍜',
    productionRate: 25,
    resourceProduced: 'chakra'
  },
  {
    id: 'team7_training_posts',
    type: 'team7_posts',
    name: 'Team 7 Sparring Posts (第7班・修練場)',
    level: 1,
    x: 7,
    y: 3,
    hp: 750,
    maxHp: 750,
    color: '#84cc16',
    icon: '🪵'
  }
];

export const INITIAL_PLAYER_STATE: PlayerVillageState = {
  level: 1,
  berries: 650,
  chakra: 450,
  reishi: 0, // Unlocked when advancing to Bleach Soul Society
  maxStorage: 2500,
  buildings: INITIAL_VILLAGE_BUILDINGS,
  unlockedHeroes: ['naruto'],
  activeHeroId: 'naruto',
  completedChapters: [],
  completedStoryQuests: [],
  defeatedMiniBosses: [],
  currentChapter: 1,
  heroLevels: { naruto: 1 },
  trainedTroops: {}, // Fresh start: train your genin in Quest 1!
  weatherMode: 'day',
  activeGuildId: 'hidden_leaf',
  guildContribution: 0,
  playerName: 'Shinobi Hokage (You)',
  sanctuaryTag: '#LEAF-001',
  lastHarvestTime: 0
};

export const DEFAULT_FRIEND_BASES: FriendProfile[] = [
  {
    id: 'target_bandit_camp',
    name: 'D-Rank: Outlaw Bandit Border Encampment',
    tag: '#D-RANK-MISSION',
    level: 1,
    trophies: 120,
    activeHeroId: 'naruto',
    heroLevel: 1,
    berriesLoot: 450,
    chakraLoot: 350,
    buildings: [
      { id: 'b_core', type: 'command_core', name: 'Bandit Hideout Cabin', level: 1, x: 5, y: 5, hp: 950, maxHp: 950, color: '#b45309', icon: '⛺' },
      { id: 'b_mor', type: 'paper_mortar', name: 'Scrap Stone Catapult', level: 1, x: 3, y: 5, hp: 420, maxHp: 420, attack: 40, range: 5.0, color: '#d97706', icon: '🪨' },
      { id: 'b_stor', type: 'berry_treasury', name: 'Plundered Grain Sack', level: 1, x: 7, y: 5, hp: 450, maxHp: 450, productionRate: 40, color: '#f59e0b', icon: '💰' },
      { id: 'b_w1', type: 'defense_wall', name: 'Wooden Stockade', level: 1, x: 4, y: 4, hp: 500, maxHp: 500, color: '#78350f', icon: '🪵' },
      { id: 'b_w2', type: 'defense_wall', name: 'Wooden Stockade', level: 1, x: 6, y: 4, hp: 500, maxHp: 500, color: '#78350f', icon: '🪵' },
      { id: 'b_w3', type: 'defense_wall', name: 'Wooden Stockade', level: 1, x: 4, y: 6, hp: 500, maxHp: 500, color: '#78350f', icon: '🪵' },
      { id: 'b_w4', type: 'defense_wall', name: 'Wooden Stockade', level: 1, x: 6, y: 6, hp: 500, maxHp: 500, color: '#78350f', icon: '🪵' }
    ]
  },
  {
    id: 'target_mist_compound',
    name: 'C-Rank: Rogue Mist Mercenary Compound',
    tag: '#C-RANK-MISSION',
    level: 1,
    trophies: 280,
    activeHeroId: 'naruto',
    heroLevel: 1,
    berriesLoot: 850,
    chakraLoot: 600,
    buildings: [
      { id: 'm_core', type: 'command_core', name: 'Mercenary Outpost HQ', level: 1, x: 5, y: 5, hp: 1200, maxHp: 1200, color: '#dc2626', icon: '🏯' },
      { id: 'm_mor', type: 'paper_mortar', name: 'Mist Bomb Cannon', level: 1, x: 3, y: 5, hp: 550, maxHp: 550, attack: 55, range: 5.5, color: '#f59e0b', icon: '💥' },
      { id: 'm_stor', type: 'berry_treasury', name: 'Stolen Loot Cache', level: 1, x: 7, y: 5, hp: 600, maxHp: 600, productionRate: 60, color: '#f59e0b', icon: '💰' },
      { id: 'm_w1', type: 'defense_wall', name: 'Palisade Barrier', level: 1, x: 4, y: 4, hp: 650, maxHp: 650, color: '#475569', icon: '🧱' },
      { id: 'm_w2', type: 'defense_wall', name: 'Palisade Barrier', level: 1, x: 6, y: 4, hp: 650, maxHp: 650, color: '#475569', icon: '🧱' },
      { id: 'm_w3', type: 'defense_wall', name: 'Palisade Barrier', level: 1, x: 4, y: 6, hp: 650, maxHp: 650, color: '#475569', icon: '🧱' },
      { id: 'm_w4', type: 'defense_wall', name: 'Palisade Barrier', level: 1, x: 6, y: 6, hp: 650, maxHp: 650, color: '#475569', icon: '🧱' }
    ]
  },
  {
    id: 'target_sound_base',
    name: 'B-Rank: Hidden Sound Infiltration Garrison',
    tag: '#B-RANK-MISSION',
    level: 2,
    trophies: 520,
    activeHeroId: 'naruto',
    heroLevel: 2,
    berriesLoot: 1350,
    chakraLoot: 1100,
    buildings: [
      { id: 's_core', type: 'command_core', name: 'Sound Curse Core HQ', level: 2, x: 5, y: 5, hp: 1600, maxHp: 1600, color: '#7c3aed', icon: '🏯' },
      { id: 's_can1', type: 'paper_mortar', name: 'Resonance Sound Cannon', level: 2, x: 3, y: 5, hp: 700, maxHp: 700, attack: 65, range: 6.0, color: '#ef4444', icon: '💣' },
      { id: 's_can2', type: 'paper_mortar', name: 'Resonance Sound Cannon', level: 2, x: 7, y: 5, hp: 700, maxHp: 700, attack: 65, range: 6.0, color: '#ef4444', icon: '💣' },
      { id: 's_stor', type: 'chakra_turbine', name: 'Curse Chakra Reactor', level: 2, x: 5, y: 3, hp: 650, maxHp: 650, productionRate: 95, color: '#8b5cf6', icon: '🌀' },
      { id: 's_w1', type: 'defense_wall', name: 'Sound Barrier Wall', level: 2, x: 4, y: 4, hp: 850, maxHp: 850, color: '#6d28d9', icon: '🧱' },
      { id: 's_w2', type: 'defense_wall', name: 'Sound Barrier Wall', level: 2, x: 6, y: 4, hp: 850, maxHp: 850, color: '#6d28d9', icon: '🧱' },
      { id: 's_w3', type: 'defense_wall', name: 'Sound Barrier Wall', level: 2, x: 4, y: 6, hp: 850, maxHp: 850, color: '#6d28d9', icon: '🧱' },
      { id: 's_w4', type: 'defense_wall', name: 'Sound Barrier Wall', level: 2, x: 6, y: 6, hp: 850, maxHp: 850, color: '#6d28d9', icon: '🧱' }
    ]
  },
  {
    id: 'target_akatsuki_rain',
    name: 'A-Rank: Akatsuki Rain Reconnaissance Post',
    tag: '#A-RANK-MISSION',
    level: 3,
    trophies: 940,
    activeHeroId: 'naruto',
    heroLevel: 3,
    berriesLoot: 2100,
    chakraLoot: 1850,
    buildings: [
      { id: 'a_core', type: 'command_core', name: 'Rain Iron Tower HQ', level: 3, x: 5, y: 5, hp: 2100, maxHp: 2100, color: '#0f172a', icon: '🏯' },
      { id: 'a_mor1', type: 'paper_mortar', name: 'Paper Shuriken Mortar', level: 3, x: 3, y: 4, hp: 750, maxHp: 750, attack: 75, range: 6.5, color: '#f59e0b', icon: '💥' },
      { id: 'a_mor2', type: 'paper_mortar', name: 'Paper Shuriken Mortar', level: 3, x: 7, y: 4, hp: 750, maxHp: 750, attack: 75, range: 6.5, color: '#f59e0b', icon: '💥' },
      { id: 'a_stor1', type: 'berry_treasury', name: 'Akatsuki War Chest', level: 3, x: 4, y: 6, hp: 800, maxHp: 800, productionRate: 140, color: '#f59e0b', icon: '💰' },
      { id: 'a_stor2', type: 'chakra_turbine', name: 'Rain Chakra Siphon', level: 3, x: 6, y: 6, hp: 800, maxHp: 800, productionRate: 120, color: '#06b6d4', icon: '🌀' },
      { id: 'a_w1', type: 'defense_wall', name: 'Reinforced Steel Wall', level: 3, x: 3, y: 5, hp: 1100, maxHp: 1100, color: '#334155', icon: '🧱' },
      { id: 'a_w2', type: 'defense_wall', name: 'Reinforced Steel Wall', level: 3, x: 7, y: 5, hp: 1100, maxHp: 1100, color: '#334155', icon: '🧱' }
    ]
  },
  {
    id: 'target_pain_stronghold',
    name: 'S-Rank: Six Paths Akatsuki Stronghold',
    tag: '#S-RANK-FORBIDDEN',
    level: 4,
    trophies: 1650,
    activeHeroId: 'naruto',
    heroLevel: 4,
    berriesLoot: 3800,
    chakraLoot: 3200,
    buildings: [
      { id: 'p_core', type: 'command_core', name: 'Six Paths Deva Spire', level: 4, x: 5, y: 5, hp: 3200, maxHp: 3200, color: '#450a0a', icon: '⛩️' },
      { id: 'p_can1', type: 'paper_mortar', name: 'Almighty Push Turret', level: 4, x: 3, y: 3, hp: 950, maxHp: 950, attack: 95, range: 6.5, color: '#ef4444', icon: '💥' },
      { id: 'p_can2', type: 'paper_mortar', name: 'Almighty Push Turret', level: 4, x: 7, y: 3, hp: 950, maxHp: 950, attack: 95, range: 6.5, color: '#ef4444', icon: '💥' },
      { id: 'p_can3', type: 'paper_mortar', name: 'Almighty Push Turret', level: 4, x: 3, y: 7, hp: 950, maxHp: 950, attack: 95, range: 6.5, color: '#ef4444', icon: '💥' },
      { id: 'p_can4', type: 'paper_mortar', name: 'Almighty Push Turret', level: 4, x: 7, y: 7, hp: 950, maxHp: 950, attack: 95, range: 6.5, color: '#ef4444', icon: '💥' },
      { id: 'p_w1', type: 'defense_wall', name: 'Black Iron Barrier', level: 4, x: 4, y: 3, hp: 1400, maxHp: 1400, color: '#1e293b', icon: '🧱' },
      { id: 'p_w2', type: 'defense_wall', name: 'Black Iron Barrier', level: 4, x: 6, y: 3, hp: 1400, maxHp: 1400, color: '#1e293b', icon: '🧱' },
      { id: 'p_w3', type: 'defense_wall', name: 'Black Iron Barrier', level: 4, x: 4, y: 7, hp: 1400, maxHp: 1400, color: '#1e293b', icon: '🧱' },
      { id: 'p_w4', type: 'defense_wall', name: 'Black Iron Barrier', level: 4, x: 6, y: 7, hp: 1400, maxHp: 1400, color: '#1e293b', icon: '🧱' }
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

