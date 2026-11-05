'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Heart,
  Share2,
  Copy,
  Check,
  Music,
  RotateCcw,
  Palette,
  Volume2,
  VolumeX
} from 'lucide-react';
import { audioController } from '@/lib/audio';

export default function DailyInkNote() {
  const [recipient, setRecipient] = useState('Sophia');
  const [message, setMessage] = useState('Thinking of you today. Hope your morning is as beautiful as your smile! ❤️');
  const [sender, setSender] = useState('Lucas');
  const [stationery, setStationery] = useState<'parchment' | 'midnight' | 'rose' | 'emerald'>('parchment');
  const [isCopied, setIsCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [musicTrack, setMusicTrack] = useState<string>('romantic_piano');
  const [isMuted, setIsMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const luxuryPenRef = useRef<HTMLImageElement | null>(null);

  // Preload fountain pen
  useEffect(() => {
    const img = new Image();
    img.src = '/luxury-fountain-pen.png';
    img.onload = () => {
      luxuryPenRef.current = img;
    };
  }, []);

  const THEMES = {
    parchment: {
      name: 'Italian Parchment',
      bg: '#fbf5e8',
      ink: '#2d1b10',
      gold: '#b47b42',
      border: 'rgba(180, 123, 66, 0.4)',
      vignette: 'rgba(215, 195, 155, 0.45)'
    },
    midnight: {
      name: 'Midnight Prussian Blue',
      bg: '#081124',
      ink: '#f0f9ff',
      gold: '#38bdf8',
      border: 'rgba(56, 189, 248, 0.4)',
      vignette: 'rgba(2, 6, 23, 0.8)'
    },
    rose: {
      name: 'Rose Petal Velvet',
      bg: '#1c0812',
      ink: '#fff1f2',
      gold: '#fb7185',
      border: 'rgba(251, 113, 133, 0.4)',
      vignette: 'rgba(42, 10, 22, 0.8)'
    },
    emerald: {
      name: 'Royal Forest & Gold',
      bg: '#04160f',
      ink: '#f0fdf4',
      gold: '#d4af37',
      border: 'rgba(212, 175, 55, 0.4)',
      vignette: 'rgba(2, 20, 14, 0.8)'
    }
  };

  const theme = THEMES[stationery];

  // Animation cycle (writing progress 0 to 1)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = Date.now();
    const duration = 7500; // 7.5 seconds writing time
    const pauseTime = 3000;
    const totalCycle = duration + pauseTime;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      const elapsed = (Date.now() - startTime) % totalCycle;
      const progress = Math.min(1.0, elapsed / duration);

      const width = 800;
      const height = 600;
      canvas.width = width;
      canvas.height = height;

      // 1. Background Parchment
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, width, height);

      // Radial Vignette
      const vig = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.7);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, theme.vignette);
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);

      // Gold Embossed Postal Border
      ctx.strokeStyle = theme.gold;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(35, 35, width - 70, height - 70);
      ctx.setLineDash([3, 5]);
      ctx.strokeRect(42, 42, width - 84, height - 84);
      ctx.setLineDash([]);

      // 2. Header: Date & Postmark Seal
      const todayStr = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).toUpperCase();

      ctx.save();
      ctx.textAlign = 'right';
      ctx.font = '500 12px "Segoe UI", sans-serif';
      ctx.fillStyle = theme.gold;
      ctx.letterSpacing = '1px';
      ctx.fillText(`POSTE AÉRIENNE • ${todayStr}`, width - 58, 68);
      ctx.restore();

      // 3. Salutation: "Dearest [Recipient],"
      ctx.save();
      ctx.textAlign = 'left';
      ctx.font = 'italic 600 24px Georgia, "Times New Roman", serif';
      ctx.fillStyle = theme.gold;
      ctx.fillText(`Dearest ${recipient || 'Love'},`, 65, 120);
      ctx.restore();

      // 4. Body Note with Progressive Fountain Pen Inking
      const fullText = message || 'You brighten every day.';
      const charsToShow = Math.floor(fullText.length * progress);
      const visibleText = fullText.substring(0, charsToShow);

      ctx.save();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = 'italic 400 28px Georgia, "Times New Roman", serif';
      ctx.fillStyle = theme.ink;

      // Wrap lines
      const words = visibleText.split(' ');
      const maxLineW = width - 140;
      let lineY = 175;
      let currentLine = '';
      let activeX = 65;
      let activeY = lineY;

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
        if (ctx.measureText(testLine).width > maxLineW) {
          ctx.fillText(currentLine, 65, lineY);
          lineY += 50;
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        ctx.fillText(currentLine, 65, lineY);
        activeX = 65 + ctx.measureText(currentLine).width;
        activeY = lineY;
      }

      // 5. Sign-off: "Yours forever, [Sender]"
      if (progress > 0.85) {
        const signAlpha = (progress - 0.85) / 0.15;
        ctx.save();
        ctx.globalAlpha = signAlpha;
        ctx.textAlign = 'right';
        ctx.font = 'italic 500 22px Georgia, serif';
        ctx.fillStyle = theme.gold;
        ctx.fillText('Yours always,', width - 75, height - 120);
        ctx.font = 'italic 600 28px Georgia, serif';
        ctx.fillText(sender || 'Me', width - 75, height - 85);
        ctx.restore();
      }

      ctx.restore();

      // 6. Active Luxury Fountain Pen
      if (progress < 1.0) {
        ctx.save();
        const penTipX = activeX + 2;
        const penTipY = activeY + 22;

        const penImg = luxuryPenRef.current;
        if (penImg && penImg.complete && penImg.naturalWidth > 0) {
          // Contact Nib Shadow
          const shGrad = ctx.createRadialGradient(penTipX + 6, penTipY + 4, 1, penTipX + 6, penTipY + 4, 18);
          shGrad.addColorStop(0, 'rgba(0,0,0,0.3)');
          shGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = shGrad;
          ctx.beginPath();
          ctx.arc(penTipX + 6, penTipY + 4, 18, 0, Math.PI * 2);
          ctx.fill();

          // Render Pen angled at 42 degrees
          ctx.translate(penTipX, penTipY);
          ctx.rotate((-42 * Math.PI) / 180);
          ctx.drawImage(penImg, -28, -250, 60, 275);
        } else {
          // Luminous nib glow fallback
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(penTipX, penTipY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [recipient, message, sender, theme]);

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    const url = new URL('/gift', window.location.origin);
    url.searchParams.set('to', recipient);
    url.searchParams.set('msg', message);
    url.searchParams.set('theme', stationery === 'parchment' ? 'sepia_gold' : stationery === 'midnight' ? 'prussian_blue' : stationery === 'rose' ? 'emerald' : 'emerald_gold');

    navigator.clipboard.writeText(url.toString());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 my-6 items-start">
      {/* Controls */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        {/* Card 1: Note Details */}
        <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl backdrop-blur-md">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Heart size={16} className="text-pink-400 fill-pink-400" />
            <span>Today&apos;s Handwritten Note</span>
          </h3>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">To (Recipient)</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Sophia..."
                  className="w-full px-3 py-2 rounded-xl bg-[#080d1e] border border-[#243356] text-white text-xs focus:border-pink-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">From (Your Name)</label>
                <input
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="e.g. Lucas..."
                  className="w-full px-3 py-2 rounded-xl bg-[#080d1e] border border-[#243356] text-white text-xs focus:border-pink-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Your Note / Daily Vow</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your daily love note, sweet thought, or encouraging reminder..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d1e] border border-[#243356] text-white text-xs focus:border-pink-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Stationery Theme */}
        <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl backdrop-blur-md">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Palette size={16} className="text-pink-400" />
            <span>Fine-Art Stationery Paper</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(THEMES) as [keyof typeof THEMES, typeof THEMES['parchment']][]).map(([key, th]) => (
              <button
                key={key}
                type="button"
                onClick={() => setStationery(key)}
                className={`p-2.5 rounded-xl text-left border transition flex items-center justify-between cursor-pointer ${
                  stationery === key
                    ? 'border-pink-400 bg-[#16213e] shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                    : 'border-[#243356] bg-[#080d1e] hover:bg-[#0f1a36]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: th.bg }}
                  />
                  <span className="text-xs font-medium text-white">{th.name}</span>
                </div>
                {stationery === key && <Check size={12} className="text-pink-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button: Copy Shareable Link */}
        <button
          type="button"
          onClick={handleCopyShareLink}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:brightness-110 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(244,63,94,0.4)] transition cursor-pointer"
        >
          {isCopied ? <Check size={16} /> : <Share2 size={16} />}
          <span>{isCopied ? 'Link Copied! Send via WhatsApp / SMS' : 'Copy Live Animated Note Link for WhatsApp / SMS'}</span>
        </button>
      </div>

      {/* Live Preview Canvas */}
      <div className="w-full md:w-1/2 flex flex-col items-center">
        <div className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles size={14} className="text-pink-400" />
          <span>Real-Time Fountain Pen Inking Animation</span>
        </div>

        <div className="w-full rounded-3xl overflow-hidden border border-[#1e2a4a] shadow-2xl bg-[#0b1226]/90 p-2">
          <canvas
            ref={canvasRef}
            className="w-full aspect-[4/3] rounded-2xl object-cover shadow-inner"
          />
        </div>
      </div>
    </div>
  );
}
