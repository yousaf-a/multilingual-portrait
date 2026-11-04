// Web Audio API procedural music generator + custom audio handler
// Provides beautiful, royalty-free ambient piano/lofi chord progressions that work 100% offline!

class AudioController {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private intervalId: any = null;
  private customAudio: HTMLAudioElement | null = null;
  private currentTrack: string = 'piano';

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  // Play a gentle, soothing chord using Web Audio API synthesis
  private playChord(frequencies: number[], duration: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    frequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Soft triangle/sine blend for warm piano/rhodes timbre
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Gentle envelope: soft attack, warm sustain, smooth decay
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06 / (idx + 1), now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    });
  }

  public setCustomAudio(url: string | null) {
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }
    if (url) {
      this.customAudio = new Audio(url);
      this.customAudio.loop = true;
    }
  }

  public start(track: string = 'piano', customUrl?: string | null) {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stop();
    this.isPlaying = true;
    this.currentTrack = track;

    if (customUrl) {
      this.setCustomAudio(customUrl);
      this.customAudio?.play().catch(() => {});
      return;
    }

    // Procedural ambient chord progressions
    // Progression: Cmaj7 -> Am9 -> Fmaj7 -> Gsus4 (warm romantic/reflective chords)
    const chords: number[][] = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
      [220.00, 261.63, 329.63, 392.00, 493.88], // Am9 (A3, C4, E4, G4, B4)
      [174.61, 261.63, 329.63, 349.23], // Fmaj7 (F3, C4, E4, F4)
      [196.00, 261.63, 293.66, 392.00]  // Gsus4 (G3, C4, D4, G4)
    ];

    let chordIdx = 0;
    this.playChord(chords[0], 2.8);

    this.intervalId = setInterval(() => {
      if (!this.isPlaying) return;
      chordIdx = (chordIdx + 1) % chords.length;
      this.playChord(chords[chordIdx], 2.8);
    }, 2800);
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
  }

  public toggle(track: string = 'piano', customUrl?: string | null): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start(track, customUrl);
      return true;
    }
  }
}

export const audioController = new AudioController();
