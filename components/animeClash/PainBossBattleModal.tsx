'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PlayerVillageState } from '@/lib/animeClash/types';
import { freeAnimeAudio } from '@/lib/animeClash/freeAnimeAudio';
import {
  Skull,
  Shield,
  Zap,
  Flame,
  Volume2,
  X,
  Sparkles,
  Heart,
  Award,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface PainBossBattleModalProps {
  villageState: PlayerVillageState;
  onClose: () => void;
  onVictory: (rewards: { berries: number; chakra: number; reishi: number; unlockedHeroId?: string }) => void;
}

type BattleStage = 'intro' | 'despair_clash' | 'sacrifice_cutscene' | 'sage_training' | 'revenge_climax' | 'victory';

export default function PainBossBattleModal({
  villageState,
  onClose,
  onVictory
}: PainBossBattleModalProps) {
  const [stage, setStage] = useState<BattleStage>('intro');
  const [bossHp, setBossHp] = useState(12000);
  const [maxBossHp] = useState(12000);
  const [playerHp, setPlayerHp] = useState(2500);
  const [maxPlayerHp, setMaxPlayerHp] = useState(2500);

  // Scripted Despair Battle Tracking
  const [knockdownCount, setKnockdownCount] = useState(0);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  // Sage Training Minigame
  const [naturalChakra, setNaturalChakra] = useState(50); // Target 40-60
  const [trainingTimer, setTrainingTimer] = useState(0);
  const [isTrainingSuccess, setIsTrainingSuccess] = useState(false);

  // Sound & Speech Helpers
  const playSoundAndSpeak = (text: string, mood?: 'normal' | 'angry' | 'sad' | 'determined' | 'dramatic') => {
    freeAnimeAudio.speakDialogue(text, mood);
  };

  // Screen Shake Trigger
  const triggerScreenShake = () => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 900);
  };

  // Add Battle Log Entry
  const addLog = (msg: string) => {
    setBattleLog((prev) => [msg, ...prev.slice(0, 4)]);
  };

  // ==========================================
  // STAGE 1: THE SCRIPTED DESPAIR CLASH
  // ==========================================
  const handlePlayerAttackPhase1 = () => {
    freeAnimeAudio.playClashImpact();
    const dmg = 850 + Math.floor(Math.random() * 300);
    const nextHp = Math.max(4500, bossHp - dmg);
    setBossHp(nextHp);
    addLog(`⚔️ Naruto lands Shadow Clone Kick for ${dmg} damage!`);

    // Once boss drops to 4500 HP, Pain executes Shinra Tensei
    if (nextHp <= 4500) {
      setTimeout(() => {
        triggerScreenShake();
        freeAnimeAudio.playShinraTensei();
        playSoundAndSpeak('Know true pain. ALMIGHTY PUSH: SHINRA TENSEI!!', 'dramatic');
        addLog('💥 PAIN CASTS ALMIGHTY PUSH: SHINRA TENSEI!! The entire battlefield collapses!');

        setKnockdownCount((prev) => {
          const next = prev + 1;
          setPlayerHp((p) => Math.max(0, p - 900));
          if (next >= 3) {
            // 3rd knockdown triggers the Sacrifice cutscene
            setTimeout(() => {
              setStage('sacrifice_cutscene');
              freeAnimeAudio.playSacrificeMelody();
            }, 1800);
          }
          return next;
        });
      }, 700);
    } else {
      // Normal boss counter-attack
      setTimeout(() => {
        freeAnimeAudio.playClashImpact();
        const bossDmg = 450;
        setPlayerHp((p) => Math.max(500, p - bossDmg));
        addLog(`⚡ Pain strikes back with Black Chakra Receiver for ${bossDmg} damage!`);
      }, 500);
    }
  };

  // ==========================================
  // STAGE 3: SAGE TRAINING MINIGAME LOOP
  // ==========================================
  useEffect(() => {
    if (stage !== 'sage_training') return;

    const interval = setInterval(() => {
      // Natural energy drifts randomly
      setNaturalChakra((prev) => {
        const drift = (Math.random() - 0.48) * 6;
        const next = Math.max(10, Math.min(90, prev + drift));

        // Check if player is holding within the golden 38 - 62 zone
        if (next >= 36 && next <= 64) {
          setTrainingTimer((t) => {
            const nextTime = t + 0.15;
            if (nextTime >= 4.0 && !isTrainingSuccess) {
              setIsTrainingSuccess(true);
              freeAnimeAudio.playSageModeAwakening();
              setTimeout(() => {
                // Transition to Climax
                setMaxPlayerHp(4000);
                setPlayerHp(4000);
                setBossHp(7500);
                setStage('revenge_climax');
                playSoundAndSpeak('Sage Mode perfected! I will carry out Master Jiraiya’s will and defeat you!', 'determined');
              }, 1500);
            }
            return nextTime;
          });
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [stage, isTrainingSuccess]);

  // Player Tapping to Balance Senjutsu
  const handleMeditationNudge = (direction: 'left' | 'right') => {
    freeAnimeAudio.playClashImpact();
    setNaturalChakra((prev) => (direction === 'left' ? Math.max(15, prev - 8) : Math.min(85, prev + 8)));
  };

  // ==========================================
  // STAGE 4: CLIMAX REVENGE ATTACKS
  // ==========================================
  const handleRasenshuriken = () => {
    triggerScreenShake();
    freeAnimeAudio.playRasenshurikenWind();
    playSoundAndSpeak('Sage Art: Wind Style Rasenshuriken!!', 'determined');

    const dmg = 3800;
    const nextHp = Math.max(0, bossHp - dmg);
    setBossHp(nextHp);
    addLog(`🌀 SAGE ART: RASENSHURIKEN rips through Pain's defenses for ${dmg} CRITICAL damage!`);

    if (nextHp <= 0) {
      setTimeout(() => {
        setStage('victory');
        playSoundAndSpeak('Peace is not an illusion. I will never give up on the future my master believed in!', 'determined');
      }, 1600);
    } else {
      setTimeout(() => {
        freeAnimeAudio.playClashImpact();
        const bossDmg = 400;
        setPlayerHp((p) => Math.max(200, p - bossDmg));
        addLog(`🪐 Pain counters with Bansho Tenin for ${bossDmg} damage!`);
      }, 800);
    }
  };

  const handleFrogKumite = () => {
    triggerScreenShake();
    freeAnimeAudio.playClashImpact();
    playSoundAndSpeak('Frog Kumite! Natural Energy Strike!', 'determined');

    const dmg = 2200;
    const nextHp = Math.max(0, bossHp - dmg);
    setBossHp(nextHp);
    addLog(`🐸 FROG KUMITE invisible natural energy punch crushes Pain for ${dmg} damage!`);

    if (nextHp <= 0) {
      setTimeout(() => {
        setStage('victory');
      }, 1600);
    }
  };

  const handleClaimFinalVictory = () => {
    onVictory({
      berries: 15000,
      chakra: 12000,
      reishi: 6000,
      unlockedHeroId: 'minato'
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black/92 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in ${isScreenShaking ? 'animate-bounce' : ''}`}>
      <div className="relative w-full max-w-4xl bg-[#070b18] border-2 border-red-500/50 rounded-3xl shadow-[0_0_80px_rgba(239,68,68,0.4)] overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-red-500/20 bg-gradient-to-r from-red-950/60 via-[#0a0f24] to-black">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40">
              <Skull size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white tracking-wide">
                  CHAPTER 1 CLIMAX: INVASION OF THE SIX PATHS
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white uppercase shadow">
                  FINAL BOSS
                </span>
              </div>
              <p className="text-xs text-red-300/80">
                God of the Hidden Rain &bull; Deva Path Pain
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

        {/* Boss HP Bar (Visible in combat stages) */}
        {(stage === 'despair_clash' || stage === 'revenge_climax') && (
          <div className="p-4 bg-black/50 border-b border-white/10">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-red-400 flex items-center gap-1.5">
                <Skull size={14} /> Deva Path Pain (Rinnegan Supreme)
              </span>
              <span className="font-mono text-slate-300">{bossHp} / {maxBossHp} HP</span>
            </div>
            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-red-500/30">
              <div
                className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, (bossHp / maxBossHp) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold mt-3 mb-1">
              <span className="text-amber-400 flex items-center gap-1.5">
                <Shield size={14} /> Naruto Uzumaki {stage === 'revenge_climax' ? '(Sage Mode Awakened)' : '(Will of Fire)'}
              </span>
              <span className="font-mono text-slate-300">{playerHp} / {maxPlayerHp} HP</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-amber-500/30">
              <div
                className={`h-full rounded-full transition-all duration-300 ${stage === 'revenge_climax' ? 'bg-gradient-to-r from-amber-400 to-yellow-300' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}
                style={{ width: `${Math.max(0, (playerHp / maxPlayerHp) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* MAIN STAGE CONTENT SWITCHER */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col justify-center items-center text-center">

          {/* ========================================================= */}
          {/* INTRO SCREEN */}
          {/* ========================================================= */}
          {stage === 'intro' && (
            <div className="max-w-xl space-y-4 animate-in zoom-in duration-300">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-red-600 to-slate-900 border-2 border-red-500 flex items-center justify-center text-5xl shadow-[0_0_40px_rgba(239,68,68,0.6)]">
                🪐
              </div>

              <h2 className="text-2xl font-black text-white">The Six Paths of Pain Descends</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                The Hidden Leaf Village lies shattered in a colossal crater. The leader of the Akatsuki stands at the center, demanding the surrender of the Nine-Tails.
              </p>

              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 italic">
                &ldquo;Do you understand true pain now, Naruto? Those who do not understand pain can never know peace.&rdquo;
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStage('despair_clash');
                    playSoundAndSpeak('I will protect the Leaf with my life! Multi-Shadow Clone Jutsu!', 'determined');
                  }}
                  className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg transition cursor-pointer"
                >
                  Engage in Battle (Phase 1)
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STAGE 1: SCRIPTED DESPAIR CLASH */}
          {/* ========================================================= */}
          {stage === 'despair_clash' && (
            <div className="w-full max-w-lg space-y-4">
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl animate-bounce">🍥</span>
                <span className="text-xl font-mono text-red-500 font-black">VS</span>
                <span className="text-4xl animate-pulse">🪐</span>
              </div>

              {knockdownCount > 0 && (
                <div className="p-2.5 rounded-2xl bg-red-600/20 border border-red-500 text-red-300 text-xs font-bold animate-pulse">
                  ⚠️ SCRIPTED DESPAIR: Knockdown {knockdownCount} of 3! Pain&apos;s Shinra Tensei is unstoppable!
                </div>
              )}

              {/* Battle Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePlayerAttackPhase1}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Zap size={15} />
                  <span>Shadow Clone Barrage</span>
                </button>

                <button
                  type="button"
                  onClick={handlePlayerAttackPhase1}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Flame size={15} />
                  <span>Standard Rasengan</span>
                </button>
              </div>

              {/* Combat Log */}
              <div className="mt-4 p-3 rounded-2xl bg-black/60 border border-white/10 text-left text-[11px] font-mono text-slate-300 space-y-1 min-h-[90px]">
                {battleLog.map((log, i) => (
                  <div key={i} className="line-clamp-1">{log}</div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STAGE 2: HEARTBREAKING SACRIFICE CUTSCENE */}
          {/* ========================================================= */}
          {stage === 'sacrifice_cutscene' && (
            <div className="max-w-xl space-y-4 animate-in fade-in duration-500">
              <div className="w-20 h-20 mx-auto rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-4xl shadow-inner">
                🌧️
              </div>

              <div className="text-xs font-mono uppercase tracking-widest text-red-400">
                Tragic Moment &bull; The Ultimate Sacrifice
              </div>

              <h2 className="text-xl font-black text-white">A Companion Takes The Blade</h2>

              <div className="p-4 rounded-2xl bg-black/80 border border-white/20 text-left space-y-3">
                <p className="text-xs text-amber-200 italic">
                  &ldquo;I was always running after you, Naruto-kun... wanting to walk by your side. You changed me! Your smile saved me! That is why I am not afraid to die protecting you!&rdquo;
                </p>
                <p className="text-xs text-red-400 font-bold">
                  &mdash; Hinata leaps in front of Pain&apos;s black receiver, taking the lethal strike. She collapses onto the stone ground.
                </p>
                <p className="text-xs text-slate-300">
                  Pain stares coldly: &ldquo;Love breeds sacrifice... which breeds hatred. And so, pain is born.&rdquo;
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 text-left">
                <strong>Minato Namikaze (Echo of the Fourth):</strong> &ldquo;Naruto, do not give into blind despair. Calm your heart. Channel the natural energy of Mount Myoboku. You are the child of prophecy.&rdquo;
              </div>

              <button
                type="button"
                onClick={() => {
                  setStage('sage_training');
                  playSoundAndSpeak('Natural energy, gather into me! Sage Mode training begins!', 'determined');
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-lg transition cursor-pointer"
              >
                Begin Mount Myoboku Sage Training &rarr;
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* STAGE 3: SAGE TRAINING MINIGAME */}
          {/* ========================================================= */}
          {stage === 'sage_training' && (
            <div className="max-w-md w-full space-y-5 animate-in zoom-in duration-300">
              <div>
                <h3 className="text-lg font-black text-white">Mount Myoboku Senjutsu Meditation</h3>
                <p className="text-xs text-slate-400">
                  Keep the Natural Energy needle centered in the <strong className="text-amber-400">Golden Harmony Zone</strong> for 4 seconds!
                </p>
              </div>

              {/* Progress gauge */}
              <div className="relative w-full h-8 bg-slate-900 rounded-full border-2 border-white/20 overflow-hidden shadow-inner flex items-center">
                {/* Safe zone highlight */}
                <div className="absolute left-[36%] w-[28%] h-full bg-emerald-500/30 border-x border-emerald-400/60" />

                {/* Needle indicator */}
                <div
                  className="absolute w-4 h-full bg-amber-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,1)] transition-all duration-75"
                  style={{ left: `calc(${naturalChakra}% - 8px)` }}
                />
              </div>

              <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1">
                <span>🪨 Turn to Stone (Too Low)</span>
                <span className="text-amber-300 font-bold">✨ SAGE HARMONY</span>
                <span>🐸 Toad Mutation (Too High)</span>
              </div>

              {/* Timer Progress */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full transition-all"
                  style={{ width: `${Math.min(100, (trainingTimer / 4.0) * 100)}%` }}
                />
              </div>
              <div className="text-xs font-mono text-emerald-400 font-bold">
                Meditation Focus: {trainingTimer.toFixed(1)}s / 4.0s
              </div>

              {/* Balance Nudge Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleMeditationNudge('left')}
                  className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/10 transition cursor-pointer"
                >
                  &larr; Suppress Energy
                </button>
                <button
                  type="button"
                  onClick={() => handleMeditationNudge('right')}
                  className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/10 transition cursor-pointer"
                >
                  Draw Natural Energy &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STAGE 4: CLIMAX REVENGE BATTLE (SAGE MODE) */}
          {/* ========================================================= */}
          {stage === 'revenge_climax' && (
            <div className="w-full max-w-lg space-y-4 animate-in zoom-in duration-300">
              <div className="p-2 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-bold flex items-center justify-center gap-2">
                <Sparkles size={16} className="text-amber-400 animate-spin" />
                <span>SAGE MODE FULLY AWAKENED! You now possess God-Tier Senjutsu!</span>
              </div>

              {/* Climax Jutsu Action Palette */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRasenshuriken}
                  className="py-4 px-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-125 text-white font-black text-xs flex flex-col items-center justify-center gap-1 shadow-[0_0_25px_rgba(6,182,212,0.6)] transition cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-sm">
                    <Zap size={16} /> <span>SAGE ART: RASENSHURIKEN</span>
                  </div>
                  <span className="text-[10px] text-cyan-200 font-mono">Deals 3,800 S-Rank Blast Damage</span>
                </button>

                <button
                  type="button"
                  onClick={handleFrogKumite}
                  className="py-4 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-125 text-white font-black text-xs flex flex-col items-center justify-center gap-1 shadow-[0_0_25px_rgba(16,185,129,0.6)] transition cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-sm">
                    <Flame size={16} /> <span>FROG KUMITE STRIKE</span>
                  </div>
                  <span className="text-[10px] text-emerald-200 font-mono">Invisible Natural Energy Hit (2,200 DMG)</span>
                </button>
              </div>

              {/* Combat Log */}
              <div className="mt-3 p-3 rounded-2xl bg-black/60 border border-white/10 text-left text-[11px] font-mono text-slate-300 space-y-1 min-h-[80px]">
                {battleLog.map((log, i) => (
                  <div key={i} className="line-clamp-1">{log}</div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STAGE 5: GRAND VICTORY & CHAPTER 2 UNLOCK */}
          {/* ========================================================= */}
          {stage === 'victory' && (
            <div className="max-w-lg space-y-4 animate-in zoom-in duration-500">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-5xl shadow-[0_0_60px_rgba(245,158,11,0.8)]">
                🏆
              </div>

              <div className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                Six Paths of Pain Overcome!
              </div>

              <h2 className="text-2xl font-black text-white">HERO OF THE HIDDEN LEAF</h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                You overcame defeat, tragedy, and despair. Nagato has cast the <em>Gedo Art of Rinne Rebirth</em>, restoring the fallen. The village tosses Naruto into the sky as their savior!
              </p>

              {/* Unlock Rewards Box */}
              <div className="p-4 rounded-3xl bg-[#0e1733] border border-amber-400/40 text-left space-y-2">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Award size={16} />
                  <span>CHAPTER 1 CAMPAIGN REWARDS:</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    +15,000 Berries
                  </div>
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    +12,000 Chakra
                  </div>
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                    +6,000 Reishi
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/50 flex items-center gap-2 mt-2">
                  <span className="text-2xl">⚡</span>
                  <div className="text-left text-xs">
                    <strong className="text-white">Hero Unlocked: Minato Namikaze</strong>
                    <div className="text-[10px] text-amber-300">The Yellow Flash of the Leaf / Flying Thunder God</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-950/50 border border-cyan-400/50 flex items-center gap-2.5 text-xs text-cyan-200 mt-2">
                  <span className="text-2xl">🏴‍☠️</span>
                  <div>
                    <strong className="text-white text-sm">CHAPTER 2 UNLOCKED: ONE PIECE</strong>
                    <div className="text-[11px] text-cyan-300">The Great Pirate Archipelago &amp; Marineford War is now open!</div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClaimFinalVictory}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.6)] transition cursor-pointer"
              >
                Claim Victory &amp; Enter Chapter 2 &rarr;
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

