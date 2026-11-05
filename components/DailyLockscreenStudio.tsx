'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  getMoonPhase,
  DAILY_QUOTES,
  DailyQuoteItem
} from '@/lib/dailyUtilities';
import {
  Smartphone,
  Sparkles,
  Download,
  Shuffle,
  Moon,
  Palette,
  Upload,
  Heart,
  Compass,
  Check
} from 'lucide-react';

export default function DailyLockscreenStudio() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'stoic' | 'romantic' | 'ambition' | 'mindful'>('stoic');
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
  const [customQuoteText, setCustomQuoteText] = useState('');
  const [customAuthorText, setCustomAuthorText] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'midnight' | 'parchment' | 'emerald' | 'sepia' | 'rose'>('midnight');
  const [showMoonPhase, setShowMoonPhase] = useState(true);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const moonPhase = getMoonPhase();

  // Filtered quotes list
  const filteredQuotes = DAILY_QUOTES.filter(
    (q) => selectedCategory === 'all' || q.category === selectedCategory
  );

  const currentQuote = isCustom
    ? { quote: customQuoteText || 'Breathe deeply. You are right where you need to be.', author: customAuthorText || 'Daily Mindset' }
    : filteredQuotes[activeQuoteIndex % filteredQuotes.length] || filteredQuotes[0];

  const handleShuffleQuote = () => {
    setIsCustom(false);
    setActiveQuoteIndex((prev) => (prev + 1) % filteredQuotes.length);
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => setBgImage(img);
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const THEMES = {
    midnight: {
      name: 'Midnight Starlight',
      bg: '#070b16',
      card: '#0f172a',
      accent: '#38bdf8',
      textPrimary: '#f8fafc',
      textSecondary: 'rgba(148, 163, 184, 0.8)',
      gold: '#d4af37'
    },
    parchment: {
      name: 'Aged Cream Parchment',
      bg: '#fbf5e8',
      card: '#f4ebd0',
      accent: '#92400e',
      textPrimary: '#291807',
      textSecondary: 'rgba(92, 58, 33, 0.8)',
      gold: '#b47b42'
    },
    emerald: {
      name: 'Royal Forest & Gold',
      bg: '#051912',
      card: '#082f22',
      accent: '#34d399',
      textPrimary: '#f0fdf4',
      textSecondary: 'rgba(167, 243, 208, 0.75)',
      gold: '#d4af37'
    },
    sepia: {
      name: 'Renaissance Sepia',
      bg: '#1c130d',
      card: '#2e1f16',
      accent: '#fb923c',
      textPrimary: '#fef3c7',
      textSecondary: 'rgba(253, 230, 138, 0.75)',
      gold: '#d4a017'
    },
    rose: {
      name: 'Rose Quartz & Burgundy',
      bg: '#17060c',
      card: '#2a0a16',
      accent: '#fb7185',
      textPrimary: '#fff1f2',
      textSecondary: 'rgba(254, 205, 211, 0.75)',
      gold: '#fda4af'
    }
  };

  const theme = THEMES[selectedTheme];

  // Render Lockscreen on 1080x1920 high-res canvas
  const renderLockscreen = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    // 1. Background Fill & Texture
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);

    // Subtle Radial Vignette
    const vigGrad = ctx.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.85);
    vigGrad.addColorStop(0, 'rgba(255,255,255,0.03)');
    vigGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Optional Photo Watermark (Pencil Sketch wash)
    if (bgImage) {
      ctx.save();
      ctx.globalAlpha = 0.22;
      const imgAspect = bgImage.width / bgImage.height;
      let drawW = width;
      let drawH = width / imgAspect;
      if (drawH < height) {
        drawH = height;
        drawW = height * imgAspect;
      }
      const dx = (width - drawW) / 2;
      const dy = (height - drawH) / 2;
      ctx.drawImage(bgImage, dx, dy, drawW, drawH);
      ctx.restore();
    }

    // 3. Astrolabe Coordinate Rings in upper center
    ctx.save();
    ctx.strokeStyle = theme.gold;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.34, 180, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.34, 160, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 4. Moon Phase & Date Header
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const fullDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Day of week
    ctx.font = '500 24px "Segoe UI", sans-serif';
    ctx.fillStyle = theme.textSecondary;
    ctx.letterSpacing = '6px';
    ctx.fillText(dayName, width / 2, height * 0.24);

    // Full Date
    ctx.font = '600 34px Georgia, serif';
    ctx.fillStyle = theme.textPrimary;
    ctx.letterSpacing = '3px';
    ctx.fillText(fullDate, width / 2, height * 0.27);

    // Moon phase badge
    if (showMoonPhase) {
      ctx.font = '24px "Segoe UI", sans-serif';
      ctx.fillStyle = theme.gold;
      ctx.fillText(`${moonPhase.glyph}  ${moonPhase.phaseName.toUpperCase()} • ${moonPhase.illumination}% ILLUMINATED`, width / 2, height * 0.34);
    }
    ctx.restore();

    // 5. Daily Inscription Quote Box (Middle region)
    ctx.save();
    const boxY = height * 0.52;
    const boxW = width * 0.82;
    const padding = 50;

    // Card background glow
    ctx.fillStyle = theme.card;
    ctx.globalAlpha = 0.5;
    ctx.roundRect((width - boxW) / 2, boxY, boxW, 360, 24);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Card border
    ctx.strokeStyle = theme.gold;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.45;
    ctx.roundRect((width - boxW) / 2, boxY, boxW, 360, 24);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Quote Text Wrapping
    ctx.font = 'italic 400 38px Georgia, "Times New Roman", serif';
    ctx.fillStyle = theme.textPrimary;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = `“${currentQuote.quote}”`.split(' ');
    const maxLineW = boxW - padding * 2;
    const lines: string[] = [];
    let currentLine = '';

    for (const w of words) {
      const testLine = currentLine ? `${currentLine} ${w}` : w;
      if (ctx.measureText(testLine).width > maxLineW) {
        lines.push(currentLine);
        currentLine = w;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const startY = boxY + 160 - (lines.length * 25);
    lines.forEach((l, idx) => {
      ctx.fillText(l, width / 2, startY + idx * 52);
    });

    // Author
    ctx.font = '600 24px Georgia, serif';
    ctx.fillStyle = theme.gold;
    ctx.letterSpacing = '3px';
    ctx.fillText(`—  ${currentQuote.author.toUpperCase()}  —`, width / 2, boxY + 310);

    ctx.restore();

    // 6. Luxury Studio Watermark at Base
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillStyle = theme.textSecondary;
    ctx.fillText('✦  MULTILINGUAL ARTISAN STUDIO  ✦', width / 2, height * 0.93);
    ctx.restore();
  }, [theme, currentQuote, showMoonPhase, bgImage, moonPhase]);

  useEffect(() => {
    renderLockscreen();
  }, [renderLockscreen]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `lockscreen-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 my-6 items-start">
      {/* Left Column: Interactive Controls */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        {/* Card 1: Daily Mindset Category */}
        <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              <span>Today&apos;s Mindset &amp; Affirmation</span>
            </h3>
            <button
              type="button"
              onClick={handleShuffleQuote}
              className="text-xs px-2.5 py-1 rounded-full bg-[#182442] hover:bg-[#22335c] text-cyan-300 flex items-center gap-1 transition cursor-pointer"
            >
              <Shuffle size={12} />
              <span>Random</span>
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(['all', 'stoic', 'romantic', 'ambition', 'mindful'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setIsCustom(false);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium capitalize transition cursor-pointer ${
                  selectedCategory === cat && !isCustom
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                    : 'bg-[#0f1b38] text-slate-400 hover:text-white border border-[#22335c]'
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition cursor-pointer ${
                isCustom
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                  : 'bg-[#0f1b38] text-slate-400 hover:text-white border border-[#22335c]'
              }`}
            >
              Custom Vow ✏️
            </button>
          </div>

          {/* Custom Quote Input */}
          {isCustom && (
            <div className="flex flex-col gap-2 pt-2 border-t border-[#182442]">
              <textarea
                value={customQuoteText}
                onChange={(e) => setCustomQuoteText(e.target.value)}
                placeholder="Type your personal daily affirmation, love vow, or goal..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-[#080d1e] border border-[#243356] text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
              <input
                type="text"
                value={customAuthorText}
                onChange={(e) => setCustomAuthorText(e.target.value)}
                placeholder="Author / Names (e.g. Sophia & Lucas)..."
                className="w-full px-3 py-2 rounded-xl bg-[#080d1e] border border-[#243356] text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Card 2: Aesthetic Theme */}
        <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl backdrop-blur-md">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Palette size={16} className="text-cyan-400" />
            <span>Lockscreen Art Palette</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(THEMES) as [keyof typeof THEMES, typeof THEMES['midnight']][]).map(([key, th]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedTheme(key)}
                className={`p-2.5 rounded-xl text-left border transition flex items-center justify-between cursor-pointer ${
                  selectedTheme === key
                    ? 'border-cyan-400 bg-[#16213e] shadow-[0_0_12px_rgba(56,189,248,0.25)]'
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
                {selectedTheme === key && <Check size={12} className="text-cyan-400" />}
              </button>
            ))}
          </div>

          {/* Options */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#182442]">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showMoonPhase}
                onChange={(e) => setShowMoonPhase(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-cyan-400"
              />
              <span>Include Live Moon Phase &amp; Astro Age</span>
            </label>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <Upload size={12} />
              <span>{bgImage ? 'Change Watermark' : 'Add Photo Watermark'}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadPhoto}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Download Button */}
        <button
          type="button"
          onClick={handleDownload}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-400 hover:brightness-110 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(56,189,248,0.4)] transition cursor-pointer"
        >
          <Download size={16} />
          <span>Download 4K Lockscreen (1080x1920 HD)</span>
        </button>
      </div>

      {/* Right Column: Mobile Bezel Phone Preview */}
      <div className="w-full md:w-1/2 flex flex-col items-center">
        <div className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
          <Smartphone size={14} className="text-cyan-400" />
          <span>Live Smartphone Preview (9:16 Ultra HD)</span>
        </div>

        {/* Realistic Mobile Frame */}
        <div className="relative w-[280px] sm:w-[320px] aspect-[9/19] rounded-[48px] p-3.5 bg-[#1e293b] shadow-2xl border-[4px] border-[#334155] ring-1 ring-white/10 flex flex-col items-center overflow-hidden">
          {/* Dynamic Island / Camera Notch */}
          <div className="absolute top-5 z-20 w-24 h-5 rounded-full bg-black/80 flex items-center justify-end px-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1e293b]/80 border border-white/20"></span>
          </div>

          {/* Actual Screen Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full rounded-[38px] object-cover shadow-inner"
          />
        </div>
      </div>
    </div>
  );
}

