// Anime Clash: Audio & Voice Shout Synthesis Engine (Web Audio API)

import { ANIME_VOICE_SHOUTS, AnimeVoiceShout, HEROES_CATALOG } from './gameData';

class AnimeAudioManager {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play Hero Ultimate Voice Shout SFX & Spoken Dialogue
  playHeroShout(heroId: string): AnimeVoiceShout | null {
    const shout = ANIME_VOICE_SHOUTS[heroId];
    if (!shout) return null;

    const hero = HEROES_CATALOG[heroId];
    const phrase = hero?.catchphrase ? `${shout.shoutText}! ${hero.catchphrase}` : `${shout.shoutText}! ${shout.subTitle}`;

    // 1. Speak the actual anime dialogue with character voice tuning
    this.speakHeroDialogue(heroId, phrase);

    // 2. Pair with atmospheric energy sweep / acoustic SFX
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;

      if (heroId === 'naruto') {
        // Wind Vortex Rasengan SFX: High-speed oscillating pitch sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.8);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, now);
        filter.Q.setValueAtTime(4, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.95);
      } else if (heroId === 'luffy') {
        // Gum-Gum Red Hawk: Low boom snap followed by explosive friction burst
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.5);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.65);
      } else if (heroId === 'ichigo') {
        // Bankai Tensa Zangetsu: Sharp metallic blade ring followed by low roar
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.5);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.75);
      } else if (heroId === 'asta') {
        // Black Divider: Heavy cleave impact
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(45, now + 0.4);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.55);
      } else if (heroId === 'gojo') {
        // Infinite Void: Resonant cosmic bell chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, now);
        osc.frequency.exponentialRampToValueAtTime(1056, now + 0.6);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.85);
      }
    } catch {
      // Audio fallback
    }

    return shout;
  }

  // Spoken character dialogue via browser speech synthesis with personality voice profiles
  speakHeroDialogue(heroId: string, textToSpeak?: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop overlapping speech

      const shout = ANIME_VOICE_SHOUTS[heroId];
      const defaultDialogue = shout ? `${shout.shoutText}! ${shout.subTitle}` : 'Sanctuary secured!';
      const phrase = textToSpeak ? textToSpeak.replace(/["*]/g, '').trim() : defaultDialogue;

      const utterance = new SpeechSynthesisUtterance(phrase);

      // Character-tuned pitch and speech speed
      if (heroId === 'naruto') {
        utterance.pitch = 1.25;
        utterance.rate = 1.08;
      } else if (heroId === 'luffy') {
        utterance.pitch = 1.35;
        utterance.rate = 1.15;
      } else if (heroId === 'ichigo') {
        utterance.pitch = 0.82;
        utterance.rate = 1.0;
      } else if (heroId === 'asta') {
        utterance.pitch = 1.4;
        utterance.rate = 1.2;
      } else if (heroId === 'gojo') {
        utterance.pitch = 0.9;
        utterance.rate = 0.95;
      } else if (heroId === 'minato') {
        utterance.pitch = 1.1;
        utterance.rate = 1.12;
      } else if (heroId === 'zoro') {
        utterance.pitch = 0.76;
        utterance.rate = 0.94;
      } else if (heroId === 'sung_jinwoo') {
        utterance.pitch = 0.78;
        utterance.rate = 0.92;
      } else if (heroId === 'igris') {
        utterance.pitch = 0.65;
        utterance.rate = 0.85;
      } else if (heroId === 'sanemi') {
        utterance.pitch = 1.18;
        utterance.rate = 1.22;
      } else if (heroId === 'hitsugaya') {
        utterance.pitch = 1.2;
        utterance.rate = 1.05;
      } else if (heroId === 'kenpachi') {
        utterance.pitch = 0.7;
        utterance.rate = 0.96;
      } else if (heroId === 'inosuke') {
        utterance.pitch = 1.32;
        utterance.rate = 1.25;
      } else if (heroId === 'tsunade') {
        utterance.pitch = 1.1;
        utterance.rate = 0.98;
      } else if (heroId === 'yoruichi') {
        utterance.pitch = 1.16;
        utterance.rate = 1.12;
      } else if (heroId === 'boa_hancock') {
        utterance.pitch = 1.22;
        utterance.rate = 0.94;
      } else if (heroId === 'mikasa') {
        utterance.pitch = 1.04;
        utterance.rate = 0.95;
      } else {
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
      }

      // Voice selection (prefers natural/expressive voice if available)
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const isJapanese =
          /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(phrase) ||
          phrase.includes('Bankai') ||
          phrase.includes('Rasengan') ||
          phrase.includes('Gomu') ||
          phrase.includes('Dattebayo') ||
          phrase.includes('Ryoiki');

        let preferredVoice = null;
        if (isJapanese) {
          preferredVoice = voices.find((v) => v.lang.startsWith('ja') || v.lang.includes('JP'));
        }
        if (!preferredVoice) {
          preferredVoice = voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Natural') ||
                v.name.includes('Guy') ||
                v.name.includes('David') ||
                v.name.includes('Google') ||
                v.name.includes('George') ||
                v.name.includes('Male'))
          );
        }
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis error fallback
    }
  }

  // Speak when user interacts with patrolling hero
  speakHeroQuote(heroId: string, quoteText: string) {
    this.speakHeroDialogue(heroId, quoteText);
  }

  // Play Cannon / Troop Attack Sound
  playCombatSFX(type: 'cannon' | 'shuriken' | 'sword' | 'spell') {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'cannon') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      } else if (type === 'shuriken') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      } else if (type === 'sword') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.25);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // ignore
    }
  }

  playButtonClick() {
    this.playCombatSFX('shuriken');
  }

  playUpgradeSuccess() {
    this.playCombatSFX('spell');
  }

  playWallHit() {
    this.playCombatSFX('cannon');
  }
}

export const animeAudio = new AnimeAudioManager();

