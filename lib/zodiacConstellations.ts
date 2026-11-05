// Zodiac Soulmate Constellation Fusion Engine
// Calculates real astronomical zodiac constellations, elemental harmony, and golden ribbon linkage

export interface ZodiacSign {
  id: string;
  name: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  dateRange: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  description: string;
  // Local constellation stars normalized (0-100 range)
  stars: { id: string; x: number; y: number; mag: number; name?: string }[];
  lines: [string, string][];
}

export const ZODIAC_SIGNS: Record<string, ZodiacSign> = {
  aries: {
    id: 'aries',
    name: 'Aries',
    symbol: '♈',
    element: 'Fire',
    dateRange: 'Mar 21 - Apr 19',
    startMonth: 3,
    startDay: 21,
    endMonth: 4,
    endDay: 19,
    description: 'The Bold Ram — Passionate & Fearless',
    stars: [
      { id: 'hamal', x: 75, y: 30, mag: 2.0, name: 'Hamal' },
      { id: 'sheratan', x: 50, y: 48, mag: 2.6, name: 'Sheratan' },
      { id: 'mesarthim', x: 42, y: 62, mag: 3.9 },
      { id: '41_ari', x: 25, y: 72, mag: 4.5 }
    ],
    lines: [
      ['hamal', 'sheratan'],
      ['sheratan', 'mesarthim'],
      ['mesarthim', '41_ari']
    ]
  },
  taurus: {
    id: 'taurus',
    name: 'Taurus',
    symbol: '♉',
    element: 'Earth',
    dateRange: 'Apr 20 - May 20',
    startMonth: 4,
    startDay: 20,
    endMonth: 5,
    endDay: 20,
    description: 'The Celestial Bull — Devoted & Unwavering',
    stars: [
      { id: 'aldebaran', x: 45, y: 55, mag: 0.85, name: 'Aldebaran' },
      { id: 'elnath', x: 80, y: 20, mag: 1.65, name: 'Elnath' },
      { id: 'tianguan', x: 82, y: 70, mag: 3.0 },
      { id: 'ain', x: 35, y: 45, mag: 3.5 },
      { id: 'hyadum_1', x: 30, y: 60, mag: 3.8 },
      { id: 'pleiades', x: 15, y: 30, mag: 2.8, name: 'Pleiades' }
    ],
    lines: [
      ['elnath', 'ain'],
      ['ain', 'aldebaran'],
      ['aldebaran', 'tianguan'],
      ['aldebaran', 'hyadum_1'],
      ['ain', 'hyadum_1'],
      ['ain', 'pleiades']
    ]
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    symbol: '♊',
    element: 'Air',
    dateRange: 'May 21 - Jun 20',
    startMonth: 5,
    startDay: 21,
    endMonth: 6,
    endDay: 20,
    description: 'The Celestial Twins — Curious & Radiant',
    stars: [
      { id: 'castor', x: 35, y: 20, mag: 1.58, name: 'Castor' },
      { id: 'pollux', x: 55, y: 25, mag: 1.16, name: 'Pollux' },
      { id: 'wasat', x: 48, y: 50, mag: 3.5 },
      { id: 'mekbuda', x: 38, y: 68, mag: 4.0 },
      { id: 'alhena', x: 30, y: 85, mag: 1.9, name: 'Alhena' },
      { id: 'propus', x: 65, y: 80, mag: 3.3 }
    ],
    lines: [
      ['castor', 'pollux'],
      ['castor', 'wasat'],
      ['pollux', 'wasat'],
      ['wasat', 'mekbuda'],
      ['mekbuda', 'alhena'],
      ['wasat', 'propus']
    ]
  },
  cancer: {
    id: 'cancer',
    name: 'Cancer',
    symbol: '♋',
    element: 'Water',
    dateRange: 'Jun 21 - Jul 22',
    startMonth: 6,
    startDay: 21,
    endMonth: 7,
    endDay: 22,
    description: 'The Cosmic Protector — Tender & Intuitive',
    stars: [
      { id: 'al_tarf', x: 65, y: 80, mag: 3.5 },
      { id: 'acubens', x: 75, y: 45, mag: 4.2 },
      { id: 'asellus_aust', x: 45, y: 50, mag: 3.9 },
      { id: 'asellus_bor', x: 42, y: 35, mag: 4.7 },
      { id: 'tegmine', x: 20, y: 20, mag: 4.6 }
    ],
    lines: [
      ['tegmine', 'asellus_bor'],
      ['asellus_bor', 'asellus_aust'],
      ['asellus_aust', 'acubens'],
      ['asellus_aust', 'al_tarf']
    ]
  },
  leo: {
    id: 'leo',
    name: 'Leo',
    symbol: '♌',
    element: 'Fire',
    dateRange: 'Jul 23 - Aug 22',
    startMonth: 7,
    startDay: 23,
    endMonth: 8,
    endDay: 22,
    description: 'The Golden Lion — Regal & Loyal',
    stars: [
      { id: 'regulus', x: 70, y: 75, mag: 1.36, name: 'Regulus' },
      { id: 'algieba', x: 62, y: 45, mag: 2.01, name: 'Algieba' },
      { id: 'adhara_leo', x: 55, y: 30, mag: 3.4 },
      { id: 'ras_elasad', x: 42, y: 22, mag: 2.9 },
      { id: 'zosma', x: 30, y: 48, mag: 2.56 },
      { id: 'denebola', x: 15, y: 60, mag: 2.14, name: 'Denebola' },
      { id: 'chertan', x: 32, y: 70, mag: 3.3 }
    ],
    lines: [
      ['regulus', 'algieba'],
      ['algieba', 'adhara_leo'],
      ['adhara_leo', 'ras_elasad'],
      ['algieba', 'zosma'],
      ['zosma', 'denebola'],
      ['denebola', 'chertan'],
      ['chertan', 'regulus']
    ]
  },
  virgo: {
    id: 'virgo',
    name: 'Virgo',
    symbol: '♍',
    element: 'Earth',
    dateRange: 'Aug 23 - Sep 22',
    startMonth: 8,
    startDay: 23,
    endMonth: 9,
    endDay: 22,
    description: 'The Celestial Maiden — Gentle & Pure-Hearted',
    stars: [
      { id: 'spica', x: 75, y: 78, mag: 0.98, name: 'Spica' },
      { id: 'porrima', x: 55, y: 55, mag: 2.74 },
      { id: 'auva', x: 42, y: 40, mag: 3.8 },
      { id: 'vindemiatrix', x: 50, y: 25, mag: 2.8 },
      { id: 'zavijava', x: 28, y: 42, mag: 3.6 },
      { id: 'heze', x: 70, y: 50, mag: 3.4 }
    ],
    lines: [
      ['spica', 'heze'],
      ['heze', 'porrima'],
      ['porrima', 'auva'],
      ['auva', 'vindemiatrix'],
      ['auva', 'zavijava']
    ]
  },
  libra: {
    id: 'libra',
    name: 'Libra',
    symbol: '♎',
    element: 'Air',
    dateRange: 'Sep 23 - Oct 22',
    startMonth: 9,
    startDay: 23,
    endMonth: 10,
    endDay: 22,
    description: 'The Scales of Harmony — Graceful & Soulful',
    stars: [
      { id: 'zubeneschamali', x: 50, y: 25, mag: 2.6, name: 'Zubeneschamali' },
      { id: 'zubenelgenubi', x: 30, y: 65, mag: 2.75, name: 'Zubenelgenubi' },
      { id: 'brachium', x: 68, y: 72, mag: 3.2 },
      { id: 'zubenelakrab', x: 78, y: 45, mag: 3.9 }
    ],
    lines: [
      ['zubeneschamali', 'zubenelgenubi'],
      ['zubeneschamali', 'zubenelakrab'],
      ['zubenelakrab', 'brachium'],
      ['brachium', 'zubenelgenubi']
    ]
  },
  scorpio: {
    id: 'scorpio',
    name: 'Scorpio',
    symbol: '♏',
    element: 'Water',
    dateRange: 'Oct 23 - Nov 21',
    startMonth: 10,
    startDay: 23,
    endMonth: 11,
    endDay: 21,
    description: 'The Celestial Scorpion — Magnetic & Boundless',
    stars: [
      { id: 'antares', x: 45, y: 35, mag: 1.06, name: 'Antares' },
      { id: 'graffias', x: 35, y: 20, mag: 2.6 },
      { id: 'dschubba', x: 42, y: 18, mag: 2.3 },
      { id: 'pi_sco', x: 52, y: 22, mag: 2.9 },
      { id: 'wei', x: 48, y: 55, mag: 2.3 },
      { id: 'sargas', x: 55, y: 72, mag: 1.86 },
      { id: 'shaula', x: 75, y: 80, mag: 1.62, name: 'Shaula' },
      { id: 'lesath', x: 78, y: 73, mag: 2.7 }
    ],
    lines: [
      ['graffias', 'dschubba'],
      ['dschubba', 'pi_sco'],
      ['dschubba', 'antares'],
      ['antares', 'wei'],
      ['wei', 'sargas'],
      ['sargas', 'shaula'],
      ['shaula', 'lesath']
    ]
  },
  sagittarius: {
    id: 'sagittarius',
    name: 'Sagittarius',
    symbol: '♐',
    element: 'Fire',
    dateRange: 'Nov 22 - Dec 21',
    startMonth: 11,
    startDay: 22,
    endMonth: 12,
    endDay: 21,
    description: 'The Golden Archer — Free-Spirited & Inspiring',
    stars: [
      { id: 'kaus_australis', x: 50, y: 75, mag: 1.79, name: 'Kaus Australis' },
      { id: 'kaus_media', x: 48, y: 55, mag: 2.7 },
      { id: 'kaus_borealis', x: 45, y: 35, mag: 2.8 },
      { id: 'nunki', x: 72, y: 40, mag: 2.05, name: 'Nunki' },
      { id: 'ascellaph', x: 68, y: 60, mag: 3.3 },
      { id: 'alnasl', x: 30, y: 58, mag: 3.0 }
    ],
    lines: [
      ['kaus_australis', 'kaus_media'],
      ['kaus_media', 'kaus_borealis'],
      ['kaus_borealis', 'nunki'],
      ['nunki', 'ascellaph'],
      ['ascellaph', 'kaus_australis'],
      ['kaus_media', 'alnasl']
    ]
  },
  capricorn: {
    id: 'capricorn',
    name: 'Capricorn',
    symbol: '♑',
    element: 'Earth',
    dateRange: 'Dec 22 - Jan 19',
    startMonth: 12,
    startDay: 22,
    endMonth: 1,
    endDay: 19,
    description: 'The Sea-Goat — Steadfast & Enduring',
    stars: [
      { id: 'algedi', x: 25, y: 30, mag: 3.5 },
      { id: 'dabih', x: 32, y: 40, mag: 3.0 },
      { id: 'nashira', x: 75, y: 55, mag: 3.7 },
      { id: 'deneb_algedi', x: 82, y: 48, mag: 2.85, name: 'Deneb Algedi' },
      { id: 'omega_cap', x: 55, y: 75, mag: 4.1 }
    ],
    lines: [
      ['algedi', 'dabih'],
      ['dabih', 'omega_cap'],
      ['omega_cap', 'nashira'],
      ['nashira', 'deneb_algedi'],
      ['algedi', 'deneb_algedi']
    ]
  },
  aquarius: {
    id: 'aquarius',
    name: 'Aquarius',
    symbol: '♒',
    element: 'Air',
    dateRange: 'Jan 20 - Feb 18',
    startMonth: 1,
    startDay: 20,
    endMonth: 2,
    endDay: 18,
    description: 'The Water Bearer — Visionary & Electric',
    stars: [
      { id: 'sadalmelik', x: 45, y: 35, mag: 2.95, name: 'Sadalmelik' },
      { id: 'sadalsuud', x: 30, y: 25, mag: 2.9, name: 'Sadalsuud' },
      { id: 'sadachbia', x: 60, y: 42, mag: 3.8 },
      { id: 'skat', x: 75, y: 75, mag: 3.25 },
      { id: 'albali', x: 20, y: 55, mag: 3.8 }
    ],
    lines: [
      ['sadalsuud', 'sadalmelik'],
      ['sadalmelik', 'sadachbia'],
      ['sadalmelik', 'albali'],
      ['sadachbia', 'skat']
    ]
  },
  pisces: {
    id: 'pisces',
    name: 'Pisces',
    symbol: '♓',
    element: 'Water',
    dateRange: 'Feb 19 - Mar 20',
    startMonth: 2,
    startDay: 19,
    endMonth: 3,
    endDay: 20,
    description: 'The Cosmic Fishes — Romantic & Empathetic',
    stars: [
      { id: 'alrescha', x: 50, y: 75, mag: 3.8, name: 'Alrescha (The Knot)' },
      { id: 'fum_al_samakah', x: 25, y: 35, mag: 4.5 },
      { id: 'torcular', x: 35, y: 55, mag: 4.2 },
      { id: 'kullat_nunu', x: 75, y: 40, mag: 3.6 },
      { id: 'delta_psc', x: 65, y: 60, mag: 4.4 }
    ],
    lines: [
      ['fum_al_samakah', 'torcular'],
      ['torcular', 'alrescha'],
      ['alrescha', 'delta_psc'],
      ['delta_psc', 'kullat_nunu']
    ]
  }
};

