// Celestial Night Sky Constellation & Star Map Engine for Anniversaries
// Computes real astronomical star projections & renders luxury gilded constellation charts

export interface CelestialMapConfig {
  enabled: boolean;
  date: string; // YYYY-MM-DD
  locationName: string; // e.g. "Paris, France"
  latitude: number; // degrees north/south
  longitude: number; // degrees east/west
  occasionText: string; // e.g. "The Night We Met", "Our Wedding Night", "Stars Aligned"
  style: 'gilded_gold' | 'indigo_starlight' | 'sepia_astronomy' | 'rose_gold';
  showConstellationLines: boolean;
  showCoordinatesRing: boolean;
  starDustIntensity: number; // 0 to 1
}

export const POPULAR_LOCATIONS: { name: string; lat: number; lng: number }[] = [
  { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
  { name: 'New York, USA', lat: 40.7128, lng: -74.006 },
  { name: 'Rome, Italy', lat: 41.9028, lng: 12.4964 },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Venice, Italy', lat: 45.4408, lng: 12.3155 },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708 },
  { name: 'Santorini, Greece', lat: 36.3932, lng: 25.4615 },
  { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
  { name: 'Los Angeles, USA', lat: 34.0522, lng: -118.2437 },
  { name: 'Honolulu, Hawaii', lat: 21.3069, lng: -157.8583 },
  { name: 'Bali, Indonesia', lat: -8.4095, lng: 115.1889 }
];

export const OCCASION_PRESETS = [
  'The Night Our Stars Aligned',
  'The Night We Met',
  'Our Wedding Night',
  'The Day You Were Born',
  'When We Said Yes',
  'Under This Sky'
];

export const DEFAULT_CELESTIAL_CONFIG: CelestialMapConfig = {
  enabled: true,
  date: new Date().toISOString().split('T')[0],
  locationName: 'Paris, France',
  latitude: 48.8566,
  longitude: 2.3522,
  occasionText: 'The Night Our Stars Aligned',
  style: 'gilded_gold',
  showConstellationLines: true,
  showCoordinatesRing: true,
  starDustIntensity: 0.85
};

// Core Astronomical Catalog: Major Stars & Constellations
// RA in hours (0-24), Dec in degrees (-90 to +90), Mag (magnitude, lower = brighter)
interface Star {
  id: string;
  name?: string;
  ra: number; // 0 to 24 hours
  dec: number; // -90 to +90 degrees
  mag: number; // -1.5 to 5.0
  color?: string;
}

interface Constellation {
  name: string;
  latin: string;
  lines: [string, string][]; // Pairs of star IDs to connect
}

const STAR_CATALOG: Star[] = [
  // Ursa Major (Big Dipper)
  { id: 'dubhe', name: 'Dubhe', ra: 11.06, dec: 61.75, mag: 1.8 },
  { id: 'merak', name: 'Merak', ra: 11.03, dec: 56.38, mag: 2.3 },
  { id: 'phecda', name: 'Phecda', ra: 11.9, dec: 53.69, mag: 2.4 },
  { id: 'megrez', name: 'Megrez', ra: 12.25, dec: 57.03, mag: 3.3 },
  { id: 'alioth', name: 'Alioth', ra: 12.9, dec: 55.96, mag: 1.8 },
  { id: 'mizar', name: 'Mizar', ra: 13.4, dec: 54.92, mag: 2.2 },
  { id: 'alkaid', name: 'Alkaid', ra: 13.8, dec: 49.31, mag: 1.9 },

  // Ursa Minor (Little Dipper & Polaris)
  { id: 'polaris', name: 'Polaris (North Star)', ra: 2.53, dec: 89.26, mag: 1.98 },
  { id: 'kochab', name: 'Kochab', ra: 14.85, dec: 74.16, mag: 2.08 },
  { id: 'pherkad', name: 'Pherkad', ra: 15.35, dec: 71.83, mag: 3.0 },

  // Orion
  { id: 'betelgeuse', name: 'Betelgeuse', ra: 5.92, dec: 7.41, mag: 0.5, color: '#ffb380' },
  { id: 'rigel', name: 'Rigel', ra: 5.24, dec: -8.2, mag: 0.18, color: '#d0e0ff' },
  { id: 'bellatrix', name: 'Bellatrix', ra: 5.42, dec: 6.35, mag: 1.64 },
  { id: 'saiph', name: 'Saiph', ra: 5.79, dec: -9.67, mag: 2.07 },
  { id: 'alnitak', name: 'Alnitak', ra: 5.68, dec: -1.94, mag: 1.74 },
  { id: 'alnilam', name: 'Alnilam', ra: 5.6, dec: -1.2, mag: 1.69 },
  { id: 'mintaka', name: 'Mintaka', ra: 5.53, dec: -0.3, mag: 2.25 },

  // Cassiopeia
  { id: 'schedar', name: 'Schedar', ra: 0.68, dec: 56.54, mag: 2.24 },
  { id: 'caph', name: 'Caph', ra: 0.15, dec: 59.15, mag: 2.28 },
  { id: 'gamma_cas', name: 'Navi', ra: 0.94, dec: 60.72, mag: 2.15 },
  { id: 'ruchbah', name: 'Ruchbah', ra: 1.43, dec: 60.23, mag: 2.68 },
  { id: 'segin', name: 'Segin', ra: 1.9, dec: 63.67, mag: 3.35 },

  // Cygnus (The Swan / Northern Cross)
  { id: 'deneb', name: 'Deneb', ra: 20.69, dec: 45.28, mag: 1.25, color: '#e8f0ff' },
  { id: 'albireo', name: 'Albireo', ra: 19.51, dec: 27.96, mag: 3.05 },
  { id: 'sadr', name: 'Sadr', ra: 20.37, dec: 40.26, mag: 2.23 },
  { id: 'gienah_cyg', name: 'Gienah', ra: 20.77, dec: 33.97, mag: 2.72 },
  { id: 'delta_cyg', name: 'Fawaris', ra: 19.75, dec: 45.13, mag: 2.87 },

  // Lyra
  { id: 'vega', name: 'Vega', ra: 18.62, dec: 38.78, mag: 0.03, color: '#ebf4ff' },
  { id: 'sheliak', name: 'Sheliak', ra: 18.83, dec: 33.36, mag: 3.52 },
  { id: 'sulafat', name: 'Sulafat', ra: 18.98, dec: 32.69, mag: 3.25 },
  { id: 'delta_lyr', name: 'Delta Lyrae', ra: 18.9, dec: 36.9, mag: 4.3 },

  // Aquila
  { id: 'altair', name: 'Altair', ra: 19.84, dec: 8.87, mag: 0.77, color: '#f0f5ff' },
  { id: 'tarazed', name: 'Tarazed', ra: 19.77, dec: 10.61, mag: 2.72 },
  { id: 'alshain', name: 'Alshain', ra: 19.92, dec: 6.41, mag: 3.71 },

  // Canis Major
  { id: 'sirius', name: 'Sirius', ra: 6.75, dec: -16.72, mag: -1.46, color: '#ffffff' },
  { id: 'mirzam', name: 'Mirzam', ra: 6.38, dec: -17.96, mag: 1.98 },
  { id: 'wezen', name: 'Wezen', ra: 7.14, dec: -26.39, mag: 1.83 },
  { id: 'adhara', name: 'Adhara', ra: 6.98, dec: -28.97, mag: 1.5 },

  // Taurus & Pleiades
  { id: 'aldebaran', name: 'Aldebaran', ra: 4.6, dec: 16.51, mag: 0.85, color: '#ffc499' },
  { id: 'elnath', name: 'Elnath', ra: 5.44, dec: 28.61, mag: 1.65 },
  { id: 'pleiades_alcyone', name: 'Alcyone', ra: 3.79, dec: 24.11, mag: 2.85, color: '#a0c8ff' },
  { id: 'pleiades_electra', name: 'Electra', ra: 3.74, dec: 24.1, mag: 3.7 },
  { id: 'pleiades_maia', name: 'Maia', ra: 3.76, dec: 24.37, mag: 3.87 },

  // Boötes
  { id: 'arcturus', name: 'Arcturus', ra: 14.26, dec: 19.18, mag: -0.05, color: '#ffd2a1' },
  { id: 'izark', name: 'Izar', ra: 14.75, dec: 27.07, mag: 2.37 },
  { id: 'muphrid', name: 'Muphrid', ra: 13.91, dec: 18.39, mag: 2.68 },

  // Crux (Southern Cross)
  { id: 'acrux', name: 'Acrux', ra: 12.44, dec: -63.1, mag: 0.77, color: '#c0d8ff' },
  { id: 'mimosa', name: 'Becrux (Mimosa)', ra: 12.79, dec: -59.69, mag: 1.25 },
  { id: 'gacrux', name: 'Gacrux', ra: 12.52, dec: -57.11, mag: 1.64, color: '#ffb080' },
  { id: 'delta_cru', name: 'Imai', ra: 12.25, dec: -58.75, mag: 2.79 },

  // Leo
  { id: 'regulus', name: 'Regulus', ra: 10.14, dec: 11.97, mag: 1.36, color: '#e0ecff' },
  { id: 'denebola', name: 'Denebola', ra: 11.82, dec: 14.57, mag: 2.14 },
  { id: 'algieba', name: 'Algieba', ra: 10.33, dec: 19.84, mag: 2.01 },
  { id: 'zisma', name: 'Zosma', ra: 11.24, dec: 20.52, mag: 2.56 },

  // Andromeda & Pegasus
  { id: 'alpheratz', name: 'Alpheratz', ra: 0.14, dec: 29.09, mag: 2.07 },
  { id: 'mirach', name: 'Mirach', ra: 1.16, dec: 35.62, mag: 2.07 },
  { id: 'almach', name: 'Almach', ra: 2.06, dec: 42.33, mag: 2.1 },
  { id: 'scheat', name: 'Scheat', ra: 23.06, dec: 28.08, mag: 2.44 },
  { id: 'markab', name: 'Markab', ra: 23.08, dec: 15.21, mag: 2.49 },
  { id: 'algenib', name: 'Algenib', ra: 0.22, dec: 15.18, mag: 2.84 }
];

const CONSTELLATIONS: Constellation[] = [
  {
    name: 'Ursa Major (Big Dipper)',
    latin: 'Ursa Major',
    lines: [
      ['dubhe', 'merak'],
      ['merak', 'phecda'],
      ['phecda', 'megrez'],
      ['megrez', 'dubhe'],
      ['megrez', 'alioth'],
      ['alioth', 'mizar'],
      ['mizar', 'alkaid']
    ]
  },
  {
    name: 'Orion',
    latin: 'Orion',
    lines: [
      ['betelgeuse', 'bellatrix'],
      ['bellatrix', 'mintaka'],
      ['mintaka', 'alnilam'],
      ['alnilam', 'alnitak'],
      ['alnitak', 'saiph'],
      ['saiph', 'rigel'],
      ['rigel', 'mintaka'],
      ['alnitak', 'betelgeuse']
    ]
  },
  {
    name: 'Cassiopeia',
    latin: 'Cassiopeia',
    lines: [
      ['caph', 'schedar'],
      ['schedar', 'gamma_cas'],
      ['gamma_cas', 'ruchbah'],
      ['ruchbah', 'segin']
    ]
  },
  {
    name: 'Cygnus (The Swan)',
    latin: 'Cygnus',
    lines: [
      ['deneb', 'sadr'],
      ['sadr', 'albireo'],
      ['sadr', 'gienah_cyg'],
      ['sadr', 'delta_cyg']
    ]
  },
  {
    name: 'Lyra',
    latin: 'Lyra',
    lines: [
      ['vega', 'sheliak'],
      ['sheliak', 'sulafat'],
      ['sulafat', 'delta_lyr'],
      ['delta_lyr', 'vega']
    ]
  },
  {
    name: 'Summer Triangle (Navigational)',
    latin: 'Asterism',
    lines: [
      ['vega', 'deneb'],
      ['deneb', 'altair'],
      ['altair', 'vega']
    ]
  },
  {
    name: 'Canis Major',
    latin: 'Canis Major',
    lines: [
      ['sirius', 'mirzam'],
      ['sirius', 'wezen'],
      ['wezen', 'adhara']
    ]
  },
  {
    name: 'Taurus',
    latin: 'Taurus',
    lines: [
      ['aldebaran', 'elnath'],
      ['aldebaran', 'pleiades_alcyone']
    ]
  },
  {
    name: 'Pleiades (Seven Sisters)',
    latin: 'Open Cluster',
    lines: [
      ['pleiades_alcyone', 'pleiades_electra'],
      ['pleiades_alcyone', 'pleiades_maia']
    ]
  },
  {
    name: 'Crux (Southern Cross)',
    latin: 'Crux',
    lines: [
      ['acrux', 'gacrux'],
      ['mimosa', 'delta_cru']
    ]
  },
  {
    name: 'Great Square of Pegasus',
    latin: 'Pegasus',
    lines: [
      ['alpheratz', 'scheat'],
      ['scheat', 'markab'],
      ['markab', 'algenib'],
      ['algenib', 'alpheratz']
    ]
  },
  {
    name: 'Andromeda',
    latin: 'Andromeda',
    lines: [
      ['alpheratz', 'mirach'],
      ['mirach', 'almach']
    ]
  }
];

// Helper: Calculate Local Sidereal Time (LST) based on date and longitude
function calculateLST(dateStr: string, longitude: number): number {
  const d = new Date(dateStr + 'T22:00:00Z'); // Assumes romantic evening at 10 PM
  const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const dDays = (d.getTime() - J2000) / 86400000;

  // Greenwich Mean Sidereal Time (GMST) in hours
  let gmst = 18.697374558 + 24.06570982441908 * dDays;
  gmst = ((gmst % 24) + 24) % 24;

  // Local Sidereal Time = GMST + Longitude / 15
  let lst = gmst + longitude / 15;
  return ((lst % 24) + 24) % 24;
}

// Convert Geographical coordinates to format: "48°51'24\"N 2°21'07\"E"
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';

  const absLat = Math.abs(lat);
  const latDeg = Math.floor(absLat);
  const latMin = Math.floor((absLat - latDeg) * 60);
  const latSec = Math.round(((absLat - latDeg) * 60 - latMin) * 60);

  const absLng = Math.abs(lng);
  const lngDeg = Math.floor(absLng);
  const lngMin = Math.floor((absLng - lngDeg) * 60);
  const lngSec = Math.round(((absLng - lngDeg) * 60 - lngMin) * 60);

  return `${latDeg}°${latMin}'${latSec}"${latDir}  ${lngDeg}°${lngMin}'${lngSec}"${lngDir}`;
}

export function formatAnniversaryDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase();
  } catch {
    return dateStr;
  }
}

