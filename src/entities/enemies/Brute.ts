import Phaser from 'phaser';
import { Enemy } from '../Enemy';
import { AIBehavior, CombatEntity } from '../../types';
import { StatusEffectFactory } from '../../systems/StatusEffect';

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

  /**
   * Override attack to always apply Weakness debuff
   */
  attack(target: CombatEntity): number {
    const damage = super.attack(target);

    // Always apply weakness debuff (-2 attack for 2 turns)
    if (damage > 0) {
      const weakness = StatusEffectFactory.createWeakness(2, 2);
      target.statusManager.applyEffect(weakness);
      target.updateStatusIcons();

      // Log to combat log (if GameScene)
      const gameScene = this.scene as any;
      if (gameScene.combatLog) {
        gameScene.combatLog.addEntry('Brute inflicts Weakness!');
      }
    }

    return damage;
  }
}
