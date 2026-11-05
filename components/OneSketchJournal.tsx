'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  getStoredJournalEntries,
  saveJournalEntry,
  calculateJournalStreak,
  DailyJournalEntry
} from '@/lib/dailyUtilities';
import {
  Calendar,
  Sparkles,
  Upload,
  Download,
  Flame,
  Camera,
  Heart,
  Plus,
  BookOpen,
  Check
} from 'lucide-react';

export default function OneSketchJournal() {
  const [entries, setEntries] = useState<DailyJournalEntry[]>([]);
  const [todayPhoto, setTodayPhoto] = useState<HTMLImageElement | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedMood, setSelectedMood] = useState<{ emoji: string; text: string }>({ emoji: '☕', text: 'Cozy Morning' });
  const [activeTab, setActiveTab] = useState<'create' | 'gallery'>('create');
  const [isSavedToday, setIsSavedToday] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const MOODS = [
    { emoji: '☀️', text: 'Sunny Energy' },
    { emoji: '☕', text: 'Cozy Morning' },
    { emoji: '🌿', text: 'Peaceful Walk' },
    { emoji: '🌧️', text: 'Rainy Thoughts' },
    { emoji: '✨', text: 'Magic Moment' },
    { emoji: '🌙', text: 'Quiet Night' }
  ];

  // Load entries on mount
  useEffect(() => {
    const list = getStoredJournalEntries();
    setEntries(list);

    const todayStr = new Date().toISOString().split('T')[0];
    const exists = list.some((e) => e.dateStr === todayStr);
    setIsSavedToday(exists);
  }, []);

  const streak = calculateJournalStreak(entries);

  // Handle upload
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => setTodayPhoto(img);
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Render Fine-Art Sketch Polaroid
  const renderPolaroid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 960;
    canvas.width = width;
    canvas.height = height;

    // 1. Archival Cream Fabriano Paper Background
    ctx.fillStyle = '#f8f4ec';
    ctx.fillRect(0, 0, width, height);

    // Subtle paper noise / vignette
    const vig = ctx.createRadialGradient(width / 2, height / 2, width * 0.35, width / 2, height / 2, width * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(180, 160, 130, 0.4)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);

    // Deckled double border
    ctx.strokeStyle = '#b89d75';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(30, 30, width - 60, height - 60);
    ctx.setLineDash([3, 4]);
    ctx.strokeRect(36, 36, width - 72, height - 72);
    ctx.setLineDash([]);

    // 2. Photo Area (Polaroid Frame)
    const photoX = 65;
    const photoY = 65;
    const photoW = width - 130;
    const photoH = height * 0.65;

    // Photo background placeholder
    ctx.fillStyle = '#e8ded0';
    ctx.fillRect(photoX, photoY, photoW, photoH);

    if (todayPhoto) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(photoX, photoY, photoW, photoH);
      ctx.clip();

      // Cover scaling
      const aspect = todayPhoto.width / todayPhoto.height;
      let drawW = photoW;
      let drawH = photoW / aspect;
      if (drawH < photoH) {
        drawH = photoH;
        drawW = photoH * aspect;
      }
      const dx = photoX + (photoW - drawW) / 2;
      const dy = photoY + (photoH - drawH) / 2;

      ctx.drawImage(todayPhoto, dx, dy, drawW, drawH);

      // Fine-Art Graphite Pencil sketch filter overlay
      ctx.globalCompositeOperation = 'luminosity';
      ctx.fillStyle = 'rgba(40, 35, 30, 0.2)';
      ctx.fillRect(photoX, photoY, photoW, photoH);

      ctx.restore();
    } else {
      // Empty placeholder prompt
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'italic 20px Georgia, serif';
      ctx.fillStyle = '#8c7b64';
      ctx.fillText('Upload Today’s Memory Photo to Sketch', width / 2, photoY + photoH / 2);
      ctx.restore();
    }

    // Photo border
    ctx.strokeStyle = '#a68a62';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    // 3. Date & Mood Stamp
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase();

    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = '600 15px Georgia, serif';
    ctx.fillStyle = '#2d1b10';
    ctx.letterSpacing = '1.5px';
    ctx.fillText(dateFormatted, 65, photoY + photoH + 45);

    // Mood Badge
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#92400e';
    ctx.fillText(`${selectedMood.emoji}  ${selectedMood.text.toUpperCase()}`, 65, photoY + photoH + 72);
    ctx.restore();

    // 4. Handwritten Cursive Caption
    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = 'italic 24px Georgia, "Times New Roman", serif';
    ctx.fillStyle = '#1c1917';
    const noteText = caption.trim() ? `“${caption}”` : '“A quiet, beautiful moment etched in ink.”';
    ctx.fillText(noteText, 65, photoY + photoH + 120);

    // Studio Sign-off at bottom right
    ctx.textAlign = 'right';
    ctx.font = 'italic 12px Georgia, serif';
    ctx.fillStyle = '#a89078';
    ctx.fillText('ONE SKETCH A DAY • NO. ' + (entries.length + 1), width - 65, height - 50);
    ctx.restore();
  }, [todayPhoto, selectedMood, caption, entries.length]);

  useEffect(() => {
    renderPolaroid();
  }, [renderPolaroid]);

  const handleSaveEntry = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const todayStr = new Date().toISOString().split('T')[0];

    const newEntry: DailyJournalEntry = {
      id: `entry_${Date.now()}`,
      dateStr: todayStr,
      caption: caption || 'A beautiful day etched into memory.',
      moodEmoji: selectedMood.emoji,
      moodText: selectedMood.text,
      imageThumbnail: dataUrl,
      createdAt: Date.now()
    };

    const updated = saveJournalEntry(newEntry);
    setEntries(updated);
    setIsSavedToday(true);
    alert('Entry saved to your 365 Days Sketchbook! 🔥');
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `sketch-journal-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-5 my-6">
      {/* Top Banner: Streak Counter & Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-[#0b1226]/90 border border-[#1e2a4a] shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 flex items-center justify-center font-extrabold text-lg shadow-[0_0_15px_rgba(251,146,60,0.5)]">
            <Flame size={20} className="fill-slate-950" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>One Sketch a Day Journal</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 font-semibold">
                🔥 {streak} Day Streak
              </span>
            </div>
            <p className="text-xs text-slate-400">Capture 1 photo daily. Build a 365-day fine-art sketchbook of your life.</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-[#080d1e] p-1 rounded-2xl border border-[#1e2f54]">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus size={13} />
            <span>Today&apos;s Entry</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>My Sketchbook ({entries.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: CREATE TODAY'S SKETCH POLAROID */}
      {activeTab === 'create' && (
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Left Form */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            {/* Upload Box */}
            <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl backdrop-blur-md">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Camera size={16} className="text-cyan-400" />
                <span>Upload Today&apos;s Snapshot</span>
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Your morning coffee, a sunset walk, selfie, pet, meal, or inspiring moment:
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-[#243356] hover:border-cyan-400 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-white bg-[#080d1e] transition cursor-pointer"
              >
                <Upload size={20} className="text-cyan-400" />
                <span className="text-xs font-medium">
                  {todayPhoto ? 'Replace Photo' : 'Select Today’s Photo from Phone / PC'}
                </span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Mood & Caption */}
            <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl backdrop-blur-md">
              <label className="text-xs text-slate-300 font-medium mb-2 block">Today&apos;s Mood &amp; Weather Tag</label>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {MOODS.map((m) => (
                  <button
                    key={m.text}
                    type="button"
                    onClick={() => setSelectedMood(m)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                      selectedMood.text === m.text
                        ? 'bg-amber-400 text-slate-900 font-bold shadow-sm'
                        : 'bg-[#0f1b38] text-slate-300 hover:text-white border border-[#22335c]'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.text}</span>
                  </button>
                ))}
              </div>

              <label className="text-xs text-slate-300 font-medium mb-1 block">One-Sentence Daily Memory</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Best matcha latte with Lucas in Montmartre..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d1e] border border-[#243356] text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveEntry}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <Check size={15} />
                <span>{isSavedToday ? 'Update Today’s Streak Entry' : 'Log & Save to My Sketchbook'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="py-3 px-4 rounded-2xl bg-[#1e293b] hover:bg-[#334155] text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-[#334155] transition cursor-pointer"
              >
                <Download size={15} />
                <span>Download Card</span>
              </button>
            </div>
          </div>

          {/* Right Preview */}
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <div className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              <span>Dated Museum Polaroid Card Preview</span>
            </div>

            <div className="w-full max-w-[340px] rounded-3xl overflow-hidden shadow-2xl border border-[#334155] bg-[#0b1226]/90 p-2">
              <canvas
                ref={canvasRef}
                className="w-full aspect-[4/5] rounded-2xl object-cover shadow-inner"
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FLIPBOOK GALLERY OF PAST DAYS */}
      {activeTab === 'gallery' && (
        <div className="bg-[#0b1226]/90 border border-[#1e2a4a] rounded-3xl p-5 shadow-xl backdrop-blur-md">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-amber-400" />
            <span>Your Daily Sketchbook Archive ({entries.length} Entries)</span>
          </h3>

          {entries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <p>No journal entries yet. Log today’s memory to start your 365-day streak!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {entries.map((ent) => (
                <div
                  key={ent.id}
                  className="rounded-2xl overflow-hidden border border-[#22335c] bg-[#080d1e] p-2 flex flex-col shadow-md hover:border-amber-400 transition"
                >
                  <img
                    src={ent.imageThumbnail}
                    alt={ent.caption}
                    className="w-full aspect-[4/5] object-cover rounded-xl mb-2"
                  />
                  <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold mb-0.5">
                    <span>{ent.dateStr}</span>
                    <span>{ent.moodEmoji}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2 italic">&ldquo;{ent.caption}&rdquo;</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

