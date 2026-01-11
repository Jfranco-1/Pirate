import Phaser from 'phaser';
import { Enemy } from '../Enemy';
import { AIBehavior, CombatEntity } from '../../types';
import { StatusEffectFactory } from '../../systems/StatusEffect';

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
        gameScene.combatLog.addEntry('Archer inflicts Poison!');
      }
    }

    return damage;
  }
}