export interface ZodiacFusionConfig {
  enabled: boolean;
  partner1Sign: string; // e.g. 'leo'
  partner2Sign: string; // e.g. 'scorpio'
  partner1Name?: string;
  partner2Name?: string;
  style: 'gilded_gold' | 'romantic_crimson' | 'starlight_cyan';
  showInfinityKnot: boolean;
  showCompatibility: boolean;
}

export const DEFAULT_ZODIAC_CONFIG: ZodiacFusionConfig = {
  enabled: false,
  partner1Sign: 'leo',
  partner2Sign: 'scorpio',
  partner1Name: 'Partner 1',
  partner2Name: 'Partner 2',
  style: 'gilded_gold',
  showInfinityKnot: true,
  showCompatibility: true
};

// Compute astrological sign from birthday
export function getZodiacSignFromDate(dateStr: string): string {
  if (!dateStr) return 'leo';
  try {
    const [_, mStr, dStr] = dateStr.split('-');
    const month = parseInt(mStr, 10);
    const day = parseInt(dStr, 10);

    for (const [id, sign] of Object.entries(ZODIAC_SIGNS)) {
      if (
        (month === sign.startMonth && day >= sign.startDay) ||
        (month === sign.endMonth && day <= sign.endDay)
      ) {
        return id;
      }
    }
  } catch {
    // fallback
  }
  return 'leo';
}

