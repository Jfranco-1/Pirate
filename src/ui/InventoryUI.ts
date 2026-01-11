import Phaser from 'phaser';
import { InventoryManager } from '../systems/InventoryManager';
import { ItemDatabase } from '../systems/ItemDatabase';

/**
 * InventoryUI - Visual display of 5 inventory slots
 *
 * Shows item icons, names, and quantities in bottom-left panel.
 * Follows CombatLog panel pattern (Graphics + Text + Depth 500-501).
 */
export class InventoryUI {
  private scene: Phaser.Scene;
  private inventoryManager: InventoryManager;
  private background: Phaser.GameObjects.Graphics;
  private slotSprites: Phaser.GameObjects.Sprite[] = [];
  private slotTexts: Phaser.GameObjects.Text[] = [];
  private readonly x: number;
  private readonly y: number;
  private readonly slotSize: number = 40;
  private readonly spacing: number = 5;

  constructor(scene: Phaser.Scene, x: number, y: number, inventoryManager: InventoryManager) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.inventoryManager = inventoryManager;

    // Create background panel
    this.background = scene.add.graphics();
    this.background.setDepth(500);  // UI layer

    const panelWidth = this.slotSize * 5 + this.spacing * 6;
    const panelHeight = this.slotSize + this.spacing * 2;

    this.background.fillStyle(0x000000, 0.8);
    this.background.fillRect(x, y, panelWidth, panelHeight);
    this.background.lineStyle(2, 0xffffff);
    this.background.strokeRect(x, y, panelWidth, panelHeight);

    // Create slot backgrounds and labels
    for (let i = 0; i < 5; i++) {
      const slotX = x + this.spacing + i * (this.slotSize + this.spacing);
      const slotY = y + this.spacing;

      // Slot background (dark gray)
      this.background.fillStyle(0x222222, 1);
      this.background.fillRect(slotX, slotY, this.slotSize, this.slotSize);
      this.background.lineStyle(1, 0x666666);
      this.background.strokeRect(slotX, slotY, this.slotSize, this.slotSize);

      // Key label (1-5)
      const keyLabel = scene.add.text(
        slotX + 2,
        slotY + 2,
        `${i + 1}`,
        { fontSize: '10px', color: '#888888' }
      );
      keyLabel.setDepth(501);
      this.slotTexts.push(keyLabel);  // Will update with item data
    }

    // Initial render
    this.render();

    // Subscribe to inventory changes
    this.inventoryManager.onInventoryChange = () => {
      this.render();
    };
  }

  /**
   * Render all inventory slots
   */
  private render(): void {
    // Clear existing slot sprites
    for (const sprite of this.slotSprites) {
      sprite.destroy();
    }
    this.slotSprites = [];

    // Destroy old text objects (except key labels)
    const keyLabels = this.slotTexts.slice(0, 5);
    for (let i = 5; i < this.slotTexts.length; i++) {
      this.slotTexts[i].destroy();
    }
    this.slotTexts = keyLabels;

    const slots = this.inventoryManager.getSlots();

    for (let i = 0; i < 5; i++) {
      const slot = slots[i];
      const slotX = this.x + this.spacing + i * (this.slotSize + this.spacing);
      const slotY = this.y + this.spacing;

      if (slot.itemType !== null) {
        const definition = ItemDatabase.getDefinition(slot.itemType);

        // Create item sprite
        const sprite = this.scene.add.sprite(
          slotX + this.slotSize / 2,
          slotY + this.slotSize / 2,
          'entity'
        );
        sprite.setTint(definition.iconColor);
        sprite.setScale(0.5);  // Smaller for inventory
        sprite.setDepth(501);
        this.slotSprites.push(sprite);

        // Quantity text (bottom-right corner)
        const qtyText = this.scene.add.text(
          slotX + this.slotSize - 8,
          slotY + this.slotSize - 8,
          `x${slot.quantity}`,
          { fontSize: '10px', color: '#ffffff', fontStyle: 'bold' }
        );
        qtyText.setOrigin(1, 1);  // Right-bottom anchor
        qtyText.setDepth(501);
        this.slotTexts.push(qtyText);

        // Item name tooltip (above slot)
        const nameText = this.scene.add.text(
          slotX + this.slotSize / 2,
          slotY - 5,
          definition.name,
          { fontSize: '8px', color: '#cccccc' }
        );
        nameText.setOrigin(0.5, 1);  // Center-bottom anchor
        nameText.setDepth(501);
        this.slotTexts.push(nameText);
      }
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.background.destroy();
    for (const sprite of this.slotSprites) {
      sprite.destroy();
    }
    for (const text of this.slotTexts) {
      text.destroy();
    }
  }
}
