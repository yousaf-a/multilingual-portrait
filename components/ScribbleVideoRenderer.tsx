'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TranslatedItem } from '@/lib/languages';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, ArrowLeft, Video } from 'lucide-react';
import { audioController } from '@/lib/audio';

interface CurlyCoil {
  cx: number;
  cy: number;
  radius: number;
  steps: number;
  angleStart: number;
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
  themeStyle: 'emerald' | 'gold' | 'neon' | 'monochrome' | 'rain_storm';
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
  const pauseDurationMs = 3500; // 3.5s pause on full reveal
  const totalCycleMs = durationMs + pauseDurationMs;
  const startTimeRef = useRef<number>(Date.now());

  // Cached processed sketch canvas & coils
  const sketchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const curlyCoilsRef = useRef<CurlyCoil[]>([]);
  const backgroundTextsRef = useRef<BackgroundText[]>([]);
  const imageBoundsRef = useRef<{ x: number; y: number; w: number; h: number }>({ x: 0, y: 0, w: 0, h: 0 });

  // Theme palettes
  const getThemePalette = useCallback(() => {
    switch (themeStyle) {
      case 'emerald':
        return {
          bg: '#fbfaf8',
          darkBg: false,
          ink: '#14381e',
          bgText: 'rgba(29, 74, 42, 0.42)',
          paperVignette: '#f2ece4',
          penGlow: '#1d4a2a'
        };
      case 'gold':
        return {
          bg: '#08080a',
          darkBg: true,
          ink: '#e6c364',
          bgText: 'rgba(230, 195, 100, 0.38)',
          paperVignette: '#000000',
          penGlow: '#e6c364'
        };
      case 'rain_storm':
        return {
          bg: '#080d1a',
          darkBg: true,
          ink: '#e2e8f0',
          bgText: 'rgba(56, 189, 248, 0.35)',
          paperVignette: '#040710',
          penGlow: '#38bdf8'
        };
      case 'neon':
        return {
          bg: '#060a17',
          darkBg: true,
          ink: '#00e5ff',
          bgText: 'rgba(0, 229, 255, 0.35)',
          paperVignette: '#03050c',
          penGlow: '#00e5ff'
        };
      case 'monochrome':
      default:
        // Pure Authentic sudhin__art black ballpoint/gel pen on paper
        return {
          bg: '#fbf9f5',
          darkBg: false,
          ink: '#18181b',
          bgText: 'rgba(113, 113, 122, 0.42)',
          paperVignette: '#ece7de',
          penGlow: '#18181b'
        };
    }
  }, [themeStyle]);

  // Pre-process the uploaded photo into authentic line sketch + curly coils + outside text
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
      { text: "Чашка для чая", language: "Russian" },
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
    let targetW = width * 0.76;
    let targetH = targetW / imgAspect;
    if (targetH > height * 0.82) {
      targetH = height * 0.82;
      targetW = targetH * imgAspect;
    }
    const targetX = (width - targetW) / 2;
    const targetY = (height - targetH) / 2;
    imageBoundsRef.current = { x: targetX, y: targetY, w: targetW, h: targetH };

    // 1. GENERATE CLEAN LINE ART VIA COLOR DODGE FILTER (Features are 100% sharp & recognizable)
    const procCanvas = document.createElement('canvas');
    procCanvas.width = Math.round(targetW);
    procCanvas.height = Math.round(targetH);
    const pCtx = procCanvas.getContext('2d');

    const curlyCoils: CurlyCoil[] = [];

