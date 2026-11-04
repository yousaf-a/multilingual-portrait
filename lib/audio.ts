// Web Audio API procedural music & rain sound generator + custom audio handler
// Provides beautiful, royalty-free ambient piano/guitar/strings/lofi chord progressions + soothing rain!

export type SoundStyle =
  | 'romantic_piano'
  | 'acoustic_guitar'
  | 'lofi_cafe'
  | 'rain_ambient'
  | 'cinematic_strings'
  | 'dreamy_synth'
  | 'none'
  | 'custom'
  | string;

class AudioController {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private intervalId: any = null;
  private previewTimeoutId: any = null;
  private rainNode: AudioNode | null = null;
  private customAudio: HTMLAudioElement | null = null;
  private currentTrack: string = 'romantic_piano';
  private previewingTrackId: string | null = null;

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  // Generate soothing rain sound via filtered pink noise
  private startRainNoise() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.08;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate soft raindrops
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.025, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start();
    this.rainNode = whiteNoise;
  }

  // Play chords according to musical instrument style
  private playChordForStyle(style: string, frequencies: number[], duration: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    frequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      if (style.includes('guitar')) {
        // Acoustic guitar pluck
        osc.type = idx === 0 ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.035);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + duration);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.06 / (idx + 1), now + idx * 0.035 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
      } else if (style.includes('lofi')) {
        // Rhodes electric piano with warm vibrato
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.05 / (idx + 1), now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
      } else if (style.includes('strings')) {
        // Rich cinematic orchestra strings with slow attack
        osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq * (1 + (idx - 1) * 0.002), now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.035 / (idx + 1), now + 0.7);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
      } else if (style.includes('synth')) {
        // Dreamy 80s synth pad
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(1500, now + duration * 0.4);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.04 / (idx + 1), now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
      } else {
        // Default warm grand piano
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.02);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(450, now + duration);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.05 / (idx + 1), now + idx * 0.02 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
      }

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

  public start(track: string = 'romantic_piano', customUrl?: string | null) {
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

    if (track === 'none') {
      return;
    }

    // Rain sound for rain tracks
    if (track.includes('rain')) {
      this.startRainNoise();
    }

    // Distinct harmonic chord progressions
    let chords: number[][];

    if (track.includes('guitar')) {
      // Dmaj7 -> Gmaj7 -> Bm7 -> Asus4
      chords = [
        [146.83, 220.00, 277.18, 369.99], // Dmaj7
        [196.00, 246.94, 293.66, 392.00], // Gmaj7
        [123.47, 185.00, 220.00, 293.66], // Bm7
        [220.00, 293.66, 329.63, 440.00]  // Asus4
      ];
    } else if (track.includes('lofi')) {
      // Ebmaj9 -> Cm9 -> Fm9 -> Bb13
      chords = [
        [155.56, 233.08, 293.66, 349.23], // Ebmaj9
        [130.81, 196.00, 233.08, 311.13], // Cm9
        [174.61, 261.63, 311.13, 392.00], // Fm9
        [233.08, 293.66, 349.23, 440.00]  // Bb13
      ];
    } else if (track.includes('strings') || track.includes('cinematic')) {
      // Fmaj7 -> C/E -> Dm7 -> Bbmaj7
      chords = [
        [174.61, 261.63, 329.63, 349.23], // Fmaj7
        [164.81, 246.94, 329.63, 392.00], // C/E
        [146.83, 220.00, 261.63, 349.23], // Dm7
        [116.54, 174.61, 233.08, 293.66]  // Bbmaj7
      ];
    } else if (track.includes('rain')) {
      // Dm -> Bb -> F -> C
      chords = [
        [146.83, 220.00, 261.63, 349.23],
        [116.54, 174.61, 233.08, 293.66],
        [174.61, 220.00, 261.63, 349.23],
        [130.81, 196.00, 261.63, 329.63]
      ];
    } else {
      // Romantic Piano: Cmaj7 -> Am9 -> Fmaj7 -> Gsus4
      chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am9
        [174.61, 261.63, 329.63, 349.23], // Fmaj7
        [196.00, 261.63, 293.66, 392.00]  // Gsus4
      ];
    }

    let chordIdx = 0;
    this.playChordForStyle(track, chords[0], 2.8);

    this.intervalId = setInterval(() => {
      if (!this.isPlaying) return;
      chordIdx = (chordIdx + 1) % chords.length;
      this.playChordForStyle(track, chords[chordIdx], 2.8);
    }, 2800);
  }

  public preview(track: string, onStop?: () => void) {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.previewingTrackId === track) {
      // Toggle off if currently previewing the same track
      this.stopPreview();
      onStop?.();
      return false;
    }

    this.stopPreview();
    this.previewingTrackId = track;
    this.start(track);

    // Auto-stop preview after 15 seconds
    this.previewTimeoutId = setTimeout(() => {
      this.stopPreview();
      onStop?.();
    }, 15000);

    return true;
  }

  public stopPreview() {
    if (this.previewTimeoutId) {
      clearTimeout(this.previewTimeoutId);
      this.previewTimeoutId = null;
    }
    this.previewingTrackId = null;
    this.stop();
  }

  public getPreviewingTrackId(): string | null {
    return this.previewingTrackId;
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.rainNode) {
      try {
        (this.rainNode as any).stop?.();
      } catch (_) {}
      this.rainNode = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
  }

  public toggle(track: string = 'romantic_piano', customUrl?: string | null): boolean {
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
