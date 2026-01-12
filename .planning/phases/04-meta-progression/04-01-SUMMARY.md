---
phase: 04-meta-progression
plan: 01
subsystem: meta-progression-ui
tags: [hub-scene, class-selection, upgrade-shop, unlock-shop]

# Dependency graph
requires:
  - phase: 03-03
    provides: Procedural dungeon generation complete
provides:
  - HubScene with full meta-progression UI
  - Class selection with visual feedback
  - Upgrade shop for persistent stat boosts
  - Unlock shop for items and classes
  - Game flow: HubScene → GameScene → HubScene
affects: [GameScene, main.ts, Player]

# Tech tracking
tech-stack:
  added: []
  patterns: [Scene transitions, Interactive UI panels]

key-files:
  created: [src/scenes/HubScene.ts]
  modified: [src/main.ts, src/scenes/GameScene.ts, src/entities/Player.ts]

key-decisions:
  - "Hub-first flow: Game starts at hub, not dungeon"
  - "Class colors: Warrior=green, Rogue=yellow, Guardian=blue"
  - "Inline upgrade preview: Shows +2 HP, +1 ATK, +1 DEF per level"
  - "Unlock costs: Fire Bomb=25, Classes=50"

patterns-established:
  - "Scene flow: HubScene → GameScene (on start) → HubScene (on death/victory)"
  - "Interactive UI: hover effects, click handlers, visual feedback"

issues-created: []

# Metrics
duration: 15min
completed: 2026-01-12
---

# Phase 4 Plan 1: Hub Scene Implementation Summary

**HubScene provides visual meta-progression interface with class selection, upgrades, unlocks, and lifetime stats**

## Performance

- **Duration:** 15 min
- **Started:** 2026-01-12
- **Completed:** 2026-01-12
- **Tasks:** 6
- **Files created:** 1
- **Files modified:** 3

## Accomplishments

- Created HubScene with full meta-progression UI
- Implemented class selection with visual boxes, stats preview, selection highlighting
- Added upgrade shop with buy buttons and cost display
- Added unlock shop for Fire Bomb, Rogue, Guardian
- Added lifetime stats display (runs, kills, currency earned)
- Updated main.ts to start with HubScene
- Added class-specific colors to player sprite

## Files Created/Modified

- `src/scenes/HubScene.ts` - New hub scene with all meta-progression panels
- `src/main.ts` - Added HubScene to scene list, starts first
- `src/scenes/GameScene.ts` - Returns to HubScene on death, passes class color
- `src/entities/Player.ts` - Added color parameter to constructor

## Decisions Made

**Hub-first game flow:** Start at HubScene, not GameScene
- Rationale: Creates ritual of preparation, makes unlocks feel meaningful, matches roguelite pattern (Hades, Dead Cells)

**Class color differentiation:** Warrior=green, Rogue=yellow, Guardian=blue
- Rationale: Visual distinction during gameplay shows which class is active

**Inline cost display:** Shows upgrade cost next to buy button
- Rationale: Players can quickly see what they can afford without mental calculation

## Issues Encountered

None

## Next Step

Plan 2: Enhance death/victory screens, remove debug UI, add victory condition

---
*Phase: 04-meta-progression*
*Completed: 2026-01-12*
