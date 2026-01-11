import { StatusEffect, StatusEffectType, CombatEntity } from '../types';

/**
 * StatusEffectManager - Manages status effects on an entity
 *
 * Each combat entity owns a StatusEffectManager instance.
 * Handles applying, ticking, and removing status effects.
 */
export class StatusEffectManager {
  private activeEffects: StatusEffect[] = [];
  private entity: CombatEntity;
  public onDamage: ((damage: number) => void) | null = null; // Callback for DoT damage
  public onHeal: ((heal: number) => void) | null = null; // Callback for HoT healing

  constructor(entity: CombatEntity) {
    this.entity = entity;
  }

  /**
   * Apply a status effect to the entity
   */
  applyEffect(effect: StatusEffect): void {
    // Check for existing effect of same type
    const existing = this.activeEffects.find(e => e.type === effect.type);

    if (existing) {
      // Handle stacking rules
      switch (effect.type) {
        case StatusEffectType.BLEEDING:
          // Bleeding stacks (increase stacks, refresh duration)
          existing.stacks = Math.min(existing.stacks + 1, 5); // Max 5 stacks
          existing.duration = Math.max(existing.duration, effect.duration);
          break;

        case StatusEffectType.POISON:
        case StatusEffectType.BURN:
          // Poison/Burn refreshes duration, doesn't stack damage
          existing.duration = Math.max(existing.duration, effect.duration);
          break;

        default:
          // Buffs/debuffs overwrite with new values
          existing.duration = effect.duration;
          existing.potency = effect.potency;
          break;
      }
    } else {
      // Add new effect
      this.activeEffects.push({ ...effect });
    }
  }

  /**
   * Tick all active effects (called at turn start)
   * Returns total damage/healing dealt
   */
  tick(): { damage: number; healing: number } {
    let totalDamage = 0;
    let totalHealing = 0;

    // Process effects in reverse order so we can remove safely
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];

      // Apply effect based on type
      switch (effect.type) {
        case StatusEffectType.POISON:
        case StatusEffectType.BURN:
          // Damage over time
          totalDamage += effect.potency;
          if (this.onDamage) {
            this.onDamage(effect.potency);
          }
          break;

        case StatusEffectType.BLEEDING:
          // Stacking damage over time
          const bleedDamage = effect.potency * effect.stacks;
          totalDamage += bleedDamage;
          if (this.onDamage) {
            this.onDamage(bleedDamage);
          }
          break;

        case StatusEffectType.REGENERATION:
          // Healing over time
          const healing = Math.min(effect.potency, this.entity.stats.maxHP - this.entity.stats.currentHP);
          totalHealing += healing;
          this.entity.stats.currentHP += healing;
          if (this.onHeal) {
            this.onHeal(healing);
          }
          break;

        case StatusEffectType.STRENGTH_BUFF:
        case StatusEffectType.DEFENSE_BUFF:
        case StatusEffectType.WEAKNESS:
        case StatusEffectType.VULNERABILITY:
        case StatusEffectType.STUN:
          // Stat modifiers - no tick effect, just duration countdown
          break;
      }

      // Decrement duration
      effect.duration--;

      // Remove expired effects
      if (effect.duration <= 0) {
        this.activeEffects.splice(i, 1);
      }
    }

    return { damage: totalDamage, healing: totalHealing };
  }

  /**
   * Remove a specific status effect type
   */
  removeEffect(type: StatusEffectType): void {
    const index = this.activeEffects.findIndex(e => e.type === type);
    if (index !== -1) {
      this.activeEffects.splice(index, 1);
    }
  }

  /**
   * Check if entity has a specific status effect
   */
  hasEffect(type: StatusEffectType): boolean {
    return this.activeEffects.some(e => e.type === type);
  }

  /**
   * Get stat modifiers from active buffs/debuffs
   */
  getStatModifiers(): { attack: number; defense: number } {
    let attack = 0;
    let defense = 0;

    for (const effect of this.activeEffects) {
      switch (effect.type) {
        case StatusEffectType.STRENGTH_BUFF:
          attack += effect.potency;
          break;
        case StatusEffectType.WEAKNESS:
          attack -= effect.potency;
          break;
        case StatusEffectType.DEFENSE_BUFF:
          defense += effect.potency;
          break;
        case StatusEffectType.VULNERABILITY:
          defense -= effect.potency;
          break;
      }
    }

    return { attack, defense };
  }

  /**
   * Get all active effects (for UI display)
   */
  getActiveEffects(): StatusEffect[] {
    return [...this.activeEffects];
  }

  /**
   * Clear all status effects (e.g., on death)
   */
  clear(): void {
    this.activeEffects = [];
  }

  /**
   * Check if stunned (for future turn skipping)
   */
  isStunned(): boolean {
    return this.hasEffect(StatusEffectType.STUN);
  }
}
