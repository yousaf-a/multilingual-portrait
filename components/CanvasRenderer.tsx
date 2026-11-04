'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TranslatedItem } from '@/lib/languages';
import { Play, Pause, Download, Video, Maximize2, Sparkles } from 'lucide-react';

export type VisualStyle = 'heart' | 'wheel' | 'typographic';

interface CanvasRendererProps {
  photoImage: HTMLImageElement | null;
  items: TranslatedItem[];
  style: VisualStyle;
  primaryColor: string;
  glowIntensity: number;
  rotationSpeed: number;
  fontSize: number;
  name: string;
  message: string;
}

export default function CanvasRenderer({
  photoImage,
  items,
  style,
  primaryColor,
  glowIntensity,
  rotationSpeed,
  fontSize,
  name,
  message
}: CanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);

  const timeRef = useRef<number>(0);

  // Heart parametric formula
  const getHeartPoint = (t: number, scale: number) => {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x: x * scale, y: y * scale };
  };

  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const centerX = width / 2;
    const centerY = height / 2;

    // 1. Deep Cosmic Nebula Background
    ctx.save();
    ctx.fillStyle = '#060a17';
    ctx.fillRect(0, 0, width, height);

    // Glowing purple & cyan clouds
    const bgGrad1 = ctx.createRadialGradient(centerX - width * 0.2, centerY - height * 0.1, 40, centerX, centerY, width * 0.55);
    bgGrad1.addColorStop(0, 'rgba(88, 28, 135, 0.45)');
    bgGrad1.addColorStop(0.5, 'rgba(30, 27, 75, 0.25)');
    bgGrad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bgGrad1;
    ctx.fillRect(0, 0, width, height);

    const bgGrad2 = ctx.createRadialGradient(centerX + width * 0.25, centerY + height * 0.15, 50, centerX, centerY, width * 0.6);
    bgGrad2.addColorStop(0, 'rgba(14, 116, 144, 0.4)');
    bgGrad2.addColorStop(0.6, 'rgba(15, 23, 42, 0.15)');
    bgGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bgGrad2;
    ctx.fillRect(0, 0, width, height);

    // 2. Sparkles & Stardust
    for (let i = 0; i < 45; i++) {
      const angle = (i * 123.4 + time * 0.04) * (Math.PI / 180);
      const dist = ((i * 17 + time * 18) % (width * 0.48));
      const px = centerX + Math.cos(angle) * dist;
      const py = centerY + Math.sin(angle) * dist;
      const size = (Math.sin(time * 0.06 + i) + 1.2) * 1.4;
      const alpha = (Math.sin(time * 0.08 + i * 2) + 1) * 0.4 + 0.2;

      ctx.fillStyle = i % 3 === 0 ? `rgba(0, 229, 255, ${alpha})` : `rgba(236, 72, 153, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Central Portrait Drawing
    const portraitRadius = Math.min(width, height) * 0.28;

    if (photoImage) {
      ctx.save();
      // Circular clip with soft feathered edge
      ctx.beginPath();
      ctx.arc(centerX, centerY - 10, portraitRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Draw photo centered
      const imgAspect = photoImage.width / photoImage.height;
      let drawW = portraitRadius * 2.4;
      let drawH = drawW / imgAspect;
      if (drawH < portraitRadius * 2.4) {
        drawH = portraitRadius * 2.4;
        drawW = drawH * imgAspect;
      }

      ctx.drawImage(
        photoImage,
        centerX - drawW / 2,
        centerY - drawH / 2 - 10,
        drawW,
        drawH
      );

      // Vignette shadow inside the portrait circle
      const innerVignette = ctx.createRadialGradient(centerX, centerY - 10, portraitRadius * 0.5, centerX, centerY - 10, portraitRadius);
      innerVignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      innerVignette.addColorStop(0.8, 'rgba(10, 15, 35, 0.4)');
      innerVignette.addColorStop(1, 'rgba(5, 10, 25, 0.85)');
      ctx.fillStyle = innerVignette;
      ctx.fillRect(centerX - portraitRadius, centerY - portraitRadius - 10, portraitRadius * 2, portraitRadius * 2);

      ctx.restore();
    }

    // 4. Style-Specific Neon Ring & Multilingual Texts
    const ringRadius = portraitRadius * 1.15;
    const pulse = 1 + 0.03 * Math.sin(time * 0.07);

    if (style === 'heart') {
      // DUAL-TONE NEON ORBIT RING WITH MULTILINGUAL TEXT & HEARTS (Exactly like Reference)
      ctx.save();

      // Outer Glowing Ring (Gradient Cyan to Magenta)
      const ringGrad = ctx.createLinearGradient(centerX - ringRadius, centerY - ringRadius, centerX + ringRadius, centerY + ringRadius);
      ringGrad.addColorStop(0, '#00e5ff');
      ringGrad.addColorStop(0.5, primaryColor);
      ringGrad.addColorStop(1, '#a855f7');

      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = glowIntensity * 1.4;

      ctx.beginPath();
      ctx.arc(centerX, centerY - 10, ringRadius * pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Additional faint outer aura ring
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = glowIntensity * 0.8;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 10, ringRadius * pulse * 1.08, 0, Math.PI * 2);
      ctx.stroke();

      // Curving Multilingual Phrases around the Neon Ring
      // Reference texts: "Je t'aime", "Ich liebe dich", "Te amo", "我爱你", "愛してる", "♡"
      const curatedPhrases = items.length >= 6 ? items.slice(0, 16) : [
        { text: "Je t'aime" },
        { text: "Ich liebe dich" },
        { text: "Te amo" },
        { text: "我爱你" },
        { text: "愛してる" },
        { text: "Ti amo" },
        { text: "Eu te amo" },
        { text: "Я люблю тебя" }
      ];

      const baseAngle = -Math.PI / 2 + (time * 0.008 * rotationSpeed);
      const step = (Math.PI * 2) / (curatedPhrases.length * 2);

      ctx.font = `600 ${fontSize * 1.15}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      curatedPhrases.forEach((item, idx) => {
        // Text position
        const textAngle = baseAngle + idx * step * 2;
        const textDist = ringRadius * pulse * 1.16;
        const tx = centerX + Math.cos(textAngle) * textDist;
        const ty = centerY - 10 + Math.sin(textAngle) * textDist;

        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(textAngle + Math.PI / 2);

        // Neon Glow
        ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#e0f2fe';
        ctx.shadowColor = idx % 2 === 0 ? '#00e5ff' : primaryColor;
        ctx.shadowBlur = glowIntensity * 1.2;
        ctx.fillText(item.text, 0, 0);
        ctx.restore();

        // Little glowing heart between words
        const heartAngle = textAngle + step;
        const hx = centerX + Math.cos(heartAngle) * (ringRadius * pulse);
        const hy = centerY - 10 + Math.sin(heartAngle) * (ringRadius * pulse);

        ctx.save();
        ctx.translate(hx, hy);
        ctx.font = `${fontSize * 1.1}px sans-serif`;
        ctx.fillStyle = primaryColor;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = glowIntensity;
        ctx.fillText('♡', 0, 0);
        ctx.restore();
      });

      ctx.restore();

    } else if (style === 'wheel') {
      // ROTATING KALEIDOSCOPIC MANDALA WHEEL
      ctx.save();
      ctx.translate(centerX, centerY - 10);
      ctx.rotate(time * 0.012 * rotationSpeed);

      const count = Math.min(items.length, 36);
      const angleStep = (Math.PI * 2) / count;

      for (let i = 0; i < count; i++) {
        const item = items[i];
        const angle = i * angleStep;

        ctx.save();
        ctx.rotate(angle);

        const hue = (i * (360 / count) + time * 1.5) % 360;
        ctx.fillStyle = `hsl(${hue}, 95%, 75%)`;
        ctx.shadowColor = `hsl(${hue}, 95%, 60%)`;
        ctx.shadowBlur = glowIntensity * 1.4;

        ctx.font = `600 ${fontSize}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        ctx.fillText(`✦ ${item.text}`, ringRadius * 0.95, 0);

        ctx.strokeStyle = `hsla(${hue}, 90%, 65%, 0.25)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ringRadius * 0.9, 0);
        ctx.lineTo(width * 0.46, 0);
        ctx.stroke();

        ctx.restore();
      }
      ctx.restore();

      // Outer Ring
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = glowIntensity * 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 10, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

    } else if (style === 'typographic') {
      // MICROGRAPHY PORTRAIT (Reconstructing face with text)
      if (photoImage) {
        const offCanvas = document.createElement('canvas');
        const sampleSize = 55;
        offCanvas.width = sampleSize;
        offCanvas.height = sampleSize;
        const offCtx = offCanvas.getContext('2d');
        if (offCtx) {
          offCtx.drawImage(photoImage, 0, 0, sampleSize, sampleSize);
          const imgData = offCtx.getImageData(0, 0, sampleSize, sampleSize).data;
          const cellW = (portraitRadius * 2) / sampleSize;
          const cellH = (portraitRadius * 2) / sampleSize;

          ctx.font = `bold ${fontSize * 0.8}px monospace`;
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

              if (a > 60) {
                const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
                if (brightness > 0.15) {
                  const item = items[itemIdx % items.length] || { text: message || name };
                  itemIdx++;
                  const char = item.text.slice(0, 2);

                  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                  ctx.shadowColor = primaryColor;
                  ctx.shadowBlur = brightness * glowIntensity * 0.8;
                  ctx.globalAlpha = Math.min(1, brightness * 1.2);

                  const px = (centerX - portraitRadius) + x * cellW;
                  const py = (centerY - portraitRadius - 10) + y * cellH;
                  ctx.fillText(char, px, py);
                }
              }
            }
          }
        }
      }
    }

    // 5. Large Glowing Cursive Script at the Bottom ("Love You" / Custom Message)
    // Matches the reference design with dual-tone glow & stylish heart underneath
    const displayMsg = message || name || "Love You";
    const scriptY = centerY + portraitRadius * 0.92;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Cursive / script font
    ctx.font = `italic bold ${fontSize * 3.4}px "Brush Script MT", "Dancing Script", "Caveat", "Segoe Script", cursive`;

    // Multi-layer neon bloom for that authentic Instagram reel glow
    // Layer 1: Ambient wide glow
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = glowIntensity * 2.8;
    ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.fillText(displayMsg, centerX, scriptY);

    // Layer 2: Main primary neon color
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = glowIntensity * 1.6;
    ctx.fillStyle = primaryColor;
    ctx.fillText(displayMsg, centerX, scriptY);

    // Layer 3: Intense white-hot core
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(displayMsg, centerX, scriptY);

    // Glowing Neon Heart Underneath the Message
    const heartY = scriptY + fontSize * 2.1;
    ctx.font = `bold ${fontSize * 2.4}px sans-serif`;
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = glowIntensity * 2;
    ctx.fillStyle = primaryColor;
    ctx.fillText('♡', centerX, heartY);

    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 4;
    ctx.fillText('♡', centerX, heartY);

    ctx.restore();
  }, [photoImage, items, style, primaryColor, glowIntensity, rotationSpeed, fontSize, name, message]);

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

  // Download 4K image
  const downloadHighResImage = () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 2048;
    exportCanvas.height = 2048;
    const exportCtx = exportCanvas.getContext('2d');
    if (exportCtx) {
      drawFrame(exportCtx, 2048, 2048, timeRef.current);
      const link = document.createElement('a');
      link.download = `${name || 'portrait'}-neon-art.png`;
      link.href = exportCanvas.toDataURL('image/png', 1.0);
      link.click();
    }
  };

  // Record 5s Video
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
        a.download = `${name || 'portrait'}-animation.webm`;
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

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full">
      {/* Canvas container with deep dark background and rounded corners */}
      <div className="relative rounded-2xl overflow-hidden border border-[#1e2a4a] bg-[#060a17] shadow-[0_0_50px_rgba(0,180,255,0.12)] aspect-square w-full max-w-[540px]">
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
            Recording ({recordProgress}%)
          </div>
        )}
      </div>

      {/* Action Controls Bar */}
      <div className="flex flex-wrap items-center justify-between w-full max-w-[540px] gap-2 mt-4 px-1">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0e162e] hover:bg-[#152042] text-slate-300 hover:text-white text-xs font-medium transition border border-[#243356]"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadHighResImage}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition"
          >
            <Download size={14} />
            Download 4K
          </button>

          <button
            type="button"
            onClick={recordVideo}
            disabled={isRecording}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition border border-[#243356] ${
              isRecording
                ? 'bg-red-500/50 text-white cursor-not-allowed'
                : 'bg-[#0e162e] hover:bg-[#152042] text-slate-300 hover:text-white'
            }`}
          >
            <Video size={14} />
            {isRecording ? `${recordProgress}%` : 'Record Video'}
          </button>
        </div>
      </div>
    </div>
  );
}
