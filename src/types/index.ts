// Grid position in tile coordinates (not pixels)
export interface GridPosition {
  x: number;
  y: number;
}

// Entity with grid-based position
export interface Entity {
  gridX: number;
  gridY: number;
}

// Combat statistics for entities
export interface CombatStats {
  maxHP: number;
  currentHP: number;
  attack: number;
  defense: number;
}

// Entity with combat capabilities
export interface CombatEntity extends Entity {
  stats: CombatStats;
  statusManager: any; // Using any to avoid circular dependency with StatusEffectManager
  isAlive(): boolean;
  takeDamage(amount: number): void;
  updateStatusIcons(): void;
}

// AI behavior patterns for enemies
export enum AIBehavior {
  AGGRESSIVE,  // Chase player, melee attack
  RANGED,      // Maintain distance, attack from range
  DEFENSIVE    // Only attack when adjacent
}

// Turn-based game state
export enum TurnState {
  PLAYER_TURN,
  ENEMY_TURN
}

// Status effect types for combat
export enum StatusEffectType {
  POISON,          // DoT (damage over time)
  BLEEDING,        // DoT that stacks
  BURN,            // DoT, higher initial damage
  REGENERATION,    // HoT (healing over time)
  STRENGTH_BUFF,   // +attack
  DEFENSE_BUFF,    // +defense
  WEAKNESS,        // -attack
  VULNERABILITY,   // -defense
  STUN             // Skip turn (future)
}

// Status effect data structure
export interface StatusEffect {
  type: StatusEffectType;
  duration: number;      // Turns remaining
  potency: number;       // Damage/heal per turn OR stat modifier
  stacks: number;        // How many stacks (for bleeding)
}

// Item type enumeration
export enum ItemType {
  HEALTH_POTION,
  STRENGTH_POTION,
  DEFENSE_POTION,
  POISON_BOMB,
  FIRE_BOMB
}

// Item category for behavior handling
export enum ItemCategory {
  INSTANT_CONSUMABLE,  // Use immediately on player (health potion)
  BUFF_CONSUMABLE,     // Apply buff status effect to player
  THROWABLE            // Requires target selection
}

// Item metadata definition
export interface ItemDefinition {
  type: ItemType;
  name: string;
  category: ItemCategory;
  description: string;
  iconColor: number;
  maxStack: number;

  // Effect parameters (optional based on category)
  healAmount?: number;
  buffType?: StatusEffectType;
  buffDuration?: number;
  buffPotency?: number;
  throwEffect?: StatusEffectType;
  throwPotency?: number;
  throwDuration?: number;
}

// Inventory slot data
export interface InventorySlot {
  itemType: ItemType | null;
  quantity: number;
}

// World item entity (physical item on map)
export interface WorldItem extends Entity {
  itemType: ItemType;
  sprite: Phaser.GameObjects.Sprite;
}

// Game state for targeting mode
export enum GameState {
  NORMAL,
  TARGETING
}
