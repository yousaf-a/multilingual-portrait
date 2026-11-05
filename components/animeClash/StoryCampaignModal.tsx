'use client';

import React, { useState } from 'react';
import { StoryChapter, PlayerVillageState } from '@/lib/animeClash/types';
import { STORY_CHAPTERS, HEROES_CATALOG } from '@/lib/animeClash/gameData';
import { BookOpen, Check, Award, X, Sparkles, ChevronRight, MapPin } from 'lucide-react';

interface StoryCampaignModalProps {
  villageState: PlayerVillageState;
  onClose: () => void;
  onChapterComplete: (chapter: StoryChapter) => void;
}

export default function StoryCampaignModal({
  villageState,
  onClose,
  onChapterComplete
}: StoryCampaignModalProps) {
  const [selectedChapter, setSelectedChapter] = useState<StoryChapter>(STORY_CHAPTERS[0]);
  const [dialogIndex, setDialogIndex] = useState(0);

  const isCompleted = villageState.completedChapters.includes(selectedChapter.id);

  const handleNextDialog = () => {
    if (dialogIndex < selectedChapter.dialogs.length - 1) {
      setDialogIndex((prev) => prev + 1);
    } else {
      // Completed chapter!
      if (!isCompleted) {
        onChapterComplete(selectedChapter);
      }
    }
  };

  const currentDialog = selectedChapter.dialogs[dialogIndex] || selectedChapter.dialogs[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#0b1226] border border-[#1e2a4a] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]">
        {/* Left Side: Chapter List */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#182442] p-4 bg-[#080d1e] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen size={16} className="text-amber-400" />
              <span>Project Convergence</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">4 CHAPTERS</span>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1">
            {STORY_CHAPTERS.map((ch) => {
              const done = villageState.completedChapters.includes(ch.id);
              const isSelected = selectedChapter.id === ch.id;

              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setSelectedChapter(ch);
                    setDialogIndex(0);
                  }}
                  className={`p-3 rounded-2xl text-left border transition flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 bg-[#16213e] shadow-md'
                      : 'border-[#1e2f54] bg-[#0c152e] hover:bg-[#111e40]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400">CHAPTER {ch.chapterNumber}</span>
                    {done && <Check size={12} className="text-emerald-400" />}
                  </div>
                  <div className="text-xs font-bold text-white">{ch.title}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin size={10} className="text-cyan-400" />
                    <span>{ch.modernLocation}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Visual Novel Story Scene */}
        <div className="flex-1 p-5 flex flex-col justify-between bg-gradient-to-b from-[#09152e] to-[#070b16]">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-[#182442]">
            <div>
              <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
                {selectedChapter.franchiseFocus.replace('_', ' ')} CROSSOVER ARC
              </span>
              <h2 className="text-base font-extrabold text-white">{selectedChapter.title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chapter Briefing */}
          <p className="text-xs text-slate-300 my-3 p-3 rounded-2xl bg-[#080d1e]/80 border border-[#1e2a4a] leading-relaxed">
            {selectedChapter.briefing}
          </p>

          {/* Dialogue Box */}
          <div className="flex flex-col gap-3 my-2 p-4 rounded-3xl bg-[#0b1633] border-2 border-[#1e3a6a] shadow-xl">
            <div className="flex items-center gap-3">
              {(() => {
                const speakerHero = Object.values(HEROES_CATALOG).find((h) =>
                  h.name.toLowerCase().includes(currentDialog.speaker.toLowerCase().split(' ')[0])
                );
                return speakerHero ? (
                  <img
                    src={speakerHero.image}
                    alt={speakerHero.name}
                    className="w-12 h-14 rounded-xl object-cover object-top border-2 border-amber-400 shadow-md shrink-0"
                  />
                ) : (
                  <span className="text-3xl p-1 bg-[#182b54] rounded-xl shrink-0">{currentDialog.avatar}</span>
                );
              })()}
              <div>
                <span className="text-xs font-bold text-amber-400 block">{currentDialog.speaker}</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">{currentDialog.franchise.replace('_', ' ')}</span>
              </div>
            </div>

            <p className="text-xs text-slate-100 italic leading-relaxed min-h-[48px]">
              &ldquo;{currentDialog.text}&rdquo;
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-[#182442]">
              <span className="text-[10px] text-slate-500 font-mono">
                {dialogIndex + 1} / {selectedChapter.dialogs.length}
              </span>

              <button
                type="button"
                onClick={handleNextDialog}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-1 shadow-md hover:brightness-110 cursor-pointer"
              >
                <span>{dialogIndex < selectedChapter.dialogs.length - 1 ? 'Next' : 'Complete Chapter!'}</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* Rewards Card */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#080d1e] border border-[#182442] text-xs">
            <div className="flex items-center gap-3 text-slate-300">
              <Award size={16} className="text-amber-400" />
              <span>Rewards:</span>
              <span className="text-amber-300 font-bold">💰 {selectedChapter.rewardBerries}</span>
              <span className="text-cyan-300 font-bold">🌀 {selectedChapter.rewardChakra}</span>
              <span className="text-purple-300 font-bold">🔮 {selectedChapter.rewardReishi}</span>
            </div>

            {selectedChapter.unlockedHeroId && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Unlocks Hero: {HEROES_CATALOG[selectedChapter.unlockedHeroId]?.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

