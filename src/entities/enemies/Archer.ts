import Phaser from 'phaser';
import { Enemy } from '../Enemy';
import { AIBehavior, CombatEntity } from '../../types';
import { StatusEffectFactory } from '../../systems/StatusEffect';

/**
 * Musketeer - Armada ranged soldier
 *
 * Armada ranged attacker with musket. Maintains distance, deadly accurate.
 * Higher attack but fragile. Kites aggressively.
 *
 * Stats: 6 HP, 4 attack, 0 defense
 * Behavior: RANGED (maintain 3-5 tile distance)
 * Sprite: enemy_musketeer (blue coat, tricorn hat)
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
      0x2255bb, // Blue (fallback)
      'enemy_musketeer'
    );
  }

  /**
   * Override attack to add 20% chance of applying Poison
   */
  attack(target: CombatEntity): number {
    const damage = super.attack(target);

    // 20% chance to apply poison (DoT)
    if (damage > 0 && Math.random() < 0.2) {
      const poison = StatusEffectFactory.createPoison(2, 4);
      target.statusManager.applyEffect(poison);
      target.updateStatusIcons();

      // Log to combat log (if GameScene)
      const gameScene = this.scene as any;
      if (gameScene.combatLog) {
        gameScene.combatLog.addEntry('Musketeer\'s shot poisons you!');
      }
    }

    return damage;
  }
}
