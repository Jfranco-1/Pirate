import Phaser from 'phaser';
import * as ROT from 'rot-js';
import { GridManager } from '../systems/GridManager';

export class GameScene extends Phaser.Scene {
  private map: number[][] = [];
  private gridManager!: GridManager;
  private graphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void {
    // No assets to load yet
  }

  create(): void {
    // Initialize grid manager (25x18 tiles for 800x600 canvas)
    this.gridManager = new GridManager(25, 18);

    // Generate dungeon with Rot.js Digger algorithm
    const digger = new ROT.Map.Digger(25, 18);
    digger.create((x, y, value) => {
      if (!this.map[y]) {
        this.map[y] = [];
      }
      this.map[y][x] = value;
    });

    // Initialize graphics for rendering
    this.graphics = this.add.graphics();

    // Render the dungeon
    this.renderMap();
  }

  private renderMap(): void {
    this.graphics.clear();

    // Loop through map array and render tiles
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        const pixelPos = this.gridManager.gridToPixel({ x, y });
        const pixelX = pixelPos.x - 16; // Center offset (32/2)
        const pixelY = pixelPos.y - 16;

        if (this.map[y][x] === 1) {
          // Wall - gray
          this.graphics.fillStyle(0x555555, 1);
        } else {
          // Floor - dark gray
          this.graphics.fillStyle(0x222222, 1);
        }

        this.graphics.fillRect(pixelX, pixelY, 32, 32);

        // Add 1px border
        this.graphics.lineStyle(1, 0x000000);
        this.graphics.strokeRect(pixelX, pixelY, 32, 32);
      }
    }
  }

  update(): void {
    // Empty for now
  }
}
