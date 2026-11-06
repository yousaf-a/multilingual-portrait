import { UserAccount, PlayerVillageState, RaidBattleReport } from './types';
import { INITIAL_PLAYER_STATE, DEFAULT_FRIEND_BASES, HERO_UNLOCK_HQ_REQUIREMENTS, TROOPS_CATALOG } from './gameData';

const ACCOUNTS_STORAGE_KEY = 'anime_clash_accounts_registry_v4';
const ACTIVE_USER_ID_KEY = 'anime_clash_active_user_id_v4';
const USER_VILLAGE_PREFIX = 'anime_clash_user_village_state_v4_';

// Initial pre-seeded accounts: ALL start at HQ Level 1 & Chapter 1 (Konoha)
export const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'user_naruto',
    username: 'Shinobi Hokage (You)',
    tag: '#LEAF-101',
    avatarHeroId: 'naruto',
    createdAt: 1730000000000
  },
  {
    id: 'user_kenji',
    username: 'Rookie Kenji (Leaf Aspirant)',
    tag: '#LEAF-7721',
    avatarHeroId: 'naruto',
    createdAt: 1730000001000
  },
  {
    id: 'user_ren',
    username: 'Shinobi Ren',
    tag: '#LEAF-3309',
    avatarHeroId: 'naruto',
    createdAt: 1730000002000
  }
];

// Helper to build initial custom village states: Everyone starts strictly at Chapter 1 & HQ 1
function getInitialStateForAccount(accountId: string): PlayerVillageState {
  const account = DEFAULT_ACCOUNTS.find((a) => a.id === accountId);
  return {
    ...INITIAL_PLAYER_STATE,
    level: 1,
    currentChapter: 1,
    unlockedHeroes: ['naruto'],
    activeHeroId: 'naruto',
    heroLevels: { naruto: 1 },
    trainedTroops: {},
    completedChapters: [],
    completedStoryQuests: [],
    defeatedMiniBosses: [],
    buildings: INITIAL_PLAYER_STATE.buildings,
    ownerUserId: accountId,
    playerName: account?.username || 'Shinobi Hokage (You)',
    sanctuaryTag: account?.tag || '#LEAF-101',
    berries: 650,
    chakra: 450,
    reishi: 0
  };
}

/**
 * Load all registered accounts from localStorage (falls back to DEFAULT_ACCOUNTS)
 */
export function getAllAccounts(): UserAccount[] {
  if (typeof window === 'undefined') return DEFAULT_ACCOUNTS;
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const parsed: UserAccount[] = JSON.parse(raw);
    // Ensure all default accounts are present
    const existingIds = new Set(parsed.map((a) => a.id));
    let updated = false;
    for (const def of DEFAULT_ACCOUNTS) {
      if (!existingIds.has(def.id)) {
        parsed.push(def);
        updated = true;
      }
    }
    if (updated) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (_) {
    return DEFAULT_ACCOUNTS;
  }
}

/**
 * Save account list to localStorage
 */
export function saveAccounts(accounts: UserAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (_) {}
}

/**
 * Get active user ID from localStorage (or null if logged out)
 */
export function getActiveUserId(): string | null {
  if (typeof window === 'undefined') return 'user_naruto';
  try {
    const active = localStorage.getItem(ACTIVE_USER_ID_KEY);
    return active;
  } catch (_) {
    return null;
  }
}

/**
 * Clear active user ID from localStorage (Log Out)
 */
export function clearActiveUserId(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACTIVE_USER_ID_KEY);
  } catch (_) {}
}

/**
 * Logout active user
 */
export function logoutActiveUser(): void {
  clearActiveUserId();
}

/**
 * Set active user ID in localStorage (Log In)
 */
export function setActiveUserId(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
  } catch (_) {}
}

/**
 * Get the currently logged-in account object or null if logged out
 */
export function getOptionalActiveAccount(): UserAccount | null {
  const accounts = getAllAccounts();
  const activeId = getActiveUserId();
  if (!activeId) return null;
  return accounts.find((a) => a.id === activeId) || null;
}

/**
 * Get the currently logged-in account object (falls back to default if none)
 */
export function getActiveAccount(): UserAccount {
  const optional = getOptionalActiveAccount();
  if (optional) return optional;
  const accounts = getAllAccounts();
  return accounts[0] || DEFAULT_ACCOUNTS[0];
}

/**
 * Register a new user account with isolated base state
 */
export function registerAccount(
  username: string,
  avatarHeroId: string,
  pin?: string
): { success: boolean; account?: UserAccount; error?: string } {
  const cleanName = username.trim();
  if (!cleanName) {
    return { success: false, error: 'Please enter a valid player username.' };
  }

  const accounts = getAllAccounts();
  const exists = accounts.some((a) => a.username.toLowerCase() === cleanName.toLowerCase());
  if (exists) {
    return { success: false, error: 'A player with this name already exists! Please choose another name.' };
  }

  const randomTagNum = Math.floor(1000 + Math.random() * 9000);
  const newAccount: UserAccount = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username: cleanName,
    tag: `#SANCTUARY-${randomTagNum}`,
    avatarHeroId: avatarHeroId || 'naruto',
    pin: pin && pin.trim().length > 0 ? pin.trim() : undefined,
    createdAt: Date.now()
  };

  accounts.push(newAccount);
  saveAccounts(accounts);

  // Initialize fresh village state for new user
  const initialVillage: PlayerVillageState = {
    ...INITIAL_PLAYER_STATE,
    playerName: cleanName,
    sanctuaryTag: newAccount.tag,
    ownerUserId: newAccount.id,
    activeHeroId: avatarHeroId || 'naruto',
    unlockedHeroes: Array.from(new Set(['naruto', avatarHeroId || 'naruto'])),
    heroLevels: { naruto: 1, [avatarHeroId || 'naruto']: 1 }
  };
  saveUserVillageState(newAccount.id, initialVillage);

  // Switch to new account immediately
  setActiveUserId(newAccount.id);

  return { success: true, account: newAccount };
}

