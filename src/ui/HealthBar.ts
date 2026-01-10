import Phaser from 'phaser';

/**
 * HealthBar - Visual HP indicator above entities
 *
 * Displays current/max HP as a colored bar with text label.
 * Color changes based on HP percentage (green > yellow > red).
 */
export class HealthBar {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private foreground: Phaser.GameObjects.Graphics;
  private text: Phaser.GameObjects.Text;
  private width: number;

  constructor(scene: Phaser.Scene, maxHP: number, currentHP: number, width: number = 28) {
    this.scene = scene;
    this.width = width;

    // Create container to hold all elements
    this.container = scene.add.container(0, 0);
    this.container.setDepth(300); // Above entities, below damage numbers

    // Create background bar (dark gray)
    this.background = scene.add.graphics();
    this.background.fillStyle(0x333333, 1);
    this.background.fillRect(-width / 2, 0, width, 4);
    this.container.add(this.background);

    // Create foreground bar (colored based on HP)
    this.foreground = scene.add.graphics();
    this.container.add(this.foreground);

    // Create HP text label
    this.text = scene.add.text(0, -10, '', {
      fontSize: '10px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.text.setOrigin(0.5, 0.5);
    this.container.add(this.text);

    // Initial draw
    this.update(currentHP, maxHP);
  }

  /**
   * Update health bar to reflect current HP
   */
  update(currentHP: number, maxHP: number): void {
    // Redraw foreground bar
    this.foreground.clear();

    const hpPercent = currentHP / maxHP;
    const barWidth = this.width * hpPercent;

    // Color based on HP percentage
    let color: number;
    if (hpPercent > 0.5) {
      color = 0x00ff00; // Green - healthy
    } else if (hpPercent > 0.25) {
      color = 0xffff00; // Yellow - damaged
    } else {
      color = 0xff0000; // Red - critical
    }

    this.foreground.fillStyle(color, 1);
    this.foreground.fillRect(-this.width / 2, 0, barWidth, 4);

    // Update text
    this.text.setText(`${currentHP}/${maxHP}`);
  }

  /**
   * Move health bar to new position
   */
  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y - 20); // Offset above entity
  }

  /**
   * Cleanup when entity is destroyed
   */
  destroy(): void {
    this.container.destroy();
  }
}
