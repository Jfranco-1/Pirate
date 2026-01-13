# Phase 6: Pirate Theme & Core Narrative Systems

## Overview

This phase transforms the generic dungeon crawler into a pirate-themed eldritch horror roguelite. The core gameplay loop remains (turn-based tactical combat), but we layer on narrative systems that create the psychological horror experience.

## Design Document Reference

See conversation history for full design. Key systems:

### Narrative Structure
- **Surface Story**: Player seeks to break a curse by assembling statue pieces
- **Hidden Truth**: The Drowned Sovereign is a jailer preventing something worse
- **Secret Antagonist**: The Pale Messenger - invisible puppetmaster working through proxies
- **Discovery Arc**: Players gradually realize across runs that the "obvious" enemy isn't the real threat

### Core New Systems

1. **Insight System (0-100)**
   - Reveals hidden content (rooms, passages, NPC allegiances)
   - Thresholds: 30 (suspicion), 50 (understanding), 70 (true sight), 90 (transcendence)
   - Ship layouts have insight-gated secret areas

2. **Curse System (Stages 1-5)**
   - Time pressure mechanic (blood moon deadline)
   - Manifestation varies by playstyle (combat/trade/exploration)
   - Visual and mechanical effects escalate

3. **Paranoia System (0-100)**
   - Unlocks after discovering Pale Messenger
   - Causes hallucinations, unreliable UI, trust issues
   - "Ground Yourself" mechanic to verify reality

4. **Pale Attention System (0-100 + Floor)**
   - Tracks how much the Pale Messenger notices you
   - Floor is PERMANENT minimum that locks at thresholds
   - Escalating hostility as Attention increases
   - Persists across characters/runs (profile-level)

5. **Ship Combat** (Isometric Tactical)
   - Ships as multi-level dungeons (3 decks)
   - Insight reveals hidden passages, thrall markers
   - Faction-specific layouts (Armada, Drowned Fleet, Free Captains)

6. **Crew Management**
   - Hire crew with visible/hidden stats
   - Loyalty, morale, betrayal triggers
   - Thralls planted by factions
   - Insight checks to detect deception

7. **Information Trading**
   - Buy intel with reliability ratings (20-95%)
   - Cross-reference to verify
   - Thralls plant false information
   - Journal tracks contradictions

8. **Three Endings**
   - Bad: Assemble statue wrong → Pale Servant
   - Neutral: Refuse assembly → Drowned Champion  
   - True: Perform Severance → Eternal Guardian

## Integration with Existing Systems

### What Changes
- `RoomType` → `ShipDeck` / `ShipArea` for ship combat
- `RoomTheme` → `ShipFaction` (GILDED_ARMADA, DROWNED_FLEET, FREE_CAPTAIN)
- `CharacterClass` → Pirate classes (Duelist, Quartermaster, Navigator, Chaplain)
- `Enemy` types → Pirate/eldritch themed
- `MetaSaveData` → Add insight floor, attention floor, lore discovered

### What Stays the Same
- Core turn-based combat loop
- Grid-based movement
- Status effects system
- Basic item/inventory structure
- Phaser rendering pipeline

## Technical Considerations

### Ship Layout System
- Multi-level grids (z-axis for deck levels)
- Stairs connect levels
- Hidden tiles with `visibilityRequirement: InsightThreshold`
- Faction templates define base layouts

### Insight Revelation
- Tiles have `insightRequired` property
- GridManager filters visible tiles based on player insight
- UI shows "something hidden here" at partial thresholds

### Paranoia Effects
- Custom Phaser post-processing for visual glitches
- UI element corruption (text swaps, button reversals)
- NPC aura flickers (random yellow tint)
- Reality verification mechanic

### Save Data Structure
```typescript
interface PirateSaveData extends MetaSaveData {
  // Per-character
  insight: number;
  curseStage: number;
  curseManifestation: 'combat' | 'trade' | 'exploration' | 'balanced';
  paranoia: number;
  
  // Per-profile (persistent across characters)
  paleAttention: number;
  paleAttentionFloor: number;
  loreDiscovered: string[];  // IDs of lore texts found
  translationProgress: Record<string, number>;  // Ancient text translation %
  npcRelationships: Record<string, number>;  // Trust scores
  
  // Run-specific
  statuePieces: number;
  bindingWordsFound: string[];
  journalEntries: JournalEntry[];
}
```

## Phase Breakdown

### 6.1: Core Systems Foundation
- Insight system with threshold callbacks
- Curse system with stage progression
- Types/interfaces for pirate theme
- Refactor CharacterClass to pirate classes

### 6.2: Ship Layout & Combat
- Multi-level ship grids
- Insight-based visibility
- Ship templates per faction
- Stairs/level transitions

### 6.3: Pirate Enemy Types
- Armada Soldier, Officer, Admiral
- Drowned Sailor, Lurker, Murrow
- Free Pirate, Captain
- Eldritch creatures

### 6.4: Crew System
- Crew hiring with hidden stats
- Loyalty/morale mechanics
- Betrayal events
- Crew in combat

### 6.5: Information & Trading
- Information market
- Reliability verification
- Journal conspiracy board
- Cross-reference UI

### 6.6: Pale Messenger Integration
- Attention system
- Attention Floor (permanent)
- Escalating interventions
- UI corruption effects

### 6.7: Narrative & Lore
- Readable texts/journals
- Translation system
- NPC dialogue trees
- Ending sequences

### 6.8: Paranoia & Horror
- Post-discovery paranoia
- Visual hallucinations
- Reality verification
- Fourth-wall breaks

## Dependencies

- Phaser 3 (existing)
- ROT.js (existing, for pathfinding)
- TypeScript (existing)
- New: Possibly tween.js for glitch effects

## Risks

1. **Scope creep** - This is a massive expansion. Prioritize core loop.
2. **Performance** - Many overlapping systems. Profile early.
3. **Narrative complexity** - Easy to over-design. Ship playable slices.
4. **UI complexity** - Paranoia effects must not break usability.

## Success Criteria

1. Ship combat feels like tactical puzzle boxes
2. Insight reveals meaningful secrets
3. Pale Messenger feels invisible until discovered
4. Discovery feels earned, not exposition-dumped
5. Multiple runs required to understand full narrative
6. Endings feel meaningfully different