// Palettes for Star Map Layer
const CELESTIAL_STYLES = {
  gilded_gold: {
    ringColor: 'rgba(212, 175, 55, 0.45)',
    ringBorder: 'rgba(212, 175, 55, 0.75)',
    constellationLine: 'rgba(212, 175, 55, 0.35)',
    starBright: '#fff4cc',
    starGlow: 'rgba(255, 215, 0, 0.45)',
    textPrimary: '#9e7d23',
    textSecondary: 'rgba(158, 125, 35, 0.7)',
    stippleColor: 'rgba(212, 175, 55, 0.28)'
  },
  indigo_starlight: {
    ringColor: 'rgba(56, 189, 248, 0.35)',
    ringBorder: 'rgba(14, 165, 233, 0.65)',
    constellationLine: 'rgba(56, 189, 248, 0.3)',
    starBright: '#ffffff',
    starGlow: 'rgba(56, 189, 248, 0.45)',
    textPrimary: '#0284c7',
    textSecondary: 'rgba(2, 132, 199, 0.7)',
    stippleColor: 'rgba(56, 189, 248, 0.22)'
  },
  sepia_astronomy: {
    ringColor: 'rgba(139, 90, 43, 0.4)',
    ringBorder: 'rgba(112, 66, 20, 0.7)',
    constellationLine: 'rgba(139, 90, 43, 0.32)',
    starBright: '#fff6e6',
    starGlow: 'rgba(180, 120, 60, 0.4)',
    textPrimary: '#5c3a21',
    textSecondary: 'rgba(92, 58, 33, 0.7)',
    stippleColor: 'rgba(139, 90, 43, 0.25)'
  },
  rose_gold: {
    ringColor: 'rgba(244, 114, 182, 0.4)',
    ringBorder: 'rgba(225, 29, 72, 0.65)',
    constellationLine: 'rgba(251, 113, 133, 0.35)',
    starBright: '#fff0f5',
    starGlow: 'rgba(244, 63, 94, 0.4)',
    textPrimary: '#be123c',
    textSecondary: 'rgba(190, 18, 60, 0.7)',
    stippleColor: 'rgba(244, 114, 182, 0.25)'
  }
};

