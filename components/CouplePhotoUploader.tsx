'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, Heart, Image as ImageIcon, Sparkles, Sliders, Split, Users, Download } from 'lucide-react';

export type CoupleLayoutMode = 'split_face' | 'side_by_side';

interface CouplePhotoUploaderProps {
  onImageLoaded: (img: HTMLImageElement | null, dataUrl: string | null) => void;
  onPartnerNamesSuggested?: (names: string) => void;
}

const PRESETS = [
  {
    id: 'split_face_1',
    name: 'Split Face (Look Ahead)',
    desc: 'Close-up fused split face (Reference 3)',
    layout: 'split_face' as CoupleLayoutMode,
    fullUrl: '/couple-presets/preset-split-face-1.jpg',
    leftUrl: '/couple-presets/preset-split-face-1-left.jpg',
    rightUrl: '/couple-presets/preset-split-face-1-right.jpg',
    leftName: 'Her (Gaze)',
    rightName: 'Him (Gaze)',
    suggestedNames: 'Sophia & Lucas'
  },
  {
    id: 'split_face_2',
    name: 'Split Face (Serene Eyes)',
    desc: 'Intimate serene split face (Reference 4)',
    layout: 'split_face' as CoupleLayoutMode,
    fullUrl: '/couple-presets/preset-split-face-2.jpg',
    leftUrl: '/couple-presets/preset-split-face-2-left.jpg',
    rightUrl: '/couple-presets/preset-split-face-2-right.jpg',
    leftName: 'Him (Closed)',
    rightName: 'Her (Closed)',
    suggestedNames: 'Maya & Ethan'
  },
  {
    id: 'side_by_side_1',
    name: 'Anime Shoulder-to-Shoulder',
    desc: 'Full side-by-side companions (Reference 1)',
    layout: 'side_by_side' as CoupleLayoutMode,
    fullUrl: '/couple-presets/preset-side-by-side-1.jpg',
    leftUrl: '/couple-presets/preset-side-by-side-1-left.jpg',
    rightUrl: '/couple-presets/preset-side-by-side-1-right.jpg',
    leftName: 'Boy (Silver Hair)',
    rightName: 'Girl (Silver Hair)',
    suggestedNames: 'Ren & Mia'
  },
  {
    id: 'side_by_side_2',
    name: 'Anime Back-to-Back Duo',
    desc: 'Back-to-back smiling couple (Reference 2)',
    layout: 'side_by_side' as CoupleLayoutMode,
    fullUrl: '/couple-presets/preset-side-by-side-2.jpg',
    leftUrl: '/couple-presets/preset-side-by-side-2-left.jpg',
    rightUrl: '/couple-presets/preset-side-by-side-2-right.jpg',
    leftName: 'Girl (Long Hair)',
    rightName: 'Boy (Smile)',
    suggestedNames: 'Kael & Aria'
  }
];

