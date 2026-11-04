'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PhotoUploader from '@/components/PhotoUploader';
import ScribbleVideoRenderer from '@/components/ScribbleVideoRenderer';
import { getMultilingualList, TranslatedItem } from '@/lib/languages';
import {
  Sparkles,
  Music,
  Globe,
  Upload,
  FileAudio,
  Check,
  Wand2,
  Palette
} from 'lucide-react';

const MUSIC_PRESETS = [
  { id: 'piano_rain', name: '🌧️ Piano & Raindrops', desc: 'Soothing rain + warm acoustic chords' },
  { id: 'piano', name: '🎹 Romantic Piano', desc: 'Warm acoustic piano chords' },
  { id: 'lofi', name: '☕ Lo-Fi Cafe', desc: 'Chill ambient coffee vibes' },
  { id: 'strings', name: '🎻 Cinematic Ambient', desc: 'Dreamy orchestral texture' },
  { id: 'none', name: '🔇 No Audio', desc: 'Muted video loop' }
];

const THEME_OPTIONS = [
  {
    id: 'emerald',
    name: 'Tea Cup Emerald & Gold',
    desc: 'Matches reference teacup art',
    color: '#1d4a2a',
    accent: '#8a7138'
  },
  {
    id: 'rain_storm',
    name: 'Rain & Storm Haven',
    desc: 'Falling rain with sky-blue calligraphy',
    color: '#38bdf8',
    accent: '#94a3b8'
  },
  {
    id: 'gold',
    name: 'Imperial Gold & Noir',
    desc: 'Luxury dark gold calligraphy',
    color: '#e6c364',
    accent: '#b89130'
  },
  {
    id: 'neon',
    name: 'Cyberpunk Dual Glow',
    desc: 'Electric cyan & vivid magenta',
    color: '#00e5ff',
    accent: '#e024c3'
  },
  {
    id: 'monochrome',
    name: 'Classic Sumi Ink',
    desc: 'Pure calligraphic sketch',
    color: '#111827',
    accent: '#374151'
  }
];

