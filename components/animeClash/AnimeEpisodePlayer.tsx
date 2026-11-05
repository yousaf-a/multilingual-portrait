'use client';

import React, { useState } from 'react';
import { AnimeEpisode, ANIME_EPISODES, ANIME_VILLAINS } from '@/lib/animeClash/animeStoryData';
import { HEROES_CATALOG } from '@/lib/animeClash/gameData';
import {
  BookOpen,
  Sword,
  Sparkles,
  ChevronRight,
  Flame,
  Award,
  ArrowLeft,
  X
} from 'lucide-react';

interface AnimeEpisodePlayerProps {
  onStartBossFight: (episode: AnimeEpisode) => void;
  onClose: () => void;
}

export default function AnimeEpisodePlayer({
  onStartBossFight,
  onClose
}: AnimeEpisodePlayerProps) {
  const [selectedEpIndex, setSelectedEpIndex] = useState(0);
  const [dialogStep, setDialogStep] = useState(0);

  const episode = ANIME_EPISODES[selectedEpIndex] || ANIME_EPISODES[0];
  const hero = HEROES_CATALOG[episode.heroId] || HEROES_CATALOG.naruto;
  const villain = ANIME_VILLAINS[episode.villainId] || ANIME_VILLAINS.madara;
  const powerup = episode.powerup;

  const currentScene = episode.scenes[dialogStep] || episode.scenes[0];

  const handleNextScene = () => {
    if (dialogStep < episode.scenes.length - 1) {
      setDialogStep((prev) => prev + 1);
    } else {
      // Auto trigger fight when dialogue finishes
      onStartBossFight(episode);
    }
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-4 my-4 animate-in fade-in">
      {/* 1. TOP EPISODE SELECTOR TABS */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#0b1226]/95 border border-[#1e2a4a]">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-xl bg-[#1e293b]"
        >
          <ArrowLeft size={14} />
          <span>Back to Village</span>
        </button>

        {/* 4 Episode Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {ANIME_EPISODES.map((ep, idx) => {
            const isSelected = selectedEpIndex === idx;
            return (
              <button
                key={ep.id}
                type="button"
                onClick={() => {
                  setSelectedEpIndex(idx);
                  setDialogStep(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md'
                    : 'bg-[#0e172f] text-slate-400 hover:text-white border border-[#1e2a4a]'
                }`}
              >
                <span>EP {ep.episodeNumber}:</span>
                <span className="capitalize">{ep.heroId}</span>
                <span className="text-slate-500">vs</span>
                <span className="capitalize">{ep.villainId}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN STORY VIEWER & VISUAL NOVEL STAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Visual Scene & Dialogue (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Episode Header */}
          <div className="p-4 rounded-3xl bg-[#0b1226]/90 border border-[#1e2a4a] shadow-xl">
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              CANONICAL ANIME ARC • EPISODE {episode.episodeNumber}
            </span>
            <h2 className="text-lg font-black text-white mt-0.5">{episode.title}</h2>
            <div className="text-xs text-amber-400 font-mono italic">{episode.japaneseTitle}</div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">{episode.synopsis}</p>
          </div>

          {/* Interactive Dialogue Stage */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-[#0e1730] to-[#080d1e] border-2 border-[#1e3a6a] shadow-2xl flex flex-col justify-between min-h-[220px]">
            {/* Speaker Header */}
            <div className="flex items-center gap-3">
              <span className="text-3xl p-1 bg-[#182b54] rounded-xl">{currentScene.avatar}</span>
              <div>
                <span className="text-sm font-bold text-white block">
                  {currentScene.speaker}
                  {currentScene.isVillain && (
                    <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      BOSS VILLAIN
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-slate-400">
                  {currentScene.narration ? 'Atmospheric Prologue' : 'Dimensional Dialogue'}
                </span>
              </div>
            </div>

            {/* Line Text */}
            <p className="text-xs sm:text-sm text-slate-100 italic my-4 leading-relaxed font-serif pl-1">
              &ldquo;{currentScene.text}&rdquo;
            </p>

            {/* Stage Progress & Next */}
            <div className="flex items-center justify-between pt-3 border-t border-[#182442]">
              <span className="text-[11px] text-slate-500 font-mono">
                Dialogue {dialogStep + 1} of {episode.scenes.length}
              </span>

              <button
                type="button"
                onClick={handleNextScene}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>{dialogStep < episode.scenes.length - 1 ? 'Continue Story' : 'Engage Boss Fight!'}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Powerup & Villain Boss Profile (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Legendary Powerup Awakening Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1c130d] via-[#121c2e] to-[#080d1e] border border-amber-500/40 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-amber-400" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                HERO POWERUP AWAKENING
              </span>
            </div>

            <h3 className="text-sm font-extrabold text-white">{powerup.formName}</h3>
            <div className="text-[10px] text-amber-400 font-mono">{powerup.japaneseName}</div>

            <p className="text-[11px] text-slate-300 my-2 leading-relaxed">{powerup.buildupStory}</p>

            <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20 text-[10px] text-amber-200 space-y-1">
              <div>
                <strong>Awakening Trigger:</strong> {powerup.awakeningTrigger}
              </div>
              <div>
                <strong>Ultimate Move:</strong> {powerup.unlockedAttack}
              </div>
            </div>
          </div>

          {/* Villain Boss Threat Card */}
          <div className="p-4 rounded-3xl bg-[#0b1226]/90 border border-red-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-red-400 tracking-wider uppercase">
                TARGET BOSS INVASION
              </span>
              <span className="text-xs text-red-300 font-bold">{villain.hp} HP</span>
            </div>

            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-2xl">{villain.avatar}</span>
              <div>
                <h4 className="text-xs font-bold text-white">{villain.name}</h4>
                <div className="text-[10px] text-slate-400">{villain.title}</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-snug">{villain.modernRole}</p>

            {/* Launch Boss Fight Button */}
            <button
              type="button"
              onClick={() => onStartBossFight(episode)}
              className="mt-3 w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition cursor-pointer"
            >
              <Sword size={15} />
              <span>START ANIME BOSS FIGHT NOW!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
