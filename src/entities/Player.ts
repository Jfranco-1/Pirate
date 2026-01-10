import Phaser from 'phaser';
import { Entity, GridPosition } from '../types';
import { GridManager } from '../systems/GridManager';

export class Player implements Entity {
  gridX: number;
  gridY: number;
  private sprite: Phaser.GameObjects.Sprite;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;

    // Create sprite with placeholder (no texture yet)
    this.sprite = scene.add.sprite(0, 0, '');
    this.sprite.setTint(0x00ff00); // Green for visibility
    this.sprite.setDisplaySize(28, 28); // Slightly smaller than 32x32 tile
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
  }
}
