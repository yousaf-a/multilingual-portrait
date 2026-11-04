'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PhotoUploader from '@/components/PhotoUploader';
import CanvasRenderer, { VisualStyle } from '@/components/CanvasRenderer';
import { getMultilingualList, TranslatedItem } from '@/lib/languages';
import {
  Sparkles,
  Heart,
  Flower2,
  User,
  Sun,
  Zap,
  Eye,
  Maximize2,
  Globe,
  Smile,
  Wand2,
  Check
} from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Magenta Glow', value: '#e024c3' },
  { name: 'Electric Cyan', value: '#00e5ff' },
  { name: 'Violet Glow', value: '#8b5cf6' },
  { name: 'Emerald Neon', value: '#10b981' },
  { name: 'Orange Flame', value: '#f97316' },
  { name: 'Rainbow', value: '#ec4899', isRainbow: true }
];

export default function Home() {
  const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);
  const [name, setName] = useState<string>('');
  const [message, setMessage] = useState<string>('Love You');
  const [mode, setMode] = useState<'love' | 'sorry' | 'name'>('love');
  const [style, setStyle] = useState<VisualStyle>('heart');
  const [primaryColor, setPrimaryColor] = useState<string>('#e024c3');
  const [glowIntensity, setGlowIntensity] = useState<number>(18);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.2);
  const [fontSize, setFontSize] = useState<number>(14);
  const [items, setItems] = useState<TranslatedItem[]>([]);
  const [triggerPulse, setTriggerPulse] = useState<number>(0);

  const handleImageLoaded = useCallback((img: HTMLImageElement | null) => {
    setPhotoImage(img);
  }, []);

  // Sync mode with message
  const handleModeChange = (newMode: 'love' | 'sorry' | 'name') => {
    setMode(newMode);
    if (newMode === 'love') setMessage('Love You');
    else if (newMode === 'sorry') setMessage("I'm Sorry");
    else setMessage(name || 'Portrait');
  };

  useEffect(() => {
    const list = getMultilingualList(name || 'You', mode);
    setItems(list);
  }, [name, mode]);

  const handleGenerateClick = () => {
    setTriggerPulse(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-[#070d1e] text-white flex flex-col items-center justify-start p-4 md:p-8 relative overflow-x-hidden selection:bg-cyan-500/30">
      {/* Background Dotted World Map Graphic (matches top-right in reference) */}
      <div className="absolute top-0 right-0 w-[600px] h-[320px] pointer-events-none opacity-20 -z-10 overflow-hidden">
        <svg viewBox="0 0 1000 500" className="w-full h-full fill-cyan-400">
          {/* Subtle world map dots pattern */}
          <circle cx="200" cy="150" r="2" /><circle cx="215" cy="145" r="2" /><circle cx="230" cy="140" r="2" />
          <circle cx="245" cy="145" r="2" /><circle cx="260" cy="155" r="2" /><circle cx="275" cy="160" r="2" />
          <circle cx="290" cy="170" r="2" /><circle cx="305" cy="180" r="2" /><circle cx="320" cy="190" r="2" />
          <circle cx="500" cy="120" r="2" /><circle cx="515" cy="115" r="2" /><circle cx="530" cy="125" r="2" />
          <circle cx="545" cy="130" r="2" /><circle cx="560" cy="140" r="2" /><circle cx="575" cy="145" r="2" />
          <circle cx="590" cy="150" r="2" /><circle cx="605" cy="155" r="2" /><circle cx="620" cy="160" r="2" />
          <circle cx="635" cy="165" r="2" /><circle cx="650" cy="170" r="2" /><circle cx="665" cy="180" r="2" />
          <circle cx="700" cy="130" r="2" /><circle cx="715" cy="135" r="2" /><circle cx="730" cy="140" r="2" />
          <circle cx="745" cy="145" r="2" /><circle cx="760" cy="150" r="2" /><circle cx="775" cy="160" r="2" />
          <circle cx="790" cy="170" r="2" /><circle cx="805" cy="180" r="2" /><circle cx="820" cy="190" r="2" />
          <circle cx="835" cy="200" r="2" /><circle cx="850" cy="210" r="2" /><circle cx="865" cy="220" r="2" />
          <circle cx="530" cy="220" r="2" /><circle cx="545" cy="235" r="2" /><circle cx="560" cy="250" r="2" />
          <circle cx="575" cy="265" r="2" /><circle cx="590" cy="280" r="2" /><circle cx="605" cy="295" r="2" />
          <circle cx="620" cy="310" r="2" /><circle cx="635" cy="325" r="2" /><circle cx="650" cy="340" r="2" />
        </svg>
      </div>

      {/* Header Bar */}
      <header className="w-full max-w-6xl flex items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          {/* Cyan 4-point sparkle icon matching reference */}
          <div className="w-9 h-9 flex items-center justify-center text-cyan-400 drop-shadow-[0_0_12px_rgba(0,229,255,0.8)]">
            <Sparkles size={32} className="fill-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Multilingual</span>
              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent font-extrabold">
                Portrait Studio
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-normal">
              Transform photos into glowing art written in 100 languages
            </p>
          </div>
        </div>

        {/* 99 Languages Active badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 text-xs font-medium">
          <Globe size={13} className="text-emerald-400" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>99 Languages Active</span>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 my-2 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Card 1: Upload Photo */}
          <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-lg shadow-black/20 backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-5 h-5 rounded-full bg-[#1b64f2] text-white text-[11px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(27,100,242,0.5)]">
                1
              </span>
              <h2 className="text-sm font-semibold text-white">Upload Photo</h2>
            </div>
            <PhotoUploader onImageLoaded={handleImageLoaded} />
          </div>

          {/* Card 2: Name & Message */}
          <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-lg shadow-black/20 backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-5 h-5 rounded-full bg-[#1b64f2] text-white text-[11px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(27,100,242,0.5)]">
                2
              </span>
              <h2 className="text-sm font-semibold text-white">Name & Message</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sophia"
                className="flex-1 min-w-[120px] px-3.5 py-2 rounded-xl bg-[#080d1e] border border-[#243356] focus:border-[#3b82f6] focus:outline-none text-white text-xs font-normal placeholder:text-slate-500 transition"
              />

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Love You"
                className="flex-1 min-w-[120px] px-3.5 py-2 rounded-xl bg-[#080d1e] border border-[#243356] focus:border-[#3b82f6] focus:outline-none text-white text-xs font-normal placeholder:text-slate-500 transition"
              />

              {/* Mode pills matching reference */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleModeChange('love')}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                    mode === 'love'
                      ? 'bg-[#1a68f7] text-white shadow-[0_0_12px_rgba(26,104,247,0.45)]'
                      : 'bg-[#080d1e] border border-[#243356] text-slate-300 hover:bg-[#121c38]'
                  }`}
                >
                  <Heart size={12} className={mode === 'love' ? 'fill-white' : ''} />
                  <span>Love You</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('sorry')}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                    mode === 'sorry'
                      ? 'bg-[#1a68f7] text-white shadow-[0_0_12px_rgba(26,104,247,0.45)]'
                      : 'bg-[#080d1e] border border-[#243356] text-slate-300 hover:bg-[#121c38]'
                  }`}
                >
                  <Smile size={12} />
                  <span>100 Sorries</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('name')}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                    mode === 'name'
                      ? 'bg-[#1a68f7] text-white shadow-[0_0_12px_rgba(26,104,247,0.45)]'
                      : 'bg-[#080d1e] border border-[#243356] text-slate-300 hover:bg-[#121c38]'
                  }`}
                >
                  <User size={12} />
                  <span>Pure Name</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Visual Style & Sliders */}
          <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-lg shadow-black/20 backdrop-blur-md flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1b64f2] text-white text-[11px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(27,100,242,0.5)]">
                  3
                </span>
                <h2 className="text-sm font-semibold text-white">Visual Style</h2>
              </div>

              {/* Glow Color Swatches */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-medium mr-1">Glow Color</span>
                <div className="flex items-center gap-1.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setPrimaryColor(c.value)}
                      style={
                        c.isRainbow
                          ? { background: 'conic-gradient(from 0deg, #ff0055, #ffaa00, #00ff66, #00ffff, #0066ff, #ff00ea, #ff0055)' }
                          : { backgroundColor: c.value }
                      }
                      className={`w-5 h-5 rounded-full transition transform hover:scale-110 ${
                        primaryColor === c.value
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0b1226] scale-110'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 3 Visual Style Cards */}
            <div className="grid grid-cols-3 gap-3">
              {/* Heart Pulse */}
              <button
                type="button"
                onClick={() => setStyle('heart')}
                className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 transition border ${
                  style === 'heart'
                    ? 'border-[#1a68f7] bg-[#101b38] shadow-[0_0_15px_rgba(26,104,247,0.3)]'
                    : 'border-[#243356] bg-[#080d1e] hover:bg-[#0e162f]'
                }`}
              >
                {style === 'heart' && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#1a68f7] text-white flex items-center justify-center text-[10px]">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
                <Heart size={24} className="text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
                <span className="text-xs font-semibold text-white">Heart Pulse</span>
              </button>

              {/* Mandala Wheel */}
              <button
                type="button"
                onClick={() => setStyle('wheel')}
                className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 transition border ${
                  style === 'wheel'
                    ? 'border-[#1a68f7] bg-[#101b38] shadow-[0_0_15px_rgba(26,104,247,0.3)]'
                    : 'border-[#243356] bg-[#080d1e] hover:bg-[#0e162f]'
                }`}
              >
                {style === 'wheel' && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#1a68f7] text-white flex items-center justify-center text-[10px]">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
                <Flower2 size={24} className="text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                <span className="text-xs font-semibold text-white">Mandala Wheel</span>
              </button>

              {/* Micrography */}
              <button
                type="button"
                onClick={() => setStyle('typographic')}
                className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 transition border ${
                  style === 'typographic'
                    ? 'border-[#1a68f7] bg-[#101b38] shadow-[0_0_15px_rgba(26,104,247,0.3)]'
                    : 'border-[#243356] bg-[#080d1e] hover:bg-[#0e162f]'
                }`}
              >
                {style === 'typographic' && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#1a68f7] text-white flex items-center justify-center text-[10px]">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
                <User size={24} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="text-xs font-semibold text-white">Micrography</span>
              </button>
            </div>

            {/* Sliders matching reference */}
            <div className="flex flex-col gap-3 pt-1">
              {/* Glow Slider */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 w-24 text-xs text-slate-300 font-medium">
                  <Sun size={15} className="text-slate-400" />
                  <span>Glow: {glowIntensity}px</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={glowIntensity}
                  onChange={(e) => setGlowIntensity(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-[#172545] rounded-lg appearance-none cursor-pointer accent-[#1a68f7]"
                />
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-[#080d1e] border border-[#243356] text-slate-300">
                  {glowIntensity}px
                </span>
              </div>

              {/* Speed Slider */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 w-24 text-xs text-slate-300 font-medium">
                  <Zap size={15} className="text-slate-400" />
                  <span>Speed: {rotationSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={rotationSpeed}
                  onChange={(e) => setRotationSpeed(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-[#172545] rounded-lg appearance-none cursor-pointer accent-[#1a68f7]"
                />
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-[#080d1e] border border-[#243356] text-slate-300">
                  {rotationSpeed}x
                </span>
              </div>
            </div>
          </div>

          {/* Big Action Button: Generate Portrait > */}
          <button
            type="button"
            onClick={handleGenerateClick}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#00c6ff] via-[#0084ff] to-[#0051ff] hover:brightness-110 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,132,255,0.45)] transition transform active:scale-[0.99]"
          >
            <Wand2 size={17} />
            <span>Generate Portrait &gt;</span>
          </button>
        </div>

        {/* Right Column: Preview Canvas Card (matches reference) */}
        <div className="lg:col-span-6 bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl shadow-black/30 backdrop-blur-md flex flex-col items-center">
          {/* Preview Header Bar */}
          <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-[#182442]">
            <div className="flex items-center gap-2 text-white">
              <Eye size={16} className="text-cyan-400" />
              <span className="text-sm font-semibold">Preview</span>
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-white transition p-1"
              title="Expand View"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          {/* Canvas Component */}
          <CanvasRenderer
            photoImage={photoImage}
            items={items}
            style={style}
            primaryColor={primaryColor}
            glowIntensity={glowIntensity}
            rotationSpeed={rotationSpeed}
            fontSize={fontSize}
            name={name}
            message={message}
          />
        </div>
      </div>
    </main>
  );
}
