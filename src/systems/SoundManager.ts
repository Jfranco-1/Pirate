/**
 * SoundManager - Audio feedback system using Web Audio API
 *
 * Generates simple tones programmatically - no external sound files needed.
 * Provides combat audio feedback for hits, deaths, and status effects.
 */
export class SoundManager {
  private audioContext: AudioContext | null = null;
  private volume: number = 0.3; // Default volume (30%)

  constructor() {
    // Create Web Audio context
    if (typeof AudioContext !== 'undefined') {
      this.audioContext = new AudioContext();
    } else if (typeof (window as any).webkitAudioContext !== 'undefined') {
      this.audioContext = new (window as any).webkitAudioContext();
    }
  }

  /**
   * Play a simple tone
   */
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    frequencyEnd?: number
  ): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    // Frequency sweep if end frequency provided
    if (frequencyEnd) {
      oscillator.frequency.exponentialRampToValueAtTime(
        frequencyEnd,
        this.audioContext.currentTime + duration / 1000
      );
    }

    // Volume envelope (attack and decay)
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  /**
   * Light hit sound (200Hz beep, 100ms)
   */
  playHit(): void {
    this.playTone(200, 100, 'square');
  }

  /**
   * Heavy hit sound (150Hz beep, 150ms)
   */
  playHeavyHit(): void {
    this.playTone(150, 150, 'square');
  }

  /**
   * Entity death sound (100Hz dropping to 50Hz, 300ms)
   */
  playDeath(): void {
    this.playTone(100, 300, 'sawtooth', 50);
  }

  /**
   * Poison application sound (300Hz warble, 200ms)
   */
  playPoison(): void {
    this.playTone(300, 200, 'sine');
  }

  /**
   * Buff application sound (400Hz rising to 600Hz, 150ms)
   */
  playBuff(): void {
    this.playTone(400, 150, 'sine', 600);
  }

  /**
   * Debuff application sound (300Hz dropping to 200Hz, 150ms)
   */
  playDebuff(): void {
    this.playTone(300, 150, 'sine', 200);
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }
}
