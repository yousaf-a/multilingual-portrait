'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TranslatedItem } from '@/lib/languages';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, ArrowLeft, Video } from 'lucide-react';
import { audioController } from '@/lib/audio';

// An individual curly scribble coil (exactly like sudhin__art)
interface ScribbleCluster {
  x: number;
  y: number;
  radius: number;
  numLoops: number;
  progressY: number;
  angleStart: number;
}

// Background multilingual text placed strictly OUTSIDE the subject
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

  const durationMs = 8500; // 8.5s drawing sweep
  const pauseDurationMs = 3500; // 3.5s pause to admire completed artwork
  const totalCycleMs = durationMs + pauseDurationMs;
  const startTimeRef = useRef<number>(Date.now());

  // Cached pre-computed clusters & background text
  const scribbleClustersRef = useRef<ScribbleCluster[]>([]);
  const backgroundTextsRef = useRef<BackgroundText[]>([]);

  // Theme palettes
  const getThemePalette = useCallback(() => {
    switch (themeStyle) {
      case 'emerald':
        return {
          bg: '#fcfbfa',
          darkBg: false,
          ink: '#14381e',
          bgText: 'rgba(29, 74, 42, 0.38)',
          paperVignette: '#f2ece4',
          penGlow: '#1d4a2a'
        };
      case 'gold':
        return {
          bg: '#08080a',
          darkBg: true,
          ink: '#e6c364',
          bgText: 'rgba(230, 195, 100, 0.35)',
          paperVignette: '#000000',
          penGlow: '#e6c364'
        };
      case 'rain_storm':
        return {
          bg: '#080d1a',
          darkBg: true,
          ink: '#e2e8f0',
          bgText: 'rgba(56, 189, 248, 0.32)',
          paperVignette: '#040710',
          penGlow: '#38bdf8'
        };
      case 'neon':
        return {
          bg: '#060a17',
          darkBg: true,
          ink: '#00e5ff',
          bgText: 'rgba(0, 229, 255, 0.32)',
          paperVignette: '#03050c',
          penGlow: '#00e5ff'
        };
      case 'monochrome':
      default:
        // Pure Authentic sudhin__art black ballpoint pen on textured paper
        return {
          bg: '#fbf9f5',
          darkBg: false,
          ink: '#18181b',
          bgText: 'rgba(113, 113, 122, 0.45)',
          paperVignette: '#ece7de',
          penGlow: '#18181b'
        };
    }
  }, [themeStyle]);

  // Precompute the pure curly scribble clusters and background text
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

    const clusters: ScribbleCluster[] = [];
    const bgTexts: BackgroundText[] = [];

    const cols = 120;
    const rows = 150;
    const cellW = width / cols;
    const cellH = height / rows;
    const densityMap: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

    if (photoImage) {
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = cols;
      sampleCanvas.height = rows;
      const sCtx = sampleCanvas.getContext('2d');

      if (sCtx) {
        sCtx.fillStyle = '#ffffff';
        sCtx.fillRect(0, 0, cols, rows);

        const imgAspect = photoImage.width / photoImage.height;
        let dw = cols * 0.72;
        let dh = dw / imgAspect;
        if (dh > rows * 0.8) {
          dh = rows * 0.8;
          dw = dh * imgAspect;
        }
        const dx = (cols - dw) / 2;
        const dy = (rows - dh) / 2 + 5;

        sCtx.drawImage(photoImage, dx, dy, dw, dh);
        const data = sCtx.getImageData(0, 0, cols, rows).data;

        // Auto-detect background color from the 4 corners
        const cornerIdxs = [0, (cols - 1) * 4, ((rows - 1) * cols) * 4, ((rows - 1) * cols + cols - 1) * 4];
        let bgR = 0, bgG = 0, bgB = 0;
        cornerIdxs.forEach(ci => {
          bgR += data[ci] / 4;
          bgG += data[ci + 1] / 4;
          bgB += data[ci + 2] / 4;
        });

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const idx = (y * cols + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];

            if (a > 30) {
              const diffFromBg = Math.sqrt(
                Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
              ) / 255;

              const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
              const shadowVal = 1 - luminance;

              // Is this pixel part of the subject?
              if (diffFromBg > 0.15 || shadowVal > 0.2) {
                densityMap[y][x] = Math.max(diffFromBg, shadowVal);
              }
            }
          }
        }
      }
    } else {
      // Procedural silhouette if no image
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const nx = (x - cols / 2) / (cols * 0.32);
          const ny = (y - rows * 0.45) / (rows * 0.35);
          const dist = Math.sqrt(nx * nx + ny * ny);
          if (dist < 1.0) {
            densityMap[y][x] = Math.max(0, 1 - dist);
          }
        }
      }
    }

    // 1. GENERATE CURLY SCRIBBLE LOOPS FOR SUBJECT ONLY (NO HORIZONTAL CROSS LINES!)
    // Iterate and create standalone curly spirograph clusters
    const step = 2; // Step size across cells
    let seed = 12345;
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let y = 3; y < rows - 3; y += step) {
      const py = y * cellH;
      const progressY = py / height;

      for (let x = 3; x < cols - 3; x += step) {
        const d = densityMap[y][x];

        // Only draw where subject density exists
        if (d > 0.18) {
          const px = x * cellW;

          // Number of overlapping loops based on darkness:
          // Hair & deep shadows: 3-5 tight loops
          // Light skin & midtones: 1-2 open loops
          const numLoops = d > 0.65 ? 4 : d > 0.4 ? 2.5 : 1.5;
          const radius = Math.max(3.0, Math.min(11.0, 9.0 * (1 - d * 0.55)));

          clusters.push({
            x: px + (pseudoRandom() - 0.5) * 4,
            y: py + (pseudoRandom() - 0.5) * 4,
            radius,
            numLoops,
            progressY,
            angleStart: pseudoRandom() * Math.PI * 2
          });
        }
      }
    }

    // 2. GENERATE BACKGROUND MULTILINGUAL TEXT (STRICTLY OUTSIDE THE SUBJECT)
    // Neatly fill the margin and outer portrait area
    let wordIdx = 0;
    const textRowGap = 32;
    const textColGap = 20;

    for (let y = 5; y < rows - 5; y += textRowGap) {
      const py = y * cellH;
      const progressY = py / height;

      for (let x = 4; x < cols - 4; x += textColGap) {
        // Confirm this area is strictly OUTSIDE the subject
        let hasSubject = false;
        for (let dy = -6; dy <= 6; dy += 3) {
          for (let dx = -6; dx <= 6; dx += 3) {
            const cy = Math.max(0, Math.min(rows - 1, y + dy));
            const cx = Math.max(0, Math.min(cols - 1, x + dx));
            if (densityMap[cy][cx] > 0.1) {
              hasSubject = true;
              break;
            }
          }
          if (hasSubject) break;
        }

        // Only render text in the empty background outside the subject
        if (!hasSubject) {
          const phrase = phrases[wordIdx % phrases.length];
          wordIdx++;

          bgTexts.push({
            x: x * cellW,
            y: py,
            text: phrase.text,
            fontSize: 13,
            progressY,
            color: palette.bgText
          });
        }
      }
    }

    // Sort top to bottom
    clusters.sort((a, b) => a.progressY - b.progressY);
    bgTexts.sort((a, b) => a.progressY - b.progressY);

    scribbleClustersRef.current = clusters;
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

    // 1. Paper Background
    ctx.save();
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);

    if (!palette.darkBg) {
      // Warm off-white paper vignette
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

    // 3. DRAW CURLY SCRIBBLE ART FOR THE SUBJECT (sudhin__art style)
    // Individual, independent looping cycloid coils (NO STRAIGHT HORIZONTAL CONNECTING LINES!)
    const clusters = scribbleClustersRef.current;
    let penX = centerX;
    let penY = progressRatio * height;

    ctx.strokeStyle = palette.ink;
    ctx.lineWidth = 0.95; // Fine black gel/ballpoint pen weight
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < clusters.length; i++) {
      const c = clusters[i];
      if (c.progressY <= progressRatio) {
        // Draw this cluster as its own independent circular scribble loop
        ctx.beginPath();
        const totalSteps = Math.round(c.numLoops * 14);
        for (let s = 0; s < totalSteps; s++) {
          const th = c.angleStart + s * 0.52;
          const currentR = c.radius * (0.8 + 0.3 * Math.sin(s * 0.25));
          const cx = c.x + Math.cos(th) * currentR;
          const cy = c.y + Math.sin(th) * currentR;

          if (s === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        }
        ctx.stroke();

        penX = c.x;
        penY = c.y;
      } else {
        break;
      }
    }

    // 4. ACTIVE PEN NIB & SKETCHING SPARKLE (Sweeping down)
    if (progressRatio < 1.0) {
      const currentY = progressRatio * height;

      ctx.save();
      // Fine ink nib aura
      const nibGrad = ctx.createRadialGradient(penX, currentY, 1, penX, currentY, 18);
      nibGrad.addColorStop(0, '#ffffff');
      nibGrad.addColorStop(0.3, palette.penGlow);
      nibGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = nibGrad;
      ctx.beginPath();
      ctx.arc(penX, currentY, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = palette.ink;
      ctx.beginPath();
      ctx.arc(penX, currentY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 5. Signature / Watermark at Bottom Right
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