export default function CouplePhotoUploader({
  onImageLoaded,
  onPartnerNamesSuggested
}: CouplePhotoUploaderProps) {
  const [layoutMode, setLayoutMode] = useState<CoupleLayoutMode>('split_face');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const [partner1Img, setPartner1Img] = useState<HTMLImageElement | null>(null);
  const [partner1Url, setPartner1Url] = useState<string | null>(null);
  const [partner1Name, setPartner1Name] = useState<string>('');

  const [partner2Img, setPartner2Img] = useState<HTMLImageElement | null>(null);
  const [partner2Url, setPartner2Url] = useState<string | null>(null);
  const [partner2Name, setPartner2Name] = useState<string>('');

  const [compositePreviewUrl, setCompositePreviewUrl] = useState<string | null>(null);

  // References to keep latest image objects safe from stale closures
  const partner1Ref = useRef<HTMLImageElement | null>(null);
  const partner2Ref = useRef<HTMLImageElement | null>(null);

  // Merge images according to selected layout mode: 'split_face' or 'side_by_side'
  const mergeImages = useCallback(
    (
      img1: HTMLImageElement | null,
      img2: HTMLImageElement | null,
      mode: CoupleLayoutMode = layoutMode
    ) => {
      if (!img1 && !img2) {
        onImageLoaded(null, null);
        setCompositePreviewUrl(null);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const midX = w / 2;

      // Clean fine-art paper background
      ctx.fillStyle = '#faf8f5';
      ctx.fillRect(0, 0, w, h);

      // Helper to crop & scale an image into a target bounding box
      const drawCover = (
        img: HTMLImageElement,
        destX: number,
        destY: number,
        destW: number,
        destH: number,
        focusX: number = 0.5,
        focusY: number = 0.35
      ) => {
        const imgAspect = img.width / img.height;
        const destAspect = destW / destH;
        let sW, sH, sX, sY;

        if (imgAspect > destAspect) {
          sH = img.height;
          sW = sH * destAspect;
          sX = (img.width - sW) * focusX;
          sY = 0;
        } else {
          sW = img.width;
          sH = sW / destAspect;
          sX = 0;
          sY = (img.height - sH) * focusY;
        }

        ctx.drawImage(img, sX, sY, sW, sH, destX, destY, destW, destH);
      };

      if (img1 && img2) {
        if (mode === 'split_face') {
          // --- STYLE A: FUSED SPLIT FACE (References 3 & 4) ---
          // Partner 1: Left half, focused on the right side of their face meeting the center
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, midX, h);
          ctx.clip();
          drawCover(img1, 0, 0, midX, h, 0.65, 0.35);
          ctx.restore();

          // Partner 2: Right half, focused on the left side of their face meeting the center
          ctx.save();
          ctx.beginPath();
          ctx.rect(midX, 0, midX, h);
          ctx.clip();
          drawCover(img2, midX, 0, midX, h, 0.35, 0.35);
          ctx.restore();

          // Delicate fine-line seam glow connecting both halves
          ctx.save();
          const seamGrad = ctx.createLinearGradient(midX - 1.5, 0, midX + 1.5, 0);
          seamGrad.addColorStop(0, 'rgba(212, 175, 55, 0)');
          seamGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.55)');
          seamGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');
          ctx.fillStyle = seamGrad;
          ctx.fillRect(midX - 1.5, 0, 3, h);
          ctx.restore();
        } else {
          // --- STYLE B: DUAL SIDE-BY-SIDE COMPANIONS (References 1 & 2) ---
          const margin = 16;
          const boxW = midX - margin * 1.5;
          const boxH = h - margin * 2;

          // Partner 1: Complete portrait on the left panel
          ctx.save();
          ctx.beginPath();
          ctx.rect(margin, margin, boxW, boxH);
          ctx.clip();
          drawCover(img1, margin, margin, boxW, boxH, 0.5, 0.35);
          ctx.restore();

          // Partner 2: Complete portrait on the right panel
          ctx.save();
          ctx.beginPath();
          ctx.rect(midX + margin * 0.5, margin, boxW, boxH);
          ctx.clip();
          drawCover(img2, midX + margin * 0.5, margin, boxW, boxH, 0.5, 0.35);
          ctx.restore();

          // Elegant studio vertical divider strip separating the two individual canvases
          ctx.save();
          const divGrad = ctx.createLinearGradient(midX - 2, 0, midX + 2, 0);
          divGrad.addColorStop(0, 'rgba(20, 25, 40, 0.0)');
          divGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.45)');
          divGrad.addColorStop(1, 'rgba(20, 25, 40, 0.0)');
          ctx.fillStyle = divGrad;
          ctx.fillRect(midX - 1.5, margin, 3, boxH);
          ctx.restore();
        }
      } else {
        // Single image fallback
        const single = img1 || img2!;
        drawCover(single, 0, 0, w, h, 0.5, 0.35);
      }

      const compositeDataUrl = canvas.toDataURL('image/png', 0.95);
      setCompositePreviewUrl(compositeDataUrl);

      const compositeImg = new Image();
      compositeImg.onload = () => {
        onImageLoaded(compositeImg, compositeDataUrl);
      };
      compositeImg.src = compositeDataUrl;
    },
    [layoutMode, onImageLoaded]
  );

  // Switch layout mode and re-composite
  const handleLayoutChange = (mode: CoupleLayoutMode) => {
    setLayoutMode(mode);
    if (partner1Ref.current && partner2Ref.current) {
      mergeImages(partner1Ref.current, partner2Ref.current, mode);
    }
  };

  // Load one of the 4 reference presets
  const loadPreset = (preset: (typeof PRESETS)[0]) => {
    setActivePresetId(preset.id);
    setLayoutMode(preset.layout);

    setPartner1Name(preset.leftName);
    setPartner1Url(preset.leftUrl);

    setPartner2Name(preset.rightName);
    setPartner2Url(preset.rightUrl);

    setCompositePreviewUrl(preset.fullUrl);

    const img1 = new Image();
    img1.src = preset.leftUrl;
    partner1Ref.current = img1;
    setPartner1Img(img1);

    const img2 = new Image();
    img2.src = preset.rightUrl;
    partner2Ref.current = img2;
    setPartner2Img(img2);

    const fullImg = new Image();
    fullImg.onload = () => {
      onImageLoaded(fullImg, preset.fullUrl);
      if (onPartnerNamesSuggested) {
        onPartnerNamesSuggested(preset.suggestedNames);
      }
    };
    fullImg.src = preset.fullUrl;
  };

  // Upload Partner 1
  const handlePartner1File = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setActivePresetId(null);
    setPartner1Name(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      setPartner1Url(res);
      const img = new Image();
      img.onload = () => {
        partner1Ref.current = img;
        setPartner1Img(img);
        mergeImages(img, partner2Ref.current);
      };
      img.src = res;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Upload Partner 2
  const handlePartner2File = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setActivePresetId(null);
    setPartner2Name(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      setPartner2Url(res);
      const img = new Image();
      img.onload = () => {
        partner2Ref.current = img;
        setPartner2Img(img);
        mergeImages(partner1Ref.current, img);
      };
      img.src = res;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Download separated individual partner images
  const downloadSeparated = (which: 'partner1' | 'partner2') => {
    const url = which === 'partner1' ? partner1Url : partner2Url;
    const name = which === 'partner1' ? partner1Name || 'partner-1' : partner2Name || 'partner-2';
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}-isolated.png`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Composition Style Switcher (Fused Split Face vs Dual Side-by-Side) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2 rounded-2xl bg-[#080d1e] border border-[#1e2f54]">
        <div className="flex items-center gap-2 px-2 text-xs font-semibold text-slate-300">
          <Sliders size={14} className="text-cyan-400" />
          <span>Composition Style:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-1">
          <button
            type="button"
            onClick={() => handleLayoutChange('split_face')}
            className={`flex-1 py-1.5 sm:py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              layoutMode === 'split_face'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/25'
                : 'bg-[#0c1429] text-slate-400 hover:text-slate-200 border border-[#202f52]'
            }`}
            title="Half face Her + Half face Him merged down the center (References 3 & 4)"
          >
            <Split size={13} />
            <span>Fused Split-Face</span>
          </button>

          <button
            type="button"
            onClick={() => handleLayoutChange('side_by_side')}
            className={`flex-1 py-1.5 sm:py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              layoutMode === 'side_by_side'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-[#0c1429] text-slate-400 hover:text-slate-200 border border-[#202f52]'
            }`}
            title="Two complete individual portraits side-by-side (References 1 & 2)"
          >
            <Users size={13} />
            <span>Side-by-Side Duo</span>
          </button>
        </div>
      </div>

      {/* Dual Upload Slots: Partner 1 & Partner 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
        {/* Partner 1 (Left Half) */}
        <div className="flex flex-col gap-2 p-3 sm:p-3.5 rounded-2xl bg-[#080e22] border border-[#202f52] relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
              <span>👤 Partner 1 (Left)</span>
            </span>
            <div className="flex items-center gap-1.5">
              {partner1Url && (
                <button
                  type="button"
                  onClick={() => downloadSeparated('partner1')}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 hover:underline cursor-pointer"
                  title="Download Partner 1 image separately"
                >
                  <Download size={10} />
                  <span>Separate</span>
                </button>
              )}
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                {partner1Img ? '✓ Loaded' : 'Waiting'}
              </span>
            </div>
          </div>

          <input
            id="partner1-input"
            type="file"
            accept="image/*"
            onChange={handlePartner1File}
            className="hidden"
          />

          <label
            htmlFor="partner1-input"
            className="border-2 border-dashed border-[#243356] hover:border-cyan-400/80 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition bg-[#0a1229]/60 hover:bg-[#0e1938] min-h-[110px]"
          >
            {partner1Url ? (
              <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-cyan-500/40 shadow-md">
                <img src={partner1Url} alt="Partner 1" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-medium transition">
                  Change
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <Upload size={18} className="text-cyan-400 mb-1.5 group-hover:scale-110 transition" />
                <span className="text-xs font-semibold text-white">Choose Left Photo</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Her / Partner 1</span>
              </div>
            )}
          </label>

          <p className="text-[11px] text-slate-400 truncate text-center">
            {partner1Name || 'No photo selected'}
          </p>
        </div>

        {/* Partner 2 (Right Half) */}
        <div className="flex flex-col gap-2 p-3 sm:p-3.5 rounded-2xl bg-[#080e22] border border-[#202f52] relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-pink-300 flex items-center gap-1.5">
              <span>👤 Partner 2 (Right)</span>
            </span>
            <div className="flex items-center gap-1.5">
              {partner2Url && (
                <button
                  type="button"
                  onClick={() => downloadSeparated('partner2')}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 hover:underline cursor-pointer"
                  title="Download Partner 2 image separately"
                >
                  <Download size={10} />
                  <span>Separate</span>
                </button>
              )}
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                {partner2Img ? '✓ Loaded' : 'Waiting'}
              </span>
            </div>
          </div>

          <input
            id="partner2-input"
            type="file"
            accept="image/*"
            onChange={handlePartner2File}
            className="hidden"
          />

          <label
            htmlFor="partner2-input"
            className="border-2 border-dashed border-[#243356] hover:border-pink-400/80 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition bg-[#0a1229]/60 hover:bg-[#0e1938] min-h-[110px]"
          >
            {partner2Url ? (
              <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-pink-500/40 shadow-md">
                <img src={partner2Url} alt="Partner 2" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-medium transition">
                  Change
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <Upload size={18} className="text-pink-400 mb-1.5 group-hover:scale-110 transition" />
                <span className="text-xs font-semibold text-white">Choose Right Photo</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Him / Partner 2</span>
              </div>
            )}
          </label>

          <p className="text-[11px] text-slate-400 truncate text-center">
            {partner2Name || 'No photo selected'}
          </p>
        </div>
      </div>

      {/* Composite Split Preview Bar */}
      {compositePreviewUrl && (
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#091126] border border-[#1e345e] shadow-inner">
          <div className="w-12 h-14 rounded-lg overflow-hidden border border-amber-400/40 shrink-0 shadow">
            <img src={compositePreviewUrl} alt="Composite Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
              <span>
                {layoutMode === 'split_face'
                  ? 'Fused Split-Face Portrait Ready'
                  : 'Side-by-Side Dual Portrait Ready'}
              </span>
            </span>
            <p className="text-[10px] text-slate-400 leading-snug">
              {layoutMode === 'split_face'
                ? 'Two faces fused seamlessly down the center with calligraphy bridging across.'
                : 'Both complete portraits framed side-by-side and separable at any time.'}
            </p>
          </div>
        </div>
      )}

      {/* 4 Reference Style Presets (from user images) */}
      <div className="flex flex-col gap-2 pt-2 border-t border-[#182442]">
        <span className="text-[11px] font-medium text-slate-400">
          Or Pick from Reference Presets:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESETS.map((pr) => (
            <button
              key={pr.id}
              type="button"
              onClick={() => loadPreset(pr)}
              className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                activePresetId === pr.id
                  ? 'bg-[#121c3b] border-pink-500/60 shadow-[0_0_12px_rgba(236,72,153,0.25)]'
                  : 'bg-[#091126] border-[#1e2f54] hover:bg-[#0e1a3a]'
              }`}
            >
              <div className="w-9 h-11 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-slate-900">
                <img src={pr.fullUrl} alt={pr.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-white block truncate">{pr.name}</span>
                <span className="text-[10px] text-slate-400 block truncate">{pr.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}