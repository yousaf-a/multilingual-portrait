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
  gridSize: number = 12
) {
  // Deep Forest Background surrounding the village
  ctx.fillStyle = '#264e1c';
  ctx.fillRect(0, 0, width, height);

  // Soft atmospheric radial lighting on village clearing
  const clearingGlow = ctx.createRadialGradient(originX, originY + (gridSize * ISO_TILE_H) / 2, 80, originX, originY + (gridSize * ISO_TILE_H) / 2, width * 0.7);
  clearingGlow.addColorStop(0, 'rgba(100, 180, 50, 0.25)');
  clearingGlow.addColorStop(0.8, 'rgba(20, 50, 15, 0.4)');
  clearingGlow.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  ctx.fillStyle = clearingGlow;
  ctx.fillRect(0, 0, width, height);

  // Draw Isometric Grass Tiles (Checkerboard Green like Clash of Clans)
  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const pos = toIso(gx, gy, originX, originY);
      const isAlt = (gx + gy) % 2 === 0;

      // Clash of Clans Grass Palette
      ctx.fillStyle = isAlt ? '#5ca32c' : '#529624';

      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x + ISO_TILE_W / 2, pos.y + ISO_TILE_H / 2);
      ctx.lineTo(pos.x, pos.y + ISO_TILE_H);
      ctx.lineTo(pos.x - ISO_TILE_W / 2, pos.y + ISO_TILE_H / 2);
      ctx.closePath();
      ctx.fill();

      // Subtle grid border
      ctx.strokeStyle = isAlt ? 'rgba(80, 145, 35, 0.35)' : 'rgba(70, 130, 30, 0.35)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  // Draw Border Rocks & Pine Trees around perimeter
  ctx.save();
  const borderCoords = [
    { x: -1, y: 3 }, { x: -1, y: 7 }, { x: 3, y: -1 }, { x: 8, y: -1 },
    { x: 12, y: 4 }, { x: 12, y: 8 }, { x: 4, y: 12 }, { x: 9, y: 12 }
  ];

  borderCoords.forEach((b) => {
    const p = toIso(b.x, b.y, originX, originY);
    // Tree Shadow
    ctx.fillStyle = 'rgba(15, 35, 10, 0.45)';
    ctx.beginPath();
    ctx.ellipse(p.x + 5, p.y + 12, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pine Tree Cones
    ctx.fillStyle = '#1c4516';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 28);
    ctx.lineTo(p.x + 12, p.y);
    ctx.lineTo(p.x - 12, p.y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2d6a24';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 38);
    ctx.lineTo(p.x + 9, p.y - 12);
    ctx.lineTo(p.x - 9, p.y - 12);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
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

  // 2. Render Specific 3D Building Geometry
  switch (b.type) {
    case 'command_core': {
      // Town Hall (Hokage / Shonen Pagoda Fortress)
      const bH = 50;

      // Base Platform (Granite)
      draw3DBox(ctx, cx, cy, 44, 24, 12, '#334155', '#1e293b', '#475569');

      // Main Building Body (Crimson / Orange Wall)
      draw3DBox(ctx, cx, cy - 12, 34, 18, 22, '#ea580c', '#c2410c', '#fb923c');

      // Curved Pagoda Roof (Navy Blue & Gold Trim)
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 12 - 22 - 18); // Peak
      ctx.lineTo(cx + 26, cy - 12 - 22 + 4);
      ctx.lineTo(cx, cy - 12 - 22 + 12);
      ctx.lineTo(cx - 26, cy - 12 - 22 + 4);
      ctx.closePath();
      ctx.fill();

      // Roof Highlight
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Top Hokage / Pirate Crest Banner
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - 3, cy - 62, 6, 12);
      ctx.font = '10px serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('火', cx - 4, cy - 52);
      break;
    }

    case 'chakra_turbine': {
      // Elixir / Chakra Vat with Luminous Swirling Fluid
      draw3DBox(ctx, cx, cy, 32, 18, 8, '#334155', '#1e293b', '#475569');

      // Glass Dome
      const domeR = 15;
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

      // Glass Highlights
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, domeY, domeR, 0, Math.PI * 2);
      ctx.stroke();

      // Bubble
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 4, domeY - 5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'berry_treasury': {
      // Gold Vault / Berry Treasury with Glowing Gold Coins
      draw3DBox(ctx, cx, cy, 34, 20, 14, '#78350f', '#451a03', '#92400e');

      // Overflowing Gold Coins Top
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 14, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.stroke();

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

      // Purple Crystal Spire
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 35);
      ctx.lineTo(cx + 9, cy - 8);
      ctx.lineTo(cx, cy - 2);
      ctx.lineTo(cx - 9, cy - 8);
      ctx.closePath();
      ctx.fill();

      // Glowing Core
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      break;
    }

    case 'haki_cannon': {
      // Defensive Cannon with Swiveling Metal Barrel
      draw3DBox(ctx, cx, cy, 30, 18, 10, '#334155', '#1e293b', '#475569');

      // Rotating Swivel Cannon
      const angle = Math.sin(animTime * 1.5) * 0.4 - 0.7;
      ctx.save();
      ctx.translate(cx, cy - 14);
      ctx.rotate(angle);

      // Cannon Barrel
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-4, -18, 8, 20);
      ctx.strokeStyle = '#dc2626'; // Armament Haki Red Sheen
      ctx.lineWidth = 1;
      ctx.strokeRect(-4, -18, 8, 20);

      // Cannon Base Ring
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'paper_mortar': {
      // Paper Bomb Mortar (Angled Launch Cauldron)
      draw3DBox(ctx, cx, cy, 32, 18, 10, '#475569', '#1e293b', '#64748b');

      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 12, 11, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      break;
    }

    case 'defense_wall': {
      // 3D Fortified Stone / Obsidian Wall Segment
      draw3DBox(ctx, cx, cy, 22, 14, 18, '#64748b', '#334155', '#94a3b8');
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
function draw3DBox(
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
  isSelected: boolean = false
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
  ctx.roundRect(cx - 40, badgeY - 10, 80, 14, 7);
  ctx.fill();
  ctx.strokeStyle = heroColor;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillText(`★ ${heroName.split(' ')[0]} (GUARD) ★`, cx, badgeY);

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

