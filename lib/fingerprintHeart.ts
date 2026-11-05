// Micro-Calligraphy Fingerprint Heart Seal Engine
// Creates two interlocking thumbprints forming a romantic heart,
// with friction ridges formed entirely out of microscopic cursive love vows

export interface FingerprintHeartConfig {
  enabled: boolean;
  inkColor: 'burgundy' | 'gold_leaf' | 'charcoal' | 'sapphire';
  partnerNames: string; // e.g. "Sophia & Lucas"
  vowPhrase: string; // e.g. "Two souls intertwined across all lifetimes"
  anniversaryDate: string; // e.g. "2023-10-14"
  position: 'bottom_center' | 'bottom_right' | 'bottom_left';
  showSealBorder: boolean;
  scale: number; // 0.8 to 1.3
}

export const DEFAULT_FINGERPRINT_CONFIG: FingerprintHeartConfig = {
  enabled: false,
  inkColor: 'burgundy',
  partnerNames: 'Sophia & Lucas',
  vowPhrase: 'Two lives, one soul, forever intertwined',
  anniversaryDate: new Date().toISOString().split('T')[0],
  position: 'bottom_center',
  showSealBorder: true,
  scale: 1.0
};

const INK_PALETTES = {
  burgundy: {
    primary: '#9f1239', // Rich crimson wax/fingerprint ink
    glow: 'rgba(159, 18, 57, 0.25)',
    border: 'rgba(159, 18, 57, 0.45)',
    subtle: 'rgba(159, 18, 57, 0.65)'
  },
  gold_leaf: {
    primary: '#d4af37', // 24K gold foil
    glow: 'rgba(212, 175, 55, 0.35)',
    border: 'rgba(212, 175, 55, 0.6)',
    subtle: 'rgba(212, 175, 55, 0.7)'
  },
  charcoal: {
    primary: '#27272a', // Classic archival graphite
    glow: 'rgba(39, 39, 42, 0.2)',
    border: 'rgba(39, 39, 42, 0.4)',
    subtle: 'rgba(39, 39, 42, 0.65)'
  },
  sapphire: {
    primary: '#1e3a8a', // Royal midnight blue ink
    glow: 'rgba(30, 58, 138, 0.25)',
    border: 'rgba(30, 58, 138, 0.5)',
    subtle: 'rgba(30, 58, 138, 0.7)'
  }
};

const MICRO_VOW_FRAGMENTS = [
  'forever & always',
  'my heart is yours',
  'je t\'aime',
  'two souls intertwined',
  'ti amo per sempre',
  'te amo con todo mi corazon',
  'i found my home in you',
  'across all lifetimes',
  'bound by destiny',
  'unconditional love',
  'soulmate',
  'in every universe'
];

/**
 * Draws the Micro-Calligraphy Fingerprint Heart Seal
 */
export function drawFingerprintHeartSeal(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  config: FingerprintHeartConfig,
  revealProgress: number = 1.0
) {
  if (!config.enabled || revealProgress <= 0.05) return;

  const palette = INK_PALETTES[config.inkColor] || INK_PALETTES.burgundy;
  const baseScale = (config.scale || 1.0) * Math.min(canvasWidth / 800, 1.0);

  // Determine anchor coordinates
  let centerX = canvasWidth / 2;
  let centerY = canvasHeight * 0.88;

  if (config.position === 'bottom_right') {
    centerX = canvasWidth - 110 * baseScale;
    centerY = canvasHeight - 95 * baseScale;
  } else if (config.position === 'bottom_left') {
    centerX = 110 * baseScale;
    centerY = canvasHeight - 95 * baseScale;
  }

  const heartRadius = 46 * baseScale;

  ctx.save();
  ctx.translate(centerX, centerY);

  // 1. EMBOSSED WAX / ROYAL SEAL BORDER OVAL
  if (config.showSealBorder && revealProgress > 0.1) {
    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = palette.border;
    ctx.beginPath();
    ctx.ellipse(0, 0, heartRadius * 1.55, heartRadius * 1.4, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 0.6;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.ellipse(0, 0, heartRadius * 1.45, heartRadius * 1.3, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // 2. DRAW TWO INTERLOCKING THUMBPRINTS FORMING A HEART
  // Left thumbprint rotated at +25 degrees, Right thumbprint at -25 degrees
  const drawThumbprintWhorls = (tiltAngle: number, shiftX: number, isLeft: boolean) => {
    ctx.save();
    ctx.translate(shiftX, -4 * baseScale);
    ctx.rotate((tiltAngle * Math.PI) / 180);

    const ridgesCount = 11;
    for (let r = 1; r <= ridgesCount; r++) {
      const rx = (r / ridgesCount) * heartRadius * 0.72;
      const ry = (r / ridgesCount) * heartRadius * 1.15;

      // Draw the friction ridge with tiny cursive vow words
      ctx.save();
      ctx.strokeStyle = palette.primary;
      ctx.lineWidth = 0.85;

      // Realistic fingerprint ridge discontinuity & arching
      ctx.beginPath();
      // Draw semi-ellipse arch
      ctx.ellipse(
        isLeft ? 2 : -2,
        0,
        rx,
        ry,
        0,
        Math.PI * 0.15,
        Math.PI * 1.85
      );
      ctx.stroke();

      // For every 3rd ridge, render fine micro-calligraphy vow letters along the curve
      if (r % 2 === 0 && revealProgress > 0.3) {
        ctx.font = `italic ${Math.max(5.5, 6.5 * baseScale)}px Georgia, serif`;
        ctx.fillStyle = palette.subtle;
        const vowWord = MICRO_VOW_FRAGMENTS[(r + (isLeft ? 0 : 4)) % MICRO_VOW_FRAGMENTS.length];

        ctx.save();
        // Subtle text along the ridge
        ctx.textAlign = 'center';
        ctx.fillText(vowWord, 0, -ry * 0.65);
        ctx.restore();
      }

      ctx.restore();
    }

    ctx.restore();
  };

  // Draw Left and Right interlocking thumbprints
  drawThumbprintWhorls(24, -heartRadius * 0.32, true);
  drawThumbprintWhorls(-24, heartRadius * 0.32, false);

  // 3. ARCHED INSCRIPTION TEXT (Partner Names & Vow)
  if (revealProgress > 0.35) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Partner Names in Royal Cursive
    ctx.font = `600 ${Math.max(9.5, 11 * baseScale)}px Georgia, "Times New Roman", serif`;
    ctx.fillStyle = palette.primary;
    ctx.fillText(config.partnerNames || 'Soulmates Intertwined', 0, heartRadius * 1.05);

    // Vow Phrase or Anniversary Date
    ctx.font = `italic ${Math.max(8, 8.5 * baseScale)}px Georgia, serif`;
    ctx.fillStyle = palette.subtle;
    const subtext = config.anniversaryDate
      ? `"${config.vowPhrase}" • EST. ${config.anniversaryDate.split('-')[0]}`
      : `"${config.vowPhrase}"`;
    ctx.fillText(subtext, 0, heartRadius * 1.25);

    ctx.restore();
  }

  ctx.restore();
}
