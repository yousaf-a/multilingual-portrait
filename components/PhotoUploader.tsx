'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';

interface PhotoUploaderProps {
  onImageLoaded: (img: HTMLImageElement | null, dataUrl: string | null) => void;
}

export default function PhotoUploader({ onImageLoaded }: PhotoUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>('/person-preview.jpg');
  const [fileName, setFileName] = useState<string>('No file chosen');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load default sample portrait on mount so the UI matches the reference screenshot
  useEffect(() => {
    const defaultSrc = '/person-preview.jpg';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      onImageLoaded(img, defaultSrc);
      setPreviewUrl(defaultSrc);
      setFileName('No file chosen');
    };
    img.src = defaultSrc;
  }, [onImageLoaded]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setFileName(file.name);

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

  return (
    <div className="grid grid-cols-2 gap-4 w-full items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) processFile(e.target.files[0]);
        }}
      />

      {/* Left Box: Upload Cloud & Choose File Button */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[#243356] hover:border-[#3b82f6] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-[#091024]/60 hover:bg-[#0c1630] group aspect-[4/3]"
      >
        <Upload size={22} className="text-white/80 group-hover:scale-110 group-hover:text-cyan-400 transition mb-2" />
        
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="bg-[#1a68f7] hover:bg-[#2575fc] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(26,104,247,0.45)] transition transform group-hover:scale-105"
        >
          Choose File
        </button>

        <p className="text-[11px] text-slate-400 mt-2">or drag & drop photo</p>
      </div>

      {/* Right Box: Thumbnail & Label */}
      <div className="flex flex-col items-center justify-center p-2">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[#2b3a63] bg-[#0c1429] shadow-md shadow-black/40">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Portrait Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
              No Image
            </div>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-2 text-center truncate max-w-[120px]">
          {fileName}
        </p>
      </div>
    </div>
  );
}
