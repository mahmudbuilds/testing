/**
 * Web Audio API Sound Synthesizer for Aetheris Dynamics
 * Pure procedural audio - no external audio files required.
 */

class SoundController {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.droneGain = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.engineNoiseGain = null;
    this.isBoosted = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.setupDrone();
  }

  setupDrone() {
    if (!this.ctx) return;

    // Master ambient low-frequency deep space / spacecraft hum
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);
    filter.Q.setValueAtTime(4, this.ctx.currentTime);

    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(48, this.ctx.currentTime); // Deep F#1

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(72, this.ctx.currentTime); // Harmonic

    this.droneOsc1.connect(filter);
    this.droneOsc2.connect(filter);
    filter.connect(this.droneGain);
    this.droneGain.connect(this.ctx.destination);

    this.droneOsc1.start();
    this.droneOsc2.start();

    // Procedural noise buffer for engine plasma thrust
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'bandpass';
    this.engineFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
    this.engineFilter.Q.setValueAtTime(2, this.ctx.currentTime);

    this.engineNoiseGain = this.ctx.createGain();
    this.engineNoiseGain.gain.setValueAtTime(0, this.ctx.currentTime);

    whiteNoise.connect(this.engineFilter);
    this.engineFilter.connect(this.engineNoiseGain);
    this.engineNoiseGain.connect(this.ctx.destination);

    whiteNoise.start();
  }

  toggleMute() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    if (this.droneGain) {
      const now = this.ctx.currentTime;
      if (this.isMuted) {
        this.droneGain.gain.setTargetAtTime(0, now, 0.2);
        this.engineNoiseGain.gain.setTargetAtTime(0, now, 0.2);
      } else {
        this.droneGain.gain.setTargetAtTime(0.08, now, 0.4);
        if (this.isBoosted) {
          this.engineNoiseGain.gain.setTargetAtTime(0.12, now, 0.2);
        }
      }
    }
    return !this.isMuted;
  }

  playClick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.04);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // Audio context might be restricted
    }
  }

  playBeep(freq = 880, duration = 0.08) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  setEngineBoost(active) {
    this.isBoosted = active;
    if (this.isMuted || !this.ctx || !this.engineNoiseGain) return;

    const now = this.ctx.currentTime;
    if (active) {
      this.engineNoiseGain.gain.setTargetAtTime(0.14, now, 0.2);
      this.engineFilter.frequency.setTargetAtTime(800, now, 0.3);
      this.droneGain.gain.setTargetAtTime(0.14, now, 0.3);
      this.playBeep(1200, 0.15);
    } else {
      this.engineNoiseGain.gain.setTargetAtTime(0, now, 0.4);
      this.engineFilter.frequency.setTargetAtTime(320, now, 0.3);
      this.droneGain.gain.setTargetAtTime(0.08, now, 0.3);
      this.playBeep(600, 0.1);
    }
  }
}

export const sound = new SoundController();