// Calculate poetic elemental harmony description
export function calculateZodiacHarmony(sign1Id: string, sign2Id: string) {
  const s1 = ZODIAC_SIGNS[sign1Id] || ZODIAC_SIGNS.leo;
  const s2 = ZODIAC_SIGNS[sign2Id] || ZODIAC_SIGNS.scorpio;

  const elements = [s1.element, s2.element].sort().join(' & ');

  let harmonyTitle = 'Cosmic Destiny';
  let harmonyQuote = 'Stars aligned across eternity';
  let score = 96;

  switch (elements) {
    case 'Fire & Fire':
      harmonyTitle = 'Twin Flames';
      harmonyQuote = 'Boundless passion, radiant warmth, and unstoppable shared momentum';
      score = 98;
      break;
    case 'Air & Fire':
      harmonyTitle = 'Endless Inspiration';
      harmonyQuote = 'Air breathes brilliant life into Fire — captivating, creative, and joyful';
      score = 99;
      break;
    case 'Earth & Water':
      harmonyTitle = 'Sacred Foundation';
      harmonyQuote = 'Water nurtures the Earth, creating an unbreakable, deeply rooted bond';
      score = 100;
      break;
    case 'Earth & Earth':
      harmonyTitle = 'Timeless Sanctuary';
      harmonyQuote = 'Unshakable loyalty, supreme peace, and enduring mutual devotion';
      score = 97;
      break;
    case 'Water & Water':
      harmonyTitle = 'Infinite Depths';
      harmonyQuote = 'Telepathic emotional intuition, profound empathy, and poetic union';
      score = 98;
      break;
    case 'Air & Air':
      harmonyTitle = 'Mind & Soul Symphony';
      harmonyQuote = 'Playful intellect, effortless laughter, and celestial harmony';
      score = 95;
      break;
    case 'Fire & Water':
      harmonyTitle = 'Steam & Alchemy';
      harmonyQuote = 'Intense emotional magnetic pull — magnetic, transformative, and unforgettable';
      score = 94;
      break;
    case 'Earth & Fire':
      harmonyTitle = 'Creative Crucible';
      harmonyQuote = 'Earth grounds the flame into lasting works of beauty and devotion';
      score = 93;
      break;
    case 'Air & Earth':
      harmonyTitle = 'Sky & Horizon';
      harmonyQuote = 'Practical wisdom meets boundless imagination';
      score = 92;
      break;
    case 'Air & Water':
      harmonyTitle = 'Misty Aurora';
      harmonyQuote = 'Gentle dreams, artistic synchronicity, and romantic whispers';
      score = 94;
      break;
  }

  return {
    s1,
    s2,
    elements,
    harmonyTitle,
    harmonyQuote,
    score
  };
}

