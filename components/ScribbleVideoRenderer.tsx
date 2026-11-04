'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TranslatedItem } from '@/lib/languages';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, ArrowLeft, Video } from 'lucide-react';
import { audioController } from '@/lib/audio';

interface TextScribbleNode {
  x: number;
  y: number;
  text: string;
  angle: number;
  fontSize: number;
  color: string;
  alpha: number;
  progressThreshold: number; // 0 to 1 based on vertical Y position
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

  // Pre-computed scribble nodes sampled from the image
  const nodesRef = useRef<TextScribbleNode[]>([]);
  const durationMs = 8500; // 8.5 seconds writing duration
  const pauseDurationMs = 2500; // 2.5s pause when completed
  const totalCycleMs = durationMs + pauseDurationMs;
  const startTimeRef = useRef<number>(Date.now());

  // Palette color schemes
  const getThemePalette = useCallback(() => {
    switch (themeStyle) {
      case 'emerald': // Like the tea cup reference image (rich tea leaves green & gold)
        return {
          bg: '#fcfbfa',
          darkBg: false,
          primary: '#1d4a2a', // Forest tea green
          secondary: '#8a7138', // Golden olive
          accent: '#14381e',
          glow: 'rgba(29, 74, 42, 0.25)'
        };
      case 'gold':
        return {
          bg: '#0a0907',
          darkBg: true,
          primary: '#e6c364',
          secondary: '#b89130',
          accent: '#ffffff',
          glow: 'rgba(230, 195, 100, 0.4)'
        };
      case 'monochrome':
        return {
          bg: '#ffffff',
          darkBg: false,
          primary: '#111827',
          secondary: '#374151',
          accent: '#000000',
          glow: 'rgba(0, 0, 0, 0.15)'
        };
      case 'rain_storm': // Inspired by AdriPan reel (rain, storm, safe haven)
        return {
          bg: '#080d1a',
          darkBg: true,
          primary: '#38bdf8', // Rain sky blue
          secondary: '#94a3b8', // Storm cloud gray
          accent: '#f8fafc', // Warm bright white
          glow: 'rgba(56, 189, 248, 0.4)'
        };
      case 'neon':
      default:
        return {
          bg: '#060a17',
          darkBg: true,
          primary: primaryColor || '#00e5ff',
          secondary: '#e024c3',
          accent: '#ffffff',
          glow: `${primaryColor}66`
        };
    }
  }, [themeStyle, primaryColor]);

  // Sample the image into calligraphic scribble curves and multilingual nodes
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 900;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes: TextScribbleNode[] = [];
    const palette = getThemePalette();

