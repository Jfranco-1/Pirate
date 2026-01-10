import Phaser from 'phaser';
import * as ROT from 'rot-js';
import { GridManager } from '../systems/GridManager';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Goblin } from '../entities/enemies/Goblin';
import { Archer } from '../entities/enemies/Archer';
import { Brute } from '../entities/enemies/Brute';
import { TurnManager } from '../systems/TurnManager';

export class GameScene extends Phaser.Scene {
  private map: number[][] = [];
  private gridManager!: GridManager;
  private graphics!: Phaser.GameObjects.Graphics;
  private player: Player | null = null;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private wasdKeys: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key } | undefined;
  private enemies: Enemy[] = [];
  private turnManager: TurnManager | null = null;
  private gameOverText: Phaser.GameObjects.Text | null = null;

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

    // Find starting position (first floor tile)
    let startX = 0;
    let startY = 0;
    outerLoop: for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        if (this.map[y][x] === 0) {
          startX = x;
          startY = y;
          break outerLoop;
        }
      }
    }

    // Create player
    this.player = new Player(this, startX, startY);
    this.player.updateSpritePosition(this.gridManager);

    // Create turn manager
    this.turnManager = new TurnManager();

    // Spawn 3-5 enemies randomly on floor tiles
    const numEnemies = Phaser.Math.Between(3, 5);
    for (let i = 0; i < numEnemies; i++) {
      // Find random floor tile not occupied by player
      let enemyX = 0;
      let enemyY = 0;
      let attempts = 0;
      while (attempts < 100) {
        enemyX = Phaser.Math.Between(0, this.map[0].length - 1);
        enemyY = Phaser.Math.Between(0, this.map.length - 1);

        // Check if floor tile and not player position
        if (this.map[enemyY][enemyX] === 0 &&
            (enemyX !== this.player.gridX || enemyY !== this.player.gridY)) {
          break;
        }
        attempts++;
      }

      // Randomly choose enemy type
      const enemyType = Phaser.Math.Between(0, 2);
      let enemy: Enemy;

      if (enemyType === 0) {
        enemy = new Goblin(this, enemyX, enemyY);
      } else if (enemyType === 1) {
        enemy = new Archer(this, enemyX, enemyY);
      } else {
        enemy = new Brute(this, enemyX, enemyY);
      }

      enemy.updateSpritePosition(this.gridManager);
      this.enemies.push(enemy);
      this.turnManager.addEnemy(enemy);
    }

    // Setup keyboard input
    this.cursors = this.input.keyboard?.createCursorKeys();
    if (this.input.keyboard) {
      this.wasdKeys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D
      }) as { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
    }
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
    if (!this.player || !this.cursors || !this.turnManager) return;

    // Check if player is dead
    if (!this.player.isAlive()) {
      if (!this.gameOverText) {
        this.gameOverText = this.add.text(
          400, 300,
          'Game Over',
          { fontSize: '48px', color: '#ff0000' }
        ).setOrigin(0.5);
      }
      return; // Stop accepting input
    }

    // Only allow input during player turn
    if (!this.turnManager.isPlayerTurn()) return;

    let playerMoved = false;

    // Check for arrow key or WASD input using JustDown to prevent repeat firing
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        (this.wasdKeys && Phaser.Input.Keyboard.JustDown(this.wasdKeys.W))) {
      playerMoved = this.handlePlayerMove(0, -1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
               (this.wasdKeys && Phaser.Input.Keyboard.JustDown(this.wasdKeys.S))) {
      playerMoved = this.handlePlayerMove(0, 1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
               (this.wasdKeys && Phaser.Input.Keyboard.JustDown(this.wasdKeys.A))) {
      playerMoved = this.handlePlayerMove(-1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) ||
               (this.wasdKeys && Phaser.Input.Keyboard.JustDown(this.wasdKeys.D))) {
      playerMoved = this.handlePlayerMove(1, 0);
    }

    // If player successfully moved, end player turn
    if (playerMoved) {
      this.turnManager.endPlayerTurn(this.player, this.map);

      // Remove dead enemies after enemy turn
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        if (!enemy.isAlive()) {
          enemy.sprite.destroy();
          this.enemies.splice(i, 1);
        }
      }
    }
  }

  private handlePlayerMove(dx: number, dy: number): boolean {
    if (!this.player) return false;

    const newX = this.player.gridX + dx;
    const newY = this.player.gridY + dy;

    // Check if target position has an enemy
    const targetEnemy = this.enemies.find(e => e.gridX === newX && e.gridY === newY && e.isAlive());

    if (targetEnemy) {
      // Attack the enemy
      this.player.attack(targetEnemy);
      return true; // Count as a successful action
    } else {
      // Try to move
      if (this.player.move(dx, dy, this.map)) {
        this.player.updateSpritePosition(this.gridManager);
        return true;
      }
    }

    return false;
  }
}