/**
 * Renders the Zodiac Soulmate Constellation Fusion directly onto canvas
 * Beautifully positioned in the upper region or arched above the portraits
 */
export function drawZodiacFusion(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: ZodiacFusionConfig,
  progress: number = 1.0
) {
  if (!config.enabled || progress <= 0.05) return;

  const s1 = ZODIAC_SIGNS[config.partner1Sign] || ZODIAC_SIGNS.leo;
  const s2 = ZODIAC_SIGNS[config.partner2Sign] || ZODIAC_SIGNS.scorpio;
  const harmony = calculateZodiacHarmony(config.partner1Sign, config.partner2Sign);

  // Palettes
  const isGold = config.style === 'gilded_gold';
  const isCrimson = config.style === 'romantic_crimson';

  const goldColor = isGold ? '#d4af37' : isCrimson ? '#e11d48' : '#38bdf8';
  const ribbonColor = isGold ? 'rgba(212, 175, 55, 0.55)' : isCrimson ? 'rgba(225, 29, 72, 0.5)' : 'rgba(56, 189, 248, 0.5)';
  const starGlow = isGold ? 'rgba(255, 215, 0, 0.4)' : isCrimson ? 'rgba(251, 113, 133, 0.4)' : 'rgba(56, 189, 248, 0.4)';
  const starCore = '#ffffff';

  ctx.save();

  // Position two constellations side by side in the upper crest
  const centerY = height * 0.16;
  const boxW = Math.min(width * 0.28, 170);
  const boxH = boxW * 0.75;

  const leftCenterX = width * 0.28;
  const rightCenterX = width * 0.72;
  const knotCenterX = width / 2;

  // 1. GOLDEN INFINITY KNOT / LINKAGE RIBBON CONNECTING THE TWO SIGNS
  if (config.showInfinityKnot && progress > 0.15) {
    ctx.save();
    ctx.strokeStyle = ribbonColor;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([3, 4]);

    const ribbonAlpha = Math.min(1, progress * 1.5);
    ctx.beginPath();
    // Flowing elegant bezier curve connecting left constellation to right
    ctx.moveTo(leftCenterX + boxW * 0.4, centerY);
    ctx.bezierCurveTo(
      knotCenterX - 30, centerY - 25,
      knotCenterX - 20, centerY + 25,
      knotCenterX, centerY
    );
    ctx.bezierCurveTo(
      knotCenterX + 20, centerY - 25,
      knotCenterX + 30, centerY + 25,
      rightCenterX - boxW * 0.4, centerY
    );
    ctx.stroke();

    // Central Golden Love Knot / Heart Icon
    ctx.setLineDash([]);
    ctx.font = '600 13px Georgia, serif';
    ctx.fillStyle = goldColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('∞', knotCenterX, centerY - 2);

    ctx.restore();
  }

  // 2. HELPER TO DRAW A ZODIAC CONSTELLATION BOX
  const renderConstellation = (
    sign: ZodiacSign,
    ox: number,
    oy: number,
    labelAlign: 'right' | 'left'
  ) => {
    ctx.save();
    const starMap = new Map<string, { x: number; y: number; mag: number; name?: string }>();

    for (const st of sign.stars) {
      const px = ox - boxW / 2 + (st.x / 100) * boxW;
      const py = oy - boxH / 2 + (st.y / 100) * boxH;
      starMap.set(st.id, { x: px, y: py, mag: st.mag, name: st.name });
    }

    // Draw dashed constellation lines
    ctx.strokeStyle = ribbonColor;
    ctx.lineWidth = 0.9;
    ctx.setLineDash([2, 3]);

    for (const [fromId, toId] of sign.lines) {
      const p1 = starMap.get(fromId);
      const p2 = starMap.get(toId);
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    // Draw individual stars
    for (const [_, st] of starMap) {
      const size = Math.max(1.0, 3.2 - st.mag * 0.5);

      // Glow
      const glow = ctx.createRadialGradient(st.x, st.y, 0, st.x, st.y, size * 3);
      glow.addColorStop(0, starGlow);
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(st.x, st.y, size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = starCore;
      ctx.beginPath();
      ctx.arc(st.x, st.y, size, 0, Math.PI * 2);
      ctx.fill();

      // Major Star Annotation
      if (st.name && st.mag <= 1.5) {
        ctx.font = 'italic 400 8.5px Georgia, serif';
        ctx.fillStyle = goldColor;
        ctx.textAlign = 'center';
        ctx.fillText(st.name, st.x, st.y - size - 3);
      }
    }

    // Zodiac Glyph & Latin Name Header
    ctx.font = 'bold 11px Georgia, serif';
    ctx.fillStyle = goldColor;
    ctx.textAlign = 'center';
    ctx.fillText(`${sign.symbol}  ${sign.name.toUpperCase()}`, ox, oy + boxH / 2 + 12);

    ctx.font = 'italic 400 9px "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(161, 161, 170, 0.85)';
    ctx.fillText(sign.element + ' • ' + sign.dateRange, ox, oy + boxH / 2 + 24);

    ctx.restore();
  };

  // Render both partners' constellations
  renderConstellation(s1, leftCenterX, centerY, 'right');
  renderConstellation(s2, rightCenterX, centerY, 'left');

  // 3. ELEMENTAL HARMONY PLAQUE
  if (config.showCompatibility && progress > 0.4) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const plaqueY = centerY - boxH / 2 - 14;

    ctx.font = '600 10.5px Georgia, serif';
    ctx.fillStyle = goldColor;
    ctx.fillText(`★  ${harmony.harmonyTitle.toUpperCase()}  ★  (${harmony.score}% HARMONY)`, knotCenterX, plaqueY);

    ctx.font = 'italic 400 9px Georgia, serif';
    ctx.fillStyle = 'rgba(161, 161, 170, 0.75)';
    ctx.fillText(`"${harmony.harmonyQuote}"`, knotCenterX, plaqueY + 13);

    ctx.restore();
  }

  ctx.restore();
}

