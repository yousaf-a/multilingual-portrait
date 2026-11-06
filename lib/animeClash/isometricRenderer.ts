// 2.5D Isometric Rendering Engine for Anime Clash: Neo-Village
// Real isometric projection, depth-sorted 3D geometry, high-fidelity procedural Clash of Clans terrain & buildings

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
 * Helper: Draw 3D Isometric Prismatic Box with Lighting & Edge Bevels
 */
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

  // Left Face Edge Highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 2. Right Vertical Face (lightly shadowed)
  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo(cx, cy + hh);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx + hw, cy - depth);
  ctx.lineTo(cx, cy + hh - depth);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.stroke();

  // 3. Top Face (illuminated by overhead sky/sun)
  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(cx, cy - depth - hh);
  ctx.lineTo(cx + hw, cy - depth);
  ctx.lineTo(cx, cy - depth + hh);
  ctx.lineTo(cx - hw, cy - depth);
  ctx.closePath();
  ctx.fill();

  // Top Face Bevel Edge
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * Grand Hokage Rock Monument Backdrop (火影岩 - Hokage-iwa)
 * Spans across the upper horizon overlooking the Hidden Leaf Village with
 * meticulously sculpted stone faces of the 4 iconic Hokage:
 * 1. Hashirama Senju (First Hokage / 初代火影)
 * 2. Tobirama Senju (Second Hokage / 二代目火影)
 * 3. Hiruzen Sarutobi (Third Hokage / 三代目火影)
 * 4. Minato Namikaze (Fourth Hokage / 四代目火影)
 */
