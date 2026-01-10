import Phaser from 'phaser';
import { CombatEntity, CombatStats, GridPosition } from '../types';
import { GridManager } from '../systems/GridManager';
import { CombatSystem } from '../systems/CombatSystem';
import { HealthBar } from '../ui/HealthBar';

export class Player implements CombatEntity {
  gridX: number;
  gridY: number;
  stats: CombatStats;
  sprite: Phaser.GameObjects.Sprite;
  private scene: Phaser.Scene;
  private healthBar: HealthBar;

  constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;

    // Initialize combat stats: 20 HP, 5 attack, 2 defense
    this.stats = {
      maxHP: 20,
      currentHP: 20,
      attack: 5,
      defense: 2
    };

    // Create sprite with entity texture (green for player)
    this.sprite = scene.add.sprite(0, 0, 'entity');
    this.sprite.setTint(0x00ff00); // Green for visibility

    // Create health bar
    this.healthBar = new HealthBar(scene, this.stats.maxHP, this.stats.currentHP);
  }

  move(dx: number, dy: number, map: number[][]): boolean {
    const newX = this.gridX + dx;
    const newY = this.gridY + dy;

    // Validate bounds and walkability
    if (newY >= 0 && newY < map.length &&
        newX >= 0 && newX < map[newY].length &&
        map[newY][newX] === 0) {
      // Valid move - update position
      this.gridX = newX;
      this.gridY = newY;
      return true;
    }

    // Invalid move - blocked
    return false;
  }

  getGridPosition(): GridPosition {
    return { x: this.gridX, y: this.gridY };
  }

  updateSpritePosition(gridManager: GridManager): void {
    const pixelPos = gridManager.gridToPixel({ x: this.gridX, y: this.gridY });
    this.sprite.setPosition(pixelPos.x, pixelPos.y);
    this.healthBar.setPosition(pixelPos.x, pixelPos.y);
  }

  isAlive(): boolean {
    return this.stats.currentHP > 0;
  }

  takeDamage(amount: number): void {
    CombatSystem.applyDamage(this, amount);
    this.healthBar.update(this.stats.currentHP, this.stats.maxHP);
    if (!this.isAlive()) {
      this.healthBar.destroy();
      this.sprite.destroy();
    }
  }

  attack(target: CombatEntity): number {
    const damage = CombatSystem.calculateDamage(this.stats, target.stats);
    target.takeDamage(damage);
    return damage;
  }
}
