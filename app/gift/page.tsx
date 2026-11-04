'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import ScribbleVideoRenderer from '@/components/ScribbleVideoRenderer';
import { getMultilingualList, TranslatedItem } from '@/lib/languages';
import { Sparkles, Heart, Gift, ArrowRight, Share2, Volume2, RotateCcw } from 'lucide-react';
import Link from 'next/link';

function GiftExperience() {
  const searchParams = useSearchParams();

  // URL parameters
  const toName = searchParams.get('to') || searchParams.get('name') || 'You';
  const customMsg = searchParams.get('msg') || 'Love You';
  const themeParam = (searchParams.get('theme') as any) || 'emerald';
  const musicParam = searchParams.get('music') || 'piano';
  const imgParam = searchParams.get('img') || 'sudhin';
  const roomParam = searchParams.get('room') || `room_${(toName || 'gift').toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  // State
  const [isOpened, setIsOpened] = useState(false);
  const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);
  const [items, setItems] = useState<TranslatedItem[]>([]);

  // Resolve photo image from query param or hash data
  useEffect(() => {
    let imageSrc = '/sample-target-art.png';

    if (imgParam === 'sudhin' || imgParam === 'sample-scribble.jpg') {
      imageSrc = '/sample-scribble.jpg';
    } else if (imgParam === 'teacup' || imgParam === 'sample-teacup.jpg') {
      imageSrc = '/sample-teacup.jpg';
    } else if (imgParam === 'portrait' || imgParam === 'person-preview.jpg') {
      imageSrc = '/person-preview.jpg';
    } else if (imgParam.startsWith('http')) {
      imageSrc = imgParam;
    }

    // Check if image data is in URL hash (custom user uploaded photo encoded as base64)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const match = hash.match(/img=([^&]+)/);
      if (match && match[1]) {
        try {
          imageSrc = decodeURIComponent(match[1]);
        } catch (_) {}
      }
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setPhotoImage(img);
    };
    img.src = imageSrc;

    // Multilingual list strictly using custom message / recipient dedication
    const list = getMultilingualList(customMsg || toName, 'name');
    setItems(list);
  }, [imgParam, toName]);

  const handleOpenGift = () => {
    setIsOpened(true);
  };

  return (
    <div className="min-h-screen bg-[#070b16] text-white flex flex-col items-center justify-between p-3 sm:p-6 md:p-8 relative overflow-x-hidden selection:bg-pink-500/30">
      {/* Background starlight dots */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.08)_0%,_transparent_70%)]" />

      {/* HEADER */}
      <header className="w-full max-w-4xl flex items-center justify-between gap-2 pb-4 border-b border-[#182442]">
        <Link href="/" className="flex items-center gap-2 text-white hover:text-cyan-400 transition min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-tight truncate">Multilingual Studio</span>
        </Link>

        <Link
          href="/"
          className="text-xs px-3 sm:px-3.5 py-1.5 rounded-full bg-[#0c1429] hover:bg-[#152347] border border-[#243356] text-cyan-300 transition shrink-0"
        >
          <span>Create Gift ✨</span>
        </Link>
      </header>

      {/* STAGE 1: THE UNOPENED GIFT ENVELOPE / WAX SEAL */}
      {!isOpened ? (
        <div className="my-auto flex flex-col items-center text-center max-w-md w-full px-4 animate-in fade-in zoom-in duration-500">
          {/* Animated Glowing Gift Box */}
          <div className="relative mb-8 group cursor-pointer" onClick={handleOpenGift}>
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-600 to-purple-600 p-[2px] shadow-[0_0_50px_rgba(244,63,94,0.45)] group-hover:scale-105 transition transform duration-300">
              <div className="w-full h-full bg-[#0d1326] rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
                {/* Golden ribbon band */}
                <div className="absolute w-full h-3 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 shadow-sm" />
                <div className="absolute h-full w-3 bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-300 shadow-sm" />
                
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-stone-900 shadow-md z-10">
                  <Gift size={24} className="animate-bounce" />
                </div>
              </div>
            </div>

            {/* Pulsing glow aura */}
            <div className="absolute inset-0 -z-10 rounded-full bg-pink-500/20 blur-2xl animate-pulse" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-widest text-pink-400 mb-2">
            Personal Animated Gift 💌
          </span>

          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            For {toName} ❤️
          </h1>

          <p className="text-sm text-slate-300 max-w-xs mb-8">
            Someone special created a personal handwritten sketch &amp; multilingual message just for you.
          </p>

          <button
            type="button"
            onClick={handleOpenGift}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:brightness-110 text-white font-bold text-base flex items-center justify-center gap-2 shadow-[0_0_35px_rgba(244,63,94,0.5)] transition transform active:scale-[0.98] cursor-pointer"
          >
            <span>Tap to Unseal &amp; Open Gift</span>
            <ArrowRight size={18} />
          </button>

          <p className="text-[11px] text-slate-500 mt-4 flex items-center gap-1.5">
            <Volume2 size={12} />
            <span>Includes background music &amp; drawing animation</span>
          </p>
        </div>
      ) : (
        /* STAGE 2: THE FULLSCREEN ANIMATED SKETCH REVEAL */
        <div className="w-full flex flex-col items-center my-4 animate-in fade-in duration-700">
          <div className="mb-3 text-center">
            <span className="text-xs text-pink-400 font-semibold tracking-wide uppercase">
              Hand-sketched with love for {toName} ✦
            </span>
          </div>

          <ScribbleVideoRenderer
            photoImage={photoImage}
            items={items}
            primaryColor="#d4af37"
            themeStyle={themeParam}
            titleText={customMsg}
            musicTrack={musicParam}
            customMusicUrl={null}
            roomId={roomParam}
            senderName={toName || 'Recipient'}
            onBackToEdit={() => setIsOpened(false)}
          />

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition"
            >
              ✨ Make a Gift for Someone Special
            </Link>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="w-full max-w-4xl pt-6 border-t border-[#182442] text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>Multilingual Portrait Studio • 100 Languages Scribble Engine</p>
        <p>100% Free Forever</p>
      </footer>
    </div>
  );
}

export default function GiftPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center text-white text-sm">
        <span className="animate-pulse">Loading special gift... 🎁</span>
      </div>
    }>
      <GiftExperience />
    </Suspense>
  );
}

