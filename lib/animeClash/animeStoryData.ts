// Anime Story Chronicles, Character Buildups, Legendary Powerups & Boss Villains

export interface AnimeVillain {
  id: string;
  name: string;
  title: string;
  franchise: 'naruto' | 'one_piece' | 'bleach' | 'black_clover';
  avatar: string;
  image: string;
  modernRole: string;
  hp: number;
  maxHp: number;
  attack: number;
  bossTheme: string;
  signatureMove: string;
  signatureMoveDesc: string;
  color: string;
  quote: string;
}

export interface HeroPowerup {
  heroId: string;
  formName: string;
  japaneseName: string;
  buildupStory: string;
  awakeningTrigger: string;
  statBoostMultiplier: number;
  unlockedAttack: string;
  unlockedAttackDesc: string;
  auraColor: string;
  quote: string;
}

export interface AnimeEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  japaneseTitle: string;
  heroId: string;
  villainId: string;
  synopsis: string;
  scenes: {
    speaker: string;
    avatar: string;
    isVillain?: boolean;
    narration?: boolean;
    visualFocus?: 'naruto' | 'luffy' | 'ichigo' | 'asta' | 'madara' | 'doflamingo' | 'aizen' | 'lucius' | 'all_heroes' | 'rift' | 'collision_void' | 'naruto_eyes' | 'villains_domination' | 'heroes_assemble';
    text: string;
    bgVibe: string;
  }[];
  powerup: HeroPowerup;
}

export const ANIME_VILLAINS: Record<string, AnimeVillain> = {
  madara: {
    id: 'madara',
    name: 'Madara Uchiha',
    title: 'The Ghost of the Uchiha / Void Overlord',
    franchise: 'naruto',
    avatar: '👁️',
    image: '/anime-heroes/madara-boss.jpg',
    modernRole: 'Seized control of the underground bullet train maglev power grids to fuel a global Infinite Tsukuyomi satellite broadcast.',
    hp: 2800,
    maxHp: 2800,
    attack: 110,
    bossTheme: '#7f1d1d',
    signatureMove: 'Tengai Shinsei: Orbital Rail Drop',
    signatureMoveDesc: 'Pulls magnetic orbital defense satellites crashing down into the battlefield.',
    color: '#b91c1c',
    quote: "Wake up to reality. Nothing in this world goes as planned. The longer you live in this modern cage, the more you realize that pain is the only constant."
  },
  doflamingo: {
    id: 'doflamingo',
    name: 'Donquixote Doflamingo',
    title: 'Heavenly Yaksha / Syndicate Puppeteer',
    franchise: 'one_piece',
    avatar: '🦩',
    image: '/anime-heroes/doflamingo-boss.jpg',
    modernRole: 'Chairman of the global maritime shipping cartel, stringing high-tension monofilament wires across skyscraper canopies.',
    hp: 3100,
    maxHp: 3100,
    attack: 95,
    bossTheme: '#831843',
    signatureMove: 'Birdcage: Skyscraper Razor Web',
    signatureMoveDesc: 'Constructs an inescapable dome of razor-sharp monomolecular strings slowly slicing the area.',
    color: '#ec4899',
    quote: "Pirates are evil? The Marines are righteous? These terms have changed throughout history! Whoever wins becomes Justice!"
  },
  aizen: {
    id: 'aizen',
    name: 'Sosuke Aizen',
    title: 'Architect of Deception / Cyber-Hogyoku Sovereign',
    franchise: 'bleach',
    avatar: '🦋',
    image: '/anime-heroes/aizen-boss.jpg',
    modernRole: 'Merged the spiritual Hogyoku with the global internet fiber backbone, casting Kyoka Suigetsu through every smartphone screen on Earth.',
    hp: 3400,
    maxHp: 3400,
    attack: 135,
    bossTheme: '#311042',
    signatureMove: 'Hado #90: Kurohitsugi (Black Coffin of the Void)',
    signatureMoveDesc: 'Traps the battlefield inside a pitch-black cubic gravitational singularity that warps space and time.',
    color: '#8b5cf6',
    quote: "Admiration is the furthest thing from understanding. You see a modern world of glass and steel; I see a playground awaiting its true god."
  },
  lucius: {
    id: 'lucius',
    name: 'Lucius Zogratis',
    title: 'True Human Sovereign / Soul & Time Dictator',
    franchise: 'black_clover',
    avatar: '⏳',
    image: '/anime-heroes/lucius-boss.jpg',
    modernRole: 'Using quantum temporal servers to freeze modern humanity in perpetual chronological stasis to achieve "Flawless Peace".',
    hp: 3600,
    maxHp: 3600,
    attack: 125,
    bossTheme: '#14532d',
    signatureMove: 'Chronostasis: Absolute Event Horizon',
    signatureMoveDesc: 'Freezes local time, freezing incoming attacks while his angelic avatar rains light lances.',
    color: '#10b981',
    quote: "For the sake of true world peace, humanity must be remade without flaws. Your frantic struggles are merely ripples in the river of destiny."
  }
};

