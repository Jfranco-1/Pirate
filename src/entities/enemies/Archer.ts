import Phaser from 'phaser';
import { Enemy } from '../Enemy';
import { AIBehavior } from '../../types';

/**
 * Archer - Ranged enemy
 *
 * Fragile ranged attacker that maintains distance from the player.
 * Higher attack than Goblin but very low HP. Kites the player.
 *
 * Stats: 6 HP, 4 attack, 0 defense
 * Behavior: RANGED (maintain 3-5 tile distance)
 * Color: Yellow
 */
export class Archer extends Enemy {
  constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
    super(
      scene,
      gridX,
      gridY,
      {
        maxHP: 6,
        currentHP: 6,
        attack: 4,
        defense: 0
      },
      AIBehavior.RANGED,
      0xffff00 // Yellow
    );
  }
}
