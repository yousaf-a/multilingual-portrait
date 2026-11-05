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

  // 2. Draw Isometric Grass Tiles with Cobblestone Paths & Vegetation
  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const pos = toIso(gx, gy, originX, originY);
      const isAlt = (gx + gy) % 2 === 0;

      // Check if this tile is a central courtyard or pathway connecting to buildings
      const isCentralCourtyard = (gx >= 4 && gx <= 6 && gy >= 4 && gy <= 6);
      const isPath = isCentralCourtyard || (gx === 5 && gy >= 2 && gy <= 8) || (gy === 5 && gx >= 2 && gx <= 8);

      if (isPath) {
        // Cobblestone Paved Pathway
        ctx.fillStyle = isNight ? '#1e293b' : isTwilight ? '#57534e' : isRain ? '#334155' : '#78716c';
      } else {
        // Natural Grass
        if (isNight) {
          ctx.fillStyle = isAlt ? '#0f2920' : '#0a1e16';
        } else if (isTwilight) {
          ctx.fillStyle = isAlt ? '#854d0e' : '#713f12';
        } else if (isRain) {
          ctx.fillStyle = isAlt ? '#22472b' : '#1b3b23';
        } else {
          ctx.fillStyle = isAlt ? '#5ca32c' : '#529624';
        }
      }

      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x + ISO_TILE_W / 2, pos.y + ISO_TILE_H / 2);
      ctx.lineTo(pos.x, pos.y + ISO_TILE_H);
      ctx.lineTo(pos.x - ISO_TILE_W / 2, pos.y + ISO_TILE_H / 2);
      ctx.closePath();
      ctx.fill();

      // Subtle tile border
      ctx.strokeStyle = isPath
        ? (isNight ? 'rgba(51, 65, 85, 0.4)' : 'rgba(120, 113, 108, 0.4)')
        : (isNight
        ? 'rgba(6, 182, 212, 0.12)'
        : isTwilight
        ? 'rgba(251, 146, 60, 0.2)'
        : isRain
        ? 'rgba(56, 189, 248, 0.2)'
        : 'rgba(80, 145, 35, 0.35)');
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Cobblestone Texture Dots on Pathways
      if (isPath) {
        ctx.fillStyle = isNight ? '#334155' : '#a8a29e';
        ctx.beginPath();
        ctx.arc(pos.x - 6, pos.y + ISO_TILE_H / 2 - 2, 1.8, 0, Math.PI * 2);
        ctx.arc(pos.x + 6, pos.y + ISO_TILE_H / 2 + 2, 2.2, 0, Math.PI * 2);
        ctx.arc(pos.x, pos.y + ISO_TILE_H / 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 3. Draw Organic Japanese Pine Trees & Stone Lanterns around Village Perimeter
  ctx.save();
  const borderCoords = [
    { x: -1, y: 3 }, { x: -1, y: 7 }, { x: 3, y: -1 }, { x: 8, y: -1 },
    { x: 12, y: 4 }, { x: 12, y: 8 }, { x: 4, y: 12 }, { x: 9, y: 12 }
  ];

  borderCoords.forEach((b, idx) => {
    const p = toIso(b.x, b.y, originX, originY);
    // Tree Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(p.x + 8, p.y + 12, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden Tree Trunk
    ctx.fillStyle = '#451a03';
    ctx.fillRect(p.x - 2.5, p.y - 12, 5, 14);

    // Tier 1 (Lowest Broad Foliage)
    ctx.fillStyle = isNight ? '#061710' : isTwilight ? '#381622' : isRain ? '#0e2617' : '#1c4516';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 30);
    ctx.lineTo(p.x + 16, p.y - 8);
    ctx.lineTo(p.x - 16, p.y - 8);
    ctx.closePath();
    ctx.fill();

    // Tier 2 (Mid Foliage)
    ctx.fillStyle = isNight ? '#0b291d' : isTwilight ? '#581c35' : isRain ? '#173d25' : '#2d6a24';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 42);
    ctx.lineTo(p.x + 12, p.y - 22);
    ctx.lineTo(p.x - 12, p.y - 22);
    ctx.closePath();
    ctx.fill();

    // Tier 3 (Crown Needle Peak)
    ctx.fillStyle = isNight ? '#134e3a' : isTwilight ? '#701a45' : isRain ? '#1e4d30' : '#3d8b32';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 52);
    ctx.lineTo(p.x + 8, p.y - 34);
    ctx.lineTo(p.x - 8, p.y - 34);
    ctx.closePath();
    ctx.fill();

    // Japanese Stone Lantern (Tōrō) at every other border node
    if (idx % 2 === 0) {
      const lx = p.x + 18;
      const ly = p.y + 6;
      ctx.fillStyle = '#64748b';
      ctx.fillRect(lx - 2, ly - 10, 4, 10);
      ctx.fillRect(lx - 5, ly - 13, 10, 3);

      // Glowing Fire Chamber
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.fillRect(lx - 3, ly - 8, 6, 4);
      ctx.shadowBlur = 0;
    }
  });
  ctx.restore();

  // 4. Drifting Japanese Sakura (Cherry Blossom) Petals (60FPS Atmospheric Simulation)
  ctx.save();
  for (let i = 0; i < 30; i++) {
    const sx = ((i * 47 + animTime * 42) % (width + 80)) - 40;
    const sy = ((i * 59 + animTime * 30 + Math.sin(animTime * 2 + i) * 16) % (height + 60)) - 30;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(animTime * 1.8 + i);
    ctx.fillStyle = isRain ? 'rgba(186, 230, 253, 0.6)' : 'rgba(244, 114, 182, 0.75)';
    ctx.shadowColor = 'rgba(244, 114, 182, 0.5)';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.5, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // 5. Weather Overlays (Rain Streaks)
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
      // 🏯 Master Shonen Hokage Citadel (Authentic Multi-Tier Japanese Pagoda Architecture)
      const baseW = b.level >= 3 ? 56 : b.level === 2 ? 50 : 46;
      const baseH = b.level >= 3 ? 30 : b.level === 2 ? 26 : 24;
      const baseD = b.level >= 3 ? 16 : 14;

      // 1. Carved Granite Foundation with Stone Steps
      draw3DBox(ctx, cx, cy, baseW, baseH, baseD, '#475569', '#1e293b', '#64748b');

      // Foundation Stone Seams
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - baseW / 2 + 6, cy - baseD / 2);
      ctx.lineTo(cx, cy + baseH / 2 - baseD / 2);
      ctx.lineTo(cx + baseW / 2 - 6, cy - baseD / 2);
      ctx.stroke();

      // 2. Vermillion Temple Walls & Timber Frame
      const midW = baseW - 12;
      const midH = baseH - 6;
      const midD = 22;
      draw3DBox(ctx, cx, cy - baseD, midW, midH, midD, '#b91c1c', '#7f1d1d', '#dc2626');

      // Shinto Temple Wooden Sliding Door (Front)
      ctx.fillStyle = '#451a03';
      ctx.fillRect(cx - 5, cy - baseD - 12, 10, 14);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 5, cy - baseD - 12, 10, 14);
      // Gold door pull
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx, cy - baseD - 5, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 3. Lower Tier Curved Eaves (Ceramic Slate Tiles with Gold Edge)
      const roofW = baseW + 6;
      const roofY = cy - baseD - midD;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(cx, roofY - 16);
      ctx.lineTo(cx + roofW / 2, roofY + 4);
      ctx.lineTo(cx, roofY + 12);
      ctx.lineTo(cx - roofW / 2, roofY + 4);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Slate Tile Grooves
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 4, roofY - 14);
        ctx.lineTo(cx + i * 6, roofY + 8);
        ctx.stroke();
      }

      // 4. Twin Hanging Red Paper Lanterns (提灯) that sway
      const lanternSway = Math.sin(animTime * 2.5) * 2;
      const lLeftX = cx - roofW / 2 + 4;
      const lRightX = cx + roofW / 2 - 4;
      const lY = roofY + 4;

      [lLeftX, lRightX].forEach((lx) => {
        // Black hook
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lx, lY);
        ctx.lineTo(lx + lanternSway, lY + 6);
        ctx.stroke();

        // Glowing Red Paper Lantern
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(lx + lanternSway, lY + 10, 3.5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Gold center light
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(lx + lanternSway, lY + 10, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. Upper Tier Spire / Hokage Crest
      if (b.level >= 2) {
        // Upper Pagoda Chamber
        draw3DBox(ctx, cx, roofY - 14, 24, 14, 14, '#b91c1c', '#7f1d1d', '#ef4444');

        // Upper Grand Golden Roof
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.moveTo(cx, roofY - 44);
        ctx.lineTo(cx + 18, roofY - 26);
        ctx.lineTo(cx, roofY - 20);
        ctx.lineTo(cx - 18, roofY - 26);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 6. Holographic Rotating Celestial Power Core above Spire
      const spireY = b.level >= 2 ? roofY - 50 : roofY - 22;
      const corePulse = (Math.sin(animTime * 4) + 1) / 2;
      const coreR = 5 + corePulse * 2;

      ctx.save();
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(cx, spireY, coreR, 0, Math.PI * 2);
      ctx.fill();

      // Rotating Chakra Rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, spireY, coreR * 2.2, coreR * 0.7, animTime * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Kanji Crest Badge
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - 7, cy - baseD - midD + 14, 14, 9);
      ctx.font = 'bold 7px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('火影', cx, cy - baseD - midD + 21);
      break;
    }

    case 'chakra_turbine': {
      // 🌀 High-Tech Chakra Distillery (Glass Vacuum Dome with Swirling Cyan Plasma Liquid)
      // Octagonal Steel & Brass Machine Platform
      draw3DBox(ctx, cx, cy, 36, 20, 10, '#334155', '#1e293b', '#475569');

      // Copper Exhaust Pressure Tubes on Left & Right
      ctx.fillStyle = '#b45309';
      ctx.fillRect(cx - 16, cy - 8, 4, 10);
      ctx.fillRect(cx + 12, cy - 8, 4, 10);

      // Glass Dome (Armored & Glowing)
      const domeR = b.level >= 2 ? 18 : 15;
      const domeY = cy - 14;

      // Swirling Multi-Layer Liquid Plasma
      const plasmaWave = Math.sin(animTime * 3) * 3;
      const liquidGrad = ctx.createRadialGradient(cx, domeY + plasmaWave, 2, cx, domeY, domeR);
      liquidGrad.addColorStop(0, '#a5f3fc');
      liquidGrad.addColorStop(0.5, '#06b6d4');
      liquidGrad.addColorStop(0.9, '#0891b2');
      liquidGrad.addColorStop(1, '#164e63');

      ctx.save();
      ctx.fillStyle = liquidGrad;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx, domeY, domeR * 0.92, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Rising Energy Bubbles
      for (let i = 0; i < 3; i++) {
        const bubbleY = domeY + ((animTime * 20 + i * 8) % (domeR * 1.5)) - domeR * 0.7;
        const bubbleX = cx + Math.sin(animTime * 4 + i) * 6;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glass Reflection Crescent Highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, domeY, domeR, -1.2, -0.2);
      ctx.stroke();

      // Brass Reinforcement Ribs (Lv 2+)
      if (b.level >= 2) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(cx, domeY, domeR, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'berry_treasury': {
      // 💰 Pirate Gold Vault & Berry Treasury (Heavy Armored Steel Safe with Overflowing Treasure)
      draw3DBox(ctx, cx, cy, 38, 22, 14, '#78350f', '#451a03', '#92400e');

      // Vault Round Steel Door on Front
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Gold Locking Wheel
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 3, 0, Math.PI * 2);
      ctx.fill();

      // Overflowing Piles of Sparkling Pirate Gold Doubloons on the Podium
      ctx.fillStyle = '#fbbf24';
      const coinOffsets = [
        { x: -14, y: 4 }, { x: -11, y: 7 }, { x: -8, y: 5 },
        { x: 10, y: 5 }, { x: 14, y: 7 }, { x: 12, y: 3 },
        { x: -4, y: 8 }, { x: 3, y: 9 }
      ];
      coinOffsets.forEach((co) => {
        ctx.beginPath();
        ctx.ellipse(cx + co.x, cy + co.y, 2.5, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ruby & Sapphire Gems (Lv 2+)
      if (b.level >= 2) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx - 12, cy + 2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(cx + 13, cy + 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shimmering Gold Glint
      const glint = (Math.sin(animTime * 5) + 1) / 2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + 6, cy - 14, 1.8 * glint + 0.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'reishi_siphon': {
      // 🔮 Spiritual Reishi Siphon (Floating Black Obsidian Monolith with Orbiting Soul Rings)
      // Stepped Runed Stone Base
      draw3DBox(ctx, cx, cy, 30, 18, 8, '#1e1b4b', '#0f172a', '#312e81');

      // Levitating Obelisk Monolith (Hovering & Bobbing)
      const bob = Math.sin(animTime * 3) * 3;
      const obeliskY = cy - 16 + bob;

      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(cx, obeliskY - (b.level >= 2 ? 38 : 30));
      ctx.lineTo(cx + 11, obeliskY + 2);
      ctx.lineTo(cx, obeliskY + 8);
      ctx.lineTo(cx - 11, obeliskY + 2);
      ctx.closePath();
      ctx.fill();

      // Glowing Violet Spiritual Edges
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 10;
      ctx.stroke();

      // Soul Reaper Reiatsu Kanji Glyph
      ctx.fillStyle = '#e9d5ff';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('霊', cx, obeliskY - 10);
      ctx.shadowBlur = 0;

      // Orbiting Soul Ring (Reishi particles)
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, obeliskY - 12, 18, 7, animTime * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'haki_cannon': {
      // 💣 Heavy Haki Defense Rail Cannon (Machined Armor Pivot Turret with Laser Sighting)
      // Heavy Steel Armor Carriage with Rivets
      draw3DBox(ctx, cx, cy, 32, 20, 12, '#334155', '#1e293b', '#475569');

      // Corner Rivets
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(cx - 12, cy - 2, 2, 2);
      ctx.fillRect(cx + 10, cy - 2, 2, 2);

      // Rotating Gun Turret Dome
      const angle = Math.sin(animTime * 1.5) * 0.5 - 0.7;
      ctx.save();
      ctx.translate(cx, cy - 16);
      ctx.rotate(angle);

      // Turret Ball Bearing
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = b.level >= 2 ? '#fbbf24' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (b.level >= 3) {
        // Twin Electromagnetic Railgun Barrels with Red Plasma Coils
        ctx.fillStyle = '#020617';
        ctx.fillRect(-7, -26, 5, 28);
        ctx.fillRect(2, -26, 5, 28);

        // Glowing Rail Coils
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-6, -22, 3, 4);
        ctx.fillRect(3, -22, 3, 4);
        ctx.fillRect(-6, -14, 3, 4);
        ctx.fillRect(3, -14, 3, 4);

        // Red Laser Targeting Sight
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(0, -26);
        ctx.lineTo(0, -75);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Single Heavy Cannon Barrel with Muzzle Ring
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-4.5, -22, 9, 24);
        ctx.strokeStyle = b.level >= 2 ? '#fbbf24' : '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-4.5, -22, 9, 24);

        // Gold muzzle band
        ctx.fillStyle = b.level >= 2 ? '#fbbf24' : '#dc2626';
        ctx.fillRect(-5.5, -22, 11, 4);
      }
      ctx.restore();
      break;
    }

    case 'paper_mortar': {
      // 💥 Paper-Bomb Heavy Mortar (Cast Iron Mortar Bowl with Talisman Seals)
      draw3DBox(ctx, cx, cy, 34, 20, 10, '#334155', '#1e293b', '#64748b');

      // Heavy Iron Mortar Pit Bowl
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 14, 13, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = b.level >= 2 ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Paper-Bomb Talisman Strips fluttering around rim
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(cx - 9, cy - 10, 3, 6);
      ctx.fillRect(cx + 6, cy - 10, 3, 6);
      break;
    }

    case 'defense_wall': {
      // 🧱 Fortified Citadel Ramparts (Chiseled Stone Masonry with Mortar Lines & Iron Spikes)
      if (b.level === 1) {
        // Lv 1: Chiseled Heavy Granite Wall
        draw3DBox(ctx, cx, cy, 24, 15, 20, '#64748b', '#334155', '#94a3b8');

        // Stone Brick Mortar Seams
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 10);
        ctx.lineTo(cx, cy - 6);
        ctx.lineTo(cx + 10, cy - 10);
        ctx.stroke();
      } else if (b.level === 2) {
        // Lv 2: Riveted Steel Armor Wall with Defensive Spikes
        draw3DBox(ctx, cx, cy, 26, 16, 22, '#475569', '#1e293b', '#cbd5e1');

        // Gold Rivet Studs
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(cx - 7, cy - 16, 2.5, 2.5);
        ctx.fillRect(cx + 5, cy - 16, 2.5, 2.5);
        ctx.fillRect(cx - 1, cy - 12, 2.5, 2.5);
      } else if (b.level === 3) {
        // Lv 3: Gilded Titanium Fortress Bastion
        draw3DBox(ctx, cx, cy, 26, 16, 24, '#d97706', '#92400e', '#fde047');

        // Crenellated Arrow Slit
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx - 2, cy - 18, 4, 10);
      } else {
        // Lv 4+: Void Magma Obsidian Wall with Pulsing Energy Core
        draw3DBox(ctx, cx, cy, 28, 17, 26, '#581c87', '#3b0764', '#c084fc');

        const magmaPulse = (Math.sin(animTime * 4) + 1) / 2;
        ctx.fillStyle = `rgba(6, 182, 212, ${0.7 + magmaPulse * 0.3})`;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.fillRect(cx - 2.5, cy - 22, 5, 12);
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

  // 2. Drop Shadow & Walking Dust Puffs
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 3, 18, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Walking Dust Puffs
  const dustPhase = Math.sin(animTime * 12);
  if (dustPhase > 0.4) {
    ctx.fillStyle = 'rgba(203, 213, 225, 0.35)';
    ctx.beginPath();
    ctx.arc(cx - 10, cy + 2, 3, 0, Math.PI * 2);
    ctx.arc(cx - 14, cy, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Render Hero Character Unit (Circular Tactical Anime Medallion - Zero White Card Bleed)
  const heroR = 21;
  const heroCenterY = drawY - 24;

  if (heroImage && heroImage.complete) {
    // High-res circular hero avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, heroCenterY, heroR, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(heroImage, cx - heroR, heroCenterY - heroR, heroR * 2, heroR * 2);
    ctx.restore();

    // Multi-layered Flaming Elemental Aura Ring
    ctx.strokeStyle = heroColor;
    ctx.lineWidth = isSelected ? 3.5 : 2.5;
    ctx.shadowColor = heroColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, heroCenterY, heroR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Outer Rotating Chakra/Haki Energy Orbit
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.arc(cx, heroCenterY, heroR + 3, animTime * 2, animTime * 2 + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    // Stylized Anime Hero Silhouette
    ctx.fillStyle = heroColor;
    ctx.beginPath();
    ctx.arc(cx, heroCenterY, heroR, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Overhead Badge: Hero Name & Guard Status
  const badgeY = heroCenterY - heroR - 8;
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

