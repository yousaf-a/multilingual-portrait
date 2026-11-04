'use client';

import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface PhotoUploaderProps {
  onImageLoaded: (img: HTMLImageElement | null, dataUrl: string | null) => void;
}

export default function PhotoUploader({ onImageLoaded }: PhotoUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        onImageLoaded(img, result);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    onImageLoaded(null, null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadSample = (sampleUrl: string) => {
    setPreviewUrl(sampleUrl);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      onImageLoaded(img, sampleUrl);
    };
    img.src = sampleUrl;
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) processFile(e.target.files[0]);
        }}
      />

      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black/40 p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={previewUrl}
              alt="Uploaded Preview"
              className="w-14 h-14 rounded-xl object-cover border border-white/20"
            />
            <div>
              <p className="text-sm font-medium text-white">Photo loaded</p>
              <p className="text-xs text-white/50">Ready for portrait effect</p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition"
            title="Remove photo"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/20 hover:border-pink-500/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-white/[0.02] hover:bg-white/[0.05] group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition mb-3">
            <Upload size={22} />
          </div>
          <p className="text-sm font-medium text-white">Click or drag & drop photo</p>
          <p className="text-xs text-white/50 mt-1">Supports PNG, JPG, WebP</p>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-white/40">Or test sample:</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                loadSample('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop');
              }}
              className="text-xs px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white/80 transition"
            >
              Portrait 1
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                loadSample('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop');
              }}
              className="text-xs px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white/80 transition"
            >
              Portrait 2
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
