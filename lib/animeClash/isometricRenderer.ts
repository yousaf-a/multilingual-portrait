// 2.5D Isometric Rendering Engine for Anime Clash: Neo-Village
// Real isometric projection, depth-sorted 3D geometry, procedural Clash of Clans terrain & buildings

import { BuildingInstance, PlayerVillageState } from './types';

export const ISO_TILE_W = 60;
export const ISO_TILE_H = 30;

// Convert Grid (x, y) to Screen Coordinates (isoX, isoY)
export function toIso(gridX: number, gridY: number, originX: number, originY: number): { x: number; y: number } {
  return {
    x: originX + (gridX - gridY) * (ISO_TILE_W / 2),
    y: originY + (gridX + gridY) * (ISO_TILE_H / 2)
  };
}

// Convert Screen Coordinates back to Grid (x, y)
export function fromIso(screenX: number, screenY: number, originX: number, originY: number): { gridX: number; gridY: number } {
  const dx = screenX - originX;
  const dy = screenY - originY;
  const gridX = Math.floor((dx / (ISO_TILE_W / 2) + dy / (ISO_TILE_H / 2)) / 2);
  const gridY = Math.floor((dy / (ISO_TILE_H / 2) - dx / (ISO_TILE_W / 2)) / 2);
  return { gridX, gridY };
}

/**
 * 1. Draw 2.5D Isometric Lush Grass Terrain with Checkerboard & Forest Border
 */
export function drawIsoTerrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  originX: number,
  originY: number,
  gridSize: number = 12,
  weatherMode: 'day' | 'twilight' | 'night' | 'rain' = 'night',
  animTime: number = 0
) {
  const isNight = weatherMode === 'night';
  const isTwilight = weatherMode === 'twilight';
  const isRain = weatherMode === 'rain';

  // 1. Forest Background surrounding the village clearing
  ctx.fillStyle = isNight
    ? '#050c18'
    : isTwilight
    ? '#2d132c'
    : isRain
    ? '#0d1f18'
    : '#264e1c';
  ctx.fillRect(0, 0, width, height);

  // Soft atmospheric radial lighting on village clearing
  const clearingGlow = ctx.createRadialGradient(
    originX,
    originY + (gridSize * ISO_TILE_H) / 2,
    80,
    originX,
    originY + (gridSize * ISO_TILE_H) / 2,
    width * 0.7
  );

  if (isNight) {
    clearingGlow.addColorStop(0, 'rgba(6, 182, 212, 0.12)');
    clearingGlow.addColorStop(0.7, 'rgba(15, 23, 42, 0.6)');
    clearingGlow.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
  } else if (isTwilight) {
    clearingGlow.addColorStop(0, 'rgba(251, 146, 60, 0.25)');
    clearingGlow.addColorStop(0.7, 'rgba(88, 28, 135, 0.4)');
    clearingGlow.addColorStop(1, 'rgba(30, 10, 45, 0.85)');
  } else if (isRain) {
    clearingGlow.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
    clearingGlow.addColorStop(0.8, 'rgba(10, 30, 25, 0.5)');
    clearingGlow.addColorStop(1, 'rgba(3, 10, 8, 0.9)');
  } else {
    clearingGlow.addColorStop(0, 'rgba(100, 180, 50, 0.25)');
    clearingGlow.addColorStop(0.8, 'rgba(20, 50, 15, 0.4)');
    clearingGlow.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  }
  ctx.fillStyle = clearingGlow;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Isometric Grass Tiles
  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const pos = toIso(gx, gy, originX, originY);
      const isAlt = (gx + gy) % 2 === 0;

      if (isNight) {
        ctx.fillStyle = isAlt ? '#0f2920' : '#0a1e16';
      } else if (isTwilight) {
        ctx.fillStyle = isAlt ? '#854d0e' : '#713f12';
      } else if (isRain) {
        ctx.fillStyle = isAlt ? '#22472b' : '#1b3b23';
      } else {
        ctx.fillStyle = isAlt ? '#5ca32c' : '#529624';
      }

      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x + ISO_TILE_W / 2, pos.y + ISO_TILE_H / 2);
      ctx.lineTo(pos.x, pos.y + ISO_TILE_H);
      ctx.lineTo(pos.x - ISO_TILE_W / 2, pos.y + ISO_TILE_H / 2);
      ctx.closePath();
      ctx.fill();

      // Subtle grid border
      ctx.strokeStyle = isNight
        ? 'rgba(6, 182, 212, 0.12)'
        : isTwilight
        ? 'rgba(251, 146, 60, 0.2)'
        : isRain
        ? 'rgba(56, 189, 248, 0.2)'
        : isAlt
        ? 'rgba(80, 145, 35, 0.35)'
        : 'rgba(70, 130, 30, 0.35)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  // 3. Draw Border Rocks & Pine Trees around perimeter
  ctx.save();
  const borderCoords = [
    { x: -1, y: 3 }, { x: -1, y: 7 }, { x: 3, y: -1 }, { x: 8, y: -1 },
    { x: 12, y: 4 }, { x: 12, y: 8 }, { x: 4, y: 12 }, { x: 9, y: 12 }
  ];

  borderCoords.forEach((b) => {
    const p = toIso(b.x, b.y, originX, originY);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(p.x + 5, p.y + 12, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isNight ? '#061710' : isTwilight ? '#381622' : isRain ? '#0e2617' : '#1c4516';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 28);
    ctx.lineTo(p.x + 12, p.y);
    ctx.lineTo(p.x - 12, p.y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = isNight ? '#0b291d' : isTwilight ? '#581c35' : isRain ? '#173d25' : '#2d6a24';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 38);
    ctx.lineTo(p.x + 9, p.y - 12);
    ctx.lineTo(p.x - 9, p.y - 12);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();

  // 4. Weather Overlays (Rain Streaks & Lanterns)
  if (isRain) {
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.4)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 45; i++) {
      const rx = (Math.sin(i * 99 + animTime * 12) * 0.5 + 0.5) * width;
      const ry = ((i * 35 + animTime * 450) % height);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 3, ry + 12);
      ctx.stroke();
    }
  }
}

