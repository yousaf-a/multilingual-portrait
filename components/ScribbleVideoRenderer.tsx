'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { TranslatedItem, getMultilingualList } from '@/lib/languages';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, ArrowLeft, Video, Gift, MessageSquare, PenTool } from 'lucide-react';
import { audioController } from '@/lib/audio';
import ShareGiftModal from '@/components/ShareGiftModal';
import LiveDuoChat from '@/components/LiveDuoChat';

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
  roomId?: string;
  senderName?: string;
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
  roomId: propRoomId,
  senderName = 'You',
  onBackToEdit
}: ScribbleVideoRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeWhisper, setActiveWhisper] = useState<string | null>(null);
  const [showArtistHand, setShowArtistHand] = useState(true);

  // Smooth cursive ink trail & luxury fountain pen asset
  interface TrailPoint {
    x: number;
    y: number;
    time: number;
  }
  const inkTrailRef = useRef<TrailPoint[]>([]);
  const luxuryPenImgRef = useRef<HTMLImageElement | null>(null);

  // Preload photorealistic luxury fountain pen asset
  useEffect(() => {
    const img = new Image();
    img.src = '/luxury-fountain-pen.png';
    img.onload = () => {
      luxuryPenImgRef.current = img;
    };
  }, []);

  // Stable room ID for live 2-person chat
  const activeRoomId = useMemo(() => {
    if (propRoomId) return propRoomId;
    const cleanTitle = (titleText || 'studio').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `room_${cleanTitle || 'live'}`;
  }, [propRoomId, titleText]);

  const handleWhisper = (text: string) => {
    setActiveWhisper(text);
    setTimeout(() => {
      setActiveWhisper(null);
    }, 4500);
  };

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

    const phrases = items.length > 0
      ? items
      : (titleText ? getMultilingualList(titleText, 'name') : []);

    if (!photoImage) return;

    // Calculate image placement centered on canvas with generous calligraphy framing margins
    const imgAspect = photoImage.width / photoImage.height;
    let targetW = Math.min(width * 0.74, 590);
    let targetH = targetW / imgAspect;
    if (targetH > height * 0.76) {
      targetH = height * 0.76;
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

        if ((themeStyle === 'emerald' || themeStyle === 'gold_rose') && sat > 0.36) {
          // 1. Antique Gold & Rose Accents (Reference Art) - applied to vivid jewelry & florals only
          const colorFactor = Math.min(0.85, (sat - 0.30) * 2.5);
          sData[pIdx] = Math.round(rOrig * 1.15 * pencilFactor);
          sData[pIdx + 1] = Math.round(gOrig * 1.12 * pencilFactor);
          sData[pIdx + 2] = Math.round(bOrig * 1.08 * pencilFactor);
          sData[pIdx + 3] = Math.min(255, Math.round((inkDarkness * 1.4 + colorFactor * 210) * edgeFade));
        } else if ((themeStyle === 'sepia_gold' || themeStyle === 'gold') && sat > 0.36) {
          // 2. Vintage Sepia with Gilded Gold Leaf glaze
          sData[pIdx] = Math.round(Math.min(255, rOrig * 1.25) * pencilFactor);
          sData[pIdx + 1] = Math.round(Math.min(255, gOrig * 1.12) * pencilFactor);
          sData[pIdx + 2] = Math.round(bOrig * 0.8 * pencilFactor);
          sData[pIdx + 3] = Math.min(255, Math.round((inkDarkness * 1.35 + 175) * edgeFade));
        } else if (themeStyle === 'sanguine' || themeStyle === 'neon') {
          // 3. Renaissance Sanguine & Terracotta Chalk
          sData[pIdx] = baseR;
          sData[pIdx + 1] = baseG;
          sData[pIdx + 2] = baseB;
          sData[pIdx + 3] = combined < 244 ? Math.min(255, Math.round((255 - combined) * 1.68 * edgeFade)) : 0;
        } else if ((themeStyle === 'prussian_blue' || themeStyle === 'rain_storm') && sat > 0.36) {
          // 4. Prussian Blue with Cerulean Watercolor Wash
          sData[pIdx] = Math.round(rOrig * 0.8 * pencilFactor);
          sData[pIdx + 1] = Math.round(Math.min(255, gOrig * 1.1) * pencilFactor);
          sData[pIdx + 2] = Math.round(Math.min(255, bOrig * 1.35) * pencilFactor);
          sData[pIdx + 3] = Math.min(255, Math.round((inkDarkness * 1.35 + 175) * edgeFade));
        } else if (themeStyle === 'emerald_gold' && sat > 0.36) {
          // 5. Royal Pine with Champagne Gold
          sData[pIdx] = Math.round(Math.min(255, rOrig * 1.2) * pencilFactor);
          sData[pIdx + 1] = Math.round(Math.min(255, gOrig * 1.15) * pencilFactor);
          sData[pIdx + 2] = Math.round(bOrig * 0.8 * pencilFactor);
          sData[pIdx + 3] = Math.min(255, Math.round((inkDarkness * 1.35 + 175) * edgeFade));
        } else {
          // 6. Master Hand-Drawn Graphite & Charcoal Sketch (Pure pencil drawing)
          sData[pIdx] = baseR;
          sData[pIdx + 1] = baseG;
          sData[pIdx + 2] = baseB;
          sData[pIdx + 3] = combined < 246 ? Math.min(255, Math.round((255 - combined) * 1.75 * edgeFade)) : 0;
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

    // 6. BACKGROUND MULTILINGUAL TYPOGRAPHY (Dense, Balanced Framing Across 100 Languages)
    const bgTexts: BackgroundText[] = [];
    let wordIdx = 0;

    // A. Top Header Margin (3 horizontal rows across top)
    const topRowY = [35, 70, 105];
    const topColX = [30, 160, 290, 420, 550, 680];
    topRowY.forEach((ty) => {
      if (ty < targetY - 18) {
        topColX.forEach((tx) => {
          if (phrases.length > 0) {
            const phrase = phrases[wordIdx % phrases.length];
            wordIdx++;
            bgTexts.push({
              x: tx,
              y: ty,
              text: phrase.text,
              fontSize: 12.5,
              progressY: ty / height,
              color: palette.bgText
            });
          }
        });
      }
    });

    // B. Left Gutter Margin (3 staggered columns)
    const leftCols = [22, 68, 114];
    for (let y = 35; y < height - 35; y += 38) {
      leftCols.forEach((colX, cIdx) => {
        if (colX < targetX - 16) {
          const staggeredY = y + (cIdx % 2 === 1 ? 19 : 0);
          if (staggeredY < height - 35 && phrases.length > 0) {
            const phrase = phrases[wordIdx % phrases.length];
            wordIdx++;
            bgTexts.push({
              x: colX,
              y: staggeredY,
              text: phrase.text,
              fontSize: 12,
              progressY: staggeredY / height,
              color: palette.bgText
            });
          }
        }
      });
    }

    // C. Right Gutter Margin (3 staggered columns)
    const rightMarginStart = targetX + targetW + 18;
    const rightCols = [rightMarginStart, rightMarginStart + 46, rightMarginStart + 92];
    for (let y = 35; y < height - 35; y += 38) {
      rightCols.forEach((colX, cIdx) => {
        if (colX < width - 50) {
          const staggeredY = y + (cIdx % 2 === 1 ? 19 : 0);
          if (staggeredY < height - 35 && phrases.length > 0) {
            const phrase = phrases[wordIdx % phrases.length];
            wordIdx++;
            bgTexts.push({
              x: colX,
              y: staggeredY,
              text: phrase.text,
              fontSize: 12,
              progressY: staggeredY / height,
              color: palette.bgText
            });
          }
        }
      });
    }

    // D. Bottom Footer Margin (3 horizontal rows across bottom)
    const bottomStartY = targetY + targetH + 28;
    const bottomRowY = [bottomStartY, bottomStartY + 35, bottomStartY + 70];
    const bottomColX = [30, 160, 290, 420, 550, 680];
    bottomRowY.forEach((by) => {
      if (by < height - 20) {
        bottomColX.forEach((bx) => {
          if (phrases.length > 0) {
            const phrase = phrases[wordIdx % phrases.length];
            wordIdx++;
            bgTexts.push({
              x: bx,
              y: by,
              text: phrase.text,
              fontSize: 12,
              progressY: by / height,
              color: palette.bgText
            });
          }
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

  // Photorealistic Luxury Fountain Pen (Montblanc Meisterstück Style with Solid Gold Nib & Flowing Ink Trail)
  const drawLuxuryFountainPen = useCallback((
    ctx: CanvasRenderingContext2D,
    penX: number,
    penY: number,
    palette: { ink: string; penGlow: string },
    isDrawing: boolean
  ) => {
    // 1. FLUID LIQUID INK FLOURISH TRAILING FROM NIB TIP (Direct reference to user's uploaded art)
    const now = Date.now();
    const trail = inkTrailRef.current;
    
    // Add current nib tip position to ink ribbon history
    if (isDrawing) {
      trail.push({ x: penX, y: penY, time: now });
      // Keep recent 700ms trail for a dynamic, smooth cursive ink ribbon
      while (trail.length > 0 && now - trail[0].time > 700) {
        trail.shift();
      }
    } else {
      trail.length = 0;
    }

    // Render the smooth cursive ink wave
    if (trail.length >= 2) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 0; i < trail.length - 1; i++) {
        const p1 = trail[i];
        const p2 = trail[i + 1];
        const progress = i / (trail.length - 1);
        const alpha = Math.max(0.18, progress);
        const strokeW = 0.9 + progress * 2.8;

        // Rich fountain pen ink
        ctx.strokeStyle = palette.ink;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = strokeW;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Wet ink glistening sheen along newest portion of the line
        if (progress > 0.65) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p1.x - 0.5, p1.y - 0.5);
          ctx.lineTo(p2.x - 0.5, p2.y - 0.5);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // 2. LUXURY FOUNTAIN PEN BODY & STUDIO CONTACT SHADOW
    const penImg = luxuryPenImgRef.current;
    const penW = 215;
    const penH = 225;
    const posX = penX - 3;
    const posY = penY;

    ctx.save();

    // Soft diffused studio contact shadow cast onto paper
    ctx.save();
    ctx.translate(posX + 16, posY + 18);
    ctx.filter = 'blur(8px)';
    ctx.fillStyle = 'rgba(25, 20, 15, 0.24)';
    ctx.beginPath();
    ctx.ellipse(85, 75, 78, 18, 0.78, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (penImg && penImg.complete && penImg.naturalWidth > 0) {
      // Draw photorealistic Meisterstück luxury fountain pen
      ctx.drawImage(penImg, posX, posY, penW, penH);
    } else {
      // Instant high-polish vector fallback (18K two-tone gold nib & piano-black lacquer barrel)
      ctx.save();
      ctx.translate(penX, penY);
      ctx.rotate(0.82);

      // 18K Gold Nib
      const nibGrad = ctx.createLinearGradient(0, -6, 0, 6);
      nibGrad.addColorStop(0, '#ffd700');
      nibGrad.addColorStop(0.3, '#fff4b8');
      nibGrad.addColorStop(0.6, '#d4af37');
      nibGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = nibGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(24, -7);
      ctx.lineTo(24, 7);
      ctx.closePath();
      ctx.fill();

      // Piano-Black Precious Lacquer Barrel
      const barrelGrad = ctx.createLinearGradient(24, -9, 24, 9);
      barrelGrad.addColorStop(0, '#2d3748');
      barrelGrad.addColorStop(0.2, '#0a0a0a');
      barrelGrad.addColorStop(0.7, '#171923');
      barrelGrad.addColorStop(1, '#000000');
      ctx.fillStyle = barrelGrad;
      ctx.fillRect(24, -8, 160, 16);

      // Gold Triple Trim Rings
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(38, -8.5, 4, 17);
      ctx.fillRect(92, -8.5, 6, 17);
      ctx.fillRect(100, -8.5, 2, 17);

      ctx.restore();
    }

    // 3. WET INK BEAD AT EXACT NIB TIP
    if (isDrawing) {
      const timeSec = Date.now() / 1000;
      const beadR = 2.0 + Math.sin(timeSec * 14) * 0.5;

      // Deep ink bead
      ctx.fillStyle = palette.ink;
      ctx.beginPath();
      ctx.arc(penX, penY, beadR, 0, Math.PI * 2);
      ctx.fill();

      // Specular micro-reflection
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(penX - 0.6, penY - 0.6, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, []);

  // Frame Draw Function
  const drawFrame = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    progressRatio: number,
    renderHand: boolean = showArtistHand
  ) => {
    const palette = getThemePalette();
    const currentY = height * progressRatio;
    const centerX = width / 2;

    // Calculate natural calligraphic cursive motion for the fountain pen
    const time = Date.now() / 1000;
    const cursiveWaveX = Math.sin(time * 8.5) * 44 + Math.cos(time * 19.0) * 16;
    const cursiveWaveY = Math.sin(time * 17.0) * 11 + Math.cos(time * 7.5) * 5;

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

    // 2. DRAW LOOSE GESTURAL SKETCH STROKES
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
    ctx.font = `italic 400 12px "Segoe UI", "Noto Sans", "Apple Color Emoji", Georgia, "Times New Roman", serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < bgTexts.length; i++) {
      const bt = bgTexts[i];
      if (bt.progressY <= progressRatio) {
        ctx.fillStyle = bt.color;
        ctx.fillText(bt.text, bt.x, bt.y);
      }
    }

    // Dynamic active pen coordinates (following hatching lines or dancing along calligraphy)
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

    const activePenX = Math.min(width - 40, Math.max(40, penX + cursiveWaveX));
    const activePenY = Math.min(height - 15, Math.max(15, currentY + cursiveWaveY));

    // 4. DRAW MASTERPIECE GRAPHITE SKETCH & VOLUMETRIC SHADING (Organic Calligraphic Reveal)
    const sketchCanvas = sketchCanvasRef.current;
    const bounds = imageBoundsRef.current;

    if (sketchCanvas && bounds.w > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bounds.x, bounds.y);
      ctx.lineTo(bounds.x + bounds.w, bounds.y);
      ctx.lineTo(bounds.x + bounds.w, Math.max(bounds.y, currentY));

      // Organic feathered edge trailing the active pen position (No artificial straight scanner line!)
      const steps = 30;
      const stepW = bounds.w / steps;
      for (let s = steps; s >= 0; s--) {
        const px = bounds.x + s * stepW;
        const dist = Math.abs(px - activePenX);
        const wave = Math.sin(s * 0.75 + progressRatio * 18) * 7 * Math.exp(-dist / 140);
        ctx.lineTo(px, Math.max(bounds.y, currentY + wave));
      }
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(sketchCanvas, bounds.x, bounds.y, bounds.w, bounds.h);
      ctx.restore();
    }

    // 5. ACTIVE LUXURY FOUNTAIN PEN (Montblanc Style with Gold Nib & Dynamic Ink Trail)
    if (progressRatio < 1.0) {
      if (renderHand) {
        drawLuxuryFountainPen(ctx, activePenX, activePenY, palette, true);
      } else {
        // Classic luminous nib glow
        ctx.save();
        const nibGrad = ctx.createRadialGradient(activePenX, activePenY, 1, activePenX, activePenY, 16);
        nibGrad.addColorStop(0, '#ffffff');
        nibGrad.addColorStop(0.3, palette.penGlow);
        nibGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = nibGrad;
        ctx.beginPath();
        ctx.arc(activePenX, activePenY, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = palette.ink;
        ctx.beginPath();
        ctx.arc(activePenX, activePenY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 7. ELEGANT WATERMARK
    ctx.save();
    ctx.font = `italic 11.5px Georgia, "Times New Roman", serif`;
    ctx.fillStyle = palette.bgText;
    ctx.textAlign = 'right';
    ctx.fillText(
      titleText ? `${titleText} • Masterpiece Sketch Studio` : 'Masterpiece Sketch Studio',
      width - 24,
      height - 20
    );
    ctx.restore();
  }, [getThemePalette, themeStyle, titleText, drawLuxuryFountainPen, showArtistHand]);

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
        drawFrame(ctx, canvas.width, canvas.height, progress, showArtistHand);
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, drawFrame, totalCycleMs, durationMs, showArtistHand]);

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
      drawFrame(exportCtx, 1600, 2000, 1.0, false);
      const link = document.createElement('a');
      link.download = `${titleText || 'masterpiece-sketch'}-studio-art.png`;
      link.href = exportCanvas.toDataURL('image/png', 1.0);
      link.click();
    }
  };

  const downloadHalfImage = (which: 'left' | 'right') => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1600;
    exportCanvas.height = 2000;
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;

    drawFrame(exportCtx, 1600, 2000, 1.0, false);

    const halfCanvas = document.createElement('canvas');
    halfCanvas.width = 800;
    halfCanvas.height = 2000;
    const hCtx = halfCanvas.getContext('2d');
    if (hCtx) {
      const srcX = which === 'left' ? 0 : 800;
      hCtx.drawImage(exportCanvas, srcX, 0, 800, 2000, 0, 0, 800, 2000);
      const link = document.createElement('a');
      link.download = `${titleText || 'masterpiece'}-${which}-isolated.png`;
      link.href = halfCanvas.toDataURL('image/png', 1.0);
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
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-1 sm:py-2 px-1">
      {/* Top Navigation Bar */}
      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-3 sm:pb-4 mb-3 border-b border-[#1f2d4e]">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={onBackToEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#0c1429] hover:bg-[#162347] text-slate-300 hover:text-white text-xs font-semibold border border-[#243356] transition shrink-0"
          >
            <ArrowLeft size={14} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-600/20 hover:from-pink-500/30 hover:to-purple-600/30 text-pink-300 font-semibold text-xs border border-pink-500/40 transition shadow-sm shrink-0"
          >
            <Gift size={14} className="text-pink-400" />
            <span>Share Gift 🎁</span>
          </button>

          <button
            type="button"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 text-cyan-300 font-semibold text-xs border border-cyan-500/40 transition shadow-sm cursor-pointer shrink-0"
            title="Open 2-Person Chat"
          >
            <MessageSquare size={14} className="text-cyan-400" />
            <span>Live Chat 💬</span>
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0c1429] border border-[#243356] text-[11px] sm:text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Progress: {currentProgress}%</span>
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
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>

      {/* Main Video Canvas Player Frame */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#243356] shadow-[0_0_60px_rgba(0,180,255,0.18)] bg-[#050914] aspect-[4/5] w-full max-w-[560px]">
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

        {/* Live Partner Whisper on Canvas */}
        {activeWhisper && (
          <div className="absolute inset-x-4 sm:inset-x-6 top-1/2 -translate-y-1/2 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-black/85 backdrop-blur-md border border-amber-400/60 text-center animate-in fade-in zoom-in-95 duration-300 z-30 shadow-[0_0_40px_rgba(251,191,36,0.4)]">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 block mb-1">
              ✦ Partner Whisper on Canvas ✦
            </span>
            <p className="text-sm sm:text-xl font-serif italic text-white drop-shadow leading-relaxed">
              &ldquo;{activeWhisper}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Video Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full max-w-[560px] gap-2.5 sm:gap-2 mt-3.5 sm:mt-5 px-1">
        {/* Playback Controls */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0c1429] hover:bg-[#162347] text-slate-300 hover:text-white text-xs font-medium border border-[#243356] transition"
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#0c1429] hover:bg-[#162347] text-slate-300 hover:text-white text-xs font-medium border border-[#243356] transition"
              title="Replay from top"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Replay</span>
            </button>

            <button
              type="button"
              onClick={() => setShowArtistHand(!showArtistHand)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                showArtistHand
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm'
                  : 'bg-[#0c1429] border-[#243356] text-slate-400 hover:text-white'
              }`}
              title="Toggle luxury fountain pen & ink trail animation"
            >
              <PenTool size={13} className={showArtistHand ? 'text-amber-400' : 'text-slate-400'} />
              <span>Pen: {showArtistHand ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0c1429] hover:bg-[#162347] text-pink-400 text-xs font-semibold border border-pink-500/30 transition"
          >
            <Gift size={13} />
            <span>Share</span>
          </button>
        </div>

        {/* Download & Export Group */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0c1429] hover:bg-[#162347] text-pink-400 hover:text-pink-300 text-xs font-semibold border border-pink-500/30 transition"
          >
            <Gift size={14} />
            <span>Share Gift</span>
          </button>

          <button
            type="button"
            onClick={downloadHighResImage}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0c1429] hover:bg-[#162347] text-slate-300 hover:text-white text-xs font-medium border border-[#243356] transition"
            title="Download full 4K artwork"
          >
            <Download size={13} />
            <span>Save 4K</span>
          </button>

          <button
            type="button"
            onClick={() => downloadHalfImage('left')}
            className="hidden md:flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-[#0c1429] hover:bg-[#162347] text-slate-400 hover:text-white text-[11px] font-medium border border-[#243356] transition"
            title="Download left partner artwork separately"
          >
            <Download size={11} />
            <span>Left 1/2</span>
          </button>

          <button
            type="button"
            onClick={() => downloadHalfImage('right')}
            className="hidden md:flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-[#0c1429] hover:bg-[#162347] text-slate-400 hover:text-white text-[11px] font-medium border border-[#243356] transition"
            title="Download right partner artwork separately"
          >
            <Download size={11} />
            <span>Right 1/2</span>
          </button>

          <button
            type="button"
            onClick={recordVideo}
            disabled={isRecording}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0066ff] hover:brightness-110 text-white text-xs font-semibold shadow-md shadow-blue-500/30 transition cursor-pointer"
          >
            <Video size={13} />
            <span>{isRecording ? 'Recording...' : 'Save Video'}</span>
          </button>
        </div>
      </div>

      {/* Share Gift Modal */}
      <ShareGiftModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        toName={titleText}
        message={titleText}
        themeStyle={themeStyle}
        musicTrack={musicTrack}
        photoImage={photoImage}
      />

      {/* 2-Person Live Duo Chat */}
      <LiveDuoChat
        roomId={activeRoomId}
        defaultSender={senderName}
        onWhisper={handleWhisper}
        isOpen={isChatOpen}
        onToggleOpen={setIsChatOpen}
      />
    </div>
  );
}
