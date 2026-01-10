# Phase 2 Plan 2: Enemy Entities & AI Summary

**Three enemy types with behavior-driven AI using Rot.js pathfinding**

## Accomplishments

- Base Enemy class with combat capability
- AISystem with 3 behavior patterns (AGGRESSIVE, RANGED, DEFENSIVE)
- Rot.js A* pathfinding integrated for enemy movement
- Three enemy types: Goblin (aggressive), Archer (ranged), Brute (defensive)
- Enemies balanced relative to player (weaker individually)

## Files Created/Modified

- `src/types/index.ts` - AIBehavior enum
- `src/entities/Enemy.ts` - Base enemy class
- `src/systems/AISystem.ts` - AI decision-making with Rot.js pathfinding
- `src/entities/enemies/Goblin.ts` - Aggressive melee enemy
- `src/entities/enemies/Archer.ts` - Ranged enemy (maintains distance)
- `src/entities/enemies/Brute.ts` - Defensive tank enemy

## Decisions Made

- Enemy stats weaker than player (player should handle 2-3 enemies)
  - Goblin: 8 HP, 3 attack, 0 defense (dies in 2 hits)
  - Archer: 6 HP, 4 attack, 0 defense (dies in 1-2 hits)
  - Brute: 15 HP, 6 attack, 3 defense (dies in 3-4 hits)
- Color-coded sprites: Goblin (red), Archer (yellow), Brute (blue)
- Used Rot.js A* pathfinding per research (don't hand-roll)
- Variety through behavior patterns, not stat complexity
- 4-way movement for pathfinding (no diagonals)

## Issues Encountered

None

## Commits

- `6f20cef` - feat(02-02): create base Enemy class with behavior system
- `e4f23f1` - feat(02-02): implement AI decision-making with Rot.js pathfinding
- `59e653c` - feat(02-02): create 3 specific enemy types with distinct behaviors

## Next Step

Ready for 02-03-PLAN.md - Turn Management & Combat Flow