/**
 * 2. Draw 3D Isometric Buildings with Shading, Textures & Drop Shadows
 */
export function drawIsoBuilding(
  ctx: CanvasRenderingContext2D,
  b: BuildingInstance,
  originX: number,
  originY: number,
  animTime: number = 0,
  isSelected: boolean = false
) {
  const pos = toIso(b.x, b.y, originX, originY);
  const cx = pos.x;
  const cy = pos.y + ISO_TILE_H / 2;

  ctx.save();

  // 1. Soft Drop Shadow on Grass
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(cx + 8, cy + 6, ISO_TILE_W * 0.45, ISO_TILE_H * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Highlight Ring if Selected
  if (isSelected) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, ISO_TILE_W * 0.55, ISO_TILE_H * 0.7, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 2. Render Specific 3D Building Geometry (Upgrades Visually Per Level)
  switch (b.type) {
    case 'command_core': {
      // Town Hall (Visual Evolution based on b.level)
      if (b.level === 1) {
        // Tier 1: Shonen Outpost Pagoda
        draw3DBox(ctx, cx, cy, 44, 24, 12, '#334155', '#1e293b', '#475569');
        draw3DBox(ctx, cx, cy - 12, 34, 18, 22, '#ea580c', '#c2410c', '#fb923c');

        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 12 - 22 - 18);
        ctx.lineTo(cx + 26, cy - 12 - 22 + 4);
        ctx.lineTo(cx, cy - 12 - 22 + 12);
        ctx.lineTo(cx - 26, cy - 12 - 22 + 4);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#dc2626';
        ctx.fillRect(cx - 3, cy - 62, 6, 12);
        ctx.font = '10px serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('火', cx - 4, cy - 52);
      } else if (b.level === 2) {
        // Tier 2: Two-Tier Fortified Sanctuary
        draw3DBox(ctx, cx, cy, 48, 26, 14, '#1e293b', '#0f172a', '#334155');
        draw3DBox(ctx, cx, cy - 14, 38, 20, 16, '#c2410c', '#9a3412', '#ea580c');

        // Lower Eave
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 36);
        ctx.lineTo(cx + 28, cy - 26);
        ctx.lineTo(cx, cy - 20);
        ctx.lineTo(cx - 28, cy - 26);
        ctx.closePath();
        ctx.fill();

        // Upper Tower & Roof
        draw3DBox(ctx, cx, cy - 34, 26, 14, 16, '#ea580c', '#c2410c', '#fb923c');
        ctx.fillStyle = '#172554';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 68);
        ctx.lineTo(cx + 22, cy - 48);
        ctx.lineTo(cx, cy - 42);
        ctx.lineTo(cx - 22, cy - 48);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glowing Lantern
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(cx, cy - 70, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Tier 3+: Grand Celestial Hokage Citadel (High-Tech Obsidian & Gilded Spire)
        draw3DBox(ctx, cx, cy, 54, 30, 16, '#0f172a', '#020617', '#1e293b');
        draw3DBox(ctx, cx, cy - 16, 42, 22, 18, '#7c2d12', '#431407', '#9a3412');

        // Glowing Chakra Conduits on Foundation
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 20, cy - 8);
        ctx.lineTo(cx, cy - 2);
        ctx.lineTo(cx + 20, cy - 8);
        ctx.stroke();

        // Mid Pagoda Tier
        draw3DBox(ctx, cx, cy - 34, 30, 16, 16, '#ea580c', '#9a3412', '#fb923c');

        // Grand Gilded Roof with Dragon Horns
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.moveTo(cx, cy - 76);
        ctx.lineTo(cx + 32, cy - 50);
        ctx.lineTo(cx, cy - 44);
        ctx.lineTo(cx - 32, cy - 50);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Holographic Celestial Power Core
        const coreGlow = (Math.sin(animTime * 4) + 1) / 2;
        ctx.fillStyle = `rgba(6, 182, 212, ${0.7 + coreGlow * 0.3})`;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx, cy - 82, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      break;
    }

    case 'chakra_turbine': {
      // Elixir / Chakra Vat with Luminous Swirling Fluid
      draw3DBox(ctx, cx, cy, 32, 18, 8, '#334155', '#1e293b', '#475569');

      // Glass Dome (Larger & armored on level 2+)
      const domeR = b.level >= 2 ? 18 : 15;
      const domeY = cy - 12;

      // Glowing Chakra Liquid
      const wave = Math.sin(animTime * 3) * 2;
      const liquidGrad = ctx.createRadialGradient(cx, domeY + wave, 2, cx, domeY, domeR);
      liquidGrad.addColorStop(0, '#67e8f9');
      liquidGrad.addColorStop(0.6, '#06b6d4');
      liquidGrad.addColorStop(1, '#0e7490');

      ctx.fillStyle = liquidGrad;
      ctx.beginPath();
      ctx.arc(cx, domeY, domeR * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Armored Metal Cage if Level >= 2
      if (b.level >= 2) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(cx - domeR, domeY);
        ctx.lineTo(cx + domeR, domeY);
        ctx.moveTo(cx, domeY - domeR);
        ctx.lineTo(cx, domeY + domeR);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, domeY, domeR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 4, domeY - 5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'berry_treasury': {
      // Gold Vault / Berry Treasury with Glowing Gold Coins
      draw3DBox(ctx, cx, cy, 34, 20, 14, '#78350f', '#451a03', '#92400e');

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 14, b.level >= 2 ? 16 : 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (b.level >= 2) {
        // Gemstone insets
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx - 8, cy - 14, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(cx + 8, cy - 14, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sparkling Gold Highlights
      ctx.fillStyle = '#ffffff';
      const spark = (Math.sin(animTime * 4) + 1) / 2;
      ctx.beginPath();
      ctx.arc(cx + 3, cy - 16, 1.5 * spark + 1, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'reishi_siphon': {
      // Spiritual Reishi Siphon (Dark Elixir / Soul Reaper Obelisk)
      draw3DBox(ctx, cx, cy, 28, 16, 6, '#1e1b4b', '#0f172a', '#312e81');

      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.moveTo(cx, cy - (b.level >= 2 ? 42 : 35));
      ctx.lineTo(cx + 10, cy - 8);
      ctx.lineTo(cx, cy - 2);
      ctx.lineTo(cx - 10, cy - 8);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      if (b.level >= 2) {
        // Orbiting Soul Reaper Reishi Ring
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 22, 16, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }

    case 'haki_cannon': {
      // Defensive Cannon with Swiveling Metal Barrel
      draw3DBox(ctx, cx, cy, 30, 18, 10, '#334155', '#1e293b', '#475569');

      const angle = Math.sin(animTime * 1.5) * 0.4 - 0.7;
      ctx.save();
      ctx.translate(cx, cy - 14);
      ctx.rotate(angle);

      if (b.level >= 3) {
        // Level 3+: Twin Heavy Rail Cannons
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-6, -22, 5, 24);
        ctx.fillRect(1, -22, 5, 24);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-6, -22, 5, 24);
        ctx.strokeRect(1, -22, 5, 24);

        // Laser Sighting Line
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.lineTo(0, -60);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Level 1-2: Standard Haki Cannon Barrel
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-4, -18, 8, 20);
        ctx.strokeStyle = b.level >= 2 ? '#fbbf24' : '#dc2626';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-4, -18, 8, 20);
      }

      ctx.fillStyle = b.level >= 2 ? '#fbbf24' : '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'paper_mortar': {
      draw3DBox(ctx, cx, cy, 32, 18, 10, '#475569', '#1e293b', '#64748b');

      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 12, 11, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = b.level >= 2 ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      break;
    }

    case 'defense_wall': {
      // Wall Evolves by Level:
      // Lv 1: Heavy Granite Wall
      // Lv 2: Steel-Plated Wall with Gold Rivets
      // Lv 3: Gilded Titanium Wall
      // Lv 4+: Void Obsidian Magma Barrier
      if (b.level === 1) {
        draw3DBox(ctx, cx, cy, 22, 14, 18, '#64748b', '#334155', '#94a3b8');
      } else if (b.level === 2) {
        draw3DBox(ctx, cx, cy, 24, 15, 20, '#475569', '#1e293b', '#cbd5e1');
        // Rivet dots
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(cx - 6, cy - 16, 2, 2);
        ctx.fillRect(cx + 4, cy - 16, 2, 2);
      } else if (b.level === 3) {
        draw3DBox(ctx, cx, cy, 24, 15, 22, '#d97706', '#92400e', '#fde047');
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy - 18);
        ctx.lineTo(cx, cy - 14);
        ctx.lineTo(cx + 7, cy - 18);
        ctx.stroke();
      } else {
        // Lv 4+: Void Magma Obsidian Wall
        draw3DBox(ctx, cx, cy, 26, 16, 24, '#581c87', '#3b0764', '#c084fc');
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 6;
        ctx.fillRect(cx - 2, cy - 20, 4, 10);
        ctx.shadowBlur = 0;
      }
      break;
    }

    default:
      draw3DBox(ctx, cx, cy, 26, 16, 12, '#475569', '#1e293b', '#64748b');
      break;
  }

  // Building Level & Name Badge
  ctx.font = 'bold 9px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 4;
  ctx.fillText(b.name.split(' ')[0], cx, cy + 14);
  ctx.shadowBlur = 0;

  ctx.restore();
}

// Helper: Draw 3D Isometric Prismatic Box
export function draw3DBox(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  depth: number,
  topColor: string,
  leftColor: string,
  rightColor: string
) {
  const hw = w / 2;
  const hh = h / 2;

  // 1. Left Vertical Face (in shadow)
  ctx.fillStyle = leftColor;
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy);
  ctx.lineTo(cx, cy + hh);
  ctx.lineTo(cx, cy + hh - depth);
  ctx.lineTo(cx - hw, cy - depth);
  ctx.closePath();
  ctx.fill();

  // 2. Right Vertical Face (lightly shadowed)
  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo(cx, cy + hh);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx + hw, cy - depth);
  ctx.lineTo(cx, cy + hh - depth);
  ctx.closePath();
  ctx.fill();

  // 3. Top Face (illuminated by sun)
  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(cx, cy - depth - hh);
  ctx.lineTo(cx + hw, cy - depth);
  ctx.lineTo(cx, cy - depth + hh);
  ctx.lineTo(cx - hw, cy - depth);
  ctx.closePath();
  ctx.fill();
}

