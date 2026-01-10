import Phaser from 'phaser';
import { Enemy } from '../Enemy';
import { AIBehavior } from '../../types';

/**
 * Brute - Defensive tank enemy
 *
 * Tanky enemy that only attacks when engaged. High HP and defense,
 * strong attack. Stands ground and punishes players who get too close.
 *
 * Stats: 15 HP, 6 attack, 3 defense
 * Behavior: DEFENSIVE (only attack when adjacent)
 * Color: Blue
 */
export class Brute extends Enemy {
  constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
    super(
      scene,
      gridX,
      gridY,
      {
        maxHP: 15,
        currentHP: 15,
        attack: 6,
        defense: 3
      },
      AIBehavior.DEFENSIVE,
      0x0000ff // Blue
    );
  }
}
