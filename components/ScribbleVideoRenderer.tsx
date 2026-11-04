'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TranslatedItem } from '@/lib/languages';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, ArrowLeft, Video } from 'lucide-react';
import { audioController } from '@/lib/audio';

interface HatchStroke {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  opacity: number;
  progressY: number;
}

interface GesturalStroke {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  opacity: number;
  progressY: number;
}

interface BackgroundText {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  progressY: number;
  color: string;
}

interface ScribbleVideoRendererProps {
  photoImage: HTMLImageElement | null;
  items: TranslatedItem[];
  primaryColor: string;
  themeStyle: string;
  titleText: string;
  musicTrack: string;
  customMusicUrl: string | null;
  onBackToEdit: () => void;
}

export default function ScribbleVideoRenderer({
  photoImage,
  items,
  primaryColor,
  themeStyle,
  titleText,
  musicTrack,
  customMusicUrl,
  onBackToEdit
}: ScribbleVideoRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const durationMs = 8500; // 8.5 seconds sketch sweep
  const pauseDurationMs = 3500; // 3.5s pause to admire completed artwork
  const totalCycleMs = durationMs + pauseDurationMs;
  const startTimeRef = useRef<number>(Date.now());

  // High-resolution sketch canvas & data
  const sketchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hatchStrokesRef = useRef<HatchStroke[]>([]);
  const gesturalStrokesRef = useRef<GesturalStroke[]>([]);
  const backgroundTextsRef = useRef<BackgroundText[]>([]);
  const imageBoundsRef = useRef<{ x: number; y: number; w: number; h: number }>({ x: 0, y: 0, w: 0, h: 0 });

  // Theme palettes matching Museum-Grade Hand-Drawn Fine-Art Paper Styles
  const getThemePalette = useCallback(() => {
    switch (themeStyle) {
      case 'emerald':
      case 'gold_rose':
        // 1. Antique Gold & Rose Accents on Ivory Cold-Press Paper (Target Reference Art)
        return {
          bg: '#fcfbf8',
          darkBg: false,
          ink: '#1c1b1f',
          bgText: 'rgba(75, 65, 55, 0.42)',
          paperVignette: '#f3ebd9',
          penGlow: '#d4af37',
          hatchColor: 'rgba(28, 27, 31, '
        };
      case 'sepia_gold':
      case 'gold':
        // 2. Vintage Sepia & 24K Gold on Aged Italian Parchment
        return {
          bg: '#fbf5e8',
          darkBg: false,
          ink: '#2d1b10',
          bgText: 'rgba(80, 50, 30, 0.44)',
          paperVignette: '#f0e2ca',
          penGlow: '#d4a017',
          hatchColor: 'rgba(45, 27, 16, '
        };
      case 'sanguine':
      case 'neon':
        // 3. Renaissance Sanguine & Terracotta Chalk on Cream Fabriano Paper
        return {
          bg: '#fcf7f2',
          darkBg: false,
          ink: '#7c261e',
          bgText: 'rgba(124, 38, 30, 0.42)',
          paperVignette: '#f3e4d6',
          penGlow: '#c2410c',
          hatchColor: 'rgba(124, 38, 30, '
        };
      case 'prussian_blue':
      case 'rain_storm':
        // 4. Prussian Blue & Cerulean on Heavy Arches Watercolor Paper
        return {
          bg: '#f5f9fc',
          darkBg: false,
          ink: '#10243d',
          bgText: 'rgba(16, 36, 61, 0.42)',
          paperVignette: '#e3edf5',
          penGlow: '#0284c7',
          hatchColor: 'rgba(16, 36, 61, '
        };
      case 'emerald_gold':
        // 5. Royal Pine & Champagne Gold on Botanical Rag Paper
        return {
          bg: '#f7faf7',
          darkBg: false,
          ink: '#122b1c',
          bgText: 'rgba(18, 43, 28, 0.42)',
          paperVignette: '#e4ede4',
          penGlow: '#c5a059',
          hatchColor: 'rgba(18, 43, 28, '
        };
      case 'monochrome':
      default:
        // 6. Pure Charcoal & Graphite Pencil Sketch on Cold-Press Paper
        return {
          bg: '#faf8f5',
          darkBg: false,
          ink: '#18181b',
          bgText: 'rgba(90, 90, 95, 0.40)',
          paperVignette: '#ebe4d8',
          penGlow: '#27272a',
          hatchColor: 'rgba(24, 24, 27, '
        };
    }
  }, [themeStyle]);

  // Pre-process image: Masterpiece Graphite Line-Art + Volumetric Shading + Selective Gold/Rose Watercolor
  useEffect(() => {
    const width = 800;
    const height = 1000;
    const palette = getThemePalette();

    const phrases = items.length >= 8 ? items : [
      { text: titleText || "Love You", language: "English" },
      { text: "Je t'aime", language: "French" },
      { text: "Ich liebe dich", language: "German" },
      { text: "Te amo", language: "Spanish" },
      { text: "我爱你", language: "Chinese" },
      { text: "愛してる", language: "Japanese" },
      { text: "أحبك", language: "Arabic" },
      { text: "मैं तुमसे प्यार करता हूँ", language: "Hindi" },
      { text: "Я тебя люблю", language: "Russian" },
      { text: "Ti amo", language: "Italian" },
      { text: "Eu te amo", language: "Portuguese" },
      { text: "사랑해", language: "Korean" },
      { text: "Nakupenda", language: "Swahili" },
      { text: "Seni seviyorum", language: "Turkish" },
      { text: "Kocham cię", language: "Polish" },
      { text: "Σ' αγαπώ", language: "Greek" }
    ];

    if (!photoImage) return;

    // Calculate image placement centered on canvas
    const imgAspect = photoImage.width / photoImage.height;
    let targetW = width * 0.78;
    let targetH = targetW / imgAspect;
    if (targetH > height * 0.82) {
      targetH = height * 0.82;
      targetW = targetH * imgAspect;
    }
    const targetX = (width - targetW) / 2;
    const targetY = (height - targetH) / 2;
    imageBoundsRef.current = { x: targetX, y: targetY, w: targetW, h: targetH };

    // High-resolution processing canvas (1.5x scale for razor-sharp pencil lines)
    const procCanvas = document.createElement('canvas');
    procCanvas.width = Math.round(targetW * 1.5);
    procCanvas.height = Math.round(targetH * 1.5);
    const pCtx = procCanvas.getContext('2d');

    const hatchStrokes: HatchStroke[] = [];
    const gesturalStrokes: GesturalStroke[] = [];

    if (pCtx) {
      pCtx.drawImage(photoImage, 0, 0, procCanvas.width, procCanvas.height);
      const imgData = pCtx.getImageData(0, 0, procCanvas.width, procCanvas.height);
      const data = imgData.data;
      const pw = procCanvas.width;
      const ph = procCanvas.height;

      // 1. Grayscale & Luminance
      const gray = new Uint8Array(pw * ph);
      for (let i = 0; i < data.length; i += 4) {
        gray[i / 4] = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      }

      // 2. Edge-preserving blur for Color Dodge Pencil Line Extraction
      const blurred = new Uint8Array(pw * ph);
      const br = 4;
      for (let y = 0; y < ph; y++) {
        for (let x = 0; x < pw; x++) {
          let sum = 0, count = 0;
          for (let dy = -br; dy <= br; dy += 2) {
            for (let dx = -br; dx <= br; dx += 2) {
              const ny = y + dy;
              const nx = x + dx;
              if (ny >= 0 && ny < ph && nx >= 0 && nx < pw) {
                sum += (255 - gray[ny * pw + nx]); // Inverted
                count++;
              }
            }
          }
          blurred[y * pw + x] = sum / count;
        }
      }

      // 3. Composite Masterpiece Sketch Data
      const sketchData = pCtx.createImageData(pw, ph);
      const sData = sketchData.data;

      for (let i = 0; i < gray.length; i++) {
        const xCoord = i % pw;
        const yCoord = Math.floor(i / pw);

        // Smooth edge feathering: any pixels within 8% of the canvas border softly fade to 0 alpha
        // This completely eliminates any rectangular cut-off box or vertical side stripes!
        const edgeDistX = Math.min(xCoord, pw - 1 - xCoord) / (pw * 0.08);
        const edgeDistY = Math.min(yCoord, ph - 1 - yCoord) / (ph * 0.08);
        const edgeFade = Math.min(1.0, Math.max(0.0, Math.min(edgeDistX, edgeDistY)));

        const g = gray[i];
        const b = blurred[i];

        // A. Color Dodge Pencil Line Extraction
        const dodgeVal = Math.min(255, Math.floor((g * 256) / Math.max(1, 255 - b)));
        const lineNorm = dodgeVal / 255;
        // Non-linear power curve for razor-sharp contours, eyelashes, lips, crown, and hair strands
        const lineVal = Math.pow(lineNorm, 1.75) * 255;

        // B. Volumetric Graphite Tonal Shading (Restores 3D facial depth, cheeks, neck, fabric)
        const shadeNorm = g / 255;
        const shadeVal = Math.pow(shadeNorm, 0.8) * 255;

        // Combined graphite tone (0 = rich black pencil, 255 = paper white)
        const combined = (lineVal * shadeVal) / 255;

        const pIdx = i * 4;
        const rOrig = data[pIdx];
        const gOrig = data[pIdx + 1];
        const bOrig = data[pIdx + 2];

        // Chromatic saturation for selective watercolor tint (Gold jewelry, rose petals, lips)
        const maxC = Math.max(rOrig, gOrig, bOrig);
        const minC = Math.min(rOrig, gOrig, bOrig);
        const sat = maxC > 0 ? (maxC - minC) / maxC : 0;

        const inkDarkness = 255 - combined;
        const pencilFactor = combined / 255;

        // Base pencil inking RGB per theme
        let baseR = 22, baseG = 22, baseB = 26; // Default rich charcoal

        if (themeStyle === 'sepia_gold' || themeStyle === 'gold') {
          baseR = 45; baseG = 27; baseB = 16; // Warm Italian burnt umber / sepia
        } else if (themeStyle === 'sanguine' || themeStyle === 'neon') {
          baseR = 124; baseG = 38; baseB = 30; // Renaissance Sanguine / terracotta red chalk
        } else if (themeStyle === 'prussian_blue' || themeStyle === 'rain_storm') {
          baseR = 16; baseG = 36; baseB = 61; // Prussian blue / deep indigo
        } else if (themeStyle === 'emerald_gold') {
          baseR = 18; baseG = 43; baseB = 28; // Deep forest pine
        }

        if ((themeStyle === 'emerald' || themeStyle === 'gold_rose') && sat > 0.14) {
          // 1. Antique Gold & Rose Accents (Reference Art)
          const colorFactor = Math.min(0.85, (sat - 0.12) * 2.2);
          sData[pIdx] = Math.round(rOrig * 1.15 * pencilFactor);
          sData[pIdx + 1] = Math.round(gOrig * 1.12 * pencilFactor);
          sData[pIdx + 2] = Math.round(bOrig * 1.08 * pencilFactor);
          sData[pIdx + 3] = Math.min(255, Math.round((inkDarkness * 1.4 + colorFactor * 210) * edgeFade));
        } else if ((themeStyle === 'sepia_gold' || themeStyle === 'gold') && sat > 0.14) {
          // 2. Vintage Sepia with Gilded Gold Leaf glaze
          sData[pIdx] = Math.round(Math.min(255, rOrig * 1.25) * pencilFactor);
          sData[pIdx + 1] = Math.round(Math.min(255, gOrig * 1.12) * pencilFactor);
          sData[pIdx + 2] = Math.round(bOrig * 0.8 * pencilFactor);
          sData[pIdx + 3] = Math.min(255, Math.round((inkDarkness * 1.35 + 175) * edgeFade));
        } else if (themeStyle === 'sanguine' || themeStyle === 'neon') {
          // 3. Renaissance Sanguine & Terracotta Chalk
          if (sat > 0.16) {
            sData[pIdx] = Math.round(Math.min(255, rOrig * 1.2) * pencilFactor);
            sData[pIdx + 1] = Math.round(gOrig * 0.9 * pencilFactor);
            sData[pIdx + 2] = Math.round(bOrig * 0.85 * pencilFactor);
            sData[pIdx + 3] = Math.min(255, Math.round((inkDarkness * 1.35 + 155) * edgeFade));
          } else {
            sData[pIdx] = baseR;
            sData[pIdx + 1] = baseG;
            sData[pIdx + 2] = baseB;
            sData[pIdx + 3] = combined < 244 ? Math.min(255, Math.round((255 - combined) * 1.68 * edgeFade)) : 0;
          }
        } else if ((themeStyle === 'prussian_blue' || themeStyle === 'rain_storm') && sat > 0.14) {
          // 4. Prussian Blue with Cerulean Watercolor Wash
          sData[pIdx] = Math.round(rOrig * 0.8 * pencilFactor);
          sData[pIdx + 1] = Math.round(Math.min(255, gOrig * 1.1) * pencilFactor);
          sData[pIdx + 2] = Math.round(Math.min(255, bOrig * 1.35) * pencilFactor);
          sData[pIdx + 3] = Math.min(255, Math.round((inkDarkness * 1.35 + 175) * edgeFade));
        } else if (themeStyle === 'emerald_gold' && sat > 0.14) {
          // 5. Royal Pine with Champagne Gold
          sData[pIdx] = Math.round(Math.min(255, rOrig * 1.2) * pencilFactor);
          sData[pIdx + 1] = Math.round(Math.min(255, gOrig * 1.15) * pencilFactor);
          sData[pIdx + 2] = Math.round(bOrig * 0.8 * pencilFactor);
          sData[pIdx + 3] = Math.min(255, Math.round((inkDarkness * 1.35 + 175) * edgeFade));
        } else {
          // 6. Monochrome Graphite & Charcoal
          sData[pIdx] = baseR;
          sData[pIdx + 1] = baseG;
          sData[pIdx + 2] = baseB;
          sData[pIdx + 3] = combined < 242 ? Math.min(255, Math.round((255 - combined) * 1.75 * edgeFade)) : 0;
        }
      }

      pCtx.putImageData(sketchData, 0, 0);
      sketchCanvasRef.current = procCanvas;

      // 4. GENERATE AUTHENTIC DIAGONAL CROSS-HATCHING STROKES (NO ROBOTIC CIRCLES!)
      const stepGap = 7; // Fine artist hatch resolution

      for (let y = 6; y < ph - 6; y += stepGap) {
        for (let x = 6; x < pw - 6; x += stepGap) {
          const idx = y * pw + x;
          const g = gray[idx];

          // Apply natural pencil hatching in shadow zones (under chin, neck, hair, clothes)
          if (g < 135) {
            const darkness = (135 - g) / 135;
            const canvasX = targetX + (x / pw) * targetW;
            const canvasY = targetY + (y / ph) * targetH;

            // Primary diagonal hatch strokes (~42° angle with subtle organic hand jitter)
            const angle = (Math.PI / 4) + ((x * 0.13 + y * 0.27) % 0.3) - 0.15;
            const len = 6 + darkness * 11;
            const cosA = Math.cos(angle) * len;
            const sinA = Math.sin(angle) * len;

            const primaryOpacity = palette.darkBg
              ? Math.min(0.38, 0.12 + darkness * 0.26)
              : Math.min(0.75, 0.22 + darkness * 0.48);

            hatchStrokes.push({
              x1: canvasX - cosA * 0.5,
              y1: canvasY - sinA * 0.5,
              x2: canvasX + cosA * 0.5,
              y2: canvasY + sinA * 0.5,
              width: 0.65 + darkness * 0.45,
              opacity: primaryOpacity,
              progressY: canvasY / height
            });

            // Perpendicular cross-hatching in deeper shadows (g < 80)
            if (g < 80) {
              const crossAngle = - (Math.PI / 4) + ((x * 0.19 + y * 0.31) % 0.26) - 0.13;
              const crossLen = 5 + darkness * 8;
              const cCos = Math.cos(crossAngle) * crossLen;
              const cSin = Math.sin(crossAngle) * crossLen;

              const crossOpacity = palette.darkBg
                ? Math.min(0.32, 0.1 + darkness * 0.22)
                : Math.min(0.65, 0.18 + darkness * 0.38);

              hatchStrokes.push({
                x1: canvasX - cCos * 0.5,
                y1: canvasY - cSin * 0.5,
                x2: canvasX + cCos * 0.5,
                y2: canvasY + cSin * 0.5,
                width: 0.55 + darkness * 0.35,
                opacity: crossOpacity,
                progressY: canvasY / height
              });
            }
          }
        }
      }

      // 5. GENERATE LOOSE RADIATING GESTURAL SKETCH STROKES (Artist's Construction Lines)
      const numFlicks = 36;
      for (let f = 0; f < numFlicks; f++) {
        const t = f / numFlicks;
        const rad = t * Math.PI * 2;
        const anchorX = targetX + targetW * 0.5 + Math.cos(rad) * targetW * 0.44;
        const anchorY = targetY + targetH * 0.48 + Math.sin(rad) * targetH * 0.44;

        const outAngle = rad + ((f * 1.618) % 0.6) - 0.3;
        const flickLen = 22 + ((f * 37) % 55);

        const endX = anchorX + Math.cos(outAngle) * flickLen;
        const endY = anchorY + Math.sin(outAngle) * flickLen;

        gesturalStrokes.push({
          x1: anchorX,
          y1: anchorY,
          x2: endX,
          y2: endY,
          width: 0.75 + (f % 3) * 0.25,
          opacity: palette.darkBg ? 0.18 + (f % 4) * 0.04 : 0.22 + (f % 4) * 0.05,
          progressY: Math.min(anchorY, endY) / height
        });
      }
    }

    hatchStrokes.sort((a, b) => a.progressY - b.progressY);
    hatchStrokesRef.current = hatchStrokes;

    gesturalStrokes.sort((a, b) => a.progressY - b.progressY);
    gesturalStrokesRef.current = gesturalStrokes;

    // 6. BACKGROUND MULTILINGUAL TYPOGRAPHY (Generously Spaced - Zero Collisions)
    const bgTexts: BackgroundText[] = [];
    let wordIdx = 0;

    // A. Left Gutter Column (Never touches portrait)
    if (targetX > 90) {
      const leftColX = Math.max(20, (targetX - 150) / 2);
      for (let y = 55; y < height - 60; y += 46) {
        const phrase = phrases[wordIdx % phrases.length];
        wordIdx++;
        bgTexts.push({
          x: leftColX,
          y,
          text: phrase.text,
          fontSize: 12.5,
          progressY: y / height,
          color: palette.bgText
        });
      }
    }

    // B. Right Gutter Column
    const rightStart = targetX + targetW + 28;
    if (width - rightStart > 90) {
      for (let y = 55; y < height - 60; y += 46) {
        const phrase = phrases[wordIdx % phrases.length];
        wordIdx++;
        bgTexts.push({
          x: rightStart,
          y,
          text: phrase.text,
          fontSize: 12.5,
          progressY: y / height,
          color: palette.bgText
        });
      }
    }

    // C. Top Header (Spaced evenly across top margin)
    const topY = Math.max(30, targetY - 35);
    const topSlots = [45, 290, 535];
    topSlots.forEach((tx) => {
      if (tx < width - 130) {
        const phrase = phrases[wordIdx % phrases.length];
        wordIdx++;
        bgTexts.push({
          x: tx,
          y: topY,
          text: phrase.text,
          fontSize: 12.5,
          progressY: topY / height,
          color: palette.bgText
        });
      }
    });

    // D. Bottom Footer (Spaced cleanly with generous breathing room, avoiding all text collision)
    const bottomY1 = Math.min(height - 58, targetY + targetH + 34);
    const bottomY2 = Math.min(height - 24, bottomY1 + 28);

    const bottomSlots1 = [45, 290, 535];
    bottomSlots1.forEach((bx) => {
      if (bx < width - 130) {
        const phrase = phrases[wordIdx % phrases.length];
        wordIdx++;
        bgTexts.push({
          x: bx,
          y: bottomY1,
          text: phrase.text,
          fontSize: 12,
          progressY: bottomY1 / height,
          color: palette.bgText
        });
      }
    });

    const bottomSlots2 = [165, 415];
    bottomSlots2.forEach((bx) => {
      if (bx < width - 130) {
        const phrase = phrases[wordIdx % phrases.length];
        wordIdx++;
        bgTexts.push({
          x: bx,
          y: bottomY2,
          text: phrase.text,
          fontSize: 12,
          progressY: bottomY2 / height,
          color: palette.bgText
        });
      }
    });

    bgTexts.sort((a, b) => a.progressY - b.progressY);
    backgroundTextsRef.current = bgTexts;
  }, [photoImage, items, titleText, getThemePalette, themeStyle]);

  // Audio start/stop
  useEffect(() => {
    audioController.start(musicTrack, customMusicUrl);
    return () => {
      audioController.stop();
    };
  }, [musicTrack, customMusicUrl]);

  // Frame Draw Function
  const drawFrame = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    progressRatio: number
  ) => {
    const palette = getThemePalette();
    const currentY = height * progressRatio;
    const centerX = width / 2;

    // 1. PAPER BACKGROUND WITH FINE ART TEXTURE & VIGNETTE
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    const vigGrad = ctx.createRadialGradient(
      centerX,
      height * 0.48,
      width * 0.35,
      centerX,
      height * 0.48,
      width * 0.8
    );
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(1, palette.paperVignette);
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // Soft atmospheric mist for Prussian Blue watercolor paper
    if (themeStyle === 'prussian_blue' || themeStyle === 'rain_storm') {
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.12)';
      ctx.lineWidth = 0.8;
      const now = (Date.now() / 1000) % 100;
      for (let r = 0; r < 24; r++) {
        const rx = (r * 37) % width;
        const ry = (now * 500 + r * 53) % (height + 60) - 30;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 1.5, ry + 14);
        ctx.stroke();
      }
    }

    // 2. DRAW LOOSE GESTURAL SKETCH STROKES (Radiating construction marks like master sketchbook)
    const gesturalStrokes = gesturalStrokesRef.current;
    for (let i = 0; i < gesturalStrokes.length; i++) {
      const gs = gesturalStrokes[i];
      if (gs.progressY <= progressRatio) {
        ctx.strokeStyle = `${palette.hatchColor}${gs.opacity})`;
        ctx.lineWidth = gs.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(gs.x1, gs.y1);
        ctx.lineTo(gs.x2, gs.y2);
        ctx.stroke();
      }
    }

    // 3. DRAW BACKGROUND MULTILINGUAL CALLIGRAPHY
    const bgTexts = backgroundTextsRef.current;
    ctx.font = `italic 400 12.5px Georgia, "Times New Roman", serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < bgTexts.length; i++) {
      const bt = bgTexts[i];
      if (bt.progressY <= progressRatio) {
        ctx.fillStyle = bt.color;
        ctx.fillText(bt.text, bt.x, bt.y);
      }
    }

    // 4. DRAW MASTERPIECE GRAPHITE SKETCH & VOLUMETRIC SHADING (Revealed Top-to-Bottom)
    const sketchCanvas = sketchCanvasRef.current;
    const bounds = imageBoundsRef.current;

    if (sketchCanvas && bounds.w > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(bounds.x, bounds.y, bounds.w, Math.max(0, currentY - bounds.y));
      ctx.clip();

      ctx.drawImage(sketchCanvas, bounds.x, bounds.y, bounds.w, bounds.h);
      ctx.restore();
    }

    // 5. DRAW AUTHENTIC DIAGONAL CROSS-HATCHING FOR SHADOWS & FABRIC
    const hatchStrokes = hatchStrokesRef.current;
    let penX = centerX;

    ctx.lineCap = 'round';

    for (let i = 0; i < hatchStrokes.length; i++) {
      const hs = hatchStrokes[i];
      if (hs.progressY <= progressRatio) {
        ctx.strokeStyle = `${palette.hatchColor}${hs.opacity})`;
        ctx.lineWidth = hs.width;
        ctx.beginPath();
        ctx.moveTo(hs.x1, hs.y1);
        ctx.lineTo(hs.x2, hs.y2);
        ctx.stroke();
        penX = hs.x2;
      } else {
        break;
      }
    }

    // 6. ACTIVE SKETCHING PEN NIB & GRAPHITE SPARKLE (Sweeping down)
    if (progressRatio < 1.0) {
      ctx.save();
      // Shimmer sweep line
      const sweepGrad = ctx.createLinearGradient(0, currentY, width, currentY);
      sweepGrad.addColorStop(0, 'rgba(0,0,0,0)');
      sweepGrad.addColorStop(0.5, palette.ink);
      sweepGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = sweepGrad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, currentY);
      ctx.lineTo(width, currentY);
      ctx.stroke();

      // Stylus glow
      const nibGrad = ctx.createRadialGradient(penX, currentY, 1, penX, currentY, 16);
      nibGrad.addColorStop(0, '#ffffff');
      nibGrad.addColorStop(0.3, palette.penGlow);
      nibGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = nibGrad;
      ctx.beginPath();
      ctx.arc(penX, currentY, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = palette.ink;
      ctx.beginPath();
      ctx.arc(penX, currentY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. ELEGANT WATERMARK
    ctx.save();
    ctx.font = `italic 11.5px Georgia, "Times New Roman", serif`;
    ctx.fillStyle = palette.bgText;
    ctx.textAlign = 'right';
    ctx.fillText(`${titleText || 'I Love You'} • Masterpiece Sketch Studio`, width - 24, height - 20);
    ctx.restore();
  }, [getThemePalette, themeStyle, titleText]);

  // Main animation frame loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      if (isPlaying) {
        const elapsed = (Date.now() - startTimeRef.current) % totalCycleMs;
        let progress = 0;
        if (elapsed < durationMs) {
          progress = elapsed / durationMs;
        } else {
          progress = 1.0;
        }

        setCurrentProgress(Math.round(progress * 100));
        drawFrame(ctx, canvas.width, canvas.height, progress);
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, drawFrame, totalCycleMs, durationMs]);

  const handleRestart = () => {
    startTimeRef.current = Date.now();
  };

  const toggleMute = () => {
    const isNowPlaying = audioController.toggle(musicTrack, customMusicUrl);
    setIsMuted(!isNowPlaying);
  };

  const downloadHighResImage = () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1600;
    exportCanvas.height = 2000;
    const exportCtx = exportCanvas.getContext('2d');
    if (exportCtx) {
      drawFrame(exportCtx, 1600, 2000, 1.0);
      const link = document.createElement('a');
      link.download = `${titleText || 'masterpiece-sketch'}-studio-art.png`;
      link.href = exportCanvas.toDataURL('image/png', 1.0);
      link.click();
    }
  };

  const recordVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isRecording) return;

    try {
      setIsRecording(true);
      startTimeRef.current = Date.now();

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm'
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${titleText || 'masterpiece-art'}-video.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
      };

      recorder.start();

      setTimeout(() => {
        recorder.stop();
      }, totalCycleMs);

    } catch (err) {
      console.error('Failed to record video:', err);
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-2">
      {/* Top Navigation Bar */}
      <div className="w-full flex items-center justify-between pb-4 mb-3 border-b border-[#1f2d4e]">
        <button
          type="button"
          onClick={onBackToEdit}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c1429] hover:bg-[#162347] text-slate-300 hover:text-white text-xs font-semibold border border-[#243356] transition"
        >
          <ArrowLeft size={15} />
          <span>Edit &amp; Change Image</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c1429] border border-[#243356] text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Master Sketch Progress: {currentProgress}%</span>
          </div>

          <button
            type="button"
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition ${!isMuted
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-[#0c1429] border-[#243356] text-slate-400'
              }`}
            title={isMuted ? 'Unmute Background Music' : 'Mute Music'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Video Canvas Player Frame */}
      <div className="relative rounded-3xl overflow-hidden border border-[#243356] shadow-[0_0_60px_rgba(0,180,255,0.18)] bg-[#050914] aspect-[4/5] w-full max-w-[560px]">
        <canvas
          ref={canvasRef}
          width={800}
          height={1000}
          className="w-full h-full object-contain block"
        />

        {isRecording && (
          <div className="absolute top-4 right-4 bg-red-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            Recording Video...
          </div>
        )}
      </div>

      {/* Video Control Bar */}
      <div className="flex flex-wrap items-center justify-between w-full max-w-[560px] gap-2 mt-5 px-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0c1429] hover:bg-[#162347] text-slate-300 hover:text-white text-xs font-medium border border-[#243356] transition"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0c1429] hover:bg-[#162347] text-slate-300 hover:text-white text-xs font-medium border border-[#243356] transition"
            title="Replay from top"
          >
            <RotateCcw size={14} />
            <span>Replay</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadHighResImage}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0c1429] hover:bg-[#162347] text-slate-300 hover:text-white text-xs font-medium border border-[#243356] transition"
          >
            <Download size={14} />
            <span>Download 4K Masterpiece</span>
          </button>

          <button
            type="button"
            onClick={recordVideo}
            disabled={isRecording}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0066ff] hover:brightness-110 text-white text-xs font-semibold shadow-md shadow-blue-500/30 transition cursor-pointer"
          >
            <Video size={14} />
            <span>{isRecording ? 'Recording...' : 'Download Video Loop'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
