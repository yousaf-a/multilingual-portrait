'use client';

import React, { useState } from 'react';
import { Gift, Copy, Check, ExternalLink, Send, X, Heart } from 'lucide-react';

interface ShareGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  toName: string;
  message: string;
  themeStyle: string;
  musicTrack: string;
  photoImage: HTMLImageElement | null;
}

export default function ShareGiftModal({
  isOpen,
  onClose,
  toName,
  message,
  themeStyle,
  musicTrack,
  photoImage
}: ShareGiftModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build the gift URL
  const recipient = encodeURIComponent(toName || 'You');
  const msg = encodeURIComponent(message || 'Love You');
  const theme = encodeURIComponent(themeStyle || 'emerald');
  const music = encodeURIComponent(musicTrack || 'piano');

  let imageParam = 'sudhin';
  let hashFragment = '';

  if (photoImage) {
    // If it's a known sample image
    const src = photoImage.src;
    if (src.includes('sample-teacup')) imageParam = 'teacup';
    else if (src.includes('person-preview')) imageParam = 'portrait';
    else if (src.includes('sample-scribble') || src.includes('sample-target-art')) imageParam = 'sudhin';
    else if (src.startsWith('data:image')) {
      // Custom uploaded user image: compress to compact webp/jpeg and put in URL hash
      try {
        const thumbCanvas = document.createElement('canvas');
        const maxDim = 240;
        let tw = photoImage.width;
        let th = photoImage.height;
        if (tw > th) {
          if (tw > maxDim) {
            th = Math.round((th * maxDim) / tw);
            tw = maxDim;
          }
        } else {
          if (th > maxDim) {
            tw = Math.round((tw * maxDim) / th);
            th = maxDim;
          }
        }
        thumbCanvas.width = tw;
        thumbCanvas.height = th;
        const tCtx = thumbCanvas.getContext('2d');
        if (tCtx) {
          tCtx.drawImage(photoImage, 0, 0, tw, th);
          const compressed = thumbCanvas.toDataURL('image/jpeg', 0.62);
          hashFragment = `#img=${encodeURIComponent(compressed)}`;
        }
      } catch (_) {}
    }
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const giftUrl = `${baseUrl}/gift?to=${recipient}&msg=${msg}&theme=${theme}&music=${music}&img=${imageParam}${hashFragment}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(giftUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const whatsappText = encodeURIComponent(
    `Hey ${toName || 'there'}! ❤️ I made a special surprise hand-sketched artwork with music for you! Open your gift here:\n${giftUrl}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0c1429] border border-[#243356] rounded-3xl p-6 shadow-2xl shadow-pink-500/10 text-white">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
            <Gift size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Share Surprise Gift Link 🎁</h3>
            <p className="text-xs text-slate-400">
              Anyone with this link will see a magical unboxing &amp; live animated reveal
            </p>
          </div>
        </div>

        {/* Preview of what recipient sees */}
        <div className="bg-[#070b16] border border-[#1b2746] rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between text-xs text-pink-400 font-semibold mb-1">
            <span>RECIPIENT PREVIEW</span>
            <span>Unwraps in Browser 💌</span>
          </div>
          <p className="text-sm font-medium text-white">
            &ldquo;A personal animated gift for <span className="text-pink-300 font-bold">{toName || 'You'}</span>&rdquo;
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Plays background music automatically upon opening and hand-sketches the portrait line-by-line.
          </p>
        </div>

        {/* Link Input Box */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
            Gift Link (No login required)
          </label>
          <div className="flex items-center gap-2 bg-[#060a14] border border-[#1e2a4a] rounded-2xl p-2 pl-3">
            <input
              type="text"
              readOnly
              value={giftUrl}
              className="bg-transparent text-xs text-cyan-300 flex-1 outline-none truncate select-all font-mono"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 text-white'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
          >
            <Send size={14} />
            <span>Send on WhatsApp</span>
          </a>

          <a
            href={giftUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#14203e] hover:bg-[#1a2b54] border border-[#2b3c66] text-white text-xs font-bold transition"
          >
            <ExternalLink size={14} />
            <span>Test Gift Link</span>
          </a>
        </div>
      </div>
    </div>
  );
}

