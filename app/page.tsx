'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PhotoUploader from '@/components/PhotoUploader';
import CouplePhotoUploader from '@/components/CouplePhotoUploader';
import ScribbleVideoRenderer from '@/components/ScribbleVideoRenderer';
import InstagramMusicPicker from '@/components/InstagramMusicPicker';
import CelestialMapPicker from '@/components/CelestialMapPicker';
import ZodiacFusionPicker from '@/components/ZodiacFusionPicker';
import FingerprintHeartPicker from '@/components/FingerprintHeartPicker';
import DailyLockscreenStudio from '@/components/DailyLockscreenStudio';
import DailyInkNote from '@/components/DailyInkNote';
import OneSketchJournal from '@/components/OneSketchJournal';
import AnimeClashGame from '@/components/animeClash/AnimeClashGame';
import { getMultilingualList, TranslatedItem } from '@/lib/languages';
import { MusicTrackItem } from '@/lib/musicTracks';
import { CelestialMapConfig, DEFAULT_CELESTIAL_CONFIG } from '@/lib/celestialStarMap';
import { ZodiacFusionConfig, DEFAULT_ZODIAC_CONFIG } from '@/lib/zodiacConstellations';
import { FingerprintHeartConfig, DEFAULT_FINGERPRINT_CONFIG } from '@/lib/fingerprintHeart';
import {
  Sparkles,
  Music,
  Globe,
  Upload,
  FileAudio,
  Check,
  Wand2,
  Palette,
  AlertCircle,
  Heart,
  User,
  Smartphone,
  Feather,
  BookOpen,
  Flame,
  Sword
} from 'lucide-react';

// Legacy fallback to avoid any stale HMR cache runtime errors
const MUSIC_PRESETS: { id: string; name: string; desc: string }[] = [];

const THEME_OPTIONS = [
  {
    id: 'monochrome',
    name: 'Pure Graphite & Charcoal',
    desc: 'Classic master hand-drawn pencil sketch on fine art paper (Reference Style)',
    color: '#18181b',
    accent: '#52525b'
  },
  {
    id: 'emerald',
    name: 'Antique Gold & Rose Accents',
    desc: 'Charcoal pencil with selective 24K gold & rose petal tint',
    color: '#d4af37',
    accent: '#be185d'
  },
  {
    id: 'sepia_gold',
    name: 'Vintage Sepia & 24K Gold',
    desc: 'Warm Italian parchment with burnt umber ink & gold leaf glaze',
    color: '#92400e',
    accent: '#d4a017'
  },
  {
    id: 'sanguine',
    name: 'Renaissance Sanguine Chalk',
    desc: 'Classic terracotta red chalk sketch on cream Fabriano paper',
    color: '#991b1b',
    accent: '#c2410c'
  },
  {
    id: 'prussian_blue',
    name: 'Prussian Blue & Cerulean',
    desc: 'Deep indigo pencil with misty cerulean watercolor wash',
    color: '#0369a1',
    accent: '#38bdf8'
  },
  {
    id: 'emerald_gold',
    name: 'Royal Pine & Champagne Gold',
    desc: 'Deep pine inking with luminous champagne gold accents',
    color: '#15803d',
    accent: '#c5a059'
  }
];