export const HERO_POWERUPS: Record<string, HeroPowerup> = {
  naruto: {
    heroId: 'naruto',
    formName: 'Sage of Six Paths: Neon Kurama Cloak',
    japaneseName: '六道・霓虹九尾モード',
    buildupStory: 'Faced with Madara’s satellite barrage, Naruto harmonizes Kurama’s primeval chakra with the high-voltage electrical grid of Tokyo. The orange chakra burns with neon cyan lightning arcs, creating nine massive energy tails made of pure plasma.',
    awakeningTrigger: 'Kurama fist-bump in the digital subconscious, releasing the limiter on Nine-Tails Sage Chakra.',
    statBoostMultiplier: 1.85,
    unlockedAttack: 'Super-Ultra-Big Ball Neon Rasenshuriken',
    unlockedAttackDesc: 'Hurls twin colossal shurikens of plasma wind that obliterate Susanoo armor and magnetic barriers.',
    auraColor: '#f59e0b',
    quote: "Kurama, let’s show this city what happens when the Will of Fire burns brighter than a thousand neon suns!!"
  },
  luffy: {
    heroId: 'luffy',
    formName: 'Gear 5: Sun God Nika (Industrial Awakening)',
    japaneseName: 'ギア5「太陽の神ニカ」・現代覚醒',
    buildupStory: 'Trapped inside Doflamingo’s monofilament Birdcage, Luffy’s heart begins beating to the legendary Drums of Liberation (ドンドットット♪). His hair and clothes turn pure white cloud; his laughter echoes through the city as he turns asphalt, steel suspension bridges, and cranes into bouncy rubber.',
    awakeningTrigger: 'Hearing the heartbeat rhythm of the Drums of Liberation amidst impending defeat.',
    statBoostMultiplier: 2.1,
    unlockedAttack: 'Gum-Gum Bajrang Gun: Skycrane Overdrive',
    unlockedAttackDesc: 'Inflates his fist to the size of an entire skyscraper, coated in Conqueror’s Haki, crushing the enemy fortress from the clouds.',
    auraColor: '#fafafa',
    quote: "AHAHAHAHA! This is so ridiculous!! Hey Doffy, you think your strings can cut something that bounces right through the sky?!"
  },
  ichigo: {
    heroId: 'ichigo',
    formName: 'True Bankai: Horn of Salvation (Cyber Gran Rey)',
    japaneseName: '真の卍解・救済の角 (王虚の閃光)',
    buildupStory: 'Standing atop Tokyo Tower facing Aizen’s Kyoka Suigetsu illusions, Ichigo closes his eyes to stop trusting sensory screens. He merges the dual blades of his Soul Cutter and Hollow White into one unified obsidian zanpakuto. A single ivory bone horn sprouts from his head, leaking pitch-black and crimson reiatsu.',
    awakeningTrigger: 'Unifying his Shinigami heritage, Quincy bloodline, and inner Hollow into single balance.',
    statBoostMultiplier: 2.3,
    unlockedAttack: 'Gran Rey Getsuga Tensho (Cosmic Cleave)',
    unlockedAttackDesc: 'Infuses a royal Espada Cero into a full-power Getsuga Tensho, cleaving Aizen’s gravitational Kurohitsugi in half.',
    auraColor: '#dc2626',
    quote: "I can feel both of them now — the sword to protect and the horn to destroy. Bankai: Tensa Zangetsu!!"
  },
  asta: {
    heroId: 'asta',
    formName: 'Devil Union Mode: Demon Slasher Severance',
    japaneseName: '悪魔同化・滅魔の断罪',
    buildupStory: 'In the heart of the quantum time singularity, Lucius stops time itself. But Anti-Magic is the complete absence of energy — it cannot be frozen. Asta and Liebe fuse at 100%, manifesting twin midnight-black wings, crimson eyes, and the Demon-Slasher Katana which only cuts what Asta chooses to destroy.',
    awakeningTrigger: 'Anti-Magic resonance breaking through frozen temporal causality.',
    statBoostMultiplier: 2.2,
    unlockedAttack: 'Infinite Anti-Magic Slash: Equinox Zero',
    unlockedAttackDesc: 'A colossal sweeping slash that severs the concept of temporal control, restoring flow of time and shattering the boss.',
    auraColor: '#059669',
    quote: "Even if you stop time itself, MY LEGS WON'T STOP RUNNING! Liebe, let's cut through their destiny!!"
  },
  convergence: {
    heroId: 'all',
    formName: 'Sanctuary Quad-Convergence: Tetra-Resonance',
    japaneseName: '四界共鳴・神域の盟約',
    buildupStory: 'Standing beneath Tokyo Tower, Naruto, Luffy, Ichigo, and Asta combine Chakra, Haki, Reishi, and Anti-Magic into an impenetrable spherical defense dome, establishing the Sanctuary Village to shield humanity from the four dimensional overlords.',
    awakeningTrigger: 'Unison of four different dimensions bound by one oath to protect innocent lives.',
    statBoostMultiplier: 2.5,
    unlockedAttack: 'Tetra-Dimensional Grand Cross: Sanctuary Break',
    unlockedAttackDesc: 'A colossal combined attack of Rasengan, Red Hawk, Getsuga Tensho, and Anti-Magic Slash that seals dimensional rifts.',
    auraColor: '#38bdf8',
    quote: "No matter what universe we came from, this world and its people are under our protection!!"
  }
};