    // If an image is provided, sample its contours & luminance
    if (photoImage) {
      const sampleCanvas = document.createElement('canvas');
      const sampleW = 60;
      const sampleH = 70;
      sampleCanvas.width = sampleW;
      sampleCanvas.height = sampleH;
      const sCtx = sampleCanvas.getContext('2d');

      if (sCtx) {
        sCtx.drawImage(photoImage, 0, 0, sampleW, sampleH);
        const imgData = sCtx.getImageData(0, 0, sampleW, sampleH).data;

        let wordIdx = 0;
        const availableItems = items.length > 0 ? items : [
          { text: titleText || "Love You", language: "English" },
          { text: "Je t'aime", language: "French" },
          { text: "Ich liebe dich", language: "German" },
          { text: "Te amo", language: "Spanish" },
          { text: "我爱你", language: "Chinese" },
          { text: "愛してる", language: "Japanese" },
          { text: "أحبك", language: "Arabic" },
          { text: "मैं तुमसे प्यार करता हूँ", language: "Hindi" },
          { text: "Чашка для чая", language: "Russian" }
        ];

        // 1. Steam / Top Swirl Calligraphy (Top 25% of height, exactly like reference)
        for (let i = 0; i < 18; i++) {
          const t = i / 18;
          const sx = width * 0.5 + Math.sin(t * Math.PI * 3) * (width * 0.12 * (1 - t * 0.3));
          const sy = height * 0.08 + t * (height * 0.22);
          const item = availableItems[wordIdx % availableItems.length];
          wordIdx++;

          nodes.push({
            x: sx,
            y: sy,
            text: item.text,
            angle: Math.sin(t * Math.PI * 2) * 0.25,
            fontSize: 16 + (1 - t) * 6,
            color: i % 2 === 0 ? palette.secondary : palette.primary,
            alpha: 0.9,
            progressThreshold: sy / height
          });
        }

        // 2. Main Body Scribbles & Contours sampled from photo
        for (let y = 0; y < sampleH; y += 2) {
          for (let x = 0; x < sampleW; x += 2) {
            const idx = (y * sampleW + x) * 4;
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const a = imgData[idx + 3];

            if (a > 60) {
              const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
              // Detect contrast / edges / density
              if (luminance < 0.85) {
                const px = width * 0.15 + (x / sampleW) * (width * 0.7);
                const py = height * 0.32 + (y / sampleH) * (height * 0.55);

                const item = availableItems[wordIdx % availableItems.length];
                wordIdx++;

                // Scribble calligraphy curvature
                const angle = (Math.sin(x * 0.2) + Math.cos(y * 0.2)) * 0.15;
                const weight = (1 - luminance);

                nodes.push({
                  x: px,
                  y: py,
                  text: item.text,
                  angle,
                  fontSize: Math.max(10, Math.min(22, 11 + weight * 9)),
                  color: weight > 0.6 ? palette.primary : palette.secondary,
                  alpha: Math.min(1, 0.4 + weight * 0.6),
                  progressThreshold: py / height
                });
              }
            }
          }
        }

        // 3. Main Center Title Script (Large prominent calligraphy in center)
        nodes.push({
          x: width * 0.5,
          y: height * 0.58,
          text: titleText || "Calligraphy Portrait",
          angle: 0,
          fontSize: 38,
          color: palette.accent || palette.primary,
          alpha: 1,
          progressThreshold: 0.58,
          isMainScript: true
        });

      }
    } else {
      // Default artistic teacup / swirl template (matching reference image)
      const samplePhrases = [
        "فنجان شاي", "Tasse à thé", "空調茶杯", "AC Teetasse",
        "Taza de té AC", "Чашка для чая AC", "AC 티컵", "Xícara de chá AC",
        titleText || "AC Tea Cup", "AC चाय कप", "AC Çay Fincanı",
        "AC Chày Kap", "Φλιτζάνι τσαγιού AC", "Filizanka do herbaty AC"
      ];

      samplePhrases.forEach((phrase, idx) => {
        const threshold = (idx + 1) / (samplePhrases.length + 1);
        const sy = height * 0.1 + threshold * (height * 0.78);
        const sx = width * 0.5 + Math.sin(threshold * Math.PI * 4) * (width * 0.2);

        nodes.push({
          x: sx,
          y: sy,
          text: phrase,
          angle: Math.sin(threshold * Math.PI) * 0.2,
          fontSize: idx === 8 ? 36 : 18,
          color: idx % 2 === 0 ? palette.primary : palette.secondary,
          alpha: 0.95,
          progressThreshold: threshold,
          isMainScript: idx === 8
        });
      });
    }

