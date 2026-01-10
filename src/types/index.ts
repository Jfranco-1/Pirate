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
  isAlive(): boolean;
  takeDamage(amount: number): void;
}
