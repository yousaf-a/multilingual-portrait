'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, Heart, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';

interface CouplePhotoUploaderProps {
  onImageLoaded: (img: HTMLImageElement | null, dataUrl: string | null) => void;
  onPartnerNamesSuggested?: (names: string) => void;
}

export default function CouplePhotoUploader({
  onImageLoaded,
  onPartnerNamesSuggested
}: CouplePhotoUploaderProps) {
  const [partner1Img, setPartner1Img] = useState<HTMLImageElement | null>(null);
  const [partner1Url, setPartner1Url] = useState<string | null>(null);
  const [partner1Name, setPartner1Name] = useState<string>('');

  const [partner2Img, setPartner2Img] = useState<HTMLImageElement | null>(null);
  const [partner2Url, setPartner2Url] = useState<string | null>(null);
  const [partner2Name, setPartner2Name] = useState<string>('');

  const [compositePreviewUrl, setCompositePreviewUrl] = useState<string | null>(null);

  // Merge the two portraits into a single seamless split portrait
  const mergeImages = useCallback(
    (img1: HTMLImageElement | null, img2: HTMLImageElement | null) => {
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
      const featherW = 50; // 50px smooth gradient transition at center

      // Background paper tone
      ctx.fillStyle = '#faf8f5';
      ctx.fillRect(0, 0, w, h);

      // Helper to draw image cover centered in target rectangle
      const drawCover = (
        img: HTMLImageElement,
        destX: number,
        destY: number,
        destW: number,
        destH: number,
        focusX: number = 0.5,
        focusY: number = 0.38
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

      // Case 1: Both images provided -> Seamless dual split with feathered seam
      if (img1 && img2) {
        // Draw Left Portrait (Partner 1)
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, midX + featherW / 2, h);
        ctx.clip();
        drawCover(img1, 0, 0, midX + featherW / 2, h, 0.5, 0.35);
        ctx.restore();

        // Draw Right Portrait (Partner 2) with soft feather gradient mask
        const offCanvas = document.createElement('canvas');
        offCanvas.width = w;
        offCanvas.height = h;
        const offCtx = offCanvas.getContext('2d');
        if (offCtx) {
          // Draw partner 2 on right half
          const rightW = midX + featherW / 2;
          const rightX = midX - featherW / 2;
          const imgAspect = img2.width / img2.height;
          const destAspect = rightW / h;
          let sW, sH, sX, sY;
          if (imgAspect > destAspect) {
            sH = img2.height;
            sW = sH * destAspect;
            sX = (img2.width - sW) * 0.5;
            sY = 0;
          } else {
            sW = img2.width;
            sH = sW / destAspect;
            sX = 0;
            sY = (img2.height - sH) * 0.35;
          }
          offCtx.drawImage(img2, sX, sY, sW, sH, rightX, 0, rightW, h);

          // Apply feather mask on right image's left edge
          offCtx.globalCompositeOperation = 'destination-in';
          const maskGrad = offCtx.createLinearGradient(midX - featherW / 2, 0, midX + featherW / 2, 0);
          maskGrad.addColorStop(0, 'rgba(0,0,0,0)');
          maskGrad.addColorStop(1, 'rgba(0,0,0,1)');
          offCtx.fillStyle = maskGrad;
          offCtx.fillRect(midX - featherW / 2, 0, featherW, h);

          // Stamp feathered right image onto main canvas
          ctx.drawImage(offCanvas, 0, 0);
        }

        // Delicate organic dividing shimmer at seam
        ctx.save();
        const seamGrad = ctx.createLinearGradient(midX - 1.5, 0, midX + 1.5, 0);
        seamGrad.addColorStop(0, 'rgba(212, 175, 55, 0)');
        seamGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.45)');
        seamGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx.fillStyle = seamGrad;
        ctx.fillRect(midX - 1.5, 0, 3, h);
        ctx.restore();
      } else {
        // Only one of the images is loaded yet -> Fill center
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
    [onImageLoaded]
  );

  // Load sample couple preset
  const loadCouplePreset = () => {
    const p1Url = '/sample-target-art.png';
    const p2Url = '/sample-scribble.jpg';

    setPartner1Name('Goddess (Her)');
    setPartner1Url(p1Url);
    setPartner2Name('Sudhin (Him)');
    setPartner2Url(p2Url);

    let loadedCount = 0;
    const img1 = new Image();
    const img2 = new Image();

    const checkBoth = () => {
      loadedCount++;
      if (loadedCount === 2) {
        setPartner1Img(img1);
        setPartner2Img(img2);
        mergeImages(img1, img2);
        if (onPartnerNamesSuggested) {
          onPartnerNamesSuggested('Sophia & Lucas');
        }
      }
    };

    img1.onload = checkBoth;
    img2.onload = checkBoth;
    img1.src = p1Url;
    img2.src = p2Url;
  };

  const handlePartner1File = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setPartner1Name(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      setPartner1Url(res);
      const img = new Image();
      img.onload = () => {
        setPartner1Img(img);
        mergeImages(img, partner2Img);
      };
      img.src = res;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePartner2File = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setPartner2Name(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      setPartner2Url(res);
      const img = new Image();
      img.onload = () => {
        setPartner2Img(img);
        mergeImages(partner1Img, img);
      };
      img.src = res;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Top Notice */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-gradient-to-r from-pink-950/30 to-purple-950/30 border border-pink-500/30 text-xs text-pink-200">
        <div className="flex items-center gap-2">
          <Heart size={14} className="text-pink-400 fill-pink-400" />
          <span className="font-semibold text-pink-300">Dual-Perspective Couple Split</span>
        </div>
        <span className="text-[11px] text-pink-300/80">Seamless center fusion</span>
      </div>

      {/* Dual Upload Slots: Partner 1 & Partner 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
        {/* Partner 1 (Left Half) */}
        <div className="flex flex-col gap-2 p-3 sm:p-3.5 rounded-2xl bg-[#080e22] border border-[#202f52] relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
              <span>👤 Partner 1 (Left Half)</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              {partner1Img ? '✓ Loaded' : 'Waiting'}
            </span>
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
                <span className="text-[10px] text-slate-400 mt-0.5">Her / Partner 1 / BFF 1</span>
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
              <span>👤 Partner 2 (Right Half)</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              {partner2Img ? '✓ Loaded' : 'Waiting'}
            </span>
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
                <span className="text-[10px] text-slate-400 mt-0.5">Him / Partner 2 / BFF 2</span>
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
            <img src={compositePreviewUrl} alt="Fused Split Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
              <span>Fused Split Portrait Ready</span>
            </span>
            <p className="text-[10px] text-slate-400 leading-snug">
              Center seam smoothly feathered with multilingual calligraphy bridging both partners.
            </p>
          </div>
        </div>
      )}

      {/* Preset sample button */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#182442] flex-wrap">
        <span className="text-[11px] text-slate-400">Quick Test:</span>
        <button
          type="button"
          onClick={loadCouplePreset}
          className="text-[11px] px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-900/40 to-purple-900/40 hover:from-pink-900/60 hover:to-purple-900/60 text-pink-200 border border-pink-500/40 transition flex items-center gap-1.5 shadow-sm"
        >
          <Heart size={12} className="text-pink-400 fill-pink-400" />
          <span>💑 Load Couple Split Preset</span>
        </button>
      </div>
    </div>
  );
}