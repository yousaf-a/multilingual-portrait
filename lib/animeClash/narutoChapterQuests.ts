// Anime Clash: Neo-Village Chronicles - Chapter 1: Naruto Uzumaki (Konohagakure Campaign)
// 25 Canonical Story Quests across 4 Iconic Arcs with Free Audio & Progression Mechanics

import { PlayerVillageState } from './types';

export interface QuestTask {
  id: string;
  description: string;
  type: 'build' | 'upgrade' | 'train' | 'battle' | 'miniboss' | 'special' | 'boss';
  targetKey?: string;
  targetCount: number;
  currentCount?: number;
}

export interface QuestDialogue {
  speaker: string;
  avatar: string;
  text: string;
  mood?: 'normal' | 'angry' | 'sad' | 'determined' | 'dramatic';
}

export interface ChapterQuest {
  id: string;
  questNumber: number;
  arcName: string;
  arcNumber: 1 | 2 | 3 | 4;
  title: string;
  japaneseKanji: string;
  prologue: QuestDialogue[];
  epilogue: QuestDialogue[];
  tasks: QuestTask[];
  rewards: {
    berries: number;
    chakra: number;
    reishi: number;
    heroXp: number;
    unlockHeroId?: string;
    unlockBuildingKey?: string;
    specialPerk?: string;
  };
  miniBoss?: {
    name: string;
    title: string;
    avatar: string;
    hp: number;
    attack: number;
    specialSkill: string;
  };
  isBossQuest?: boolean;
}

