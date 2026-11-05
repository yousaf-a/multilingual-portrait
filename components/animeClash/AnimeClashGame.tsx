'use client';

import React, { useState, useEffect } from 'react';
import { PlayerVillageState, StoryChapter } from '@/lib/animeClash/types';
import { INITIAL_PLAYER_STATE, STORY_CHAPTERS, HEROES_CATALOG } from '@/lib/animeClash/gameData';
import VillageBuilder from './VillageBuilder';
import BattleArena from './BattleArena';
import StoryCampaignModal from './StoryCampaignModal';

const STORAGE_KEY = 'anime_clash_village_v1';

export default function AnimeClashGame() {
  const [villageState, setVillageState] = useState<PlayerVillageState>(INITIAL_PLAYER_STATE);
  const [gameMode, setGameMode] = useState<'village' | 'battle'>('village');
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  // Load saved game from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setVillageState(JSON.parse(raw));
      }
    } catch (_) {}
  }, []);

  // Save changes
  const handleUpdateVillage = (newState: PlayerVillageState) => {
    setVillageState(newState);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } catch (_) {}
    }
  };

  // Handle Battle Rewards
  const handleBattleVictory = (rewards: { berries: number; chakra: number; reishi: number }) => {
    const updated: PlayerVillageState = {
      ...villageState,
      berries: Math.min(villageState.maxStorage, villageState.berries + rewards.berries),
      chakra: Math.min(villageState.maxStorage, villageState.chakra + rewards.chakra),
      reishi: Math.min(villageState.maxStorage, villageState.reishi + rewards.reishi)
    };
    handleUpdateVillage(updated);
  };

  // Handle Chapter Completion
  const handleChapterComplete = (chapter: StoryChapter) => {
    const newUnlocked = [...villageState.unlockedHeroes];
    if (chapter.unlockedHeroId && !newUnlocked.includes(chapter.unlockedHeroId)) {
      newUnlocked.push(chapter.unlockedHeroId);
    }

    const updated: PlayerVillageState = {
      ...villageState,
      berries: Math.min(villageState.maxStorage, villageState.berries + chapter.rewardBerries),
      chakra: Math.min(villageState.maxStorage, villageState.chakra + chapter.rewardChakra),
      reishi: Math.min(villageState.maxStorage, villageState.reishi + chapter.rewardReishi),
      unlockedHeroes: newUnlocked,
      completedChapters: [...villageState.completedChapters, chapter.id]
    };

    handleUpdateVillage(updated);
    alert(`🎉 Chapter ${chapter.chapterNumber} Complete! Rewards Claimed!`);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {gameMode === 'village' && (
        <VillageBuilder
          villageState={villageState}
          onUpdateVillage={handleUpdateVillage}
          onLaunchBattle={() => setGameMode('battle')}
          onOpenStory={() => setIsStoryOpen(true)}
        />
      )}

      {gameMode === 'battle' && (
        <BattleArena
          villageState={villageState}
          onVictory={handleBattleVictory}
          onExit={() => setGameMode('village')}
        />
      )}

      {isStoryOpen && (
        <StoryCampaignModal
          villageState={villageState}
          onClose={() => setIsStoryOpen(false)}
          onChapterComplete={handleChapterComplete}
        />
      )}
    </div>
  );
}

