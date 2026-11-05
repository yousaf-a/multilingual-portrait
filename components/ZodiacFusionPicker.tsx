'use client';

import React from 'react';
import {
  ZodiacFusionConfig,
  ZODIAC_SIGNS,
  getZodiacSignFromDate,
  calculateZodiacHarmony
} from '@/lib/zodiacConstellations';
import { Sparkles, Moon, Sun, Heart, Check } from 'lucide-react';

interface ZodiacFusionPickerProps {
  config: ZodiacFusionConfig;
  onChange: (config: ZodiacFusionConfig) => void;
}

export default function ZodiacFusionPicker({
  config,
  onChange
}: ZodiacFusionPickerProps) {
  const handleToggle = () => {
    onChange({
      ...config,
      enabled: !config.enabled
    });
  };

  const harmony = calculateZodiacHarmony(config.partner1Sign, config.partner2Sign);

  const signsList = Object.values(ZODIAC_SIGNS);

  return (
    <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/25 backdrop-blur-md transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 text-white text-xs font-bold flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.5)]">
            <Moon size={13} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>Zodiac Soulmate Constellation Fusion</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                ASTROLOGICAL ✨
              </span>
            </h2>
          </div>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={handleToggle}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-indigo-500"></div>
        </label>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Connects both partners&apos; astronomical zodiac constellations in the celestial sky above the portrait, bound together with an embroidered Golden Infinity Ribbon and elemental harmony reading.
      </p>

      {/* Expanded Controls */}
      {config.enabled && (
        <div className="flex flex-col gap-4 pt-2 border-t border-[#182442] animate-in fade-in duration-300">
          {/* Harmony Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#0d1636] to-indigo-950/40 border border-purple-500/30 shadow-inner">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{harmony.s1.symbol}</span>
              <span className="text-amber-400 font-bold text-lg">∞</span>
              <span className="text-2xl">{harmony.s2.symbol}</span>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{harmony.s1.name} &amp; {harmony.s2.name}</span>
                  <span className="text-purple-300 font-normal">({harmony.elements})</span>
                </div>
                <div className="text-[11px] text-purple-200 italic mt-0.5">&ldquo;{harmony.harmonyQuote}&rdquo;</div>
              </div>
            </div>

            <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold shrink-0">
              {harmony.harmonyTitle} • {harmony.score}% Harmony
            </div>
          </div>

          {/* Selectors for Partner 1 and Partner 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Partner 1 Sign */}
            <div className="p-3 rounded-2xl bg-[#080d1e] border border-[#243356]">
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span>Partner 1 (Left) Zodiac Sign</span>
                <span className="text-[11px] text-amber-300 font-bold">{ZODIAC_SIGNS[config.partner1Sign]?.symbol}</span>
              </label>
              <select
                value={config.partner1Sign}
                onChange={(e) => onChange({ ...config, partner1Sign: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#0f1b38] border border-[#22335c] text-white text-xs font-medium focus:border-purple-400 focus:outline-none cursor-pointer"
              >
                {signsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.symbol} {s.name} ({s.dateRange}) — {s.element}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1.5">
                <span>Or pick birthdate:</span>
                <input
                  type="date"
                  onChange={(e) => {
                    const detected = getZodiacSignFromDate(e.target.value);
                    onChange({ ...config, partner1Sign: detected });
                  }}
                  className="px-1.5 py-0.5 rounded bg-[#132247] border border-[#2a3c68] text-slate-300 text-[10px] cursor-pointer"
                />
              </div>
            </div>

            {/* Partner 2 Sign */}
            <div className="p-3 rounded-2xl bg-[#080d1e] border border-[#243356]">
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span>Partner 2 (Right) Zodiac Sign</span>
                <span className="text-[11px] text-amber-300 font-bold">{ZODIAC_SIGNS[config.partner2Sign]?.symbol}</span>
              </label>
              <select
                value={config.partner2Sign}
                onChange={(e) => onChange({ ...config, partner2Sign: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#0f1b38] border border-[#22335c] text-white text-xs font-medium focus:border-purple-400 focus:outline-none cursor-pointer"
              >
                {signsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.symbol} {s.name} ({s.dateRange}) — {s.element}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1.5">
                <span>Or pick birthdate:</span>
                <input
                  type="date"
                  onChange={(e) => {
                    const detected = getZodiacSignFromDate(e.target.value);
                    onChange({ ...config, partner2Sign: detected });
                  }}
                  className="px-1.5 py-0.5 rounded bg-[#132247] border border-[#2a3c68] text-slate-300 text-[10px] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Style & Infinity Ribbon Options */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Ribbon Inking:</span>
              {(['gilded_gold', 'romantic_crimson', 'starlight_cyan'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onChange({ ...config, style: st })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                    config.style === st
                      ? 'bg-purple-600 text-white font-bold shadow-sm'
                      : 'bg-[#0f1b38] text-slate-400 hover:text-white border border-[#22335c]'
                  }`}
                >
                  {st === 'gilded_gold' ? '24K Gold' : st === 'romantic_crimson' ? 'Crimson' : 'Starlight'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showInfinityKnot}
                  onChange={(e) => onChange({ ...config, showInfinityKnot: e.target.checked })}
                  className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-purple-500"
                />
                <span>Weave Golden Infinity Ribbon</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showCompatibility}
                  onChange={(e) => onChange({ ...config, showCompatibility: e.target.checked })}
                  className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-purple-500"
                />
                <span>Display Harmony Inscription</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
