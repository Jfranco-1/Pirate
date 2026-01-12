import Phaser from 'phaser';
import { CombatEntity, CombatStats, GridPosition, StatusEffectType } from '../types';
import { GridManager } from '../systems/GridManager';
import { CombatSystem } from '../systems/CombatSystem';
import { HealthBar } from '../ui/HealthBar';
import { StatusEffectManager } from '../systems/StatusEffectManager';
import { StatusIcon } from '../ui/StatusIcon';

export class Player implements CombatEntity {
  gridX: number;
  gridY: number;
  stats: CombatStats;
  sprite: Phaser.GameObjects.Sprite;
  private scene: Phaser.Scene;
  private healthBar: HealthBar;
  public statusManager: StatusEffectManager;
  private statusIcons: Map<StatusEffectType, StatusIcon> = new Map();

  constructor(scene: Phaser.Scene, gridX: number, gridY: number, startingStats?: CombatStats, color: number = 0x00ff00) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;

    // Initialize combat stats (can be overridden by meta-progression/class selection)
    this.stats = startingStats ?? {
      maxHP: 20,
      currentHP: 20,
      attack: 5,
      defense: 2
    };

    // Create sprite with entity texture (color based on class)
    this.sprite = scene.add.sprite(0, 0, 'entity');
    this.sprite.setTint(color);

    // Create health bar
    this.healthBar = new HealthBar(scene, this.stats.maxHP, this.stats.currentHP);

    // Create status effect manager
    this.statusManager = new StatusEffectManager(this);
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

    // Update status icon positions
    this.updateStatusIconPositions(pixelPos.x, pixelPos.y);
  }

  /**
   * Update status icon visuals based on active effects
   */
  updateStatusIcons(): void {
    const activeEffects = this.statusManager.getActiveEffects();
    const activeTypes = new Set(activeEffects.map(e => e.type));

    // Remove icons for effects that are no longer active
    for (const [type, icon] of this.statusIcons.entries()) {
      if (!activeTypes.has(type)) {
        icon.destroy();
        this.statusIcons.delete(type);
      }
    }

    // Add/update icons for active effects
    let iconIndex = 0;
    for (const effect of activeEffects) {
      let icon = this.statusIcons.get(effect.type);

      if (!icon) {
        // Create new icon
        const pixelX = this.sprite.x - 12 + (iconIndex * 10);
        const pixelY = this.sprite.y - 25;
        icon = new StatusIcon(this.scene, effect.type, pixelX, pixelY);
        this.statusIcons.set(effect.type, icon);
      }

      // Update stacks for bleeding
      if (effect.type === StatusEffectType.BLEEDING) {
        icon.setStacks(effect.stacks);
      }

      iconIndex++;
    }
  }

  /**
   * Update positions of all status icons
   */
  private updateStatusIconPositions(x: number, y: number): void {
    let iconIndex = 0;
    for (const icon of this.statusIcons.values()) {
      const iconX = x - 12 + (iconIndex * 10);
      const iconY = y - 25;
      icon.setPosition(iconX, iconY);
      iconIndex++;
    }
  }

  isAlive(): boolean {
    return this.stats.currentHP > 0;
  }

  takeDamage(amount: number): void {
    CombatSystem.applyDamage(this, amount);
    this.healthBar.update(this.stats.currentHP, this.stats.maxHP);

    // Camera shake on damage (intensity scales with damage)
    if (amount > 0) {
      const intensity = 0.003 + (amount * 0.001);
      this.scene.cameras.main.shake(200, intensity);
    }

    // Sprite flash effect
    this.scene.tweens.add({
      targets: this.sprite,
      tint: 0xffffff, // Flash white
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut'
    });

    if (!this.isAlive()) {
      // Red flash on death
      this.scene.cameras.main.flash(300, 255, 0, 0);
      this.healthBar.destroy();
      this.sprite.destroy();

      // Clean up status icons
      for (const icon of this.statusIcons.values()) {
        icon.destroy();
      }
      this.statusIcons.clear();
    }
  }

  attack(target: CombatEntity): number {
    // Get stat modifiers from status effects
    const attackerMods = this.statusManager.getStatModifiers();
    const defenderMods = target.statusManager?.getStatModifiers() || { attack: 0, defense: 0 };

    const damage = CombatSystem.calculateDamage(this.stats, target.stats, attackerMods, defenderMods);
    target.takeDamage(damage);
    return damage;
  }
}