    if (pCtx) {
      pCtx.drawImage(photoImage, 0, 0, procCanvas.width, procCanvas.height);
      const imgData = pCtx.getImageData(0, 0, procCanvas.width, procCanvas.height);
      const data = imgData.data;
      const pw = procCanvas.width;
      const ph = procCanvas.height;

      // Convert to grayscale & compute simple blur for color dodge
      const gray = new Uint8Array(pw * ph);
      for (let i = 0; i < data.length; i += 4) {
        gray[i / 4] = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      }

      // 5x5 Box Blur approximation
      const blurred = new Uint8Array(pw * ph);
      const r = 4;
      for (let y = 0; y < ph; y++) {
        for (let x = 0; x < pw; x++) {
          let sum = 0, count = 0;
          for (let dy = -r; dy <= r; dy += 2) {
            for (let dx = -r; dx <= r; dx += 2) {
              const ny = y + dy;
              const nx = x + dx;
              if (ny >= 0 && ny < ph && nx >= 0 && nx < pw) {
                sum += (255 - gray[ny * pw + nx]); // Invert
                count++;
              }
            }
          }
          blurred[y * pw + x] = sum / count;
        }
      }

      // Color Dodge calculation & Contrast enhance
      const sketchData = pCtx.createImageData(pw, ph);
      const sData = sketchData.data;

      for (let i = 0; i < gray.length; i++) {
        const g = gray[i];
        const b = blurred[i];
        // Color dodge
        let val = Math.min(255, Math.floor((g * 256) / Math.max(1, 255 - b)));
        // Contrast curve: push highlights to transparent, keep sharp pencil lines
        const norm = val / 255;
        const contrastVal = Math.pow(norm, 2.2) * 255;

        const pIdx = i * 4;
        const isDark = contrastVal < 225;

        if (palette.darkBg) {
          // Inverted for dark mode: bright line on dark
          const inkBrightness = Math.round(255 - contrastVal);
          sData[pIdx] = 226;
          sData[pIdx + 1] = 195;
          sData[pIdx + 2] = 100;
          sData[pIdx + 3] = isDark ? Math.min(255, inkBrightness * 1.5) : 0;
        } else {
          // Black gel pen ink on paper
          sData[pIdx] = 24;
          sData[pIdx + 1] = 24;
          sData[pIdx + 2] = 27;
          sData[pIdx + 3] = isDark ? Math.min(255, Math.round((255 - contrastVal) * 1.6)) : 0;
        }

        // 2. Sample dark regions for CURLY SCRIBBLE COILS (sudhin__art texture)
        const yCoord = Math.floor(i / pw);
        const xCoord = i % pw;

        if (g < 130 && yCoord % 9 === 0 && xCoord % 9 === 0) {
          const darkness = (130 - g) / 130;
          const radius = Math.max(2.5, Math.min(8.0, 7.0 * (1 - darkness * 0.5)));
          const absY = targetY + yCoord;
          const absX = targetX + xCoord;

          curlyCoils.push({
            cx: absX,
            cy: absY,
            radius,
            steps: Math.round(14 + darkness * 16),
            angleStart: (xCoord * 1.7 + yCoord * 2.3) % (Math.PI * 2),
            progressY: absY / height
          });
        }
      }

      pCtx.putImageData(sketchData, 0, 0);
      sketchCanvasRef.current = procCanvas;
    }

    curlyCoils.sort((a, b) => a.progressY - b.progressY);
    curlyCoilsRef.current = curlyCoils;

    // 3. GENERATE BACKGROUND MULTILINGUAL TEXT (OUTSIDE SUBJECT ONLY)
    // Neatly fill the outer canvas margins without disturbing the portrait
    const bgTexts: BackgroundText[] = [];
    let wordIdx = 0;
    const textRowGap = 34;
    const textColGap = 88;

    for (let y = 30; y < height - 30; y += textRowGap) {
      const progressY = y / height;
      for (let x = 25; x < width - 75; x += textColGap) {
        // Place strictly in the outer background margins (do not touch image)
        const isInsidePortrait = (
          x > targetX - 15 &&
          x < targetX + targetW + 15 &&
          y > targetY - 15 &&
          y < targetY + targetH + 15
        );

        if (!isInsidePortrait) {
          const phrase = phrases[wordIdx % phrases.length];
          wordIdx++;

          bgTexts.push({
            x: x + Math.sin(y) * 8,
            y,
            text: phrase.text,
            fontSize: 13,
            progressY,
            color: palette.bgText
          });
        }
      }
    }

