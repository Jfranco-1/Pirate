# Phase 4: Meta-Progression Systems - Research

**Researched:** 2026-01-12
**Domain:** Roguelite meta-progression UI/UX patterns
**Confidence:** HIGH

<research_summary>
## Summary

The meta-progression backend (MetaProgressionManager) already exists with currency, upgrades, class/item unlocks, and localStorage persistence. Phase 4 focuses on **user-facing UI** to make this system accessible and engaging.

Key pattern from successful roguelites (Hades, Dead Cells, Binding of Isaac): **Hub scene** between runs where players see progression, make purchases, select loadout, then start. The "hub" creates ritual of preparation that makes unlocks feel meaningful.

**Primary recommendation:** Create HubScene with class selection, upgrade shop, unlock shop, and lifetime stats display. Game flow becomes: HubScene → GameScene → death → HubScene.
</research_summary>

<standard_stack>
## Standard Stack

Already implemented:
- MetaProgressionManager (singleton, localStorage persistence)
- MetaProgressionUI (debug panel - will be replaced)
- CharacterClass enum (WARRIOR, ROGUE, GUARDIAN)
- MetaUpgradeId type (MAX_HP, ATTACK, DEFENSE)

Phase 4 adds:
- HubScene (Phaser Scene for pre-run menu)
- Class selection panel
- Upgrade shop panel
- Unlock shop panel (items, classes)
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Pattern 1: Scene Flow
```
HubScene (menu, upgrades, class select)
    ↓ "Start Run" button
GameScene (gameplay)
    ↓ Player death
HubScene (show results, loop back)
```

### Pattern 2: Hub Layout
```
┌──────────────────────────────────────────────────┐
│  METRIC                                Currency: X│
├───────────────────┬──────────────────────────────┤
│   CLASS SELECT    │       UPGRADES               │
│   ┌─┐ ┌─┐ ┌─┐    │   MAX HP: Lv 2  [+10]       │
│   │W│ │R│ │G│    │   ATTACK: Lv 1  [+15]       │
│   └─┘ └─┘ └─┘    │   DEFENSE: Lv 0 [+15]       │
│   Selected: Warrior                              │
├───────────────────┴──────────────────────────────┤
│   UNLOCKS                                        │
│   Fire Bomb: [Unlock 25]   Rogue: [Unlock 50]   │
├──────────────────────────────────────────────────┤
│   LIFETIME STATS: 12 runs, 47 kills, 156 earned │
├──────────────────────────────────────────────────┤
│              [ START RUN ]                       │
└──────────────────────────────────────────────────┘
```

### Pattern 3: Visual Class Differentiation
- Warrior: Green (0x00ff00) - balanced
- Rogue: Yellow (0xffff00) - high attack
- Guardian: Blue (0x0088ff) - high defense
</architecture_patterns>

<implementation_notes>
## Implementation Notes

1. **Create HubScene class** - New Phaser scene that shows before GameScene
2. **Update main.ts** - Change starting scene from GameScene to HubScene
3. **Scene transitions** - Use this.scene.start('GameScene') / this.scene.start('HubScene')
4. **Player sprite tint** - Already uses setTint(), just need to vary by class
5. **Remove debug UI** - MetaProgressionUI becomes redundant with proper hub
6. **Run results** - Pass kill count and currency earned to HubScene on death
</implementation_notes>

<open_questions>
## Open Questions

1. **Sound effects for purchases?** - Skip for now, gameplay first
2. **Animation on unlock?** - Simple flash/scale effect sufficient
3. **Confirmation dialogs?** - No, instant purchase is faster iteration
</open_questions>

---

*Phase: 04-meta-progression*
*Research completed: 2026-01-12*
*Ready for planning: yes*
