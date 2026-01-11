# Roadmap: Metric

## Overview

Building a turn-based tactical dungeon crawler from foundation to shippable v1. Starting with core game structure and turn-based movement, adding tactical combat and enemy variety, implementing procedural dungeon generation, layering in the meta-progression systems that drive replayability, and finally polishing the run management experience.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Core Loop** - Basic game structure, grid-based movement, and turn system
- [x] **Phase 2: Combat & Enemies** - Tactical combat mechanics and enemy variety
- [ ] **Phase 3: Procedural Generation** - Dungeon generation with varied layouts
- [ ] **Phase 4: Meta-Progression Systems** - Character unlocks, persistent upgrades, and item pool expansion
- [ ] **Phase 5: Run Management** - Permadeath handling, run tracking, and progression visibility

## Phase Details

### Phase 1: Foundation & Core Loop
**Goal**: Establish core game architecture with playable grid-based movement and turn system
**Depends on**: Nothing (first phase)
**Research**: Likely (technology stack decision, game architecture)
**Research topics**: Game engine/framework selection (Unity, Godot, web-based like Phaser/PixiJS, custom), grid-based movement patterns, turn system architecture
**Plans**: 2-3 plans

Plans:
- [x] 01-01: Project Setup & Basic Rendering (completed 2026-01-09)
- [x] 01-02: Grid System & Map Rendering (completed 2026-01-09)
- [x] 01-03: Player Movement & Turn System (completed 2026-01-09)

### Phase 2: Combat & Enemies
**Goal**: Implement tactical combat mechanics with basic enemy AI and variety
**Depends on**: Phase 1
**Research**: Likely (tactical combat design patterns)
**Research topics**: Turn-based combat state machines, action point systems, enemy AI patterns for tactical gameplay
**Plans**: 4 plans

Plans:
- [x] 02-01: Combat System & Damage (completed 2026-01-09)
- [x] 02-02: Enemy Entities & AI (completed 2026-01-09)
- [x] 02-03: Turn Management & Combat Flow (completed 2026-01-10)
- [x] 02-04: Items & Consumables System (completed 2026-01-11)

### Phase 3: Procedural Generation
**Goal**: Generate varied dungeon layouts with room types and connectivity
**Depends on**: Phase 2
**Research**: Likely (dungeon generation algorithms)
**Research topics**: Procedural dungeon algorithms (BSP, cellular automata, graph-based), room placement and connectivity, ensuring playability
**Plans**: 2-3 plans

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Meta-Progression Systems
**Goal**: Implement character unlocks, persistent upgrades, and expanding item pool
**Depends on**: Phase 3
**Research**: Likely (persistent save architecture)
**Research topics**: Save system design, unlock progression patterns, currency/upgrade balancing approaches
**Plans**: 2-3 plans

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD

### Phase 5: Run Management
**Goal**: Complete permadeath system, run tracking, and progression visibility
**Depends on**: Phase 4
**Research**: Unlikely (building on established patterns from earlier phases)
**Plans**: 1-2 plans

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Core Loop | 3/3 | Complete ✅ | 2026-01-09 |
| 2. Combat & Enemies | 4/4 | Complete ✅ | 2026-01-11 |
| 3. Procedural Generation | 0/3 | Not started | - |
| 4. Meta-Progression Systems | 0/3 | Not started | - |
| 5. Run Management | 0/2 | Not started | - |
