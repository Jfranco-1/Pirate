import Phaser from 'phaser';

/**
 * FloatingText - Utility for creating animated floating text (damage numbers, etc.)
 *
 * Static utility class - no instantiation needed.
 * Creates text that floats upward and fades out.
 */
export class FloatingText {
  /**
   * Create floating text with upward animation and fade
   */
  static create(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    color: string = '#ffffff'
  ): Phaser.GameObjects.Text {
    // Create text object
    const textObj = scene.add.text(x, y, text, {
      fontSize: '24px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    textObj.setOrigin(0.5, 0.5);
    textObj.setDepth(400); // Above health bars

    // Animate: float upward and fade out
    scene.tweens.add({
      targets: textObj,
      y: textObj.y - 40,          // Float upward 40px
      alpha: 0,                    // Fade to invisible
      duration: 800,               // 0.8 seconds
      ease: 'Quad.easeOut',       // Natural deceleration
      onComplete: () => {
        textObj.destroy();         // Cleanup when done
      }
    });

    return textObj;
  }
}
