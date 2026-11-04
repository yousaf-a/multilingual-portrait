'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TranslatedItem } from '@/lib/languages';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, ArrowLeft, Video } from 'lucide-react';
import { audioController } from '@/lib/audio';

// Continuous curly scribble loop point
interface ScribblePoint {
  x: number;
  y: number;
  progressY: number; // 0 to 1
  isStart?: boolean;
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

  const durationMs = 9000; // 9 seconds sketching sweep
  const pauseDurationMs = 3500; // 3.5s pause to admire completed artwork
  const totalCycleMs = durationMs + pauseDurationMs;
  const startTimeRef = useRef<number>(Date.now());

  // Cached geometry
  const scribblePointsRef = useRef<ScribblePoint[]>([]);
  const backgroundTextsRef = useRef<BackgroundText[]>([]);

  // Theme palettes
  const getThemePalette = useCallback(() => {
    switch (themeStyle) {
      case 'emerald':
        return {
          bg: '#fcfbfa',
          darkBg: false,
          ink: '#112918', // Deep forest green ink
          inkSecondary: '#524021',
          bgText: 'rgba(29, 74, 42, 0.45)',
          paperVignette: '#f2ece4',
          penGlow: '#2e7d32'
        };
      case 'gold':
        return {
          bg: '#08080a',
          darkBg: true,
          ink: '#e6c364', // Fine gold pen
          inkSecondary: '#b89130',
          bgText: 'rgba(230, 195, 100, 0.4)',
          paperVignette: '#000000',
          penGlow: '#e6c364'
        };
      case 'rain_storm':
        return {
          bg: '#080d1a',
          darkBg: true,
          ink: '#e2e8f0', // Clean silver/white pen
          inkSecondary: '#38bdf8',
          bgText: 'rgba(56, 189, 248, 0.35)',
          paperVignette: '#040710',
          penGlow: '#38bdf8'
        };
      case 'neon':
        return {
          bg: '#060a17',
          darkBg: true,
          ink: '#00e5ff', // Neon cyan pen
          inkSecondary: '#e024c3',
          bgText: 'rgba(0, 229, 255, 0.35)',
          paperVignette: '#03050c',
          penGlow: '#00e5ff'
        };
      case 'monochrome':
      default:
        // Pure Authentic sudhin__art black ballpoint/gel pen on textured paper
        return {
          bg: '#faf8f5',
          darkBg: false,
          ink: '#18181b', // Crisp black gel pen
          inkSecondary: '#3f3f46',
          bgText: 'rgba(82, 82, 91, 0.45)',
          paperVignette: '#ece7de',
          penGlow: '#18181b'
        };
    }
  }, [themeStyle]);

  // Generate Curly Scribbles for the Subject & Multilingual Text for the Background
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

    const scribblePoints: ScribblePoint[] = [];
    const bgTexts: BackgroundText[] = [];

    // Grid dimensions for image sampling
    const sampleCols = 160;
    const sampleRows = 200;
    const cellW = width / sampleCols;
    const cellH = height / sampleRows;

    // Subject density map
    const densityMap: number[][] = Array.from({ length: sampleRows }, () => Array(sampleCols).fill(0));

    if (photoImage) {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = sampleCols;
      offCanvas.height = sampleRows;
      const offCtx = offCanvas.getContext('2d');

      if (offCtx) {
        // Draw image centered in the canvas
        offCtx.fillStyle = '#ffffff';
        offCtx.fillRect(0, 0, sampleCols, sampleRows);

        const imgAspect = photoImage.width / photoImage.height;
        let dw = sampleCols * 0.78;
        let dh = dw / imgAspect;
        if (dh > sampleRows * 0.85) {
          dh = sampleRows * 0.85;
          dw = dh * imgAspect;
        }
        const dx = (sampleCols - dw) / 2;
        const dy = (sampleRows - dh) / 2 + 5;

        offCtx.drawImage(photoImage, dx, dy, dw, dh);
        const imgData = offCtx.getImageData(0, 0, sampleCols, sampleRows).data;

        for (let y = 0; y < sampleRows; y++) {
          for (let x = 0; x < sampleCols; x++) {
            const idx = (y * sampleCols + x) * 4;
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const a = imgData[idx + 3];

            if (a > 30) {
              const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
              // Detect subject vs white background
              if (luminance < 0.92) {
                // Non-linear contrast curve for rich shadows and delicate skin highlights
                const rawDensity = 1 - luminance;
                densityMap[y][x] = Math.pow(rawDensity, 1.3);
              }
            }
          }
        }
      }
    } else {
      // Procedural silhouette if no photo loaded
      for (let y = 0; y < sampleRows; y++) {
        for (let x = 0; x < sampleCols; x++) {
          const nx = (x - sampleCols / 2) / (sampleCols * 0.35);
          const ny = (y - sampleRows * 0.45) / (sampleRows * 0.35);
          const dist = Math.sqrt(nx * nx + ny * ny);
          if (dist < 1.0) {
            densityMap[y][x] = Math.max(0, 1 - dist);
          }
        }
      }
    }

    // 1. GENERATE CURLY SCRIBBLE LOOPS (Exactly like sudhin__art)
    // Scan horizontal bands with connected looping cycloid curls
    const rowStep = 3; // Scan every 3 rows for high-fidelity pen lines

