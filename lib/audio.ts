// Web Audio API procedural music & rain sound generator + custom audio handler
// Provides beautiful, royalty-free ambient piano/lofi chord progressions + soothing rain!

class AudioController {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private intervalId: any = null;
  private rainNode: AudioNode | null = null;
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

  // Play gentle piano/rhodes chords
  private playChord(frequencies: number[], duration: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    frequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.05 / (idx + 1), now + 0.18);
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

    if (track === 'none') {
      return;
    }

    // Rain & Storm audio (Adri reel reference)
    if (track === 'rain' || track === 'piano_rain') {
      this.startRainNoise();
    }

    // Ambient chords
    const chords: number[][] = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am9
      [174.61, 261.63, 329.63, 349.23], // Fmaj7
      [196.00, 261.63, 293.66, 392.00]  // Gsus4
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
