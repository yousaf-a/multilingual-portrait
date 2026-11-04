export interface MusicTrackItem {
  id: string;
  title: string;
  artist: string;
  category: 'trending' | 'romance' | 'chill' | 'cinematic' | 'acoustic';
  style: 'romantic_piano' | 'acoustic_guitar' | 'lofi_cafe' | 'rain_ambient' | 'cinematic_strings' | 'dreamy_synth';
  duration: string;
  gradient: string;
  emoji: string;
  tag?: string;
}

export const MUSIC_CATEGORIES = [
  { id: 'all', label: 'All Songs' },
  { id: 'trending', label: '🔥 Trending Reels' },
  { id: 'romance', label: '❤️ Love & Romance' },
  { id: 'chill', label: '✨ Aesthetic Chill' },
  { id: 'acoustic', label: '🎸 Acoustic & Warm' },
  { id: 'cinematic', label: '🎻 Cinematic & Rain' }
];

export const INSTAGRAM_MUSIC_TRACKS: MusicTrackItem[] = [
  {
    id: 'until_i_found_you',
    title: 'Until I Found You',
    artist: 'Stephen Sanchez',
    category: 'trending',
    style: 'romantic_piano',
    duration: '0:30',
    gradient: 'from-amber-500 via-rose-500 to-indigo-600',
    emoji: '🎙️',
    tag: 'Trending Reel'
  },
  {
    id: 'golden_hour',
    title: 'Golden Hour',
    artist: 'JVKE',
    category: 'romance',
    style: 'romantic_piano',
    duration: '0:30',
    gradient: 'from-yellow-400 via-orange-500 to-pink-600',
    emoji: '✨',
    tag: 'Viral Romance'
  },
  {
    id: 'die_with_a_smile',
    title: 'Die With A Smile',
    artist: 'Lady Gaga & Bruno Mars',
    category: 'trending',
    style: 'romantic_piano',
    duration: '0:30',
    gradient: 'from-rose-500 via-red-600 to-purple-800',
    emoji: '❤️',
    tag: '#1 Global Hit'
  },
  {
    id: 'birds_of_a_feather',
    title: 'Birds of a Feather',
    artist: 'Billie Eilish',
    category: 'trending',
    style: 'dreamy_synth',
    duration: '0:30',
    gradient: 'from-sky-400 via-blue-500 to-indigo-700',
    emoji: '🕊️',
    tag: 'Popular'
  },
  {
    id: 'dandelions',
    title: 'Dandelions',
    artist: 'Ruth B.',
    category: 'romance',
    style: 'romantic_piano',
    duration: '0:30',
    gradient: 'from-amber-300 via-emerald-400 to-teal-600',
    emoji: '🌼',
    tag: 'Sweet Romance'
  },
  {
    id: 'perfect',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    category: 'romance',
    style: 'acoustic_guitar',
    duration: '0:30',
    gradient: 'from-orange-400 via-rose-500 to-red-600',
    emoji: '💍',
    tag: 'Love Dedication'
  },
  {
    id: 'a_thousand_years',
    title: 'A Thousand Years',
    artist: 'Christina Perri',
    category: 'cinematic',
    style: 'cinematic_strings',
    duration: '0:30',
    gradient: 'from-indigo-400 via-purple-500 to-pink-500',
    emoji: '🎻',
    tag: 'Eternal Love'
  },
  {
    id: 'daylight',
    title: 'Daylight',
    artist: 'David Kushner',
    category: 'cinematic',
    style: 'rain_ambient',
    duration: '0:30',
    gradient: 'from-slate-700 via-sky-800 to-blue-950',
    emoji: '🌧️',
    tag: 'Atmospheric'
  },
  {
    id: 'cant_help_falling',
    title: "Can't Help Falling in Love",
    artist: 'Kina Grannis / Elvis',
    category: 'acoustic',
    style: 'acoustic_guitar',
    duration: '0:30',
    gradient: 'from-amber-400 via-orange-500 to-rose-600',
    emoji: '🎸',
    tag: 'Timeless'
  },
  {
    id: 'lover',
    title: 'Lover',
    artist: 'Taylor Swift',
    category: 'romance',
    style: 'romantic_piano',
    duration: '0:30',
    gradient: 'from-pink-300 via-rose-400 to-purple-400',
    emoji: '💖',
    tag: 'Cozy Love'
  },
  {
    id: 'somewhere_only_we_know',
    title: 'Somewhere Only We Know',
    artist: 'Keane / Rhianne',
    category: 'acoustic',
    style: 'romantic_piano',
    duration: '0:30',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    emoji: '🌲',
    tag: 'Nostalgic'
  },
  {
    id: 'double_take',
    title: 'Double Take',
    artist: 'dhruv',
    category: 'chill',
    style: 'lofi_cafe',
    duration: '0:30',
    gradient: 'from-purple-500 via-violet-600 to-indigo-800',
    emoji: '☕',
    tag: 'Lo-Fi Chill'
  },
  {
    id: 'sweater_weather',
    title: 'Sweater Weather',
    artist: 'The Neighbourhood',
    category: 'chill',
    style: 'lofi_cafe',
    duration: '0:30',
    gradient: 'from-zinc-600 via-neutral-700 to-slate-900',
    emoji: '🧥',
    tag: 'Aesthetic'
  },
  {
    id: 'here_with_me',
    title: 'Here With Me',
    artist: 'd4vd',
    category: 'chill',
    style: 'rain_ambient',
    duration: '0:30',
    gradient: 'from-blue-600 via-indigo-700 to-slate-900',
    emoji: '🌙',
    tag: 'Late Night'
  },
  {
    id: 'yellow',
    title: 'Yellow',
    artist: 'Coldplay',
    category: 'acoustic',
    style: 'acoustic_guitar',
    duration: '0:30',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    emoji: '⭐',
    tag: 'Warm Acoustic'
  },
  {
    id: 'photograph',
    title: 'Photograph',
    artist: 'Ed Sheeran',
    category: 'acoustic',
    style: 'acoustic_guitar',
    duration: '0:30',
    gradient: 'from-orange-300 via-amber-500 to-red-500',
    emoji: '📸',
    tag: 'Sweet Memory'
  },
  {
    id: 'romantic_flight',
    title: 'Romantic Flight',
    artist: 'Cinematic Dreamers',
    category: 'cinematic',
    style: 'cinematic_strings',
    duration: '0:30',
    gradient: 'from-cyan-500 via-sky-600 to-blue-800',
    emoji: '🕊️',
    tag: 'Orchestral'
  },
  {
    id: 'rainy_cafe',
    title: 'Rainy Cafe & Piano Chords',
    artist: 'Ambient Soundscape',
    category: 'chill',
    style: 'rain_ambient',
    duration: '0:30',
    gradient: 'from-teal-700 via-slate-800 to-slate-950',
    emoji: '🌧️',
    tag: 'Rain & Piano'
  }
];

