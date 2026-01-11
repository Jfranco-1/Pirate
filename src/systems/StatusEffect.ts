import { StatusEffect, StatusEffectType } from '../types';

/**
 * StatusEffectFactory - Creates status effect instances
 *
 * Factory methods for creating configured status effects.
 * Centralizes status effect creation and default values.
 */
export class StatusEffectFactory {
  /**
   * Create a poison effect (damage over time)
   */
  static createPoison(potency: number = 2, duration: number = 4): StatusEffect {
    return {
      type: StatusEffectType.POISON,
      duration,
      potency,
      stacks: 1
    };
  }

  /**
   * Create a bleeding effect (stackable damage over time)
   */
  static createBleeding(potency: number = 1, duration: number = 3): StatusEffect {
    return {
      type: StatusEffectType.BLEEDING,
      duration,
      potency,
      stacks: 1
    };
  }

  /**
   * Create a burn effect (high initial DoT)
   */
  static createBurn(potency: number = 3, duration: number = 2): StatusEffect {
    return {
      type: StatusEffectType.BURN,
      duration,
      potency,
      stacks: 1
    };
  }

  /**
   * Create a regeneration effect (healing over time)
   */
  static createRegeneration(potency: number = 2, duration: number = 3): StatusEffect {
    return {
      type: StatusEffectType.REGENERATION,
      duration,
      potency,
      stacks: 1
    };
  }

  /**
   * Create a strength buff (+attack)
   */
  static createStrengthBuff(potency: number = 2, duration: number = 3): StatusEffect {
    return {
      type: StatusEffectType.STRENGTH_BUFF,
      duration,
      potency,
      stacks: 1
    };
  }

  /**
   * Create a defense buff (+defense)
   */
  static createDefenseBuff(potency: number = 2, duration: number = 3): StatusEffect {
    return {
      type: StatusEffectType.DEFENSE_BUFF,
      duration,
      potency,
      stacks: 1
    };
  }

  /**
   * Create a weakness debuff (-attack)
   */
  static createWeakness(potency: number = 2, duration: number = 2): StatusEffect {
    return {
      type: StatusEffectType.WEAKNESS,
      duration,
      potency,
      stacks: 1
    };
  }

  /**
   * Create a vulnerability debuff (-defense)
   */
  static createVulnerability(potency: number = 2, duration: number = 2): StatusEffect {
    return {
      type: StatusEffectType.VULNERABILITY,
      duration,
      potency,
      stacks: 1
    };
  }

  /**
   * Create a stun effect (skip turn)
   */
  static createStun(duration: number = 1): StatusEffect {
    return {
      type: StatusEffectType.STUN,
      duration,
      potency: 0,
      stacks: 1
    };
  }
}
