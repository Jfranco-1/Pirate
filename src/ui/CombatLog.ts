import Phaser from 'phaser';

/**
 * CombatLog - Scrolling message history for combat actions
 *
 * Displays recent combat messages in bottom-right corner.
 * Oldest messages scroll up and fade out.
 */
export class CombatLog {
  private scene: Phaser.Scene;
  private background: Phaser.GameObjects.Graphics;
  private entries: string[] = [];
  private textObjects: Phaser.GameObjects.Text[] = [];
  private readonly maxEntries: number;
  private readonly x: number;
  private readonly y: number;
  private readonly width: number;
  private readonly height: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    maxEntries: number = 5
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.maxEntries = maxEntries;

    // Create background panel
    this.background = scene.add.graphics();
    this.background.setDepth(500); // UI layer

    // Draw panel
    this.background.fillStyle(0x000000, 0.8);
    this.background.fillRect(x, y, width, height);
    this.background.lineStyle(2, 0xffffff);
    this.background.strokeRect(x, y, width, height);
  }

  /**
   * Add a message to the combat log
   */
  addEntry(message: string): void {
    // Add to front of entries
    this.entries.unshift(message);

    // Limit entries to maxEntries
    if (this.entries.length > this.maxEntries) {
      this.entries.pop();
    }

    // Redraw all text
    this.redraw();
  }

  /**
   * Clear all messages
   */
  clear(): void {
    this.entries = [];
    this.redraw();
  }

  /**
   * Redraw all text objects
   */
  private redraw(): void {
    // Destroy existing text objects
    for (const textObj of this.textObjects) {
      textObj.destroy();
    }
    this.textObjects = [];

    // Create new text objects for each entry
    for (let i = 0; i < this.entries.length; i++) {
      const textObj = this.scene.add.text(
        this.x + 10,
        this.y + 10 + (i * 20),
        this.entries[i],
        {
          fontSize: '12px',
          color: '#ffffff',
          wordWrap: { width: this.width - 20 }
        }
      );
      textObj.setDepth(501); // Above panel
      this.textObjects.push(textObj);
    }
  }

  /**
   * Cleanup when destroyed
   */
  destroy(): void {
    this.background.destroy();
    for (const textObj of this.textObjects) {
      textObj.destroy();
    }
  }
}
