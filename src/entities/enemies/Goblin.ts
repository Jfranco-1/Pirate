import Phaser from 'phaser';
import { Enemy } from '../Enemy';
import { AIBehavior } from '../../types';

/**
 * Goblin - Aggressive melee enemy
 *
 * Weak, fast-moving enemy that chases the player relentlessly.
 * Low HP and attack, no defense. Dies quickly but can overwhelm in groups.
 *
 * Stats: 8 HP, 3 attack, 0 defense
 * Behavior: AGGRESSIVE (chase and melee attack)
 * Color: Red
 */
export class Goblin extends Enemy {
  constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
    super(
      scene,
      gridX,
      gridY,
      {
        maxHP: 8,
        currentHP: 8,
        attack: 3,
        defense: 0
      },
      AIBehavior.AGGRESSIVE,
      0xff0000 // Red
    );
  }
}
