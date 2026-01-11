import Phaser from 'phaser';
import { StatusEffectType } from '../types';

/**
 * StatusIcon - Visual indicator for active status effects
 *
 * Small colored square displayed above entities showing active status effects.
 * Color-coded by effect type with stack counters for stackable effects.
 */
export class StatusIcon {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private text: Phaser.GameObjects.Text | null = null;
  private statusType: StatusEffectType;

  constructor(scene: Phaser.Scene, statusType: StatusEffectType, x: number, y: number) {
    this.scene = scene;
    this.statusType = statusType;

    // Create graphics for icon background
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(350); // Above entities, below UI

    // Draw colored square based on status type
    const color = this.getColorForStatus(statusType);
    this.graphics.fillStyle(color, 1);
    this.graphics.fillRect(x - 4, y - 4, 8, 8);

    // Add border
    this.graphics.lineStyle(1, 0xffffff, 0.8);
    this.graphics.strokeRect(x - 4, y - 4, 8, 8);
  }

  /**
   * Get color for status effect type
   */
  private getColorForStatus(type: StatusEffectType): number {
    switch (type) {
      case StatusEffectType.POISON:
        return 0x00ff00; // Green
      case StatusEffectType.BLEEDING:
        return 0x880000; // Dark red
      case StatusEffectType.BURN:
        return 0xff6600; // Orange
      case StatusEffectType.REGENERATION:
        return 0x00ffaa; // Cyan/green
      case StatusEffectType.STRENGTH_BUFF:
      case StatusEffectType.DEFENSE_BUFF:
        return 0x0088ff; // Blue
      case StatusEffectType.WEAKNESS:
      case StatusEffectType.VULNERABILITY:
        return 0x880088; // Purple
      case StatusEffectType.STUN:
        return 0xffff00; // Yellow
      default:
        return 0xffffff; // White fallback
    }
  }

  /**
   * Update icon position (call when entity moves)
   */
  setPosition(x: number, y: number): void {
    this.graphics.clear();

    const color = this.getColorForStatus(this.statusType);
    this.graphics.fillStyle(color, 1);
    this.graphics.fillRect(x - 4, y - 4, 8, 8);

    this.graphics.lineStyle(1, 0xffffff, 0.8);
    this.graphics.strokeRect(x - 4, y - 4, 8, 8);

    if (this.text) {
      this.text.setPosition(x + 6, y - 4);
    }
  }

  /**
   * Update stack counter (for bleeding)
   */
  setStacks(stacks: number): void {
    if (stacks > 1) {
      if (!this.text) {
        // Create text if it doesn't exist
        this.text = this.scene.add.text(0, 0, `${stacks}`, {
          fontSize: '8px',
          color: '#ffffff',
          fontStyle: 'bold'
        });
        this.text.setDepth(351);
      }
      this.text.setText(`${stacks}`);
    } else {
      // Remove text if stacks <= 1
      if (this.text) {
        this.text.destroy();
        this.text = null;
      }
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.graphics.destroy();
    if (this.text) {
      this.text.destroy();
    }
  }
}
