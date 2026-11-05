'use client';

import React, { useState } from 'react';
import { UserAccount } from '@/lib/animeClash/types';
import { HEROES_CATALOG } from '@/lib/animeClash/gameData';
import { animeAudio } from '@/lib/animeClash/animeAudio';
import {
  getAllAccounts,
  registerAccount,
  getUserVillageState
} from '@/lib/animeClash/accountManager';
import {
  Shield,
  User,
  UserPlus,
  KeyRound,
  CheckCircle,
  X,
  LogOut,
  Sparkles,
  Lock,
  ArrowRight,
  Crown
} from 'lucide-react';

interface UserAuthModalProps {
  currentAccount: UserAccount;
  onSelectAccount: (accountId: string) => void;
  onClose: () => void;
}

export default function UserAuthModal({
  currentAccount,
  onSelectAccount,
  onClose
}: UserAuthModalProps) {
  const [activeTab, setActiveTab] = useState<'switch' | 'register'>('switch');
  const [accounts, setAccounts] = useState<UserAccount[]>(getAllAccounts());
  const [pinInputs, setPinInputs] = useState<Record<string, string>>({});
  const [pinError, setPinError] = useState<string | null>(null);

  // Registration Form State
  const [newUsername, setNewUsername] = useState('');
  const [newHeroId, setNewHeroId] = useState('naruto');
  const [newPin, setNewPin] = useState('');
  const [registerError, setRegisterError] = useState<string | null>(null);

  const handleSwitchAccount = (acc: UserAccount) => {
    setPinError(null);
    if (acc.pin) {
      const entered = pinInputs[acc.id] || '';
      if (entered !== acc.pin) {
        setPinError(`Incorrect PIN for ${acc.username}!`);
        animeAudio.playWallHit();
        return;
      }
    }

    animeAudio.playButtonClick();
    onSelectAccount(acc.id);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    const res = registerAccount(newUsername, newHeroId, newPin);
    if (!res.success || !res.account) {
      setRegisterError(res.error || 'Registration failed');
      animeAudio.playWallHit();
      return;
    }

    animeAudio.playUpgradeSuccess();
    setAccounts(getAllAccounts());
    onSelectAccount(res.account.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#090f1e] border-2 border-[#1e3a5f] rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(59,130,246,0.35)] overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-purple-950 px-4 sm:px-6 py-3.5 sm:py-5 border-b border-[#203666] flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg border border-yellow-200 shrink-0">
              <Shield size={18} className="text-black sm:hidden" />
              <Shield size={22} className="text-black hidden sm:block" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-black text-white tracking-wide flex items-center gap-2">
                <span>Sanctuary User Logins</span>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/40">
                  Private Base
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1 sm:line-clamp-none">
                Each player has their own private base. You alone can change your base!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Active Account Bar */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#0d172e] border-b border-[#182a4d] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs text-slate-400">Logged In:</span>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <strong className="text-[11px] sm:text-xs font-bold text-white">{currentAccount.username}</strong>
              <span className="text-[9px] sm:text-[10px] font-mono text-emerald-300">{currentAccount.tag}</span>
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] text-amber-300 font-semibold flex items-center gap-1">
            <Crown size={12} /> Owner Mode
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#182a4d] px-3 sm:px-6 pt-2 sm:pt-3 gap-2 bg-[#080d1a] overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('switch')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer border-t-2 ${
              activeTab === 'switch'
                ? 'bg-[#0f1d38] border-blue-500 text-white shadow-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User size={13} className="text-blue-400" />
            <span>Switch Account ({accounts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer border-t-2 ${
              activeTab === 'register'
                ? 'bg-[#0f1d38] border-purple-500 text-white shadow-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus size={13} className="text-purple-400" />
            <span>Register New Player</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 bg-[#090f1e]">
          {/* TAB 1: SWITCH / LOGIN ACCOUNT */}
          {activeTab === 'switch' && (
            <div className="flex flex-col gap-4">
              {pinError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/80 text-xs text-red-200 font-bold flex items-center gap-2 animate-shake">
                  <Lock size={14} className="text-red-400 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <div className="text-xs text-slate-400">
                Select your account to access and edit your sanctuary. If another player wants to play on this device, switch to their account:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {accounts.map((acc) => {
                  const hero = HEROES_CATALOG[acc.avatarHeroId] || HEROES_CATALOG.naruto;
                  const isCurrent = acc.id === currentAccount.id;
                  const village = getUserVillageState(acc.id);

                  return (
                    <div
                      key={acc.id}
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                        isCurrent
                          ? 'bg-blue-950/40 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] ring-1 ring-blue-400/50'
                          : 'bg-[#101b33] border-[#1e3357] hover:border-blue-400/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={hero.image}
                          alt={hero.name}
                          className="w-12 h-12 rounded-xl object-cover object-top border-2 shrink-0"
                          style={{ borderColor: hero.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-black text-white truncate">{acc.username}</h4>
                            {isCurrent && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500 text-black">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-cyan-300">{acc.tag}</span>
                          <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-2">
                            <span>Town Hall HQ {village.level}</span>
                            <span>&bull;</span>
                            <span className="text-amber-300 font-bold">🏆 {village.trophies || 4343}</span>
                          </div>
                        </div>
                      </div>

                      {/* PIN input if account has PIN */}
                      {acc.pin && !isCurrent && (
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-slate-700">
                          <KeyRound size={13} className="text-amber-400 shrink-0" />
                          <input
                            type="password"
                            placeholder="Enter Account PIN"
                            value={pinInputs[acc.id] || ''}
                            onChange={(e) =>
                              setPinInputs({
                                ...pinInputs,
                                [acc.id]: e.target.value
                              })
                            }
                            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                          />
                        </div>
                      )}

                      {/* Login Button */}
                      <div>
                        {isCurrent ? (
                          <div className="w-full py-2 rounded-xl bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                            <CheckCircle size={14} /> Currently Active Owner
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSwitchAccount(acc)}
                            className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition"
                          >
                            <span>⚡ Log In as {acc.username.split(' ')[0]}</span>
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER NEW ACCOUNT */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4 max-w-lg mx-auto">
              <div className="text-center">
                <h3 className="text-base font-black text-white">Create Your Personal Sanctuary Account</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Start fresh with your own base, defense walls, and hero guardian. Only you will have permission to modify it!
                </p>
              </div>

              {registerError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-xs text-red-200 font-bold">
                  {registerError}
                </div>
              )}

              {/* Player Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Player Username / Sanctuary Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shadow Ninja, Corsair Alex, Gojo..."
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="bg-black/60 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Starter Hero Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-300">Choose Starter Hero Guardian *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {['naruto', 'luffy', 'ichigo', 'asta'].map((hId) => {
                    const hero = HEROES_CATALOG[hId];
                    if (!hero) return null;
                    const isSelected = newHeroId === hId;

                    return (
                      <button
                        type="button"
                        key={hId}
                        onClick={() => setNewHeroId(hId)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                          isSelected
                            ? 'bg-purple-950/80 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                            : 'bg-black/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <img
                          src={hero.image}
                          alt={hero.name}
                          className="w-12 h-12 rounded-lg object-cover object-top border"
                          style={{ borderColor: hero.color }}
                        />
                        <span className="text-[11px] font-bold text-white">{hero.name.split(' ')[0]}</span>
                        <span className="text-[9px] text-slate-400">{hero.franchise}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional PIN */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Account PIN Protection (Optional)</label>
                  <span className="text-[10px] text-slate-400">Leave blank for fast 1-click login</span>
                </div>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="e.g. 1234 (optional security code)"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="bg-black/60 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Benefits list */}
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-200 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-300">
                  <Sparkles size={13} /> Included with New Account:
                </div>
                <div>&bull; Fresh Town Hall HQ 1 Pagoda & Starter Fortifications</div>
                <div>&bull; 2,500 Starter Berries, Chakra, and Reishi</div>
                <div>&bull; Unique Player Tag for friends to scout and raid your sanctuary</div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-black text-xs shadow-lg cursor-pointer transition flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus size={16} />
                <span>Create Account &amp; Start Base</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#060b14] border-t border-[#182a4d] flex items-center justify-between text-[11px] text-slate-400">
          <span>🔒 Strict Base Ownership: Only the logged-in owner can build, move, or upgrade.</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white underline cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

