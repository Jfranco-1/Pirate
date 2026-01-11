import { ItemType, InventorySlot } from '../types';
import { ItemDatabase } from './ItemDatabase';

/**
 * InventoryManager - Player inventory with 5 slots and stacking
 *
 * Handles adding items (with stacking), removing items,
 * and checking inventory state.
 */
export class InventoryManager {
  private slots: InventorySlot[] = [];
  private readonly maxSlots: number = 5;
  public onInventoryChange: (() => void) | null = null;  // UI update callback

  constructor() {
    // Initialize 5 empty slots
    for (let i = 0; i < this.maxSlots; i++) {
      this.slots.push({ itemType: null, quantity: 0 });
    }
  }

  /**
   * Try to add item to inventory with stacking
   * Returns true if successful, false if full
   */
  addItem(itemType: ItemType): boolean {
    const definition = ItemDatabase.getDefinition(itemType);

    // First, try to stack with existing item
    for (const slot of this.slots) {
      if (slot.itemType === itemType && slot.quantity < definition.maxStack) {
        slot.quantity++;
        if (this.onInventoryChange) {
          this.onInventoryChange();
        }
        return true;
      }
    }

    // Second, try to add to empty slot
    for (const slot of this.slots) {
      if (slot.itemType === null) {
        slot.itemType = itemType;
        slot.quantity = 1;
        if (this.onInventoryChange) {
          this.onInventoryChange();
        }
        return true;
      }
    }

    // Inventory full
    return false;
  }

  /**
   * Use item from slot index (0-4)
   * Returns item type if successful, null if slot empty
   */
  useItem(slotIndex: number): ItemType | null {
    if (slotIndex < 0 || slotIndex >= this.maxSlots) return null;

    const slot = this.slots[slotIndex];
    if (slot.itemType === null || slot.quantity === 0) return null;

    const itemType = slot.itemType;

    // Decrease quantity
    slot.quantity--;
    if (slot.quantity === 0) {
      slot.itemType = null;  // Clear slot when empty
    }

    if (this.onInventoryChange) {
      this.onInventoryChange();
    }

    return itemType;
  }

  /**
   * Check if slot has item
   */
  hasItemInSlot(slotIndex: number): boolean {
    if (slotIndex < 0 || slotIndex >= this.maxSlots) return false;
    const slot = this.slots[slotIndex];
    return slot.itemType !== null && slot.quantity > 0;
  }

  /**
   * Get item type in slot (null if empty)
   */
  getItemInSlot(slotIndex: number): ItemType | null {
    if (slotIndex < 0 || slotIndex >= this.maxSlots) return null;
    return this.slots[slotIndex].itemType;
  }

  /**
   * Get slot data for UI rendering
   */
  getSlots(): InventorySlot[] {
    return [...this.slots];  // Return copy
  }

  /**
   * Check if inventory has space (for pickup logic)
   */
  hasSpace(itemType: ItemType): boolean {
    const definition = ItemDatabase.getDefinition(itemType);

    // Check for stackable slot
    for (const slot of this.slots) {
      if (slot.itemType === itemType && slot.quantity < definition.maxStack) {
        return true;
      }
    }

    // Check for empty slot
    for (const slot of this.slots) {
      if (slot.itemType === null) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get number of items in inventory (for testing/debugging)
   */
  getItemCount(): number {
    return this.slots.reduce((sum, slot) => sum + slot.quantity, 0);
  }
}
