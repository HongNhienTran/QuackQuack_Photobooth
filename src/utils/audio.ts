// Web Audio API Sound Synthesizer (No external mp3 files needed, super fast & reliable)

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private bgmOsc: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmInterval: any = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Gunshot 8-bit sound
  playShoot() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // White noise blast for gunshot
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.12);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.12);
    } catch (e) {
      console.error(e);
    }
  }

  // Duck quack sound
  playQuack() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Pitch drop resembling a retro quack
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
      osc.frequency.setValueAtTime(420, now + 0.09);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.22);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {
      console.error(e);
    }
  }

  // Shotgun reload click-clack
  playReload() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.08].forEach((offset, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(idx === 0 ? 800 : 1200, now + offset);
        gain.gain.setValueAtTime(0.2, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.05);
      });
    } catch (e) {
      console.error(e);
    }
  }

  // Camera shutter / flash sound
  playShutter() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // High click then mirror flap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.error(e);
    }
  }

  // Cute pop click for UI
  playPop() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.06); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      console.error(e);
    }
  }

  // Victory fanfare
  playVictory() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.25, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.2);
      });
    } catch (e) {
      console.error(e);
    }
  }

  // Toggle Cute 8-bit Lofi BGM loop
  toggleBgm(onStateChange?: (playing: boolean) => void): boolean {
    this.initCtx();
    if (!this.ctx) return false;

    if (this.isBgmPlaying) {
      if (this.bgmInterval) clearInterval(this.bgmInterval);
      this.isBgmPlaying = false;
      onStateChange?.(false);
      return false;
    }

    this.isBgmPlaying = true;
    onStateChange?.(true);

    const melody = [
      329.63, 392.0, 440.0, 523.25, 440.0, 392.0, 329.63, 293.66,
      329.63, 392.0, 440.0, 587.33, 523.25, 440.0, 392.0, 349.23,
    ];
    let step = 0;

    this.bgmInterval = setInterval(() => {
      if (!this.isBgmPlaying || !this.ctx || !this.enabled) return;
      try {
        const now = this.ctx.currentTime;
        const freq = melody[step % melody.length];
        step++;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
      } catch (e) {
        console.error(e);
      }
    }, 280);

    return true;
  }

  getBgmStatus(): boolean {
    return this.isBgmPlaying;
  }
}

export const sounds = new SoundEngine();
