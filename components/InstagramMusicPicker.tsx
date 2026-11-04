'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Play,
  Pause,
  Check,
  Music2,
  Upload,
  VolumeX,
  Sparkles,
  Flame,
  Heart,
  Headphones,
  Sliders
} from 'lucide-react';
import {
  INSTAGRAM_MUSIC_TRACKS,
  MUSIC_CATEGORIES,
  MusicTrackItem
} from '@/lib/musicTracks';
import { audioController } from '@/lib/audio';

interface InstagramMusicPickerProps {
  selectedTrackId: string;
  customAudioUrl: string | null;
  customAudioName: string | null;
  onSelectTrack: (track: MusicTrackItem) => void;
  onSelectNone: () => void;
  onUploadCustom: (file: File) => void;
}

export default function InstagramMusicPicker({
  selectedTrackId,
  customAudioUrl,
  customAudioName,
  onSelectTrack,
  onSelectNone,
  onUploadCustom
}: InstagramMusicPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    return INSTAGRAM_MUSIC_TRACKS.filter((track) => {
      const matchesSearch =
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (track.tag && track.tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' || track.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Current active track info
  const activeTrack = useMemo(() => {
    return INSTAGRAM_MUSIC_TRACKS.find((t) => t.id === selectedTrackId);
  }, [selectedTrackId]);

  // Toggle live preview of song
  const handleTogglePreview = (e: React.MouseEvent, track: MusicTrackItem) => {
    e.stopPropagation();

    if (previewingTrackId === track.id) {
      audioController.stopPreview();
      setPreviewingTrackId(null);
    } else {
      audioController.stopPreview();
      setPreviewingTrackId(track.id);
      audioController.start(track.style);
    }
  };

  const handleSelect = (track: MusicTrackItem) => {
    // If previewing another song, stop preview
    if (previewingTrackId && previewingTrackId !== track.id) {
      audioController.stopPreview();
      setPreviewingTrackId(null);
    }
    onSelectTrack(track);
  };

  const handleSelectNoAudio = () => {
    if (previewingTrackId) {
      audioController.stopPreview();
      setPreviewingTrackId(null);
    }
    onSelectNone();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      if (previewingTrackId) {
        audioController.stopPreview();
        setPreviewingTrackId(null);
      }
      onUploadCustom(file);
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col w-full bg-[#080e22] border border-[#203058] rounded-2xl overflow-hidden shadow-2xl">
      {/* Instagram Story Style Header */}
      <div className="p-3.5 pb-2.5 border-b border-[#182548] bg-gradient-to-r from-[#0c1635] via-[#091128] to-[#0c1635]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-pink-500/25">
              <Music2 size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Story Music Library</span>
                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                  {INSTAGRAM_MUSIC_TRACKS.length} Trending Songs
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Choose a viral love song or ambient soundtrack for your calligraphy video
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs, artists (e.g. Stephen Sanchez, Golden Hour, Ed Sheeran)..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#050a18] border border-[#243763] focus:border-cyan-400 focus:outline-none text-xs text-white placeholder:text-slate-500 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {MUSIC_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-[#0f1b3d] text-slate-400 hover:text-white hover:bg-[#162758] border border-[#1e305e]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Songs Scrollable List */}
      <div className="divide-y divide-[#131f40] max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#243763] scrollbar-track-transparent">
        {filteredTracks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No matching songs found for &ldquo;{searchQuery}&rdquo;. Try another search or upload a custom MP3!
          </div>
        ) : (
          filteredTracks.map((track) => {
            const isSelected = selectedTrackId === track.id && !customAudioUrl;
            const isPreviewing = previewingTrackId === track.id;

            return (
              <div
                key={track.id}
                onClick={() => handleSelect(track)}
                className={`p-2.5 px-3.5 flex items-center justify-between cursor-pointer transition group ${
                  isSelected
                    ? 'bg-[#12224d] border-l-4 border-l-cyan-400'
                    : 'hover:bg-[#0c1633]'
                }`}
              >
                {/* Left: Album Art & Play Button & Title */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Square Album Art Thumbnail */}
                  <div className="relative group/play shrink-0">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${track.gradient} flex items-center justify-center text-lg shadow-md select-none`}
                    >
                      <span>{track.emoji}</span>
                    </div>

                    {/* Preview Play/Pause Button Overlay */}
                    <button
                      type="button"
                      onClick={(e) => handleTogglePreview(e, track)}
                      title={isPreviewing ? 'Pause preview' : 'Listen preview'}
                      className={`absolute inset-0 rounded-xl flex items-center justify-center transition backdrop-blur-[2px] ${
                        isPreviewing
                          ? 'bg-black/60 opacity-100'
                          : 'bg-black/35 opacity-0 group-hover:opacity-100 group-hover/play:opacity-100'
                      }`}
                    >
                      {isPreviewing ? (
                        <div className="flex items-center gap-0.5 text-cyan-300">
                          <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
                        </div>
                      ) : (
                        <Play size={16} className="text-white fill-white ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Song & Artist Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-white truncate max-w-[190px] sm:max-w-[280px]">
                        {track.title}
                      </span>
                      {track.tag && (
                        <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-[#1b2b54] text-cyan-300 border border-cyan-500/20 shrink-0">
                          {track.tag}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                      {track.artist}
                    </span>
                  </div>
                </div>

                {/* Right: Duration & Selection Checkmark */}
                <div className="flex items-center gap-2.5 shrink-0 pl-2">
                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                    {track.duration}
                  </span>

                  {isSelected ? (
                    <span className="w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.6)]">
                      <Check size={13} strokeWidth={3} />
                    </span>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-[#2b3c69] group-hover:border-slate-400 transition flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-slate-500/30 transition"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Bar: Current Selection & Custom Audio / Mute */}
      <div className="p-3 bg-[#060b1b] border-t border-[#182548] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Active Selection Indicator */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0"></div>
          <span className="text-[11px] text-slate-300 truncate">
            {customAudioUrl ? (
              <>
                <strong className="text-white">Custom MP3:</strong> {customAudioName || 'Uploaded Track'}
              </>
            ) : selectedTrackId === 'none' ? (
              <span className="text-slate-400">🔇 Video will play muted (No Audio)</span>
            ) : activeTrack ? (
              <>
                <strong className="text-white">{activeTrack.title}</strong> &bull; {activeTrack.artist}
              </>
            ) : (
              'Romantic Piano Chords'
            )}
          </span>
        </div>

        {/* Action Buttons: Custom MP3 & Mute */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-0 border-[#141e3d]">
          {/* Upload Custom MP3 Button */}
          <label
            htmlFor="instagram-audio-upload"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f1a3a] hover:bg-[#182855] text-slate-300 hover:text-white text-[11px] font-medium border border-[#233566] transition cursor-pointer"
          >
            <Upload size={12} className="text-cyan-400" />
            <span>Upload MP3</span>
          </label>
          <input
            id="instagram-audio-upload"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {/* Mute Button */}
          <button
            type="button"
            onClick={handleSelectNoAudio}
            className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-medium border transition ${
              selectedTrackId === 'none' && !customAudioUrl
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                : 'bg-[#0f1a3a] hover:bg-[#182855] border-[#233566] text-slate-400 hover:text-white'
            }`}
          >
            <VolumeX size={12} />
            <span>{selectedTrackId === 'none' && !customAudioUrl ? 'Muted' : 'Mute'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

