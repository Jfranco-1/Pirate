import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void {
    // No assets to load yet
  }

  create(): void {
    // Add simple text at center of screen
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.add.text(centerX, centerY, 'Metric - Loading...', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);
  }

  update(): void {
    // Empty for now
  }
}