    bgTexts.sort((a, b) => a.progressY - b.progressY);
    backgroundTextsRef.current = bgTexts;
  }, [photoImage, items, titleText, getThemePalette]);

  // Audio start/stop
  useEffect(() => {
    audioController.start(musicTrack, customMusicUrl);
    return () => {
      audioController.stop();
    };
  }, [musicTrack, customMusicUrl]);

  // Draw frame
  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, progressRatio: number) => {
    const palette = getThemePalette();
    const centerX = width / 2;
    const centerY = height / 2;
    const currentY = progressRatio * height;

    // 1. Paper Background
    ctx.save();
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);

    if (!palette.darkBg) {
      // Warm textured paper vignette
      const paperGrad = ctx.createRadialGradient(centerX, centerY, width * 0.25, centerX, centerY, width * 0.72);
      paperGrad.addColorStop(0, '#ffffff');
      paperGrad.addColorStop(1, palette.paperVignette);
      ctx.fillStyle = paperGrad;
      ctx.fillRect(0, 0, width, height);
    } else {
      const darkGrad = ctx.createRadialGradient(centerX, centerY, width * 0.2, centerX, centerY, width * 0.7);
      darkGrad.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
      darkGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
      ctx.fillStyle = darkGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // Rain streaks if rain_storm
    if (themeStyle === 'rain_storm') {
      const now = Date.now() * 0.001;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1;
      for (let r = 0; r < 35; r++) {
        const rx = (r * 37 + (r % 7) * 11) % width;
        const ry = (now * 650 + r * 53) % (height + 60) - 30;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 2, ry + 18);
        ctx.stroke();
      }
    }

    // 2. DRAW BACKGROUND MULTILINGUAL TEXT (OUTSIDE SUBJECT ONLY)
    const bgTexts = backgroundTextsRef.current;
    ctx.font = `500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < bgTexts.length; i++) {
      const bt = bgTexts[i];
      if (bt.progressY <= progressRatio) {
        ctx.fillStyle = bt.color;
        ctx.fillText(bt.text, bt.x, bt.y);
      }
    }

    // 3. DRAW THE CRISP SKETCH LINE-ART (Revealed Top-to-Bottom)
    const sketchCanvas = sketchCanvasRef.current;
    const bounds = imageBoundsRef.current;

    if (sketchCanvas && bounds.w > 0) {
      ctx.save();
      // Clip to current pen sweep line Y
      ctx.beginPath();
      ctx.rect(bounds.x, bounds.y, bounds.w, Math.max(0, currentY - bounds.y));
      ctx.clip();

      ctx.drawImage(sketchCanvas, bounds.x, bounds.y, bounds.w, bounds.h);
      ctx.restore();
    }

    // 4. DRAW CURLY SCRIBBLE COILS FOR SHADOWS & HAIR (sudhin__art style)
    const coils = curlyCoilsRef.current;
    let penX = centerX;

    ctx.strokeStyle = palette.ink;
    ctx.lineWidth = 0.9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < coils.length; i++) {
      const c = coils[i];
      if (c.progressY <= progressRatio) {
        ctx.beginPath();
        for (let s = 0; s < c.steps; s++) {
          const th = c.angleStart + s * 0.55;
          const cx = c.cx + Math.cos(th) * c.radius;
          const cy = c.cy + Math.sin(th) * c.radius;
          if (s === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        }
        ctx.stroke();
        penX = c.cx;
      } else {
        break;
      }
    }

    // 5. ACTIVE PEN NIB & SKETCHING SPARKLE (Sweeping down)
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

    // 6. Watermark at Bottom Right
    ctx.save();
    ctx.font = `italic 11px sans-serif`;
    ctx.fillStyle = palette.bgText;
    ctx.textAlign = 'right';
    ctx.fillText(`${titleText || 'Scribble Portrait'} • sudhin_art style`, width - 24, height - 20);
    ctx.restore();

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
      link.download = `${titleText || 'scribble-portrait'}-sudhin-art.png`;
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
        a.download = `${titleText || 'scribble-art'}-video.webm`;
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
            <span>Scribble Progress: {currentProgress}%</span>
          </div>

          <button
            type="button"
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition ${
              !isMuted
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
            <span>Download 4K Scribble Art</span>
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
