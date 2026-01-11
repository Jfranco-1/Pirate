import Phaser from 'phaser';
import { WorldItem, ItemType } from '../types';
import { GridManager } from '../systems/GridManager';
import { ItemDatabase } from '../systems/ItemDatabase';

/**
 * WorldItemEntity - Physical item entity on map
 *
 * Similar to Enemy but simpler (no combat, no AI).
 * Has gridX/gridY position and sprite with color tint.
 */
export class WorldItemEntity implements WorldItem {
  gridX: number;
  gridY: number;
  itemType: ItemType;
  sprite: Phaser.GameObjects.Sprite;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, gridX: number, gridY: number, itemType: ItemType) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.itemType = itemType;

    // Create sprite using same 'entity' texture as player/enemies
    const definition = ItemDatabase.getDefinition(itemType);
    this.sprite = scene.add.sprite(0, 0, 'entity');
    this.sprite.setTint(definition.iconColor);
    this.sprite.setScale(0.7);  // Slightly smaller than entities
    this.sprite.setDepth(50);   // Below entities but above floor
  }

  /**
   * Update sprite position based on grid coordinates
   */
  updateSpritePosition(gridManager: GridManager): void {
    const pixelPos = gridManager.gridToPixel({ x: this.gridX, y: this.gridY });
    this.sprite.setPosition(pixelPos.x, pixelPos.y);
  }

  /**
   * Cleanup when picked up
   */
  destroy(): void {
    // Pickup animation: scale up and fade out
    this.scene.tweens.add({
      targets: this.sprite,
      scale: 1.2,
      alpha: 0,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.sprite.destroy();
      }
    });
  }
}
