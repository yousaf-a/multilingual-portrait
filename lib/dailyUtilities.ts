// Daily Utilities Engine for Lockscreen Wallpapers, Daily Notes & One Sketch a Day Journal

export interface MoonPhaseInfo {
  phaseName: string;
  glyph: string;
  illumination: number; // 0 to 100%
  ageDays: number;
}

// Calculate accurate astronomical moon phase from date
export function getMoonPhase(date: Date = new Date()): MoonPhaseInfo {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Julian date calculation
  const c = Math.floor(365.25 * year);
  const e = Math.floor(30.6 * month);
  const jd = c + e + day - 694039.09;
  const b = jd / 29.53058867; // Moon cycle length in days
  const phaseFraction = b - Math.floor(b);
  const ageDays = Math.round(phaseFraction * 29.53);

  let phaseName = 'New Moon';
  let glyph = '🌑';

  if (ageDays === 0 || ageDays >= 29) {
    phaseName = 'New Moon';
    glyph = '🌑';
  } else if (ageDays <= 6) {
    phaseName = 'Waxing Crescent';
    glyph = '🌒';
  } else if (ageDays <= 8) {
    phaseName = 'First Quarter';
    glyph = '🌓';
  } else if (ageDays <= 13) {
    phaseName = 'Waxing Gibbous';
    glyph = '🌔';
  } else if (ageDays <= 15) {
    phaseName = 'Full Moon';
    glyph = '🌕';
  } else if (ageDays <= 21) {
    phaseName = 'Waning Gibbous';
    glyph = '🌖';
  } else if (ageDays <= 23) {
    phaseName = 'Last Quarter';
    glyph = '🌗';
  } else {
    phaseName = 'Waning Crescent';
    glyph = '🌘';
  }

  // Calculate illumination percentage
  const illumination = Math.round((1 - Math.cos(phaseFraction * 2 * Math.PI)) / 2 * 100);

  return {
    phaseName,
    glyph,
    illumination,
    ageDays
  };
}

// Curated Daily Mindset Quotes categorized by vibe
export interface DailyQuoteItem {
  quote: string;
  author: string;
  category: 'stoic' | 'romantic' | 'ambition' | 'mindful';
}

export const DAILY_QUOTES: DailyQuoteItem[] = [
  // Stoic
  {
    quote: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    category: "stoic"
  },
  {
    quote: "Waste no more time arguing about what a good person should be. Be one.",
    author: "Marcus Aurelius",
    category: "stoic"
  },
  {
    quote: "We suffer more often in imagination than in reality.",
    author: "Seneca",
    category: "stoic"
  },
  {
    quote: "Difficulties strengthen the mind, as labor does the body.",
    author: "Seneca",
    category: "stoic"
  },

  // Romantic
  {
    quote: "Whatever our souls are made of, his and mine are the same.",
    author: "Emily Brontë",
    category: "romantic"
  },
  {
    quote: "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.",
    author: "Maya Angelou",
    category: "romantic"
  },
  {
    quote: "You are my today and all of my tomorrows.",
    author: "Leo Christopher",
    category: "romantic"
  },
  {
    quote: "If I know what love is, it is because of you.",
    author: "Hermann Hesse",
    category: "romantic"
  },

  // Ambition
  {
    quote: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
    category: "ambition"
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "ambition"
  },
  {
    quote: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
    category: "ambition"
  },
  {
    quote: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    category: "ambition"
  },

  // Mindful
  {
    quote: "Smile, breathe, and go slowly.",
    author: "Thích Nhất Hạnh",
    category: "mindful"
  },
  {
    quote: "Silence is a source of great strength.",
    author: "Lao Tzu",
    category: "mindful"
  },
  {
    quote: "Nature does not hurry, yet everything is accomplished.",
    author: "Lao Tzu",
    category: "mindful"
  },
  {
    quote: "Do what you can, with what you have, where you are.",
    author: "Theodore Roosevelt",
    category: "mindful"
  }
];

// One Sketch a Day Journal Entry
export interface DailyJournalEntry {
  id: string;
  dateStr: string; // YYYY-MM-DD
  caption: string;
  moodEmoji: string;
  moodText: string;
  imageThumbnail: string; // Base64 data URL
  createdAt: number;
}

const STORAGE_KEY = 'one_sketch_a_day_journal_v1';

export function getStoredJournalEntries(): DailyJournalEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DailyJournalEntry[];
  } catch {
    return [];
  }
}

export function saveJournalEntry(entry: DailyJournalEntry): DailyJournalEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getStoredJournalEntries();
    // Replace if date matches, else prepend
    const filtered = existing.filter((e) => e.dateStr !== entry.dateStr);
    const updated = [entry, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save journal entry', err);
    return [];
  }
}

export function calculateJournalStreak(entries: DailyJournalEntry[]): number {
  if (!entries || entries.length === 0) return 0;

  const dates = new Set(entries.map((e) => e.dateStr));
  let streak = 0;
  const checkDate = new Date();

  // If today isn't logged yet, check starting yesterday
  const todayStr = checkDate.toISOString().split('T')[0];
  if (!dates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (dates.has(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

