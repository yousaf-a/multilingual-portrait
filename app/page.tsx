'use client';

import React, { useState, useEffect } from 'react';
import PhotoUploader from '@/components/PhotoUploader';
import CanvasRenderer, { VisualStyle } from '@/components/CanvasRenderer';
import { getMultilingualList, TranslatedItem } from '@/lib/languages';
import { Sparkles, Heart, CircleDot, User, Palette, Globe } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Neon Pink', value: '#ec4899' },
  { name: 'Cyan Glow', value: '#06b6d4' },
  { name: 'Golden Sun', value: '#eab308' },
  { name: 'Electric Purple', value: '#a855f7' },
  { name: 'Emerald Neon', value: '#10b981' },
  { name: 'Crimson Red', value: '#ef4444' }
];

export default function Home() {
  const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);
  const [name, setName] = useState<string>('Sophia');
  const [mode, setMode] = useState<'name' | 'love' | 'sorry'>('love');
  const [style, setStyle] = useState<VisualStyle>('heart');
  const [primaryColor, setPrimaryColor] = useState<string>('#ec4899');
  const [glowIntensity, setGlowIntensity] = useState<number>(18);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.2);
  const [fontSize, setFontSize] = useState<number>(13);
  const [items, setItems] = useState<TranslatedItem[]>([]);

  // Generate / update multilingual list when name or mode changes
  useEffect(() => {
    const list = getMultilingualList(name || 'You', mode);
    setItems(list);
  }, [name, mode]);

  return (
    <main className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-between p-4 md:p-8 selection:bg-pink-500/30">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/15 via-transparent to-transparent -z-10" />

      {/* Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              Multilingual Portrait Studio
            </h1>
            <p className="text-xs text-white/50">
              Transform photos into glowing art written in 100 languages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
          <Globe size={14} className="text-pink-400" />
          <span>{items.length} Languages Active</span>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 items-start">
        {/* Controls Column (Left) */}
        <div className="lg:col-span-5 flex flex-col gap-6 bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
          {/* Step 1: Upload Photo */}
          <div>
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 block">
              1. Upload Photo
            </label>
            <PhotoUploader
              onImageLoaded={(img) => setPhotoImage(img)}
            />
          </div>

          {/* Step 2: Name & Phrase */}
          <div>
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 block">
              2. Name & Message
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name (e.g. Sophia, Alex)..."
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-pink-500 focus:outline-none text-white font-medium text-sm transition placeholder:text-white/30"
            />

            {/* Mode selection buttons */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <button
                type="button"
                onClick={() => setMode('love')}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                  mode === 'love'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm shadow-pink-500/20'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'
                }`}
              >
                <Heart size={13} />
                I Love You
              </button>

              <button
                type="button"
                onClick={() => setMode('sorry')}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                  mode === 'sorry'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/20'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>🙏</span>
                100 Sorries
              </button>

              <button
                type="button"
                onClick={() => setMode('name')}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                  mode === 'name'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'
                }`}
              >
                <User size={13} />
                Pure Name
              </button>
            </div>
          </div>

          {/* Step 3: Visual Effect Style */}
          <div>
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 block">
              3. Visual Art Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStyle('heart')}
                className={`p-3 rounded-2xl flex flex-col items-center gap-2 text-center transition border ${
                  style === 'heart'
                    ? 'bg-pink-500/10 border-pink-500 text-pink-300 shadow-md shadow-pink-500/20'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <Heart size={20} className={style === 'heart' ? 'text-pink-400' : 'text-white/40'} />
                <span className="text-xs font-medium">Heart Pulse</span>
              </button>

              <button
                type="button"
                onClick={() => setStyle('wheel')}
                className={`p-3 rounded-2xl flex flex-col items-center gap-2 text-center transition border ${
                  style === 'wheel'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/20'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <CircleDot size={20} className={style === 'wheel' ? 'text-cyan-400' : 'text-white/40'} />
                <span className="text-xs font-medium">Mandala Wheel</span>
              </button>

              <button
                type="button"
                onClick={() => setStyle('typographic')}
                className={`p-3 rounded-2xl flex flex-col items-center gap-2 text-center transition border ${
                  style === 'typographic'
                    ? 'bg-purple-500/10 border-purple-500 text-purple-300 shadow-md shadow-purple-500/20'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <User size={20} className={style === 'typographic' ? 'text-purple-400' : 'text-white/40'} />
                <span className="text-xs font-medium">Micrography</span>
              </button>
            </div>
          </div>

          {/* Step 4: Fine-Tuning Controls */}
          <div className="pt-2 border-t border-white/10 space-y-4">
            {/* Color Palette */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Palette size={14} className="text-white/60" />
                <span className="text-xs font-medium text-white/70">Neon Glow Color</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setPrimaryColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`w-7 h-7 rounded-full transition transform hover:scale-110 ${
                      primaryColor === c.value
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#030712] scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-white/50 block mb-1">Glow: {glowIntensity}px</span>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={glowIntensity}
                  onChange={(e) => setGlowIntensity(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>

              <div>
                <span className="text-xs text-white/50 block mb-1">Speed: {rotationSpeed}x</span>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={rotationSpeed}
                  onChange={(e) => setRotationSpeed(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Canvas Column (Right) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <CanvasRenderer
            photoImage={photoImage}
            items={items}
            style={style}
            primaryColor={primaryColor}
            glowIntensity={glowIntensity}
            rotationSpeed={rotationSpeed}
            fontSize={fontSize}
            centerText={name}
          />

          {/* Multilingual script ticker chips */}
          <div className="w-full max-w-[560px] mt-6 bg-white/[0.02] border border-white/10 rounded-2xl p-4">
            <p className="text-xs font-semibold text-white/60 mb-2 flex items-center justify-between">
              <span>Preview of 100 Languages</span>
              <span className="text-[11px] font-normal text-white/40">Includes Arabic, Devanagari, Japanese, Russian, etc.</span>
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {items.slice(0, 36).map((item, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-white/80 whitespace-nowrap"
                >
                  <span className="text-pink-400 font-medium mr-1">{item.language}:</span>
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-6xl pt-6 border-t border-white/10 text-center text-xs text-white/40 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>Built with Next.js, HTML5 Canvas & WebGL</p>
        <p>Ready for 100% Free Hosting on Vercel</p>
      </footer>
    </main>
  );
}