export const ANIME_EPISODES: AnimeEpisode[] = [
  {
    id: 'ep_0',
    episodeNumber: 0,
    title: 'The Great Convergence: How the Heroes Arrived',
    japaneseTitle: '第0話：次元融合・英雄集結の序曲',
    heroId: 'naruto',
    villainId: 'madara',
    synopsis: 'A cosmic fracture collapses four anime universes into contemporary Tokyo, 2026. Watch the cinematic origin story of how Naruto, Luffy, Ichigo, and Asta arrived, adopted modern tactical streetwear, connected their powers, and founded the Sanctuary Village.',
    scenes: [
      {
        speaker: 'Narrator',
        avatar: '📜',
        narration: true,
        visualFocus: 'collision_void',
        text: 'Tokyo, 2026. A forbidden dark experiment tears open the heavens! A massive celestial void vortex forms above the city, bending gravity and ripping space-time. Across four distant anime universes, Naruto, Luffy, Ichigo, and Asta are violently sucked into the swirling cosmic wormhole!',
        bgVibe: '#080c1a'
      },
      {
        speaker: 'Naruto Uzumaki',
        avatar: '🍥',
        visualFocus: 'naruto_eyes',
        text: '*(Gasping for air)* Where... where am I?! I can barely open my eyes... the cold rain is pouring down on my face! These aren’t the trees of Konoha... these are towering glass skyscrapers with neon billboards! My jumpsuit was shredded in the vortex, but I geared up in this waterproof tactical techwear and chest rig. The city’s underground power grid is pulsing directly into my Chakra!',
        bgVibe: '#1c1307'
      },
      {
        speaker: 'Monkey D. Luffy',
        avatar: '🍖',
        visualFocus: 'luffy',
        text: 'The Sunny got sucked into that crazy whirlpool in the sky! When I opened my eyes, I was lying on giant metal shipping containers at Yokohama docks! Found this sweet crimson biker vest and cargo pants, and kept my straw hat safe. These giant cargo cranes and steel skyscrapers make the best rubber swing vines I’ve ever seen!',
        bgVibe: '#1a0808'
      },
      {
        speaker: 'Ichigo Kurosaki',
        avatar: '⚔️',
        visualFocus: 'ichigo',
        text: 'The Senkaimon didn’t take me to Karakura Town. The vortex threw me straight through the trans-oceanic internet fiber-optic cables into Shinjuku! Threw on this dark tactical high-collar trench coat to blend into the shadows. I can feel dense spiritual particles leaking from every digital server room in the city.',
        bgVibe: '#0d0a1c'
      },
      {
        speaker: 'Asta',
        avatar: '🗡️',
        visualFocus: 'asta',
        text: 'The dimensional rebound launched me straight through the clouds into an athletic training gym on Tokyo’s perimeter! Grabbed this heavy training hoodie and strapped my Demon-Slayer blade to my back! No matter what century this is, my legs won’t stop running to protect the innocent!',
        bgVibe: '#061a12'
      },
      {
        speaker: 'Madara Uchiha',
        avatar: '👁️',
        isVillain: true,
        visualFocus: 'villains_domination',
        text: 'Look down upon this fragile civilization, my accomplices. Doflamingo strings their maritime trade; Aizen commands their digital screens; Lucius manipulates their world clocks. Once our orbital satellites are fully charged with this metropolis’s energy, the entire world shall bend to our new order.',
        bgVibe: '#2a0a0a'
      },
      {
        speaker: 'Naruto Uzumaki',
        avatar: '🍥',
        visualFocus: 'heroes_assemble',
        text: 'Look up there! Those four villains are planning to enslave this entire world! Ninja, Pirate, Soul Reaper, Magic Knight... our worlds might be across the rift, but right here under Tokyo Tower, WE STAND AS ONE! Let’s build our Sanctuary Village, upgrade our defenses, and take this city back!',
        bgVibe: '#1e140a'
      },
      {
        speaker: 'Monkey D. Luffy',
        avatar: '🍖',
        visualFocus: 'heroes_assemble',
        text: 'SHISHISHI! That’s what I’m talking about! Madara, Doflamingo, Aizen, Lucius — you messed with the wrong city! With all four of us standing together in this Sanctuary, NOBODY CAN STOP US!! LET’S BATTLE!!',
        bgVibe: '#240b0b'
      }
    ],
    powerup: {
      heroId: 'all',
      formName: 'Sanctuary Quad-Convergence: Tetra-Resonance',
      japaneseName: '四界共鳴・神域の盟約',
      buildupStory: 'Standing beneath Tokyo Tower, Naruto, Luffy, Ichigo, and Asta combine Chakra, Haki, Reishi, and Anti-Magic into an impenetrable spherical defense dome, establishing the Sanctuary Village to shield humanity from the four dimensional overlords.',
      awakeningTrigger: 'Unison of four different dimensions bound by one oath to protect innocent lives.',
      statBoostMultiplier: 2.5,
      unlockedAttack: 'Tetra-Dimensional Grand Cross: Sanctuary Break',
      unlockedAttackDesc: 'A colossal combined attack of Rasengan, Red Hawk, Getsuga Tensho, and Anti-Magic Slash that seals dimensional rifts.',
      auraColor: '#38bdf8',
      quote: "No matter what universe we came from, this world and its people are under our protection!!"
    }
  },
  {
    id: 'ep_1',
    episodeNumber: 1,
    title: 'The Will of Fire in Concrete & Glass',
    japaneseTitle: '第1話：摩天楼に燃ゆる火の意志',
    heroId: 'naruto',
    villainId: 'madara',
    synopsis: 'A dimensional rift fractures Shibuya. Madara Uchiha re-emerges atop a skyscraper spire, redirecting power grids into an orbital satellite strike. Naruto must unlock his Neon Kurama Cloak to save the metropolis.',
    scenes: [
      {
        speaker: 'Narrator',
        avatar: '📜',
        narration: true,
        text: 'Tokyo, 2026. The evening rain washes over the neon billboards of Shibuya Crossing. But tonight, the sky splits in two. Thunder without clouds. Crimson lightning rips open the stratosphere.',
        bgVibe: '#090d16'
      },
      {
        speaker: 'Madara Uchiha',
        avatar: '👁️',
        isVillain: true,
        text: 'Look at them scurrying like insects between their concrete anthills. They worship screens that blind them to the futility of their lives. I shall grant this entire civilization eternal peace.',
        bgVibe: '#2a0a0a'
      },
      {
        speaker: 'Naruto Uzumaki',
        avatar: '🍥',
        text: 'Shut your mouth, Madara! People here work hard, dream, and protect each other every single day! Just because you gave up on the world doesn’t mean you get to steal their future!',
        bgVibe: '#1c1307'
      },
      {
        speaker: 'Madara Uchiha',
        avatar: '👁️',
        isVillain: true,
        text: 'Brave words, boy. But against the Susanoo fused with orbital artillery... what can a solitary ninja do?',
        bgVibe: '#2a0a0a'
      },
      {
        speaker: 'Naruto Uzumaki',
        avatar: '🍥',
        text: 'A solitary ninja? You really haven’t learned anything, have you? KURAMA! LET’S CRANK UP THE POWER! SAGE OF SIX PATHS: NEON KURAMA CLOAK!!',
        bgVibe: '#3d2503'
      }
    ],
    powerup: HERO_POWERUPS.naruto
  },
  {
    id: 'ep_2',
    episodeNumber: 2,
    title: 'Drums of Liberation at the Ocean Pier',
    japaneseTitle: '第2話：埠頭に響く解放のドラム',
    heroId: 'luffy',
    villainId: 'doflamingo',
    synopsis: 'Doflamingo traps the Yokohama container docks in a razor-sharp Birdcage web. Pushed to the brink, Luffy’s heartbeat syncs with the legendary Drums of Liberation, unleashing Gear 5 across modern industrial cranes!',
    scenes: [
      {
        speaker: 'Narrator',
        avatar: '📜',
        narration: true,
        text: 'Yokohama Port. 40,000 shipping containers stand silent. In the sky above, Donquixote Doflamingo smiles behind his iconic tinted glasses, his fingers weaving monofilament death strings.',
        bgVibe: '#0a101d'
      },
      {
        speaker: 'Donquixote Doflamingo',
        avatar: '🦩',
        isVillain: true,
        text: 'Fuffuffuffu! Straw Hat! These modern container ports move trillions of dollars every hour. In this era, money and strings control everything! You cannot bounce your way out of my Birdcage!',
        bgVibe: '#260817'
      },
      {
        speaker: 'Monkey D. Luffy',
        avatar: '🍖',
        text: 'Who cares about your stupid money?! You made the dockworkers cry, and you kicked that little kid’s food onto the asphalt! I’M GONNA SEND YOU FLYING TO THE OTHER SIDE OF THE WORLD!!',
        bgVibe: '#1a0808'
      },
      {
        speaker: 'Narrator',
        avatar: '📜',
        narration: true,
        text: 'Ba-dump! Ba-dump! A rhythm echoes through the docks. Smoke billows like soft white silk around Luffy’s neck. His pitch-black hair turns blinding white. The sky parts with laughter.',
        bgVibe: '#111827'
      },
      {
        speaker: 'Monkey D. Luffy',
        avatar: '🍖',
        text: 'AHAHAHAHA! Look, the cranes are bouncing! The concrete is like a trampoline! GEAR 5: SUN GOD NIKA!!',
        bgVibe: '#1f2937'
      }
    ],
    powerup: HERO_POWERUPS.luffy
  },
  {
    id: 'ep_3',
    episodeNumber: 3,
    title: 'Moonlight Symphony Over the Metropolis',
    japaneseTitle: '第3話：摩天楼を裂く黒き月牙',
    heroId: 'ichigo',
    villainId: 'aizen',
    synopsis: 'Aizen hijacks the global fiber-optic internet to project the perfect illusion across all screens. Standing atop Tokyo Tower, Ichigo balances his Shinigami blade and inner Hollow horn to pierce the veil with a True Bankai Gran Rey Getsuga.',
    scenes: [
      {
        speaker: 'Narrator',
        avatar: '📜',
        narration: true,
        text: 'Midnight. 333 meters above the city on Tokyo Tower’s observation deck. The city lights below flicker in synchrony to a single heartbeat: Sosuke Aizen sits on an obsidian throne.',
        bgVibe: '#0a0d17'
      },
      {
        speaker: 'Sosuke Aizen',
        avatar: '🦋',
        isVillain: true,
        text: 'Welcome, Kurosaki Ichigo. In the old world, Kyoka Suigetsu required eye contact. In this world, every human carries a glass lens in their pocket. They belong to me before they even wake.',
        bgVibe: '#190a2a'
      },
      {
        speaker: 'Ichigo Kurosaki',
        avatar: '⚔️',
        text: 'You talk too much, Aizen. You thought you could hide behind digital screens? Spiritual pressure doesn’t lie. I don’t need to look at your screens to know where you are standing.',
        bgVibe: '#100c1e'
      },
      {
        speaker: 'Sosuke Aizen',
        avatar: '🦋',
        isVillain: true,
        text: 'Then let us see if your mortal steel can pierce a reality engineered by god. Hado #90: KUROHITSUGI!',
        bgVibe: '#240a3d'
      },
      {
        speaker: 'Ichigo Kurosaki',
        avatar: '⚔️',
        text: 'I told you... I fight to protect! ZANGETSU, GIVE ME EVERYTHING! TRUE BANKAI: HORN OF SALVATION!!',
        bgVibe: '#240608'
      }
    ],
    powerup: HERO_POWERUPS.ichigo
  },
  {
    id: 'ep_4',
    episodeNumber: 4,
    title: 'Anti-Magic Resonance in the Singularity',
    japaneseTitle: '第4話：特異点を断つ反魔法の誓い',
    heroId: 'asta',
    villainId: 'lucius',
    synopsis: 'Lucius Zogratis activates a temporal event horizon freezing all of humanity in time. Asta’s Anti-Magic cannot be frozen. Entering 100% Devil Union, Asta severs the chains of destiny.',
    scenes: [
      {
        speaker: 'Narrator',
        avatar: '📜',
        narration: true,
        text: 'The Quantum Research Citadel. The seconds hand on every clock on Earth halts. Raindrops hang motionless in mid-air. Lucius Zogratis hovers with pristine white angelic wings.',
        bgVibe: '#071610'
      },
      {
        speaker: 'Lucius Zogratis',
        avatar: '⏳',
        isVillain: true,
        text: 'It is done. Time has ceased. No more wars, no more heartbreak, no more decay. A peaceful museum for all eternity.',
        bgVibe: '#042217'
      },
      {
        speaker: 'Asta',
        avatar: '🍀',
        text: 'PEACEFUL MUSEUM?! That’s just a graveyard with fancy lights! People fall, make mistakes, get back up, and grow stronger — THAT IS WHAT LIVING MEANS!!',
        bgVibe: '#082618'
      },
      {
        speaker: 'Lucius Zogratis',
        avatar: '⏳',
        isVillain: true,
        text: 'How are you moving?! In my Chronostasis domain, all magical and physical energy is arrested!',
        bgVibe: '#062d1f'
      },
      {
        speaker: 'Asta',
        avatar: '🍀',
        text: 'Because I HAVE NO MAGIC! AND LIEBE HAS NO TIME FOR COWARDS! DEVIL UNION 100%! DEMON SLASHER KATANA!!',
        bgVibe: '#023321'
      }
    ],
    powerup: HERO_POWERUPS.asta
  }
];

