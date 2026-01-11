# Summary: Items & Consumables System

**Plan:** 02-04 (Items & Consumables System)
**Status:** ✅ Complete
**Date:** 2026-01-11

## Overview

Implemented a complete tactical inventory system with consumables and throwables that integrates seamlessly with turn-based combat and status effects. Players now have a 5-slot inventory with item stacking, number key quick-use, and an arrow-key targeting system for throwable items.

## What Was Built

### Core Systems

**ItemDatabase** - Static registry with 5 item types:
- Health Potion (red): Restores 8 HP instantly
- Strength Potion (orange): +3 ATK buff for 3 turns
- Defense Potion (blue): +3 DEF buff for 3 turns
- Poison Bomb (green): Throwable DoT (2 dmg/turn, 4 turns)
- Fire Bomb (orange-red): Throwable DoT (3 dmg/turn, 3 turns)

**InventoryManager** - 5-slot inventory with intelligent stacking:
- Prioritizes stacking with existing items (respects maxStack)
- Falls back to empty slots if can't stack
- Tracks quantity per slot with auto-cleanup when empty

**WorldItemEntity** - Physical items on dungeon floor:
- Color-tinted sprites matching item type
- Pickup animation (scale up + fade out)
- Spawns 3-5 random items per dungeon

**InventoryUI** - Bottom-left visual panel:
- 5 slots with key labels (1-5)
- Shows item icons, quantities ("x3"), and names
- Auto-updates via callback when inventory changes

### Gameplay Integration

**Item Spawning:**
- Random placement on floor tiles with collision checking
- Won't overlap player, enemies, or other items
- Varied item types for tactical decisions

**Pickup Mechanics:**
- Automatic pickup when walking over items
- Yellow floating text with item name
- Combat log messages ("Picked up [Item]" or "Inventory full!")
- Smooth animations

**Item Usage (Number Keys 1-5):**
- Instant consumables: Health potions with green "+8" text and heal particles
- Buff consumables: Apply status effects with color-coded feedback
- Throwables: Enter targeting mode
- **All item usage costs a turn** (tactical decision: use item OR attack)

**Targeting System:**
- Yellow pulsing cursor highlights selected enemy
- Arrow keys cycle through enemies
- Enter confirms throw with projectile animation
- ESC cancels targeting
- Particle effects on impact (poison cloud/fire burst)
- Status effects applied to target

### Visual Feedback

- **Floating Text:** Yellow (pickups), green (healing), orange/blue (buffs)
- **Particles:** Heal sparkle (cyan), poison cloud (green), fire burst (orange-red)
- **Animations:** Projectile tweens (300ms), pickup animations, cursor pulsing
- **Combat Log:** Full message support for all item actions
- **Status Icons:** Appear above entities when buffs/debuffs applied

## Commits

- `b972062` - feat(02-items): add item system foundation
- `be0181d` - feat(02-items): add inventory UI panel
- `90a5e09` - feat(02-items): integrate item system into GameScene
- `83d55f0` - feat(02-items): add fire burst particle effect

## Technical Decisions

**Inventory Size: 5 Slots**
- Balanced capacity forcing tactical choices
- Not too restrictive, not too generous
- Encourages item usage rather than hoarding

**Item Stacking**
- Prevents inventory bloat
- Max stack varies by item type (5 for potions, 3 for bombs)
- Priority-based: stack first, empty slot second

**Turn Cost**
- Using items costs a turn like attacking/moving
- Creates tactical depth: heal now or attack?
- Throwables can apply DoT over multiple turns

**Targeting with Arrow Keys**
- Natural control scheme matching movement
- Clear visual feedback (yellow cursor)
- Can cancel (ESC) without wasting item or turn

**Integration with Status Effects**
- Reuses existing StatusEffectManager
- Buffs/debuffs follow same rules as combat
- DoT effects tick each turn consistently

## Files Created/Modified

**Created:**
- `src/systems/ItemDatabase.ts` (90 lines)
- `src/systems/InventoryManager.ts` (135 lines)
- `src/entities/WorldItem.ts` (58 lines)
- `src/ui/InventoryUI.ts` (147 lines)

**Modified:**
- `src/types/index.ts` (+50 lines) - Item types and interfaces
- `src/scenes/GameScene.ts` (+568 lines) - Full integration
- `src/systems/ParticleSystem.ts` (+23 lines) - Fire burst effect

**Total:** ~1,070 lines added

## Success Metrics

✅ All 12 tasks completed
✅ All success criteria met
✅ TypeScript compiles without errors
✅ Dev server hot-reloads successfully
✅ Integration with existing systems seamless

## Testing Notes

**Verified:**
- Items spawn correctly (3-5 per dungeon, random colors)
- Pickup works on movement with proper feedback
- Inventory UI updates in real-time
- Item stacking works (e.g., "x3 Health Potion" in one slot)
- Number keys 1-5 use items from slots
- Health potions restore HP (capped at maxHP)
- Buff potions apply status effects correctly
- Throwables enter targeting mode
- Arrow keys cycle enemies, Enter confirms, ESC cancels
- Projectile animations play smoothly
- Particle effects appear on impact
- Status effects apply to enemies
- Turn ends after item usage
- Combat log tracks all item actions

**Debug Methods Added:**
- `giveItem(itemType)` - Add item to inventory directly
- `spawnItemAtPlayer(itemType)` - Spawn item at player position

## Balance Notes

**Health Potion:** 8 HP (40% of max HP)
- Significant heal but not full restore
- Encourages tactical timing

**Buffs:** +3 to stat for 3 turns
- Meaningful boost (+30% typical stat)
- Duration long enough to matter (3 turns = 1 player + 2 enemy turns typically)

**Throwables:**
- Poison: 8 total damage over 4 turns (2/turn)
- Fire: 9 total damage over 3 turns (3/turn)
- More damage than direct attack but spread over time
- Risk: enemy might die before DoT finishes

## Issues/Deviations

None. Plan executed as designed with no blockers or deviations.

## Next Steps

Phase 2 (Combat & Enemies) now enhanced with items system. Suggested next actions:

1. **Continue to Phase 3** - Procedural dungeon generation with varied layouts
2. **Balance Testing** - Play extended sessions to verify item balance
3. **Optional Enhancements:**
   - Add more item types (mana potions, bombs with AOE)
   - Item rarities or quality levels
   - Item crafting or upgrades

**Recommended:** Proceed to Phase 3 (Procedural Generation) as Phase 2 is feature-complete with items.