export default function Home() {
  // Page view: 'form' (settings only, NO preview) or 'video' (looping video player)
  const [currentView, setCurrentView] = useState<'form' | 'video'>('form');

  const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);
  const [titleText, setTitleText] = useState<string>('AC Tea Cup');
  const [selectedTheme, setSelectedTheme] = useState<'emerald' | 'gold' | 'neon' | 'monochrome' | 'rain_storm'>('emerald');
  const [musicTrack, setMusicTrack] = useState<string>('piano');
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [customAudioName, setCustomAudioName] = useState<string | null>(null);

  const [items, setItems] = useState<TranslatedItem[]>([]);

  const handleImageLoaded = useCallback((img: HTMLImageElement | null) => {
    setPhotoImage(img);
  }, []);

  // Update multilingual dictionary
  useEffect(() => {
    const list = getMultilingualList(titleText || 'Tea Cup', 'love');
    setItems(list);
  }, [titleText]);

  // Handle custom audio file upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      setCustomAudioUrl(url);
      setCustomAudioName(file.name);
      setMusicTrack('custom');
    }
  };

  const handleGenerate = () => {
    setCurrentView('video');
  };

  return (
    <main className="min-h-screen bg-[#070d1e] text-white flex flex-col items-center justify-start p-4 md:p-8 relative overflow-x-hidden selection:bg-cyan-500/30">
      {/* Background Dotted World Map Graphic */}
      <div className="absolute top-0 right-0 w-[600px] h-[320px] pointer-events-none opacity-20 -z-10 overflow-hidden">
        <svg viewBox="0 0 1000 500" className="w-full h-full fill-cyan-400">
          <circle cx="200" cy="150" r="2" /><circle cx="215" cy="145" r="2" /><circle cx="230" cy="140" r="2" />
          <circle cx="245" cy="145" r="2" /><circle cx="260" cy="155" r="2" /><circle cx="275" cy="160" r="2" />
          <circle cx="290" cy="170" r="2" /><circle cx="305" cy="180" r="2" /><circle cx="320" cy="190" r="2" />
          <circle cx="500" cy="120" r="2" /><circle cx="515" cy="115" r="2" /><circle cx="530" cy="125" r="2" />
          <circle cx="545" cy="130" r="2" /><circle cx="560" cy="140" r="2" /><circle cx="575" cy="145" r="2" />
          <circle cx="590" cy="150" r="2" /><circle cx="605" cy="155" r="2" /><circle cx="620" cy="160" r="2" />
        </svg>
      </div>

      {/* Header Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between pb-6 border-b border-[#182442]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center text-cyan-400 drop-shadow-[0_0_12px_rgba(0,229,255,0.8)]">
            <Sparkles size={32} className="fill-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Multilingual</span>
              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent font-extrabold">
                Calligraphy Studio
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-normal">
              Slowly sketches your image top-to-bottom purely with multilingual calligraphy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 text-xs font-medium">
          <Globe size={13} className="text-emerald-400" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>100 Languages Scribble Engine</span>
        </div>
      </header>

      {/* VIEW 1: CREATION FORM (NO PREVIEW ON PAGE) */}
      {currentView === 'form' && (
        <div className="w-full max-w-2xl flex flex-col gap-5 my-8">
          {/* Card 1: Upload Photo / Subject */}
          <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-6 shadow-xl shadow-black/25 backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-6 h-6 rounded-full bg-[#1b64f2] text-white text-xs font-bold flex items-center justify-center shadow-[0_0_8px_rgba(27,100,242,0.5)]">
                1
              </span>
              <h2 className="text-sm font-semibold text-white">Upload Subject / Photo</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Upload any image (portrait, tea cup, pet, emblem). The engine will reconstruct its shapes purely out of handwritten multilingual words.
            </p>
            <PhotoUploader onImageLoaded={handleImageLoaded} />
          </div>

          {/* Card 2: Main Calligraphy Title & Inscription */}
          <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-6 shadow-xl shadow-black/25 backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-6 h-6 rounded-full bg-[#1b64f2] text-white text-xs font-bold flex items-center justify-center shadow-[0_0_8px_rgba(27,100,242,0.5)]">
                2
              </span>
              <h2 className="text-sm font-semibold text-white">Main Calligraphy Inscription</h2>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              The prominent central script written across the artwork (e.g. &ldquo;AC Tea Cup&rdquo;, person&apos;s name, or message):
            </p>
            <input
              type="text"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              placeholder="e.g. AC Tea Cup, Sophia, Love You..."
              className="w-full px-4 py-3 rounded-2xl bg-[#080d1e] border border-[#243356] focus:border-[#3b82f6] focus:outline-none text-white text-sm font-medium placeholder:text-slate-500 transition shadow-inner"
            />
          </div>

          {/* Card 3: Calligraphy Color Theme */}
          <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-6 shadow-xl shadow-black/25 backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-6 h-6 rounded-full bg-[#1b64f2] text-white text-xs font-bold flex items-center justify-center shadow-[0_0_8px_rgba(27,100,242,0.5)]">
                3
              </span>
              <h2 className="text-sm font-semibold text-white">Color Palette & Inking Style</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              {THEME_OPTIONS.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setSelectedTheme(th.id as any)}
                  className={`p-3.5 rounded-2xl text-left border transition flex items-start justify-between ${
                    selectedTheme === th.id
                      ? 'border-[#1a68f7] bg-[#101b38] shadow-[0_0_15px_rgba(26,104,247,0.3)]'
                      : 'border-[#243356] bg-[#080d1e] hover:bg-[#0e162f]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: th.color }}
                      />
                      <span className="text-xs font-semibold text-white">{th.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{th.desc}</p>
                  </div>
                  {selectedTheme === th.id && (
                    <span className="w-4 h-4 rounded-full bg-[#1a68f7] text-white flex items-center justify-center text-[10px]">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Card 4: Background Music Selection */}
          <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-6 shadow-xl shadow-black/25 backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-6 h-6 rounded-full bg-[#1b64f2] text-white text-xs font-bold flex items-center justify-center shadow-[0_0_8px_rgba(27,100,242,0.5)]">
                4
              </span>
              <div className="flex items-center gap-2">
                <Music size={16} className="text-cyan-400" />
                <h2 className="text-sm font-semibold text-white">Background Music</h2>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Choose an ambient musical track that plays in a loop while your artwork is written out:
            </p>

            {/* Music Presets */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {MUSIC_PRESETS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMusicTrack(m.id);
                    setCustomAudioUrl(null);
                    setCustomAudioName(null);
                  }}
                  className={`p-3 rounded-2xl text-left border transition flex items-center justify-between ${
                    musicTrack === m.id && !customAudioUrl
                      ? 'border-[#1a68f7] bg-[#101b38] shadow-[0_0_12px_rgba(26,104,247,0.3)]'
                      : 'border-[#243356] bg-[#080d1e] hover:bg-[#0e162f]'
                  }`}
                >
                  <div>
                    <span className="text-xs font-semibold text-white block">{m.name}</span>
                    <span className="text-[11px] text-slate-400">{m.desc}</span>
                  </div>
                  {musicTrack === m.id && !customAudioUrl && (
                    <span className="w-4 h-4 rounded-full bg-[#1a68f7] text-white flex items-center justify-center text-[10px]">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Custom MP3 Upload */}
            <div className="pt-3 border-t border-[#182442] flex items-center justify-between">
              <label
                htmlFor="custom-audio-input"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#080d1e] hover:bg-[#121c38] border border-[#243356] text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition"
              >
                <FileAudio size={14} className="text-cyan-400" />
                <span>Upload Custom Song (MP3 / WAV)</span>
              </label>
              <input
                id="custom-audio-input"
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                style={{ display: 'none' }}
              />

              {customAudioName && (
                <span className="text-xs text-cyan-300 truncate max-w-[200px] flex items-center gap-1">
                  <Check size={12} className="text-emerald-400" />
                  {customAudioName}
                </span>
              )}
            </div>
          </div>

          {/* Big Action Button */}
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#00c6ff] via-[#0084ff] to-[#0051ff] hover:brightness-110 text-white font-bold text-base flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,132,255,0.5)] transition transform active:scale-[0.99] cursor-pointer"
          >
            <Wand2 size={20} />
            <span>Generate &amp; Play Calligraphy Video Loop &gt;</span>
          </button>
        </div>
      )}

      {/* VIEW 2: FULL-SCREEN VIDEO PLAYER (LOOPING ANIMATION WITH MUSIC) */}
      {currentView === 'video' && (
        <ScribbleVideoRenderer
          photoImage={photoImage}
          items={items}
          primaryColor="#1d4a2a"
          themeStyle={selectedTheme}
          titleText={titleText}
          musicTrack={musicTrack}
          customMusicUrl={customAudioUrl}
          onBackToEdit={() => setCurrentView('form')}
        />
      )}
    </main>
  );
}
