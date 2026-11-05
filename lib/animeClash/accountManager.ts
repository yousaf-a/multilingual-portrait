import { UserAccount, PlayerVillageState, RaidBattleReport } from './types';
import { INITIAL_PLAYER_STATE, DEFAULT_FRIEND_BASES, HERO_UNLOCK_HQ_REQUIREMENTS } from './gameData';

const ACCOUNTS_STORAGE_KEY = 'anime_clash_accounts_registry_v1';
const ACTIVE_USER_ID_KEY = 'anime_clash_active_user_id_v1';
const USER_VILLAGE_PREFIX = 'anime_clash_user_village_state_';

// Initial pre-seeded accounts for multiplayer demo
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
    username: 'Pirate King Kenji',
    tag: '#CORSAIR-7721',
    avatarHeroId: 'luffy',
    createdAt: 1730000001000
  },
  {
    id: 'user_ren',
    username: 'Soul Reaper Ren',
    tag: '#SHINIGAMI-3309',
    avatarHeroId: 'ichigo',
    createdAt: 1730000002000
  },
  {
    id: 'user_yuno',
    username: 'Clover Knight Yuno',
    tag: '#CLOVER-8812',
    avatarHeroId: 'asta',
    createdAt: 1730000003000
  }
];

// Helper to build initial custom village states for pre-seeded accounts
function getInitialStateForAccount(accountId: string): PlayerVillageState {
  if (accountId === 'user_kenji') {
    const friend = DEFAULT_FRIEND_BASES[0];
    return {
      level: friend.level,
      berries: 3500,
      chakra: 2800,
      reishi: 2000,
      maxStorage: 8000,
      buildings: friend.buildings,
      unlockedHeroes: ['naruto', 'luffy'],
      activeHeroId: 'luffy',
      completedChapters: ['ep0', 'ep1'],
      heroLevels: { luffy: 3, naruto: 2 },
      trainedTroops: { strawhat_brawler: 8, konoha_ninja: 4 },
      weatherMode: 'twilight',
      playerName: friend.name,
      sanctuaryTag: friend.tag,
      ownerUserId: accountId,
      battleReports: []
    };
  }
  if (accountId === 'user_ren') {
    const friend = DEFAULT_FRIEND_BASES[1];
    return {
      level: friend.level,
      berries: 2800,
      chakra: 3600,
      reishi: 3200,
      maxStorage: 8000,
      buildings: friend.buildings,
      unlockedHeroes: ['naruto', 'luffy', 'ichigo'],
      activeHeroId: 'ichigo',
      completedChapters: ['ep0', 'ep1', 'ep2'],
      heroLevels: { ichigo: 3, naruto: 2 },
      trainedTroops: { shinigami_patrol: 10 },
      weatherMode: 'night',
      playerName: friend.name,
      sanctuaryTag: friend.tag,
      ownerUserId: accountId,
      battleReports: []
    };
  }
  if (accountId === 'user_yuno') {
    const friend = DEFAULT_FRIEND_BASES[2];
    return {
      level: friend.level,
      berries: 4200,
      chakra: 3100,
      reishi: 2400,
      maxStorage: 10000,
      buildings: friend.buildings,
      unlockedHeroes: ['naruto', 'luffy', 'ichigo', 'asta'],
      activeHeroId: 'asta',
      completedChapters: ['ep0', 'ep1', 'ep2', 'ep3'],
      heroLevels: { asta: 4, naruto: 2 },
      trainedTroops: { black_bulls_mage: 6, konoha_ninja: 6 },
      weatherMode: 'rain',
      playerName: friend.name,
      sanctuaryTag: friend.tag,
      ownerUserId: accountId,
      battleReports: []
    };
  }

  // Default User Naruto
  return {
    ...INITIAL_PLAYER_STATE,
    ownerUserId: 'user_naruto',
    playerName: 'Shinobi Hokage (You)',
    sanctuaryTag: '#LEAF-101'
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

      // Always guarantee Naruto (Starter Hero) and all HQ-eligible heroes are unlocked
      const unlockedSet = new Set(['naruto', ...(parsed.unlockedHeroes || [])]);
      Object.entries(HERO_UNLOCK_HQ_REQUIREMENTS).forEach(([hId, req]) => {
        if ((parsed.level || 1) >= req.hqLevel) {
          unlockedSet.add(hId);
        }
      });
      parsed.unlockedHeroes = Array.from(unlockedSet);
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

