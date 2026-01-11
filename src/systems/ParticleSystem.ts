import Phaser from 'phaser';

/**
 * ParticleSystem - Utility for creating visual particle effects
 *
 * Static utility class for combat visual feedback.
 * Uses Phaser's particle system with procedurally generated textures.
 */
export class ParticleSystem {
  /**
   * Create blood burst particles (red, gravity-affected)
   */
  static createBloodBurst(scene: Phaser.Scene, x: number, y: number, intensity: number = 1): void {
    const particleCount = Math.floor(5 + intensity * 5); // 5-10 particles

    const emitter = scene.add.particles(x, y, 'particle', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      tint: 0xff0000, // Red
      lifespan: 600,
      gravityY: 300,
      quantity: particleCount,
      frequency: -1 // Emit once
    });

    emitter.setDepth(100); // Between entities and UI

    // Destroy emitter after particles die
    scene.time.delayedCall(700, () => {
      emitter.destroy();
    });
  }

  /**
   * Create hit spark particles (white/yellow, fast)
   */
  static createHitSparks(scene: Phaser.Scene, x: number, y: number): void {
    const emitter = scene.add.particles(x, y, 'particle', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      tint: 0xffff00, // Yellow
      lifespan: 300,
      gravityY: 0,
      quantity: 5,
      frequency: -1 // Emit once
    });

    emitter.setDepth(100);

    scene.time.delayedCall(400, () => {
      emitter.destroy();
    });
  }

  /**
   * Create death explosion particles (color-coded, radial burst)
   */
  static createDeathExplosion(scene: Phaser.Scene, x: number, y: number, color: number = 0xff0000): void {
    const emitter = scene.add.particles(x, y, 'particle', {
      speed: { min: 80, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      tint: color,
      lifespan: 800,
      gravityY: 200,
      quantity: 20,
      frequency: -1 // Emit once
    });

    emitter.setDepth(100);

    scene.time.delayedCall(900, () => {
      emitter.destroy();
    });
  }

  /**
   * Create poison cloud particles (green, float upward)
   */
  static createPoisonCloud(scene: Phaser.Scene, x: number, y: number): void {
    const emitter = scene.add.particles(x, y, 'particle', {
      speed: { min: 10, max: 30 },
      angle: { min: 260, max: 280 }, // Mostly upward
      scale: { start: 1, end: 0.3 },
      tint: 0x00ff00, // Green
      alpha: { start: 0.6, end: 0 },
      lifespan: 1000,
      gravityY: -50, // Float upward
      quantity: 8,
      frequency: -1 // Emit once
    });

    emitter.setDepth(100);

    scene.time.delayedCall(1100, () => {
      emitter.destroy();
    });
  }

  /**
   * Create heal sparkle particles (cyan/blue, float upward)
   */
  static createHealSparkle(scene: Phaser.Scene, x: number, y: number): void {
    const emitter = scene.add.particles(x, y, 'particle', {
      speed: { min: 20, max: 50 },
      angle: { min: 260, max: 280 }, // Mostly upward
      scale: { start: 0.8, end: 0 },
      tint: 0x00ffff, // Cyan
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      gravityY: -80, // Float upward
      quantity: 6,
      frequency: -1 // Emit once
    });

    emitter.setDepth(100);

    scene.time.delayedCall(900, () => {
      emitter.destroy();
    });
  }
}
