// Procedural Web Audio API sound effects + Imperial Nhã nhạc background music controller

const COURTYARD_BGM_SRC = '/assets/aistudio/l_u_th_y_-_long_cung_9f692c36.mp3';
const THRONE_HALL_BGM_SRC = '/assets/aistudio/__ng___n_cung_6a93b29f.mp3';

type BgmMode = 'none' | 'courtyard' | 'throne_hall';

interface FadeState {
  rafId: number | null;
}

class ImperialSoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  private courtyardAudio: HTMLAudioElement | null = null;
  private throneHallAudio: HTMLAudioElement | null = null;
  private bgmMode: BgmMode = 'none';
  private fadeStates = new WeakMap<HTMLAudioElement, FadeState>();

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
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

  private getOrCreateAudio(kind: 'courtyard' | 'throne_hall'): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;

    if (kind === 'courtyard') {
      if (!this.courtyardAudio) {
        const audio = new Audio(COURTYARD_BGM_SRC);
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = 0;
        audio.muted = this.muted;
        this.courtyardAudio = audio;
      }
      return this.courtyardAudio;
    }

    if (!this.throneHallAudio) {
      const audio = new Audio(THRONE_HALL_BGM_SRC);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      audio.muted = this.muted;
      this.throneHallAudio = audio;
    }
    return this.throneHallAudio;
  }

  private cancelFade(audio: HTMLAudioElement) {
    const state = this.fadeStates.get(audio);
    if (state?.rafId !== null && state?.rafId !== undefined) {
      window.cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
  }

  private fadeAudio(
    audio: HTMLAudioElement,
    fromVol: number,
    toVol: number,
    durationMs: number,
    options?: { pauseOnEnd?: boolean; resetOnEnd?: boolean; power?: number },
  ) {
    this.cancelFade(audio);
    const startVol = Math.max(0, Math.min(1, fromVol));
    const endVol = Math.max(0, Math.min(1, toVol));
    const power = options?.power ?? 1;
    audio.volume = startVol;

    if (durationMs <= 0) {
      audio.volume = endVol;
      if (options?.pauseOnEnd) {
        audio.pause();
        if (options.resetOnEnd) audio.currentTime = 0;
      }
      return;
    }

    const startTime = performance.now();
    const state: FadeState = { rafId: null };
    this.fadeStates.set(audio, state);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const linearT = Math.min(1, Math.max(0, elapsed / durationMs));
      const easedT = power === 1 ? linearT : Math.pow(linearT, power);
      audio.volume = Math.max(0, Math.min(1, startVol + (endVol - startVol) * easedT));

      if (linearT < 1) {
        state.rafId = window.requestAnimationFrame(tick);
      } else {
        state.rafId = null;
        if (options?.pauseOnEnd) {
          audio.pause();
          if (options.resetOnEnd) audio.currentTime = 0;
        }
      }
    };

    state.rafId = window.requestAnimationFrame(tick);
  }

  public preloadMusic() {
    this.getOrCreateAudio('courtyard');
    this.getOrCreateAudio('throne_hall');
  }

  // Nhạc Lưu Thủy - Long Cung phát khi bắt đầu đi từ cổng Ngọ Môn đến Điện Thái Hòa
  public playCourtyardMusic() {
    const courtyard = this.getOrCreateAudio('courtyard');
    if (!courtyard) return;

    if (this.bgmMode === 'courtyard') {
      courtyard.muted = this.muted;
      if (courtyard.paused) {
        courtyard.play().catch(() => {});
      }
      return;
    }

    this.bgmMode = 'courtyard';

    if (this.throneHallAudio && !this.throneHallAudio.paused) {
      this.fadeAudio(this.throneHallAudio, this.throneHallAudio.volume, 0, 800, {
        pauseOnEnd: true,
        resetOnEnd: true,
      });
    }

    courtyard.currentTime = 0;
    courtyard.muted = this.muted;
    courtyard.volume = 0;
    courtyard.play().catch(() => {});
    this.fadeAudio(courtyard, 0, 0.42, 1800);
  }

  // Nhạc Đăng Đàn Cung phát khi bước vào Điện Thái Hòa, nhạc to dần
  public playThroneHallMusic() {
    const throneHall = this.getOrCreateAudio('throne_hall');
    if (!throneHall) return;

    if (this.bgmMode === 'throne_hall') {
      throneHall.muted = this.muted;
      if (throneHall.paused) {
        throneHall.play().catch(() => {});
      }
      return;
    }

    this.bgmMode = 'throne_hall';

    if (this.courtyardAudio && !this.courtyardAudio.paused) {
      this.fadeAudio(this.courtyardAudio, this.courtyardAudio.volume, 0, 1200, {
        pauseOnEnd: true,
        resetOnEnd: true,
      });
    }

    throneHall.currentTime = 0;
    throneHall.muted = this.muted;
    throneHall.volume = 0.02;
    throneHall.play().catch(() => {});
    // Nhạc bắt đầu nhỏ dịu và lớn dần trang nghiêm trong 8 giây khi tiến vào Điện Thái Hòa
    this.fadeAudio(throneHall, 0.02, 0.85, 8000, { power: 1.45 });
  }

  public stopAllMusic() {
    this.bgmMode = 'none';
    if (this.courtyardAudio) {
      if (!this.courtyardAudio.paused) {
        this.fadeAudio(this.courtyardAudio, this.courtyardAudio.volume, 0, 600, {
          pauseOnEnd: true,
          resetOnEnd: true,
        });
      } else {
        this.cancelFade(this.courtyardAudio);
        this.courtyardAudio.currentTime = 0;
        this.courtyardAudio.volume = 0;
      }
    }
    if (this.throneHallAudio) {
      if (!this.throneHallAudio.paused) {
        this.fadeAudio(this.throneHallAudio, this.throneHallAudio.volume, 0, 600, {
          pauseOnEnd: true,
          resetOnEnd: true,
        });
      } else {
        this.cancelFade(this.throneHallAudio);
        this.throneHallAudio.currentTime = 0;
        this.throneHallAudio.volume = 0;
      }
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.courtyardAudio) {
      this.courtyardAudio.muted = muted;
      if (!muted && this.bgmMode === 'courtyard' && this.courtyardAudio.paused) {
        this.courtyardAudio.play().catch(() => {});
      }
    }
    if (this.throneHallAudio) {
      this.throneHallAudio.muted = muted;
      if (!muted && this.bgmMode === 'throne_hall' && this.throneHallAudio.paused) {
        this.throneHallAudio.play().catch(() => {});
      }
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public playClick() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.05);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Crisp stone/wooden sandal footstep when walking 5 paces
  public playStep(stepNumber: number) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const bufferSize = Math.floor(ctx.sampleRate * 0.09);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const decay = Math.exp(-i / (ctx.sampleRate * 0.018));
      data[i] = (Math.random() * 2 - 1) * decay;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(stepNumber % 2 === 0 ? 340 : 390, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  // Heavy wooden palace gate opening + resonant imperial drum
  public playGateOpen() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Drum impact
    const drumOsc = ctx.createOscillator();
    const drumGain = ctx.createGain();
    drumOsc.type = 'sine';
    drumOsc.frequency.setValueAtTime(110, now);
    drumOsc.frequency.exponentialRampToValueAtTime(42, now + 0.65);
    drumGain.gain.setValueAtTime(0.35, now);
    drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    drumOsc.connect(drumGain);
    drumGain.connect(ctx.destination);
    drumOsc.start(now);
    drumOsc.stop(now + 0.75);

    // Metallic bronze gong overtone
    const gong = ctx.createOscillator();
    const gongGain = ctx.createGain();
    gong.type = 'triangle';
    gong.frequency.setValueAtTime(196, now + 0.12);
    gong.frequency.exponentialRampToValueAtTime(192, now + 1.8);
    gongGain.gain.setValueAtTime(0.001, now);
    gongGain.gain.linearRampToValueAtTime(0.16, now + 0.16);
    gongGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
    gong.connect(gongGain);
    gongGain.connect(ctx.destination);
    gong.start(now + 0.1);
    gong.stop(now + 1.9);
  }

  // Correct answer: "Khá lắm!" — radiant pentatonic jade chime + bell resonance
  public playCorrect() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6

    notes.forEach((freq, idx) => {
      const start = now + idx * 0.075;
      const osc = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2, start);

      const overtoneGain = ctx.createGain();
      overtoneGain.gain.setValueAtTime(0.05, start);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.16, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55);

      osc.connect(gain);
      overtone.connect(overtoneGain);
      overtoneGain.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      overtone.start(start);
      osc.stop(start + 0.56);
      overtone.stop(start + 0.56);
    });
  }

  // Wrong answer: "Ngươi thật tệ!" — wooden clapper & low dissonant court gong
  public playWrong() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const freqs = [210, 148];
    freqs.forEach((freq, idx) => {
      const start = now + idx * 0.14;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.78, start + 0.22);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(620, start);

      gain.gain.setValueAtTime(0.14, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.26);
    });
  }

  // Grand Throne Hall commendation fanfare
  public playRoyalFanfare() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [392.0, 440.0, 523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, i) => {
      const start = now + i * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.85);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.88);
    });
  }
}

export const soundEngine = new ImperialSoundEngine();
