'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TranslatedItem } from '@/lib/languages';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, ArrowLeft, Video } from 'lucide-react';
import { audioController } from '@/lib/audio';

interface CalligraphyStroke {
  x: number;
  y: number;
  text: string;
  angle: number;
  fontSize: number;
  color: string;
  progressY: number; // 0 to 1
  isMainScript?: boolean;
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

  const durationMs = 8500; // 8.5 seconds drawing duration
  const pauseDurationMs = 3000; // 3 seconds pause on full reveal
  const totalCycleMs = durationMs + pauseDurationMs;
  const startTimeRef = useRef<number>(Date.now());

  const strokesRef = useRef<CalligraphyStroke[]>([]);

  // Theme palettes
  const getThemePalette = useCallback(() => {
    switch (themeStyle) {
      case 'emerald': // Tea cup green & gold (matching reference)
        return {
          bg: '#fbfaf8',
          darkBg: false,
          primary: '#1d4a2a',
          secondary: '#8a7138',
          accent: '#14381e',
          textGlow: 'rgba(29, 74, 42, 0.3)',
          photoOverlay: 'rgba(29, 74, 42, 0.08)'
        };
      case 'gold':
        return {
          bg: '#08080a',
          darkBg: true,
          primary: '#e6c364',
          secondary: '#b89130',
          accent: '#ffffff',
          textGlow: 'rgba(230, 195, 100, 0.45)',
          photoOverlay: 'rgba(230, 195, 100, 0.1)'
        };
      case 'rain_storm': // Adri reel storm & rain
        return {
          bg: '#070b16',
          darkBg: true,
          primary: '#38bdf8',
          secondary: '#94a3b8',
          accent: '#ffffff',
          textGlow: 'rgba(56, 189, 248, 0.4)',
          photoOverlay: 'rgba(56, 189, 248, 0.08)'
        };
      case 'monochrome':
        return {
          bg: '#ffffff',
          darkBg: false,
          primary: '#111827',
          secondary: '#4b5563',
          accent: '#000000',
          textGlow: 'rgba(0, 0, 0, 0.15)',
          photoOverlay: 'rgba(0, 0, 0, 0.05)'
        };
      case 'neon':
      default:
        return {
          bg: '#060a17',
          darkBg: true,
          primary: primaryColor || '#00e5ff',
          secondary: '#e024c3',
          accent: '#ffffff',
          textGlow: `${primaryColor}66`,
          photoOverlay: 'rgba(0, 229, 255, 0.1)'
        };
    }
  }, [themeStyle, primaryColor]);

