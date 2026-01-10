import { CombatStats, CombatEntity } from '../types';

/**
 * CombatSystem - Pure combat logic without Phaser dependencies
 *
 * Handles damage calculation and application using simple, predictable formulas
 * for tactical gameplay planning.
 */
export class CombatSystem {
  /**
   * Calculate damage from attacker to defender
   * Formula: Random(1 to (attack - defense))
   * Returns 0 if defense >= attack
   */
  static calculateDamage(attacker: CombatStats, defender: CombatStats): number {
    const baseDamage = attacker.attack - defender.defense;

    // No damage if defense is too high
    if (baseDamage <= 0) {
      return 0;
    }

    // Random damage from 1 to baseDamage (inclusive)
    return Math.floor(Math.random() * baseDamage) + 1;
  }

  /**
   * Apply damage to a target entity
   * Reduces currentHP, clamped to minimum of 0
   */
  static applyDamage(target: CombatEntity, damage: number): void {
    target.stats.currentHP = Math.max(0, target.stats.currentHP - damage);
  }
}
