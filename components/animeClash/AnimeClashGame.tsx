'use client';

import React, { useState, useEffect } from 'react';
import { PlayerVillageState, StoryChapter, UserAccount, FriendProfile } from '@/lib/animeClash/types';
import { INITIAL_PLAYER_STATE, STORY_CHAPTERS, HEROES_CATALOG } from '@/lib/animeClash/gameData';
import { AnimeEpisode, ANIME_EPISODES } from '@/lib/animeClash/animeStoryData';
import {
  getActiveAccount,
  setActiveUserId,
  getUserVillageState,
  saveUserVillageState,
  logoutActiveUser,
  getOptionalActiveAccount
} from '@/lib/animeClash/accountManager';
import VillageBuilder from './VillageBuilder';
import BattleArena from './BattleArena';
import StoryCampaignModal from './StoryCampaignModal';
import AnimeEpisodePlayer from './AnimeEpisodePlayer';
import AnimeBossFightArena from './AnimeBossFightArena';
import UserAuthModal from './UserAuthModal';

export default function AnimeClashGame() {
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(() => getOptionalActiveAccount() || getActiveAccount());
  const [villageState, setVillageState] = useState<PlayerVillageState>(() =>
    getUserVillageState(getActiveAccount().id)
  );
  const [scoutingFriend, setScoutingFriend] = useState<FriendProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [gameMode, setGameMode] = useState<'village' | 'battle' | 'story_episodes' | 'boss_fight'>('village');
  const [activeBossEpisode, setActiveBossEpisode] = useState<AnimeEpisode>(ANIME_EPISODES[0]);
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  // Sync state on load / account change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const acc = getOptionalActiveAccount() || getActiveAccount();
    setCurrentAccount(acc);
    const loadedState = getUserVillageState(acc.id);
    setVillageState(loadedState);

    // Check for recent defense alert
    const recentDefense = loadedState.battleReports?.find(
      (r) => r.isDefense && Date.now() - r.timestamp < 300000
    );
    if (recentDefense) {
      setTimeout(() => {
        alert(
          `🚨 S.O.S DEFENSE ALERT for ${acc.username}!\n\nYour sanctuary was recently attacked by ${recentDefense.attackerName} (${recentDefense.stars} Stars, ${recentDefense.destructionPct}% damage)!\n\nCheck your defense log in "🌐 Friends & Rivals".`
        );
      }, 500);
    }
  }, []);

  // Switch Active User Account
  const handleSelectAccount = (accountId: string) => {
    setActiveUserId(accountId);
    const newAcc = getActiveAccount();
    setCurrentAccount(newAcc);
    const newState = getUserVillageState(accountId);
    setVillageState(newState);
    setScoutingFriend(null);
  };

  // Explicit User Log Out
  const handleLogout = () => {
    logoutActiveUser();
    setCurrentAccount(null);
    setIsAuthModalOpen(false);
  };

  // Save changes to current user's isolated village
  const handleUpdateVillage = (newState: PlayerVillageState) => {
    if (!currentAccount) {
      alert("⚠️ Login Required: Please log into your account to modify or save your sanctuary.");
      setIsAuthModalOpen(true);
      return;
    }
    if (scoutingFriend) {
      alert("🔒 Read-Only Mode: You cannot modify another player's sanctuary!");
      return;
    }
    setVillageState(newState);
    saveUserVillageState(currentAccount.id, newState);
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

  // Build active display village (either personal base or friend's base in Scout Mode)
  const displayVillage: PlayerVillageState = scoutingFriend
    ? {
        ...villageState,
        level: scoutingFriend.level,
        buildings: scoutingFriend.buildings,
        activeHeroId: scoutingFriend.activeHeroId,
        playerName: scoutingFriend.name,
        sanctuaryTag: scoutingFriend.tag,
        ownerUserId: scoutingFriend.id
      }
    : villageState;

  return (
    <div className="w-full flex flex-col items-center">
      {gameMode === 'village' && (
        <VillageBuilder
          villageState={displayVillage}
          currentUser={currentAccount}
          viewingTargetUser={scoutingFriend}
          onUpdateVillage={handleUpdateVillage}
          onLaunchBattle={() => setGameMode('battle')}
          onOpenStory={() => setGameMode('story_episodes')}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onScoutBase={(friend) => setScoutingFriend(friend)}
          onReturnToMyBase={() => setScoutingFriend(null)}
        />
      )}

      {/* User Login & Account Switcher Modal */}
      {isAuthModalOpen && (
        <UserAuthModal
          currentAccount={currentAccount}
          onSelectAccount={handleSelectAccount}
          onLogout={handleLogout}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {gameMode === 'story_episodes' && (
        <AnimeEpisodePlayer
          onStartBossFight={(ep) => {
            setActiveBossEpisode(ep);
            setGameMode('boss_fight');
          }}
          onClose={() => setGameMode('village')}
        />
      )}

      {gameMode === 'boss_fight' && (
        <AnimeBossFightArena
          episode={activeBossEpisode}
          onVictory={handleBattleVictory}
          onExit={() => setGameMode('village')}
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