  // Generate artistic calligraphy strokes along the subject
  useEffect(() => {
    const width = 800;
    const height = 960;
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
      { text: "사랑해", language: "Korean" }
    ];

    const strokes: CalligraphyStroke[] = [];
    const centerX = width / 2;

    // 1. Top Steam / Calligraphy Swirls (Y: 5% to 26%)
    for (let i = 0; i < 8; i++) {
      const t = i / 8;
      const py = height * (0.06 + t * 0.20);
      const px = centerX + Math.sin(t * Math.PI * 3.5) * (width * 0.16 * (1 - t * 0.2));
      const phrase = phrases[i % phrases.length];

      strokes.push({
        x: px,
        y: py,
        text: phrase.text,
        angle: Math.sin(t * Math.PI * 2) * 0.2,
        fontSize: 17 + (1 - t) * 4,
        color: i % 2 === 0 ? palette.secondary : palette.primary,
        progressY: py / height
      });
    }

    // 2. Middle Perimeter & Silhouette Inscriptions (Y: 28% to 75%)
    // Contouring gracefully around the subject instead of a solid blob
    const perimeterCount = 18;
    for (let i = 0; i < perimeterCount; i++) {
      const t = i / perimeterCount;
      const angle = t * Math.PI * 2;
      const rx = width * 0.36;
      const ry = height * 0.28;
      const py = height * 0.52 + Math.sin(angle) * ry;
      const px = centerX + Math.cos(angle) * rx;
      const phrase = phrases[(i + 4) % phrases.length];

      strokes.push({
        x: px,
        y: py,
        text: phrase.text,
        angle: angle + Math.PI / 2,
        fontSize: 14,
        color: i % 2 === 0 ? palette.primary : palette.secondary,
        progressY: py / height
      });
    }

    // 3. Main Center Signature Script (Y: ~76%)
    strokes.push({
      x: centerX,
      y: height * 0.76,
      text: titleText || "Love You",
      angle: 0,
      fontSize: 42,
      color: palette.accent || palette.primary,
      progressY: 0.76,
      isMainScript: true
    });

    // 4. Bottom Saucer / Base Calligraphy (Y: 82% to 92%)
    for (let i = 0; i < 6; i++) {
      const t = i / 6;
      const px = width * (0.2 + t * 0.6);
      const py = height * (0.86 + Math.sin(t * Math.PI) * 0.05);
      const phrase = phrases[(i + 8) % phrases.length];

      strokes.push({
        x: px,
        y: py,
        text: phrase.text,
        angle: (t - 0.5) * 0.25,
        fontSize: 15,
        color: palette.primary,
        progressY: py / height
      });
    }

    // Sort top to bottom
    strokes.sort((a, b) => a.progressY - b.progressY);
    strokesRef.current = strokes;
  }, [items, titleText, getThemePalette]);

  // Audio start/stop
  useEffect(() => {
    audioController.start(musicTrack, customMusicUrl);
    return () => {
      audioController.stop();
    };
  }, [musicTrack, customMusicUrl]);

  // Draw each frame
  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, progressRatio: number) => {
    const palette = getThemePalette();
    const centerX = width / 2;
    const centerY = height / 2;

    // 1. Background
    ctx.save();
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);

    if (!palette.darkBg) {
      // Warm porcelain / parchment vignette
      const bgGrad = ctx.createRadialGradient(centerX, centerY, width * 0.2, centerX, centerY, width * 0.7);
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(1, '#f3ece3');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Dark atmospheric aura
      const darkGrad = ctx.createRadialGradient(centerX, centerY, width * 0.15, centerX, centerY, width * 0.65);
      darkGrad.addColorStop(0, 'rgba(30, 41, 59, 0.4)');
      darkGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
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

    const currentY = progressRatio * height;

    // 2. THE IMAGE / SUBJECT DRAWING (Progressively Revealed Top-to-Bottom)
    // The photo is framed cleanly in the center, and wiped down with the pen!
    if (photoImage) {
      const imgAspect = photoImage.width / photoImage.height;
      const targetW = width * 0.72;
      const targetH = targetW / imgAspect;
      const imgX = centerX - targetW / 2;
      const imgY = height * 0.24;

      ctx.save();
      // Clip to the progressive top-to-bottom pen wipe line
      ctx.beginPath();
      ctx.rect(0, 0, width, currentY);
      ctx.clip();

      // Rounded mask for portrait/subject
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, targetW, targetH, 28);
      ctx.clip();

      // Draw the actual image clearly!
      ctx.drawImage(photoImage, imgX, imgY, targetW, targetH);

      // Subtle artistic duotone tint overlay matching theme
      ctx.fillStyle = palette.photoOverlay;
      ctx.fillRect(imgX, imgY, targetW, targetH);

      // Soft vignette border around the image
      const edgeVignette = ctx.createRadialGradient(
        imgX + targetW / 2,
        imgY + targetH / 2,
        targetW * 0.35,
        imgX + targetW / 2,
        imgY + targetH / 2,
        targetW * 0.55
      );
      edgeVignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      edgeVignette.addColorStop(1, palette.darkBg ? 'rgba(6, 10, 23, 0.55)' : 'rgba(251, 250, 248, 0.45)');
      ctx.fillStyle = edgeVignette;
      ctx.fillRect(imgX, imgY, targetW, targetH);

      ctx.restore();

      // Delicate outer contour border around the image
      ctx.strokeStyle = palette.primary;
      ctx.lineWidth = 2;
      ctx.shadowColor = palette.textGlow;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, targetW, targetH, 28);
      ctx.stroke();

      ctx.restore();
    }

    // 3. MULTILINGUAL CALLIGRAPHY STROKES (Revealed Top-to-Bottom)
    const strokes = strokesRef.current;
    let penX = centerX;
    let penY = currentY;

    for (let i = 0; i < strokes.length; i++) {
      const s = strokes[i];
      if (s.progressY <= progressRatio) {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);

        if (s.isMainScript) {
          // Large main center script with flourish
          ctx.font = `italic bold ${s.fontSize}px "Brush Script MT", "Dancing Script", "Caveat", "Segoe Script", cursive`;
          ctx.shadowColor = palette.textGlow;
          ctx.shadowBlur = 14;
          ctx.fillStyle = s.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(s.text, 0, 0);

          // Underline calligraphy arc
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, s.fontSize * 0.55, s.fontSize * 1.3, 0.2, Math.PI - 0.2);
          ctx.stroke();
        } else {
          // Clean multilingual script
          ctx.font = `600 ${s.fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          ctx.shadowColor = palette.textGlow;
          ctx.shadowBlur = 6;
          ctx.fillStyle = s.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(s.text, 0, 0);

          // Curving flourish leaves/connectors (like the reference teacup)
          if (i % 2 === 0) {
            ctx.strokeStyle = palette.secondary;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(-s.fontSize * 1.2, 0);
            ctx.bezierCurveTo(-s.fontSize * 0.6, -6, s.fontSize * 0.6, 6, s.fontSize * 1.2, 0);
            ctx.stroke();
          }
        }

        ctx.restore();
        penX = s.x;
        penY = s.y;
      }
    }

    // 4. Glowing Pen Tip & Sweep Line (Active writing cursor)
    if (progressRatio < 1.0) {
      ctx.save();
      // Horizontal laser / sweep shimmer
      const sweepGrad = ctx.createLinearGradient(0, currentY, width, currentY);
      sweepGrad.addColorStop(0, 'rgba(255,255,255,0)');
      sweepGrad.addColorStop(0.5, palette.primary);
      sweepGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = sweepGrad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, currentY);
      ctx.lineTo(width, currentY);
      ctx.stroke();

      // Glowing ink nib / stylus
      const penGrad = ctx.createRadialGradient(penX, currentY, 2, penX, currentY, 22);
      penGrad.addColorStop(0, '#ffffff');
      penGrad.addColorStop(0.4, palette.primary);
      penGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = penGrad;
      ctx.beginPath();
      ctx.arc(penX, currentY, 22, 0, Math.PI * 2);
      ctx.fill();

      // Center spark
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(penX, currentY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }, [photoImage, getThemePalette, themeStyle]);

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
          progress = 1.0; // Artwork fully revealed and visible
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
    exportCanvas.height = 1920;
    const exportCtx = exportCanvas.getContext('2d');
    if (exportCtx) {
      drawFrame(exportCtx, 1600, 1920, 1.0);
      const link = document.createElement('a');
      link.download = `${titleText || 'calligraphy-portrait'}-artwork.png`;
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
        a.download = `${titleText || 'calligraphy-portrait'}-video.webm`;
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
            <span>Writing Animation: {currentProgress}%</span>
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
      <div className="relative rounded-3xl overflow-hidden border border-[#243356] shadow-[0_0_60px_rgba(0,180,255,0.18)] bg-[#050914] aspect-[4/4.8] w-full max-w-[560px]">
        <canvas
          ref={canvasRef}
          width={800}
          height={960}
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
            <span>Download Image</span>
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
