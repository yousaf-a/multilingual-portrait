'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Upload,
  Heart,
  Image as ImageIcon,
  Sparkles,
  Sliders,
  Split,
  Users,
  Download,
  Wand2,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Copy,
  Check
} from 'lucide-react';

export type CoupleLayoutMode = 'split_face' | 'side_by_side';

interface FaceTransform {
  zoom: number; // 0.6 to 2.5
  panX: number; // -100 to +100
  panY: number; // -100 to +100
}

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
    p1: { zoom: 1.0, panX: 0, panY: 0 },
    p2: { zoom: 1.0, panX: 0, panY: 0 },
    seam: 26,
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
    p1: { zoom: 1.05, panX: 0, panY: 2 },
    p2: { zoom: 1.05, panX: 0, panY: 2 },
    seam: 30,
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
    desc: 'Shoulder-to-shoulder couple portrait (Reference 1)',
    layout: 'side_by_side' as CoupleLayoutMode,
    p1: { zoom: 1.05, panX: 2, panY: -2 },
    p2: { zoom: 1.02, panX: -2, panY: 2 },
    seam: 130,
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
    p1: { zoom: 1.02, panX: -5, panY: 0 },
    p2: { zoom: 1.02, panX: 5, panY: 0 },
    seam: 110,
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

  // Face Adaptation Transforms (Position, Scale & Alignment)
  const [p1Transform, setP1Transform] = useState<FaceTransform>({ zoom: 1.0, panX: 0, panY: 0 });
  const [p2Transform, setP2Transform] = useState<FaceTransform>({ zoom: 1.0, panX: 0, panY: 0 });
  const [seamBlendWidth, setSeamBlendWidth] = useState<number>(26);

  const [showAdjustDrawer, setShowAdjustDrawer] = useState<boolean>(false);
  const [showGuideLines, setShowGuideLines] = useState<boolean>(false);

  const [compositePreviewUrl, setCompositePreviewUrl] = useState<string | null>(null);

  // AI Master Prompt state
  const [copiedStyle, setCopiedStyle] = useState<'cinematic' | 'anime' | null>(null);
  const [selectedAiStyle, setSelectedAiStyle] = useState<'cinematic' | 'anime'>('anime');
  const [showAiPromptCard, setShowAiPromptCard] = useState<boolean>(true);

  const getMasterPrompt = (style: 'cinematic' | 'anime') => {
    const styleInstruction = style === 'cinematic'
      ? 'Style: Ultra-realistic cinematic couple photography, natural skin texture, detailed eyes, soft dramatic lighting, professional editorial portrait, shallow depth of field, warm earthy tones.'
      : 'Style: Highly detailed hand-drawn graphite pencil illustration, romantic anime-inspired couple portrait, realistic facial resemblance to both references, delicate pencil strokes, intricate hair details, expressive eyes, soft cross-hatching, monochrome shading on textured sketchbook paper.';

    return `Transform the two uploaded individual reference images (Image 1 and Image 2) into a single aesthetically composed couple portrait.

Core Instructions:
- Use the two uploaded images as separate identity references.
- Bring both people together naturally, positioning their faces close to each other, either side by side or slightly leaning against one another.

Identity Preservation (Strict):
- Person 1 must retain the exact facial features, face shape, hairstyle, skin tone, and recognizable appearance from Image 1.
- Person 2 must retain the exact facial features, face shape, hairstyle, skin tone, and recognizable appearance from Image 2.
- Do not blend their faces together, do not swap identities, and do not change their defining characteristics.

Composition:
- Create an intimate, close-up portrait of both individuals.
- Their faces should occupy most of the frame.
- Position them naturally, with their heads close together.
- Create a balanced composition with both faces clearly visible.
- Use subtle, natural expressions and aesthetically pleasing poses.

Artistic Direction:
- Create a visually beautiful, professionally composed couple portrait inspired by the uploaded reference style. Maintain realistic facial proportions, natural details, and beautiful lighting.
- The final image should look like a deliberately created couple portrait, NOT two separate images pasted together.
- No borders, no collage, no split screen, no extra people, no text, no watermark.

${styleInstruction}

Output: One cohesive portrait featuring both individuals.`;
  };

  const copyMasterPrompt = (style: 'cinematic' | 'anime') => {
    navigator.clipboard.writeText(getMasterPrompt(style));
    setCopiedStyle(style);
    setTimeout(() => setCopiedStyle(null), 2500);
  };

  const partner1Ref = useRef<HTMLImageElement | null>(null);
  const partner2Ref = useRef<HTMLImageElement | null>(null);

  // Helper to render one partner photo into a full-canvas layer centered at (targetCenterX, targetCenterY)
  const renderPartnerLayer = (
    img: HTMLImageElement,
    canvasW: number,
    canvasH: number,
    targetCenterX: number,
    targetCenterY: number,
    baseZoom: number,
    transform: FaceTransform
  ): HTMLCanvasElement => {
    const layer = document.createElement('canvas');
    layer.width = canvasW;
    layer.height = canvasH;
    const lCtx = layer.getContext('2d');
    if (!lCtx) return layer;

    const zoom = Math.max(0.4, Math.min(3.0, (transform.zoom || 1.0) * baseZoom));
    const normPanX = (transform.panX || 0) / 100;
    const normPanY = (transform.panY || 0) / 100;

    // Default focal anchor is center (50%) and slightly above midline (40% upper third for face)
    const focalX = Math.max(0.05, Math.min(0.95, 0.50 + normPanX));
    const focalY = Math.max(0.05, Math.min(0.95, 0.40 + normPanY));

    // Cover scale factor
    const coverScale = Math.max(canvasW / img.width, canvasH / img.height);
    const effectiveScale = coverScale * zoom;

    const renderedW = img.width * effectiveScale;
    const renderedH = img.height * effectiveScale;

    const drawX = targetCenterX - (focalX * img.width * effectiveScale);
    const drawY = targetCenterY - (focalY * img.height * effectiveScale);

    lCtx.drawImage(img, drawX, drawY, renderedW, renderedH);
    return layer;
  };

  // Core Face Adaptation & Canvas Merging Engine
  const mergeImages = useCallback(
    (
      img1: HTMLImageElement | null,
      img2: HTMLImageElement | null,
      mode: CoupleLayoutMode = layoutMode,
      t1: FaceTransform = p1Transform,
      t2: FaceTransform = p2Transform,
      blend: number = seamBlendWidth
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

      // Fine-art paper background tone
      ctx.fillStyle = '#faf8f5';
      ctx.fillRect(0, 0, w, h);

      if (img1 && img2) {
        if (mode === 'split_face') {
          // =========================================================================
          // --- STYLE A: FUSED MACRO SPLIT-FACE PORTRAIT (References 3 & 4) ---
          // Both faces are scaled so that each head fills the canvas height.
          // Partner 1's nose bridge is at X=400, eye level at Y=430.
          // Partner 2's nose bridge is ALSO at X=400, eye level at Y=430.
          // At X=400, their skin and facial features seamlessly fuse into ONE face.
          // NO dividing line! NO black bar! Zero rectangular borders!
          // =========================================================================
          const baseZoom = 1.62; // Macro face close-up
          const layer1 = renderPartnerLayer(img1, w, h, midX, 430, baseZoom, t1);
          const layer2 = renderPartnerLayer(img2, w, h, midX, 430, baseZoom, t2);

          // 1. Draw Partner 1 (Left Half)
          ctx.drawImage(layer1, 0, 0);

          // 2. Feathered Overlay for Partner 2 (Right Half)
          const seamW = Math.max(10, blend);
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = w;
          maskCanvas.height = h;
          const mCtx = maskCanvas.getContext('2d');
          if (mCtx) {
            mCtx.drawImage(layer2, 0, 0);

            // Apply horizontal alpha gradient across the center seam
            mCtx.globalCompositeOperation = 'destination-in';
            const grad = mCtx.createLinearGradient(midX - seamW / 2, 0, midX + seamW / 2, 0);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,1)');

            mCtx.fillStyle = '#000000';
            mCtx.fillRect(midX + seamW / 2, 0, w - (midX + seamW / 2), h);
            mCtx.fillStyle = grad;
            mCtx.fillRect(midX - seamW / 2, 0, seamW, h);

            ctx.drawImage(maskCanvas, 0, 0);
          }

          // 3. Soft outer perimeter vignette to paper (#faf8f5) - eliminates hard photo crops
          ctx.save();
          const vigGrad = ctx.createRadialGradient(midX, 480, 280, midX, 480, 460);
          vigGrad.addColorStop(0, 'rgba(250, 248, 245, 0)');
          vigGrad.addColorStop(1, 'rgba(250, 248, 245, 0.95)');
          ctx.fillStyle = vigGrad;
          ctx.fillRect(0, 0, w, h);
          ctx.restore();

        } else {
          // =========================================================================
          // --- STYLE B: DUAL SIDE-BY-SIDE COMPANIONS (References 1 & 2) ---
          // Both people share the canvas space.
          // Partner 1 centered around X=285, Partner 2 centered around X=515.
          // In the center (X=340..460), their bodies/shoulders meet and touch organically
          // with a smooth 120px blend.
          // NO rectangular clipping boxes! NO vertical divider bar!
          // Outer margins softly fade into paper tone.
          // =========================================================================
          const baseZoom = 1.06;
          const p1CenterX = 285;
          const p2CenterX = 515;
          const centerFaceY = 450;

          const layer1 = renderPartnerLayer(img1, w, h, p1CenterX, centerFaceY, baseZoom, t1);
          const layer2 = renderPartnerLayer(img2, w, h, p2CenterX, centerFaceY, baseZoom, t2);

          // 1. Draw Partner 1 (Left Companion)
          ctx.drawImage(layer1, 0, 0);

          // 2. Soft Organic Shoulder Cross-Fade for Partner 2 (Right Companion)
          const overlapW = Math.max(60, blend * 2.5); // Wide, gentle body transition
          const blendStart = midX - overlapW / 2;
          const blendEnd = midX + overlapW / 2;

          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = w;
          maskCanvas.height = h;
          const mCtx = maskCanvas.getContext('2d');
          if (mCtx) {
            mCtx.drawImage(layer2, 0, 0);

            mCtx.globalCompositeOperation = 'destination-in';
            const grad = mCtx.createLinearGradient(blendStart, 0, blendEnd, 0);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,1)');

            mCtx.fillStyle = '#000000';
            mCtx.fillRect(blendEnd, 0, w - blendEnd, h);
            mCtx.fillStyle = grad;
            mCtx.fillRect(blendStart, 0, overlapW, h);

            ctx.drawImage(maskCanvas, 0, 0);
          }

          // 3. Soft Fine-Art Paper Vignette on Outer Borders (Top, Bottom, Left, Right)
          // This completely prevents rectangular box edges from being detected as borders!
          ctx.save();
          // Left feather
          const lGrad = ctx.createLinearGradient(0, 0, 45, 0);
          lGrad.addColorStop(0, '#faf8f5');
          lGrad.addColorStop(1, 'rgba(250, 248, 245, 0)');
          ctx.fillStyle = lGrad;
          ctx.fillRect(0, 0, 45, h);

          // Right feather
          const rGrad = ctx.createLinearGradient(w - 45, 0, w, 0);
          rGrad.addColorStop(0, 'rgba(250, 248, 245, 0)');
          rGrad.addColorStop(1, '#faf8f5');
          ctx.fillStyle = rGrad;
          ctx.fillRect(w - 45, 0, 45, h);

          // Top feather
          const tGrad = ctx.createLinearGradient(0, 0, 0, 50);
          tGrad.addColorStop(0, '#faf8f5');
          tGrad.addColorStop(1, 'rgba(250, 248, 245, 0)');
          ctx.fillStyle = tGrad;
          ctx.fillRect(0, 0, w, 50);

          // Bottom feather
          const bGrad = ctx.createLinearGradient(0, h - 70, 0, h);
          bGrad.addColorStop(0, 'rgba(250, 248, 245, 0)');
          bGrad.addColorStop(1, '#faf8f5');
          ctx.fillStyle = bGrad;
          ctx.fillRect(0, h - 70, w, 70);
          ctx.restore();
        }
      } else {
        // Fallback for single image
        const single = img1 || img2!;
        const singleLayer = renderPartnerLayer(single, w, h, midX, 440, 1.15, t1);
        ctx.drawImage(singleLayer, 0, 0);
      }

      const compositeDataUrl = canvas.toDataURL('image/png', 0.95);
      setCompositePreviewUrl(compositeDataUrl);

      const compositeImg = new Image();
      compositeImg.onload = () => {
        onImageLoaded(compositeImg, compositeDataUrl);
      };
      compositeImg.src = compositeDataUrl;
    },
    [layoutMode, p1Transform, p2Transform, seamBlendWidth, onImageLoaded]
  );

  // Auto-align faces (intelligent default for split face or side-by-side)
  const handleAutoAlign = () => {
    let t1: FaceTransform;
    let t2: FaceTransform;
    let blend: number;

    if (layoutMode === 'split_face') {
      t1 = { zoom: 1.0, panX: 0, panY: 0 };
      t2 = { zoom: 1.0, panX: 0, panY: 0 };
      blend = 26;
    } else {
      t1 = { zoom: 1.04, panX: 2, panY: -2 };
      t2 = { zoom: 1.02, panX: -2, panY: 2 };
      blend = 120;
    }

    setP1Transform(t1);
    setP2Transform(t2);
    setSeamBlendWidth(blend);

    if (partner1Ref.current && partner2Ref.current) {
      mergeImages(partner1Ref.current, partner2Ref.current, layoutMode, t1, t2, blend);
    }
  };

  // Switch composition mode
  const handleLayoutChange = (mode: CoupleLayoutMode) => {
    setLayoutMode(mode);
    const t1 = mode === 'split_face'
      ? { zoom: 1.0, panX: 0, panY: 0 }
      : { zoom: 1.04, panX: 2, panY: -2 };
    const t2 = mode === 'split_face'
      ? { zoom: 1.0, panX: 0, panY: 0 }
      : { zoom: 1.02, panX: -2, panY: 2 };
    const blend = mode === 'split_face' ? 26 : 120;

    setP1Transform(t1);
    setP2Transform(t2);
    setSeamBlendWidth(blend);

    if (partner1Ref.current && partner2Ref.current) {
      mergeImages(partner1Ref.current, partner2Ref.current, mode, t1, t2, blend);
    }
  };

  // Load a reference preset style
  const loadPreset = (preset: (typeof PRESETS)[0]) => {
    setActivePresetId(preset.id);
    setLayoutMode(preset.layout);

    setP1Transform(preset.p1);
    setP2Transform(preset.p2);
    setSeamBlendWidth(preset.seam);

    // If user already has photos uploaded, adapt THEIR photos using this preset's exact style!
    if (partner1Ref.current && partner2Ref.current) {
      mergeImages(partner1Ref.current, partner2Ref.current, preset.layout, preset.p1, preset.p2, preset.seam);
      if (onPartnerNamesSuggested) {
        onPartnerNamesSuggested(preset.suggestedNames);
      }
      return;
    }

    // Otherwise load the demo artwork
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

  // Update Partner 1 Transform live
  const updateP1 = (changes: Partial<FaceTransform>) => {
    const updated = { ...p1Transform, ...changes };
    setP1Transform(updated);
    if (partner1Ref.current && partner2Ref.current) {
      mergeImages(partner1Ref.current, partner2Ref.current, layoutMode, updated, p2Transform, seamBlendWidth);
    }
  };

  // Update Partner 2 Transform live
  const updateP2 = (changes: Partial<FaceTransform>) => {
    const updated = { ...p2Transform, ...changes };
    setP2Transform(updated);
    if (partner1Ref.current && partner2Ref.current) {
      mergeImages(partner1Ref.current, partner2Ref.current, layoutMode, p1Transform, updated, seamBlendWidth);
    }
  };

  // Update Seam Blend width
  const updateSeam = (val: number) => {
    setSeamBlendWidth(val);
    if (partner1Ref.current && partner2Ref.current) {
      mergeImages(partner1Ref.current, partner2Ref.current, layoutMode, p1Transform, p2Transform, val);
    }
  };

  // Download separated partner image
  const downloadSeparated = (which: 'partner1' | 'partner2') => {
    const url = which === 'partner1' ? partner1Url : partner2Url;
    const name = which === 'partner1' ? partner1Name || 'partner-1' : partner2Name || 'partner-2';
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}-separated.png`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Top Banner: Composition Switcher & Auto-Align */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2 rounded-2xl bg-[#080d1e] border border-[#1e2f54]">
        <div className="flex items-center gap-1.5 flex-1">
          <button
            type="button"
            onClick={() => handleLayoutChange('split_face')}
            className={`flex-1 py-1.5 sm:py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              layoutMode === 'split_face'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/25'
                : 'bg-[#0c1429] text-slate-400 hover:text-slate-200 border border-[#202f52]'
            }`}
            title="Fused Split-Face: Centers faces at the nose bridge (References 3 & 4)"
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
            title="Side-by-Side Duo: Both full portraits framed together (References 1 & 2)"
          >
            <Users size={13} />
            <span>Side-by-Side Duo</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleAutoAlign}
            className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Auto-align both faces to optimal eye-line & nose bridge"
          >
            <Wand2 size={13} className="text-amber-400" />
            <span>🪄 Auto-Adapt Faces</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAdjustDrawer(!showAdjustDrawer)}
            className={`py-1.5 px-2.5 rounded-xl text-xs font-medium border transition flex items-center gap-1 cursor-pointer ${
              showAdjustDrawer
                ? 'bg-[#1b2b52] border-cyan-400 text-cyan-300'
                : 'bg-[#0c1429] border-[#243356] text-slate-300 hover:text-white'
            }`}
            title="Toggle Face Position & Alignment Sliders"
          >
            <Sliders size={13} />
            <span className="hidden sm:inline">Adjust</span>
            {showAdjustDrawer ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Expandable Face Fit & Calibration Drawer */}
      {showAdjustDrawer && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#070c1d] border border-cyan-500/30 flex flex-col gap-3.5 animate-in fade-in duration-200 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#1b2b52]">
            <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
              <Sliders size={13} />
              <span>Face Position &amp; Eye-Line Calibration</span>
            </span>
            <button
              type="button"
              onClick={() => setShowGuideLines(!showGuideLines)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                showGuideLines
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-[#0c1429] border-[#243356] text-slate-400 hover:text-white'
              }`}
            >
              <Eye size={12} />
              <span>{showGuideLines ? 'Hide Eye-Line Guide' : 'Show Eye-Line Guide'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
            {/* Partner 1 Adjustment Controls */}
            <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-[#0a1126] border border-[#1e2f54]">
              <span className="text-[11px] font-semibold text-cyan-300">
                Partner 1 (Left Half) Calibration:
              </span>

              {/* Zoom */}
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Face Zoom:</span>
                <span className="text-cyan-400 font-mono">{p1Transform.zoom.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="2.5"
                step="0.05"
                value={p1Transform.zoom}
                onChange={(e) => updateP1({ zoom: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#14203d] rounded-lg"
              />

              {/* Pan X */}
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Horizontal Pan (Nose alignment):</span>
                <span className="text-cyan-400 font-mono">{p1Transform.panX}%</span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                step="1"
                value={p1Transform.panX}
                onChange={(e) => updateP1({ panX: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#14203d] rounded-lg"
              />

              {/* Pan Y */}
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Vertical Pan (Eye-level matching):</span>
                <span className="text-cyan-400 font-mono">{p1Transform.panY}%</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="1"
                value={p1Transform.panY}
                onChange={(e) => updateP1({ panY: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#14203d] rounded-lg"
              />
            </div>

            {/* Partner 2 Adjustment Controls */}
            <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-[#0a1126] border border-[#1e2f54]">
              <span className="text-[11px] font-semibold text-pink-300">
                Partner 2 (Right Half) Calibration:
              </span>

              {/* Zoom */}
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Face Zoom:</span>
                <span className="text-pink-400 font-mono">{p2Transform.zoom.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="2.5"
                step="0.05"
                value={p2Transform.zoom}
                onChange={(e) => updateP2({ zoom: parseFloat(e.target.value) })}
                className="w-full accent-pink-400 cursor-pointer h-1.5 bg-[#14203d] rounded-lg"
              />

              {/* Pan X */}
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Horizontal Pan (Nose alignment):</span>
                <span className="text-pink-400 font-mono">{p2Transform.panX}%</span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                step="1"
                value={p2Transform.panX}
                onChange={(e) => updateP2({ panX: parseInt(e.target.value) })}
                className="w-full accent-pink-400 cursor-pointer h-1.5 bg-[#14203d] rounded-lg"
              />

              {/* Pan Y */}
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Vertical Pan (Eye-level matching):</span>
                <span className="text-pink-400 font-mono">{p2Transform.panY}%</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="1"
                value={p2Transform.panY}
                onChange={(e) => updateP2({ panY: parseInt(e.target.value) })}
                className="w-full accent-pink-400 cursor-pointer h-1.5 bg-[#14203d] rounded-lg"
              />
            </div>
          </div>

          {/* Seam Feathering Slider */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>
                {layoutMode === 'split_face'
                  ? 'Center Seam Feathering (Nose Bridge Blend):'
                  : 'Shoulder Overlap & Soft Blend Width:'}
              </span>
              <span className="text-amber-400 font-mono">{seamBlendWidth}px</span>
            </div>
            <input
              type="range"
              min={layoutMode === 'split_face' ? 8 : 40}
              max={layoutMode === 'split_face' ? 60 : 220}
              step="2"
              value={seamBlendWidth}
              onChange={(e) => updateSeam(parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#14203d] rounded-lg"
            />
          </div>
        </div>
      )}

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

      {/* Composite Split Preview Bar with Eye-Line Alignment Overlay */}
      {compositePreviewUrl && (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#091126] border border-[#1e345e] shadow-inner relative overflow-hidden">
          <div className="relative w-16 h-20 rounded-xl overflow-hidden border border-amber-400/50 shrink-0 shadow-md bg-black">
            <img src={compositePreviewUrl} alt="Composite Preview" className="w-full h-full object-cover" />

            {/* Eye-Line Alignment Crosshair Guide */}
            {showGuideLines && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Horizontal Eye Level Guide */}
                <div className="absolute top-[36%] w-full h-[1px] bg-amber-400/80 border-t border-dashed border-amber-300" />
                {/* Vertical Center Split Axis */}
                <div className="absolute left-1/2 top-0 h-full w-[1px] bg-cyan-400/80" />
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-400" />
                <span>
                  {layoutMode === 'split_face'
                    ? 'Fused Split-Face Adapted'
                    : 'Side-by-Side Companions Adapted'}
                </span>
              </span>
              <button
                type="button"
                onClick={handleAutoAlign}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={11} />
                <span>Reset Align</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug mt-1">
              {layoutMode === 'split_face'
                ? 'Both faces scaled and aligned at the nose bridge. Adjust sliders to match eye level if needed.'
                : 'Unified couple portrait sharing one canvas, touching shoulder-to-shoulder with seamless paper vignette.'}
            </p>
          </div>
        </div>
      )}

      {/* 4 Reference Style Cards */}
      <div className="flex flex-col gap-2 pt-2 border-t border-[#182442]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-300">
            Apply Reference Style or Pick Demo:
          </span>
          <span className="text-[10px] text-slate-500">Adapts your photos to match</span>
        </div>

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

      {/* AI Master Prompt Generator Card */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-gradient-to-br from-[#0b132e] to-[#080d21] border border-cyan-500/30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles size={13} className="text-cyan-400" />
              <span>AI Master Generation Prompt</span>
            </span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono">
              2 Images $\rightarrow$ 1 Portrait
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => copyMasterPrompt(selectedAiStyle)}
              className="py-1 px-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-sm transition"
              title="Copy the master prompt to clipboard"
            >
              {copiedStyle === selectedAiStyle ? (
                <>
                  <Check size={12} className="text-emerald-300" />
                  <span className="text-emerald-200">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowAiPromptCard(!showAiPromptCard)}
              className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
            >
              {showAiPromptCard ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>

        {showAiPromptCard && (
          <div className="flex flex-col gap-2 pt-1 animate-in fade-in duration-150">
            {/* Style Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#060a1a] border border-[#1b2b52]">
              <button
                type="button"
                onClick={() => setSelectedAiStyle('anime')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedAiStyle === 'anime'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>✏️ Anime Pencil Sketch</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedAiStyle('cinematic')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedAiStyle === 'cinematic'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📷 Cinematic Realistic</span>
              </button>
            </div>

            {/* Active Style Instruction preview */}
            <div className="p-2 rounded-xl bg-[#050816] border border-[#182647] font-mono text-[10px] leading-relaxed text-slate-300">
              <span className="text-cyan-400 font-bold block mb-1">
                {selectedAiStyle === 'anime'
                  ? '🎨 Style Option 2 (Hand-drawn Anime Pencil Sketch):'
                  : '📸 Style Option 1 (Cinematic Realistic Portrait):'}
              </span>
              <p className="text-slate-300">
                {selectedAiStyle === 'anime'
                  ? 'Style: Highly detailed hand-drawn graphite pencil illustration, romantic anime-inspired couple portrait, realistic facial resemblance to both references, delicate pencil strokes, intricate hair details, expressive eyes, soft cross-hatching, monochrome shading on textured sketchbook paper.'
                  : 'Style: Ultra-realistic cinematic couple photography, natural skin texture, detailed eyes, soft dramatic lighting, professional editorial portrait, shallow depth of field, warm earthy tones.'}
              </p>
            </div>

            <p className="text-[10px] text-slate-400 leading-snug">
              💡 <span className="text-slate-300 font-semibold">Workflow Tip:</span> Attach your 2 uploaded photos as <span className="text-cyan-300">Image 1</span> and <span className="text-pink-300">Image 2</span> in Midjourney, FLUX, ChatGPT/DALL-E 3, or Gemini, then paste this prompt. It ensures strict identity preservation with your chosen aesthetic.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}