/**
 * Renders the Celestial Star Map Layer directly onto a canvas context.
 * Can be drawn as an atmospheric background behind portraits or inside a gilded circular astrolabe.
 */
export function drawCelestialStarMap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: CelestialMapConfig,
  revealProgress: number = 1.0 // 0 to 1
) {
  if (!config.enabled || revealProgress <= 0) return;

  const style = CELESTIAL_STYLES[config.style] || CELESTIAL_STYLES.gilded_gold;
  const lst = calculateLST(config.date, config.longitude);

  // Position the Celestial Disk in the upper-mid region behind faces
  const centerX = width / 2;
  const centerY = height * 0.40;
  const radius = Math.min(width * 0.44, height * 0.36);

  ctx.save();

  // Project Stars using Stereographic Polar Projection
  const projectedStars = new Map<string, { x: number; y: number; r: number; mag: number; name?: string; color?: string }>();

  for (const s of STAR_CATALOG) {
    // Hour Angle (HA) in radians = LST - RA
    const ha = (lst - s.ra) * (Math.PI / 12);
    // Declination in radians
    const decRad = s.dec * (Math.PI / 180);
    const latRad = config.latitude * (Math.PI / 180);

    // Altitude (a) & Azimuth (A)
    const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(ha);
    const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));

    // Visible stars only (above horizon or within artistic twilight cushion)
    if (alt >= -0.15) {
      const cosAlt = Math.cos(alt);
      const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / (cosAlt * Math.cos(latRad));
      const az = Math.acos(Math.max(-1, Math.min(1, cosAz))) * (Math.sin(ha) > 0 ? -1 : 1);

      // Polar radius from zenith center (0 at top, 1 at horizon)
      const zenithDist = (Math.PI / 2 - alt) / (Math.PI / 2 + 0.15);
      const r = Math.min(1.0, Math.max(0.04, zenithDist)) * (radius * 0.92);

      const px = centerX + r * Math.sin(az);
      const py = centerY - r * Math.cos(az);

      projectedStars.set(s.id, {
        x: px,
        y: py,
        r,
        mag: s.mag,
        name: s.name,
        color: s.color
      });
    }
  }

  // 1. DRAW SUBTLE MILKY WAY & BACKGROUND STARDUST NEBULA
  if (config.starDustIntensity > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    // Soft celestial gradient disk
    const diskGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius);
    diskGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    diskGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.02)');
    diskGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = diskGrad;
    ctx.fill();

    // Deterministic golden stardust particles
    ctx.fillStyle = style.stippleColor;
    const seedDate = config.date.replace(/-/g, '');
    let seed = parseInt(seedDate.slice(-4) || '1234', 10);
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const stardustCount = Math.floor(180 * config.starDustIntensity * Math.min(1, revealProgress * 1.5));
    for (let i = 0; i < stardustCount; i++) {
      const angle = random() * Math.PI * 2;
      const dist = Math.sqrt(random()) * (radius * 0.94);
      const sx = centerX + dist * Math.cos(angle);
      const sy = centerY + dist * Math.sin(angle);
      const sRadius = 0.4 + random() * 1.1;

      ctx.beginPath();
      ctx.arc(sx, sy, sRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 2. CELESTIAL COORDINATE RINGS & CARDINAL MARKS
  if (config.showCoordinatesRing && revealProgress > 0.1) {
    const ringAlpha = Math.min(1, revealProgress * 1.3);
    ctx.save();

    // Outer Dual Coordinate Rings
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = style.ringBorder;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 0.6;
    ctx.strokeStyle = style.ringColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 6, 0, Math.PI * 2);
    ctx.stroke();

    // Concentric Declination rings
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 5]);
    ctx.strokeStyle = style.ringColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.66, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.33, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Outer Degree Hash Ticks (Every 10 degrees)
    for (let deg = 0; deg < 360; deg += 10) {
      const rad = (deg * Math.PI) / 180;
      const isMajor = deg % 30 === 0;
      const tickLen = isMajor ? 7 : 4;
      const x1 = centerX + radius * Math.cos(rad);
      const y1 = centerY + radius * Math.sin(rad);
      const x2 = centerX + (radius - tickLen) * Math.cos(rad);
      const y2 = centerY + (radius - tickLen) * Math.sin(rad);

      ctx.lineWidth = isMajor ? 1.0 : 0.5;
      ctx.strokeStyle = isMajor ? style.ringBorder : style.ringColor;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Cardinal Points (N, S, E, W)
    ctx.font = '600 10px Georgia, "Times New Roman", serif';
    ctx.fillStyle = style.textPrimary;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', centerX, centerY - radius + 14);
    ctx.fillText('S', centerX, centerY + radius - 14);
    ctx.fillText('E', centerX + radius - 14, centerY);
    ctx.fillText('W', centerX - radius + 14, centerY);

    ctx.restore();
  }

  // 3. CONSTELLATION LINES (Hand-Drawn Gilded Astrolabe Aesthetic)
  if (config.showConstellationLines && revealProgress > 0.2) {
    ctx.save();
    ctx.strokeStyle = style.constellationLine;
    ctx.lineWidth = 0.9;
    ctx.setLineDash([3, 4]);

    for (const c of CONSTELLATIONS) {
      for (const [fromId, toId] of c.lines) {
        const p1 = projectedStars.get(fromId);
        const p2 = projectedStars.get(toId);
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  // 4. INDIVIDUAL STARS WITH REAL MAGNITUDE & METALLIC SHINE
  if (revealProgress > 0.15) {
    ctx.save();
    for (const [_, star] of projectedStars) {
      // Calculate dot radius based on magnitude (brighter = larger)
      // Mag -1.5 -> 3.8px, Mag 1.0 -> 2.6px, Mag 3.5 -> 1.2px
      const baseSize = Math.max(0.8, 3.2 - star.mag * 0.55);
      const starAlpha = Math.min(1, revealProgress * 1.4);

      // Star soft glow
      if (star.mag <= 2.2) {
        const glowGrad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, baseSize * 3.5);
        glowGrad.addColorStop(0, style.starGlow);
        glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(star.x, star.y, baseSize * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bright Stars 4-point cross diffraction spikes (Sirius, Betelgeuse, Vega, Polaris)
      if (star.mag <= 0.8) {
        ctx.strokeStyle = style.ringBorder;
        ctx.lineWidth = 0.6;
        const spikeLen = baseSize * 4.2;
        ctx.beginPath();
        ctx.moveTo(star.x - spikeLen, star.y);
        ctx.lineTo(star.x + spikeLen, star.y);
        ctx.moveTo(star.x, star.y - spikeLen);
        ctx.lineTo(star.x, star.y + spikeLen);
        ctx.stroke();
      }

      // Star core
      ctx.fillStyle = star.color || style.starBright;
      ctx.beginPath();
      ctx.arc(star.x, star.y, baseSize, 0, Math.PI * 2);
      ctx.fill();

      // Major Named Star Annotations (Very delicate cursive)
      if (star.mag <= 1.0 && star.name) {
        ctx.font = 'italic 400 9px Georgia, "Times New Roman", serif';
        ctx.fillStyle = style.textSecondary;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(star.name, star.x + baseSize + 4, star.y - 1);
      }
    }
    ctx.restore();
  }

  // 5. ROMANTIC ASTRONOMICAL DEDICATION PLAQUE
  // Placed elegantly at the lower celestial perimeter
  if (revealProgress > 0.4) {
    ctx.save();
    const plaqueY = centerY + radius + 22;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Romantic Header (e.g. "★ THE NIGHT OUR STARS ALIGNED ★")
    ctx.font = '600 11px Georgia, "Times New Roman", serif';
    ctx.fillStyle = style.textPrimary;
    ctx.letterSpacing = '2px';
    ctx.fillText(`★  ${config.occasionText.toUpperCase()}  ★`, centerX, plaqueY);

    // Date & Location Coordinates
    ctx.font = '400 10px "Segoe UI", Helvetica, Arial, sans-serif';
    ctx.fillStyle = style.textSecondary;
    const formattedDate = formatAnniversaryDate(config.date);
    const coordsStr = formatCoordinates(config.latitude, config.longitude);

    ctx.fillText(`${formattedDate}  •  ${config.locationName.toUpperCase()}`, centerX, plaqueY + 16);
    ctx.font = '300 9px monospace';
    ctx.fillText(coordsStr, centerX, plaqueY + 30);

    ctx.restore();
  }

  ctx.restore();
}
