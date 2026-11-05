'use client';

import React from 'react';
import {
  FingerprintHeartConfig,
  DEFAULT_FINGERPRINT_CONFIG
} from '@/lib/fingerprintHeart';
import { Heart, Sparkles, Feather, Check } from 'lucide-react';

interface FingerprintHeartPickerProps {
  config: FingerprintHeartConfig;
  onChange: (config: FingerprintHeartConfig) => void;
  defaultNames?: string;
}

export default function FingerprintHeartPicker({
  config,
  onChange,
  defaultNames
}: FingerprintHeartPickerProps) {
  const handleToggle = () => {
    onChange({
      ...config,
      enabled: !config.enabled,
      partnerNames: config.partnerNames || defaultNames || 'Sophia & Lucas'
    });
  };

  const INK_OPTIONS: { id: FingerprintHeartConfig['inkColor']; name: string; color: string; desc: string }[] = [
    {
      id: 'burgundy',
      name: 'Burgundy Crimson Wax',
      color: '#9f1239',
      desc: 'Authentic royal wax seal impression'
    },
    {
      id: 'gold_leaf',
      name: '24K Gold Leaf Foil',
      color: '#d4af37',
      desc: 'Metallic gilded reflection'
    },
    {
      id: 'charcoal',
      name: 'Graphite Charcoal',
      color: '#3f3f46',
      desc: 'Subtle fine-art sketch inking'
    },
    {
      id: 'sapphire',
      name: 'Royal Sapphire Ink',
      color: '#1e3a8a',
      desc: 'Deep archival fountain pen ink'
    }
  ];

  return (
    <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/25 backdrop-blur-md transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 text-white text-xs font-bold flex items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.5)]">
            <Heart size={13} className="fill-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>Micro-Calligraphy Fingerprint Heart Seal</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300">
                ROYAL EMBLEM 🔏
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
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-rose-500 peer-checked:to-pink-400"></div>
        </label>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Two interlocking thumbprints forming a romantic heart. Every friction ridge is formed entirely out of micro-fine cursive vows in world languages (*&ldquo;Je t&apos;aime&rdquo;*, *&ldquo;Forever &amp; Always&rdquo;*, *&ldquo;Ti amo&rdquo;*).
      </p>

      {/* Expanded Controls */}
      {config.enabled && (
        <div className="flex flex-col gap-4 pt-2 border-t border-[#182442] animate-in fade-in duration-300">
          {/* Row 1: Partner Names & Vow Message */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Feather size={13} className="text-rose-400" />
                <span>Names for Heart Seal Crest</span>
              </label>
              <input
                type="text"
                value={config.partnerNames}
                onChange={(e) => onChange({ ...config, partnerNames: e.target.value })}
                placeholder="e.g. Sophia & Lucas..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d1e] border border-[#243356] focus:border-rose-400 focus:outline-none text-white text-xs font-medium transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Sparkles size={13} className="text-rose-400" />
                <span>Vow Inscribed Along Ridges</span>
              </label>
              <input
                type="text"
                value={config.vowPhrase}
                onChange={(e) => onChange({ ...config, vowPhrase: e.target.value })}
                placeholder="e.g. Two lives, one soul..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d1e] border border-[#243356] focus:border-rose-400 focus:outline-none text-white text-xs font-medium transition"
              />
            </div>
          </div>

          {/* Row 2: Inking Tone Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Seal Inking &amp; Wax Impression Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INK_OPTIONS.map((opt) => {
                const isSelected = config.inkColor === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange({ ...config, inkColor: opt.id })}
                    className={`p-2.5 rounded-xl text-left border transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-rose-400 bg-[#16213e] shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                        : 'border-[#243356] bg-[#080d1e] hover:bg-[#0f1a36]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                          style={{ backgroundColor: opt.color }}
                        />
                        <span className="text-[11px] font-bold text-white leading-tight">{opt.name}</span>
                      </div>
                      {isSelected && <Check size={12} className="text-rose-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Position & Border Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Position:</span>
              {(['bottom_center', 'bottom_right', 'bottom_left'] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => onChange({ ...config, position: pos })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                    config.position === pos
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-[#0f1b38] text-slate-400 hover:text-white border border-[#22335c]'
                  }`}
                >
                  {pos === 'bottom_center' ? 'Bottom Center' : pos === 'bottom_right' ? 'Bottom Right' : 'Bottom Left'}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={config.showSealBorder}
                onChange={(e) => onChange({ ...config, showSealBorder: e.target.checked })}
                className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-rose-500"
              />
              <span>Embossed Astrolabe Seal Border</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

