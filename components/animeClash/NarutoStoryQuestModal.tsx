'use client';

import React, { useState } from 'react';
import { PlayerVillageState } from '@/lib/animeClash/types';
import { CHAPTER_1_NARUTO_QUESTS, ChapterQuest } from '@/lib/animeClash/narutoChapterQuests';
import { freeAnimeAudio } from '@/lib/animeClash/freeAnimeAudio';
import {
  BookOpen,
  Check,
  Award,
  X,
  Sparkles,
  ChevronRight,
  Shield,
  Zap,
  Volume2,
  Lock,
  Skull,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface NarutoStoryQuestModalProps {
  villageState: PlayerVillageState;
  onClose: () => void;
  onCompleteQuest: (quest: ChapterQuest) => void;
  onStartPainBoss: () => void;
}

export default function NarutoStoryQuestModal({
  villageState,
  onClose,
  onCompleteQuest,
  onStartPainBoss
}: NarutoStoryQuestModalProps) {
  // Find the first uncompleted quest, or default to quest 1
  const completedIds = (villageState.completedStoryQuests || []) as string[];
  const firstUnfinished = CHAPTER_1_NARUTO_QUESTS.find((q) => !completedIds.includes(q.id)) || CHAPTER_1_NARUTO_QUESTS[0];

  const [selectedQuest, setSelectedQuest] = useState<ChapterQuest>(firstUnfinished);
  const [selectedArc, setSelectedArc] = useState<number>(firstUnfinished.arcNumber);

  const isCurrentQuestCompleted = completedIds.includes(selectedQuest.id);
  const currentQuestIdx = CHAPTER_1_NARUTO_QUESTS.findIndex((q) => q.id === selectedQuest.id);
  const isUnlocked = currentQuestIdx === 0 || completedIds.includes(CHAPTER_1_NARUTO_QUESTS[currentQuestIdx - 1]?.id);

  // Filter quests by selected Arc
  const arcQuests = CHAPTER_1_NARUTO_QUESTS.filter((q) => q.arcNumber === selectedArc);

  const handleReadDialogue = (text: string, mood?: 'normal' | 'angry' | 'sad' | 'determined' | 'dramatic') => {
    freeAnimeAudio.speakDialogue(text, mood);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/88 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-[#070b18] border border-amber-500/40 rounded-3xl shadow-[0_0_80px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        
        {/* Left Side: Chapter & Arc Navigation */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#16203d] p-4 bg-[#050814] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                🍥
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-white">CHAPTER 1: NARUTO</h3>
                <p className="text-[10px] text-amber-400 font-mono">Tale of Konohagakure</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {completedIds.length} / 25
            </span>
          </div>

          {/* Arc Tabs */}
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {[
              { arc: 1, label: 'Arc 1: Waves' },
              { arc: 2, label: 'Arc 2: Exams' },
              { arc: 3, label: 'Arc 3: Sannin' },
              { arc: 4, label: 'Arc 4: Pain' }
            ].map(({ arc, label }) => (
              <button
                key={arc}
                type="button"
                onClick={() => setSelectedArc(arc)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                  selectedArc === arc
                    ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow'
                    : 'bg-black/40 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Quest List */}
          <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1">
            {arcQuests.map((q) => {
              const done = completedIds.includes(q.id);
              const isSelected = selectedQuest.id === q.id;
              const idx = CHAPTER_1_NARUTO_QUESTS.findIndex((item) => item.id === q.id);
              const unlocked = idx === 0 || completedIds.includes(CHAPTER_1_NARUTO_QUESTS[idx - 1]?.id);

              return (
                <button
                  key={q.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => setSelectedQuest(q)}
                  className={`p-2.5 rounded-2xl text-left border transition flex flex-col gap-1 ${
                    !unlocked
                      ? 'opacity-40 border-white/5 bg-black/20 cursor-not-allowed'
                      : isSelected
                      ? 'border-amber-400 bg-[#162347] shadow-md cursor-pointer'
                      : 'border-[#1b2748] bg-[#0c142c] hover:bg-[#121c3d] cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-amber-400">
                      QUEST {q.questNumber} {q.isBossQuest && '👑 FINAL BOSS'}
                    </span>
                    {done ? (
                      <CheckCircle2 size={13} className="text-emerald-400" />
                    ) : !unlocked ? (
                      <Lock size={12} className="text-slate-500" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-white line-clamp-1">{q.title}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 font-mono">{q.japaneseKanji}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Quest Details, Dialogue & Objectives */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between bg-[#080d1e]">
          <div>
            {/* Top Bar with Kanji Banner */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400">
                  {selectedQuest.arcName} &bull; Episode {selectedQuest.questNumber}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  {selectedQuest.title}
                </h2>
                <div className="text-xs font-mono text-cyan-300 mt-0.5">
                  {selectedQuest.japaneseKanji}
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

            {/* Story Dialogue Section */}
            <div className="space-y-2.5 mb-5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={14} className="text-amber-400" /> Story Briefing &amp; Dialogue
              </h4>
              <div className="space-y-2 bg-black/40 p-3.5 rounded-2xl border border-white/5">
                {selectedQuest.prologue.map((dialogue, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <span className="text-lg shrink-0">{dialogue.avatar}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-amber-300 text-[11px]">{dialogue.speaker}</strong>
                        <button
                          type="button"
                          onClick={() => handleReadDialogue(dialogue.text, dialogue.mood)}
                          className="text-slate-400 hover:text-white p-0.5"
                          title="Listen voice"
                        >
                          <Volume2 size={12} />
                        </button>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">&ldquo;{dialogue.text}&rdquo;</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quest Objectives & Tasks */}
            <div className="space-y-2.5 mb-5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield size={14} className="text-cyan-400" /> Mission Objectives
              </h4>
              <div className="space-y-2">
                {selectedQuest.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-2xl bg-[#0f1938] border border-cyan-500/20 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </span>
                      <span className="text-slate-200">{task.description}</span>
                    </div>
                    <span className="font-mono text-cyan-300 text-[11px] font-bold">
                      Goal: {task.targetCount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards Card */}
            <div className="p-3.5 rounded-2xl bg-[#0c142c] border border-amber-400/20 text-xs">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Award size={14} /> Mission Clear Rewards
              </div>
              <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
                <span className="text-amber-300">💰 {selectedQuest.rewards.berries.toLocaleString()} Berries</span>
                <span className="text-blue-300">🌀 {selectedQuest.rewards.chakra.toLocaleString()} Chakra</span>
                <span className="text-purple-300">✨ {selectedQuest.rewards.reishi.toLocaleString()} Reishi</span>
                <span className="text-emerald-300">⚔️ +{selectedQuest.rewards.heroXp} Hero EXP</span>
              </div>
              {selectedQuest.rewards.specialPerk && (
                <div className="mt-2 text-[11px] text-amber-200 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                  🌟 <strong>Perk Unlocked:</strong> {selectedQuest.rewards.specialPerk}
                </div>
              )}
            </div>
          </div>

          {/* Action Footer Button */}
          <div className="pt-4 border-t border-white/10 mt-4">
            {selectedQuest.isBossQuest ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartPainBoss();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_35px_rgba(239,68,68,0.7)] flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Skull size={18} />
                <span>CHALLENGE FINAL BOSS: SIX PATHS OF PAIN</span>
              </button>
            ) : isCurrentQuestCompleted ? (
              <div className="w-full py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-black text-center flex items-center justify-center gap-2">
                <CheckCircle2 size={16} />
                <span>MISSION COMPLETED &bull; WILL OF FIRE SECURED</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onCompleteQuest(selectedQuest)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles size={15} />
                <span>Complete Mission &amp; Claim Rewards</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