export default function Home() {
  // Master Studio Mode: 'portrait', 'lockscreen', 'ink_note', 'journal', 'anime_clash'
  const [studioMode, setStudioMode] = useState<'portrait' | 'lockscreen' | 'ink_note' | 'journal' | 'anime_clash'>('portrait');

  // Page view: 'form' (settings only, NO preview) or 'video' (looping video player)
  const [currentView, setCurrentView] = useState<'form' | 'video'>('form');

  const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);
  const [portraitMode, setPortraitMode] = useState<'single' | 'couple'>('single');
  const [titleText, setTitleText] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('monochrome');
  const [selectedTrackId, setSelectedTrackId] = useState<string>('until_i_found_you');
  const [musicTrack, setMusicTrack] = useState<string>('romantic_piano');
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [customAudioName, setCustomAudioName] = useState<string | null>(null);
  const [celestialConfig, setCelestialConfig] = useState<CelestialMapConfig>(DEFAULT_CELESTIAL_CONFIG);
  const [zodiacConfig, setZodiacConfig] = useState<ZodiacFusionConfig>(DEFAULT_ZODIAC_CONFIG);
  const [fingerprintConfig, setFingerprintConfig] = useState<FingerprintHeartConfig>(DEFAULT_FINGERPRINT_CONFIG);

  const [items, setItems] = useState<TranslatedItem[]>([]);
  const [formErrors, setFormErrors] = useState<{ photo?: string; title?: string; theme?: string }>({});

  const handleImageLoaded = useCallback((img: HTMLImageElement | null) => {
    setPhotoImage(img);
    if (img) {
      setFormErrors((prev) => ({ ...prev, photo: undefined }));
    }
  }, []);

  // Update multilingual dictionary strictly using what the user fills
  useEffect(() => {
    if (!titleText.trim()) {
      setItems([]);
      return;
    }
    const list = getMultilingualList(titleText, 'name');
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
    const errors: { photo?: string; title?: string; theme?: string } = {};

    if (!photoImage) {
      errors.photo = 'Image is required. Please upload a photo or choose a sample.';
    }
    if (!titleText.trim()) {
      errors.title = 'Inscription is required. Please enter a name or dedication.';
    }
    if (!selectedTheme) {
      errors.theme = 'Theme is required. Please choose a color palette.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstKey = Object.keys(errors)[0];
      const el = document.getElementById(`card-${firstKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setFormErrors({});
    setCurrentView('video');
  };

  return (
    <main className="min-h-screen bg-[#070d1e] text-white flex flex-col items-center justify-start p-3 sm:p-6 md:p-8 relative overflow-x-hidden selection:bg-cyan-500/30">
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
      <header className={`w-full ${studioMode === 'anime_clash' ? 'max-w-7xl' : 'max-w-4xl'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 pb-5 border-b border-[#182442] transition-all duration-300`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 shrink-0 flex items-center justify-center text-cyan-400 drop-shadow-[0_0_12px_rgba(0,229,255,0.8)]">
            <Sparkles size={28} className="fill-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Multilingual</span>
              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent font-extrabold">
                Calligraphy Studio
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 font-normal">
              Slowly sketches your image top-to-bottom purely with multilingual calligraphy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 text-xs font-medium">
          <Globe size={13} className="text-emerald-400 shrink-0" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>100 Languages Engine</span>
        </div>
      </header>

      {/* MASTER STUDIO MODE SELECTOR (Daily Utility Navigation) */}
      <div className={`w-full ${studioMode === 'anime_clash' ? 'max-w-7xl' : 'max-w-4xl'} flex items-center justify-start sm:justify-center overflow-x-auto gap-2 py-3.5 my-2 border-b border-[#182442]/80 scrollbar-none transition-all duration-300`}>
        <button
          type="button"
          onClick={() => {
            setStudioMode('portrait');
            setCurrentView('form');
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            studioMode === 'portrait'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40'
              : 'bg-[#0b1226] text-slate-400 hover:text-white border border-[#1e2a4a]'
          }`}
        >
          <Sparkles size={14} className={studioMode === 'portrait' ? 'fill-white' : ''} />
          <span>🎨 Master Portrait Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setStudioMode('lockscreen')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            studioMode === 'lockscreen'
              ? 'bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-lg shadow-sky-500/25 border border-sky-400/40'
              : 'bg-[#0b1226] text-slate-400 hover:text-white border border-[#1e2a4a]'
          }`}
        >
          <Smartphone size={14} />
          <span>📱 Today&apos;s Lockscreen</span>
        </button>

        <button
          type="button"
          onClick={() => setStudioMode('ink_note')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            studioMode === 'ink_note'
              ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-lg shadow-pink-500/25 border border-pink-400/40'
              : 'bg-[#0b1226] text-slate-400 hover:text-white border border-[#1e2a4a]'
          }`}
        >
          <Heart size={14} className={studioMode === 'ink_note' ? 'fill-white' : ''} />
          <span>💌 Daily Ink Note</span>
        </button>

        <button
          type="button"
          onClick={() => setStudioMode('journal')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            studioMode === 'journal'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-orange-500/25 border border-amber-400/50'
              : 'bg-[#0b1226] text-slate-400 hover:text-white border border-[#1e2a4a]'
          }`}
        >
          <Flame size={14} className={studioMode === 'journal' ? 'fill-slate-950' : ''} />
          <span>📖 One Sketch a Day</span>
        </button>

        <button
          type="button"
          onClick={() => setStudioMode('anime_clash')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            studioMode === 'anime_clash'
              ? 'bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 text-white shadow-lg shadow-red-500/30 border border-red-400/50'
              : 'bg-[#0b1226] text-slate-400 hover:text-white border border-[#1e2a4a]'
          }`}
        >
          <Sword size={14} className={studioMode === 'anime_clash' ? 'fill-white' : ''} />
          <span>⚔️ Anime Clash: Neo-Village</span>
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-red-400/20 text-red-300 border border-red-400/40">
            GAME 🎮
          </span>
        </button>
      </div>

      {/* GAME MODE: ANIME CLASH NEO-VILLAGE */}
      {studioMode === 'anime_clash' && <AnimeClashGame />}

      {/* DAILY MODE 1: TODAY'S LOCKSCREEN STUDIO */}
      {studioMode === 'lockscreen' && <DailyLockscreenStudio />}

      {/* DAILY MODE 2: DAILY INK NOTE STUDIO */}
      {studioMode === 'ink_note' && <DailyInkNote />}

      {/* DAILY MODE 3: ONE SKETCH A DAY JOURNAL */}
      {studioMode === 'journal' && <OneSketchJournal />}

      {/* VIEW 1: CREATION FORM (NO PREVIEW ON PAGE) */}
      {studioMode === 'portrait' && currentView === 'form' && (
        <div className="w-full max-w-2xl flex flex-col gap-4 sm:gap-5 my-4 sm:my-8">
          {/* Card 1: Upload Photo / Subject (Required) */}
          <div
            id="card-photo"
            className={`bg-[#0b1226]/90 border rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/25 backdrop-blur-md transition ${
              formErrors.photo
                ? 'border-rose-500 ring-2 ring-rose-500/30'
                : 'border-[#1e2a4a]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#1b64f2] text-white text-xs font-bold flex items-center justify-center shadow-[0_0_8px_rgba(27,100,242,0.5)]">
                  1
                </span>
                <h2 className="text-sm font-semibold text-white">Upload Subject / Photo</h2>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400">
                * Required
              </span>
            </div>

            {formErrors.photo && (
              <div className="flex items-center gap-2 p-3 mb-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span>{formErrors.photo}</span>
              </div>
            )}

            {/* Mode Switcher Tabs: Single Subject vs Couple / Split Mode */}
            <div className="flex items-center gap-2 mb-4 p-1 rounded-2xl bg-[#080d1e] border border-[#1e2f54] w-full">
              <button
                type="button"
                onClick={() => setPortraitMode('single')}
                className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  portraitMode === 'single'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User size={14} />
                <span>Single Portrait</span>
              </button>

              <button
                type="button"
                onClick={() => setPortraitMode('couple')}
                className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  portraitMode === 'couple'
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Heart size={14} className={portraitMode === 'couple' ? 'fill-white' : ''} />
                <span>Couple / Split Mode 💕</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              {portraitMode === 'single'
                ? 'Upload any image (portrait, person, pet). The engine will reconstruct its shapes into a fine-art sketch framed with your custom inscription.'
                : 'Upload 2 photos (Partner 1 & Partner 2). The engine fuses them seamlessly down the center into a unified romantic masterpiece.'}
            </p>

            {portraitMode === 'single' ? (
              <PhotoUploader onImageLoaded={handleImageLoaded} />
            ) : (
              <CouplePhotoUploader
                onImageLoaded={handleImageLoaded}
                onPartnerNamesSuggested={(suggested) => {
                  if (!titleText.trim()) {
                    setTitleText(suggested);
                    setFormErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
              />
            )}
          </div>

          {/* Card 2: Main Calligraphy Title & Inscription (Required) */}
          <div
            id="card-title"
            className={`bg-[#0b1226]/90 border rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/25 backdrop-blur-md transition ${
              formErrors.title
                ? 'border-rose-500 ring-2 ring-rose-500/30'
                : 'border-[#1e2a4a]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#1b64f2] text-white text-xs font-bold flex items-center justify-center shadow-[0_0_8px_rgba(27,100,242,0.5)]">
                  2
                </span>
                <h2 className="text-sm font-semibold text-white">Main Calligraphy Inscription</h2>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400">
                * Required
              </span>
            </div>

            {formErrors.title && (
              <div className="flex items-center gap-2 p-3 mb-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span>{formErrors.title}</span>
              </div>
            )}

            <p className="text-xs text-slate-300 mb-2.5">
              {portraitMode === 'couple'
                ? 'Type both partner names or dedicated romantic message to be written across the seam:'
                : 'Type the exact name, dedication, or phrase to be written across the artwork:'}
            </p>

            <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-2xl bg-[#09152e] border border-[#1e3a6a] text-xs text-sky-200 mb-3 shadow-inner">
              <Sparkles size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px] text-slate-300">
                <span className="font-semibold text-cyan-300">
                  {portraitMode === 'couple' ? 'Couple Inscription:' : 'Custom Text Only:'}
                </span>{' '}
                {portraitMode === 'couple' ? (
                  <>
                    Enter both names (e.g. <em>Sophia &amp; Lucas</em>) or dedication. The calligraphy will connect both halves across the portrait.
                  </>
                ) : (
                  <>
                    Enter any dedication (e.g. <em>Sophia</em>, <em>Happy Birthday</em>). The engine renders <strong>strictly what you type</strong> across world languages without forcing any default phrase.
                  </>
                )}
              </div>
            </div>

            <input
              type="text"
              value={titleText}
              onChange={(e) => {
                setTitleText(e.target.value);
                if (e.target.value.trim()) {
                  setFormErrors((prev) => ({ ...prev, title: undefined }));
                }
              }}
              placeholder={
                portraitMode === 'couple'
                  ? 'Enter couple names (e.g. Sophia & Lucas)...'
                  : 'Enter custom dedication or text (e.g. Sophia, Happy Birthday)...'
              }
              className="w-full px-4 py-3 rounded-2xl bg-[#080d1e] border border-[#243356] focus:border-[#3b82f6] focus:outline-none text-white text-sm font-medium placeholder:text-slate-500 transition shadow-inner"
            />
          </div>

          {/* Card 3: Calligraphy Color Theme (Required) */}
          <div
            id="card-theme"
            className={`bg-[#0b1226]/90 border rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/25 backdrop-blur-md transition ${
              formErrors.theme
                ? 'border-rose-500 ring-2 ring-rose-500/30'
                : 'border-[#1e2a4a]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#1b64f2] text-white text-xs font-bold flex items-center justify-center shadow-[0_0_8px_rgba(27,100,242,0.5)]">
                  3
                </span>
                <h2 className="text-sm font-semibold text-white">Color Palette &amp; Inking Style</h2>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400">
                * Required
              </span>
            </div>

            {formErrors.theme && (
              <div className="flex items-center gap-2 p-3 mb-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span>{formErrors.theme}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-2">
              {THEME_OPTIONS.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => {
                    setSelectedTheme(th.id as any);
                    setFormErrors((prev) => ({ ...prev, theme: undefined }));
                  }}
                  className={`p-3.5 rounded-2xl text-left border transition flex items-start justify-between cursor-pointer ${
                    selectedTheme === th.id
                      ? 'border-[#1a68f7] bg-[#101b38] shadow-[0_0_15px_rgba(26,104,247,0.3)]'
                      : 'border-[#243356] bg-[#080d1e] hover:bg-[#0e162f]'
                  }`}
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: th.color }}
                      />
                      <span className="text-xs font-semibold text-white">{th.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{th.desc}</p>
                  </div>
                  {selectedTheme === th.id && (
                    <span className="w-4 h-4 rounded-full bg-[#1a68f7] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Card 4: Celestial Star Map Layer (Optional / Anniversary) */}
          <CelestialMapPicker config={celestialConfig} onChange={setCelestialConfig} />

          {/* Card 5: Zodiac Soulmate Constellation Fusion (Optional) */}
          <ZodiacFusionPicker config={zodiacConfig} onChange={setZodiacConfig} />

          {/* Card 6: Micro-Calligraphy Fingerprint Heart Seal (Optional) */}
          <FingerprintHeartPicker
            config={fingerprintConfig}
            onChange={setFingerprintConfig}
            defaultNames={titleText}
          />

          {/* Card 7: Background Music Selection (Optional) */}
          <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/25 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#1b64f2] text-white text-xs font-bold flex items-center justify-center shadow-[0_0_8px_rgba(27,100,242,0.5)]">
                  7
                </span>
                <div className="flex items-center gap-2">
                  <Music size={16} className="text-cyan-400" />
                  <h2 className="text-sm font-semibold text-white">Instagram Story Music Library</h2>
                </div>
              </div>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                Optional
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Choose an aesthetic soundtrack, upload your own MP3, or leave muted (music is completely optional):
            </p>

            <InstagramMusicPicker
              selectedTrackId={selectedTrackId}
              customAudioUrl={customAudioUrl}
              customAudioName={customAudioName}
              onSelectTrack={(track: MusicTrackItem) => {
                setSelectedTrackId(track.id);
                setMusicTrack(track.style);
                setCustomAudioUrl(null);
                setCustomAudioName(null);
              }}
              onSelectNone={() => {
                setSelectedTrackId('none');
                setMusicTrack('none');
                setCustomAudioUrl(null);
                setCustomAudioName(null);
              }}
              onUploadCustom={(file: File) => {
                const url = URL.createObjectURL(file);
                setCustomAudioUrl(url);
                setCustomAudioName(file.name);
                setMusicTrack('custom');
                setSelectedTrackId('custom');
              }}
            />
          </div>

          {/* Big Action Button */}
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-[#00c6ff] via-[#0084ff] to-[#0051ff] hover:brightness-110 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,132,255,0.5)] transition transform active:scale-[0.99] cursor-pointer"
          >
            <Wand2 size={18} />
            <span>Generate &amp; Play Calligraphy Video Loop &gt;</span>
          </button>
        </div>
      )}

      {/* VIEW 2: FULL-SCREEN VIDEO PLAYER (LOOPING ANIMATION WITH MUSIC) */}
      {studioMode === 'portrait' && currentView === 'video' && (
        <ScribbleVideoRenderer
          photoImage={photoImage}
          items={items}
          primaryColor="#1d4a2a"
          themeStyle={selectedTheme}
          titleText={titleText}
          musicTrack={musicTrack}
          customMusicUrl={customAudioUrl}
          celestialConfig={celestialConfig}
          zodiacConfig={zodiacConfig}
          fingerprintConfig={fingerprintConfig}
          onBackToEdit={() => setCurrentView('form')}
        />
      )}
    </main>
  );
}