/**
 * Load isolated village state for a specific user ID
 */
export function getUserVillageState(userId: string): PlayerVillageState {
  if (typeof window === 'undefined') return getInitialStateForAccount(userId);
  try {
    const raw = localStorage.getItem(`${USER_VILLAGE_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure owner is tagged
      parsed.ownerUserId = userId;

      // Strictly enforce: HQ level is bound to Chapter progression! No skips or shortcuts.
      const hasCompletedChapter1 =
        (parsed.completedChapters || []).includes('chapter_1') ||
        (parsed.completedStoryQuests || []).includes('naruto_q25');
      if (!hasCompletedChapter1) {
        parsed.level = 1;
        parsed.currentChapter = 1;
        parsed.unlockedHeroes = ['naruto'];
        parsed.activeHeroId = 'naruto';
      } else {
        const unlockedSet = new Set(['naruto', ...(parsed.unlockedHeroes || [])]);
        Object.entries(HERO_UNLOCK_HQ_REQUIREMENTS).forEach(([hId, req]) => {
          if ((parsed.level || 1) >= req.hqLevel) {
            unlockedSet.add(hId);
          }
        });
        parsed.unlockedHeroes = Array.from(unlockedSet);
      }

      // Automatically purge legacy / obsolete troops not present in current chapter's catalog
      if (parsed.trainedTroops) {
        const validTroopIds = new Set(TROOPS_CATALOG.map((t) => t.id));
        const cleanedTroops: Record<string, number> = {};
        for (const [k, v] of Object.entries(parsed.trainedTroops)) {
          if (validTroopIds.has(k) && typeof v === 'number' && v > 0) {
            cleanedTroops[k] = v;
          }
        }
        parsed.trainedTroops = cleanedTroops;
      }

      // Automatically migrate canonical Konohagakure landmarks if missing
      if (Array.isArray(parsed.buildings)) {
        if (!parsed.buildings.some((b: any) => b.type === 'ichiraku_ramen')) {
          parsed.buildings.push({
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
          });
        }
        if (!parsed.buildings.some((b: any) => b.type === 'team7_posts')) {
          parsed.buildings.push({
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
          });
        }
      }

      return parsed;
    }
  } catch (_) {}

  // If not found in storage, initialize and persist
  const fresh = getInitialStateForAccount(userId);
  saveUserVillageState(userId, fresh);
  return fresh;
}

/**
 * Save isolated village state for a specific user ID
 */
export function saveUserVillageState(userId: string, state: PlayerVillageState): void {
  if (typeof window === 'undefined') return;
  try {
    const toSave = {
      ...state,
      ownerUserId: userId
    };
    localStorage.setItem(`${USER_VILLAGE_PREFIX}${userId}`, JSON.stringify(toSave));
  } catch (_) {}
}

/**
 * Record a multiplayer raid against another user's base
 * Appends a defense log to the defender's state and updates their stolen resources
 */
export function recordCrossUserRaid(
  defenderUserId: string,
  attackerName: string,
  stars: number,
  destructionPct: number,
  berriesLooted: number,
  chakraLooted: number
): void {
  try {
    const defenderState = getUserVillageState(defenderUserId);
    const report: RaidBattleReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      attackerName,
      defenderName: defenderState.playerName || 'Defender',
      stars,
      destructionPct,
      lootStolenBerries: berriesLooted,
      lootStolenChakra: chakraLooted,
      trophiesDelta: stars >= 1 ? -18 : 12,
      isDefense: true
    };

    const updatedReports = [report, ...(defenderState.battleReports || [])].slice(0, 15);
    const updatedState: PlayerVillageState = {
      ...defenderState,
      berries: Math.max(300, defenderState.berries - berriesLooted),
      chakra: Math.max(300, defenderState.chakra - chakraLooted),
      battleReports: updatedReports
    };

    saveUserVillageState(defenderUserId, updatedState);
  } catch (_) {}
}

/**
 * Hard reset to Chapter 1: The Hidden Leaf Village fresh start
 */
export function resetToChapterOneFreshStart(userId: string = 'user_naruto'): PlayerVillageState {
  const fresh: PlayerVillageState = {
    ...INITIAL_PLAYER_STATE,
    ownerUserId: userId,
    playerName: 'Shinobi Hokage (You)',
    sanctuaryTag: '#LEAF-001',
    completedStoryQuests: [],
    completedChapters: [],
    defeatedMiniBosses: [],
    trainedTroops: {},
    buildings: INITIAL_PLAYER_STATE.buildings,
    heroLevels: { naruto: 1 },
    unlockedHeroes: ['naruto'],
    currentChapter: 1,
    berries: 650,
    chakra: 450,
    reishi: 0
  };
  saveUserVillageState(userId, fresh);
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('animeClash_prologue_seen');
    } catch (_) {}
  }
  return fresh;
}

