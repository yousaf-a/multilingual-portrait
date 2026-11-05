'use client';

import React, { useState } from 'react';
import {
  CelestialMapConfig,
  POPULAR_LOCATIONS,
  OCCASION_PRESETS,
  formatCoordinates,
  formatAnniversaryDate
} from '@/lib/celestialStarMap';
import { Sparkles, Compass, Calendar, MapPin, Star, Moon, Check } from 'lucide-react';

interface CelestialMapPickerProps {
  config: CelestialMapConfig;
  onChange: (config: CelestialMapConfig) => void;
}

export default function CelestialMapPicker({
  config,
  onChange
}: CelestialMapPickerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggle = () => {
    onChange({
      ...config,
      enabled: !config.enabled
    });
  };

  const handleSelectLocation = (loc: { name: string; lat: number; lng: number }) => {
    onChange({
      ...config,
      locationName: loc.name,
      latitude: loc.lat,
      longitude: loc.lng
    });
  };

  const STYLE_PRESETS: { id: CelestialMapConfig['style']; name: string; desc: string; color: string; border: string }[] = [
    {
      id: 'gilded_gold',
      name: '24K Gilded Gold Leaf',
      desc: 'Shimmering metallic gold constellation rings & stippled stars',
      color: '#d4af37',
      border: 'rgba(212, 175, 55, 0.4)'
    },
    {
      id: 'indigo_starlight',
      name: 'Deep Indigo Starlight',
      desc: 'Celestial cyan-blue astronomical chart with diamond stars',
      color: '#38bdf8',
      border: 'rgba(56, 189, 248, 0.4)'
    },
    {
      id: 'sepia_astronomy',
      name: 'Renaissance Sepia',
      desc: 'Da Vinci style burnt umber astrolabe on aged Italian parchment',
      color: '#b47b42',
      border: 'rgba(180, 123, 66, 0.4)'
    },
    {
      id: 'rose_gold',
      name: 'Rose Gold & Copper',
      desc: 'Blushing metallic pink and warm romantic starlight',
      color: '#fb7185',
      border: 'rgba(251, 113, 133, 0.4)'
    }
  ];

  return (
    <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/25 backdrop-blur-md transition">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-900 text-xs font-bold flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.5)]">
            <Sparkles size={13} className="fill-slate-900" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>Anniversary Celestial Star Map Layer</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300">
                NEW ✨
              </span>
            </h2>
          </div>
        </div>

        {/* Master Enable / Disable Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={handleToggle}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-yellow-400"></div>
        </label>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Calculates and projects the exact night sky constellation chart above your chosen date &amp; city (Orion, Big Dipper, Cassiopeia, Sirius). Hand-stippled by the fountain pen in genuine gold leaf behind your portrait.
      </p>

      {/* Expandable Controls when Enabled */}
      {config.enabled && (
        <div className="flex flex-col gap-4 pt-2 border-t border-[#182442] animate-in fade-in duration-300">
          {/* Quick Preview Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#09152e] border border-[#1e3a6a] text-xs shadow-inner">
            <div className="flex items-center gap-2 text-amber-300 font-medium">
              <Star size={14} className="fill-amber-300 shrink-0" />
              <span>{config.occasionText}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-200">{formatAnniversaryDate(config.date)}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <MapPin size={12} className="text-cyan-400 shrink-0" />
              <span>{config.locationName}</span>
              <span className="text-slate-600">({formatCoordinates(config.latitude, config.longitude)})</span>
            </div>
          </div>

          {/* Row 1: Date & Occasion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-amber-400" />
                <span>Special Date / Anniversary</span>
              </label>
              <input
                type="date"
                value={config.date}
                onChange={(e) => onChange({ ...config, date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d1e] border border-[#243356] focus:border-amber-400 focus:outline-none text-white text-xs font-medium transition cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" />
                <span>Occasion Plaque Inscription</span>
              </label>
              <input
                type="text"
                value={config.occasionText}
                onChange={(e) => onChange({ ...config, occasionText: e.target.value })}
                placeholder="e.g. The Night We Met..."
                list="occasion-presets"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d1e] border border-[#243356] focus:border-amber-400 focus:outline-none text-white text-xs font-medium transition"
              />
              <datalist id="occasion-presets">
                {OCCASION_PRESETS.map((op) => (
                  <option key={op} value={op} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Row 2: Location & Coordinates */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin size={13} className="text-cyan-400" />
              <span>City / Astronomical Location</span>
            </label>

            {/* Popular City Presets */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {POPULAR_LOCATIONS.map((loc) => {
                const isSelected = config.locationName === loc.name;
                return (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => handleSelectLocation(loc)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-900 font-bold shadow-sm shadow-amber-400/30'
                        : 'bg-[#0f1b38] hover:bg-[#162750] text-slate-300 border border-[#22335c]'
                    }`}
                  >
                    <span>{loc.name.split(',')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Coordinates Inputs */}
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={config.locationName}
                onChange={(e) => onChange({ ...config, locationName: e.target.value })}
                placeholder="Custom City..."
                className="col-span-1 px-3 py-2 rounded-xl bg-[#080d1e] border border-[#243356] focus:border-cyan-400 focus:outline-none text-white text-xs"
              />
              <div className="col-span-1 relative">
                <input
                  type="number"
                  step="0.0001"
                  value={config.latitude}
                  onChange={(e) => onChange({ ...config, latitude: parseFloat(e.target.value) || 0 })}
                  placeholder="Lat (e.g. 48.85)"
                  className="w-full px-3 py-2 rounded-xl bg-[#080d1e] border border-[#243356] focus:border-cyan-400 focus:outline-none text-white text-xs font-mono"
                />
                <span className="absolute right-2.5 top-2 text-[10px] text-slate-500">Lat</span>
              </div>
              <div className="col-span-1 relative">
                <input
                  type="number"
                  step="0.0001"
                  value={config.longitude}
                  onChange={(e) => onChange({ ...config, longitude: parseFloat(e.target.value) || 0 })}
                  placeholder="Lng (e.g. 2.35)"
                  className="w-full px-3 py-2 rounded-xl bg-[#080d1e] border border-[#243356] focus:border-cyan-400 focus:outline-none text-white text-xs font-mono"
                />
                <span className="absolute right-2.5 top-2 text-[10px] text-slate-500">Lng</span>
              </div>
            </div>
          </div>

          {/* Row 3: Celestial Art Style Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Compass size={13} className="text-amber-400" />
              <span>Constellation Inking Tone</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STYLE_PRESETS.map((st) => {
                const isSelected = config.style === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => onChange({ ...config, style: st.id })}
                    className={`p-2.5 rounded-xl text-left border transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-[#16213e] shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                        : 'border-[#243356] bg-[#080d1e] hover:bg-[#0f1a36]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                          style={{ backgroundColor: st.color }}
                        />
                        <span className="text-[11px] font-bold text-white leading-tight">{st.name}</span>
                      </div>
                      {isSelected && <Check size={12} className="text-amber-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">{st.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Options Checkboxes */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={config.showConstellationLines}
                onChange={(e) => onChange({ ...config, showConstellationLines: e.target.checked })}
                className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-amber-400 focus:ring-0 cursor-pointer"
              />
              <span>Draw Constellation Asterism Lines</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={config.showCoordinatesRing}
                onChange={(e) => onChange({ ...config, showCoordinatesRing: e.target.checked })}
                className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-amber-400 focus:ring-0 cursor-pointer"
              />
              <span>Engrave 360° Astrolabe Compass Ring</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