export const CHAPTER_1_NARUTO_QUESTS: ChapterQuest[] = [
  // ==========================================
  // ARC 1: GENIN INCEPTION & LAND OF WAVES (1-7)
  // ==========================================
  {
    id: 'naruto_q1',
    questNumber: 1,
    arcName: 'The Way of the Shinobi',
    arcNumber: 1,
    title: 'The Bell Test: Team 7 Assembles',
    japaneseKanji: '生か死か!? カカシの試練',
    prologue: [
      { speaker: 'Kakashi Hatake', avatar: '🥷', text: 'You three pass only if you can take one of these two bells from me before noon. Come at me with the intent to kill.', mood: 'normal' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Dattebayo! I am gonna take both bells and eat all the ramen at Ichiraku afterward!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Kakashi Hatake', avatar: '🥷', text: 'Those who break the rules are scum, but those who abandon their comrades are worse than scum. You all pass.', mood: 'determined' }
    ],
    tasks: [
      { id: 'q1_t1', description: 'Construct 1 Ninja Academy Training Ground in Konoha', type: 'build', targetKey: 'dojo', targetCount: 1 },
      { id: 'q1_t2', description: 'Train 3 Leaf Village Shinobi Genin', type: 'train', targetKey: 'shinobi', targetCount: 3 }
    ],
    rewards: { berries: 300, chakra: 250, reishi: 50, heroXp: 150, specialPerk: 'Team 7 Bond Unlocked' }
  },
  {
    id: 'naruto_q2',
    questNumber: 2,
    arcName: 'The Way of the Shinobi',
    arcNumber: 1,
    title: 'Fortifying the Hidden Leaf Perimeter',
    japaneseKanji: '木ノ葉隠れの里・防壁構築',
    prologue: [
      { speaker: 'Lord Third (Hiruzen)', avatar: '📜', text: 'Peace is fragile, Naruto. The borders of the Land of Fire must be safeguarded against rogue ninja factions.', mood: 'normal' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Leave it to me Old Man Hokage! I will fortify our wooden wall perimeter so tight not even a fly slips in!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Iruka Umino', avatar: '📘', text: 'Incredible work, Naruto. The outer perimeter defenses are now solid.', mood: 'normal' }
    ],
    tasks: [
      { id: 'q2_t1', description: 'Construct 4 Wooden Wall barriers around your Town Hall', type: 'build', targetKey: 'wall', targetCount: 4 },
      { id: 'q2_t2', description: 'Store at least 400 Chakra in your village reserve', type: 'special', targetCount: 400 }
    ],
    rewards: { berries: 350, chakra: 300, reishi: 80, heroXp: 180, unlockBuildingKey: 'wall' }
  },
  {
    id: 'naruto_q3',
    questNumber: 3,
    arcName: 'The Way of the Shinobi',
    arcNumber: 1,
    title: 'The Chakra Tree-Climbing Regimen',
    japaneseKanji: '木登り修業! チャクラ集中',
    prologue: [
      { speaker: 'Kakashi Hatake', avatar: '🥷', text: 'Focus your chakra to the soles of your feet. Too little, and you slip. Too much, and the bark splinters.', mood: 'normal' },
      { speaker: 'Sasuke Uchiha', avatar: '⚡', text: 'Tch. I will master this before you do, loser.', mood: 'angry' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Just watch me Sasuke! I will climb all the way to the top of the Hokage Monument!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Sakura Haruno', avatar: '🌸', text: 'Both of you actually reached the highest branches! Your stamina and chakra control doubled!', mood: 'determined' }
    ],
    tasks: [
      { id: 'q3_t1', description: 'Train 5 Leaf Shinobi Scouts with focused chakra control', type: 'train', targetKey: 'shinobi', targetCount: 5 },
      { id: 'q3_t2', description: 'Upgrade Naruto to Level 2', type: 'upgrade', targetKey: 'naruto', targetCount: 2 }
    ],
    rewards: { berries: 450, chakra: 400, reishi: 120, heroXp: 220, specialPerk: 'Chakra Control +15% Speed' }
  },
  {
    id: 'naruto_q4',
    questNumber: 4,
    arcName: 'The Way of the Shinobi',
    arcNumber: 1,
    title: 'Escort Master Builder Tazuna',
    japaneseKanji: '達納の護衛任務・波の国へ',
    prologue: [
      { speaker: 'Tazuna', avatar: '🔨', text: 'My bridge is the only hope to free the Land of Waves from Gato’s grip! Protect me until it is finished!', mood: 'determined' },
      { speaker: 'Kakashi Hatake', avatar: '🥷', text: 'Stay alert Team 7. There are dangerous rogue ninja operating along the riverbanks.', mood: 'normal' }
    ],
    epilogue: [
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'I swear on this cut on my left hand: I will never run away or freeze in battle again!', mood: 'determined' }
    ],
    tasks: [
      { id: 'q4_t1', description: 'Construct 1 Shinobi Watchtower Defense overlooking the river', type: 'build', targetKey: 'cannon', targetCount: 1 },
      { id: 'q4_t2', description: 'Deploy your squad on 1 Patrol Guard Duty', type: 'special', targetCount: 1 }
    ],
    rewards: { berries: 500, chakra: 450, reishi: 150, heroXp: 260 }
  },
  {
    id: 'naruto_q5',
    questNumber: 5,
    arcName: 'The Way of the Shinobi',
    arcNumber: 1,
    title: 'Ambush at the Mist Bridge: Demon Brothers',
    japaneseKanji: '霧の暗殺者・鬼兄弟の強襲',
    prologue: [
      { speaker: 'Gouzu & Meizu', avatar: '⛓️', text: 'One down! Now to tear you brats to pieces with our poisoned chains!', mood: 'angry' },
      { speaker: 'Sasuke Uchiha', avatar: '⚡', text: 'Naruto, don’t stand there petrified! Move!', mood: 'dramatic' }
    ],
    epilogue: [
      { speaker: 'Kakashi Hatake', avatar: '🥷', text: 'Good recovery. You neutralized them before Tazuna took a scratch.', mood: 'normal' }
    ],
    tasks: [
      { id: 'q5_t1', description: 'Defeat the Rogue Demon Brothers Vanguard Skirmish', type: 'miniboss', targetKey: 'demon_brothers', targetCount: 1 }
    ],
    miniBoss: {
      name: 'Demon Brothers (Gouzu & Meizu)',
      title: 'Hidden Mist Chunin Assassins',
      avatar: '⛓️',
      hp: 1200,
      attack: 75,
      specialSkill: 'Poisoned Chain Sever'
    },
    rewards: { berries: 650, chakra: 550, reishi: 200, heroXp: 300, specialPerk: 'Chain Binding Defense' }
  },
  {
    id: 'naruto_q6',
    questNumber: 6,
    arcName: 'The Way of the Shinobi',
    arcNumber: 1,
    title: 'The Demon in the Mist: Zabuza Momochi',
    japaneseKanji: '霧隠れの鬼人・再不斬襲来',
    prologue: [
      { speaker: 'Zabuza Momochi', avatar: '🗡️', text: 'Well well, Kakashi of the Sharingan eye. Playing babysitter to little genin? Your luck runs out here.', mood: 'angry' },
      { speaker: 'Kakashi Hatake', avatar: '🥷', text: 'Manji formation! Protect Tazuna at all costs! I will handle the Kubikiribocho!', mood: 'dramatic' }
    ],
    epilogue: [
      { speaker: 'Zabuza Momochi', avatar: '🗡️', text: 'Impressive... but next time you see my mist, none of you will walk away alive.', mood: 'normal' }
    ],
    tasks: [
      { id: 'q6_t1', description: 'Survive Zabuza’s Water Prison Jutsu Skirmish', type: 'miniboss', targetKey: 'zabuza', targetCount: 1 },
      { id: 'q6_t2', description: 'Reinforce your village defenses with 1 Archer Tower', type: 'build', targetKey: 'archer_tower', targetCount: 1 }
    ],
    miniBoss: {
      name: 'Zabuza Momochi',
      title: 'The Demon of the Hidden Mist',
      avatar: '🗡️',
      hp: 1800,
      attack: 110,
      specialSkill: 'Water Style: Water Dragon Jutsu'
    },
    rewards: { berries: 800, chakra: 700, reishi: 250, heroXp: 400, specialPerk: 'Water Mist Cloaking' }
  },
  {
    id: 'naruto_q7',
    questNumber: 7,
    arcName: 'The Way of the Shinobi',
    arcNumber: 1,
    title: 'Demonic Ice Mirrors & The Will of Fire',
    japaneseKanji: '白の秘術・魔鏡氷晶の死闘',
    prologue: [
      { speaker: 'Haku', avatar: '❄️', text: 'I am a weapon for Lord Zabuza’s dream. Please... die here so his dream may live.', mood: 'sad' },
      { speaker: 'Sasuke Uchiha', avatar: '⚡', text: 'Naruto... my body just moved on its own. Don’t you dare... let your dream die here...', mood: 'dramatic' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'SASUKE!! You... I will NEVER forgive you! Kyuubi red chakra roars!', mood: 'angry' }
    ],
    epilogue: [
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'They weren’t just tools. Zabuza and Haku... they were real shinobi with real hearts.', mood: 'sad' },
      { speaker: 'Tazuna', avatar: '🔨', text: 'This bridge will forever be called: The Great Naruto Bridge!', mood: 'determined' }
    ],
    tasks: [
      { id: 'q7_t1', description: 'Shatter the Demonic Ice Mirrors and Defeat the Mist Ambush', type: 'battle', targetKey: 'land_of_waves_climax', targetCount: 1 },
      { id: 'q7_t2', description: 'Honor the fallen by upgrading Naruto to Level 3', type: 'upgrade', targetKey: 'naruto', targetCount: 3 }
    ],
    rewards: { berries: 1200, chakra: 1000, reishi: 400, heroXp: 600, specialPerk: 'Will of Fire Resonance (+20% ATK when low HP)' }
  },

  // ==========================================
  // ARC 2: THE CHUNIN EXAMS & FALL OF LEAF (8-14)
  // ==========================================
  {
    id: 'naruto_q8',
    questNumber: 8,
    arcName: 'The Chunin Exam Ordeal',
    arcNumber: 2,
    title: 'The Written Test: Mind Games & Deception',
    japaneseKanji: '中忍試験開幕! 試される忍の器',
    prologue: [
      { speaker: 'Ibiki Morino', avatar: '👁️', text: 'The tenth question carries the penalty of disqualification forever. If you fail, you stay a genin for the rest of your lives.', mood: 'angry' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Don’t underestimate me! Even if I stay a genin forever, I will become Hokage no matter what! Dattebayo!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Ibiki Morino', avatar: '👁️', text: 'He didn’t answer a single question, yet his guts passed the entire room. What a boy.', mood: 'normal' }
    ],
    tasks: [
      { id: 'q8_t1', description: 'Upgrade your Ninja Training Dojo to Level 2', type: 'upgrade', targetKey: 'dojo', targetCount: 2 },
      { id: 'q8_t2', description: 'Accumulate 1,200 Chakra in Konoha reserves', type: 'special', targetCount: 1200 }
    ],
    rewards: { berries: 900, chakra: 850, reishi: 300, heroXp: 450 }
  },
  {
    id: 'naruto_q9',
    questNumber: 9,
    arcName: 'The Chunin Exam Ordeal',
    arcNumber: 2,
    title: 'The Forest of Death: Heaven & Earth Scrolls',
    japaneseKanji: '死の森の罠! 天地の書を奪え',
    prologue: [
      { speaker: 'Anko Mitarashi', avatar: '🐍', text: 'Welcome to the 44th Training Ground. Survive 5 days and bring both Heaven and Earth scrolls to the central tower.', mood: 'determined' },
      { speaker: 'Sasuke Uchiha', avatar: '⚡', text: 'Stick together. Every genin in this forest wants our scroll.', mood: 'normal' }
    ],
    epilogue: [
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'We took down the Rain ninja ambush! The Earth scroll is ours!', mood: 'determined' }
    ],
    tasks: [
      { id: 'q9_t1', description: 'Defeat 2 Rogue Infiltrator squads in the Forest of Death', type: 'battle', targetCount: 2 },
      { id: 'q9_t2', description: 'Train 8 Leaf Shinobi Troops for forest patrol', type: 'train', targetKey: 'shinobi', targetCount: 8 }
    ],
    rewards: { berries: 1000, chakra: 950, reishi: 350, heroXp: 500 }
  },
  {
    id: 'naruto_q10',
    questNumber: 10,
    arcName: 'The Chunin Exam Ordeal',
    arcNumber: 2,
    title: 'Curse Mark of Orochimaru',
    japaneseKanji: '大蛇丸の影! 刻まれた呪印',
    prologue: [
      { speaker: 'Orochimaru', avatar: '🐍', text: 'Such delightful eyes, Sasuke. Let us see if your body can survive my gift...', mood: 'angry' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Hey, snake bastard! Get away from Sasuke! Nine-Tails red eyes flare!', mood: 'angry' }
    ],
    epilogue: [
      { speaker: 'Sakura Haruno', avatar: '🌸', text: 'Naruto was knocked unconscious, and Sasuke has this terrifying black mark... I have to protect them both!', mood: 'sad' }
    ],
    tasks: [
      { id: 'q10_t1', description: 'Survive the Giant Snake Summon Mini-Boss Encounter', type: 'miniboss', targetKey: 'giant_snake', targetCount: 1 },
      { id: 'q10_t2', description: 'Erect 1 Medicinal Healing Pavilion in Konoha', type: 'build', targetKey: 'hospital', targetCount: 1 }
    ],
    miniBoss: {
      name: 'Orochimaru’s Giant Forest Serpent',
      title: 'Summoned Beast of the Sannin',
      avatar: '🐍',
      hp: 2400,
      attack: 135,
      specialSkill: 'Crushing Constriction'
    },
    rewards: { berries: 1300, chakra: 1100, reishi: 450, heroXp: 650, specialPerk: 'Venom Resistance' }
  },
  {
    id: 'naruto_q11',
    questNumber: 11,
    arcName: 'The Chunin Exam Ordeal',
    arcNumber: 2,
    title: 'Preliminaries: The Lotus of the Leaf',
    japaneseKanji: '激闘予選! 木ノ葉の美しき碧い野獣',
    prologue: [
      { speaker: 'Rock Lee', avatar: '🟢', text: 'Guy-sensei! May I take them off now? The weights on my legs?!', mood: 'determined' },
      { speaker: 'Might Guy', avatar: '👍', text: 'I allow it Lee! Show the world the power of youthful hard work!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Bushy Brows was incredible... Even against Gaara’s sand, he never backed down for a second!', mood: 'determined' }
    ],
    tasks: [
      { id: 'q11_t1', description: 'Construct a Central Martial Arts Arena in your village', type: 'build', targetKey: 'arena', targetCount: 1 },
      { id: 'q11_t2', description: 'Perform 3 friendly Dojo Sparring Battles', type: 'battle', targetCount: 3 }
    ],
    rewards: { berries: 1200, chakra: 1200, reishi: 400, heroXp: 600, specialPerk: 'Youthful Tenacity (+10% Move Speed)' }
  },
  {
    id: 'naruto_q12',
    questNumber: 12,
    arcName: 'The Chunin Exam Ordeal',
    arcNumber: 2,
    title: 'Summoning Jutsu with the Toad Sage',
    japaneseKanji: '自来也見参! 蝦蟇口寄せの秘儀',
    prologue: [
      { speaker: 'Jiraiya', avatar: '🐸', text: 'I am the Toad Sage of Mount Myoboku! Pervy Sage? Who are you calling Pervy Sage, brat?!', mood: 'angry' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Teach me your jutsu Pervy Sage, or I will tell everyone what you were doing at the hot springs!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Gamabunta', avatar: '🐸', text: 'Who summoned me?! A pip-squeak on my snout? Well boy, you’ve got guts.', mood: 'normal' }
    ],
    tasks: [
      { id: 'q12_t1', description: 'Spend 800 Chakra on Summoning Scroll Contract Ritual', type: 'special', targetCount: 800 },
      { id: 'q12_t2', description: 'Upgrade Naruto to Level 4', type: 'upgrade', targetKey: 'naruto', targetCount: 4 }
    ],
    rewards: { berries: 1500, chakra: 1400, reishi: 500, heroXp: 750, specialPerk: 'Toad Summoning: Gamabunta Support' }
  },
  {
    id: 'naruto_q13',
    questNumber: 13,
    arcName: 'The Chunin Exam Ordeal',
    arcNumber: 2,
    title: 'Finals: Naruto vs. Neji Hyuga — Defying Destiny',
    japaneseKanji: '宿命の対決! 運命をねじ伏せる拳',
    prologue: [
      { speaker: 'Neji Hyuga', avatar: '👁️', text: 'A failure will always be a failure. Destiny cannot be changed by wishful thinking.', mood: 'normal' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Stop whining about destiny! If you don’t like your fate, don’t accept it! Because unlike you... I never give up!', mood: 'angry' }
    ],
    epilogue: [
      { speaker: 'Neji Hyuga', avatar: '👁️', text: 'A bird in a cage... can break the lock if it flies with its own wings. Naruto, you showed me the sky.', mood: 'determined' }
    ],
    tasks: [
      { id: 'q13_t1', description: 'Break through the 8 Trigrams 64 Palms and Defeat Neji in the Arena', type: 'miniboss', targetKey: 'neji', targetCount: 1 }
    ],
    miniBoss: {
      name: 'Neji Hyuga (Byakugan Prodigy)',
      title: 'Genius of the Gentle Fist',
      avatar: '👁️',
      hp: 2800,
      attack: 140,
      specialSkill: 'Eight Trigrams Sixty-Four Palms'
    },
    rewards: { berries: 1600, chakra: 1500, reishi: 600, heroXp: 850, specialPerk: 'Destiny Breaker' }
  },
  {
    id: 'naruto_q14',
    questNumber: 14,
    arcName: 'The Chunin Exam Ordeal',
    arcNumber: 2,
    title: 'Konoha Crush: Shukaku’s Sand Rampage',
    japaneseKanji: '木ノ葉崩し! 砂の化け物・守鶴覚醒',
    prologue: [
      { speaker: 'Gaara', avatar: '⏳', text: 'Mother... your blood... I will feed you their lives! Sand coffin crushed everything!', mood: 'angry' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'I understand his loneliness... He was hated just like me. But to protect my friends, I will stop him!', mood: 'dramatic' }
    ],
    epilogue: [
      { speaker: 'Gaara', avatar: '⏳', text: 'Love... What is love? His friends gave him strength that surpassed my sand...', mood: 'sad' },
      { speaker: 'Lord Third (Hiruzen)', avatar: '📜', text: 'Where the leaves dance, one shall find fire. The fire’s shadow will illuminate the village...', mood: 'sad' }
    ],
    tasks: [
      { id: 'q14_t1', description: 'Clash with Shukaku One-Tail Avatar and subdue Gaara', type: 'miniboss', targetKey: 'gaara_shukaku', targetCount: 1 },
      { id: 'q14_t2', description: 'Repair damaged Konoha village walls (Build 6 Reinforced Walls)', type: 'build', targetKey: 'wall', targetCount: 6 }
    ],
    miniBoss: {
      name: 'Gaara (Half-Shukaku Transformation)',
      title: 'Jinchuriki of the One-Tail Sand Spirit',
      avatar: '⏳',
      hp: 3500,
      attack: 165,
      specialSkill: 'Sand Tsunami & Desert Funeral'
    },
    rewards: { berries: 2200, chakra: 2000, reishi: 800, heroXp: 1100, specialPerk: 'Sand Shield Ward' }
  },

  // ==========================================
  // ARC 3: SANNIN SEARCH & RASENGAN (15-20)
  // ==========================================
  {
    id: 'naruto_q15',
    questNumber: 15,
    arcName: 'The Search for the Fifth Hokage',
    arcNumber: 3,
    title: 'Rebuilding Konoha & The Quest for Tsunade',
    japaneseKanji: '新時代へ! 伝説の医療忍者を探せ',
    prologue: [
      { speaker: 'Jiraiya', avatar: '🐸', text: 'The Third has passed. The village needs a new pillar of strength. We are heading out to find Tsunade.', mood: 'determined' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'The legendary gambler lady? She better be as strong as everyone says!', mood: 'normal' }
    ],
    epilogue: [
      { speaker: 'Jiraiya', avatar: '🐸', text: 'Pack your bags. On the road, I am going to teach you the Fourth Hokage’s legacy jutsu.', mood: 'determined' }
    ],
    tasks: [
      { id: 'q15_t1', description: 'Upgrade Town Hall (Konoha HQ) to Level 2', type: 'upgrade', targetKey: 'hq', targetCount: 2 },
      { id: 'q15_t2', description: 'Construct 1 Treasury Vault for rebuilding funds', type: 'build', targetKey: 'treasury', targetCount: 1 }
    ],
    rewards: { berries: 2000, chakra: 1800, reishi: 700, heroXp: 950 }
  },
  {
    id: 'naruto_q16',
    questNumber: 16,
    arcName: 'The Search for the Fifth Hokage',
    arcNumber: 3,
    title: 'Tsukuyomi Incursion: Shadows of the Akatsuki',
    japaneseKanji: '漆黒の脅威! 暁・うちはイタチ襲来',
    prologue: [
      { speaker: 'Itachi Uchiha', avatar: '🔴', text: 'We are here for the Fourth Hokage’s legacy: the Nine-Tailed Fox inside you, Naruto.', mood: 'normal' },
      { speaker: 'Kisame Hoshigaki', avatar: '🦈', text: 'Samehada loves the smell of juicy chakra. Shall we shave off his limbs first?', mood: 'angry' },
      { speaker: 'Jiraiya', avatar: '🐸', text: 'Not on my watch. Toad Mouth Trap Jutsu activates!', mood: 'dramatic' }
    ],
    epilogue: [
      { speaker: 'Sasuke Uchiha', avatar: '⚡', text: 'I am too weak... Itachi didn’t even see me as a threat. I need more power... at any cost.', mood: 'sad' }
    ],
    tasks: [
      { id: 'q16_t1', description: 'Survive the Akatsuki Duo Infiltration Skirmish', type: 'miniboss', targetKey: 'itachi_kisame', targetCount: 1 }
    ],
    miniBoss: {
      name: 'Itachi & Kisame (Akatsuki Vanguard)',
      title: 'S-Rank Rogue Ninja Duo',
      avatar: '🔴',
      hp: 4200,
      attack: 190,
      specialSkill: 'Amaterasu Black Flames'
    },
    rewards: { berries: 2500, chakra: 2200, reishi: 900, heroXp: 1200, specialPerk: 'Genjutsu Immunity Ward' }
  },
  {
    id: 'naruto_q17',
    questNumber: 17,
    arcName: 'The Search for the Fifth Hokage',
    arcNumber: 3,
    title: 'Three-Stage Rasengan Mastery',
    japaneseKanji: '螺旋丸開眼! 水風船から極限の回転へ',
    prologue: [
      { speaker: 'Jiraiya', avatar: '🐸', text: 'Stage 1: Rotation. Stage 2: Power. Stage 3: Containment. Pop the water balloon without popping your own chakra points!', mood: 'normal' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'My hands are bleeding and blistered... but I promised Tsunade I’d master it in 3 days for her necklace!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Tsunade', avatar: '💎', text: 'He actually held a shadow clone to stabilize the sphere... The kid really created a genuine Rasengan!', mood: 'determined' }
    ],
    tasks: [
      { id: 'q17_t1', description: 'Channel 1,500 Chakra into the Rasengan Rotation Training Sphere', type: 'special', targetCount: 1500 },
      { id: 'q17_t2', description: 'Upgrade Naruto to Level 5', type: 'upgrade', targetKey: 'naruto', targetCount: 5 }
    ],
    rewards: { berries: 2800, chakra: 2500, reishi: 1000, heroXp: 1400, specialPerk: 'A-Rank Rasengan Impact (+30% Burst Damage)' }
  },
  {
    id: 'naruto_q18',
    questNumber: 18,
    arcName: 'The Search for the Fifth Hokage',
    arcNumber: 3,
    title: 'Three-Way Deadlock: Sannin Clash',
    japaneseKanji: '三竦みの攻防! 伝説の口寄せ大激突',
    prologue: [
      { speaker: 'Orochimaru', avatar: '🐍', text: 'Kill me if you can, Tsunade! Manda will crush both of you!', mood: 'angry' },
      { speaker: 'Tsunade', avatar: '💎', text: 'I am the granddaughter of Hashirama Senju, and from this day forth... I am the Fifth Hokage of Konoha!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Tsunade-baachan! Put on the Hokage hat! Leaf Village is waiting for our Fifth Hokage!', mood: 'determined' }
    ],
    tasks: [
      { id: 'q18_t1', description: 'Defeat Orochimaru & Kabuto in the Three-Way Deadlock', type: 'battle', targetCount: 1 },
      { id: 'q18_t2', description: 'Construct the Fifth Hokage Medical Outpost in Konoha', type: 'build', targetKey: 'hospital', targetCount: 1 }
    ],
    rewards: { berries: 3200, chakra: 2800, reishi: 1200, heroXp: 1600, specialPerk: '100 Healings Regeneration' }
  },
  {
    id: 'naruto_q19',
    questNumber: 19,
    arcName: 'The Search for the Fifth Hokage',
    arcNumber: 3,
    title: 'Valley of the End: Severing the Bonds',
    japaneseKanji: '終末の谷! 涙の雨と千鳥・螺旋丸の激突',
    prologue: [
      { speaker: 'Sasuke Uchiha', avatar: '⚡', text: 'Naruto... you were my closest friend. That is why... you must die by my Chidori!', mood: 'angry' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Even if I have to break all your bones, I will drag you back home to Konoha, Sasuke!', mood: 'dramatic' }
    ],
    epilogue: [
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'I couldn’t bring him back... But I will never give up. I will train until I am strong enough to save my friend.', mood: 'sad' },
      { speaker: 'Kakashi Hatake', avatar: '🥷', text: 'Rest now Naruto. The journey has only just begun.', mood: 'sad' }
    ],
    tasks: [
      { id: 'q19_t1', description: 'Endure the Curse Mark Level 2 Chidori vs Vermilion Rasengan Clash', type: 'miniboss', targetKey: 'curse_sasuke', targetCount: 1 }
    ],
    miniBoss: {
      name: 'Curse Mark Level 2 Sasuke',
      title: 'Avenger of the Uchiha Clan',
      avatar: '⚡',
      hp: 5200,
      attack: 220,
      specialSkill: 'Black Chidori: Dark Lightning Spear'
    },
    rewards: { berries: 3600, chakra: 3200, reishi: 1400, heroXp: 1800, specialPerk: 'Bonds of Fate Resiliency' }
  },
  {
    id: 'naruto_q20',
    questNumber: 20,
    arcName: 'The Search for the Fifth Hokage',
    arcNumber: 3,
    title: 'Fortifying Konoha with Chakra Barrier Seals',
    japaneseKanji: '結界班出動! 木ノ葉大結界の布陣',
    prologue: [
      { speaker: 'Shikaku Nara', avatar: '♟️', text: 'Intelligence indicates Akatsuki has begun hunting the Jinchuriki across the Five Great Nations. Konoha must be sealed.', mood: 'normal' },
      { speaker: 'Tsunade', avatar: '💎', text: 'Erect the spherical detection barrier over the entire sky of the Leaf!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Shizune', avatar: '🐷', text: 'The Barrier Seal is fully operational. Any intruder crossing the sky will be instantly pinpointed.', mood: 'normal' }
    ],
    tasks: [
      { id: 'q20_t1', description: 'Construct 2 Chakra Barrier Sealing Gate Towers', type: 'build', targetKey: 'cannon', targetCount: 2 },
      { id: 'q20_t2', description: 'Train a vanguard of 12 Elite Chunin Defenders', type: 'train', targetKey: 'shinobi', targetCount: 12 }
    ],
    rewards: { berries: 4000, chakra: 3600, reishi: 1600, heroXp: 2000, specialPerk: 'Perimeter Sensor Net' }
  },

  // ==========================================
  // ARC 4: PAIN INVASION & THE SACRIFICE (21-25)
  // ==========================================
  {
    id: 'naruto_q21',
    questNumber: 21,
    arcName: 'The Six Paths of Pain Crisis',
    arcNumber: 4,
    title: 'Decrypting Jiraiya’s Dying Cipher',
    japaneseKanji: '自来也の遺言! 暗号解読班の奮闘',
    prologue: [
      { speaker: 'Fukasaku', avatar: '🐸', text: 'Naruto... Master Jiraiya has fallen in the Hidden Rain. Before his heartbeat stopped, he carved this cipher on my back.', mood: 'sad' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Pervy Sage... dead? No... NO! You’re lying! He promised he’d come back alive!', mood: 'sad' },
      { speaker: 'Shikamaru Nara', avatar: '♟️', text: 'Naruto, cry if you must. But we cannot stay kids forever. We have to be the ones entrusted with the master’s will.', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'The numbers: 9, 31, 8... "The real one is not among them." That’s Pervy Sage’s message to me!', mood: 'determined' }
    ],
    tasks: [
      { id: 'q21_t1', description: 'Decrypt Jiraiya’s Cipher by holding a memorial vigil in Konoha', type: 'special', targetCount: 1 },
      { id: 'q21_t2', description: 'Upgrade Naruto to Level 6', type: 'upgrade', targetKey: 'naruto', targetCount: 6 }
    ],
    rewards: { berries: 4500, chakra: 4000, reishi: 1800, heroXp: 2200, specialPerk: 'Inherited Will of Fire' }
  },
  {
    id: 'naruto_q22',
    questNumber: 22,
    arcName: 'The Six Paths of Pain Crisis',
    arcNumber: 4,
    title: 'Mount Myoboku: Natural Energy Balance',
    japaneseKanji: '妙木山の油滝! 仙術チャクラの調和',
    prologue: [
      { speaker: 'Fukasaku', avatar: '🐸', text: 'To learn Senjutsu, you must merge physical energy, spiritual energy, and natural energy in perfect thirds. One mistake, and you turn into stone!', mood: 'normal' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Whack me with that toad baton every time I start turning to stone! I will master Sage Mode faster than anyone in history!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Fukasaku', avatar: '🐸', text: 'Look at his eyes... The orange toad markings! He has perfected true Sage Mode!', mood: 'determined' }
    ],
    tasks: [
      { id: 'q22_t1', description: 'Channel 3,000 Natural Senjutsu Chakra into Meditation', type: 'special', targetCount: 3000 },
      { id: 'q22_t2', description: 'Synthesize 1 Mount Myoboku Sage Stone Monolith in village', type: 'build', targetKey: 'monolith', targetCount: 1 }
    ],
    rewards: { berries: 5000, chakra: 4500, reishi: 2200, heroXp: 2600, specialPerk: 'Senjutsu Sensory Field' }
  },
  {
    id: 'naruto_q23',
    questNumber: 23,
    arcName: 'The Six Paths of Pain Crisis',
    arcNumber: 4,
    title: 'The Leaf in Ruins: Six Paths Descend',
    japaneseKanji: '天道降臨! 神をも畏れぬ神羅天征',
    prologue: [
      { speaker: 'Pain (Deva Path)', avatar: '🪐', text: 'Feel pain. Contemplate pain. Accept pain. Know pain. Those who do not understand true pain can never understand true peace.', mood: 'angry' },
      { speaker: 'Tsunade', avatar: '💎', text: 'I am the Fifth Hokage! You have stepped on the treasure of my predecessors! Katsuyu, protect every villager!', mood: 'dramatic' },
      { speaker: 'Pain (Deva Path)', avatar: '🪐', text: 'ALMIGHTY PUSH: SHINRA TENSEI!! The entire village shatters into dust!', mood: 'dramatic' }
    ],
    epilogue: [
      { speaker: 'Sakura Haruno', avatar: '🌸', text: 'Konoha is gone... It’s just a giant crater... NARUTO!! PLEASE HURRY AND COME BACK!!', mood: 'sad' }
    ],
    tasks: [
      { id: 'q23_t1', description: 'Survive the Asura Path & Animal Path Shockwave Incursion', type: 'miniboss', targetKey: 'pain_incursion', targetCount: 1 }
    ],
    miniBoss: {
      name: 'Pain (Asura & Animal Paths)',
      title: 'God of the Hidden Rain / Akatsuki Leader',
      avatar: '🪐',
      hp: 6500,
      attack: 260,
      specialSkill: 'Summoning: Giant Cerberus & Missile Barrage'
    },
    rewards: { berries: 5500, chakra: 5000, reishi: 2500, heroXp: 3000, specialPerk: 'Emergency Katsuyu Slime Ward' }
  },
  {
    id: 'naruto_q24',
    questNumber: 24,
    arcName: 'The Six Paths of Pain Crisis',
    arcNumber: 4,
    title: 'The Despair Encounter: 3 Inevitable Defeats',
    japaneseKanji: '絶望の三重奏! 神羅天征の絶対的支配',
    prologue: [
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Where is the village?! Tsunade-baachan... where is everyone?!', mood: 'dramatic' },
      { speaker: 'Pain (Deva Path)', avatar: '🪐', text: 'You are looking at the price of your hypocrisy, Nine-Tails. No matter what jutsu you bring, you cannot overcome a god.', mood: 'angry' }
    ],
    epilogue: [
      { speaker: 'Pain (Deva Path)', avatar: '🪐', text: 'Three times you stood, and three times I have pinned your hands and feet with my black chakra receivers.', mood: 'normal' }
    ],
    tasks: [
      { id: 'q24_t1', description: 'Face Pain in the Scripted Despair Battle (Experience the 3-phase defeat)', type: 'special', targetCount: 3 }
    ],
    rewards: { berries: 6000, chakra: 6000, reishi: 3000, heroXp: 3500, specialPerk: 'Despair Catalyst' }
  },
  {
    id: 'naruto_q25',
    questNumber: 25,
    arcName: 'The Six Paths of Pain Crisis',
    arcNumber: 4,
    title: 'The Great Sacrifice & The Tale of Naruto Uzumaki',
    japaneseKanji: '最後の犠牲・仙法螺旋手裏剣と平和への誓い',
    prologue: [
      { speaker: 'Pain (Deva Path)', avatar: '🪐', text: 'Justice? You call revenge justice. Your teacher died for justice. You will die for justice.', mood: 'angry' },
      { speaker: 'Hinata Hyuga', avatar: '💜', text: 'I won’t let you touch him! Because... I love you, Naruto-kun! Twin Lion Fists!', mood: 'dramatic' },
      { speaker: 'Pain (Deva Path)', avatar: '🪐', text: 'Love breeds sacrifice... which breeds hatred. Shinra Tensei! (Strikes Hinata down)', mood: 'dramatic' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'HINATA!! (The Nine-Tails explodes in furious 8-Tailed despair until Minato halts the seal) I will find the answer to peace... By defeating you with all I have!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Nagato', avatar: '🌧️', text: 'I will believe in you, Naruto Uzumaki. Art of Rinne Rebirth! May all of Konoha rise from the ashes!', mood: 'sad' },
      { speaker: 'Konoha Villagers', avatar: '🎉', text: 'Naruto! The Hero of the Leaf! He saved us all!', mood: 'determined' },
      { speaker: 'Game Master', avatar: '👑', text: 'CHAPTER 1 COMPLETE! The Great Pirate Era Awaits: CHAPTER 2 (ONE PIECE: GRAND LINE) IS UNLOCKED!', mood: 'determined' }
    ],
    tasks: [
      { id: 'q25_t1', description: 'Defeat the Final Boss: Six Paths of Pain in the Awakening Climax', type: 'boss', targetKey: 'six_paths_pain', targetCount: 1 }
    ],
    miniBoss: {
      name: 'God Deva Path: Six Paths of Pain',
      title: 'Supreme Sovereign of the Rinnegan / Leader of Akatsuki',
      avatar: '🪐',
      hp: 12000,
      attack: 380,
      specialSkill: 'Super Shinra Tensei & Chibaku Tensei (Planetary Devastation)'
    },
    rewards: {
      berries: 15000,
      chakra: 12000,
      reishi: 6000,
      heroXp: 8000,
      unlockHeroId: 'minato',
      specialPerk: 'Hero of the Hidden Leaf (Unlocks Chapter 2: One Piece)'
    },
    isBossQuest: true
  }
];

// Evaluates actual in-game village state for slow & steady non-cheat progression
export function evaluateQuestTaskProgress(
  task: QuestTask,
  villageState: PlayerVillageState
): { current: number; target: number; isMet: boolean } {
  const target = task.targetCount;
  let current = 0;

  switch (task.type) {
    case 'build': {
      if (task.targetKey) {
        current = villageState.buildings.filter(
          (b) =>
            b.type === task.targetKey ||
            (task.targetKey === 'wall' && (b.type === 'defense_wall' || (b.type as string) === 'wall'))
        ).length;
      }
      break;
    }
    case 'upgrade': {
      if (task.targetKey === 'naruto') {
        current = villageState.heroLevels?.['naruto'] || 1;
      } else if (task.targetKey === 'hq') {
        current = villageState.level;
      } else if (task.targetKey === 'dojo') {
        const dojo = villageState.buildings.find((b) => (b.type as string) === 'dojo' || b.type === 'hero_altar');
        current = dojo ? dojo.level : 0;
      }
      break;
    }
    case 'train': {
      if (task.targetKey) {
        current = villageState.trainedTroops?.[task.targetKey] || 0;
      } else {
        current = Object.values(villageState.trainedTroops || {}).reduce((a, b) => a + b, 0);
      }
      break;
    }
    case 'special': {
      const desc = task.description.toLowerCase();
      if (desc.includes('chakra')) {
        current = villageState.chakra;
      } else if (desc.includes('patrol guard')) {
        current = villageState.activeHeroId ? 1 : 0;
      } else {
        current = target;
      }
      break;
    }
    case 'miniboss':
    case 'battle': {
      if (task.targetKey && villageState.defeatedMiniBosses?.includes(task.targetKey)) {
        current = target;
      } else if (task.targetKey) {
        current = 0;
      } else {
        current = target;
      }
      break;
    }
    case 'boss': {
      current = villageState.defeatedMiniBosses?.includes('six_paths_pain') ? 1 : 0;
      break;
    }
    default:
      current = 0;
  }

  return {
    current,
    target,
    isMet: current >= target
  };
}
