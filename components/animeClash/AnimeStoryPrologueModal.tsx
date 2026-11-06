'use client';

import React, { useState } from 'react';
import { freeAnimeAudio } from '@/lib/animeClash/freeAnimeAudio';
import {
  BookOpen,
  ChevronRight,
  Sparkles,
  Shield,
  Volume2,
  X,
  Compass,
  Flame,
  Award
} from 'lucide-react';

interface AnimeStoryPrologueModalProps {
  onClose: () => void;
  onStartPlaying: () => void;
}

export default function AnimeStoryPrologueModal({
  onClose,
  onStartPlaying
}: AnimeStoryPrologueModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'THE DIMENSIONAL CONVERGENCE',
      subtitle: 'Where Legends Collide & Sanctuary Begins',
      avatar: '🌌',
      kanji: '次元融合・新時代の夜明け',
      speaker: 'Lord Third Hokage (Hiruzen Sarutobi)',
      quote:
        'Listen closely, young shinobi. A catastrophic fracture in the fabric of space-time has drawn the greatest warrior realms—from the Land of Fire to the Grand Line and Soul Society—into a single dimensional convergence.',
      details: [
        'Our beloved village was scattered into ruins by ancient dimensional rifts.',
        'As the designated Village Architect, you carry the Will of Fire to resurrect Konohagakure from the ground up.',
        'This is not an idle dream. You will build brick by brick, train shinobi, and face real anime trials.'
      ]
    },
    {
      title: 'HOW YOUR JOURNEY WORKS',
      subtitle: 'Harvest, Build, Train & Fortify',
      avatar: '🔨',
      kanji: '里の復興・資源採集と忍の育成',
      speaker: 'Iruka Umino (Academy Instructor)',
      quote:
        'A shinobi village cannot survive on fighting spirit alone! You must gather resources, construct vital landmarks, and train a formidable defense vanguard.',
      details: [
        '💰 Berries: Essential construction currency harvested from farms and missions.',
        '🌀 Chakra: Ancient ley-line energy gathered to train Shinobi troops and cast jutsus.',
        '🔮 Reishi: Rare spirit essence used to empower sacred monuments and hero upgrades.',
        '🏰 Defense Buildings: Erect Wooden Walls, Cannon Watchtowers, and Sealing Gates to keep rogues at bay.'
      ]
    },
    {
      title: 'THE 25-QUEST CANONICAL CAMPAIGN',
      subtitle: 'Live The Anime Saga from Genin to Sage',
      avatar: '🍥',
      kanji: 'ナルト伝・波の国からペイン襲来まで',
      speaker: 'Naruto Uzumaki',
      quote:
        'Dattebayo! You and I are in this together! We will start as green Genin taking the Bell Test, survive the Land of Waves, clash in the Chunin Exams, and master the Rasengan!',
      details: [
        'No shortcuts or cheat buttons! Each quest requires genuine village building and troop training.',
        'Experience canonical dialogues, mini-boss encounters, and recruit allies to your cause.',
        'Unlock authentic character transformations (Normal, Epic, and GOAT mode) through sweat and battle.'
      ]
    },
    {
      title: 'REAL STAKES, DEFEATS & SACRIFICES',
      subtitle: 'Overcome Despair to Reach the Peak',
      avatar: '🌧️',
      kanji: '試練と犠牲・痛みを越えた先へ',
      speaker: 'Jiraiya (The Toad Sage)',
      quote:
        'The true measure of a shinobi is not how he lives, but how he dies. In the final confrontation against the Six Paths of Pain, you will face inevitable defeat and tragic sacrifice. Only by training harder and awakening true Sage Mode can you liberate the Leaf and unlock Chapter 2: The Great Pirate Era!',
      details: [
        'Defeat the final boss of Chapter 1 to unlock Chapter 2 (One Piece World).',
        'Your village layout, defenses, and hero power persist in real-time.',
        'Step forward and ignite the Will of Fire!'
      ]
    }
  ];

  const slide = slides[currentSlide];

  const handleNext = () => {
    freeAnimeAudio.playClashImpact();
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      onStartPlaying();
    }
  };

  const handleSpeak = (text: string) => {
    freeAnimeAudio.speakDialogue(text, 'determined');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#070b18] border-2 border-amber-500/50 rounded-3xl shadow-[0_0_90px_rgba(245,158,11,0.35)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-gradient-to-r from-amber-950/40 via-[#0a0f24] to-black">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <BookOpen size={18} />
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                Konohagakure Chronicles &bull; Prologue
              </h3>
              <p className="text-[10px] text-amber-300 font-mono">
                Slide {currentSlide + 1} of {slides.length}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Slide Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-4xl sm:text-5xl inline-block animate-bounce">{slide.avatar}</span>
              <div className="text-[10px] font-mono font-bold text-amber-400 tracking-widest mt-1">
                {slide.kanji}
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide">
                {slide.title}
              </h2>
              <p className="text-xs text-cyan-300 font-medium">{slide.subtitle}</p>
            </div>

            {/* Character Dialogue Quote Box */}
            <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/30 text-left space-y-1.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 font-mono">
                  🗣️ {slide.speaker}
                </span>
                <button
                  type="button"
                  onClick={() => handleSpeak(slide.quote)}
                  className="p-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 transition cursor-pointer flex items-center gap-1 text-[10px]"
                >
                  <Volume2 size={13} /> <span>Listen</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                &ldquo;{slide.quote}&rdquo;
              </p>
            </div>

            {/* Bulleted Lore Details */}
            <div className="space-y-2 bg-[#0c142c] p-4 rounded-2xl border border-white/5 text-xs text-left">
              {slide.details.map((detail, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-300 leading-snug">
                  <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Slide Pager & Action Button */}
          <div className="pt-5 border-t border-white/10 mt-5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === i ? 'w-6 bg-amber-400' : 'w-2 bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition cursor-pointer"
            >
              <span>{currentSlide === slides.length - 1 ? 'Enter Village & Begin' : 'Next Story Beat'}</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