export function drawHokageMonument(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  originX: number,
  originY: number,
  weatherMode: 'day' | 'twilight' | 'night' | 'rain' = 'night',
  animTime: number = 0
) {
  ctx.save();

  const isNight = weatherMode === 'night';
  const isTwilight = weatherMode === 'twilight';
  const isRain = weatherMode === 'rain';

  // Weather-Reactive Mountain Cliff Palette
  const rockDark = isNight ? '#0b1626' : isTwilight ? '#31172a' : isRain ? '#111e22' : '#3f2d21';
  const rockMid = isNight ? '#1e293b' : isTwilight ? '#5c2d4d' : isRain ? '#1f3338' : '#71533e';
  const rockLight = isNight ? '#334155' : isTwilight ? '#9d4edd' : isRain ? '#35565d' : '#9c775a';
  const rockHighlight = isNight ? '#94a3b8' : isTwilight ? '#fbbf24' : isRain ? '#5eead4' : '#e6ccb2';
  const pineGreen = isNight ? '#04221b' : isTwilight ? '#241320' : isRain ? '#09261f' : '#14532d';

  const cliffBaseY = Math.max(125, originY + 15);

  // 1. Massive Mountain Cliff Range Silhouette
  ctx.beginPath();
  ctx.moveTo(0, cliffBaseY);
  ctx.lineTo(0, 42);
  ctx.lineTo(90, 26);
  ctx.lineTo(190, 16);
  ctx.lineTo(290, 10);
  ctx.lineTo(410, 6);
  ctx.lineTo(530, 10);
  ctx.lineTo(650, 16);
  ctx.lineTo(740, 28);
  ctx.lineTo(width, 45);
  ctx.lineTo(width, cliffBaseY);
  ctx.closePath();

  const cliffGrad = ctx.createLinearGradient(0, 0, 0, cliffBaseY);
  cliffGrad.addColorStop(0, rockLight);
  cliffGrad.addColorStop(0.5, rockMid);
  cliffGrad.addColorStop(1, rockDark);
  ctx.fillStyle = cliffGrad;
  ctx.fill();

  // Mountain Top Edge Rim Highlight
  ctx.strokeStyle = rockHighlight;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // 2. Pine Forest Silhouettes perched on Top Ridge
  ctx.fillStyle = pineGreen;
  const ridgePines = [
    { x: 35, y: 36, s: 8 }, { x: 80, y: 28, s: 10 }, { x: 140, y: 20, s: 9 },
    { x: 210, y: 14, s: 11 }, { x: 320, y: 9, s: 10 }, { x: 410, y: 6, s: 12 },
    { x: 480, y: 8, s: 11 }, { x: 570, y: 13, s: 12 }, { x: 670, y: 19, s: 10 },
    { x: 740, y: 28, s: 9 }, { x: 795, y: 40, s: 8 }
  ];
  ridgePines.forEach((p) => {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - p.s * 1.7);
    ctx.lineTo(p.x + p.s, p.y);
    ctx.lineTo(p.x - p.s, p.y);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - p.s * 2.5);
    ctx.lineTo(p.x + p.s * 0.7, p.y - p.s * 0.9);
    ctx.lineTo(p.x - p.s * 0.7, p.y - p.s * 0.9);
    ctx.closePath();
    ctx.fill();
  });

  // 3. Four Hokage Carved Stone Faces Helper Function
  const drawFaceContour = (
    cx: number,
    cy: number,
    badgeTitle: string,
    jpTitle: string,
    renderDetails: () => void
  ) => {
    ctx.save();
    // Ambient Occlusion Drop Shadow under carved chin
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 34, 26, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Base Stone Head Shape (Monumental Scale)
    ctx.fillStyle = rockMid;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 22, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stone Rim Chisel Highlight
    ctx.strokeStyle = rockHighlight;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Specific facial and hair stone carvings
    renderDetails();

    // High-Contrast Name Badge Plaque
    const badgeW = 74;
    const badgeH = 14;
    const badgeY = cy + 36;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.beginPath();
    ctx.roundRect(cx - badgeW / 2, badgeY, badgeW, badgeH, 6);
    ctx.fill();
    ctx.strokeStyle = rockHighlight;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '900 8px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${badgeTitle} ${jpTitle}`, cx, badgeY + 10);

    ctx.restore();
  };

  // 1st Hokage: Hashirama Senju (初代火影・千手柱間)
  drawFaceContour(245, 68, '初代', 'Hashirama', () => {
    // Flowing Stone Hair falling along both sides
    ctx.fillStyle = rockDark;
    ctx.beginPath();
    ctx.moveTo(226, 52);
    ctx.quadraticCurveTo(216, 74, 220, 92);
    ctx.lineTo(228, 89);
    ctx.quadraticCurveTo(224, 68, 232, 56);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(264, 52);
    ctx.quadraticCurveTo(274, 74, 270, 92);
    ctx.lineTo(262, 89);
    ctx.quadraticCurveTo(266, 68, 258, 56);
    ctx.closePath();
    ctx.fill();

    // Carved Headband Across Forehead
    ctx.fillStyle = rockLight;
    ctx.fillRect(232, 52, 26, 7);
    ctx.strokeStyle = rockDark;
    ctx.lineWidth = 1;
    ctx.strokeRect(232, 52, 26, 7);

    // Carved Leaf Swirl Crest on Headband
    ctx.strokeStyle = rockHighlight;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(245, 55.5, 2.8, 0, Math.PI * 1.7);
    ctx.stroke();

    // Strong Stern Eyebrows & Eyes
    ctx.strokeStyle = rockDark;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(235, 63);
    ctx.lineTo(242, 65);
    ctx.moveTo(248, 65);
    ctx.lineTo(255, 63);
    ctx.stroke();

    ctx.fillStyle = rockDark;
    ctx.fillRect(236, 66, 6, 2.5);
    ctx.fillRect(248, 66, 6, 2.5);

    // Nose Bridge & Determined Protector Mouth
    ctx.strokeStyle = rockDark;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(245, 64);
    ctx.lineTo(244, 73);
    ctx.lineTo(248, 73);
    ctx.moveTo(239, 78);
    ctx.lineTo(251, 78);
    ctx.stroke();
  });

  // 2nd Hokage: Tobirama Senju (二代目火影・千手扉間)
  drawFaceContour(365, 62, '二代', 'Tobirama', () => {
    // 5 Spiky Jagged Stone Hair Tufts
    ctx.fillStyle = rockLight;
    const spikes = [
      { x: 346, y: 48 }, { x: 355, y: 40 }, { x: 365, y: 37 },
      { x: 375, y: 40 }, { x: 384, y: 48 }
    ];
    ctx.beginPath();
    ctx.moveTo(344, 54);
    spikes.forEach((sp) => ctx.lineTo(sp.x, sp.y));
    ctx.lineTo(386, 54);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rockDark;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Happuri Forehead Armor with Flared Cheek Guards
    ctx.fillStyle = rockHighlight;
    ctx.beginPath();
    ctx.rect(352, 50, 26, 7);
    ctx.fill();
    ctx.stroke();

    // Triangular Downward Cheek Armor Plates
    ctx.beginPath();
    ctx.moveTo(352, 54);
    ctx.lineTo(348, 74);
    ctx.lineTo(353, 70);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(378, 54);
    ctx.lineTo(382, 74);
    ctx.lineTo(377, 70);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fierce Narrowed Gaze
    ctx.strokeStyle = rockDark;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(356, 61);
    ctx.lineTo(362, 63);
    ctx.moveTo(368, 63);
    ctx.lineTo(374, 61);
    ctx.stroke();

    // Crimson Red Clan Facial Markings
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(354, 67);
    ctx.lineTo(358, 71);
    ctx.moveTo(376, 67);
    ctx.lineTo(372, 71);
    ctx.moveTo(365, 73);
    ctx.lineTo(365, 79);
    ctx.stroke();
  });

  // 3rd Hokage: Hiruzen Sarutobi (三代目火影・猿飛ヒルゼン)
  drawFaceContour(485, 54, '三代', 'Hiruzen', () => {
    // Grand Triangular Hokage Hat (Flared red fabric with white brim)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(485, 20);
    ctx.lineTo(512, 43);
    ctx.lineTo(458, 43);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // White Hat Drape Ribbon
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(462, 41, 46, 5);

    // Iconic Kanji "火" on Hat Center
    ctx.font = '900 12px serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('火', 485, 37);

    // Aging Face Lines & Wise Eyes
    ctx.strokeStyle = rockDark;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(476, 49);
    ctx.lineTo(481, 50);
    ctx.moveTo(489, 50);
    ctx.lineTo(494, 49);
    // Crow's feet
    ctx.moveTo(474, 54);
    ctx.lineTo(477, 54);
    ctx.moveTo(493, 54);
    ctx.lineTo(496, 54);
    ctx.stroke();

    // Pointed Goatee Beard on Chin
    ctx.fillStyle = rockLight;
    ctx.beginPath();
    ctx.moveTo(481, 66);
    ctx.lineTo(485, 73);
    ctx.lineTo(489, 66);
    ctx.closePath();
    ctx.fill();

    // Smoking Pipe with Rising Smoke
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(487, 65);
    ctx.lineTo(495, 68);
    ctx.stroke();

    const smokePhase = ((animTime * 1.5) % 2) / 2;
    ctx.fillStyle = `rgba(241, 245, 249, ${0.5 * (1 - smokePhase)})`;
    ctx.beginPath();
    ctx.arc(496 + Math.sin(animTime * 2.5) * 3, 66 - smokePhase * 16, 2.5 + smokePhase * 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // 4th Hokage: Minato Namikaze (四代目火影・波風ミナト)
  drawFaceContour(605, 60, '四代', 'Minato', () => {
    // Dynamic Spiky Bangs jutting outwards
    ctx.fillStyle = rockHighlight;
    const mSpikes = [
      { x: 585, y: 47 }, { x: 580, y: 57 },
      { x: 590, y: 39 }, { x: 602, y: 34 }, { x: 614, y: 35 },
      { x: 626, y: 41 }, { x: 630, y: 51 }, { x: 625, y: 61 }
    ];
    ctx.beginPath();
    ctx.moveTo(587, 57);
    mSpikes.forEach((sp) => ctx.lineTo(sp.x, sp.y));
    ctx.lineTo(623, 57);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rockDark;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Leaf Headband Plate
    ctx.fillStyle = rockLight;
    ctx.fillRect(592, 48, 26, 6);
    ctx.strokeStyle = rockDark;
    ctx.strokeRect(592, 48, 26, 6);

    // Dynamic Long Side Bangs Framing Jaw
    ctx.fillStyle = rockHighlight;
    ctx.beginPath();
    ctx.moveTo(588, 53);
    ctx.lineTo(583, 71);
    ctx.lineTo(591, 66);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(622, 53);
    ctx.lineTo(627, 71);
    ctx.lineTo(619, 66);
    ctx.closePath();
    ctx.fill();

    // Confident Anime Eyes & Youthful Jaw
    ctx.strokeStyle = rockDark;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(596, 58);
    ctx.lineTo(602, 59);
    ctx.moveTo(608, 59);
    ctx.lineTo(614, 58);
    ctx.moveTo(600, 69);
    ctx.lineTo(610, 69);
    ctx.stroke();

    // High Standing White Hokage Collar with Flame Trim
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(590, 74);
    ctx.lineTo(584, 84);
    ctx.lineTo(626, 84);
    ctx.lineTo(620, 74);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  });

  // 4. Rolling Mist Layer at Cliff Base
  const mistGrad = ctx.createLinearGradient(0, cliffBaseY - 35, 0, cliffBaseY + 10);
  mistGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  mistGrad.addColorStop(0.5, isNight ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.35)');
  mistGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, cliffBaseY - 35, width, 45);

  ctx.restore();
}

/**
 * 1. Draw 2.5D Isometric Floating Sanctuary Island with 3D Rock Cliff Strata,
 * Beveled Grass Tiles, Cobblestone Paths, Torii Gate & Weather VFX
 */
export function drawIsoTerrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  originX: number,
  originY: number,
  gridSize: number = 12,
  weatherMode: 'day' | 'twilight' | 'night' | 'rain' = 'night',
  animTime: number = 0,
  monumentImg: HTMLImageElement | null = null
) {
  const isNight = weatherMode === 'night';
  const isTwilight = weatherMode === 'twilight';
  const isRain = weatherMode === 'rain';

  // 1. Deep Atmospheric Background & Celestial Gradient
  const bgGrad = ctx.createRadialGradient(originX, originY + (gridSize * ISO_TILE_H) / 2, 80, originX, originY + (gridSize * ISO_TILE_H) / 2, width * 0.8);
  if (isNight) {
    bgGrad.addColorStop(0, '#0a1528');
    bgGrad.addColorStop(0.5, '#050c18');
    bgGrad.addColorStop(1, '#02050b');
  } else if (isTwilight) {
    bgGrad.addColorStop(0, '#4a1d3d');
    bgGrad.addColorStop(0.5, '#2a0e28');
    bgGrad.addColorStop(1, '#110416');
  } else if (isRain) {
    bgGrad.addColorStop(0, '#0c2226');
    bgGrad.addColorStop(0.5, '#071618');
    bgGrad.addColorStop(1, '#030b0d');
  } else {
    bgGrad.addColorStop(0, '#1c4a25');
    bgGrad.addColorStop(0.5, '#0d2d14');
    bgGrad.addColorStop(1, '#051608');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Grand Hokage Rock Monument Backdrop overlooking the village
  if (monumentImg && monumentImg.complete && monumentImg.naturalWidth > 0) {
    ctx.save();
    // Maintain natural cinematic aspect ratio without squishing
    const backdropH = Math.max(185, originY + 25);
    const natW = monumentImg.naturalWidth;
    const natH = monumentImg.naturalHeight;

    // Source crop calculation: focus on the upper/middle mountain cliff with the 4 faces
    const targetAspect = width / backdropH;
    let sW = natW;
    let sH = natW / targetAspect;
    let sX = 0;
    let sY = 0;

    if (sH > natH) {
      sH = natH;
      sW = natH * targetAspect;
      sX = (natW - sW) / 2;
    }

    // Draw the un-squished, pristine anime Hokage Monument
    ctx.drawImage(monumentImg, sX, sY, sW, sH, 0, 0, width, backdropH);

    // Weather-reactive atmospheric tint
    if (isNight) {
      ctx.fillStyle = 'rgba(6, 15, 35, 0.55)';
      ctx.fillRect(0, 0, width, backdropH);
    } else if (isTwilight) {
      ctx.fillStyle = 'rgba(95, 25, 65, 0.35)';
      ctx.fillRect(0, 0, width, backdropH);
    } else if (isRain) {
      ctx.fillStyle = 'rgba(10, 30, 35, 0.45)';
      ctx.fillRect(0, 0, width, backdropH);
    }

    // Seamless atmospheric soft blend at the bottom into the village island
    const blendGrad = ctx.createLinearGradient(0, backdropH - 55, 0, backdropH);
    blendGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    blendGrad.addColorStop(0.65, isNight ? 'rgba(5, 12, 24, 0.75)' : isTwilight ? 'rgba(42, 14, 40, 0.75)' : isRain ? 'rgba(7, 22, 24, 0.75)' : 'rgba(13, 45, 20, 0.75)');
    blendGrad.addColorStop(1, isNight ? '#050c18' : isTwilight ? '#2a0e28' : isRain ? '#071618' : '#0d2d14');
    ctx.fillStyle = blendGrad;
    ctx.fillRect(0, backdropH - 55, width, 55);

    ctx.restore();
  } else {
    drawHokageMonument(ctx, width, height, originX, originY, weatherMode, animTime);
  }

  // Soft Island Plateau Drop Shadow on the Abyss below
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.beginPath();
  const shadowCenterY = originY + gridSize * ISO_TILE_H + 20;
  ctx.ellipse(originX, shadowCenterY, gridSize * (ISO_TILE_W / 2) * 1.05, gridSize * (ISO_TILE_H / 2) * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. 3D Vertical Rock Cliff Strata (Front Edge of Floating Sanctuary Island)
  const cliffHeight = 30;
  ctx.save();

  // Left-Front Cliff Wall (along gx = 0..gridSize-1, gy = gridSize-1)
  for (let gx = 0; gx < gridSize; gx++) {
    const pTop = toIso(gx, gridSize, originX, originY);
    const pNext = toIso(gx + 1, gridSize, originX, originY);

    // Dark Earth / Slate Strata
    ctx.fillStyle = isNight ? '#0b1626' : isTwilight ? '#3a2022' : isRain ? '#132120' : '#33291d';
    ctx.beginPath();
    ctx.moveTo(pTop.x, pTop.y);
    ctx.lineTo(pNext.x, pNext.y);
    ctx.lineTo(pNext.x, pNext.y + cliffHeight);
    ctx.lineTo(pTop.x, pTop.y + cliffHeight);
    ctx.closePath();
    ctx.fill();

    // Rock Strata Layers (horizontal fissures)
    ctx.strokeStyle = isNight ? '#1e293b' : isTwilight ? '#573335' : isRain ? '#253d3b' : '#574838';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pTop.x, pTop.y + 12);
    ctx.lineTo(pNext.x, pNext.y + 12);
    ctx.moveTo(pTop.x, pTop.y + 22);
    ctx.lineTo(pNext.x, pNext.y + 22);
    ctx.stroke();

    // Creeping Emerald Moss Vines
    ctx.fillStyle = isNight ? '#0f766e' : isTwilight ? '#854d0e' : isRain ? '#047857' : '#4d7c0f';
    ctx.beginPath();
    ctx.moveTo(pTop.x + 8, pTop.y);
    ctx.lineTo(pTop.x + 12, pTop.y + 14);
    ctx.lineTo(pTop.x + 16, pTop.y);
    ctx.fill();
  }

  // Right-Front Cliff Wall (along gy = 0..gridSize-1, gx = gridSize-1)
  for (let gy = 0; gy < gridSize; gy++) {
    const pTop = toIso(gridSize, gy, originX, originY);
    const pNext = toIso(gridSize, gy + 1, originX, originY);

    // Deeper Shadowed Right Face
    ctx.fillStyle = isNight ? '#050c18' : isTwilight ? '#221316' : isRain ? '#0b1515' : '#1f1912';
    ctx.beginPath();
    ctx.moveTo(pTop.x, pTop.y);
    ctx.lineTo(pNext.x, pNext.y);
    ctx.lineTo(pNext.x, pNext.y + cliffHeight);
    ctx.lineTo(pTop.x, pTop.y + cliffHeight);
    ctx.closePath();
    ctx.fill();

    // Rock Strata Lines
    ctx.strokeStyle = isNight ? '#101d30' : isTwilight ? '#3a1e22' : isRain ? '#172728' : '#33291d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pTop.x, pTop.y + 14);
    ctx.lineTo(pNext.x, pNext.y + 14);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Draw 2.5D Isometric Grass Tiles with Volumetric Lighting & Cobblestones
  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const pos = toIso(gx, gy, originX, originY);
      const isAlt = (gx + gy) % 2 === 0;

      // Pathways & Central Citadel Courtyard
      const isCentralCourtyard = gx >= 4 && gx <= 6 && gy >= 4 && gy <= 6;
      const isPath = isCentralCourtyard || (gx === 5 && gy >= 1 && gy <= 9) || (gy === 5 && gx >= 1 && gx <= 9);

      if (isPath) {
        // Authentic Flagstone Pavement with Beveled Stones
        ctx.fillStyle = isNight ? '#1e293b' : isTwilight ? '#57534e' : isRain ? '#293548' : '#78716c';
      } else {
        // High-Quality Textured Grass
        if (isNight) {
          ctx.fillStyle = isAlt ? '#0f2922' : '#0a1d17';
        } else if (isTwilight) {
          ctx.fillStyle = isAlt ? '#854d0e' : '#713f12';
        } else if (isRain) {
          ctx.fillStyle = isAlt ? '#1d3e2b' : '#163323';
        } else {
          ctx.fillStyle = isAlt ? '#4d8a26' : '#41791f';
        }
      }

      // Diamond Tile Geometry
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x + ISO_TILE_W / 2, pos.y + ISO_TILE_H / 2);
      ctx.lineTo(pos.x, pos.y + ISO_TILE_H);
      ctx.lineTo(pos.x - ISO_TILE_W / 2, pos.y + ISO_TILE_H / 2);
      ctx.closePath();
      ctx.fill();

      // Top-Left Bevel Highlight (Light from top-left)
      ctx.strokeStyle = isPath
        ? (isNight ? 'rgba(100, 116, 139, 0.4)' : 'rgba(214, 211, 209, 0.4)')
        : (isNight
        ? 'rgba(20, 184, 166, 0.18)'
        : isTwilight
        ? 'rgba(251, 146, 60, 0.25)'
        : isRain
        ? 'rgba(56, 189, 248, 0.22)'
        : 'rgba(163, 230, 53, 0.4)');
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(pos.x - ISO_TILE_W / 2, pos.y + ISO_TILE_H / 2);
      ctx.lineTo(pos.x, pos.y);
      ctx.lineTo(pos.x + ISO_TILE_W / 2, pos.y + ISO_TILE_H / 2);
      ctx.stroke();

      // Bottom-Right Shadow Seam
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(pos.x + ISO_TILE_W / 2, pos.y + ISO_TILE_H / 2);
      ctx.lineTo(pos.x, pos.y + ISO_TILE_H);
      ctx.lineTo(pos.x - ISO_TILE_W / 2, pos.y + ISO_TILE_H / 2);
      ctx.stroke();

      // Individual Cobblestones with Highlights & Dark Mortar Gaps
      if (isPath) {
        const stoneColor = isNight ? '#334155' : isTwilight ? '#78716c' : isRain ? '#3b4759' : '#a8a29e';
        const stoneHighlight = isNight ? '#475569' : isTwilight ? '#a8a29e' : isRain ? '#526075' : '#d6d3d1';

        // 3 Distinct Flagstones per Tile
        const stones = [
          { ox: -10, oy: -2, rx: 7, ry: 4 },
          { ox: 8, oy: 2, rx: 8, ry: 4.5 },
          { ox: -2, oy: 6, rx: 6, ry: 3.5 }
        ];

        stones.forEach((st) => {
          const sx = pos.x + st.ox;
          const sy = pos.y + ISO_TILE_H / 2 + st.oy;
          ctx.fillStyle = stoneColor;
          ctx.beginPath();
          ctx.ellipse(sx, sy, st.rx, st.ry, 0, 0, Math.PI * 2);
          ctx.fill();

          // Stone rim highlight
          ctx.strokeStyle = stoneHighlight;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(sx, sy - 0.5, st.rx * 0.8, st.ry * 0.7, 0, Math.PI, Math.PI * 2);
          ctx.stroke();
        });
      } else {
        // Procedural Micro Grass Tufts on select tiles
        if ((gx * 17 + gy * 31) % 5 === 0) {
          ctx.strokeStyle = isNight ? '#14b8a6' : isTwilight ? '#f59e0b' : isRain ? '#34d399' : '#84cc16';
          ctx.lineWidth = 1;
          const gxOff = pos.x - 4;
          const gyOff = pos.y + ISO_TILE_H / 2 + 2;
          ctx.beginPath();
          ctx.moveTo(gxOff, gyOff);
          ctx.lineTo(gxOff - 3, gyOff - 5);
          ctx.moveTo(gxOff, gyOff);
          ctx.lineTo(gxOff + 2, gyOff - 6);
          ctx.moveTo(gxOff, gyOff);
          ctx.lineTo(gxOff + 5, gyOff - 4);
          ctx.stroke();
        }
      }
    }
  }

  // 4. Perimeter Japanese Elements: Shinto Torii Gate, Stone Lanterns & Pine Trees
  ctx.save();

  // Vermillion Shinto Torii Gate at Upper Entrance (gx = 5, gy = 0)
  const toriiPos = toIso(5, 0, originX, originY);
  const tx = toriiPos.x;
  const ty = toriiPos.y - 12;

  // Torii Gate Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(tx, ty + 24, 28, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Torii Twin Vermillion Columns
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(tx - 20, ty - 32, 5, 36);
  ctx.fillRect(tx + 15, ty - 32, 5, 36);

  // Black Stone Column Bases
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(tx - 22, ty + 1, 9, 4);
  ctx.fillRect(tx + 13, ty + 1, 9, 4);

  // Lower Lintel (Nuki)
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(tx - 25, ty - 22, 50, 4);

  // Upper Curved Main Beam (Kasagi) with Gold Accent
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.moveTo(tx - 32, ty - 38);
  ctx.quadraticCurveTo(tx, ty - 42, tx + 32, ty - 38);
  ctx.lineTo(tx + 30, ty - 32);
  ctx.quadraticCurveTo(tx, ty - 36, tx - 30, ty - 32);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Shimenawa Sacred Twisted Rice Rope with Fluttering Shide Streamers
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(tx - 20, ty - 22);
  ctx.quadraticCurveTo(tx, ty - 18, tx + 15, ty - 22);
  ctx.stroke();

  // 3 Fluttering Zigzag Shide Paper Streamers swinging with wind
  const shideOffsets = [-12, -1, 10];
  shideOffsets.forEach((so) => {
    const shideSway = Math.sin(animTime * 3.2 + so) * 2.2;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(tx + so, ty - 20);
    ctx.lineTo(tx + so + shideSway + 3, ty - 12);
    ctx.lineTo(tx + so + shideSway - 1, ty - 7);
    ctx.lineTo(tx + so + shideSway + 2, ty - 2);
    ctx.lineTo(tx + so + shideSway, ty - 2);
    ctx.lineTo(tx + so + shideSway - 3, ty - 7);
    ctx.lineTo(tx + so + shideSway + 1, ty - 12);
    ctx.closePath();
    ctx.fill();
  });

  // Perimeter Japanese Pine Trees with Layered Needles & Dropshadows
  const treeCoords = [
    { x: -1, y: 3 }, { x: -1, y: 7 }, { x: 3, y: -1 }, { x: 8, y: -1 },
    { x: 12, y: 4 }, { x: 12, y: 8 }, { x: 4, y: 12 }, { x: 9, y: 12 }
  ];

  treeCoords.forEach((tc) => {
    const tp = toIso(tc.x, tc.y, originX, originY);

    // Deep Tree Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(tp.x + 8, tp.y + 14, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Twisted Gnarled Bonsai Trunk
    ctx.fillStyle = '#3f2010';
    ctx.beginPath();
    ctx.moveTo(tp.x - 3, tp.y + 2);
    ctx.lineTo(tp.x + 3, tp.y + 2);
    ctx.lineTo(tp.x + 2, tp.y - 18);
    ctx.lineTo(tp.x - 2, tp.y - 18);
    ctx.closePath();
    ctx.fill();

    // Layer 1 Needles (Bottom Broad)
    ctx.fillStyle = isNight ? '#041c14' : isTwilight ? '#3b1625' : isRain ? '#09291b' : '#14532d';
    ctx.beginPath();
    ctx.moveTo(tp.x, tp.y - 34);
    ctx.lineTo(tp.x + 20, tp.y - 8);
    ctx.lineTo(tp.x - 20, tp.y - 8);
    ctx.closePath();
    ctx.fill();

    // Layer 2 Needles (Mid Tier)
    ctx.fillStyle = isNight ? '#0b3d2b' : isTwilight ? '#5c1d39' : isRain ? '#114a31' : '#166534';
    ctx.beginPath();
    ctx.moveTo(tp.x, tp.y - 48);
    ctx.lineTo(tp.x + 15, tp.y - 24);
    ctx.lineTo(tp.x - 15, tp.y - 24);
    ctx.closePath();
    ctx.fill();

    // Layer 3 Needles (Top Crown)
    ctx.fillStyle = isNight ? '#135e43' : isTwilight ? '#831843' : isRain ? '#15803d' : '#22c55e';
    ctx.beginPath();
    ctx.moveTo(tp.x, tp.y - 60);
    ctx.lineTo(tp.x + 10, tp.y - 38);
    ctx.lineTo(tp.x - 10, tp.y - 38);
    ctx.closePath();
    ctx.fill();

    // Stone Lanterns (Tōrō) at every other tree node
    const lx = tp.x + 24;
    const ly = tp.y + 8;
    ctx.fillStyle = '#64748b';
    ctx.fillRect(lx - 2.5, ly - 12, 5, 12); // Pedestal
    ctx.fillRect(lx - 6, ly - 15, 12, 3);   // Platform

    // Glowing Fire Chamber
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = isNight ? 16 : 8;
    ctx.fillRect(lx - 3.5, ly - 9, 7, 5);
    ctx.shadowBlur = 0;

    // Lantern Roof
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(lx, ly - 19);
    ctx.lineTo(lx + 8, ly - 14);
    ctx.lineTo(lx - 8, ly - 14);
    ctx.closePath();
    ctx.fill();
  });

  ctx.restore();

  // 5. Drifting Japanese Sakura Petals (60FPS Atmospheric Wind Simulation)
  ctx.save();
  for (let i = 0; i < 35; i++) {
    const sx = ((i * 53 + animTime * 45) % (width + 80)) - 40;
    const sy = ((i * 61 + animTime * 32 + Math.sin(animTime * 2.2 + i) * 18) % (height + 60)) - 30;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(animTime * 2 + i * 1.5);
    ctx.fillStyle = isRain ? 'rgba(186, 230, 253, 0.65)' : 'rgba(244, 114, 182, 0.85)';
    ctx.shadowColor = 'rgba(244, 114, 182, 0.6)';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.8, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // 5.5 Floating Fireflies (Glowing Amber/Cyan bio-luminescent dots drifting over the grass)
  ctx.save();
  for (let f = 0; f < 18; f++) {
    const fx = ((f * 47 + animTime * 15 + Math.sin(animTime * 1.5 + f) * 20) % width);
    const fy = ((f * 39 + animTime * 8 + Math.cos(animTime * 1.8 + f) * 15) % height);
    const fPulse = (Math.sin(animTime * 4 + f * 2) + 1) / 2;
    ctx.fillStyle = f % 2 === 0 ? `rgba(251, 191, 36, ${0.4 + fPulse * 0.5})` : `rgba(56, 189, 248, ${0.4 + fPulse * 0.5})`;
    ctx.shadowColor = f % 2 === 0 ? '#fbbf24' : '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(fx, fy, 2 + fPulse * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 6. Dynamic Weather Overlays
  if (isRain) {
    // Rain Streaks
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 50; i++) {
      const rx = (Math.sin(i * 101 + animTime * 15) * 0.5 + 0.5) * width;
      const ry = (i * 37 + animTime * 520) % height;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 3, ry + 14);
      ctx.stroke();
    }

    // Puddle Ripples
    for (let i = 0; i < 6; i++) {
      const px = (Math.sin(i * 47) * 0.35 + 0.5) * width;
      const py = (Math.cos(i * 83) * 0.25 + 0.55) * height;
      const ripPhase = ((animTime * 1.5 + i * 0.8) % 2) / 2;
      ctx.strokeStyle = `rgba(186, 230, 253, ${0.4 * (1 - ripPhase)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(px, py, 14 * ripPhase, 7 * ripPhase, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (isNight) {
    // Bioluminescent Fireflies / Spirit Orbs
    for (let i = 0; i < 14; i++) {
      const fx = (Math.sin(i * 73 + animTime * 0.6) * 0.4 + 0.5) * width;
      const fy = (Math.cos(i * 41 + animTime * 0.8) * 0.35 + 0.5) * height;
      const fPulse = (Math.sin(animTime * 3 + i) + 1) / 2;
      ctx.fillStyle = `rgba(6, 182, 212, ${0.4 + fPulse * 0.5})`;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(fx, fy, 2 + fPulse * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

/**
 * 2. Draw High-Fidelity 3D Isometric Buildings with Textures, Lighting, Eaves & Particle VFX
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

  // 1. Soft Contact Drop Shadow on Grass (Multi-layered Ambient Occlusion)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(cx + 8, cy + 6, ISO_TILE_W * 0.5, ISO_TILE_H * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(cx + 12, cy + 9, ISO_TILE_W * 0.6, ISO_TILE_H * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();

  // Highlight Selection Ring
  if (isSelected) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.ellipse(cx, cy, ISO_TILE_W * 0.6, ISO_TILE_H * 0.75, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // 2. Render Specific 3D Building Geometry
  switch (b.type) {
    case 'command_core': {
      // 🏯 Master Shonen Hokage Citadel (Authentic 3-Tier Japanese Castle Pagoda)
      const baseW = b.level >= 3 ? 60 : b.level === 2 ? 54 : 48;
      const baseH = b.level >= 3 ? 32 : b.level === 2 ? 28 : 25;
      const baseD = b.level >= 3 ? 18 : 15;

      // Tier 1: Carved Granite Stone Plinth Foundation
      draw3DBox(ctx, cx, cy, baseW, baseH, baseD, '#64748b', '#334155', '#475569');

      // Foundation Stone Steps (Front Center)
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(cx - 8, cy + baseH / 2 - baseD / 2 - 2, 16, 4);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(cx - 6, cy + baseH / 2 - baseD / 2 + 2, 12, 3);

      // Tier 2: Vermillion Shrine Hall with Shoji Windows
      const midW = baseW - 12;
      const midH = baseH - 6;
      const midD = 24;
      draw3DBox(ctx, cx, cy - baseD, midW, midH, midD, '#dc2626', '#991b1b', '#b91c1c');

      // Illuminated Shoji Paper Lattice Windows (Warm Golden Glow inside)
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.fillRect(cx - 14, cy - baseD - 14, 8, 10);
      ctx.fillRect(cx + 6, cy - baseD - 14, 8, 10);
      ctx.shadowBlur = 0;

      // Wooden Lattice Grids
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 14, cy - baseD - 14, 8, 10);
      ctx.strokeRect(cx + 6, cy - baseD - 14, 8, 10);

      // Tier 3: First Swept Pagoda Roof (Dark Slate with Flared Golden Corners)
      const roof1W = baseW + 10;
      const roof1Y = cy - baseD - midD;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(cx, roof1Y - 18);
      ctx.lineTo(cx + roof1W / 2 + 4, roof1Y + 3); // Flared curved eaves
      ctx.quadraticCurveTo(cx, roof1Y + 12, cx - roof1W / 2 - 4, roof1Y + 3);
      ctx.closePath();
      ctx.fill();

      // Golden Edge Rim
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Animated Woodfire Chimney Smoke Puffs drifting upward
      for (let s = 0; s < 4; s++) {
        const sTime = animTime * 1.6 + s * 0.85;
        const sProg = (sTime % 3) / 3;
        const smokeX = cx - 9 + Math.sin(sTime * 2.2) * 5;
        const smokeY = roof1Y - 14 - sProg * 28;
        const smokeR = 3 + sProg * 6;
        const smokeAlpha = (1 - sProg) * 0.4;

        ctx.fillStyle = `rgba(226, 232, 240, ${smokeAlpha})`;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Twin Swaying Red Paper Lanterns (提灯)
      const lanternSway = Math.sin(animTime * 2.8) * 2.5;
      const lanterns = [cx - roof1W / 2 + 5, cx + roof1W / 2 - 5];
      lanterns.forEach((lx) => {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lx, roof1Y + 3);
        ctx.lineTo(lx + lanternSway, roof1Y + 9);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(lx + lanternSway, roof1Y + 14, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(lx + lanternSway, roof1Y + 14, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Upper Pagoda Chamber & Golden Spire (Lv 2+)
      let spireY = roof1Y - 26;
      if (b.level >= 2) {
        draw3DBox(ctx, cx, roof1Y - 14, 26, 15, 16, '#dc2626', '#991b1b', '#b91c1c');

        // Top Roof
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(cx, roof1Y - 48);
        ctx.lineTo(cx + 20, roof1Y - 28);
        ctx.lineTo(cx, roof1Y - 22);
        ctx.lineTo(cx - 20, roof1Y - 28);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.stroke();
        spireY = roof1Y - 56;
      }

      // Golden Will of Fire Crest on Front
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - 8, cy - baseD - midD + 12, 16, 10);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 8, cy - baseD - midD + 12, 16, 10);
      ctx.font = 'bold 8px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('火影', cx, cy - baseD - midD + 20);

      // Rotating Holographic Celestial Power Core above Spire
      const pulse = (Math.sin(animTime * 4) + 1) / 2;
      const coreR = 6 + pulse * 2.5;

      ctx.save();
      // Floating Cyan Diamond
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(cx, spireY - coreR * 1.5);
      ctx.lineTo(cx + coreR, spireY);
      ctx.lineTo(cx, spireY + coreR * 1.5);
      ctx.lineTo(cx - coreR, spireY);
      ctx.closePath();
      ctx.fill();

      // Concentric Rotating Energy Rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(cx, spireY, coreR * 2.2, coreR * 0.8, animTime * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'haki_cannon': {
      // 💣 Heavy Haki Defense Rail Cannon (Machined Armor Pivot Turret with Laser Sighting)
      // Base Carriage with Caution Hazard Stripes
      draw3DBox(ctx, cx, cy, 34, 20, 12, '#334155', '#1e293b', '#475569');

      // Yellow/Black Caution Hazard Stripes on Turret Front
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cx - 14, cy - 2, 28, 4);
      ctx.fillStyle = '#0f172a';
      for (let i = -12; i < 12; i += 6) {
        ctx.beginPath();
        ctx.moveTo(cx + i, cy - 2);
        ctx.lineTo(cx + i + 3, cy + 2);
        ctx.lineTo(cx + i + 1, cy + 2);
        ctx.lineTo(cx + i - 2, cy - 2);
        ctx.fill();
      }

      // Smooth Aiming Turret
      const aimAngle = Math.sin(animTime * 1.8) * 0.5 - 0.7;
      ctx.save();
      ctx.translate(cx, cy - 16);
      ctx.rotate(aimAngle);

      // Turret Ball Bearing Dome
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = b.level >= 2 ? '#fbbf24' : '#ef4444';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      if (b.level >= 3) {
        // Twin Electromagnetic Rail Barrels
        ctx.fillStyle = '#020617';
        ctx.fillRect(-7.5, -28, 5.5, 30);
        ctx.fillRect(2, -28, 5.5, 30);

        // Glowing Crimson Magma Heat Dissipation Coils
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.fillRect(-6.5, -24, 3.5, 4);
        ctx.fillRect(3, -24, 3.5, 4);
        ctx.fillRect(-6.5, -16, 3.5, 4);
        ctx.fillRect(3, -16, 3.5, 4);
        ctx.shadowBlur = 0;

        // Red Laser Targeting Sight Line
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(0, -85);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Heavy Reinforced Cannon Barrel
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-5, -24, 10, 26);
        ctx.strokeStyle = b.level >= 2 ? '#fbbf24' : '#ef4444';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(-5, -24, 10, 26);

        // Gold Muzzle Ring
        ctx.fillStyle = b.level >= 2 ? '#fbbf24' : '#dc2626';
        ctx.fillRect(-6, -24, 12, 4);
      }
      ctx.restore();
      break;
    }

    case 'chakra_turbine': {
      // 🌀 High-Tech Chakra Distillery (Glass Vacuum Dome with Swirling Cyan Plasma)
      draw3DBox(ctx, cx, cy, 38, 22, 12, '#334155', '#1e293b', '#475569');

      // Copper Exhaust Pressure Tubes on Left & Right
      ctx.fillStyle = '#b45309';
      ctx.fillRect(cx - 17, cy - 8, 4, 12);
      ctx.fillRect(cx + 13, cy - 8, 4, 12);

      // Glass Dome (Armored & Glowing)
      const domeR = b.level >= 2 ? 19 : 16;
      const domeY = cy - 16;

      // Swirling Multi-Layer Liquid Plasma
      const plasmaWave = Math.sin(animTime * 3.5) * 3;
      const liquidGrad = ctx.createRadialGradient(cx, domeY + plasmaWave, 2, cx, domeY, domeR);
      liquidGrad.addColorStop(0, '#e0f2fe');
      liquidGrad.addColorStop(0.4, '#38bdf8');
      liquidGrad.addColorStop(0.8, '#0284c7');
      liquidGrad.addColorStop(1, '#0c4a6e');

      ctx.save();
      ctx.fillStyle = liquidGrad;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(cx, domeY, domeR * 0.92, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Rising Energy Bubbles
      for (let i = 0; i < 4; i++) {
        const bubbleY = domeY + ((animTime * 22 + i * 9) % (domeR * 1.5)) - domeR * 0.7;
        const bubbleX = cx + Math.sin(animTime * 4.5 + i) * 6;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glass Reflection Crescent Highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(cx, domeY, domeR, -1.3, -0.3);
      ctx.stroke();

      // Brass Reinforcement Ribs (Lv 2+)
      if (b.level >= 2) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(cx, domeY, domeR, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'berry_treasury': {
      // 💰 Pirate Gold Vault & Berry Treasury (Heavy Armored Steel Safe with Overflowing Treasure)
      draw3DBox(ctx, cx, cy, 40, 24, 15, '#78350f', '#451a03', '#92400e');

      // Vault Round Steel Door on Front
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Gold Locking Wheel
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Overflowing Piles of Sparkling Pirate Gold Doubloons
      ctx.fillStyle = '#fbbf24';
      const coinOffsets = [
        { x: -15, y: 5 }, { x: -12, y: 8 }, { x: -8, y: 6 },
        { x: 11, y: 6 }, { x: 15, y: 8 }, { x: 13, y: 4 },
        { x: -4, y: 9 }, { x: 4, y: 10 }
      ];
      coinOffsets.forEach((co) => {
        ctx.beginPath();
        ctx.ellipse(cx + co.x, cy + co.y, 2.8, 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ruby & Sapphire Gems (Lv 2+)
      if (b.level >= 2) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx - 13, cy + 3, 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(cx + 14, cy + 3, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shimmering Gold Star Glint
      const glint = (Math.sin(animTime * 5.5) + 1) / 2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + 7, cy - 14, 2 * glint + 1, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'reishi_siphon': {
      // 🔮 Spiritual Reishi Siphon (Floating Black Obsidian Monolith with Orbiting Soul Rings)
      // Stepped Runed Stone Base
      draw3DBox(ctx, cx, cy, 32, 19, 9, '#1e1b4b', '#0f172a', '#312e81');

      // Levitating Obelisk Monolith (Hovering & Bobbing)
      const bob = Math.sin(animTime * 3.2) * 3.5;
      const obeliskY = cy - 17 + bob;

      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(cx, obeliskY - (b.level >= 2 ? 40 : 32));
      ctx.lineTo(cx + 12, obeliskY + 2);
      ctx.lineTo(cx, obeliskY + 9);
      ctx.lineTo(cx - 12, obeliskY + 2);
      ctx.closePath();
      ctx.fill();

      // Glowing Violet Spiritual Edges
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 14;
      ctx.stroke();

      // Soul Reaper Reiatsu Kanji Glyph
      ctx.fillStyle = '#f3e8ff';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('霊', cx, obeliskY - 11);
      ctx.shadowBlur = 0;

      // Orbiting Soul Rings (Reishi particles)
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.85)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(cx, obeliskY - 13, 20, 8, animTime * 1.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'paper_mortar': {
      // 💥 Paper-Bomb Heavy Mortar (Cast Iron Mortar Bowl with Talisman Seals)
      draw3DBox(ctx, cx, cy, 36, 21, 11, '#334155', '#1e293b', '#64748b');

      // Heavy Iron Mortar Pit Bowl
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 15, 14, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = b.level >= 2 ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 2.8;
      ctx.stroke();

      // Paper-Bomb Talisman Strips fluttering around rim
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(cx - 10, cy - 11, 3.5, 7);
      ctx.fillRect(cx + 7, cy - 11, 3.5, 7);
      break;
    }

    case 'defense_wall': {
      // 🧱 Fortified Citadel Ramparts
      if (b.level === 1) {
        draw3DBox(ctx, cx, cy, 26, 16, 22, '#64748b', '#334155', '#94a3b8');
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 11, cy - 11);
        ctx.lineTo(cx, cy - 7);
        ctx.lineTo(cx + 11, cy - 11);
        ctx.stroke();
      } else if (b.level === 2) {
        draw3DBox(ctx, cx, cy, 28, 17, 24, '#475569', '#1e293b', '#cbd5e1');
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(cx - 8, cy - 17, 3, 3);
        ctx.fillRect(cx + 5, cy - 17, 3, 3);
        ctx.fillRect(cx - 1.5, cy - 13, 3, 3);
      } else if (b.level === 3) {
        draw3DBox(ctx, cx, cy, 28, 17, 26, '#d97706', '#92400e', '#fde047');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx - 2.5, cy - 20, 5, 12);
      } else {
        draw3DBox(ctx, cx, cy, 30, 18, 28, '#581c87', '#3b0764', '#c084fc');
        const magmaPulse = (Math.sin(animTime * 4.5) + 1) / 2;
        ctx.fillStyle = `rgba(6, 182, 212, ${0.7 + magmaPulse * 0.3})`;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.fillRect(cx - 3, cy - 24, 6, 14);
        ctx.shadowBlur = 0;
      }
      break;
    }

    case 'hero_altar': {
      // 🏯 Master Ninja Academy & Shinobi Training Ground (Authentic Dojo Pavilion)
      // 1. Foundation Timber Training Deck
      draw3DBox(ctx, cx, cy, 44, 25, 10, '#78350f', '#451a03', '#92400e');

      // Tatami Sparring Mat in Front Center
      ctx.fillStyle = '#65a30d';
      ctx.fillRect(cx - 13, cy - 3, 26, 9);
      ctx.strokeStyle = '#365314';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 13, cy - 3, 26, 9);

      // 2. Main Dojo Shrine Hall (Vermillion Pillars + Shoji Walls)
      draw3DBox(ctx, cx, cy - 10, 32, 18, 18, '#dc2626', '#991b1b', '#b91c1c');

      // Illuminated Shoji Windows with Warm Golden Hearth Glow
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.fillRect(cx - 10, cy - 23, 6, 8);
      ctx.fillRect(cx + 4, cy - 23, 6, 8);
      ctx.shadowBlur = 0;

      // 3. Sweeping Japanese Dojo Roof with Flared Golden Cornices
      const dojoRoofW = 50;
      const dojoRoofY = cy - 28;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(cx, dojoRoofY - 15);
      ctx.lineTo(cx + dojoRoofW / 2 + 2, dojoRoofY + 2);
      ctx.quadraticCurveTo(cx, dojoRoofY + 8, cx - dojoRoofW / 2 - 2, dojoRoofY + 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Shinobi Kanji Scroll Banner: "忍" (Shinobi)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 6, dojoRoofY + 3, 12, 8);
      ctx.strokeStyle = '#78350f';
      ctx.strokeRect(cx - 6, dojoRoofY + 3, 12, 8);
      ctx.font = 'bold 7px sans-serif';
      ctx.fillStyle = '#dc2626';
      ctx.textAlign = 'center';
      ctx.fillText('忍', cx, dojoRoofY + 9);

      // 4. ANIMATED WOODEN TRAINING DUMMY (Karakuri Dummy)
      const dummyX = cx + 18;
      const dummyY = cy - 3;
      // Dummy Timber Post
      ctx.fillStyle = '#78350f';
      ctx.fillRect(dummyX - 2, dummyY - 17, 4, 17);
      // Spinning Arms with Wind Turbulence
      const armSway = Math.sin(animTime * 8) * 5;
      ctx.fillStyle = '#b45309';
      ctx.fillRect(dummyX - 8 + armSway * 0.3, dummyY - 12, 16, 3);
      // Dummy Target Head
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(dummyX, dummyY - 19, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 5. ANIMATED SHINOBI SHADOW CLONE SPARRING (Mini Ninja Clone!)
      const cloneJump = Math.abs(Math.sin(animTime * 5)) * 8;
      const cloneX = cx - 14 + Math.sin(animTime * 2.5) * 4;
      const cloneY = cy + 2 - cloneJump;

      // Shadow beneath clone
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(cloneX, cy + 3, 5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mini Shinobi Clone Body (Orange jumpsuit)
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(cloneX, cloneY - 8, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Headband Metal Plate
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(cloneX - 3.5, cloneY - 11, 7, 2);

      // Flying Practice Shuriken Arc
      const shurikenProg = (animTime * 2.8) % 1;
      const sx = cloneX + (dummyX - cloneX) * shurikenProg;
      const sy = (cloneY - 8) + (dummyY - 12 - (cloneY - 8)) * shurikenProg - Math.sin(shurikenProg * Math.PI) * 14;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(animTime * 25);
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(0, -3); ctx.lineTo(3, 0); ctx.lineTo(0, 3); ctx.lineTo(-3, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Impact Sparks at Training Dummy when shuriken lands
      if (shurikenProg > 0.85) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(dummyX - 3, dummyY - 12, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Clone Smoke Puff (Poof!) every 3.5s
      const smokePhase = (animTime * 0.3) % 1;
      if (smokePhase < 0.15) {
        ctx.fillStyle = 'rgba(241, 245, 249, 0.6)';
        ctx.beginPath();
        ctx.arc(cloneX - 3, cloneY - 8, 7 * (1 - smokePhase / 0.15), 0, Math.PI * 2);
        ctx.arc(cloneX + 4, cloneY - 10, 5 * (1 - smokePhase / 0.15), 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'ichiraku_ramen': {
      // 🍜 Master Ichiraku Ramen Stand (一楽ラーメン)
      // Raised cedar wood deck
      draw3DBox(ctx, cx, cy, 46, 26, 8, '#78350f', '#451a03', '#92400e');

      // 3 Red Vinyl Dining Bar Stools
      const stoolOffsets = [-12, 0, 12];
      stoolOffsets.forEach((sx) => {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + sx, cy + 10);
        ctx.lineTo(cx + sx, cy + 16);
        ctx.stroke();

        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.ellipse(cx + sx, cy + 10, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Wooden Dining Counter
      draw3DBox(ctx, cx, cy - 8, 38, 16, 12, '#b45309', '#78350f', '#d97706');

      // 2 Ceramic Steaming Ramen Bowls on counter
      const bowlPositions = [cx - 7, cx + 7];
      bowlPositions.forEach((bx, bIdx) => {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(bx, cy - 14, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(bx, cy - 14.5, 3.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(bx - 1, cy - 15, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#064e3b';
        ctx.fillRect(bx + 1, cy - 17, 1.5, 3);

        // Animated Hot Broth Steam Spirals
        for (let s = 0; s < 3; s++) {
          const sTime = animTime * 2.2 + s * 0.9 + bIdx * 1.4;
          const sProg = (sTime % 2.5) / 2.5;
          const sx = bx + Math.sin(sTime * 2.8) * 4;
          const sy = cy - 17 - sProg * 22;
          const sAlpha = (1 - sProg) * 0.55;
          ctx.fillStyle = `rgba(255, 255, 255, ${sAlpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.5 + sProg * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Corner Timber Posts holding the roof
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx - 20, cy - 36, 3, 30);
      ctx.fillRect(cx + 17, cy - 36, 3, 30);

      // Hanging Split Noren Fabric Curtains with Calligraphy
      const norenSway = Math.sin(animTime * 2.5) * 2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 19, cy - 28, 17, 13);
      ctx.fillRect(cx + 2, cy - 28, 17, 13);

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - 19, cy - 28, 17, 2.5);
      ctx.fillRect(cx + 2, cy - 28, 17, 2.5);

      ctx.font = 'bold 7px sans-serif';
      ctx.fillStyle = '#dc2626';
      ctx.textAlign = 'center';
      ctx.fillText('一楽', cx - 10 + norenSway * 0.3, cy - 20);
      ctx.fillText('拉麺', cx + 11 + norenSway * 0.3, cy - 20);

      // Sloping Green Ceramic Tiled Roof (Kawara)
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 44);
      ctx.lineTo(cx + 26, cy - 30);
      ctx.quadraticCurveTo(cx, cy - 25, cx - 26, cy - 30);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Swaying Red Paper Lantern (提灯)
      const lanternSway = Math.sin(animTime * 3) * 3;
      const lx = cx + 22 + lanternSway;
      const ly = cy - 22;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + 22, cy - 30);
      ctx.lineTo(lx, ly);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.ellipse(lx, ly + 6, 5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = 'bold 6px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('麺', lx, ly + 8);
      break;
    }

    case 'team7_posts': {
      // 🪵 Team 7 Three Wooden Sparring Posts (第7班・鈴の演習)
      ctx.fillStyle = '#713f12';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 3, 26, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3 Wooden Logs in Triangular Formation
      const posts = [
        { ox: -12, oy: 2, h: 26, w: 7, rope: false },
        { ox: 12, oy: 4, h: 24, w: 7, rope: false },
        { ox: 0, oy: -6, h: 36, w: 9, rope: true } // Center Main Post
      ];

      posts.forEach((p) => {
        const px = cx + p.ox;
        const py = cy + p.oy;

        ctx.fillStyle = '#854d0e';
        ctx.fillRect(px - p.w / 2, py - p.h, p.w, p.h);

        ctx.fillStyle = '#59300a';
        ctx.fillRect(px - p.w / 2, py - p.h, p.w * 0.35, p.h);

        ctx.fillStyle = '#a16207';
        ctx.beginPath();
        ctx.ellipse(px, py - p.h, p.w / 2, p.w / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(px + p.w / 2 - 1, py - p.h * 0.6);
        ctx.lineTo(px + p.w / 2 + 5, py - p.h * 0.6 - 3);
        ctx.lineTo(px + p.w / 2 + 3, py - p.h * 0.6 + 4);
        ctx.closePath();
        ctx.fill();

        if (p.rope) {
          ctx.fillStyle = '#d97706';
          ctx.fillRect(px - p.w / 2, py - p.h * 0.55, p.w, 6);
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(px - p.w / 2, py - p.h * 0.55, p.w, 6);

          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(px - p.w / 2, py - p.h * 0.7);
          ctx.lineTo(px - p.w / 2 - 8, py - p.h * 0.7 - 4);
          ctx.stroke();

          // Two Hanging Silver Bells on Crimson String
          const bellSway = Math.sin(animTime * 3.5) * 3;
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, py - p.h * 0.55);
          ctx.lineTo(px - 4 + bellSway * 0.7, py - p.h * 0.35);
          ctx.moveTo(px, py - p.h * 0.55);
          ctx.lineTo(px + 4 + bellSway, py - p.h * 0.3);
          ctx.stroke();

          const bells = [
            { bx: px - 4 + bellSway * 0.7, by: py - p.h * 0.35 },
            { bx: px + 4 + bellSway, by: py - p.h * 0.3 }
          ];
          bells.forEach((bl) => {
            ctx.fillStyle = '#e2e8f0';
            ctx.shadowColor = '#f8fafc';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(bl.bx, bl.by, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(bl.bx - 0.7, bl.by + 1.2, 1.4, 1);
          });
        }
      });
      break;
    }

    default:
      draw3DBox(ctx, cx, cy, 28, 17, 13, '#475569', '#1e293b', '#64748b');
      break;
  }

  // Building Name & Level Badge Pill
  ctx.font = 'bold 9.5px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 5;
  ctx.fillText(`${b.name.split(' ')[0]} Lv${b.level}`, cx, cy + 16);
  ctx.shadowBlur = 0;

  ctx.restore();
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

  // Subtle Player Level & Active Hero Tag (Top Left of Canvas)
  // Blue Level Shield
  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.moveTo(20, 16);
  ctx.lineTo(36, 16);
  ctx.lineTo(36, 32);
  ctx.lineTo(28, 41);
  ctx.lineTo(20, 32);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = 'bold 11px "Segoe UI", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(`${villageState.level}`, 28, 30);

  // Player Name & Trophy Plaque
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px "Segoe UI", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 4;
  ctx.fillText(activeHeroName, 44, 25);

  // Golden Trophy Pill
  ctx.font = '600 10.5px "Segoe UI", sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('🏆 4,343', 44, 39);
  ctx.shadowBlur = 0;

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
  const walkBob = Math.abs(Math.sin(animTime * 6)) * 4.5;
  const drawY = cy - walkBob;

  ctx.save();

  // 1. Hero Guard Perimeter Circle on the Grass
  const pulse = (Math.sin(animTime * 2.8) + 1) / 2;
  const auraR = 40 + pulse * 7;
  ctx.fillStyle = heroColor + '1a';
  ctx.beginPath();
  ctx.ellipse(cx, cy, auraR, auraR * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = heroColor + '66';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. Drop Shadow & Walking Dust Puffs
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 3, 20, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  const dustPhase = Math.sin(animTime * 12);
  if (dustPhase > 0.4) {
    ctx.fillStyle = 'rgba(203, 213, 225, 0.4)';
    ctx.beginPath();
    ctx.arc(cx - 11, cy + 2, 3.2, 0, Math.PI * 2);
    ctx.arc(cx - 15, cy, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Render Hero Character Unit (Full-Body Standing Isometric Anime Guardian)
  const spriteW = 44;
  const spriteH = 68;
  const feetY = drawY;
  const heroTopY = feetY - spriteH;

  // Ground Elemental Pedestal Glow beneath feet
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, feetY, 22, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = heroColor + '33';
  ctx.fill();
  ctx.strokeStyle = heroColor;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Outer Rotating Chakra/Haki Energy Orbit on the ground
  ctx.beginPath();
  ctx.ellipse(cx, feetY, 26, 12, 0, animTime * 2.2, animTime * 2.2 + Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([3, 5]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Render Full Standing Hero Sprite
  if (heroImage && heroImage.complete && heroImage.naturalWidth > 0) {
    ctx.save();
    // Subtle breathing/bobbing scale
    const breathScale = 1.0 + Math.sin(animTime * 4) * 0.02;
    ctx.translate(cx, feetY);
    ctx.scale(breathScale, breathScale);

    // Drop shadow
    ctx.shadowColor = heroColor;
    ctx.shadowBlur = 12;

    ctx.drawImage(
      heroImage,
      -spriteW / 2,
      -spriteH,
      spriteW,
      spriteH
    );
    ctx.restore();

    // 3.5 Animated Swirling Wind Chakra Rasengan in Naruto's Hand
    if (heroName.toLowerCase().includes('naruto')) {
      const rasenganAngle = animTime * 18;
      const handX = cx + 18;
      const handY = feetY - 34;

      ctx.save();
      ctx.translate(handX, handY);

      // Glowing Azure Core
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting Wind Spirals
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      for (let a = 0; a < 3; a++) {
        ctx.beginPath();
        ctx.arc(0, 0, 7.5, rasenganAngle + a * ((Math.PI * 2) / 3), rasenganAngle + a * ((Math.PI * 2) / 3) + 1.2);
        ctx.stroke();
      }
      ctx.restore();
    }
  } else {
    // Stylized Anime Hero Silhouette with Hero Accent Gradient & Icon
    ctx.save();
    const grad = ctx.createLinearGradient(cx, heroTopY, cx, feetY);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, heroColor);
    grad.addColorStop(1, '#090d16');

    // Body silhouette
    ctx.beginPath();
    ctx.ellipse(cx, heroTopY + 12, 11, 11, 0, 0, Math.PI * 2); // Head
    ctx.roundRect(cx - 14, heroTopY + 22, 28, 36, 6); // Torso & coat
    ctx.fillStyle = grad;
    ctx.shadowColor = heroColor;
    ctx.shadowBlur = 15;
    ctx.fill();

    // Hero Initial
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(heroName.charAt(0), cx, heroTopY + 38);
    ctx.restore();
  }
  ctx.restore();

  // 4. Hero Name & Level Badge (Plaque with Gold Star)
  const tagY = heroTopY - 6;
  const tagText = `★ [Lv ${heroLevel}] ${heroName.split(' ')[0]} ★`;
  ctx.font = 'bold 10px "Segoe UI", sans-serif';
  const tagWidth = ctx.measureText(tagText).width + 16;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cx - tagWidth / 2, tagY - 11, tagWidth, 15, 7.5);
  ctx.fillStyle = 'rgba(10, 15, 30, 0.92)';
  ctx.fill();
  ctx.strokeStyle = heroColor;
  ctx.lineWidth = 1.3;
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(tagText, cx, tagY);
  ctx.restore();

  // 5. Speech Bubble if Speaking
  if (speechBubbleText) {
    const bubbleY = tagY - 22;
    ctx.font = 'bold 10.5px sans-serif';
    const textW = Math.min(220, ctx.measureText(speechBubbleText).width + 18);
    const bubbleH = 24;

    ctx.save();
    // Bubble Box
    ctx.beginPath();
    ctx.roundRect(cx - textW / 2, bubbleY - bubbleH, textW, bubbleH, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Tail pointer
    ctx.beginPath();
    ctx.moveTo(cx - 5, bubbleY);
    ctx.lineTo(cx, bubbleY + 6);
    ctx.lineTo(cx + 5, bubbleY);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.stroke();

    // Speech Text
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(speechBubbleText, cx, bubbleY - bubbleH / 2);
    ctx.restore();
  }

  ctx.restore();
}
