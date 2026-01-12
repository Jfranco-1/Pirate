import { ItemType, ItemCategory, ItemDefinition, StatusEffectType } from '../types';

/**
 * ItemDatabase - Central repository for item metadata
 *
 * Static utility class providing item definitions.
 * Similar to StatusEffectFactory pattern.
 */
export class ItemDatabase {
  private static readonly items: Map<ItemType, ItemDefinition> = new Map([
    [ItemType.HEALTH_POTION, {
      type: ItemType.HEALTH_POTION,
      name: 'Health Potion',
      category: ItemCategory.INSTANT_CONSUMABLE,
      description: 'Restores 8 HP',
      iconColor: 0xff0000,  // Red
      maxStack: 5,
      healAmount: 8
    }],

    [ItemType.STRENGTH_POTION, {
      type: ItemType.STRENGTH_POTION,
      name: 'Strength Potion',
      category: ItemCategory.BUFF_CONSUMABLE,
      description: '+3 ATK for 3 turns',
      iconColor: 0xff6600,  // Orange
      maxStack: 3,
      buffType: StatusEffectType.STRENGTH_BUFF,
      buffDuration: 3,
      buffPotency: 3
    }],

    [ItemType.DEFENSE_POTION, {
      type: ItemType.DEFENSE_POTION,
      name: 'Defense Potion',
      category: ItemCategory.BUFF_CONSUMABLE,
      description: '+3 DEF for 3 turns',
      iconColor: 0x0088ff,  // Blue
      maxStack: 3,
      buffType: StatusEffectType.DEFENSE_BUFF,
      buffDuration: 3,
      buffPotency: 3
    }],

    [ItemType.POISON_BOMB, {
      type: ItemType.POISON_BOMB,
      name: 'Poison Bomb',
      category: ItemCategory.THROWABLE,
      description: 'Throw: 2 dmg/turn, 4 turns',
      iconColor: 0x00ff00,  // Green
      maxStack: 3,
      throwEffect: StatusEffectType.POISON,
      throwPotency: 2,
      throwDuration: 4
    }],

    [ItemType.FIRE_BOMB, {
      type: ItemType.FIRE_BOMB,
      name: 'Fire Bomb',
      category: ItemCategory.THROWABLE,
      description: 'Throw: 3 dmg/turn, 3 turns',
      iconColor: 0xff4400,  // Orange-red
      maxStack: 3,
      throwEffect: StatusEffectType.BURN,
      throwPotency: 3,
      throwDuration: 3
    }]
  ]);

  /**
   * Get item definition by type
   */
  static getDefinition(type: ItemType): ItemDefinition {
    const item = this.items.get(type);
    if (!item) {
      throw new Error(`Unknown item type: ${type}`);
    }
    return item;
  }

  /**
   * Get random item type for spawning
   */
  static getRandomItemType(): ItemType {
    const types = Array.from(this.items.keys());
    const index = Math.floor(Math.random() * types.length);
    return types[index];
  }

  /**
   * Get random item type with optional unlock gating.
   * If the filter would exclude all items, falls back to any item.
   */
  static getRandomItemTypeWithFilter(isAllowed?: (type: ItemType) => boolean): ItemType {
    const all = Array.from(this.items.keys());
    if (!isAllowed) {
      return all[Math.floor(Math.random() * all.length)];
    }
    const filtered = all.filter(isAllowed);
    const pool = filtered.length ? filtered : all;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
