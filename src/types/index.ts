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

// Room type for dungeon generation
export enum RoomType {
  START,      // Player spawn room
  NORMAL,     // Standard room
  BOSS,       // Boss encounter room
  TREASURE,   // Item-rich room
  CHALLENGE   // Multiple enemies room
}

// Room theme for visual variety
export enum RoomTheme {
  DUNGEON,    // Stone dungeon aesthetic
  CAVE,       // Organic cave aesthetic
  CRYPT,      // Undead/tomb aesthetic
  LIBRARY     // Books/knowledge aesthetic
}

// Room metadata for procedural generation
export interface RoomData {
  x: number;              // Left coordinate
  y: number;              // Top coordinate
  width: number;          // Width in tiles
  height: number;         // Height in tiles
  type: RoomType;         // Room purpose
  theme: RoomTheme;       // Visual theme
  difficulty: number;     // 1-5 difficulty rating
  connections: number[];  // Indices of connected rooms
}

// --- Meta-progression ---

// Playable character classes (persistent unlocks) - Legacy
export enum CharacterClass {
  WARRIOR,
  ROGUE,
  GUARDIAN
}

// --- Pirate Theme Types ---

// Ship factions (for ship combat encounters)
export enum ShipFaction {
  GILDED_ARMADA,    // Pale Messenger influenced (unknowingly)
  DROWNED_FLEET,    // Drowned Sovereign servants
  FREE_CAPTAIN,     // Independent pirates
  MONASTERY         // Neutral truth-seekers
}

// Pirate character classes
export enum PirateClass {
  DUELIST,          // Combat focus - high damage, low defense
  QUARTERMASTER,    // Trade focus - buffs, economy bonuses
  NAVIGATOR,        // Exploration focus - reveal secrets, mobility
  CHAPLAIN          // Knowledge focus - rituals, insight bonuses
}

// Insight thresholds for revelation system
export enum InsightThreshold {
  IGNORANCE = 0,      // 0-29: Surface level understanding
  SUSPICION = 30,     // 30-49: Start noticing patterns
  UNDERSTANDING = 50, // 50-69: Structural awareness
  TRUE_SIGHT = 70,    // 70-89: See hidden truths
  TRANSCENDENCE = 90  // 90-100: Reality layers visible
}

// Curse manifestation types (based on playstyle)
export enum CurseManifestation {
  COMBAT,       // Combat-heavy players - bloodthirst, feared by traders
  TRADE,        // Trade-focused players - compulsion, trust erosion
  EXPLORATION,  // Exploration-focused players - spatial distortion, fragile
  BALANCED      // Mixed playstyle - mild effects across all
}

// Curse state (per-run, resets on death)
export interface CurseState {
  stage: number;           // 1-5 curse intensity
  manifestation: CurseManifestation;
  daysRemaining: number;   // Until blood moon deadline
  playstyleScores: {
    combat: number;
    trade: number;
    exploration: number;
  };
}

// Insight state (per-run)
export interface InsightState {
  current: number;         // 0-100
  history: InsightEvent[];
}

export interface InsightEvent {
  source: string;          // What caused the gain
  amount: number;
  timestamp: number;
}

// Paranoia state (unlocks after Pale Messenger discovery)
export interface ParanoiaState {
  current: number;         // 0-100
  discovered: boolean;     // Has player discovered Pale Messenger?
  floor: number;           // Minimum paranoia (20 after discovery)
}

// Pale Attention state (profile-level persistence - NEVER fully resets)
export interface PaleAttentionState {
  current: number;         // 0-100
  floor: number;           // Permanent minimum (locks at thresholds 20/40/60/80/100)
  lastThresholdCrossed: number;
}

// Ship deck area types (replaces RoomType for ship combat)
export enum ShipAreaType {
  TOP_DECK,       // Exposed, ranged combat advantage
  MID_DECK,       // Crew quarters, tight corridors
  LOWER_DECK,     // Cargo hold, captain's quarters
  HIDDEN_SHRINE,  // Pale Messenger shrine (Armada ships, high insight)
  UNDERWATER,     // Drowned Fleet special areas
  SMUGGLER_HOLD   // Free Captain hidden compartments
}

// Tile visibility requirements for insight-gated content
export interface TileVisibility {
  alwaysVisible: boolean;
  insightRequired: InsightThreshold;
  revealedBySearch: boolean;  // Can be found by searching even at low insight
}

// Extended room data for ship combat
export interface ShipAreaData {
  x: number;
  y: number;
  z: number;              // Deck level (0 = top, 1 = mid, 2 = lower)
  width: number;
  height: number;
  areaType: ShipAreaType;
  faction: ShipFaction;
  visibility: TileVisibility;
  difficulty: number;
  connections: number[];  // Connected areas
  lootTable?: string[];   // Possible loot in this area
  secretId?: string;      // ID of secret content (for insight revelation)
}

// Lore text entry for discovery system
export interface LoreEntry {
  id: string;
  title: string;
  content: string;
  insightGain: number;          // Insight gained from reading
  paleAttentionGain: number;    // Attention gained (if mentions Pale Messenger)
  category: 'history' | 'journal' | 'mythology' | 'technical' | 'forbidden';
  translationRequired: boolean;  // Needs translation fragments
  fragmentsNeeded: number;       // How many translation fragments
}

// Journal entry for player's conspiracy board
export interface JournalEntry {
  id: string;
  source: string;           // Where info came from
  content: string;
  timestamp: number;
  reliability: number;      // 0-100% confidence
  contradicts?: string[];   // IDs of contradicting entries
  confirms?: string[];      // IDs of confirming entries
}

// Extended save data for pirate theme (profile-level)
export interface PirateSaveData {
  // Profile-level (persists across deaths - THE GAZE LINGERS)
  paleAttention: PaleAttentionState;
  awarenessThresholdCrossed: boolean;  // Has EVER discovered Pale Messenger
  loreDiscovered: string[];            // IDs of texts read across all runs
  translationProgress: Record<string, number>;  // Ancient text translation %
  
  // These reset on death but inform next run
  highestInsightReached: number;
  runsWithPaleKnowledge: number;
}

// Persistent upgrade identifiers
export type MetaUpgradeId = 'MAX_HP' | 'ATTACK' | 'DEFENSE';

export interface MetaLifetimeStats {
  runsStarted: number;
  runsEnded: number;
  enemiesKilled: number;
  currencyEarned: number;
}

export interface MetaSaveData {
  version: number;
  currency: number;
  upgrades: Record<MetaUpgradeId, number>;
  unlockedItems: ItemType[];
  unlockedClasses: CharacterClass[];
  selectedClass: CharacterClass;
  lifetime: MetaLifetimeStats;
}