/**
 * 3. Draw Clash of Clans Authentic UI HUD (Top Bar Pill Meters)
 */
export function drawClashHUD(
  ctx: CanvasRenderingContext2D,
  width: number,
  villageState: PlayerVillageState,
  activeHeroName: string
) {
  ctx.save();

  // 1. TOP LEFT: PLAYER LEVEL & TROPHIES
  // Blue Level Shield
  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.moveTo(25, 20);
  ctx.lineTo(45, 20);
  ctx.lineTo(45, 40);
  ctx.lineTo(35, 52);
  ctx.lineTo(25, 40);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = 'bold 12px "Segoe UI", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(`${villageState.level}`, 35, 38);

  // Player Name & Trophy Plaque
  ctx.textAlign = 'left';
  ctx.font = 'bold 13px "Segoe UI", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 4;
  ctx.fillText(activeHeroName, 55, 32);

  // Golden Trophy Pill
  ctx.font = '600 11px "Segoe UI", sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('🏆 4,343', 55, 48);
  ctx.shadowBlur = 0;

  // 2. TOP RIGHT: RESOURCE PILL METERS (Gold, Chakra, Reishi)
  const drawPillMeter = (
    rx: number,
    ry: number,
    val: number,
    maxVal: number,
    icon: string,
    barColor: string,
    glowColor: string
  ) => {
    const pillW = 140;
    const pillH = 22;

    // Outer Beveled Container
    ctx.fillStyle = '#1e1b18';
    ctx.roundRect(rx, ry, pillW, pillH, 11);
    ctx.fill();
    ctx.strokeStyle = '#453a2f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Progress Bar Fill
    const pct = Math.min(1.0, val / maxVal);
    if (pct > 0) {
      ctx.fillStyle = barColor;
      ctx.roundRect(rx + 2, ry + 2, (pillW - 4) * pct, pillH - 4, 9);
      ctx.fill();
    }

    // Number text
    ctx.font = 'bold 10px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(`${val.toLocaleString()}`, rx + pillW - 8, ry + 15);

    // Round Icon on Left
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(rx + 8, ry + pillH / 2, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '12px serif';
    ctx.textAlign = 'center';
    ctx.fillText(icon, rx + 8, ry + pillH / 2 + 4);
  };

  const rightStart = width - 160;
  // Gold / Berry Meter
  drawPillMeter(rightStart, 16, villageState.berries, villageState.maxStorage, '💰', '#eab308', '#ca8a04');
  // Chakra Meter
  drawPillMeter(rightStart, 44, villageState.chakra, villageState.maxStorage, '🌀', '#06b6d4', '#0891b2');
  // Reishi Meter
  drawPillMeter(rightStart, 72, villageState.reishi, villageState.maxStorage, '🔮', '#a855f7', '#9333ea');

  ctx.restore();
}

/**
 * 4. Draw Animated 2.5D Hero Patrol Unit on the Village Map
 */
export function drawIsoHeroPatrol(
  ctx: CanvasRenderingContext2D,
  heroX: number,
  heroY: number,
  originX: number,
  originY: number,
  heroImage: HTMLImageElement | null,
  heroName: string,
  heroColor: string,
  animTime: number,
  speechBubbleText: string | null = null,
  isSelected: boolean = false,
  heroLevel: number = 1
) {
  const pos = toIso(heroX, heroY, originX, originY);
  const cx = pos.x;
  const cy = pos.y + ISO_TILE_H / 2;

  // Walking bob effect
  const walkBob = Math.abs(Math.sin(animTime * 6)) * 4;
  const drawY = cy - walkBob;

  ctx.save();

  // 1. Hero Guard Perimeter Circle on the Grass
  const pulse = (Math.sin(animTime * 2.5) + 1) / 2;
  const auraR = 38 + pulse * 6;
  ctx.fillStyle = heroColor + '18';
  ctx.beginPath();
  ctx.ellipse(cx, cy, auraR, auraR * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = heroColor + '55';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. Drop Shadow under Hero's feet
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 16, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Render Hero Character Sprite
  const spriteW = 34;
  const spriteH = 46;
  const spriteTop = drawY - spriteH;

  if (heroImage && heroImage.complete) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx - spriteW / 2, spriteTop, spriteW, spriteH, 10);
    ctx.clip();
    ctx.drawImage(heroImage, cx - spriteW / 2, spriteTop, spriteW, spriteH);
    ctx.restore();

    // Sprite Border & Aura Glow
    ctx.strokeStyle = heroColor;
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.shadowColor = heroColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(cx - spriteW / 2, spriteTop, spriteW, spriteH, 10);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else {
    // Stylized Anime Hero Silhouette
    ctx.fillStyle = heroColor;
    ctx.beginPath();
    ctx.roundRect(cx - spriteW / 2, spriteTop, spriteW, spriteH, 10);
    ctx.fill();
  }

  // 4. Overhead Badge: Hero Name & Guard Status
  const badgeY = spriteTop - 10;
  ctx.font = 'bold 9px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(11, 18, 38, 0.9)';
  ctx.beginPath();
  ctx.roundRect(cx - 48, badgeY - 10, 96, 14, 7);
  ctx.fill();
  ctx.strokeStyle = heroLevel >= 10 ? '#fbbf24' : heroColor;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = heroLevel >= 10 ? '#fbbf24' : '#ffffff';
  ctx.fillText(`★ [Lv ${heroLevel}] ${heroName.split(' ')[0]} ★`, cx, badgeY);

  // 5. Speech Bubble if hero is speaking
  if (speechBubbleText) {
    const bubbleW = Math.min(220, speechBubbleText.length * 6 + 28);
    const bubbleH = 26;
    const bubbleY = badgeY - 32;

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(cx - bubbleW / 2, bubbleY, bubbleW, bubbleH, 10);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Small triangle pointer to hero head
    ctx.beginPath();
    ctx.moveTo(cx - 5, bubbleY + bubbleH);
    ctx.lineTo(cx, bubbleY + bubbleH + 6);
    ctx.lineTo(cx + 5, bubbleY + bubbleH);
    ctx.fill();

    ctx.font = 'bold 10px "Segoe UI", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText(speechBubbleText, cx, bubbleY + 16);
  }

  ctx.restore();
}

