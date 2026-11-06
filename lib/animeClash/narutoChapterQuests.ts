// Anime Clash: Neo-Village Chronicles - Chapter 1: Naruto Uzumaki (Konohagakure Campaign)
// 25 Canonical Story Quests across 4 Iconic Arcs with Authentic Anime Intros, Harder Tasks & Free Audio

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

export interface AnimeEpisodeIntro {
  episodeNumber: number;
  subTitle: string;
  japaneseTitle: string;
  synopsis: string;
  dramaticQuote: string;
  speaker: string;
  speakerAvatar: string;
  cinematicStakes: string;
  soundCue?: 'taiko_impact' | 'shinra_tensei' | 'rasengan_wind' | 'sage_mode' | 'combat_fanfare';
}

export interface ChapterQuest {
  id: string;
  questNumber: number;
  arcName: string;
  arcNumber: 1 | 2 | 3 | 4;
  title: string;
  japaneseKanji: string;
  animeIntro: AnimeEpisodeIntro;
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
    japaneseKanji: '第１話 • 生か死か!? カカシの試練',
    animeIntro: {
      episodeNumber: 1,
      subTitle: 'The Bell Test: Pass or Fail',
      japaneseTitle: '第１話 • 生か死か!? カカシの試練',
      synopsis: 'Three freshly graduated Genin are dropped into the training grounds under Kakashi Hatake. There are only two bells for three ninja. Failure means immediate return to the Academy!',
      dramaticQuote: 'Come at me with the intent to kill. If you don’t, you won’t even touch one of these bells.',
      speaker: 'Kakashi Hatake',
      speakerAvatar: '🥷',
      cinematicStakes: 'Team 7’s entire ninja future hangs on this single trial. Selfishness guarantees expulsion; only true team coordination can overcome an elite Jonin.',
      soundCue: 'combat_fanfare'
    },
    prologue: [
      { speaker: 'Kakashi Hatake', avatar: '🥷', text: 'You three pass only if you can take one of these two bells from me before noon. Come at me with the intent to kill.', mood: 'normal' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Dattebayo! I am gonna take both bells and eat all the ramen at Ichiraku afterward!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Kakashi Hatake', avatar: '🥷', text: 'Those who break the rules are scum, but those who abandon their comrades are worse than scum. You all pass.', mood: 'determined' }
    ],
    tasks: [
      { id: 'q1_t1', description: 'Construct 1 Ninja Academy Training Ground in Konoha', type: 'build', targetKey: 'dojo', targetCount: 1 },
      { id: 'q1_t2', description: 'Train a squad of 5 Leaf Village Shinobi Genin', type: 'train', targetKey: 'shinobi', targetCount: 5 },
      { id: 'q1_t3', description: 'Accumulate at least 300 Chakra in your village reserve', type: 'special', targetCount: 300 }
    ],
    rewards: { berries: 350, chakra: 300, reishi: 50, heroXp: 180, specialPerk: 'Team 7 Bond Unlocked' }
  },
  {
    id: 'naruto_q2',
    questNumber: 2,
    arcName: 'The Way of the Shinobi',
    arcNumber: 1,
    title: 'Fortifying the Hidden Leaf Perimeter',
    japaneseKanji: '第２話 • 木ノ葉隠れの里・防壁強靭化',
    animeIntro: {
      episodeNumber: 2,
      subTitle: 'Perimeter Lockdown',
      japaneseTitle: '第２話 • 木ノ葉隠れの里・防壁強靭化',
      synopsis: 'Rogue ninja scouts have been spotted creeping near the Land of Fire borders. Lord Third Hokage issues an emergency directive to reinforce Konoha’s defensive perimeter with wooden palisades.',
      dramaticQuote: 'Peace is fragile, Naruto. The borders of the Land of Fire must be safeguarded with our Will of Fire.',
      speaker: 'Hiruzen Sarutobi (Lord Third)',
      speakerAvatar: '📜',
      cinematicStakes: 'Without outer walls, any enemy raid can strike directly at the Hokage Residence. The village must build a secure defense line.',
      soundCue: 'taiko_impact'
    },
    prologue: [
      { speaker: 'Lord Third (Hiruzen)', avatar: '📜', text: 'Peace is fragile, Naruto. The borders of the Land of Fire must be safeguarded against rogue ninja factions.', mood: 'normal' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Leave it to me Old Man Hokage! I will fortify our wooden wall perimeter so tight not even a fly slips in!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Iruka Umino', avatar: '📘', text: 'Incredible work, Naruto. The outer perimeter defenses are now solid.', mood: 'normal' }
    ],
    tasks: [
      { id: 'q2_t1', description: 'Construct 6 Leaf Palisade Walls around your Town Hall', type: 'build', targetKey: 'wall', targetCount: 6 },
      { id: 'q2_t2', description: 'Construct 1 Chakra Hydro-Turbine to fuel defenses', type: 'build', targetKey: 'chakra_turbine', targetCount: 1 },
      { id: 'q2_t3', description: 'Store at least 500 Chakra in your village reserve', type: 'special', targetCount: 500 }
    ],
    rewards: { berries: 450, chakra: 400, reishi: 80, heroXp: 220, unlockBuildingKey: 'wall' }
  },
  {
    id: 'naruto_q3',
    questNumber: 3,
    arcName: 'The Way of the Shinobi',
    arcNumber: 1,
    title: 'The Chakra Tree-Climbing Regimen',
    japaneseKanji: '第３話 • 木登り修業! チャクラの極意',
    animeIntro: {
      episodeNumber: 3,
      subTitle: 'Focusing the Life Energy',
      japaneseTitle: '第３話 • 木登り修業! チャクラの極意',
      synopsis: 'Before Team 7 can accept C-rank missions, Kakashi subjects Naruto and Sasuke to tree climbing without hands. If your chakra output wavers for a split second, you fall from dizzying heights!',
      dramaticQuote: 'Focus your chakra to the soles of your feet. Too little, you fall. Too much, you blow the bark away.',
      speaker: 'Kakashi Hatake',
      speakerAvatar: '🥷',
      cinematicStakes: 'Mastering tree climbing is essential for ninja survival. Naruto must push past his limits to keep pace with Sasuke’s natural genius.',
      soundCue: 'rasengan_wind'
    },
    prologue: [
      { speaker: 'Kakashi Hatake', avatar: '🥷', text: 'Focus your chakra to the soles of your feet. Too little, and you slip. Too much, and the bark splinters.', mood: 'normal' },
      { speaker: 'Sasuke Uchiha', avatar: '⚡', text: 'Tch. I will master this before you do, loser.', mood: 'angry' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Just watch me Sasuke! I will climb all the way to the top of the Hokage Monument!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Sakura Haruno', avatar: '🌸', text: 'Both of you actually reached the highest branches! Your stamina and chakra control doubled!', mood: 'determined' }
    ],
    tasks: [
      { id: 'q3_t1', description: 'Train a vanguard of 8 Leaf Shinobi Genin', type: 'train', targetKey: 'shinobi', targetCount: 8 },
      { id: 'q3_t2', description: 'Upgrade Naruto to Level 2 in your Heroes Dojo', type: 'upgrade', targetKey: 'naruto', targetCount: 2 },
      { id: 'q3_t3', description: 'Maintain at least 600 Chakra in your village reserve', type: 'special', targetCount: 600 }
    ],
    rewards: { berries: 550, chakra: 500, reishi: 120, heroXp: 260, specialPerk: 'Chakra Control +15% Speed' }
  },
  {
    id: 'naruto_q4',
    questNumber: 4,
    arcName: 'The Way of the Shinobi',
    arcNumber: 1,
    title: 'Escort Master Builder Tazuna',
    japaneseKanji: '第４話 • 達納の護衛任務・波の国へ',
    animeIntro: {
      episodeNumber: 4,
      subTitle: 'The Bridge of Hope',
      japaneseTitle: '第４話 • 達納の護衛任務・波の国へ',
      synopsis: 'Master Bridge Builder Tazuna has commissioned Team 7 to escort him home to the Land of Waves. What was supposed to be a simple C-rank escort mission hides deadly international assassins!',
      dramaticQuote: 'My bridge is the only hope to free the Land of Waves from Gato’s grip! Protect me until it is finished!',
      speaker: 'Master Tazuna',
      speakerAvatar: '🔨',
      cinematicStakes: 'Gato’s mercenary syndicate will stop at nothing to murder Tazuna. Team 7 enters hostile territory where genuine blood will be shed.',
      soundCue: 'combat_fanfare'
    },
    prologue: [
      { speaker: 'Tazuna', avatar: '🔨', text: 'My bridge is the only hope to free the Land of Waves from Gato’s grip! Protect me until it is finished!', mood: 'determined' },
      { speaker: 'Kakashi Hatake', avatar: '🥷', text: 'Stay alert Team 7. There are dangerous rogue ninja operating along the riverbanks.', mood: 'normal' }
    ],
    epilogue: [
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'I swear on this cut on my left hand: I will never run away or freeze in battle again!', mood: 'determined' }
    ],
    tasks: [
      { id: 'q4_t1', description: 'Construct 1 Paper-Bomb Mortar (Leaf Defense Artillery)', type: 'build', targetKey: 'paper_mortar', targetCount: 1 },
      { id: 'q4_t2', description: 'Train a defensive strike team of 10 Shinobi Genin', type: 'train', targetKey: 'shinobi', targetCount: 10 },
      { id: 'q4_t3', description: 'Gather at least 800 Berries for bridge expedition supplies', type: 'special', targetCount: 800 }
    ],
    rewards: { berries: 650, chakra: 550, reishi: 150, heroXp: 300 }
  },
  {
    id: 'naruto_q5',
    questNumber: 5,
    arcName: 'The Way of the Shinobi',
    arcNumber: 1,
    title: 'Ambush at the Mist Bridge: Demon Brothers',
    japaneseKanji: '第５話 • 霧の暗殺者・鬼兄弟の強襲',
    animeIntro: {
      episodeNumber: 5,
      subTitle: 'Poisoned Chains in the Mist',
      japaneseTitle: '第５話 • 霧の暗殺者・鬼兄弟の強襲',
      synopsis: 'Two puddles on a sunny day reveal the deadly Demon Brothers of the Hidden Mist! In a flash, their poisoned shuriken chains shred Kakashi into pieces — or did they?!',
      dramaticQuote: 'One down! Now to tear you brats to pieces with our poisoned chains!',
      speaker: 'Gouzu & Meizu (Demon Brothers)',
      speakerAvatar: '⛓️',
      cinematicStakes: 'Naruto freezes in sheer terror as steel chains whip through the air. He must conquer his fear or Tazuna will die before his eyes.',
      soundCue: 'taiko_impact'
    },
    prologue: [
      { speaker: 'Gouzu & Meizu', avatar: '⛓️', text: 'One down! Now to tear you brats to pieces with our poisoned chains!', mood: 'angry' },
      { speaker: 'Sasuke Uchiha', avatar: '⚡', text: 'Naruto, don’t stand there petrified! Move!', mood: 'dramatic' }
    ],
    epilogue: [
      { speaker: 'Kakashi Hatake', avatar: '🥷', text: 'Good recovery. You neutralized them before Tazuna took a scratch.', mood: 'normal' }
    ],
    tasks: [
      { id: 'q5_t1', description: 'Defeat the Demon Brothers in the Mist Ambush Skirmish', type: 'miniboss', targetKey: 'demon_brothers', targetCount: 1 },
      { id: 'q5_t2', description: 'Construct 1 Konoha Berry Vault to secure mission bounty', type: 'build', targetKey: 'berry_treasury', targetCount: 1 },
      { id: 'q5_t3', description: 'Upgrade Naruto to Level 3', type: 'upgrade', targetKey: 'naruto', targetCount: 3 }
    ],
    miniBoss: {
      name: 'Demon Brothers (Gouzu & Meizu)',
      title: 'Hidden Mist Chunin Assassins',
      avatar: '⛓️',
      hp: 2400,
      attack: 90,
      specialSkill: 'Poisoned Chain Sever'
    },
    rewards: { berries: 800, chakra: 700, reishi: 200, heroXp: 380, specialPerk: 'Chain Binding Defense' }
  },
  {
    id: 'naruto_q6',
    questNumber: 6,
    arcName: 'The Way of the Shinobi',
    arcNumber: 1,
    title: 'The Demon in the Mist: Zabuza Momochi',
    japaneseKanji: '第６話 • 霧隠れの鬼人・再不斬来襲',
    animeIntro: {
      episodeNumber: 6,
      subTitle: 'The Silent Killing Technique',
      japaneseTitle: '第６話 • 霧隠れの鬼人・再不斬来襲',
      synopsis: 'A gigantic Kubikiribocho cleaver impales into a tree trunk. Out of the mist steps Zabuza Momochi, one of the Seven Ninja Swordsmen of the Mist. Kakashi is forced to uncover his left eye!',
      dramaticQuote: 'Well well, Kakashi of the Sharingan eye. Playing babysitter to little genin? Your luck runs out here.',
      speaker: 'Zabuza Momochi',
      speakerAvatar: '🗡️',
      cinematicStakes: 'Kakashi is trapped in Zabuza’s Water Prison Jutsu. Unless Naruto and Sasuke combine forces in a daring shuriken gamble, their sensei will drown.',
      soundCue: 'combat_fanfare'
    },
    prologue: [
      { speaker: 'Zabuza Momochi', avatar: '🗡️', text: 'Well well, Kakashi of the Sharingan eye. Playing babysitter to little genin? Your luck runs out here.', mood: 'angry' },
      { speaker: 'Kakashi Hatake', avatar: '🥷', text: 'Manji formation! Protect Tazuna at all costs! I will handle the Kubikiribocho!', mood: 'dramatic' }
    ],
    epilogue: [
      { speaker: 'Zabuza Momochi', avatar: '🗡️', text: 'Impressive... but next time you see my mist, none of you will walk away alive.', mood: 'normal' }
    ],
    tasks: [
      { id: 'q6_t1', description: 'Survive Zabuza’s Water Prison Jutsu Skirmish', type: 'miniboss', targetKey: 'zabuza', targetCount: 1 },
      { id: 'q6_t2', description: 'Construct 2 Paper-Bomb Mortars for defensive crossfire', type: 'build', targetKey: 'paper_mortar', targetCount: 2 },
      { id: 'q6_t3', description: 'Maintain at least 1,000 Chakra in your village reserve', type: 'special', targetCount: 1000 }
    ],
    miniBoss: {
      name: 'Zabuza Momochi',
      title: 'The Demon of the Hidden Mist',
      avatar: '🗡️',
      hp: 3800,
      attack: 120,
      specialSkill: 'Water Dragon Jutsu & Silent Killing'
    },
    rewards: { berries: 1000, chakra: 900, reishi: 250, heroXp: 450, unlockBuildingKey: 'paper_mortar', unlockHeroId: 'sasuke', specialPerk: 'UNLOCK HERO: Sasuke Uchiha (Chidori & Fire Style)' }
  },
  {
    id: 'naruto_q7',
    questNumber: 7,
    arcName: 'The Way of the Shinobi',
    arcNumber: 1,
    title: 'Demonic Ice Mirrors & Haku’s Sacrifice',
    japaneseKanji: '第７話 • 氷晶の魔鏡・白の覚悟と涙',
    animeIntro: {
      episodeNumber: 7,
      subTitle: 'The Bridge of Tears',
      japaneseTitle: '第７話 • 氷晶の魔鏡・白の覚悟と涙',
      synopsis: 'Haku traps Naruto and Sasuke inside the impenetrable Crystal Ice Mirrors. Senbon needles rain down relentlessly. When Sasuke shields Naruto with his own body, the Nine-Tails red chakra unleashes!',
      dramaticQuote: 'Is it true that to become a true ninja, you must kill your own feelings? I cannot accept that nindo!',
      speaker: 'Naruto Uzumaki',
      speakerAvatar: '🍥',
      cinematicStakes: 'The climax of the Land of Waves arc. Blood stains the snow as two philosophies of the ninja world collide on the great bridge.',
      soundCue: 'taiko_impact'
    },
    prologue: [
      { speaker: 'Haku', avatar: '❄️', text: 'I am a tool for Zabuza-sama. That is my entire reason to exist. Demonic Ice Mirrors!', mood: 'sad' },
      { speaker: 'Sasuke Uchiha', avatar: '⚡', text: 'My body moved on its own, idiot... Don’t let your dream die here...', mood: 'dramatic' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'SASUKE!! (Nine-Tails red chakra roars) I will never forgive you for taking my friend!', mood: 'angry' }
    ],
    epilogue: [
      { speaker: 'Kakashi Hatake', avatar: '🥷', text: 'Snow is falling in the Land of Waves... Zabuza and Haku, may you walk side by side in the afterlife.', mood: 'sad' },
      { speaker: 'Tazuna', avatar: '🔨', text: 'This bridge will forever be named: The Great Naruto Bridge!', mood: 'determined' }
    ],
    tasks: [
      { id: 'q7_t1', description: 'Shatter the Demonic Ice Mirrors in the Land of Waves Climax Duel', type: 'battle', targetKey: 'land_of_waves_climax', targetCount: 1 },
      { id: 'q7_t2', description: 'Upgrade Naruto to Level 4 in the Heroes Dojo', type: 'upgrade', targetKey: 'naruto', targetCount: 4 },
      { id: 'q7_t3', description: 'Construct 8 Leaf Palisade Walls to fortify Konoha’s main entrance', type: 'build', targetKey: 'wall', targetCount: 8 }
    ],
    rewards: { berries: 1400, chakra: 1200, reishi: 400, heroXp: 600, specialPerk: 'Will of Fire Level 1' }
  },

  // ==========================================
  // ARC 2: CHUNIN EXAMS & INVASION (8-14)
  // ==========================================
  {
    id: 'naruto_q8',
    questNumber: 8,
    arcName: 'The Chunin Exam Ordeal',
    arcNumber: 2,
    title: 'The Written Exam: The Tenth Question',
    japaneseKanji: '第８話 • 中忍試験開幕! 恐怖の第10問',
    animeIntro: {
      episodeNumber: 8,
      subTitle: 'The Test of Deception',
      japaneseTitle: '第８話 • 中忍試験開幕! 恐怖の第10問',
      synopsis: 'Ninja from Sunagakure, Otogakure, and Kusagakure gather in Konoha. Proctor Ibiki Morino announces the sinister 10th Question: if you answer wrong, you are banned from taking the Chunin Exam forever!',
      dramaticQuote: 'Don’t underestimate me! I won’t run away! Even if I remain a Genin forever, I will still become Hokage!',
      speaker: 'Naruto Uzumaki',
      speakerAvatar: '🍥',
      cinematicStakes: 'The psychological gauntlet that breaks hundreds of ninja. Naruto slams his hand onto the desk, defying Ibiki’s intimidation.',
      soundCue: 'combat_fanfare'
    },
    prologue: [
      { speaker: 'Ibiki Morino', avatar: '👁️', text: 'Those who choose to answer and fail will remain Genin for the rest of their lives! Raise your hand if you quit!', mood: 'angry' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'I am not quitting! I don’t care if I am a Genin for life, I will become Hokage no matter what!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Anko Mitarashi', avatar: '🐍', text: 'Not bad brats! You survived Ibiki, but the Forest of Death will eat you alive!', mood: 'normal' }
    ],
    tasks: [
      { id: 'q8_t1', description: 'Upgrade your Ninja Academy (Store 1,200 Chakra)', type: 'special', targetCount: 1200 },
      { id: 'q8_t2', description: 'Train a squad of 12 Leaf Village Shinobi Troops', type: 'train', targetKey: 'shinobi', targetCount: 12 }
    ],
    rewards: { berries: 1600, chakra: 1400, reishi: 500, heroXp: 700 }
  },
  {
    id: 'naruto_q9',
    questNumber: 9,
    arcName: 'The Chunin Exam Ordeal',
    arcNumber: 2,
    title: 'The Forest of Death: Scroll Hunt',
    japaneseKanji: '第９話 • 死の森! 天地の巻物争奪戦',
    animeIntro: {
      episodeNumber: 9,
      subTitle: 'Survival in Zone 44',
      japaneseTitle: '第９話 • 死の森! 天地の巻物争奪戦',
      synopsis: 'Forty-four battle teams enter Zone 44 — the Forest of Death. Each squad possesses either a Heaven or Earth scroll. To survive, you must seize the matching scroll within 120 hours!',
      dramaticQuote: 'In this forest, the rules of civilized society cease to exist. Kill or be killed.',
      speaker: 'Anko Mitarashi',
      speakerAvatar: '🐍',
      cinematicStakes: 'Giant centipedes, poison leeches, and bloodthirsty rival teams lurk behind every massive redwood trunk.',
      soundCue: 'taiko_impact'
    },
    prologue: [
      { speaker: 'Anko Mitarashi', avatar: '🐍', text: 'Forty-four teams go in. Only those with both Heaven and Earth scrolls reach the central tower alive.', mood: 'normal' },
      { speaker: 'Sasuke Uchiha', avatar: '⚡', text: 'Stay in formation. Memorize the password: The ninja of the singing tree listens to the moon.', mood: 'normal' }
    ],
    epilogue: [
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Something massive is shaking the trees... That chakra feels freezing cold!', mood: 'dramatic' }
    ],
    tasks: [
      { id: 'q9_t1', description: 'Gather 1,500 Berries to fund emergency ration supplies', type: 'special', targetCount: 1500 },
      { id: 'q9_t2', description: 'Train 15 Leaf Shinobi Troops for forest reconnaissance', type: 'train', targetKey: 'shinobi', targetCount: 15 }
    ],
    rewards: { berries: 1800, chakra: 1500, reishi: 600, heroXp: 800 }
  },
  {
    id: 'naruto_q10',
    questNumber: 10,
    arcName: 'The Chunin Exam Ordeal',
    arcNumber: 2,
    title: 'Curse Mark of Orochimaru',
    japaneseKanji: '第10話 • 大蛇丸の呪印! 漆黒の牙',
    animeIntro: {
      episodeNumber: 10,
      subTitle: 'The Snake in the Shadow',
      japaneseTitle: '第10話 • 大蛇丸の呪印! 漆黒の牙',
      synopsis: 'The legendary Sannin Orochimaru infiltrates the Forest of Death disguised as a Grass Genin! He summons a colossal serpent that swallows Naruto whole while targeting Sasuke’s Sharingan!',
      dramaticQuote: 'Such delightful eyes, Sasuke. Let us see if your body can survive my gift...',
      speaker: 'Orochimaru',
      speakerAvatar: '🐍',
      cinematicStakes: 'Orochimaru burns the Heaven scroll and extends his neck, sinking his venomous fangs into Sasuke’s shoulder to plant the Cursed Seal of Heaven.',
      soundCue: 'taiko_impact'
    },
    prologue: [
      { speaker: 'Orochimaru', avatar: '🐍', text: 'Such delightful eyes, Sasuke. Let us see if your body can survive my gift...', mood: 'angry' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Hey, snake bastard! Get away from Sasuke! Nine-Tails red eyes flare!', mood: 'angry' }
    ],
    epilogue: [
      { speaker: 'Sakura Haruno', avatar: '🌸', text: 'Naruto was knocked unconscious, and Sasuke has this terrifying black mark... I have to protect them both!', mood: 'sad' }
    ],
    tasks: [
      { id: 'q10_t1', description: 'Survive the Giant Snake Summon Mini-Boss Encounter', type: 'miniboss', targetKey: 'giant_snake', targetCount: 1 },
      { id: 'q10_t2', description: 'Construct 2 Chakra Hydro-Turbines to replenish depleted reserves', type: 'build', targetKey: 'chakra_turbine', targetCount: 2 }
    ],
    miniBoss: {
      name: 'Orochimaru’s Giant Forest Serpent',
      title: 'Summoned Beast of the Sannin',
      avatar: '🐍',
      hp: 5000,
      attack: 160,
      specialSkill: 'Crushing Constriction & Toxic Breath'
    },
    rewards: { berries: 2200, chakra: 1800, reishi: 750, heroXp: 1000, specialPerk: 'Curse Resistance +20%' }
  },
  {
    id: 'naruto_q11',
    questNumber: 11,
    arcName: 'The Chunin Exam Ordeal',
    arcNumber: 2,
    title: 'Preliminaries: The Lotus of the Leaf',
    japaneseKanji: '第11話 • 木ノ葉の美しき蒼い野獣! 激突',
    animeIntro: {
      episodeNumber: 11,
      subTitle: 'Youth and Heavy Weights',
      japaneseTitle: '第11話 • 木ノ葉の美しき蒼い野獣! 激突',
      synopsis: 'Rock Lee faces the terrifying Gaara of the Sand in the Chunin Exam preliminaries. Might Guy gives the nod, and Lee drops his training weights — detonating shockwaves across the stone arena!',
      dramaticQuote: 'Guy-sensei! May I take them off now? The weights on my legs?!',
      speaker: 'Rock Lee',
      speakerAvatar: '🥋',
      cinematicStakes: 'The ultimate clash between pure hard work and natural-born genius. The Five Gates open as Lee moves faster than sound.',
      soundCue: 'combat_fanfare'
    },
    prologue: [
      { speaker: 'Rock Lee', avatar: '🥋', text: 'Guy-sensei! May I take them off now? The weights on my legs?!', mood: 'determined' },
      { speaker: 'Might Guy', avatar: '🔥', text: 'I allow it Lee! Show the world the power of youthful hard work!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Bushy Brows was incredible... Even against Gaara’s sand, he never backed down for a second!', mood: 'determined' }
    ],
    tasks: [
      { id: 'q11_t1', description: 'Construct 1 Ninja Academy Training Ground (Upgrade to Lv. 2)', type: 'upgrade', targetKey: 'dojo', targetCount: 2 },
      { id: 'q11_t2', description: 'Train 18 Leaf Shinobi Troops with high-speed taijutsu', type: 'train', targetKey: 'shinobi', targetCount: 18 }
    ],
    rewards: { berries: 2500, chakra: 2100, reishi: 900, heroXp: 1200 }
  },
  {
    id: 'naruto_q12',
    questNumber: 12,
    arcName: 'The Chunin Exam Ordeal',
    arcNumber: 2,
    title: 'Enter the Toad Sage: Jiraiya’s Summoning',
    japaneseKanji: '第12話 • 妙木山の蝦蟇仙人・口寄せの術',
    animeIntro: {
      episodeNumber: 12,
      subTitle: 'The Contract of Blood',
      japaneseTitle: '第12話 • 妙木山の蝦蟇仙人・口寄せの術',
      synopsis: 'Naruto meets the eccentric Legendary Sannin Jiraiya at the hot springs. Jiraiya unseals Orochimaru’s Five Pronged Seal and teaches Naruto how to tap into the Nine-Tails red chakra to summon toads!',
      dramaticQuote: 'Sign the parchment in your own blood! If you can’t summon a giant toad, you will smash onto the canyon rocks below!',
      speaker: 'Jiraiya (Toad Sage)',
      speakerAvatar: '🐸',
      cinematicStakes: 'Jiraiya hurls Naruto into a bottomless ravine. In mortal terror, Naruto contacts the Nine-Tails behind the iron bars and summons Gamabunta!',
      soundCue: 'rasengan_wind'
    },
    prologue: [
      { speaker: 'Jiraiya', avatar: '🐸', text: 'I am the mountain toad sage of Mount Myoboku! To summon toads, you must sign the scroll in your own blood!', mood: 'normal' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'You pushed me off a cliff Pervy Sage!! Kuchiyose no Jutsu!!', mood: 'dramatic' }
    ],
    epilogue: [
      { speaker: 'Gamabunta', avatar: '🚬', text: 'Who summoned me? A kid riding on my head? You’ve got guts, brat.', mood: 'normal' }
    ],
    tasks: [
      { id: 'q12_t1', description: 'Store at least 1,500 Chakra in your village reserve', type: 'special', targetCount: 1500 },
      { id: 'q12_t2', description: 'Upgrade Naruto to Level 5', type: 'upgrade', targetKey: 'naruto', targetCount: 5 }
    ],
    rewards: { berries: 2800, chakra: 2400, reishi: 1100, heroXp: 1400, specialPerk: 'Summoning Mastery +25%' }
  },
  {
    id: 'naruto_q13',
    questNumber: 13,
    arcName: 'The Chunin Exam Ordeal',
    arcNumber: 2,
    title: 'Destiny vs Will: The Byakugan Duel',
    japaneseKanji: '第13話 • 白眼の天才・運命への反逆',
    animeIntro: {
      episodeNumber: 13,
      subTitle: 'Breaking the Birdcage',
      japaneseTitle: '第13話 • 白眼の天才・運命への反逆',
      synopsis: 'Naruto steps into the main Chunin Exam stadium to face the Hyuga prodigy Neji. Neji proclaims that once a loser, always a loser — that destiny is carved in stone!',
      dramaticQuote: 'A failure will always be a failure. You cannot change your destiny!',
      speaker: 'Neji Hyuga',
      speakerAvatar: '🥋',
      cinematicStakes: 'Neji shuts down all 64 of Naruto’s tenketsu with Gentle Fist. Naruto digs his fingers into the dirt and channels Nine-Tails fury from underground!',
      soundCue: 'taiko_impact'
    },
    prologue: [
      { speaker: 'Neji Hyuga', avatar: '🥋', text: 'People cannot change. A loser will always be a loser. That is the unalterable destiny of mankind.', mood: 'normal' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Shut your mouth about destiny! I will change your fate by beating you into the dirt!', mood: 'angry' }
    ],
    epilogue: [
      { speaker: 'Neji Hyuga', avatar: '🥋', text: 'A shadow clone from beneath the earth... Birds fly freely in the sky. Perhaps destiny is not fixed after all.', mood: 'determined' }
    ],
    tasks: [
      { id: 'q13_t1', description: 'Defeat Neji Hyuga in the Arena Preliminaries', type: 'miniboss', targetKey: 'neji', targetCount: 1 },
      { id: 'q13_t2', description: 'Train a battalion of 20 Leaf Shinobi Troops', type: 'train', targetKey: 'shinobi', targetCount: 20 }
    ],
    miniBoss: {
      name: 'Neji Hyuga (Byakugan Prodigy)',
      title: 'Genius of the Gentle Fist',
      avatar: '🥋',
      hp: 5800,
      attack: 190,
      specialSkill: '8 Trigrams 64 Palms & Rotation'
    },
    rewards: { berries: 3200, chakra: 2800, reishi: 1300, heroXp: 1600, unlockHeroId: 'kakashi', specialPerk: 'UNLOCK HERO: Kakashi Hatake (Copy Ninja / Sharingan)' }
  },
  {
    id: 'naruto_q14',
    questNumber: 14,
    arcName: 'The Chunin Exam Ordeal',
    arcNumber: 2,
    title: 'Konoha Crush: The Sand Spirit Shukaku',
    japaneseKanji: '第14話 • 木ノ葉崩し! 一尾守鶴覚醒',
    animeIntro: {
      episodeNumber: 14,
      subTitle: 'The Monster in the Sand',
      japaneseTitle: '第14話 • 木ノ葉崩し! 一尾守鶴覚醒',
      synopsis: 'Feathers fall from the sky as Genjutsu blankets the stadium! Sound and Sand ninja launch the Konoha Crush invasion. In the forest, Gaara transforms into the towering One-Tailed Shukaku!',
      dramaticQuote: 'Blood! I must feed mother blood to prove my existence! Sand Burial!',
      speaker: 'Gaara of the Desert',
      speakerAvatar: '⏳',
      cinematicStakes: 'Sakura is pinned against a tree by crushing sand. Naruto and Gamabunta transform into the Nine-Tailed Fox to headbutt Gaara awake!',
      soundCue: 'taiko_impact'
    },
    prologue: [
      { speaker: 'Gaara', avatar: '⏳', text: 'I exist only to kill everyone other than myself! Sand Tsunami!', mood: 'angry' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Gamabunta! We have to transform into something with claws and teeth! Combined Transformation Jutsu!', mood: 'dramatic' }
    ],
    epilogue: [
      { speaker: 'Gaara', avatar: '⏳', text: 'Why are you so strong? You were just as alone as I was... Love for others gives you strength?', mood: 'sad' },
      { speaker: 'Lord Third', avatar: '📜', text: 'When the tree leaves dance, one shall find flames... The Third Hokage seals Orochimaru’s arms and passes away with a smile.', mood: 'sad' }
    ],
    tasks: [
      { id: 'q14_t1', description: 'Clash with Shukaku One-Tail Avatar and subdue Gaara', type: 'miniboss', targetKey: 'gaara_shukaku', targetCount: 1 },
      { id: 'q14_t2', description: 'Repair damaged Konoha village walls (Build 10 Leaf Palisade Walls)', type: 'build', targetKey: 'wall', targetCount: 10 },
      { id: 'q14_t3', description: 'Store at least 2,500 Chakra in your village reserve', type: 'special', targetCount: 2500 }
    ],
    miniBoss: {
      name: 'Gaara (Half-Shukaku Transformation)',
      title: 'Jinchuriki of the One-Tail Sand Spirit',
      avatar: '⏳',
      hp: 7500,
      attack: 230,
      specialSkill: 'Sand Tsunami & Wind Bullet Barrage'
    },
    rewards: { berries: 3800, chakra: 3400, reishi: 1600, heroXp: 2000, specialPerk: 'Sand Armor Shield' }
  },

  // ==========================================
  // ARC 3: SANNIN SEARCH & RASENGAN (15-20)
  // ==========================================
  {
    id: 'naruto_q15',
    questNumber: 15,
    arcName: 'The Search for the Fifth Hokage',
    arcNumber: 3,
    title: 'The Search Begins: Finding Lady Tsunade',
    japaneseKanji: '第15話 • 伝説の三忍! 綱手捜索行',
    animeIntro: {
      episodeNumber: 15,
      subTitle: 'The Gambler of Legend',
      japaneseTitle: '第15話 • 伝説の三忍! 綱手捜索行',
      synopsis: 'Following the death of the Third Hokage, Jiraiya and Naruto embark on a journey across the Land of Fire to locate the legendary medical ninja and granddaughter of the First Hokage: Lady Tsunade.',
      dramaticQuote: 'Only Tsunade has the medical ninjutsu to heal Sasuke and Kakashi, and the strength to lead Konoha as the Fifth Hokage.',
      speaker: 'Jiraiya',
      speakerAvatar: '🐸',
      cinematicStakes: 'Konoha has lost its Hokage. Enemy nations are watching for weakness. Tsunade must be convinced to accept the mantle.',
      soundCue: 'combat_fanfare'
    },
    prologue: [
      { speaker: 'Jiraiya', avatar: '🐸', text: 'Tsunade is notorious for gambling and losing. We will search every casino town in the prefecture!', mood: 'normal' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Is this old lady really that strong? She better heal Bushy Brows and Sasuke when we find her!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Jiraiya', avatar: '🐸', text: 'Before we find her, it’s time I taught you the jutsu invented by the Fourth Hokage.', mood: 'normal' }
    ],
    tasks: [
      { id: 'q15_t1', description: 'Accumulate 3,000 Berries for town expedition funds', type: 'special', targetCount: 3000 },
      { id: 'q15_t2', description: 'Train a patrol force of 22 Shinobi Troops', type: 'train', targetKey: 'shinobi', targetCount: 22 }
    ],
    rewards: { berries: 4200, chakra: 3600, reishi: 1800, heroXp: 2200 }
  },
  {
    id: 'naruto_q16',
    questNumber: 16,
    arcName: 'The Search for the Fifth Hokage',
    arcNumber: 3,
    title: 'Red Moon Tsukuyomi: Itachi Uchiha Returns',
    japaneseKanji: '第16話 • 赤き満月! イタチの月読',
    animeIntro: {
      episodeNumber: 16,
      subTitle: 'The Nightmare of 72 Hours',
      japaneseTitle: '第16話 • 赤き満月! イタチの月読',
      synopsis: 'Black cloaks with red clouds materialize in the inn hallway. Itachi Uchiha and Kisame Hoshigaki corner Naruto to extract the Nine-Tails! Sasuke rushes in with Chidori, blinded by vengeful rage!',
      dramaticQuote: 'You lack hatred, Sasuke. And you are weak.',
      speaker: 'Itachi Uchiha',
      speakerAvatar: '👁️',
      cinematicStakes: 'Itachi’s Tsukuyomi traps Sasuke in an endless 72-hour illusion of his clan’s massacre. Jiraiya summons the Toad Mouth Trap just in time.',
      soundCue: 'taiko_impact'
    },
    prologue: [
      { speaker: 'Itachi Uchiha', avatar: '👁️', text: 'Naruto Uzumaki, you will come with us. The Akatsuki has need of the Nine-Tails.', mood: 'normal' },
      { speaker: 'Sasuke Uchiha', avatar: '⚡', text: 'ITACHI!! I lived for this day! Chidori!', mood: 'angry' },
      { speaker: 'Itachi Uchiha', avatar: '👁️', text: 'Tsukuyomi. (Sasuke collapses screaming in traumatic darkness)', mood: 'normal' }
    ],
    epilogue: [
      { speaker: 'Jiraiya', avatar: '🐸', text: 'They escaped through the toad stomach with black flames... The Akatsuki’s eyes are on you, Naruto.', mood: 'dramatic' }
    ],
    tasks: [
      { id: 'q16_t1', description: 'Survive the Akatsuki Vanguard Infiltration Skirmish', type: 'miniboss', targetKey: 'itachi_kisame', targetCount: 1 },
      { id: 'q16_t2', description: 'Construct 3 Paper-Bomb Mortars for village perimeter security', type: 'build', targetKey: 'paper_mortar', targetCount: 3 }
    ],
    miniBoss: {
      name: 'Itachi & Kisame (Akatsuki Vanguard)',
      title: 'S-Rank Rogue Ninja Duo',
      avatar: '👁️',
      hp: 8500,
      attack: 260,
      specialSkill: 'Tsukuyomi & Samehada Water Wave'
    },
    rewards: { berries: 4800, chakra: 4000, reishi: 2000, heroXp: 2600 }
  },
  {
    id: 'naruto_q17',
    questNumber: 17,
    arcName: 'The Search for the Fifth Hokage',
    arcNumber: 3,
    title: 'The 3-Stage Rasengan Mastery',
    japaneseKanji: '第17話 • 螺旋丸修業! 回転・威力・維持',
    animeIntro: {
      episodeNumber: 17,
      subTitle: 'The Sphere of Whirling Chakra',
      japaneseTitle: '第17話 • 螺旋丸修業! 回転・威力・維持',
      synopsis: 'Stage 1: Bursting a water balloon with swirling chakra. Stage 2: Popping a dense rubber ball with explosive density. Stage 3: Compressing the sphere without letting it disperse!',
      dramaticQuote: 'Stage 1: Rotation. Stage 2: Power. Stage 3: Containment. Pop the balloon without popping your own chakra points!',
      speaker: 'Jiraiya',
      speakerAvatar: '🐸',
      cinematicStakes: 'Naruto makes a bet with Tsunade: if he masters the Rasengan in one week, she will give him the First Hokage’s cursed necklace and become the Fifth Hokage.',
      soundCue: 'rasengan_wind'
    },
    prologue: [
      { speaker: 'Jiraiya', avatar: '🐸', text: 'Stage 1: Rotation. Stage 2: Power. Stage 3: Containment. Pop the water balloon without popping your own chakra points!', mood: 'normal' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'My hands are bleeding and blistered... but I promised Tsunade I’d master it in 3 days for her necklace!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Tsunade', avatar: '🍶', text: 'He actually held a shadow clone to stabilize the sphere... The kid really created a genuine Rasengan!', mood: 'determined' }
    ],
    tasks: [
      { id: 'q17_t1', description: 'Store at least 2,500 Chakra in the Rasengan Rotation Training Sphere', type: 'special', targetCount: 2500 },
      { id: 'q17_t2', description: 'Upgrade Naruto to Level 6', type: 'upgrade', targetKey: 'naruto', targetCount: 6 },
      { id: 'q17_t3', description: 'Train 25 Leaf Shinobi Troops', type: 'train', targetKey: 'shinobi', targetCount: 25 }
    ],
    rewards: { berries: 5200, chakra: 4500, reishi: 2200, heroXp: 2900, specialPerk: 'Rasengan Technique Unlocked' }
  },
  {
    id: 'naruto_q18',
    questNumber: 18,
    arcName: 'The Search for the Fifth Hokage',
    arcNumber: 3,
    title: 'Three-Way Deadlock: Sannin Clash',
    japaneseKanji: '第18話 • 三すくみの戦い! 大蛇・蝦蟇・蛞蝓',
    animeIntro: {
      episodeNumber: 18,
      subTitle: 'The Giants Awaken',
      japaneseTitle: '第18話 • 三すくみの戦い! 大蛇・蝦蟇・蛞蝓',
      synopsis: 'On the Plains of Tanzaku, three titanic summoning beasts collide! Orochimaru summons Manda, Jiraiya summons Gamabunta, and Tsunade summons Katsuyu. Naruto charges Orochimaru’s heart with Rasengan!',
      dramaticQuote: 'I am the granddaughter of Hashirama Senju, and from this day forth... I am the Fifth Hokage of Konoha!',
      speaker: 'Lady Tsunade (Fifth Hokage)',
      speakerAvatar: '🍶',
      cinematicStakes: 'Tsunade overcomes her hemophobia to protect Naruto’s life. With a monstrous punch, she shatters the earth and drives Orochimaru into retreat.',
      soundCue: 'combat_fanfare'
    },
    prologue: [
      { speaker: 'Orochimaru', avatar: '🐍', text: 'Kill me if you can, Tsunade! Manda will crush both of you!', mood: 'angry' },
      { speaker: 'Tsunade', avatar: '🍶', text: 'I am the granddaughter of Hashirama Senju, and from this day forth... I am the Fifth Hokage of Konoha!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Tsunade-baachan! Put on the Hokage hat! Leaf Village is waiting for our Fifth Hokage!', mood: 'determined' }
    ],
    tasks: [
      { id: 'q18_t1', description: 'Defeat Orochimaru & Kabuto in the Three-Way Deadlock', type: 'battle', targetCount: 1 },
      { id: 'q18_t2', description: 'Construct 1 Ninja Academy Training Ground (Upgrade to Lv. 3)', type: 'upgrade', targetKey: 'dojo', targetCount: 3 },
      { id: 'q18_t3', description: 'Store at least 3,500 Chakra in reserves', type: 'special', targetCount: 3500 }
    ],
    rewards: { berries: 5800, chakra: 5000, reishi: 2500, heroXp: 3300, unlockHeroId: 'jiraiya', specialPerk: 'UNLOCK HERO: Jiraiya the Toad Sage (Ultra-Big Ball Rasengan)' }
  },
  {
    id: 'naruto_q19',
    questNumber: 19,
    arcName: 'The Search for the Fifth Hokage',
    arcNumber: 3,
    title: 'Valley of the End: Severing the Bonds',
    japaneseKanji: '第19話 • 終末の谷! 涙の雨と千鳥の咆哮',
    animeIntro: {
      episodeNumber: 19,
      subTitle: 'The Tears of the Two Sovereigns',
      japaneseTitle: '第19話 • 終末の谷! 涙の雨と千鳥の咆哮',
      synopsis: 'At the boundary of the Land of Fire, standing atop the statues of Madara Uchiha and Hashirama Senju, Naruto and Sasuke fight in torrential rain. Black Chidori meets Vermilion Rasengan!',
      dramaticQuote: 'Naruto... you were my closest friend. That is why... you must die by my Chidori!',
      speaker: 'Sasuke Uchiha',
      speakerAvatar: '⚡',
      cinematicStakes: 'The tragic parting of brothers in arms. Sasuke chooses darkness to gain power, while Naruto resolves to spend his life bringing Sasuke home.',
      soundCue: 'taiko_impact'
    },
    prologue: [
      { speaker: 'Sasuke Uchiha', avatar: '⚡', text: 'Naruto... you were my closest friend. That is why... you must die by my Chidori!', mood: 'angry' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Even if I have to break all your bones, I will drag you back home to Konoha, Sasuke!', mood: 'dramatic' }
    ],
    epilogue: [
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'I couldn’t bring him back... But I will never give up. I will train with Jiraiya until I am strong enough to save my friend.', mood: 'sad' },
      { speaker: 'Kakashi Hatake', avatar: '🥷', text: 'Rest now Naruto. The journey has only just begun.', mood: 'sad' }
    ],
    tasks: [
      { id: 'q19_t1', description: 'Endure the Curse Mark Level 2 Chidori vs Vermilion Rasengan Clash', type: 'miniboss', targetKey: 'curse_sasuke', targetCount: 1 },
      { id: 'q19_t2', description: 'Train a standing guard of 28 Shinobi Troops', type: 'train', targetKey: 'shinobi', targetCount: 28 },
      { id: 'q19_t3', description: 'Upgrade Naruto to Level 7', type: 'upgrade', targetKey: 'naruto', targetCount: 7 }
    ],
    miniBoss: {
      name: 'Curse Mark Level 2 Sasuke',
      title: 'Avenger of the Uchiha Clan',
      avatar: '⚡',
      hp: 10000,
      attack: 300,
      specialSkill: 'Flapping Wing Chidori & Dragon Fire Jutsu'
    },
    rewards: { berries: 6500, chakra: 5500, reishi: 2800, heroXp: 3800, specialPerk: 'Uchiha Rivalry Resolve' }
  },
  {
    id: 'naruto_q20',
    questNumber: 20,
    arcName: 'The Search for the Fifth Hokage',
    arcNumber: 3,
    title: 'Return to Konoha: Wind Style Rasenshuriken',
    japaneseKanji: '第20話 • 新術開発! 風遁・螺旋手裏剣',
    animeIntro: {
      episodeNumber: 20,
      subTitle: 'Cutting at the Cellular Level',
      japaneseTitle: '第20話 • 新術開発! 風遁・螺旋手裏剣',
      synopsis: 'Three years of training pass. Naruto infuses Wind nature transformation into the Rasengan, creating millions of microscopic chakra blades that emit a high-pitched shrieking vortex!',
      dramaticQuote: 'Cutting through waterfalls with shadow clones! A jutsu that even the Fourth Hokage could not complete!',
      speaker: 'Kakashi Hatake',
      speakerAvatar: '🥷',
      cinematicStakes: 'The Rasenshuriken pierces the sound barrier. Kakashi confirms Naruto has finally surpassed the Fourth Hokage.',
      soundCue: 'rasengan_wind'
    },
    prologue: [
      { speaker: 'Kakashi Hatake', avatar: '🥷', text: 'Shape transformation combined with nature transformation. The Fourth Hokage couldn’t finish this jutsu. Only you can, Naruto.', mood: 'normal' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Wind Style: Rasenshuriken!! Listen to this wind scream!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Tsunade', avatar: '🍶', text: 'The cellular damage to Kakuzu was absolute... Naruto has developed an S-rank forbidden jutsu.', mood: 'determined' }
    ],
    tasks: [
      { id: 'q20_t1', description: 'Construct 2 Chakra Barrier Sealing Towers', type: 'build', targetKey: 'cannon', targetCount: 2 },
      { id: 'q20_t2', description: 'Train a vanguard of 30 Elite Chunin Defenders', type: 'train', targetKey: 'shinobi', targetCount: 30 },
      { id: 'q20_t3', description: 'Store at least 4,500 Chakra in village reserves', type: 'special', targetCount: 4500 }
    ],
    rewards: { berries: 7000, chakra: 6000, reishi: 3000, heroXp: 4200, unlockHeroId: 'tsunade', specialPerk: 'UNLOCK HERO: Lady Tsunade (5th Hokage / Heavenly Foot of Pain)' }
  },

  // ==========================================
  // ARC 4: PAIN INVASION & SAGE SACRIFICE (21-25)
  // ==========================================
  {
    id: 'naruto_q21',
    questNumber: 21,
    arcName: 'The Six Paths of Pain Crisis',
    arcNumber: 4,
    title: 'The Tale of Jiraiya the Gallant',
    japaneseKanji: '第21話 • 自来也豪傑物語・雨隠れの散華',
    animeIntro: {
      episodeNumber: 21,
      subTitle: 'The Gallant End',
      japaneseTitle: '第21話 • 自来也豪傑物語・雨隠れの散華',
      synopsis: 'Deep in the Hidden Rain Village, Jiraiya discovers the leader of the Akatsuki: his former students, the Six Paths of Pain. With his throat crushed and his body sinking into the dark ocean, he carves a coded message onto Pa’s back.',
      dramaticQuote: 'The true measure of a shinobi is not how he lives, but how he dies... The tale of Jiraiya the Gallant. Now it ends a bit better, I hope.',
      speaker: 'Jiraiya (The Gallant)',
      speakerAvatar: '🐸',
      cinematicStakes: 'The death of the beloved mentor. Naruto sits on a bench under the streetlamp holding a melting popsicle in heartbreaking silence.',
      soundCue: 'taiko_impact'
    },
    prologue: [
      { speaker: 'Fukasaku (Pa Toad)', avatar: '🐸', text: 'Naruto boy... Jiraiya-chan has fallen in battle against Pain. He died protecting the secret of the Rinnegan.', mood: 'sad' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'If Pervy Sage had become the Fifth Hokage... he never would have let you go on that mission alone, Tsunade-baachan!', mood: 'sad' }
    ],
    epilogue: [
      { speaker: 'Iruka Umino', avatar: '📘', text: 'Lord Jiraiya always praised you, Naruto. He believed you would inherit his dream of true peace.', mood: 'sad' }
    ],
    tasks: [
      { id: 'q21_t1', description: 'Pay respects to Jiraiya: Store 5,000 Chakra in memory of the Gallant', type: 'special', targetCount: 5000 },
      { id: 'q21_t2', description: 'Upgrade Naruto to Level 8', type: 'upgrade', targetKey: 'naruto', targetCount: 8 }
    ],
    rewards: { berries: 7500, chakra: 6500, reishi: 3200, heroXp: 4600, specialPerk: 'Jiraiya’s Nindo Will' }
  },
  {
    id: 'naruto_q22',
    questNumber: 22,
    arcName: 'The Six Paths of Pain Crisis',
    arcNumber: 4,
    title: 'Mount Myoboku: Natural Senjutsu Training',
    japaneseKanji: '第22話 • 妙木山の仙術修業! 自然の力',
    animeIntro: {
      episodeNumber: 22,
      subTitle: 'The Eyes of the Toad Sage',
      japaneseTitle: '第22話 • 妙木山の仙術修業! 自然の力',
      synopsis: 'Naruto travels to Mount Myoboku to learn Sage Mode from Lord Fukasaku. Sitting atop high needle peaks, he must remain motionless to blend spiritual energy, physical energy, and natural energy in perfect balance!',
      dramaticQuote: 'Become one with nature. If the balance tips, you turn to stone forever!',
      speaker: 'Lord Fukasaku',
      speakerAvatar: '🐸',
      cinematicStakes: 'Stone statues of failed trainees litter the mountaintop. Naruto must master in days what took Jiraiya decades.',
      soundCue: 'sage_mode'
    },
    prologue: [
      { speaker: 'Fukasaku (Pa Toad)', avatar: '🐸', text: 'Balance your chakra with the natural energy of the earth and atmosphere. If you absorb too much, you become a stone toad forever!', mood: 'normal' },
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Orange pigmentation around the eyes... Frog Kumite! I can sense the natural energy flowing through every blade of grass!', mood: 'determined' }
    ],
    epilogue: [
      { speaker: 'Fukasaku (Pa Toad)', avatar: '🐸', text: 'He surpassed Jiraiya-chan’s Sage Mode completely... Look at his eyes: perfect horizontal bars with zero toad features!', mood: 'determined' }
    ],
    tasks: [
      { id: 'q22_t1', description: 'Balance Senjutsu: Store at least 6,000 Chakra in village reserves', type: 'special', targetCount: 6000 },
      { id: 'q22_t2', description: 'Construct 1 Sage Training Monolith in Konoha', type: 'build', targetKey: 'hero_altar', targetCount: 1 },
      { id: 'q22_t3', description: 'Train 32 Leaf Shinobi Troops', type: 'train', targetKey: 'shinobi', targetCount: 32 }
    ],
    rewards: { berries: 8000, chakra: 7000, reishi: 3500, heroXp: 5000, specialPerk: 'Sage Mode Awakened' }
  },
  {
    id: 'naruto_q23',
    questNumber: 23,
    arcName: 'The Six Paths of Pain Crisis',
    arcNumber: 4,
    title: 'The Rain of Destruction: Pain Invades Konoha',
    japaneseKanji: '第23話 • 破壊の雨! 六道ペイン襲来',
    animeIntro: {
      episodeNumber: 23,
      subTitle: 'The Almighty Cataclysm',
      japaneseTitle: '第23話 • 破壊の雨! 六道ペイン襲来',
      synopsis: 'Six figures in Akatsuki cloaks float down through the cloud barrier. The Asura, Animal, and Deva paths detonate explosions across the village hospitals and administration cores!',
      dramaticQuote: 'Know pain. Contemplate pain. Accept pain. Those who do not know pain can never understand true peace.',
      speaker: 'Pain (Deva Path)',
      speakerAvatar: '🪐',
      cinematicStakes: 'The Hidden Leaf Village is burning. Kakashi Hatake uses his last drop of chakra to save Choji and dies beneath the rubble.',
      soundCue: 'shinra_tensei'
    },
    prologue: [
      { speaker: 'Pain (Deva Path)', avatar: '🪐', text: 'Know pain. Contemplate pain. Accept pain. Those who do not know pain can never understand true peace.', mood: 'angry' },
      { speaker: 'Kakashi Hatake', avatar: '🥷', text: 'Kamui! (Uses his last chakra to teleport the nail and save Choji) Obito... Rin... my time is finally here.', mood: 'sad' },
      { speaker: 'Lady Tsunade', avatar: '🍶', text: 'Katsuyu! Cover every single villager in Konoha! Release the Mitotic Regeneration Seal!', mood: 'dramatic' }
    ],
    epilogue: [
      { speaker: 'Sakura Haruno', avatar: '🌸', text: 'The entire village is gone in a single shockwave... NARUTO, PLEASE COME BACK!!', mood: 'dramatic' }
    ],
    tasks: [
      { id: 'q23_t1', description: 'Survive the Asura Path & Animal Path Shockwave Incursion', type: 'miniboss', targetKey: 'pain_incursion', targetCount: 1 },
      { id: 'q23_t2', description: 'Construct 12 Leaf Palisade Walls to barricade the crater border', type: 'build', targetKey: 'wall', targetCount: 12 },
      { id: 'q23_t3', description: 'Train a desperate defense force of 35 Shinobi Troops', type: 'train', targetKey: 'shinobi', targetCount: 35 }
    ],
    miniBoss: {
      name: 'Pain (Asura & Animal Paths)',
      title: 'God of the Hidden Rain / Akatsuki Leader',
      avatar: '🪐',
      hp: 12000,
      attack: 320,
      specialSkill: 'Multiple Missile Launcher & Giant Cerberus'
    },
    rewards: { berries: 9000, chakra: 8000, reishi: 4000, heroXp: 5500 }
  },
  {
    id: 'naruto_q24',
    questNumber: 24,
    arcName: 'The Six Paths of Pain Crisis',
    arcNumber: 4,
    title: 'The Despair Encounter: 3 Inevitable Defeats',
    japaneseKanji: '第24話 • 絶望の三重奏! 神羅天征の絶対的支配',
    animeIntro: {
      episodeNumber: 24,
      subTitle: 'Three Crushing Defeats',
      japaneseTitle: '第24話 • 絶望の三重奏! 神羅天征の絶対的支配',
      synopsis: 'Naruto appears on Gamabunta’s head in Sage Mode! But Deva Path Pain unleashes the full gravity power of the Rinnegan. Three times Naruto charges, and three times he is brutally pinned to the stone earth!',
      dramaticQuote: 'Do you understand pain a little now? You cannot defeat a god who commands the heavens.',
      speaker: 'Pain (Deva Path)',
      speakerAvatar: '🪐',
      cinematicStakes: 'The scripted despair encounter. Black receivers impale Naruto’s palms into the stone. Total helplessness grips the battlefield.',
      soundCue: 'shinra_tensei'
    },
    prologue: [
      { speaker: 'Naruto Uzumaki', avatar: '🍥', text: 'Where is the village?! Tsunade-baachan... where is everyone?!', mood: 'dramatic' },
      { speaker: 'Pain (Deva Path)', avatar: '🪐', text: 'You are looking at the price of your hypocrisy, Nine-Tails. No matter what jutsu you bring, you cannot overcome a god.', mood: 'angry' }
    ],
    epilogue: [
      { speaker: 'Pain (Deva Path)', avatar: '🪐', text: 'Three times you stood, and three times I have pinned your hands and feet with my black chakra receivers.', mood: 'normal' }
    ],
    tasks: [
      { id: 'q24_t1', description: 'Endure Pain in the Scripted Despair Battle (Experience the 3-phase defeat)', type: 'special', targetCount: 3 }
    ],
    rewards: { berries: 10000, chakra: 9000, reishi: 4500, heroXp: 6000, specialPerk: 'Despair Catalyst' }
  },
  {
    id: 'naruto_q25',
    questNumber: 25,
    arcName: 'The Six Paths of Pain Crisis',
    arcNumber: 4,
    title: 'The Great Sacrifice & The Climax of Sage Revenge',
    japaneseKanji: '第25話 • 最後の犠牲! 仙法螺旋手裏剣と平和への誓い',
    animeIntro: {
      episodeNumber: 25,
      subTitle: 'The Will of Fire Ascendant',
      japaneseTitle: '第25話 • 最後の犠牲! 仙法螺旋手裏剣と平和への誓い',
      synopsis: 'Hinata steps forward to defend the pinned Naruto, confessing her love before Pain strikes her down! The Nine-Tails explodes into an 8-tailed apocalypse until Minato repairs the seal. Naruto re-awakens in Sage Mode for the ultimate revenge climax!',
      dramaticQuote: 'I won’t let you touch him! Because... I love you, Naruto-kun! Twin Lion Fists!',
      speaker: 'Hinata Hyuga & Naruto Uzumaki',
      speakerAvatar: '💜',
      cinematicStakes: 'The final boss battle of Chapter 1. Win this battle to liberate Konoha, resurrect the fallen with Rinne Rebirth, and unlock Chapter 2: One Piece (Pirate Archipelago)!',
      soundCue: 'shinra_tensei'
    },
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
      hp: 15000,
      attack: 420,
      specialSkill: 'Super Shinra Tensei & Chibaku Tensei (Planetary Devastation)'
    },
    rewards: {
      berries: 20000,
      chakra: 15000,
      reishi: 8000,
      heroXp: 10000,
      unlockHeroId: 'minato',
      specialPerk: 'Hero of the Hidden Leaf (Unlocks Chapter 2: One Piece HQ 2)'
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
        const key = task.targetKey.toLowerCase();
        if (key === 'dojo' || key === 'arena' || key === 'academy' || key === 'hero_altar') {
          current = villageState.buildings.filter(
            (b) =>
              b.type === 'hero_altar' ||
              (b.type as string) === 'dojo' ||
              b.name.toLowerCase().includes('academy') ||
              b.name.toLowerCase().includes('dojo') ||
              b.name.toLowerCase().includes('arena')
          ).length;
        } else if (key === 'wall') {
          current = villageState.buildings.filter(
            (b) => b.type === 'defense_wall' || (b.type as string) === 'wall'
          ).length;
        } else if (key === 'paper_mortar') {
          current = villageState.buildings.filter(
            (b) => b.type === 'paper_mortar' || b.name.toLowerCase().includes('mortar')
          ).length;
        } else if (key === 'chakra_turbine') {
          current = villageState.buildings.filter(
            (b) => b.type === 'chakra_turbine' || b.name.toLowerCase().includes('turbine')
          ).length;
        } else if (key === 'berry_treasury') {
          current = villageState.buildings.filter(
            (b) => b.type === 'berry_treasury' || b.name.toLowerCase().includes('vault') || b.name.toLowerCase().includes('treasury')
          ).length;
        } else if (key === 'cannon' || key === 'archer_tower') {
          current = villageState.buildings.filter(
            (b) => b.type === 'haki_cannon' || b.type === 'paper_mortar' || b.type === 'kido_spire' || (b.type as string) === 'cannon'
          ).length;
        } else if (key === 'hospital' || key === 'monolith') {
          current = villageState.buildings.filter(
            (b) => b.type === 'chakra_turbine' || b.type === 'hero_altar' || (b.type as string) === key
          ).length;
        } else {
          current = villageState.buildings.filter(
            (b) => b.type === task.targetKey || b.name.toLowerCase().includes(key)
          ).length;
        }
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
      const key = (task.targetKey || '').toLowerCase();
      if (key === 'shinobi' || key === 'ninja' || key === 'genin' || key === 'konoha_genin') {
        current =
          (villageState.trainedTroops?.['konoha_genin'] || 0) +
          (villageState.trainedTroops?.['konoha_ninja'] || 0) +
          (villageState.trainedTroops?.['shinobi'] || 0);
      } else if (task.targetKey) {
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
      } else if (desc.includes('berries')) {
        current = villageState.berries;
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
