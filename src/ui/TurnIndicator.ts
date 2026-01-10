import Phaser from 'phaser';

/**
 * TurnIndicator - Shows whose turn it is (player vs enemy)
 *
 * Displays at top-center with pulsing animation during player turn.
 */
export class TurnIndicator {
  private scene: Phaser.Scene;
  private text: Phaser.GameObjects.Text;
  private pulseTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    // Create text object
    this.text = scene.add.text(x, y, '', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.text.setOrigin(0.5, 0); // Center horizontally
    this.text.setDepth(500); // UI layer

    // Start in player turn state
    this.setPlayerTurn();
  }

  /**
   * Set to player turn state (green, pulsing)
   */
  setPlayerTurn(): void {
    this.text.setText('YOUR TURN');
    this.text.setColor('#00ff00'); // Green

    // Stop existing tween if any
    if (this.pulseTween) {
      this.pulseTween.stop();
    }

    // Start pulsing animation
    this.pulseTween = this.scene.tweens.add({
      targets: this.text,
      scale: { from: 1.0, to: 1.15 },
      duration: 800,
      yoyo: true,
      repeat: -1, // Infinite loop
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Set to enemy turn state (red, static)
   */
  setEnemyTurn(): void {
    this.text.setText('ENEMIES ACTING...');
    this.text.setColor('#ff0000'); // Red

    // Stop pulsing animation
    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = null;
    }

    // Reset scale
    this.text.setScale(1.0);
  }

  /**
   * Cleanup when destroyed
   */
  destroy(): void {
    if (this.pulseTween) {
      this.pulseTween.stop();
    }
    this.text.destroy();
  }
}