    for (let y = 4; y < sampleRows - 4; y += rowStep) {
      let isDrawingStreak = false;
      const py = y * cellH;
      const progressY = py / height;

      for (let x = 3; x < sampleCols - 3; x++) {
        const d = densityMap[y][x];

        // Is this part of the subject?
        if (d > 0.08) {
          const px = x * cellW;

          // Number of curly loops per cell depends on shadow density (1 loop for light skin, up to 4 tight loops for dark hair)
          const loopCount = d > 0.65 ? 4 : d > 0.35 ? 2 : 1;
          const radius = Math.max(2.5, Math.min(10, 8.5 * (1 - d * 0.65)));

          if (!isDrawingStreak) {
            scribblePoints.push({ x: px, y: py, progressY, isStart: true });
            isDrawingStreak = true;
          }

          // Generate curling loop points (cycloid coils)
          for (let l = 0; l < loopCount; l++) {
            const angleOffset = (x * 1.5 + l * Math.PI) % (Math.PI * 2);
            const steps = 6;
            for (let s = 0; s < steps; s++) {
              const theta = angleOffset + (s / steps) * Math.PI * 2;
              const cx = px + Math.cos(theta) * radius + (Math.sin(y + s) * 1.2);
              const cy = py + Math.sin(theta) * radius + (Math.cos(x + s) * 1.2);

              scribblePoints.push({
                x: cx,
                y: cy,
                progressY
              });
            }
          }

          // In ultra-dark areas (hair, deep shadows), add counter-clockwise cross curls for rich ink saturation
          if (d > 0.55 && x % 2 === 0) {
            for (let s = 0; s < 5; s++) {
              const theta = -(s / 5) * Math.PI * 2;
              const cx = px + Math.cos(theta) * (radius * 0.7);
              const cy = py + Math.sin(theta) * (radius * 0.7);
              scribblePoints.push({ x: cx, y: cy, progressY });
            }
          }

        } else {
          isDrawingStreak = false;
        }
      }
    }

    // 2. GENERATE BACKGROUND MULTILINGUAL TEXT (STRICTLY OUTSIDE THE SUBJECT)
    // Place words in the margins/background where density == 0, never touching the face/body!
    let wordIdx = 0;
    const bgRowStep = 24; // Vertical spacing between text lines in background
    const bgColStep = 20;

    for (let y = 6; y < sampleRows - 6; y += bgRowStep) {
      const py = y * cellH;
      const progressY = py / height;

      for (let x = 4; x < sampleCols - 4; x += bgColStep) {
        // Check if this region is CLEAR of the subject
        let hasSubjectNearby = false;
        for (let dy = -6; dy <= 6; dy += 3) {
          for (let dx = -6; dx <= 6; dx += 3) {
            const checkY = Math.max(0, Math.min(sampleRows - 1, y + dy));
            const checkX = Math.max(0, Math.min(sampleCols - 1, x + dx));
            if (densityMap[checkY][checkX] > 0.05) {
              hasSubjectNearby = true;
              break;
            }
          }
          if (hasSubjectNearby) break;
        }

        // Only place in pure background space outside the subject
        if (!hasSubjectNearby) {
          const phrase = phrases[wordIdx % phrases.length];
          wordIdx++;

          bgTexts.push({
            x: x * cellW + (Math.sin(y) * 10),
            y: py,
            text: phrase.text,
            fontSize: 13,
            progressY,
            color: palette.bgText
          });
        }
      }
    }

    // Sort all background text and scribble points from top to bottom
    scribblePoints.sort((a, b) => a.progressY - b.progressY);
    bgTexts.sort((a, b) => a.progressY - b.progressY);

    scribblePointsRef.current = scribblePoints;
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

    // Warm paper texture / vignette
    if (!palette.darkBg) {
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

    // Falling rain streaks if rain_storm
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

    // 2. DRAW BACKGROUND MULTILINGUAL TEXT (OUTSIDE IMAGE ONLY)
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

    // 3. DRAW CURLY SCRIBBLE ART FOR THE PORTRAIT (sudhin__art style)
    const pts = scribblePointsRef.current;
    if (pts.length > 0) {
      ctx.strokeStyle = palette.ink;
      ctx.lineWidth = 0.95; // Fine ballpoint pen weight
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      let hasOpenPath = false;
      let lastX = centerX;
      let lastY = 0;

      for (let i = 0; i < pts.length; i++) {
        const pt = pts[i];
        if (pt.progressY <= progressRatio) {
          if (pt.isStart || !hasOpenPath) {
            ctx.moveTo(pt.x, pt.y);
            hasOpenPath = true;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
          lastX = pt.x;
          lastY = pt.y;
        } else {
          break;
        }
      }
      ctx.stroke();

      // 4. ACTIVE PEN NIB & SKETCHING SPARKLE (Sweeping down)
      if (progressRatio < 1.0) {
        const currentY = progressRatio * height;

        ctx.save();
        // Fine ink nib stylus
        const nibGrad = ctx.createRadialGradient(lastX, currentY, 1, lastX, currentY, 16);
        nibGrad.addColorStop(0, '#ffffff');
        nibGrad.addColorStop(0.3, palette.penGlow);
        nibGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = nibGrad;
        ctx.beginPath();
        ctx.arc(lastX, currentY, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = palette.ink;
        ctx.beginPath();
        ctx.arc(lastX, currentY, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // 5. Signature Watermark at Bottom Right (like sudhin__art)
    ctx.save();
    ctx.font = `italic 11px sans-serif`;
    ctx.fillStyle = palette.bgText;
    ctx.textAlign = 'right';
    ctx.fillText(`${titleText || 'Scribble Art'} • sudhin_art style`, width - 24, height - 20);
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
          progress = 1.0; // Drawing completely sketched and visible
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
