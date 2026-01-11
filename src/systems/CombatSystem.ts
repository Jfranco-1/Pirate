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
   *
   * Accepts optional stat modifiers from status effects (buffs/debuffs)
   */
  static calculateDamage(
    attacker: CombatStats,
    defender: CombatStats,
    attackerMods: { attack: number; defense: number } = { attack: 0, defense: 0 },
    defenderMods: { attack: number; defense: number } = { attack: 0, defense: 0 }
  ): number {
    const modifiedAttack = attacker.attack + attackerMods.attack;
    const modifiedDefense = defender.defense + defenderMods.defense;
    const baseDamage = modifiedAttack - modifiedDefense;

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
