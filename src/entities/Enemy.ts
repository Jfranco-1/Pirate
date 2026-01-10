import Phaser from 'phaser';
import { CombatEntity, CombatStats, AIBehavior } from '../types';
import { GridManager } from '../systems/GridManager';
import { CombatSystem } from '../systems/CombatSystem';
import { Player } from './Player';
import { AISystem } from '../systems/AISystem';
import { HealthBar } from '../ui/HealthBar';

/**
 * Base Enemy class with combat and AI capabilities
 *
 * Enemies use behavior patterns (AGGRESSIVE, RANGED, DEFENSIVE) to determine
 * their actions during combat. Extends CombatEntity for combat symmetry with Player.
 */
export class Enemy implements CombatEntity {
  gridX: number;
  gridY: number;
  stats: CombatStats;
  behavior: AIBehavior;
  sprite: Phaser.GameObjects.Sprite;
  protected scene: Phaser.Scene;
  private healthBar: HealthBar;

  constructor(
    scene: Phaser.Scene,
    gridX: number,
    gridY: number,
    stats: CombatStats,
    behavior: AIBehavior,
    color: number
  ) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.stats = stats;
    this.behavior = behavior;

    // Create sprite with entity texture and color tint
    this.sprite = scene.add.sprite(0, 0, 'entity');
    this.sprite.setTint(color);

    // Create health bar
    this.healthBar = new HealthBar(scene, stats.maxHP, stats.currentHP);
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

  moveTo(gridX: number, gridY: number): void {
    this.gridX = gridX;
    this.gridY = gridY;
  }

  updateSpritePosition(gridManager: GridManager): void {
    const pixelPos = gridManager.gridToPixel({ x: this.gridX, y: this.gridY });
    this.sprite.setPosition(pixelPos.x, pixelPos.y);
    this.healthBar.setPosition(pixelPos.x, pixelPos.y);
  }

  /**
   * AI decision-making using AISystem
   */
  selectAction(player: Player, map: number[][], gridManager: GridManager): void {
    AISystem.selectAction(this, player, map);
    // Update sprite position after AI moves
    this.updateSpritePosition(gridManager);
  }
}