    // Sort nodes vertically from top to bottom
    nodes.sort((a, b) => a.progressThreshold - b.progressThreshold);
    nodesRef.current = nodes;
  }, [photoImage, items, titleText, getThemePalette]);

  // Start music on mount
  useEffect(() => {
    audioController.start(musicTrack, customMusicUrl);
    return () => {
      audioController.stop();
    };
  }, [musicTrack, customMusicUrl]);

  // Render loop
  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, progressRatio: number) => {
    const palette = getThemePalette();

    // 1. Background Fill
    ctx.save();
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);

    // Subtle paper grain / vignette
    if (!palette.darkBg) {
      const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.65);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#f3ece3');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (themeStyle === 'rain_storm') {
      // Gentle animated falling rain streaks (Adri reel reference)
      const now = Date.now() * 0.001;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
      ctx.lineWidth = 1;
      for (let r = 0; r < 40; r++) {
        const rx = (r * 37 + (r % 7) * 11) % width;
        const ry = (now * 650 + r * 53) % (height + 60) - 30;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 2, ry + 18);
        ctx.stroke();
      }
    }

    const nodes = nodesRef.current;
    let lastPenX = width * 0.5;
    let lastPenY = height * 0.05;

    // 2. Draw nodes that are at or above current progress line
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // Draw only if progress has reached this node's vertical position
      if (node.progressThreshold <= progressRatio) {
        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.rotate(node.angle);

        if (node.isMainScript) {
          // Main prominent calligraphy script
          ctx.font = `italic bold ${node.fontSize}px "Brush Script MT", "Dancing Script", "Caveat", "Segoe Script", cursive`;
          ctx.shadowColor = palette.glow;
          ctx.shadowBlur = 12;
          ctx.fillStyle = node.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.text, 0, 0);

          // Underline flourish
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, node.fontSize * 0.55, node.fontSize * 1.2, 0.2, Math.PI - 0.2);
          ctx.stroke();
        } else {
          // Multilingual Scribble Text
          ctx.font = `600 ${node.fontSize}px "Segoe UI", system-ui, -apple-system, sans-serif`;
          ctx.shadowColor = palette.glow;
          ctx.shadowBlur = 6;
          ctx.fillStyle = node.color;
          ctx.globalAlpha = node.alpha;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.text, 0, 0);

          // Connecting scribbly vine/leaf line (like reference image)
          if (i % 3 === 0) {
            ctx.strokeStyle = palette.secondary;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.45;
            ctx.beginPath();
            ctx.moveTo(-node.fontSize * 1.5, 0);
            ctx.bezierCurveTo(-node.fontSize * 0.8, -8, node.fontSize * 0.8, 8, node.fontSize * 1.5, 0);
            ctx.stroke();
          }
        }

        ctx.restore();
        lastPenX = node.x;
        lastPenY = node.y;
      }
    }

    // 3. Glowing Pen Tip (Writing cursor sweeping down)
    if (progressRatio < 1.0) {
      const penY = progressRatio * height;
      const penX = lastPenX + Math.sin(progressRatio * 40) * 15;

      ctx.save();
      // Glowing ink nib aura
      const penGrad = ctx.createRadialGradient(penX, penY, 2, penX, penY, 20);
      penGrad.addColorStop(0, '#ffffff');
      penGrad.addColorStop(0.4, palette.primary);
      penGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = penGrad;
      ctx.beginPath();
      ctx.arc(penX, penY, 20, 0, Math.PI * 2);
      ctx.fill();

      // Pen sparkle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(penX, penY, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }, [getThemePalette]);

  // Main animation frame loop (progressive top-to-bottom writing)
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
        // Progress runs from 0 to 1 over durationMs, then stays at 1 during pauseDurationMs
        let progress = 0;
        if (elapsed < durationMs) {
          progress = elapsed / durationMs;
        } else {
          progress = 1.0; // Artwork fully revealed
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
    exportCanvas.height = 1800;
    const exportCtx = exportCanvas.getContext('2d');
    if (exportCtx) {
      drawFrame(exportCtx, 1600, 1800, 1.0);
      const link = document.createElement('a');
      link.download = `${titleText || 'scribble-portrait'}-artwork.png`;
      link.href = exportCanvas.toDataURL('image/png', 1.0);
      link.click();
    }
  };

  // Record 8.5s Video loop with audio directly in browser
  const recordVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isRecording) return;

    try {
      setIsRecording(true);
      startTimeRef.current = Date.now(); // Restart from 0 for clean recording

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
          <span>Edit & Change Image</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Progress bar pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0c1429] border border-[#243356] text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Writing Animation: {currentProgress}%</span>
          </div>

          {/* Sound Toggle */}
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
      <div className="relative rounded-3xl overflow-hidden border border-[#243356] shadow-[0_0_60px_rgba(0,180,255,0.18)] bg-[#050914] aspect-[4/4.5] w-full max-w-[560px]">
        <canvas
          ref={canvasRef}
          width={800}
          height={900}
          className="w-full h-full object-contain block"
        />

        {/* Live Recording Badge */}
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
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0066ff] hover:brightness-110 text-white text-xs font-semibold shadow-md shadow-blue-500/30 transition"
          >
            <Video size={14} />
            <span>{isRecording ? 'Recording...' : 'Download Video Loop'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

