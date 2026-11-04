'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TranslatedItem } from '@/lib/languages';
import { Play, Pause, Download, Video, Sparkles, RefreshCw } from 'lucide-react';

export type VisualStyle = 'heart' | 'wheel' | 'typographic';

interface CanvasRendererProps {
  photoImage: HTMLImageElement | null;
  items: TranslatedItem[];
  style: VisualStyle;
  primaryColor: string;
  glowIntensity: number;
  rotationSpeed: number;
  fontSize: number;
  centerText: string;
}

export default function CanvasRenderer({
  photoImage,
  items,
  style,
  primaryColor,
  glowIntensity,
  rotationSpeed,
  fontSize,
  centerText
}: CanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);

  // Time state for animation
  const timeRef = useRef<number>(0);

  // Heart parametric formula
  const getHeartPoint = (t: number, scale: number) => {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x: x * scale, y: y * scale };
  };

  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    // Clear canvas with deep dark background
    ctx.save();
    ctx.fillStyle = '#05070f';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    // Glowing background aura
    const gradient = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, width * 0.6);
    gradient.addColorStop(0, `${primaryColor}22`);
    gradient.addColorStop(0.5, `${primaryColor}08`);
    gradient.addColorStop(1, '#00000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Floating background sparkles
    ctx.fillStyle = `${primaryColor}aa`;
    for (let i = 0; i < 40; i++) {
      const angle = (i * 137.5 + time * 0.05) * (Math.PI / 180);
      const dist = ((i * 19 + time * 20) % (width * 0.48));
      const px = centerX + Math.cos(angle) * dist;
      const py = centerY + Math.sin(angle) * dist;
      const size = (Math.sin(time * 0.05 + i) + 1.2) * 1.5;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (style === 'heart') {
      // PULSATING GLOWING HEART (Reel 2 Style)
      const heartPulse = 1 + 0.08 * Math.sin(time * 0.08) * Math.sin(time * 0.08);

      // Draw concentric glowing heart outlines with multilingual text along the curve
      const layers = [10, 8, 6, 4];
      const count = items.length > 0 ? items.length : 60;

      layers.forEach((layerScale, layerIdx) => {
        const ringAlpha = (1 - layerIdx * 0.2) * (glowIntensity / 10);
        ctx.font = `${fontSize * (0.8 + layerIdx * 0.1)}px 'Segoe UI', system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < 30; i++) {
          const itemIndex = (i + layerIdx * 25) % count;
          const item = items[itemIndex] || { text: centerText || 'Love' };
          const t = (i / 30) * Math.PI * 2 + (layerIdx % 2 === 0 ? time * 0.01 * rotationSpeed : -time * 0.01 * rotationSpeed);
          
          const pt = getHeartPoint(t, layerScale * heartPulse * (width / 500));
          const px = centerX + pt.x;
          const py = centerY + pt.y;

          // Glow effect
          ctx.shadowColor = primaryColor;
          ctx.shadowBlur = glowIntensity * 1.5;
          ctx.fillStyle = i % 2 === 0 ? primaryColor : '#ffffff';
          ctx.globalAlpha = ringAlpha;

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(t + Math.PI / 2);
          ctx.fillText(item.text, 0, 0);
          ctx.restore();
        }
      });

      // Central Photo inside Heart Mask
      const photoSize = Math.min(width, height) * 0.32 * heartPulse;
      ctx.save();
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = glowIntensity * 3;
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 4;

      // Create Heart Path for clipping photo
      ctx.beginPath();
      for (let t = 0; t <= Math.PI * 2; t += 0.05) {
        const pt = getHeartPoint(t, photoSize / 32);
        if (t === 0) ctx.moveTo(centerX + pt.x, centerY + pt.y);
        else ctx.lineTo(centerX + pt.x, centerY + pt.y);
      }
      ctx.closePath();
      ctx.stroke();

      if (photoImage) {
        ctx.clip();
        ctx.drawImage(
          photoImage,
          centerX - photoSize * 0.8,
          centerY - photoSize * 0.8,
          photoSize * 1.6,
          photoSize * 1.6
        );
      } else {
        // Default glowing center text
        ctx.fillStyle = '#111827';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${fontSize * 1.8}px 'Segoe UI', system-ui`;
        ctx.fillText(centerText || 'Portrait', centerX, centerY);
      }
      ctx.restore();

    } else if (style === 'wheel') {
      // ROTATING KALEIDOSCOPIC MANDALA WHEEL (Reel 1 Style)
      const count = items.length > 0 ? items.length : 80;
      const angleStep = (Math.PI * 2) / Math.min(count, 48);

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.015 * rotationSpeed);

      // Rings of text spokes
      for (let i = 0; i < Math.min(count, 48); i++) {
        const item = items[i];
        const angle = i * angleStep;

        ctx.save();
        ctx.rotate(angle);

        // Radiant spoke color gradient
        const hue = (i * (360 / 48) + time * 2) % 360;
        ctx.fillStyle = `hsl(${hue}, 90%, 65%)`;
        ctx.shadowColor = `hsl(${hue}, 90%, 55%)`;
        ctx.shadowBlur = glowIntensity * 1.8;

        ctx.font = `${fontSize}px 'Segoe UI', system-ui, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        // Stagger distance
        const startDist = Math.min(width, height) * 0.22;
        ctx.fillText(`✦ ${item.text}`, startDist, 0);

        // Radiating line
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.2)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startDist * 0.9, 0);
        ctx.lineTo(width * 0.46, 0);
        ctx.stroke();

        ctx.restore();
      }
      ctx.restore();

      // Center Circular Photo
      const photoRadius = Math.min(width, height) * 0.18;
      ctx.save();
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = glowIntensity * 3;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, photoRadius, 0, Math.PI * 2);
      ctx.stroke();

      if (photoImage) {
        ctx.clip();
        ctx.drawImage(
          photoImage,
          centerX - photoRadius,
          centerY - photoRadius,
          photoRadius * 2,
          photoRadius * 2
        );
      } else {
        ctx.fillStyle = '#111827';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${fontSize * 1.8}px 'Segoe UI', system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(centerText || 'Photo', centerX, centerY);
      }
      ctx.restore();

    } else if (style === 'typographic') {
      // MICROGRAPHY / TYPOGRAPHIC PORTRAIT
      if (photoImage) {
        // Offscreen sampling of the photo luminance
        const offCanvas = document.createElement('canvas');
        const sampleSize = 60;
        offCanvas.width = sampleSize;
        offCanvas.height = sampleSize;
        const offCtx = offCanvas.getContext('2d');
        if (offCtx) {
          offCtx.drawImage(photoImage, 0, 0, sampleSize, sampleSize);
          const imgData = offCtx.getImageData(0, 0, sampleSize, sampleSize).data;

          const cellW = width / sampleSize;
          const cellH = height / sampleSize;
          ctx.font = `bold ${fontSize * 0.9}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          let itemIdx = 0;
          for (let y = 0; y < sampleSize; y += 2) {
            for (let x = 0; x < sampleSize; x += 2) {
              const idx = (y * sampleSize + x) * 4;
              const r = imgData[idx];
              const g = imgData[idx + 1];
              const b = imgData[idx + 2];
              const a = imgData[idx + 3];

              if (a > 50) {
                const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
                if (brightness > 0.15) {
                  const item = items[itemIdx % items.length] || { text: centerText };
                  itemIdx++;

                  // Word or character rendering
                  const charToDraw = item.text.slice(0, 3);
                  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                  ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
                  ctx.shadowBlur = brightness * glowIntensity;
                  ctx.globalAlpha = Math.min(1, brightness * 1.3);

                  ctx.fillText(charToDraw, x * cellW, y * cellH);
                }
              }
            }
          }
        }
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.font = `18px 'Segoe UI', system-ui`;
        ctx.textAlign = 'center';
        ctx.fillText('Please upload a photo to render the typographic portrait.', centerX, centerY);
      }
    }

    ctx.restore();
  }, [photoImage, items, style, primaryColor, glowIntensity, rotationSpeed, fontSize, centerText]);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      if (isPlaying) {
        timeRef.current += 1;
      }

      drawFrame(ctx, canvas.width, canvas.height, timeRef.current);
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, drawFrame]);

  // Export high-resolution PNG (2048x2048)
  const downloadHighResImage = () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 2048;
    exportCanvas.height = 2048;
    const exportCtx = exportCanvas.getContext('2d');
    if (exportCtx) {
      drawFrame(exportCtx, 2048, 2048, timeRef.current);
      const link = document.createElement('a');
      link.download = `${centerText || 'multilingual-portrait'}-art.png`;
      link.href = exportCanvas.toDataURL('image/png', 1.0);
      link.click();
    }
  };

  // Record 5s Video using MediaRecorder
  const recordVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isRecording) return;

    try {
      setIsRecording(true);
      setRecordProgress(0);

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
        a.download = `${centerText || 'multilingual-portrait'}-animation.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
        setRecordProgress(0);
      };

      recorder.start();

      const durationMs = 5000;
      const intervalMs = 100;
      let elapsed = 0;

      const timer = setInterval(() => {
        elapsed += intervalMs;
        setRecordProgress(Math.min(100, Math.round((elapsed / durationMs) * 100)));
        if (elapsed >= durationMs) {
          clearInterval(timer);
          recorder.stop();
        }
      }, intervalMs);

    } catch (err) {
      console.error('Failed to record video:', err);
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Canvas container with neon border shadow */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(236,72,153,0.25)] bg-[#05070f] aspect-square w-full max-w-[560px]">
        <canvas
          ref={canvasRef}
          width={800}
          height={800}
          className="w-full h-full object-contain block"
        />

        {/* Live Recording Overlay Badge */}
        {isRecording && (
          <div className="absolute top-4 right-4 bg-red-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            Recording Animation ({recordProgress}%)
          </div>
        )}
      </div>

      {/* Control Action Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition backdrop-blur-md border border-white/10"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          onClick={downloadHighResImage}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-medium shadow-lg shadow-pink-500/25 transition"
        >
          <Download size={16} />
          Download 4K Art
        </button>

        <button
          onClick={recordVideo}
          disabled={isRecording}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition border border-white/10 ${
            isRecording
              ? 'bg-red-500/50 cursor-not-allowed'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <Video size={16} />
          {isRecording ? `Recording ${recordProgress}%` : 'Record Video'}
        </button>
      </div>
    </div>
  );
}
