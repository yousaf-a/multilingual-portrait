'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface PhotoUploaderProps {
  onImageLoaded: (img: HTMLImageElement | null, dataUrl: string | null) => void;
}

export default function PhotoUploader({ onImageLoaded }: PhotoUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const loadSample = (src: string, name: string) => {
    setFileName(name);
    setPreviewUrl(src);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      onImageLoaded(img, src);
    };
    img.src = src;
  };

  const processFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;
      setPreviewUrl(result);

      const img = new Image();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full items-center">
        {/* Hidden file input */}
        <input
          id="photo-file-input"
          type="file"
          accept="image/png, image/jpeg, image/webp, image/gif, image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Left Box: Choose File / Drop Zone */}
        <label
          htmlFor="photo-file-input"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#243356] hover:border-[#3b82f6] rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center cursor-pointer transition bg-[#091024]/60 hover:bg-[#0c1630] group select-none min-h-[110px]"
        >
          <Upload size={22} className="text-white/80 group-hover:scale-110 group-hover:text-cyan-400 transition mb-2 pointer-events-none" />
          
          <span className="bg-[#1a68f7] group-hover:bg-[#2575fc] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(26,104,247,0.45)] transition transform group-hover:scale-105 pointer-events-none">
            Choose Photo
          </span>

          <p className="text-[11px] text-slate-400 mt-2 pointer-events-none">or tap to select / take photo</p>
        </label>

        {/* Right Box: Thumbnail & Status */}
        <div className="flex flex-row sm:flex-col items-center justify-center gap-3 p-3 sm:p-2 rounded-2xl bg-[#070d1e] sm:bg-transparent border border-[#1b2746] sm:border-0">
          <label
            htmlFor="photo-file-input"
            className="relative rounded-2xl overflow-hidden border border-[#2b3a63] bg-[#0c1429] shadow-md shadow-black/40 flex items-center justify-center cursor-pointer hover:border-cyan-400/60 transition group shrink-0"
            style={{ width: '74px', height: '74px' }}
            title="Click to change image"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Image Preview"
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#0a1022' }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-[10px] p-1 text-center">
                <ImageIcon size={20} className="mb-1 text-slate-600" />
                <span>No image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-medium transition backdrop-blur-[1px]">
              {previewUrl ? 'Change' : 'Select'}
            </div>
          </label>
          <div className="flex flex-col items-start sm:items-center text-left sm:text-center min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {previewUrl ? 'Selected Image' : 'Status'}
            </span>
            <p className="text-xs text-slate-300 font-medium truncate max-w-full">
              {fileName || 'No file selected yet'}
            </p>
            {previewUrl && (
              <label
                htmlFor="photo-file-input"
                className="text-[11px] text-cyan-400 hover:underline mt-0.5 cursor-pointer"
              >
                Tap to change photo
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Preset sample buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 pt-2 border-t border-[#182442] flex-wrap">
        <span className="text-[11px] text-slate-400 w-full sm:w-auto">Sample art:</span>
        <button
          type="button"
          onClick={() => loadSample('/sample-target-art.png', 'Goddess Target Sketch')}
          className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0e172e] hover:bg-[#152347] text-rose-300 border border-[#243356] transition"
        >
          👑 Target Art Reference
        </button>
        <button
          type="button"
          onClick={() => loadSample('/sample-scribble.jpg', 'Sudhin Scribble Reference')}
          className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0e172e] hover:bg-[#152347] text-amber-300 border border-[#243356] transition"
        >
          ✍️ Scribble Art Reference
        </button>
      </div>
    </div>
  );
}
