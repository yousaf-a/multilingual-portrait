// Anime Clash: Free Client-Side Procedural Audio & Web Speech Engine
// 100% Free, zero external API keys, zero network latency, runs natively in all browsers

class FreeAnimeAudioEngine {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // 1. SHINRA TENSEI (Almighty Push): Devastating Sub-Bass Shockwave
  playShinraTensei() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Sub-bass sine sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(24, now + 1.2);

    gain.gain.setValueAtTime(0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.4);

    // Explosive noise burst
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(50, now + 0.5);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.65, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
  }

  // 2. THE SACRIFICE MELODY: Melancholic A-Minor Piano/Violin Progression
  playSacrificeMelody() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [
      { freq: 440.0, time: 0.0, dur: 1.2 },  // A4
      { freq: 523.25, time: 0.6, dur: 1.2 }, // C5
      { freq: 659.25, time: 1.2, dur: 1.5 }, // E5
      { freq: 587.33, time: 1.8, dur: 1.4 }, // D5
      { freq: 493.88, time: 2.4, dur: 1.8 }  // B4
    ];

    const now = ctx.currentTime;

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Warm acoustic tone
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0, now + note.time);
      gain.gain.linearRampToValueAtTime(0.28, now + note.time + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now + note.time);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    });
  }

  // 3. SAGE MODE AWAKENING: Harmonious Natural Chakra Resonator
  playSageModeAwakening() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chords = [261.63, 329.63, 392.0, 523.25, 659.25]; // C Major 9 divine aura

    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.5, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 1.8);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.3 + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.5);
    });
  }

  // 4. RASENSHURIKEN HIGH-SPEED WIND WHISTLE
  playRasenshurikenWind() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const mainGain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(1400, now + 1.0);

    // 40Hz vibration
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(45, now);

    lfoGain.gain.setValueAtTime(250, now);
    lfo.connect(osc.frequency);

    mainGain.gain.setValueAtTime(0.2, now);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(mainGain);
    mainGain.connect(ctx.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 1.2);
    osc.stop(now + 1.2);
  }

  // 5. SHOBEN CLASH / PUNCH IMPACT
  playClashImpact() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  // 6. ANIME EPISODE TITLE CARD / CINEMATIC INTRO FANFARE
  playEpisodeIntroFanfare() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // A. Deep Taiko Drum Boom (110Hz -> 30Hz sub-bass drop)
    const taikoOsc = ctx.createOscillator();
    const taikoGain = ctx.createGain();
    taikoOsc.type = 'triangle';
    taikoOsc.frequency.setValueAtTime(120, now);
    taikoOsc.frequency.exponentialRampToValueAtTime(32, now + 0.55);
    taikoGain.gain.setValueAtTime(0.65, now);
    taikoGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    taikoOsc.connect(taikoGain);
    taikoGain.connect(ctx.destination);
    taikoOsc.start(now);
    taikoOsc.stop(now + 0.6);

    // B. Hyoshigi Wooden Clap (Sharp resonant snap at +0.18s)
    const clapOsc = ctx.createOscillator();
    const clapGain = ctx.createGain();
    clapOsc.type = 'sine';
    clapOsc.frequency.setValueAtTime(2200, now + 0.18);
    clapOsc.frequency.exponentialRampToValueAtTime(600, now + 0.28);
    clapGain.gain.setValueAtTime(0.4, now + 0.18);
    clapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    clapOsc.connect(clapGain);
    clapGain.connect(ctx.destination);
    clapOsc.start(now + 0.18);
    clapOsc.stop(now + 0.28);

    // C. Ascending Shonen Brass Stabs (D4 -> F4 -> A4 -> D5 chord at +0.32s)
    const chordNotes = [293.66, 349.23, 440.0, 587.33];
    chordNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + 0.32 + idx * 0.04);
      gain.gain.setValueAtTime(0.12, now + 0.32 + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.32 + idx * 0.04);
      osc.stop(now + 1.25);
    });
  }

  // 7. SWORD UNSHEATHE & CLASH SHING
  playSwordClash() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.45);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  // 8. JUTSU HAND SIGN WHOOSH
  playJutsuWhoosh() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.15);
    filter.Q.value = 3;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  // 8B. FIRE STYLE: GRAND FIREBALL (火遁・豪火球の術)
  playFireballRoar() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Ignition deep boom
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(110, now);
    boomOsc.frequency.exponentialRampToValueAtTime(32, now + 0.45);
    boomGain.gain.setValueAtTime(0.5, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    boomOsc.connect(boomGain);
    boomGain.connect(ctx.destination);
    boomOsc.start(now);
    boomOsc.stop(now + 0.5);

    // Roaring flame noise
    const bufferSize = ctx.sampleRate * 0.45;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);
    filter.frequency.linearRampToValueAtTime(1100, now + 0.15);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.45);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  // 8C. HYŪGA GENTLE FIST CHAKRA STRIKE (八卦六十四掌)
  playGentleFistStrike() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Sharp chakra ping
    const pingOsc = ctx.createOscillator();
    const pingGain = ctx.createGain();
    pingOsc.type = 'sine';
    pingOsc.frequency.setValueAtTime(1600, now);
    pingOsc.frequency.exponentialRampToValueAtTime(650, now + 0.14);
    pingGain.gain.setValueAtTime(0.4, now);
    pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    pingOsc.connect(pingGain);
    pingGain.connect(ctx.destination);
    pingOsc.start(now);
    pingOsc.stop(now + 0.16);

    // Sub burst
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(240, now);
    subOsc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.14);
  }

  // 8D. RAPID KUNAI & SHURIKEN WHISTLE (手裏剣・クナイ)
  playKunaiThrow() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.18;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.linearRampToValueAtTime(3200, now + 0.08);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.18);
    filter.Q.value = 4.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  // 8E. TOAD VANGUARD COLOSSAL CLEAVER SMASH (ガマの大太刀)
  playToadCleaverSmash() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Metallic heavy blade impact
    const bladeOsc = ctx.createOscillator();
    const bladeGain = ctx.createGain();
    bladeOsc.type = 'sawtooth';
    bladeOsc.frequency.setValueAtTime(450, now);
    bladeOsc.frequency.exponentialRampToValueAtTime(80, now + 0.28);
    bladeGain.gain.setValueAtTime(0.45, now);
    bladeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    bladeOsc.connect(bladeGain);
    bladeGain.connect(ctx.destination);
    bladeOsc.start(now);
    bladeOsc.stop(now + 0.3);

    // Deep earthquake ground thud
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(140, now);
    thudOsc.frequency.exponentialRampToValueAtTime(28, now + 0.42);
    thudGain.gain.setValueAtTime(0.65, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    thudOsc.connect(thudGain);
    thudGain.connect(ctx.destination);
    thudOsc.start(now);
    thudOsc.stop(now + 0.45);
  }

  // 9. AMBIENT SHONEN PROLOGUE BGM LOOP
  private bgmInterval: NodeJS.Timeout | null = null;
  private isBgmPlaying = false;

  startAnimePrologueBgm() {
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Pentatonic battle progression notes (D Minor / In-sen scale)
    const scale = [293.66, 311.13, 392.0, 440.0, 523.25, 587.33];
    let step = 0;

    const tick = () => {
      if (!this.isBgmPlaying) return;
      const now = ctx.currentTime;
      const freq = scale[step % scale.length];
      step++;

      // Pluck note
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);

      // Taiko sub pulse every 4 steps
      if (step % 4 === 0) {
        const kick = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(95, now);
        kick.frequency.exponentialRampToValueAtTime(35, now + 0.35);
        kickGain.gain.setValueAtTime(0.25, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        kick.connect(kickGain);
        kickGain.connect(ctx.destination);
        kick.start(now);
        kick.stop(now + 0.38);
      }
    };

    tick();
    this.bgmInterval = setInterval(tick, 380);
  }

  stopAnimePrologueBgm() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  // 6. CLIENT-SIDE VOICE SYNTHESIS (100% Free Browser Web Speech API)
  speakDialogue(text: string, mood?: 'normal' | 'angry' | 'sad' | 'determined' | 'dramatic') {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      // Mood pitching & rate adjustment
      if (mood === 'angry' || mood === 'dramatic') {
        utterance.pitch = 0.85;
        utterance.rate = 1.1;
      } else if (mood === 'sad') {
        utterance.pitch = 0.9;
        utterance.rate = 0.85;
      } else if (mood === 'determined') {
        utterance.pitch = 1.05;
        utterance.rate = 1.05;
      } else {
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Graceful fallback
    }
  }
}

export const freeAnimeAudio = new FreeAnimeAudioEngine();

