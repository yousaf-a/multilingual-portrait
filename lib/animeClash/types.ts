// Anime Clash: Neo-Village Chronicles - Core Types

export type AnimeFranchise = 'naruto' | 'one_piece' | 'bleach' | 'black_clover';

export interface HeroData {
  id: string;
  name: string;
  title: string;
  franchise: AnimeFranchise;
  avatar: string;
  image: string;
  hp: number;
  maxHp: number;
  attack: number;
  range: number;
  speed: number;
  quote: string;
  modernOutfit: string;
  skillName: string;
  skillDesc: string;
  ultimateName: string;
  ultimateDesc: string;
  ultimateCooldown: number; // seconds
  color: string;
  accentColor: string;
}

export interface TroopData {
  id: string;
  name: string;
  franchise: AnimeFranchise;
  cost: number;
  resourceType: 'chakra' | 'berries' | 'reishi';
  hp: number;
  attack: number;
  range: number;
  speed: number;
  desc: string;
  icon: string;
}

export type BuildingType =
  | 'command_core' // Town Hall
  | 'chakra_turbine' // Resource Generator
  | 'berry_treasury' // Resource Generator
  | 'reishi_siphon' // Resource Generator
  | 'paper_mortar' // AOE Mortar
  | 'haki_cannon' // Heavy Rail Cannon
  | 'kido_spire' // Energy Shield Tower
  | 'defense_wall' // Fortified Barrier
  | 'hero_altar'; // Hero Summoning Pedestal

export interface BuildingInstance {
  id: string;
  type: BuildingType;
  name: string;
  level: number;
  x: number; // Grid coordinates (0 to 11)
  y: number; // Grid coordinates (0 to 11)
  hp: number;
  maxHp: number;
  attack?: number;
  range?: number;
  productionRate?: number; // per minute
  resourceProduced?: 'chakra' | 'berries' | 'reishi';
  color: string;
  icon: string;
}

export interface StoryDialog {
  speaker: string;
  franchise: AnimeFranchise;
  avatar: string;
  text: string;
  expression?: 'confident' | 'serious' | 'shocked' | 'humorous';
}

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  franchiseFocus: AnimeFranchise;
  modernLocation: string;
  briefing: string;
  dialogs: StoryDialog[];
  rewardBerries: number;
  rewardChakra: number;
  rewardReishi: number;
  unlockedHeroId?: string;
  enemyBasePreset: string;
}

export type WeatherTimeMode = 'day' | 'twilight' | 'night' | 'rain';

export interface SanctuaryGuild {
  id: string;
  name: string;
  tag: string;
  icon: string;
  franchise: AnimeFranchise;
  perkTitle: string;
  perkDesc: string;
  level: number;
  memberCount: number;
  leader: string;
}

export interface FriendProfile {
  id: string;
  name: string;
  tag: string;
  level: number;
  trophies: number;
  activeHeroId: string;
  heroLevel: number;
  berriesLoot: number;
  chakraLoot: number;
  buildings: BuildingInstance[];
  isCustom?: boolean;
}

export interface RaidBattleReport {
  id: string;
  timestamp: number;
  attackerName: string;
  defenderName: string;
  stars: number;
  destructionPct: number;
  lootStolenBerries: number;
  lootStolenChakra: number;
  trophiesDelta: number;
  isDefense: boolean;
}

export interface PlayerVillageState {
  level: number;
  berries: number;
  chakra: number;
  reishi: number;
  maxStorage: number;
  buildings: BuildingInstance[];
  unlockedHeroes: string[];
  activeHeroId: string;
  completedChapters: string[];
  heroLevels?: Record<string, number>; // Level of each hero (1 to 30)
  trainedTroops?: Record<string, number>; // Army camp troop counts
  weatherMode?: WeatherTimeMode;
  activeGuildId?: string;
  guildContribution?: number;
  playerName?: string;
  sanctuaryTag?: string;
  customFriends?: FriendProfile[];
  battleReports?: RaidBattleReport[];
  profileSlots?: Record<string, PlayerVillageState>;
  activeProfileKey?: string;
}

